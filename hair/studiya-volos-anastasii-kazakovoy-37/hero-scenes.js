(() => {
  'use strict';
  const svgNS = 'http://www.w3.org/2000/svg';
  const round = n => Math.round(n * 100) / 100;
  function curve(points) {
    let d = `M${round(points[0].x)} ${round(points[0].y)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[Math.max(0, i - 1)], b = points[i], c = points[i + 1], e = points[Math.min(points.length - 1, i + 2)];
      d += `C${round(b.x + (c.x-a.x)/6)} ${round(b.y + (c.y-a.y)/6)} ${round(c.x - (e.x-b.x)/6)} ${round(c.y - (e.y-b.y)/6)} ${round(c.x)} ${round(c.y)}`;
    }
    return d;
  }
  function buildBundle(id, settings) {
    const target = document.getElementById(id);
    if (!target) return;
    const fragment = document.createDocumentFragment();
    const { count, width, amplitude, frequency, phase, x, y, height, hue, saturation, floor, shine } = settings;
    for (let i = 0; i < count; i++) {
      const u = i / (count - 1), offset = u - .5, points = [];
      for (let j = 0; j <= 38; j++) {
        const t = j / 38, angle = t * frequency + phase;
        const dx = amplitude * frequency * Math.cos(angle), dy = height;
        const norm = Math.hypot(dx, dy);
        const taper = .66 + .34 * Math.sin(Math.PI * t);
        const distance = offset * width * taper;
        points.push({ x: x + amplitude * Math.sin(angle) - dy / norm * distance, y: y + height * t + dx / norm * distance });
      }
      const light = floor + shine * Math.exp(-Math.pow((u - .38) / .22, 2)) + 3 * Math.sin(i * 2.4);
      const strand = document.createElementNS(svgNS, 'path');
      strand.setAttribute('d', curve(points));
      strand.setAttribute('fill', 'none');
      strand.setAttribute('stroke', `hsl(${hue} ${saturation}% ${Math.max(8,light).toFixed(1)}%)`);
      strand.setAttribute('stroke-width', String((width / count * 1.2).toFixed(2)));
      strand.setAttribute('stroke-linecap', 'round');
      fragment.append(strand);
    }
    target.replaceChildren(fragment);
  }
  // Draw once. Existing section variables animate the resulting SVG layers.
  buildBundle('hero-fibers-back', {count:84,width:83,amplitude:128,frequency:Math.PI*1.55,phase:.6,x:330,y:-40,height:850,hue:213,saturation:15,floor:20,shine:35});
  buildBundle('hero-fibers-main', {count:166,width:178,amplitude:145,frequency:Math.PI*2.05,phase:-.65,x:286,y:-68,height:920,hue:215,saturation:13,floor:12,shine:48});
  buildBundle('copper-fibers-back', {count:62,width:58,amplitude:86,frequency:Math.PI*4.2,phase:1.7,x:307,y:48,height:544,hue:20,saturation:42,floor:23,shine:34});
  buildBundle('copper-fibers-front', {count:118,width:94,amplitude:98,frequency:Math.PI*4.6,phase:-.4,x:223,y:0,height:645,hue:23,saturation:51,floor:25,shine:48});
})();
