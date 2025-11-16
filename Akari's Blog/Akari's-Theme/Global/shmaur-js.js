/*!
 * WhiteMinimalist-Theme v1.1 ｜ Ankia-Theme v1.7
 * https://www.shmaur.com/ ｜ https://ankia.top/
 * Licensed Apache-2.0 © shmaur ｜ © 东东
 * shmaur-js
 * 全功能保留注释版， 部分功能优化，增加代码块折叠 by Akari_404
 * 功能清单 = 左侧树导航 + 代码块折叠 + 目录/大纲折叠 + 移动端目录 + 返回顶部
 *          + 导航悬停下拉 + 手机博主卡片  + 搜索 + 网易云音乐播放器 + 增加目录树搜索展开功能
 *          + 字数统计 + 代码块行号 + 图片放大 + 视频替换 + 数学公式 + 语言类名修正
 *          + 标题锚点 + 智能隐藏导航(注释未启用) + 中文序号标题(注释未启用)
 *          + 移动端首次点击目录失效修复  + 修复右侧大纲目录实现自动滚动
 
 * Akari's Blog:  https://www.aiphm.cn/share/index.html
 */


// 页面加载完成后执行

/*!
* 先执行异步内容加载（但不会阻塞后续代码）
* 立即执行导航菜单、下拉菜单的事件绑定
* 执行其他初始化函数
*/
document.addEventListener("DOMContentLoaded", () => {
   


    // 子菜单切换功能
    document.querySelectorAll(".with-submenu").forEach((button) => {
        button.addEventListener("click", function () {
            const submenu = this.nextElementSibling;
            submenu.classList.toggle("active");
            button.classList.toggle("active");
        });
    });

    // 展开相关树结构
    toggleSubTreeByNoteId();
    
    // 处理窗口大小变化
    handleResize();

    // 根据屏幕尺寸初始化目录状态
    const initIsCatalogue = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) < 1280 ? "false" : "true";
    localStorage.setItem("iscatelogue", initIsCatalogue);

    // 获取DOM元素
    let toTopButton = document.getElementById("onGoTop"); // 回到顶部按钮
    let catalogueButton = document.getElementById("catalogue"); // 移动端页面大纲按钮
    let catalogueCloseButton = document.getElementById("toc-pane-content-close"); // 目录关闭按钮
    let cleftMenuNavCloseButton = document.getElementById("left-menu-nav-close"); // 左侧菜单关闭按钮
    let outlineButton = document.getElementById("outline"); // 移动端目录导航按钮
    let outlinemenunavButton = document.getElementById("outline-menu-nav"); // 目录导航树面板
    let cataloguePanButton = document.getElementById("toc-pane"); // 页面大纲树面板



    // 绑定按钮点击事件
    catalogueButton ? catalogueButton.addEventListener("click", istoggle) : "";
    catalogueCloseButton ? catalogueCloseButton.addEventListener("click", istoggle) : "";
    outlineButton ? outlineButton.addEventListener("click", outlineIstoggle) : "";
    cleftMenuNavCloseButton ? cleftMenuNavCloseButton.addEventListener("click", outlineIstoggle) : "";


    
    
    // 获取所有需要动态加载笔记内容的section元素
    const sections = document.querySelectorAll(".include-note");
    
    // 遍历每个section并异步加载内容
    sections.forEach(async (section, index) => {
        // 获取笔记ID
        const noteId = section.getAttribute("data-note-id");

        try {
            // 请求笔记数据
            const response = await fetchNote(noteId);
            console.log(response);
            
            if (!response.ok) {
                throw new Error("请求失败");
            }
            
            // 获取文本内容
            const data = await response.text();

            // 正则表达式匹配标题元素
            const headingRe = /(<h[1-6]\s*(?:[^>]+\s*)*>)(.+?)(<\/h[1-6]>)/g;
            
            // 文本标准化函数
            const slugify = (text) => text.replace(/\s/g, " ");

            // 内容处理链
            const conetent = data
                // 为标题添加锚点
                .replaceAll(headingRe, (...match) => {
                    const regex = /(<([^>]+)>)/gi;
                    const tocTextContent = slugify(match[2]).replace(regex, "");
                    match[0] = match[0].replace(
                        match[3],
                        `<a id="${tocTextContent}" class="toc-anchor" name="${tocTextContent}" href="#${tocTextContent}"> </a>${match[3]}`
                    );
                    return match[0];
                })
                // 规范化代码语言类名
                .replaceAll(/class="language-text-x-(\w+)"/g, (...match) => {
                    match[0] = match[0].replace("-text-x", "");
                    return match[0];
                })
                .replaceAll(/class="language-text-(\w+)"/g, (...match) => {
                    match[0] = match[0].replace("-text", "");
                    return match[0];
                })
                .replaceAll(/class="language-application-x-(\w+)"/g, (...match) => {
                    match[0] = match[0].replace("-application-x", "");
                    return match[0];
                })
                .replaceAll(/class="language-application-(\w+)"/g, (...match) => {
                    match[0] = match[0].replace("-application", "");
                    return match[0];
                })
                // 将视频链接替换为video元素
                .replaceAll(
                    /<a[^>]+class="reference-link attachment-link role-file"[^>]+href="([^"]+)"[^>]*>([^<]+)\.mp4<\/a>/g,
                    (...match) => {
                        const videoSrc = match[1];
                        return `
            <video  controls class="video-el" controlsList="nodownload">
    <source src="${videoSrc}" type="video/mp4">
    你的浏览器不支持 video 标签。
    </video>`;
                    }
                )
                // 数学公式处理
                .replaceAll(
                    /<span class="math-tex">(.+?)<\/span>/g,
                    (_, formula) => `<span class="mathjax">${formula}</span>`
                );

            // 将处理后的内容插入section
            section.innerHTML = conetent;
            
            // 如果是最后一个section，为图片添加点击查看功能
            if (index === sections.length - 1) {
                console.log("这是最后一次循环");
                document.querySelectorAll(".image").forEach(function (img) {
                    img.addEventListener("click", function () {
                        let allImg = img.getElementsByTagName("img");
                        viewer_img(allImg[0].currentSrc);
                    });
                });
            }
        } catch (error) {
            console.error("获取数据时出错:", error);
        }
    });
    




	

    
    
    
   
    
    
    
    // 初始化隐藏回到顶部按钮
    toTopButton.style.display = "none";
    
    // 滚动显示阈值，设定一个阈值，比如滚动超过300px时显示按钮
    const threshold = 300;

    // ① 动画锁：防止滚动期间目录监听互相拉扯
    let isAutoScrolling = false;
    
    // 滚动事件监听
    window.addEventListener("scroll", function () {
        // 如果在“回到顶部”动画过程中，直接 return，不再计算显示/隐藏
        if (isAutoScrolling) return;
        
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

        // 根据滚动位置显示/隐藏回到顶部按钮
        if (scrollTop > threshold) {
            toTopButton.style.display = "block";
            toTopButton.style.opacity = 1;
        } else {
            toTopButton.style.display = "none";
            toTopButton.style.opacity = 0;
        }
    });

    // 平滑滚动到顶部函数（替换实现：原生平滑 + 锁）
    function scrollToTop() {
        // 加锁：告诉目录监听“现在别插手”
        isAutoScrolling = true;

        // 使用浏览器原生平滑滚动
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 动画结束后解锁（700 ms 足够覆盖大部分动画时长）
        setTimeout(() => {
            isAutoScrolling = false;
            // 动画结束顺便再检查一次按钮显隐
            const st = document.documentElement.scrollTop || document.body.scrollTop;
            toTopButton.style.display = st > threshold ? 'block' : 'none';
        }, 700);
    }

    // 获取当前滚动位置
    function getCurrentScrollPosition() {
        return (
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop
        );
    }

    // 初始化时检查滚动位置
    const CurrentscrollTop = getCurrentScrollPosition();
    if (CurrentscrollTop > threshold) {
        toTopButton.style.display = "block";
        toTopButton.style.opacity = 1;
    } else {
        toTopButton.style.display = "none";
        toTopButton.style.opacity = 0;
    }

    // 绑定回到顶部按钮点击事件
    toTopButton.addEventListener("click", scrollToTop);
    
    let width = 0;
    
    
    
    
    
    
  
    
    // 响应式处理函数
    function handleResize() {
        requestAnimationFrame(function () {
            const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

            
            // 新增判断是否为首页，用于修复原来移动端首页存在的无交互目录按钮（支持 index.html 和根路径）
            const isHomePage = window.location.pathname.includes('index.html') || 
                               window.location.pathname === '/' ||
                               window.location.pathname.endsWith('/');

            // 首页默认不显示目录导航按钮
            if (isHomePage) {
                if (outlineButton) outlineButton.style.display = "none";
                if (outlinemenunavButton) outlinemenunavButton.classList.remove("showCatalogue");
            } else {
                // 移动端根据屏幕宽度显示/隐藏目录导航按钮（非首页）
                if (width < 1280 ) {
                    if (outlineButton) outlineButton.style.display = "block";
                } else {
                    if (outlineButton) outlineButton.style.display = "none";
                    if (outlinemenunavButton) outlinemenunavButton.classList.remove("showCatalogue");
                }
            }
            
             

            // 移动端页面大纲处理
            if (width < 1280 && cataloguePanButton) {
                if (catalogueButton) catalogueButton.style.display = "block";
                // 根据本地存储状态显示/隐藏目录
                const isCatalogueVisible = JSON.parse(localStorage.getItem("iscatelogue") || "false");
                if (isCatalogueVisible) {
                    cataloguePanButton.classList.add("showCatalogue");
                } else {
                    cataloguePanButton.classList.remove("showCatalogue");
                }
            } else {
                if (catalogueButton) catalogueButton.style.display = "none";
                if (cataloguePanButton) cataloguePanButton.classList.remove("showCatalogue");
            }
        });
    }

      
    // 窗口大小变化监听
    window.addEventListener("resize", handleResize);

    
    // 目录显示/隐藏切换
    function istoggle() {
        let value = JSON.parse(localStorage.getItem("iscatelogue") || "false");
        let val = !value;
        localStorage.setItem("iscatelogue", val);

        if (cataloguePanButton) {
            if (val) {
                cataloguePanButton.classList.add("showCatalogue");
            } else {
                cataloguePanButton.classList.remove("showCatalogue");
            }
        }
    }

    
    // 菜单导航显示/隐藏切换
    function outlineIstoggle() {
        let value = JSON.parse(localStorage.getItem("iscatelogue") || "false");
        let val = !value;
        localStorage.setItem("iscatelogue", val);

        if (outlinemenunavButton) {
            if (val) {
                outlinemenunavButton.classList.add("showCatalogue");
            } else {
                outlinemenunavButton.classList.remove("showCatalogue");
            }
        }
    }

    


  /*  
    // 小屏幕下显示目录按钮，多余，会造成状态错乱，注释掉：handleResize() 里已经用 < 1280 统一控制 
    if (cataloguePanButton && width < 610) {
        catalogueButton.style.display = "block";
        localStorage.setItem("iscatelogue", "false");
    }
*/

    
    
    
    
    
    
    
    
    /* 
    // 注释掉的自动标题编号功能
    // 支持中文数字的标题自动编号
    
        // 博客内的文档序号编码规则，自动添加
        document.addEventListener("DOMContentLoaded", function () {
            const headers = ["h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10"];
        
            // 中文数字映射表（支持到 99）
            const chineseNumbers = generateChineseNumbers();
        
            // 序号存储
            const numberMap = {
                'h2': 0, 'h3': 0, 'h4': 0, 'h5': 0, 
                'h6': 0, 'h7': 0, 'h8': 0, 'h9': 0, 'h10': 0
            };
        
            headers.forEach((header, index) => {
                const elements = document.querySelectorAll(header);
        
                elements.forEach(element => {
                    // 更新当前标题的序号
                    numberMap[header]++;
        
                    // 重置比当前标题级别低的序号
                    for (let i = index + 1; i < headers.length; i++) {
                        numberMap[headers[i]] = 0;
                    }
        
                    // 生成标题序号字符串
                    let numbering = "";
                    if (header === 'h2') {
                        numbering = `${chineseNumbers[numberMap[header]]}、`;
                    } else {
                        const parentHeader = headers[index - 1];
                        const parentNumber = numberMap[parentHeader];
                        numbering = `${parentNumber}.${numberMap[header]} `;
                    }
        
                    // 添加序号到标题
                    element.textContent = `${numbering} ${element.textContent}`;
                });
            });
        
            function generateChineseNumbers() {
                const digits = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
                let result = [""];
        
                for (let i = 1; i < 100; i++) {
                    let str = "";
                    let tens = Math.floor(i / 10);
                    let ones = i % 10;
                    if (tens > 1) str += digits[tens];
                    if (tens >= 1) str += "十";
                    if (ones > 0) str += digits[ones];
                    result.push(str);
                }
        
                return result;
            }
        });
        
        */
    
  
    
    
    
    
    
    
    
    
    // 隐藏所有子树元素
    var subtreeElements = document.querySelectorAll(' ul.subtree');
    subtreeElements.forEach(function (ul) {
        const parentLi = ul.parentElement;
        let io =  parentLi.querySelector(".menulist");
        // 如果父元素隐藏且没有菜单列表，则隐藏子树
        if (parentLi.classList.contains('menu-hidden')&& !io) {
            ul.style.display = 'none';
        }
    });

    // 查找选中的元素并展开相关树结构
    var selectedElement = document.querySelector('span.selected');
    if (selectedElement) {
        var currentElement = selectedElement;
        // 向上遍历显示所有父级子树
        while (currentElement && currentElement !== document.getElementById(elParentID)) {
            if (currentElement.tagName === 'UL' && currentElement.classList.contains('subtree')) {
                currentElement.style.display = 'block';
                var arrow = currentElement.previousElementSibling.querySelector('.arrow');
                if (arrow) {
                    arrow.classList.remove('expanded');
                }
            }
            currentElement = currentElement.parentElement;
        }

        // 计算并滚动到选中元素的位置
        var leftcentElement = document.getElementById(elParentID);
        var selectedOffsetTop = selectedElement.offsetTop;
        var currentParent = selectedElement.offsetParent;
        while (currentParent !== leftcentElement) {
            selectedOffsetTop += currentParent.offsetTop;
            currentParent = currentParent.offsetParent;
        }
        var leftcentHeight = leftcentElement.clientHeight;
        var scrollPosition = selectedOffsetTop - (leftcentHeight / 2) + (selectedElement.offsetHeight / 2);
        leftcentElement.scrollTop = scrollPosition;
    }

    // 切换子树显示的函数
    var elParentID = ""
    function toggleSubTree(noteId) {
        console.log("点击了：" + noteId);
        const allItems = document.querySelectorAll('li[id^="subtree-"]');
        
        allItems.forEach((item) => {
            if (item.id !== "subtree-" + noteId) {
                item.classList.add("menu-hidden");
                // 隐藏其他子树
                const otherChildUl = item.querySelector('ul.subtree');
                if (otherChildUl) {
                    otherChildUl.style.display = 'none';
                }
            } else {
                // 显示当前子树
                const parentUl = item.parentElement;
                parentUl.style.display = 'block';
                
                // 隐藏兄弟子树
                const siblingUls = parentUl.parentElement.querySelectorAll('ul');
                siblingUls.forEach((ul) => {
                    if (ul !== parentUl) {
                        ul.style.display = 'none';
                    } else {
                        elParentID = parentUl.id;
                        console.log("当前的父级ID是：" + elParentID)
                    }
                });
            }
        });
        
        const subtree = document.getElementById("subtree-" + noteId);
        if (subtree) {
            subtree.classList.remove("menu-hidden");
            // 显示当前子树的子元素
            const childUl = subtree.querySelector('ul.subtree');
            if (childUl) {
                childUl.style.display = 'block';
            }
        }
    }

    // 根据笔记ID展开树结构
    function toggleSubTreeByNoteId() {
        let noteId = document.body.getAttribute("data-note-id");
        console.log("Loaded Note ID:", noteId);

        const targetNote = document.querySelector(`span[id="menu-node-id-${noteId}"]`);
        console.log("Target Note:", targetNote);

        if (targetNote) {
            // 移除所有已选中的元素
            document.querySelectorAll(".node-title.selected, .leaf-title.selected").forEach((el) => {
                el.classList.remove("selected");
            });

            // 获取一级节点ID
            const firstLevelId = targetNote.getAttribute("data-first-level-id");
            console.log("First Level ID:", firstLevelId);

            const firstLevelTitleElement = document.getElementById("menu-node-id-" + firstLevelId);
            if (firstLevelTitleElement) {
                document.getElementById("dynamic-menu-title").textContent = firstLevelTitleElement.textContent + "目录";
            }

            if (firstLevelId) {
                // 选中当前元素
                document.querySelectorAll(".node-title.selected, .leaf-title.selected").forEach((el) => {
                    el.classList.remove("selected");
                });
                targetNote.classList.add("selected");

                toggleSubTree(firstLevelId);
            } else {
                console.error(`未找到一级节点ID，笔记ID为 ${noteId}`);
            }
        } else {
            console.error(`未找到笔记ID为 ${noteId} 的节点`);
        }
    }

}, false);

