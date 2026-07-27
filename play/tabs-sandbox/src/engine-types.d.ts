// ═══ engine-types.d.ts ═══
//
// TypeScript ambient declarations for TABS Lite's event bus.
// Auto-extracted from `grep emit src/**`. Hand-curated payloads.
//
// Use case: when an AI codegen agent emits/listens to an event in a TABS-style
// game, this file is the contract — it should match these payload shapes.
// If the agent strays (e.g. uses `entity` where TABS uses `target`), the
// listener silently breaks. This file pins the names down.
//
// Naming convention:
//   - Past tense ('entity_damaged', 'level_won')   → state-change broadcast
//   - Imperative ('damage_request', 'spawn_request') → please-do-this mutation
//   - Pure ('zone_entered', 'tick_remaining_s')    → lifecycle / clock
//
// Not loaded at runtime — pure documentation for codegen.

// ─── Domain types ─────────────────────────────────────────────────

type Team = 'ally' | 'enemy';
type Family = 'infantry' | 'ranged' | 'cavalry' | 'tank' | 'mage' | 'giant';
type Phase = 'plan' | 'battle';
type GameStateName =
  | 'LOADING' | 'MENU' | 'LEVEL_SELECT'
  | 'PLAN' | 'BATTLE'
  | 'RESULT_WIN' | 'RESULT_LOSS' | 'RESULT_SANDBOX';

interface Entity {
  id: number;
  team: Team;
  name: string;            // e.g. 'archer'
  family: Family;
  x: number; y: number;    // arena coords
  vx: number; vy: number;
  hp: number; current_hp: number; max_hp: number;
  damage: number;
  range: number; sight_range: number;
  speed: number;
  collision_radius: number;
  alive: boolean;
  is_ragdoll: boolean;
  ragdoll_alpha: number;
  cost_gold?: number;
  projectile?: string;     // entry name in entities.json projectiles
  damage_effect?: string;  // juice event name
  death_effect?: string;
}

interface Projectile {
  id: number;
  owner_id: number;
  team: Team;
  x: number; y: number;
  vx: number; vy: number;
  damage: number;
  max_range: number;
  aoe_radius: number;
  traveled: number;
  sprite: string;          // 'arrow' | 'fireball'
  hit_effect: string;
  family: Family;
  // 3D arc params (set at spawn, read by render3d)
  total_dist: number; spawn_h: number; end_h: number; arc_factor: number;
}

interface ZoneData {
  id: string;              // 'sandbox' | 'level_01' | ...
  map?: string;            // map id when level is sandbox
  enemy_comp?: Array<[string, number]>;
  new_element?: string;    // unit-type-intro key (for banner)
  // ... (map-specific fields)
}

// ─── Event Payload Map ────────────────────────────────────────────

interface GameEvents {
  // ─ Game State ─
  game_state_changed:   { from: GameStateName; to: GameStateName };
  level_selected:       { level_id: string };
  level_enter:          { level_id: string };
  menu_select:          { option: 'start' | 'sandbox' | 'continue' | 'replay' | 'back_to_menu' | 'back_to_select' | 'next' | 'sandbox_replay' | 'sandbox_pick_map' | string };
  zone_entered:         { level_id: string; zone_data: ZoneData };

  // ─ Phase ─
  plan_phase_started:   { level_id: string; budget: number };
  battle_phase_started: {};
  tick_remaining_s:     { phase: Phase; seconds_left: number };

  // ─ Entity ─
  spawn_request:        { type: string; x: number; y: number; team?: Team };
  entity_spawned:       { entity: Entity };
  entity_damaged:       { target: Entity; amount: number; source: Entity; damage_type: string };
  entity_destroyed:     { target: Entity; source?: Entity };
  entity_cleanup:       { entity_id: number };
  remove_request:       { entity_id: number };

  // ─ Combat & Physics ─
  damage_request:       { target: Entity; amount: number; source: Entity; damage_type: string };
  apply_impulse:        { entity_id: number; vx: number; vy: number };
  set_velocity:         { entity_id: number; vx: number; vy: number };
  aoe_hit:              { x: number; y: number; radius: number; source_id: number };
  collision:            { a: Entity; b: { x: number; y: number; w?: number; h?: number; r?: number; kind?: string }; overlap?: number };
  ai_attack_request:    { attacker_id: number; target_id: number };

