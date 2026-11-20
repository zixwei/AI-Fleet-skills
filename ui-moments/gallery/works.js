// 作品清单：首页从这里读取。新增作品时在数组里加一项即可。
const elasticControls = [
  {
    id: 'elastic-ruler',
    title: '弹性滑尺',
    en: 'Elastic Slider',
    summary: '拖动数字滑块时，边缘沿拖动方向拉长。到达刻度尽头后还可拽动一点，松手弹回。',
    tags: ['滑块', '刻度', '拖动'],
    notes: ['支持鼠标、触摸拖动和键盘方向键。', '越界只改变滑块外形，实际数值保持在 0–100。'],
  },
  {
    id: 'alignment-switch',
    title: '对齐拨片',
    en: 'Alignment Switch',
    summary: '在居左、居中和居右之间切换。选中底色先伸展再收紧，上方的线条跟着对齐。',
    tags: ['单选', '对齐', '分段控件'],
    notes: ['使用原生单选组，方向键可切换档位。', '快速切换时，拨片从当前所在位置接续移动。'],
  },
  {
    id: 'bookmark-press',
    title: '夹页键',
    en: 'Bookmark Button',
    summary: '点按切换收藏。按下时整体压扁，松手时底座回弹，书签从凹槽里弹起。',
    tags: ['收藏', '书签', '按钮'],
    notes: ['点按或使用回车、空格切换收藏状态。', '按钮外形和书签图标各自回弹。'],
  },
].map(work => ({
  ...work,
  tags: [...work.tags, '弹性控件'],
  demo: 'gallery/elastic-controls/index.html#' + work.id,
  source: 'gallery/elastic-controls',
  live: true,
  credit: {
    name: '@yui540',
    url: 'https://x.com/yui540/status/2120825584947487170',
    note: '参考控件压缩、拉伸和回弹的节奏，UI Moments 独立设计与实现。',
  },
}));

// UI Moments 原创控件：构思、造型、动效与代码均由本项目完成，MIT 许可。
// 第一批（index.html）
const originalCore = [
  {
    id: 'ink-switch',
    title: '墨滴开关',
    en: 'Ink Switch',
    type: '开关',
    summary: '拨钮里存着一滴墨。打开时墨滴落进轨道并晕开，关闭时墨水沿原路收回拨钮。',
    tags: ['开关', 'switch', '墨水', '晕染'],
    notes: ['真实的 role="switch"，空格与回车均可切换。', '墨水用 clip-path 圆形扩散，拨钮在移动时压扁再回弹。'],
  },
  {
    id: 'detent-dial',
    title: '刻度旋钮',
    en: 'Detent Dial',
    type: '旋钮',
    summary: '围绕旋钮拖动来调值。指针被最近的刻度吸住，跨过刻度时数字翻动，松手弹回刻度。',
    tags: ['旋钮', 'slider', '刻度', '拖动'],
    notes: ['role="slider"，方向键、PageUp/PageDown、Home/End 可调。', '拖过底部空隙时停在端点，不会在 0 和 10 之间跳动。'],
  },
  {
    id: 'hold-confirm',
    title: '长按确认',
    en: 'Hold to Confirm',
    type: '按钮',
    summary: '危险操作需要按住。进度填满才执行，中途松手会快速退回；快结束时文字轻微颤动提示。',
    tags: ['按钮', '删除', '长按', '确认'],
    notes: ['鼠标、触摸和键盘（按住空格或回车）都能操作。', '轻点会提示“继续按住才会删除”，避免误以为没反应。'],
  },
  {
    id: 'odometer-stepper',
    title: '滚轮步进器',
    en: 'Odometer Stepper',
    type: '步进器',
    summary: '每一位数字像里程表一样朝变化方向滚动；长按加减号会逐渐加速，到达上下限时轻轻顶一下。',
    tags: ['步进器', '计数', 'spinbutton', '数字'],
    notes: ['role="spinbutton"，方向键、PageUp/PageDown、Home/End 可调。', '9→0 继续向上滚，0→9 从下方滚回，方向始终一致。'],
  },
  {
    id: 'leaf-tabs',
    title: '翻页标签',
    en: 'Leaf Tabs',
    type: '标签页',
    summary: '选中的底卡像一页纸翻到新标签，下方柱形依次长到新的数据。',
    tags: ['标签页', 'tabs', '翻页', '图表'],
    notes: ['标准 tablist / tab / tabpanel 结构，方向键与 Home/End 切换。', '翻转方向跟随切换方向。'],
  },
  {
    id: 'tide-progress',
    title: '潮汐进度',
    en: 'Tide Progress',
    type: '进度',
    summary: '液面按弹簧追上目标进度，变化越快晃得越厉害；数字在液面上下自动反色。',
    tags: ['进度', 'progress', '液体', 'canvas'],
    notes: ['画面离开屏幕或画廊暂停时停止绘制。', '开启“减少动态效果”时直接显示结果，不晃动。'],
  },
];

