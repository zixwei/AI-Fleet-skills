import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import vm from 'node:vm';
import {buildCatalog,categories,getCategoryFilters,matches} from '../assets/catalog.mjs';
import {componentPrompt,loaderPrompt} from '../assets/prompt.mjs';
import {originalMarkup} from '../gallery/loaders/originals.mjs';
import {htmlExample,reactExample} from '../gallery/loaders/snippets.mjs';
import {formatMicronDownload} from '../gallery/micron/catalog.mjs';
import {createSvgSpinnerIntegration} from '../gallery/svg-spinners/integration.mjs';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('主站与加载动效页统一品牌，原作只在来源与许可处署名',async()=>{
  for(const path of ['index.html','gallery/loaders/index.html']){
    const html=await read(path);
    assert.match(html.match(/<title>(.*?)<\/title>/s)[1],/UI Moments/);
    assert.doesNotMatch(html.match(/<title>(.*?)<\/title>/s)[1],/LDRS/i);
    assert.doesNotMatch(html.match(/<header.*?<\/header>/s)[0],/LDRS/i);
    assert.doesNotMatch(html.match(/<section class="(?:intro|(?:wrap )?hero)".*?<\/section>/s)[0],/LDRS/i);
    assert.doesNotMatch(html,/fonts\.googleapis\.com|fonts\.gstatic\.com/);
  }
  const page=await read('gallery/loaders/index.html');
  assert.match(page,/<details class="sources">[\s\S]*Griffin Johnston/);
  assert.match(await read('assets/gallery.mjs'),/credit\.note/);
  assert.match(await read('gallery/loaders/vendor/ldrs/LICENSE'),/Copyright \(c\) 2022 Griffin Johnston/);
});

test('新入口和旧链接兼容，画廊指向可用的代码与展示资源',async()=>{
  const context={window:{}};vm.runInNewContext(await read('gallery/works.js'),context);
  const items=buildCatalog(context.window.WORKS);
  assert.equal(items.filter(item=>item.loader&&!item.loader.original&&!item.loader.provider).length,44);
  assert.equal(items.filter(item=>item.loader?.provider==='loading-ui').length,47);
  assert.equal(items.filter(item=>item.loader?.provider==='svg-spinners').length,46);
  assert.equal(items.filter(item=>item.loader?.original).length,27);
  assert.equal(items.filter(item=>item.type==='点击反馈').length,12);
  assert.equal(items.length,176+context.window.WORKS.filter(item=>!['ldrs','loaders'].includes(item.id)).length);
  assert.equal(new Set(items.map(item=>item.id)).size,items.length);
  assert.ok(!items.some(item=>['ldrs','loaders'].includes(item.id)));
  const controls=items.filter(item=>!item.loader&&item.type!=='点击反馈');
  const referenced=controls.filter(item=>!item.original).map(item=>item.id);
  assert.deepEqual(referenced.filter(id=>!items.find(item=>item.id===id).credit?.url.includes('Amicro')&&items.find(item=>item.id===id).demo?.startsWith('gallery/originals/')!==true).sort(),[
    'alignment-switch','bookmark-press','day-night-toggle','elastic-ruler',
  ]);
  assert.equal(referenced.length,19);
  assert.equal(controls.filter(item=>item.original).length,37);
  assert.deepEqual(controls.slice(0,4).map(item=>item.id),['magnet-grid','stretch-toggle','card-fan','ink-switch']);
  const vivid=items.filter(item=>item.category==='color').map(item=>item.id);
  assert.deepEqual(vivid.sort(),['day-night-toggle','flip-coin','hue-orbit','pull-cord']);
  assert.ok(items.slice(-vivid.length).every(item=>item.category==='color'),'多彩作品排在最后');
  for(const item of items){
    assert.ok(categories.some(category=>category.id===item.category),item.id);
    if(!item.loader)await access(new URL(item.demo.split('#')[0],root));
  }
  const studies=items.filter(item=>matches(item,{category:'loading',query:'加载微动效'}));
  assert.equal(studies.length,9);
  assert.ok(studies.every(item=>item.loader.original&&item.loader.reference.endsWith('2122045748623609935')));
  const redirect=await read('gallery/ldrs/index.html');
  assert.match(redirect,/location\.replace\('\.\.\/loaders\/'\+location\.search\+location\.hash\)/);
  for(const path of ['assets/fonts/OFL-Geist.txt','assets/fonts/OFL-GeistMono.txt'])assert.match(await read(path),/SIL OPEN FONT LICENSE/);
});

