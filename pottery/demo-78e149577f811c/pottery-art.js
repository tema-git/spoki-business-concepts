/* Hand-authored SVG still lives. Shapes and textures are original code, never photographed products. */
(() => {
  'use strict';
  let sequence = 0;
  const palettes = {
    mug: ['#d5c7ac','#fff3d6','#b4a68d','#875c3b'],
    vase: ['#74836a','#b9c4a3','#4b5d46','#99704e'],
    sculpture: ['#ba8262','#efc2a0','#8c573e','#704830'],
    bowl: ['#7e8b73','#c3cba9','#52624a','#9c7451'],
    pair: ['#d5b994','#f8e3c2','#ae8a62','#775439']
  };
  function create(kind, label) {
    const id = `ceramic-${++sequence}`;
    const [base, light, shade, clay] = palettes[kind] || palettes.mug;
    const url = name => `url(#${id}-${name})`;
    const speckle = `<rect x="80" y="50" width="360" height="360" fill="${url('grain')}"/>`;
    const mug = (x=0,y=0,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})">
      <ellipse cx="251" cy="346" rx="119" ry="26" fill="${url('shadow')}"/>
      <path d="M326 181C408 159 416 281 338 287" fill="none" stroke="${shade}" stroke-width="22"/>
      <path d="M331 179C402 164 407 271 340 276" fill="none" stroke="${url('material')}" stroke-width="16"/>
      <path d="M155 159C158 213 159 297 178 325C191 344 312 349 327 326C346 295 349 205 346 159Z" fill="${url('material')}"/>
      <path d="M171 290Q247 321 334 295L327 326C314 346 194 345 178 325Z" fill="${clay}" opacity=".58"/>
      <path d="M172 181C177 229 173 277 185 301" fill="none" stroke="${light}" stroke-width="12" stroke-linecap="round" opacity=".48"/>
      <g clip-path="url(#${id}-mugclip)">${speckle}</g>
      <ellipse cx="250" cy="160" rx="96" ry="30" fill="${base}"/>
      <ellipse cx="250" cy="159" rx="82" ry="21" fill="${url('inside')}"/>
      <path d="M156 160C166 198 333 196 345 160" fill="none" stroke="${light}" stroke-width="4"/>
      <path d="M180 326Q248 347 323 327" fill="none" stroke="${shade}" opacity=".4" stroke-width="2"/>
    </g>`;
    const vase = `<ellipse cx="250" cy="352" rx="114" ry="23" fill="${url('shadow')}"/>
      <path d="M214 99C211 131 226 146 211 171C194 199 160 214 162 258C163 307 183 337 205 346C229 358 285 357 305 346C327 334 346 299 342 255C339 214 308 200 290 171C275 145 291 128 288 99Z" fill="${url('material')}"/>
      <path d="M191 326C217 337 286 338 318 326L305 346C285 357 229 358 205 346Z" fill="${clay}" opacity=".75"/>
      <g clip-path="url(#${id}-vaseclip)">${speckle}<path d="M225 127Q239 157 212 193Q178 236 194 297" fill="none" stroke="${light}" stroke-width="13" stroke-linecap="round" opacity=".36"/><path d="M310 222Q326 256 314 297" fill="none" stroke="${light}" stroke-width="4" opacity=".2"/></g>
      <ellipse cx="251" cy="99" rx="37" ry="11" fill="${base}"/><ellipse cx="251" cy="99" rx="29" ry="7" fill="${url('inside')}"/><path d="M214 99Q251 118 288 99" fill="none" stroke="${light}" stroke-width="3"/>
      <g fill="none" stroke="#6d7350" stroke-linecap="round"><path d="M251 99Q242 66 273 23" stroke-width="2"/><path d="M254 75Q280 60 287 42M250 75Q231 50 221 43" stroke-width="1.4"/></g><g fill="#9aa279"><path d="M269 36Q275 13 287 14Q291 30 269 36Z"/><path d="M282 49Q289 28 299 31Q301 45 282 49Z"/><path d="M235 58Q215 58 212 42Q227 36 235 58Z"/></g>`;
    const bowl = `<ellipse cx="251" cy="328" rx="153" ry="33" fill="${url('shadow')}"/>
      <path d="M106 223C117 304 174 338 252 337C337 337 389 298 397 222Z" fill="${url('material')}"/>
      <path d="M162 303Q251 345 345 303L332 319Q251 357 178 319Z" fill="${clay}" opacity=".55"/>
      <path d="M108 213C122 174 167 169 193 182C216 160 263 164 285 181C330 164 371 184 391 207C415 240 349 279 252 280C147 280 89 243 108 213Z" fill="${base}" stroke="${light}" stroke-width="5"/>
      <path d="M125 215C136 190 165 187 195 199C218 182 256 183 281 198C322 183 357 198 374 216C384 235 327 258 252 259C176 259 115 238 125 215Z" fill="${url('inside')}" opacity=".62"/>
      <path d="M137 225Q231 272 363 229" fill="none" stroke="${light}" stroke-width="3" opacity=".55"/>
      <g fill="${shade}" opacity=".28"><circle cx="186" cy="228" r="1.2"/><circle cx="239" cy="213" r="1"/><circle cx="267" cy="241" r="1.4"/><circle cx="304" cy="221" r="1"/><circle cx="160" cy="210" r="1"/><circle cx="331" cy="230" r=".8"/></g>
      <path d="M176 304Q247 336 324 308" fill="none" stroke="${light}" opacity=".25" stroke-width="3"/>`;
    const sculpture = `<ellipse cx="254" cy="349" rx="124" ry="26" fill="${url('shadow')}"/>
      <path d="M146 339C138 280 140 201 166 159C199 105 277 99 319 150C346 181 355 238 346 276C342 297 324 313 302 310C282 308 270 294 272 275C279 231 278 193 252 187C220 180 212 231 215 272L220 337Q183 359 146 339Z" fill="${url('material')}"/>
      <path d="M160 322C154 275 157 201 181 168C207 131 262 126 294 156" fill="none" stroke="${light}" stroke-width="10" stroke-linecap="round" opacity=".4"/>
      <path d="M215 268Q215 221 233 199Q248 181 268 195" fill="none" stroke="${shade}" stroke-width="4" opacity=".35"/>
      <g clip-path="url(#${id}-sculptclip)">${speckle}</g>
      <path d="M145 333Q182 353 220 333V341Q182 359 146 341Z" fill="${clay}"/>
      <path d="M271 276Q283 299 307 300Q326 300 338 284" fill="none" stroke="${light}" stroke-width="3" opacity=".3"/>`;
    const content = kind === 'vase' ? vase : kind === 'sculpture' ? sculpture : kind === 'bowl' ? bowl : kind === 'pair' ? `<g>${mug(-20,44,.83)}<g transform="translate(190 127) scale(.67)">${mug()}</g></g>` : mug();
    const svg = `<svg class="ceramic-art" viewBox="0 0 500 430" role="img" aria-label="${label}" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <defs>
      <radialGradient id="${id}-paper" cx=".2" cy=".15" r="1"><stop stop-color="#faf3e6"/><stop offset="1" stop-color="#d9ccb6"/></radialGradient>
      <linearGradient id="${id}-material"><stop stop-color="${shade}"/><stop offset=".18" stop-color="${base}"/><stop offset=".4" stop-color="${light}"/><stop offset=".63" stop-color="${base}"/><stop offset="1" stop-color="${shade}"/></linearGradient>
      <radialGradient id="${id}-inside" cx=".55" cy=".9" r="1"><stop stop-color="${base}"/><stop offset=".7" stop-color="${shade}"/><stop offset="1" stop-color="#594a37"/></radialGradient>
      <radialGradient id="${id}-shadow"><stop stop-color="#594630" stop-opacity=".35"/><stop offset="1" stop-color="#594630" stop-opacity="0"/></radialGradient>
      <pattern id="${id}-grain" width="19" height="23" patternUnits="userSpaceOnUse"><circle cx="3" cy="7" r=".65" fill="${shade}" opacity=".28"/><circle cx="12" cy="17" r=".55" fill="${shade}" opacity=".18"/><path d="m10 4 1 .5" stroke="${light}" opacity=".5"/></pattern>
      <clipPath id="${id}-mugclip"><path d="M155 159C158 213 159 297 178 325C191 344 312 349 327 326C346 295 349 205 346 159Z"/></clipPath>
      <clipPath id="${id}-vaseclip"><path d="M214 99C211 131 226 146 211 171C194 199 160 214 162 258C163 307 183 337 205 346C229 358 285 357 305 346C327 334 346 299 342 255C339 214 308 200 290 171C275 145 291 128 288 99Z"/></clipPath>
      <clipPath id="${id}-sculptclip"><path d="M146 339C138 280 140 201 166 159C199 105 277 99 319 150C346 181 355 238 346 276C342 297 324 313 302 310C282 308 270 294 272 275C279 231 278 193 252 187C220 180 212 231 215 272L220 337Q183 359 146 339Z"/></clipPath>
      </defs>
      <rect width="500" height="430" fill="${url('paper')}"/>
      <path class="ceramic-light" d="M0 0H126L409 430H260ZM175 0H210L493 430H460Z" fill="#fff9e8"/>
      <path d="M0 332Q250 317 500 334V430H0Z" fill="#9c8e75" opacity=".08"/>
      <g class="ceramic-object">${content}</g>
      <rect width="500" height="430" fill="${url('grain')}" opacity=".12"/>
      </svg>`;
    const holder = document.createElement('div');
    holder.innerHTML = svg;
    return holder.firstElementChild;
  }
  window.PotteryArt = Object.freeze({ create });
})();
