/*!
 * 首页欢迎词脚本
 * welcome.js
 * add by Akari_404
 * Akari's Blog:  https://www.aiphm.cn/share/index.html
 */

/*  手机端禁用，随机语录，动态特效  */

// 语录数组
const quotes = [
  "我是主角吗？",
  "はーいー！ゆるゆり，始まるよ~",
  "アッカリ～ン",
  "嗯…自己是谁，应当由自己去探寻……",
  "做得好，夸夸自己吧~",
  "欢迎回来~",
  "深呼吸 xi~~ 放轻松 hu~~",
  "抬头看看蓝天吧~",
  "有时候放松也挺好的，让身体休息一下。",
  "给自己多充充电，多学点东西，总会有用得到的地方。",
  "锻炼身体能让人焕然一新，有事没事锻炼一下总没错！",
  "书是好东西，要多看书。",
  "Trilium是第二大脑！",
  "爱护自己",
  "出门在外保护好自己",
  "吾生也有涯，而知也无涯。",
  "少则得，多则惑。"
];

const css = `
#globalBackground{position:relative;text-align:center}
.welcome-text{
  cursor: default; 
  position:absolute;
  top:60%;
  left:35%; /* 调整到屏幕左1/4位置 */
  transform:translate(-50%,-50%);
  font-size:4rem; /* 放大字体 */
  color:#fff;
  text-shadow:0 2px 12px rgba(0,0,0,.8);
  z-index:1;
  font-weight:bold;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  max-width:50%; /* 限制宽度在屏幕左半部分 */
  text-align:left;
  line-height:1.2;
  
  /* 动画效果 */
  animation: welcomeAnimation 2s ease-out forwards;
  opacity:0;
  transform: translate(-30%, -50%) scale(0.8); /* 初始状态偏右且缩小 */
}

/* 动画关键帧 */
@keyframes welcomeAnimation {
  0% {
    opacity:0;
    transform: translate(-30%, -50%) scale(0.8);
    text-shadow:0 0 20px rgba(255,255,255,0.5);
  }
  70% {
    opacity:0.9;
    transform: translate(-50%, -50%) scale(1.05);
    text-shadow:0 2px 20px rgba(0,0,0,0.8);
  }
  100% {
    opacity:1;
    transform: translate(-50%, -50%) scale(1);
    text-shadow:0 2px 12px rgba(0,0,0,0.8);
  }
}

/* 鼠标悬停效果 */
.welcome-text:hover {
  transform: translate(-50%, -50%) scale(1.02) !important;
  text-shadow:0 4px 20px rgba(0,0,0,0.9) !important;
  transition: all 0.3s ease;
}

/* 手机端隐藏 */
@media (max-width: 768px) {
  .welcome-text {
    display: none !important;
  }
}

/* 小屏幕调整 */
@media (max-width: 1200px) {
  .welcome-text {
    font-size: 3rem;
    left: 30%;
  }
}
`;

// 检查是否在首页且非手机端
function shouldShowWelcome() {
  // 检查是否手机端
  const isMobile = window.innerWidth <= 768;
  
  // 如果是手机端，直接返回false
  if (isMobile) {
    return false;
  }
  
  // 通过检查是否加载了首页背景图来判断是否为首页
  // 根据EJS逻辑，首页背景图的position为static，其他页面为fixed
  const bgImage = document.getElementById('globalBackgroundImg');
  
  // 如果没有背景图，不是首页
  if (!bgImage) {
    console.log('未找到首页背景图，不是首页');
    return false;
  }
  
  // 检查背景图的position样式
  const computedStyle = window.getComputedStyle(bgImage);
  const positionValue = computedStyle.getPropertyValue('position');
  
  // 根据EJS逻辑，首页背景图的position为static
  const isHomePage = positionValue === 'static';
  
  console.log('首页判断结果:', {
    hasBackgroundImage: !!bgImage,
    positionValue: positionValue,
    isHomePage: isHomePage
  });
  
  return isHomePage;
}