// 第二批原创：表单控件（inputs.html）与操作反馈（actions.html）。
const originalInputs = [
  ['stroke-checklist', '划线清单', 'Stroke Checklist', '复选框', '勾选时对勾一笔画出，文字被一道线从左到右划掉。', ['复选框', 'checkbox', '待办']],
  ['pebble-rating', '石子评分', 'Pebble Rating', '评分', '五颗形状各异的石子。悬停预览分数，选中后石子从左到右依次弹起。', ['评分', 'rating', '单选']],
  ['notch-slider', '档位滑块', 'Notch Slider', '滑块', '在 XS 到 XL 五个档位间拖动，拨块拖动时变宽，档位标签跟着抬起。', ['滑块', 'range', '尺码']],
  ['strength-meter', '密码强度', 'Strength Meter', '输入框', '四段强度条依次填满并变色；眼睛按钮切换明文时眨一下。', ['密码', '输入框', '强度']],
  ['chip-input', '标签输入', 'Chip Input', '输入框', '回车添加标签并弹出，退格把最后一个收回；重复时输入框轻轻摇头。', ['标签', 'tags', '输入框']],
  ['plan-picker', '方案卡片', 'Plan Picker', '单选卡片', '选中描边从旧卡片滑到新卡片，到位时轻轻压扁。', ['单选', '卡片', '定价']],
].map(([id, title, en, type, summary, tags]) => ({id, title, en, type, summary, tags, page: 'inputs'}));

const originalActions = [
  ['copy-morph', '复制按钮', 'Copy Button', '按钮', '复制图标描成对勾，文字向上换成「已复制」，稍后复原。', ['复制', '按钮', '剪贴板']],
  ['like-burst', '点赞爆发', 'Like Burst', '按钮', '心形压扁回弹，光圈与火花向外散开，计数上下滚动。', ['点赞', '喜欢', '计数']],
  ['paper-plane', '纸飞机发送', 'Paper Plane Send', '按钮', '纸飞机先后缩蓄力再飞出，文字换成「已发送」，稍后从左侧飞回。', ['发送', '按钮', '纸飞机']],
  ['download-ring', '下载进度环', 'Download Ring', '按钮', '按钮收成圆环显示进度，填满后变成对勾；下载中再点可以取消。', ['下载', '进度', '按钮']],
  ['code-shake', '验证码', 'Code Shake', '输入框', '四格验证码，自动跳格、支持粘贴；输错左右摇头并清空，输对逐格变绿。', ['验证码', 'OTP', '输入框']],
  ['bell-toggle', '通知铃', 'Bell Toggle', '开关', '开启时铃身摇摆、角标弹出；关闭时铃上划过一道斜线。', ['通知', '开关', '铃铛']],
].map(([id, title, en, type, summary, tags]) => ({id, title, en, type, summary, tags, page: 'actions'}));

// 第三批原创：没有文字的图形交互（visual.html）。
const originalVisuals = [
  ['magnet-grid', '磁吸点阵', 'Magnet Grid', '指针反馈', '四十个圆点被指针吸过去，越近越大越亮，离开后弹回原位。', ['点阵', '指针', '磁吸']],
  ['jelly-pad', '果冻方块', 'Jelly Cube', '拖动', '拖动时方块沿速度方向拉长，松手后按弹簧晃回中心。', ['果冻', '拖动', '弹簧']],
  ['hue-orbit', '色轮', 'Hue Orbit', '选色器', '绕着色环拖动选色，选中的色点放大，中心色块跟着变色并鼓一下。', ['颜色', '选色', '圆环'], 'color'],
  ['merge-drops', '融合水滴', 'Merge Drops', '拖动', '把小水滴拖向大水滴，两者融成一体；松手后拉丝分开并弹回原位。', ['水滴', 'gooey', '融合']],
  ['pull-cord', '拉绳灯', 'Pull Cord Lamp', '开关', '把灯绳往下拉，松手弹回并切换灯光，灯罩下投出一束暖光。', ['开关', '灯', '拉绳'], 'color'],
  ['flip-coin', '抛硬币', 'Flip Coin', '按钮', '硬币抛起旋转几圈，落地停在太阳面或月亮面，影子随高度缩放。', ['硬币', '翻转', '随机'], 'color'],
  ['ripple-pad', '涟漪画板', 'Ripple Pad', '指针反馈', '点按落下三圈涟漪，按住越久水滴越大、涟漪越远。', ['涟漪', '长按', '水波']],
  ['bloom-toggle', '花朵开关', 'Bloom Toggle', '开关', '六片花瓣依次张开，花心亮起；再点一次收拢成花苞。', ['开关', '花', '花瓣']],
].map(([id, title, en, type, summary, tags, page = 'visual']) => ({id, title, en, type, summary, tags, page, ...(page === 'color' && {vivid: true})}));

