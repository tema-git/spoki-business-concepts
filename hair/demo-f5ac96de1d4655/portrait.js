/* Original fashion portrait. No images, external libraries, timers or render loop. */
(() => {
  'use strict';
  const portraits = new WeakMap();
  let serial = 0;
  const NS = 'http://www.w3.org/2000/svg';
  const words = {
    length: {short:'короткое каре',medium:'длина до плеч',long:'длинные волосы'},
    texture: {sleek:'гладкая текстура',wave:'мягкие волны',volume:'объёмные локоны'},
    tone: {dark:'тёмный каштановый',warm:'тёплый медный',cool:'холодный светлый'}
  };
  const colors = {
    dark: ['#292326','#433232','#71534b','#ad8170','#392a2c','#dcc0a4'],
    warm: ['#593224','#85452d','#b77349','#e6ac76','#743d2b','#f1c69a'],
    cool: ['#736a60','#9d9281','#c6b9a1','#e9ddc7','#928775','#fff1d7']
  };
  const number = v => Math.round(v * 100) / 100;
  function curve(points, move = true) {
    let result = move ? `M${number(points[0][0])} ${number(points[0][1])}` : '';
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[Math.max(0,i-1)], b = points[i], c = points[i+1], d = points[Math.min(points.length-1,i+2)];
      result += `C${number(b[0]+(c[0]-a[0])/6)} ${number(b[1]+(c[1]-a[1])/6)} ${number(c[0]-(d[0]-b[0])/6)} ${number(c[1]-(d[1]-b[1])/6)} ${number(c[0])} ${number(c[1])}`;
    }
    return result;
  }
  function fall(x, top, bottom, texture, side, width = 1, bend = 0) {
    const amplitude = ({sleek:1.5,wave:9,volume:17}[texture]) * width;
    const turns = texture === 'volume' ? 2.2 : 1.18;
    const points = [];
    for (let i = 0; i <= 12; i++) {
      const t = i/12;
      // Waves grow gradually below the temple; ends remain deliberately shaped.
      const wave = Math.sin(t*Math.PI*2*turns - .3) * Math.sin(Math.PI*t) * amplitude;
      const bow = Math.sin(t*Math.PI) * (texture === 'volume' ? 14 : 5) * side;
      points.push([x + wave*side + bow + bend*t, top + (bottom-top)*t]);
    }
    return points;
  }
  function geometry(length, texture) {
    const end = {short:353,medium:458,long:565}[length];
    const width = texture === 'volume' ? 17 : texture === 'wave' ? 6 : 0;
    const left = fall(146-width*.35,202,end,texture,-1,1.05,length==='short'?7:-7);
    const right = fall(343+width*.45,202,end-12,texture,1,1.1,length==='short'?-9:10);
    const innerLeft = fall(191,236,end-9,texture,-1,.48,length==='short'?-9:9);
    const innerRight = fall(313,243,end-16,texture,1,.48,length==='short'?3:-5);
    const firstLeft = left[0], firstRight = right[0], endLeft = left.at(-1), endRight = right.at(-1);
    const back = `M${firstLeft[0]} 202C126 134 176 96 224 101C267 85 322 111 ${firstRight[0]} 168L${firstRight[0]} 202${curve(right,false)}Q302 ${end+24} 249 ${end+1}Q196 ${end+23} ${endLeft[0]} ${end}${curve([...left].reverse(),false)}Z`;
    const leftPath = `M270 111C228 95 180 115 159 155C143 178 142 192 ${firstLeft[0]} 202${curve(left,false)}Q${endLeft[0]+21} ${end+14} ${innerLeft.at(-1)[0]} ${end-9}${curve([...innerLeft].reverse(),false)}C188 209 195 187 217 169C237 154 256 141 270 111Z`;
    const rightPath = `M270 111C310 110 340 139 ${firstRight[0]} 181L${firstRight[0]} 202${curve(right,false)}Q${endRight[0]-8} ${end+5} ${innerRight.at(-1)[0]} ${end-16}${curve([...innerRight].reverse(),false)}C319 212 311 183 297 162C287 146 278 133 270 111Z`;
    return {back,left:leftPath,right:rightPath,end,width};
  }
  function strandMarkup(length, texture, id) {
    const {end,width} = geometry(length,texture);
    let lines = '';
    for (let i = 0; i < 20; i++) {
      const fraction = i/19;
      const x = 148-width*.35+fraction*42;
      const points = fall(x,192+fraction*44,end-5-fraction*12,texture,-1,.95-fraction*.4,length==='short'?6-fraction*14:-7+fraction*17);
      const start = points[0];
      const crest = `M${268-fraction*14} ${114+fraction*4}C${218-fraction*19} ${110+fraction*20} ${154+fraction*11} ${137+fraction*22} ${number(start[0])} ${number(start[1])}`;
      lines += `<path d="${crest}${curve(points,false)}" stroke="url(#${id}-strand)" stroke-width="${i%5===0?2.4:i%3===0?1.25:.7}" opacity="${i%5===0?.6:.32}"/>`;
    }
    for (let i = 0; i < 14; i++) {
      const fraction = i/13;
      const points = fall(315+fraction*(29+width*.4),229-fraction*25,end-17+fraction*6,texture,1,.5+fraction*.55,length==='short'?3-fraction*10:-5+fraction*15);
      const start = points[0];
      lines += `<path d="M${274+fraction*5} ${116+fraction*9}C${303+fraction*18} ${150+fraction*7} ${318+fraction*24} ${175+fraction*9} ${number(start[0])} ${number(start[1])}${curve(points,false)}" stroke="url(#${id}-strand)" stroke-width="${i%4===0?2: .8}" opacity="${i%4===0?.52:.28}"/>`;
    }
    return lines;
  }
  function markup(id) {
    return `<defs>
      <linearGradient id="${id}-hair" x1="0" y1=".12" x2="1" y2=".65"><stop data-hp-tone="0" offset="0"/><stop data-hp-tone="1" offset=".2"/><stop data-hp-tone="2" offset=".42"/><stop data-hp-tone="3" offset=".56"/><stop data-hp-tone="2" offset=".64"/><stop data-hp-tone="4" offset="1"/></linearGradient>
      <linearGradient id="${id}-back" x1="0" y1="0" x2="1" y2=".3"><stop data-hp-tone="0"/><stop data-hp-tone="1" offset=".45"/><stop data-hp-tone="4" offset="1"/></linearGradient>
      <linearGradient id="${id}-strand" x1="0" y1="0" x2=".8" y2="1"><stop data-hp-tone="1"/><stop data-hp-tone="5" offset=".35"/><stop data-hp-tone="3" offset=".75"/><stop data-hp-tone="1" offset="1"/></linearGradient>
      <linearGradient id="${id}-skin" x1=".05" y1=".4" x2="1" y2=".5"><stop stop-color="#bb8978"/><stop offset=".27" stop-color="#e1b6a0"/><stop offset=".61" stop-color="#f4d5bb"/><stop offset="1" stop-color="#d8a58e"/></linearGradient>
      <linearGradient id="${id}-neck" x1=".15" y1="0" x2=".8" y2="1"><stop stop-color="#ac7666"/><stop offset=".5" stop-color="#deb19a"/><stop offset="1" stop-color="#edc7ac"/></linearGradient>
      <radialGradient id="${id}-blush"><stop stop-color="#be706c" stop-opacity=".35"/><stop offset="1" stop-color="#ce8a78" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}-light"><stop stop-color="#fff2d8" stop-opacity=".5"/><stop offset="1" stop-color="#fff2d8" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}-silk" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#91a9b5"/><stop offset=".35" stop-color="#d0e0e6"/><stop offset=".58" stop-color="#f5f7ef"/><stop offset=".73" stop-color="#dbe7e7"/><stop offset="1" stop-color="#8da8b6"/></linearGradient>
      <linearGradient id="${id}-metal"><stop stop-color="#8f7850"/><stop offset=".34" stop-color="#dfcaa1"/><stop offset=".54" stop-color="#fff2cf"/><stop offset="1" stop-color="#ae9265"/></linearGradient>
      <clipPath id="${id}-face-clip"><path d="M208 166C237 151 277 151 296 175C311 197 316 220 312 245C311 261 316 277 310 292C303 314 285 340 268 349C255 357 236 347 222 336C203 321 194 296 190 272C185 252 182 231 188 209C191 190 197 174 208 166Z"/></clipPath>
      <clipPath id="${id}-hair-clip"><path class="hp-clip-left"/><path class="hp-clip-right"/></clipPath>
    </defs>
    <g class="hp-body">
      <path class="hp-back" fill="url(#${id}-back)"/>
      <path d="M224 324C231 350 234 370 223 392L190 413Q237 475 301 411L281 393C271 376 276 350 282 332Z" fill="url(#${id}-neck)"/>
      <path d="M226 327Q249 353 279 335L274 367Q248 381 231 356Z" fill="#976757" opacity=".25"/>
      <path d="M35 620L52 492Q60 443 116 431L207 399Q222 421 247 425Q275 425 292 397L373 427Q415 441 438 486L476 620Z" fill="url(#${id}-silk)"/>
      <path d="M204 401Q221 423 248 425L211 481L172 421Z" fill="#f1f5ef"/>
      <path d="M292 397L327 413L277 477L248 425Q278 420 292 397Z" fill="#e8efeb"/>
      <path d="M211 481L245 514L277 477M245 514L252 620M106 451Q86 507 92 620M377 455Q397 516 406 620" fill="none" stroke="#90a9b4" stroke-width="1.35" opacity=".65"/>
      <path d="M58 515Q93 483 132 482M358 478Q402 490 424 522" fill="none" stroke="#eff5f1" stroke-width="2" opacity=".6"/>
      <path d="M216 406Q245 441 286 403" fill="none" stroke="url(#${id}-metal)" stroke-width="1.5"/>
      <circle cx="251" cy="427" r="3" fill="url(#${id}-metal)"/>
    </g>
    <g class="hp-head">
      <path d="M306 244C324 233 329 252 321 273Q316 285 305 283Z" fill="#d3a18d"/>
      <path d="M314 248Q322 248 316 265" fill="none" stroke="#aa7465" stroke-width="1.2"/>
      <path class="hp-face" d="M208 166C237 151 277 151 296 175C311 197 316 220 312 245C311 261 316 277 310 292C303 314 285 340 268 349C255 357 236 347 222 336C203 321 194 296 190 272C185 252 182 231 188 209C191 190 197 174 208 166Z" fill="url(#${id}-skin)"/>
      <g clip-path="url(#${id}-face-clip)">
        <ellipse cx="214" cy="283" rx="39" ry="29" fill="url(#${id}-blush)"/>
        <ellipse cx="303" cy="273" rx="25" ry="26" fill="url(#${id}-blush)"/>
        <ellipse class="hp-face-light" cx="258" cy="219" rx="45" ry="65" fill="url(#${id}-light)"/>
        <path d="M195 187C186 233 193 284 222 315Q235 336 268 349C242 357 215 332 201 314C180 283 174 230 183 198Z" fill="#a96e61" opacity=".14"/>
        <path d="M289 190Q303 222 297 249Q299 268 306 279Q293 297 293 309C310 294 315 281 315 263L316 196Z" fill="#ae7765" opacity=".11"/>
      </g>
      <path d="M206 225C215 217 230 215 243 219" fill="none" stroke="#6a493d" stroke-width="3.1" stroke-linecap="round"/>
      <path d="M279 218Q292 212 303 219" fill="none" stroke="#6a493d" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M207 242Q224 230 244 239Q226 249 207 242Z" fill="#f4dfcd"/>
      <path d="M279 237Q291 228 303 236Q292 243 279 237Z" fill="#f0d5bf"/>
      <ellipse cx="229" cy="239" rx="5.1" ry="5.3" fill="#6d6651"/><ellipse cx="293" cy="235" rx="4.1" ry="4.5" fill="#6d6651"/>
      <ellipse cx="230" cy="239" rx="2.8" ry="3.6" fill="#322e2b"/><ellipse cx="294" cy="235" rx="2.3" ry="3.1" fill="#322e2b"/>
      <circle cx="231" cy="237" r="1.15" fill="#fff6e4"/><circle cx="295" cy="233.5" r=".9" fill="#fff6e4"/>
      <path d="M205 241Q223 229 244 239M279 237Q290 227 304 236" fill="none" stroke="#513c35" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M207 241l-3-3m7 0-2-3m89-1 3-2" fill="none" stroke="#513c35" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M212 250Q228 254 241 246M282 244Q292 247 301 241" fill="none" stroke="#bd8f7b" stroke-width=".8" opacity=".55"/>
      <path d="M269 240C269 256 275 267 281 276Q284 281 276 283" fill="none" stroke="#be8b73" stroke-width="1.55" stroke-linecap="round"/>
      <path d="M263 281Q266 277 270 281M274 286Q280 287 283 282" fill="none" stroke="#a16c5c" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M270 289l-2 9" stroke="#bc8976" stroke-width="1" opacity=".55"/>
      <path d="M247 309Q257 302 266 304Q273 300 282 306L289 308Q278 322 265 322Q255 321 247 309Z" fill="#b77a76"/>
      <path d="M247 309Q266 312 289 308" fill="none" stroke="#874f51" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M258 316Q269 321 278 315" fill="none" stroke="#e1a7a0" stroke-width="1.5" opacity=".7" stroke-linecap="round"/>
      <path d="M254 334Q265 338 277 332" fill="none" stroke="#edc5ac" stroke-width="1.6" opacity=".6"/>
      <g class="hp-earring"><path d="M314 277C331 278 333 310 317 315C302 315 303 286 314 277Z" fill="none" stroke="url(#${id}-metal)" stroke-width="3.1"/><circle cx="313" cy="278" r="3" fill="#ebd6ad"/></g>
      <g class="hp-left-motion"><path class="hp-left" fill="url(#${id}-hair)"/></g>
      <g class="hp-right-motion"><path class="hp-right" fill="url(#${id}-hair)"/></g>
      <g class="hp-strands" clip-path="url(#${id}-hair-clip)" fill="none" stroke-linecap="round"></g>
      <path d="M267 113Q242 140 216 160" fill="none" stroke="#e2b59b" stroke-width="1.3" opacity=".5"/>
    </g>`;
  }
  function render(svg, next = {}) {
    if (!svg || svg.namespaceURI !== NS || svg.tagName.toLowerCase() !== 'svg') throw new TypeError('HairPortrait.render expects an SVG element.');
    let record = portraits.get(svg);
    if (!record) {
      const id = `hp-${++serial}`;
      svg.innerHTML = markup(id);
      svg.setAttribute('viewBox','0 0 500 620');
      svg.setAttribute('role','img');
      svg.classList.add('hair-portrait');
      record = {id,state:{length:'medium',texture:'wave',tone:'dark'}};
      portraits.set(svg,record);
    }
    const state = {...record.state};
    for (const key of ['length','texture','tone']) if (Object.hasOwn(words[key],next[key])) state[key] = next[key];
    record.state = state;
    const shape = geometry(state.length,state.texture);
    for (const key of ['back','left','right']) svg.querySelector(`.hp-${key}`).setAttribute('d',shape[key]);
    svg.querySelector('.hp-clip-left').setAttribute('d',shape.left);
    svg.querySelector('.hp-clip-right').setAttribute('d',shape.right);
    svg.querySelector('.hp-strands').innerHTML = strandMarkup(state.length,state.texture,record.id);
    svg.querySelectorAll('[data-hp-tone]').forEach(stop => stop.setAttribute('stop-color',colors[state.tone][Number(stop.dataset.hpTone)]));
    for (const key of ['length','texture','tone']) svg.dataset[key] = state[key];
    svg.setAttribute('aria-label',`Женский портрет: ${words.length[state.length]}, ${words.texture[state.texture]}, ${words.tone[state.tone]} оттенок.`);
    return {...state};
  }
  window.HairPortrait = Object.freeze({render,init:render,getState:svg => portraits.has(svg)?{...portraits.get(svg).state}:null});
})();
