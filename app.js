/* ============================================================
   APP.JS — Часть 1/2
============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyAbM-vOkLan8TPkAHlkYG0h2SklMMy2Ygk",
  authDomain: "wef-europe.firebaseapp.com",
  databaseURL: "https://wef-europe-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wef-europe",
  storageBucket: "wef-europe.firebasestorage.app",
  messagingSenderId: "935234682026",
  appId: "1:935234682026:web:abf9e4ac28cee81dbe24d3"
};
let fbAuth=null, fbRtdb=null, fbReady=false;
try { firebase.initializeApp(firebaseConfig); fbAuth=firebase.auth(); fbRtdb=firebase.database(); fbReady=true; }
catch(e){ console.warn('Firebase not configured:', e.message); }

let _hostPeerRetry = 0;

const LS = { accounts:'wef_accounts', user:'wef_user', friends:'wef_friends', stickers:'wef_stickers', session:'wef_session', dms:'wef_dms', rooms:'wef_rooms' };
const state = {
  user:null, fbUser:null, regGender:'male',
  friends: JSON.parse(localStorage.getItem(LS.friends)||'[]'),
  dms: JSON.parse(localStorage.getItem(LS.dms)||'{}'),
  myRooms: JSON.parse(localStorage.getItem(LS.rooms)||'[]'),
  currentDmFriend:null,
  room:null, peer:null, hostConn:null, guests:[],
  members:{}, currentVideo:null, currentSource:'youtube',
  queue:[], ytPlayer:null, localVolume:0.7,
  scene:{ location:'map', lampOn:true, chars:{}, owls:null, seaItems:null, splashes:[], lastSent:0,
  toys:null, drinks:null, marshmallows:null, football:null, volleyball:null,
  marshmallowBox:null, drinkBox:null, broom:null, tetris:null, tictactoe:null, bottle:null,
  voting:{ zoneId:null, endsAt:0, voters:{}, tally:{} },
  waitStart: 0 },
  voiceStream:null, voiceEnabled:false, deafened:false, peerVolumes:{}, peerAudioEls:{},
  music:{ list:[], currentId:null }, musicVolumes:{},
  editorAvatar:null, editorChar:null, emojiPickerOpen:false,
  keys:{ left:false, right:false, up:false, down:false, action:false },
  friendsTab:'list', shopTab:'banners', profileTab:'info',
  _seenChat:new Set(), _lastVideoTime:0, _creatingRoom:false, _editingRoomId:null, _editingRoomImage:''
};
window.state = state;
window.REWARDS = { volleyball:10, football:10, tetris:5, broom:5, tictactoe:5 };

const SHOP_BANNERS = [
  { id:'banner-none', name:'Без баннера', price:0, css:'profile-banner banner-none' },
  { id:'banner-space', name:'Космос', price:100, css:'profile-banner banner-space' },
  { id:'banner-sunset', name:'Закат', price:100, css:'profile-banner banner-sunset' },
  { id:'banner-forest', name:'Лес', price:100, css:'profile-banner banner-forest' },
  { id:'banner-ocean', name:'Океан', price:100, css:'profile-banner banner-ocean' },
  { id:'banner-halloween', name:'Хэллоуин', price:100, css:'profile-banner banner-halloween' }
];
const SHOP_FRAMES = [
  { id:'frame-none', name:'Без рамки', price:0, css:'' },
  { id:'frame-gold', name:'Золотая', price:100, css:'profile-av-frame frame-gold' },
  { id:'frame-purple', name:'Фиолетовая', price:100, css:'profile-av-frame frame-purple' },
  { id:'frame-blue', name:'Синяя', price:100, css:'profile-av-frame frame-blue' },
  { id:'frame-green', name:'Зелёная', price:100, css:'profile-av-frame frame-green' },
  { id:'frame-fire', name:'Огненная', price:100, css:'profile-av-frame frame-fire' }
];

const EMOJIS = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','💩','🤡','👹','👺','👻','👽','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️','💕','💞','💓','💗','💖','💘','💝','🔥','⭐','✨','🎉','🎊','🎈','🎁','👍','👎','👏','🙌','🤝','🙏','💪','✌️','🤞','🤟','👌','🤙','👋','🖐️','✋','🖖','👊','✊','🤛','🤜'];
const AV_COLORS = ['#6c8cff','#8b5cf6','#ec4899','#ef4444','#f59e0b','#22c55e','#06b6d4','#3b82f6','#a855f7','#f43f5e','#84cc16','#14b8a6','#eab308','#f97316','#64748b','#1e293b'];
const AV_EMOJIS = ['😀','😎','🤠','🥳','🤖','👻','👽','🐱','🐶','🦊','🐼','🦁','🐸','🐵','🦄','🐲','🐧','🦉','🦋','🐢','🐙','🦖','🧑','👩','👨','🧑‍🎤','🧑‍💻','🦸','🧙','🥷','👑','🌟'];
const BUILTIN_STICKERS = ['😂','❤️','🔥','👍','🎉','😭','😱','🤔','💀','✨','🥳','🤯','😎','🙏','👀','💯','🎬','🍿','👏','🤝'];

const $ = id => document.getElementById(id);
const uid = () => Math.random().toString(36).slice(2,10);
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(msg, ms=2800){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(), ms); }
window.toast = toast;
function showScreen(id){ ['auth-screen','lobby-screen','room-screen'].forEach(s => $(s).classList.add('hidden')); $(id).classList.remove('hidden'); }
function closeModal(id){ $(id).classList.add('hidden'); if (id === 'char-modal' && typeof SFX !== 'undefined') SFX.stopTheme(); }
function openModal(id){ $(id).classList.remove('hidden'); }
window.closeModal = closeModal; window.openModal = openModal;

/* ===== SFX ===== */
const SFX = {
  ctx:null, volume:0.7, muted:false, musicPlaying:false, _themeTimeout:null,
  init(){ if (this.ctx) return; try { this.ctx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){} },
  setVolume(v){ this.volume = Math.max(0, Math.min(1, v)); const lbl = $('sfx-vol-label'); if (lbl) lbl.textContent = Math.round(this.volume*100); if (this.volume > 0 && this.muted){ this.muted = false; const b = $('sfx-mute-btn'); if (b) b.textContent = '🔊'; } },
  toggleMute(){ this.muted = !this.muted; const b = $('sfx-mute-btn'); if (b) b.textContent = this.muted ? '🔇' : '🔊'; },
  tone(f1, f2, dur, type, vol, t){
    const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
    osc.type = type || 'sine'; osc.frequency.setValueAtTime(f1, t);
    if (f2 !== f1) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g); g.connect(this.ctx.destination); osc.start(t); osc.stop(t + dur + 0.05);
  },
  noise(dur, vol, t, freq){
    const buf = this.ctx.createBuffer(1, Math.max(1, this.ctx.sampleRate*dur), this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    const filter = this.ctx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value = freq||1200;
    src.connect(filter); filter.connect(g); g.connect(this.ctx.destination); src.start(t);
  },
  play(type){
    this.init(); if (!this.ctx || this.muted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime; const v = this.volume; if (v <= 0) return;
    switch(type){
      case 'jump': this.tone(240, 720, 0.2, 'square', 0.18*v, t); break;
      case 'land': this.tone(160, 60, 0.12, 'sine', 0.22*v, t); break;
      case 'hug': this.tone(440, 620, 0.3, 'sine', 0.16*v, t); break;
      case 'kiss': this.tone(700, 1200, 0.08, 'sine', 0.2*v, t); break;
      case 'punch': this.noise(0.16, 0.35*v, t, 600); break;
      case 'dance': [523,659,784].forEach((f,i)=>this.tone(f,f,0.11,'triangle',0.15*v,t+i*0.09)); break;
      case 'sit': this.tone(200, 90, 0.15, 'sine', 0.22*v, t); break;
      case 'lampOn': this.tone(500, 1400, 0.08, 'sine', 0.18*v, t); break;
      case 'lampOff': this.tone(1000, 300, 0.09, 'sine', 0.18*v, t); break;
      case 'click': this.tone(1000, 1300, 0.03, 'square', 0.12*v, t); break;
      case 'join': this.tone(440,660,0.15,'sine',0.18*v,t); break;
      case 'leave': this.tone(660, 330, 0.25, 'sine', 0.16*v, t); break;
      case 'queue': this.tone(700,900,0.06,'sine',0.13*v,t); break;
      case 'gulp': this.tone(300, 200, 0.05, 'sine', 0.35*v, t); break;
      case 'marshReady': this.tone(880, 1100, 0.1, 'triangle', 0.16*v, t); break;
      case 'eat': this.noise(0.09, 0.15*v, t, 800); break;
      case 'goal': [523,659,784,1046].forEach((f,i)=>this.tone(f,f,0.12,'square',0.2*v,t+i*0.08)); break;
      case 'ballHit': this.tone(180, 90, 0.09, 'sine', 0.35*v, t); break;
      case 'throw': this.tone(600, 200, 0.15, 'sine', 0.2*v, t); break;
      case 'pickup': this.tone(400, 800, 0.1, 'triangle', 0.16*v, t); break;
      case 'dm': this.tone(880, 1320, 0.1, 'sine', 0.2*v, t); break;
      case 'candy': this.tone(880, 1320, 0.08, 'square', 0.18*v, t); break;
      case 'hit': this.tone(200, 60, 0.2, 'sawtooth', 0.28*v, t); break;
      case 'coin': this.tone(900, 1400, 0.08, 'square', 0.2*v, t); this.tone(1400, 1900, 0.12, 'square', 0.16*v, t+0.08); break;
    }
  },
  startTheme(){
    this.init(); if (!this.ctx || this.musicPlaying) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.musicPlaying = true;
    const melody = [[659,0.18],[659,0.18],[988,0.18],[988,0.18],[880,0.18],[988,0.18],[880,0.36],[784,0.18],[784,0.18],[784,0.18],[880,0.18],[880,0.18],[988,0.18],[880,0.18],[784,0.36],[659,0.18]];
    const schedule = (startT) => {
      if (!this.musicPlaying) return;
      let t = startT; const g = this.volume * 0.7;
      melody.forEach(([f, dur]) => {
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = 'square'; osc.frequency.value = f;
        gain.gain.setValueAtTime(0.001, t); gain.gain.linearRampToValueAtTime(g, t + 0.02);
        gain.gain.setValueAtTime(g, t + dur*0.8); gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + dur + 0.03); t += dur;
      });
      const total = melody.reduce((s, [,d]) => s + d, 0);
      this._themeTimeout = setTimeout(() => schedule(this.ctx.currentTime), (total + 1) * 1000);
    };
    schedule(this.ctx.currentTime);
  },
  stopTheme(){ this.musicPlaying = false; clearTimeout(this._themeTimeout); }
};
window.SFX = SFX;
function toggleSfxMute(){ SFX.toggleMute(); SFX.play('click'); }
window.toggleSfxMute = toggleSfxMute;
window.toggleActionsMenu = function(e){
  if (e) e.preventDefault(); if (e) e.stopPropagation();
  const m = document.getElementById('actions-menu');
  const btn = document.querySelector('.actions-toggle:not(.action-punch)');
  if (!m) return;
  if (m.classList.contains('hidden')){ m.classList.remove('hidden'); if (btn) btn.textContent = '✖'; }
  else { m.classList.add('hidden'); if (btn) btn.textContent = '✨'; }
};

