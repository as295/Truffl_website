const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/scripts/website-analytics.js'),'utf8');
function setup(){
 const listeners={},added=[];
 const document={body:{dataset:{view:'home'}},title:'Truffl',referrer:'https://example.com/?email=private@example.com',head:{appendChild(x){added.push(x)}},createElement(){return {}},addEventListener(n,f){listeners['doc:'+n]=f}};
 const window={addEventListener(n,f){listeners[n]=f}};
 const context={window,document,location:{origin:'https://trufflinnovations.in'},URL,encodeURIComponent,Date};vm.runInNewContext(source,context);
 return {window,document,listeners,added};
}
test('loads only after consent and emits sanitized distinct page views',()=>{
 const {window,document,listeners,added}=setup();window.trufflAnalytics.configure('G-0CTEJN2135',false);assert.equal(added.length,0);
 window.trufflAnalytics.configure('G-0CTEJN2135',true);assert.equal(added.length,1);
 let rows=window.dataLayer.map(a=>Array.from(a));let page=rows.filter(a=>a[0]==='event'&&a[1]==='page_view');assert.equal(page.length,1);assert.equal(page[0][2].page_referrer,'https://example.com');
 listeners['truffl:view']({detail:{name:'pricing'}});listeners['truffl:view']({detail:{name:'pricing'}});
 rows=window.dataLayer.map(a=>Array.from(a));page=rows.filter(a=>a[0]==='event'&&a[1]==='page_view');assert.equal(page.length,2);assert.equal(page[1][2].page_location,'https://trufflinnovations.in/pricing');assert.equal(page[1][2].page_referrer,'https://trufflinnovations.in/');
 window.trufflAnalytics.configure('G-0CTEJN2135',false);const before=window.dataLayer.length;window.trufflAnalytics.event('generate_lead');assert.equal(window.dataLayer.length,before);assert.equal(window['ga-disable-G-0CTEJN2135'],true);
});
test('rejects invalid measurement ids',()=>{const {window,added}=setup();window.trufflAnalytics.configure('G-BAD<script>',true);assert.equal(added.length,0)});
