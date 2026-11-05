const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../api/requests.js'),'utf8');
function setup(fail){let mail=0,slack=0;const deps={'crypto':require('crypto'),'./_store.js':{saveRequest:async()=>{if(fail)throw Error('storage unavailable')}},'./_email.js':{sendEmail:async()=>{mail++;return {sent:true}}},'./_slack.js':{notifySlack:async()=>{slack++;return {sent:true}}},'./_sign.js':{sign:()=> 'sig'},'./_config.js':{NOTIFY_TO:'team@example.test',SITE_ORIGIN:'https://example.test'}};const context={module:{exports:{}},require:n=>deps[n],console:{error(){},log(){}},Date};vm.runInNewContext(source,context);let status=200,body;const res={status(n){status=n;return this},json(v){body=v;return this}};return {handler:context.module.exports,res,get:()=>({status,body,mail,slack})}}
test('a storage failure never reports a captured lead',async()=>{const t=setup(true);await t.handler({method:'POST',body:{kind:'contact',idempotencyKey:'test-id'}},t.res);assert.equal(t.get().status,503);assert.equal(t.get().mail,0);assert.equal(t.get().slack,0)});
test('a saved enquiry can proceed to notifications',async()=>{const t=setup(false);await t.handler({method:'POST',body:{kind:'contact',idempotencyKey:'test-id'}},t.res);assert.equal(t.get().status,200);assert.equal(t.get().mail,1);assert.equal(t.get().slack,1)});
