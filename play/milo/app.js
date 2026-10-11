import { createScene } from './scene.js';
import { createCompanionStore } from './state.js';

const store = createCompanionStore();
const $ = (selector) => document.querySelector(selector);
const el = (tag, cls, text) => { const node = document.createElement(tag); if (cls) node.className = cls; if (text) node.textContent = text; return node; };
let scene, toastTimer, busy = false, activePanel, recognition;
const worlds = { meadow: '晴日草原', dusk: '落日山谷', moon: '月光花园' };
function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false; toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3600); }
function sync() {
  const s = store.getState();
  $('#companion-name').textContent = s.name;
  $('#message-input').placeholder = `和 ${s.name} 说点什么…`;
  $('#touch-character').setAttribute('aria-label', `摸摸 ${s.name}`);
  $('#app').dataset.world = s.world;
  $('#world-caption').textContent = `${worlds[s.world] || worlds.meadow} · ${s.plants ? `${s.plants} 株小小的生命` : '我们的第一颗星球'}`;
  $('#voice-toggle').setAttribute('aria-pressed', String(s.voice));
  $('#voice-toggle').setAttribute('aria-label', s.voice ? '关闭朗读' : '开启朗读');
  $('#save-label').textContent = s.storageError ? '本次内容可能无法保存' : '只保存在此浏览器';
  scene?.setColor(s.color); scene?.setWorld(s.world); scene?.setPlants(s.plants);
}
function renderMessages() {
  const messages = store.getState().messages;
  $('#messages').replaceChildren(...messages.map(m => el('div', `message ${m.role}`, m.text)));
  $('#messages').hidden = !messages.length;
  $('#hello').hidden = !!messages.length;
  $('#suggestions').hidden = !!messages.length;
  $('#messages').scrollTop = $('#messages').scrollHeight;
}
function stopSpeaking() { globalThis.speechSynthesis?.cancel(); scene?.setSpeaking(false); $('#stop-speaking').hidden = true; }
function speak(text) {
  if (!store.getState().voice || !globalThis.speechSynthesis) return;
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN'; utterance.rate = .95; utterance.pitch = 1.12;
  utterance.onstart = () => { scene?.setSpeaking(true); $('#stop-speaking').hidden = false; };
  utterance.onend = utterance.onerror = () => { scene?.setSpeaking(false); $('#stop-speaking').hidden = true; };
  speechSynthesis.speak(utterance);
}
async function send(text) {
  text = text.trim(); if (!text || busy) return;
  busy = true; $('#chat-form button[type="submit"]').disabled = true; $('#message-input').value = '';
  try {
    const { reply, memoryChanged } = await store.send(text);
    renderMessages(); sync(); scene?.setMood(/累|难过|烦|焦虑/.test(text) ? 'calm' : 'happy');
    scene?.greet(); speak(reply);
    if (memoryChanged) toast('这件小事，已经放进我们的回忆里。');
    if (store.getState().storageError) toast(store.getState().storageError);
  } catch { toast('这句话没能保存，请再试一次。'); }
  finally { busy = false; $('#chat-form button[type="submit"]').disabled = false; }
}
$('#chat-form').addEventListener('submit', e => { e.preventDefault(); send($('#message-input').value); });
document.querySelectorAll('[data-say]').forEach(b => b.addEventListener('click', () => send(b.dataset.say)));
$('#touch-character').addEventListener('click', () => { scene?.greet(); toast(`${store.getState().name} 向你挥了挥手。`); });
$('#stop-speaking').addEventListener('click', stopSpeaking);
function toggleVoice() {
  if (!globalThis.speechSynthesis) return toast('这个浏览器不支持朗读，文字聊天仍可使用。');
  const s = store.update({ voice: !store.getState().voice }); sync();
  if (s.voice) { toast('已开启浏览器朗读'); speak('我在这里。'); } else stopSpeaking();
  if (activePanel === 'settings' && $('#panel').open) openPanel('settings');
}
$('#voice-toggle').addEventListener('click', toggleVoice);
$('#mic-button').addEventListener('click', () => {
  if (recognition) { recognition.stop(); return; }
  const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  if (!Recognition) return toast('此浏览器暂不支持语音输入，可以直接打字聊天。');
  recognition = new Recognition(); recognition.lang = 'zh-CN'; recognition.interimResults = false;
  recognition.onstart = () => { $('#mic-button').classList.add('listening'); $('#mic-button').setAttribute('aria-label', '停止语音输入'); toast('正在听…识别后会填入输入框。'); };
  recognition.onresult = e => { $('#message-input').value = e.results[0][0].transcript; $('#message-input').focus(); };
  recognition.onerror = e => toast(e.error === 'not-allowed' ? '未获得麦克风权限，仍可用文字聊天。' : '没有听清，可以再试一次。');
  recognition.onend = () => { recognition = null; $('#mic-button').classList.remove('listening'); $('#mic-button').setAttribute('aria-label', '开始语音输入'); };
  try { recognition.start(); } catch { recognition = null; toast('语音输入暂不可用。'); }
});
const panel = $('#panel'), content = $('#panel-content');
const label = text => el('p', 'panel-label', text);
const copy = text => el('p', 'panel-copy', text);
const button = (text, cls, fn) => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', fn); return b; };
function openPanel(type) {
  activePanel = type; content.replaceChildren(); const s = store.getState();
  $('#panel-title').textContent = { appearance: '很高兴，成为你的朋友', planet: '慢慢长大的小星球', memories: '我记得的那些小事', settings: '按你的节奏来' }[type];
  if (type === 'appearance') {
    content.append(copy('给这个小小的朋友，一个你喜欢的名字和颜色。'), label('TA 的名字'));
    const form = el('form', 'name-form'), input = el('input'); input.value = s.name; input.maxLength = 32; input.setAttribute('aria-label', '同伴名字'); input.required = true;
    const save = el('button', 'primary-button', '保存'); form.append(input, save);
    form.onsubmit = e => { e.preventDefault(); if (!input.value.trim()) return; store.update({ name: input.value }); sync(); toast('新名字，记住啦。'); };
    content.append(form, label('今天的颜色'));
    const colors = el('div', 'color-options');
    [['#c7d881','抹茶'],['#c3b2e2','莓雾'],['#e9b99a','蜜桃'],['#a9c9df','晴空'],['#eedb91','奶油']].forEach(([color,name]) => {
      const b = button(name, `color-option${s.color === color ? ' selected' : ''}`, () => { store.update({ color }); sync(); openPanel(type); });
      b.setAttribute('aria-label', `${name}颜色`); b.setAttribute('aria-pressed', String(s.color === color)); const dot = el('span', 'color-dot'); dot.style.background = color; b.prepend(dot); colors.append(b);
    }); content.append(colors);
  } else if (type === 'planet') {
    content.append(copy('换一片天空，种下一朵花。我们的小世界，会记住每次回来。'));
    const options = el('div', 'planet-options');
    Object.entries(worlds).forEach(([world,name]) => { const b = button(name, `planet-option${s.world === world ? ' selected' : ''}`, () => { store.update({ world }); sync(); openPanel(type); }); b.prepend(el('span', `planet-thumb ${world}`)); b.setAttribute('aria-pressed', String(s.world === world)); options.append(b); });
    content.append(options, el('div','plant-count',String(s.plants)),el('p','plant-label','我们一起种下的小花'));
    const plant = button(s.plants >= 24 ? '花园已经开满啦' : '种下一朵小花  ＋', 'primary-button full', () => { store.plant(); sync(); openPanel(type); scene?.greet(); toast('一朵小花，在你身边长出来了。'); }); plant.disabled = s.plants >= 24; content.append(plant);
  } else if (type === 'memories') {
    content.append(copy('来自你主动分享的话，只保存在这个浏览器。你可以随时删去。'));
    if (!s.memories.length) content.append(el('div','memory-empty','故事才刚刚开始。\n试着告诉我「我叫小林」或「我喜欢雨天」。'));
    s.memories.forEach(m => { const card = el('div','memory-card'), details = el('div'); details.append(el('span','panel-label',({name:'你的名字',preference:'你喜欢的'}[m.key] || m.key)),el('p','',m.value)); const remove = button('忘记','text-button',()=>{store.forget(m.id);openPanel(type);toast('已经从回忆里移除了。');}); remove.setAttribute('aria-label', `忘记${m.value}`); card.append(details,remove); content.append(card); });
  } else {
    content.append(copy('让陪伴保持舒服、轻松。'));
    const row = el('div','setting-row'); row.append(el('span','','朗读回复')); const toggle = button('','switch',toggleVoice); toggle.setAttribute('role','switch'); toggle.setAttribute('aria-label','朗读回复'); toggle.setAttribute('aria-checked',String(s.voice)); row.append(toggle); content.append(row);
    content.append(el('div','mode-note','AI 尚未连接\n当前对话使用本地规则，用于体验界面与记忆流程。朗读与语音输入由浏览器提供；语音输入可能使用浏览器厂商的在线服务。'));
    content.append(label('关于这里的记录'),copy('名字、装扮、花园、聊天与回忆保存在当前浏览器。清除浏览器数据也会清除这些记录。'));
    content.append(button('清空聊天记录','text-button',()=>{store.clearConversation();renderMessages();toast('聊天记录已清空，回忆和星球仍在。');}));
  }
  if (!panel.open) panel.showModal();
}
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>openPanel(b.dataset.panel)));
$('#close-panel').onclick = () => panel.close();
panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close();}});
$('[data-action="home"]').onclick=()=>{if(panel.open)panel.close();scene?.greet();};
window.addEventListener('pagehide',()=>{stopSpeaking();recognition?.abort();scene?.dispose();});
sync(); renderMessages();
try { scene = await createScene($('#scene'), { onTouch: () => toast(`${store.getState().name} 很开心见到你。`) }); $('#scene .scene-loading')?.remove(); sync(); } catch { $('#scene').textContent = '角色暂时没能加载，聊天仍然可用。'; }