// 第四批原创：单色微交互（motion.html）。卡片排布与过渡类型参考 amicro（MIT），代码与造型由本项目独立完成。
const amicro = {
  name: 'amicro',
  url: 'https://github.com/Subhan-code/Amicro--Micro-transitions-',
  note: '参考其卡片排布与微交互类型，UI Moments 独立设计与实现，未使用其代码。',
};
const originalMotion = [
  ['card-fan', '扇形卡组', 'Card Fan', '卡片', '五张卡片叠在一起，悬停或点按时沿弧线展开成扇形。', ['卡片', '扇形', '展开'], amicro],
  ['depth-stack', '纵深卡堆', 'Depth Stack', '卡片', '点按把最前面的卡片沉下去，再从后方插回卡堆。', ['卡片', '层叠', '纵深'], amicro],
  ['cover-flow', '封面流', 'Cover Flow', '轮播', '两侧卡片在透视中转开，中间一张正对你；方向键或点按切换。', ['轮播', '3D', '透视'], amicro],
  ['tilt-card', '倾斜卡片', 'Tilt Card', '卡片', '卡片朝指针方向倾斜，一道高光跟着移动，离开后弹回。', ['卡片', '倾斜', '高光'], amicro],
  ['magnetic-button', '磁吸按钮', 'Magnetic Button', '按钮', '指针靠近时按钮被吸过去，箭头比按钮多走一点。', ['按钮', '磁吸', '指针'], amicro],
  ['text-reveal', '文字翻转', 'Text Reveal', '文字', '悬停时字母从左到右依次向上翻出新的一行。', ['文字', '翻转', '悬停'], amicro],
  ['menu-morph', '菜单变形', 'Menu Morph', '图标', '三条横线折成一个叉，再点一次复原。', ['菜单', '图标', '变形']],
  ['stagger-rows', '错落入场', 'Stagger Rows', '列表', '四行内容依次上浮淡入，点按重播。', ['列表', '入场', '错落'], amicro],
].map(([id, title, en, type, summary, tags, credit]) => ({id, title, en, type, summary, tags, page: 'motion', ...(credit && {credit})}));

// 第五批原创：手势与物理（gestures.html）。单色、无文字。
const originalGestures = [
  ['swipe-confirm', '滑动确认', 'Swipe to Confirm', '滑块', '把圆钮拖到轨道尽头才确认，中途松手弹回；轨道里的箭头轻轻闪动提示方向。', ['滑动', '确认', '拖动']],
  ['pull-refresh', '下拉刷新', 'Pull to Refresh', '列表', '下拉列表时转圈逐渐画满，松手超过阈值就刷新，新的一行从顶部落下。', ['下拉', '刷新', '列表']],
  ['elastic-string', '弹弦', 'Elastic String', '拖动', '拉住琴弦任意一点再放手，弦按阻尼振动慢慢停下。', ['弦', '弹簧', '振动']],
  ['domino-row', '多米诺', 'Domino Row', '按钮', '七块骨牌依次倒下；再点一次，从最后一块开始依次立起。', ['多米诺', '连锁', '错落']],
  ['rocker-switch', '翘板开关', 'Rocker Switch', '开关', '像墙上的翘板开关一样在透视里左右翘起，按下的一侧变暗。', ['开关', '3D', '翘板']],
  ['scrub-wave', '波形拖动', 'Scrub Wave', '滑块', '拖动或播放时，播放头经过的波形柱变成实色。', ['音频', '波形', '进度']],
  ['snap-grid', '吸附网格', 'Snap Grid', '拖动', '把方块拖到任意位置，松手后弹进最近的格子；方向键逐格移动。', ['网格', '吸附', '拖动']],
  ['radial-menu', '扇形菜单', 'Radial Menu', '菜单', '点按加号，四个操作沿弧线依次弹出；加号转成叉。', ['菜单', '弧形', '展开']],
  ['step-track', '步骤条', 'Step Track', '进度', '前进时连线向前延伸，新到达的节点轻轻弹一下。', ['步骤', '进度', '引导']],
  ['breath-orb', '呼吸球', 'Breath Orb', '节奏', '圆球四秒吸气、四秒呼气，外圈跟着慢半拍；点按暂停。', ['呼吸', '节奏', '冥想']],
].map(([id, title, en, type, summary, tags]) => ({id, title, en, type, summary, tags, page: 'gestures'}));

