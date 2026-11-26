(() => {
  'use strict';
  function seeded(seed) {
    return () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  function pigment(hex, shift, opacity) {
    const rgb = [1, 3, 5].map(i => Math.min(255, Math.max(0, parseInt(hex.slice(i, i + 2), 16) + shift)));
    return 'rgba(' + rgb.join(',') + ',' + opacity + ')';
  }
  function surface(canvas, w, h) {
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(box.width * ratio));
    canvas.height = Math.max(1, Math.round(box.height * ratio));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
    ctx.lineCap = 'round';
    return ctx;
  }
  // A lock of wool is a bundle of fine, slightly crimped filaments following the same spine.
  function lock(ctx, rnd, spine, width, color, count) {
    for (let i = 0; i < count; i++) {
      const fringe = i > count * .89;
      const depth = rnd() * 2 - 1;
      const strand = depth * width * (fringe ? 1.3 : .95);
      const phase = rnd() * 6.283, frequency = 2.2 + rnd() * 4;
      const from = -.06 + rnd() * .16, to = .87 + rnd() * .2;
      const fuzz = fringe ? 3.8 : 1.2;
      ctx.lineWidth = fringe ? .25 + rnd() * .55 : .38 + rnd() * 1.2;
      ctx.strokeStyle = pigment(color, Math.round((rnd() - .45) * 84 + (1 - Math.abs(depth)) * 12), fringe ? .32 : .58);
      ctx.beginPath();
      for (let j = 0; j <= 62; j++) {
        const t = from + (to - from) * j / 62;
        const p = spine(t), next = spine(t + .001);
        const angle = Math.atan2(next[1] - p[1], next[0] - p[0]);
        const envelope = .30 + .70 * Math.sin(Math.PI * Math.max(0, Math.min(1, t))) ** .55;
        const offset = strand * envelope + Math.sin(t * 25 + phase) * 2 + Math.sin(t * 46 * frequency + phase) * fuzz;
        const x = p[0] - Math.sin(angle) * offset, y = p[1] + Math.cos(angle) * offset;
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  function drawHero(canvas) {
    const ctx = surface(canvas, 660, 290), rnd = seeded(8722);
    lock(ctx, rnd, t => [-90 + 825*t, 245 - 156*t - 82*Math.sin(5.9*t-.55)], 39, '#818d67', 865);
    lock(ctx, rnd, t => [14 + 740*t, 322 - 290*t - 99*Math.sin(4.2*t+.48)], 42, '#c6a477', 760);
    lock(ctx, rnd, t => [22 + 720*t, 264 - 245*t + 75*Math.sin(6.0*t+.6)], 40, '#e2d4af', 970);
    lock(ctx, rnd, t => [45 + 685*t - 65*Math.sin(5.8*t), 260 - 184*t - 132*Math.sin(8.1*t-.95)], 48, '#923e51', 1250);
    lock(ctx, rnd, t => [225 + 540*t, 295 - 169*t + 75*Math.sin(5.6*t+.2)], 15, '#b65d53', 420);
  }
  function drawSample(canvas, colors, zoom = false) {
    const ctx = surface(canvas, 560, 400), rnd = seeded(4311);
    ctx.fillStyle = '#e0e1ce'; ctx.fillRect(0,0,560,400);
    ctx.save();
    if (zoom) { ctx.translate(280,200); ctx.scale(2.35,2.35); ctx.translate(-280,-200); }
    ctx.translate(280,200); ctx.rotate(-.115);
    const shades = colors.length ? colors : ['#ddd0b4'];
    for (let layer = 0; layer < shades.length; layer++) {
      ctx.save(); ctx.rotate([.06, -1.13, .54][layer]);
      const xRadius = [211,146,194][layer], yRadius = [137,193,147][layer];
      const density=[2950,1600,1180][layer];
      for(let i=0;i<density;i++) {
        const y=(rnd()*2-1)*yRadius, edge = Math.sqrt(1-(y/yRadius)**2);
        const half = xRadius*(.69+.31*edge)*(.94+rnd()*.09);
        const start=-half+rnd()*half*.8, end=Math.min(half,start+half*(.45+1.50*rnd()));
        const p=rnd()*6.283, f=2+rnd()*4, drift=(rnd()-.5)*34;
        const veil=layer===0?1:.65+.35*Math.sin(y*.052+layer);
        ctx.strokeStyle=pigment(shades[layer],Math.round((rnd()-.46)*78),[.62,.39,.43][layer]*veil);
        ctx.lineWidth=.38+rnd()*.83; ctx.beginPath();
        for(let j=0;j<=26;j++) {
          const t=j/26, x=start+(end-start)*t;
          const yy=y+drift*(t-.5)+Math.sin(x*.018+p)*6+Math.sin(t*f*6.283+p)*1.45;
          if(j===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }
  window.woolArt = { drawSample };
  for (const canvas of document.querySelectorAll('[data-fiber-hero]')) {
    let timer;
    const redraw = () => { clearTimeout(timer); timer = setTimeout(() => drawHero(canvas), 70); };
    new ResizeObserver(redraw).observe(canvas);
    drawHero(canvas);
  }
})();