test('原创控件不带外部来源，独立页面包含每个控件与无障碍角色',async()=>{
  const context={window:{}};vm.runInNewContext(await read('gallery/works.js'),context);
  const originals=context.window.WORKS.filter(work=>work.original);
  assert.equal(originals.length,37);
  const pages=new Map();
  for(const work of originals){
    assert.equal(work.credit,undefined,work.id);
    const [path,id]=work.demo.split('#');
    assert.match(path,/^gallery\/originals\/(index|visual|motion|gestures|elastic|color|inputs|actions)\.html$/);
    assert.equal(id,work.id);
    if(!pages.has(path))pages.set(path,await read(path));
    assert.match(pages.get(path),new RegExp(`<section class="sample" id="${work.id}"`),work.id);
    const prompt=componentPrompt(work);
    assert.match(prompt,/实现来源：UI Moments/);
    assert.doesNotMatch(prompt,/原始参考/);
  }
  assert.equal(pages.size,7);
  const elastic=context.window.WORKS.filter(work=>work.demo?.startsWith('gallery/originals/elastic.html#'));
  assert.equal(elastic.length,8);
  assert.ok(elastic.every(work=>work.credit?.name==='@yui540'&&!work.original));
  const inspired=context.window.WORKS.filter(work=>work.credit?.name==='amicro');
  assert.equal(inspired.length,7);
  assert.ok(inspired.every(work=>work.demo.startsWith('gallery/originals/motion.html#')));
  const all=[...pages.values()].join('');
  for(const role of ['role="switch"','role="slider"','role="spinbutton"','role="tablist"','role="tabpanel"','type="checkbox"','type="radio"','type="range"'])assert.ok(all.includes(role),role);
  for(const [path,page] of pages){
    assert.match(page,/prefers-reduced-motion/,path);
    assert.match(page,/data-gallery-active="false"/,path);
    assert.doesNotMatch(page,/(?:src=["']|url\(["']?|<link[^>]+href=["'])https?:/,`${path} 不加载外部资源`);
    assert.doesNotMatch(page,/[\u4e00-\u9fff]/,`${path} 不含中文`);
    assert.match(page,/<html lang="en">/);
  }
});

test('用途分类与形态筛选独立',()=>{
  const items=buildCatalog([{id:'day-night-toggle',title:'开关'}]);
  assert.equal(items.filter(item=>matches(item,{category:'input'})).length,1);
  assert.equal(items.filter(item=>matches(item,{category:'feedback'})).length,12);
  assert.equal(items.filter(item=>matches(item,{category:'loading'})).length,164);
  assert.equal(items.filter(item=>matches(item,{query:'Waveform'})).length,1);
  assert.equal(items.filter(item=>matches(item,{category:'loading',shape:'环形'})).length,39);
  assert.equal(items.filter(item=>matches(item,{category:'feedback',shape:'环形'})).length,0);
  assert.equal(items.filter(item=>matches(item,{category:'input',shape:'环形'})).length,0);
  assert.deepEqual(getCategoryFilters(items,'feedback').map(({id,count})=>[id,count]),[
    ['all',12],['回弹',5],['摆动',4],['闪动',3],
  ]);
  const [all,...shapeFilters]=getCategoryFilters(items,'loading');
  assert.equal(all.count,shapeFilters.reduce((total,{count})=>total+count,0));
});