// 等待页面加载完成后执行
function initWelcomeText() {
  // 防重复：已经插过就退出
  if (!document.querySelector('.welcome-text') && shouldShowWelcome()) {
    // 随机选择一条语录
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    // 样式
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    // 文字
    const box = document.getElementById('globalBackground');
    if (box) {
      const welcome = document.createElement('div');
      welcome.className = 'welcome-text';
      welcome.textContent = randomQuote;
      box.appendChild(welcome);
      
      // 添加淡出效果（可选，在5秒后淡出）
      setTimeout(() => {
        welcome.style.transition = 'opacity 1.5s ease';
        welcome.style.opacity = '0';
        // 完全透明后移除元素
        setTimeout(() => {
          if (welcome.parentNode) {
            welcome.parentNode.removeChild(welcome);
          }
        }, 1500);
      }, 5000);
    }
  }
}

// 确保DOM完全加载后再执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWelcomeText);
} else {
  // DOMContentLoaded已经触发
  initWelcomeText();
}
/********************************************************************
 *  追加：定时再次推送欢迎词（20s 间隔，仅首页+非手机）
 *******************************************************************/
const WELCOME_INTERVAL = 20_000;          // 20 秒轮询
let intervalId = null;

function startWelcomeLoop() {
  // 防重复
  if (intervalId) return;
  intervalId = setInterval(() => {
    // 仍走同一套判断
    if (shouldShowWelcome() && !document.querySelector('.welcome-text')) {
      initWelcomeText();
    }
  }, WELCOME_INTERVAL);
}

// 页面可见性变化时智能启停
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(intervalId);
    intervalId = null;
  } else {
    startWelcomeLoop();
  }
});

// DOM 就绪后启动轮询
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startWelcomeLoop);
} else {
  startWelcomeLoop();
}

/********************************************************************
 *  向下滚动按钮：固定在首页图片上，进入#main区域即消失
 *******************************************************************/
const SCROLL_BTN_CSS = `
.scroll-to-main{
  position:absolute;          /* 关键：固定在首页图里 */
  bottom:8%; left:50%;
  transform:translateX(-50%);
  z-index:10;
  width:52px; height:52px;
  border-radius:50%;
  background:rgba(255,255,255,.85);
  backdrop-filter:blur(4px);
  box-shadow:0 4px 12px rgba(0,0,0,.15);
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:opacity .6s ease;
  animation:bounceArrow 2s infinite;
}
.scroll-to-main:hover{transform:translateX(-50%) scale(1.08);}
.scroll-to-main::after{
  content:''; width:0; height:0;
  border-left:8px solid transparent;
  border-right:8px solid transparent;
  border-top:10px solid #333;
}
@keyframes bounceArrow{
  0%,100%{transform:translateX(-50%) translateY(0);}
  50%{transform:translateX(-50%) translateY(6px);}
}
@media (max-width: 768px){.scroll-to-main{display:none !important;}}
`;

let scrollBtn = null;

/* 创建按钮并塞进 #globalBackground */
function createScrollBtnInHero() {
  if (scrollBtn || !shouldShowWelcome()) return;

  // 样式只注入一次
  if (!document.querySelector('#scrollBtnStyle')) {
    const style = document.createElement('style');
    style.id = 'scrollBtnStyle';
    style.textContent = SCROLL_BTN_CSS;
    document.head.appendChild(style);
  }

  // 按钮
  scrollBtn = document.createElement('div');
  scrollBtn.className = 'scroll-to-main';
  scrollBtn.title = '向下滚动';
  document.getElementById('globalBackground')?.appendChild(scrollBtn);

  // 点击平滑滚动到 #main
  scrollBtn.addEventListener('click', () => {
    const main = document.getElementById('main');
    if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* 监听 #main 是否进入视口 */
function watchMainVisibility() {
  const main = document.getElementById('main');
  if (!main) return;

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        // #main 出现 → 按钮淡出
        if (scrollBtn) scrollBtn.style.opacity = '0';
      } else {
        // #main 离开 → 按钮恢复
        if (scrollBtn) scrollBtn.style.opacity = '1';
      }
    },
    { threshold: 0.1 }
  );
  io.observe(main);
}

/* 初始化 */
function initScrollBtnHero() {
  if (shouldShowWelcome()) {
    createScrollBtnInHero();
    watchMainVisibility();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollBtnHero);
} else {
  initScrollBtnHero();
}


