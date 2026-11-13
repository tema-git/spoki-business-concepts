(() => {
  'use strict';
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = (start, end, value) => {
    const t = clamp((value-start)/(end-start));
    return t*t*(3-2*t);
  };
  let sceneId = 0;

  function create(host, variant = 'hero') {
    if (!host) return null;
    const id = `aqua-water-${++sceneId}`;
    const dark = variant === 'ritual';
    const definitions = `<defs>
      <linearGradient id="${id}-body" gradientUnits="userSpaceOnUse" x1="180" y1="200" x2="950" y2="450"><stop stop-color="#bdeaff" stop-opacity=".03"/><stop offset=".18" stop-color="#7dc9f5" stop-opacity=".42"/><stop offset=".38" stop-color="#f0fbff" stop-opacity=".86"/><stop offset=".51" stop-color="#8dd6fa" stop-opacity=".36"/><stop offset=".68" stop-color="#f8fdff" stop-opacity=".76"/><stop offset=".9" stop-color="#49aeea" stop-opacity=".35"/><stop offset="1" stop-color="#99d9ff" stop-opacity=".05"/></linearGradient>
      <linearGradient id="${id}-front" gradientUnits="userSpaceOnUse" x1="130" y1="370" x2="940" y2="570"><stop stop-color="#77c2ed" stop-opacity="0"/><stop offset=".18" stop-color="#54b5ed" stop-opacity=".26"/><stop offset=".43" stop-color="#ffffff" stop-opacity=".8"/><stop offset=".57" stop-color="#a2defb" stop-opacity=".4"/><stop offset=".79" stop-color="#ffffff" stop-opacity=".8"/><stop offset="1" stop-color="#7cc9f8" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id}-edge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".05"/><stop offset=".35" stop-color="#fff" stop-opacity=".95"/><stop offset=".72" stop-color="#72c4f2" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity=".06"/></linearGradient>
      <radialGradient id="${id}-drop" cx=".28" cy=".2" r=".8"><stop stop-color="#fff"/><stop offset=".19" stop-color="#fff" stop-opacity=".85"/><stop offset=".5" stop-color="#8bd3fc" stop-opacity=".32"/><stop offset=".85" stop-color="#3b99df" stop-opacity=".32"/><stop offset="1" stop-color="#e4f7ff" stop-opacity=".8"/></radialGradient>
    </defs>`;
    const shell = (className, inner) => `<svg class="live-water ${className}" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true" focusable="false">${inner}</svg>`;
    host.insertAdjacentHTML('afterbegin', shell('live-water-back', definitions + `
      <g class="water-back-ribbons">
        <path data-water-path="back" fill="url(#${id}-body)"/>
        <path data-water-path="back-edge" fill="none" stroke="url(#${id}-edge)" stroke-width="2.4"/>
        <path data-water-path="back-inner" fill="none" stroke="#d9f5ff" stroke-width="1.1" opacity=".7"/>
        <path data-water-path="back-light" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" pathLength="1" stroke-dasharray=".11 .89"/>
      </g>
      <g class="water-secondary-ribbons">
        <path data-water-path="upper" fill="url(#${id}-body)" opacity=".5"/>
        <path data-water-path="upper-edge" fill="none" stroke="#c7eeff" stroke-width="1.3" opacity=".6"/>
      </g>
      <g class="water-spray">${Array.from({length:12}, (_,index) => `<g class="water-droplet" data-water-drop="${index}"><ellipse rx="${4+index%4*1.3}" ry="${7+index%4*2}" fill="url(#${id}-drop)" stroke="${dark?'#e0f7ff':'#fff'}" stroke-width=".7"/><path d="M-1-4v2" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".85"/></g>`).join('')}</g>`));
    host.insertAdjacentHTML('beforeend', shell('live-water-front', `
      <g class="water-front-ribbons">
        <path data-water-path="front" fill="url(#${id}-front)"/>
        <path data-water-path="front-edge" fill="none" stroke="url(#${id}-edge)" stroke-width="2.8"/>
        <path data-water-path="front-fine" fill="none" stroke="#9dd9fb" stroke-width="1.2" opacity=".64"/>
        <path data-water-path="front-light" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" pathLength="1" stroke-dasharray=".085 .915"/>
      </g>
      <g class="water-drain-lines" fill="none" stroke-linecap="round"><path data-water-path="drain-a" stroke="#d2f2ff" stroke-width="2.5"/><path data-water-path="drain-b" stroke="#8ed2f6" stroke-width="1.5"/><path data-water-path="drain-c" stroke="#fff" stroke-width="1.7"/></g>
      <ellipse class="water-pool-light" cx="520" cy="535" rx="315" ry="29" fill="none" stroke="#a5dcfa" stroke-width="1.5" opacity=".4"/>
    `));
    const paths = {};
    host.querySelectorAll('[data-water-path]').forEach(path => {paths[path.dataset.waterPath] = path;});
    const drops = [...host.querySelectorAll('[data-water-drop]')];
    const bodyGradient = host.querySelector(`#${id}-body`);
    const frontGradient = host.querySelector(`#${id}-front`);
    const drainLines = host.querySelector('.water-drain-lines');
    const pool = host.querySelector('.water-pool-light');
    let last = -1;
    const f = value => Math.round(value * 10) / 10;

    function render(value) {
      const p = clamp(value);
      if (Math.abs(last-p) < .00015) return;
      last = p;
      const arrive = 1-smooth(0,.42,p);
      const wrap = smooth(.14,.62,p);
      const drain = smooth(.65,1,p);
      const swell = Math.sin(p*Math.PI);
      const twist = Math.sin(p*Math.PI*1.45);
      const startX = 130-82*arrive+15*drain;
      const startY = 435+90*arrive+50*drain;
      const peakX = 550+82*wrap;
      const peakY = 115-60*arrive+110*drain;
      const endX = 917+75*arrive-40*drain;
      const endY = 420-68*swell+95*drain;
      const width = 16+23*swell-9*drain;
      const center = `M${f(startX)} ${f(startY)} C${f(80-30*arrive)} ${f(220-70*twist)} ${f(315-40*arrive)} ${f(peakY-80)} ${f(peakX)} ${f(peakY)} C${f(800+20*twist)} ${f(peakY+48)} ${f(1000+30*arrive)} ${f(endY-160)} ${f(endX)} ${f(endY)}`;
      const body = `${center} C${f(endX+10)} ${f(endY-150+width)} ${f(785+30*twist)} ${f(peakY+83+width)} ${f(peakX-8)} ${f(peakY+width)} C${f(300-45*arrive)} ${f(peakY-35+width)} ${f(107-25*arrive)} ${f(235-60*twist)} ${f(startX+9)} ${f(startY+12)}Z`;
      paths.back.setAttribute('d',body);
      paths['back-edge'].setAttribute('d',center);
      paths['back-light'].setAttribute('d',center);
      paths['back-light'].setAttribute('stroke-dashoffset',(.12-p*1.25).toFixed(4));
      paths['back-inner'].setAttribute('d',`M${f(startX+14)} ${f(startY-4)} C${f(123-20*arrive)} ${f(240-70*twist)} 340 ${f(peakY-48)} ${f(peakX-4)} ${f(peakY+width*.48)} C810 ${f(peakY+72)} 968 ${f(endY-130)} ${f(endX-8)} ${f(endY-10)}`);

      const upperY = 65+160*drain+20*twist;
      const upper = `M${f(255-120*arrive)} ${f(350+70*arrive)} C${f(180-80*arrive)} ${f(upperY-100)} 680 ${f(upperY-70)} ${f(885+80*arrive)} ${f(270+35*twist)} C${f(790+70*arrive)} ${f(130+upperY*.3)} 350 ${f(upperY-20)} ${f(255-120*arrive)} ${f(350+70*arrive)}Z`;
      paths.upper.setAttribute('d',upper);
      paths['upper-edge'].setAttribute('d',`M${f(255-120*arrive)} ${f(350+70*arrive)} C${f(180-80*arrive)} ${f(upperY-100)} 680 ${f(upperY-70)} ${f(885+80*arrive)} ${f(270+35*twist)}`);

      const frontY = 465+40*arrive+35*drain;
      const frontStart = 130-70*arrive;
      const frontEnd = 925+75*arrive;
      const front = `M${f(frontStart)} ${f(frontY)} C${f(300-100*arrive)} ${f(590-95*swell)} ${f(625+35*twist)} ${f(570-90*wrap)} ${f(frontEnd)} ${f(390+90*drain)} C${f(830+60*arrive)} ${f(555-55*wrap+35*drain)} ${f(330-70*arrive)} ${f(612-80*swell)} ${f(frontStart)} ${f(frontY+8)}Z`;
      const frontEdge = `M${f(frontStart)} ${f(frontY)} C${f(300-100*arrive)} ${f(590-95*swell)} ${f(625+35*twist)} ${f(570-90*wrap)} ${f(frontEnd)} ${f(390+90*drain)}`;
      paths.front.setAttribute('d',front);
      paths['front-edge'].setAttribute('d',frontEdge);
      paths['front-light'].setAttribute('d',frontEdge);
      paths['front-light'].setAttribute('stroke-dashoffset',(.45-p*1.3).toFixed(4));
      paths['front-fine'].setAttribute('d',`M${f(frontStart+40)} ${f(frontY+15)} C330 ${f(610-85*swell)} 710 ${f(550-70*wrap)} ${f(frontEnd-25)} ${f(423+80*drain)}`);

      bodyGradient.setAttribute('gradientTransform',`rotate(${f(-16+p*48)} 520 300)`);
      frontGradient.setAttribute('gradientTransform',`translate(${f(-130+p*240)} ${f(p*20)})`);
      drainLines.setAttribute('opacity',(.08+drain*.7).toFixed(3));
      paths['drain-a'].setAttribute('d',`M830 ${f(320+drain*30)} Q${f(845-22*drain)} ${f(430+drain*35)} ${f(815-40*drain)} ${f(535+drain*50)}`);
      paths['drain-b'].setAttribute('d',`M858 ${f(340+drain*30)} Q${f(875-25*drain)} ${f(455+drain*35)} ${f(850-30*drain)} ${f(555+drain*50)}`);
      paths['drain-c'].setAttribute('d',`M190 ${f(365+drain*25)} Q${f(153+15*drain)} ${f(455+drain*40)} ${f(188+22*drain)} ${f(535+drain*40)}`);
      pool.setAttribute('rx',f(295+38*swell+30*drain));
      pool.setAttribute('ry',f(24+14*swell));
      pool.setAttribute('opacity',(.2+.3*wrap).toFixed(3));

      for (let index=0; index<drops.length; index++) {
        const side = index<6 ? -1 : 1;
        const step = index%6;
        const angle = -.95 + step*.35 + p*.8;
        const spread = 110+arrive*105+step*14;
        const x = 520 + side*(220 + Math.cos(angle)*spread) + Math.sin(p*Math.PI+index*.9)*18;
        const y = 200 + step*42 + Math.sin(angle)*95 - swell*(35+step*5) + drain*(90+step*11);
        drops[index].setAttribute('transform',`translate(${f(x)} ${f(y)}) rotate(${f(side*(28+twist*20)-drain*30)}) scale(${(.8+swell*.28-drain*.1).toFixed(3)})`);
        drops[index].setAttribute('opacity',(.52+.3*swell-.16*drain).toFixed(3));
      }
      host.dataset.waterProgress = p.toFixed(3);
      host.dataset.waterPhase = p<.3 ? 'arrive' : p<.72 ? 'wrap' : 'drain';
    }
    render(0);
    host.classList.add('has-live-water');
    return {host, variant, render, current:0, top:0, height:0};
  }
  window.AquaWaterScenes = Object.freeze({create});
})();
