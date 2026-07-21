// node tools/gerar-memorial.js > tabela-copa-2026-final.html
// Generates the memorial HTML file for the closed bolão

const fs = require('fs');
const path = require('path');

// ---- Match results from SQL ----
const RES = {
  "wc2026-0":{a:2,b:0},"wc2026-1":{a:2,b:1},"wc2026-2":{a:1,b:1},"wc2026-3":{a:1,b:0},
  "wc2026-4":{a:0,b:3},"wc2026-5":{a:1,b:0},"wc2026-6":{a:1,b:1},"wc2026-7":{a:1,b:1},
  "wc2026-8":{a:4,b:1},"wc2026-9":{a:6,b:0},"wc2026-10":{a:2,b:1},"wc2026-11":{a:3,b:1},
  "wc2026-12":{a:1,b:1},"wc2026-13":{a:0,b:1},"wc2026-14":{a:0,b:1},"wc2026-15":{a:3,b:0},
  "wc2026-16":{a:0,b:3},"wc2026-17":{a:4,b:2},"wc2026-18":{a:4,b:1},"wc2026-19":{a:2,b:0},
  "wc2026-20":{a:2,b:0},"wc2026-21":{a:0,b:1},"wc2026-22":{a:3,b:2},"wc2026-23":{a:0,b:0},
  "wc2026-24":{a:7,b:1},"wc2026-25":{a:1,b:0},"wc2026-26":{a:2,b:1},"wc2026-27":{a:0,b:0},
  "wc2026-28":{a:0,b:2},"wc2026-29":{a:2,b:1},"wc2026-30":{a:2,b:2},"wc2026-31":{a:5,b:1},
  "wc2026-32":{a:5,b:1},"wc2026-33":{a:0,b:4},"wc2026-34":{a:1,b:1},"wc2026-35":{a:1,b:3},
  "wc2026-36":{a:1,b:1},"wc2026-37":{a:2,b:2},"wc2026-38":{a:0,b:0},"wc2026-39":{a:1,b:3},
  "wc2026-40":{a:1,b:1},"wc2026-41":{a:1,b:5},"wc2026-42":{a:0,b:0},"wc2026-43":{a:1,b:1},
  "wc2026-44":{a:4,b:0},"wc2026-45":{a:2,b:2},"wc2026-46":{a:0,b:0},"wc2026-47":{a:0,b:1},
  "wc2026-48":{a:3,b:1},"wc2026-49":{a:1,b:4},"wc2026-50":{a:3,b:0},"wc2026-51":{a:3,b:2},
  "wc2026-52":{a:1,b:4},"wc2026-53":{a:5,b:0},"wc2026-54":{a:3,b:0},"wc2026-55":{a:3,b:1},
  "wc2026-56":{a:2,b:0},"wc2026-57":{a:1,b:2},"wc2026-58":{a:3,b:3},"wc2026-59":{a:1,b:3},
  "wc2026-60":{a:1,b:1},"wc2026-61":{a:1,b:3},"wc2026-62":{a:5,b:0},"wc2026-63":{a:1,b:0},
  "wc2026-64":{a:0,b:0},"wc2026-65":{a:3,b:1},"wc2026-66":{a:4,b:2},"wc2026-67":{a:1,b:0},
  "wc2026-68":{a:0,b:0},"wc2026-69":{a:0,b:1},"wc2026-70":{a:0,b:2},"wc2026-71":{a:2,b:1},
  "73":{a:0,b:1},"74":{a:1,b:1,pa:3,pb:4},"75":{a:1,b:1,pa:2,pb:3},"76":{a:2,b:1},
  "77":{a:3,b:0},"78":{a:1,b:2},"79":{a:2,b:0},"80":{a:2,b:1},
  "81":{a:2,b:0},"82":{a:3,b:2},"83":{a:2,b:1},"84":{a:3,b:0},
  "85":{a:2,b:0},"86":{a:3,b:2},"87":{a:1,b:0},"88":{a:1,b:1,pa:2,pb:4},
  "oit-1":{a:0,b:3},"oit-2":{a:0,b:1},"oit-3":{a:1,b:2},"oit-4":{a:2,b:3},
  "oit-5":{a:0,b:1},"oit-6":{a:1,b:4},"oit-7":{a:3,b:2},"oit-8":{a:0,b:0,pa:4,pb:3},
  "qua-1":{a:2,b:0},"qua-2":{a:2,b:1},"qua-3":{a:1,b:2},"qua-4":{a:3,b:1},
  "sem-1":{a:0,b:2},"sem-2":{a:1,b:2},"ter-1":{a:4,b:6},"fin-1":{a:1,b:0},
};

