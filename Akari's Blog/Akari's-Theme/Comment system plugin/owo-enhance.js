/**
 * OwO 增强：悬停弹出放大（突破容器限制）
  * owo-enhance.js
 * 用法：在页面任意位置引用本文件即可
 * 依赖：OwO 已渲染完成（Twikoo 会自动渲染）
 * 修复楼中预览放大失效问题
 */
(function () {
  /* 1. 手机端直接退出 */
  if (window.matchMedia('(max-width: 768px)').matches) return;

  /* 2. 桌面端继续原逻辑 */
  let isInitialized = false;
  
  const initOwOPreview = () => {
    if (isInitialized) return;
    
    const owoList = document.querySelectorAll('.OwO-item img');
    if (!owoList.length) return;
    
    isInitialized = true;

    /* 注入一次性 CSS（仅注入一次） */
    if (!document.getElementById('owo-popup-css')) {
      const style = document.createElement('style');
      style.id = 'owo-popup-css';
      style.textContent = `
        .OwO-preview {
          position: absolute;
          top: -100%;
          left: 125%;
          transform: translateX(-50%);
          width: 200px;
          height: 200px;
          border-radius: 8px;
          box-shadow: 0 8px 25px rgba(0,0,0,.15);
          background: #fff;
          padding: 5px;
          z-index: 9999;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s, top 0.2s;
        }
        .OwO-item:hover .OwO-preview {
          opacity: 1;
          top: -2%;
        }
      `;
      document.head.appendChild(style);
    }

    /* 为每个表情添加悬停预览 */
    const addPreviewToItems = () => {
      document.querySelectorAll('.OwO-item:not([data-preview-added])').forEach(item => {
        const img = item.querySelector('img');
        if (!img) return;
        
        item.setAttribute('data-preview-added', 'true');
        
        // 移除已存在的预览框（如果有）
        const existingPreview = item.querySelector('.OwO-preview');
        if (existingPreview) {
          existingPreview.remove();
        }
        
        const preview = document.createElement('div');
        preview.className = 'OwO-preview';
        const cloneImg = img.cloneNode(true);
        cloneImg.style.width = '100%';
        cloneImg.style.height = '100%';
        cloneImg.style.objectFit = 'contain';
        preview.appendChild(cloneImg);
        item.appendChild(preview);

        /* 悬停事件 - 直接绑定到每个元素 */
        item.addEventListener('mouseenter', (e) => {
          const previewEl = e.currentTarget.querySelector('.OwO-preview');
          if (previewEl) {
            previewEl.style.display = 'block';
          }
        });
        
        item.addEventListener('mouseleave', (e) => {
          const previewEl = e.currentTarget.querySelector('.OwO-preview');
          if (previewEl) {
            previewEl.style.display = 'none';
          }
        });
      });
    };

    // 初始添加
    addPreviewToItems();

    /* 监听表情面板的打开和关闭 */
    const observeOwOOpen = () => {
      const owoButtons = document.querySelectorAll('.tk-submit-action-icon.OwO');
      owoButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          // 短暂延迟确保DOM更新完成
          setTimeout(() => {
            addPreviewToItems();
          }, 100);
        });
      });
    };

    observeOwOOpen();

    /* 监听动态添加的表情 */
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              if (node.classList && node.classList.contains('OwO-item')) {
                shouldUpdate = true;
              } else if (node.querySelector && node.querySelector('.OwO-item')) {
                shouldUpdate = true;
              }
              
              // 检查是否是表情面板打开
              if (node.classList && node.classList.contains('OwO-open')) {
                setTimeout(() => {
                  addPreviewToItems();
                }, 100);
              }
            }
          });
        }
      });
      
      if (shouldUpdate) {
        addPreviewToItems();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    /* 额外监听：当检测到 OwO-open 类变化时重新初始化 */
    const owoOpenObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.classList && target.classList.contains('OwO')) {
            if (target.classList.contains('OwO-open')) {
              setTimeout(() => {
                addPreviewToItems();
              }, 150);
            }
          }
        }
      });
    });

    // 监听所有 OwO 容器的类变化
    document.querySelectorAll('.OwO').forEach(owo => {
      owoOpenObserver.observe(owo, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  };

  /* 等待 OwO 加载 */
  const awaitOwO = setInterval(() => {
    const owoList = document.querySelectorAll('.OwO-item img');
    if (owoList.length) {
      clearInterval(awaitOwO);
      initOwOPreview();
    }
  }, 200);

  /* 备用初始化：如果上面没检测到，但检测到 OwO 容器也初始化 */
  const backupInit = setInterval(() => {
    const owoContainer = document.querySelector('.OwO');
    if (owoContainer && !isInitialized) {
      clearInterval(backupInit);
      initOwOPreview();
    }
  }, 500);

  /* 10秒后清除所有定时器 */
  setTimeout(() => {
    clearInterval(awaitOwO);
    clearInterval(backupInit);
  }, 10000);
})();