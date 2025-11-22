// level3.js - УРОВЕНЬ 3 НА ОСНОВЕ BaseLevel
class Level3 extends BaseLevel {
    constructor() {
        const config = {
            rows: 7,
            cols: 5,
            hasWhiteZones: true
        };
        super(config);

        // Переопределяем контент для уровня 3
        this.WHITE_ZONE_QUESTIONS = [
            {
                q: "Что лучше всего делать с кредитной картой, чтобы не переплачивать?",
                answers: [
                    { text: "Снимать с неё наличные при каждой возможности", correct: false },
                    { text: "Оплачивать покупки полностью каждый месяц", correct: true },
                    { text: "Использовать только половину лимита карты", correct: false }
                ]
            },
            {
                q: "Что из этого является инвестициями?",
                answers: [
                    { text: "Покупка акций компании", correct: true },
                    { text: "Покупка нового смартфона", correct: false },
                    { text: "Оплата ежемесячного мобильного тарифа", correct: false }
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
                q: "Почему важно иметь финансовую подушку безопасности?",
                answers: [
                    { text: "Чтобы тратить больше денег на развлечения", correct: false },
                    { text: "Чтобы иметь средства на непредвиденные расходы", correct: true },
                    { text: "Чтобы брать кредиты чаще", correct: false }
                ]
            },
            {
                q: "Что такое процент по кредиту?",
                answers: [
                    { text: "Дополнительная сумма, которую банк начисляет на ваш долг", correct: true },
                    { text: "Скидка за быстрое погашение кредита", correct: false },
                    { text: "Ежемесячная комиссия за использование карты", correct: false }
                ]
            }
        ];

        this.DIALOGS = [
            'Новый уровень – Новые приключения!',
            'В этот раз можешь немного расслабиться, не будет никакого подвоха: ни мошенников, ни соблазна потратить все свои сбережения.',
            'Встречай белую зону бонусов: чтобы получить дополнительные Рублики, тебе всё ещё нужно правильно ответить на вопрос.',
            'Не бойся, эта зона никак не влияет на поток ФинГаза, так что если ответишь неправильно - потеряешь только шанс заработать бонусные Рублики.'
        ];

        this.SPECIAL_ZONE_POSITIONS = [
            [0, 0], [5, 0], [2, 1], [3, 3]
        ];

        // Явно вызываем инициализацию после установки всех свойств
        this.init();
    }

    getNextLevelPath() {
        return '../level4/level4.html';
    }
}

// Инициализация уровня
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Level3...');
    currentLevel = new Level3();

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

    console.log('Level3 initialization complete');
});