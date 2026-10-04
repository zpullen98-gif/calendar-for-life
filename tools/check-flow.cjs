/* Run with jsdom available in NODE_PATH. Tests execute each edition's actual
   embedded runtime and house.js; no browser, network or user data is used. */
const {JSDOM,VirtualConsole} = require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const roots=process.argv.slice(2);
if(!roots.length) roots.push(path.resolve(__dirname,'..'));
let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message); checks++;};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function run(root) {
  const errors=[];
  const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{if(e.type==='unhandled-exception')errors.push(e);});
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const dataBlocks=[...html.matchAll(/<script id="([^"]+)" type="application\/json">([\s\S]*?)<\/script>/g)];
  ok(dataBlocks.length>=3,'Embedded collections are present');
  for(const [,id,json]of dataBlocks)ok(JSON.parse(json),'Valid '+id);
  const dom=new JSDOM(html,{url:'https://calendar.test/'+(root.includes('_publish')?'almanac/':'calendar-for-life/'),runScripts:'dangerously',virtualConsole:vc,pretendToBeVisual:true,beforeParse(w){
    w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
    w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=()=>{}; w.Element.prototype.scrollTo=()=>{};
    w.HTMLElement.prototype.getBoundingClientRect=()=>({width:600,height:100,top:0,bottom:100,left:0,right:600});
  }});
  const w=dom.window,d=w.document;
  w.eval(fs.readFileSync(path.join(root,'house.js'),'utf8'));
  const click=s=>{const el=d.querySelector(s);assert.ok(el,'Target '+s);el.click();};
  const route=async kind=>{click('[data-calendar-view="'+kind+'"]');await wait(40);};
  const search=async (id,q)=>{const input=d.getElementById(id); input.value=q;input.dispatchEvent(new w.Event('input',{bubbles:true}));await wait(230);};
  const home=()=>d.getElementById('almanac').style.display!=='none'&&d.getElementById('charts-home').style.display!=='none'&&!d.getElementById('chart-view').classList.contains('is-open');
  ok(home(),'Boot opens Months');
  ok(d.querySelectorAll('.house-wayfinder button').length===4,'Four destinations exist');
  click('#charts-grid .chart-card');await wait(15);
  ok(d.getElementById('chart-view').classList.contains('is-open'),'Month opens');
  w.history.back();await wait(40);ok(home(),'Browser Back restores Months');
  w.history.forward();await wait(40);ok(d.getElementById('chart-view').classList.contains('is-open'),'Forward restores month');
  await route('trails');ok(d.getElementById('pilgrimages').style.display!=='none','Trails tab opens from month');
  await route('today');ok(d.getElementById('pilgrimages').style.display==='none','Today leaves Trails');
  ok(d.getElementById('results-view').style.display==='block'||d.getElementById('scroll-overlay').classList.contains('is-open'),'Today opens its gatherings');
  await route('saved');ok(d.getElementById('results-view').style.display==='block','Saved opens');
  ok(d.getElementById('results-banner').textContent.includes('saved'),'Saved is labelled');
  w.history.back();await wait(40);ok(home(),'Back from Saved returns Months');
  w.history.forward();await wait(40);ok(d.getElementById('results-banner').textContent.includes('saved'),'Forward restores Saved');
  await route('months');
  await search('search-input','Tokyo');ok(d.getElementById('results-list').querySelectorAll('.voyage-card').length>0,'Calendar search finds places');
  w.history.back();await wait(40);ok(home(),'Back from search returns Months');
  w.history.forward();await wait(40);ok(d.getElementById('search-input').value==='Tokyo','Forward restores calendar query');
  ok(d.getElementById('results-view').style.display==='block','Forward restores calendar results');
  click('#search-input + .house-search-clear');await wait(250);ok(home(),'Clear search returns Months');
  await route('trails');await search('pilgrim-search','Shakespeare');
  ok(d.getElementById('pilgrim-results-list').querySelectorAll('.voyage-card').length>0,'Trail search finds stops');
  w.history.back();await wait(40);ok(d.getElementById('pilgrim-home').style.display!=='none','Back leaves trail results');
  w.history.forward();await wait(40);ok(d.getElementById('pilgrim-search').value==='Shakespeare','Forward restores trail query');
  ok(d.getElementById('pilgrim-results-view').style.display==='block','Forward restores trail results');
  await route('months');click('#charts-grid .chart-card');click('#voyages-list .voyage-card');await wait(30);
  click('#scroll-bookmark');ok(d.getElementById('scroll-bookmark').getAttribute('aria-pressed')==='true','Entry saves');
  click('#scroll-close');await wait(45);await route('saved');
  ok(d.getElementById('results-list').querySelectorAll('.voyage-card').length===1,'Saved shelf has one entry');
  click('#results-list .voyage-card');await wait(20);click('#scroll-bookmark');click('#scroll-close');await wait(50);
  ok(d.getElementById('results-list').querySelectorAll('.voyage-card').length===0,'Removing bookmark refreshes saved shelf');
  ok(d.getElementById('results-list').textContent.includes('No bookmarks'),'Empty saved shelf explains how to begin');
  // A pending debounced search must not navigate back after a tab is chosen.
  const input=d.getElementById('search-input');input.value='Paris';input.dispatchEvent(new w.Event('input',{bubbles:true}));
  await route('trails');await wait(250);ok(d.getElementById('pilgrimages').style.display!=='none','Pending search cannot interrupt a tab change');
  ok(d.querySelector('#house-return').getAttribute('role')===null,'Native buttons keep native keyboard handling');
  ok(errors.length===0,'Runtime has no errors: '+errors.map(e=>e.message).join('; '));
  console.log('PASS '+root);dom.window.close();
}
(async()=>{for(const root of roots)await run(path.resolve(root));console.log(checks+' Calendar flow checks passed.');})().catch(e=>{console.error(e);process.exitCode=1;});
