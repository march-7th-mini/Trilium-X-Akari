/* ========= Kimi-Chat 独立版 ========= */
// 1. 让浏览器认定这是合法 ES Module（空导出即可）
export {};

// 2. 下面直接放原逻辑，**不再包 IIFE**
const IFRAME_SRC = 'https://kimi.moonshot.cn';
const TOGGLE_TITLE = 'Kimi Chat';

// 3. 单例依旧有效（只是文件级变量，不污染全局）
if (window.__kimiInjected) {
  // 如果已经加载过，直接退出
  throw new Error('[kimi-chat] 已初始化，跳过重复加载');
}
window.__kimiInjected = true;

  /* -------- 样式 -------- */
  const style = document.createElement('style');
  style.id = 'kimi-chat-style';
  style.textContent = `
  :root{
    --kimi-bg:#ffffff;
    --kimi-border:#e5e7eb;
    --kimi-text:#111827;
    --kimi-accent:#3b82f6;
    --kimi-hover:#0ea5e9;
  }
  [data-theme="dark"]{
    --kimi-bg:#1f2937;
    --kimi-border:#374151;
    --kimi-text:#f9fafb;
  }
  #kimi-panel{
    position:fixed;
    top:0;
    right:0;
    width:831px;
    height:100vh;
    max-width:80vw;
    min-width:300px;
    z-index:9999;
    display:flex;
    flex-direction:column;
    background:var(--kimi-bg);
    border-left:1px solid var(--kimi-border);
    box-shadow:-2px 0 8px rgba(0,0,0,.15);
    transform:translateX(100%);
    transition:transform .25s ease;
  }
  #kimi-panel.show{transform:translateX(0);}
  #kimi-resizer{
    position:absolute;
    left:-4px;
    top:0;
    width:8px;
    height:100%;
    cursor:ew-resize;
  }
  #kimi-header{
    flex:0 0 auto;
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:.4em .6em;
    border-bottom:1px solid var(--kimi-border);
    color:var(--kimi-text);
  }
  #kimi-minimize-btn{
    cursor:pointer;
    font-size:18px;
    background:none;
    border:none;
    color:inherit;
  }
  #kimi-frame{flex:1;border:none;width:100%;}
  #kimi-float-btn{
    position:fixed;
    right:20px;
    bottom:20px;
    z-index:99999;
    width:48px;
    height:48px;
    border-radius:50%;
    border:none;
    background:var(--kimi-bg);
    cursor:pointer;
    box-shadow:0 2px 8px rgba(0,0,0,.25);
    display:flex;
    align-items:center;
    justify-content:center;
    transform:scale(.9);
    transition:transform .3s ease, box-shadow .3s ease;
  }
  #kimi-float-btn:hover{
    transform:scale(1.1);
    box-shadow:0 4px 16px rgba(0,0,0,.35);
  }
  #kimi-float-btn svg{
    width:26px;
    height:26px;
    fill:var(--kimi-accent);
    transition:fill .3s;
  }
  #kimi-float-btn:hover svg{fill:var(--kimi-hover);}
  `;
  document.head.appendChild(style);

  /* -------- 面板 DOM -------- */
  const panel = document.createElement('div');
  panel.id = 'kimi-panel';
  panel.innerHTML = `
<div id="kimi-resizer"></div>
<div id="kimi-header">
  <span>${TOGGLE_TITLE}</span>
  <button id="kimi-minimize-btn" title="最小化">—</button>
</div>
<iframe id="kimi-frame" src="${IFRAME_SRC}"></iframe>`;
  document.body.appendChild(panel);

  /* -------- 右下角按钮 -------- */
  const btn = document.createElement('button');
  btn.id = 'kimi-float-btn';
  btn.title = TOGGLE_TITLE;
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2.5 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-2.5 9c2.33 0 4.32-1.45 5-3.5-.32-.2-2.89-1.5-5-1.5s-4.68 1.3-5 1.5c.68 2.05 2.67 3.5 5 3.5z"/></svg>`;
  document.body.appendChild(btn);

  /* -------- 显隐控制 -------- */
  const show = () => panel.classList.add('show');
  const hide = () => panel.classList.remove('show');
  btn.addEventListener('click', () => panel.classList.toggle('show'));
  document.getElementById('kimi-minimize-btn').addEventListener('click', hide);

  /* 键盘快捷键 */
  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'w') show();
    if (e.key === 'Escape') hide();
  });

  /* -------- 拖拽缩放 -------- */
  let startX, startW, raf;
  const resizer = document.getElementById('kimi-resizer');
  const iframe  = document.getElementById('kimi-frame');
  const placeholder = document.createElement('div');
  placeholder.style.cssText = `flex:1;background:var(--kimi-bg);display:flex;align-items:center;justify-content:center;color:var(--kimi-text);`;
  placeholder.textContent = '拖动调整宽度丨快捷键：Alt+W=> 显示页面丨Esc=> 隐藏页面';

  resizer.addEventListener('mousedown', e => {
    e.preventDefault();
    startX  = e.clientX;
    startW  = panel.offsetWidth;
    iframe.style.display = 'none';
    panel.insertBefore(placeholder, iframe);
    document.body.style.cursor = 'e-resize';
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', onUp, true);
  });

  function onMove(e) {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const w = Math.max(300, Math.min(window.innerWidth * .8, startW - (e.clientX - startX)));
      panel.style.width = w + 'px';
    });
  }
  function onUp() {
    cancelAnimationFrame(raf);
    placeholder.remove();
    iframe.style.display = 'block';
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('mouseup', onUp, true);
  }
/* ===== 移动端：左下定位 + 半屏底弹 ===== */
const isMobile = window.matchMedia('(pointer: coarse) and (max-width: 768px)').matches;

if (isMobile) {
  /* 1. 按钮移到右上 */
  btn.style.right = 'auto';
  btn.style.right  = '90px';
  btn.style.top= '5px';
  btn.style.transform = 'scale(0.35)';

  /* 2. 注入移动端底弹样式（只一次） */
  const mobileStyle = document.createElement('style');
  mobileStyle.textContent = `
@media (pointer: coarse) and (max-width: 768px) {
  #kimi-panel {
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 50vh !important;
    max-width: none !important;
    transform: translateY(100%) !important;
    border-left: none !important;
    border-top: 1px solid var(--kimi-border) !important;
    box-shadow: 0 -2px 8px rgba(0,0,0,.15) !important;
    transition: transform .25s ease !important;
  }
  #kimi-panel.show {
    transform: translateY(0) !important;
  }
  #kimi-resizer {
    display: none !important;
  }
}
`;
  document.head.appendChild(mobileStyle);

  /* 3. 事件沿用原来的 show / hide 即可，无需重写 */
  /*    因为 .show 类已经换成 translateY(0) */
}