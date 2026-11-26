# Булгаковский Дом. Вечерняя афиша

Зритель выбирает свободный вечер с телефона и открывает кассу на точных дате и времени. Обложка программы показывает ближайший доступный сеанс, общий список начинается с первых сеансов всех типов. Дата и жанр переключают обе части афиши. Выпуск охватывает 26 ноября — 6 декабря 2026 года и содержит архивную встречу 25 ноября. Часы — московские.

## Визуальная система

| Роль | Решение |
| --- | --- |
| Бумага и набор | Тёплая бумага #f7f3e9, заголовки и основной текст #202b2a, вторичный текст #595c53. Тонкие разделители #cdc8b6 задают ритм программки. |
| Вечерний двор | Фон #17292d, светлый набор #f8efd9. Сине-зелёные и графитовые фасады, гравированные линии, силуэт кота, свет фонаря и нескольких окон. |
| Билет и фокус | Медово-золотой #edc681 для важного действия и даты на тёмной поверхности. На бумаге акцент #795329. Видимый контур фокуса. |
| Типографика | Локальные Cormorant Garamond и Inter с кириллицей и лицензиями OFL. Курсив выделяет второе слово в заголовке. Даты и время имеют табличные цифры. |
| Полоса | Поле до 1280 px. На телефоне боковые поля 16 px и закреплённая шапка 63 px. Текст, фотография и иллюстрация имеют свои области. |
| Документальные материалы | Свободное поле вертикальных плакатов сохраняет весь оригинал. Сценические фотографии, экскурсии и портреты образуют отдельные серии. Тёмная и светлая версии марки используют рисунок музея. |

