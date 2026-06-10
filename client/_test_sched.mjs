import esbuild from 'esbuild';
import fs from 'fs';
// Strip the FormatLane type import (type-only) and compile postingSchedule to JS.
let src = fs.readFileSync('src/data/postingSchedule.ts','utf8');
const out = await esbuild.transform(src, { loader:'ts', format:'esm' });
fs.writeFileSync('/tmp/ps.mjs', out.code);
const ps = await import('/tmp/ps.mjs');

const checks = [];
// Anchor 2025-01-06 is Monday Week A.
checks.push(['anchor week', ps.weekTypeFor('2025-01-06'), 'A']);
checks.push(['anchor+7 week', ps.weekTypeFor('2025-01-13'), 'B']);
checks.push(['anchor+14 week', ps.weekTypeFor('2025-01-20'), 'A']);
// mondayOf various days
checks.push(['mondayOf Wed', ps.mondayOf('2025-01-08'), '2025-01-06']);
checks.push(['mondayOf Sun', ps.mondayOf('2025-01-12'), '2025-01-06']);
// Week A Wednesday should have a youtube short with punchy lanes
const wedA = ps.slotsForDate('2025-01-08');
checks.push(['Wed A has short', wedA.some(s=>s.isShort), true]);
checks.push(['Wed A rec lane[0]', ps.recommendedLanesForDate('2025-01-08')[0], 'Sharp Contradiction']);
// Week A Friday has a short; Week B Friday is rest
checks.push(['Fri A has short', ps.hasShortSlot('2025-01-10'), true]);
checks.push(['Fri B rest', ps.hasShortSlot('2025-01-17'), false]);
// Week B Thursday has a short
checks.push(['Thu B has short', ps.hasShortSlot('2025-01-16'), true]);
// Week A Sun is rest (no slots)
checks.push(['Sun A empty', ps.slotsForDate('2025-01-12').length, 0]);
// Count shorts in Week A (Mon/Wed/Fri = 3) and Week B (Mon/Wed/Thu/Sat = 4)
const countShorts = (mon) => Array.from({length:7},(_,i)=>{const d=new Date(Date.parse(mon)+i*864e5);const iso=d.toISOString().slice(0,10);return ps.hasShortSlot(iso)?1:0;}).reduce((a,b)=>a+b,0);
checks.push(['Week A short count', countShorts('2025-01-06'), 3]);
checks.push(['Week B short count', countShorts('2025-01-13'), 4]);

let ok=true;
for(const [name,got,want] of checks){
  const pass = JSON.stringify(got)===JSON.stringify(want);
  if(!pass) ok=false;
  console.log((pass?'PASS':'FAIL').padEnd(5), name, '→', JSON.stringify(got), pass?'':`(want ${JSON.stringify(want)})`);
}
console.log(ok?'\nALL PASS':'\nFAILURES');