// ---- Team per group ----
const GRUPOS = [
  {letra:'A',times:['México','África do Sul','Coreia do Sul','República Tcheca']},
  {letra:'B',times:['Suíça','Canadá','Bósnia e Herzegovina','Qatar']},
  {letra:'C',times:['Brasil','Marrocos','Escócia','Haiti']},
  {letra:'D',times:['Estados Unidos','Austrália','Paraguai','Turquia']},
  {letra:'E',times:['Alemanha','Costa do Marfim','Equador','Curaçao']},
  {letra:'F',times:['Holanda','Japão','Suécia','Tunísia']},
  {letra:'G',times:['Bélgica','Egito','Irã','Nova Zelândia']},
  {letra:'H',times:['Espanha','Cabo Verde','Uruguai','Arábia Saudita']},
  {letra:'I',times:['França','Noruega','Senegal','Iraque']},
  {letra:'J',times:['Argentina','Áustria','Argélia','Jordânia']},
  {letra:'K',times:['Colômbia','Portugal','RD Congo','Uzbequistão']},
  {letra:'L',times:['Inglaterra','Croácia','Gana','Panamá']},
];

// Map group matches (from jogos.js)
const GROUP_MATCHES = [
  [0,1,2,3,4,5], // A: wc2026-0 to wc2026-5
  [6,7,8,9,10,11], // B
  [12,13,14,15,16,17], // C
  [18,19,20,21,22,23], // D
  [24,25,26,27,28,29], // E
  [30,31,32,33,34,35], // F
  [36,37,38,39,40,41], // G
  [42,43,44,45,46,47], // H
  [48,49,50,51,52,53], // I
  [54,55,56,57,58,59], // J
  [60,61,62,63,64,65], // K
  [66,67,68,69,70,71], // L
];

// Group match pairs (from jogos.js match definitions)
function getGrupoJogos() {
  const times = {
    'wc2026-0':['México','África do Sul'],'wc2026-1':['Coreia do Sul','República Tcheca'],
    'wc2026-2':['República Tcheca','África do Sul'],'wc2026-3':['México','Coreia do Sul'],
    'wc2026-4':['República Tcheca','México'],'wc2026-5':['África do Sul','Coreia do Sul'],
    'wc2026-6':['Canadá','Bósnia e Herzegovina'],'wc2026-7':['Qatar','Suíça'],
    'wc2026-8':['Suíça','Bósnia e Herzegovina'],'wc2026-9':['Canadá','Qatar'],
    'wc2026-10':['Suíça','Canadá'],'wc2026-11':['Bósnia e Herzegovina','Qatar'],
    'wc2026-12':['Brasil','Marrocos'],'wc2026-13':['Haiti','Escócia'],
    'wc2026-14':['Escócia','Marrocos'],'wc2026-15':['Brasil','Haiti'],
    'wc2026-16':['Escócia','Brasil'],'wc2026-17':['Marrocos','Haiti'],
    'wc2026-18':['Estados Unidos','Paraguai'],'wc2026-19':['Austrália','Turquia'],
    'wc2026-20':['Estados Unidos','Austrália'],'wc2026-21':['Turquia','Paraguai'],
    'wc2026-22':['Turquia','Estados Unidos'],'wc2026-23':['Paraguai','Austrália'],
    'wc2026-24':['Alemanha','Curaçao'],'wc2026-25':['Costa do Marfim','Equador'],
    'wc2026-26':['Alemanha','Costa do Marfim'],'wc2026-27':['Equador','Curaçao'],
    'wc2026-28':['Curaçao','Costa do Marfim'],'wc2026-29':['Equador','Alemanha'],
    'wc2026-30':['Holanda','Japão'],'wc2026-31':['Suécia','Tunísia'],
    'wc2026-32':['Holanda','Suécia'],'wc2026-33':['Tunísia','Japão'],
    'wc2026-34':['Japão','Suécia'],'wc2026-35':['Tunísia','Holanda'],
    'wc2026-36':['Bélgica','Egito'],'wc2026-37':['Irã','Nova Zelândia'],
    'wc2026-38':['Bélgica','Irã'],'wc2026-39':['Nova Zelândia','Egito'],
    'wc2026-40':['Egito','Irã'],'wc2026-41':['Nova Zelândia','Bélgica'],
    'wc2026-42':['Espanha','Cabo Verde'],'wc2026-43':['Arábia Saudita','Uruguai'],
    'wc2026-44':['Espanha','Arábia Saudita'],'wc2026-45':['Uruguai','Cabo Verde'],
    'wc2026-46':['Cabo Verde','Arábia Saudita'],'wc2026-47':['Uruguai','Espanha'],
    'wc2026-48':['França','Senegal'],'wc2026-49':['Iraque','Noruega'],
    'wc2026-50':['França','Iraque'],'wc2026-51':['Noruega','Senegal'],
    'wc2026-52':['Noruega','França'],'wc2026-53':['Senegal','Iraque'],
    'wc2026-54':['Argentina','Argélia'],'wc2026-55':['Áustria','Jordânia'],
    'wc2026-56':['Argentina','Áustria'],'wc2026-57':['Jordânia','Argélia'],
    'wc2026-58':['Argélia','Áustria'],'wc2026-59':['Jordânia','Argentina'],
    'wc2026-60':['Portugal','RD Congo'],'wc2026-61':['Uzbequistão','Colômbia'],
    'wc2026-62':['Portugal','Uzbequistão'],'wc2026-63':['Colômbia','RD Congo'],
    'wc2026-64':['Colômbia','Portugal'],'wc2026-65':['RD Congo','Uzbequistão'],
    'wc2026-66':['Inglaterra','Croácia'],'wc2026-67':['Gana','Panamá'],
    'wc2026-68':['Inglaterra','Gana'],'wc2026-69':['Panamá','Croácia'],
    'wc2026-70':['Panamá','Inglaterra'],'wc2026-71':['Croácia','Gana'],
  };
  return times;
}

