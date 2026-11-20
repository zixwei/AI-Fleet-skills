import {loaders} from '../gallery/loaders/catalog.mjs';
import {originalLoaders} from '../gallery/loaders/originals.mjs';
import {loadingUILoaders} from '../gallery/loading-ui/catalog.mjs';
import {svgSpinners} from '../gallery/svg-spinners/catalog.mjs';
import {micronWorks} from '../gallery/micron/catalog.mjs';

export const categories = [
  {id: 'all', name: '全部 UI'},
  {id: 'input', name: '交互控件'},
  {id: 'feedback', name: '点击反馈'},
  {id: 'loading', name: '加载动效'},
  // 色彩鲜艳的作品单独放在最后，图鉴首屏保持单色。
  {id: 'color', name: '多彩'},
];
const categoryNames = new Map(categories.map(({id, name}) => [id, name]));

const controlTypes = {
  'day-night-toggle': '开关',
  'elastic-ruler': '滑块',
  'alignment-switch': '分段控件',
  'bookmark-press': '收藏按钮',
};

const feedbackShapes = {
  jelly: '回弹', bounce: '回弹', squeeze: '回弹', pop: '回弹', tada: '回弹',
  shake: '摆动', groove: '摆动', jerk: '摆动', swing: '摆动',
  fade: '闪动', blink: '闪动', flicker: '闪动',
};

const shapeFilters = {
  feedback: {label: '全部效果', order: ['回弹', '摆动', '闪动']},
  loading: {label: '全部形态', order: ['环形', '圆点', '线条', '几何', '文字', '字符', '图标', '状态']},
};

const featured = [
  'magnet-grid', 'stretch-toggle', 'card-fan', 'ink-switch', 'gooey-tabbar', 'swipe-confirm', 'jelly-pad', 'squash-play',
  'paper-fold', 'tilt-card', 'elastic-string', 'detent-dial', 'merge-drops',
  'radial-menu', 'menu-morph', 'tide-ring', 'depth-stack', 'rocker-switch',
  'bloom-toggle', 'domino-row', 'like-burst', 'text-reveal', 'pixel-snake',
  'scrub-wave', 'worm-dots', 'download-ring', 'cart-badge', 'snap-grid', 'breath-orb', 'rubber-search', 'pull-refresh', 'bulge-volume', 'elastic-accordion',
  'step-track', 'orbit-pair', 'level-bars', 'flip-tile',
  'cover-flow', 'odometer-stepper', 'ripple-pad', 'magnetic-button', 'elastic-ruler',
  'leaf-tabs', 'tide-progress', 'bell-toggle', 'stagger-rows', 'hold-confirm',
  'alignment-switch', 'pebble-rating', 'bookmark-press', 'paper-plane', 'copy-morph',
  'shutter-steps', 'micron-jelly', 'signal-return', 'svg-spinner-gooey-balls-1', 'micron-swing',
  'sand-turn', 'ring', 'micron-fade', 'bow-spring', 'svg-spinner-wifi', 'dot-field', 'square',
  'micron-squeeze', 'svg-spinner-bars-scale-middle', 'corner-lock', 'micron-shake', 'lineWobble',
  'clock-hands', 'loading-ui-terminal', 'svg-spinner-clock', 'micron-tada', 'loading-ui-morphing-infinity',
  'svg-spinner-blocks-wave', 'stack-blocks', 'loading-ui-text-shimmer-wave',
];

export function buildCatalog(works = []) {
  const effects = [...originalLoaders, ...loaders, ...loadingUILoaders, ...svgSpinners].map(loader => ({
    id: loader.key, title: loader.name, en: loader.name, category: 'loading', type: '加载指示器',
    shape: loader.group, summary: loader.description,
    tags: loader.original
      ? ['原创', 'loading', loader.collection]
      : [loader.origin?.name || 'LDRS', loader.origin?.author || 'UI Ball', '开源集成'],
    loader,
  }));
  const controls = works.filter(work => !['ldrs', 'loaders'].includes(work.id)).map(work => ({
    ...work, category: work.vivid ? 'color' : 'input', type: work.type || controlTypes[work.id] || '交互控件',
  }));
  const feedback = micronWorks.map(work => ({...work, shape: feedbackShapes[work.en]}));

  // 首批先展示可操作的控件，并穿插不同用途的精选案例。
  const byId = new Map([...controls, ...effects, ...feedback].map(item => [item.id, item]));
  const result = [];
  for (const id of featured) {
    if (!byId.has(id)) continue;
    result.push(byId.get(id));
    byId.delete(id);
  }

  // 剩余示例轮流取自各形态和来源，减少相近作品连续出现。
  const groups = new Map();
  for (const item of byId.values()) {
    const {loader} = item;
    const group = loader ? `${item.shape}:${loader.provider || (loader.original ? 'original' : 'ldrs')}` : item.category;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(item);
  }
  const longestGroup = Math.max(0, ...Array.from(groups.values(), group => group.length));
  for (let index = 0; index < longestGroup; index++) {
    for (const group of groups.values()) {
      if (group[index]) result.push(group[index]);
    }
  }
  // 「全部 UI」里多彩作品统一排在最后。
  return [...result.filter(item => item.category !== 'color'), ...result.filter(item => item.category === 'color')];
}

export function getCategoryFilters(items, category) {
  const filter = shapeFilters[category];
  if (!filter) return [];

  const inCategory = items.filter(item => item.category === category);
  const counts = new Map();
  for (const {shape} of inCategory) {
    if (shape) counts.set(shape, (counts.get(shape) || 0) + 1);
  }
  const shapes = [...new Set([...filter.order, ...counts.keys()])].filter(shape => counts.has(shape));
  if (shapes.length === 0) return [];
  return [
    {id: 'all', name: filter.label, count: inCategory.length},
    ...shapes.map(shape => ({id: shape, name: shape, count: counts.get(shape)})),
  ];
}

export function matches(item, {category = 'all', shape = 'all', query = ''} = {}) {
  if ((category !== 'all' && item.category !== category) || (shape !== 'all' && item.shape !== shape)) return false;
  const term = query.trim().toLocaleLowerCase();
  if (!term) return true;
  return [item.title, item.en, item.id, categoryNames.get(item.category), item.type, item.shape, item.summary, ...(item.tags || [])]
    .filter(Boolean).join(' ').toLocaleLowerCase().includes(term);
}
