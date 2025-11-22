class Level5 extends BaseLevel {
    constructor() {
        super({
            rows: 7,
            cols: 5,
            hasRedZones: true,
            hasYellowZones: true,
            hasWhiteZones: true,
            hasGaziks: true,
            hasFixedPipes: true,
            gaziksCount: 1
        });

        // Простые фиксированные трубы - создают обязательный маршрут
        this.FIXED_PIPES = [
            { r: 1, c: 1, type: 'LU' },
            { r: 3, c: 0, type: 'V' },
            { r: 4, c: 2, type: 'LD' }
        ];

        // Специальные зоны
        this.SPECIAL_ZONE_POSITIONS = [
            [1, 0], [3, 1], [5, 2]
        ];

        // Диалоги при старте уровня
        this.DIALOGS = [
            'Прокладывать путь к мечте самому - это потрясающе! Но в жизни не всегда все идет так гладко, как хотелось бы.',
            'На твоем пути встречаются преграды, которые невозможно просто проигнорировать и обойти.',
            'Эти фиксированные трубы создают обязательный маршрут. Придется играть по правилам!'
        ];

        this.RED_ZONE_QUESTIONS = [
            {
                q: "Вам звонят из 'технической поддержки Microsoft', утверждают, что ваш компьютер заражен вирусом, и просят установить программу для удаленного доступа 'для устранения проблемы'. Что вы сделаете?",
                answers: [
                    { text: "Разрешить доступ - специалисты должны помочь", correct: false },
                    { text: "Немедленно прервать звонок и заблокировать номер", correct: true },
                    { text: "Спросить у оператора сертификаты и лицензии", correct: false }
                ]
            },
            {
                q: "В социальной сети вам предлагают участие в 'секретном инвестиционном клубе' с доступом по приглашению. Участники публикуют скриншоты огромных доходов. Это выглядит легитимно, потому что:",
                answers: [
                    { text: "Много реальных людей делятся успехами", correct: false },
                    { text: "Это классическая пирамида, где доход первых участников оплачивается взносами новых", correct: true },
                    { text: "Есть подробное описание инвестиционной стратегии", correct: false }
                ]
            },
            {
                q: "Вам приходит SMS: 'Ваш номер выиграл в лотерее. Для получения приза 500 000 ₽ оплатите комиссию 5000 ₽'. Что скрывается за этим предложением?",
                answers: [
                    { text: "Настоящая лотерея, нужно просто оплатить небольшую комиссию", correct: false },
                    { text: "После оплаты вас попросят внести еще деньги для 'оформления документов'", correct: true },
                    { text: "Это тестовое сообщение от банка для проверки бдительности", correct: false }
                ]
            }
        ];

        this.YELLOW_ZONE_QUESTIONS = [
            {
                q: "У вас есть 100 000 ₽. Вы хотите купить новую технику, но также есть возможность досрочно погасить часть кредита под 15% годовых. Что экономически выгоднее?",
                answers: [
                    { text: "Купить технику - она нужна прямо сейчас", correct: false },
                    { text: "Досрочно погасить кредит - это сэкономит больше денег в долгосрочной перспективе", correct: true },
                    { text: "Положить на депозит под 5% и продолжать платить кредит", correct: false }
                ]
            },
            {
                q: "Вам предложили две кредитные карты: одна с льготным периодом 100 дней, но высокой процентной ставкой, другая - без льготного периода, но с низкой ставкой. Вы планируете пользоваться картой регулярно. Какую выбрать?",
                answers: [
                    { text: "С льготным периодом - главное не платить проценты первые 100 дней", correct: false },
                    { text: "С низкой процентной ставкой - при регулярном использовании это выгоднее", correct: true },
                    { text: "Любую - разницы нет", correct: false }
                ]
            }
        ];

        this.WHITE_ZONE_QUESTIONS = [
            {
                q: "Что такое 'сложный процент' и почему его называют 'восьмым чудом света' в финансах?",
                answers: [
                    { text: "Это когда проценты начисляются только на первоначальную сумму вклада", correct: false },
                    { text: "Это начисление процентов на проценты, что позволяет капиталу расти экспоненциально", correct: true },
                    { text: "Особо высокий процент по вкладам для избранных клиентов", correct: false }
                ]
            },
            {
                q: "Что из перечисленного НЕ является способом диверсификации инвестиционного портфеля?",
                answers: [
                    { text: "Вложение в акции компаний разных отраслей", correct: false },
                    { text: "Распределение средств между акциями, облигациями и недвижимостью", correct: false },
                    { text: "Инвестирование всех средств в акции самой надежной компании", correct: true }
                ]
            }
        ];

        // Продукты банка
        this.BANK_PRODUCTS = [
            {
                name: "Открытие брокерского счета",
                description: "Без комиссий - пополнение в рублях с карты Газпромбанка, Бесплатный курс - теория, задания, эфиры с экспертами"
            },
        ];

        this.init();
    }

    placeSpecialZones() {
        console.log('Placing zones for Level5...');
        const zoneTypes = ['red', 'yellow', 'white'];

        this.SPECIAL_ZONE_POSITIONS.forEach(([r, c], i) => {
            const cell = this.getCell(r, c);
            if (!cell || cell.classList.contains('start') || cell.classList.contains('goal') || cell.dataset.pipeFixed) return;

            const zoneType = zoneTypes[i % zoneTypes.length];
            cell.classList.add(`${zoneType}-zone`);
            cell.textContent = '?';
        });
    }

    // Указываем путь к следующему уровню
    getNextLevelPath() {
        return '../level6/level6.html';
    }
}

// Инициализация уровня
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Level5...');
    currentLevel = new Level5();

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

    console.log('Level5 initialization complete');
});