// 目录箭头点击事件处理
document.addEventListener("DOMContentLoaded", function () {
    // 右侧大纲箭头点击
    document.querySelectorAll("#toc .arrow").forEach(function (arrow) {
        arrow.addEventListener("click", function (e) {
            e.stopPropagation(); // 阻止事件冒泡，防止点击箭头时跳转锚点

            const parentLi = arrow.closest("li");
            parentLi.classList.toggle("active");

            // 展开/收缩子列表
            const subUl = parentLi.querySelector("ul");
            if (subUl) {
                subUl.style.display = subUl.style.display === "block" ? "none" : "block";
            }

            // 切换箭头方向
            arrow.classList.toggle("expanded");
        });
    });

    // 左侧导航目录箭头点击
    document.querySelectorAll("#leftcent .arrow").forEach(function (arrow) {
        arrow.addEventListener("click", function (e) {
            e.stopPropagation();  // 阻止事件冒泡，防止点击箭头时跳转锚点
            const parentLi = arrow.closest("li");
            parentLi.classList.toggle("active");
            const subUl = parentLi.querySelector("ul");
            if (subUl) {
                subUl.style.display = subUl.style.display === "block" ? "none" : "block";
            }
            arrow.classList.toggle("expanded");
        });
    });
    
    // 左侧标签目录箭头点击
    document.querySelectorAll("#leftcentTag .arrow").forEach(function (arrow) {
        arrow.addEventListener("click", function (e) {
            e.stopPropagation();
            const parentLi = arrow.closest("li");
            parentLi.classList.toggle("active");
            const subUl = parentLi.querySelector("ul");
            if (subUl) {
                subUl.style.display = subUl.style.display === "block" ? "none" : "block";
            }
            arrow.classList.toggle("expanded");
        });
    });
    
    // 左侧分类目录箭头点击
    document.querySelectorAll("#leftcentCategory .arrow").forEach(function (arrow) {
        arrow.addEventListener("click", function (e) {
            e.stopPropagation();
            const parentLi = arrow.closest("li");
            parentLi.classList.toggle("active");
            const subUl = parentLi.querySelector("ul");
            if (subUl) {
                subUl.style.display = subUl.style.display === "block" ? "none" : "block";
            }
            arrow.classList.toggle("expanded");
        });
    });
});

