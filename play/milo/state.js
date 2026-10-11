// Intentionally local and deterministic. No network, model, or microphone calls.
export const STORAGE_KEY = 'orbit-companion-web-v1';
export const LIMITS = Object.freeze({ messages: 120, memories: 48, input: 2000, plants: 24 });

const copy = (value) => JSON.parse(JSON.stringify(value));
const string = (value, max = 2000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const defaults = () => ({ name: 'Milo', userName: '', color: '#c7d881', world: 'meadow', plants: 0, memories: [], messages: [], mood: null, voice: false, onboarding: false, storageError: null });
const stamp = (value) => Number.isFinite(value) && value > 0 ? value : Date.now();

function normalize(input = {}) {
  const base = defaults();
  if (!input || typeof input !== 'object' || Array.isArray(input)) return base;
  base.name = string(input.name, 32) || base.name;
  base.userName = string(input.userName, 48);
  base.color = /^#[\da-f]{6}$/i.test(input.color) ? input.color : base.color;
  base.world = string(input.world, 32) || base.world;
  base.plants = Number.isFinite(input.plants) ? Math.min(LIMITS.plants, Math.max(0, Math.floor(input.plants))) : 0;
  base.mood = string(input.mood, 40) || null;
  base.voice = input.voice === true;
  base.onboarding = input.onboarding === true;
  const keys = new Set();
  if (Array.isArray(input.memories)) {
    base.memories = input.memories.slice(-LIMITS.memories).filter(item => item && string(item.key, 64) && string(item.value, 240)).reverse().filter(item => {
      const key = string(item.key, 64).toLowerCase();
      if (keys.has(key)) return false;
      keys.add(key);
      return true;
    }).reverse().map(item => ({ id: string(item.id, 100) || uid(), key: string(item.key, 64), value: string(item.value, 240), createdAt: stamp(item.createdAt) }));
  }
  if (Array.isArray(input.messages)) {
    base.messages = input.messages.slice(-LIMITS.messages).filter(item => item && ['user', 'assistant'].includes(item.role) && string(item.text)).map(item => ({ id: string(item.id, 100) || uid(), role: item.role, text: string(item.text), time: stamp(item.time) }));
  }
  return base;
}

export function createCompanionStore(storage) {
  let state = defaults();
  let initialError = null;
  if (storage === undefined) {
    try { storage = globalThis.localStorage; } catch { initialError = '此浏览器无法访问本地存储；本次内容仅保留在当前页面。'; }
  }
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) state = normalize(JSON.parse(raw));
  } catch {
    initialError = '无法读取本地记录；已启动新的临时会话。';
  }
  state.storageError = initialError;
  const getState = () => copy(state);
  const persist = () => {
    try {
      if (!storage?.setItem) throw new Error('Storage unavailable');
      const saved = { ...state, storageError: null };
      storage.setItem(STORAGE_KEY, JSON.stringify(saved));
      state.storageError = null;
    } catch {
      state.storageError = '本地保存失败；当前页面仍可使用，刷新后可能丢失本次更改。';
    }
    return getState();
  };
  const update = (patch) => {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return getState();
    state = normalize({ ...state, ...patch });
    return persist();
  };
  function remember(key, value) {
    key = string(key, 64);
    value = string(value, 240);
    if (!key || !value) throw new Error('记忆的名称和内容不能为空。');
    const old = state.memories.find(item => item.key.toLowerCase() === key.toLowerCase());
    if (old) old.value = value;
    else state.memories.push({ id: uid(), key, value, createdAt: Date.now() });
    state.memories = state.memories.slice(-LIMITS.memories);
    if (key === 'name') state.userName = value.slice(0, 48);
    return persist();
  }
  function forget(id) {
    const deleted = state.memories.find(item => item.id === id);
    state.memories = state.memories.filter(item => item.id !== id);
    if (deleted?.key === 'name') state.userName = '';
    return persist();
  }
  function plant() { state.plants = Math.min(LIMITS.plants, state.plants + 1); return persist(); }
  function clearConversation() { state.messages = []; return persist(); }

  async function send(text) {
    text = string(text, LIMITS.input + 1);
    if (!text) throw new Error('先写一句话吧。');
    if (text.length > LIMITS.input) throw new Error(`消息最多 ${LIMITS.input} 个字符。`);
    const previous = state.messages.filter(message => message.role === 'user').slice(-2);
    const english = !/[\u3400-\u9fff]/.test(text);
    const question = /[？?]|(?:什么|啥|吗)[。！!\s]*$|\b(?:what|who|do you|can you)\b/i.test(text);
    let reply;
    let memoryChanged = false;
    const record = (key, value) => {
      const before = state.memories.find(item => item.key === key)?.value;
      remember(key, value);
      memoryChanged ||= before !== value;
    };
    // Only extract explicit, present-message statements. Never rebuild memory from chat history.
    const explicit = text.match(/^(?:记住|remember)\s*[:：]\s*([^=＝:：]{1,64})\s*[=＝:：]\s*(.{1,240})$/i);
    const name = text.match(/(?:其实|更正一下[，,]?|以后)?(?:我叫|叫我|我的名字是)\s*([\p{L}\p{N}·_-]{1,24})(?=$|[\s，,。！!？?])/u)
      || text.match(/\b(?:my name is|call me|actually,? my name is)\s+([\p{L}][\p{L}' -]{0,47}?)(?=$|[,.!?])/iu);
    const preference = text.match(/(?:^|[，,。\s])(?:其实)?我(?:更|最)?喜欢\s*([^，,。！？!?]{1,120})/)
      || text.match(/\b(?:i (?:really |actually |especially )?(?:like|love|prefer)|my favorite (?:thing|activity) is)\s+([^.!?]{1,120})/i);
    if (/(?:想死|不想活|自杀|kill myself|suicid)/i.test(text)) {
      reply = english ? 'I’m sorry this feels so painful. Are you in immediate danger? If you might act on these thoughts, contact emergency services or someone you trust who can stay with you now. This local demo cannot provide crisis care.' : '听起来你现在很痛苦。你此刻有立即伤害自己的危险吗？如果可能付诸行动，请现在联系当地急救或能陪着你的可信任的人。这个本地演示无法提供危机干预。';
    } else if (/(?:忘记|删除记忆|forget (?:my|that|everything)|clear memor)/i.test(text)) {
      reply = english ? 'You can remove any saved item in the Memory panel. Removing it also stops me using it; clearing chat is a separate action.' : '可以在「记忆」里删除对应条目。删除后我不会再用它称呼你或回答记忆查询；清空对话是另一项操作。';
    } else if (explicit) {
      record(explicit[1].trim(), explicit[2].trim());
      reply = english ? `Saved locally: ${explicit[1].trim()} — ${explicit[2].trim()}. You can edit or delete it in Memory.` : `已在本机记下「${explicit[1].trim()}：${explicit[2].trim()}」。你可以在记忆中更正或删除。`;
    } else if (name && !question) {
      const value = name[1].trim();
      record('name', value);
      reply = english ? `I'll call you ${value}. Your name is saved on this device. What small thing happened in your day?` : `好，以后叫你${value}。称呼已保存在这台设备上。今天发生了哪件小事？`;
    } else if (preference && !question && !/(?:不再|不喜欢|不怎么喜欢|don't|do not|used to)/i.test(text)) {
      const value = preference[1].trim();
      record('preference', value);
      reply = english ? `Saved your preference for ${value} locally. What do you enjoy most about it?` : `已在本机记下你喜欢${value}。最吸引你的是哪一点？`;
    } else if (/(?:记得|记住了什么|我的名字|我叫(?:什么|啥)|我喜欢什么|what.*(?:remember|name|like)|do you remember)/i.test(text)) {
      reply = state.memories.length ? (english ? 'Here is what is currently saved on this device: ' : '这台设备目前保存了：') + state.memories.map(item => `${item.key === 'name' ? (english ? 'name' : '称呼') : item.key === 'preference' ? (english ? 'preference' : '喜欢') : item.key}：${item.value}`).join('；') : (english ? 'There are no saved memories right now. I won’t reconstruct deleted items from old messages.' : '目前没有保存的记忆。我不会从旧对话中重新恢复已删除的内容。');
    } else if (/(?:难过|累|焦虑|压力|烦|孤独|伤心|sad|tired|anxious|stress|lonely|upset)/i.test(text)) {
      state.mood = 'low';
      reply = english ? 'That sounds like a lot to carry. Would you rather tell me what happened, or choose one tiny thing that could make the next few minutes easier?' : '听起来这会儿不太轻松。你更想说说发生了什么，还是一起找一件能让接下来几分钟舒服一点的小事？';
    } else if (/(?:开心|快乐|好消息|成功|happy|excited|good news|proud)/i.test(text)) {
      state.mood = 'bright';
      reply = english ? 'That sounds like a bright spot in your day. Which moment felt the best? You can plant something here to mark it.' : '这像是今天一个亮亮的瞬间。哪个片刻最让你开心？也可以种下一株小植物，给它留个纪念。';
    } else if (/(?:今天|小事|today|my day)/i.test(text)) {
      reply = english ? 'Let’s zoom in on one moment from today: something you noticed, tasted, finished, or wished had gone differently. What comes to mind first?' : '把今天缩小成一个瞬间吧：看到的、吃到的、做完的，或希望能重来一次的。你最先想到哪一个？';
    } else if (/(?:你是谁|你是真|你是ai|who are you|are you real|are you (?:an? )?ai)/i.test(text)) {
      reply = english ? `I'm ${state.name}, a character in a local companion demo. These replies follow simple rules, and saved memories stay in this browser.` : `我是${state.name}，一个本地陪伴体验里的角色。这些回复由简单规则生成，保存的记忆留在这个浏览器里。`;
    } else if (previous.some(item => /(?:难过|累|焦虑|压力|烦|孤独|sad|tired|stress|lonely)/i.test(item.text))) {
      reply = english ? 'You mentioned a difficult moment just before this. Is what you’re describing part of that, or has something changed?' : '你刚才提到了一段不太轻松的感受。现在说的和那件事有关，还是心情已经有了变化？';
    } else if (/^(?:你好|嗨|哈喽|hello|hey|hi)[！!。.\s]*$/i.test(text)) {
      reply = english ? `Hello${state.userName ? `, ${state.userName}` : ''}. What’s on your mind today?` : `嗨${state.userName ? `，${state.userName}` : ''}。今天想从哪件小事聊起？`;
    } else {
      const variants = english ? ['What part of that matters most to you?', 'Would you like to describe one specific moment?', 'How did that leave you feeling?'] : ['这件事里，你最在意的是哪一部分？', '愿意把其中一个具体的瞬间说给我听吗？', '那之后，你的心情有什么变化？'];
      reply = variants[Array.from(text).reduce((total, char) => total + char.codePointAt(0), 0) % variants.length];
    }
    const time = Date.now();
    state.messages.push({ id: uid(), role: 'user', text, time }, { id: uid(), role: 'assistant', text: reply, time });
    state.messages = state.messages.slice(-LIMITS.messages);
    persist();
    return { reply, memoryChanged };
  }
  return { getState, update, send, remember, forget, plant, clearConversation };
}
