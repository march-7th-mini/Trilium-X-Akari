/********************************************************************
 *  bgm.js  带播放/暂停 + 旋转脉冲动效（单文件）
 *  手机（≤768 px）直接禁用
 *  新增：首页下滚 80px 自动播放，其它页仅按钮控制
 *******************************************************************/
(function () {
  /* 1. 手机模式直接退出 ********************************/
  const isMobile = /Android|iPhone|iPad|iPod|Mobile|Phone/i.test(navigator.userAgent) &&
                   window.innerWidth <= 768;
  if (isMobile) return;

  /* 2. 音频对象 丨下方音频src替换为自己喜欢的****************************************/
  const aud = new Audio();
  aud.src = `https://trilium.dpdns.org/music/PS4-Earth-BGM.mp3`;
  aud.loop = true;
  aud.volume = 0.35;
  aud.autoplay = true;
  aud.muted = true;            // 先静音，避免浏览器拦截
  document.body.appendChild(aud);

  /* 3. 悬浮按钮 ****************************************/
  const btn = document.createElement('button');
  btn.id = 'bgm-toggle';
  btn.title = '背景音乐开关';
  btn.innerHTML = '🚫';
  Object.assign(btn.style, {
    position: 'fixed',
    top: '-1px',
    left: '-10px',
    zIndex: 9998,
    width: '44px',
    height: '44px',
    border: 'none',
    borderRadius: '50%',
    background: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer'
  });
  document.body.appendChild(btn);

  /* 4. 动效样式（动态插入，无需额外文件） **************/
  const style = document.createElement('style');
  style.textContent = `
  @keyframes bgm-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes bgm-pulse {
    0%   { box-shadow: 0 0 0 0 rgba(29,41,185,.6); }
    70%  { box-shadow: 0 0 0 139px rgba(29,185,84,0); }
    100% { box-shadow: 0 0 0 0 rgba(29,185,84,0); }
  }
  #bgm-toggle.playing {
    animation: bgm-spin 3s linear infinite,
               bgm-pulse 1.8s ease-out infinite;
  }`;
  document.head.appendChild(style);

  /* 5. 状态变量 ****************************************/
  let userManuallyPaused = false;
  let scrollTriggered = false;          // 首页滚动触发过一次就永久失效

  /* 6. 判断当前是否首页（按需改规则） ******************/
    function isHomePage() {
      return location.pathname === '/share/index.html';
    }

  /* 7. 首页滚动自动播放 ********************************/
  function tryScrollPlay() {
    if (!isHomePage() || scrollTriggered || userManuallyPaused) return;
    if (window.scrollY >= 80) {
      scrollTriggered = true;
      aud.play().then(() => {
        aud.muted = false;
        btn.innerHTML = '🎵';
        btn.classList.add('playing');
      }).catch(() => {});
      window.removeEventListener('scroll', tryScrollPlay);
    }
  }

  if (isHomePage()) {
    window.addEventListener('scroll', tryScrollPlay, { passive: true });
  }

  /* 8. 按钮点击：播放/暂停 + 动效 **********************/
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (aud.paused) {
      aud.play();
      aud.muted = false;
      userManuallyPaused = false;
      btn.innerHTML = '🎵';
      btn.classList.add('playing');
      if (isHomePage()) scrollTriggered = true; // 手动点击后也不再自动触发
    } else {
      aud.pause();
      userManuallyPaused = true;
      btn.innerHTML = '🚫';
      btn.classList.remove('playing');
    }
  });

  /* 9. 页面可见性变化：自动暂停/恢复 *******************/
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      aud.pause();
      btn.classList.remove('playing');
    } else if (!aud.paused && !userManuallyPaused) {
      aud.play();
      btn.classList.add('playing');
    }
  });
})();