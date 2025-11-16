/*!
 * 气泡+霓虹字脚本，首页的猫爪和气泡就是来自这里控制
 * index-extra-effect.js
 * add by Akari_404
 * Akari's Blog:  https://www.aiphm.cn/share/index.html
 */

/*! 气泡+霓虹字，搭配shmaur-messages.css使用，美化首页，文字内容在这里修改  */
(() => {
  const EXTRA_CSS = `
#globalBackground .bubble{opacity:.35!important;transform:scale(.8)!important;}
`;
  const SKELETON = `
<div class="bubbles" id="bubbles"></div>
<div class="msg">
  <svg viewBox="0 0 320 320">
    <defs>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <linearGradient id="whiteGlow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.2" stop-color="#fff" stop-opacity="1"/>
        <stop offset="0.8" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <symbol id="s-text">
      <text text-anchor="middle" x="50%" y="50%" dy=".35em" font-size="160" fill="transparent">ฅ</text>  // 这里可以修改ฅ为其他文字
    </symbol>
    <g filter="url(#glow)">
      <use xlink:href="#s-text" class="text-copy"/>
      <use xlink:href="#s-text" class="text-copy"/>
      <use xlink:href="#s-text" class="text-copy"/>
      <use xlink:href="#s-text" class="text-copy"/>
      <use xlink:href="#s-text" class="text-copy"/>
    </g>
    <g filter="url(#glow)">
      <use xlink:href="#s-text" stroke="url(#whiteGlow)" stroke-width="4"
          stroke-dasharray="200 2000" stroke-linecap="round" fill="none">
        <animate attributeName="stroke-dashoffset" from="0" to="-2200" dur="3s" repeatCount="indefinite"/>
      </use>
    </g>
  </svg>
</div>
`;

  const isMobile = () => window.innerWidth <= 768;
  const isHomePage = () => {
    const img = document.getElementById('globalBackgroundImg');
    return img && getComputedStyle(img).position === 'static';
  };
  const shouldRun = () => !isMobile() && isHomePage();

  function injectSkeleton() {
    if (document.querySelector('.bubbles')) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = SKELETON;
    document.body.prepend(wrapper);
  }

   /* ---------- 气泡生成（限制版） ---------- */
  let factoryTimer = null;
  let liveCount   = 0;                       // 【1】计数器
  const MAX_LIVE  = 15;                      // 【2】上限
  function startBubbles() {
    const bubbles = document.getElementById('bubbles');
    if (!bubbles) return;
    const colors = ['var(--mint)', 'var(--cat-pink)', '#A7E9FF', '#C9B0FF'];
    function createBubble() {
      if (liveCount >= MAX_LIVE) return;     // 【3】超量就放弃本次
      const b = document.createElement('div');
      b.className = 'bubble';
      const size = Math.random() * 60 + 20;
      b.style.width = b.style.height = size + 'px';
      b.style.left = Math.random() * 100 + '%';
      b.style.bottom = '-100px';
      b.style.background = colors[Math.floor(Math.random() * colors.length)];
      b.style.animationDuration = (Math.random() * 4 + 8) + 's';
      b.style.animationDelay = Math.random() * 2 + 's';
      bubbles.appendChild(b);
      liveCount++;                           // 【4】出生+1
      b.addEventListener('animationend', () => {
        b.remove();
        liveCount--;                         // 【5】死亡-1
      });
    }
    function startFactory() {
      if (factoryTimer) return;                  // 【新增】单例
      for (let i = 0; i < 8; i++) setTimeout(createBubble, i * 150);
      factoryTimer = setInterval(createBubble, 3000); // 【调回】3 秒 1 个
    }
    function stopFactory() {
      clearInterval(factoryTimer);
      factoryTimer = null;
      bubbles.querySelectorAll('.bubble').forEach(b => b.remove());
    }
    startFactory();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopFactory();
      else startFactory();
    });
  }

  function run() {
    if (!shouldRun()) return;
    injectSkeleton();
    startBubbles();
  }

  window.addEventListener('DOMContentLoaded', run);
  window.addEventListener('resize', run);
})();