(function (global) {
  'use strict';
  const PLAN = 'df9a7cb9ad92354d66fe045b2752013b21e52599d127b385ebe8d6156f067322';
  const PREFIX = 'paper-garden.study-log.v1:';
  const LIMITS = { bytes: 2 * 1024 * 1024, events: 20000, pointers: 3000, diagnostics: 100 };
  const now = () => new Date().toISOString();
  const validSlot = s => typeof s === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(s);
  const validOrder = s => s === 'current' || s === 'candidate';
  const keyFor = (order, slot) => {
    if (!validOrder(order) || !validSlot(slot)) throw new Error('Invalid study order or slot.');
    return PREFIX + order + ':' + slot;
  };
  const canonical = value => JSON.stringify(value, function (key, item) {
    if (item && typeof item === 'object' && !Array.isArray(item))
      return Object.keys(item).sort().reduce((out, name) => { out[name] = item[name]; return out; }, {});
    return item;
  });
  function parse(href) {
    const params = new URL(href).searchParams;
    const reserved = [...params].filter(([k]) => ['qa', 'study', 'slot'].includes(k.toLowerCase()));
    if (!reserved.some(([k]) => k.toLowerCase() === 'study')) return null;
    const fields = {};
    for (const name of ['qa', 'study', 'slot']) {
      const pairs = reserved.filter(([key]) => key.toLowerCase() === name);
      if (pairs.length !== 1 || pairs[0][0] !== name) throw new Error('Study requires exactly one lowercase ' + name + ' parameter.');
      fields[name] = pairs[0][1];
    }
    if (fields.qa !== '1' || !validOrder(fields.study) || !validSlot(fields.slot)) throw new Error('Invalid study configuration.');
    return { orderId: fields.study, slot: fields.slot, planHash: PLAN };
  }
  let config = null, configurationError = null;
  try { config = parse(global.location.href); } catch (error) { configurationError = error.message; }
  const data = { schemaVersion: 1, evidenceType: 'BROWSER_QA_CHANNEL_ONLY',
    physicalInputOrHumanParticipationVerified: false, planHash: PLAN,
    orderId: config && config.orderId, slot: config && config.slot,
    createdAt: now(), updatedAt: now(), limits: LIMITS,
    events: [], pointers: [], issues: [], statuses: [], runs: [], halted: false, rejectedAfterHalt: 0 };
  const seen = new Map(), last = new Map(), owners = new Map();
  let activeIdentity = null, corruptRecord = null, storageFailed = false, persistedRaw = null;
  const storageKey = config ? keyFor(config.orderId, config.slot) : null;
  const bytes = text => new TextEncoder().encode(text).length;
  function issue(code, detail, severity = 'error') {
    if (!data.issues.some(item => item.code === code && item.detail === detail)) {
      if (data.issues.length < LIMITS.diagnostics) data.issues.push({ at: now(), code, detail, severity });
      else data.halted = true;
    }
  }
  function identity(value) {
    if (!value || !['sessionId', 'orderId', 'planHash', 'runId'].every(k => typeof value[k] === 'string' && value[k].length > 0))
      throw new Error('Missing study identity.');
    if (value.sessionId.length > 128 || value.runId.length > 128 || value.orderId !== config.orderId || value.planHash !== PLAN)
      throw new Error('Study identity does not match URL / reviewed plan.');
    return { sessionId: value.sessionId, orderId: value.orderId, planHash: value.planHash, runId: value.runId };
  }
  function eventIdentity(event, expected) {
    const id = identity(event);
    if (Object.keys(id).some(key => id[key] !== expected[key])) throw new Error('Event identity differs from snapshot.');
    if (typeof event.eventId !== 'string' || !event.eventId.startsWith(id.runId + ':')) throw new Error('Invalid event ID prefix.');
    const suffix = event.eventId.slice(id.runId.length + 1);
    if (!/^[1-9][0-9]*$/.test(suffix) || !Number.isSafeInteger(Number(suffix))) throw new Error('Invalid event sequence.');
    return Number(suffix);
  }
  function persist() {
    if (!config || corruptRecord !== null) return false;
    data.updatedAt = now();
    try {
      if (global.localStorage.getItem(storageKey) !== persistedRaw) {
        data.halted = true; issue('CONCURRENT_WRITER', 'Another page changed this group/slot log. Existing stored data was not overwritten.');
        try { global.localStorage.setItem(storageKey + ':fault', JSON.stringify({ at: now(), code: 'CONCURRENT_WRITER' })); } catch (_) {}
        return false;
      }
      const raw = JSON.stringify(data);
      global.localStorage.setItem(storageKey, raw); persistedRaw = raw;
      return true;
    } catch (error) {
      storageFailed = true; data.halted = true;
      issue('STORAGE_WRITE_FAILED', String(error.message || error));
      // A separate tiny marker is best-effort; a totally full/denied store can reject it too.
      try { global.localStorage.setItem(storageKey + ':fault', JSON.stringify({ at: now(), code: 'STORAGE_WRITE_FAILED' })); } catch (_) {}
      return false;
    }
  }
  function acceptSize() {
    if (data.events.length > LIMITS.events || data.pointers.length > LIMITS.pointers || bytes(JSON.stringify(data)) > LIMITS.bytes - 4096) {
      data.halted = true; issue('RECORDING_LIMIT_REACHED', 'Recording halted at explicit event, pointer, or byte bound. Export before continuing.');
      return false;
    }
    return true;
  }
  if (config) {
    try {
      const raw = global.localStorage.getItem(storageKey);
      persistedRaw = raw;
      if (raw !== null) {
        corruptRecord = raw;
        const saved = JSON.parse(raw);
        if (saved.schemaVersion !== 1 || saved.orderId !== config.orderId || saved.slot !== config.slot || saved.planHash !== PLAN ||
            !['events', 'pointers', 'issues', 'statuses'].every(k => Array.isArray(saved[k])) || bytes(raw) > LIMITS.bytes)
          throw new Error('Stored study log identity or format is invalid.');
        for (const event of saved.events) {
          const id = identity(event), sequence = eventIdentity(event, id);
          const owner = owners.get(id.runId);
          if (owner && owner !== id.sessionId) throw new Error('Stored run ID reused across sessions.');
          const eventKey = id.runId + ':' + sequence;
          if (seen.has(eventKey)) throw new Error('Duplicate persisted event ID.');
          owners.set(id.runId, id.sessionId); seen.set(eventKey, canonical(event));
          last.set(id.runId, Math.max(last.get(id.runId) || 0, sequence));
        }
        Object.assign(data, saved); if (!Array.isArray(data.runs)) data.runs = []; corruptRecord = null;
      }
      const fault = global.localStorage.getItem(storageKey + ':fault');
      if (fault !== null) { issue('PRIOR_STORAGE_WRITE_FAILED', 'A previous page reported a write failure; unpersisted events may be missing.'); data.halted = true; }
    } catch (error) {
      data.halted = true; issue('STORAGE_LOAD_FAILED', String(error.message || error));
    }
  }
  function status() {
    return { enabled: !!config, configurationError, halted: data.halted,
      eventCount: data.events.length, pointerCount: data.pointers.length,
      storageFailed, issues: data.issues.slice(), identity: activeIdentity };
  }
  function snapshot(raw) {
    if (!config) return status();
    if (data.halted) { data.rejectedAfterHalt++; return status(); }
    try {
      const snap = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!snap || !snap.study || !snap.study.sessionId) {
        const entry = { page: snap && snap.page, loadError: snap && snap.loadError, identityAvailable: false };
        if (!data.statuses.some(x => canonical(x.state) === canonical(entry))) {
          if (data.statuses.length >= LIMITS.diagnostics) { data.halted = true; issue('STATUS_LIMIT_REACHED', 'Too many identity-unavailable states.'); }
          else data.statuses.push({ at: now(), state: entry });
          persist();
        }
        activeIdentity = null;
        return status();
      }
      const id = identity(snap.study);
      const before = data.events.length + ':' + data.issues.length + ':' + data.runs.length;
      let metadataChanged = false;
      if (!Array.isArray(snap.events)) throw new Error('Snapshot events must be an array.');
      if (owners.has(id.runId) && owners.get(id.runId) !== id.sessionId) throw new Error('Run ID reused across sessions.');
      const prepared = snap.events.map(event => ({ event, sequence: eventIdentity(event, id) })).sort((a, b) => a.sequence - b.sequence);
      // Validate identity for the complete batch before accepting any of its events.
      activeIdentity = id; owners.set(id.runId, id.sessionId);
      let run = data.runs.find(item => item.runId === id.runId);
      if (!run) { run = { ...id, firstSeenAt: now(), interactiveAtUTC: null }; data.runs.push(run); }
      if (typeof snap.study.interactiveAtUTC === 'string' && snap.study.interactiveAtUTC && run.interactiveAtUTC !== snap.study.interactiveAtUTC) {
        if (snap.study.interactiveAtUTC.length > 64) throw new Error('Invalid interactive timestamp length.');
        run.interactiveAtUTC = snap.study.interactiveAtUTC; metadataChanged = true;
      }
      for (const { event, sequence } of prepared) {
        const key = id.runId + ':' + sequence, encoded = canonical(event);
        if (seen.has(key)) {
          if (seen.get(key) !== encoded) { issue('EVENT_ID_COLLISION', key); data.halted = true; break; }
          continue;
        }
        const previous = last.get(id.runId) || 0;
        if (sequence <= previous) { issue('OUT_OF_ORDER_EVENT', key); data.halted = true; break; }
        if (sequence > previous + 1) issue('ROLLING_EVENT_GAP', id.runId + ': missing ' + (previous + 1) + '..' + (sequence - 1));
        const copy = JSON.parse(JSON.stringify(event));
        data.events.push(copy);
        if (!acceptSize()) { data.events.pop(); data.rejectedAfterHalt++; break; }
        seen.set(key, encoded); last.set(id.runId, sequence);
      }
      if (metadataChanged || before !== data.events.length + ':' + data.issues.length + ':' + data.runs.length || data.halted) { acceptSize(); persist(); }
    } catch (error) {
      issue('SNAPSHOT_REJECTED', String(error.message || error)); persist();
    }
    return status();
  }
  function pointer(event) {
    if (!config) return status();
    if (data.halted) { data.rejectedAfterHalt++; return status(); }
    if (!event || !['pointerdown', 'pointerup', 'pointercancel'].includes(event.type)) return status();
    const entry = { at: now(), sessionId: activeIdentity && activeIdentity.sessionId, runId: activeIdentity && activeIdentity.runId,
      type: event.type, pointerType: ['mouse', 'touch', 'pen'].includes(event.pointerType) ? event.pointerType : 'unknown',
      isTrusted: event.isTrusted === true, meaning: 'DOM channel information only; not proof of a person or physical input',
      pointerId: Number.isFinite(event.pointerId) ? event.pointerId : null,
      x: Number.isFinite(event.clientX) ? event.clientX : null, y: Number.isFinite(event.clientY) ? event.clientY : null };
    data.pointers.push(entry);
    if (!acceptSize()) { data.pointers.pop(); data.rejectedAfterHalt++; }
    persist(); return status();
  }
  function exportJSON(order, slot) {
    const wanted = keyFor(order || (config && config.orderId), slot || (config && config.slot));
    let record, fault = null;
    if (config && wanted === storageKey) record = JSON.parse(JSON.stringify(data));
    else {
      const raw = global.localStorage.getItem(wanted);
      if (raw === null) throw new Error('No study log exists for this group and slot.');
      try {
        record = JSON.parse(raw);
        if (record.schemaVersion !== 1 || record.orderId !== order || record.slot !== slot || record.planHash !== PLAN || !Array.isArray(record.events) ||
            record.events.some(event => !event || event.orderId !== order || event.planHash !== PLAN || !event.sessionId || !event.runId ||
              typeof event.eventId !== 'string' || !event.eventId.startsWith(event.runId + ':') || !/^[1-9][0-9]*$/.test(event.eventId.slice(event.runId.length + 1))))
          record = { invalidStoredRecord: raw, issues: [{ code: 'INVALID_STORED_IDENTITY', severity: 'error' }] };
      } catch (_) { record = { invalidStoredRecord: raw, issues: [{ code: 'INVALID_STORED_JSON', severity: 'error' }] }; }
    }
    try { fault = global.localStorage.getItem(wanted + ':fault'); } catch (error) { fault = String(error.message || error); }
    return JSON.stringify({ exportedAt: now(), evidenceType: 'BROWSER_QA_CHANNEL_ONLY',
      physicalInputOrHumanParticipationVerified: false, record,
      integrity: { complete: Array.isArray(record.events) && record.events.length > 0 && !record.halted && !(record.issues || []).some(x => x.severity === 'error') && !fault,
        completenessMeaning: 'No detected gaps/errors among received callbacks; unseen or unpersisted tail events are not proven complete.',
        storageFailed: wanted === storageKey && storageFailed, persistentFault: fault,
        missingIdentityStates: (record.statuses || []).length },
      retainedCorruptRecord: wanted === storageKey ? corruptRecord : null }, null, 2);
  }
  global.pgStudyRecordSnapshot = snapshot;
  global.pgStudyRecordPointer = pointer;
  global.pgStudyRecorder = { status, exportJSON, planHash: PLAN, limits: Object.freeze({ ...LIMITS }) };
})(window);