function calcStandings(grupoLetra) {
  const g = GRUPOS.find(x => x.letra === grupoLetra);
  if (!g) return [];
  const stats = {};
  for (const t of g.times) stats[t] = {P:0,J:0,V:0,E:0,D:0,GP:0,GC:0,SG:0};
  const jogos = getGrupoJogos();
  for (const [id, [ta,tb]] of Object.entries(jogos)) {
    if (!g.times.includes(ta) && !g.times.includes(tb)) continue;
    const r = RES[id];
    if (!r) continue;
    stats[ta].J++; stats[tb].J++;
    stats[ta].GP += r.a; stats[tb].GP += r.b;
    stats[ta].GC += r.b; stats[tb].GC += r.a;
    if (r.a > r.b) { stats[ta].V++; stats[ta].P += 3; stats[tb].D++; }
    else if (r.a < r.b) { stats[tb].V++; stats[tb].P += 3; stats[ta].D++; }
    else { stats[ta].E++; stats[ta].P++; stats[tb].E++; stats[tb].P++; }
  }
  for (const t of g.times) stats[t].SG = stats[t].GP - stats[t].GC;
  return g.times.map(t => ({time:t, ...stats[t]}))
    .sort((a,b) => b.P - a.P || b.SG - a.SG || b.GP - a.GP || a.time.localeCompare(b.time));
}

const ISO = {
  México:'mx','África do Sul':'za','Coreia do Sul':'kr','República Tcheca':'cz',
  Canadá:'ca','Bósnia e Herzegovina':'ba','Qatar':'qa','Suíça':'ch',
  Brasil:'br','Marrocos':'ma','Escócia':'gb-sct','Haiti':'ht',
  'Estados Unidos':'us','Turquia':'tr','Austrália':'au','Paraguai':'py',
  Alemanha:'de','Costa do Marfim':'ci','Equador':'ec','Curaçao':'cw',
  Japão:'jp','Tunísia':'tn',Holanda:'nl','Suécia':'se',
  Bélgica:'be','Egito':'eg','Nova Zelândia':'nz',Irã:'ir',
  Espanha:'es','Arábia Saudita':'sa','Uruguai':'uy','Cabo Verde':'cv',
  França:'fr','Iraque':'iq','Noruega':'no','Senegal':'sn',
  Argentina:'ar','Argélia':'dz','Áustria':'at','Jordânia':'jo',
  Portugal:'pt','Colômbia':'co','Uzbequistão':'uz','RD Congo':'cd',
  Inglaterra:'gb-eng','Croácia':'hr','Gana':'gh','Panamá':'pa',
};

function flag(name) {
  const c = ISO[name] || 'un';
  return '<img src="https://flagcdn.com/w40/'+c+'.png" alt="'+name+'" width="24" height="17" style="border-radius:2px;vertical-align:middle">';
}

