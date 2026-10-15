/* ============================================================
   SCENE.JS — часть 1/2
============================================================ */
const GRAVITY = 1500, JUMP_VELOCITY = -520, MOVE_SPEED = 130;
const SCENE_SCALE = 0.75;
const canvas = document.getElementById('scene-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
window.canvas = canvas; window.ctx = ctx;
const _REWARDS = { volleyball:10, football:10, tetris:5, broom:5, tictactoe:5 };
window.REWARDS = _REWARDS;
let sceneRAF = null, sceneLast = 0;

const SPECIES = {cat:{},dog:{},fox:{},bear:{},bunny:{},penguin:{},panda:{},frog:{},koala:{},tiger:{},lion:{},owl:{}};
const FACE_COLORS = ['#f39c12','#e67e22','#c98a53','#8b6f47','#6b4423','#95a5a6','#2c3e50','#27ae60','#ecf0f1','#ec4899','#9b59b6','#3498db','#e74c3c','#1abc9c','#f1c40f','#7f8c8d'];
const HATS = ['none','cap','crown','wizard','beanie','flower'];
const CLOTHES_COLORS = ['#e74c3c','#3498db','#9b59b6','#2ecc71','#f39c12','#ecf0f1','#34495e','#e91e63'];
const SP_PRESETS = [
  { id:'green', hat:'earflap', hatColor:'#3a7d44', trimColor:'#4caf50', jacket:'#e67e22', jacketTrim:'#27ae60', gloves:'#27ae60', skin:'#f5d5b8', hair:'#3d2817', pants:'#1a1a1a' },
  { id:'blue', hat:'beanie', hatColor:'#2c3e50', trimColor:'#e74c3c', jacket:'#c0392b', jacketTrim:'#8b1f14', gloves:'#c0392b', skin:'#f5d5b8', hair:'#3d2817', pants:'#1a1a1a' },
  { id:'orange', hat:'hood', hatColor:'#e67e22', trimColor:'#c0611a', jacket:'#e67e22', jacketTrim:'#a05010', gloves:'#c0611a', skin:'#f5d5b8', hair:'#6b4423', pants:'#5a3a2a' },
  { id:'cyan', hat:'beanie', hatColor:'#85c1e9', trimColor:'#f1c40f', jacket:'#e74c3c', jacketTrim:'#c0392b', gloves:'#f1c40f', skin:'#f5d5b8', hair:'#f1c40f', pants:'#5a3a2a' }
];
const PONY_PRESETS = [
  { id:'rainbow', name:'Rainbow', body:'#5dade2', mane:'#e74c3c', mane2:'#f1c40f', mane3:'#e67e22', eye:'#2c3e50', cutie:'#e74c3c' },
  { id:'rarity', name:'Rarity', body:'#ecf0f1', mane:'#8e44ad', mane2:'#6c3483', mane3:'#b19cd9', eye:'#2c3e50', cutie:'#8e44ad' },
  { id:'flutters', name:'Fluttershy', body:'#f7e07a', mane:'#f9a4c6', mane2:'#f5b7d3', mane3:'#fadadd', eye:'#16a085', cutie:'#f9a4c6' },
  { id:'twilight', name:'Twilight', body:'#a569bd', mane:'#5b2c6f', mane2:'#e84393', mane3:'#8e44ad', eye:'#2c3e50', cutie:'#e84393' },
  { id:'pinkie', name:'Pinkie', body:'#f48fb1', mane:'#d81b60', mane2:'#f06292', mane3:'#ec407a', eye:'#2c3e50', cutie:'#f06292' },
  { id:'applejack', name:'Applejack', body:'#f39c12', mane:'#d35400', mane2:'#e67e22', mane3:'#f5b041', eye:'#27ae60', cutie:'#e74c3c' }
];
const WINX_PRESETS = [
  { id:'bloom', name:'Bloom', hair:'#e67e22', dress:'#3498db', wings:'#5dade2', skin:'#f5d5b8', eye:'#3498db' },
  { id:'musa', name:'Musa', hair:'#2c3e50', dress:'#e91e63', wings:'#f48fb1', skin:'#f5d5b8', eye:'#8e44ad' },
  { id:'stella', name:'Stella', hair:'#f1c40f', dress:'#f39c12', wings:'#f9e79f', skin:'#f5d5b8', eye:'#3498db' },
  { id:'tecna', name:'Tecna', hair:'#8e44ad', dress:'#2ecc71', wings:'#a3e4d7', skin:'#f5d5b8', eye:'#27ae60' },
  { id:'flora', name:'Flora', hair:'#8b4513', dress:'#27ae60', wings:'#7dcea0', skin:'#f5d5b8', eye:'#27ae60' },
  { id:'aisha', name:'Aisha', hair:'#6d4c41', dress:'#1abc9c', wings:'#a3e4d7', skin:'#e8b48a', eye:'#2c3e50' }
];
function shade(hex, amt){
  let c = String(hex).replace('#','');
  if (c.length === 3) c = c.split('').map(x=>x+x).join('');
  const r = Math.max(0,Math.min(255,parseInt(c.substr(0,2),16)+amt));
  const g = Math.max(0,Math.min(255,parseInt(c.substr(2,2),16)+amt));
  const b = Math.max(0,Math.min(255,parseInt(c.substr(4,2),16)+amt));
  return '#' + [r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function getSPPreset(id){ return SP_PRESETS.find(p=>p.id===id)||SP_PRESETS[0]; }
function getPonyPreset(id){ return PONY_PRESETS.find(p=>p.id===id)||PONY_PRESETS[0]; }
function getWinxPreset(id){ return WINX_PRESETS.find(p=>p.id===id)||WINX_PRESETS[0]; }

const FACE_CFG = {
  cat:{base:'#f39c12',ear:'tri',earColor:'#e67e22',earInner:'#f5b041',noseColor:'#e67e22'},
  dog:{base:'#c98a53',ear:'flop',earColor:'#8b5a2b',snout:'#e8c99b',noseColor:'#3d2817'},
  fox:{base:'#e67e22',ear:'tri',earColor:'#d35400',earInner:'#f5b041',snout:'#f8c471',noseColor:'#3d2817'},
  bear:{base:'#8b6f47',ear:'round',earColor:'#6b4f2a',snout:'#d4a373',noseColor:'#3d2817'},
  bunny:{base:'#ecf0f1',ear:'long',earInner:'#f5b7b1',noseColor:'#e91e63'},
  penguin:{base:'#2c3e50',ear:'none',snout:'#ecf0f1',beak:true},
  panda:{base:'#ecf0f1',ear:'round',earColor:'#1a1a1a',markings:'panda',noseColor:'#3d2817'},
  frog:{base:'#27ae60',ear:'none',markings:'frog'},
  koala:{base:'#95a5a6',ear:'round',earColor:'#7f8c8d',noseColor:'#34495e'},
  tiger:{base:'#f39c12',ear:'round',earColor:'#e67e22',markings:'tiger',snout:'#f8c471',noseColor:'#e67e22'},
  lion:{base:'#f39c12',ear:'round',earColor:'#e67e22',mane:true,snout:'#f8c471',noseColor:'#3d2817'},
  owl:{base:'#8b6f47',ear:'tri',earColor:'#6b4a2a',earInner:'#a08660',beak:true,bigEyes:true}
};
function drawAnimalFace(c, species, cx, cy, R, skin){
  const cfg = FACE_CFG[species] || FACE_CFG.cat;
  const base = skin || cfg.base;
  if (cfg.mane){ c.fillStyle = '#a0522d'; c.beginPath();
    for (let i=0;i<28;i++){ const a=(i/28)*Math.PI*2-Math.PI/2; const rr=R*(i%2===0?1.4:1.15); const xx=cx+Math.cos(a)*rr, yy=cy+Math.sin(a)*rr; if (i===0) c.moveTo(xx,yy); else c.lineTo(xx,yy); } c.closePath(); c.fill(); }
  if (cfg.ear==='tri'){ c.fillStyle=cfg.earColor;
    c.beginPath(); c.moveTo(cx-R*0.85,cy-R*0.3); c.lineTo(cx-R*0.55,cy-R*1.35); c.lineTo(cx-R*0.1,cy-R*0.55); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx+R*0.85,cy-R*0.3); c.lineTo(cx+R*0.55,cy-R*1.35); c.lineTo(cx+R*0.1,cy-R*0.55); c.closePath(); c.fill();
  } else if (cfg.ear==='flop'){ c.fillStyle=cfg.earColor;
    c.beginPath(); c.ellipse(cx-R*0.75,cy-R*0.05,R*0.32,R*0.7,0.15,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(cx+R*0.75,cy-R*0.05,R*0.32,R*0.7,-0.15,0,Math.PI*2); c.fill();
  } else if (cfg.ear==='round'){ c.fillStyle=cfg.earColor||'#000';
    c.beginPath(); c.arc(cx-R*0.7,cy-R*0.7,R*0.35,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(cx+R*0.7,cy-R*0.7,R*0.35,0,Math.PI*2); c.fill();
  } else if (cfg.ear==='long'){ c.fillStyle=base;
    c.beginPath(); c.ellipse(cx-R*0.4,cy-R*1.25,R*0.2,R*0.65,-0.12,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(cx+R*0.4,cy-R*1.25,R*0.2,R*0.65,0.12,0,Math.PI*2); c.fill(); }
  c.fillStyle=base; c.beginPath(); c.arc(cx,cy,R,0,Math.PI*2); c.fill();
  if (cfg.markings==='panda'){ c.fillStyle='#1a1a1a';
    c.beginPath(); c.ellipse(cx-R*0.45,cy-R*0.1,R*0.3,R*0.4,0.15,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(cx+R*0.45,cy-R*0.1,R*0.3,R*0.4,-0.15,0,Math.PI*2); c.fill(); }
  if (cfg.markings==='tiger'){ c.strokeStyle='#1a1a1a'; c.lineWidth=R*0.1;
    c.beginPath(); c.moveTo(cx-R*0.25,cy-R*0.95); c.lineTo(cx-R*0.2,cy-R*0.55); c.moveTo(cx+R*0.25,cy-R*0.95); c.lineTo(cx+R*0.2,cy-R*0.55); c.stroke(); }
  if (cfg.markings==='frog'){ c.fillStyle=base;
    c.beginPath(); c.arc(cx-R*0.55,cy-R*0.75,R*0.35,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(cx+R*0.55,cy-R*0.75,R*0.35,0,Math.PI*2); c.fill();
    c.fillStyle='#fff'; c.beginPath(); c.arc(cx-R*0.55,cy-R*0.75,R*0.25,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(cx+R*0.55,cy-R*0.75,R*0.25,0,Math.PI*2); c.fill();
    c.fillStyle='#000'; c.beginPath(); c.arc(cx-R*0.55,cy-R*0.72,R*0.13,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(cx+R*0.55,cy-R*0.72,R*0.13,0,Math.PI*2); c.fill();
    c.strokeStyle='#1a1a1a'; c.lineWidth=R*0.08; c.beginPath(); c.arc(cx,cy+R*0.25,R*0.45,0.15*Math.PI,0.85*Math.PI); c.stroke(); return; }
  if (cfg.snout){ c.fillStyle=cfg.snout; c.beginPath(); c.ellipse(cx,cy+R*0.25,R*0.5,R*0.32,0,0,Math.PI*2); c.fill(); }
  const eyeY=cy-R*0.15, eyeDX=R*0.42, eyeR=cfg.bigEyes?R*0.28:R*0.22, pupilR=cfg.bigEyes?R*0.14:R*0.11;
  c.fillStyle='#fff'; c.beginPath(); c.arc(cx-eyeDX,eyeY,eyeR,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(cx+eyeDX,eyeY,eyeR,0,Math.PI*2); c.fill();
  c.fillStyle='#000'; c.beginPath(); c.arc(cx-eyeDX,eyeY,pupilR,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(cx+eyeDX,eyeY,pupilR,0,Math.PI*2); c.fill();
  if (cfg.beak){ c.fillStyle='#f39c12'; c.beginPath(); c.moveTo(cx-R*0.15,cy+R*0.15); c.lineTo(cx+R*0.15,cy+R*0.15); c.lineTo(cx,cy+R*0.48); c.closePath(); c.fill(); return; }
  if (cfg.noseColor){ c.fillStyle=cfg.noseColor; c.beginPath(); c.ellipse(cx,cy+R*0.18,R*0.13,R*0.1,0,0,Math.PI*2); c.fill(); }
  c.strokeStyle='#1a1a1a'; c.lineWidth=R*0.06;
  c.beginPath(); c.moveTo(cx,cy+R*0.28); c.lineTo(cx,cy+R*0.38); c.moveTo(cx-R*0.18,cy+R*0.48); c.quadraticCurveTo(cx,cy+R*0.36,cx+R*0.18,cy+R*0.48); c.stroke();
}
function drawHat(c, hat, cx, cy, R){
  c.save();
  if (hat==='cap'){ c.fillStyle='#e74c3c';
    c.beginPath(); c.arc(cx,cy-R*0.05,R*1.05,Math.PI*1.05,Math.PI*1.95); c.fill();
    c.beginPath(); c.ellipse(cx,cy-R*0.15,R*1.02,R*0.55,0,Math.PI,0); c.fill();
    c.fillStyle='#c0392b'; c.beginPath(); c.ellipse(cx+R*0.85,cy+R*0.05,R*0.72,R*0.2,-0.1,0,Math.PI*2); c.fill();
    c.fillStyle='#fff'; c.beginPath(); c.arc(cx,cy-R*0.55,R*0.13,0,Math.PI*2); c.fill();
  } else if (hat==='crown'){ c.fillStyle='#f1c40f'; c.beginPath();
    c.moveTo(cx-R*1.05,cy+R*0.2); c.lineTo(cx-R*1.05,cy-R*0.2); c.lineTo(cx-R*0.85,cy-R*0.95); c.lineTo(cx-R*0.55,cy-R*0.3);
    c.lineTo(cx-R*0.28,cy-R*0.95); c.lineTo(cx,cy-R*0.35); c.lineTo(cx+R*0.28,cy-R*0.95); c.lineTo(cx+R*0.55,cy-R*0.3);
    c.lineTo(cx+R*0.85,cy-R*0.95); c.lineTo(cx+R*1.05,cy-R*0.2); c.lineTo(cx+R*1.05,cy+R*0.2); c.closePath(); c.fill();
  } else if (hat==='wizard'){ c.fillStyle='#6b21a8'; c.beginPath(); c.ellipse(cx,cy-R*0.05,R*1.3,R*0.35,0,0,Math.PI*2); c.fill();
    c.fillStyle='#8b5cf6'; c.beginPath(); c.moveTo(cx-R*0.8,cy-R*0.15); c.quadraticCurveTo(cx-R*0.3,cy-R*2.4,cx+R*0.55,cy-R*2.5); c.quadraticCurveTo(cx+R*0.35,cy-R*1.1,cx+R*0.8,cy-R*0.15); c.closePath(); c.fill();
  } else if (hat==='beanie'){ c.fillStyle='#27ae60'; c.beginPath(); c.arc(cx,cy,R*1.1,Math.PI,0); c.fill();
    c.fillStyle='#229954'; c.fillRect(cx-R*1.1,cy-R*0.12,R*2.2,R*0.35);
    c.fillStyle='#ecf0f1'; c.beginPath(); c.arc(cx,cy-R*0.95,R*0.33,0,Math.PI*2); c.fill();
  } else if (hat==='flower'){ c.fillStyle='#27ae60'; c.beginPath(); c.arc(cx,cy,R*1.05,Math.PI,0); c.fill();
    const colors=['#ec4899','#f97316','#facc15','#a855f7','#ef4444'];
    [-0.9,-0.5,0,0.5,0.9].forEach((p,i)=>{ const fx=cx+p*R*0.95, fy=cy-R*0.55+Math.abs(p)*R*0.35;
      for (let j=0;j<5;j++){ const a=(j/5)*Math.PI*2-Math.PI/2; c.fillStyle=colors[i]; c.beginPath(); c.ellipse(fx+Math.cos(a)*R*0.18,fy+Math.sin(a)*R*0.18,R*0.14,R*0.09,a,0,Math.PI*2); c.fill(); }
      c.fillStyle='#facc15'; c.beginPath(); c.arc(fx,fy,R*0.1,0,Math.PI*2); c.fill(); }); }
  c.restore();
}
function drawSPCharacter(c, presetId, opt){
  const {x,y,facing=1,walkPhase=0,charState='idle',action='none'}=opt;
  const P=getSPPreset(presetId); const PX=3.0;
  c.save(); c.translate(x,y); c.scale(SCENE_SCALE,SCENE_SCALE);
  if (facing===-1) c.scale(-1,1);
  const isLie=charState==='lie'; if (isLie){ c.rotate(-Math.PI/2); c.translate(-10,-10); }
  c.fillStyle='rgba(0,0,0,.32)'; if (!isLie){ c.beginPath(); c.ellipse(0,2,14,4,0,0,Math.PI*2); c.fill(); }
  const isSit=charState==='sit'; let legL=0,legR=0; const t=performance.now()/1000;
  if (charState==='walk'){ legL=Math.sin(walkPhase)*1.2; legR=-Math.sin(walkPhase)*1.2; }
  else if (charState==='jump'){ legL=-1; legR=-1; }
  if (action==='dance'){ legL=Math.sin(t*8)*1.5; legR=-Math.sin(t*8)*1.5; }
  if (!isSit){ c.fillStyle=P.pants; c.fillRect(-3.2*PX,(-3.2+legL)*PX,2.6*PX,3.4*PX); c.fillRect(0.6*PX,(-3.2+legR)*PX,2.6*PX,3.4*PX);
    c.fillStyle='#1a1a1a'; c.fillRect(-3.6*PX,(-1+legL)*PX,3.2*PX,1.2*PX); c.fillRect(0.4*PX,(-1+legR)*PX,3.2*PX,1.2*PX);
  } else { c.fillStyle=P.pants; c.fillRect(-3.2*PX,-1.8*PX,7*PX,2*PX); c.fillStyle='#1a1a1a'; c.fillRect(2*PX,-1.8*PX,3*PX,2*PX); }
  const bodyTop=isSit?-7:-9;
  c.fillStyle=P.jacket; c.fillRect(-4*PX,bodyTop*PX,8*PX,6*PX);
  c.fillStyle=P.jacketTrim; c.fillRect(-4*PX,(bodyTop+5)*PX,8*PX,1*PX); c.fillRect(-0.2*PX,bodyTop*PX,0.4*PX,6*PX);
  let armL=0,armR=0;
  if (charState==='walk'){ armL=-Math.sin(walkPhase)*1; armR=Math.sin(walkPhase)*1; }
  if (action==='hug'||action==='dance'){ armL=-1.5; armR=-1.5; }
  if (action==='dance'){ armL=-2+Math.sin(t*10)*0.8; armR=-2+Math.cos(t*10)*0.8; }
  if (action==='eat'){ armR=-2.5+Math.sin(t*8)*0.4; }
  if (action==='gulp'){ armR=-2.8+Math.abs(Math.sin(t*6))*0.3; }
  const armTop=bodyTop+0.5;
  c.fillStyle=P.jacket; c.fillRect(-5.5*PX,(armTop+armL)*PX,1.5*PX,3.5*PX); c.fillRect(4*PX,(armTop+armR)*PX,1.5*PX,3.5*PX);
  c.fillStyle=P.gloves; c.fillRect(-5.5*PX,(armTop+armL+3.5)*PX,1.5*PX,1.2*PX); c.fillRect(4*PX,(armTop+armR+3.5)*PX,1.5*PX,1.2*PX);
  const headTop=isSit?-14:-16.5; c.fillStyle=P.skin; c.fillRect(-4*PX,headTop*PX,8*PX,8*PX);
  if (P.hat==='beanie'){ c.fillStyle=P.hatColor; c.beginPath(); c.moveTo(-4.3*PX,headTop*PX); c.lineTo(-4.3*PX,(headTop-1.5)*PX); c.quadraticCurveTo(0,(headTop-4.5)*PX,4.3*PX,(headTop-1.5)*PX); c.lineTo(4.3*PX,headTop*PX); c.closePath(); c.fill();
    c.fillStyle=P.trimColor; c.fillRect(-4.3*PX,(headTop-0.8)*PX,8.6*PX,1.2*PX); c.beginPath(); c.arc(0,(headTop-4.5)*PX,1.4*PX,0,Math.PI*2); c.fill();
  } else if (P.hat==='earflap'){ c.fillStyle=P.hatColor; c.beginPath(); c.moveTo(-4.3*PX,headTop*PX); c.lineTo(-4.3*PX,(headTop-1.5)*PX); c.quadraticCurveTo(0,(headTop-4.2)*PX,4.3*PX,(headTop-1.5)*PX); c.lineTo(4.3*PX,headTop*PX); c.closePath(); c.fill();
    c.fillRect(-5.6*PX,(headTop-0.8)*PX,1.5*PX,4.5*PX); c.fillRect(4.1*PX,(headTop-0.8)*PX,1.5*PX,4.5*PX);
    c.fillStyle=P.trimColor; c.fillRect(-4.3*PX,(headTop-0.8)*PX,8.6*PX,1.1*PX);
  } else if (P.hat==='hood'){ c.fillStyle=P.hatColor; c.beginPath(); c.moveTo(-5.8*PX,(headTop+5)*PX); c.lineTo(-5.8*PX,(headTop-1.8)*PX); c.quadraticCurveTo(-5.8*PX,(headTop-5)*PX,0,(headTop-5)*PX); c.quadraticCurveTo(5.8*PX,(headTop-5)*PX,5.8*PX,(headTop-1.8)*PX); c.lineTo(5.8*PX,(headTop+5)*PX); c.closePath(); c.fill();
    c.fillStyle=P.hair; c.beginPath(); c.ellipse(0,(headTop-0.5)*PX,3.2*PX,1.4*PX,0,0,Math.PI); c.fill();
    c.fillStyle=P.skin; c.fillRect(-3.3*PX,(headTop-0.5)*PX,6.6*PX,5.5*PX);
    c.fillStyle=P.hair; c.beginPath(); c.ellipse(0,(headTop+0.3)*PX,3.4*PX,1*PX,0,0,Math.PI); c.fill(); }
  const faceTop=P.hat==='hood'?headTop+0.5:headTop+1; const eyeY=(faceTop+1.5)*PX;
  c.fillStyle='#1a1a1a'; c.fillRect(-2.2*PX,eyeY,0.9*PX,1.2*PX); c.fillRect(1.3*PX,eyeY,0.9*PX,1.2*PX);
  c.fillStyle='#3d2817'; c.fillRect(-0.5*PX,(faceTop+4)*PX,1*PX,0.35*PX);
  c.globalAlpha=0.4; c.fillStyle='#f39c12'; c.fillRect(-3.2*PX,(faceTop+3)*PX,1.2*PX,0.8*PX); c.fillRect(2*PX,(faceTop+3)*PX,1.2*PX,0.8*PX);
  c.globalAlpha=1; c.restore();
}
function drawPony(c, presetId, opt){
  const {x,y,facing=1,walkPhase=0,charState='idle',action='none'}=opt;
  const P=getPonyPreset(presetId);
  c.save(); c.translate(x,y); c.scale(SCENE_SCALE,SCENE_SCALE);
  if (facing===-1) c.scale(-1,1);
  const isLie=charState==='lie'; if (isLie){ c.rotate(-Math.PI/2); c.translate(-25,-10); }
  c.fillStyle='rgba(0,0,0,.32)'; if (!isLie){ c.beginPath(); c.ellipse(0,2,22,5,0,0,Math.PI*2); c.fill(); }
  const isSit=charState==='sit'; const bodyTop=isSit?-14:-22; const legY=isSit?-6:-12;
  let legL=0,legR=0; const t=performance.now()/1000;
  if (charState==='walk'){ legL=Math.sin(walkPhase)*3; legR=-Math.sin(walkPhase)*3; }
  if (action==='dance'){ legL=Math.sin(t*8)*4; legR=-Math.sin(t*8)*4; }
  const drawLeg=(lx,extra)=>{ c.fillStyle=shade(P.body,-25); c.fillRect(lx-3,legY+extra,6,14); c.fillStyle=P.mane; c.fillRect(lx-3,legY+extra+11,6,3); };
  if (!isSit){ drawLeg(-12,legL); drawLeg(-4,legR); drawLeg(4,legL); drawLeg(12,legR); }
  c.fillStyle=P.body; c.fillRect(-16,bodyTop,32,isSit?14:18); c.beginPath(); c.ellipse(-16,bodyTop+(isSit?7:9),6,isSit?7:9,0,0,Math.PI*2); c.fill();
  c.fillStyle=P.mane; const tailSway=Math.sin(t*3)*3; c.beginPath(); c.ellipse(-22,bodyTop+3+tailSway,6,14,0.3,0,Math.PI*2); c.fill();
  c.fillStyle=P.mane2; c.beginPath(); c.ellipse(-20,bodyTop+8+tailSway,5,10,0.3,0,Math.PI*2); c.fill();
  c.fillStyle=P.body; c.fillRect(10,bodyTop-10,10,16);
  const headX=20, headY=bodyTop-20;
  c.fillStyle=P.body; c.beginPath(); c.ellipse(headX,headY,12,11,0,0,Math.PI*2); c.fill();
  c.fillStyle=shade(P.body,30); c.beginPath(); c.ellipse(headX+6,headY+4,6,5,0,0,Math.PI*2); c.fill();
  c.fillStyle=P.body;
  c.beginPath(); c.moveTo(headX-8,headY-8); c.lineTo(headX-4,headY-18); c.lineTo(headX,headY-8); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(headX+2,headY-10); c.lineTo(headX+5,headY-18); c.lineTo(headX+9,headY-8); c.closePath(); c.fill();
  c.fillStyle=P.mane; c.beginPath(); c.moveTo(headX-10,headY-8); c.quadraticCurveTo(headX-12,headY-20,headX,headY-22); c.quadraticCurveTo(headX+6,headY-20,headX+10,headY-6); c.quadraticCurveTo(headX+4,headY-10,headX-4,headY-8); c.closePath(); c.fill();
  c.fillStyle=P.mane2; c.beginPath(); c.moveTo(headX+2,headY-20); c.quadraticCurveTo(headX+10,headY-22,headX+12,headY-12); c.quadraticCurveTo(headX+8,headY-14,headX+4,headY-14); c.closePath(); c.fill();
  const blink=Math.sin(performance.now()/1500)>0.95;
  if (!blink){ c.fillStyle='#fff'; c.beginPath(); c.ellipse(headX+2,headY,4,5,0,0,Math.PI*2); c.fill();
    c.fillStyle=P.eye; c.beginPath(); c.ellipse(headX+3,headY,2.5,3.5,0,0,Math.PI*2); c.fill();
    c.fillStyle='#000'; c.beginPath(); c.ellipse(headX+3,headY,1.3,2,0,0,Math.PI*2); c.fill(); }
  c.fillStyle=P.cutie; c.beginPath(); c.arc(-8,bodyTop+10,4,0,Math.PI*2); c.fill();
  c.restore();
}
function drawWinx(c, presetId, opt){
  const {x,y,facing=1,walkPhase=0,charState='idle',action='none'}=opt;
  const P=getWinxPreset(presetId);
  c.save(); c.translate(x,y); c.scale(SCENE_SCALE,SCENE_SCALE);
  if (facing===-1) c.scale(-1,1);
  const isLie=charState==='lie'; if (isLie){ c.rotate(-Math.PI/2); c.translate(-20,-20); }
  c.fillStyle='rgba(0,0,0,.32)'; if (!isLie){ c.beginPath(); c.ellipse(0,2,16,4,0,0,Math.PI*2); c.fill(); }
  const isSit=charState==='sit'; let legL=0, legR=0; const t=performance.now()/1000;
  if (charState==='walk'){ legL=Math.sin(walkPhase)*4; legR=-Math.sin(walkPhase)*4; }
  if (action==='dance'){ legL=Math.sin(t*8)*5; legR=-Math.sin(t*8)*5; }
  if (!isSit){ c.fillStyle=P.skin; c.fillRect(-7,-14+legL,5,14); c.fillRect(2,-14+legR,5,14);
    c.fillStyle=P.dress; c.fillRect(-8,-2+legL,7,3); c.fillRect(1,-2+legR,7,3);
  } else { c.fillStyle=P.skin; c.fillRect(-5,-6,12,6); }
  const flap=Math.sin(t*10)*3;
  c.fillStyle=P.wings; c.globalAlpha=0.85;
  c.beginPath(); c.ellipse(-11+flap,-28,7,14,-0.4,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(-14+flap,-22,5,9,-0.6,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(11-flap,-28,7,14,0.4,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(14-flap,-22,5,9,0.6,0,Math.PI*2); c.fill();
  c.globalAlpha=1;
  const bodyTop=isSit?-26:-32;
  c.fillStyle=P.dress; c.beginPath(); c.moveTo(-9,bodyTop+4); c.lineTo(9,bodyTop+4); c.lineTo(12,0); c.lineTo(-12,0); c.closePath(); c.fill(); c.fillRect(-7,bodyTop,14,8);
  let armL=0,armR=0;
  if (charState==='walk'){ armL=-Math.sin(walkPhase)*3; armR=Math.sin(walkPhase)*3; }
  if (action==='dance'){ armL=-8+Math.sin(t*10)*4; armR=-8+Math.cos(t*10)*4; }
  if (action==='eat'){ armR=-10+Math.sin(t*8)*3; }
  if (action==='gulp'){ armR=-12+Math.abs(Math.sin(t*6))*2; }
  if (action==='hug'){ armL=-5; armR=-5; }
  c.fillStyle=P.skin; c.fillRect(-11,bodyTop+2+armL,4,12); c.fillRect(7,bodyTop+2+armR,4,12);
  const headY=bodyTop-10;
  c.fillStyle=P.skin; c.beginPath(); c.arc(0,headY,10,0,Math.PI*2); c.fill();
  c.fillStyle=P.hair; c.beginPath(); c.ellipse(0,headY-2,13,13,0,0,Math.PI*2); c.fill();
  c.fillStyle=P.skin; c.beginPath(); c.arc(0,headY+1,8.5,0,Math.PI*2); c.fill();
  c.fillStyle=P.hair; c.beginPath(); c.moveTo(-9,headY-4); c.quadraticCurveTo(-6,headY-12,0,headY-12); c.quadraticCurveTo(6,headY-12,9,headY-4); c.quadraticCurveTo(6,headY-8,3,headY-6); c.quadraticCurveTo(0,headY-9,-3,headY-6); c.quadraticCurveTo(-6,headY-8,-9,headY-4); c.closePath(); c.fill();
  const eyeY=headY+1; const blink=Math.sin(performance.now()/1500)>0.95;
  if (!blink){ c.fillStyle='#fff'; c.beginPath(); c.ellipse(-3.5,eyeY,2.5,3,0,0,Math.PI*2); c.fill(); c.beginPath(); c.ellipse(3.5,eyeY,2.5,3,0,0,Math.PI*2); c.fill();
    c.fillStyle=P.eye; c.beginPath(); c.ellipse(-3.5,eyeY,1.7,2.2,0,0,Math.PI*2); c.fill(); c.beginPath(); c.ellipse(3.5,eyeY,1.7,2.2,0,0,Math.PI*2); c.fill();
    c.fillStyle='#000'; c.beginPath(); c.arc(-3.5,eyeY,0.8,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(3.5,eyeY,0.8,0,Math.PI*2); c.fill(); }
  c.strokeStyle='#c39bd3'; c.lineWidth=0.6; c.beginPath(); c.arc(0,eyeY+3,1.5,0.1,Math.PI-0.1); c.stroke();
  c.restore();
}
function drawAnimalChar(c, ch, opt){
  const {x,y,facing=1,walkPhase=0,charState='idle',action='none'}=opt;
  c.save(); c.translate(x,y); c.scale(SCENE_SCALE,SCENE_SCALE);
  if (facing===-1) c.scale(-1,1);
  const isLie=charState==='lie'; if (isLie){ c.rotate(-Math.PI/2); c.translate(-12,-22); }
  const bodyColor=ch.clothes||'#3498db';
  c.fillStyle='rgba(0,0,0,.32)'; if (!isLie){ c.beginPath(); c.ellipse(0,2,15,4,0,0,Math.PI*2); c.fill(); }
  let legL=0,legR=0; const isSit=charState==='sit'; const t=performance.now()/1000;
  if (charState==='walk'){ legL=Math.sin(walkPhase)*5; legR=-legL; }
  else if (charState==='jump'){ legL=-3; legR=-3; }
  if (action==='dance'){ legL=Math.sin(t*8)*4; legR=-Math.sin(t*8)*4; }
  c.fillStyle=shade(bodyColor,-55);
  if (isSit) c.fillRect(-3,-8,14,6); else { c.fillRect(-8,-16+legL,6,16); c.fillRect(2,-16+legR,6,16); }
  c.fillStyle='#1a1a1a';
  if (isSit) c.fillRect(9,-8,5,6); else { c.fillRect(-9,-3+legL,8,3); c.fillRect(1,-3+legR,8,3); }
  c.fillStyle=bodyColor;
  if (isSit) c.fillRect(-11,-28,22,20); else c.fillRect(-11,-34,22,20);
  let armL=0,armR=0;
  if (charState==='walk'){ armL=-Math.sin(walkPhase)*5; armR=Math.sin(walkPhase)*5; }
  if (action==='hug'){ armL=-12; armR=-12; }
  if (action==='kiss'){ armL=-4; armR=-4; }
  if (action==='punch'){ armR=-14; }
  if (action==='dance'){ armL=-14+Math.sin(t*10)*4; armR=-14+Math.cos(t*10)*4; }
  if (action==='eat'){ armR=-20+Math.sin(t*8)*4; }
  if (action==='gulp'){ armR=-22+Math.abs(Math.sin(t*6))*3; }
  const armY=isSit?-26:-32;
  c.fillStyle=shade(bodyColor,-22); c.fillRect(-15,armY+armL,5,14); c.fillRect(10,armY+armR,5,14);
  const headY=isSit?-40:-46;
  drawAnimalFace(c, ch.species, 0, headY, 20, ch.skinColor);
  if (ch.hat && ch.hat!=='none') drawHat(c, ch.hat, 0, headY-20, 20);
  c.restore();
}
function drawCharacter(c, ch, opt){
  if (ch.style==='southpark') drawSPCharacter(c, ch.spPreset||'green', opt);
  else if (ch.style==='pony') drawPony(c, ch.ponyPreset||'rainbow', opt);
  else if (ch.style==='winx') drawWinx(c, ch.winxPreset||'bloom', opt);
  else drawAnimalChar(c, ch, opt);
}
function drawCharacterPreview(cv, ch){
  const c = cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height);
  const common={x:cv.width/2, y:cv.height-20, facing:1, walkPhase:0, charState:'idle', action:'none'};
  if (ch.style==='southpark') drawSPCharacter(c, ch.spPreset, common);
  else if (ch.style==='pony') drawPony(c, ch.ponyPreset, common);
  else if (ch.style==='winx') drawWinx(c, ch.winxPreset, common);
  else drawAnimalChar(c, ch, common);
}
function drawPumpkin(c, x, y, size, t){
  size=size||1; const s=18*size; c.save(); c.translate(x,y);
  c.fillStyle='rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(0,s*0.5,s*0.9,s*0.25,0,0,Math.PI*2); c.fill();
  c.fillStyle='#ff7a1a'; c.beginPath(); c.ellipse(0,0,s,s*0.85,0,0,Math.PI*2); c.fill();
  c.fillStyle='#c95a0a'; c.beginPath(); c.ellipse(-s*0.5,0,s*0.35,s*0.85,0,0,Math.PI*2); c.fill(); c.beginPath(); c.ellipse(s*0.5,0,s*0.35,s*0.85,0,0,Math.PI*2); c.fill();
  c.fillStyle='#ffab50'; c.beginPath(); c.ellipse(-s*0.15,-s*0.3,s*0.2,s*0.4,0,0,Math.PI*2); c.fill();
  c.fillStyle='#3a6b1e'; c.beginPath(); c.moveTo(-s*0.15,-s*0.8); c.quadraticCurveTo(-s*0.3,-s*1.2,-s*0.05,-s*1.1); c.quadraticCurveTo(s*0.15,-s*1.2,s*0.1,-s*0.85); c.closePath(); c.fill();
  const glow=0.8+Math.sin(t*4)*0.2; c.fillStyle=`rgba(255,240,150,${glow})`;
  c.beginPath(); c.moveTo(-s*0.55,-s*0.25); c.lineTo(-s*0.25,-s*0.1); c.lineTo(-s*0.2,-s*0.45); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(s*0.55,-s*0.25); c.lineTo(s*0.25,-s*0.1); c.lineTo(s*0.2,-s*0.45); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-s*0.55,s*0.2); c.quadraticCurveTo(0,s*0.55,s*0.55,s*0.2); c.lineTo(s*0.4,s*0.3); c.lineTo(s*0.25,s*0.22); c.lineTo(s*0.1,s*0.35); c.lineTo(-s*0.1,s*0.35); c.lineTo(-s*0.25,s*0.22); c.lineTo(-s*0.4,s*0.3); c.closePath(); c.fill();
  c.restore();
}
const _avatarImgCache = {};
function getAvatarImage(dataUrl){
  if (_avatarImgCache[dataUrl]) return _avatarImgCache[dataUrl];
  const img = new Image(); img.src = dataUrl;
  _avatarImgCache[dataUrl] = img;
  return img;
}
window.getAvatarImage = getAvatarImage;
function drawSpider(c, x, y, angle, t){
  c.save(); c.translate(x,y); c.rotate(angle||0);
  c.strokeStyle='#1a0f1a'; c.lineWidth=1.5; c.lineCap='round';
  [-1,1].forEach(dir=>{ for (let i=0;i<4;i++){ c.beginPath(); c.moveTo(0,0); const len=6+i*0.8; c.quadraticCurveTo(dir*len*0.5,-len*0.3,dir*len,dir*len*(0.2+i*0.15)); c.stroke(); } });
  c.fillStyle='#1a0f1a'; c.beginPath(); c.arc(0,0,3,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(0,-3.5,2.2,0,Math.PI*2); c.fill();
  c.fillStyle='#ff3300'; c.beginPath(); c.arc(-0.8,-4,0.5,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(0.8,-4,0.5,0,Math.PI*2); c.fill();
  c.restore();
}
function drawCrow(c, x, y, t){
  c.save(); c.translate(x,y); const flap=Math.sin(t*12)*5;
  c.fillStyle='#111'; c.beginPath(); c.ellipse(0,0,8,5,0,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(7,-3,3.5,0,Math.PI*2); c.fill();
  c.beginPath(); c.moveTo(-2,0); c.quadraticCurveTo(-12,-8-flap,-20,0); c.quadraticCurveTo(-12,3,-2,0); c.fill();
  c.beginPath(); c.moveTo(-2,0); c.quadraticCurveTo(-12,-8+flap,-20,0); c.quadraticCurveTo(-12,3,-2,0); c.fill();
  c.restore();
}
function drawBat(c, x, y, t){
  c.save(); c.translate(x,y); const flap=Math.sin(t*14)*4;
  c.fillStyle='#1a0f1a';
  c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(-12,-10-flap,-22,0); c.quadraticCurveTo(-12,5,0,0); c.fill();
  c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(12,-10-flap,22,0); c.quadraticCurveTo(12,5,0,0); c.fill();
  c.beginPath(); c.ellipse(0,0,4,6,0,0,Math.PI*2); c.fill();
  c.fillStyle='#ff3300'; c.beginPath(); c.arc(-1.5,-2,0.8,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(1.5,-2,0.8,0,Math.PI*2); c.fill();
  c.restore();
}
function getGroundY(H){ return H - 34; }
function ensureCanvasSize(){
  if (!canvas) return;
  const w=canvas.clientWidth, h=canvas.clientHeight; if (!w||!h) return;
  const dpr=window.devicePixelRatio||1;
  if (canvas.width!==w*dpr||canvas.height!==h*dpr){
    canvas.width=w*dpr; canvas.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    if (window.state && window.state.scene){ state.scene.owls=null; state.scene.seaItems=null; state.scene.toys=null; state.scene.drinks=null; state.scene.marshmallows=null; }
  }
}
window.addEventListener('resize', ()=>setTimeout(ensureCanvasSize,50));

const MAP_ZONES = [
  { id:'volleyball', label:'Волейбол',  x:0.50, y:0.28, color:'#f1c40f', icon:'🏐', minP:2, maxP:2 },
  { id:'football',   label:'Футбол',    x:0.82, y:0.28, color:'#2ecc71', icon:'⚽', minP:2, maxP:2 },
  { id:'broom',      label:'Метлы',     x:0.18, y:0.28, color:'#9b59b6', icon:'🧹', minP:2, maxP:2 },
  { id:'tetris',     label:'Тетрис',    x:0.10, y:0.55, color:'#e84393', icon:'🧱', minP:2, maxP:2 },
  { id:'tictactoe',  label:'Крестики',  x:0.90, y:0.55, color:'#00b894', icon:'❌', minP:2, maxP:2 },
  { id:'couch',      label:'Диван',     x:0.28, y:0.72, color:'#a07050', icon:'🛋️', minP:2, maxP:6 },
  { id:'forest',     label:'Костёр',    x:0.72, y:0.72, color:'#e74c3c', icon:'🔥', minP:2, maxP:6 },
  { id:'beach',      label:'Пляж',      x:0.15, y:0.88, color:'#f39c12', icon:'🏖️', minP:2, maxP:6 },
  { id:'bottle',     label:'Бутылочка', x:0.85, y:0.88, color:'#e91e63', icon:'🍾', minP:2, maxP:6 }
];
function zoneAvailableFor(zone, playerCount){
  if (playerCount < zone.minP) return false;
  if (playerCount > zone.maxP) return false;
  return true;
}
window.zoneAvailableFor = zoneAvailableFor;

function startSceneLoop(){
  if (!canvas||!ctx) return;
  ensureCanvasSize();
  if (sceneRAF) cancelAnimationFrame(sceneRAF);
  sceneLast=performance.now();
  const loop=now=>{
    const dt=Math.min(0.05,(now-sceneLast)/1000); sceneLast=now;
    try { updateScene(dt); } catch(e){ console.error('[WEF] update:', e); }
    try { renderScene(); } catch(e){ console.error('[WEF] render:', e); }
    sceneRAF=requestAnimationFrame(loop);
  };
  sceneRAF=requestAnimationFrame(loop);
}
function updateVoting(W, H){
  const scene = state.scene;
  if (!scene.voting) scene.voting = { zoneId:null, endsAt:0, voters:{}, tally:{} };
  const v = scene.voting;
  const playerCount = Object.keys(scene.chars).length;
  if (!state.room?.isHost) return;
  if (scene.location !== 'map'){ v.zoneId=null; v.endsAt=0; v.voters={}; v.tally={}; return; }
  if (playerCount < 2){ v.zoneId=null; v.endsAt=0; v.voters={}; v.tally={}; return; }
  const newVoters = {};
  Object.entries(scene.chars).forEach(([id, c]) => {
    const myY = c.mapY ?? H/2;
    let nearest = null, nearestD = 34;
    MAP_ZONES.forEach(z => {
      if (!zoneAvailableFor(z, playerCount)) return;
      const zx = W*z.x, zy = H*z.y;
      const d = Math.hypot(c.x - zx, myY - zy);
      if (d < nearestD){ nearestD = d; nearest = z.id; }
    });
    if (nearest) newVoters[id] = nearest;
  });
  const changed = JSON.stringify(newVoters) !== JSON.stringify(v.voters);
  v.voters = newVoters;
  const voterCount = Object.keys(newVoters).length;
  if (voterCount === 0){
    v.endsAt = 0; v.tally = {};
    if (changed && typeof broadcast === 'function') broadcast({type:'scene-vote', voting:{ zoneId:null, endsAt:0, voters:{}, tally:{} }});
    return;
  }
  if (!v.endsAt){
    v.endsAt = performance.now() + 3000;
    if (typeof broadcast === 'function') broadcast({type:'scene-vote', voting:{ zoneId:null, endsAt: v.endsAt, voters: v.voters, tally:{} }});
    return;
  }
  const tally = {};
  Object.values(newVoters).forEach(zid => tally[zid] = (tally[zid]||0)+1);
  v.tally = tally;
  if (changed && typeof broadcast === 'function') broadcast({type:'scene-vote', voting:{ zoneId:null, endsAt: v.endsAt, voters: v.voters, tally }});
  if (performance.now() >= v.endsAt){
    let best = null, bestN = 0, tied = [];
    Object.entries(tally).forEach(([zid, n]) => {
      if (n > bestN){ bestN = n; best = zid; tied = [zid]; }
      else if (n === bestN) tied.push(zid);
    });
    if (!best){ v.endsAt=0; return; }
    const chosen = tied.length > 1 ? tied[Math.floor(Math.random()*tied.length)] : best;
    v.endsAt=0; v.voters={}; v.tally={}; v.zoneId = chosen;
    window.setLocation(chosen);
    if (typeof SFX !== 'undefined') SFX.play('pickup');
  }
}
function updateScene(dt){
  if (!window.state) return;
  const me=state.scene.chars[state.user?.id]; if (!me) return;
  const W=canvas.clientWidth||800, H=canvas.clientHeight||260;
  const groundY=getGroundY(H); const loc=state.scene.location;
  if (loc==='map'){ updateMap(dt,me,W,H); updateVoting(W,H); return; }
  if (loc==='broom'){ if (typeof updateBroom==='function') updateBroom(dt,W,H); return; }
  if (loc==='tetris'){ if (typeof updateTetris==='function') updateTetris(dt,W,H); return; }
  if (loc==='tictactoe'){ if (typeof updateTicTacToe==='function') updateTicTacToe(dt,W,H); return; }
  if (loc==='bottle'){ if (typeof updateBottle==='function') updateBottle(dt,W,H); return; }
  if (me.sitting && (state.keys.left||state.keys.right||state.keys.up)){
    me.sitting=false; me.charState='idle';
    if (typeof broadcast==='function') broadcast({type:'scene-sit', userId: state.user.id, sitting:false});
  }
  if (me.lying!=null && (state.keys.left||state.keys.right||state.keys.up||state.keys.down)){
    me.lying=null; me.charState='idle'; me.y=groundY;
    if (typeof broadcast==='function') broadcast({type:'scene-lie', userId: state.user.id, lying:null});
  }
  if (!me.sitting && !me.ridingOn && me.lying==null){
    let mx=0; if (state.keys.left) mx-=1; if (state.keys.right) mx+=1;
    if (mx!==0){ me.x+=mx*MOVE_SPEED*dt; me.facing=mx; if (me.onGround) me.charState='walk'; me.walkPhase+=dt*14; }
    else if (me.onGround){ me.charState='idle'; me.walkPhase=0; }
  }
  if (!me.sitting && !me.ridingOn && me.lying==null && state.keys.up && me.onGround){
    me.vy=JUMP_VELOCITY; me.onGround=false; me.charState='jump';
    if (typeof SFX!=='undefined') SFX.play('jump');
  }
  if (!me.ridingOn && me.lying==null){
    me.prevY=me.y; me.prevOnGround=me.onGround;
    me.vy+=GRAVITY*dt; me.y+=me.vy*dt; me.onGround=false;
    const platforms=getPlatforms(loc,W,H);
    for (const p of platforms){
      if (me.x>p.x1-10 && me.x<p.x2+10 && me.vy>=0 && me.prevY<=p.top+4 && me.y>=p.top){
        me.y=p.top; me.vy=0; me.onGround=true;
        if (me.charState==='jump') me.charState='idle'; break; } }
    if (me.y>=groundY){ me.y=groundY; me.vy=0; me.onGround=true; if (me.charState==='jump') me.charState='idle'; }
  }
  me.x=Math.max(15,Math.min(W-15,me.x));
  if (me.actionT>0) me.actionT-=dt;
  updateSceneAmbient(dt,W,H);
  if (typeof updateToys==='function') updateToys(dt,W,H);
  if (typeof updateMarshmallows==='function') updateMarshmallows(dt);
  if (typeof updateFootball==='function') updateFootball(dt,W,H);
  if (typeof updateVolleyball==='function') updateVolleyball(dt,W,H);
  const now=performance.now();
  if (now-state.scene.lastSent>300){
    state.scene.lastSent=now;
    if (typeof broadcast==='function') broadcast({type:'scene-move', userId: state.user.id, x: me.x, y: me.y, st: me.charState, facing: me.facing, phase: me.walkPhase, action: me.action, ridingOn: me.ridingOn, held: me.held, lying: me.lying});
  }
}
function updateMap(dt, me, W, H){
  if (me.sitting) me.sitting=false; if (me.lying!=null) me.lying=null;
  let mx=0,my=0;
  if (state.keys.left) mx-=1; if (state.keys.right) mx+=1;
  if (state.keys.up) my-=1; if (state.keys.down) my+=1;
  if (mx!==0||my!==0){
    const len=Math.hypot(mx,my)||1;
    me.x+=(mx/len)*MOVE_SPEED*dt; me.mapY=(me.mapY??H/2)+(my/len)*MOVE_SPEED*dt;
    if (mx!==0) me.facing=mx;
    me.charState='walk'; me.walkPhase+=dt*14;
  } else { me.charState='idle'; me.walkPhase=0; }
  me.mapY=Math.max(25,Math.min(H-45,me.mapY??H/2));
  me.x=Math.max(30,Math.min(W-30,me.x));
  me.y=me.mapY;
  if (me.actionT>0) me.actionT-=dt;
  const now=performance.now();
  if (now-state.scene.lastSent>300){
    state.scene.lastSent=now;
    if (typeof broadcast==='function') broadcast({type:'scene-move', userId: state.user.id, x: me.x, y: me.mapY, st: me.charState, facing: me.facing, phase: me.walkPhase, action:'none', ridingOn:null, held:null, lying:null});
  }
}
function renderScene(){
  if (!canvas||!ctx) return;
  ensureCanvasSize();
  const W=canvas.clientWidth, H=canvas.clientHeight; if (!W||!H) return;
  ctx.clearRect(0,0,W,H);
  const t=performance.now()/1000;
  if (!window.state) return;
  const loc=state.scene.location;
  if (loc==='map'){ renderMap(W,H,t); return; }
  if (loc==='broom'){ if (typeof renderBroom==='function') renderBroom(W,H,t); return; }
  if (loc==='tetris'){ if (typeof renderTetris==='function') renderTetris(W,H,t); return; }
  if (loc==='tictactoe'){ if (typeof renderTicTacToe==='function') renderTicTacToe(W,H,t); return; }
  if (loc==='bottle'){ if (typeof renderBottle==='function') renderBottle(W,H,t); return; }
  drawLocationBackground(loc,W,H,t);
  if (loc==='beach' && state.scene.seaItems) state.scene.seaItems.forEach(it=>{ const a=Math.min(1,it.life/0.6); ctx.globalAlpha=a*0.95; if (it.emoji==='fish') drawFish(ctx,it.x,it.y,it.vx>0?1:-1,t,it.phase,it.color); else drawCrab(ctx,it.x,it.y); ctx.globalAlpha=1; });
  if (loc==='beach' && state.scene.drinks) state.scene.drinks.forEach(d=>{ if (!d.taken) drawDrink(ctx,d.x,d.y,d.type,d.empty); });
  if (loc==='forest' && state.scene.marshmallows) state.scene.marshmallows.forEach(m=>{ if (!m.taken) drawMarshmallow(ctx,m.x,m.y,m); });
  if (loc==='couch'){
    if (!state.scene.toys && typeof initToys==='function') initToys(W,H);
    if (state.scene.toys) state.scene.toys.forEach(toy=>{ if (toy.held) return;
      ctx.save(); ctx.translate(toy.x,toy.y); ctx.rotate(toy.rot||0);
      if (toy.type==='teddy') drawTeddy(ctx,0,0);
      if (toy.type==='ball') drawBall(ctx,0,0);
      if (toy.type==='gamepad') drawGamepad(ctx,0,0);
      if (toy.type==='book') drawBook(ctx,0,0);
      if (toy.type==='dice') drawDice(ctx,0,0); ctx.restore(); });
  }
  if (loc==='football'){ if (!state.scene.football && typeof initFootball==='function') initFootball(W,H); if (state.scene.football) renderFootball(W,H,t); }
  if (loc==='volleyball'){ if (!state.scene.volleyball && typeof initVolleyball==='function') initVolleyball(W,H); if (state.scene.volleyball) renderVolleyball(W,H,t); }

  // Скрывать персонажей в мини-играх
  const hideCharsIn = ['tetris','broom','tictactoe','bottle'];
  const hideChars = hideCharsIn.includes(loc);

  // ✅ ФИКС: сброс "зависших" игроков — ВНЕ forEach!
  const nowCleanup = performance.now();
  Object.values(state.scene.chars).forEach(c => {
    if (c.lastUpdate && nowCleanup - c.lastUpdate > 2500 && c.y < 0){
      c.y = getGroundY(H);
      c.vy = 0;
      c.onGround = true;
      c.charState = 'idle';
    }
  });

  const arr = Object.values(state.scene.chars).sort((a,b)=>a.y-b.y);
  arr.forEach(ch=>{
    if (hideChars) return;
    drawCharacter(ctx, ch.character||{style:'animal',species:'cat',skinColor:null,hat:'none',clothes:'#3498db'}, {
      x: ch.x, y: ch.y, facing: ch.facing||1, walkPhase: ch.walkPhase||0,
      charState: ch.lying!=null?'lie':(ch.ridingOn?'jump':ch.charState), action: ch.action });
    if (ch.held){ const heldX = ch.x + (ch.facing || 1) * 22; const heldY = ch.y - 44;
      ctx.save(); ctx.translate(heldX, heldY); ctx.scale(0.65, 0.65);
      if (ch.held.type === 'toy' && state.scene.toys){ const toy = state.scene.toys[ch.held.idx];
        if (toy){ if (toy.type === 'teddy') drawTeddy(ctx, 0, 0); if (toy.type === 'ball') drawBall(ctx, 0, 0);
          if (toy.type === 'gamepad') drawGamepad(ctx, 0, 0); if (toy.type === 'book') drawBook(ctx, 0, 0); if (toy.type === 'dice') drawDice(ctx, 0, 0); } }
      else if (ch.held.type === 'drink'){ const d = ch.held.data || (state.scene.drinks && state.scene.drinks[ch.held.idx]); drawDrink(ctx, 0, 0, (d && d.type) || 'cola', false); }
      else if (ch.held.type === 'marshmallow'){ const m = ch.held.data || (state.scene.marshmallows && state.scene.marshmallows[ch.held.idx]); drawMarshmallow(ctx, 0, 0, m || {}); }
      ctx.restore(); }
    ctx.save(); ctx.textAlign='center'; ctx.font='bold 10px Inter, sans-serif';
    const nameW=ctx.measureText(ch.name||'').width+10;
    const headY=ch.y-(ch.lying!=null?32:(ch.charState==='sit'?44:54));
    ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(ch.x-nameW/2, headY-10, nameW, 13);
    ctx.fillStyle='#fff'; ctx.textBaseline='middle'; ctx.fillText(ch.name||'', ch.x, headY-3);
    const hp=ch.hp??10, maxHp=ch.maxHp??10;
    if (hp<maxHp){ const bw=36, bh=4, bx=ch.x-bw/2, by=headY-22;
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(bx,by,bw,bh);
      ctx.fillStyle=hp>6?'#22c55e':hp>3?'#f39c12':'#ef4444'; ctx.fillRect(bx,by,bw*(hp/maxHp),bh); }
    ctx.restore();
    if (ch.action && ch.action!=='none'){
      const emoji={hug:'💗',kiss:'💋',punch:'💥',dance:'🎵',climb:'↗️',eat:'🍡',gulp:'🥤'}[ch.action];
      if (emoji){ ctx.save(); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='22px sans-serif'; ctx.globalAlpha=0.9;
        ctx.fillText(emoji, ch.x, ch.y-70+Math.sin(performance.now()/200)*3); ctx.restore(); } }
  });
  if (state.scene.splashes && state.scene.splashes.length){
    state.scene.splashes.forEach(s=>{ const a=Math.max(0,s.life/0.6); ctx.globalAlpha=a; ctx.fillStyle='#bfe6ff'; ctx.beginPath(); ctx.arc(s.x,s.y,s.size||3,0,Math.PI*2); ctx.fill(); });
    ctx.globalAlpha=1;
  }
  if (loc!=='map'){
    ctx.save(); ctx.strokeStyle='rgba(220,220,240,.3)'; ctx.lineWidth=1;
    for (let i=1;i<=5;i++){ ctx.beginPath(); ctx.moveTo(8,8); ctx.lineTo(8+22*i,8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(8,8); ctx.lineTo(8,8+22*i); ctx.stroke(); }
    for (let r=12;r<=100;r+=22){ ctx.beginPath(); ctx.arc(8,8,r,0,Math.PI/2); ctx.stroke(); }
    const sx=8+30, sy=8+15+Math.abs(Math.sin(t*0.8))*40;
    ctx.strokeStyle='rgba(220,220,240,.5)'; ctx.beginPath(); ctx.moveTo(sx,8); ctx.lineTo(sx,sy); ctx.stroke();
    drawSpider(ctx,sx,sy,Math.PI,t); ctx.restore();
  }
}
function renderMap(W,H,t){
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#7ec850'); g.addColorStop(0.5,'#5eb43a'); g.addColorStop(1,'#3a8a20');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  for (let i=0;i<24;i++){
    const tx = (i*167+40) % W;
    const ty = 20 + (i%5) * ((H-60)/5);
    ctx.fillStyle='rgba(30,80,20,.35)';
    ctx.beginPath(); ctx.arc(tx,ty,10+(i%3)*4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(60,140,40,.35)';
    ctx.beginPath(); ctx.arc(tx-3,ty-3,7+(i%3)*3,0,Math.PI*2); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(140,90,50,.85)';
  ctx.lineWidth = 22; ctx.lineCap='round'; ctx.lineJoin='round';
  const path = ['broom','volleyball','football','tictactoe','bottle','beach','couch','forest','tetris'];
  ctx.beginPath();
  path.forEach((id, i) => {
    const z = MAP_ZONES.find(zz => zz.id === id);
    const zx = W*z.x, zy = H*z.y;
    if (i === 0) ctx.moveTo(zx, zy); else ctx.lineTo(zx, zy);
  });
  ctx.stroke();
  ctx.strokeStyle = 'rgba(220,180,120,.85)';
  ctx.lineWidth = 12;
  ctx.beginPath();
  path.forEach((id, i) => {
    const z = MAP_ZONES.find(zz => zz.id === id);
    const zx = W*z.x, zy = H*z.y;
    if (i === 0) ctx.moveTo(zx, zy); else ctx.lineTo(zx, zy);
  });
  ctx.stroke();
  const me = state.scene.chars[state.user?.id];
  const playerCount = Object.keys(state.scene.chars).length;
  const voting = state.scene.voting || { zoneId:null, endsAt:0, voters:{} };
  MAP_ZONES.forEach(z => {
    const zx = W*z.x, zy = H*z.y;
    const available = zoneAvailableFor(z, playerCount);
    const near = me && Math.hypot(me.x-zx, (me.mapY??H/2)-zy) < 34;
    let votes = 0;
    Object.values(voting.voters || {}).forEach(zid => { if (zid === z.id) votes++; });
    const radius = 20 + (votes > 0 ? 3 : 0) + (near ? 2 : 0);
    const grad = ctx.createRadialGradient(zx-8,zy-8,2,zx,zy,radius);
    if (!available){ grad.addColorStop(0,'#666'); grad.addColorStop(1,'#333'); }
    else { grad.addColorStop(0, shade(z.color, 40)); grad.addColorStop(1, shade(z.color, -60)); }
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(zx, zy, radius, 0, Math.PI*2); ctx.fill();
    let stroke = 'rgba(0,0,0,.45)'; let lw = 3;
    if (near) { stroke = '#ffd700'; lw = 5; }
    if (voting.endsAt && votes > 0) { stroke = '#22c55e'; lw = 5; }
    if (!available) { stroke = 'rgba(0,0,0,.3)'; lw = 2; }
    ctx.strokeStyle = stroke; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(zx, zy, radius, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = available ? 1 : 0.35;
    ctx.font = '18px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(z.icon, zx, zy - 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0,0,0,.85)';
    const lbl = z.label;
    ctx.font = 'bold 9px Inter, sans-serif';
    const lw2 = ctx.measureText(lbl).width + 10;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(zx - lw2/2, zy + radius + 2, lw2, 13, 6);
    else ctx.rect(zx - lw2/2, zy + radius + 2, lw2, 13);
    ctx.fill();
    ctx.fillStyle = available ? '#fff' : '#888';
    ctx.fillText(lbl, zx, zy + radius + 9);
    let reqText = '';
    if (z.minP === z.maxP) reqText = `только ${z.minP} 👥`;
    else reqText = `${z.minP}-${z.maxP} 👥`;
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.fillStyle = available ? 'rgba(255,255,255,.85)' : '#ef4444';
    ctx.fillText(reqText, zx, zy + radius + 20);
    if (votes > 0){
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(zx + radius - 4, zy - radius + 4, 8, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(String(votes), zx + radius - 4, zy - radius + 5);
    }
  });
  Object.values(state.scene.chars).forEach(ch => {
    const cx = ch.x, cy = ch.mapY ?? H/2;
    ctx.fillStyle='rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(cx, cy+6, 14, 5, 0, 0, Math.PI*2); ctx.fill();
    const chCol = ch.character?.style === 'southpark'
      ? (SP_PRESETS.find(p=>p.id===ch.character.spPreset)?.jacket||'#e74c3c')
      : ch.character?.style === 'pony'
      ? (PONY_PRESETS.find(p=>p.id===ch.character.ponyPreset)?.body||'#5dade2')
      : ch.character?.style === 'winx'
      ? (WINX_PRESETS.find(p=>p.id===ch.character.winxPreset)?.dress||'#3498db')
      : (ch.character?.clothes||'#3498db');
    ctx.fillStyle = chCol;
    ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    const av = ch.avatar;
    if (av?.type === 'image' && av.data){
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.clip();
      ctx.fillStyle = '#fff'; ctx.fillRect(cx-10, cy-10, 20, 20); ctx.restore();
    } else {
      ctx.font = '14px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(av?.emoji || '👤', cx, cy+1);
    }
    ctx.font = 'bold 9px Inter, sans-serif';
    const nm = ch.name || state.members[Object.keys(state.scene.chars).find(k=>state.scene.chars[k]===ch)]?.name || '';
    const nw = ctx.measureText(nm).width + 10;
    ctx.fillStyle = 'rgba(0,0,0,.8)';
    ctx.fillRect(cx - nw/2, cy - 30, nw, 12);
    ctx.fillStyle = '#fff';
    ctx.fillText(nm, cx, cy - 24);
  });
  ctx.fillStyle = 'rgba(0,0,0,.75)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(W/2 - 130, 8, 260, 34, 10); else ctx.rect(W/2 - 130, 8, 260, 34);
  ctx.fill();
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`👥 Игроков: ${playerCount}`, W/2, 25);
  if (voting.endsAt > 0){
    const left = Math.max(0, (voting.endsAt - performance.now())/1000);
    ctx.fillStyle = 'rgba(34,197,94,.9)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(W/2 - 90, 48, 180, 26, 8); else ctx.rect(W/2 - 90, 48, 180, 26);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(`🗳 Голосование: ${left.toFixed(1)}с`, W/2, 61);
  }
  if (playerCount < 2){
    ctx.fillStyle = 'rgba(0,0,0,.75)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(W/2 - 200, H/2 - 30, 400, 60, 14); else ctx.rect(W/2 - 200, H/2 - 30, 400, 60);
    ctx.fill();
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(W/2 - 200, H/2 - 30, 400, 60, 14); else ctx.rect(W/2 - 200, H/2 - 30, 400, 60);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('⏳ Ждём других игроков (нужно 2+)', W/2, H/2 - 8);
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#a896b8';
    ctx.fillText('Сцены станут доступны, когда подключатся друзья', W/2, H/2 + 14);
  }
}
function drawTree(c,x,y){
  c.fillStyle='rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x,y+20,14,4,0,0,Math.PI*2); c.fill();
  c.fillStyle='#3a2010'; c.fillRect(x-3,y+6,6,14);
  c.fillStyle='#1a3a1a'; c.beginPath(); c.arc(x,y,18,0,Math.PI*2); c.fill();
  c.fillStyle='#2a5a2a'; c.beginPath(); c.arc(x-5,y-4,12,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(x+6,y+2,10,0,Math.PI*2); c.fill();
}
function drawLocationBackground(loc,W,H,t){
  const groundY=getGroundY(H);
  if (loc==='forest'){
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#100820'); g.addColorStop(0.6,'#1a2018'); g.addColorStop(1,'#0a0f08');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    for (let i=0;i<40;i++){ const sx=(i*71)%W, sy=(i*37)%(H*0.5); const tw=0.5+0.5*Math.sin(t*3+i); ctx.globalAlpha=0.4+tw*0.5; ctx.fillStyle='#fff'; ctx.fillRect(sx,sy,1.5,1.5); }
    ctx.globalAlpha=1;
    for (let i=0;i<3;i++){ const bx=(W*0.2+i*200+t*40)%W; const by=H*0.15+Math.sin(t*2+i)*15; drawBat(ctx,bx,by,t+i); }
    ctx.fillStyle='#050a05';
    for (let i=0;i<8;i++){ const x=(i*137+60)%W, tw=40+(i%3)*18; ctx.beginPath(); ctx.moveTo(x,groundY+10); ctx.lineTo(x+tw/2,groundY-100-(i%4)*20); ctx.lineTo(x+tw,groundY+10); ctx.fill(); }
    ctx.fillStyle='#0a1a0a'; ctx.fillRect(0,groundY,W,H-groundY);
    [{x1:30,x2:100,top:groundY-18},{x1:W/2-42,x2:W/2+42,top:groundY-22},{x1:W-100,x2:W-30,top:groundY-18}].forEach(p=>{
      const w=p.x2-p.x1;
      ctx.fillStyle='rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse((p.x1+p.x2)/2,p.top+14,w/2,4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#6b4226'; ctx.fillRect(p.x1,p.top,w,14);
      ctx.fillStyle='#4d2f1a'; ctx.fillRect(p.x1,p.top+10,w,4); });
    const fx=W/2, fy=groundY+4;
    for (let i=0;i<8;i++){ const a=(i/8)*Math.PI*2; ctx.fillStyle='#4a4a4a'; ctx.beginPath(); ctx.arc(fx+Math.cos(a)*32,fy+Math.sin(a)*10,5,0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle='#4a2f1a'; ctx.save(); ctx.translate(fx,fy); ctx.rotate(0.4); ctx.fillRect(-18,-3,36,5); ctx.rotate(-0.8); ctx.fillRect(-18,-3,36,5); ctx.restore();
    const glowR=90+Math.sin(t*5)*7;
    const gg=ctx.createRadialGradient(fx,fy-25,5,fx,fy-25,glowR);
    gg.addColorStop(0,'rgba(255,180,60,.55)'); gg.addColorStop(1,'rgba(255,80,0,0)');
    ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(fx,fy-25,glowR,0,Math.PI*2); ctx.fill();
    const flick=Math.sin(t*9)*4+Math.sin(t*14)*2;
    [{x:fx-9,w:11,h:36,c:'#ff6b1a'},{x:fx,w:13,h:46,c:'#ffa500'},{x:fx-4,w:7,h:32,c:'#ffdd44'}].forEach(f=>{
      ctx.fillStyle=f.c; const hh=f.h+flick;
      ctx.beginPath(); ctx.moveTo(f.x,fy-6); ctx.quadraticCurveTo(f.x+f.w/2,fy-6-hh,f.x+f.w/2,fy-6-hh); ctx.quadraticCurveTo(f.x+f.w,fy-6-hh*0.6,f.x+f.w,fy-6); ctx.closePath(); ctx.fill(); });
    [{x:70,y:groundY-6,size:1.1},{x:W-80,y:groundY-6,size:1.0}].forEach((p,i)=>{
      drawPumpkin(ctx,p.x,p.y,p.size,t); });
    if (!state.scene.marshmallowBox) state.scene.marshmallowBox={x:W/2-80,y:groundY-20,w:28,h:20};
    const mb=state.scene.marshmallowBox;
    ctx.fillStyle='#5a3a1a'; ctx.fillRect(mb.x,mb.y,mb.w,mb.h);
    ctx.fillStyle='#3a2210'; ctx.fillRect(mb.x,mb.y,mb.w,3);
    ctx.fillStyle='#fff6e0'; for (let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(mb.x+6+i*8,mb.y+6,3.5,0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle='#ffd700'; ctx.font='bold 8px Inter, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🍡', mb.x+mb.w/2, mb.y-6);
  } else if (loc==='couch'){
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#2a1820'); g.addColorStop(1,'#0a0608');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    for (let i=0;i<W;i+=40){ ctx.fillStyle='rgba(255,255,255,.03)'; ctx.fillRect(i,0,3,groundY); }
    ctx.fillStyle='#0a0608'; ctx.fillRect(0,groundY-6,W,6);
    ctx.fillStyle='#3a2218'; ctx.fillRect(0,groundY,W,H-groundY);
    for (let i=0;i<W;i+=50){ ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.beginPath(); ctx.moveTo(i,groundY); ctx.lineTo(i,H); ctx.stroke(); }
    const cx=W/2, lx=cx+128, ly=groundY-100;
    ctx.fillStyle='#1a0f1a'; ctx.fillRect(cx-100,20,200,80);
    ctx.strokeStyle='#5a3a2a'; ctx.lineWidth=6; ctx.strokeRect(cx-100,20,200,80);
    for (let i=0;i<2;i++){ const bx=cx-80+((t*30+i*100)%160); const by=40+Math.sin(t*2+i)*10; if (bx>cx-90 && bx<cx+90) drawCrow(ctx,bx,by,t+i); }
    if (state.scene.lampOn){ const gg=ctx.createRadialGradient(lx,ly,10,lx,ly,200);
      gg.addColorStop(0,'rgba(255,200,120,.55)'); gg.addColorStop(1,'rgba(255,150,50,0)');
      ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(lx,ly,200,0,Math.PI*2); ctx.fill(); }
    const couchX=cx-85, couchTop=groundY-42;
    ctx.fillStyle='#4a2f1a'; ctx.fillRect(couchX,couchTop-26,170,30);
    ctx.fillStyle='#6b4226'; ctx.fillRect(couchX,couchTop,170,24);
    ctx.fillStyle='#7a4d31'; ctx.fillRect(couchX+8,couchTop+5,70,16); ctx.fillRect(couchX+92,couchTop+5,70,16);
    ctx.fillStyle='#5a3520'; ctx.fillRect(couchX-14,couchTop-22,18,46); ctx.fillRect(couchX+166,couchTop-22,18,46);
    const tX1=cx+100, tT=groundY-60;
    ctx.fillStyle='#6b4226'; ctx.fillRect(tX1,tT,55,6);
    ctx.fillStyle='#222'; ctx.fillRect(lx-2,tT-38,3,38);
    ctx.fillStyle=state.scene.lampOn?'#ffd27a':'#4a4030';
    ctx.beginPath(); ctx.moveTo(lx-17,tT-38); ctx.lineTo(lx+17,tT-38); ctx.lineTo(lx+11,tT-64); ctx.lineTo(lx-11,tT-64); ctx.closePath(); ctx.fill();
  } else if (loc==='beach'){
    const g=ctx.createLinearGradient(0,0,0,H*0.6); g.addColorStop(0,'#3a0a30'); g.addColorStop(0.4,'#7a1a3a'); g.addColorStop(1,'#2a1a3a');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H*0.6);
    for (let i=0;i<3;i++){ const bx=(W*0.15+i*180+t*35)%W; const by=H*0.1+Math.sin(t*2.5+i)*12; drawBat(ctx,bx,by,t+i); }
    const sx=W*0.75, sy=H*0.2;
    const sg=ctx.createRadialGradient(sx,sy,5,sx,sy,70);
    sg.addColorStop(0,'rgba(240,220,180,1)'); sg.addColorStop(1,'rgba(200,180,140,0)');
    ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,70,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e8dcc0'; ctx.beginPath(); ctx.arc(sx,sy,26,0,Math.PI*2); ctx.fill();
    const seaTop=H*0.5; ctx.fillStyle='#1a2a4a'; ctx.fillRect(0,seaTop,W,H-seaTop);
    for (let i=0;i<4;i++){ ctx.beginPath(); const yy=seaTop+i*20; ctx.moveTo(0,yy);
      for (let x=0;x<=W;x+=8){ const y=yy+Math.sin((x+t*80+i*40)/28)*3.5; ctx.lineTo(x,y); }
      ctx.lineTo(W,H); ctx.lineTo(0,H);
      ctx.fillStyle=`rgba(${60+i*15},${100+i*20},${160+i*15},${0.4+i*0.05})`; ctx.fill(); }
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(0,groundY,W,H-groundY);
    drawLounger(ctx,W*0.18,groundY-4); drawLounger(ctx,W*0.82,groundY-4); drawUmbrella(ctx,W*0.5,groundY-4);
    drawPumpkin(ctx,W-70,groundY-4,1.0,t);
    if (!state.scene.drinkBox) state.scene.drinkBox={x:W*0.35,y:groundY-20,w:30,h:20};
    const db=state.scene.drinkBox;
    ctx.fillStyle='#2a4a6a'; ctx.fillRect(db.x,db.y,db.w,db.h);
    ctx.fillStyle='#1a3a5a'; ctx.fillRect(db.x,db.y,db.w,3);
    ctx.fillStyle='#8b3a1a'; ctx.fillRect(db.x+4,db.y+6,6,10); ctx.fillRect(db.x+14,db.y+6,6,10); ctx.fillRect(db.x+22,db.y+6,5,10);
    ctx.fillStyle='#ffd700'; ctx.font='bold 8px Inter, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🥤', db.x+db.w/2, db.y-6);
  } else if (loc==='volleyball'){
    const g=ctx.createLinearGradient(0,0,0,H*0.5); g.addColorStop(0,'#2a0a3a'); g.addColorStop(0.5,'#6a1a4a'); g.addColorStop(1,'#1a0a2a');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H*0.5);
    for (let i=0;i<3;i++){ const bx=(W*0.2+i*200+t*40)%W; const by=H*0.12+Math.sin(t*3+i)*14; drawBat(ctx,bx,by,t+i); }
    ctx.fillStyle='#e8dcc0'; ctx.beginPath(); ctx.arc(W*0.15,H*0.15,22,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#4a3a1a'; ctx.fillRect(0,groundY,W,H-groundY);
    ctx.fillStyle='#3a2a10'; ctx.fillRect(0,groundY,W,4);
    [{x:60,y:groundY-4,size:0.9},{x:W-70,y:groundY-4,size:1.0}].forEach(p=>drawPumpkin(ctx,p.x,p.y,p.size,t));
  }
}
function drawLounger(c,x,y){
  c.save(); c.translate(x,y);
  c.fillStyle='#c95a0a'; c.beginPath(); c.moveTo(-28,-6); c.lineTo(20,-6); c.lineTo(24,-16); c.lineTo(-24,-16); c.closePath(); c.fill();
  c.fillStyle='#a04a08'; c.beginPath(); c.moveTo(-28,-6); c.lineTo(-36,-24); c.lineTo(-28,-24); c.lineTo(-20,-6); c.closePath(); c.fill();
  c.fillStyle='#5a4030'; c.fillRect(-20,-6,3,6); c.fillRect(14,-6,3,6);
  c.restore();
}
function drawUmbrella(c,x,y){
  c.strokeStyle='#3a2010'; c.lineWidth=3; c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-55); c.stroke();
  const colors=['#a020f0','#ff7a1a'];
  for (let i=0;i<6;i++){ const a1=Math.PI+i*(Math.PI/6), a2=Math.PI+(i+1)*(Math.PI/6);
    c.fillStyle=colors[i%2]; c.beginPath(); c.moveTo(x,y-55); c.arc(x,y-55,40,a1,a2); c.closePath(); c.fill(); }
  c.fillStyle='#ffd700'; c.beginPath(); c.arc(x,y-57,3,0,Math.PI*2); c.fill();
}
function drawBall(c,x,y){ c.fillStyle='#ecf0f1'; c.beginPath(); c.arc(x,y,12,0,Math.PI*2); c.fill();
  c.fillStyle='#e74c3c'; [0,Math.PI*2/5,Math.PI*4/5,Math.PI*6/5,Math.PI*8/5].forEach(a=>{ c.beginPath(); c.arc(x+Math.cos(a)*6,y+Math.sin(a)*6,3,0,Math.PI*2); c.fill(); });
  c.fillStyle='#2c3e50'; c.beginPath(); c.arc(x,y,3,0,Math.PI*2); c.fill(); }
function drawSoccerBall(c,x,y){ const r=11; c.fillStyle='#fff'; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
  c.fillStyle='#1a1a1a'; [0,Math.PI*2/5,Math.PI*4/5,Math.PI*6/5,Math.PI*8/5].forEach(a=>{ c.beginPath(); c.arc(x+Math.cos(a)*5,y+Math.sin(a)*5,2.8,0,Math.PI*2); c.fill(); });
  c.beginPath(); c.arc(x,y,2.5,0,Math.PI*2); c.fill(); }
function drawVolleyball(c,x,y){ const r=10; c.fillStyle='#f1c40f'; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
  c.strokeStyle='#e67e22'; c.lineWidth=1.5; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.stroke(); }
function drawFish(c,x,y,dir,t,phase,color){ c.save(); c.translate(x,y); c.scale(dir,1);
  c.fillStyle=color||'#f39c12'; c.beginPath(); c.ellipse(0,0,12,6,0,0,Math.PI*2); c.fill();
  c.fillStyle='#fff'; c.beginPath(); c.arc(7,-1,2.5,0,Math.PI*2); c.fill();
  c.fillStyle='#000'; c.beginPath(); c.arc(7.5,-1,1.3,0,Math.PI*2); c.fill(); c.restore(); }
function drawCrab(c,x,y){ c.fillStyle='#c0392b'; c.beginPath(); c.ellipse(x,y,15,9,0,0,Math.PI*2); c.fill(); }
function drawTeddy(c,x,y){ c.fillStyle='#8b5a3c'; c.beginPath(); c.ellipse(x-10,y+6,5,6,0.2,0,Math.PI*2); c.fill(); c.beginPath(); c.ellipse(x+10,y+6,5,6,-0.2,0,Math.PI*2); c.fill();
  c.fillStyle='#a07050'; c.beginPath(); c.ellipse(x,y+2,11,12,0,0,Math.PI*2); c.fill();
  c.fillStyle='#8b5a3c'; c.beginPath(); c.arc(x-8,y-13,4.5,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(x+8,y-13,4.5,0,Math.PI*2); c.fill();
  c.fillStyle='#a07050'; c.beginPath(); c.arc(x,y-10,9,0,Math.PI*2); c.fill(); }
function drawBook(c,x,y){ [{c:'#e74c3c',y:0,w:22},{c:'#3498db',y:-6,w:20},{c:'#2ecc71',y:-12,w:18}].forEach(b=>{ c.fillStyle=b.c; c.fillRect(x-b.w/2,y+b.y-4,b.w,6); }); }
function drawDice(c,x,y){ c.fillStyle='#fff'; c.fillRect(x-10,y-10,20,20); c.strokeStyle='#999'; c.lineWidth=1; c.strokeRect(x-10,y-10,20,20);
  c.fillStyle='#000'; [[-4,-4],[4,-4],[-4,4],[4,4],[0,0]].forEach(([dx,dy])=>{ c.beginPath(); c.arc(x+dx,y+dy,1.8,0,Math.PI*2); c.fill(); }); }
function drawGamepad(c,x,y){ c.fillStyle='#2c3e50'; c.beginPath(); c.ellipse(x,y,16,9,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(x-12,y+2,6,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(x+12,y+2,6,0,Math.PI*2); c.fill();
  c.fillStyle='#e74c3c'; c.beginPath(); c.arc(x+8,y-3,2,0,Math.PI*2); c.fill();
  c.fillStyle='#f1c40f'; c.beginPath(); c.arc(x+12,y,2,0,Math.PI*2); c.fill(); }
function drawDrink(c,x,y,type,empty){
  c.fillStyle='rgba(220,230,240,.35)'; c.beginPath(); c.moveTo(x-6,y-14); c.lineTo(x-5,y); c.lineTo(x+5,y); c.lineTo(x+6,y-14); c.closePath(); c.fill();
  if (!empty){ const color=type==='cola'?'#8b3a1a':'#e8a020'; c.fillStyle=color; c.beginPath(); c.moveTo(x-5.3,y-10); c.lineTo(x-5,y-1); c.lineTo(x+5,y-1); c.lineTo(x+5.3,y-10); c.closePath(); c.fill(); } }
function drawMarshmallow(c,x,y,m){ c.strokeStyle='#8b5a3c'; c.lineWidth=2; c.beginPath(); c.moveTo(x,y+14); c.lineTo(x,y-4); c.stroke();
  let color='#fff6e0';
  if (m && m.taken && !m.ready){ const p=1-(m.cooking/10); color=`rgb(255,${Math.round(246-p*120)},${Math.round(224-p*160)})`; }
  else if (m && m.ready) color='#c08850';
  c.fillStyle=color; c.fillRect(x-7,y-14,14,12); }
function updateSceneAmbient(dt,W,H){
  if (!state.scene.splashes) state.scene.splashes=[];
  for (let i=state.scene.splashes.length-1;i>=0;i--){ const s=state.scene.splashes[i]; s.life-=dt; s.x+=s.vx*dt; s.y+=s.vy*dt; s.vy+=500*dt; if (s.life<=0) state.scene.splashes.splice(i,1); }
  if (state.scene.location==='beach'){
    if (!state.scene.seaItems) state.scene.seaItems=[];
    if (Math.random()<0.02){
      const isFish=Math.random()<0.6;
      const colors=['#f39c12','#3498db','#e74c3c','#f1c40f','#9b59b6','#1abc9c'];
      state.scene.seaItems.push({x:isFish?-30:30+Math.random()*(W-60), y:H*0.6+Math.random()*(H*0.2), emoji:isFish?'fish':'crab', vx:isFish?(60+Math.random()*60):(Math.random()-0.5)*30, color:colors[Math.floor(Math.random()*colors.length)], phase:Math.random()*Math.PI*2, life:isFish?6+Math.random()*2:4+Math.random()*2});
    }
    for (let i=state.scene.seaItems.length-1;i>=0;i--){ const it=state.scene.seaItems[i]; it.life-=dt; it.x+=it.vx*dt; if (it.life<=0||it.x>W+40||it.x<-40) state.scene.seaItems.splice(i,1); }
  }
}
function getPlatforms(loc,W,H){
  const g=getGroundY(H);
  if (loc==='forest') return [{x1:30,x2:100,top:g-18},{x1:W/2-42,x2:W/2+42,top:g-22},{x1:W-100,x2:W-30,top:g-18}];
  if (loc==='couch'){ const cx=W/2; return [{x1:cx-85,x2:cx+85,top:g-42},{x1:cx+100,x2:cx+155,top:g-60}]; }
  return [];
}
function initToys(W,H){
  const g=getGroundY(H);
  state.scene.toys=[
    {x:W*0.14,y:g-14,vx:0,vy:0,type:'teddy',rot:0,vr:0,held:false},
    {x:W*0.28,y:g-14,vx:0,vy:0,type:'ball',rot:0,vr:0,held:false},
    {x:W*0.72,y:g-14,vx:0,vy:0,type:'gamepad',rot:0,vr:0,held:false},
    {x:W*0.86,y:g-14,vx:0,vy:0,type:'book',rot:0,vr:0,held:false},
    {x:W*0.56,y:g-14,vx:0,vy:0,type:'dice',rot:0,vr:0,held:false}
  ];
  if (typeof broadcast==='function') broadcast({type:'toys', toys: state.scene.toys});
}
function updateToys(dt,W,H){
  if (state.scene.location!=='couch') return;
  if (!state.scene.toys){ initToys(W,H); return; }
  const g=getGroundY(H);
  state.scene.toys.forEach(t=>{ if (t.held) return;
    t.vy+=GRAVITY*dt; t.x+=t.vx*dt; t.y+=t.vy*dt; t.rot+=t.vr*dt; t.vx*=0.985; t.vr*=0.97;
    if (t.y>=g-6){ t.y=g-6; if (Math.abs(t.vy)>60) t.vy=-t.vy*0.35; else t.vy=0; t.vx*=0.9; }
    if (t.x<20){ t.x=20; t.vx=-t.vx*0.6; } if (t.x>W-20){ t.x=W-20; t.vx=-t.vx*0.6; } });
}
function findNearestToy(){
  if (!state.user) return null;
  const me=state.scene.chars[state.user.id]; if (!me||!state.scene.toys) return null;
  let best=null, bestD=55;
  state.scene.toys.forEach((t,idx)=>{ if (t.held) return; const d=Math.hypot(t.x-me.x,t.y-me.y); if (d<bestD){ bestD=d; best={idx,...t}; } });
  return best;
}
function initMarshmallows(W,H){
  const g=getGroundY(H); const fx=W/2;
  state.scene.marshmallows=[
    {x:fx-40,y:g-12,taken:false,cooking:0,ready:false},
    {x:fx-25,y:g-12,taken:false,cooking:0,ready:false},
    {x:fx+25,y:g-12,taken:false,cooking:0,ready:false},
    {x:fx+40,y:g-12,taken:false,cooking:0,ready:false}
  ];
  if (typeof broadcast==='function') broadcast({type:'marshmallows', marshmallows: state.scene.marshmallows});
}
function updateMarshmallows(dt){
  if (state.scene.location!=='forest'||!state.scene.marshmallows) return;
  let changed=false;
  state.scene.marshmallows.forEach(m=>{ if (m.cooking>0&&!m.ready){ m.cooking-=dt; if (m.cooking<=0){ m.cooking=0; m.ready=true; if (typeof SFX!=='undefined') SFX.play('marshReady'); changed=true; } } });
  if (changed && typeof broadcast==='function') broadcast({type:'marshmallows', marshmallows: state.scene.marshmallows});
}
function initDrinks(W,H){
  const g=getGroundY(H);
  state.scene.drinks=[
    {x:W*0.35,y:g-8,type:'cola',taken:false,empty:false},
    {x:W*0.55,y:g-8,type:'juice',taken:false,empty:false}
  ];
  if (typeof broadcast==='function') broadcast({type:'drinks', drinks: state.scene.drinks});
}
function _rewardGameWin(game, winnerSide){
  try {
    const myMember = state.members?.[state.user?.id];
    if (!myMember) return;
    const mySide = (myMember.role === 'host') ? 'left' : 'right';
    if (winnerSide !== mySide) return;
    const obj = state.scene[game];
    if (obj && obj._rewarded) return;
    if (obj) obj._rewarded = true;
    const amount = (game === 'football' || game === 'volleyball') ? 10 : 5;
    if (typeof window.addCoins === 'function'){
      window.addCoins(amount);
      if (typeof addSystemMessage === 'function') addSystemMessage(`🏆 +${amount} монет за ${game}!`);
    }
  } catch(e){ console.error('[WEF][Reward] error:', e); }
}
window._rewardGameWin = _rewardGameWin;
window.rewardWin = _rewardGameWin;

/* ФУТБОЛ */
function initFootball(W,H){
  const g=getGroundY(H);
  state.scene.football={ ball:{x:W/2,y:g-12,vx:0,vy:0,radius:11}, goalLeft:0, goalRight:0, goalLeftX:20, goalRightX:W-20, goalW:40, goalTop:g-80, time:0, finished:false, winner:null };
  if (typeof broadcast==='function') broadcast({type:'football', football: state.scene.football});
}
function updateFootball(dt,W,H){
  if (state.scene.location!=='football') return;
  if (!state.scene.football) initFootball(W,H);
  const g=getGroundY(H); const fb=state.scene.football;
  if (fb.finished) return;
  const ball=fb.ball; fb.time+=dt;
  ball.vy+=GRAVITY*dt*1.2; ball.x+=ball.vx*dt; ball.y+=ball.vy*dt;
  ball.vx*=0.97; ball.vy*=0.97;
  if (ball.y>=g-ball.radius){
    ball.y=g-ball.radius;
    ball.vy=-ball.vy*0.25;
    if (Math.abs(ball.vy)<40) ball.vy=0;
  }
  if (ball.x < 0 && ball.y <= fb.goalTop){ ball.x = 0; ball.vx = -ball.vx * 0.5; }
  if (ball.x > W && ball.y <= fb.goalTop){ ball.x = W; ball.vx = -ball.vx * 0.5; }
  if (ball.x < -40) { ball.x = -40; ball.vx = 0; }
  if (ball.x > W + 40) { ball.x = W + 40; ball.vx = 0; }
  Object.values(state.scene.chars).forEach(c=>{
    const footY = c.y - 15;
    const d = Math.hypot(c.x-ball.x, footY-ball.y);
    if (d < 22){
      const dx = ball.x - c.x, dy = ball.y - footY;
      const dist = Math.max(1, Math.hypot(dx,dy));
      ball.vx += (dx/dist) * 60;
      ball.vy += (dy/dist) * 30 - 15;
    }
  });
  const resetBall=()=>{
    ball.x=W/2; ball.y=g-12; ball.vx=0; ball.vy=0;
    Object.entries(state.scene.chars).forEach(([id, c])=>{
      const member = state.members[id];
      if (!member) return;
      const isLeft = member.role === 'host';
      c.x = isLeft ? W*0.25 : W*0.75;
      c.y = g;
      c.vy = 0; c.vx = 0;
      c.onGround = true;
      c.charState = 'idle';
    });
  };
  if (ball.x <= 4 && ball.y > fb.goalTop){
    fb.goalRight++;
    if (typeof SFX!=='undefined') SFX.play('goal');
    if (typeof addSystemMessage==='function') addSystemMessage(`⚽ ГОЛ! Счёт: ${fb.goalLeft} : ${fb.goalRight}`);
    if (fb.goalRight>=5){ fb.finished=true; fb.winner='right'; _rewardGameWin('football','right'); }
    if (!fb.finished) resetBall();
    if (typeof broadcast==='function') broadcast({type:'football', football: fb});
    return;
  }
  if (ball.x >= W - 4 && ball.y > fb.goalTop){
    fb.goalLeft++;
    if (typeof SFX!=='undefined') SFX.play('goal');
    if (typeof addSystemMessage==='function') addSystemMessage(`⚽ ГОЛ! Счёт: ${fb.goalLeft} : ${fb.goalRight}`);
    if (fb.goalLeft>=5){ fb.finished=true; fb.winner='left'; _rewardGameWin('football','left'); }
    if (!fb.finished) resetBall();
    if (typeof broadcast==='function') broadcast({type:'football', football: fb});
  }
}
function findNearestBall(){
  if (!state.user) return null;
  const me=state.scene.chars[state.user.id]; const fb=state.scene.football;
  if (!me||!fb||!fb.ball) return null;
  return Math.hypot(fb.ball.x-me.x, fb.ball.y-me.y)<50 ? fb.ball : null;
}
function renderFootball(W,H,t){
  const g=getGroundY(H); const fb=state.scene.football;
  for (let i=0;i<W;i+=50){ ctx.fillStyle=(Math.floor(i/50)%2===0)?'#1a4a1a':'#1e5e1e'; ctx.fillRect(i,0,50,g); }
  ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,g); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2,g/2,40,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='#ecf0f1';
  ctx.fillRect(0,fb.goalTop,6,g-fb.goalTop); ctx.fillRect(0,fb.goalTop,fb.goalW,4);
  ctx.fillRect(W-6,fb.goalTop,6,g-fb.goalTop); ctx.fillRect(W-fb.goalW,fb.goalTop,fb.goalW,4);
  ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(W/2-50,8,100,32);
  ctx.fillStyle='#ffd700'; ctx.font='bold 20px Inter, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(`${fb.goalLeft} : ${fb.goalRight}`, W/2, 24);
  if (fb.ball) drawSoccerBall(ctx,fb.ball.x,fb.ball.y);
  if (fb.finished) showMatchResult(fb.winner,'football'); else hideMatchResult();
}

/* ВОЛЕЙБОЛ */
function initVolleyball(W,H){
  const g=getGroundY(H);
  const ids=Object.keys(state.scene.chars);
  const serverId = ids.length ? ids[Math.floor(Math.random()*ids.length)] : null;
  const server = serverId ? state.scene.chars[serverId] : null;
  state.scene.volleyball={
    ball:{
      x: server ? server.x : W/2,
      y: server ? server.y - 55 : g - 180,
      vx:0, vy:0, radius:10,
      heldBy: serverId, lastHitBy:null, isLive:false
    },
    scoreLeft:0, scoreRight:0, netX:W/2, netY:g-90,
    time:0, finished:false, winner:null, servingId: serverId
  };
  if (typeof broadcast==='function') broadcast({type:'volleyball', volleyball: state.scene.volleyball});
}
function updateVolleyball(dt,W,H){
  if (state.scene.location!=='volleyball') return;
  if (!state.scene.volleyball) initVolleyball(W,H);
  const g=getGroundY(H); const vb=state.scene.volleyball;
  if (vb.finished) return;
  const ball=vb.ball; vb.time+=dt;
  if (ball.heldBy){
    const holder = state.scene.chars[ball.heldBy];
    if (holder){
      ball.x = holder.x + (holder.facing||1)*15;
      ball.y = holder.y - 55;
      ball.vx = 0; ball.vy = 0;
    } else {
      ball.heldBy = null;
      ball.vy = 50;
    }
    const now=performance.now();
    if (now-state.scene.lastSent>300){
      state.scene.lastSent=now;
      if (typeof broadcast==='function') broadcast({type:'volleyball', volleyball: vb});
    }
    return;
  }
  ball.vy += GRAVITY*dt*0.28; ball.x += ball.vx*dt; ball.y += ball.vy*dt;
  ball.vx *= 0.985; ball.vy *= 0.99;
  const maxSpeed=220;
  if (Math.abs(ball.vx)>maxSpeed) ball.vx=Math.sign(ball.vx)*maxSpeed;
  if (Math.abs(ball.vy)>maxSpeed) ball.vy=Math.sign(ball.vy)*maxSpeed;
  if (ball.y >= g - ball.radius){
    ball.y = g - ball.radius;
    if (ball.lastHitBy === 'left') vb.scoreRight++;
    else if (ball.lastHitBy === 'right') vb.scoreLeft++;
    else {
      const side = ball.x < vb.netX ? 'left' : 'right';
      if (side === 'left') vb.scoreRight++; else vb.scoreLeft++;
    }
    if (typeof SFX!=='undefined') SFX.play('goal');
    if (typeof addSystemMessage==='function') addSystemMessage(`🏐 Очко! Счёт: ${vb.scoreLeft} : ${vb.scoreRight}`);
    if (vb.scoreLeft>=5){ vb.finished=true; vb.winner='left'; _rewardGameWin('volleyball','left'); }
    else if (vb.scoreRight>=5){ vb.finished=true; vb.winner='right'; _rewardGameWin('volleyball','right'); }
    else {
      const ids = Object.keys(state.scene.chars);
      const newServerId = ids.length ? ids[Math.floor(Math.random()*ids.length)] : null;
      ball.heldBy = newServerId;
      ball.isLive = false;
      ball.lastHitBy = null;
      ball.vx = 0; ball.vy = 0;
      if (newServerId && state.scene.chars[newServerId]){
        ball.x = state.scene.chars[newServerId].x;
        ball.y = state.scene.chars[newServerId].y - 55;
      }
      vb.servingId = newServerId;
      if (typeof addSystemMessage==='function') addSystemMessage(`🏐 Подача у ${state.scene.chars[newServerId]?.name || '???'}`);
    }
    if (typeof broadcast==='function') broadcast({type:'volleyball', volleyball: vb});
    return;
  }
  if (ball.x<ball.radius){ ball.x=ball.radius; ball.vx=-ball.vx*0.5; }
  if (ball.x>W-ball.radius){ ball.x=W-ball.radius; ball.vx=-ball.vx*0.5; }
  const netX=vb.netX, netTop=vb.netY;
  if (ball.x>netX-12 && ball.x<netX+12 && ball.y>netTop){
    ball.vx=-ball.vx*0.55;
    ball.x = ball.x < netX ? netX-12 : netX+12;
  }
  Object.values(state.scene.chars).forEach(c=>{
    const headY=c.y-45;
    const d=Math.hypot(c.x-ball.x, headY-ball.y);
    if (d<38){
      const dx=ball.x-c.x, dy=ball.y-headY;
      const dist=Math.max(1,Math.hypot(dx,dy));
      ball.vx+=(dx/dist)*45; ball.vy+=(dy/dist)*22-65;
      ball.lastHitBy = c.x < vb.netX ? 'left' : 'right';
      ball.isLive = true;
      if (typeof SFX!=='undefined') SFX.play('ballHit');
    }
  });
}
function renderVolleyball(W,H,t){
  const g=getGroundY(H); const vb=state.scene.volleyball;
  ctx.fillStyle='#4a3a1a'; ctx.fillRect(0,g,W,H-g);
  ctx.fillStyle='#3a2a10'; ctx.fillRect(0,g,W,4);
  const netX=vb.netX, netTop=vb.netY;
  ctx.strokeStyle='#ddd'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(netX,g); ctx.lineTo(netX,netTop); ctx.stroke();
  for (let i=0;i<8;i++){ ctx.beginPath(); ctx.moveTo(netX-12,netTop+i*10); ctx.lineTo(netX+12,netTop+i*10); ctx.stroke(); }
  ctx.fillStyle='#888'; ctx.fillRect(netX-2,netTop,4,g-netTop);
  ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(W/2-50,8,100,32);
  ctx.fillStyle='#ffd700'; ctx.font='bold 20px Inter, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(`${vb.scoreLeft} : ${vb.scoreRight}`, W/2, 24);
  if (vb.ball) drawVolleyball(ctx,vb.ball.x,vb.ball.y);
  if (vb.ball && vb.ball.heldBy === state.user?.id){
    ctx.save(); ctx.fillStyle='#ffd700'; ctx.font='bold 13px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('✊ Жми ✊ — бросок через сетку', W/2, H-30); ctx.restore();
  } else if (vb.ball && vb.ball.heldBy){
    const holder = state.scene.chars[vb.ball.heldBy];
    if (holder){
      ctx.save(); ctx.fillStyle='#a896b8'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
      ctx.fillText(`🏐 Мяч у ${holder.name||'???'}`, W/2, H-30); ctx.restore();
    }
  }
  if (vb.finished) showMatchResult(vb.winner,'volleyball'); else hideMatchResult();
}
function showMatchResult(winner, type){
  const res=document.getElementById('match-result'); if (!res) return;
  res.style.display='block';
  const textEl=document.getElementById('match-winner-text');
  if (winner==='draw') textEl.textContent='🤝 Ничья!';
  else textEl.textContent = winner==='left'?'🏆 Оранжевые победили!':'🏆 Синие победили!';
  res.dataset.type=type;
}
function hideMatchResult(){ const res=document.getElementById('match-result'); if (res) res.style.display='none'; }
window.restartMatch = function(){
  const res=document.getElementById('match-result');
  const type=res?.dataset.type||'volleyball';
  if (type==='football'){ state.scene.football=null; if (typeof initFootball==='function') initFootball(canvas.clientWidth, canvas.clientHeight); }
  else if (type==='broom'){ state.scene.broom=null; if (typeof initBroom==='function') initBroom(canvas.clientWidth, canvas.clientHeight); }
  else if (type==='tetris'){ state.scene.tetris=null; if (typeof initTetris==='function') initTetris(canvas.clientWidth, canvas.clientHeight); }
  else if (type==='tictactoe'){ state.scene.tictactoe=null; if (typeof initTicTacToe==='function') initTicTacToe(canvas.clientWidth, canvas.clientHeight); }
  else if (type==='bottle'){ state.scene.bottle=null; if (typeof initBottle==='function') initBottle(canvas.clientWidth, canvas.clientHeight); }
  else { state.scene.volleyball=null; if (typeof initVolleyball==='function') initVolleyball(canvas.clientWidth, canvas.clientHeight); }
  hideMatchResult();
};

/* МЕТЁЛКИ */
function initBroom(W,H){
  const players={};
  const ids = Object.keys(state.scene.chars);
  let hostId = ids.find(id => state.members[id]?.role === 'host') || ids[0];
  ids.forEach((id) => {
    const slot = (id === hostId) ? 0 : 1;
    players[id] = { x: slot===0?W*0.25:W*0.75, y: H*0.7, vx:0, vy:0, score:0, hitCooldown:0, respawnTimer:0, slot };
  });
  state.scene.broom = { players, candies:[], bats:[], time:0, finished:false, winner:null, spawnTimer:0, lastSent:0 };
  for (let i=0;i<3;i++) _spawnCandyForSlot(W,H,0);
  for (let i=0;i<3;i++) _spawnCandyForSlot(W,H,1);
  for (let i=0;i<2;i++) spawnBat(W,H);
  if (typeof broadcast==='function') broadcast({type:'broom', broom: state.scene.broom});
}
function _spawnCandyForSlot(W,H,slot){
  if (!state.scene.broom) return;
  const b = state.scene.broom;
  const x = slot === 0 ? 30 + Math.random()*(W/2 - 60) : W/2 + 30 + Math.random()*(W/2 - 60);
  b.candies.push({ x, y: 60 + Math.random()*(H - 160), slot, type: ['🍬','🍭','🍫','🧁'][Math.floor(Math.random()*4)], phase: Math.random()*Math.PI*2 });
}
window._spawnCandyForSlot = _spawnCandyForSlot;
function spawnCandy(W,H){ if (!state.scene.broom) return; const b=state.scene.broom;
  const slot=Math.random()<0.5?0:1;
  const x=slot===0?30+Math.random()*(W/2-60):W/2+30+Math.random()*(W/2-60);
  b.candies.push({ x, y:60+Math.random()*(H-160), slot, type:['🍬','🍭','🍫','🧁'][Math.floor(Math.random()*4)], phase:Math.random()*Math.PI*2 }); }
function spawnBat(W,H){ if (!state.scene.broom) return; const b=state.scene.broom;
  const slot=Math.random()<0.5?0:1;
  const x=slot===0?30+Math.random()*(W/2-60):W/2+30+Math.random()*(W/2-60);
  b.bats.push({ x, y:40+Math.random()*(H-120), vx:(Math.random()-0.5)*80, vy:(Math.random()-0.5)*60, slot, phase:Math.random()*Math.PI*2 }); }
function updateBroom(dt,W,H){
  if (state.scene.location!=='broom') return;
  if (!state.scene.broom) initBroom(W,H);
  const b=state.scene.broom; if (b.finished) return;
  b.time+=dt; b.spawnTimer+=dt;

  // ✅ Авто-добавление новых игроков ДО проверки myP
  Object.entries(state.scene.chars).forEach(([id]) => {
    if (!b.players[id]){
      const member = state.members[id];
      const slot = member?.role === 'host' ? 0 : 1;
      b.players[id] = { x: slot===0?W*0.25:W*0.75, y: H*0.7, vx:0, vy:0, score:0, hitCooldown:0, respawnTimer:0, slot };
    }
  });
  const myP=b.players[state.user?.id]; if (!myP) return;

  if (b.spawnTimer>1.6){ b.spawnTimer=0; if (b.candies.length<8) spawnCandy(W,H); if (b.bats.length<3) spawnBat(W,H); }
  let ax=0, ay=0;
  if (state.keys.left) ax-=1; if (state.keys.right) ax+=1;
  if (state.keys.up) ay-=1; if (state.keys.down) ay+=1;
  if (myP.respawnTimer>0){ myP.respawnTimer-=dt;
    if (myP.respawnTimer<=0){ myP.x=myP.slot===0?W*0.25:W*0.75; myP.y=H*0.7; myP.vx=0; myP.vy=0; }
  } else { myP.vx+=ax*800*dt; myP.vy+=ay*800*dt; myP.vx*=0.9; myP.vy*=0.9; myP.x+=myP.vx*dt; myP.y+=myP.vy*dt;
    const minX=myP.slot===0?20:W/2+20, maxX=myP.slot===0?W/2-20:W-20;
    myP.x=Math.max(minX,Math.min(maxX,myP.x)); myP.y=Math.max(40,Math.min(H-40,myP.y)); }
  for (let i=b.candies.length-1;i>=0;i--){ const c=b.candies[i];
    if (c.slot!==myP.slot) continue;
    c.phase+=dt*3;
    if (myP.respawnTimer<=0 && Math.hypot(c.x-myP.x,c.y-myP.y)<28){ myP.score++; b.candies.splice(i,1);
      if (typeof SFX!=='undefined') SFX.play('candy');
      if (myP.score>=10 && !b.finished){ b.finished=true; b.winner=state.user.id;
        if (typeof addSystemMessage==='function') addSystemMessage(`🧹 ${state.user.name} собрал 10 конфет!`);
        if (typeof window.rewardWin==='function') window.rewardWin('broom', state.user.id); } } }
  if (myP.respawnTimer<=0){
    for (let i=b.bats.length-1;i>=0;i--){ const bat=b.bats[i];
      bat.phase+=dt*4; bat.x+=bat.vx*dt+Math.sin(bat.phase)*30*dt; bat.y+=bat.vy*dt+Math.cos(bat.phase*1.3)*25*dt;
      if (bat.x<20||bat.x>W-20) bat.vx*=-1; if (bat.y<20||bat.y>H-20) bat.vy*=-1;
      if (bat.slot!==myP.slot) continue;
      if (Math.hypot(bat.x-myP.x,bat.y-myP.y)<26){ myP.respawnTimer=1.2; myP.vx=0; myP.vy=0;
        if (typeof SFX!=='undefined') SFX.play('hit'); b.bats.splice(i,1); break; } } }
  const now=performance.now();
  if (now-(b.lastSent||0)>250){ b.lastSent=now;
    if (typeof broadcast==='function'){ const pc={};
      Object.entries(b.players).forEach(([id,p])=>{ pc[id]={x:p.x,y:p.y,score:p.score,slot:p.slot,respawnTimer:p.respawnTimer}; });
      broadcast({type:'broom', broom:{ players:pc, candies:b.candies, bats:b.bats, finished:b.finished, winner:b.winner }}); } }
  if (b.finished && typeof showMatchResult==='function'){
    const lp=Object.values(b.players).find(p=>p.slot===0);
    const winnerSlot=(lp?.score>=10)?0:1;
    showMatchResult(winnerSlot===0?'left':'right','broom'); }
}
function applyBroomData(data){
  if (!data.broom) return;
  if (!state.scene.broom){ state.scene.broom=data.broom; return; }
  const b=state.scene.broom;
  b.candies=data.broom.candies||[]; b.bats=data.broom.bats||[];
  b.finished=data.broom.finished||false; b.winner=data.broom.winner;
  if (data.broom.players){ Object.entries(data.broom.players).forEach(([id,p])=>{
    if (id===state.user.id) return;
    if (!b.players[id]) b.players[id]={...p}; else Object.assign(b.players[id],p); }); }
}
function renderBroom(W,H,t){
  const b=state.scene.broom; if (!b) return;
  const midX=W/2;
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0a0520'); g.addColorStop(0.5,'#1a0a2a'); g.addColorStop(1,'#0a0520');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  for (let i=0;i<60;i++){ const sx=(i*97)%W, sy=(i*53)%H; ctx.fillStyle='#fff'; ctx.fillRect(sx,sy,1.5,1.5); }
  ctx.fillStyle='#f5e8c0'; ctx.beginPath(); ctx.arc(W-60,40,25,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(255,200,120,.3)'; ctx.lineWidth=2; ctx.setLineDash([8,8]);
  ctx.beginPath(); ctx.moveTo(midX,0); ctx.lineTo(midX,H); ctx.stroke(); ctx.setLineDash([]);
  b.candies.forEach(c=>{ const bob=Math.sin(c.phase)*3; ctx.save(); ctx.translate(c.x,c.y+bob);
    ctx.font='22px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(c.type||'🍬',0,0); ctx.restore(); });
  b.bats.forEach(bat=>drawBat(ctx,bat.x,bat.y,t+bat.phase));
  Object.entries(b.players||{}).forEach(([id,p])=>{
    const isMe = id === state.user?.id;
    const charData = state.scene.chars[id];
    const memberData = state.members[id];
    const character = charData?.character || memberData?.character || {style:'animal',species:'cat',skinColor:null,hat:'none',clothes:'#3498db'};
    ctx.globalAlpha = p.respawnTimer > 0 ? 0.35 : 1;
    ctx.save();
    ctx.translate(p.x, p.y + 10);
    ctx.fillStyle = '#6b4226'; ctx.fillRect(-24, 0, 48, 4);
    ctx.fillStyle = '#c9a45a';
    ctx.beginPath();
    ctx.moveTo(24, -2); ctx.lineTo(38, -10); ctx.lineTo(38, 10); ctx.lineTo(24, 4);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    const facing = p.vx > 5 ? 1 : (p.vx < -5 ? -1 : 1);
    drawCharacter(ctx, character, {
      x: p.x, y: p.y + 10, facing, walkPhase: 0, charState: 'jump', action: 'none'
    });
    if (isMe){
      ctx.save();
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y - 5, 32, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });
  const lp=Object.values(b.players||{}).find(p=>p.slot===0);
  const rp=Object.values(b.players||{}).find(p=>p.slot===1);
  ctx.save(); ctx.font='bold 20px Inter, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(20,10,130,34);
  ctx.fillStyle='#f39c12'; ctx.fillText(`🍬 ${lp?lp.score:0} / 10`, 85, 27);
  ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(W-150,10,130,34);
  ctx.fillStyle='#3498db'; ctx.fillText(`🍬 ${rp?rp.score:0} / 10`, W-85, 27);
  ctx.restore();
  if (b.finished){ const winnerSlot=(lp?.score>=10)?0:1; if (typeof showMatchResult==='function') showMatchResult(winnerSlot===0?'left':'right','broom'); }
}
function drawWitch(c,x,y,color,isMe,t){
  c.save(); c.translate(x,y);
  c.fillStyle='#6b4226'; c.fillRect(-22,0,44,4);
  c.fillStyle='#c9a45a'; c.beginPath(); c.moveTo(22,-2); c.lineTo(34,-8); c.lineTo(34,8); c.lineTo(22,4); c.closePath(); c.fill();
  c.fillStyle=color; c.beginPath(); c.ellipse(0,-8,10,14,0,0,Math.PI*2); c.fill();
  c.fillStyle='#f5d5b8'; c.beginPath(); c.arc(0,-24,8,0,Math.PI*2); c.fill();
  c.fillStyle='#2c1a3a'; c.beginPath(); c.moveTo(-14,-28); c.lineTo(14,-28); c.lineTo(0,-46); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(0,-28,16,3,0,0,Math.PI*2); c.fill();
  c.fillStyle='#fff'; c.beginPath(); c.arc(-3,-25,1.8,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(3,-25,1.8,0,Math.PI*2); c.fill();
  c.fillStyle='#000'; c.beginPath(); c.arc(-3,-25,0.8,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(3,-25,0.8,0,Math.PI*2); c.fill();
  if (isMe){ c.strokeStyle='#ffd700'; c.lineWidth=2; c.beginPath(); c.arc(0,-15,24,0,Math.PI*2); c.stroke(); }
  c.restore();
}

/* ТЕТРИС */
const TETROMINOES = [
  { shape:[[1,1,1,1]], color:'#00f0f0' }, { shape:[[1,1],[1,1]], color:'#f0f000' },
  { shape:[[0,1,0],[1,1,1]], color:'#a000f0' }, { shape:[[1,0,0],[1,1,1]], color:'#0000f0' },
  { shape:[[0,0,1],[1,1,1]], color:'#f0a000' }, { shape:[[0,1,1],[1,1,0]], color:'#00f000' },
  { shape:[[1,1,0],[0,1,1]], color:'#f00000' }
];
const TETRIS_COLS=10, TETRIS_ROWS=16;
function createTetrisBoard(){ const b=[]; for (let y=0;y<TETRIS_ROWS;y++) b.push(new Array(TETRIS_COLS).fill(null)); return b; }
function randomPiece(){ return JSON.parse(JSON.stringify(TETROMINOES[Math.floor(Math.random()*TETROMINOES.length)])); }
function initTetris(W,H){
  const players={};
  const ids=Object.keys(state.scene.chars);
  ids.forEach((id)=>{
    const member = state.members[id];
    const slot = member?.role === 'host' ? 0 : 1;
    players[id]={ board:createTetrisBoard(), current:randomPiece(), nextPiece:randomPiece(), cx:3, cy:0, slot, score:0, dropTimer:0, timeAccum:0, dropSpeed:1.5, finished:false };
  });
  state.scene.tetris={ players, time:0, finished:false, winner:null, lastSent:0 };
  if (typeof broadcast==='function') broadcast({type:'tetris', tetris: state.scene.tetris});
}
function tetrisCollide(board, shape, ox, oy){
  for (let y=0;y<shape.length;y++) for (let x=0;x<shape[y].length;x++){
    if (!shape[y][x]) continue;
    const bx=ox+x, by=oy+y;
    if (bx<0||bx>=TETRIS_COLS||by>=TETRIS_ROWS) return true;
    if (by>=0 && board[by][bx]) return true;
  }
  return false;
}
function tetrisLock(p){
  if (!p || !p.current) return;
  const sh=p.current.shape;
  for (let y=0;y<sh.length;y++) for (let x=0;x<sh[y].length;x++){
    if (sh[y][x]){ const by=p.cy+y, bx=p.cx+x;
      if (by>=0 && by<TETRIS_ROWS && bx>=0 && bx<TETRIS_COLS) p.board[by][bx]=p.current.color; } }
  let cleared=0;
  for (let y=TETRIS_ROWS-1;y>=0;y--){
    if (p.board[y].every(c=>c)){ p.board.splice(y,1); p.board.unshift(new Array(TETRIS_COLS).fill(null)); cleared++; y++; } }
  if (cleared>0){ p.score+=cleared;
    if (typeof SFX!=='undefined') SFX.play('goal');
    if (typeof addSystemMessage==='function') addSystemMessage('🧱 Линия! Очки: '+p.score);
    if (p.score>=4){ p.finished=true; state.scene.tetris.finished=true; state.scene.tetris.winner=p.slot;
      if (typeof window.rewardWin==='function') window.rewardWin('tetris', p.slot===0?'left':'right');
      return; } }
  p.current = p.nextPiece || randomPiece();
  p.nextPiece = randomPiece();
  p.cx=3; p.cy=0; p.dropTimer=0;
  if (tetrisCollide(p.board, p.current.shape, p.cx, p.cy)){ p.finished=true; state.scene.tetris.finished=true; state.scene.tetris.winner = p.slot===0 ? 1 : 0;
    if (typeof window.rewardWin==='function') window.rewardWin('tetris', state.scene.tetris.winner===0?'left':'right'); }
}
function updateTetris(dt,W,H){
  if (state.scene.location!=='tetris') return;
  if (!state.scene.tetris) initTetris(W,H);
  const tb=state.scene.tetris;
  if (tb.finished) return;

  // ✅ Авто-добавление новых игроков
  Object.entries(state.scene.chars).forEach(([id]) => {
    if (!tb.players[id]){
      const member = state.members[id];
      const slot = member?.role === 'host' ? 0 : 1;
      tb.players[id] = {
        board:createTetrisBoard(), current:randomPiece(), nextPiece:randomPiece(),
        cx:3, cy:0, slot, score:0, dropTimer:0, timeAccum:0, dropSpeed:1.5, finished:false
      };
    }
  });

  tb.time+=dt;
  const myP=tb.players[state.user?.id];
  if (!myP) return;
  if (myP.finished) return;
  if (typeof myP.dropTimer!=='number' || isNaN(myP.dropTimer)) myP.dropTimer=0;
  if (typeof myP.dropSpeed!=='number' || myP.dropSpeed<=0) myP.dropSpeed=1.5;
  if (!myP.current || !myP.current.shape) myP.current=randomPiece();
  if (!myP.board) myP.board=createTetrisBoard();
  if (typeof myP.cx!=='number') myP.cx=3;
  if (typeof myP.cy!=='number') myP.cy=0;
  if (typeof myP.timeAccum!=='number') myP.timeAccum=0;
  if (state.keys.left){ if (!tetrisCollide(myP.board, myP.current.shape, myP.cx-1, myP.cy)) myP.cx--; state.keys.left=false; }
  if (state.keys.right){ if (!tetrisCollide(myP.board, myP.current.shape, myP.cx+1, myP.cy)) myP.cx++; state.keys.right=false; }
  const speedMul = state.keys.down ? 5 : 1;
  myP.dropTimer += dt * speedMul;
  myP.timeAccum += dt;
  const needDrop = myP.dropTimer >= myP.dropSpeed || myP.timeAccum >= 1.5;
  if (needDrop){ myP.dropTimer=0; myP.timeAccum=0;
    if (!tetrisCollide(myP.board, myP.current.shape, myP.cx, myP.cy+1)){ myP.cy++; }
    else { tetrisLock(myP); if (myP.finished) return; } }
  const now=performance.now();
  if (now-(tb.lastSent||0)>250){ tb.lastSent=now;
    if (typeof broadcast==='function'){ const pc={};
      Object.entries(tb.players).forEach(([id,p])=>{ pc[id]={ board:JSON.parse(JSON.stringify(p.board)), current:p.current?JSON.parse(JSON.stringify(p.current)):null, nextPiece:p.nextPiece?JSON.parse(JSON.stringify(p.nextPiece)):null, cx:p.cx, cy:p.cy, score:p.score, slot:p.slot, finished:p.finished }; });
      broadcast({type:'tetris', tetris:{players:pc, finished:tb.finished, winner:tb.winner}}); } }
  if (tb.finished && typeof showMatchResult==='function') showMatchResult(tb.winner===0?'left':'right','tetris');
}
function applyTetrisData(data){
  if (!data.tetris) return;
  if (!state.scene.tetris){ state.scene.tetris=data.tetris; return; }
  const tb=state.scene.tetris;
  tb.finished=data.tetris.finished||false; tb.winner=data.tetris.winner;
  if (data.tetris.players){ Object.entries(data.tetris.players).forEach(([id,p])=>{
    if (id===state.user.id) return;
    if (!tb.players[id]) tb.players[id]=p; else Object.assign(tb.players[id],p); }); }
}
function renderTetris(W,H,t){
  const tb=state.scene.tetris; if (!tb) return;
  ctx.fillStyle='#0a0518'; ctx.fillRect(0,0,W,H);
  for (let i=0;i<40;i++){ const sx=(i*89)%W, sy=(i*47)%H; ctx.fillStyle='#fff'; ctx.fillRect(sx,sy,1.5,1.5); }
  const midX=W/2;
  ctx.strokeStyle='rgba(255,200,120,.4)'; ctx.lineWidth=2; ctx.setLineDash([8,8]);
  ctx.beginPath(); ctx.moveTo(midX,0); ctx.lineTo(midX,H); ctx.stroke(); ctx.setLineDash([]);
  const maxBoardW=Math.min(W/2-20, 200);
  const maxBoardH=H-60;
  const boardW=Math.min(maxBoardW, maxBoardH*TETRIS_COLS/TETRIS_ROWS);
  const cell=boardW/TETRIS_COLS;
  const boardH=cell*TETRIS_ROWS;
  const y0=(H-boardH)/2 + 10;
  Object.entries(tb.players||{}).forEach(([id,p])=>{
    const isLeft=p.slot===0;
    const x0=isLeft?midX/2-boardW/2:midX+midX/2-boardW/2;
    ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(x0-3, y0-3, boardW+6, boardH+6);
    ctx.strokeStyle=isLeft?'#f39c12':'#3498db'; ctx.lineWidth=2; ctx.strokeRect(x0, y0, boardW, boardH);
    ctx.strokeStyle='rgba(255,255,255,.06)'; ctx.lineWidth=1;
    for (let i=0;i<=TETRIS_COLS;i++){ ctx.beginPath(); ctx.moveTo(x0+i*cell,y0); ctx.lineTo(x0+i*cell,y0+boardH); ctx.stroke(); }
    for (let i=0;i<=TETRIS_ROWS;i++){ ctx.beginPath(); ctx.moveTo(x0,y0+i*cell); ctx.lineTo(x0+boardW,y0+i*cell); ctx.stroke(); }
    for (let y=0;y<TETRIS_ROWS;y++) for (let x=0;x<TETRIS_COLS;x++){
      const c=p.board?.[y]?.[x];
      if (c){ ctx.fillStyle=c; ctx.fillRect(x0+x*cell+1, y0+y*cell+1, cell-2, cell-2); } }
    if (p.current && !p.finished && p.current.shape){ const sh=p.current.shape; ctx.fillStyle=p.current.color;
      for (let y=0;y<sh.length;y++) for (let x=0;x<sh[y].length;x++){
        if (sh[y][x]) ctx.fillRect(x0+(p.cx+x)*cell+1, y0+(p.cy+y)*cell+1, cell-2, cell-2); } }
    ctx.fillStyle='rgba(0,0,0,.85)'; ctx.fillRect(x0, y0-30, boardW, 24);
    ctx.fillStyle=isLeft?'#f39c12':'#3498db'; ctx.font='bold 14px Inter, sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🧱 '+p.score+' / 4', x0+boardW/2, y0-18);
    const nm = state.scene.chars[id]?.name || state.members[id]?.name || state.members[id]?.login || 'Игрок';
    ctx.fillStyle='#fff'; ctx.font='bold 10px Inter, sans-serif';
    ctx.fillText(nm, x0+boardW/2, y0+boardH+14);
  });
  if (tb.finished && typeof showMatchResult==='function') showMatchResult(tb.winner===0?'left':'right','tetris');
}

/* КРЕСТИКИ-НОЛИКИ */
function initTicTacToe(W, H){
  const players = {};
  const ids = Object.keys(state.scene.chars);
  ids.forEach((id, i) => {
    const slot = i % 2;
    players[id] = { slot, symbol: slot === 0 ? '❌' : '⭕', cursorX: 1, cursorY: 1, board: [null,null,null,null,null,null,null,null,null] };
  });
  state.scene.tictactoe = { players, turn: 0, finished: false, winner: null, line: null, lastSent: 0 };
  if (typeof broadcast === 'function') broadcast({type:'tictactoe', tictactoe:{ players: serializeTicTacToe(state.scene.tictactoe), turn: 0, finished: false, winner: null }});
}
function serializeTicTacToe(tt){
  const out = {};
  Object.entries(tt.players).forEach(([id, p]) => {
    out[id] = { slot: p.slot, symbol: p.symbol, cursorX: p.cursorX, cursorY: p.cursorY, board: p.board.slice() }; });
  return out;
}
function applyTicTacToeData(data){
  if (!data.tictactoe) return;
  if (!state.scene.tictactoe){ state.scene.tictactoe = { players: data.tictactoe.players || {}, turn: data.tictactoe.turn || 0, finished: data.tictactoe.finished || false, winner: data.tictactoe.winner || null, line: data.tictactoe.line || null, lastSent: 0 }; return; }
  const tt = state.scene.tictactoe;
  tt.turn = data.tictactoe.turn;
  tt.finished = data.tictactoe.finished || false;
  tt.winner = data.tictactoe.winner || null;
  tt.line = data.tictactoe.line || null;
  if (data.tictactoe.players){ Object.entries(data.tictactoe.players).forEach(([id, p]) => {
    if (id === state.user.id) return;
    if (!tt.players[id]) tt.players[id] = p;
    else { tt.players[id].cursorX = p.cursorX; tt.players[id].cursorY = p.cursorY; tt.players[id].board = p.board; tt.players[id].symbol = p.symbol; } }); }
}
function isMyTurn(tt, myP){ return tt.turn === myP.slot; }
function checkTicTacToeWin(tt){
  const anyP = Object.values(tt.players)[0];
  if (!anyP) return;
  const b = anyP.board;
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const ln of lines){
    const [a,b2,c] = ln;
    if (b[a] && b[a] === b[b2] && b[a] === b[c]){
      tt.finished = true;
      tt.winner = b[a] === '❌' ? 0 : 1;
      tt.line = ln;
      Object.values(tt.players).forEach(p => { p.board = b.slice(); });
      if (typeof addSystemMessage === 'function') addSystemMessage('⭕❌ ' + (tt.winner === 0 ? 'Крестики' : 'Нолики') + ' победили!');
      if (typeof window.rewardWin==='function') window.rewardWin('tictactoe', tt.winner===0?'left':'right');
      return; } }
  if (b.every(c => c)){ tt.finished = true; tt.winner = 'draw';
    if (typeof addSystemMessage === 'function') addSystemMessage('🤝 Ничья!'); return; }
  tt.turn = 1 - tt.turn;
}
function updateTicTacToe(dt, W, H){
  if (state.scene.location !== 'tictactoe') return;
  if (!state.scene.tictactoe) initTicTacToe(W, H);
  const tt = state.scene.tictactoe;
  if (tt.finished) return;
  const myP = tt.players[state.user?.id];
  if (!myP) return;
  if (state.keys.left && isMyTurn(tt, myP) && myP.cursorX > 0){ myP.cursorX--; state.keys.left = false; }
  if (state.keys.right && isMyTurn(tt, myP) && myP.cursorX < 2){ myP.cursorX++; state.keys.right = false; }
  if (state.keys.up && isMyTurn(tt, myP) && myP.cursorY > 0){ myP.cursorY--; state.keys.up = false; }
  if (state.keys.down && isMyTurn(tt, myP) && myP.cursorY < 2){ myP.cursorY++; state.keys.down = false; }
  const now = performance.now();
  if (now - (tt.lastSent || 0) > 150){ tt.lastSent = now;
    if (typeof broadcast === 'function'){ broadcast({type:'tictactoe', tictactoe:{ players: serializeTicTacToe(tt), turn: tt.turn, finished: tt.finished, winner: tt.winner, line: tt.line }}); } }
  if (tt.finished && typeof showMatchResult === 'function'){
    if (tt.winner === 'draw') showMatchResult('draw', 'tictactoe');
    else showMatchResult(tt.winner === 0 ? 'left' : 'right', 'tictactoe'); }
}
function renderTicTacToe(W, H, t){
  const tt = state.scene.tictactoe;
  if (!tt) return;
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, '#0a0518'); g.addColorStop(1, '#1a0528');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  const size = Math.min(W*0.6, H*0.7);
  const bx = (W - size) / 2;
  const by = (H - size) / 2 + 10;
  const cell = size / 3;
  ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(bx-6, by-6, size+12, size+12);
  ctx.strokeStyle = '#a896b8'; ctx.lineWidth = 3;
  for (let i = 1; i < 3; i++){
    ctx.beginPath(); ctx.moveTo(bx + i*cell, by); ctx.lineTo(bx + i*cell, by + size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, by + i*cell); ctx.lineTo(bx + size, by + i*cell); ctx.stroke(); }
  const anyP = Object.values(tt.players)[0];
  const board = anyP?.board || [null,null,null,null,null,null,null,null,null];
  ctx.font = (cell*0.7) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 9; i++){
    if (board[i]){
      const cx = bx + (i%3 + 0.5) * cell;
      const cy = by + (Math.floor(i/3) + 0.5) * cell;
      ctx.fillText(board[i], cx, cy); } }
  Object.entries(tt.players || {}).forEach(([id, p]) => {
    const isMe = id === state.user?.id;
    const isTurn = isMyTurn(tt, p);
    ctx.strokeStyle = isMe ? '#ffd700' : (p.slot === 0 ? '#f39c12' : '#3498db');
    ctx.lineWidth = isTurn ? 4 : 2;
    ctx.globalAlpha = isTurn ? 1 : 0.4;
    ctx.strokeRect(bx + p.cursorX*cell + 3, by + p.cursorY*cell + 3, cell-6, cell-6);
    ctx.globalAlpha = 1; });
  ctx.font = 'bold 14px Inter, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  const turnText = tt.finished ? '🏁 Игра окончена' : (tt.turn === 0 ? 'Ход: ❌ Крестики' : 'Ход: ⭕ Нолики');
  ctx.fillText(turnText, W/2, by - 20);
  if (tt.finished){
    let msg = tt.winner === 'draw' ? '🤝 Ничья!' : ((tt.winner === 0 ? '❌ Крестики' : '⭕ Нолики') + ' победили!');
    ctx.font = 'bold 20px Inter, sans-serif'; ctx.fillStyle = '#ffd700';
    ctx.fillText(msg, W/2, by + size + 26); }
}

/* БУТЫЛОЧКА */
function initBottle(W, H){
  const players = {};
  const ids = Object.keys(state.scene.chars).slice(0, 6);
  const centerX = W/2;
  const centerY = H/2 + 10;
  const radius = Math.min(W, H) * 0.32;
  ids.forEach((id, i) => {
    const angle = (i / 6) * Math.PI * 2 - Math.PI/2;
    players[id] = {
      seat: i, angle: angle,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      gender: state.members[id]?.gender || 'male'
    };
  });
  state.scene.bottle = {
    players, spinAngle: 0, spinSpeed: 0, spinning: false,
    selectedId: null, phase: 'idle', targetId: null, targetVote: null,
    lastResult: null, centerX, centerY, radius, lastSent: 0
  };
  if (typeof broadcast === 'function') broadcast({type:'bottle', bottle: state.scene.bottle});
}
function updateBottle(dt, W, H){
  if (state.scene.location !== 'bottle') return;
  if (!state.scene.bottle) initBottle(W, H);
  const b = state.scene.bottle;
  if (b.spinning){
    b.spinAngle += b.spinSpeed * dt;
    b.spinSpeed *= 0.985;
    if (Math.abs(b.spinSpeed) < 0.5){
      b.spinning = false; b.spinSpeed = 0;
      const spinDeg = ((b.spinAngle % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
      let closest = null, bestDist = Infinity;
      const myGender = state.members[state.user?.id]?.gender || 'male';
      const wantOpposite = myGender === 'male' ? 'female' : 'male';
      Object.entries(b.players).forEach(([id, p]) => {
        if (id === state.user?.id) return;
        if (p.gender !== wantOpposite) return;
        let d = Math.abs(spinDeg - p.angle);
        d = Math.min(d, Math.PI*2 - d);
        if (d < bestDist){ bestDist = d; closest = id; }
      });
      if (closest){
        b.selectedId = closest; b.targetId = closest;
        b.phase = 'waiting'; b.targetVote = null;
        if (typeof addSystemMessage === 'function'){
          addSystemMessage(`🍾 ${state.user.name} крутит бутылочку и указывает на ${state.members[closest]?.name || '???'}`);
        }
      } else {
        b.phase = 'idle'; b.selectedId = null;
        if (typeof toast === 'function') toast('Нет игроков противоположного пола');
      }
    }
  }
  const now = performance.now();
  if (now - (b.lastSent || 0) > 150){
    b.lastSent = now;
    if (typeof broadcast === 'function'){
      broadcast({type:'bottle', bottle:{
        players: b.players, spinAngle: b.spinAngle, spinning: b.spinning,
        selectedId: b.selectedId, phase: b.phase, targetId: b.targetId,
        targetVote: b.targetVote, lastResult: b.lastResult,
        centerX: b.centerX, centerY: b.centerY, radius: b.radius
      }});
    }
  }
}
function applyBottleData(data){
  if (!data.bottle) return;
  if (!state.scene.bottle){ state.scene.bottle = data.bottle; return; }
  const b = state.scene.bottle;
  b.players = data.bottle.players || b.players;
  b.spinAngle = data.bottle.spinAngle;
  b.spinning = data.bottle.spinning;
  b.selectedId = data.bottle.selectedId;
  b.phase = data.bottle.phase;
  b.targetId = data.bottle.targetId;
  b.targetVote = data.bottle.targetVote;
  b.lastResult = data.bottle.lastResult;
}
function renderBottle(W, H, t){
  const b = state.scene.bottle;
  if (!b) return;
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, '#2a0a2a'); g.addColorStop(1, '#0a0518');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++){
    ctx.globalAlpha = 0.3 + Math.sin(t*3+i)*0.2;
    ctx.fillStyle = '#fff';
    ctx.fillRect((i*89)%W, (i*47)%H, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,200,120,.4)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(b.centerX, b.centerY, b.radius, 0, Math.PI*2); ctx.stroke();
  Object.entries(b.players).forEach(([id, p]) => {
    const isMe = id === state.user?.id;
    const isSelected = id === b.selectedId;
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.beginPath(); ctx.arc(p.x, p.y, 22, 0, Math.PI*2); ctx.fill();
    const memberData = state.members[id];
    const av = memberData?.avatar;
    if (av && av.type === 'image' && av.data){
      const img = getAvatarImage(av.data);
      ctx.save();
      ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, Math.PI*2); ctx.clip();
      if (img.complete && img.naturalWidth){ ctx.drawImage(img, p.x-20, p.y-20, 40, 40); }
      else { ctx.fillStyle = av.color || '#6c8cff'; ctx.fillRect(p.x-20, p.y-20, 40, 40); }
      ctx.restore();
    } else {
      const bg = av?.color || (p.gender === 'female' ? '#ec4899' : '#3b82f6');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, Math.PI*2); ctx.fill();
      ctx.font = '22px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(av?.emoji || (p.gender === 'female' ? '👩' : '👨'), p.x, p.y);
    }
    ctx.strokeStyle = isMe ? '#ffd700' : (isSelected ? '#22c55e' : 'rgba(0,0,0,.4)');
    ctx.lineWidth = isMe || isSelected ? 4 : 2;
    ctx.beginPath(); ctx.arc(p.x, p.y, 22, 0, Math.PI*2); ctx.stroke();
    const nm = state.scene.chars[id]?.name || state.members[id]?.name || state.members[id]?.login || 'Игрок';
    ctx.font = 'bold 10px Inter, sans-serif';
    const nw = ctx.measureText(nm).width + 8;
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(p.x - nw/2, p.y + 26, nw, 13);
    ctx.fillStyle = '#fff'; ctx.fillText(nm, p.x, p.y + 32);
  });
  ctx.save();
  ctx.translate(b.centerX, b.centerY);
  ctx.rotate(b.spinAngle);
  ctx.fillStyle = '#2ecc71'; ctx.fillRect(0, -5, 50, 10);
  ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath(); ctx.moveTo(50, -5); ctx.lineTo(62, 0); ctx.lineTo(50, 5); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (b.phase === 'idle'){ ctx.fillStyle = '#fff'; ctx.fillText('Нажми ✊ чтобы крутить бутылочку', W/2, 22); }
  else if (b.phase === 'spinning'){ ctx.fillStyle = '#ffd700'; ctx.fillText('Крутится...', W/2, 22); }
  else if (b.phase === 'waiting'){
    const targetName = state.members[b.targetId]?.name || '???';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('Указывает на: ' + targetName, W/2, 22);
    if (b.targetId === state.user?.id){
      ctx.fillStyle = '#fff'; ctx.fillText('✊ — принять, ✨ → ❌ — отказаться', W/2, H - 20);
    } else {
      ctx.fillStyle = '#fff'; ctx.fillText('Ожидаем ответ...', W/2, H - 20);
    }
  } else if (b.phase === 'result'){
    if (b.lastResult === 'kiss'){ ctx.fillStyle = '#22c55e'; ctx.fillText('💋 Поцелуй! +1 монетка', W/2, H - 20); }
    else { ctx.fillStyle = '#ef4444'; ctx.fillText('❌ Отказ', W/2, H - 20); }
  }
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.fillText('🍾 БУТЫЛОЧКА', W/2, H - 40);
}

/* UI */
function updateSceneUI(){
  const lampBtn=document.getElementById('lamp-btn');
  if (lampBtn) lampBtn.style.display=(state.scene.location==='couch')?'':'none';
}
window.updateSceneUI = updateSceneUI;
window.setLocation = function(loc, silent){
  state.scene.location=loc;
  state.scene.owls=null; state.scene.seaItems=null; state.scene.toys=null;
  state.scene.drinks=null; state.scene.marshmallows=null;
  state.scene.football=null; state.scene.volleyball=null;
  state.scene.marshmallowBox=null; state.scene.drinkBox=null;
  state.scene.broom=null; state.scene.tetris=null; state.scene.tictactoe=null; state.scene.bottle=null;
  hideMatchResult();
  if (loc==='broom' && typeof initBroom==='function') initBroom(canvas.clientWidth, canvas.clientHeight);
  if (loc==='tetris' && typeof initTetris==='function') initTetris(canvas.clientWidth, canvas.clientHeight);
  if (loc==='tictactoe' && typeof initTicTacToe==='function') initTicTacToe(canvas.clientWidth, canvas.clientHeight);
  if (loc==='bottle' && typeof initBottle==='function') initBottle(canvas.clientWidth, canvas.clientHeight);
  updateSceneUI();
  if (!silent && typeof broadcast==='function') broadcast({type:'scene-loc', location: loc});
};
window.toggleLamp = function(){
  if (state.scene.location!=='couch') return;
  state.scene.lampOn=!state.scene.lampOn;
  if (typeof SFX!=='undefined') SFX.play(state.scene.lampOn?'lampOn':'lampOff');
  if (typeof broadcast==='function') broadcast({type:'scene-lamp', lampOn: state.scene.lampOn});
};
window.toggleScene = function(){
  const lp=document.getElementById('left-panel'); if (!lp) return;
  const collapsed=lp.classList.toggle('scene-collapsed');
  const btn=document.getElementById('scene-toggle-btn');
  if (btn) btn.textContent=collapsed?'👁':'🙈';
  if (!collapsed) setTimeout(ensureCanvasSize,80);
  if (typeof SFX!=='undefined' && SFX.play) SFX.play('click');
};
window.onKeyDown = function(e){
  const k=e.key.toLowerCase();
  if (document.activeElement && ['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (k==='arrowleft'||k==='a'){ state.keys.left=true; e.preventDefault(); }
  if (k==='arrowright'||k==='d'){ state.keys.right=true; e.preventDefault(); }
  if (k==='arrowup'||k==='w'||k===' '){ state.keys.up=true; e.preventDefault(); }
  if (k==='arrowdown'||k==='s'){ state.keys.down=true; e.preventDefault(); }
  if (k==='e' && typeof window.tryAction==='function') window.tryAction();
};
window.onKeyUp = function(e){
  const k=e.key.toLowerCase();
  if (k==='arrowleft'||k==='a') state.keys.left=false;
  if (k==='arrowright'||k==='d') state.keys.right=false;
  if (k==='arrowup'||k==='w'||k===' ') state.keys.up=false;
  if (k==='arrowdown'||k==='s') state.keys.down=false;
};
document.addEventListener('keydown', window.onKeyDown);
document.addEventListener('keyup', window.onKeyUp);
window.attachControls = function(){
  document.querySelectorAll('.dpad button').forEach(btn=>{
    const key=btn.dataset.key;
    const press=e=>{
      e.preventDefault(); state.keys[key]=true;
      if (key==='action' && typeof window.tryAction==='function') window.tryAction();
      if (state.scene.location==='tetris' && key==='up'){
        const tb=state.scene.tetris; const p=tb?.players[state.user?.id];
        if (p && p.current && !p.finished){
          const rotated=p.current.shape[0].map((_,i)=>p.current.shape.map(r=>r[i]).reverse());
          if (!tetrisCollide(p.board, rotated, p.cx, p.cy)) p.current.shape=rotated; } } };
    const release=e=>{ e.preventDefault(); state.keys[key]=false; };
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('contextmenu', e=>e.preventDefault()); });
};
window.tryAction = function(){
  if (!state.user) return;
  const me=state.scene.chars[state.user.id]; if (!me) return;
  const loc=state.scene.location;
  if (loc==='volleyball'){
    const vb = state.scene.volleyball;
    if (vb && vb.ball && !vb.finished){
      if (vb.ball.heldBy === state.user.id){
        const dir = me.x < vb.netX ? 1 : -1;
        vb.ball.heldBy = null;
        vb.ball.vx = dir * 260;
        vb.ball.vy = -320;
        vb.ball.isLive = true;
        vb.ball.lastHitBy = me.x < vb.netX ? 'left' : 'right';
        if (typeof SFX!=='undefined') SFX.play('ballHit');
        if (typeof broadcast==='function') broadcast({type:'volleyball', volleyball: vb});
        return;
      }
      const headY = me.y - 45;
      const d = Math.hypot(vb.ball.x - me.x, vb.ball.y - headY);
      if (d < 40){
        const dx = vb.ball.x - me.x, dy = vb.ball.y - headY;
        const dist = Math.max(1, Math.hypot(dx, dy));
        vb.ball.vx += (dx/dist)*120;
        vb.ball.vy += (dy/dist)*60 - 60;
        vb.ball.lastHitBy = me.x < vb.netX ? 'left' : 'right';
        vb.ball.isLive = true;
        if (typeof SFX!=='undefined') SFX.play('ballHit');
        if (typeof broadcast==='function') broadcast({type:'volleyball', volleyball: vb});
      }
    }
    return;
  }
  if (loc==='map'){
    const W=canvas.clientWidth, H=canvas.clientHeight;
    const myY=me.mapY??H/2;
    let hitZone=null;
    MAP_ZONES.forEach(z=>{ const zx=W*z.x, zy=H*z.y; if (Math.hypot(me.x-zx, myY-zy)<30) hitZone=z; });
    if (hitZone){
      if (typeof SFX!=='undefined') SFX.play('pickup');
      window.setLocation(hitZone.id);
      if (typeof toast==='function') toast(`Вы вошли в ${hitZone.label}`);
      const gY=getGroundY(H); me.y=gY; me.vy=0; me.onGround=true;
    } else if (typeof toast==='function') toast('Подойдите к сцене ближе');
    return;
  }
  if (loc==='tetris'){
    const tb=state.scene.tetris; const p=tb?.players[state.user?.id];
    if (p && p.current && !p.finished){
      const rotated=p.current.shape[0].map((_,i)=>p.current.shape.map(r=>r[i]).reverse());
      if (!tetrisCollide(p.board, rotated, p.cx, p.cy)) p.current.shape=rotated; }
    return;
  }
  if (loc==='tictactoe'){
    const tt=state.scene.tictactoe; const myP=tt?.players[state.user?.id];
    if (myP && !tt.finished && isMyTurn(tt, myP)){
      const idx = myP.cursorY * 3 + myP.cursorX;
      if (myP.board[idx] === null){
        myP.board[idx] = myP.symbol;
        Object.values(tt.players).forEach(p => { if (p !== myP) p.board = myP.board.slice(); });
        checkTicTacToeWin(tt);
        if (typeof broadcast==='function'){ broadcast({type:'tictactoe', tictactoe:{ players: serializeTicTacToe(tt), turn: tt.turn, finished: tt.finished, winner: tt.winner, line: tt.line }}); }
      } else if (typeof toast==='function') toast('Клетка занята');
    } else if (typeof toast==='function') toast('Не ваш ход');
    return;
  }
  if (loc==='bottle'){
    const b=state.scene.bottle;
    if (!b) return;
    if (b.phase === 'idle'){
      b.spinning = true;
      b.spinSpeed = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random()*4);
      b.phase = 'spinning';
      b.lastResult = null;
      if (typeof SFX!=='undefined') SFX.play('pickup');
      if (typeof broadcast==='function') broadcast({type:'bottle', bottle:b});
    } else if (b.phase === 'waiting' && b.targetId === state.user?.id){
      b.targetVote = 'yes'; b.lastResult = 'kiss'; b.phase = 'result';
      if (typeof window.addCoins === 'function') window.addCoins(1);
      if (typeof addSystemMessage==='function') addSystemMessage(`💋 ${state.user.name} принял(а) поцелуй! +1 монетка`);
      setTimeout(() => { if (b) { b.phase = 'idle'; b.selectedId = null; b.targetId = null; b.lastResult = null; } }, 3000);
      if (typeof broadcast==='function') broadcast({type:'bottle', bottle:b});
    }
    return;
  }
  if (me.lying!=null){ me.lying=null; me.charState='idle'; me.y=getGroundY(canvas.clientHeight);
    if (typeof broadcast==='function') broadcast({type:'scene-lie', userId: state.user.id, lying:null}); return; }
  if (me.held){
    if (me.held.type==='toy' && state.scene.toys){ const t=state.scene.toys[me.held.idx];
      if (t){ t.held=false; t.vx=me.facing*320; t.vy=-250; t.vr=me.facing*6;
        if (typeof SFX!=='undefined') SFX.play('throw');
        if (typeof broadcast==='function') broadcast({type:'toys', toys: state.scene.toys}); } }
    else if (me.held.type==='drink' && state.scene.drinks){ const d=state.scene.drinks[me.held.idx];
      if (d){ d.taken=false; d.empty=false; if (typeof broadcast==='function') broadcast({type:'drinks', drinks: state.scene.drinks}); } }
    else if (me.held.type==='marshmallow' && state.scene.marshmallows){ const m=state.scene.marshmallows[me.held.idx];
      if (m){ m.taken=false; if (typeof broadcast==='function') broadcast({type:'marshmallows', marshmallows: state.scene.marshmallows}); } }
    me.held=null; return;
  }
  if (loc==='forest' && state.scene.marshmallowBox){
    const mb=state.scene.marshmallowBox;
    if (Math.hypot(me.x-(mb.x+mb.w/2), me.y-(mb.y+mb.h/2))<50){
      if (!state.scene.marshmallows) initMarshmallows(canvas.clientWidth, canvas.clientHeight);
      const idx=state.scene.marshmallows.findIndex(m=>!m.taken);
      if (idx>=0){ state.scene.marshmallows[idx].taken=true; state.scene.marshmallows[idx].cooking=10;
        me.held={type:'marshmallow', idx, data: state.scene.marshmallows[idx]};
        if (typeof SFX!=='undefined') SFX.play('pickup');
        if (typeof toast==='function') toast('🍡 Взяли маршмеллоу');
        if (typeof broadcast==='function') broadcast({type:'marshmallows', marshmallows: state.scene.marshmallows});
        return; } } }
  if (loc==='beach' && state.scene.drinkBox){
    const db=state.scene.drinkBox;
    if (Math.hypot(me.x-(db.x+db.w/2), me.y-(db.y+db.h/2))<50){
      if (!state.scene.drinks) initDrinks(canvas.clientWidth, canvas.clientHeight);
      const idx=state.scene.drinks.findIndex(d=>!d.taken);
      if (idx>=0){ state.scene.drinks[idx].taken=true;
        me.held={type:'drink', idx, data: state.scene.drinks[idx]};
        if (typeof SFX!=='undefined') SFX.play('pickup');
        if (typeof toast==='function') toast('🥤 Взяли напиток');
        if (typeof broadcast==='function') broadcast({type:'drinks', drinks: state.scene.drinks});
        return; } } }
  if (loc==='football'){ const ball=findNearestBall();
    if (ball){ ball.vx=me.facing*200; ball.vy=-100;
      if (typeof SFX!=='undefined') SFX.play('ballHit');
      if (typeof broadcast==='function') broadcast({type:'football', football: state.scene.football}); return; } }
  if (loc==='couch'){ const best=findNearestToy();
    if (best){ state.scene.toys[best.idx].held=true;
      state.scene.toys[best.idx].vx=0; state.scene.toys[best.idx].vy=0;
      me.held={type:'toy', idx: best.idx};
      if (typeof SFX!=='undefined') SFX.play('pickup');
      if (typeof broadcast==='function') broadcast({type:'toys', toys: state.scene.toys}); return; } }
  if (typeof window.doAction==='function') window.doAction('hug');
};
window.doAction = function(action){
  if (!state.user) return;
  const me=state.scene.chars[state.user.id]; if (!me) return;
  if (action==='sit'){ me.sitting=true; me.lying=null; me.charState='sit';
    if (typeof SFX!=='undefined') SFX.play('sit');
    if (typeof broadcast==='function') broadcast({type:'scene-sit', userId: state.user.id, sitting:true}); return; }
  if (action==='dismount'){
    if (me.held){ window.tryAction(); return; }
    if (me.lying!=null){ me.lying=null; me.charState='idle'; me.y=getGroundY(canvas.clientHeight);
      if (typeof broadcast==='function') broadcast({type:'scene-lie', userId: state.user.id, lying:null}); return; }
    if (me.ridingOn){ me.ridingOn=null; me.charState='idle'; } else me.sitting=false; return; }
  if (action==='marshmallow'){
    if (state.scene.location!=='forest') return typeof toast==='function' && toast('Только у костра');
    if (me.held && me.held.type==='marshmallow'){
      const m=state.scene.marshmallows[me.held.idx];
      if (m && m.ready){
        state.scene.marshmallows[me.held.idx].taken=false;
        state.scene.marshmallows[me.held.idx].ready=false;
        state.scene.marshmallows[me.held.idx].cooking=0;
        me.held=null;
        if (typeof SFX!=='undefined') SFX.play('eat');
        me.action='eat'; me.actionT=1.4;
        if (typeof broadcast==='function'){ broadcast({type:'scene-action', userId: state.user.id, action:'eat'}); broadcast({type:'marshmallows', marshmallows: state.scene.marshmallows}); }
        if (typeof addSystemMessage==='function') addSystemMessage(`${state.user.name} съел маршмеллоу!`);
      } else typeof toast==='function' && toast('⏳ Ещё жарится...');
      return; }
    window.tryAction(); return; }
  if (action==='drink'){
    if (state.scene.location!=='beach') return typeof toast==='function' && toast('Только на пляже');
    if (me.held && me.held.type==='drink'){
      const d=state.scene.drinks[me.held.idx];
      if (d){ d.empty=true; d.taken=false; me.held=null;
        if (typeof SFX!=='undefined') SFX.play('gulp');
        me.action='gulp'; me.actionT=1.6;
        if (typeof broadcast==='function'){ broadcast({type:'scene-action', userId: state.user.id, action:'gulp'}); broadcast({type:'drinks', drinks: state.scene.drinks}); } }
      return; }
    window.tryAction(); return; }
  me.action=action; me.actionT=1.6;
  if (typeof SFX!=='undefined') SFX.play(action);
  if (typeof broadcast==='function') broadcast({type:'scene-action', userId: state.user.id, action});
  if (action==='punch'){
    const near=findNearest();
    if (near){ const target=state.scene.chars[near.id];
      if (target){ target.hp=Math.max(0, (target.hp??10) - 1);
        if (typeof broadcast==='function') broadcast({type:'scene-hp', userId: near.id, hp: target.hp});
        if (target.hp<=0){ target.hp=10; target.x=canvas.clientWidth/2; target.y=0; target.vy=-300;
          if (typeof broadcast==='function') broadcast({type:'scene-hp', userId: near.id, hp: 10});
          if (typeof addSystemMessage==='function') addSystemMessage(`💀 ${target.name} повержен`); } } } }
};
function findNearest(){
  if (!state.user) return null;
  const me=state.scene.chars[state.user.id]; if (!me) return null;
  let best=null, bestD=90;
  Object.entries(state.scene.chars).forEach(([id,c])=>{
    if (id===state.user.id) return;
    const d=Math.hypot(c.x-me.x, c.y-me.y);
    if (d<bestD){ bestD=d; best={id, ...c}; } });
  return best;
}
window.restartSceneLoop = function(){
  try { if (sceneRAF) cancelAnimationFrame(sceneRAF); sceneRAF=null; ensureCanvasSize(); startSceneLoop(); }
  catch(e){ console.error('[WEF]', e); }
};
window.getGroundY = getGroundY; window.ensureCanvasSize = ensureCanvasSize; window.startSceneLoop = startSceneLoop;
window.initFootball = initFootball; window.updateFootball = updateFootball; window.renderFootball = renderFootball;
window.initVolleyball = initVolleyball; window.updateVolleyball = updateVolleyball; window.renderVolleyball = renderVolleyball;
window.initBroom = initBroom; window.updateBroom = updateBroom; window.renderBroom = renderBroom; window.applyBroomData = applyBroomData;
window.initTetris = initTetris; window.updateTetris = updateTetris; window.renderTetris = renderTetris; window.applyTetrisData = applyTetrisData;
window.initTicTacToe = initTicTacToe; window.updateTicTacToe = updateTicTacToe; window.renderTicTacToe = renderTicTacToe; window.applyTicTacToeData = applyTicTacToeData;
window.initBottle = initBottle; window.updateBottle = updateBottle; window.renderBottle = renderBottle; window.applyBottleData = applyBottleData;
window.initToys = initToys; window.updateToys = updateToys;
window.initMarshmallows = initMarshmallows; window.updateMarshmallows = updateMarshmallows;
window.initDrinks = initDrinks; window.findNearestToy = findNearestToy;
window.drawPumpkin = drawPumpkin; window.drawBat = drawBat; window.drawCrow = drawCrow;
window.MAP_ZONES = MAP_ZONES;
window.SPECIES = SPECIES; window.FACE_COLORS = FACE_COLORS; window.HATS = HATS; window.CLOTHES_COLORS = CLOTHES_COLORS;
window.SP_PRESETS = SP_PRESETS; window.PONY_PRESETS = PONY_PRESETS; window.WINX_PRESETS = WINX_PRESETS;
window.drawAnimalFace = drawAnimalFace; window.drawHat = drawHat;
window.drawSPCharacter = drawSPCharacter; window.drawPony = drawPony; window.drawWinx = drawWinx;
window.drawCharacterPreview = drawCharacterPreview;
window.drawWitch = drawWitch;
window.REWARDS = { volleyball:10, football:10, tetris:5, broom:5, tictactoe:5 };
setInterval(() => {
  try {
    if (!state.user || !state.room) return;
    const myMember = state.members[state.user.id];
    if (!myMember) return;
    const mySide = (myMember.role === 'host') ? 'left' : 'right';
    const fb = state.scene.football;
    if (fb && fb.finished && !fb._rewarded){
      fb._rewarded = true;
      if (fb.winner === mySide && typeof window.addCoins === 'function'){ window.addCoins(10); if (typeof addSystemMessage === 'function') addSystemMessage('🏆 +10 монет за футбол!'); }
    }
    const vb = state.scene.volleyball;
    if (vb && vb.finished && !vb._rewarded){
      vb._rewarded = true;
      if (vb.winner === mySide && typeof window.addCoins === 'function'){ window.addCoins(10); if (typeof addSystemMessage === 'function') addSystemMessage('🏆 +10 монет за волейбол!'); }
    }
    const tb = state.scene.tetris;
    if (tb && tb.finished && !tb._rewarded){
      tb._rewarded = true;
      const myP = tb.players[state.user.id];
      if (myP && tb.winner === myP.slot && typeof window.addCoins === 'function'){ window.addCoins(5); if (typeof addSystemMessage === 'function') addSystemMessage('🏆 +5 монет за тетрис!'); }
    }
    const br = state.scene.broom;
    if (br && br.finished && !br._rewarded){
      br._rewarded = true;
      const myP = br.players[state.user.id];
      if (myP && br.winner === state.user.id && typeof window.addCoins === 'function'){ window.addCoins(5); if (typeof addSystemMessage === 'function') addSystemMessage('🏆 +5 монет за метёлку!'); }
    }
    const tt = state.scene.tictactoe;
    if (tt && tt.finished && !tt._rewarded && tt.winner !== 'draw'){
      tt._rewarded = true;
      const myP = tt.players[state.user.id];
      if (myP && tt.winner === myP.slot && typeof window.addCoins === 'function'){ window.addCoins(5); if (typeof addSystemMessage === 'function') addSystemMessage('🏆 +5 монет за крестики!'); }
    }
  } catch(e){ console.error('[WEF][AutoReward] error:', e); }
}, 500);
console.log('[WEF] Авто-награды активны');
console.log('[WEF] scene.js загружен');