/*!
 * Ankia-Theme v1.7
 * https://ankia.top/
 * Licensed Apache-2.0 © 东东
 */

// 获取笔记内容的函数
async function fetchNote(noteId = null) {
    if (!noteId) {
        noteId = document.body.getAttribute("data-note-id");
    }

    const resp = await fetch(`api/notes/${noteId}/view`, {
        headers: {
            "Accept-Charset": "utf-8",
        },
    });

    return await resp;
}

// 移动端博主信息卡片功能
// 恢复手机端展示bloggerInfo卡片信息的功能，为避免与手机导航菜单冲突，修改为点击头像打开。原来WhiteMinimalist主题是没有使用东东这个功能。
document.addEventListener("DOMContentLoaded", () => {
    const toggleMenuButton = document.getElementById("toggleMenuButton");
    const logoElement = document.querySelector(".logo"); // 左上角头像
    const mobileMenuContainer = document.getElementById("mobileMenuContainer");
    const bloggerInfoCard = document.getElementById("bloggerInfoCard");
    const menuCard = document.getElementById("menuCard");
    const main = document.getElementById("main");

    let isCardsAdded = false;
    let isMenuOpen = false;

    // 初始隐藏移动菜单容器
    mobileMenuContainer.style.display = "none";

    // 检查是否为手机模式
    const isMobileMode = () => {
        return window.innerWidth <= 768;
    };

    // 头像点击事件 - 显示博主信息卡片（仅手机模式）
    logoElement.addEventListener("click", () => {
        if (!isMobileMode()) {
            return;
        }
        
        if (!isCardsAdded) {
            // 显示卡片
            mobileMenuContainer.style.display = "block";
            bloggerInfoCard.style.setProperty("display", "flex", "important");
            menuCard.style.setProperty("display", "flex", "important");
            mobileMenuContainer.appendChild(menuCard);
            mobileMenuContainer.appendChild(bloggerInfoCard);   
            main.style.display = "none";
            isCardsAdded = true;
            
            // 关闭菜单（如果打开）
            if (isMenuOpen) {
                toggleMenuButton.classList.remove("active");
                document.querySelector(".navbar-links-mobile").classList.remove("active");
                isMenuOpen = false;
            }
        } else {
            // 隐藏卡片
            mobileMenuContainer.style.display = "none"; 
            mobileMenuContainer.removeChild(menuCard);
            mobileMenuContainer.removeChild(bloggerInfoCard); 
            main.style.display = "block";
            isCardsAdded = false;
        }
    });

    // 菜单按钮点击事件
    toggleMenuButton.addEventListener("click", () => {
        toggleMenuButton.classList.toggle("active");
        document.querySelector(".navbar-links-mobile").classList.toggle("active");
        isMenuOpen = !isMenuOpen;
        
        // 关闭卡片（如果显示）
        if (isCardsAdded) {
            mobileMenuContainer.style.display = "none";
            mobileMenuContainer.removeChild(bloggerInfoCard);
            mobileMenuContainer.removeChild(menuCard);
            main.style.display = "block";
            isCardsAdded = false;
        }
    });

    // 窗口大小变化监听，如果从手机模式切换到桌面模式，自动关闭卡片
    window.addEventListener("resize", () => {
        if (!isMobileMode() && isCardsAdded) {
            mobileMenuContainer.style.display = "none";
            mobileMenuContainer.removeChild(bloggerInfoCard);
            mobileMenuContainer.removeChild(menuCard);
            main.style.display = "block";
            isCardsAdded = false;
        }
    });
}, false);

