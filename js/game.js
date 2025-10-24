class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.zones = [];
        this.currentZoneIndex = 0;
        this.autoAttack = true;
        this.lastTime = 0;
        
        this.createZones();
        this.setupEventListeners();
        this.setupUI();
        this.gameLoop(0);
    }

    createZones() {
        for (let i = 0; i < 5; i++) {
            this.zones.push(new Zone(i + 1, 5 + i * 2, this.canvas.width, this.canvas.height));
        }
    }

    setupEventListeners() {
        document.getElementById('inventoryBtn').addEventListener('click', () => this.toggleInventory());
        document.getElementById('autoAttackBtn').addEventListener('click', () => this.toggleAutoAttack());
        
        document.querySelector('.close').addEventListener('click', () => this.closeInventory());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'i' || e.key === 'I') {
                this.toggleInventory();
            }
        });

        // Закрытие модального окна при клике вне его
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('inventoryModal');
            if (e.target === modal) {
                this.closeInventory();
            }
        });
    }

    setupUI() {
        this.updatePlayerInfo();
        this.updateZoneInfo();
        this.updateEquipment();
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
                    this.openInventory(); // Обновляем инвентарь
                    this.updatePlayerInfo();
                    this.updateEquipment();
                }
            });
            
            itemElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.player.sellItem(item);
                this.openInventory(); // Обновляем инвентарь
                this.updatePlayerInfo();
            });
            
            inventoryGrid.appendChild(itemElement);
        });
        
        modal.style.display = 'block';
    }

    closeInventory() {
        document.getElementById('inventoryModal').style.display = 'none';
    }

    toggleAutoAttack() {
        this.autoAttack = !this.autoAttack;
        document.getElementById('autoAttackBtn').textContent = 
            `Автоатака: ${this.autoAttack ? 'Вкл' : 'Выкл'}`;
    }

    updatePlayerInfo() {
        document.getElementById('playerLevel').textContent = this.player.level;
        document.getElementById('playerExp').textContent = 
            `${this.player.exp}/${this.player.expToNextLevel}`;
        document.getElementById('playerHealth').textContent = 
            `${this.player.health}/${this.player.maxHealth}`;
        document.getElementById('playerDamage').textContent = this.player.damage;
        document.getElementById('playerDefense').textContent = this.player.defense;
        document.getElementById('playerSpeed').textContent = this.player.speed.toFixed(1);
        document.getElementById('playerGold').textContent = this.player.gold;
        
        // Обновляем прогресс-бары
        const expPercent = (this.player.exp / this.player.expToNextLevel) * 100;
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        
        document.getElementById('expBar').style.width = `${expPercent}%`;
        document.getElementById('healthBar').style.width = `${healthPercent}%`;
    }

    updateZoneInfo() {
        const currentZone = this.zones[this.currentZoneIndex];
        document.getElementById('currentZone').textContent = this.currentZoneIndex + 1;
        document.getElementById('enemiesLeft').textContent = currentZone.enemies.length;
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

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        const currentZone = this.zones[this.currentZoneIndex];
        
        if (this.autoAttack && currentZone.enemies.length > 0) {
            // Автоматическое движение и атака
            const closestEnemy = this.findClosestEnemy();
            if (closestEnemy) {
                this.player.moveTowards(closestEnemy.x, closestEnemy.y);
                
                const distance = Math.sqrt(
                    Math.pow(this.player.x - closestEnemy.x, 2) + 
                    Math.pow(this.player.y - closestEnemy.y, 2)
                );
                
                if (distance < this.player.radius + closestEnemy.radius + 10) {
                    this.player.attack(closestEnemy);
                }
            }
        }
        
        // Обновляем врагов
        currentZone.enemies.forEach(enemy => {
            enemy.update(deltaTime);
            enemy.moveTowards(this.player.x, this.player.y);
            
            const distance = Math.sqrt(
                Math.pow(this.player.x - enemy.x, 2) + 
                Math.pow(this.player.y - enemy.y, 2)
            );
            
            if (distance < this.player.radius + enemy.radius) {
                enemy.attack(this.player);
            }
            
            if (enemy.health <= 0) {
                this.player.gainExp(enemy.expReward);
                this.player.gold += enemy.goldReward;
                
                if (Math.random() < 0.3) {
                    const itemType = ['weapon', 'armor', 'accessory'][Math.floor(Math.random() * 3)];
                    this.player.addItem(new Item(itemType, currentZone.level));
                }
                
                currentZone.enemies = currentZone.enemies.filter(e => e !== enemy);
            }
        });
        
        // Проверяем очистку зоны
        if (currentZone.enemies.length === 0 && !currentZone.cleared) {
            currentZone.cleared = true;
            if (this.currentZoneIndex < this.zones.length - 1) {
                setTimeout(() => {
                    this.currentZoneIndex++;
                    this.updateZoneInfo();
                }, 1000);
            }
        }
        
        this.player.update(deltaTime);
        this.updatePlayerInfo();
        this.updateZoneInfo();
        
        // Проверяем смерть игрока
        if (this.player.health <= 0) {
            this.player.respawn();
            this.updatePlayerInfo();
        }
    }

    findClosestEnemy() {
        const currentZone = this.zones[this.currentZoneIndex];
        let closestEnemy = null;
        let minDistance = Infinity;
        
        currentZone.enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(this.player.x - enemy.x, 2) + 
                Math.pow(this.player.y - enemy.y, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        return closestEnemy;
    }

    render() {
        // Очищаем canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const currentZone = this.zones[this.currentZoneIndex];
        
        // Рисуем врагов
        currentZone.enemies.forEach(enemy => {
            enemy.render(this.ctx);
        });
        
        // Рисуем игрока
        this.player.render(this.ctx);
        
        // Рисуем предметы на земле
        currentZone.items.forEach(item => {
            item.render(this.ctx, item.x, item.y);
        });
    }
}

// Запускаем игру когда страница загрузится
window.addEventListener('load', () => {
    new Game();
});