  // ─ Projectile ─
  projectile_spawned:   { projectile: Projectile };
  projectile_destroyed: { projectile: Projectile };

  // ─ Result ─
  level_won:            { level_id: string; ally_remain: number; initial: number; total_deaths: number };
  level_lost:           { level_id: string };
  all_allies_dead:      {};
  all_enemies_dead:     {};
  sandbox_ended:        { winner: 'blue' | 'red'; ally_remain: number; enemy_remain: number };

  // ─ Economy ─
  deploy_request:       { type: string; x: number; y: number; team?: Team };
  deploy_denied:        { reason: 'no_gold' | 'cap_reached'; type: string };
  gold_changed:         { current: number; delta: number };

  // ─ UI / Input ─
  player_request_start: {};
  player_request_reset: {};
  unit_type_selected:   { type: string };
  unlock_granted:       { unit_type: string };
  unlock_list_changed:  { unlocked: string[] };

  // ─ Tutorial ─
  tutorial_show:        { step_id: string; prompt: string };
  tutorial_hide:        {};
  tutorial_completed:   {};
}

// ─── Typed bus surface (read-only doc; runtime uses untyped emit/on) ─

declare function on  <K extends keyof GameEvents>(event: K, handler: (payload: GameEvents[K]) => void): void;
declare function off <K extends keyof GameEvents>(event: K, handler: (payload: GameEvents[K]) => void): void;
declare function emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): void;

// ─── Engine surface (mirror of src/engine.js public API) ─────────

interface EngineApi {
  // event bus
  on:  typeof on;
  off: typeof off;
  emit: typeof emit;
  listenerCount(event: keyof GameEvents): number;
  // coords
  readonly SCALE: number;
  readonly arenaW: number;
  readonly arenaH: number;
  setArena(w: number, h: number): void;
  w(x: number, y: number, h?: number): { x: number; y: number; z: number };  // returns THREE.Vector3 when THREE is loaded
  worldToArena(worldX: number, worldZ: number): { x: number; y: number };
  // math
  clamp(v: number, a: number, b: number): number;
  dist (ax: number, ay: number, bx: number, by: number): number;
  dist2(ax: number, ay: number, bx: number, by: number): number;
  lerp(a: number, b: number, t: number): number;
  easeOut(t: number): number;
  easeInOut(t: number): number;
  lerpColor(hexA: number, hexB: number, t: number): number;
  // time / rng
  now(): number;
  setSeed(s: number): void;
  rng(min: number, max: number): number;
  rngInt(min: number, max: number): number;
  rngFloat(): number;
  // utils
  hashStr(s: string): number;
  saveJSON(key: string, obj: unknown): boolean;
  loadJSON<T = unknown>(key: string): T | null;
}

declare const Engine: EngineApi;

// ─── Window augmentation ──────────────────────────────────────────

declare global {
  interface Window {
    Engine: EngineApi;
    // back-compat globals (mirror of Engine.*)
    on: typeof on;
    off: typeof off;
    emit: typeof emit;
    now(): number;
    clamp: EngineApi['clamp'];
    dist: EngineApi['dist'];
    dist2: EngineApi['dist2'];
    rng: EngineApi['rng'];
    rngInt: EngineApi['rngInt'];
    rngFloat: EngineApi['rngFloat'];
    setSeed: EngineApi['setSeed'];
    hashStr: EngineApi['hashStr'];
    // TABS-specific (from game_data.js)
    DATA: any;
    cfg(path: string, defaultVal?: any): any;
    t(key: string, params?: Record<string, any>): string;
    getEntityTemplate(name: string): Entity | null;
    spawnEntity(name: string, x: number, y: number, team?: Team): Entity | null;
    setHotTune(overrides: Record<string, Partial<Entity>>): void;
    clearHotTune(): void;
    loadSave(): unknown;
    saveData(obj: unknown): boolean;
  }
}

export {};
