// Test reguł Firestore na lokalnym emulatorze. Uruchom poleceniem "npm test" w tym folderze.
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { readFileSync } from 'node:fs';

const env = await initializeTestEnvironment({
  projectId: 'demo-krzyzowka',
  firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 }
});
const db = uid => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
const dots = n => '.'.repeat(n);
const nowa = (u = 'A') => ({ lvl: 1, p: [{ id: 'tab1abcd', n: 'Ania', u }, null], tt: 120, st: 'wait', t: 0, cur: 0,
  fill: dots(56), own: dots(56), sc: [0, 0], sk: [0, 0], racks: ['', ''], idle: 0, hint: -1, log: '', hot: false });
const join = { p: [{ id: 'tab1abcd', n: 'Ania', u: 'A' }, { id: 'tab2wxyz', n: 'Bartek', u: 'B' }], st: 'play', t: 1, cur: 0, racks: ['LTSAU', 'ŻÓŁEN'], log: 'Gra się rozpoczęła' };
const ruch = { fill: 'Ż' + dots(55), own: '0' + dots(55), sc: [3, 0], sk: [1, 0], idle: 0, hint: -1, cur: 1, t: 2, st: 'play', racks: ['TSAU', 'ŻÓŁEN'], log: 'Ania: 1 dobrych, 0 złych, +1 pkt' };

let ok = 0, bad = 0;
async function check(name, p) { try { await p; ok++; console.log('✓', name); } catch (e) { bad++; console.log('✗', name, '\n ', e.message); } }
async function reset() { await env.clearFirestore(); }

// Prawidłowa rozgrywka
await reset();
await check('tworzenie gry', assertSucceeds(setDoc(doc(db('A'), 'games/ABCD'), nowa())));
await check('odczyt gry po kodzie', assertSucceeds(getDoc(doc(db('B'), 'games/ABCD'))));
await check('dołączenie drugiej osoby', assertSucceeds(updateDoc(doc(db('B'), 'games/ABCD'), join)));
await check('ruch z polską literą', assertSucceeds(updateDoc(doc(db('A'), 'games/ABCD'), ruch)));
await check('przepadnięcie tury zapisane przez rywala', assertSucceeds(updateDoc(doc(db('A'), 'games/ABCD'), { cur: 0, t: 3, log: 'Bartek nie zdążył, tura przepada', racks: ['TSAU', 'ŻÓŁEN'], sk: [1, 0] })));
await check('gra na jednym urządzeniu', assertSucceeds(setDoc(doc(db('C'), 'games/HOTS'), { ...nowa('C'), p: [{ id: 't', n: 'Gracz 1', u: 'C' }, { id: 't', n: 'Gracz 2', u: 'C' }], st: 'play', t: 1, hot: true, racks: ['ABCDE', 'FGHIJ'] })));

// Próby nadużyć
await check('bez logowania nie da się nic utworzyć', assertFails(setDoc(doc(db(null), 'games/WXYZ'), nowa())));
await check('lista wszystkich gier jest zablokowana', assertFails(getDocs(collection(db('Z'), 'games'))));
await check('dodatkowe duże pole jest odrzucane', assertFails(setDoc(doc(db('Z'), 'games/JUNK'), { ...nowa('Z'), junk: 'x'.repeat(100000) })));
await check('ogromna plansza jest odrzucana', assertFails(setDoc(doc(db('Z'), 'games/HUGE'), { ...nowa('Z'), fill: dots(90000), own: dots(90000) })));
await check('start z punktami jest odrzucany', assertFails(setDoc(doc(db('Z'), 'games/CHTR'), { ...nowa('Z'), sc: [999, 0] })));
await check('obcy nie zmieni wyniku', assertFails(updateDoc(doc(db('Z'), 'games/ABCD'), { sc: [3, 500], t: 4, cur: 1 })));
await check('obcy nie podmieni gracza', assertFails(updateDoc(doc(db('Z'), 'games/ABCD'), { p: [join.p[0], { id: 'z', n: 'Zly', u: 'Z' }] })));
await check('gracz nie dopisze sobie 500 pkt', assertFails(updateDoc(doc(db('A'), 'games/ABCD'), { sc: [503, 0], t: 4, cur: 1 })));
await check('gracz nie zmieni poziomu', assertFails(updateDoc(doc(db('A'), 'games/ABCD'), { lvl: 2 })));
await check('nikt nie usunie gry', assertFails(deleteDoc(doc(db('A'), 'games/ABCD'))));

await env.cleanup();
console.log(`\n${ok} zaliczonych, ${bad} niezaliczonych`);
process.exit(bad ? 1 : 0);
