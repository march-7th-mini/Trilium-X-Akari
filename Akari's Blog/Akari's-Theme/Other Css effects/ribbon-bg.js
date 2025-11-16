/* ribbon-bg.js  背景的飘带特效，立即执行版add by Akari_404 */
(function () {
  // ====== 工具函数 ====
  const rand = function () {
    return arguments.length === 1
      ? Array.isArray(arguments[0])
        ? arguments[0][Math.round(rand(0, arguments[0].length - 1))]
        : rand(0, arguments[0])
      : arguments.length === 2
      ? Math.random() * (arguments[1] - arguments[0]) + arguments[0]
      : 0;
  };

  const vp = function () {
    const w = Math.max(0, innerWidth || document.documentElement.clientWidth || 0);
    const h = Math.max(0, innerHeight || document.documentElement.clientHeight || 0);
    return { width: w, height: h, scrollx: pageXOffset, scrolly: pageYOffset };
  };

  function Vec(x, y) { this.x = x || 0; this.y = y || 0; }
  Vec.prototype = {
    set(x, y) { this.x = x; this.y = y; return this; },
    copy(v) { this.x = v.x; this.y = v.y; return this; },
    add(x, y) { this.x += x; this.y += y; return this; },
    subtract(x, y) { this.x -= x; this.y -= y; return this; },
  };

  // ====== Ribbon 主类 ====
  window.Ribbons = function (opts) {
    this._cvs = null;
    this._ctx = null;
    this._w = 0;
    this._h = 0;
    this._scroll = 0;
    this._ribbons = [];
    this._opts = Object.assign({
      colorSaturation: '80%',
      colorBrightness: '60%',
      colorAlpha: 0.65,
      colorCycleSpeed: 6,
      verticalPosition: 'center',
      horizontalSpeed: 150,
      ribbonCount: 3,
      strokeSize: 0,
      parallaxAmount: -0.5,
      animateSections: true,
    }, opts);

    this._draw = this._draw.bind(this);
    this._resize = this._resize.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this.init();
  };

  Ribbons.prototype = {
    init() {
      try {
        this._cvs = document.createElement('canvas');
        this._cvs.id = 'bgCanvas';
        Object.assign(this._cvs.style, {
          position: 'fixed', left: 0, top: 0, width: '100%', height: '100%',
          zIndex: -1, display: 'block', margin: 0, padding: 0, border: 0, outline: 0,
        });
        this._resize();
        this._ctx = this._cvs.getContext('2d');
        this._ctx.globalAlpha = this._opts.colorAlpha;
        window.addEventListener('resize', this._resize);
        window.addEventListener('scroll', this._onScroll);
        document.body.appendChild(this._cvs);
      } catch (e) {
        console.warn('Canvas error: ', e); return;
      }
      this._draw();
    },
    _resize() {
      const v = vp();
      this._w = v.width; this._h = v.height;
      this._cvs.width = this._w; this._cvs.height = this._h;
      if (this._ctx) this._ctx.globalAlpha = this._opts.colorAlpha;
    },
    _onScroll() { this._scroll = vp().scrolly; },
    addRibbon() {
      const dir = rand(1, 9) > 5 ? 'right' : 'left';
      const step = 1000, margin = 200;
      const startX = dir === 'right' ? -margin : this._w + margin;
      let y = rand(0, this._h);
      if (/^top$/i.test(this._opts.verticalPosition)) y = margin;
      else if (/^center$/i.test(this._opts.verticalPosition)) y = this._h / 2;
      else if (/^bottom$/i.test(this._opts.verticalPosition)) y = this._h - margin;

      const chain = [];
      let p1 = new Vec(startX, y), p2 = new Vec(startX, y), p3;
      let hue = rand(0, 360), delay = 0;
      for (let i = 0; i < step; i++) {
        const sx = Math.round((Math.random() - 0.2) * this._opts.horizontalSpeed);
        const sy = Math.round((Math.random() - 0.5) * (this._h * 0.25));
        p3 = new Vec(); p3.copy(p2);
        if (dir === 'right') { p3.add(sx, sy); if (p2.x >= this._w + margin) break; }
        else { p3.subtract(sx, sy); if (p2.x <= -margin) break; }
        chain.push({ p1: new Vec(p1.x, p1.y), p2: new Vec(p2.x, p2.y), p3, hue, delay, dir, alpha: 0, phase: 0 });
        p1.copy(p2); p2.copy(p3);
        delay += 4; hue += this._opts.colorCycleSpeed;
      }
      this._ribbons.push(chain);
    },
    _drawSection(sec) {
      if (!sec) return true;
      if (sec.phase >= 1 && sec.alpha <= 0) return true;
      if (sec.delay <= 0) {
        sec.phase += 0.02;
        sec.alpha = Math.sin(sec.phase);
        if (sec.alpha < 0) sec.alpha = 0;
        if (sec.alpha > 1) sec.alpha = 1;
        if (this._opts.animateSections) {
          const wiggle = 0.1 * Math.sin(1 + sec.phase * Math.PI / 2);
          if (sec.dir === 'right') { sec.p1.add(wiggle, 0); sec.p2.add(wiggle, 0); sec.p3.add(wiggle, 0); }
          else { sec.p1.subtract(wiggle, 0); sec.p2.subtract(wiggle, 0); sec.p3.subtract(wiggle, 0); }
          sec.p1.add(0, wiggle); sec.p2.add(0, wiggle); sec.p3.add(0, wiggle);
        }
      } else { sec.delay -= 0.5; return false; }

      const color = `hsla(${sec.hue}, ${this._opts.colorSaturation}, ${this._opts.colorBrightness}, ${sec.alpha})`;
      this._ctx.save();
      if (this._opts.parallaxAmount !== 0) this._ctx.translate(0, this._scroll * this._opts.parallaxAmount);
      this._ctx.beginPath();
      this._ctx.moveTo(sec.p1.x, sec.p1.y);
      this._ctx.lineTo(sec.p2.x, sec.p2.y);
      this._ctx.lineTo(sec.p3.x, sec.p3.y);
      this._ctx.fillStyle = color;
      this._ctx.fill();
      if (this._opts.strokeSize > 0) {
        this._ctx.lineWidth = this._opts.strokeSize;
        this._ctx.strokeStyle = color;
        this._ctx.lineCap = 'round';
        this._ctx.stroke();
      }
      this._ctx.restore();
      return false;
    },
    _draw() {
      // 清理画布
      this._ctx.clearRect(0, 0, this._w, this._h);
      
      // 遍历所有彩条
      for (let i = this._ribbons.length - 1; i >= 0; i--) {
        const ribbon = this._ribbons[i];
        if (!ribbon) {
          this._ribbons.splice(i, 1);
          continue;
        }
        
        let allSectionsDead = true;
        
        // 绘制彩条的每个片段
        for (let j = 0; j < ribbon.length; j++) {
          const section = ribbon[j];
          if (!section) continue;
          
          const isDead = this._drawSection(section);
          if (!isDead) {
            allSectionsDead = false;
          }
        }
        
        // 如果彩条的所有片段都已消失，移除该彩条
        if (allSectionsDead) {
          this._ribbons.splice(i, 1);
        }
      }
      
      // 保持彩条数量
      if (this._ribbons.length < this._opts.ribbonCount) {
        this.addRibbon();
      }
      
      requestAnimationFrame(() => this._draw());
    },
  };

   // ================== DOM 就绪后启动 ==================
  function start() {
    /* ====== 手机端禁用 ====== */
    if (/Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent)) return;

    if (document.body) { new Ribbons(); } else { setTimeout(start, 9); }
  }
  start();
})();