// 导航项悬停效果
document.addEventListener("DOMContentLoaded", () => {
    var navigationItems = document.querySelectorAll(".navigationItemsStyle");
    
    navigationItems.forEach(function (item) {
        var button = item.querySelector(".menuLinkStyle");
        var dropDown = item.querySelector(".dropDownStyle");
        if (!button || !dropDown) {
            return;
        }
        var svgElement = button.querySelector("svg");
        let isHovering = false;

        // 鼠标悬停显示下拉菜单
        button.addEventListener("mouseover", function () {
            isHovering = true;
            dropDown.style.display = "flex";
            svgElement.classList.add("unfolding");
        });

        // 鼠标移出延迟隐藏
        button.addEventListener("mouseout", function () {
            isHovering = false;
            setTimeout(function () {
                if (!isHovering) {
                    dropDown.style.display = "none";
                    svgElement.classList.remove("unfolding");
                }
            }, 200);
        });

        // 下拉菜单悬停保持显示
        dropDown.addEventListener("mouseover", function () {
            isHovering = true;
        });

        dropDown.addEventListener("mouseout", function () {
            isHovering = false;
            setTimeout(function () {
                if (!isHovering) {
                    dropDown.style.display = "none";
                    svgElement.classList.remove("unfolding");
                }
            }, 200);
        });
    });
}, false);

