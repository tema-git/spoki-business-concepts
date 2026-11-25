import { icon, arrow, esc, proof } from './components.mjs';

function picker(id,title,items,initial,{multi=false,ink=false}={}){
  const selected = multi ? initial : [initial];
  const label = selected.length ? items.filter(x=>selected.includes(x.id)).map(x=>x.label).join(', ') : 'Без печати';
  return `<div class="field picker" data-key="${id}" data-multi="${multi}"><span class="label" id="label-${id}">${title}</span>
  <button type="button" class="pick-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="list-${id}" aria-labelledby="label-${id} val-${id}"><span class="pick-current"><span class="pick-dots"></span><span id="val-${id}">${esc(label)}</span></span>${icon('down')}</button>
  <div class="pick-list" role="listbox" id="list-${id}" aria-labelledby="label-${id}" ${multi?'aria-multiselectable="true"':''} hidden>
  ${(multi?[{id:'none',label:'Без печати'},...items]:items).map(x=>`<button role="option" tabindex="-1" type="button" data-id="${x.id}" aria-selected="${selected.includes(x.id)||(x.id==='none'&&!selected.length)}">${ink?`<i class="ink-dot" style="--dot:${x.hex||'transparent'}"></i>`:''}<span>${esc(x.label)}</span>${icon('check','chosen')}</button>`).join('')}</div></div>`;
}
function game(){
  const target = '<circle cx="138" cy="89" r="48"/><path d="M68 89c19-27 43-36 71-35 23 1 46 14 61 31l25-15-6 21 6 21-26-13c-20 19-42 26-66 23-25-3-46-16-65-33Z"/><circle cx="94" cy="85" r="3"/><path d="M109 75q11 15-3 28m12-27 34 8-29 7 32 6"/>';
  return `<section id="game" class="game-section"><div class="wrap game-layout"><div class="game-copy"><p class="kicker pale">${icon('register')} Печатная практика</p><h2>Совмести<br>краски</h2><p>Каждую краску печатают отдельно. Передвиньте красный слой так, чтобы его центр совпал с синим.</p></div>
   <div class="game-panel"><div class="registration-board" tabindex="0" role="group" aria-label="Совмещение красок. Перемещение стрелками" aria-describedby="game-feedback">
   <svg viewBox="0 0 280 176" aria-hidden="true"><defs><pattern id="reg-grid" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M14 0H0v14" fill="none" stroke="#9898aa" stroke-width=".5"/></pattern></defs>
   <rect width="280" height="176" fill="url(#reg-grid)"/><g fill="none" stroke="#213c88" stroke-width="2.6">${target}<path d="M138 78v22m-11-11h22"/><circle cx="138" cy="89" r="8"/></g>
   <g class="game-layer" fill="none" stroke="#ce432f" stroke-width="1.7" stroke-dasharray="3.8 2">${target}<circle cx="138" cy="89" r="13" stroke-dasharray="none"/><path d="M119 89h8m22 0h8m-19-19v8m0 22v8" stroke-dasharray="none"/></g></svg></div>
   <div class="game-controls"><div><span class="label" id="step-label">Шаг смещения</span><div class="step-control" role="group" aria-labelledby="step-label"><button type="button" data-step="1" aria-pressed="true">1 мм</button><button type="button" data-step="3" aria-pressed="false">3 мм</button></div>
   <p id="game-feedback" aria-live="polite"></p></div><div class="d-pad" role="group" aria-label="Сдвинуть красный слой">${[['up','Вверх'],['left','Влево'],['lower','Вниз'],['right','Вправо']].map(([id,label])=>`<button type="button" data-move="${id}" aria-label="${label}">${icon(id)}</button>`).join('')}</div></div>
   <button type="button" class="game-reset" id="game-reset">${icon('reset')} Начать заново</button></div></div></section>`;
}
export function home(rates,cards){
  const formats = ['A6','A5','A4','A3','euro','card'].map(id=>rates.formats.find(x=>x.id===id));
  return `<div class="wrap workbench" id="calculator"><div class="calc-column">
   <div class="intro"><p class="kicker">${icon('register')} Калькулятор печати</p><h1>Листовки<br>на ризографе<span class="ink-period">.</span></h1>
    <p class="lead">Подберите бумагу и краски, узнайте стоимость тиража и передайте спецификацию в типографию.</p></div>
   <form id="print-form" class="print-form" novalidate><div class="form-heading"><h2>Параметры тиража</h2><button type="button" id="reset-calc" class="text-button">${icon('reset')} Сбросить</button></div>
    <p class="product-context" id="product-context" hidden></p>
    <fieldset class="formats"><legend>Формат <span class="field-note" id="format-size">148,5 × 210 мм</span></legend><div class="format-list">${formats.map(f=>`<label><input type="radio" name="format" value="${f.id}" ${f.id==='A5'?'checked':''}><span>${esc(f.label)}</span></label>`).join('')}</div></fieldset>
    <div class="field"><label for="quantity">Тираж</label><div class="qty-row"><div class="qty-input"><button type="button" data-qty="-1" aria-label="Уменьшить тираж">${icon('minus')}</button><input id="quantity" name="quantity" type="text" inputmode="numeric" autocomplete="off" value="1000" aria-describedby="quantity-error"><span>шт.</span><button type="button" data-qty="1" aria-label="Увеличить тираж">${icon('plus')}</button></div>
    <div class="quick-qty" role="group" aria-label="Выбрать тираж">${[[500,'500'],[1000,'1 000'],[5000,'5 000']].map(([n,label])=>`<button type="button" data-quantity="${n}" aria-pressed="${n===1000}">${label}</button>`).join('')}</div></div><p id="quantity-error" class="field-error" aria-live="polite"></p></div>
    ${picker('paper','Бумага',rates.papers,'1')}
    <div class="ink-fields">${picker('front','Краска на лице',rates.inks,['black'],{multi:true,ink:true})}${picker('back','Краска на обороте',rates.inks,[],{multi:true,ink:true})}</div>
    <details class="finishing"><summary>Дополнительная обработка ${icon('plus')}</summary><div class="finish-inside">${picker('cut','Дополнительная резка',rates.cuts,'1')}<div class="ink-fields">${picker('fold','Фальцовка',rates.folds,'0')}${picker('crease','Биговка',rates.creases,'0')}</div></div></details>
    <p class="calc-note" id="cut-note"></p><p id="calc-warning" class="notice" aria-live="polite" hidden></p>
   </form></div><aside class="proof-column" aria-label="Проба печати и стоимость">${proof('./')}
    <section class="quote" aria-label="Оценка тиража"><div class="quote-top"><span class="kicker">${icon('sheet')} Ваш тираж</span><span id="quote-format">А5 · 1 000 шт.</span></div>
    <div class="quote-price" id="quote-total" aria-live="polite">1 060 ₽</div><p class="unit" id="quote-unit">1,06 ₽ за экземпляр</p><p id="price-message" class="price-message" hidden></p>
    <button type="button" class="btn primary" data-prepare>Подготовить письмо ${arrow()}</button>
    <button type="button" class="copy-link" data-copy>${icon('copy')} Скопировать расчёт</button><p class="quote-note">Откроется черновик. Письмо отправляете вы.</p><p class="copy-status" role="status"></p></section>
   </aside></div>
   <div class="mini-total" id="mini-total" hidden><div class="wrap"><div><b id="mini-price">1 060 ₽</b><span id="mini-unit">1,06 ₽ за экземпляр</span></div><button type="button" class="btn primary" data-prepare>Черновик письма ${arrow()}</button></div></div>
   <section class="wrap samples"><div class="section-heading"><div><p class="kicker">${icon('sheet')} Каталог изделий</p><h2>Что печатаем</h2></div><a href="./catalog/" class="section-link">Весь каталог ${arrow()}</a></div><div class="sample-grid">${cards}</div></section>
   ${game()}<section class="wrap home-guides"><h2>Перед печатью</h2><div class="guide-links">${[['risography','О ризографии','Бумага, краски и ограничения способа печати.'],['artwork','Требования к макету','Подготовка оригинала и файлов к печати.'],['order','Как сделать заказ','От письма с макетом до получения тиража.']].map(([id,title,txt])=>`<a href="./${id}/"><span><strong>${title}</strong><small>${txt}</small></span>${arrow()}</a>`).join('')}</div></section>`;
}