Композиционный ориентир — масштаб фотографии, поля и тонкие линейки в системе Adam Lippes. [Refero](https://styles.refero.design/style/cdc4a162-cefa-49a1-81e7-4857e421ae24)

Для наведения взят принцип ограниченного светового отклика внутри устойчивой цели. Реализация на обычных элементах HTML и CSS. [Spotlight Button, 21st.dev](https://21st.dev/@waleedkibhen/components/spotlight-button)

Положение секции управляет светом во дворе. У рисунка только несколько меняющихся значений, весь текст остаётся в потоке документа. [Пример связи прокрутки и сцены, MotionSites](https://motionsites.ai/lesson/build-scroll-animated-website-with-ai)

## Интерактив

| Место | Действие и результат | Касание, клавиатура и уменьшение движения |
| --- | --- | --- |
| Шапка | Вся плашка «Контакты» смещается с надписью и стрелкой внутри неподвижной ссылки. Меню открывает модальное окно с разделами. | Нажатие ведёт к контактам. Диалог удерживает фокус, Escape возвращает его на кнопку. В режиме reduced motion плашка остаётся на месте. |
| Афиша | Жанр и дата входят в URL. Дата и время спектакля или экскурсии сохраняются в ссылке на страницу постановки и в идентификаторе сеанса кассы. | Даты выбираются обычными ссылками. Escape закрывает выбор. Пустая выборка ведёт в официальный календарь. |
| Иллюстрация и каталоги | От положения секции зависит яркость окон, от положения указателя — свет и сдвиг обложки до трёх пикселей. Карточки и строки подсвечивают фотографию, заголовок или фон при наведении и фокусе. | Все переходы доступны без наведения. Системное уменьшение движения сохраняет статичный двор и полную функциональность. |
| Сеансы | Прошедшее время проверяется по Москве. Отдельно показаны свободный вход, завершение и отсутствие билетов. Платный сеанс ведёт на экран конкретного показа. Общий музейный билет на месяц указывает период и порядок сбора группы. | Выбранный сеанс передаётся в URL. Для возврата через игру контекст хранится только в текущей вкладке. |
| Найди Бегемота | Шесть окон, силуэт кота и текстовая подсказка. Неверное окно темнеет, найденный кот появляется в освещённом окне. Повтор меняет положение кота. | Окна — отдельные кнопки с именами. Результат объявляет live region. Можно вернуться к выбранному сеансу. |
| Контакты | Метка Яндекса относится к организации 86697905323. У экскурсии в карточке собственное место сбора. Форма готовит ссылку на почтовый черновик. | До ввода видно, что отправляет письмо пользователь из почты. Введённый текст остаётся в форме текущей страницы. |

Обсуждавшаяся вторая игра «Узнай постановку» раскрывает афишу по фрагменту и ведёт к спектаклю. Для этой версии выбран поиск Бегемота во дворе.

## Проверка первоисточников

На 26 ноября касса показала 28 доступных сеансов, три пометки «Билетов нет» и отдельный входной билет на месяц. Литературный вечер 25 ноября имел свободный вход и пометку о завершении. [Календарь](https://dombulgakova.ru/kalendar/) · [Касса музея-театра](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru)

У «Трамвая 302-БИС» на 26 ноября два отдельных сеанса. Первый начинается в 15:00, второй в 17:00. В мобильной кассе второй открыл экран выбора мест с ценой 1 600 ₽. [Первый](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/place/1436789) · [Второй](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/place/1436802)

Короткая экскурсия длится 1 ч 20 мин, опубликованные тарифы 1 600 / 1 200 ₽. Длинная длится 2 ч, опубликованы 2 000 / 1 600 ₽. У обеих программ сбор у музея-театра, Большая Садовая, 10. Для длинной экскурсии календарь показывает 1 600 ₽, касса на 26 ноября в 19:00 показывает от 2 000 ₽. [Короткая программа](https://dombulgakova.ru/302-bis-bulgakov-i-ego-epoha/) · [Длинная программа](https://dombulgakova.ru/buldom-nekhoroshaya-avtobus/) · [Продажа на 19:00](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/place/1436808)

- Трамвай 302-БИС. Булгаков и его эпоха. [Программа](https://dombulgakova.ru/302-bis-bulgakov-i-ego-epoha/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3694)
- Трамвай 302-БИС и «Нехорошая квартира». [Программа](https://dombulgakova.ru/buldom-nekhoroshaya-avtobus/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3854)
- Мастер и Маргарита. [Программа](https://dombulgakova.ru/events/master-i-margarita-19-03-25-446-243-290-269-173-203-214-382-216-730-110-418/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3704)
- Волшебник Изумрудного города. [Программа](https://dombulgakova.ru/events/volshebnik-izumrudnogo-05-01-26-886-568/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/159253)
- Чайка уже улетела. [Программа](https://dombulgakova.ru/events/karamazovy-21-03-25-952-711-573-441-650-918/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/185437)
- Похождения Чичикова, или Мёртвые души. [Программа](https://dombulgakova.ru/events/karamazovy-21-03-25-952-711-573-441-254-328-367/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/180299)
- Шизофрения, как и было сказано. [Программа](https://dombulgakova.ru/events/nochnaya-teatralizovannaya-ekskursiya-n-2-2-3-2-3-3-2-3-2-2-321-203-783-531-208-588-897-290-185-618-180-358-980/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3700)
- Романтическое путешествие по следам романа «Мастер и Маргарита». [Программа](https://dombulgakova.ru/events/nochnaya-po-sledam-avtobus-29-03-25-971-246-133-472-514-246-242/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3697)
- Александр Вертинский. Жёлтое танго. [Программа](https://dombulgakova.ru/events/aleksandr-vertinskiy-jeltoe-tango-18-052-25-972-525-547/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3935)
- Подходцев и двое других. [Программа](https://dombulgakova.ru/events/averchenko-i-dvoe-drugih-0482-25-138-429-652/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/28800)
- Мистическая Москва, или Территория призраков. [Программа](https://dombulgakova.ru/nochnaya-misticheskaya-moskva/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3865)
- Мастер и Маргарита 2.0. Рукописи не горят. [Программа](https://dombulgakova.ru/events/rukopisi-154556-25-882-752-243-214-678-592-511/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/167266)
- Экскурсия по Булгаковскому Дому. [Программа](https://dombulgakova.ru/events/ekskursiya-po-bulgakovskomu-domu-2-2/) · [Предложение кассы](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3693)
- Литературная Тула. [Программа](https://dombulgakova.ru/events/literaturnyj-salon-andreya-korovina-30-09-26-685/)

В постоянном репертуаре и у отдельных показов встречаются разные возрастные пометки. Для ближайших сеансов «Похождений Чичикова», «Жёлтого танго», «Шизофрении» и «Рукописи не горят» воспроизведены цифры кассы конкретного события. [«Чичиков»](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/180299) · [«Жёлтое танго»](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3935) · [Иммерсивный спектакль](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3700) · [«Рукописи не горят»](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/167266)

Музей-театр работает в первом подъезде на первом этаже. Вход в квартиру № 50 государственного музея находится в шестом подъезде, на четвёртом этаже. Метка музея-театра имеет координаты 55.767175, 37.593573. [Музей-театр](https://dombulgakova.ru/kontakty/) · [Государственный музей](https://www.bulgakovmuseum.ru/visit) · [Яндекс Карты](https://yandex.ru/maps/org/muzey_teatr_bulgakovskiy_dom/86697905323/)

## Переходы из старого меню

Оригинал открыт в мобильном Chromium при ширине 390 px. Календарь, касса, магазин и контакты находятся выше раскрывающегося меню. Его восемь групп объединяют 59 пунктов с 58 уникальными исходными адресами. В старом меню «Кот Бегемот» встречается дважды. Родитель «Праздники» объединяет День Победы и 8 Марта. Старая ссылка кассы музея и страница научного отдела отдавали 404. Новая афиша использует действующую кассу, страница отдела опирается на материалы о музее и гидах.

| Раздел | Пункт | Старый адрес | Новый адрес |
| --- | --- | --- | --- |
| Афиша | КАЛЕНДАРЬ | [Источник](https://dombulgakova.ru/kalendar/) | [Перейти](afisha.html) |
| Афиша | Экскурсии | [Источник](https://dombulgakova.ru/mec-category/ekskursii/) | [Перейти](afisha.html?type=tour) |
| Афиша | Спектакли | [Источник](https://dombulgakova.ru/mec-category/spektakly/) | [Перейти](afisha.html?type=play) |
| Афиша | Лектории и Выставки | [Источник](https://dombulgakova.ru/mec-category/lektorii-vistavky/) | [Перейти](o-dome/lektorii-vistavky.html) |
| Афиша | Прямые эфиры! | [Источник](https://dombulgakova.ru/2020/04/01/pryamye-efiry/) | [Перейти](o-dome/pryamye-efiry.html) |
| Домъ | Домъ | [Источник](https://dombulgakova.ru/dom/) | [Перейти](muzey.html#dom) |
| Домъ | История | [Источник](https://dombulgakova.ru/history/) | [Перейти](o-dome/history.html) |
| Домъ | О Нас | [Источник](https://dombulgakova.ru/o-nas/) | [Перейти](muzey.html#o-nas) |
| Домъ | Команда | [Источник](https://dombulgakova.ru/komanda/) | [Перейти](komanda.html) |
| Домъ | Кот Бегемот | [Источник](https://dombulgakova.ru/kot-begemot/) | [Перейти](o-dome/kot-begemot.html) |
| Домъ | Попечительский совет | [Источник](https://dombulgakova.ru/popechitelskij-sovet/) | [Перейти](o-dome/popechitelskij-sovet.html) |
| Домъ | Друзьям и партнерам | [Источник](https://dombulgakova.ru/druzyam-i-partneram/) | [Перейти](o-dome/druzyam-i-partneram.html) |
| Домъ | Булгаковский Альманах | [Источник](https://dombulgakova.ru/bulgakovskij-almanah/) | [Перейти](o-dome/bulgakovskij-almanah.html) |
| Домъ | Наши награды | [Источник](https://dombulgakova.ru/nashi-nagrady/) | [Перейти](o-dome/nashi-nagrady.html) |
| Домъ | Волонтеры | [Источник](https://dombulgakova.ru/volontery/) | [Перейти](o-dome/volontery.html) |
| Домъ | Правила посещения | [Источник](https://dombulgakova.ru/pravila-poseshheniya/) | [Перейти](o-dome/pravila-poseshheniya.html) |
| Домъ | Фотогалерея | [Источник](https://dombulgakova.ru/fotogalereya-dom/) | [Перейти](o-dome/fotogalereya-dom.html) |
| Домъ | Контакты | [Источник](https://dombulgakova.ru/kontakty/) | [Перейти](vizit.html#kontakty) |
| Музей | О музее | [Источник](https://dombulgakova.ru/o-muzee/) | [Перейти](muzey.html) |
| Музей | Афиша | [Источник](https://tickets.afisha.ru/wl/70/afisha) | [Перейти](afisha.html?type=tour) |
| Музей | Экскурсии | [Источник](https://dombulgakova.ru/excursii/) | [Перейти](ekskursii.html) |
| Музей | Наши гиды | [Источник](https://dombulgakova.ru/gid/) | [Перейти](komanda.html#gid) |
| Музей | Булгаковская энциклопедия | [Источник](https://dombulgakova.ru/bulgakovskaya-encziklopediya/) | [Перейти](o-dome/bulgakovskaya-encziklopediya.html) |
| Музей | Буфет 302-БиС | [Источник](https://dombulgakova.ru/bufet-302-bis/) | [Перейти](o-dome/bufet-302-bis.html) |
| Музей | Сувенирная лавка | [Источник](https://dombulgakova.ru/suvenirnaya-lavka/) | [Перейти](o-dome/suvenirnaya-lavka.html) |
| Музей | Кот Бегемот | [Источник](https://dombulgakova.ru/kot-begemot/) | [Перейти](o-dome/kot-begemot.html) |
| Музей | Фотогалерея | [Источник](https://dombulgakova.ru/fotogalereya-muzej/) | [Перейти](o-dome/fotogalereya-muzej.html) |
| Театр | Афиша | [Источник](https://dombulgakova.ru/afisha/) | [Перейти](afisha.html?type=play) |
| Театр | О театре | [Источник](https://dombulgakova.ru/o-teatre/) | [Перейти](o-dome/o-teatre.html) |
| Театр | Спектакли | [Источник](https://dombulgakova.ru/spektakli/) | [Перейти](spektakli.html) |
| Театр | Главный режиссёр | [Источник](https://dombulgakova.ru/glavnyj-rezhissyor/) | [Перейти](o-dome/glavnyj-rezhissyor.html) |
| Театр | Актеры | [Источник](https://dombulgakova.ru/aktery/) | [Перейти](komanda.html#aktery) |
| Театр | Детская театральная студия | [Источник](https://dombulgakova.ru/detskaya-teatralnaya-studiya/) | [Перейти](o-dome/detskaya-teatralnaya-studiya.html) |
| Театр | Гастроли | [Источник](https://dombulgakova.ru/gastroli/) | [Перейти](o-dome/gastroli.html) |
| Театр | Фотогалерея | [Источник](https://dombulgakova.ru/fotogalereya-teatr/) | [Перейти](o-dome/fotogalereya-teatr.html) |
| События | День рождения М.А. Булгакова | [Источник](https://dombulgakova.ru/den-rozhdeniya-m-a-bulgakova/) | [Перейти](o-dome/den-rozhdeniya-m-a-bulgakova.html) |
| События | День памяти М.А. Булгакова | [Источник](https://dombulgakova.ru/10-marta/) | [Перейти](o-dome/10-marta.html) |
| События | День исполнения желаний | [Источник](https://dombulgakova.ru/den-ispolneniya-zhelanij/) | [Перейти](o-dome/den-ispolneniya-zhelanij.html) |
| События | Ночь музеев | [Источник](https://dombulgakova.ru/noch-muzeev/) | [Перейти](o-dome/noch-muzeev.html) |
| События | Библионочь | [Источник](https://dombulgakova.ru/biblionoch/) | [Перейти](o-dome/biblionoch.html) |
| События | День и Ночь театра | [Источник](https://dombulgakova.ru/den-i-noch-teatra/) | [Перейти](o-dome/den-i-noch-teatra.html) |
| События | День Победы | [Источник](https://dombulgakova.ru/9-maya/) | [Перейти](o-dome/9-maya.html) |
| События | Международный женский день | [Источник](https://dombulgakova.ru/8-marta/) | [Перейти](o-dome/8-marta.html) |
| Культурный центр | Выставки | [Источник](https://dombulgakova.ru/vystavki/) | [Перейти](o-dome/vystavki.html) |
| Культурный центр | Литературный салон А. Коровина | [Источник](https://dombulgakova.ru/literaturnyj-salon-andreya-korovina/) | [Перейти](o-dome/literaturnyj-salon-andreya-korovina.html) |
| Культурный центр | Научно-методический отдел И.Я. Горпенко | [Источник](https://dombulgakova.ru/?page_id=129) | [Перейти](o-dome/nauchnyj-otdel.html) |
| Культурный центр | Литературная гостиная Л. Звонаревой | [Источник](https://dombulgakova.ru/literaturnaya-gostinaya-loly-zvonarev/) | [Перейти](o-dome/literaturnaya-gostinaya-loly-zvonarev.html) |
| Культурный центр | Фотостудия Е. Мартынюк | [Источник](https://dombulgakova.ru/fotostudiya-eleny-martynyuk/) | [Перейти](o-dome/fotostudiya-eleny-martynyuk.html) |
| Культурный центр | Библиотека Булгаковского Дома | [Источник](https://dombulgakova.ru/biblioteka-bulgakovskogo-doma/) | [Перейти](o-dome/biblioteka-bulgakovskogo-doma.html) |
| Культурный центр | Классика. Новое прочтение. | [Источник](https://dombulgakova.ru/klassika-novoe-prochtenie/) | [Перейти](o-dome/klassika-novoe-prochtenie.html) |
| Новости | Новости | [Источник](https://dombulgakova.ru/) | [Перейти](o-dome/novosti.html) |
| Новости | СМИ о нас | [Источник](https://dombulgakova.ru/smi-o-nas/) | [Перейти](o-dome/smi-o-nas.html) |
| Новости | Отзывы | [Источник](https://dombulgakova.ru/otzyvy/) | [Перейти](o-dome/otzyvy.html) |
| Новости | Олимпиада “Музеи. Парки. Усадьбы” | [Источник](https://dombulgakova.ru/olimpiada/) | [Перейти](o-dome/olimpiada.html) |
| Привилегии | Клуб друзей | [Источник](https://dombulgakova.ru/klub-bulgakovskogo-doma/) | [Перейти](o-dome/klub-bulgakovskogo-doma.html) |
| Привилегии | Спецпредложения | [Источник](https://dombulgakova.ru/speczpredlozheniya/) | [Перейти](o-dome/speczpredlozheniya.html) |
| Привилегии | Подарочные сертификаты | [Источник](https://dombulgakova.ru/podarochnye-sertifikaty-2/) | [Перейти](o-dome/podarochnye-sertifikaty-2.html) |
| Привилегии | Корпоративные предложения | [Источник](https://dombulgakova.ru/korporativnye-predlozheniya-3/) | [Перейти](o-dome/korporativnye-predlozheniya-3.html) |
| Привилегии | Вопросы и ответы | [Источник](https://dombulgakova.ru/voprosy-i-otvety-3/) | [Перейти](o-dome/voprosy-i-otvety-3.html) |

### Вложенные страницы каталогов

- Мастер и Маргарита. [Исходная страница](https://dombulgakova.ru/master-margarita/) · [Новый переход](programmy/master.html)
- Стакан воды, или заговор по-английски. [Исходная страница](https://dombulgakova.ru/stakan-vody) · [Новый переход](repertuar/stakan-vody.html)
- Подходцев и двое других. [Исходная страница](https://dombulgakova.ru/podhodtsev-i-dvoe-drugih/) · [Новый переход](programmy/podkhodtsev.html)
- Ромео и Джульетта. [Исходная страница](https://dombulgakova.ru/romeo-i-dzhuletta) · [Новый переход](repertuar/romeo-i-dzhuletta.html)
- Мастер и Маргарита 2.0. Рукописи не горят. [Исходная страница](https://dombulgakova.ru/rukopisi-ne-goryat-2-0/) · [Новый переход](programmy/manuscripts.html)
- Собачье сердце. [Исходная страница](https://dombulgakova.ru/sobachie-serdce-aldonin/) · [Новый переход](repertuar/sobachie-serdce-aldonin.html)
- Искушение Паганини. [Исходная страница](https://dombulgakova.ru/iskushenie-paganini/) · [Новый переход](repertuar/iskushenie-paganini.html)
- Жизнь Ж. [Исходная страница](https://dombulgakova.ru/zhizn-zh) · [Новый переход](repertuar/zhizn-zh.html)
- Братья Карамазовы. [Исходная страница](https://dombulgakova.ru/karamazovy/) · [Новый переход](repertuar/karamazovy.html)
- Тартюф. [Исходная страница](https://dombulgakova.ru/tartuffe/) · [Новый переход](repertuar/tartuffe.html)
- Цветы запоздалые. [Исходная страница](https://dombulgakova.ru/cvety-zapozdalye/) · [Новый переход](repertuar/cvety-zapozdalye.html)
- Я, Высоцкий Владимир.... [Исходная страница](https://dombulgakova.ru/ya-vysotsky/) · [Новый переход](repertuar/ya-vysotsky.html)
- Театр. [Исходная страница](https://dombulgakova.ru/spektakl-teatr/) · [Новый переход](repertuar/spektakl-teatr.html)
- Про Федота-стрельца. [Исходная страница](https://dombulgakova.ru/fedot-strelec/) · [Новый переход](repertuar/fedot-strelec.html)
- Волшебник Изумрудного города. [Исходная страница](https://dombulgakova.ru/volshebnik/) · [Новый переход](programmy/wizard.html)
- Леонид Утёсов. Спасибо, сердце!. [Исходная страница](https://dombulgakova.ru/leonid-utyosov-spasibo-serdcze/) · [Новый переход](repertuar/leonid-utyosov-spasibo-serdcze.html)
- Александр Вертинский. Жёлтое танго. [Исходная страница](https://dombulgakova.ru/aleksandr-vertinskiy-jeltoe-tango) · [Новый переход](programmy/vertinsky.html)
- Пять рассказов Шукшина. [Исходная страница](https://dombulgakova.ru/shukshin/) · [Новый переход](repertuar/shukshin.html)
- Бесприданница. [Исходная страница](https://dombulgakova.ru/bespridannitsa/) · [Новый переход](repertuar/bespridannitsa.html)
- Механика любви. [Исходная страница](https://dombulgakova.ru/mekhanika-lyubvi/) · [Новый переход](repertuar/mekhanika-lyubvi.html)
- Похождения Чичикова, или мёртвые души. [Исходная страница](https://dombulgakova.ru/mertvie-dushi/) · [Новый переход](programmy/chichikov.html)
- Ознакомительная экскурсия по музею с посещением тайных комнат. [Исходная страница](https://dombulgakova.ru/obzornaya-excursiya) · [Новый переход](programmy/house-tour.html)
- Трамвай 302-БИС. "Булгаков и его эпоха". [Исходная страница](https://dombulgakova.ru/302-bis-bulgakov-i-ego-epoha) · [Новый переход](programmy/tram.html)
- Дневная пешеходная экскурсия "По следам романа "Мастер и Маргарита". [Исходная страница](https://dombulgakova.ru/dnevnaya-po-sledam-romana) · [Новый переход](repertuar/dnevnaya-po-sledam-romana.html)
- Автобусная экскурсия "Булгаковский дом+Нехорошая квартира". [Исходная страница](https://dombulgakova.ru/buldom-nekhoroshaya-avtobus/) · [Новый переход](programmy/apartment.html)
- Иммерсивный спектакль "Шизофрения, как и было сказано". [Исходная страница](https://dombulgakova.ru/shizofreniya) · [Новый переход](programmy/schizophrenia.html)
- Иммерсивный спектакль "Шизофрения. В час небывало жаркого заката...". [Исходная страница](https://dombulgakova.ru/v-chas-nebyvalo) · [Новый переход](repertuar/v-chas-nebyvalo.html)
- Ночная экскурсия "Мистическая Москва, или территория призраков". [Исходная страница](https://dombulgakova.ru/nochnaya-misticheskaya-moskva) · [Новый переход](programmy/mystic-moscow.html)
- Ночная экскурсия "По следам романа "Мастер и Маргарита". [Исходная страница](https://dombulgakova.ru/nochnaya-po-sledam-romana) · [Новый переход](programmy/night-route.html)
- Автобусная экскурсия "Невероятные истории любви". [Исходная страница](https://dombulgakova.ru/istorii-lyubvi/) · [Новый переход](repertuar/istorii-lyubvi.html)
- Автобусная экскурсия "По тропе исполнения желаний". [Исходная страница](https://dombulgakova.ru/po-trope-ispolneniya-zhelaniy) · [Новый переход](repertuar/po-trope-ispolneniya-zhelaniy.html)
- Пешеходная экскурсия "Московские истории: спиритический сеанс". [Исходная страница](https://dombulgakova.ru/spiriticheskiy-seans) · [Новый переход](repertuar/spiriticheskiy-seans.html)
- Иллюстрации В. Валиева к роману «Мастер и Маргарита». [Исходная страница](https://dombulgakova.ru/illyustraczii-v-valieva-k-romanu-maste) · [Новый переход](repertuar/illyustraczii-v-valieva-k-romanu-maste.html)
- Лабиринты одного романа. [Исходная страница](https://dombulgakova.ru/labirinty-odnogo-romana) · [Новый переход](repertuar/labirinty-odnogo-romana.html)
- Выставка посвящена 125-летию со дня рождения Е.С. Булгаковой. [Исходная страница](https://dombulgakova.ru/vystavka-posvyashhena-125-letiyu-so-dnya-rozhd) · [Новый переход](repertuar/vystavka-posvyashhena-125-letiyu-so-dnya-rozhd.html)
- Отражение. [Исходная страница](https://dombulgakova.ru/otrazhenie) · [Новый переход](repertuar/otrazhenie.html)

На странице юбилейной выставки Елены Булгаковой сохранился только заголовок. Описание восстановлено по материалу хранительницы архива и официальному каталогу выставок. [Сборник музейных докладов, с. 12](https://voronezhliter.ru/files/sbornik-dokladov-muzej-rasshiryaet-amplua.pdf#page=12) · [Каталог музея](https://dombulgakova.ru/vystavki/)

Пункт «Пять рассказов Шукшина» в старом каталоге ведёт к другой постановке. В новом каталоге ссылка подписана названием со страницы спектакля — «Характеры, или Дети одного народа». Театр отдельно анонсировал оба спектакля. [Страница постановки](https://dombulgakova.ru/shukshin/) · [Анонс театра](https://t.me/theatre_bulgakova/9569)

## Внешние сервисы

- Общий виджет «Афиши» из шапки музея-театра. [Официальная билетная касса](https://www.afisha.ru/w/sessions/2/be040af9-0503-4885-8a04-23e703a0d63e/https%3A%2F%2Fdombulgakova.ru%2F?embedType=modal)
- Каталог музея с корзиной. [Интернет-магазин музея](https://dombulgakova.ru/magazin/)
- Сообщество музея. [Музей в VK](https://vk.ru/bulgakov_house)
- Канал театра из шапки. [Театр в Telegram](https://t.me/theatre_bulgakova)
- Переход в мессенджер. [WhatsApp музея](https://wa.me/79037680204)
- В исходной шапке. Новый раздел визита открывает проверенную точку Яндекса. [Старый маршрут Google Maps](https://goo.gl/maps/9yw53a9x4jGSvSTR9)
- Внешняя Google Форма из раздела волонтёров. [Анкета волонтёра](https://docs.google.com/forms/d/e/1FAIpQLScMDTxz5PdUaFRp-wC13qWY3BS3a8Q8J2kg5rF4ZQ1R2ZrznQ/viewform)
- Пешком к первому подъезду со стороны двора. [Маршрут в Яндекс Картах](https://yandex.ru/maps/?rtext=~55.767175%2C37.593573&rtt=pd)

## Фотографии, афиши и фирменный знак

- Портрет Агнии Дитковските. [agniya-ditkovskite.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Агния-Дитковските.png) · [Публикация](https://dombulgakova.ru/aktery/)
- Портрет Александры Виноградовой. [aleksandra-vinogradova.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Александра-Виноградова.png) · [Публикация](https://dombulgakova.ru/aktery/)
- Чёрно-белый портрет Алексея Боченина. [aleksey-bochenin.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Алексей-Боченин.png) · [Публикация](https://dombulgakova.ru/aktery/)
- Чёрно-белый портрет Андрея Курносова. [andrey-kurnosov.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Андрей-Курносов.png) · [Публикация](https://dombulgakova.ru/aktery/)
- Красный экскурсионный автобус «302-БИС» во дворе. Иллюстрация официальной кассы к длинной программе. [apartment-tram.webp](https://store.rambler.ru/tickets/images/shows/65b11609eb4a1c73dbea3bb07b2847f8.jpeg) · [Публикация](https://tickets.afisha.ru/wl/70/api?site=dombulgakova.ru#/about/3854)
- Чёрный кот Бегемот рядом с пишущей машинкой в музее. [behemoth.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/котбегемот.аватар.jpg) · [Публикация](https://dombulgakova.ru/kot-begemot/)
- Героиня «Бесприданницы» с белой посудой на фоне тёмной сцены. [bespridannitsa.webp](https://dombulgakova.ru/wp-content/uploads/2026/10/img_7276-1-1080x810-1.jpg) · [Публикация](https://dombulgakova.ru/bespridannitsa/)
- Артисты в чёрных фраках и белых рубашках в сцене из спектакля. [chichikov-stage.webp](https://dombulgakova.ru/wp-content/uploads/2026/06/img_6703.jpg) · [Публикация](https://dombulgakova.ru/events/karamazovy-21-03-25-952-711-573-441-254-328-367/)
- Актёры спектакля «Цветы запоздалые» в интерьере гостиной. [cvety-zapozdalye.webp](https://dombulgakova.ru/wp-content/uploads/2026/07/img_6029-1080x720-1.jpg) · [Публикация](https://dombulgakova.ru/cvety-zapozdalye/)
- Зал Булгаковского Дома, откуда начинается дневная экскурсия по следам романа. [dnevnaya-po-sledam-romana.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210043.jpg) · [Публикация](https://dombulgakova.ru/dnevnaya-po-sledam-romana)
- Исполнители в ярких сказочных костюмах в спектакле «Про Федота-стрельца». [fedot-strelec.webp](https://dombulgakova.ru/wp-content/uploads/2025/10/dsc_0279-1-scaled.jpg) · [Публикация](https://dombulgakova.ru/fedot-strelec/)
- Портрет экскурсовода Филиппа Хитрова. [filipp-khitrov.webp](https://dombulgakova.ru/wp-content/uploads/2024/03/hitrov-filipp-1.jpeg) · [Публикация](https://dombulgakova.ru/gid/)
- Пианино, старинные лампы и скульптура в комнате Булгаковского Дома. [gallery-dom-1.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210031.jpg)
- Книги и сувениры за деревянной стойкой, на переднем плане столики с красными стульями. [gallery-dom-2.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210058.jpg)
- Бегемот с красной бабочкой и пенсне, за круглым столиком с портретом кота. [gallery-dom-3.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210028.jpg)
- Зелёная настольная лампа и кресла у тяжёлых бордовых портьер. [gallery-dom-4.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210066.jpg)
- Музейная лестница с рисунками на стене и деревянными перилами. [gallery-muzej-1.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210050.jpg)
- Проход между залами музея, рядом письменный стол и застеклённый шкаф. [gallery-muzej-2.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210071-1.jpg)
- Фотографии, документы и небольшие витрины в светлом зале экспозиции. [gallery-muzej-3.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210043.jpg)
- Силуэты музейных фигурок на подоконнике перед кружевной занавеской. [gallery-muzej-4.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210062.jpg)
- Зрительный зал с рядами красных кресел и камерной сценой. [gallery-teatr-1.webp](https://dombulgakova.ru/wp-content/uploads/2025/01/p8210003.jpg)
- Вид в зал от пульта управления, рядом монитор и зеркало. [gallery-teatr-2.webp](https://dombulgakova.ru/wp-content/uploads/2025/01/p8210006.jpg)
- Скульптуры под освещённой красным нишей в театральном интерьере. [gallery-teatr-3.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210032.jpg)
- Портреты и витрина в затемнённом проходе театра. [gallery-teatr-4.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210015.jpg)
- Участники встречи в выставочном зале на музейном снимке к проекту Владимира Валиева. [illyustraczii-v-valieva-k-romanu-maste.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/9-1-1.jpg) · [Публикация](https://dombulgakova.ru/illyustraczii-v-valieva-k-romanu-maste)
- Скрипач в узком луче света в постановке «Искушение Паганини». [iskushenie-paganini.webp](https://dombulgakova.ru/wp-content/uploads/2025/02/photographer-lena-melnikova-6620_resized.jpg) · [Публикация](https://dombulgakova.ru/iskushenie-paganini/)
- Архивные фотографии героев «Невероятных историй любви» на обложке программы музея. [istorii-lyubvi.webp](https://dombulgakova.ru/wp-content/uploads/2020/02/samye-scandalnye.jpg) · [Публикация](https://dombulgakova.ru/istorii-lyubvi/)
- Красный сценический свет в эпизоде «Братьев Карамазовых». [karamazovy.webp](https://dombulgakova.ru/wp-content/uploads/2025/02/img_5566.jpg) · [Публикация](https://dombulgakova.ru/karamazovy/)
- Фрагмент выставки «Лабиринты одного романа» с картинами Дарьи Воробьёвой. [labirinty-odnogo-romana.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/6-1.jpg) · [Публикация](https://dombulgakova.ru/labirinty-odnogo-romana)
- Исполнители музыкального спектакля о Леониде Утёсове с кларнетом и скрипкой. [leonid-utyosov-spasibo-serdcze.webp](https://dombulgakova.ru/wp-content/uploads/2021/02/aa5_4616-2.jpg) · [Публикация](https://dombulgakova.ru/leonid-utyosov-spasibo-serdcze/)
- Одноцветная адаптация подлинного знака музея-театра для компактной шапки. Сохранены портрет и надпись. [logo-cream.webp](https://dombulgakova.ru/wp-content/uploads/2023/01/logo-muzej-teatr.png) · [Публикация](https://dombulgakova.ru/wp-json/wp/v2/media/10024)
- Одноцветная адаптация подлинного знака музея-театра для компактной шапки. Сохранены портрет и надпись. [logo-ink.webp](https://dombulgakova.ru/wp-content/uploads/2023/01/logo-muzej-teatr.png) · [Публикация](https://dombulgakova.ru/wp-json/wp/v2/media/10024)
- Официальная иллюстрация к спектаклю «Мастер и Маргарита 2.0. Рукописи не горят». [manuscripts-art.webp](https://dombulgakova.ru/wp-content/uploads/2026/06/rukopysi_2160x1200.png) · [Публикация](https://dombulgakova.ru/rukopisi-ne-goryat-2-0/)
- Горизонтальная афиша спектакля Московского театра им. М. А. Булгакова. [master-banner.webp](https://dombulgakova.ru/wp-content/uploads/2020/04/mim-2019-ban.jpg) · [Публикация](https://dombulgakova.ru/spektakli/)
- Маргарита в короне и белом платье, за ней двое мужчин на затемнённой сцене. [master-stage.webp](https://dombulgakova.ru/wp-content/uploads/2024/04/11111-1.jpg) · [Публикация](https://dombulgakova.ru/master-margarita/)
- Исполнительница поэтического спектакля «Механика любви» на сцене. [mekhanika-lyubvi.webp](https://dombulgakova.ru/wp-content/uploads/2025/08/img_4699-scaled.jpg) · [Публикация](https://dombulgakova.ru/mekhanika-lyubvi/)
- Дверь музея-театра во дворе, слева скульптура Коровьева и Бегемота. [museum-entrance.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/7d43773e67a1c60fb31d5c9678ec6522.jpg) · [Публикация](https://dombulgakova.ru/excursii/)
- Книжные стеллажи, стол и красное кресло в экспозиции музея. [museum-interior.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210058.jpg) · [Публикация](https://dombulgakova.ru/fotogalereya-muzej/)
- Печатная машинка на столе в музейном зале у окна. [museum-typewriter.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210074.jpg) · [Публикация](https://dombulgakova.ru/fotogalereya-muzej/)
- Вечерняя панорама с отражением зданий в пруду из галереи экскурсии. [mystic-moscow.webp](https://dombulgakova.ru/wp-content/uploads/2020/04/7358aafef597415e3834c0700d5088d02b56f353.jpg) · [Публикация](https://dombulgakova.ru/events/misticheskaya-moskva-avtobus-32-3246-342-645-634-362-120-735-387/)
- Портрет экскурсовода Наталии Егоровой. [nataliya-egorova.webp](https://dombulgakova.ru/wp-content/uploads/2024/03/natasha-egorova2-1.jpeg) · [Публикация](https://dombulgakova.ru/gid/)
- Портрет экскурсовода Натальи Пиуновой. [natalya-piunova.webp](https://dombulgakova.ru/wp-content/uploads/2024/03/piunova-scaled.jpg) · [Публикация](https://dombulgakova.ru/gid/)
- Скульптурная композиция с автомобилем на маршруте программы. [night-excursion.webp](https://dombulgakova.ru/wp-content/uploads/2020/06/22.jpg) · [Публикация](https://dombulgakova.ru/events/nochnaya-po-sledam-avtobus-29-03-25-971-246-133-472-514-246-242/)
- Зрители и художники на открытии выставки «Отражение» в Булгаковском Доме. [otrazhenie.webp](https://dombulgakova.ru/wp-content/uploads/2020/04/nsgaew_lfig.jpg) · [Публикация](https://dombulgakova.ru/otrazhenie)
- Разноцветные шары над гостями во дворе Булгаковского Дома. [po-trope-ispolneniya-zhelaniy.webp](https://dombulgakova.ru/wp-content/uploads/2020/02/den-ispolneniya-zhelanij_inst.jpg) · [Публикация](https://dombulgakova.ru/po-trope-ispolneniya-zhelaniy)
- Трое персонажей на сцене спектакля «Подходцев и двое других». [podkhodtsev-stage.webp](https://dombulgakova.ru/wp-content/uploads/2026/10/20261004-snimok-bez-imeni-05151_resized-1.jpg) · [Публикация](https://dombulgakova.ru/podhodtsev-i-dvoe-drugih/)
- Алексей Беклемышев. Портрет с официальной страницы музея-театра. [portrait-aleksey-beklemyshev.webp](https://dombulgakova.ru/wp-content/uploads/2020/04/beklemyshev-a.s.-1024x683-1.jpg)
- Анна Тельшевская. Портрет с официальной страницы музея-театра. [portrait-anna-telshevskaya.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Анна-Ресепшн.jpg)
- Анна Зарянкина. Портрет с официальной страницы музея-театра. [portrait-anna-zaryankina.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Анна-Зарянкина.png)
- Денис Рожков. Портрет с официальной страницы музея-театра. [portrait-denis-rozhkov.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Денис-Рожков.png)
- Дмитрий Жойдик. Портрет с официальной страницы музея-театра. [portrait-dmitriy-zhoydik.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Дмитрий-Жойдик.png)
- Егор Сальников. Портрет с официальной страницы музея-театра. [portrait-egor-salnikov.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Егор-Сальников.png)
- Екатерина Горпинко. Портрет с официальной страницы музея-театра. [portrait-ekaterina-gorpinko.webp](https://dombulgakova.ru/wp-content/uploads/2024/03/whatsapp-image-2024-05-21-at-18.16.16.jpeg)
- Екатерина Климова. Портрет с официальной страницы музея-театра. [portrait-ekaterina-klimova.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Екатерина-Климова.png)
- Екатерина Волкова. Портрет с официальной страницы музея-театра. [portrait-ekaterina-volkova.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Екатерина-Волкова.png)
- Елена Морозова. Портрет с официальной страницы музея-театра. [portrait-elena-morozova.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Елена-Морозова.png)
- Елена Соломина. Портрет с официальной страницы музея-театра. [portrait-elena-solomina.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Елена-Соломина.png)
- Евгений Самарин. Портрет с официальной страницы музея-театра. [portrait-evgeniy-samarin.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Евгений-Самарин.png)
- Галина Боб. Портрет с официальной страницы музея-театра. [portrait-galina-bob.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Галина-Боб.png)
- Гела Месхи. Портрет с официальной страницы музея-театра. [portrait-gela-meskhi.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Гела-Месхи.png)
- Георгиос Караяннидис. Портрет с официальной страницы музея-театра. [portrait-georgios-karayannidis.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Георгиос-Караяннидис.png)
- Илья Исаев. Портрет с официальной страницы музея-театра. [portrait-ilya-isaev.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Илья-Исаев.png)
- Ирина Яковлевна Горпенко. Портрет с официальной страницы музея-театра. [portrait-irina-yakovlevna-gorpenko.webp](https://dombulgakova.ru/wp-content/uploads/2020/04/gorpenko-i.ya_..jpg)
- Марина Бессонова-Хворостовская. Портрет с официальной страницы музея-театра. [portrait-marina-bessonova-khvorostovskaya.webp](https://dombulgakova.ru/wp-content/uploads/2024/03/marina4-2.jpeg)
- Наталия Токарева. Портрет с официальной страницы музея-театра. [portrait-nataliya-tokareva.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Администратор-Наталия.jpg)
- Наталья Гусак. Портрет с официальной страницы музея-театра. [portrait-natalya-gusak.webp](https://dombulgakova.ru/wp-content/uploads/2020/04/vjqrywu1duy.jpg)
- Наталья Петровна Склярова. Портрет с официальной страницы музея-театра. [portrait-natalya-petrovna-sklyarova.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Исполнительный-Директор.jpg)
- Николай Борисович Голубев. Портрет с официальной страницы музея-театра. [portrait-nikolay-borisovich-golubev.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Директор.jpg)
- Олеся Елетина. Портрет с официальной страницы музея-театра. [portrait-olesya-eletina.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Администратор-Олеся.jpg)
- Сергей Алдонин. Портрет с официальной страницы музея-театра. [portrait-sergey-aldonin.webp](https://dombulgakova.ru/wp-content/uploads/2025/11/photo_5310251518890024487_y.jpg)
- Вадим Норнштейн. Портрет с официальной страницы музея-театра. [portrait-vadim-nornshteyn.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Вадим-Норнштейн.png)
- Вадим Ситников. Портрет с официальной страницы музея-театра. [portrait-vadim-sitnikov.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Вадим-Ситников.png)
- Валерий Панков. Портрет с официальной страницы музея-театра. [portrait-valeriy-pankov.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/Валерий-Панков.png)
- Юлия Груздева. Портрет с официальной страницы музея-театра. [portrait-yuliya-gruzdeva.webp](https://dombulgakova.ru/wp-content/uploads/2020/04/gruzdeva-u.-680x1024-1.jpg)
- Драматическая сцена из постановки «Ромео и Джульетта». [romeo-i-dzhuletta.webp](https://dombulgakova.ru/wp-content/uploads/2023/09/whatsapp-image-2023-10-20-at-16.27.36.jpeg) · [Публикация](https://dombulgakova.ru/romeo-i-dzhuletta)
- Официальная афиша литературной встречи с авторами из Тулы 25 ноября. [salon-poster.webp](https://dombulgakova.ru/wp-content/uploads/2026/10/01-2511-tula-1080x761.jpg)
- Афиша спектакля в виде газетной полосы с заголовком и фотографиями. [schizophrenia-poster.webp](https://cdn4.telesco.pe/file/NtfM_joctnDSY2b7NQHYlhHOBjtG7DlP7VHdZeL8tW7cxvIT3ya-gfDcapu4mY5kc33hfC5JG4fd-0jGnBdj45CCeOPE1UtgxXHbgiokIfTAl_fx_bkygXFMVgYas4OI7n9YODkdUPFJGF6tUGu9jwci05mTh0LC6AyU4DisFqdCCDopz5IPhVBq8-B9RynCbfoXeJBKcL002aOEqokg1zRDa68WHZELhfU2z_OlJ8ncvsbKcU7-d4i8SW3FBBRWKTebRXjSpSD4kAE02IPNUtpgzz2HzC7PTRysX-FjNY2ZKuIb00bFD5ZR3oJmo-TF5zv6ui_Fef9-3JGue0d62w.jpg) · [Публикация](https://t.me/theatre_bulgakova/9888)
- Участники иммерсивного спектакля среди зрителей. [schizophrenia-stage.webp](https://dombulgakova.ru/wp-content/uploads/2022/02/051.jpg) · [Публикация](https://dombulgakova.ru/events/nochnaya-teatralizovannaya-ekskursiya-n-2-2-3-2-3-3-2-3-2-2-321-203-783-531-208-588-897-290-185-618-180-148-638/)
- Подлинная афиша организатора с названием спектакля и сценической композицией. [seagull-poster.webp](https://cdn4.telesco.pe/file/qJacdE5CftBRJTlrKz3gz2T_vi4gMnU9AR8fy-GsJWNsy4NpjTrLDsNJ3m3nwh-ojhvTm0nQsPgVIrH1K6geSZc0ilX83NgGhqcLjrVVeAqwDNI-nDPpPuHH0KHaxN2sstS7Q9CR68lUk5OAyXwAv2pMGbSqCuid7-Xy9v8-5Ynw4o2KzdE0pE-nHMZfCppIO01IwV04hFkikIbydE4mbR7mUPCYIA3H_JqlNSJXmZSe9qKk3aKRNnbt0S2NaKgfJI7aRqpmtni7JSwZOpuk2Ae7IzK-FFzL_cJY0oVds9LeQRYW2RFGGWuH32k2zot_QW5zBMnodzCp2un9Nu9kog.jpg) · [Публикация](https://t.me/theatre_bulgakova/9861)
- Два актёра тянутся друг к другу над столом в спектакле «Чайка уже улетела». [seagull-stage.webp](https://dombulgakova.ru/wp-content/uploads/2026/08/photo_5204210593122949718_y.jpg) · [Публикация](https://dombulgakova.ru/events/karamazovy-21-03-25-952-711-573-441-650-918/)
- Исполнитель и аккордеонист в спектакле по рассказам Шукшина. [shukshin.webp](https://dombulgakova.ru/wp-content/uploads/2026/01/haraktery7.jpg) · [Публикация](https://dombulgakova.ru/shukshin/)
- Действующие лица «Собачьего сердца» в интерьере квартиры профессора. [sobachie-serdce-aldonin.webp](https://dombulgakova.ru/wp-content/uploads/2026/09/20260829-snimok-bez-imeni-03371_resized.jpg) · [Публикация](https://dombulgakova.ru/sobachie-serdce-aldonin/)
- Исполнительница роли Джулии Ламберт в красном платье на сцене. [spektakl-teatr.webp](https://dombulgakova.ru/wp-content/uploads/2026/09/photo_5287581337176974543_y.jpg) · [Публикация](https://dombulgakova.ru/spektakl-teatr/)
- Лестница дома на Большой Садовой, где Булгаков написал «Спиритический сеанс». [spiriticheskiy-seans.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/P8210050.jpg) · [Публикация](https://dombulgakova.ru/spiriticheskiy-seans)
- Придворные в светлых костюмах на сцене спектакля «Стакан воды». [stakan-vody.webp](https://dombulgakova.ru/wp-content/uploads/2024/07/naglavnuyu-1.jpg) · [Публикация](https://dombulgakova.ru/stakan-vody)
- Персонажи «Тартюфа» у длинного стола на тёмной сцене. [tartuffe.webp](https://dombulgakova.ru/wp-content/uploads/2026/07/dsc_3348-scaled.jpg) · [Публикация](https://dombulgakova.ru/tartuffe/)
- Зрительный зал театра с красными креслами перед сценой. [theatre-hall.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/О-театре-1.jpg) · [Публикация](https://dombulgakova.ru/aktery/)
- Экскурсовод с микрофоном и участники экскурсии в салоне «Трамвая 302-БИС». [tram-interior.webp](https://dombulgakova.ru/wp-content/uploads/2021/04/p5180321-1-1.jpg) · [Публикация](https://dombulgakova.ru/events/ekskursiya-na-tramvae-302-bis-bulgakov-i-ego-epoha-3-3-2-5-5-5-5-3-3-950-554-525-625-675-510-444/)
- Официальная афиша с изображением красного трамвая и названием экскурсии. [tram-poster.webp](https://cdn4.telesco.pe/file/jvtjUWffZtoWMcxsRGVzk9CkYEknjrPKgYIEZnyJ3jFGDDCQUj1nfMkfjIncqmxKeNw-LCFhUzDhb6OhOK6mib2Zf9J8uZEWaRpSQ8SiM7OR2fziZyx22VbgmiRzM9M0l5PYsYps8vpir4C0IxkIARHu3I4lhkoPeLlmh3AdsknTb_z5Kgqv0v0ym-yX3Z0MQgSt6rE57zjAKYrnflyaQuCh1qA9Ees4VFrOTK0HX6mD6mHk96FfjEVUDI3h1whM-c58DzELXx6l3JuyBDujXNSkjcvwIetlJbvQxmCZJt8jfyUNb1fJwtoINY5HXMMAx0vLi_rWUkpmk2Nwd2gvHw.jpg) · [Публикация](https://t.me/theatre_bulgakova/9899)
- Артист в длинном плаще встречает группу прямо на московской улице. [v-chas-nebyvalo.webp](https://dombulgakova.ru/wp-content/uploads/2020/02/v-chas-nebyvalo-jarkogo-zakata-1024x683-1.jpg) · [Публикация](https://dombulgakova.ru/v-chas-nebyvalo)
- Актёр с белой театральной маской на сцене. [vertinsky-stage.webp](https://dombulgakova.ru/wp-content/uploads/2020/01/4e948e4b-8a20-45cb-9209-626376cf38e5-1.jpeg) · [Публикация](https://dombulgakova.ru/aleksandr-vertinskiy-jeltoe-tango/)
- Фотография из каталога юбилейной выставки Елены Булгаковой. Участник встречи у витрины с документами. [vystavka-posvyashhena-125-letiyu-so-dnya-rozhd.webp](https://dombulgakova.ru/wp-content/uploads/2019/10/16.jpg) · [Публикация](https://dombulgakova.ru/vystavka-posvyashhena-125-letiyu-so-dnya-rozhd)
- Героиня выглядывает из-за красного театрального занавеса. [wizard-curtain.webp](https://dombulgakova.ru/wp-content/uploads/2026/09/img_7920.jpg) · [Публикация](https://dombulgakova.ru/events/volshebnik-izumrudnogo-05-01-26-886-568/)
- Ансамбль в ярких костюмах на сцене «Волшебника Изумрудного города». [wizard-stage.webp](https://dombulgakova.ru/wp-content/uploads/2026/09/11111.jpg) · [Публикация](https://dombulgakova.ru/volshebnik/)
- Архивная кассовая афиша «Я, Высоцкий Владимир…» с портретом Владимира Высоцкого и Марины Влади. [ya-vysotsky.webp](https://store.rambler.ru/tickets/images/shows/POP4AD6c4qoXNE0jcd64N8fssRbGedgP6rtXUYQk.jpeg) · [Публикация](https://dombulgakova.ru/ya-vysotsky/)
- Две героини «Жизни Ж» на сцене, одна смотрит через круглые очки. [zhizn-zh.webp](https://dombulgakova.ru/wp-content/uploads/2023/04/5d9d2f84-735a-48d5-aea5-8dc96bc1b1d8.jpg) · [Публикация](https://dombulgakova.ru/zhizn-zh)