/* 
// 注释掉的「智能隐藏顶部导航栏」功能，根据滚动方向自动隐藏/显示顶部导航栏
// 按需启用
document.addEventListener(
  "DOMContentLoaded",
  () => {
    var prevScrollPos = window.pageYOffset;
    const scrollDistance = 10;

    window.onscroll = function () {
      var currentScrollPos = window.pageYOffset;
      const navigationBar = document.getElementById("navigationBar");
      if (prevScrollPos > currentScrollPos) {
        navigationBar.classList.remove("hide");
      } else if (
        currentScrollPos - prevScrollPos > scrollDistance &&
        !document.querySelector("#mobileMenuContainer.showMenu")
      ) {
        navigationBar.classList.add("hide");
      }

      prevScrollPos = currentScrollPos;
    };
  },
  false
);
*/

// 打赏二维码居中修复
document.addEventListener("DOMContentLoaded", () => {
    const rewardBtn = document.getElementById("rewardBtn");
    const rewardImgContainer = document.getElementById("rewardImgContainer");

    if (!rewardBtn) return;

    // 判断是否为移动端
    const isMobile = () => window.innerWidth <= 768;

    rewardBtn.addEventListener("click", () => {
        const isShow = rewardImgContainer.style.display === "flex";

        if (isShow) {
            // 收起二维码
            rewardImgContainer.style.opacity = "0";
            setTimeout(() => {
                rewardImgContainer.style.display = "none";
                rewardImgContainer.style.flexWrap = "";
                rewardImgContainer.classList.remove("reward-center");
            }, 500);
        } else {
            // 显示二维码
            rewardImgContainer.style.display = "flex";
            rewardImgContainer.style.flexWrap = "wrap";

            // 移动端添加居中样式
            if (isMobile()) {
                rewardImgContainer.classList.add("reward-center");
            }

            // 触发重排后设置透明度实现淡入效果
            void rewardImgContainer.offsetWidth;
            rewardImgContainer.style.opacity = "1";
        }
    });
}, false);

