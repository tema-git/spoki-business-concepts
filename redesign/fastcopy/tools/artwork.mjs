// Original two-ink specimen. The repeating cuts follow the body of a perch.
import { writeFileSync } from 'node:fs';

const blue = '#243c8a';
const red = '#ef583d';
const paper = '#fff3d4';
const body = 'M73 157 C96 143 116 120 159 113 C203 99 245 102 273 113 C290 119 308 128 322 141 Q337 148 341 156 L332 160 L341 163 Q329 174 307 178 C279 200 233 212 196 208 C144 206 106 186 78 171 Z';
const tail = 'M87 150 Q53 140 26 119 Q31 145 49 161 Q32 177 18 204 Q57 189 89 175Z';
const dorsal = 'M114 132 Q140 108 148 79 L151 94 L163 67 L164 87 L176 61 L178 80 L192 59 L192 78 L206 59 L205 80 L219 66 L215 87 L231 77 L227 102 L244 89 L242 113Z';
const dorsalRays = Array.from({length:22},(_,i) => {
  const x = 121+i*5.2, endY = 83-Math.sin(i/21*Math.PI)*21+i*.15;
  return '<path d="M'+x+' 121 Q'+(x+8)+' 101 '+(x+15)+' '+endY+'"/>';
}).join('');
const scaleCuts = Array.from({length:22},(_,col) => Array.from({length:12},(_,row) => {
  const x=82+col*8.65+(row%2)*3.6, y=113+row*7+Math.sin(col*.33)*2.3;
  return '<path d="M'+x.toFixed(1)+' '+y.toFixed(1)+' q6 1 5 4 q-1 2 -4 2"/>';
}).join('')).join('');
const stripes = [0,1,2,3,4,5,6].map((i)=>{
  const x=115+i*20;
  return '<path d="M'+x+' 100 q10 24 -1 52 q11 -7 17 -35 l2 -17z"/>';
}).join('');
const tailRays = Array.from({length:15},(_,i)=>{
  const y=121+i*5.6, end= i<7 ? 24+i*2.7 : 48-(i-7)*4.1;
  return '<path d="M84 '+(155+i*.97)+' Q60 '+((161+y)/2)+' '+end+' '+y+'"/>';
}).join('');
const water = Array.from({length:15},(_,i)=>{
  const dx=(i%4)*12+i*.9,y=226+i*3.5;
  return '<path d="M'+(36+dx)+' '+y+' Q112 '+(y-11)+' 176 '+(y-3)+' T'+(337-dx*.32)+' '+(y-2)+'"/>';
}).join('');
const ticks = [[19,21],[371,21],[19,319],[371,319]].map(([x,y])=>'<path d="M'+(x-5)+' '+y+'h10 M'+x+' '+(y-5)+'v10"/>').join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 340" width="390" height="340" role="img" aria-label="Авторский графический образец. Синий речной окунь на фоне киноварного солнца">
<defs>
  <pattern id="dots" width="3.1" height="3.1" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)"><circle cx="1" cy="1" r=".65" fill="${paper}"/></pattern>
  <pattern id="hatch" width="4.7" height="4.7" patternUnits="userSpaceOnUse" patternTransform="rotate(23)"><path d="M0 0v5" stroke="${paper}" stroke-width="1.35"/></pattern>
  <pattern id="speck" width="63" height="53" patternUnits="userSpaceOnUse"><path d="m1 5 2 .2m24 8h1m22 15 2 -1m-36 14 1.5 .4m34 9 1 .5m-19 -16h1m-19 -9 1 .6" stroke="${paper}" stroke-width="1.4" stroke-linecap="round"/></pattern>
  <clipPath id="body"><path d="${body}"/></clipPath><clipPath id="tail"><path d="${tail}"/></clipPath><clipPath id="dorsal"><path d="${dorsal}"/></clipPath>