// 第六批：Elastic（elastic.html）。参考 @yui540 弹性 UI 的视觉语言（浅灰底板、粗圆角近黑控件、压缩回弹），
// 控件种类、造型与代码均为本项目独立设计，未复刻原视频中的控件。
const yuiStyle = {
  name: '@yui540',
  url: 'https://x.com/yui540/status/2120825584947487170',
  note: '参考其浅灰底板、粗圆角近黑控件与压缩回弹的视觉语言；控件种类、造型与代码由 UI Moments 独立完成。',
};
const elasticSet = [
  ['stretch-toggle', '拉伸开关', 'Stretch Toggle', '开关', '按住时圆钮被拉长，松手后弹到另一端；打开时轨道翻成实色。', ['开关', '拉伸', '弹性']],
  ['worm-dots', '蠕动分页点', 'Worm Dots', '分页', '切页时指示条的前端先跑过去、尾端再追上，像一条小虫。', ['分页', '指示器', '蠕动']],
  ['rubber-search', '橡皮搜索', 'Rubber Search', '输入框', '黑色圆钮弹性拉长成搜索框；Esc 或清空后收回成圆。', ['搜索', '展开', '输入框']],
  ['gooey-tabbar', '弹性标签栏', 'Gooey Tab Bar', '标签栏', '选中底块朝新标签拉长再回弹，新图标轻轻跳起。', ['标签栏', '导航', '弹性']],
  ['squash-play', '压键播放', 'Squash Play Key', '按钮', '厚实的键帽按下时下沉压扁，播放与暂停图标互相变形。', ['播放', '键帽', '按钮']],
  ['cart-badge', '购物袋角标', 'Cart Badge', '按钮', '点加号，一颗圆点沿弧线落进袋子，袋子压扁、角标数字弹出。', ['购物车', '角标', '计数']],
  ['elastic-accordion', '弹性折叠卡', 'Elastic Accordion', '折叠面板', '展开时卡片先被拉长再回弹，箭头翻转。', ['折叠', '卡片', '展开']],
  ['bulge-volume', '鼓包音量条', 'Bulge Volume', '滑块', '拖动音量时实色顶端鼓起，扬声器的声波随音量增减。', ['音量', '竖向滑块', '拖动']],
].map(([id, title, en, type, summary, tags]) => ({id, title, en, type, summary, tags, page: 'elastic', credit: yuiStyle}));

const originalControls = [
  ...originalCore.map(work => ({...work, page: 'index'})),
  ...originalVisuals,
  ...originalMotion,
  ...originalGestures,
  ...elasticSet,
  ...originalInputs,
  ...originalActions,
].map(({page, ...work}) => ({
  ...work,
  tags: [...work.tags, work.credit ? '参考后实现' : '原创控件'],
  demo: `gallery/originals/${page}.html#${work.id}`,
  source: 'gallery/originals',
  live: true,
  original: !work.credit,
}));

window.WORKS = [
  ...originalControls,
  ...elasticControls,
  {
    id: 'day-night-toggle',
    title: '昼夜开关',
    en: 'Day / Night Toggle',
    summary: '太阳的像素点沿螺旋飞过去，重新组成月亮；轮廓光绕着拨钮转一圈。拖到一半可以停住。',
    tags: ['开关', '拖动', 'canvas'],
    demo: 'gallery/day-night-toggle/index.html',
    video: 'gallery/day-night-toggle/card.mp4',
    full: 'gallery/day-night-toggle/preview.mp4',
    poster: 'gallery/day-night-toggle/poster.jpg',
    source: 'gallery/day-night-toggle',
    credit: { name: '@kaolti', url: 'https://x.com/kaolti/status/2119151022014894260' },
    notes: [
      '像素点一一对应，沿螺旋轨迹变形，不是随机打散再拼回',
      '拖动时图标、轮廓光和背景都停在中间状态',
      '移动越快，轮廓光的尾巴越长',
      '按下压扁、移动拉长、到位回弹并荡开一圈光波',
      '支持键盘、系统亮暗设置和“减少动态效果”',
    ],
    featured: true,
    vivid: true,
  },
];