// 目录导航高亮和滚动
document.addEventListener("DOMContentLoaded", () => {
    const toc = document.getElementById("toc");
    if (!toc) return;
    const tocHeight = toc.clientHeight;

    const sections = document.querySelectorAll("#content h2, #content h3, #content h4, #content h5, #content h6");
    const links = toc.querySelectorAll("a");

    // 目录链接点击平滑滚动
    // 目录链接点击平滑滚动（带偏移修正）
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const target = document.getElementById(link.getAttribute("href").slice(1));
        if (!target) return;

        // 1. 先让浏览器把目标滚到视口（瞬时，用户无感知）
        target.scrollIntoView({ behavior: "instant", block: "start" });

        // 2. 再往下多滚一段，把导航栏高度算进去
        const offset = 60; // 导航栏高度 + 预留空隙，自己按实际调
        window.scrollBy({ top: -offset, behavior: "smooth" });
      });
    });

        // 追加：统一拦截所有 # 锚点（含 toc-anchor、地址栏回车、Markdown 自动锚点等）
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      // ① 只处理目录面板或正文锚点
      const isTocLink = link.closest('#toc') || link.classList.contains('toc-anchor');
      if (!isTocLink) return;   // 其余放行

      const id   = link.getAttribute('href').slice(1);
      const elem = document.getElementById(id);
      if (!elem) return;

      e.preventDefault();
      elem.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollBy({ top: -60, behavior: 'smooth' });
    });
    
    
    
    
    // 更新目录激活状态
    function changeLinkState() {
        let index = sections.length;
        while (--index && window.scrollY < sections[index].offsetTop) { }

        links.forEach((link) => link.classList.remove("tocActive"));
        links[index].classList.add("tocActive");
    }
    
    // 修复右侧大纲目录实现自动滚动
    function scrollToc() {
      requestAnimationFrame(() => {
        const toc = document.getElementById('toc');
        if (!toc) return;

        const aActive = toc.querySelector('a.tocActive');
        if (!aActive) { console.log('无高亮'); return; }

        const liActive = aActive.closest('li');
        if (!liActive) return;

        const tocH  = toc.clientHeight;
        const itemT = liActive.offsetTop;
        const itemH = liActive.offsetHeight;
        const start = toc.scrollTop;
        const end   = itemT - tocH/2 + itemH/2;   // 目标位置（可再±偏移）
        const duration = 600;                     // 想再慢就加数值（单位 ms）
        const startTime = performance.now();

        // 线性插值，想更顺滑可换成 easeInOutQuad
        function linear(t) { return t; }

        function animate(now) {
          const elapsed = now - startTime;
          const t = Math.min(elapsed / duration, 1);
          toc.scrollTop = start + (end - start) * linear(t);
          if (t < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      });
    }

    changeLinkState();
    window.addEventListener("scroll", () => {
        changeLinkState();
        setTimeout(scrollToc, 500);
    });
}, false);

// 代码块行号添加
document.addEventListener("DOMContentLoaded", () => {
    const codeBlocks = document.querySelectorAll("pre");
    codeBlocks.forEach((codeBlock) => {
        codeBlock.classList.add("line-numbers");
    });
}, false);

// 字数统计
document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");
    if (!content) {
        return;
    }
    const articleWordCount = document.getElementById("articleWordCount");
    // 统计中文字符数
    articleWordCount.innerText = content.innerText
        .split(/[\s-+:,/\\]+/)
        .filter((chunk) => chunk !== "")
        .join("").length;
}, false);

// 搜索功能
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const searchContainer = document.getElementById("searchContainer");
    const searchButton = document.getElementById("searchButton");
    const searchButtonMobile = document.getElementById("searchButton-mobile");

    // 构建搜索结果项
    function buildResultItem(result) {
        return `<a class="searchItems" href="./${result.id}">
                    <div class="itemsTitle">${result.title}</div>
                </a>`;
    }
    
    // 防抖函数
    function debounce(executor, delay) {
        let timeout;
        return function (...args) {
            const callback = () => {
                timeout = null;
                Reflect.apply(executor, null, args);
            };
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(callback, delay);
        };
    }

    // 执行搜索
    async function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm !== "") {
            searchResults.innerHTML = "";

            const ancestor = document.body.dataset.ancestorNoteId;
            const query = searchInput.value;
            const resp = await fetch(`api/notes?search=${query}&ancestorNoteId=${ancestor}`);
            const json = await resp.json();
            const results = json.results;
            for (const result of results) {
                searchResults.innerHTML += buildResultItem(result);
            }
        }
    }
    
    // 显示搜索容器
    searchButton.addEventListener("click", () => {
        searchContainer.style.display = "flex";
    });
    searchButtonMobile.addEventListener("click", () => {
        searchContainer.style.display = "flex";
        console.log("====" + searchContainer.style.display);
    });

    // 输入搜索词（防抖处理）
    searchInput.addEventListener("keyup", debounce(async () => {
        await performSearch();
    }, 400));

    // 点击外部关闭搜索
    document.addEventListener("click", (event) => {
        if (!event.target.closest("#searchContainer") &&
            !event.target.closest("#searchButton") &&
            !event.target.closest("#searchButton-mobile")) {
            searchContainer.style.display = "none";
        }
    });
}, false);

// 音乐播放器功能（预埋）,你需要在HTML中添加相应的元素和CSS样式
document.addEventListener("DOMContentLoaded", () => {
    const playButtons = document.querySelectorAll(".playMusicButton");
    
    playButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // 判断设备类型调整播放器尺寸
            const toggleMenuButton = document.getElementById("toggleMenuButton");
            var url = `//music.163.com/m/outchain/player?type=2&auto=1&height=32`;
            if (getComputedStyle(toggleMenuButton).display === "none") {
                url = `//music.163.com/outchain/player?type=2&auto=1&height=32`;
            }
            
            // 移除旧播放器
            let oldPlayer = document.getElementById("musicPlayer");
            if (oldPlayer != null) {
                document.body.removeChild(oldPlayer);
            }
            
            // 创建新播放器
            const musicId = this.getAttribute("musicid");
            var musicPlayer = document.createElement("div");
            musicPlayer.id = "musicPlayer";
            musicPlayer.innerHTML = `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=298 height=52 src="${url}&id=${musicId}"></iframe>`;
            document.body.appendChild(musicPlayer);
        });
    });
}, false);