test('Micron 的每个按钮复用上游关键帧，独立 HTML 包含源码与完整许可',async()=>{
  const page=await read('gallery/micron/index.html');
  const micronItems=buildCatalog().filter(item=>item.type==='点击反馈');
  const css=await read(micronItems[0].sourceFiles[0]);
  const license=await read(micronItems[0].credit.licensePath);
  assert.match(license,/Copyright \(c\) 2018 Webkul/);
  for(const item of micronItems){
    assert.match(css,new RegExp(`@keyframes action-${item.en}\\s*\\{`));
    const html=formatMicronDownload(page,item.en,css,license);
    assert.ok(html.includes(`data-effect="${item.en}"`));
    assert.ok(html.includes(css));
    assert.ok(html.includes(license.trim()));
    assert.doesNotMatch(html,/<script src=|<link rel="stylesheet"/);
    assert.match(componentPrompt(item),/vendor\/micron\/dist\/css\/micron\.css/);
    assert.match(componentPrompt(item),/vendor\/micron\/LICENSE/);
  }
});

test('SVG Spinners 导出复用原始 SVG 并保留作者和 MIT 许可',async()=>{
  const items=buildCatalog().flatMap(item=>item.loader?.provider==='svg-spinners'?[item.loader]:[]);
  const license=await read(items[0].origin.licensePath);
  const sources=JSON.parse(await read('gallery/svg-spinners/dist/sources.json'));
  const integration=createSvgSpinnerIntegration({license,sources});
  const props={size:72,color:'#f7e5cc'};
  assert.match(license,/Utkarsh Verma/);
  assert.equal(Object.keys(sources).length,46);
  for(const item of items){
    const source=await read(`gallery/svg-spinners/vendor/svg-spinners/svg-css/${item.slug}.svg`);
    assert.equal(sources[item.slug],source);
    await access(new URL(`gallery/svg-spinners/vendor/svg-spinners/svg-smil/${item.slug}.svg`,root));
    const html=integration.html(item,props,'#121214');
    const react=integration.react(item,props);
    assert.ok(html.includes(source));
    assert.ok(react.includes(JSON.stringify(source).slice(1,-1)));
    for(const output of [html,react,integration.prompt(item,props,'#121214')]){
      assert.ok(output.includes(license.trim()));
      assert.match(output,/prefers-reduced-motion/);
    }
  }
});

test('原创加载动效跨预览、HTML、React 和提示词复用同一份动效和项目许可',async()=>{
  const license=await read('LICENSE');
  for(const {loader} of buildCatalog().filter(item=>item.loader?.original)){
    const props={size:100,color:'#7744aa',speed:1.3};
    const markup=originalMarkup(loader,props);
    const html=htmlExample(loader,props,markup,license);
    const react=reactExample(loader,props,license);
    const prompt=loaderPrompt(loader,props,markup,license,'#f7f4ee');
    assert.ok(html.includes(markup));
    assert.ok(react.includes(JSON.stringify(loader.css)));
    assert.ok(react.includes(JSON.stringify(props,null,2)));
    for(const output of [html,react,prompt]){
      assert.match(output,/UI Moments 原创/);
      assert.match(output,/prefers-reduced-motion/);
      assert.doesNotMatch(output,/ldrs|Griffin Johnston/i);
      assert.ok(output.includes(license.trim()));
    }
  }
});

test('复制提示词带上当前加载参数和许可，并指向对应的交互场景源码',async()=>{
  const loader=buildCatalog().find(item=>item.id==='ring').loader;
  const license=await read('gallery/loaders/vendor/ldrs/LICENSE');
  const prompt=loaderPrompt(loader,{size:120,color:'#fcfcfc',speed:1.5},'<svg></svg>',license,'#050506');
  assert.match(prompt,/size: 120.*speed: 1\.5/);
  assert.match(prompt,/"size": 120/);
  assert.match(prompt,/ring\.register\('l-ring'\)/);
  assert.ok(prompt.includes(license.trim()));

  const context={window:{}};vm.runInNewContext(await read('gallery/works.js'),context);
  const ruler=buildCatalog(context.window.WORKS).find(item=>item.id==='elastic-ruler');
  const component=componentPrompt(ruler);
  assert.match(component,/blob\/main\/gallery\/elastic-controls\/index\.html/);
  assert.match(component,/使用 #elastic-ruler 场景/);
  assert.match(component,/键盘方向键/);
});
