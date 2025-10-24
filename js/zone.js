class Zone {
    constructor(level, numEnemies, width, height) {
        this.level = level;
        this.enemies = [];
        this.items = [];
        this.cleared = false;
        
        // Создаем врагов в случайных позициях
        for (let i = 0; i < numEnemies; i++) {
            const x = 50 + Math.random() * (width - 100);
            const y = 50 + Math.random() * (height - 100);
            this.enemies.push(new Enemy(x, y, level));
        }
    }
}