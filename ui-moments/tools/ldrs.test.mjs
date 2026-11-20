import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {loaders,previewProps} from '../gallery/loaders/catalog.mjs';
import {htmlExample,reactExample} from '../gallery/loaders/snippets.mjs';

const base=new URL('../gallery/loaders/',import.meta.url);
const license=await readFile(new URL('vendor/ldrs/LICENSE',base),'utf8');

test('44款完整收录，预览、React样式、原始属性与来源版本均可用',async()=>{
  assert.equal(loaders.length,44);assert.equal(new Set(loaders.map(item=>item.key)).size,44);
  const index=await readFile(new URL('vendor/ldrs/dist/index.js',base),'utf8');
  const exports=[...index.matchAll(/default as (\w+)/g)].map(match=>match[1]);
  assert.deepEqual(loaders.map(item=>item.key).sort(),exports.sort());
  for(const item of loaders){
    await access(new URL(`vendor/ldrs/dist/react/${item.react}.css`,base));
    await access(new URL(`vendor/ldrs/dist/react/${item.react}.js`,base));
    const source=await readFile(new URL(`vendor/ldrs/dist/elements/${item.key}.js`,base),'utf8');
    const attrs=source.match(/static get observedAttributes\(\)\{return\[(.*?)\]/)?.[1];
    const supported=[...attrs.matchAll(/"([\w-]+)"/g)].map(match=>match[1]).sort();
    assert.deepEqual(Object.keys(item.defaults).sort(),supported,item.key);
  }
  const pkg=JSON.parse(await readFile(new URL('vendor/ldrs/package.json',base),'utf8'));
  const origin=JSON.parse(await readFile(new URL('vendor/source.json',base),'utf8'));
  assert.equal(pkg.version,origin.version);assert.equal(pkg.license,'MIT');assert.match(origin.integrity,/^sha512-/);
  assert.match(license,/Copyright \(c\) 2022 Griffin Johnston/);
});

test('独立HTML保留完整许可与样式隔离，浅色示例与预览背景一致',()=>{
  const item=loaders[0],props=previewProps(item,'#202024');
  const code=htmlExample(item,props,'<svg></svg><style>:host{color:#202024}</style>',license,'#f3f2ef');
  assert.match(code,/^<!doctype html>/);assert.match(code,/<template shadowrootmode="open">/);
  assert.ok(code.includes(license.trim()));assert.match(code,/background:#f3f2ef/);
  assert.doesNotMatch(code,/<script|cdn\.jsdelivr|\/Users\//i);
  assert.match(code,/prefers-reduced-motion/);
});

test('44份 React 示例引用预览所用的 Web Component，并保留参数和许可',async()=>{
  for(const item of loaders){
    const props={...previewProps(item,'#ffb547'),speed:1.35};
    const code=reactExample(item,props,license);
    assert.ok(code.includes(`import('ldrs').then(({ ${item.key} })`));
    assert.ok(code.includes(`${item.key}.register('${item.tag}')`));
    assert.ok(code.includes(`document.createElement('${item.tag}')`));
    assert.deepEqual(JSON.parse(code.match(/const defaults = (\{[\s\S]+?\});/)[1]),props);
    assert.ok(code.includes(license.trim()));
    assert.match(code,/prefers-reduced-motion/);
  }
  const ring2=loaders.find(item=>item.key==='ring2');
  const example=reactExample(ring2,{'bg-opacity':0.75,'stroke-length':0.6},license);
  assert.match(example,/"bg-opacity": 0\.75/);
  assert.match(example,/"stroke-length": 0\.6/);
});
