import React, { useState } from 'react';

const FACES = [
  { id: 'JEK', label: 'جیک', description: 'برآمدگی بزرگ (وجه بلند)' },
  { id: 'POK', label: 'پوک', description: 'وجه مقابل (وجه دیگر)' },
  { id: 'ASB', label: 'اسب', description: 'وجه اسب' },
  { id: 'KHAR', label: 'خر', description: 'وجه خر/تختان' },
  { id: 'EDGE1', label: 'لبه', description: 'لبهٔ محدب (خنثی)' },
  { id: 'EDGE2', label: 'لبه', description: 'لبهٔ محدب دیگر (خنثی)' }
];

function randomFace() {
  const i = Math.floor(Math.random() * FACES.length);
  return FACES[i].id;
}

function evaluateThrow(faces) {
  const counts = {};
  for (const f of faces) counts[f] = (counts[f] || 0) + 1;
  const edgeCount = (counts['EDGE1'] || 0) + (counts['EDGE2'] || 0);
  if (edgeCount >= 2) return { type: 'neutral', multiplier: 0, name: 'لبه‌ها (خنثی)' };

  const meaningful = ['JEK','POK','ASB','KHAR'];
  for (const m of meaningful) {
    if (counts[m] === 3) {
      if (m === 'JEK' || m === 'POK') return { type: 'win', multiplier: 3, name: `سه ${FACES.find(x=>x.id===m).label} (نقش)` };
      return { type: 'lose', multiplier: 3, name: `سه ${FACES.find(x=>x.id===m).label} (بز)` };
    }
  }

  if ((counts['JEK']===2 && counts['KHAR']===1)) return { type: 'win', multiplier: 2, name: 'دو جیک + یک خر' };
  if ((counts['ASB']===2 && counts['POK']===1)) return { type: 'lose', multiplier: 2, name: 'دو اسب + یک پوک' };
  if (counts['ASB']===1 && counts['KHAR']===1 && counts['JEK']===1) return { type: 'lose', multiplier: 1, name: 'اسب+خر+جیک' };

  return { type: 'neutral', multiplier: 0, name: 'حالت معمولی' };
}

export default function QapBaz() {
  const [player, setPlayer] = useState(1);
  const [scores, setScores] = useState({1:0,2:0});
  const [history, setHistory] = useState([]);
  const [bones, setBones] = useState(['EDGE1','EDGE1','EDGE1']);

  function roll() {
    const result = [randomFace(), randomFace(), randomFace()];
    setBones(result);
    const evalr = evaluateThrow(result);
    setHistory(h => [{player, result, evalr, time: Date.now()}, ...h].slice(0,20));
    if (evalr.type === 'win') setScores(s=>({...s,[player]:s[player]+evalr.multiplier}));
    if (evalr.type === 'lose') setScores(s=>({...s,[player]:Math.max(0,s[player]-evalr.multiplier)}));
    setPlayer(p=> p===1?2:1);
  }

  function reset() {
    setScores({1:0,2:0});
    setHistory([]);
    setBones(['EDGE1','EDGE1','EDGE1']);
    setPlayer(1);
  }

  return (
    <div className="p-4">
      <h1>قاپ باز — نسخهٔ استاندارد</h1>
      <p>نوبت: بازیکن {player}</p>
      <p>امتیازها: بازیکن 1: {scores[1]} | بازیکن 2: {scores[2]}</p>
      <div className="flex gap-2 mt-4">
        {bones.map((b,i)=> (
          <div key={i} className="p-3 border rounded w-24 h-24 flex flex-col items-center justify-center text-center">
            <div className="text-lg font-bold">{FACES.find(f=>f.id===b).label}</div>
            <div className="text-xs">{FACES.find(f=>f.id===b).description}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={roll} className="px-4 py-2 rounded bg-blue-600 text-white">پرتاب کن</button>
        <button onClick={reset} className="px-4 py-2 rounded border">ریست</button>
      </div>
      <div className="mt-4">
        <h3>تاریخچه (آخرین ۲۰ پرتاب)</h3>
        {history.length===0 && <p className="text-gray-500">فعلاً پرتابی ثبت نشده.</p>}
        {history.map((h,idx)=> (
          <div key={idx} className="p-2 border rounded text-sm">
            <div className="text-xs text-gray-600">بازیکن {h.player} — {new Date(h.time).toLocaleTimeString()}</div>
            <div>{h.result.map(r=>FACES.find(f=>f.id===r).label).join(' ، ')}</div>
            <div className="text-xs">نتیجه: {h.evalr.name} — {h.evalr.type==='neutral'?'خنثی':(h.evalr.type==='win'?'برد':'باخت')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
