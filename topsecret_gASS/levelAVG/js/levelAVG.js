class BaseLevel {
    constructor(config) {
        this.config = config;
        // Основные настройки уровня
        this.rows = config.rows || 7;
        this.cols = config.cols || 5;

        // Настройки зон из конфига
        this.hasRedZones = config.hasRedZones || false;
        this.hasYellowZones = config.hasYellowZones || false;
        this.hasWhiteZones = config.hasWhiteZones || false;
        this.hasGaziks = config.hasGaziks || false;
        this.gaziksCount = config.gaziksCount || 2;
        this.hasFixedPipes = config.hasFixedPipes || false;
        this.FIXED_PIPES = config.fixedPipes || [];
        this.currentPath = [];

        this.gaziksCollected = Number(localStorage.getItem('fg_gaziks')) || 0;
        this.initProductModal();   // <-- один раз, чтобы модалка продукта работала


        // Конфигурация поведения зон
        this.ZONE_CONFIG = {
            red: {
                introModal: 'redZoneIntroModal',
                introClose: 'redZoneIntroClose',
                correctReward: { rubles: 15, finGas: 0 },
                incorrectPenalty: { rubles: 0, finGas: -25 },
                correctMessage: '+15 ₽',
                incorrectMessage: '-25 ФинГаза',
                floatingTextColor: { correct: 'gold', incorrect: 'red' }
            },
            yellow: {
                introModal: 'yellowZoneIntroModal',
                introClose: 'yellowZoneIntroClose',
                correctReward: { rubles: 15, finGas: 0 },
                incorrectPenalty: { rubles: -25, finGas: -25 },
                correctMessage: '+15 ₽',
                incorrectMessage: '-25 ₽, -25 ФинГаза',
                floatingTextColor: { correct: 'gold', incorrect: 'red' }
            },
            white: {
                introModal: 'whiteZoneIntroModal',
                introClose: 'whiteZoneIntroClose',
                correctReward: { rubles: 15, finGas: 0 },
                incorrectPenalty: { rubles: 0, finGas: 0 },
                correctMessage: '+15 ₽',
                incorrectMessage: 'Увы :(',
                floatingTextColor: { correct: 'gold', incorrect: '#ff6600' }
            }
        };

        // Игровые переменные
        this.grid = [];
        this.selectedPipeType = null;
        this.rubles = Number(localStorage.getItem('fg_rub')) || 100;
        this.finGas = Number(localStorage.getItem('fg_gas')) || 100;
        this.dialogIndex = 0;
        this.currentDialog = null;
        this.pipesUsed = 0;
        this.correctAnswers = 0;
        //this.gaziksCollected = 0;
        this.usedQuestions = new Set();
        this.lastPlacedCell = null;
        this.flowInProgress = false;
        this.lastClickedCell = null;
        this.afterGazikCallback = null;
        this.isFirstPipeDialogActive = false;

        // Флаги просмотренных инструкций
        this.hasSeenRedZoneIntro = false;
        this.hasSeenYellowZoneIntro = false;
        this.hasSeenWhiteZoneIntro = false;
        this.hasSeenGazikiIntro = false;

        // Константы
        this.DIRS = { t: [-1, 0], r: [0, 1], b: [1, 0], l: [0, -1] };
        this.OPP = { t: 'b', b: 't', l: 'r', r: 'l' };
        this.DIR_KEYS = Object.keys(this.DIRS);

        this.TYPE_DEFS = {
            H:  { dirs: ["l", "r"], img: "images/H.png", fixedImg: "images/H_fixed.png" },
            V:  { dirs: ["t", "b"], img: "images/V.png", fixedImg: "images/V_fixed.png" },
            LD: { dirs: ["l", "b"], img: "images/LD.png", fixedImg: "images/LD_fixed.png" },
            RD: { dirs: ["r", "b"], img: "images/RD.png", fixedImg: "images/RD_fixed.png" },
            LU: { dirs: ["l", "t"], img: "images/LU.png", fixedImg: "images/LU_fixed.png" },
            UR: { dirs: ["r", "t"], img: "images/UR.png", fixedImg: "images/UR_fixed.png" }
        };

        // Должны быть переопределены в потомках
        this.FINANCE_QUESTIONS = [];
        this.BANK_PRODUCTS = [];
        this.DIALOGS = [];
        this.FIRST_PIPE_DIALOGS = [];
        this.SPECIAL_ZONE_POSITIONS = [];

    }

    init() {
        this.bindElements();
        this.initProductModal();       // модалка продукта
        this.initGazikConversion();
        this.initBoard();
        this.bindEvents();
        this.updateHUD();

        this.gaziksCollected = parseInt(localStorage.getItem('fg_gaziks')) || 0;
        this.finGas = parseInt(localStorage.getItem('fg_gas')) || 100;

        const finGasElement = document.getElementById('finGas');
        const convertModal = document.getElementById('convertGazikModal');
        const gaziksDisplay = document.getElementById('gaziksCountDisplay');

        if (finGasElement && convertModal && gaziksDisplay) {
            finGasElement.addEventListener('click', () => {
                gaziksDisplay.textContent = this.gaziksCollected || 0;
                convertModal.setAttribute('aria-hidden', 'false');
            });
        }

        if (this.DIALOGS && this.DIALOGS.length > 0) {
            this.showDialog(this.DIALOGS, 'intro');
        }
    }

    bindElements() {
        console.log('Binding elements...');

        // Основные элементы интерфейса
        this.boardEl = document.getElementById('board');
        this.dialogOverlay = document.getElementById('dialogOverlay');
        this.dialogTextOverlay = document.getElementById('dialogTextOverlay');
        this.nextBtnOverlay = document.getElementById('nextBtnOverlay');
        this.rublesEl = document.getElementById('rubles');
        this.finGasEl = document.getElementById('finGas');
        this.quizModal = document.getElementById('quizModal');
        this.quizAnswers = document.getElementById('quizAnswers');
        this.resultModal = document.getElementById('resultModal');
        this.resultNote = document.getElementById('resultNote');
        this.closeResult = document.getElementById('closeResult');
        this.dailyModal = document.getElementById('dailyModal');
        this.exitToMenu = document.getElementById('exitToMenu');
        this.nextLevelBtn = document.getElementById('nextLevel');
        this.playerNameEl = document.getElementById('playerName');
        this.bonusInfo = document.getElementById('bonusInfo');
        this.deadEndModal = document.getElementById('deadEndModal');
        this.undoYes = document.getElementById('undoYes');
        this.undoNo = document.getElementById('undoNo');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.restartBtn = document.getElementById('restartBtn');
        this.toMenuBtn = document.getElementById('toMenuBtn');

        //газики
        this.gaziksEl = document.getElementById('gaziks');
        //


        // Элементы для специальных зон
        this.redZoneIntroModal = document.getElementById('redZoneIntroModal');
        this.redZoneIntroClose = document.getElementById('redZoneIntroClose');
        this.yellowZoneIntroModal = document.getElementById('yellowZoneIntroModal');
        this.yellowZoneIntroClose = document.getElementById('yellowZoneIntroClose');
        this.whiteZoneIntroModal = document.getElementById('whiteZoneIntroModal');
        this.whiteZoneIntroClose = document.getElementById('whiteZoneIntroClose');
        this.gazikIntroModal = document.getElementById('gazikIntroModal');
        this.gazikIntroClose = document.getElementById('gazikIntroClose');
        this.productModal = document.getElementById('productModal');
        this.productClose = document.getElementById('productClose');
        this.productInfo = document.getElementById('productInfo');

        this.fixedPipesFailModal = document.getElementById('fixedPipesFailModal');
        this.fixedPipesFailMenu = document.getElementById('fixedPipesFailMenu');
        this.fixedPipesFailRestart = document.getElementById('fixedPipesFailRestart');

        console.log('Board element:', this.boardEl);

        if (this.fixedPipesFailMenu) {
            this.fixedPipesFailMenu.addEventListener('click', () => {
                if (this.fixedPipesFailModal) {
                    this.fixedPipesFailModal.setAttribute('aria-hidden', 'true');
                }
                window.location.href = '../menu.html';
            });
        }

        if (this.fixedPipesFailRestart) {
            this.fixedPipesFailRestart.addEventListener('click', () => {
                if (this.fixedPipesFailModal) {
                    this.fixedPipesFailModal.setAttribute('aria-hidden', 'true');
                }
                location.reload();
            });
        }
    }
    // !!!Кнопка перехода на другой уровень
    goToNextLevel() {
            const nextLevelPath = this.getNextLevelPath();
            if (nextLevelPath) {
                localStorage.setItem('fg_gaziks', this.gaziksCollected);
                window.location.href = nextLevelPath;
            } else {
                console.warn('Путь к следующему уровню не задан');
            }
        }

        // Должен быть переопределён в конкретном уровне
        getNextLevelPath() {
            return null;
        }

    initBoard() {
        if (!this.boardEl) {
            console.error('Board element not found!');
            return;
        }

        console.log('Initializing board...');
        this.boardEl.innerHTML = '';
        this.grid = [];
        this.boardEl.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        this.boardEl.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.addEventListener('click', () => this.onCellClick(r, c));
                this.boardEl.appendChild(cell);
                row.push(cell);
            }
            this.grid.push(row);
        }

        // Старт и финиш
        const start = this.getCell(this.rows - 1, 0);
        if (start) {
            start.classList.add('start');
            this.renderPipe(start, 'H');
        }

        const goal = this.getCell(0, this.cols - 1);
        if (goal) {
            goal.classList.add('goal');
            this.renderPipe(goal, 'V');
        }

        // Размещаем специальные зоны
        this.placeSpecialZones();

        // Размещаем газики если нужно
        if (this.hasGaziks) {
            this.spawnGazik();
        }

        if (this.hasFixedPipes) {
            this.placeFixedPipes();
        }

        this.updateHUD();
        this.highlightCell(this.rows - 1, 0, 1200);
    }

    placeSpecialZones() {
        if (!this.SPECIAL_ZONE_POSITIONS || this.SPECIAL_ZONE_POSITIONS.length === 0) {
            console.log('No special zone positions defined');
            return;
        }

        console.log('Placing special zones:', this.SPECIAL_ZONE_POSITIONS);

        this.SPECIAL_ZONE_POSITIONS.forEach(([r, c]) => {
            const cell = this.getCell(r, c);
            if (!cell || cell.classList.contains('start') || cell.classList.contains('goal')) return;

            if (this.hasRedZones) {
                cell.classList.add('red-zone');
                cell.textContent = '?';
            } else if (this.hasYellowZones) {
                cell.classList.add('yellow-zone');
                cell.textContent = '?';
            } else if (this.hasWhiteZones) {
                cell.classList.add('white-zone');
                cell.textContent = '?';
            }
        });
    }

    placeFixedPipes() {
        if (!this.FIXED_PIPES || this.FIXED_PIPES.length === 0) return;

        console.log('Placing fixed pipes:', this.FIXED_PIPES);

        this.FIXED_PIPES.forEach(pipe => {
            const cell = this.getCell(pipe.r, pipe.c);
            if (!cell ||
                cell.classList.contains('start') ||
                cell.classList.contains('goal') ||
                cell.classList.contains('gazik')) return;

            this.renderPipe(cell, pipe.type, { fixed: true });
        });
    }

    spawnGazik() {
        if (!this.hasGaziks) return;

        let placed = 0;
        const maxAttempts = 50;
        const count = this.gaziksCount; // Используем настройку из конфига

        while (placed < count && maxAttempts > 0) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            const cell = this.getCell(r, c);

            if (cell && !cell.dataset.pipe &&
                !cell.classList.contains('start') &&
                !cell.classList.contains('goal') &&
                !cell.classList.contains('red-zone') &&
                !cell.classList.contains('yellow-zone') &&
                !cell.classList.contains('white-zone') &&
                !cell.classList.contains('gazik') &&
                !cell.dataset.pipeFixed) {
                cell.classList.add('gazik');
                cell.textContent = '🔥';
                placed++;
            }
        }
    }

    highlightCell(r, c, ms = 700) {
        const cell = this.getCell(r, c);
        if (!cell) return;
        cell.classList.add('tutorial');
        setTimeout(() => cell.classList.remove('tutorial'), ms);
    }

    choosePipe(type) {
        this.selectedPipeType = type;
        document.querySelectorAll('.pipe-buttons .btn, .pipe-buttons-mobile .btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset && btn.dataset.type === type) btn.classList.add('active');
        });
    }

    hasAdjacentPipe(r, c) {
        for (const dir of this.DIR_KEYS) {
            const [dr, dc] = this.DIRS[dir];
            const neigh = this.getCell(r + dr, c + dc);
            if (!neigh) continue;
            if (neigh.dataset.pipe || neigh.classList.contains('start') || neigh.classList.contains('goal')) {
                return true;
            }
        }
        return false;
    }

    canConnectPipe(r, c, type) {
        if (!this.TYPE_DEFS[type]) return false;
        const dirs = this.getPipeDirsFromType(type);
        const targetCell = this.getCell(r, c);

        // Нельзя ставить трубу на фиксированную
        if (targetCell && targetCell.dataset.pipeFixed) return false;

        let connected = false;

        for (const dir of dirs) {
            const [dr, dc] = this.DIRS[dir];
            const neigh = this.getCell(r + dr, c + dc);
            if (!neigh || (!neigh.dataset.pipe && !neigh.classList.contains('start') && !neigh.classList.contains('goal'))) continue;

            const neighDirs = this.getPipeDirsFromCell(neigh);
            const opp = this.OPP[dir];

            if (!neighDirs.includes(opp)) {
                return false;
            } else {
                connected = true;
            }
        }

        for (const dirKey of this.DIR_KEYS) {
            const [dr, dc] = this.DIRS[dirKey];
            const neigh = this.getCell(r + dr, c + dc);
            if (!neigh || (!neigh.dataset.pipe && !neigh.classList.contains('start') && !neigh.classList.contains('goal'))) continue;

            const neighDirs = this.getPipeDirsFromCell(neigh);
            const opp = this.OPP[dirKey];

            if (neighDirs.includes(opp) && !dirs.includes(dirKey)) {
                return false;
            }
        }

        return connected;
    }

    onCellClick(r, c) {
        console.log('Cell clicked:', r, c);
        const cell = this.getCell(r, c);
        if (!cell) return;
        if (cell.classList.contains('start') || cell.classList.contains('goal')) return;

        if (cell.dataset.pipe) {
            cell.animate([{transform:'scale(1)'},{transform:'scale(1.04)'},{transform:'scale(1)'}], {duration:180});
            return;
        }

        if (!this.selectedPipeType) {
            alert('Сначала выберите трубу внизу.');
            return;
        }

        if (!this.hasAdjacentPipe(r, c)) {
            alert('Нельзя ставить трубу сюда: нет соседней трубы или стартовой клетки!');
            return;
        }

        if (!this.canConnectPipe(r, c, this.selectedPipeType)) {
            alert('Эта труба не стыкуется с соседними!');
            return;
        }

        this.lastClickedCell = cell;
        this.handleSpecialCell(cell);
    }

    handleSpecialCell(cell) {
        if (cell.classList.contains('red-zone')) {
            this.handleZone(cell, 'red');
        } else if (cell.classList.contains('yellow-zone')) {
            this.handleZone(cell, 'yellow');
        } else if (cell.classList.contains('white-zone')) {
            this.handleZone(cell, 'white');
        } else if (cell.classList.contains('gazik')) {
            this.handleGazik(cell);
        } else {
            this.placeRegularPipe(cell);
        }
    }

    // УНИВЕРСАЛЬНЫЙ МЕТОД ДЛЯ ВСЕХ ТИПОВ ЗОН
    handleZone(cell, zoneType) {
        const introFlag = `hasSeen${zoneType.charAt(0).toUpperCase() + zoneType.slice(1)}ZoneIntro`;

        if (!this[introFlag]) {
            this[introFlag] = true;
            this.showZoneIntro(cell, zoneType);
        } else {
            this.openFinanceQuiz(cell, zoneType);
        }
    }

    // УНИВЕРСАЛЬНЫЙ МЕТОД ДЛЯ ИНТРО ЗОН
    showZoneIntro(cell, zoneType) {
        const zoneConfig = this.ZONE_CONFIG[zoneType];
        const modal = this[zoneConfig.introModal];
        const closeBtn = this[zoneConfig.introClose];

        if (modal && closeBtn) {
            modal.setAttribute('aria-hidden', 'false');
            closeBtn.onclick = () => {
                modal.setAttribute('aria-hidden', 'true');
                this.openFinanceQuiz(cell, zoneType);
            };
        } else {
            this.openFinanceQuiz(cell, zoneType);
        }
    }

    // Универсальный метод для финансовых квизов с поддержкой всех зон
    openFinanceQuiz(cell) {
        // Определяем тип зоны по классу ячейки
        let zoneType = null;
        if (cell.classList.contains('red-zone')) zoneType = 'red';
        else if (cell.classList.contains('yellow-zone')) zoneType = 'yellow';
        else if (cell.classList.contains('white-zone')) zoneType = 'white';
        else {
            console.warn('Зона не определена для этой ячейки');
            this.placeRegularPipe(cell);
            return;
        }

        //Выбираем список вопросов для соответствующей зоны
        let questionList = [];
        switch (zoneType) {
            case 'red':
                questionList = this.RED_ZONE_QUESTIONS;
                break;
            case 'yellow':
                questionList = this.YELLOW_ZONE_QUESTIONS;
                break;
            case 'white':
                questionList = this.WHITE_ZONE_QUESTIONS;
                break;
        }

        //Проверка: есть ли вопросы для этой зоны
        if (!questionList || questionList.length === 0) {
            console.warn(`Нет вопросов для ${zoneType}-зоны`);
            this.placeRegularPipe(cell);
            return;
        }

        // Выбираем случайный вопрос (без повторов)
        let availableQuestions = questionList.filter(q => !this.usedQuestions.has(q.q));
        if (availableQuestions.length === 0) {
            this.usedQuestions.clear();
            availableQuestions = questionList.slice();
        }
        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.usedQuestions.add(question.q);

        // Обновляем заголовок модального окна в зависимости от зоны
        const modalTitle = document.querySelector('#quizModal h3');
        if (modalTitle) {
            if (zoneType === 'red') modalTitle.textContent = 'Красная зона';
            if (zoneType === 'yellow') modalTitle.textContent = 'Жёлтая зона';
            if (zoneType === 'white') modalTitle.textContent = 'Белая зона';
        }

        // Устанавливаем текст вопроса
        const quizQuestionEl = document.getElementById('quizQuestion');
        if (quizQuestionEl) quizQuestionEl.textContent = question.q;

        // Очищаем старые ответы и создаём новые кнопки
        this.quizAnswers.innerHTML = '';
        question.answers.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt.text;
            btn.className = 'btn';
            btn.addEventListener('click', () => {
                // Обработка ответа
                this.handleQuizAnswer(opt.correct, zoneType, cell);
            });
            this.quizAnswers.appendChild(btn);
        });

        // Показываем модалку
        if (this.quizModal) {
            this.quizModal.setAttribute('aria-hidden', 'false');
        }
    }


    // 💡 Вспомогательный метод обработки ответа
    handleQuizAnswer(isCorrect, zoneType, cell) {
        const zoneConfig = this.ZONE_CONFIG[zoneType];

        if (isCorrect) {
            this.correctAnswers++;
            this.applyReward(zoneConfig.correctReward);
            this.createFloatingText(cell, zoneConfig.correctMessage, zoneConfig.floatingTextColor.correct);
        } else {
            this.applyPenalty(zoneConfig.incorrectPenalty);
            this.createFloatingText(cell, zoneConfig.incorrectMessage, zoneConfig.floatingTextColor.incorrect);
        }

        this.updateHUD();

        // Убираем зону и не даём ей вернуться
        cell.classList.remove('red-zone', 'yellow-zone', 'white-zone');
        cell.dataset.zoneCleared = 'true';

        // Ставим обычную трубу
        this.placeRegularPipe(cell);

        // Закрываем модалку
        if (this.quizModal) {
            this.quizModal.setAttribute('aria-hidden', 'true');
        }
    }



    // УНИВЕРСАЛЬНЫЕ МЕТОДЫ ДЛЯ НАГРАД И ШТРАФОВ
    applyReward(reward) {
        if (reward.rubles) this.rubles += reward.rubles;
        if (reward.finGas) this.finGas += reward.finGas;
    }

    applyPenalty(penalty) {
        if (penalty.rubles) this.rubles = Math.max(0, this.rubles + penalty.rubles);
        if (penalty.finGas) this.finGas = Math.max(0, this.finGas + penalty.finGas);
    }

    handleGazik(cell) {
        const MAX_GAZIKS = 3;

        // Если уже есть максимум газиков, просто убираем газик и ставим трубу
        if (this.gaziksCollected >= MAX_GAZIKS) {
            // Убираем газик с клетки
            cell.classList.remove('gazik');
            cell.textContent = '';

            // Создаем анимацию исчезновения газика
            this.createFloatingText(cell, 'Лимит газиков!', '#ff6600');

            // Ставим обычную трубу
            this.placeRegularPipe(cell);
            return;
        }

        // Стандартная логика для сбора газиков
        if (!this.hasSeenGazikiIntro) {
            this.hasSeenGazikiIntro = true;
            this.showGazikiIntro(cell);
        } else {
            this.collectGazik(cell, () => {
                this.placeRegularPipe(cell);
            });
        }
    }

    showGazikiIntro(cell) {
        if (this.gazikIntroModal) {
            this.gazikIntroModal.setAttribute('aria-hidden', 'false');
            if (this.gazikIntroClose) {
                this.gazikIntroClose.onclick = () => {
                    this.gazikIntroModal.setAttribute('aria-hidden', 'true');
                    this.collectGazik(cell, () => {
                        this.placeRegularPipe(cell);
                    });
                };
            }
        } else {
            this.collectGazik(cell, () => {
                this.placeRegularPipe(cell);
            });
        }
    }

    // ======================
    // Методы работы с газиками
    // ======================

    collectGazik(cell, callback) {
        const MAX_GAZIKS = 3;

        // Проверяем лимит газиков (дополнительная проверка)
        if (this.gaziksCollected >= MAX_GAZIKS) {
            // Просто выполняем callback чтобы поставить трубу
            if (callback) callback();
            return;
        }

        // Остальной код метода остается без изменений
        if (!this.BANK_PRODUCTS || this.BANK_PRODUCTS.length === 0) {
            console.warn('BANK_PRODUCTS не определены для этого уровня');
            this.finGas += 5;
            this.gaziksCollected++;

            if (cell) {
                this.createImageFloatingText(cell, '+', 'images/gazik.png', '#2a7ade', 'gazik-floating');
                cell.classList.remove('gazik');
            }

            this.updateHUD();
            localStorage.setItem('fg_gaziks', this.gaziksCollected);
            localStorage.setItem('fg_finGas', this.finGas);

            if (callback) callback();
            return;
        }

        // Если есть продукты — показываем модалку с продуктом
        const product = this.BANK_PRODUCTS[Math.floor(Math.random() * this.BANK_PRODUCTS.length)];

        if (this.productInfo) {
            this.productInfo.innerHTML = `
                <h4>${product.name}</h4>
                <p>${product.description}</p>
            `;
        }

        if (this.productModal) {
            this.productModal.setAttribute('aria-hidden', 'false');
            this.afterGazikCallback = () => {
                this.gaziksCollected++;
                localStorage.setItem('fg_gaziks', this.gaziksCollected); // сохраняем прогресс

                if (cell) {
                    this.createImageFloatingText(cell, '+', 'images/gazik.png', '#2a7ade', 'gazik-floating');
                    cell.classList.remove('gazik');
                }

                this.updateHUD();

                if (callback) callback();
            };
        } else {
            // Без модалки
            this.gaziksCollected++;
            localStorage.setItem('fg_gaziks', this.gaziksCollected);

            if (cell) {
                this.createImageFloatingText(cell, '+', 'images/gazik.png', '#2a7ade', 'gazik-floating');
                cell.classList.remove('gazik');
            }

            this.updateHUD();

            if (callback) callback();
        }
    }

    // ======================
    // Обработчик закрытия модалки продукта
    // ======================
    initProductModal() {
        this.productClose = document.getElementById('productClose');
        this.productModal = document.getElementById('productModal');

        if (!this.productClose || !this.productModal) return;

        const openProductModal = () => {
            this.showModal(this.productModal);
        };

        const closeProductModal = () => {
            this.closeModal(this.productModal, this.lastClickedCell || document.body);
            if (this.afterGazikCallback) {
                this.afterGazikCallback();
                this.afterGazikCallback = null;
            }
        };

        this.productClose.addEventListener('click', closeProductModal);
    }

    // ======================
    // Методы конвертации газиков
    // ======================
    initGazikConversion() {
        const finGasElement = document.getElementById('finGas');
        const convertModal = document.getElementById('convertGazikModal');
        const closeBtn = document.getElementById('closeConvertModal');
        const convertBtn = document.getElementById('convertOneGazik');
        const gaziksDisplay = document.getElementById('gaziksCountDisplay');

        if (!finGasElement || !convertModal || !closeBtn || !convertBtn || !gaziksDisplay) return;

        // используем стрелочные функции, чтобы this ссылался на экземпляр класса
        const openConvertModal = () => {
            gaziksDisplay.textContent = this.gaziksCollected || 0;
            this.showModal(convertModal);
        };

        const closeConvertModal = () => {
            this.closeModal(convertModal, finGasElement);
        };

        finGasElement.addEventListener('click', openConvertModal);
        closeBtn.addEventListener('click', closeConvertModal);

        convertBtn.addEventListener('click', () => {
            if (this.gaziksCollected > 0) {
                this.gaziksCollected--;
                this.finGas = Math.min(this.finGas + 25, 100);
                this.updateHUD();
                gaziksDisplay.textContent = this.gaziksCollected;
                localStorage.setItem('fg_gaziks', this.gaziksCollected);
                localStorage.setItem('fg_finGas', this.finGas);

                if (this.gaziksCollected === 0) {
                    setTimeout(closeConvertModal, 500);
                }
            } else {
                alert('У тебя нет газиков для обмена!');
            }
        });
    }




    // Прямой вызов конвертации (если нужно из кода)
    convertGazikToFinGas() {
        if (this.gaziksCollected > 0) {
            this.gaziksCollected--;
            this.finGas = Math.min(this.finGas + 25, 100);
            localStorage.setItem('fg_gaziks', this.gaziksCollected);
            localStorage.setItem('fg_finGas', this.finGas);
            this.updateHUD();
            this.showFloatingText('+25 ФинГаза!', 'green');
        } else {
            alert('У тебя нет газиков для обмена!');
        }
    }


    // ======================
    // Универсальные методы открытия/закрытия модалки
    // ======================
    showModal(modal) {
        if (!modal) return;
        modal.removeAttribute('aria-hidden');
        modal.classList.add('open');
        modal.removeAttribute('inert');

        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
    }


    closeModal(modal, returnFocusTo = null) {
        if (!modal) return;

        // Перед скрытием переносим фокус обратно
        if (returnFocusTo) {
            returnFocusTo.focus();  // фокус до скрытия модалки
        }

        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
        modal.setAttribute('inert', ''); // можно добавить, чтобы заблокировать фокус
    }

    initModals() {
        // --------------------
        // Convert Gazik Modal
        // --------------------
        const convertModal = document.getElementById('convertGazikModal');
        const convertBtn = document.getElementById('convertOneGazik');
        const closeConvert = document.getElementById('closeConvertModal');
        const triggerConvert = document.getElementById('finGas');

        if (triggerConvert && convertModal) {
            triggerConvert.addEventListener('click', () => {
                this.showModal(convertModal);
            });
        }

        if (closeConvert && convertModal) {
            closeConvert.addEventListener('click', () => {
                this.closeModal(convertModal, triggerConvert);
            });
        }

        if (convertBtn) {
            convertBtn.addEventListener('click', () => {
                if (this.gaziksCollected > 0) {
                    this.gaziksCollected--;
                    this.finGas = Math.min(this.finGas + 25, 100);
                    this.updateHUD();

                    localStorage.setItem('fg_gaziks', this.gaziksCollected);
                    localStorage.setItem('fg_finGas', this.finGas);

                    if (this.gaziksCollected === 0) {
                        setTimeout(() => this.closeModal(convertModal, triggerConvert), 300);
                    }
                } else {
                    alert('У тебя нет газиков для обмена!');
                }
            });
        }

        // --------------------
        // Product Modal
        // --------------------
        const productModal = document.getElementById('productModal');
        const productClose = document.getElementById('productClose');
        const triggerProduct = this.lastClickedCell; // пример триггера

        if (productClose && productModal) {
            productClose.addEventListener('click', () => {
                this.closeModal(productModal, triggerProduct);
                if (this.afterGazikCallback) {
                    this.afterGazikCallback();
                    this.afterGazikCallback = null;
                }
            });
        }
    }



    placeRegularPipe(cell) {
        this.renderPipe(cell, this.selectedPipeType);
        this.pipesUsed++;
        this.lastPlacedCell = cell;

        // Проверка на тупик
        if (!this.pathStillPossible()) {
            setTimeout(() => {
                if (this.deadEndModal) {
                    this.deadEndModal.setAttribute('aria-hidden', 'false');
                }
            }, 300);
        }

        // Проверка диалога первой трубы
        if (this.pipesUsed === 1 && this.FIRST_PIPE_DIALOGS && this.FIRST_PIPE_DIALOGS.length > 0 && !this.isFirstPipeDialogActive) {
            this.isFirstPipeDialogActive = true;
            this.showDialog(this.FIRST_PIPE_DIALOGS, 'firstPipe');
            return;
        }

        this.checkFlow();
    }

    // ВАЖНО: ДОБАВЛЯЕМ МЕТОД ОТМЕНЫ ХОДА
    undoLastMove() {
        if (!this.lastPlacedCell) return;

        // Сохраняем ссылку на клетку перед очисткой
        const cellToClear = this.lastPlacedCell;

        // Очищаем клетку
        cellToClear.innerHTML = '';
        delete cellToClear.dataset.pipe;
        cellToClear.classList.remove('has-pipe');

        // Сбрасываем последнюю клетку
        this.lastPlacedCell = null;

        // Уменьшаем счетчик использованных труб
        this.pipesUsed = Math.max(0, this.pipesUsed - 1);

        // Сбрасываем флаг диалога первой трубы
        this.isFirstPipeDialogActive = false;

        console.log('Ход отменен. Осталось труб:', this.pipesUsed);
    }

    // ПОЛНАЯ ВЕРСИЯ ПРОВЕРКИ ПУТИ
    pathStillPossible() {
        const startCell = document.querySelector('.cell.start');
        const goalCell = document.querySelector('.cell.goal');
        if (!startCell || !goalCell) return false;

        const startR = Number(startCell.dataset.r);
        const startC = Number(startCell.dataset.c);
        const goalKey = `${goalCell.dataset.r},${goalCell.dataset.c}`;
        const maxDepth = this.rows * this.cols;

        const getTypeAtCellByCoords = (rr, cc, hypMap) => {
            const cell = this.getCell(rr, cc);
            if (!cell) return null;
            if (cell.dataset.pipe) return cell.dataset.pipe;
            const k = `${rr},${cc}`;
            return hypMap[k] || null;
        };

        const compatibleCandidate = (candidateType, rr, cc, hypMap) => {
            const candDirs = this.TYPE_DEFS[candidateType].dirs;
            for (const dirKey of this.DIR_KEYS) {
                const [dr, dc] = this.DIRS[dirKey];
                const nr = rr + dr, nc = cc + dc;
                const neigh = this.getCell(nr, nc);
                if (!neigh) continue;
                const neighType = getTypeAtCellByCoords(nr, nc, hypMap);
                if (!neighType) continue;
                const neighDirs = this.TYPE_DEFS[neighType].dirs;
                const opp = this.OPP[dirKey];

                if (neighDirs.includes(opp) && !candDirs.includes(dirKey)) return false;
                if (candDirs.includes(dirKey) && !neighDirs.includes(opp)) return false;
            }
            const target = this.getCell(rr, cc);
            if (target && target.dataset.pipeFixed) return false;
            return true;
        };

        const dfs = (rr, cc, hypMap, visited, depthLeft) => {
            if (depthLeft <= 0) return false;
            const key = `${rr},${cc}`;
            if (visited.has(key)) return false;
            visited.add(key);

            const cell = this.getCell(rr, cc);
            if (!cell) { visited.delete(key); return false; }
            if (cell.classList.contains('goal')) { visited.delete(key); return true; }

            const type = getTypeAtCellByCoords(rr, cc, hypMap);
            if (!type) { visited.delete(key); return false; }

            const dirs = this.TYPE_DEFS[type].dirs;
            for (const dir of dirs) {
                const [dr, dc] = this.DIRS[dir];
                const nr = rr + dr, nc = cc + dc;
                if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) continue;
                const neigh = this.getCell(nr, nc);
                if (!neigh) continue;
                const neighKey = `${nr},${nc}`;
                const opp = this.OPP[dir];
                const neighType = getTypeAtCellByCoords(nr, nc, hypMap);

                if (neighType) {
                    const neighDirs = this.TYPE_DEFS[neighType].dirs;
                    if (!neighDirs.includes(opp)) continue;
                    if (dfs(nr, nc, hypMap, visited, depthLeft - 1)) { visited.delete(key); return true; }
                } else {
                    for (const candType in this.TYPE_DEFS) {
                        if (!this.TYPE_DEFS[candType].dirs.includes(opp)) continue;
                        if (!compatibleCandidate(candType, nr, nc, hypMap)) continue;
                        const saved = hypMap[neighKey];
                        hypMap[neighKey] = candType;
                        if (dfs(nr, nc, hypMap, visited, depthLeft - 1)) {
                            delete hypMap[neighKey];
                            visited.delete(key);
                            return true;
                        }
                        if (saved !== undefined) hypMap[neighKey] = saved; else delete hypMap[neighKey];
                    }
                }
            }

            visited.delete(key);
            return false;
        };

        return dfs(startR, startC, {}, new Set(), maxDepth);
    }

    checkFlow() {
        console.log('Checking flow...');
        const start = { r: this.rows - 1, c: 0 };
        const goal = { r: 0, c: this.cols - 1 };
        const startKey = `${start.r},${start.c}`;
        const goalKey = `${goal.r},${goal.c}`;

        const visited = new Set();
        const prev = new Map();
        const queue = [startKey];

        while (queue.length) {
            const key = queue.shift();
            if (visited.has(key)) continue;
            visited.add(key);
            const [r, c] = key.split(',').map(Number);

            if (r === goal.r && c === goal.c) {
                const path = this.reconstructPath(prev, key, startKey);
                this.currentPath = path;

                // Проверяем, прошел ли поток через все фиксированные трубы
                if (this.hasFixedPipes && !this.checkAllFixedPipesInPath(path)) {
                    this.animateFlow(path, false);
                    setTimeout(() => {
                        this.handleFixedPipesFailure();
                    }, 500);
                    return false;
                }

                this.animateFlow(path, true);
                return true;
            }

            const curCell = this.getCell(r, c);
            const curType = curCell ? curCell.dataset.pipe : null;
            if (!curType || !this.TYPE_DEFS[curType]) continue;

            for (const dirKey of this.TYPE_DEFS[curType].dirs) {
                const [dr, dc] = this.DIRS[dirKey];
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) continue;
                const neigh = this.getCell(nr, nc);
                if (!neigh) continue;

                if (neigh.classList.contains('goal')) {
                    prev.set(goalKey, key);
                    const path = this.reconstructPath(prev, goalKey, startKey);
                    this.currentPath = path;

                    if (this.hasFixedPipes && !this.checkAllFixedPipesInPath(path)) {
                        this.animateFlow(path, false);
                        setTimeout(() => {
                            this.handleFixedPipesFailure();
                        }, 500);
                        return false;
                    }

                    this.animateFlow(path, true);
                    return true;
                }

                const neighType = neigh.dataset.pipe;
                if (!neighType) continue;
                const oppKey = this.OPP[dirKey];
                if (this.TYPE_DEFS[neighType].dirs.includes(oppKey)) {
                    const nkey = `${nr},${nc}`;
                    if (!visited.has(nkey) && !queue.includes(nkey)) {
                        prev.set(nkey, key);
                        queue.push(nkey);
                    }
                }
            }
        }
        return false;
    }

    handleFixedPipesFailure() {
        document.querySelectorAll('.cell.flow').forEach(el => el.classList.remove('flow'));

        // Отнимаем газик, если есть
        if (this.gaziksCollected > 0) {
            this.gaziksCollected--;
            localStorage.setItem('fg_gaziks', this.gaziksCollected);
            this.updateHUD();
        }

        // Показываем модалку проигрыша
        if (this.fixedPipesFailModal) {
            this.fixedPipesFailModal.setAttribute('aria-hidden', 'false');
        }
    }

    checkAllFixedPipesInPath(path) {
        if (!this.hasFixedPipes || !this.FIXED_PIPES.length) return true;

        const pathKeys = new Set(path);
        const allFixedPipesInPath = this.FIXED_PIPES.every(pipe => {
            const pipeKey = `${pipe.r},${pipe.c}`;
            return pathKeys.has(pipeKey);
        });

        return allFixedPipesInPath;
    }

    reconstructPath(prevMap, endKey, startKey) {
        const path = [];
        let cur = endKey;
        while (cur) {
            path.push(cur);
            if (cur === startKey) break;
            cur = prevMap.get(cur);
        }
        return path.reverse();
    }

    animateFlow(pathKeys, shouldCompleteLevel = true) {
        if (this.flowInProgress) return;
        this.flowInProgress = true;
        document.querySelectorAll('.cell.flow').forEach(el => el.classList.remove('flow'));
        let i = 0;
        const interval = setInterval(() => {
            if (i >= pathKeys.length) {
                clearInterval(interval);
                this.flowInProgress = false;
                if (shouldCompleteLevel) {
                    this.completeLevel();
                }
                return;
            }
            const [r, c] = pathKeys[i].split(',').map(Number);
            const cell = this.getCell(r, c);
            if (cell) cell.classList.add('flow');
            i++;
        }, 240);
    }

    completeLevel() {
        const baseReward = 20;
        const pipeBonus = Math.max(0, 30 - this.pipesUsed * 2);
        const answerBonus = this.correctAnswers * 10;

        // Бонус за газики только если они есть на уровне
        const gazikBonus = this.hasGaziks ? this.gaziksCollected * 5 : 0;

        const totalReward = baseReward + pipeBonus + answerBonus + gazikBonus;
        this.rubles += totalReward;
        localStorage.setItem('fg_rub', this.rubles);
        localStorage.setItem('fg_gas', this.finGas);

        if (this.resultNote) {
            this.resultNote.textContent = `Супер! Тебе начислили +${totalReward} ₽ за прохождение уровня!`;
        }

        if (this.bonusInfo) {
            let bonusHTML = `
                <div class="bonus-item">Всего получено: +${totalReward} ₽</div>
                <div class="bonus-item">Базовая награда: +${baseReward} ₽</div>
                <div class="bonus-item">Бонус за трубы: +${pipeBonus} ₽</div>
                <div class="bonus-item">Бонус за ответы: +${answerBonus} ₽</div>
            `;

            // Добавляем бонус за газики только если они есть
            if (this.hasGaziks && this.gaziksCollected > 0) {
                bonusHTML += `<div class="bonus-item">Бонус за газики: +${gazikBonus} ₽</div>`;
            }

            this.bonusInfo.innerHTML = bonusHTML;
        }

        setTimeout(() => {
            if (this.resultModal) {
                this.resultModal.setAttribute('aria-hidden', 'false');
            }
        }, 1000);
    }

    updateHUD() {
        if (this.rublesEl) this.rublesEl.textContent = this.rubles;
        if (this.finGasEl) this.finGasEl.textContent = this.finGas;

        if (this.gaziksEl) this.gaziksEl.textContent = this.gaziksCollected;


        if (this.playerNameEl) this.playerNameEl.textContent = localStorage.getItem('fg_name') || 'Игрок';
    }



    showDialog(dialogs, mode) {
        this.currentDialog = mode;
        this.dialogIndex = 0;

        if (this.dialogTextOverlay) {
            this.dialogTextOverlay.textContent = dialogs[0];
        }

        if (this.dialogOverlay) {
            this.dialogOverlay.style.display = 'flex';
        }

        if (this.nextBtnOverlay) {
            this.nextBtnOverlay.style.display = 'inline-block';
            this.nextBtnOverlay.textContent = 'Далее';
        }
    }

    getCell(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return null;
        return this.grid[r][c];
    }

    getPipeDirsFromType(type) {
        if (!type) return [];
        const def = this.TYPE_DEFS[type];
        return def ? def.dirs : [];
    }

    getPipeDirsFromCell(cell) {
        if (!cell) return [];
        return this.getPipeDirsFromType(cell.dataset.pipe);
    }

    renderPipe(cell, type, opts = {}) {
        if (!this.TYPE_DEFS[type]) return;
        cell.dataset.pipe = type;
        cell.classList.add('has-pipe');
        cell.innerHTML = '';
        const img = document.createElement('img');

        // Используем фиксированное изображение если труба фиксированная
        const imgSrc = opts.fixed ?
            (this.TYPE_DEFS[type].fixedImg || this.TYPE_DEFS[type].img) :
            this.TYPE_DEFS[type].img;
        img.src = imgSrc;

        img.alt = type;
        img.className = 'pipe-img';
        cell.appendChild(img);

        if (opts.fixed) {
            cell.classList.add('pipe-fixed');
            cell.dataset.pipeFixed = 'true';
        }
    }

    createFloatingText(cell, text, color, className = '') {
        if (!cell) return;
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: absolute;
            pointer-events: none;
            font-weight: 800;
            color: ${color};
            font-size: 20px;
            z-index: 1000;
            transition: transform 0.9s ease, opacity 0.9s ease;
            opacity: 1;
        `;
        if (className) floatingText.className = className;

        const rect = cell.getBoundingClientRect();
        const boardRect = this.boardEl.getBoundingClientRect();

        floatingText.style.left = (rect.left - boardRect.left + rect.width / 2) + 'px';
        floatingText.style.top = (rect.top - boardRect.top - 10) + 'px';

        this.boardEl.parentElement.appendChild(floatingText);

        setTimeout(() => {
            floatingText.style.opacity = '0';
            floatingText.style.transform = 'translateY(-70px)';
            setTimeout(() => {
                if (floatingText.parentElement) floatingText.parentElement.removeChild(floatingText);
            }, 900);
        }, 100);
    }

    createImageFloatingText(cell, text, imageSrc, color, className = '') {
        if (!cell) return;

        const floatingContainer = document.createElement('div');

        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.cssText = `
            width: 24px;
            height: 24px;
            object-fit: contain;
        `;

        floatingContainer.style.cssText = `
            position: absolute;
            pointer-events: none;
            font-weight: 800;
            color: ${color};
            font-size: 20px;
            z-index: 100;
            transition: transform 0.9s ease, opacity 0.9s ease;
            opacity: 1;
            display: flex;
            align-items: center;
            gap: 5px;
        `;

        const textElement = document.createElement('span');
        textElement.textContent = text;
        textElement.style.cssText = `
            font-weight: 800;
            font-size: 20px;
        `;

        floatingContainer.appendChild(img);
        floatingContainer.appendChild(textElement);

        if (className) {
            floatingContainer.className = className;
        }

        const rect = cell.getBoundingClientRect();
        const boardRect = this.boardEl.getBoundingClientRect();

        floatingContainer.style.left = (rect.left - boardRect.left + rect.width / 2) + 'px';
        floatingContainer.style.top = (rect.top - boardRect.top - 10) + 'px';

        this.boardEl.parentElement.appendChild(floatingContainer);

        setTimeout(() => {
            floatingContainer.style.opacity = '0';
            floatingContainer.style.transform = 'translateY(-70px)';
            setTimeout(() => {
                if (floatingContainer.parentElement) {
                    floatingContainer.parentElement.removeChild(floatingContainer);
                }
            }, 900);
        }, 100);
    }

    bindEvents() {
        console.log('Binding events...');

        // Основные обработчики событий
        if (this.nextBtnOverlay) {
            this.nextBtnOverlay.onclick = () => {
                if (!this.currentDialog) return;
                const dialogs = this.currentDialog === 'intro' ? this.DIALOGS : this.FIRST_PIPE_DIALOGS;
                this.dialogIndex++;

                if (this.dialogIndex < dialogs.length) {
                    if (this.dialogTextOverlay) {
                        this.dialogTextOverlay.textContent = dialogs[this.dialogIndex];
                    }
                } else {
                    if (this.dialogOverlay) {
                        this.dialogOverlay.style.display = 'none';
                    }
                    const finished = this.currentDialog;
                    this.currentDialog = null;
                    if (finished === 'firstPipe') {
                        this.checkFlow();
                    }
                }
            };
        }

        // ОБРАБОТЧИКИ ТУПИКА И ОТМЕНЫ ХОДА - ИСПРАВЛЕННЫЕ
        if (this.undoYes) {
            this.undoYes.addEventListener('click', () => {
                console.log('Undo yes clicked');
                if (this.rubles >= 15) {
                    this.rubles -= 15;
                    this.updateHUD();
                    this.undoLastMove();
                    if (this.deadEndModal) {
                        this.deadEndModal.setAttribute('aria-hidden', 'true');
                    }
                    // После отмены проверяем поток заново
                    this.checkFlow();
                } else {
                    if (this.deadEndModal) {
                        this.deadEndModal.setAttribute('aria-hidden', 'true');
                    }
                    if (this.gameOverModal) {
                        this.gameOverModal.setAttribute('aria-hidden', 'false');
                    }
                }
            });
        }

        if (this.undoNo) {
            this.undoNo.addEventListener('click', () => {
                console.log('Undo no clicked');
                if (this.deadEndModal) {
                    this.deadEndModal.setAttribute('aria-hidden', 'true');
                }
                if (this.gameOverModal) {
                    this.gameOverModal.setAttribute('aria-hidden', 'false');
                }
            });
        }

        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                location.reload();
            });
        }

        if (this.toMenuBtn) {
            this.toMenuBtn.addEventListener('click', () => {
                window.location.href = '../menu.html';
            });
        }

        if (this.closeResult) {
            this.closeResult.addEventListener('click', () => {
                if (this.resultModal) {
                    this.resultModal.setAttribute('aria-hidden', 'true');
                }

                // ВАЖНО: Сбрасываем состояние диалога КАЖДЫЙ РАЗ
                if (this.dialogTextOverlay && this.nextBtnOverlay) {
                    this.dialogTextOverlay.textContent = "Ты также можешь получать еще больше Рубликов в ежедневных наградах.";
                    this.nextBtnOverlay.disabled = false;
                    this.nextBtnOverlay.style.display = 'inline-block';
                    this.nextBtnOverlay.textContent = "Посмотреть награды";

                    // Сбрасываем и переустанавливаем обработчик
                    this.nextBtnOverlay.onclick = () => {
                        if (this.dailyModal) {
                            this.dailyModal.setAttribute('aria-hidden', 'false');
                        }
                        this.nextBtnOverlay.style.display = 'none';
                    };

                    if (this.dialogOverlay) {
                        this.dialogOverlay.style.display = 'flex';
                    }
                }
            });
        }

        if (this.exitToMenu) {
            this.exitToMenu.addEventListener('click', () => {
                if (this.dailyModal) {
                    this.dailyModal.setAttribute('aria-hidden', 'true');
                }
                setTimeout(() => { window.location.href = '../menu.html'; }, 500);
            });
        }

        if (this.nextLevelBtn) {
            this.nextLevelBtn.addEventListener('click', () => {
                if (this.dailyModal) {
                    this.dailyModal.setAttribute('aria-hidden', 'true');
                }
                setTimeout(() => {
                    window.location.href = this.getNextLevelPath();
                }, 500);
            });
        }
    }

    getNextLevelPath() {
        return '../menu.html';
    }

    adjustLayoutForViewport() {
        const viewportHeight = window.innerHeight;
        const boardContainer = document.querySelector('.board-container');
        const mobilePanel = document.getElementById('mobilePipePanel');

        if (viewportHeight < 700) {
            document.body.style.overflowY = 'auto';
            if (boardContainer) {
                boardContainer.style.padding = '5px';
            }
            if (mobilePanel) {
                mobilePanel.style.minHeight = '60px';
            }
        } else {
            document.body.style.overflowY = 'hidden';
        }
    }
}

// Глобальная переменная
let currentLevel;