/* ===== 新增左侧导航：搜索筛选 + 展开（全）+ 折叠（撤销）===== */
/* ===== deepseek修复版：左侧导航搜索筛选 + 展开/折叠，解决当页面加载缓慢时，全展开左侧的树导航后，无法复位，其次从顶部的导航菜单进入的页面，全展开左侧的树导航后，也无法复位。 ===== */
(() => {
  const url = window.location.href;
  let root = null;
  
  // 根据URL判断当前是哪个页面，选择对应的
  if (url.includes('/share/tag_')) {
    root = document.getElementById('leftcentTag');
  } else if (url.includes('/share/category_')) {
    root = document.getElementById('leftcentCategory');
  } else {
    root = document.getElementById('leftcent');
  }
  
  if (!root) return;

  let previousState = null;
  let isExpanded = false;
  let isSearching = false;
  let isInitialized = false;

  // 等待DOM完全加载后再初始化
  function initialize() {
    if (isInitialized) return;
    
    // 保存真正的初始状态
    previousState = saveCurrentState();
    isInitialized = true;
    console.log('左侧导航初始化完成');
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    setTimeout(initialize, 300); // 延迟确保DOM渲染完成
  }

  // 监听URL变化（顶部导航跳转时）
  let currentUrl = window.location.href;
  const observeUrlChange = () => {
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        // URL变化时重置状态
        resetToInitialState();
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  };
  
  observeUrlChange();

  // 重置到初始状态
  function resetToInitialState() {
    if (previousState) {
      restoreState(previousState);
    } else {
      // 如果没有保存的状态，重新初始化
      setTimeout(initialize, 500);
    }
    isExpanded = false;
    isSearching = false;
    const toggleBtn = document.getElementById('leftToggleBtn');
    if (toggleBtn) toggleBtn.textContent = '全部展开';
    
    // 清空搜索框
    const searchInput = document.getElementById('leftSearchInput');
    if (searchInput) searchInput.value = '';
  }

  /* 1. 搜索筛选 */
  const searchInput = document.getElementById('leftSearchInput');
  const searchClear = document.getElementById('leftSearchClear');
  
  if (searchInput && searchClear) {
    function doSearch() {
      const key = searchInput.value.trim().toLowerCase();
      
      if (key) {
        isSearching = true;
        // 搜索时临时保存状态（如果之前没有保存过）
        if (!previousState) {
          previousState = saveCurrentState();
        }
        
        // 隐藏所有节点
        root.querySelectorAll('li').forEach(li => {
          li.style.display = 'none';
        });
        
        // 显示匹配的节点及其所有祖先
        const matchedNodes = [];
        
        // 找到所有匹配的节点
        root.querySelectorAll('li').forEach(li => {
          const txt = li.textContent.toLowerCase();
          if (txt.includes(key)) {
            matchedNodes.push(li);
          }
        });
        
        // 显示匹配节点及其所有祖先
        matchedNodes.forEach(li => {
          // 显示当前节点
          li.style.display = '';
          
          // 显示所有祖先节点
          let parent = li.parentElement;
          while (parent && parent !== root) {
            if (parent.tagName === 'UL' && parent.classList.contains('subtree')) {
              parent.style.display = 'block';
              
              // 设置父级li为active并展开箭头
              const parentLi = parent.closest('li.menulist');
              if (parentLi) {
                parentLi.style.display = '';
                parentLi.classList.add('active');
                const arrow = parentLi.querySelector(':scope > .node-title .arrow');
                if (arrow) arrow.classList.remove('expanded');
              }
            }
            parent = parent.parentElement;
          }
        });
        
        // 如果没有匹配结果，显示提示
        if (matchedNodes.length === 0) {
          console.log('没有找到匹配的目录');
        }
      } else {
        // 搜索框为空，恢复之前的状态
        isSearching = false;
        if (previousState) {
          restoreState(previousState);
        } else {
          // 如果没有之前的状态，重新初始化
          resetToInitialState();
        }
      }
    }
    
    searchInput.addEventListener('input', () => {
      const key = searchInput.value.trim().toLowerCase();

      if (!key) {
        isSearching = false;
        if (previousState) {
          restoreState(previousState);
          isExpanded = false;
          const toggleBtn = document.getElementById('leftToggleBtn');
          if (toggleBtn) toggleBtn.textContent = '全部展开';
        } else {
          resetToInitialState();
        }
        return;
      }

      doSearch();
    });
      
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      isSearching = false;
      if (previousState) {
        restoreState(previousState);
        isExpanded = false;
        const toggleBtn = document.getElementById('leftToggleBtn');
        if (toggleBtn) toggleBtn.textContent = '全部展开';
      } else {
        resetToInitialState();
      }
    });
  }

  /* 2. 保存当前状态 */
  function saveCurrentState() {
    const state = {
      subtreeDisplays: {},
      activeStates: {},
      arrowStates: {},
      liDisplays: {}
    };

    // 保存所有subtree的display状态
    root.querySelectorAll('ul.subtree').forEach((subUl, index) => {
      state.subtreeDisplays[index] = {
        element: subUl,
        display: subUl.style.display
      };
    });

    // 保存所有menulist的active状态
    root.querySelectorAll('li.menulist').forEach((li, index) => {
      state.activeStates[index] = {
        element: li,
        active: li.classList.contains('active')
      };
    });

    // 保存所有箭头的expanded状态
    root.querySelectorAll('.node-title .arrow').forEach((arrow, index) => {
      state.arrowStates[index] = {
        element: arrow,
        expanded: arrow.classList.contains('expanded')
      };
    });

    // 保存所有li的display状态
    root.querySelectorAll('li').forEach((li, index) => {
      state.liDisplays[index] = {
        element: li,
        display: li.style.display
      };
    });

    return state;
  }

  /* 3. 恢复状态 */
  function restoreState(state) {
    if (!state) return;

    // 恢复li显示状态
    Object.values(state.liDisplays).forEach(item => {
      if (item.element && item.display !== undefined) {
        item.element.style.display = item.display;
      }
    });

    // 恢复subtree显示状态
    Object.values(state.subtreeDisplays).forEach(item => {
      if (item.element && item.display !== undefined) {
        item.element.style.display = item.display;
      }
    });

    // 恢复active状态
    Object.values(state.activeStates).forEach(item => {
      if (item.element) {
        if (item.active) {
          item.element.classList.add('active');
        } else {
          item.element.classList.remove('active');
        }
      }
    });

    // 恢复箭头状态
    Object.values(state.arrowStates).forEach(item => {
      if (item.element) {
        if (item.expanded) {
          item.element.classList.add('expanded');
        } else {
          item.element.classList.remove('expanded');
        }
      }
    });
  }

  /* 4. 全展开功能 */
  function expandAll() {
    // 保存当前状态（如果是第一次展开）
    if (!isExpanded) {
      previousState = saveCurrentState();
    }

    // 展开所有
    root.querySelectorAll('ul.subtree').forEach(subUl => {
      subUl.style.display = 'block';
    });

    root.querySelectorAll('li.menulist').forEach(li => {
      li.classList.add('active');
    });

    root.querySelectorAll('.node-title .arrow').forEach(arrow => {
      arrow.classList.remove('expanded');
    });

    // 确保所有节点都显示
    root.querySelectorAll('li').forEach(li => {
      li.style.display = '';
    });

    isExpanded = true;
    isSearching = false;
  }

  /* 5. 折叠（撤销到之前状态） */
  function collapseToPrevious() {
    if (previousState) {
      restoreState(previousState);
      isExpanded = false;
      isSearching = false;
    } else {
      // 如果没有之前的状态，重新初始化
      resetToInitialState();
    }
  }

  /* 6. 默认折叠（当没有历史状态时使用） */
  function defaultCollapse() {
    // 只展开根节点和当前选中路径
    root.querySelectorAll('ul.subtree').forEach(subUl => {
      const parentLi = subUl.closest('li.menulist');
      // 如果是根节点的直接子树，保持展开
      if (parentLi && parentLi.hasAttribute('data-first-level-id')) {
        subUl.style.display = 'block';
      } else {
        // 检查是否在选中路径中
        const hasSelected = subUl.querySelector('.leaf-title.selected');
        subUl.style.display = hasSelected ? 'block' : 'none';
      }
    });

    // 更新active状态和箭头
    root.querySelectorAll('li.menulist').forEach(li => {
      const subUl = li.querySelector(':scope > ul.subtree');
      const arrow = li.querySelector(':scope > .node-title .arrow');
      
      if (subUl) {
        if (subUl.style.display === 'none') {
          li.classList.remove('active');
          if (arrow) arrow.classList.add('expanded');
        } else {
          li.classList.add('active');
          if (arrow) arrow.classList.remove('expanded');
        }
      }
    });

    // 确保所有节点都显示
    root.querySelectorAll('li').forEach(li => {
      li.style.display = '';
    });

    isExpanded = false;
    isSearching = false;
  }

  /* 7. 按钮事件处理 */
  const toggleBtn = document.getElementById('leftToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (isExpanded) {
        // 当前是展开状态，点击后折叠（撤销）
        collapseToPrevious();
        toggleBtn.textContent = '全部展开';
      } else {
        // 当前是折叠状态，点击后全展开
        expandAll();
        toggleBtn.textContent = '展开复位';
      }
    });
  }

  // 暴露重置函数到全局，供顶部导航调用
  window.resetLeftNav = resetToInitialState;
})();