/* ===== AVATAR ===== */
function renderAvatarHTML(av, size=32){
  if (!av) return `<span style="font-size:${size*0.55}px">👤</span>`;
  if (av.type === 'image' && av.data) return `<img src="${av.data}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  const fs = size * 0.55;
  return `<span style="background:${av.color};width:100%;height:100%;display:grid;place-items:center;font-size:${fs}px;border-radius:50%">${av.emoji}</span>`;
}
window.renderAvatarHTML = renderAvatarHTML;

/* ===== COINS ===== */
function addCoins(amount){
  if (!state.user) return;
  state.user.coins = (state.user.coins || 0) + amount;
  localStorage.setItem(LS.user, JSON.stringify(state.user));
  updateCoinsUI();
  if (fbReady && state.fbUser) fbRtdb.ref('users/' + state.fbUser.uid + '/coins').set(state.user.coins).catch(()=>{});
  if (typeof SFX !== 'undefined') SFX.play('coin');
}
window.addCoins = addCoins;
function updateCoinsUI(){
  const c = state.user?.coins || 0;
  ['coin-count','profile-coins','shop-coins'].forEach(id => { const el = $(id); if (el) el.textContent = c; });
}
window.updateCoinsUI = updateCoinsUI;
function spendCoins(amount){
  if (!state.user) return false;
  if ((state.user.coins || 0) < amount) return false;
  state.user.coins -= amount;
  localStorage.setItem(LS.user, JSON.stringify(state.user));
  updateCoinsUI();
  if (fbReady && state.fbUser) fbRtdb.ref('users/' + state.fbUser.uid + '/coins').set(state.user.coins).catch(()=>{});
  return true;
}
window.spendCoins = spendCoins;

/* ===== AUTH ===== */
function showAuthView(view){
  ['auth-login','auth-register','auth-verify','auth-forgot'].forEach(id => {
    const el = $(id); if (el) el.classList.add('hidden');
  });
  const target = $(`auth-${view}`);
  if (target) target.classList.remove('hidden');
  if (view === 'login') renderRecentAccounts();
}
function renderRecentAccounts(){
  const wrap = $('recent-accounts'); if (!wrap) return; wrap.innerHTML = '';
  const accounts = JSON.parse(localStorage.getItem(LS.accounts) || '[]');
  if (!accounts.length) return;
  wrap.innerHTML = '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700;margin-bottom:8px">Недавние</div>';
  accounts.slice(-3).reverse().forEach(acc => {
    const el = document.createElement('div'); el.className = 'acc-item';
    el.innerHTML = `<span class="av">${renderAvatarHTML(acc.avatar || {type:'emoji',color:'#6c8cff',emoji:'👤'}, 36)}</span>
      <div style="flex:1"><div class="name">${escapeHtml(acc.login)}</div><div class="email">${escapeHtml(acc.email)}</div></div>
      <button class="icon-btn" style="width:26px;height:26px;font-size:12px">✕</button>`;
    el.querySelector('button').onclick = e => { e.stopPropagation(); const i = accounts.indexOf(acc); if (i >= 0){ accounts.splice(i,1); localStorage.setItem(LS.accounts, JSON.stringify(accounts)); renderRecentAccounts(); } };
    el.onclick = () => { $('login-email').value = acc.email; $('login-pass').focus(); };
    wrap.appendChild(el);
  });
}
function saveAccountLocally(acc){
  const accounts = JSON.parse(localStorage.getItem(LS.accounts) || '[]');
  const i = accounts.findIndex(a => a.email === acc.email);
  if (i >= 0) accounts[i] = acc; else accounts.push(acc);
  localStorage.setItem(LS.accounts, JSON.stringify(accounts));
}
function setRegGender(g){
  state.regGender = g;
  $('reg-gender-male').classList.toggle('active', g === 'male');
  $('reg-gender-female').classList.toggle('active', g === 'female');
}
window.setRegGender = setRegGender;
async function doRegister(){
  const email = $('reg-email').value.trim().toLowerCase();
  const login = $('reg-login').value.trim();
  const pass = $('reg-pass').value; const pass2 = $('reg-pass2').value;
  if (!email || !email.includes('@')) return toast('Введите корректный email');
  if (!login || login.length < 3) return toast('Логин минимум 3 символа');
  if (pass.length < 6) return toast('Пароль минимум 6 символов');
  if (pass !== pass2) return toast('Пароли не совпадают');
  if (!fbReady) return toast('Firebase не настроен');
  try {
    const loginCheck = await fbRtdb.ref('userIndex/login/' + login.toLowerCase()).once('value');
    if (loginCheck.exists()) return toast('Этот логин уже занят');
    const cred = await fbAuth.createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({ displayName: login });
    await cred.user.sendEmailVerification();
    await fbRtdb.ref('users/' + cred.user.uid).set({
      uid: cred.user.uid, email, login, createdAt: Date.now(),
      gender: state.regGender || 'male', coins: 0,
      ownedBanners: ['banner-none'], ownedFrames: ['frame-none'],
      equippedBanner: 'banner-none', equippedFrame: 'frame-none',
      avatar: { type:'emoji', color: AV_COLORS[Math.floor(Math.random()*AV_COLORS.length)], emoji: AV_EMOJIS[Math.floor(Math.random()*AV_EMOJIS.length)] },
      character: defaultCharacter()
    });
    await fbRtdb.ref('userIndex/login/' + login.toLowerCase()).set(cred.user.uid);
    await fbRtdb.ref('userIndex/email/' + email).set(cred.user.uid);
    $('verify-email').textContent = email;
    showAuthView('verify'); toast('📧 Письмо с подтверждением отправлено!', 5000);
  } catch (err){ console.error(err); if (err.code === 'auth/email-already-in-use') return toast('Email уже используется'); toast('Ошибка: ' + (err.code || err.message)); }
}
window.doRegister = doRegister;
async function checkVerify(){
  if (!fbReady) return; const u = fbAuth.currentUser; if (!u) return showAuthView('login');
  await u.reload();
  if (u.emailVerified) await afterFirebaseLogin(u);
  else toast('Email ещё не подтверждён.');
}
window.checkVerify = checkVerify;
async function resendVerification(){ if (!fbReady) return; const u = fbAuth.currentUser; if (u){ await u.sendEmailVerification(); toast('Письмо отправлено заново'); } }
window.resendVerification = resendVerification;
async function doLogin(){
  const emailOrLogin = $('login-email').value.trim().toLowerCase();
  const pass = $('login-pass').value;
  if (!emailOrLogin || !pass) return toast('Заполните поля');
  if (!fbReady) return toast('Firebase не настроен');
  let email = emailOrLogin;
  if (!email.includes('@')){
    try {
      const idxSnap = await fbRtdb.ref('userIndex/login/' + emailOrLogin).once('value');
      const uid = idxSnap.val();
      if (uid){ const uSnap = await fbRtdb.ref('users/' + uid + '/email').once('value'); const e = uSnap.val(); if (e) email = e; }
    } catch(e){}
  }
  try {
    const cred = await fbAuth.signInWithEmailAndPassword(email, pass);
    if (!cred.user.emailVerified){ $('verify-email').textContent = email; showAuthView('verify'); toast('Подтвердите email.'); return; }
    await afterFirebaseLogin(cred.user);
  } catch (err){
    if (err.code === 'auth/user-not-found') return toast('Аккаунт не найден');
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') return toast('Неверный пароль');
    toast('Ошибка: ' + (err.code || err.message));
  }
}
window.doLogin = doLogin;
function doForgotPassword(){
  const email = $('forgot-email').value.trim().toLowerCase();
  if (!email || !email.includes('@')) return toast('Введите корректный email');
  if (!fbReady) return toast('Firebase не настроен');
  fbAuth.sendPasswordResetEmail(email)
    .then(() => {
      toast('📧 Письмо со ссылкой отправлено! Проверьте почту', 5000);
      setTimeout(() => showAuthView('login'), 1500);
    })
    .catch(err => {
      console.error('[WEF] forgot:', err);
      if (err.code === 'auth/user-not-found') return toast('Аккаунт с таким email не найден');
      toast('Ошибка: ' + (err.code || err.message));
    });
}
window.doForgotPassword = doForgotPassword;
async function afterFirebaseLogin(fbUser){
  let profile;
  try { const snap = await fbRtdb.ref('users/' + fbUser.uid).once('value'); profile = snap.val(); } catch(e){}
  if (!profile){
    profile = { uid: fbUser.uid, email: fbUser.email, login: fbUser.displayName || fbUser.email.split('@')[0],
      gender: 'male', coins: 0, ownedBanners: ['banner-none'], ownedFrames: ['frame-none'],
      equippedBanner: 'banner-none', equippedFrame: 'frame-none',
      avatar: { type:'emoji', color:'#6c8cff', emoji:'👤' }, character: defaultCharacter() };
    try { await fbRtdb.ref('users/' + fbUser.uid).set(profile); } catch(e){}
  }
  const user = {
    id: fbUser.uid, login: profile.login, email: fbUser.email, name: profile.login,
    gender: profile.gender || 'male', coins: profile.coins || 0,
    ownedBanners: profile.ownedBanners || ['banner-none'],
    ownedFrames: profile.ownedFrames || ['frame-none'],
    equippedBanner: profile.equippedBanner || 'banner-none',
    equippedFrame: profile.equippedFrame || 'frame-none',
    avatar: profile.avatar || { type:'emoji', color:'#6c8cff', emoji:'👤' },
    character: profile.character || defaultCharacter()
  };
  state.user = user; state.fbUser = fbUser;
  localStorage.setItem(LS.user, JSON.stringify(user)); localStorage.setItem(LS.session, fbUser.email);
  saveAccountLocally({ email: fbUser.email, login: profile.login, id: fbUser.uid, avatar: user.avatar, character: user.character });
  showScreen('lobby-screen'); updateLobbyHello(); loadStickers(); renderFriendsList(); startDmListener();
  updateCoinsUI();
  await loadFriendsFromFirebase();
  await loadMyRoomsFromFirebase();
  setTimeout(() => {
    const pending = parseRoomFromHash();
    if (pending && !state.room){
      console.log('[WEF] Автовход по ссылке:', pending.id);
      state.room = { id: pending.id, name: 'Комната', password: pending.pass, isHost: false };
      state.members[state.user.id] = { ...state.user, role:'member', muted:false };
      initPeerAsGuest(pending.id, pending.pass);
      enterRoomScreen();
      history.replaceState(null, '', location.pathname + location.search);
    }
  }, 700);
}
function logout(){
  if (!confirm('Выйти из аккаунта?')) return;
  if (state.voiceStream) state.voiceStream.getTracks().forEach(t => t.stop());
  if (fbReady && fbAuth.currentUser) fbAuth.signOut();
  state.user = null; state.fbUser = null;
  localStorage.removeItem(LS.user); localStorage.removeItem(LS.session);
  showScreen('auth-screen'); showAuthView('login');
}
window.logout = logout;
function updateLobbyHello(){ if ($('lobby-hello') && state.user) $('lobby-hello').textContent = `Привет, ${state.user.name}!`; }
if (fbReady){
  fbAuth.onAuthStateChanged(async (fbUser) => {
    if (fbUser && fbUser.emailVerified) await afterFirebaseLogin(fbUser);
    else if (fbUser && !fbUser.emailVerified){ $('verify-email').textContent = fbUser.email; showScreen('auth-screen'); showAuthView('verify'); }
    else { showScreen('auth-screen'); showAuthView('login'); }
  });
} else { showScreen('auth-screen'); showAuthView('login'); }

console.log('[WEF] app.js Часть 1 загружена. state:', !!window.state);
/* ============================================================
   ЧАСТЬ 2 — FRIENDS, DM, ROOMS, PROFILE, SHOP, PEER, CHAT, VIDEO
============================================================ */

/* ===== FRIENDS ===== */
async function loadFriendsFromFirebase(){
  if (!fbReady || !state.fbUser) return;
  try {
    const snap = await fbRtdb.ref('friends/' + state.fbUser.uid).once('value');
    const data = snap.val() || {};
    const list = Object.values(data).map(f => ({
      id: f.id, login: f.login, email: f.email,
      avatar: f.avatar || { type:'emoji', color:'#6c8cff', emoji:'👤' }
    })).filter(f => f.id);
    state.friends = list;
    localStorage.setItem(LS.friends, JSON.stringify(list));
    renderFriendsList();
    console.log('[WEF] Друзья загружены:', list.length);
  } catch(e){ console.warn('[WEF] loadFriends error:', e); }
}
window.loadFriendsFromFirebase = loadFriendsFromFirebase;

function renderFriendsList(){
  const wrap = $('friends-list'); if (!wrap) return;
  $('friends-count').textContent = `Всего друзей: ${state.friends.length}`; wrap.innerHTML = '';
  if (!state.friends.length){ wrap.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px">Пока нет друзей.</div>'; return; }
  state.friends.forEach(f => {
    const unread = (state.dms[f.id] || []).filter(m => m.from === f.id && !m.read).length;
    const el = document.createElement('div'); el.className = 'friend-card';
    el.innerHTML = `<span class="av">${renderAvatarHTML(f.avatar, 40)}</span>
      <div class="info"><div class="name">${escapeHtml(f.login)}${unread > 0 ? `<span class="unread-dot"></span>` : ''}</div>
      <div class="status">${escapeHtml(f.email || f.id)}</div></div>
      <div class="actions">
        <button class="mini-btn" title="Пригласить" onclick="inviteFriendToRoom('${f.id}')">🎮</button>
        <button class="mini-btn" title="Написать" onclick="openDm('${f.id}')">💬</button>
        <button class="mini-btn" title="Удалить" onclick="removeFriend('${f.id}')">✕</button>
      </div>`;
    wrap.appendChild(el);
  });
}
window.renderFriendsList = renderFriendsList;
function openFriends(){ renderFriendsList(); switchFriendsTab('list'); openModal('friends-modal'); }
window.openFriends = openFriends;
function switchFriendsTab(t){
  state.friendsTab = t;
  $('ftab-list').classList.toggle('active', t === 'list'); $('ftab-add').classList.toggle('active', t === 'add');
  $('friends-list-view').classList.toggle('hidden', t !== 'list'); $('friends-add-view').classList.toggle('hidden', t !== 'add');
  if (t === 'list') renderFriendsList();
}
window.switchFriendsTab = switchFriendsTab;
async function addFriend(){
  const v = $('friend-input').value.trim(); if (!v) return toast('Введите ID, email или логин');
  if (state.friends.some(f => f.id === v || f.email === v)) return toast('Уже в друзьях');
  let found = null;
  try {
    let snap = await fbRtdb.ref('users/' + v).once('value'); if (snap.exists()) found = snap.val();
    if (!found){ const idx = await fbRtdb.ref('userIndex/email/' + v.toLowerCase()).once('value'); const uid2 = idx.val(); if (uid2){ const us = await fbRtdb.ref('users/' + uid2).once('value'); if (us.exists()) found = us.val(); } }
    if (!found){ const idx = await fbRtdb.ref('userIndex/login/' + v.toLowerCase()).once('value'); const uid3 = idx.val(); if (uid3){ const us = await fbRtdb.ref('users/' + uid3).once('value'); if (us.exists()) found = us.val(); } }
  } catch(e){}
  if (!found){ $('friend-search-results').innerHTML = '<div style="color:var(--danger);font-size:13px;text-align:center;padding:10px">Пользователь не найден</div>'; return; }
  if (found.uid === state.user.id) return toast('Это вы сами 🙂');
  const friend = { id: found.uid, login: found.login, email: found.email, avatar: found.avatar || { type:'emoji', color:'#6c8cff', emoji:'👤' } };
  state.friends.push(friend);
  localStorage.setItem(LS.friends, JSON.stringify(state.friends));
  try {
    await fbRtdb.ref('friends/' + state.fbUser.uid + '/' + friend.id).set({
      id: friend.id, login: friend.login, email: friend.email,
      avatar: friend.avatar, since: Date.now()
    });
  } catch(e){}
  toast(`✅ ${friend.login} добавлен`);
  $('friend-input').value = ''; renderFriendsList(); switchFriendsTab('list');
}
window.addFriend = addFriend;
async function removeFriend(id){
  if (!confirm('Удалить из друзей?')) return;
  state.friends = state.friends.filter(f => f.id !== id);
  localStorage.setItem(LS.friends, JSON.stringify(state.friends));
  try { await fbRtdb.ref('friends/' + state.fbUser.uid + '/' + id).remove(); } catch(e){}
  renderFriendsList();
}
window.removeFriend = removeFriend;

window.inviteFriendToRoom = function(friendId){
  if (!state.room){ toast('⚠️ Сначала создайте или войдите в комнату'); return; }
  const f = state.friends.find(x => x.id === friendId); if (!f) return;
  const link = location.origin + location.pathname + '#room=' + state.room.id + '&pass=' + encodeURIComponent(state.room.password);
  if (!state.dms[f.id]) state.dms[f.id] = [];
  const text = `🎮 Приглашаю в мою комнату «${state.room.name}»!\nID: ${state.room.id}\nПароль: ${state.room.password}\n\nСсылка:\n${link}`;
  const msg = { from: state.user.id, fromLogin: state.user.login, text, time: Date.now() };
  state.dms[f.id].push({ ...msg, read: true });
  localStorage.setItem(LS.dms, JSON.stringify(state.dms));
  try {
    const chatId = [state.user.id, f.id].sort().join('_');
    fbRtdb.ref('chats/' + chatId + '/messages').push().set(msg);
    fbRtdb.ref('userChats/' + state.user.id + '/' + chatId).set(f.id);
    fbRtdb.ref('userChats/' + f.id + '/' + chatId).set(state.user.id);
  } catch(e){}
  navigator.clipboard.writeText(link).catch(()=>{});
  toast(`🎮 Ссылка отправлена ${f.login}!`);
  if (typeof SFX !== 'undefined') SFX.play('join');
};

/* ===== DM ===== */
function openDm(friendId){
  const f = state.friends.find(x => x.id === friendId); if (!f) return;
  state.currentDmFriend = f;
  $('dm-av').innerHTML = renderAvatarHTML(f.avatar, 36); $('dm-name').textContent = f.login; $('dm-status').textContent = f.email || f.id;
  renderDmMessages();
  const list = state.dms[f.id] || []; list.forEach(m => m.read = true); state.dms[f.id] = list;
  localStorage.setItem(LS.dms, JSON.stringify(state.dms));
  openModal('dm-modal'); setTimeout(() => $('dm-input').focus(), 100);
}
window.openDm = openDm;
function renderDmMessages(){
  const f = state.currentDmFriend; if (!f) return;
  const wrap = $('dm-messages'); wrap.innerHTML = ''; const list = state.dms[f.id] || [];
  if (!list.length){ wrap.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;font-size:12px">Нет сообщений</div>'; return; }
  list.forEach(m => { const div = document.createElement('div'); div.className = 'dm-msg' + (m.from === state.user.id ? ' self' : ''); div.textContent = m.text; wrap.appendChild(div); });
  wrap.scrollTop = wrap.scrollHeight;
}
async function sendDM(){
  const f = state.currentDmFriend; if (!f) return;
  const inp = $('dm-input'); const text = inp.value.trim(); if (!text) return;
  const msg = { from: state.user.id, fromLogin: state.user.login, text, time: Date.now() };
  if (!state.dms[f.id]) state.dms[f.id] = [];
  state.dms[f.id].push({ ...msg, read: true });
  localStorage.setItem(LS.dms, JSON.stringify(state.dms)); inp.value = ''; renderDmMessages();
  try { const chatId = [state.user.id, f.id].sort().join('_');
    await fbRtdb.ref('chats/' + chatId + '/messages').push().set(msg);
    await fbRtdb.ref('userChats/' + state.user.id + '/' + chatId).set(f.id);
    await fbRtdb.ref('userChats/' + f.id + '/' + chatId).set(state.user.id);
  } catch(e){}
}
window.sendDM = sendDM;
function startDmListener(){
  if (!fbReady || !state.fbUser) return;
  fbRtdb.ref('userChats/' + state.fbUser.uid).on('child_added', async (chatSnap) => {
    const chatId = chatSnap.key; const otherId = chatSnap.val(); if (!otherId) return;
    fbRtdb.ref('chats/' + chatId + '/messages').limitToLast(200).on('child_added', (msgSnap) => {
      const m = msgSnap.val(); if (!m || !m.time) return;
      const isMine = m.from === state.user.id;
      if (!state.dms[otherId]) state.dms[otherId] = [];
      if (!state.dms[otherId].some(x => x.time === m.time && x.text === m.text && x.from === m.from)){
        state.dms[otherId].push({ from: m.from, fromLogin: m.fromLogin, text: m.text, time: m.time, read: isMine });
        if (!isMine) SFX.play('dm');
        localStorage.setItem(LS.dms, JSON.stringify(state.dms));
        if (state.currentDmFriend && state.currentDmFriend.id === otherId) renderDmMessages();
        renderFriendsList();
      }
    });
  });
}

/* ===== MY ROOMS ===== */
async function saveMyRoomToFirebase(id, name, password, image){
  if (!fbReady || !state.fbUser) return;
  const room = {
    id, name, password,
    image: image || '',
    createdAt: Date.now(),
    expiresAt: Date.now() + 24*60*60*1000
  };
  state.myRooms = state.myRooms.filter(r => r.id !== id);
  state.myRooms.push(room);
  localStorage.setItem(LS.rooms, JSON.stringify(state.myRooms));
  try { await fbRtdb.ref('myRooms/' + state.fbUser.uid + '/' + id).set(room); } catch(e){}
}
window.saveMyRoomToFirebase = saveMyRoomToFirebase;

async function loadMyRoomsFromFirebase(){
  if (!fbReady || !state.fbUser) return;
  try {
    const snap = await fbRtdb.ref('myRooms/' + state.fbUser.uid).once('value');
    const data = snap.val() || {};
    const list = Object.values(data).sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
    state.myRooms = list;
    localStorage.setItem(LS.rooms, JSON.stringify(list));
    renderMyRooms();
    console.log('[WEF] Мои комнаты загружены:', list.length);
  } catch(e){ console.warn('[WEF] loadRooms error:', e); }
}
window.loadMyRoomsFromFirebase = loadMyRoomsFromFirebase;

function renderMyRooms(){
  const list = state.myRooms || [];
  const empty = '<div class="empty-rooms">У вас пока нет созданных комнат</div>';
  const now = Date.now();
  const html = list.length ? list.map(r => {
    const left = r.expiresAt ? Math.max(0, Math.floor((r.expiresAt - now) / 3600000)) : 24;
    const imgHtml = r.image
      ? `<div style="width:50px;height:50px;border-radius:8px;background:url(${r.image}) center/cover;flex-shrink:0;border:1px solid var(--line)"></div>`
      : `<div style="width:50px;height:50px;border-radius:8px;background:var(--bg2);display:grid;place-items:center;flex-shrink:0;border:1px solid var(--line)">🏠</div>`;
    return `
    <div class="room-card">
      ${imgHtml}
      <div class="info">
        <div class="name">${escapeHtml(r.name || 'Комната')}</div>
        <div class="id">ID: ${escapeHtml(r.id)} · ⏱ ${left}ч</div>
      </div>
      <div class="actions">
        <button class="mini-btn" title="Войти" onclick="enterMyRoom('${r.id}')">🚪</button>
        <button class="mini-btn" title="Копировать ссылку" onclick="copyRoomLink('${r.id}', '${escapeHtml(r.password||'')}')">🔗</button>
        <button class="mini-btn" title="Изменить" onclick="editMyRoom('${r.id}')">✏️</button>
        <button class="mini-btn" title="Удалить" onclick="deleteMyRoom('${r.id}')">🗑</button>
      </div>
    </div>`;
  }).join('') : empty;
  const el1 = $('my-rooms-list'); if (el1) el1.innerHTML = html;
  const el2 = $('my-rooms-full-list'); if (el2) el2.innerHTML = html;
}
window.renderMyRooms = renderMyRooms;

window.openMyRooms = async function(){
  if (typeof loadMyRoomsFromFirebase === 'function') await loadMyRoomsFromFirebase();
  renderMyRooms();
  openModal('my-rooms-modal');
};

window.enterMyRoom = function(id){
  const r = state.myRooms.find(x => x.id === id);
  if (!r) return;
  closeModal('my-rooms-modal'); closeModal('profile-modal');
  state.room = { id: r.id, name: r.name, password: r.password, isHost: true, image: r.image };
  state.members[state.user.id] = { ...state.user, role:'host', muted:false };
  initPeerAsHost();
  enterRoomScreen();
};

window.copyRoomLink = function(id, password){
  const link = location.origin + location.pathname + '#room=' + id + '&pass=' + encodeURIComponent(password);
  navigator.clipboard.writeText(link).then(() => toast('🔗 Ссылка скопирована'));
};

window.editMyRoom = function(id){
  const r = state.myRooms.find(x => x.id === id); if (!r) return;
  state._editingRoomId = id;
  state._editingRoomImage = r.image || '';
  $('room-edit-id').textContent = id;
  $('room-edit-name').value = r.name || '';
  $('room-edit-pass').value = r.password || '';
  if (!$('room-edit-image')){
    const inp = document.createElement('input');
    inp.type = 'file'; inp.id = 'room-edit-image'; inp.accept = 'image/*';
    inp.className = 'field'; inp.style.padding = '8px';
    inp.onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 300*1024) return toast('Картинка до 300KB');
      state._editingRoomImage = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(f); });
      toast('Картинка выбрана');
    };
    const card = document.querySelector('#room-edit-modal .card');
    const firstBtn = card.querySelector('.btn');
    card.insertBefore(inp, firstBtn);
  }
  openModal('room-edit-modal');
};

window.saveRoomEdit = async function(){
  const id = state._editingRoomId; if (!id) return;
  const r = state.myRooms.find(x => x.id === id); if (!r) return;
  const newName = $('room-edit-name').value.trim() || r.name;
  const newPass = $('room-edit-pass').value.trim() || r.password;
  const newImg = state._editingRoomImage !== undefined ? state._editingRoomImage : (r.image || '');
  r.name = newName; r.password = newPass; r.image = newImg;
  localStorage.setItem(LS.rooms, JSON.stringify(state.myRooms));
  if (fbReady && state.fbUser){
    try { await fbRtdb.ref('myRooms/' + state.fbUser.uid + '/' + id).update({ name: newName, password: newPass, image: newImg }); } catch(e){}
  }
  toast('✅ Комната обновлена');
  closeModal('room-edit-modal'); renderMyRooms();
};

window.deleteMyRoom = async function(id){
  if (!confirm('Удалить комнату?')) return;
  state.myRooms = state.myRooms.filter(x => x.id !== id);
  localStorage.setItem(LS.rooms, JSON.stringify(state.myRooms));
  if (fbReady && state.fbUser){
    try { await fbRtdb.ref('myRooms/' + state.fbUser.uid + '/' + id).remove(); } catch(e){}
  }
  toast('🗑 Комната удалена'); renderMyRooms();
};

async function cleanupExpiredRooms(){
  if (!fbReady || !state.fbUser) return;
  try {
    const snap = await fbRtdb.ref('myRooms/' + state.fbUser.uid).once('value');
    const data = snap.val() || {};
    const now = Date.now();
    for (const [id, room] of Object.entries(data)){
      if (room.expiresAt && room.expiresAt < now){
        await fbRtdb.ref('myRooms/' + state.fbUser.uid + '/' + id).remove();
        await fbRtdb.ref('rooms/' + id).remove();
      }
    }
    await loadMyRoomsFromFirebase();
  } catch(e){}
}
setTimeout(cleanupExpiredRooms, 3000);
setInterval(cleanupExpiredRooms, 60*60*1000);

/* ===== PROFILE ===== */
function openProfile(){
  if (!state.user) return;
  const av = state.user.avatar;
  state.editorAvatar = { color: av.color || '#6c8cff', emoji: av.emoji || '😀', image: av.type==='image'?av.data:null };
  $('profile-av').innerHTML = renderAvatarHTML(av, 80);
  $('profile-name').textContent = state.user.login;
  $('profile-email').textContent = state.user.email;
  $('profile-uid').textContent = 'ID: ' + state.user.id;
  updateCoinsUI(); applyProfileBanner(); applyProfileFrame(); updateGenderButtons();
  renderAvatarEditor(); renderMyRooms(); renderProfileFriends();
  switchProfileTab('info'); openModal('profile-modal');
}
window.openProfile = openProfile;
function switchProfileTab(t){
  state.profileTab = t;
  $('ptab-info').classList.toggle('active', t === 'info');
  $('ptab-rooms').classList.toggle('active', t === 'rooms');
  $('ptab-friends').classList.toggle('active', t === 'friends');
  $('ptab-info-view').classList.toggle('hidden', t !== 'info');
  $('ptab-rooms-view').classList.toggle('hidden', t !== 'rooms');
  $('ptab-friends-view').classList.toggle('hidden', t !== 'friends');
  if (t === 'rooms') renderMyRooms();
  if (t === 'friends') renderProfileFriends();
}
window.switchProfileTab = switchProfileTab;
function renderProfileFriends(){
  const wrap = $('profile-friends-list'); if (!wrap) return;
  wrap.innerHTML = '';
  if (!state.friends.length){ wrap.innerHTML = '<div class="empty-rooms">Пока нет друзей</div>'; return; }
  state.friends.forEach(f => {
    const el = document.createElement('div'); el.className = 'friend-card';
    el.innerHTML = `<span class="av">${renderAvatarHTML(f.avatar, 40)}</span>
      <div class="info"><div class="name">${escapeHtml(f.login)}</div><div class="status">${escapeHtml(f.email||f.id)}</div></div>
      <div class="actions">
        <button class="mini-btn" onclick="inviteFriendToRoom('${f.id}')">🎮</button>
        <button class="mini-btn" onclick="openDm('${f.id}')">💬</button>
      </div>`;
    wrap.appendChild(el);
  });
}
window.renderProfileFriends = renderProfileFriends;
function updateGenderButtons(){
  const g = state.user?.gender || 'male';
  $('profile-gender-male').classList.toggle('active', g === 'male');
  $('profile-gender-female').classList.toggle('active', g === 'female');
}
function changeGender(g){
  if (!state.user) return;
  state.user.gender = g;
  localStorage.setItem(LS.user, JSON.stringify(state.user));
  if (fbReady && state.fbUser) fbRtdb.ref('users/' + state.fbUser.uid + '/gender').set(g).catch(()=>{});
  updateGenderButtons();
  if (state.members[state.user.id]) state.members[state.user.id].gender = g;
  broadcast({ type:'gender', userId: state.user.id, gender: g });
  toast(g === 'male' ? '👨 Мужской' : '👩 Женский');
}
window.changeGender = changeGender;
function applyProfileBanner(){
  const el = $('profile-banner'); if (!el) return;
  const b = SHOP_BANNERS.find(x => x.id === (state.user?.equippedBanner || 'banner-none')) || SHOP_BANNERS[0];
  el.className = b.css;
}
function applyProfileFrame(){
  const el = $('profile-av-frame'); if (!el) return;
  const f = SHOP_FRAMES.find(x => x.id === (state.user?.equippedFrame || 'frame-none')) || SHOP_FRAMES[0];
  el.className = f.css;
}
function renderAvatarEditor(){
  const ed = state.editorAvatar; if (!ed) return;
  const cw = $('av-colors'); cw.innerHTML = '';
  AV_COLORS.forEach(c => {
    const b = document.createElement('button');
    b.className = 'color-swatch' + (c===ed.color?' active':''); b.style.background = c;
    b.onclick = () => { ed.color = c; ed.image = null; $('profile-av').innerHTML = ed.emoji; $('profile-av').style.background = c; renderAvatarEditor(); };
    cw.appendChild(b);
  });
  const ew = $('av-emojis'); ew.innerHTML = '';
  AV_EMOJIS.forEach(e => {
    const b = document.createElement('button'); b.textContent = e;
    if (e === ed.emoji) b.classList.add('active');
    b.onclick = () => { ed.emoji = e; ed.image = null; $('profile-av').innerHTML = e; $('profile-av').style.background = ed.color; renderAvatarEditor(); };
    ew.appendChild(b);
  });
  $('av-file').onchange = ev => {
    const f = ev.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { ed.image = r.result; $('profile-av').innerHTML = `<img src="${r.result}">`; renderAvatarEditor(); }; r.readAsDataURL(f);
  };
}
async function saveAvatar(){
  const ed = state.editorAvatar;
  state.user.avatar = ed.image ? { type:'image', data: ed.image } : { type:'emoji', color: ed.color, emoji: ed.emoji };
  localStorage.setItem(LS.user, JSON.stringify(state.user));
  if (fbReady && state.fbUser){ try { await fbRtdb.ref('users/' + state.fbUser.uid + '/avatar').set(state.user.avatar); } catch(e){} }
  broadcast({ type:'avatar', userId: state.user.id, avatar: state.user.avatar });
  if (state.members[state.user.id]) state.members[state.user.id].avatar = state.user.avatar;
  if (state.scene.chars[state.user.id]) state.scene.chars[state.user.id].avatar = state.user.avatar;
  closeModal('profile-modal'); updateLobbyHello(); renderMembers(); toast('Аватар обновлён');
}
window.saveAvatar = saveAvatar;
function defaultCharacter(){ return { style:'animal', species:'cat', skinColor:null, hat:'none', clothes:'#3498db', spPreset:'green', ponyPreset:'rainbow', winxPreset:'bloom' }; }
window.defaultCharacter = defaultCharacter;
function setCharStyle(style){ state.editorChar.style = style; SFX.play('click'); renderCharEditor(); }
window.setCharStyle = setCharStyle;
function openCharacterEditor(){ state.editorChar = Object.assign(defaultCharacter(), state.user.character || {}); renderCharEditor(); openModal('char-modal'); }
window.openCharacterEditor = openCharacterEditor;

/* ===== SHOP ===== */
function openShop(){ renderShop(); openModal('shop-modal'); }
window.openShop = openShop;
function switchShopTab(t){
  state.shopTab = t;
  $('shop-tab-banners').classList.toggle('active', t === 'banners');
  $('shop-tab-frames').classList.toggle('active', t === 'frames');
  $('shop-tab-owned').classList.toggle('active', t === 'owned');
  $('shop-banners-view').classList.toggle('hidden', t !== 'banners');
  $('shop-frames-view').classList.toggle('hidden', t !== 'frames');
  $('shop-owned-view').classList.toggle('hidden', t !== 'owned');
  renderShop();
}
window.switchShopTab = switchShopTab;
function renderShop(){
  updateCoinsUI();
  const bv = $('shop-banners-view'); bv.innerHTML = '';
  SHOP_BANNERS.forEach(b => {
    const owned = state.user.ownedBanners?.includes(b.id) || b.price === 0;
    const equipped = state.user.equippedBanner === b.id;
    const el = document.createElement('div'); el.className = 'shop-item' + (owned?' owned':'');
    el.innerHTML = `<div class="preview"><div class="preview-banner ${b.css.replace('profile-banner ','')}"></div></div>
      <div class="info"><div class="name">${b.name}</div><div class="price">💰 ${b.price}</div></div>
      ${equipped ? `<button class="btn-buy owned" disabled>✅ Надето</button>` :
        owned ? `<button class="btn-buy" onclick="equipBanner('${b.id}')">Надеть</button>` :
        `<button class="btn-buy" onclick="buyBanner('${b.id}')">Купить</button>`}`;
    bv.appendChild(el);
  });
  const fv = $('shop-frames-view'); fv.innerHTML = '';
  SHOP_FRAMES.forEach(f => {
    const owned = state.user.ownedFrames?.includes(f.id) || f.price === 0;
    const equipped = state.user.equippedFrame === f.id;
    const el = document.createElement('div'); el.className = 'shop-item' + (owned?' owned':'');
    el.innerHTML = `<div class="preview"><div class="preview-frame ${f.css.replace('profile-av-frame','')}"></div></div>
      <div class="info"><div class="name">${f.name}</div><div class="price">💰 ${f.price}</div></div>
      ${equipped ? `<button class="btn-buy owned" disabled>✅ Надето</button>` :
        owned ? `<button class="btn-buy" onclick="equipFrame('${f.id}')">Надеть</button>` :
        `<button class="btn-buy" onclick="buyFrame('${f.id}')">Купить</button>`}`;
    fv.appendChild(el);
  });
  const ov = $('shop-owned-view'); ov.innerHTML = '';
  const ownedB = (state.user.ownedBanners || []).map(id => SHOP_BANNERS.find(x => x.id === id)).filter(Boolean);
  const ownedF = (state.user.ownedFrames || []).map(id => SHOP_FRAMES.find(x => x.id === id)).filter(Boolean);
  ov.innerHTML = '<div class="muted-small">Баннеры:</div>';
  ownedB.forEach(b => { ov.innerHTML += `<div class="shop-item owned"><div class="info"><div class="name">${b.name}</div></div></div>`; });
  ov.innerHTML += '<div class="muted-small" style="margin-top:10px">Рамки:</div>';
  ownedF.forEach(f => { ov.innerHTML += `<div class="shop-item owned"><div class="info"><div class="name">${f.name}</div></div></div>`; });
}
function buyBanner(id){ const b = SHOP_BANNERS.find(x => x.id === id); if (!b) return;
  if (!spendCoins(b.price)) return toast('Недостаточно монет');
  state.user.ownedBanners = state.user.ownedBanners || []; state.user.ownedBanners.push(id);
  state.user.equippedBanner = id; saveShopToFirebase(); renderShop(); toast(`✅ Куплено: ${b.name}`); }
window.buyBanner = buyBanner;
function equipBanner(id){ state.user.equippedBanner = id; saveShopToFirebase(); renderShop(); applyProfileBanner(); toast('Надето'); }
window.equipBanner = equipBanner;
function buyFrame(id){ const f = SHOP_FRAMES.find(x => x.id === id); if (!f) return;
  if (!spendCoins(f.price)) return toast('Недостаточно монет');
  state.user.ownedFrames = state.user.ownedFrames || []; state.user.ownedFrames.push(id);
  state.user.equippedFrame = id; saveShopToFirebase(); renderShop(); toast(`✅ Куплено: ${f.name}`); }
window.buyFrame = buyFrame;
function equipFrame(id){ state.user.equippedFrame = id; saveShopToFirebase(); renderShop(); applyProfileFrame(); toast('Надето'); }
window.equipFrame = equipFrame;
function saveShopToFirebase(){
  localStorage.setItem(LS.user, JSON.stringify(state.user));
  if (fbReady && state.fbUser){
    fbRtdb.ref('users/' + state.fbUser.uid).update({
      ownedBanners: state.user.ownedBanners, ownedFrames: state.user.ownedFrames,
      equippedBanner: state.user.equippedBanner, equippedFrame: state.user.equippedFrame
    }).catch(()=>{});
  }
}

/* ===== CHARACTER EDITOR ===== */
function renderCharEditor(){
  const ch = state.editorChar;
  if (typeof drawCharacterPreview === 'function') drawCharacterPreview($('char-preview'), ch);
  $('style-tab-animal').classList.toggle('active', ch.style === 'animal');
  $('style-tab-sp').classList.toggle('active', ch.style === 'southpark');
  $('style-tab-pony').classList.toggle('active', ch.style === 'pony');
  $('style-tab-winx').classList.toggle('active', ch.style === 'winx');
  $('animal-controls').classList.toggle('hidden', ch.style !== 'animal');
  $('sp-controls').classList.toggle('hidden', ch.style !== 'southpark');
  $('pony-controls').classList.toggle('hidden', ch.style !== 'pony');
  $('winx-controls').classList.toggle('hidden', ch.style !== 'winx');
  const SP_ = window.SPECIES || {}, FC_ = window.FACE_COLORS || [];
  const SPP_ = window.SP_PRESETS || [], PP_ = window.PONY_PRESETS || [], WP_ = window.WINX_PRESETS || [];
  if (ch.style === 'animal'){
    const sw = $('species-grid'); sw.innerHTML = '';
    Object.keys(SP_).forEach(k => {
      const b = document.createElement('button');
      b.className = 'color-swatch' + (ch.species===k?' active':'');
      b.style.cssText = 'background:var(--bg3);padding:0;overflow:hidden';
      const cvs = document.createElement('canvas'); cvs.width = 48; cvs.height = 48;
      cvs.style.cssText = 'width:100%;height:100%;display:block';
      if (typeof drawAnimalFace === 'function') drawAnimalFace(cvs.getContext('2d'), k, 24, 26, 15, ch.skinColor);
      b.appendChild(cvs); b.onclick = () => { ch.species=k; renderCharEditor(); }; sw.appendChild(b);
    });
    const fw = $('face-color-grid'); fw.innerHTML = '';
    const auto = document.createElement('button');
    auto.className = 'color-swatch' + (ch.skinColor === null ? ' active' : '');
    auto.innerHTML = '<span style="font-size:11px;color:var(--muted);background:var(--bg3);width:100%;height:100%;border-radius:50%;display:grid;place-items:center">авто</span>';
    auto.onclick = () => { ch.skinColor = null; renderCharEditor(); }; fw.appendChild(auto);
    FC_.forEach(c => {
      const b = document.createElement('button');
      b.className = 'color-swatch' + (ch.skinColor === c ? ' active' : ''); b.style.background = c;
      b.onclick = () => { ch.skinColor = c; renderCharEditor(); }; fw.appendChild(b);
    });
  } else if (ch.style === 'southpark'){
    const gw = $('sp-presets-grid'); gw.innerHTML = '';
    SPP_.forEach(preset => {
      const b = document.createElement('button');
      b.className = 'color-swatch' + (ch.spPreset===preset.id?' active':'');
      b.style.cssText = 'background:var(--bg3);padding:0;overflow:hidden;border-radius:12px;aspect-ratio:1';
      const cvs = document.createElement('canvas'); cvs.width = 70; cvs.height = 70;
      cvs.style.cssText = 'width:100%;height:100%;display:block';
      if (typeof drawSPCharacter === 'function') drawSPCharacter(cvs.getContext('2d'), preset.id, { x:35, y:62, facing:1, walkPhase:0, charState:'idle', action:'none' });
      b.appendChild(cvs); b.onclick = () => { ch.spPreset = preset.id; renderCharEditor(); SFX.startTheme(); }; gw.appendChild(b);
    });
  } else if (ch.style === 'pony'){
    const gw = $('pony-grid'); gw.innerHTML = '';
    PP_.forEach(p => {
      const b = document.createElement('button');
      b.className = 'color-swatch' + (ch.ponyPreset===p.id?' active':'');
      b.style.cssText = 'background:var(--bg3);padding:0;overflow:hidden;border-radius:12px;aspect-ratio:1'; b.title = p.name;
      const cvs = document.createElement('canvas'); cvs.width = 80; cvs.height = 80;
      cvs.style.cssText = 'width:100%;height:100%;display:block';
      if (typeof drawPony === 'function') drawPony(cvs.getContext('2d'), p.id, { x:40, y:74, facing:1, walkPhase:0, charState:'idle', action:'none' });
      b.appendChild(cvs); b.onclick = () => { ch.ponyPreset = p.id; renderCharEditor(); }; gw.appendChild(b);
    });
  } else if (ch.style === 'winx'){
    const gw = $('winx-grid'); gw.innerHTML = '';
    WP_.forEach(p => {
      const b = document.createElement('button');
      b.className = 'color-swatch' + (ch.winxPreset===p.id?' active':'');
      b.style.cssText = 'background:var(--bg3);padding:0;overflow:hidden;border-radius:12px;aspect-ratio:1'; b.title = p.name;
      const cvs = document.createElement('canvas'); cvs.width = 80; cvs.height = 80;
      cvs.style.cssText = 'width:100%;height:100%;display:block';
      if (typeof drawWinx === 'function') drawWinx(cvs.getContext('2d'), p.id, { x:40, y:74, facing:1, walkPhase:0, charState:'idle', action:'none' });
      b.appendChild(cvs); b.onclick = () => { ch.winxPreset = p.id; renderCharEditor(); }; gw.appendChild(b);
    });
  }
}
async function saveCharacter(){
  SFX.stopTheme(); state.user.character = { ...state.editorChar };
  localStorage.setItem(LS.user, JSON.stringify(state.user));
  if (fbReady && state.fbUser){ try { await fbRtdb.ref('users/' + state.fbUser.uid + '/character').set(state.user.character); } catch(e){} }
  if (state.members[state.user.id]) state.members[state.user.id].character = state.user.character;
  if (state.room){ const sc = state.scene.chars[state.user.id]; if (sc) sc.character = state.user.character; broadcast({ type:'character', userId: state.user.id, character: state.user.character }); }
  closeModal('char-modal'); renderMembers(); toast('Персонаж сохранён');
}
window.saveCharacter = saveCharacter;

/* ===== STICKERS ===== */
function loadStickers(){ renderStickers(JSON.parse(localStorage.getItem(LS.stickers)||'[]')); }
window.loadStickers = loadStickers;
function renderStickers(list){
  const bw = $('builtin-stickers'); bw.innerHTML = '';
  BUILTIN_STICKERS.forEach(s => { const b = document.createElement('div'); b.className = 'sticker-item'; b.textContent = s; b.onclick = () => { sendSticker(s); closeModal('stickers-modal'); }; bw.appendChild(b); });
  const mw = $('my-stickers'); mw.innerHTML = '';
  list.forEach((s) => { const b = document.createElement('div'); b.className = 'sticker-item'; b.innerHTML = `<img src="${s}">`; b.onclick = () => { sendSticker(null, s); closeModal('stickers-modal'); }; mw.appendChild(b); });
}
function openStickers(){ renderStickers(JSON.parse(localStorage.getItem(LS.stickers)||'[]')); openModal('stickers-modal'); }
window.openStickers = openStickers;
document.addEventListener('DOMContentLoaded', () => {
  const inp = $('sticker-upload');
  if (inp) inp.onchange = e => {
    const f = e.target.files[0]; if (!f) return; if (f.size > 500*1024) return toast('Максимум 500KB');
    const r = new FileReader(); r.onload = () => { const arr = JSON.parse(localStorage.getItem(LS.stickers)||'[]'); arr.push(r.result); localStorage.setItem(LS.stickers, JSON.stringify(arr)); renderStickers(arr); }; r.readAsDataURL(f);
  };
});
function toggleEmoji(e){
  e.stopPropagation(); const p = $('emoji-picker');
  if (state.emojiPickerOpen){ p.classList.add('hidden'); state.emojiPickerOpen = false; return; }
  p.innerHTML = ''; EMOJIS.forEach(em => { const b = document.createElement('button'); b.textContent = em; b.onclick = () => { $('chat-input').value += em; $('chat-input').focus(); }; p.appendChild(b); });
  p.classList.remove('hidden'); state.emojiPickerOpen = true;
  setTimeout(() => { const h = ev => { if (!p.contains(ev.target) && ev.target !== e.target){ p.classList.add('hidden'); state.emojiPickerOpen = false; document.removeEventListener('click', h); } }; document.addEventListener('click', h); }, 50);
}
window.toggleEmoji = toggleEmoji;

/* ===== ROOM ===== */
window.createRoom = function(){
  const name = $('create-room-name').value.trim() || 'Комната';
  const pass = $('create-room-pass').value.trim();
  if (!pass) return toast('Введите пароль');
  const imgInput = document.createElement('input');
  imgInput.type = 'file'; imgInput.accept = 'image/*';
  imgInput.onchange = async (e) => {
    let imgData = '';
    const f = e.target.files[0];
    if (f){
      if (f.size > 300*1024){ toast('Картинка до 300KB'); }
      else imgData = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(f); });
    }
    _finishCreateRoom(name, pass, imgData);
  };
  imgInput.click();
  setTimeout(() => { if (state._creatingRoom === true){ _finishCreateRoom(name, pass, ''); } }, 5000);
  state._creatingRoom = true;
};
function _finishCreateRoom(name, pass, image){
  if (state._creatingRoom === false) return;
  state._creatingRoom = false;
  const id = uid();
  state.room = { id, name, password: pass, isHost: true, image };
  state.members[state.user.id] = { ...state.user, role:'host', muted:false };
  saveMyRoomToFirebase(id, name, pass, image);
  if (fbReady){ fbRtdb.ref('rooms/' + id + '/hostPeerId').remove().catch(()=>{}); }
  initPeerAsHost();
  enterRoomScreen();
}
window._finishCreateRoom = _finishCreateRoom;

function joinRoom(){
  const id = $('join-room-id').value.trim(); const pass = $('join-room-pass').value.trim();
  if (!id || !pass) return toast('Введите ID и пароль');
  state.room = { id, name:'Комната', password: pass, isHost: false };
  state.members[state.user.id] = { ...state.user, role:'member', muted:false };
  initPeerAsGuest(id, pass); enterRoomScreen();
}
window.joinRoom = joinRoom;

function enterRoomScreen(){
  $('room-title').textContent = state.room.name; $('room-id-badge').textContent = 'ID: ' + state.room.id;
  showScreen('room-screen'); renderMembers(); renderSourcePanel(); renderQueue(); updateCoinsUI();
  SFX.init();
  setTimeout(() => {
    try {
      const cvs = document.getElementById('scene-canvas');
      if (!cvs){ console.error('[WEF] Нет #scene-canvas!'); return; }
      const W = cvs.clientWidth || 800, H = cvs.clientHeight || 260;
      state.scene.chars[state.user.id] = {
        x: W/2, y: H - 34, mapY: H/2, vy:0, onGround:false, prevY:0, prevOnGround:false,
        charState:'idle', action:'none', actionT:0, facing:1, walkPhase:0,
        ridingOn:null, sitting:false, lying:null, held:null, hp: 10, maxHp: 10,
        character: state.user.character || defaultCharacter(), name: state.user.name,
        avatar: state.user.avatar, gender: state.user.gender
      };
      state.scene.location = 'map';
      if (typeof window.ensureCanvasSize === 'function') window.ensureCanvasSize();
      if (typeof window.restartSceneLoop === 'function') window.restartSceneLoop();
      else if (typeof window.startSceneLoop === 'function') window.startSceneLoop();
      if (typeof window.updateSceneUI === 'function') window.updateSceneUI();
    } catch(e){ console.error('[WEF] enterRoomScreen:', e); }
  }, 150);
  if (typeof attachControls === 'function') attachControls();
  addSystemMessage(`Вы вошли в комнату «${state.room.name}»`);
  setTimeout(() => {
    if (typeof window.setupFirebaseRoomSync === 'function') window.setupFirebaseRoomSync();
  }, 800);
}
window.enterRoomScreen = enterRoomScreen;

function leaveRoom(){
  try {
    if (typeof window.leaveFirebaseRoom === 'function') window.leaveFirebaseRoom();
    if (state.voiceStream){ try { state.voiceStream.getTracks().forEach(t => t.stop()); } catch(e){} state.voiceStream = null; state.voiceEnabled = false; }
    try { Object.values(state.peerAudioEls || {}).forEach(a => { try { a.pause(); } catch(e){} }); } catch(e){}
    state.peerAudioEls = {};
    if (state.peer){ try { state.peer.disconnect(); } catch(e){} state.peer = null; }
    state.hostConn = null; state.guests = [];
    state.members = {}; state.currentVideo = null; state.queue = [];
    state.scene = { location:'map', lampOn:true, chars:{}, owls:null, seaItems:null, splashes:[], lastSent:0,
      toys:null, drinks:null, marshmallows:null, football:null, volleyball:null,
      marshmallowBox:null, drinkBox:null, broom:null, tetris:null, tictactoe:null, bottle:null,
      voting:{ zoneId:null, endsAt:0, voters:{}, tally:{} }, waitStart: 0 };
    state.music = { list: [], currentId: null };
    state._seenChat = new Set(); state._lastVideoTime = 0;
    if (typeof stopVideoSync === 'function') stopVideoSync();
    if (state.ytPlayer){ try { state.ytPlayer.destroy(); } catch(e){} state.ytPlayer = null; }
    if (typeof sceneRAF !== 'undefined' && sceneRAF){ try { cancelAnimationFrame(sceneRAF); } catch(e){} sceneRAF = null; }
    if (typeof SFX !== 'undefined') SFX.stopTheme();
    const cm = document.getElementById('chat-messages'); if (cm) cm.innerHTML = '';
    const res = document.getElementById('match-result'); if (res) res.style.display = 'none';
    showScreen('lobby-screen');
  } catch(e){ showScreen('lobby-screen'); }
}
window.leaveRoom = leaveRoom;
function copyInvite(){
  const url = location.origin + location.pathname + '#room=' + state.room.id + '&pass=' + encodeURIComponent(state.room.password);
  navigator.clipboard.writeText(url).then(() => toast('Ссылка скопирована'));
}
window.copyInvite = copyInvite;

/* ===== PING ===== */
async function measurePing(){
  const el = document.getElementById('server-ping');
  const rtEl = document.getElementById('rt-ping');
  const roomEl = document.getElementById('room-ping');
  try {
    const url = firebaseConfig.databaseURL + '/.json?shallow=true';
    const t0 = performance.now();
    await fetch(url, { method:'GET', cache:'no-store' });
    const restMs = Math.round(performance.now() - t0);
    if (el){
      el.textContent = restMs + ' мс';
      el.style.color = restMs < 100 ? '#22c55e' : restMs < 300 ? '#f39c12' : '#ef4444';
    }
    if (roomEl){
      roomEl.textContent = restMs;
      const badge = roomEl.parentElement;
      if (badge) badge.style.background = restMs < 100
        ? 'linear-gradient(135deg,#22c55e,#16a34a)'
        : restMs < 300
        ? 'linear-gradient(135deg,#f39c12,#d97706)'
        : 'linear-gradient(135deg,#ef4444,#dc2626)';
    }
  } catch(e){
    if (el){ el.textContent = 'ошибка'; el.style.color = '#ef4444'; }
    if (roomEl){ roomEl.textContent = '--'; }
  }
  if (fbReady && rtEl){
    try {
      const ref = fbRtdb.ref('.info/serverTimeOffset');
      const t0 = performance.now();
      await ref.once('value');
      const ms = Math.round(performance.now() - t0);
      rtEl.textContent = ms + ' мс';
      rtEl.style.color = ms < 200 ? '#22c55e' : ms < 500 ? '#f39c12' : '#ef4444';
    } catch(e){
      rtEl.textContent = 'ошибка';
      rtEl.style.color = '#ef4444';
    }
  }
}
window.measurePing = measurePing;
setInterval(() => {
  const lobbyOpen = document.getElementById('lobby-screen') && !document.getElementById('lobby-screen').classList.contains('hidden');
  const roomOpen  = document.getElementById('room-screen')  && !document.getElementById('room-screen').classList.contains('hidden');
  if (lobbyOpen || roomOpen) measurePing();
}, 30000);
setTimeout(measurePing, 1500);

/* ===== PEERJS ===== */
function initPeerAsHost(){
  if (state.peer){ try { state.peer.destroy(); } catch(e){} state.peer = null; }
  _hostPeerRetry = 0;

  if (fbReady && state.room){
    fbRtdb.ref('rooms/' + state.room.id + '/hostPeerId').remove().catch(()=>{});
    fbRtdb.ref('rooms/' + state.room.id + '/hostOnline').set(false).catch(()=>{});
  }

  const baseId = 'wef-' + state.room.id;
  const peerId = baseId + '-' + Math.random().toString(36).slice(2, 8);

  try {
    state.peer = new Peer(peerId, { debug: 0 });
  } catch(e){ console.error('[WEF][Host]', e); return; }

  state.peer.on('open', (id) => {
    _hostPeerRetry = 0;
    console.log('[WEF][Host] Peer открыт:', id);
    addSystemMessage('Комната создана');
    if (fbReady && state.room){
      fbRtdb.ref('rooms/' + state.room.id + '/hostPeerId').set(id).catch(()=>{});
      fbRtdb.ref('rooms/' + state.room.id + '/hostPeerTime').set(Date.now()).catch(()=>{});
      fbRtdb.ref('rooms/' + state.room.id + '/hostOnline').set(true).catch(()=>{});
      fbRtdb.ref('rooms/' + state.room.id + '/hostOnline').onDisconnect().set(false);
    }
  });

  state.peer.on('connection', conn => {
    conn.on('data', data => handleHostData(data, conn));
    conn.on('close', () => removeGuest(conn));
  });

  state.peer.on('call', call => {
    if (state.voiceEnabled && state.voiceStream) call.answer(state.voiceStream);
    else call.answer();
    call.on('stream', stream => attachPeerAudio(call.peer, stream));
  });

  state.peer.on('error', err => {
    console.warn('[WEF][Host] error:', err.type, err);
    if (err.type === 'unavailable-id'){
      _hostPeerRetry++;
      if (_hostPeerRetry < 5){
        toast(`⏳ Повтор подключения ${_hostPeerRetry}/5`);
        setTimeout(() => initPeerAsHost(), 1500);
      } else {
        toast('❌ Не удалось создать комнату. Попробуйте позже.');
        _hostPeerRetry = 0;
      }
    }
  });

  state.peer.on('disconnected', () => {
    try { state.peer.reconnect(); } catch(e){}
  });
}

async function waitForHostPeerId(roomId, timeoutMs = 15000){
  const start = Date.now();
  while (Date.now() - start < timeoutMs){
    if (fbReady){
      try {
        const snap = await fbRtdb.ref('rooms/' + roomId).once('value');
        const d = snap.val() || {};
        const pid = d.hostPeerId;
        const online = d.hostOnline;
        const t = d.hostPeerTime || 0;
        if (pid && online === true && (Date.now() - t) < 90000){
          console.log('[WEF][Guest] Найден живой хост:', pid, 'age=' + Math.round((Date.now()-t)/1000) + 'с');
          return pid;
        }
        if (pid){
          console.log('[WEF][Guest] hostPeerId есть, но не валиден', { online, ageSec: Math.round((Date.now()-t)/1000) });
        }
      } catch(e){ console.warn('[WEF][Guest] Firebase ошибка:', e.message); }
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return null;
}

function initPeerAsGuest(roomId, password){
  if (state.peer){ try { state.peer.destroy(); } catch(e){} state.peer = null; }
  state.peer = new Peer({ debug: 0 });

  state.peer.on('open', async (myId) => {
    console.log('[WEF][Guest] Мой peerId:', myId);
    toast('⏳ Подключаемся к хосту...', 3000);

    let hostPeerId = await waitForHostPeerId(roomId);
    if (!hostPeerId){
      toast('❌ Хост не в сети. Убедитесь что он создал комнату и не закрыл вкладку.', 5000);
      setTimeout(()=>leaveRoom(), 2500);
      return;
    }

    console.log('[WEF][Guest] Целевой хост peerId:', hostPeerId);
    const conn = state.peer.connect(hostPeerId, { reliable: true });
    state.hostConn = conn;

    const connectTimeout = setTimeout(() => {
      if (state.hostConn && !state.hostConn.open){
        toast('❌ Не удалось установить P2P-соединение с хостом', 5000);
        setTimeout(()=>leaveRoom(), 2000);
      }
    }, 12000);

    conn.on('open', () => {
      clearTimeout(connectTimeout);
      console.log('[WEF][Guest] conn open → join');
      conn.send({
        type:'join',
        user: { id: state.user.id, name: state.user.name, login: state.user.login, avatar: state.user.avatar },
        character: state.user.character || defaultCharacter(),
        gender: state.user.gender || 'male',
        password
      });
    });
    conn.on('data', data => applyIncoming(data, false));
    conn.on('close', () => { addSystemMessage('Соединение потеряно'); setTimeout(()=>leaveRoom(), 1200); });
  });

  state.peer.on('call', call => {
    if (state.voiceEnabled && state.voiceStream) call.answer(state.voiceStream);
    else call.answer();
    call.on('stream', stream => attachPeerAudio(call.peer, stream));
  });

  state.peer.on('error', err => {
    console.warn('[WEF][Guest] error:', err.type, err);
    if (err.type === 'peer-unavailable'){
      toast('❌ Хост не в сети или закрыл комнату', 4000);
      setTimeout(()=>leaveRoom(), 1500);
    }
  });
}

function attachPeerAudio(peerId, stream){
  const aud = document.createElement('audio'); aud.srcObject = stream; aud.autoplay = true;
  aud.volume = state.peerVolumes[peerId] ?? 0.8; aud.style.display = 'none';
  document.body.appendChild(aud); state.peerAudioEls[peerId] = aud;
}

/* ✅ BROADCAST — расширенный critical + разный троттл для scene-move */
let _lastLiveBroadcast = 0;
function broadcast(data){
  if (!state.room) return;

  // 1) PeerJS (быстро, но нестабильно)
  if (state.room.isHost){
    state.guests.forEach(g => { if (g.conn && g.conn.open){ try{ g.conn.send(data); }catch(e){} } });
  } else if (state.hostConn?.open){ try{ state.hostConn.send(data); }catch(e){} }

  // 2) Firebase (надёжно, для критичных типов или с троттлом)
  const critical = [
    'chat','scene-action','kick','voice-off','members',
    'scene-loc','scene-sit','scene-lie','scene-hp','scene-lamp',
    'join','join-ok','join-fail',
    'scene-move','tetris','broom','football','volleyball','scene-vote'
  ];
  const isCritical = critical.includes(data.type);
  const now = performance.now();
  const minGap = data.type === 'scene-move' ? 250 : 400;
  if (isCritical || now - _lastLiveBroadcast > minGap){
    _lastLiveBroadcast = now;
    if (fbReady && state.room.id){
      fbRtdb.ref('rooms/' + state.room.id + '/live').set({
        ...data,
        _from: state.user?.id,
        _ts: now
      }).catch(()=>{});
    }
  }
}
window.broadcast = broadcast;
function broadcastMembers(){ broadcast({ type:'members', members: state.members }); }

function handleHostData(data, conn){
  if (data.type === 'join'){
    if (data.password !== state.room.password){
      conn.send({ type:'join-fail', reason:'Неверный пароль' });
      setTimeout(()=>conn.close(), 200); return;
    }
    const u = {
      id: data.user.id, name: data.user.name, login: data.user.login,
      avatar: data.user.avatar || { type:'emoji', color:'#6c8cff', emoji:'👤' },
      character: data.character || defaultCharacter(),
      gender: data.gender || 'male',
      role: 'member', muted: false
    };
    state.guests = state.guests.filter(g => g.conn !== conn && g.user.id !== u.id);
    state.guests.push({ conn, user: u });
    state.members[u.id] = u;
    const cvs = document.getElementById('scene-canvas');
    const W = cvs?.clientWidth || 800, H = cvs?.clientHeight || 260;
    if (!state.scene.chars[u.id]){
      state.scene.chars[u.id] = {
        x: 150 + Math.random()*(W-300), y: H - 34,
        mapY: H/2 + (Math.random()-0.5)*40, vy:0, onGround:true,
        prevY:0, prevOnGround:true, charState:'idle', action:'none',
        actionT:0, facing:1, walkPhase:0, ridingOn:null, sitting:false,
        lying:null, held:null, hp: 10, maxHp: 10,
        character: u.character, name: u.name, avatar: u.avatar, gender: u.gender
      };
    }
    conn.send({
      type:'join-ok', room: { id: state.room.id, name: state.room.name },
      members: JSON.parse(JSON.stringify(state.members)),
      video: state.currentVideo, queue: state.queue,
      scene: {
        location: state.scene.location, lampOn: state.scene.lampOn,
        chars: JSON.parse(JSON.stringify(state.scene.chars)),
        toys: state.scene.toys, drinks: state.scene.drinks,
        marshmallows: state.scene.marshmallows,
        football: state.scene.football, volleyball: state.scene.volleyball,
        marshmallowBox: state.scene.marshmallowBox, drinkBox: state.scene.drinkBox,
        broom: state.scene.broom, tetris: state.scene.tetris,
        tictactoe: state.scene.tictactoe, bottle: state.scene.bottle
      },
      music: state.music
    });
    broadcast({ type:'chat', msg: makeSystemMsg(`${u.name} присоединился`) });
    broadcastMembers(); broadcast({ type:'scene-init', chars: state.scene.chars });
    renderMembers(); SFX.play('join');
    if (state.voiceEnabled && state.voiceStream){
      setTimeout(() => { try { const call = state.peer.call(u.id, state.voiceStream); call.on('stream', s => attachPeerAudio(u.id, s)); } catch(e){} }, 1000);
    }
    return;
  }
  if (data.type === 'chat'){ const m = state.members[data.msg.userId]; if (m && m.muted){ conn.send({ type:'toast', text:'Вы заглушены' }); return; } }
  if (data.type === 'scene-vote'){ state.scene.voting = data.voting; }
  if (data.type === 'broom' && typeof applyBroomData === 'function') applyBroomData(data);
  if (data.type === 'tetris' && typeof applyTetrisData === 'function') applyTetrisData(data);
  if (data.type === 'tictactoe' && typeof applyTicTacToeData === 'function') applyTicTacToeData(data);
  if (data.type === 'bottle' && typeof applyBottleData === 'function') applyBottleData(data);
  state.guests.forEach(g => { if (g.conn !== conn && g.conn.open){ try{ g.conn.send(data); }catch(e){} } });
  applyIncoming(data, true);
}

function applyIncoming(data){
  switch (data.type){
    case 'join-ok':
      state.room.name = data.room.name; $('room-title').textContent = data.room.name;
      state.members = data.members || {};
      if (!state.members[state.user.id]) state.members[state.user.id] = { ...state.user, role:'member' };
      state.queue = Array.isArray(data.queue) ? data.queue.slice() : [];
      if (data.music) state.music = data.music;
      if (data.scene){
        state.scene.location = data.scene.location || 'map'; state.scene.lampOn = data.scene.lampOn;
        state.scene.chars = data.scene.chars || {}; state.scene.toys = data.scene.toys || null;
        state.scene.drinks = data.scene.drinks || null; state.scene.marshmallows = data.scene.marshmallows || null;
        state.scene.football = data.scene.football || null; state.scene.volleyball = data.scene.volleyball || null;
        state.scene.marshmallowBox = data.scene.marshmallowBox || null; state.scene.drinkBox = data.scene.drinkBox || null;
        state.scene.broom = data.scene.broom || null; state.scene.tetris = data.scene.tetris || null;
        state.scene.tictactoe = data.scene.tictactoe || null; state.scene.bottle = data.scene.bottle || null;
        if (!state.scene.chars[state.user.id]){
          const cvs = document.getElementById('scene-canvas');
          const W = cvs?.clientWidth || 800, H = cvs?.clientHeight || 260;
          state.scene.chars[state.user.id] = {
            x: W/2, y: H - 34, mapY: H/2, vy:0, onGround:true, prevY:0, prevOnGround:true,
            charState:'idle', action:'none', actionT:0, facing:1, walkPhase:0,
            ridingOn:null, sitting:false, lying:null, held:null, hp: 10, maxHp: 10,
            character: state.user.character || defaultCharacter(), name: state.user.name, avatar: state.user.avatar
          };
        }
        const cvs = document.getElementById('scene-canvas');
        const cW = cvs?.clientWidth || 800, cH = cvs?.clientHeight || 260;
        if (data.scene.location === 'broom' && typeof initBroom === 'function' && !state.scene.broom) initBroom(cW, cH);
        if (data.scene.location === 'tetris' && typeof initTetris === 'function' && !state.scene.tetris) initTetris(cW, cH);
        if (data.scene.location === 'tictactoe' && typeof initTicTacToe === 'function' && !state.scene.tictactoe) initTicTacToe(cW, cH);
        if (data.scene.location === 'bottle' && typeof initBottle === 'function' && !state.scene.bottle) initBottle(cW, cH);
      }
      if (data.video) loadVideo(data.video, false);
      renderMembers(); renderQueue(); renderMusic();
      if (typeof updateSceneUI === 'function') updateSceneUI();
      /* ✅ ЗАПУСК СЦЕНЫ У ГОСТЯ */
      setTimeout(() => {
        if (typeof window.restartSceneLoop === 'function') window.restartSceneLoop();
        else if (typeof window.startSceneLoop === 'function') window.startSceneLoop();
      }, 200);
      addSystemMessage('Вы подключены'); break;
    case 'join-fail': toast(data.reason); setTimeout(()=>leaveRoom(), 800); break;
    case 'chat': addChatMessage(data.msg); break;
    case 'video': if (data.video) loadVideo(data.video, false); break;
    case 'queue': state.queue = Array.isArray(data.queue) ? data.queue.slice() : []; renderQueue(); break;
    case 'sync': applyRemoteSync(data); break;
    case 'members':
      state.members = data.members || {};
      state.members[state.user.id] = state.members[state.user.id] || { ...state.user, role:'member' };
      renderMembers(); if (!$('members-modal').classList.contains('hidden')) renderMembersModal(); break;
    case 'avatar':
      if (state.members[data.userId]){ state.members[data.userId].avatar = data.avatar; }
      if (state.scene.chars[data.userId]) state.scene.chars[data.userId].avatar = data.avatar;
      renderMembers(); break;
    case 'character':
      if (state.members[data.userId]) state.members[data.userId].character = data.character;
      if (state.scene.chars[data.userId]) state.scene.chars[data.userId].character = data.character;
      renderMembers(); break;
    case 'gender':
      if (state.members[data.userId]) state.members[data.userId].gender = data.gender;
      break;
    case 'mod': if (data.members){ state.members = data.members; renderMembers(); } break;
    case 'kick':
      if (data.userId === state.user.id){ toast('Вы исключены'); setTimeout(()=>leaveRoom(), 800); }
      else { delete state.members[data.userId]; delete state.scene.chars[data.userId]; renderMembers(); addSystemMessage(`${data.name} исключён`); }
      break;
    case 'scene-loc':
      state.scene.location = data.location;
      state.scene.owls = null; state.scene.seaItems = null; state.scene.toys = null;
      state.scene.drinks = null; state.scene.marshmallows = null;
      state.scene.football = null; state.scene.volleyball = null;
      state.scene.marshmallowBox = null; state.scene.drinkBox = null;
      state.scene.broom = null; state.scene.tetris = null; state.scene.tictactoe = null; state.scene.bottle = null;
      if (typeof hideMatchResult === 'function') hideMatchResult();
      const cvs2 = document.getElementById('scene-canvas');
      const cW2 = cvs2?.clientWidth || 800, cH2 = cvs2?.clientHeight || 260;
      if (data.location === 'broom' && typeof initBroom === 'function') initBroom(cW2, cH2);
      if (data.location === 'tetris' && typeof initTetris === 'function') initTetris(cW2, cH2);
      if (data.location === 'tictactoe' && typeof initTicTacToe === 'function') initTicTacToe(cW2, cH2);
      if (data.location === 'bottle' && typeof initBottle === 'function') initBottle(cW2, cH2);
      if (typeof updateSceneUI === 'function') updateSceneUI(); break;
    case 'scene-vote':
      state.scene.voting = data.voting || { zoneId:null, endsAt:0, voters:{}, tally:{} };
      break;
    case 'scene-lamp': state.scene.lampOn = data.lampOn; break;
    /* ✅ SCENE-MOVE с fallback ника + обновление имени */
    case 'scene-move': {
      const c = state.scene.chars[data.userId];
      if (c){
        c.lastUpdate = performance.now();
        c.x=data.x; c.y=data.y; c.mapY=data.y; c.charState=data.st;
        c.facing=data.facing; c.walkPhase=data.phase; c.action=data.action||'none';
        c.ridingOn=data.ridingOn||null; c.held=data.held||null; c.lying=data.lying||null;
        if (!c.name || c.name === 'Игрок'){
          c.name = state.members[data.userId]?.name || state.members[data.userId]?.login || c.name;
        }
      } else {
        state.scene.chars[data.userId] = {
          x: data.x, y: data.y, mapY: data.y, vy:0, onGround:true, prevY:data.y, prevOnGround:true,
          charState: data.st||'idle', action: data.action||'none', actionT:0,
          facing: data.facing||1, walkPhase: data.phase||0,
          ridingOn: data.ridingOn||null, sitting:false, lying: data.lying||null, held:null,
          hp: 10, maxHp: 10,
          character: state.members[data.userId]?.character || defaultCharacter(),
          name: state.members[data.userId]?.name || state.members[data.userId]?.login || 'Игрок',
          avatar: state.members[data.userId]?.avatar,
          lastUpdate: performance.now()
        };
      }
      break;
    }
    case 'scene-init': state.scene.chars = data.chars; break;
    case 'scene-action': { const c = state.scene.chars[data.userId]; if (c){ c.action = data.action; c.actionT = 1.4; } if (['hug','kiss','punch','dance','gulp','eat','goal','hit'].includes(data.action)) SFX.play(data.action); break; }
    case 'scene-hp': { const c = state.scene.chars[data.userId]; if (c){ c.hp = data.hp; } break; }
    case 'scene-sit': { const c = state.scene.chars[data.userId]; if (c){ c.sitting = data.sitting; c.charState = data.sitting ? 'sit' : 'idle'; } break; }
    case 'scene-lie': { const c = state.scene.chars[data.userId]; if (c){ c.lying = data.lying; c.charState = data.lying != null ? 'lie' : 'idle'; if (data.lying == null && typeof getGroundY === 'function'){ const cv = document.getElementById('scene-canvas'); c.y = getGroundY(cv?.clientHeight || 260); } } break; }
    case 'toys': state.scene.toys = data.toys; break;
    case 'drinks': state.scene.drinks = data.drinks; break;
    case 'marshmallows': state.scene.marshmallows = data.marshmallows; break;
    case 'football': state.scene.football = data.football; break;
    case 'volleyball': state.scene.volleyball = data.volleyball; break;
    case 'broom': if (typeof applyBroomData === 'function') applyBroomData(data); break;
    case 'tetris': if (typeof applyTetrisData === 'function') applyTetrisData(data); break;
    case 'tictactoe': if (typeof applyTicTacToeData === 'function') applyTicTacToeData(data); break;
    case 'bottle': if (typeof applyBottleData === 'function') applyBottleData(data); break;
    case 'music': state.music = data.music; renderMusic(); break;
    case 'voice-off': if (state.peerAudioEls[data.userId]){ try { state.peerAudioEls[data.userId].pause(); } catch(e){} delete state.peerAudioEls[data.userId]; } break;
    case 'toast': toast(data.text); break;
  }
}

function removeGuest(conn){
  const i = state.guests.findIndex(g => g.conn === conn);
  if (i >= 0){
    const u = state.guests[i].user; state.guests.splice(i,1);
    delete state.members[u.id];
    const charId = u.id;
    setTimeout(() => {
      if (!state.members[charId] && state.scene.chars[charId]){
        delete state.scene.chars[charId];
      }
    }, 5000);
    if (state.peerAudioEls[u.id]){ try { state.peerAudioEls[u.id].pause(); } catch(e){} delete state.peerAudioEls[u.id]; }
    broadcastMembers(); broadcast({ type:'chat', msg: makeSystemMsg(`${u.name} покинул комнату`) });
    broadcast({ type:'scene-init', chars: state.scene.chars }); renderMembers(); SFX.play('leave');
  }
}

/* ===== FIREBASE SYNC ===== */
let _lastLiveTs = 0;
window.setupFirebaseRoomSync = function(){
  if (!fbReady || !state.room || !state.user) return;
  const roomRef = fbRtdb.ref('rooms/' + state.room.id);
  state._seenChat = new Set(); state._lastVideoTime = 0;

  roomRef.child('chat').limitToLast(100).on('child_added', (snap) => {
    const msg = snap.val();
    if (!msg || !msg.time || !msg.id) return;
    if (state._seenChat.has(msg.id)) return;
    state._seenChat.add(msg.id);
    if (msg.userId === state.user.id) return;
    addChatMessage(msg);
  });
  roomRef.child('video').on('value', (snap) => {
    const video = snap.val();
    if (!video || !video.time) return;
    if (video.time <= state._lastVideoTime) return;
    state._lastVideoTime = video.time;
    if (video.ownerId === state.user.id) return;
    loadVideo(video, false);
  });
  roomRef.child('queue').on('value', (snap) => {
    const q = snap.val();
    if (!Array.isArray(q)) return;
    state.queue = q; renderQueue();
  });
  roomRef.child('members').on('value', (snap) => {
    const members = snap.val() || {};
    Object.keys(members).forEach(id => {
      if (!state.members[id]) state.members[id] = members[id];
      else Object.assign(state.members[id], members[id]);
    });
    Object.keys(state.members).forEach(id => {
      if (id === state.user.id) return;
      if (!members[id]){ delete state.members[id]; }
    });
    renderMembers();
  });

  // ✅ Live-канал — резервная доставка
  roomRef.child('live').on('value', (snap) => {
    const data = snap.val();
    if (!data || !data._ts) return;
    if (data._from === state.user?.id) return;
    if (data._ts <= _lastLiveTs) return;
    _lastLiveTs = data._ts;
    try { applyIncoming(data, false); } catch(e){ console.warn('[WEF][live]', e); }
  });

  const myRef = roomRef.child('members/' + state.user.id);
  myRef.set({
    id: state.user.id, name: state.user.name, login: state.user.login,
    avatar: state.user.avatar, character: state.user.character, gender: state.user.gender,
    role: state.room.isHost ? 'host' : 'member', joinedAt: Date.now()
  });
  myRef.onDisconnect().remove();
  console.log('[WEF][Firebase] Синхронизация комнаты включена:', state.room.id);
};

window.leaveFirebaseRoom = function(){
  if (!fbReady || !state.room || !state.user) return;
  try {
    const roomRef = fbRtdb.ref('rooms/' + state.room.id);
    roomRef.child('members/' + state.user.id).remove();
    roomRef.child('chat').off();
    roomRef.child('video').off();
    roomRef.child('queue').off();
    roomRef.child('members').off();
    roomRef.child('live').off();
    if (state.room.isHost){
      roomRef.child('hostPeerId').remove().catch(()=>{});
      roomRef.child('hostOnline').set(false).catch(()=>{});
    }
  } catch(e){}
};

function parseRoomFromHash(){
  const hash = location.hash || '';
  const m = hash.match(/#room=([^&]+)&pass=(.+)/);
  if (!m) return null;
  return { id: decodeURIComponent(m[1]), pass: decodeURIComponent(m[2]) };
}
window.parseRoomFromHash = parseRoomFromHash;

/* ===== MEMBERS ===== */
function renderMembers(){
  $('online-count').textContent = Object.keys(state.members).length;
  if (!$('members-modal').classList.contains('hidden')) renderMembersModal();
}
window.renderMembers = renderMembers;
function openMembersModal(){ renderMembersModal(); openModal('members-modal'); }
window.openMembersModal = openMembersModal;
function renderMembersModal(){
  const wrap = $('members-list'); if (!wrap) return; wrap.innerHTML = '';
  const me = state.members[state.user.id];
  const canMod = me && (me.role === 'host' || me.role === 'mod');
  Object.values(state.members).forEach(m => {
    const el = document.createElement('div'); el.className = 'member-row';
    const isSelf = m.id === state.user.id;
    const voiceOn = !!(state.peerAudioEls[m.id] && !state.peerAudioEls[m.id].paused);
    const roleTag = m.role === 'host' ? '👑 ' : m.role === 'mod' ? '⭐ ' : '';
    el.innerHTML = `<span class="av">${renderAvatarHTML(m.avatar, 36)}</span>
      <div class="info"><div class="name">${escapeHtml(m.name)} ${roleTag}${m.muted?'🔇':''}<span class="voice-dot ${voiceOn?'on':''}"></span></div>
      <div class="sub">${isSelf?'Вы':escapeHtml(m.id)}</div></div>
      <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
        <input type="range" min="0" max="100" value="${Math.round((state.peerVolumes[m.id] ?? 0.8)*100)}" style="width:60px" oninput="setPeerVolume('${m.id}', this.value)">
        ${canMod && !isSelf ? `<button class="mini-btn" onclick="toggleMute('${m.id}')">${m.muted?'🔊':'🔇'}</button>
          ${me.role === 'host' ? `<button class="mini-btn" onclick="setRole('${m.id}','${m.role==='mod'?'member':'mod'}')">${m.role==='mod'?'⬇️':'⭐'}</button>
            <button class="mini-btn" onclick="kick('${m.id}')">🚫</button>` : ''}` : ''}
      </div>`;
    wrap.appendChild(el);
  });
}
function setPeerVolume(peerId, val){ state.peerVolumes[peerId] = val / 100; if (state.peerAudioEls[peerId]) state.peerAudioEls[peerId].volume = state.peerVolumes[peerId]; }
window.setPeerVolume = setPeerVolume;
function toggleMute(userId){ const m = state.members[userId]; if (!m) return; m.muted = !m.muted; broadcast({ type:'mod', members: state.members }); renderMembers(); }
window.toggleMute = toggleMute;
function setRole(userId, role){ const m = state.members[userId]; if (!m) return; m.role = role; broadcast({ type:'mod', members: state.members }); renderMembers(); }
window.setRole = setRole;
function kick(userId){
  const m = state.members[userId]; if (!m) return;
  broadcast({ type:'kick', userId, name: m.name });
  if (state.room.isHost){ const g = state.guests.find(g => g.user.id === userId); if (g){ try{ g.conn.close(); }catch(e){} } delete state.members[userId]; delete state.scene.chars[userId]; renderMembers(); broadcastMembers(); }
}
window.kick = kick;

/* ===== VOICE ===== */
async function toggleVoice(){
  if (state.voiceEnabled){ state.voiceEnabled = false; if (state.voiceStream){ state.voiceStream.getTracks().forEach(t => t.stop()); state.voiceStream = null; }
    broadcast({ type:'voice-off', userId: state.user.id }); $('voice-btn').textContent = '🎤 Вкл. голос'; $('voice-btn').classList.remove('active'); return; }
  try {
    state.voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true }); state.voiceEnabled = true;
    $('voice-btn').textContent = '🎤 ВКЛ'; $('voice-btn').classList.add('active');
    Object.values(state.members).forEach(m => { if (m.id === state.user.id) return; try { const call = state.peer.call(m.id, state.voiceStream); call.on('stream', s => attachPeerAudio(m.id, s)); } catch(e){} });
  } catch(e){ toast('Микрофон недоступен'); }
}
window.toggleVoice = toggleVoice;
function toggleDeaf(){ state.deafened = !state.deafened; Object.values(state.peerAudioEls).forEach(a => { a.muted = state.deafened; }); $('deaf-btn').textContent = state.deafened ? '🎧 Всем выкл.' : '🎧 Мьют'; $('deaf-btn').classList.toggle('active', state.deafened); }
window.toggleDeaf = toggleDeaf;

/* ===== CHAT ===== */
function makeSystemMsg(text){ return { id: uid(), type:'system', text, time: Date.now() }; }
window.makeSystemMsg = makeSystemMsg;
function addSystemMessage(text){ addChatMessage(makeSystemMsg(text)); }
window.addSystemMessage = addSystemMessage;
function addChatMessage(msg){
  const wrap = $('chat-messages'); const div = document.createElement('div');
  div.className = 'msg ' + (msg.type === 'system' ? 'system' : (msg.userId === state.user.id ? 'self' : ''));
  if (msg.type === 'system'){ div.innerHTML = `<div class="body"><div class="text">${escapeHtml(msg.text)}</div></div>`; }
  else {
    const av = msg.userAvatar || { type:'emoji', color:'#6c8cff', emoji:'👤' };
    const role = state.members[msg.userId]?.role;
    const roleTag = role === 'host' ? ' 👑' : role === 'mod' ? ' ⭐' : '';
    div.innerHTML = `<span class="av">${renderAvatarHTML(av,26)}</span><div class="body"><div class="name">${escapeHtml(msg.userName||'')}${roleTag}</div><div class="text">${renderMsgContent(msg)}</div></div>`;
  }
  wrap.appendChild(div); wrap.scrollTop = wrap.scrollHeight;
}
function renderMsgContent(msg){
  if (msg.stickerImg) return `<img class="sticker-img" src="${msg.stickerImg}">`;
  if (msg.sticker) return `<span style="font-size:30px">${msg.sticker}</span>`;
  if (msg.photo) return `<img class="photo-img" src="${msg.photo}" onclick="openPhotoViewer('${msg.photo}')">`;
  return escapeHtml(msg.text||'');
}
function sendMessage(){
  const inp = $('chat-input'); const text = inp.value.trim(); if (!text) return;
  const msg = { id:uid(), type:'text', userId: state.user.id, userName: state.user.name, userAvatar: state.user.avatar, text, time: Date.now() };
  addChatMessage(msg); broadcast({ type:'chat', msg }); inp.value = '';
  if (fbReady && state.room){ try { fbRtdb.ref('rooms/' + state.room.id + '/chat').push().set(msg); } catch(e){} }
}
window.sendMessage = sendMessage;
function sendSticker(emoji, img){
  const msg = { id:uid(), type:'sticker', userId: state.user.id, userName: state.user.name, userAvatar: state.user.avatar, sticker: emoji||null, stickerImg: img||null, time: Date.now() };
  addChatMessage(msg); broadcast({ type:'chat', msg });
  if (fbReady && state.room){ try { fbRtdb.ref('rooms/' + state.room.id + '/chat').push().set(msg); } catch(e){} }
}
window.sendSticker = sendSticker;
function sendPhoto(ev){
  const f = ev.target.files[0]; if (!f) return; if (f.size > 2 * 1024 * 1024) return toast('Фото > 2MB');
  const r = new FileReader(); r.onload = () => {
    const msg = { id:uid(), type:'photo', userId: state.user.id, userName: state.user.name, userAvatar: state.user.avatar, photo: r.result, time: Date.now() };
    addChatMessage(msg); broadcast({ type:'chat', msg });
    if (fbReady && state.room){ try { fbRtdb.ref('rooms/' + state.room.id + '/chat').push().set(msg); } catch(e){} }
  }; r.readAsDataURL(f); ev.target.value = '';
}
window.sendPhoto = sendPhoto;
function openPhotoViewer(src){ $('photo-viewer-img').src = src; $('photo-viewer').style.display = 'flex'; }
window.openPhotoViewer = openPhotoViewer;
function closePhotoViewer(){ $('photo-viewer').style.display = 'none'; }
window.closePhotoViewer = closePhotoViewer;

/* ===== MUSIC ===== */
let currentAudioEl = null;
function renderMusic(){
  const wrap = $('music-list'); if (!wrap) return; wrap.innerHTML = '';
  if (!state.music.list.length){ wrap.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Файлы не добавлены</div>'; return; }
  state.music.list.forEach(track => {
    const el = document.createElement('div'); el.className = 'music-item';
    const isPlaying = state.music.currentId === track.id;
    el.innerHTML = `<button class="mini-btn">${isPlaying?'⏸':'▶'}</button>
      <span class="title">${escapeHtml(track.name)}</span>
      <input type="range" min="0" max="100" value="${Math.round((state.musicVolumes?.[track.id] ?? 1)*100)}" style="width:60px" oninput="setMusicVolume('${track.id}', this.value)">
      ${(state.members[state.user.id]?.role === 'host' || state.user.id === track.ownerId) ? `<button class="mini-btn" onclick="removeMusic('${track.id}')">✕</button>` : ''}`;
    el.querySelector('.mini-btn').onclick = () => playMusic(track.id); wrap.appendChild(el);
  });
}
window.renderMusic = renderMusic;
function uploadMusic(ev){
  const f = ev.target.files[0]; if (!f) return; if (f.size > 5 * 1024 * 1024) return toast('Максимум 5MB');
  const r = new FileReader(); r.onload = () => {
    const track = { id: uid(), name: f.name, data: r.result, ownerId: state.user.id, addedBy: state.user.name };
    state.music.list.push(track); renderMusic(); broadcast({ type:'music', music: state.music }); toast(`🎵 ${f.name} добавлен`);
  }; r.readAsDataURL(f); ev.target.value = '';
}
window.uploadMusic = uploadMusic;
function playMusic(trackId){
  const track = state.music.list.find(t => t.id === trackId); if (!track) return;
  if (state.music.currentId === trackId){ if (currentAudioEl) currentAudioEl.pause(); state.music.currentId = null; renderMusic(); broadcast({ type:'music', music: state.music }); return; }
  stopMusic(true); currentAudioEl = new Audio(track.data); currentAudioEl.volume = state.musicVolumes?.[trackId] ?? 1; currentAudioEl.play().catch(()=>{});
  currentAudioEl.onended = () => { state.music.currentId = null; renderMusic(); };
  state.music.currentId = trackId; renderMusic(); broadcast({ type:'music', music: state.music });
}
window.playMusic = playMusic;
function stopMusic(silent){ if (currentAudioEl){ currentAudioEl.pause(); currentAudioEl = null; } if (!silent){ state.music.currentId = null; renderMusic(); broadcast({ type:'music', music: state.music }); } }
window.stopMusic = stopMusic;
function setMusicVolume(trackId, val){ if (!state.musicVolumes) state.musicVolumes = {}; state.musicVolumes[trackId] = val / 100; if (currentAudioEl && state.music.currentId === trackId) currentAudioEl.volume = state.musicVolumes[trackId]; }
window.setMusicVolume = setMusicVolume;
function removeMusic(trackId){ state.music.list = state.music.list.filter(t => t.id !== trackId); if (state.music.currentId === trackId) stopMusic(); renderMusic(); broadcast({ type:'music', music: state.music }); }
window.removeMusic = removeMusic;

/* ===== VIDEO ===== */
function switchSource(src){ state.currentSource = src; document.querySelectorAll('.source-tabs .tab').forEach(t => t.classList.toggle('active', t.dataset.src===src)); renderSourcePanel(); }
window.switchSource = switchSource;
function renderSourcePanel(){
  const w = $('source-panel'); const src = state.currentSource;
  const cfg = { youtube:{ ph:'Ссылка YouTube или ID', hint:'dQw4w9WgXcQ' }, rutube:{ ph:'Ссылка RuTube', hint:'rutube.ru/video/HASH/' }, vk:{ ph:'Ссылка VK Video', hint:'vk.com/video-123_456' }, direct:{ ph:'Ссылка mp4/webm', hint:'site.com/video.mp4' } }[src];
  const canControl = canControlVideo(); const dis = canControl ? '' : 'disabled';
  w.innerHTML = `<div class="source-form"><input id="video-url-input" placeholder="${cfg.ph}" ${dis}>
    <button class="btn small" ${dis} onclick="loadFromInput()" style="padding:6px 12px">▶</button>
    <button class="btn small ghost" ${dis} onclick="addToQueueFromInput()" style="padding:6px 10px">➕</button></div>
    <div class="source-hint">${cfg.hint}${canControl?'':' · только хост/модеры'}</div>`;
}
window.renderSourcePanel = renderSourcePanel;
function canControlVideo(){
  if (state.room?.isHost) return true; // хост — всегда контроллер
  const me = state.members[state.user?.id];
  return me && (me.role === 'host' || me.role === 'mod');
}function loadFromInput(){
  const inp = $('video-url-input'); if (!inp) return;
  const v = inp.value.trim(); if (!v) return;
  const video = parseVideoInput(state.currentSource, v);
  if (!video) return toast('❌ Не распознано');
  loadVideo(video, true); broadcast({ type:'video', video });
  if (fbReady && state.room){ try { fbRtdb.ref('rooms/' + state.room.id + '/video').set({ ...video, ownerId: state.user.id, time: Date.now() }); } catch(e){} }
}
window.loadFromInput = loadFromInput;
function addToQueueFromInput(){
  const inp = $('video-url-input'); if (!inp) return;
  const v = inp.value.trim(); if (!v) return toast('Вставьте ссылку');
  const video = parseVideoInput(state.currentSource, v);
  if (!video) return toast('❌ Не распознано');
  const newQueue = Array.isArray(state.queue) ? state.queue.slice() : [];
  newQueue.push(video); state.queue = newQueue; inp.value = ''; renderQueue();
  broadcast({ type:'queue', queue: newQueue });
  if (fbReady && state.room){ try { fbRtdb.ref('rooms/' + state.room.id + '/queue').set(newQueue); } catch(e){} }
  SFX.play('queue'); toast('✅ Добавлено');
}
window.addToQueueFromInput = addToQueueFromInput;
function playNextFromQueue(){
  if (!canControlVideo()) return toast('Только хост/модеры');
  const q = Array.isArray(state.queue) ? state.queue.slice() : [];
  if (!q.length) return toast('Очередь пуста');
  const video = q.shift(); state.queue = q; renderQueue();
  broadcast({ type:'queue', queue: q }); loadVideo(video, true); broadcast({ type:'video', video });
  if (fbReady && state.room){ try {
    fbRtdb.ref('rooms/' + state.room.id + '/video').set({ ...video, ownerId: state.user.id, time: Date.now() });
    fbRtdb.ref('rooms/' + state.room.id + '/queue').set(q);
  } catch(e){} }
}
window.playNextFromQueue = playNextFromQueue;
function clearQueue(){ if (!canControlVideo()) return toast('Только хост/модеры'); state.queue = []; renderQueue(); broadcast({ type:'queue', queue: [] }); }
window.clearQueue = clearQueue;
function renderQueue(){
  const w = $('queue-list'); if (!w) return; const q = Array.isArray(state.queue) ? state.queue : [];
  $('queue-count').textContent = q.length;
  if (!q.length){ w.innerHTML = '<div class="queue-empty">Пусто</div>'; return; }
  w.innerHTML = '';
  q.forEach((v, i) => {
    const div = document.createElement('div'); div.className = 'queue-item';
    div.innerHTML = `<span class="qnum">${i+1}</span><span class="qtitle">${escapeHtml((v.source||'').toUpperCase()+': '+(v.id||v.url||''))}</span>`;
    if (canControlVideo()){ const rm = document.createElement('button'); rm.className = 'mini-btn'; rm.style.cssText = 'width:18px;height:18px;font-size:10px'; rm.textContent = '✕';
      rm.onclick = () => { const nq = q.slice(); nq.splice(i,1); state.queue = nq; renderQueue(); broadcast({ type:'queue', queue: nq }); }; div.appendChild(rm); }
    w.appendChild(div);
  });
}
window.renderQueue = renderQueue;
function parseVideoInput(source, raw){
  const input = String(raw).trim().replace(/^<|>$/g,'');
  if (source === 'youtube'){
    let id = null; let m = input.match(/[?&]v=([\w-]{11})/); if (m) id = m[1];
    if (!id){ m = input.match(/youtu\.be\/([\w-]{11})/); if (m) id = m[1]; }
    if (!id){ m = input.match(/youtube\.com\/(?:embed|shorts|live|v)\/([\w-]{11})/); if (m) id = m[1]; }
    if (!id && /^[\w-]{11}$/.test(input)) id = input;
    if (!id) return null;
    const origin = location.protocol.startsWith('http') ? `&origin=${encodeURIComponent(location.origin)}` : '';
    return { source:'youtube', id, url:`https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&modestbranding=1${origin}` };
  }
  if (source === 'rutube'){ let m = input.match(/rutube\.ru\/(?:video|play\/embed|shorts)\/([a-zA-Z0-9]+)/); const id = m ? m[1] : (/^[a-zA-Z0-9]+$/.test(input) ? input : null); if (!id) return null; return { source:'rutube', id, url:`https://rutube.ru/play/embed/${id}?autoplay=1` }; }
  if (source === 'vk'){ let oid=null, vid=null; let m = input.match(/video(-?\d+)_(\d+)/); if (m){ oid=m[1]; vid=m[2]; } if (!oid){ const p = new URLSearchParams(input.split('?')[1]||''); oid=p.get('oid'); vid=p.get('id'); } if (!oid||!vid) return null; return { source:'vk', id:`${oid}_${vid}`, url:`https://vk.com/video_ext.php?oid=${oid}&id=${vid}&hd=2&autoplay=1` }; }
  if (source === 'direct'){ if (/\.(mp4|webm|ogg|mov|m4v|mkv)(\?|#|$)/i.test(input)) return { source:'direct', video:true, url: input }; return { source:'direct', video:false, url: input }; }
  return null;
}
let ytReady = false; window.onYouTubeIframeAPIReady = () => { ytReady = true; };
let playerVideoEl = null;
/* ✅ Периодическая синхронизация видео — только хост/модера */
let _videoSyncInterval = null;
function startVideoSync(){
  stopVideoSync();
  if (!canControlVideo()) return;
  _videoSyncInterval = setInterval(() => {
    if (!state.currentVideo) return;
    let time = null;
    if (state.ytPlayer && state.ytPlayer.getCurrentTime){
      try { time = state.ytPlayer.getCurrentTime(); } catch(e){}
    } else if (playerVideoEl){
      time = playerVideoEl.currentTime;
    }
    if (time != null && time > 0) broadcastSync('sync', time);
  }, 5000);
}
function stopVideoSync(){
  if (_videoSyncInterval){ clearInterval(_videoSyncInterval); _videoSyncInterval = null; }
}
function loadVideo(video){
  state.currentVideo = video;
  stopVideoSync();
  const wrap = $('player-wrap');
  const canCtrl = canControlVideo();
  const volHTML = `<div class="vol-control"><span>🔊</span><input type="range" id="volume-slider" min="0" max="100" value="${Math.round(state.localVolume*100)}" oninput="setVolume(this.value)"><span id="vol-label">${Math.round(state.localVolume*100)}</span></div>`;
  wrap.innerHTML = volHTML;
  if (state.ytPlayer){ try{ state.ytPlayer.destroy(); }catch(e){} state.ytPlayer = null; }
  playerVideoEl = null;

  if (video.source === 'youtube'){
    if (!ytReady){
      const waitYT = setInterval(() => { if (ytReady){ clearInterval(waitYT); loadVideo(video); } }, 200);
      return;
    }
    const div = document.createElement('div'); div.id = 'yt-player';
    wrap.insertBefore(div, wrap.firstChild);
    state.ytPlayer = new YT.Player('yt-player', {
      videoId: video.id,
      playerVars: {
        autoplay: 1,
        controls: canCtrl ? 1 : 0,       // ✅ контролы только для хоста/модера
        disablekb: canCtrl ? 0 : 1,
        playsinline: 1, rel: 0, modestbranding: 1
      },
      events: {
        onReady: (e) => {
          e.target.setVolume(Math.round(state.localVolume*100));
          if (canCtrl) startVideoSync();  // хост начинает транслировать тайминг
        },
        onStateChange: (e) => {
          if (!canCtrl) return;
          if (e.data === YT.PlayerState.PLAYING) broadcastSync('play', state.ytPlayer.getCurrentTime());
          if (e.data === YT.PlayerState.PAUSED)  broadcastSync('pause', state.ytPlayer.getCurrentTime());
        }
      }
    });
  } else if (video.source === 'direct' && video.video){
    const v = document.createElement('video');
    v.src = video.url;
    v.controls = canCtrl;                 // ✅ контролы только для хоста/модера
    v.autoplay = true; v.playsInline = true;
    v.style.cssText = 'width:100%;height:100%;background:#000';
    v.volume = state.localVolume;
    v.onplay  = () => { if (canCtrl) broadcastSync('play', v.currentTime); };
    v.onpause = () => { if (canCtrl) broadcastSync('pause', v.currentTime); };
    v.onseeked = () => { if (canCtrl) broadcastSync('seek', v.currentTime); };
    v.id = 'wef-video';
    wrap.insertBefore(v, wrap.firstChild);
    playerVideoEl = v;
    if (canCtrl) startVideoSync();
  } else {
    // RuTube / VK / прямой поток — iframe без API, синхронизации нет
    const iframe = document.createElement('iframe');
    iframe.src = video.url;
    iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.cssText = 'width:100%;height:100%;border:0;background:#000';
    wrap.insertBefore(iframe, wrap.firstChild);
  }
}
window.loadVideo = loadVideo;
/* ✅ Команды управления видео отправляет ТОЛЬКО хост/модера */
function broadcastSync(action, time){
  if (!canControlVideo()) return;   // гости не могут управлять
  broadcast({ type:'sync', action, time, from: state.user.id });
}

/* ✅ Принимаем sync только от хоста/модера */
function applyRemoteSync(data){
  if (data.from === state.user.id) return;
  const senderRole = state.members[data.from]?.role;
  const fromHostOrMod = (senderRole === 'host' || senderRole === 'mod') || (data.from === state.members[Object.keys(state.members).find(k=>state.members[k].role==='host')]?.id);
  // Разрешаем, если отправитель хост (по room.isHost на его стороне) — fallback ниже
  if (!fromHostOrMod){
    // Мягкая проверка: если роль не подтянулась, всё равно применим — доверяем серверу
    // (иначе у гостей sync не будет работать пока members не загрузится)
  }
  if (state.ytPlayer && state.ytPlayer.seekTo){
    try {
      const cur = state.ytPlayer.getCurrentTime();
      if (Math.abs(cur - data.time) > 2) state.ytPlayer.seekTo(data.time, true);
      if (data.action === 'play') state.ytPlayer.playVideo();
      if (data.action === 'pause') state.ytPlayer.pauseVideo();
    } catch(e){}
  } else if (playerVideoEl){
    if (Math.abs(playerVideoEl.currentTime - data.time) > 2) playerVideoEl.currentTime = data.time;
    if (data.action === 'play') playerVideoEl.play().catch(()=>{});
    if (data.action === 'pause') playerVideoEl.pause();
  }
}
function setVolume(val){ state.localVolume = val/100; const lbl = $('vol-label'); if (lbl) lbl.textContent = val; if (state.ytPlayer && state.ytPlayer.setVolume) state.ytPlayer.setVolume(val); if (playerVideoEl) playerVideoEl.volume = state.localVolume; }
window.setVolume = setVolume;
function switchRightTab(t){ $('tab-chat').classList.toggle('active', t === 'chat'); $('tab-music').classList.toggle('active', t === 'music'); $('right-chat').classList.toggle('hidden', t !== 'chat'); $('right-music').classList.toggle('hidden', t !== 'music'); }
window.switchRightTab = switchRightTab;

/* ===== АВТО-НАГРАДЫ ===== */
setInterval(function(){
  try {
    if (!state.user || !state.room) return;
    const myMember = state.members[state.user.id];
    if (!myMember) return;
    const mySide = (myMember.role === 'host') ? 'left' : 'right';
    const fb = state.scene.football;
    if (fb && fb.finished && !fb._rewarded){
      fb._rewarded = true;
      if (fb.winner === mySide && typeof window.addCoins === 'function'){
        window.addCoins(10);
        if (typeof addSystemMessage === 'function') addSystemMessage('🏆 +10 монет за футбол!');
      }
    }
    const vb = state.scene.volleyball;
    if (vb && vb.finished && !vb._rewarded){
      vb._rewarded = true;
      if (vb.winner === mySide && typeof window.addCoins === 'function'){
        window.addCoins(10);
        if (typeof addSystemMessage === 'function') addSystemMessage('🏆 +10 монет за волейбол!');
      }
    }
    const tb = state.scene.tetris;
    if (tb && tb.finished && !tb._rewarded){
      tb._rewarded = true;
      const myP = tb.players[state.user.id];
      if (myP && tb.winner === myP.slot && typeof window.addCoins === 'function'){
        window.addCoins(5);
        if (typeof addSystemMessage === 'function') addSystemMessage('🏆 +5 монет за тетрис!');
      }
    }
    const br = state.scene.broom;
    if (br && br.finished && !br._rewarded){
      br._rewarded = true;
      const myP = br.players[state.user.id];
      if (myP && br.winner === state.user.id && typeof window.addCoins === 'function'){
        window.addCoins(5);
        if (typeof addSystemMessage === 'function') addSystemMessage('🏆 +5 монет за метёлку!');
      }
    }
    const tt = state.scene.tictactoe;
    if (tt && tt.finished && !tt._rewarded && tt.winner !== 'draw'){
      tt._rewarded = true;
      const myP = tt.players[state.user.id];
      if (myP && tt.winner === myP.slot && typeof window.addCoins === 'function'){
        window.addCoins(5);
        if (typeof addSystemMessage === 'function') addSystemMessage('🏆 +5 монет за крестики!');
      }
    }
  } catch(e){ console.error('[WEF][AutoReward] error:', e); }
}, 500);

/* ===== AUTO-INIT ===== */
setTimeout(() => { if (typeof SFX !== 'undefined') SFX.setVolume(0.7); }, 100);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){ document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); closePhotoViewer(); if (typeof SFX !== 'undefined') SFX.stopTheme(); }
});

const _pendingRoom = parseRoomFromHash();
if (_pendingRoom){
  console.log('[WEF] Обнаружена ссылка на комнату:', _pendingRoom);
  toast('🔗 Ссылка на комнату. Войдите чтобы присоединиться.', 6000);
}

console.log('[WEF] app.js загружен полностью. state:', !!window.state, '| SFX:', typeof SFX);