</defs>
<path fill="${paper}" d="M0 0h390v340H0z"/>
<g stroke="${blue}" stroke-width=".9" fill="none">${ticks}</g>
<circle cx="199" cy="136" r="101" fill="${red}"/><circle cx="199" cy="136" r="101" fill="url(#dots)" opacity=".69"/>
<g fill="none" stroke="${blue}" stroke-width="1.25" opacity=".85">${water}</g>
<g transform="translate(0 -1) rotate(-12 192 150)">
 <g fill="${red}" transform="translate(2.4 2.8)"><path d="${tail}"/><path d="${dorsal}"/><path d="${body}"/></g>
 <g fill="${blue}" stroke="${blue}" stroke-width="2" stroke-linejoin="round">
  <path d="${tail}"/><path d="${dorsal}"/>
  <path d="M152 192 Q142 212 117 221 Q132 222 160 215 L183 202Z"/><path d="M199 195 Q192 213 169 231 Q188 230 205 221 L221 204Z"/>
  <path d="${body}"/>
 </g>
 <g clip-path="url(#dorsal)" fill="none" stroke="${paper}" stroke-width="1.6">${dorsalRays}</g>
 <g clip-path="url(#tail)" fill="none" stroke="${paper}" stroke-width="1.1">${tailRays}</g>
 <g clip-path="url(#body)">
   <path d="${body}" fill="url(#hatch)" opacity=".52"/>
   <path d="M75 166 Q143 168 197 157 T304 143 Q286 190 243 200 Q162 226 75 169Z" fill="${paper}"/>
   <path d="M75 160 Q141 137 179 132 T280 127 L285 161 Q184 153 85 171Z" fill="${blue}"/>
   <g stroke="${paper}" stroke-width="1.2" opacity=".94" fill="none">${scaleCuts}</g>
   <g fill="${blue}">${stripes}</g>
   <path d="M79 172 Q157 155 225 155 T278 149" fill="none" stroke="${paper}" stroke-width="2.1"/>
   <path d="M103 182 Q178 202 245 183 M119 187 Q178 203 228 192 M155 199 Q204 207 243 192" fill="none" stroke="${blue}" stroke-width="1.1"/>
   <path d="M257 109 Q282 129 268 150 Q251 183 238 198 Q260 192 278 173 Q288 158 285 138 Q277 121 264 108Z" fill="${blue}"/>
   <path d="M266 119 Q288 139 275 156 Q257 184 247 188 M270 124 Q284 143 277 152" fill="none" stroke="${paper}" stroke-width="1.7"/>
   <path d="M287 151 Q307 147 326 146 M285 155 Q305 153 317 152 M280 164 Q297 168 317 162 M281 169 Q294 172 306 168" fill="none" stroke="${paper}" stroke-width="1.45"/>
   <path d="M312 160 Q327 157 338 159 M305 174 Q322 171 334 164" fill="none" stroke="${blue}" stroke-width="2"/>
   <path d="${body}" fill="url(#speck)" opacity=".83"/>
 </g>
 <path d="M252 159 Q239 162 212 182 Q223 180 235 178 Q223 186 215 190 Q238 187 252 174 Q258 167 252 159Z" fill="${blue}" stroke="${paper}" stroke-width="1.7"/>
 <path d="m219 180 32 -18 m-30 23 31 -20 m-32 24 31 -21" fill="none" stroke="${paper}" stroke-width="1"/>
 <circle cx="303" cy="141" r="9.2" fill="${blue}" stroke="${paper}" stroke-width="2.2"/><circle cx="304" cy="141" r="5.2" fill="${paper}"/><circle cx="305" cy="140" r="3.8" fill="${blue}"/><circle cx="306" cy="138.5" r="1.1" fill="${paper}"/>
</g>
<g fill="${blue}"><text x="32" y="303" font-family="Georgia,serif" font-weight="bold" font-size="23.5" letter-spacing="-.5">Речной окунь</text><text x="33" y="318" font-family="Georgia,serif" font-size="10.8" font-style="italic">Perca fluviatilis</text><circle cx="335" cy="304" r="6.5"/></g>
<circle cx="346" cy="304" r="6.5" fill="${red}" style="mix-blend-mode:multiply"/>
</svg>`;
writeFileSync(new URL('../assets/proof.svg', import.meta.url),svg);
