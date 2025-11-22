class Level4 extends BaseLevel {
    constructor() {
        super({
            rows: 7,
            cols: 5,
            hasRedZones: true,
            hasYellowZones: true,
            hasWhiteZones: true,
            hasGaziks: true,
            gaziksCount: 2,
        });


        this.SPECIAL_ZONE_POSITIONS = [
            [0, 3], [1, 1], [2, 4], [3, 2], [4, 0], [5, 3]
        ];

        //Диалоги при старте уровня
        this.DIALOGS = [
            'На этом уровне тебе встретятся все виды зон, которые проверят твою подготовку. Удачи!'
        ];

        //Вопросы для красной зоны
        this.RED_ZONE_QUESTIONS = [
            {
                q: "Ты получил сообщение «Ваша карта заблокирована, срочно перешлите данные». Что нужно сделать?",
                answers: [
                    { text: "Прислать всё, чтобы быстрее разблокировали", correct: false },
                    { text: "Позвонить в банк по официальному номеру", correct: true },
                    { text: "Перейти по ссылке из сообщения и ввести данные карты", correct: false }
                ]
            },
            {
                q: "К тебе подошёл человек и предложил купить «выгодные акции» прямо на улице. Твои действия?",
                answers: [
                    { text: "Сразу перевожу деньги, вдруг повезёт", correct: false },
                    { text: "Отказываюсь и проверяю информацию в своём банке", correct: true },
                    { text: "Соглашаюсь, если у него красивая папка с документами", correct: false }
                ]
            },
            {
                q: "Если ты потерял банковскую карту, что нужно сделать в первую очередь?",
                answers: [
                    { text: "Подождать, вдруг найдётся", correct: false },
                    { text: "Заблокировать карту через банк", correct: true },
                    { text: "Позвонить друзьям и пожаловаться", correct: false }
                ]
            }
        ];


        //Вопросы для жёлтой зоны
        this.YELLOW_ZONE_QUESTIONS = [
            {
                q: "Ты собираешься купить ноутбук. Что выгоднее: рассрочка 0% или кредит под 15%?",
                answers: [
                    { text: "Кредит — проценты всё равно неважны", correct: false },
                    { text: "Рассрочка 0%, если нет скрытых комиссий", correct: true },
                    { text: "Наличные под подушкой — самое надёжное", correct: false }
                ]
            },
            {
                q: "У тебя есть 1000 ₽. Что лучше сделать?",
                answers: [
                    { text: "Потратить на еду и развлечения", correct: false },
                    { text: "Отложить часть на сбережения", correct: true },
                    { text: "Дать в долг другу без возврата", correct: false }
                ]
            },
            {
                q: "Зачем нужен бюджет?",
                answers: [
                    { text: "Чтобы контролировать доходы и расходы", correct: true },
                    { text: "Чтобы знать, сколько можно потратить на кофе", correct: false },
                    { text: "Чтобы не платить налоги", correct: false }
                ]
            }
        ];


        //Вопросы для белой зоны
        this.WHITE_ZONE_QUESTIONS = [
            {
                q: "Какой инструмент помогает накопить на долгосрочные цели?",
                answers: [
                    { text: "Депозит в банке или инвестиционный счет", correct: true },
                    { text: "Мгновенные лотереи и ставки", correct: false },
                    { text: "Покупка дорогих гаджетов", correct: false }
                ]
            },
            {
                q: "Что поможет избежать долговой ямы?",
                answers: [
                    { text: "Следить за расходами и вовремя платить по кредитам", correct: true },
                    { text: "Игнорировать счета и надеяться на лучшее", correct: false },
                    { text: "Покупать всё в рассрочку без планирования", correct: false }
                ]
            },
            {
                q: "Почему важно иметь финансовые цели?",
                answers: [
                    { text: "Они помогают планировать бюджет и принимать решения о расходах", correct: true },
                    { text: "Чтобы показывать другим, что вы богаты", correct: false },
                    { text: "Чтобы тратить деньги как можно быстрее", correct: false }
                ]
            }
        ];

        //Продукты банка
        this.BANK_PRODUCTS = [
            {
                name: "Премиальная карта Mir Supreme",
                description: "Кэшбэк на рестораны дополнительно 10%, бесплатные трансферы и бизнес-залы в аэропортах, Ваша выгода от 500 000 в год"
            },
            {
                name: "Пенсионная карта",
                description: "С заботой о старших. 0 ₽ обслуживание карты без условий, до 17% годовых по накопительному счету"
            }
        ];


        // После всех установок — инициализация
        this.init();
    }

    //Размещение всех типов зон на поле
    placeSpecialZones() {
        console.log('Placing all zone types (Level4)...');
        const zoneTypes = ['red', 'yellow', 'white'];

        this.SPECIAL_ZONE_POSITIONS.forEach(([r, c], i) => {
            const cell = this.getCell(r, c);
            if (!cell || cell.classList.contains('start') || cell.classList.contains('goal')) return;

            const zoneType = zoneTypes[i % zoneTypes.length];
            cell.classList.add(`${zoneType}-zone`);
            cell.textContent = '?';
        });
    }

    // Указываем путь к следующему уровню
    getNextLevelPath() {
        return './../level5/level5.html';
    }
}

//Инициализация уровня
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Level4...');
    currentLevel = new Level4();

    const nextLevelButtons = [
        document.getElementById('nextLevel'),
        document.getElementById('nextLevelResult')
    ];

    nextLevelButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (currentLevel) {
                    currentLevel.goToNextLevel();
                }
            });
        }
    });

    // Глобальная функция для выбора трубы
    window.choosePipe = function(type) {
        if (currentLevel) currentLevel.choosePipe(type);
    };

    // Подстройка под размер окна
    if (currentLevel) currentLevel.adjustLayoutForViewport();
    window.addEventListener('resize', () => {
        if (currentLevel) currentLevel.adjustLayoutForViewport();
    });

    console.log('Level4 initialization complete');
});