/* ===== 代码块折叠功能 ===== */
window.addEventListener('load', () => {
    const foldHeight = 220; // 折叠高度

    // 遍历所有代码块
    document.querySelectorAll('pre[class*="language-"],pre.line-numbers').forEach(pre => {
        // 跳过高度较小的代码块
        if (pre.scrollHeight <= foldHeight + 30) return;

        pre.classList.add('folded'); // 初始状态为折叠

        // 创建底部折叠按钮
        const bottomBtn = document.createElement('div');
        bottomBtn.className = 'code-fold-btn';
        pre.appendChild(bottomBtn);

        // 创建顶部折叠图标
        const host = pre.querySelector('.code-toolbar') || pre;
        const topBtn = document.createElement('div');
        topBtn.className = 'code-toolbar-fold';
        topBtn.title = '折叠 / 展开';
        host.appendChild(topBtn);
        topBtn.onclick = e => { e.stopPropagation(); toggle(pre); };

        // 底部按钮点击事件
        bottomBtn.onclick = () => toggle(pre);

        // 切换折叠状态函数
        function toggle(block) {
            const fold = block.classList.toggle('folded');
            block.classList.toggle('unfolded', !fold);

            if (fold) {
                // 折叠：恢复到上次展开时的滚动位置
                const lastScroll = Number(block.dataset.scrollTop || 0);
                window.scrollTo({ top: lastScroll, behavior: 'instant' });
            } else {
                // 展开：记录当前滚动位置
                block.dataset.scrollTop = window.scrollY;
            }
        }
    });
});




