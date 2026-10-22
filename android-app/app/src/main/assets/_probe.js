globalThis.__dshBoot = () => {};
globalThis.__dshAndroid = (k, a) => { console.log('BRIDGE ' + k + ' :: ' + JSON.stringify(a)); return 'null'; };
const src = require('fs').readFileSync(__dirname + '/app.js', 'utf8');
try { eval(src); } catch (e) { console.log('SCRIPT-ERROR ' + String(e)); }
console.log('--- KT fires onCreate ---');
try { globalThis.__dshLifecycle_onCreate(); } catch (e) { console.log('CB-ERR ' + String(e)); }
console.log('--- KT fires onStart ---');
try { globalThis.__dshLifecycle_onStart(); } catch (e) { console.log('CB-ERR ' + String(e)); }
