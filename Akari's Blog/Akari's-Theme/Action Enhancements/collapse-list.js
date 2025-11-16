/**
 * 仅对正文 .ck-content 里的多级 <ul> 做默认折叠
 * collapse-list.js
 */
(function () {
  const css = `
  /* ========= 仅正文生效 ========= */
  .ck-content ul li:has(> ul) {
    position: relative;
  }
  .ck-content .fold-btn {
    position: absolute;
    left: -2.5em;          /* 放在圆点左侧 */
   /* top: 0.32em;*/
    /*width: 0.8em;*/
    /*height: 0.8em;*/
    cursor: pointer;
    transition: transform .15s;
    user-select: none;
    /*font-size: .75em;*/
    color: #666;
  }
  .ck-content li.folded > ul {
    display: none;
  }
  .ck-content li.folded .fold-btn {
    transform: rotate(-90deg);
  }

  /* ========= 显式排除目录 ========= */
  #toc-pane  .fold-btn,
  #left-menu-nav .fold-btn {
    display: none !important;
  }
  `;

  function injectCSS() {
    if (document.querySelector('#collapse-css')) return;
    const s = document.createElement('style');
    s.id = 'collapse-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function processLi(li) {
    if (li.querySelector('.fold-btn')) return;
    const btn = document.createElement('span');
    btn.className = 'fold-btn';
    btn.textContent = '▼';
    btn.onclick = e => {
      e.stopPropagation();
      li.classList.toggle('folded');
    };
    li.prepend(btn);
    li.classList.add('folded');   // 默认折叠
  }

  function scan(root = document) {
    root.querySelectorAll('.ck-content ul li').forEach(li => {
      if (li.querySelector(':scope > ul')) processLi(li);
    });
  }

  function init() {
    injectCSS();
    scan();
    /* 后续 Ajax 换页继续生效 */
    const ob = new MutationObserver(() => scan());
    const content = document.querySelector('.ck-content');
    if (content) ob.observe(content, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();