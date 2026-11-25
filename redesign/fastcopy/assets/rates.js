/* Тарифы калькулятора ризографии fastcopy.ru, проверены 26.11.2026.
   Денежные расчёты выполняются в копейках. */
(() => {
  'use strict';

  const formats = [
    { id: 'A5', label: 'А5', size: '148,5 × 210 мм', perSheet: 2 },
    { id: 'A4', label: 'А4', size: '210 × 297 мм', perSheet: 1 },
    { id: 'A3', label: 'А3', size: '297 × 420 мм', perSheet: 1 },
    { id: 'A6', label: 'А6', size: '105 × 148,5 мм', perSheet: 4 },
    { id: 'euro', label: 'Евро', size: '99 × 210 мм', perSheet: 3 },
    { id: 'card', label: 'Визитка', size: '50 × 90 мм', perSheet: 12 }
  ];

  const papers = [
    { id: '0', label: 'Белая 65 г/м², Россия', price: 97 },
    { id: '1', label: 'Белая 80 г/м², класс С', price: 129 },
    { id: '2', label: 'Слоновая кость 80 г/м², Светокопи ЭКО', price: 96 },
    { id: '12', label: 'Цветная 80 г/м², Россия', price: 616, colorStock: true },
    { id: '13', label: 'Цветная 80 г/м², импорт', price: 742, colorStock: true },
    { id: '15', label: 'Цветная НЕОН 70 г/м²', price: 647, frontOnly: true, colorStock: true },
    { id: '14', label: 'Цветная 80 г/м², распродажа', price: 308 },
    { id: '7', label: 'Крафт 78 г/м²', price: 450, frontOnly: true },
    { id: '3', label: 'Белая 80 г/м², класс А', price: 238 },
    { id: '4', label: 'Белая 120 г/м²', price: 510, thick: true },
    { id: '16', label: 'Цветная 160 г/м²', price: 1355, thick: true, colorStock: true },
    { id: '5', label: 'Белая 160 г/м²', price: 740, thick: true },
    { id: '6', label: 'Белая 200 г/м²', price: 1070, thick: true },
    { id: '11', label: 'Белая самоклейка 80 г/м²', price: 2600, thick: true, frontOnly: true },
    { id: '8', label: 'Бракованная 80 г/м²', price: 90, frontOnly: true },
    { id: '9', label: 'Бумага заказчика', price: 22 },
    { id: '10', label: 'Белая в клетку 80 г/м²', price: 190 }
  ];

  const inks = [
    { id: 'black', label: 'Чёрная', hex: '#272727' },
    { id: 'blue', label: 'Синяя', hex: '#1c4ba4' },
    { id: 'green', label: 'Зелёная', hex: '#008044' },
    { id: 'red', label: 'Красная', hex: '#cc352c' },
    { id: 'brown', label: 'Коричневая', hex: '#825333' },
    { id: 'violet', label: 'Фиолетовая', hex: '#70409d' },
    { id: 'burgundy', label: 'Бургундия', hex: '#852440' },
    { id: 'emerald', label: 'Изумрудная', hex: '#00877b' }
  ];
  const cuts = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30]
    .map(count => {
      const suffix = new Intl.PluralRules('ru').select(count);
      const parts = { one: 'часть', few: 'части', many: 'частей' };
      return { id: String(count), label: count === 1 ? 'Без дополнительной резки' : 'На ' + count + ' ' + parts[suffix] };
    });
  const folds = [
    { id: '0', label: 'Без фальцовки' },
    { id: '2', label: 'Сгиб вдвое' },
    { id: '3', label: 'Сгиб втрое' }
  ];
  const creases = [
    { id: '0', label: 'Без биговки' },
    { id: '1', label: 'Один биг' },
    { id: '2', label: 'Два бига' }
  ];
  const defaults = {
    format: 'A5', quantity: '1000', paper: '1',
    front: ['black'], back: [], cut: '1', fold: '0', crease: '0'
  };

  const runBreaks = [100, 200, 300, 400, 500, 1000, 2000, 5000, 10000];
  const blackPrices = [200, 135, 105, 90, 75, 60, 50, 45, 40];
  const colorPrices = [335, 230, 180, 145, 125, 100, 85, 75, 70];

  function inkPrice(sheets, prices) {
    if (sheets < runBreaks[0]) return runBreaks[0] * prices[0] / sheets;
    const upper = runBreaks.findIndex(breakpoint => sheets < breakpoint);
    if (upper < 0) return prices[prices.length - 1];
    const lower = upper - 1;
    return prices[lower] - (prices[lower] - prices[upper])
      * (sheets - runBreaks[lower]) / (runBreaks[upper] - runBreaks[lower]);
  }

  function unavailable(status, message) {
    return { status, total: null, unit: null, pieces: null, message, warnings: [] };
  }

  function calculate(state = {}) {
    const quantityText = String(state.quantity ?? '').trim();
    if (!quantityText) return unavailable('invalid', 'Введите тираж одного макета.');
    // Accept whole quantities with normal Russian thousands-group separators.
    if (!/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)$/.test(quantityText)) {
      return unavailable('invalid', 'Укажите тираж целым положительным числом, например 1000.');
    }
    const quantity = Number(quantityText.replace(/[ \u00a0\u202f]/g, ''));
    if (quantity === 0) return unavailable('invalid', 'Тираж должен быть не меньше одного экземпляра.');
    if (!Number.isSafeInteger(quantity)) return unavailable('manager', 'Такой тираж рассчитает менеджер.');

    const format = formats.find(item => item.id === state.format);
    const paper = papers.find(item => item.id === String(state.paper));
    const cut = cuts.find(item => item.id === String(state.cut));
    const fold = folds.find(item => item.id === String(state.fold));
    const crease = creases.find(item => item.id === String(state.crease));
    if (!format || !paper || !cut || !fold || !crease) {
      return unavailable('manager', 'Для этого формата, материала или обработки нужен расчёт менеджера.');
    }
    if (!Array.isArray(state.front) || !Array.isArray(state.back)) {
      return unavailable('invalid', 'Выберите краски для лица и оборота.');
    }
    const front = [...new Set(state.front)];
    const back = [...new Set(state.back)];
    const colors = [...front, ...back];
    if (colors.some(id => !inks.some(ink => ink.id === id))) {
      return unavailable('manager', 'Менеджер подберёт способ печати для выбранной краски.');
    }
    if (format.id === 'A3' && (colors.includes('burgundy') || colors.includes('emerald'))) {
      return unavailable('manager', 'На А3 недоступны бургундия и изумрудная краска. Выберите другую краску или обсудите формат с менеджером.');
    }
    if (paper.frontOnly && back.length) {
      return unavailable('manager', 'На этой бумаге печатают только с лицевой стороны. Уберите краску с оборота или выберите другую бумагу.');
    }

    const sheets = Math.ceil(quantity / format.perSheet);
    const sheetArea = format.id === 'A3' ? 2 : 1;
    const blackSides = colors.filter(id => id === 'black').length;
    const colorPasses = colors.length - blackSides;
    const printing = Math.round((blackSides * inkPrice(sheets, blackPrices) + colorPasses * inkPrice(sheets, colorPrices)) * sheets * sheetArea);
    const paperCost = paper.price * sheets * sheetArea;
    const parts = Number(cut.id);
    const baseCuts = format.perSheet - 1 + (format.id === 'card' ? 4 : 0);
    const cutWeight = paper.thick ? 2 : 1;
    // The press charges a minimum cutting run, even for partially filled sheets.
    const cutOperations = sheets <= 300 / cutWeight
      ? 300 * ((parts - 1) * format.perSheet + baseCuts)
      : ((parts - 1) * quantity + baseCuts * sheets) * cutWeight;
    const cutting = 8 * cutOperations;
    const pieces = quantity * parts;
    const folding = fold.id === '0' ? 0 : 70 * pieces + 22000;
    const creasing = Number(crease.id) * (320 * pieces + 22000);
    const totalCents = printing + paperCost + cutting + folding + creasing;
    if (!Number.isSafeInteger(totalCents) || !Number.isSafeInteger(pieces)) {
      return unavailable('manager', 'Такой тираж рассчитает менеджер.');
    }

    const warnings = [];
    if (front.length > 1 || back.length > 1) warnings.push('У совмещения красок допуск 2–3 мм. Макет с несколькими красками на одной стороне стоит согласовать с менеджером.');
    if (format.perSheet > 1 && parts > 1) warnings.push('Резка до выбранного формата уже включена. Дополнительная резка делит каждый экземпляр ещё раз.');
    if (paper.colorStock) warnings.push('Типография обычно держит до 1000 листов каждого цвета. Под заказ закупка занимает 1–2 дня после оплаты.');
    if (paper.id === '9') warnings.push('Для своей бумаги уточните марку у менеджера. Типография принимает плотность 80–210 г/м².');
    if (paper.id === '0' && back.length) warnings.push('Бумага 65 г/м² тонкая. Для двусторонней печати типография рекомендует более плотную.');
    if (!colors.length) warnings.push('Краски сняты с обеих сторон. В оценку вошли бумага и выбранная обработка.');
    if (sheets < 30) warnings.push('При таком тираже стоит также уточнить цену чёрно-белого копирования.');
    else if (sheets < 100) warnings.push('Для ризографии выгоднее тираж от ' + (100 * format.perSheet) + ' экземпляров этого формата.');
    return {
      status: 'ok', total: totalCents / 100, unit: Math.round(totalCents / pieces) / 100,
      pieces, message: '', warnings
    };
  }
  globalThis.FastcopyRates = { formats, papers, inks, cuts, folds, creases, defaults, calculate };
})();
