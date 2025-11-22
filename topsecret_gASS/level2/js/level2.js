class Level2 extends BaseLevel {
    constructor() {
        const config = {
            rows: 7,
            cols: 5,
            hasYellowZones: true,
            hasGaziks: true,
            gaziksCount: 2,
        };
        super(config);

        // Переопределяем контент для уровня 2
        this.YELLOW_ZONE_QUESTIONS = [
            {
                q: "Что лучше: тратить все деньги сразу или откладывать часть?",
                answers: [
                    { text: "Откладывать 10-20% от дохода", correct: true },
                    { text: "Тратить все, жизнь одна", correct: false },
                    { text: "Брать кредиты на все покупки", correct: false }
                ]
            },
            {
                q: "Какой минимальный размер 'финансовой подушки'?",
                answers: [
                    { text: "3-6 месячных доходов", correct: true },
                    { text: "1 месячный доход", correct: false },
                    { text: "Достаточно 10 000 рублей", correct: false }
                ]
            },
            {
                q: "Что выгоднее: дебетовая карта с кешбэком или кредитная?",
                answers: [
                    { text: "Дебетовая с кешбэком для повседневных трат", correct: true },
                    { text: "Кредитная для всех покупок", correct: false },
                    { text: "Не важно, главное красивая карта", correct: false }
                ]
            },
            {
                q: "Нужно ли страховать крупные покупки?",
                answers: [
                    { text: "Да, особенно технику и недвижимость", correct: true },
                    { text: "Нет, это лишние траты", correct: false },
                    { text: "Только если очень дорогие", correct: false }
                ]
            },
            {
                q: "Как правильно планировать бюджет?",
                answers: [
                    { text: "Учитывать все доходы и расходы", correct: true },
                    { text: "Тратить по настроению", correct: false },
                    { text: "Просить у родителей при нехватке", correct: false }
                ]
            },
            {
                q: "Что такое кредитная история?",
                answers: [
                    { text: "История всех ваших кредитов и платежей", correct: true },
                    { text: "Список всех банков, где вы были", correct: false },
                    { text: "История ваших покупок за год", correct: false }
                ]
            }
        ];

        this.BANK_PRODUCTS = [
            {
                name: "Газпромбанк Мобайл",
                description: "Скидка 50% новым абонентам на все годовые тарифы"
            },
            {
                name: "Gazprom Pay",
                description: "Бесконтактная оплата смартфоном в магазинах и интернете в одно касание. Безопасно, удобно, выгодно"
            },
            {
                name: "Умная дебетовая карта 'Мир'",
                description: "100% кэшбэк в супермаркетах"
            },
        ];

        this.DIALOGS = [
            'Ты отлично справился! Не дал мошенникам себя обмануть и сохранил большую часть ФинГаза!',
            'Но все не так просто, впереди тебя ждут новые испытания.',
            'В этот раз ты попал в желтую зону. Зона будет всячески подталкивать тебя неграмотно распорядится финансами,',
            'Твоя же задача - обуздать свои желания и правильно распорядится ресурсами, ответив на вопросы по финансовой грамотности.',
            'Повторюсь, если ты неправильно ответишь на вопросы, то потеряешь часть ФинГаза.'
        ];

        this.SPECIAL_ZONE_POSITIONS = [
            [5, 2], [4, 1], [3, 3], [2, 0], [1, 3], [3, 4]
        ];

        // Явно вызываем инициализацию после установки всех свойств
        this.init();
    }

    getNextLevelPath() {
        return '../level3/level3.html';
    }

}

// Инициализация уровня
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Level2...');
    currentLevel = new Level2();

     // Кнопки "Следующий уровень" на уровне 2
     const nextLevelButtons = [
            document.getElementById('nextLevel'),        // dailyModal
            document.getElementById('nextLevelResult')   // resultModal
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
        console.log('Choosing pipe:', type);
        if (currentLevel) {
            currentLevel.choosePipe(type);
        }
    };

    // Адаптация layout
    if (currentLevel) {
        currentLevel.adjustLayoutForViewport();
    }
    window.addEventListener('resize', () => {
        if (currentLevel) {
            currentLevel.adjustLayoutForViewport();
        }
    });

    console.log('Level2 initialization complete');
});
