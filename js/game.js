// Основной класс игры
class Game {
    constructor() {
        console.log("Инициализация игры...");
        
        this.player = new Player();
        this.currentLevel = 1;
        this.currentZone = 1;
        this.enemies = [];
        this.battleActive = false;
        this.explorationActive = true;
        this.paused = false;
        this.initiative = 0;
        this.maxInitiative = 100;
        this.currentTurn = null;
        this.turnOrder = [];
        this.battleSpeed = 1000;
        this.explorationSpeed = 1000; // Ускорим для тестирования
        this.explorationProgress = 0;
        this.maxExplorationProgress = 100;
        
        this.levels = {
            1: [
                { name: "Слабая нежить", minEnemies: 1, maxEnemies: 2, enemyLevel: 1 },
                { name: "Кладбище", minEnemies: 1, maxEnemies: 3, enemyLevel: 1 },
                { name: "Заброшенный храм", minEnemies: 2, maxEnemies: 3, enemyLevel: 2 }
            ],
            2: [
                { name: "Лес гоблинов", minEnemies: 2, maxEnemies: 3, enemyLevel: 2 },
                { name: "Пещера гоблинов", minEnemies: 2, maxEnemies: 4, enemyLevel: 2 },
                { name: "Логово вождя", minEnemies: 3, maxEnemies: 4, enemyLevel: 3 }
            ]
        };

        this.eventSystem = new EventSystem(this);
        console.log("EventSystem создан");

        this.setupEventListeners();
        this.startExploration();
        this.updateUI();
        this.startGameLoop();
        
        console.log("Игра успешно инициализирована");
    }

    setupEventListeners() {
        console.log("Настройка обработчиков событий...");
        document.getElementById('inventoryBtn').addEventListener('click', () => this.toggleInventory());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        document.querySelector('.close').addEventListener('click', () => this.closeInventory());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'i' || e.key === 'I') {
                this.toggleInventory();
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                this.togglePause();
            }
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('inventoryModal');
            if (e.target === modal) {
                this.closeInventory();
            }
        });
        
        console.log("Обработчики событий настроены");
    }

    startGameLoop() {
        console.log("Запуск игрового цикла...");
        const gameStep = () => {
            if (!this.paused) {
                if (this.explorationActive) {
                    this.explorationStep();
                } else if (this.battleActive) {
                    this.battleStep();
                }
            }
            setTimeout(gameStep, this.explorationActive ? this.explorationSpeed : this.battleSpeed);
        };
        gameStep();
    }

    // ========== СИСТЕМА ИССЛЕДОВАНИЯ ==========
    startExploration() {
        console.log("Начало исследования...");
        this.explorationActive = true;
        this.battleActive = false;
        this.explorationProgress = 0;
        
        this.showExplorationView();
        this.eventSystem.changeLocation();
        this.addLogEntry("Вы начинаете исследовать новые земли...", "exploration");
        console.log("Исследование начато");
    }

    explorationStep() {
        if (!this.explorationActive || this.paused) return;
        
        // Увеличиваем прогресс исследования
        const progressIncrement = 5 + Math.floor(Math.random() * 10);
        this.explorationProgress += progressIncrement;
        
        console.log(`Прогресс исследования: ${this.explorationProgress}/${this.maxExplorationProgress} (+${progressIncrement})`);
        
        if (this.explorationProgress >= this.maxExplorationProgress) {
            console.log("Прогресс заполнен, запуск события...");
            this.eventSystem.triggerRandomEvent();
            this.explorationProgress = 0;
        }
        
        this.updateExplorationProgress();
    }

    updateExplorationProgress() {
        const progressPercent = (this.explorationProgress / this.maxExplorationProgress) * 100;
        document.getElementById('explorationProgressBar').style.width = `${progressPercent}%`;
        document.getElementById('explorationProgress').textContent = `${Math.round(progressPercent)}%`;
        document.getElementById('explorationBar').style.width = `${progressPercent}%`;
    }

    showExplorationView() {
        document.getElementById('explorationView').style.display = 'block';
        document.getElementById('battleView').style.display = 'none';
        document.getElementById('autoBattleIndicator').style.display = 'none';
        document.getElementById('modeIndicator').textContent = 'ИССЛЕДОВАНИЕ';
        document.getElementById('modeIndicator').style.background = '#2196f3';
        console.log("Режим исследования активирован");
    }

    // ... остальной код game.js остается без изменений ...
}

// Запуск игры
window.addEventListener('load', () => {
    console.log("Страница загружена, запуск игры...");
    new Game();
});
