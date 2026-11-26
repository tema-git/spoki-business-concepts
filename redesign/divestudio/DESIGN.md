# Студия дайвинга в ФОК «Торпедо»

Демонстрационный сайт для новичка, который хочет оценить пробное погружение, подготовиться к бассейну и договориться с инструктором. Точка входа — `index.html`. Сайт работает с произвольным префиксом GitHub Pages. Внешние каналы принадлежат студии.

## Содержание и источники

Сверка выполнена 26 ноября 2026 года по московскому времени.

| Решение | Подтверждение |
| --- | --- |
| Discover Scuba Diving стоит 6 000 ₽ за человека, 2,5–3 часа на весь визит, около часа в бассейне. При одновременной оплате и прохождении от двух гостей в будни применяется скидка 10%. | [Прайс](https://divestudio.ru/price) · [Порядок пробного погружения и медицинская анкета](https://divestudio.ru/dsd) |
| В карточке две опубликованные границы возраста. У десятилетнего ребёнка участие уточняют у инструктора. | [Программа указывает «с 10 лет»](https://divestudio.ru/dsd) · [Прайс указывает «старше 10 лет»](https://divestudio.ru/price) |
| Часы старта DSD — в будни 19:00, в субботу 16:00, в воскресенье 12:00. Последний опубликованный набор Referral закончился 3 ноября. Гостю доступно пожелание по дате, подтверждение приходит от студии. | [Расписание](https://www.divestudio.ru/schedule) |
| Теория и бассейн OWD, затем отдельно четыре зачётных погружения в открытой воде. В Подмосковье аренда на экзамене включена, на море оплачивается отдельно. У детских курсов и поездок свои условия. Для расходящихся детских цен выбран общий прайс, действующий с 05.02.2026. | [Начальное обучение](https://divestudio.ru/start_owd) · [Детские программы](https://divestudio.ru/deti) · [Тарифы](https://divestudio.ru/price) |
| Подготовка, личные вещи и медицинская анкета основаны на программе. Вопросы об условиях занятий направлены инструктору, медицинское решение при отмеченном заболевании принимает врач. | [Памятка и FAQ студии](https://divestudio.ru/dsd) |
| У бассейновых Mermaid отдельная площадка у «Авиамоторной». Задания памятки ограничены программами в «Торпедо». | [Расписание и прайс школы русалок](https://divestudio.ru/mermaid#mermaidschedule) |
| Подход от метро, центральный вход, вендинговые автоматы, серая дверь, лестница на второй этаж. У карты и обычной маршрутной ссылки одна организация, 14735040652, с адресом Автозаводская, 21. | [Контакты студии](https://divestudio.ru/contacts) · [Путь к общему входу на фото магазина в том же здании](https://divers.ru/about/contacts/) · [Галерея самого ФОК](https://strel.ru/foktorpedo-swimmingpool/) · [Карточка Яндекса](https://yandex.ru/maps/org/studiya_dayvinga/14735040652/) |
| В форму вводят программу, число гостей и пожелание по времени. Черновик можно скопировать или передать личному контакту Натальи. | [Официальные контакты](https://divestudio.ru/contacts) · [Параметр черновика Telegram](https://core.telegram.org/api/links#public-username-links) |

## Графика и типографика

Тёмная вода за текстом переходит в документальный кадр с двумя дайверами. Внутри одного блока остаются цена, длительность, действие, содержимое, скидка и возраст. На телефоне фотография расположена после цены и действия. Контуры дорожки и граница света проходят по нижней части кадра. У памятки собственный рисунок маски и отражения на воде.

| Роль | Значение |
| --- | --- |
| Основной фон | `#f8f9f5`, светлая поверхность |
| Заголовки, основная навигация, тёмные кнопки | `#102e34` |
| Дополнительный текст | `#4d666a` на светлом |
| Поле первого погружения, подвал | `#063943`, `#07343e` |
| Главная кнопка на воде | `#abf3da` с тёмным текстом |
| Ссылки, интерактивные состояния | `#006b6b` |
| Панели и разделители | `#e4eeea`, `#c9d6d2` |
| Фокус, выделение текста | Фокус контуром. У выделения цвет букв бордовый на светлом, светло-жёлтый на тёмном. Фон прозрачный. |

Inter с кириллицей используется для интерфейса, цифр и названий. Курсив Playfair Display отмечает тему воды в крупных заголовках. Шрифты размещены локально рядом с лицензиями SIL OFL. Ширина контента до 1440 px. Боковое поле от 16 до 60 px. Фотографии программ имеют общий формат в пределах одной сетки, портреты квадратные. У панорамы входа сохранено исходное соотношение сторон. В шапке оригинальные силуэты и оригинальная надпись компании скомпонованы горизонтально.

| Источник оформления | Адаптация |
| --- | --- |
| [Refero, Pravah](https://styles.refero.design/style/30a8b128-a5bb-4d86-85eb-743b78091596) | Контраст крупных светлых и тёмных полей, интервалы между графическими деталями и текстом. Палитра, типографика и иллюстрация разработаны для бассейна. |
| [21st.dev, Spotlight Button](https://21st.dev/@waleedkibhen/components/spotlight-button) | Локальный отклик внутри неподвижной области действия. На сайте работает собственный CSS и JavaScript. |
| [MotionSites, сцена с прокруткой](https://motionsites.ai/lesson/build-scroll-animated-website-with-ai) | Положение отражения связано с естественным входом секции в экран. Текст и управление расположены отдельным слоем. |

## Интерактив

| Сцена | Действие гостя и результат | Касание, клавиатура, уменьшение движения |
| --- | --- | --- |
| Обложка и программы | Относительное положение указателя сдвигает блики и фотографию на несколько пикселей. Прокрутка меняет положение линий воды. | Все данные и ссылки видны постоянно. Порядок чтения сохраняется. |
| Маска и отражение | По мере появления панели рисунок маски и контуры отражения немного расходятся. В иллюстрации доступен тематический курсор. | На телефоне содержимое располагается вертикально. В системном режиме уменьшения движения рисунок статичен. |
| Закреплённая шапка | Вся плашка «Контакты», включая стрелку и текст, смещается на 4 × 3 px внутри постоянной области нажатия. Векторные стрелки поворачиваются вправо при наведении или фокусе. | Кнопка остаётся видимой. Меню использует HTML dialog, возвращает фокус и закрывается Escape. При уменьшении движения плашка неподвижна. |
| Памятка | Программа и число гостей формируют четыре раздела. Копирование переносит полный текст, изменение выбора повторяет сценарий и обновляет ссылку на обращение. | Настоящие поля и кнопки. На телефоне результат тоже доступен целиком. |
| Согласование времени | Введённая дата определяет будний или выходной день. Скидка доступна при двух и более гостях в будни и явном выборе совместной оплаты и прохождения. Перед переходом показан полный текст обращения. | Встроенная валидация полей, понятный обратный переход, ссылка Telegram с текстом, запасные WhatsApp, почта и копирование. Параметры выбора находятся в URL текущей страницы. |
| Маршрут | Интерактивная карта и обычные ссылки на организацию и построение маршрута. | Даже при недоступности виджета остаются адрес, фотографии, ориентиры и телефоны. |

Второй вариант механики — «Найди вход». Гость узнаёт на настоящих фотографиях здание и центральную дверь, затем сверяет путь до офиса по описанию студии. Для опубликованной версии выбран основной сценарий памятки.

## Карта переходов

Оригинал проверен в мобильном Chrome при 390 × 844. Из нижнего меню открыты все восемь разделов. В новых страницах есть постоянное меню, прямые адреса, возврат к выбору программы и ссылки на полные материалы школы. У записей архива локальный адрес ведёт к анонсу, кнопка чтения открывает публикацию автора. Устаревший адрес учебного раздела заменён базовым курсом, прежний неработающий материал о сайдмаунте — анонсом в архиве.

| Пункт оригинала | Источник | В демо |
| --- | --- | --- |
| О нас | [Оригинал](https://divestudio.ru/o_nas) | [instructors.html](instructors.html) |
| Русалки | [Оригинал](https://divestudio.ru/mermaid) | [mermaid.html](mermaid.html) |
| Курсы и цены | [Оригинал](https://divestudio.ru/price) | [prices.html](prices.html) |
| Расписание | [Оригинал](https://divestudio.ru/schedule) | [schedule.html](schedule.html) |
| Дайв-туры | [Оригинал](https://divestudio.ru/travel) | [travel.html](travel.html) |
| Новости | [Оригинал](https://divestudio.ru/news) | [news.html](news.html) |
| Контакты | [Оригинал](https://divestudio.ru/contacts) | [contacts.html](contacts.html) |
| Блог | [Оригинал](https://divestudio.ru/blog) | [blog.html](blog.html) |
| Главная | [Оригинал](https://divestudio.ru/) | [index.html](index.html) |
| Пробное погружение | [Оригинал](https://divestudio.ru/dsd) | [trial.html](trial.html) |
| Базовый курс | [Оригинал](https://divestudio.ru/start_owd) | [basic.html](basic.html) |
| Экзамен | [Оригинал](https://divestudio.ru/start_owd/#ow_opisanie) | [basic.html#open-water](basic.html#open-water) |
| Дети | [Оригинал](https://divestudio.ru/deti) | [kids.html](kids.html) |
| Подарочный сертификат | [Оригинал](https://divestudio.ru/gift) | [gift.html](gift.html) |
| Форма начального курса | [Оригинал](https://divestudio.ru/#popup:owdref) | [contacts.html?program=referral#request](contacts.html?program=referral#request) |
| Первый визит | [Оригинал](https://divestudio.ru/contacts) | [visit.html#route](visit.html#route) |
| Карта | [Оригинал](https://divestudio.ru/contacts) | [contacts.html#map](contacts.html#map) |
| Форма русалок | [Оригинал](https://divestudio.ru/mermaid_form) | [contacts.html?program=mermaid#request](contacts.html?program=mermaid#request) |
| Знакомство с бассейном | [Оригинал](https://divestudio.ru/education) | [basic.html#pool](basic.html#pool) |
| Согласовать из прайса | [Оригинал](https://divestudio.ru/price#rec640160436) | [contacts.html#request](contacts.html#request) |
| Школа русалок из прайса | [Оригинал](https://divestudio.ru/price#pricemermaid) | [mermaid.html#pricemermaid](mermaid.html#pricemermaid) |
| Пробное занятие | [Оригинал](https://divestudio.ru/price#dsdprice) | [prices.html#dsdprice](prices.html#dsdprice) |
| Начальный курс | [Оригинал](https://divestudio.ru/price#owdprice) | [prices.html#owdprice](prices.html#owdprice) |
| Детские программы | [Оригинал](https://divestudio.ru/price#detiprice) | [prices.html#detiprice](prices.html#detiprice) |
| Возвращение к занятиям | [Оригинал](https://divestudio.ru/price#reviewprice) | [prices.html#reviewprice](prices.html#reviewprice) |
| Продвинутый курс | [Оригинал](https://divestudio.ru/price#aowdprice) | [prices.html#aowdprice](prices.html#aowdprice) |
| Первая помощь | [Оригинал](https://divestudio.ru/price#efrprice) | [prices.html#efrprice](prices.html#efrprice) |
| Rescue Diver | [Оригинал](https://divestudio.ru/price#rescueprice) | [prices.html#rescueprice](prices.html#rescueprice) |
| Профессиональные курсы | [Оригинал](https://divestudio.ru/price#profiprice) | [prices.html#profiprice](prices.html#profiprice) |
| Специализации | [Оригинал](https://divestudio.ru/price#specprice) | [prices.html#specprice](prices.html#specprice) |
| Охрана водоёмов | [Оригинал](https://divestudio.ru/price#awareprice) | [prices.html#awareprice](prices.html#awareprice) |
| Все цены школы русалок | [Оригинал](https://divestudio.ru/mermaid#pricemermaid) | [mermaid.html#pricemermaid](mermaid.html#pricemermaid) |
| Discover, Basic, Mermaid | [Оригинал](https://divestudio.ru/mermaid#rec395135129) | [mermaid.html#rec395135129](mermaid.html#rec395135129) |
| Upgrade, Advanced, регулярные тренировки | [Оригинал](https://divestudio.ru/mermaid#rec395151412) | [mermaid.html#rec395151412](mermaid.html#rec395151412) |
| Место, сеансы и условия занятий | [Оригинал](https://divestudio.ru/mermaid#mermaidschedule) | [mermaid.html#mermaidschedule](mermaid.html#mermaidschedule) |
| Advanced Open Water Diver | [Оригинал](https://divestudio.ru/aowd) | [education.html#aowd](education.html#aowd) |
| Emergency First Response | [Оригинал](https://divestudio.ru/efr) | [education.html#efr](education.html#efr) |
| Rescue Diver | [Оригинал](https://divestudio.ru/rescue) | [education.html#rescue](education.html#rescue) |
| Divemaster | [Оригинал](https://divestudio.ru/dm) | [education.html#dm](education.html#dm) |
| DSD Leader | [Оригинал](https://divestudio.ru/dsd_leader) | [education.html#dsd_leader](education.html#dsd_leader) |
| Assistant Instructor | [Оригинал](https://divestudio.ru/assistant) | [education.html#assistant](education.html#assistant) |
| Emergency First Response Instructor | [Оригинал](https://divestudio.ru/efri) | [education.html#efri](education.html#efri) |
| Dive Against Debris | [Оригинал](https://divestudio.ru/dad) | [education.html#dad](education.html#dad) |
| Shark Conservation | [Оригинал](https://divestudio.ru/shark_conservation) | [education.html#shark_conservation](education.html#shark_conservation) |
| Coral Reef Conservation | [Оригинал](https://divestudio.ru/coral_reef) | [education.html#coral_reef](education.html#coral_reef) |
| Dry Suit Diver | [Оригинал](https://divestudio.ru/drysuit) | [education.html#drysuit](education.html#drysuit) |
| Enriched Air Diver | [Оригинал](https://divestudio.ru/eanx) | [education.html#eanx](education.html#eanx) |
| Обучение PADI eLearning | [Оригинал](https://divestudio.ru/elearning) | [education.html#elearning](education.html#elearning) |
| Дахаб, Египет | [Оригинал](https://divestudio.ru/dahab_aug_2026) | [travel.html#dahab](travel.html#dahab) |
| Остров Миндоро, Филиппины | [Оригинал](https://divestudio.ru/fily2026) | [travel.html#mindoro](travel.html#mindoro) |
| Давайте знакомиться! | [Оригинал](https://divestudio.ru/blog/tpost/pj3kmepe21-davaite-znakomitsya) | [blog.html#pj3kmepe21](blog.html#pj3kmepe21) |
| Чем дышат дайверы? | [Оригинал](https://divestudio.ru/blog/tpost/4fs1a4h8h1-chem-dishat-daiveri) | [blog.html#4fs1a4h8h1](blog.html#4fs1a4h8h1) |
| Океан, который изменил мою жизнь... | [Оригинал](https://divestudio.ru/blog/tpost/j0t1dzman1-okean-kotorii-izmenil-moyu-zhizn) | [blog.html#j0t1dzman1](blog.html#j0t1dzman1) |
| Про манту на день рождения. | [Оригинал](https://divestudio.ru/blog/tpost/600z49lp71-pro-mantu-na-den-rozhdeniya) | [blog.html#600z49lp71](blog.html#600z49lp71) |
| Где и как можно погружаться с сертификатом. | [Оригинал](https://divestudio.ru/blog/tpost/rt04uxcu01-gde-i-kak-mozhno-pogruzhatsya-s-sertifik) | [blog.html#rt04uxcu01](blog.html#rt04uxcu01) |
| Филиппины 2019. 5 серия. Фроги | [Оригинал](https://divestudio.ru/blog/tpost/kem0xfyux1-filippini-2019-5-seriya-frogi) | [blog.html#kem0xfyux1](blog.html#kem0xfyux1) |
| Филиппины 2019. 4 серия. День 3 - электрический | [Оригинал](https://divestudio.ru/blog/tpost/led3r0ytv1-filippini-2019-4-seriya-den-3-elektriche) | [blog.html#led3r0ytv1](blog.html#led3r0ytv1) |
| Филиппины 2019. 3 серия. Под водой. | [Оригинал](https://divestudio.ru/blog/tpost/hdbpvepzk1-filippini-2019-3-seriya-pod-vodoi) | [blog.html#hdbpvepzk1](blog.html#hdbpvepzk1) |
| Филиппины 2019. 2 серия. Вулкан | [Оригинал](https://divestudio.ru/blog/tpost/pe4bljy9d1-filippini-2019-2-seriya-vulkan) | [blog.html#pe4bljy9d1](blog.html#pe4bljy9d1) |
| Про Филиппины. 1 серия. Путь | [Оригинал](https://divestudio.ru/blog/tpost/jdvaz46ku1-pro-filippini-1-seriya-put) | [blog.html#jdvaz46ku1](blog.html#jdvaz46ku1) |
| Студия дайвинга на выставке Moscow Dive Show - 2025 | [Оригинал](https://divestudio.ru/blog/tpost/bmykii5sb1-studiya-daivinga-na-vistavke-moscow-dive) | [blog.html#bmykii5sb1](blog.html#bmykii5sb1) |
| Эпичное ночное погружение | [Оригинал](https://divestudio.ru/blog/tpost/sdh68died1-epichnoe-nochnoe-pogruzhenie) | [blog.html#sdh68died1](blog.html#sdh68died1) |
| Перепись акул и скатов | [Оригинал](https://divestudio.ru/gensus_pioner) | [news.html#gensus_pioner](news.html#gensus_pioner) |
| Программа «PROдвижение» | [Оригинал](https://divestudio.ru/pro_dvizenie) | [news.html#pro_dvizenie](news.html#pro_dvizenie) |
| День зелёных ласт 2026 | [Оригинал](https://divestudio.ru/gfday2026) | [news.html#gfday2026](news.html#gfday2026) |
| Итоги недели PADI AWARE 2026 | [Оригинал](https://divestudio.ru/awareweek2026) | [news.html#awareweek2026](news.html#awareweek2026) |
| Неделя PADI AWARE | [Оригинал](https://divestudio.ru/awareweek) | [news.html#awareweek](news.html#awareweek) |
| День женщин-дайверов 2026 | [Оригинал](https://divestudio.ru/women_day_2026) | [news.html#women_day_2026](news.html#women_day_2026) |
| Уборка Щёлковского карьера | [Оригинал](https://divestudio.ru/dov2026) | [news.html#dov2026](news.html#dov2026) |
| Выпуск Divemaster 2026 | [Оригинал](https://divestudio.ru/dm_2026) | [news.html#dm_2026](news.html#dm_2026) |
| Встреча PADI GO PRO | [Оригинал](https://divestudio.ru/gopro_may2026) | [news.html#gopro_may2026](news.html#gopro_may2026) |
| Шесть наград PADI Elite Instructor | [Оригинал](https://divestudio.ru/elit2026) | [news.html#elit2026](news.html#elit2026) |
| Как стать профессиональным дайвером | [Оригинал](https://divestudio.ru/gopronight) | [news.html#gopronight](news.html#gopronight) |
| Выпуск Divemaster 2025 | [Оригинал](https://divestudio.ru/profi2025) | [news.html#profi2025](news.html#profi2025) |
| Пять звёзд PADI | [Оригинал](https://divestudio.ru/fivestar) | [news.html#fivestar](news.html#fivestar) |
| Квалификация Master Instructor | [Оригинал](https://divestudio.ru/mi) | [news.html#mi](news.html#mi) |
| День женщин-дайверов 2025 | [Оригинал](https://divestudio.ru/women_day_2025) | [news.html#women_day_2025](news.html#women_day_2025) |
| Уборка водоёмов в 2025 году | [Оригинал](https://divestudio.ru/dov2025) | [news.html#dov2025](news.html#dov2025) |
| Награда PADI Elite Instructor | [Оригинал](https://divestudio.ru/elit2024) | [news.html#elit2024](news.html#elit2024) |
| Вклад в развитие дайвинга в России | [Оригинал](https://divestudio.ru/nagradapadi) | [news.html#nagradapadi](news.html#nagradapadi) |
| Уборка водоёмов в 2024 году | [Оригинал](https://divestudio.ru/dov2024) | [news.html#dov2024](news.html#dov2024) |
| Четыре награды Elite Instructor | [Оригинал](https://divestudio.ru/elit2023) | [news.html#elit2023](news.html#elit2023) |
| Подводная ёлка 2024 | [Оригинал](https://divestudio.ru/ny2024) | [news.html#ny2024](news.html#ny2024) |
| Moscow Dive Show 2024 | [Оригинал](https://divestudio.ru/mds2024) | [news.html#mds2024](news.html#mds2024) |
| Уборка водоёмов в 2023 году | [Оригинал](https://divestudio.ru/dov2023) | [news.html#dov2023](news.html#dov2023) |
| Вечер с PADI | [Оригинал](https://divestudio.ru/padievent) | [news.html#padievent](news.html#padievent) |
| PADI Elite Instructor | [Оригинал](https://divestudio.ru/elite2022) | [news.html#elite2022](news.html#elite2022) |
| Подводный Новый год 2023 | [Оригинал](https://divestudio.ru/newyaer2023) | [news.html#newyaer2023](news.html#newyaer2023) |
| Награды инструкторов | [Оригинал](https://divestudio.ru/diplom) | [news.html#diplom](news.html#diplom) |
| Ещё один вечер с PADI | [Оригинал](https://divestudio.ru/padi_evening_2) | [news.html#padi_evening_2](news.html#padi_evening_2) |
| Неделя AWARE 2022 | [Оригинал](https://divestudio.ru/awareweek2022) | [news.html#awareweek2022](news.html#awareweek2022) |
| Уборка водоёмов в 2022 году | [Оригинал](https://divestudio.ru/dov2022) | [news.html#dov2022](news.html#dov2022) |
| Майский вечер с PADI | [Оригинал](https://divestudio.ru/event) | [news.html#event](news.html#event) |
| Открытая вода летом | [Оригинал](https://divestudio.ru/ow_leto) | [news.html#ow_leto](news.html#ow_leto) |
| Награда инструктору PADI | [Оригинал](https://divestudio.ru/elite) | [news.html#elite](news.html#elite) |
| Где читать новости школы | [Оригинал](https://divestudio.ru/kanal_vk) | [news.html#kanal_vk](news.html#kanal_vk) |
| Moscow Dive Show 2022 | [Оригинал](https://divestudio.ru/mds2022) | [news.html#mds2022](news.html#mds2022) |
| Первые погружения выпускников | [Оригинал](https://divestudio.ru/dsd_feb) | [news.html#dsd_feb](news.html#dsd_feb) |
| Лето клуба в Подмосковье | [Оригинал](https://divestudio.ru/leto2021) | [news.html#leto2021](news.html#leto2021) |
| Баренцево море и Лиинахамари | [Оригинал](https://divestudio.ru/sever_foto) | [news.html#sever_foto](news.html#sever_foto) |
| Уборка водоёмов в 2021 году | [Оригинал](https://divestudio.ru/dov) | [news.html#dov](news.html#dov) |
| Дахаб, март 2021 | [Оригинал](https://divestudio.ru/dahabtrip) | [news.html#dahabtrip](news.html#dahabtrip) |
| Мастер-класс по сайдмаунту | [Оригинал](https://divestudio.ru/news#rec282940392) | [news.html#mk_sidemount](news.html#mk_sidemount) |
| Студия получила статус дайв-центра PADI | [Оригинал](https://divestudio.ru/divecenter_start) | [news.html#divecenter_start](news.html#divecenter_start) |
| Памятка первого визита | [Оригинал](https://divestudio.ru/dsd) | [visit.html#memo](visit.html#memo) |

Официальную политику открывает ссылка в подвале. [Политика студии](https://divestudio.ru/policy)

## Внешние сервисы

- [Telegram инструктора](https://t.me/nat_semenkova)
- [WhatsApp студии](https://wa.me/79264944673)
- [Почта](mailto:info@divestudio.ru)
- [Позвонить](tel:+79264944673)
- [Позвонить по второму номеру](tel:+79772503063)
- [Сообщения сообщества ВКонтакте](https://vk.me/divestudio)
- [Профиль MAX](https://max.ru/u/f9LHodD0cOLCZeNWcpcryU-Lo6s-hfCznBtW5gsGmZ75dPzFkLzU-Z7dkYg)
- [Viber](viber://chat?number=%2B79264944673)
- [Telegram-канал школы](https://t.me/divestudio_diving)
- [Сообщество школы ВКонтакте](https://vk.com/divestudio)
- [Чат школы в MAX](https://max.ru/join/41vNyJBXXynH-Q-hOKbuDLNTFVbB3yJYWpZMNX055Rs)
- [Telegram школы русалок](https://t.me/mermaid_studio)
- [ВКонтакте школы русалок](https://vk.com/club213552659)

Онлайн-материалы приобретают и активируют через направление PADI eLearning, указанное школой. Встроенный Яндекс-виджет использует официальную организацию, а студийная метка на прежней странице имеет координаты 55.70301, 37.65165. [PADI eLearning у студии](https://divestudio.ru/elearning) · [Виджет карты](https://yandex.ru/map-widget/v1/?oid=14735040652&ol=biz&z=17)

## Фотографии и фирменный знак

- `hero-dive.webp` — Двое в снаряжении под водой в бассейне. На переднем плане участник пробного погружения. [Страница](https://divestudio.ru/dsd) · [Исходное изображение](https://static.tildacdn.com/tild3432-3634-4439-b339-353464316335/noroot.png)
- `pool-underwater.webp` — Два дайвера плывут вдоль размеченного дна бассейна. [Страница](https://divestudio.ru/contacts) · [Исходное изображение](https://static.tildacdn.com/tild3561-6563-4334-a237-316431623238/P5220058.JPG)
- `kids.webp` — Юный дайвер с синей игрушкой показывает под водой знак рукой. [Страница](https://divestudio.ru/deti) · [Исходное изображение](https://static.tildacdn.com/tild3234-6436-4365-a439-636135613431/P4250044.JPG)
- `course-pool.webp` — Дайвер в горизонтальном положении на занятии в бассейне. [Страница](https://divestudio.ru/schedule) · [Исходное изображение](https://static.tildacdn.com/tild6532-3765-4864-a662-646439336538/P5311810.JPG)
- `open-water.webp` — Группа в снаряжении входит в море с берега. [Страница](https://divestudio.ru/start_owd) · [Исходное изображение](https://static.tildacdn.com/tild6466-3463-4136-b566-366630383031/p8rhzg_c.jpeg)
- `natalia.webp` — Наталья Семенкова, соосновательница студии и Master Instructor PADI №257099. [Страница](https://divestudio.ru/o_nas) · [Исходное изображение](https://static.tildacdn.com/tild3238-3338-4865-b661-316466633333/IMG_20201024_183316_.jpg)
- `yuri.webp` — Юрий Корольков, сооснователь и IDC Staff Instructor PADI №650716. [Страница](https://divestudio.ru/o_nas) · [Исходное изображение](https://static.tildacdn.com/tild6265-3663-4562-a431-623635636337/noroot.png)
- `mermaid.webp` — Участница в моноласте плывёт под поверхностью бассейна на фотографии курса Basic Mermaid PADI. [Страница](https://divestudio.ru/mermaid) · [Исходное изображение](https://static.tildacdn.com/tild6535-3731-4433-a462-306538623362/11111111111111111111.JPG)
- `pool-hall.webp` — Большая чаша ФОК «Торпедо Автозаводский», вид со стороны трибун. [Страница](https://strel.ru/foktorpedo-swimmingpool/) · [Исходное изображение](https://strel.ru/wp-content/uploads/2024/10/2-.jpg)
- `entrance.webp` — Здание бассейна ФОК «Торпедо Автозаводский» на Автозаводской улице, 21. [Страница](https://strel.ru/foktorpedo-swimmingpool/) · [Исходное изображение](https://strel.ru/wp-content/uploads/2024/10/DSC09470.jpg)
- `entrance-sign.webp` — Главный вход в ФОК. Над дверями зелёная вывеска, слева панно с ватерполистом. [Страница](https://strel.ru/foktorpedo-swimmingpool/) · [Исходное изображение](https://strel.ru/wp-content/uploads/2024/10/pool_top_025.jpg)
- `studio-logo.webp` — Полный оригинальный знак с надписью на русском. На исходном белом фоне видны обе фигуры и голубой водный штрих. [Страница](https://divestudio.ru/) · [Исходное изображение](https://static.tildacdn.com/tild6363-3865-4163-b164-336236643666/_2.jpg)
- `studio-mark.png` — Фрагмент оригинального знака для компактной шапки: русалка и дайвер с ластами. [Страница](https://divestudio.ru/) · [Исходное изображение](https://static.tildacdn.com/tild6363-3865-4163-b164-336236643666/_2.jpg)
