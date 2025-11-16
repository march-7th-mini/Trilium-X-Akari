/*!
 * 页面蒙版颜色、透明度脚本
 * overlay-color.js
 * add by Akari_404
 * Akari's Blog:  https://www.aiphm.cn/share/index.html
 */

// 预设色表 
const presets = [
    {name: '初音ミク', color: '#39C5BB'},
    {name: '巡音ルカ', color: '#FAAFBE'},
    {name: '洛天依', color: '#66CCFF'},
    {name: '重音テト', color: '#DE5278'},
    {name: '萩原雪步', color: '#D3DDE9'},
    {name: '南小鸟', color: '#cebfbf'}
];

let currentColor, currentOpacity;

function initOverlayColor() {
    /* ====== 手机端直接退出 ====== */
    if (window.innerWidth <= 768) return;

    if (document.getElementById('colorPad')) return;   // 防重复

    const save = JSON.parse(localStorage.getItem('overlayColor') ||
               '{"color":"#D3DDE9","opacity":50}');
    currentColor = save.color;
    currentOpacity = save.opacity;

    /* ------ 调色盘按钮 ------ */
    const pad = document.createElement('div');
    pad.id = 'colorPad';
    pad.title = '设置蒙版颜色';
    document.body.appendChild(pad);

    /* ------ 弹窗 ------ */
    const panel = document.createElement('div');
    panel.id = 'colorPanel';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div id="swatchWrap" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
        <div style="margin-top:8px;font-size:12px;">
            透明度 <input type="range" id="opacityRange" min="0" max="100" value="${currentOpacity}">
            <span id="opPercent">${currentOpacity}%</span>
        </div>`;
    document.body.appendChild(panel);

    /* ------ 色块 + 名称 ------ */
    const wrap = document.getElementById('swatchWrap');
    presets.forEach(p => {
        const box = document.createElement('div');
        box.style.textAlign = 'center';
        box.innerHTML = `
            <div class="swatch" data-color="${p.color}" style="background:${p.color}" title="${p.name}"></div>
            <div style="font-size:11px;color:#555;">${p.name}</div>`;
        wrap.appendChild(box);
    });

    /* ------ 事件 ------ */
    wrap.addEventListener('click', e => {
        if (e.target.classList.contains('swatch')) {
            currentColor = e.target.dataset.color;
            apply(currentOpacity, currentColor);
        }
    });

    const range = document.getElementById('opacityRange');
    const opLab = document.getElementById('opPercent');
    range.addEventListener('input', e => {
        currentOpacity = e.target.value;
        opLab.textContent = currentOpacity + '%';
        apply(currentOpacity, currentColor);
    });

    /* 开关面板 */
    pad.addEventListener('click', () => {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    /* 点击外部关闭 */
    document.addEventListener('click', e => {
        if (!panel.contains(e.target) && !pad.contains(e.target))
            panel.style.display = 'none';
    });

    /* 首次应用 - 添加渐变效果 */
    applyWithFade(currentOpacity, currentColor);
}

function apply(op, col) {
    const alpha = Math.round(op / 100 * 255).toString(16).padStart(2, '0');
    document.querySelector('.overlay').style.backgroundColor = col + alpha;
    document.getElementById('colorPad').style.backgroundColor = col;
    document.querySelector('.g-container .title').style.backgroundColor = col + alpha; // 更新标题背景颜色和透明度
    document.querySelector('.g-container .txt').style.backgroundColor = col + alpha; // 更新文本背景颜色和透明度
    document.querySelector('.g-container .txt').style.color = getTextContrastColor(col); // 更新文本颜色
    document.querySelector('#footer').style.backgroundColor = col + alpha; // 更新页脚背景颜色和透明度
    document.querySelector('#footer').style.color = getTextContrastColor(col); // 更新页脚文本颜色
    localStorage.setItem('overlayColor', JSON.stringify({opacity: op, color: col}));
}

// 新增：带渐变效果的应用函数
function applyWithFade(op, col) {
    const overlay = document.querySelector('.overlay');
    const pad = document.getElementById('colorPad');
    const title = document.querySelector('.g-container .title'); // 获取标题元素
    const txt = document.querySelector('.g-container .txt'); // 获取文本元素
    const footer = document.querySelector('#footer'); // 获取页脚元素

    // 添加过渡效果
    overlay.style.transition = 'background-color 0.5s ease-in-out';
    pad.style.transition = 'background-color 0.5s ease-in-out';
    title.style.transition = 'background-color 0.5s ease-in-out'; // 添加标题的过渡效果
    txt.style.transition = 'background-color 0.5s ease-in-out'; // 添加文本的过渡效果
    footer.style.transition = 'background-color 0.5s ease-in-out'; // 添加页脚的过渡效果

    // 应用颜色
    const alpha = Math.round(op / 100 * 255).toString(16).padStart(2, '0');
    overlay.style.backgroundColor = col + alpha;
    pad.style.backgroundColor = col;
    title.style.backgroundColor = col + alpha; // 更新标题背景颜色和透明度
    txt.style.backgroundColor = col + alpha; // 更新文本背景颜色和透明度
    txt.style.color = getTextContrastColor(col); // 更新文本颜色
    footer.style.backgroundColor = col + alpha; // 更新页脚背景颜色和透明度
    footer.style.color = getTextContrastColor(col); // 更新页脚文本颜色
    localStorage.setItem('overlayColor', JSON.stringify({opacity: op, color: col}));

    // 过渡完成后移除过渡效果（避免日常调整时也有延迟）
    setTimeout(() => {
        overlay.style.transition = '';
        pad.style.transition = '';
        title.style.transition = ''; // 移除标题的过渡效果
        txt.style.transition = ''; // 移除文本的过渡效果
        footer.style.transition = ''; // 移除页脚的过渡效果
    }, 500);
}

// 新增：计算文本对比色的函数
function getTextContrastColor(color) {
    // 将颜色从十六进制转换为RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // 计算亮度
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 根据亮度选择文本颜色
    if (brightness < 175) {
        return '#FFFFFF'; // 亮度低，使用白色
    } else {
        return '#000000'; // 亮度高，使用黑色
    }
}

document.addEventListener('DOMContentLoaded', initOverlayColor);