function esc(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function fmtScore(r) {
  if (!r) return '&ndash;';
  let s = r.a + '&times;' + r.b;
  if (r.pa != null && r.pb != null) s += ' <span style="font-size:10px;color:#8B9CC8">('+r.pa+'-'+r.pb+' pen)</span>';
  return s;
}

function matchRow(id, ta, tb) {
  const r = RES[id];
  const s = r ? (r.pa != null ? r.a + ' (' + r.pa + ') &times; ' + r.b + ' (' + r.pb + ')' : r.a + ' &times; ' + r.b) : '&ndash;';
  return '<tr><td style="padding:4px 8px;border-bottom:1px solid #1E2A45;color:#8B9CC8;font-size:11px">'+id+'</td>'
    + '<td style="padding:4px 8px;border-bottom:1px solid #1E2A45">'+flag(ta)+' '+esc(ta)+'</td>'
    + '<td style="padding:4px 8px;border-bottom:1px solid #1E2A45;text-align:center;font-weight:700">'+s+'</td>'
    + '<td style="padding:4px 8px;border-bottom:1px solid #1E2A45;text-align:right">'+flag(tb)+' '+esc(tb)+'</td></tr>';
}

// ---- R32 teams (from jogos.js JOGOS_1_16) ----
const R32 = [
  [73,'África do Sul','Canadá'],[74,'Alemanha','Paraguai'],[75,'Holanda','Marrocos'],[76,'Brasil','Japão'],
  [77,'França','Suécia'],[78,'Costa do Marfim','Noruega'],[79,'México','Equador'],[80,'Inglaterra','RD Congo'],
  [81,'Estados Unidos','Bósnia e Herzegovina'],[82,'Bélgica','Senegal'],[83,'Portugal','Croácia'],
  [84,'Espanha','Áustria'],[85,'Suíça','Argélia'],[86,'Argentina','Cabo Verde'],[87,'Colômbia','Gana'],
  [88,'Austrália','Egito'],
];

// Oitavas
const OIT = [
  ['oit-1',[73,75]],['oit-2',[74,77]],['oit-3',[76,78]],['oit-4',[79,80]],
  ['oit-5',[83,84]],['oit-6',[81,82]],['oit-7',[86,88]],['oit-8',[85,87]],
];

function winner(id) {
  const r = RES[id];
  if (!r) return null;
  if (r.a !== r.b) return r.a > r.b ? 'a' : 'b';
  if (r.pa != null && r.pb != null) return r.pa > r.pb ? 'a' : 'b';
  return null;
}

function getWinnerName(id, ta, tb) {
  const w = winner(id);
  if (w === 'a') return ta;
  if (w === 'b') return tb;
  return null;
}

// ---- SPAIN PATH ----
const spainPath = [];

// Spain is in group H
const groupH = calcStandings('H');
spainPath.push({phase:'Grupo H',team:'Espanha',desc:'1\u00ba lugar — ' + groupH[0].P + ' pts'});

// Spain plays match 84 (R32) vs Austria
const m84 = R32.find(m => m[0] === 84);
if (m84) {
  const r = RES['84'];
  spainPath.push({phase:'1/16 final',team:'Espanha',desc: 'Espanha ' + r.a + '&times;' + r.b + ' ' + m84[3], opponent: m84[3]});
}

// Oit-5: winner of 83 vs winner of 84
const o5win = getWinnerName('84', 'Espanha', m84 ? m84[3] : '');
if (o5win === 'Espanha') {
  const o5 = RES['oit-5'];
  // opponent is winner of 83
  const m83 = R32.find(m => m[0] === 83);
  const w83 = getWinnerName('83', m83[1], m83[2]);
  spainPath.push({phase:'Oitavas',team:'Espanha',desc: o5 ? 'Espanha ' + o5.a + '&times;' + o5.b + ' ' + w83 : '', opponent: w83});
}

// Qua-2: winner of oit-5 vs winner of oit-6
const q2 = RES['qua-2'];
spainPath.push({phase:'Quartas',team:'Espanha',desc: q2 ? 'Espanha ' + q2.a + '&times;' + q2.b + ' (adversário)' : '', opponent: '?', skip: true});

// Sem-1: winner of qua-1 vs winner of qua-2
const s1 = RES['sem-1'];
spainPath.push({phase:'Semifinal',team:'Espanha',desc: s1 ? 'Espanha ' + s1.a + '&times;' + s1.b + ' (adversário)' : '', opponent: '?'});

// Final
const fin = RES['fin-1'];
spainPath.push({phase:'Final',team:'Espanha',desc: 'Espanha 1&times;0 Argentina (prorrogação, gol de Ferran Torres aos 106\')', opponent: 'Argentina'});

// ---- TOP 3 (sample - user will update) ----
const TOP3 = [
  {pos:1,nome:'André Perez',pts:320,premio:'R$ 750,00'},
  {pos:2,nome:'João Silva',pts:295,premio:'R$ 450,00'},
  {pos:3,nome:'Maria Santos',pts:278,premio:'R$ 300,00'},
];

function groupTable(g) {
  const standings = calcStandings(g.letra);
  let rows = '';
  for (let i = 0; i < standings.length; i++) {
    const t = standings[i];
    const cls = i < 2 ? 'style="background:rgba(22,163,74,0.08);font-weight:700"' : (i === 2 ? 'style="background:rgba(245,158,11,0.06)"' : '');
    rows += '<tr '+cls+'><td style="padding:5px 6px;color:#8B9CC8;font-size:11px">'+(i+1)+'</td>'
      + '<td style="padding:5px 6px">'+flag(t.time)+' '+esc(t.time)+'</td>'
      + '<td style="padding:5px 6px;text-align:center">'+t.P+'</td>'
      + '<td style="padding:5px 6px;text-align:center;color:#8B9CC8">'+t.J+'</td>'
      + '<td style="padding:5px 6px;text-align:center;color:#8B9CC8">'+t.V+'</td>'
      + '<td style="padding:5px 6px;text-align:center;color:#8B9CC8">'+t.E+'</td>'
      + '<td style="padding:5px 6px;text-align:center;color:#8B9CC8">'+t.D+'</td>'
      + '<td style="padding:5px 6px;text-align:center;color:#8B9CC8">'+t.GP+'</td>'
      + '<td style="padding:5px 6px;text-align:center;color:#8B9CC8">'+t.GC+'</td>'
      + '<td style="padding:5px 6px;text-align:center;font-weight:'+(t.SG>0?'700;color:#16a34a':'color:#8B9CC8')+'">'+(t.SG>0?'+':'')+t.SG+'</td></tr>';
  }
  return '<table style="width:100%;border-collapse:collapse;font-size:13px">'
    + '<thead><tr style="color:#8B9CC8;font-size:10px;text-transform:uppercase;border-bottom:1px solid #1E2A45">'
    + '<th style="padding:5px 6px;text-align:left">#</th><th style="padding:5px 6px;text-align:left">Time</th>'
    + '<th style="padding:5px 6px">P</th><th style="padding:5px 6px">J</th><th style="padding:5px 6px">V</th>'
    + '<th style="padding:5px 6px">E</th><th style="padding:5px 6px">D</th><th style="padding:5px 6px">GP</th>'
    + '<th style="padding:5px 6px">GC</th><th style="padding:5px 6px">SG</th></tr></thead><tbody>'
    + rows + '</tbody></table>';
}

// ---- GENERATE HTML ----
let html = '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n';
html += '<meta charset="UTF-8"/>\n';
html += '<meta name="viewport" content="width=device-width,initial-scale=1">\n';
html += '<title>Bolão Copa 2026 — Recordação</title>\n';
html += '<style>\n';
html += '*{box-sizing:border-box;margin:0;padding:0;}\n';
html += 'body{background:#0A0E1A;color:#F0F4FF;font-family:Arial,Helvetica,sans-serif;padding:16px;}\n';
html += 'img{display:inline-block;vertical-align:middle;}\n';
html += 'table{border-collapse:collapse;width:100%;}\n';
html += 'a{color:#FFD700;text-decoration:none;}\n';
html += 'details summary{cursor:pointer;padding:10px 14px;background:#111827;border:1px solid #1E2A45;border-radius:10px;color:#FFD700;font-weight:800;font-size:13px;}\n';
html += 'details summary::-webkit-details-marker{color:#FFD700;}\n';
html += 'details[open] summary{border-radius:10px 10px 0 0;border-bottom:none;}\n';
html += '.card{background:#111827;border:1px solid #1E2A45;border-radius:12px;padding:14px;margin-bottom:14px;}\n';
html += '.gold{border:2px solid #FFD700;}\n';
html += '.badge{display:inline-block;font-size:9px;padding:1px 6px;border-radius:4px;font-weight:700;line-height:1.6;}\n';
html += '.badge-green{background:rgba(22,163,74,0.2);color:#16a34a;border:1px solid rgba(22,163,74,0.3);}\n';
html += '.badge-yellow{background:rgba(245,158,11,0.2);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);}\n';
html += '.badge-red{background:rgba(220,38,38,0.2);color:#dc2626;border:1px solid rgba(220,38,38,0.3);}\n';
html += '@media print{body{background:#fff !important;color:#000 !important;padding:0.5in;font-size:11pt;}';
html += '.card{background:#f5f5f5 !important;border-color:#ccc !important;color:#000 !important;}';
html += 'details summary{background:#eee !important;border-color:#ccc !important;color:#000 !important;}';
html += 'details[open] summary{border-bottom:1px solid #ccc !important;}';
html += 'table td,table th{color:#333 !important;}';
html += 'img{max-width:100%;}';
html += '.no-print{display:none !important;}';
html += '}\n';
html += '@media(max-width:600px){body{padding:8px;}';
html += '.group-grid{grid-template-columns:1fr !important;}}\n';
html += '</style>\n</head>\n<body>\n';

// ---- 1. HERO ----
html += '<div class="card gold" style="text-align:center;padding:28px 20px;margin-bottom:20px;background:linear-gradient(135deg,#0A0E1A,#1a1a2e);position:relative;overflow:hidden">';
html += '<div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#FFD700,#B8860B,#FFD700)"></div>';
html += '<div style="font-size:56px;margin-bottom:8px;line-height:1">'+flag('Espanha')+'<span style="font-size:48px;margin-left:12px">\u{1F3C6}</span></div>';
html += '<div style="color:#FFD700;font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin-bottom:4px;">Campeã da</div>';
html += '<div style="color:#F0F4FF;font-size:26px;font-weight:900;">Copa do Mundo 2026</div>';
html += '<div style="margin-top:12px;padding:10px 16px;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:10px;display:inline-block;">';
html += '<div style="font-size:28px;font-weight:900;color:#FFD700;">Espanha 1 &times; 0 Argentina</div>';
html += '<div style="color:#8B9CC8;font-size:13px;margin-top:4px;">Prorrogação &middot; Gol de Ferran Torres aos 106\'</div>';
html += '</div>';
html += '<div style="color:#8B9CC8;font-size:12px;margin-top:10px;">Bolão ANPEREZ &middot; Copa do Mundo 2026 &middot; Encerrado</div>';
html += '</div>\n';

// ---- 2. PÓDIO DO BOLÃO ----
html += '<div class="card gold" style="margin-bottom:20px;">';
html += '<div style="text-align:center;font-size:13px;color:#8B9CC8;font-weight:700;letter-spacing:2px;margin-bottom:12px;">\u{1F3C6} RANKING FINAL DO BOLÃO \u{1F3C6}</div>';
html += '<div style="display:flex;justify-content:center;align-items:flex-end;gap:12px;padding:8px 0">';
if (TOP3[1]) html += '<div style="text-align:center;flex:1"><div style="font-size:28px">\u{1F948}</div><div style="color:#F0F4FF;font-size:13px;font-weight:800;margin-top:4px">'+esc(TOP3[1].nome)+'</div><div style="color:#FFD700;font-size:16px;font-weight:900">'+TOP3[1].pts+' pts</div><div style="color:#C0C0C0;font-size:13px;font-weight:700;margin-top:2px">'+TOP3[1].premio+'</div></div>';
if (TOP3[0]) html += '<div style="text-align:center;flex:1.3"><div style="font-size:36px">\u{1F947}</div><div style="color:#F0F4FF;font-size:15px;font-weight:800;margin-top:4px">'+esc(TOP3[0].nome)+'</div><div style="color:#FFD700;font-size:22px;font-weight:900">'+TOP3[0].pts+' pts</div><div style="color:#FFD700;font-size:16px;font-weight:900;margin-top:2px">'+TOP3[0].premio+'</div></div>';
if (TOP3[2]) html += '<div style="text-align:center;flex:1"><div style="font-size:28px">\u{1F949}</div><div style="color:#F0F4FF;font-size:13px;font-weight:800;margin-top:4px">'+esc(TOP3[2].nome)+'</div><div style="color:#FFD700;font-size:16px;font-weight:900">'+TOP3[2].pts+' pts</div><div style="color:#f97316;font-size:13px;font-weight:700;margin-top:2px">'+TOP3[2].premio+'</div></div>';
html += '</div>';
html += '<div style="border-top:1px solid #1E2A45;padding-top:10px;margin-top:8px;text-align:center;color:#8B9CC8;font-size:11px">Premiação: 1\u00ba 50% &middot; 2\u00ba 30% &middot; 3\u00ba 20%</div>';
html += '</div>\n';

// ---- 3. CAMINHO DO CAMPEÃO ----
html += '<div class="card" style="margin-bottom:20px">';
html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><span style="font-size:18px">\u{1F3C6}</span><span style="font-size:14px;font-weight:800;color:#FFD700;letter-spacing:1.5px">CAMINHO DO CAMPEÃO</span></div>';

const caminho = [
  {phase:'Fase de Grupos',desc:'1\u00ba lugar — Grupo H (' + groupH[0].P + ' pts)',icon:'\u{26BD}'},
  {phase:'1/16 final',desc:'Espanha 3 &times; 0 \u00c1ustria',icon:'\u{26BD}'},
  {phase:'Oitavas',desc:'Espanha 1 &times; 0 Portugal',icon:'\u{26BD}'},
  {phase:'Quartas',desc:'Espanha 2 &times; 1 B\u00e9lgica',icon:'\u{26BD}'},
  {phase:'Semifinal',desc:'Espanha 2 &times; 0 Fran\u00e7a',icon:'\u{26BD}'},
  {phase:'Final',desc:'Espanha 1 &times; 0 Argentina (na prorroga\u00e7\u00e3o)',icon:'\u{1F3C6}'},
];

for (let i = 0; i < caminho.length; i++) {
  const c = caminho[i];
  html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;';
  if (i < caminho.length - 1) html += 'border-bottom:1px solid #1E2A45;';
  html += '">';
  html += '<div style="font-size:16px;width:24px;text-align:center">'+c.icon+'</div>';
  html += '<div style="flex:1"><div style="color:#8B9CC8;font-size:10px;font-weight:700;letter-spacing:1px">'+c.phase+'</div>';
  html += '<div style="color:#F0F4FF;font-size:14px;font-weight:700">'+c.desc+'</div></div>';
  if (i < caminho.length - 1) html += '<div style="color:#8B9CC8;font-size:10px">\u{2193}</div>';
  else html += '<div style="font-size:20px">\u{1F3C6}</div>';
  html += '</div>';
}
html += '</div>\n';

// ---- 4. FASE DE GRUPOS (collapsed) ----
html += '<details style="margin-bottom:20px">\n';
html += '<summary>\u{26BD} Ver fase de grupos completa \u{25BE}</summary>\n';
html += '<div style="background:#111827;border:1px solid #1E2A45;border-top:none;border-radius:0 0 12px 12px;padding:14px">\n';

html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">\n';
for (const g of GRUPOS) {
  html += '<div style="background:#0d1b2a;border:1px solid #1E2A45;border-radius:10px;overflow:hidden">';
  html += '<div style="background:linear-gradient(135deg,#0a1628,#0d2a5e);padding:10px 12px;border-bottom:2px solid rgba(255,215,0,0.2);display:flex;align-items:center;gap:6px;margin-bottom:8px">';
  html += '<div style="width:3px;height:14px;background:#FFD700;border-radius:2px;flex-shrink:0"></div>';
  html += '<span style="color:#FFD700;font-weight:900;font-size:12px;letter-spacing:2px">GRUPO '+g.letra+'</span></div>';
  html += groupTable(g);
  html += '</div>\n';
}

// Melhores terceiros
const tpr = calcStandings('H'); // just to get structure
const terceiros = [];
for (const g of GRUPOS) {
  const st = calcStandings(g.letra);
  if (st[2]) terceiros.push({grupo:g.letra,time:st[2].time,P:st[2].P,J:st[2].J,V:st[2].V,E:st[2].E,D:st[2].D,GP:st[2].GP,GC:st[2].GC,SG:st[2].SG});
}
terceiros.sort((a,b) => b.P - a.P || b.SG - a.SG || b.GP - a.GP);

html += '<div style="background:#0d1b2a;border:1px solid #1E2A45;border-radius:10px;overflow:hidden">';
html += '<div style="background:linear-gradient(135deg,#0a1628,#5a3e00);padding:10px 12px;border-bottom:2px solid rgba(255,215,0,0.2);display:flex;align-items:center;gap:6px;margin-bottom:8px">';
html += '<div style="width:3px;height:14px;background:#f59e0b;border-radius:2px;flex-shrink:0"></div>';
html += '<span style="color:#f59e0b;font-weight:900;font-size:12px;letter-spacing:2px">MELHORES TERCEIROS</span></div>';
html += '<table style="width:100%;border-collapse:collapse;font-size:13px">';
html += '<thead><tr style="color:#8B9CC8;font-size:10px;text-transform:uppercase;border-bottom:1px solid #1E2A45">'
  + '<th style="padding:5px 6px;text-align:left">#</th><th style="padding:5px 6px;text-align:left">Grupo</th>'
  + '<th style="padding:5px 6px;text-align:left">Time</th>'
  + '<th style="padding:5px 6px">P</th><th style="padding:5px 6px">SG</th></tr></thead><tbody>';
for (let i = 0; i < terceiros.length; i++) {
  const t = terceiros[i];
  const cls = i < 8 ? 'style="background:rgba(22,163,74,0.08)"' : 'style="opacity:0.5"';
  html += '<tr '+cls+'><td style="padding:5px 6px;color:#8B9CC8;font-size:11px">'+(i+1)+'</td>'
    + '<td style="padding:5px 6px;font-weight:700">'+t.grupo+'</td>'
    + '<td style="padding:5px 6px">'+flag(t.time)+' '+esc(t.time)+'</td>'
    + '<td style="padding:5px 6px;text-align:center;font-weight:700">'+t.P+'</td>'
    + '<td style="padding:5px 6px;text-align:center">'+(t.SG>0?'+':'')+t.SG+'</td></tr>';
}
html += '</tbody></table></div>\n';
html += '</div>\n'; // grid
html += '</div>\n'; // details content
html += '</details>\n';

// ---- 5. MATCH RESULTS (knockout) ----
const phases = [
  {title:'1/16 de Final',icon:'\u{26BD}',matches:R32.map(m => ({id:String(m[0]),ta:m[1],tb:m[2]}))},
  {title:'Oitavas de Final',icon:'\u{26BD}',matches:[
    {id:'oit-1',ta:'V 73',tb:'V 75'},{id:'oit-2',ta:'V 74',tb:'V 77'},
    {id:'oit-3',ta:'V 76',tb:'V 78'},{id:'oit-4',ta:'V 79',tb:'V 80'},
    {id:'oit-5',ta:'V 83',tb:'V 84'},{id:'oit-6',ta:'V 81',tb:'V 82'},
    {id:'oit-7',ta:'V 86',tb:'V 88'},{id:'oit-8',ta:'V 85',tb:'V 87'},
  ]},
  {title:'Quartas de Final',icon:'\u{26BD}',matches:[
    {id:'qua-1',ta:'V oit-2',tb:'V oit-1'},{id:'qua-2',ta:'V oit-5',tb:'V oit-6'},
    {id:'qua-3',ta:'V oit-3',tb:'V oit-4'},{id:'qua-4',ta:'V oit-7',tb:'V oit-8'},
  ]},
  {title:'Semifinal',icon:'\u{26BD}',matches:[
    {id:'sem-1',ta:'V qua-1',tb:'V qua-2'},{id:'sem-2',ta:'V qua-3',tb:'V qua-4'},
  ]},
  {title:'Disputa de 3\u00ba lugar',icon:'\u{1F949}',matches:[
    {id:'ter-1',ta:'V sem-1',tb:'V sem-2'},
  ]},
  {title:'Grande Final',icon:'\u{1F3C6}',matches:[
    {id:'fin-1',ta:'V sem-1',tb:'V sem-2'},
  ]},
];

html += '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><span style="font-size:18px">\u{1F3C6}</span><span style="font-size:14px;font-weight:800;color:#FFD700;letter-spacing:1.5px">FASE FINAL</span></div>';

for (const phase of phases) {
  html += '<div style="margin-bottom:16px">';
  html += '<div style="color:#8B9CC8;font-size:10px;font-weight:700;letter-spacing:2px;margin-bottom:6px">'+phase.icon+' '+phase.title+'</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:13px">';
  html += '<thead><tr style="color:#8B9CC8;font-size:10px;border-bottom:1px solid #1E2A45">'
    + '<th style="padding:4px 6px;text-align:left">#</th><th style="padding:4px 6px;text-align:left">Time A</th>'
    + '<th style="padding:4px 6px">Placar</th><th style="padding:4px 6px;text-align:right">Time B</th></tr></thead><tbody>';
  for (const m of phase.matches) {
    const r = RES[m.id];
    let s = '&ndash;';
    if (r) {
      s = r.a + ' &times; ' + r.b;
      if (r.pa != null && r.pb != null) s += ' <span style="font-size:10px;color:#8B9CC8">(' + r.pa + '-' + r.pb + ' pen)</span>';
    }
    const fmtId = id => {
      const n = id.match(/^oit-(\d+)$/); if (n) return 'Oit-J' + String(Number(n[1])).padStart(2,'0');
      const q = id.match(/^qua-(\d+)$/); if (q) return 'Qua-J' + String(Number(q[1])).padStart(2,'0');
      const s = id.match(/^sem-(\d+)$/); if (s) return 'Sem-J' + String(Number(s[1])).padStart(2,'0');
      if (id === 'ter-1') return '3o-J01';
      if (id === 'fin-1') return 'Fin-J01';
      return 'J' + id;
    };
    html += '<tr><td style="padding:4px 6px;color:#8B9CC8;font-size:10px">'+fmtId(m.id)+'</td>'
      + '<td style="padding:4px 6px">'+esc(m.ta)+'</td>'
      + '<td style="padding:4px 6px;text-align:center;font-weight:700">'+s+'</td>'
      + '<td style="padding:4px 6px;text-align:right">'+esc(m.tb)+'</td></tr>';
  }
  html += '</tbody></table></div>';
}
html += '</div>\n';

// ---- 6. FOOTER ----
html += '<div style="text-align:center;padding:20px;color:#8B9CC8;font-size:11px;border-top:1px solid #1E2A45;margin-top:20px">';
html += '<div style="color:#FFD700;font-weight:700;font-size:13px;margin-bottom:4px">Bolão ANPEREZ 2026</div>';
html += '<div>Encerrado em 21 de julho de 2026</div>';
html += '<div style="margin-top:6px">Obrigado a todos que participaram! \u{1F389}</div>';
html += '</div>\n';

html += '</body>\n</html>\n';

const outPath = path.join(__dirname, '..', 'tabela-copa-2026-final.html');
fs.writeFileSync(outPath, html);
console.log('Generated: ' + outPath + ' (' + (html.length/1024).toFixed(0) + ' KB)');
