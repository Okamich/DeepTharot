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
        this.explorationSpeed = 1000;
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

    // ========== ОБЩИЕ МЕТОДЫ ==========
    addLogEntry(message, type = 'info') {
        const log = document.getElementById('activityLog');
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = message;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        console.log(`Лог: ${message}`);
    }

    updateUI() {
        this.updatePlayerInfo();
        this.updateProgressInfo(); // Изменили на updateProgressInfo
        this.updateInitiativeBar();
    }

    updatePlayerInfo() {
        const p = this.player;
        document.getElementById('playerLevel').textContent = p.level;
        document.getElementById('playerExp').textContent = `${p.exp}/${p.expToNextLevel}`;
        document.getElementById('playerHealth').textContent = `${p.health}/${p.maxHealth}`;
        document.getElementById('playerDamage').textContent = p.damage;
        document.getElementById('playerDefense').textContent = p.defense;
        document.getElementById('playerSpeed').textContent = p.speed;
        document.getElementById('playerGold').textContent = p.gold;
        
        document.getElementById('playerCurrentHealth').textContent = p.health;
        document.getElementById('playerMaxHealth').textContent = p.maxHealth;
        
        const expPercent = (p.exp / p.expToNextLevel) * 100;
        const healthPercent = (p.health / p.maxHealth) * 100;
        
        document.getElementById('expBar').style.width = `${expPercent}%`;
        document.getElementById('healthBar').style.width = `${healthPercent}%`;
        
        this.updateEquipment();
    }

    updateProgressInfo() {
        // Обновляем информацию о прогрессе (уровень и зона)
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('currentZone').textContent = this.currentZone;
        
        // Обновляем информацию о врагах только если мы в режиме боя
        const enemiesCountElement = document.getElementById('enemiesCount');
        if (enemiesCountElement) {
            const aliveEnemies = this.enemies.filter(e => e.health > 0).length;
            enemiesCountElement.textContent = `${aliveEnemies}/${this.enemies.length}`;
        }
        
        // Обновляем информацию о зоне только если элемент существует (в режиме боя)
        const zoneTitleElement = document.getElementById('zoneTitle');
        const zoneDescriptionElement = document.getElementById('zoneDescription');
        
        if (zoneTitleElement && zoneDescriptionElement) {
            const zoneInfo = this.levels[this.currentLevel][this.currentZone - 1];
            zoneTitleElement.textContent = `Уровень ${this.currentLevel} - Зона ${this.currentZone}`;
            zoneDescriptionElement.textContent = 
                `${zoneInfo.name} (${zoneInfo.minEnemies}-${zoneInfo.maxEnemies} противников)`;
        }
    }

    updateZoneInfo() {
        // Этот метод теперь используется только для обновления информации в режиме боя
        const zoneInfo = this.levels[this.currentLevel][this.currentZone - 1];
        
        const zoneTitleElement = document.getElementById('zoneTitle');
        const zoneDescriptionElement = document.getElementById('zoneDescription');
        const enemiesCountElement = document.getElementById('enemiesCount');
        
        if (zoneTitleElement) {
            zoneTitleElement.textContent = `Уровень ${this.currentLevel} - Зона ${this.currentZone}`;
        }
        
        if (zoneDescriptionElement) {
            zoneDescriptionElement.textContent = 
                `${zoneInfo.name} (${zoneInfo.minEnemies}-${zoneInfo.maxEnemies} противников)`;
        }
        
        if (enemiesCountElement) {
            const aliveEnemies = this.enemies.filter(e => e.health > 0).length;
            enemiesCountElement.textContent = `${aliveEnemies}/${this.enemies.length}`;
        }
    }

    updateInitiativeBar() {
        const initiativePercent = (this.initiative / this.maxInitiative) * 100;
        const initiativeFillElement = document.getElementById('initiativeFill');
        if (initiativeFillElement) {
            initiativeFillElement.style.width = `${initiativePercent}%`;
        }
    }

    updateBattleStatus(message) {
        const battleStatusElement = document.getElementById('battleStatus');
        if (battleStatusElement) {
            battleStatusElement.textContent = message;
        }
    }

    updateActiveCharacter() {
        // Сбрасываем все активные состояния
        const playerAvatar = document.getElementById('playerAvatar');
        if (playerAvatar) {
            playerAvatar.classList.remove('active');
        }
        
        document.querySelectorAll('.enemy-avatar').forEach(avatar => {
            avatar.classList.remove('active');
        });
        
        // Устанавливаем активное состояние для текущего хода
        if (this.currentTurn) {
            if (this.currentTurn.type === 'player' && playerAvatar) {
                playerAvatar.classList.add('active');
            } else {
                const enemyAvatars = document.querySelectorAll('.enemy-avatar');
                if (enemyAvatars[this.currentTurn.index]) {
                    enemyAvatars[this.currentTurn.index].classList.add('active');
                }
            }
        }
    }

    updateEquipment() {
        const equipment = this.player.equipment;
        document.getElementById('weaponSlot').textContent = 
            equipment.weapon ? equipment.weapon.name : 'Пусто';
        document.getElementById('armorSlot').textContent = 
            equipment.armor ? equipment.armor.name : 'Пусто';
        document.getElementById('accessorySlot').textContent = 
            equipment.accessory ? equipment.accessory.name : 'Пусто';
    }

    togglePause() {
        this.paused = !this.paused;
        document.getElementById('pauseBtn').textContent = 
            this.paused ? 'Продолжить' : 'Пауза';
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

    // ========== СИСТЕМА БОЯ ==========
    startBattle() {
        const zoneInfo = this.levels[this.currentLevel][this.currentZone - 1];
        this.enemies = [];
        
        const enemyCount = Math.floor(Math.random() * (zoneInfo.maxEnemies - zoneInfo.minEnemies + 1)) + zoneInfo.minEnemies;
        
        for (let i = 0; i < enemyCount; i++) {
            this.enemies.push(new Enemy(zoneInfo.enemyLevel, `Враг ${i + 1}`));
        }
        
        this.explorationActive = false;
        this.battleActive = true;
        this.initiative = 0;
        this.turnOrder = [];
        this.currentTurn = null;
        
        this.showBattleView();
        this.updateZoneInfo(); // Теперь используем updateZoneInfo только для боя
        this.renderEnemies();
        this.addLogEntry(`Начало боя в зоне: ${zoneInfo.name}`, 'info');
        this.addLogEntry(`Появилось врагов: ${enemyCount}`, 'info');
    }

    battleStep() {
        if (!this.battleActive || this.paused) return;
        
        this.nextTurn();
    }

    nextTurn() {
        if (!this.battleActive) return;
        
        // Увеличиваем инициативу
        this.initiative += this.player.speed;
        this.enemies.forEach(enemy => {
            if (enemy.health > 0) {
                this.initiative += enemy.speed;
            }
        });
        
        if (this.initiative >= this.maxInitiative) {
            this.executeTurn();
            this.initiative = 0;
        }
        
        this.updateInitiativeBar();
    }

    executeTurn() {
        // Определяем порядок ходов на основе скорости
        this.turnOrder = [
            { type: 'player', speed: this.player.speed },
            ...this.enemies.map((enemy, index) => ({ 
                type: 'enemy', 
                index, 
                speed: enemy.speed,
                health: enemy.health 
            }))
        ].filter(turn => turn.type === 'player' || turn.health > 0)
         .sort((a, b) => b.speed - a.speed);
        
        this.processTurnOrder(0);
    }

    processTurnOrder(index) {
        if (index >= this.turnOrder.length) {
            this.currentTurn = null;
            this.updateActiveCharacter();
            return;
        }
        
        const turn = this.turnOrder[index];
        this.currentTurn = turn;
        this.updateActiveCharacter();
        
        if (turn.type === 'player') {
            // Ход игрока - автоматическая атака
            setTimeout(() => {
                this.playerAttack();
                this.processTurnOrder(index + 1);
            }, 600);
        } else {
            // Ход врага
            setTimeout(() => {
                this.enemyAttack(turn.index);
                this.processTurnOrder(index + 1);
            }, 600);
        }
    }

    playerAttack() {
        if (this.currentTurn?.type !== 'player') return;
        
        const aliveEnemies = this.enemies.filter(e => e.health > 0);
        if (aliveEnemies.length === 0) return;
        
        // Атакуем случайного живого врага
        const targetIndex = Math.floor(Math.random() * aliveEnemies.length);
        const target = aliveEnemies[targetIndex];
        const damage = this.player.attack(target);
        
        this.addLogEntry(`Вы атаковали ${target.name} и нанесли ${damage} урона!`, 'damage');
        this.updateBattleStatus(`Атака по ${target.name}!`);
        this.renderEnemies();
        
        // Проверяем смерть врага
        if (target.health <= 0) {
            this.addLogEntry(`${target.name} повержен!`, 'info');
            const expGained = this.player.gainExp(target.expReward);
            this.player.gold += target.goldReward;
            
            if (expGained > 0) {
                this.addLogEntry(`Получено ${expGained} опыта! Уровень повышен!`, 'levelup');
            } else {
                this.addLogEntry(`Получено ${target.expReward} опыта!`, 'exp');
            }
            
            this.addLogEntry(`Получено ${target.goldReward} золота!`, 'info');
            
            // Проверяем окончание боя
            if (this.enemies.every(e => e.health <= 0)) {
                this.battleCompleted();
                return;
            }
        }
    }

    enemyAttack(enemyIndex) {
        const enemy = this.enemies[enemyIndex];
        if (enemy.health <= 0) return;
        
        const damage = enemy.attack(this.player);
        this.addLogEntry(`${enemy.name} атаковал вас и нанес ${damage} урона!`, 'damage');
        this.updateBattleStatus(`${enemy.name} атакует!`);
        this.updatePlayerInfo();
        
        // Проверяем смерть игрока
        if (this.player.health <= 0) {
            this.addLogEntry('Вы погибли! Воскрешение...', 'damage');
            this.player.respawn();
            this.updatePlayerInfo();
            this.updateBattleStatus('Воскрешение...');
        }
    }

    battleCompleted() {
        this.battleActive = false;
        this.addLogEntry('Бой завершен!', 'info');
        this.updateBattleStatus('Победа!');
        
        // Переходим к следующей зоне или уровню
        setTimeout(() => {
            if (this.currentZone < this.levels[this.currentLevel].length) {
                this.currentZone++;
            } else {
                this.currentLevel++;
                this.currentZone = 1;
                this.addLogEntry(`Достигнут уровень ${this.currentLevel}!`, 'levelup');
            }
            
            // Возвращаемся к исследованию
            setTimeout(() => {
                this.startExploration();
            }, 2000);
            
        }, 2000);
    }

    showBattleView() {
        document.getElementById('explorationView').style.display = 'none';
        document.getElementById('battleView').style.display = 'block';
        document.getElementById('autoBattleIndicator').style.display = 'block';
        document.getElementById('modeIndicator').textContent = 'БОЙ';
        document.getElementById('modeIndicator').style.background = '#f44336';
        
        // Обновляем информацию о зоне при переходе в режим боя
        this.updateZoneInfo();
    }

    renderEnemies() {
        const container = document.getElementById('enemiesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.enemies.forEach((enemy, index) => {
            if (enemy.health <= 0) return;
            
            const enemyElement = document.createElement('div');
            enemyElement.className = 'character enemy';
            
            enemyElement.innerHTML = `
                <div class="character-avatar enemy-avatar" data-index="${index}">E</div>
                <div class="character-name">${enemy.name}</div>
                <div class="character-stats">
                    HP: ${enemy.health}/${enemy.maxHealth}
                </div>
            `;
            
            container.appendChild(enemyElement);
        });
        
        this.updateActiveCharacter();
    }

    toggleInventory() {
        const modal = document.getElementById('inventoryModal');
        if (modal.style.display === 'block') {
            this.closeInventory();
        } else {
            this.openInventory();
        }
    }

    openInventory() {
        const modal = document.getElementById('inventoryModal');
        const inventoryGrid = document.getElementById('inventoryGrid');
        
        inventoryGrid.innerHTML = '';
        
        this.player.inventory.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            if (this.player.equipment[item.type] === item) {
                itemElement.classList.add('equipped');
            }
            
            itemElement.innerHTML = `
                <div class="item-value">${item.value}G</div>
                <div class="item-name">${item.name}</div>
                <div class="item-stats">
                    ${item.damageBonus ? `Урон: +${item.damageBonus}<br>` : ''}
                    ${item.defenseBonus ? `Защ: +${item.defenseBonus}<br>` : ''}
                    ${item.healthBonus ? `Здоровье: +${item.healthBonus}` : ''}
                </div>
            `;
            
            itemElement.addEventListener('click', (e) => {
                if (e.button === 0) { // ЛКМ
                    this.player.toggleEquipment(item);
                    this.openInventory();
                    this.updatePlayerInfo();
                }
            });
            
            itemElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.player.sellItem(item);
                this.openInventory();
                this.updatePlayerInfo();
            });
            
            inventoryGrid.appendChild(itemElement);
        });
        
        modal.style.display = 'block';
    }

    closeInventory() {
        document.getElementById('inventoryModal').style.display = 'none';
    }
}

// Запуск игры
window.addEventListener('load', () => {
    console.log("Страница загружена, запуск игры...");
    new Game();
});
