class Item {
    constructor(type, level) {
        this.type = type; // "weapon", "armor", "accessory"
        this.level = level;
        this.name = `${this.getTypeName()} Ур. ${level}`;
        this.value = 10 * level;
        
        // Устанавливаем бонусы в зависимости от типа и уровня
        switch (type) {
            case 'weapon':
                this.damageBonus = 5 + level * 3;
                this.defenseBonus = 0;
                this.healthBonus = 0;
                this.color = '#ffd700';
                break;
            case 'armor':
                this.damageBonus = 0;
                this.defenseBonus = 3 + level * 2;
                this.healthBonus = 10 + level * 5;
                this.color = '#4caf50';
                break;
            case 'accessory':
                this.damageBonus = 2 + level;
                this.defenseBonus = 2 + level;
                this.healthBonus = 5 + level * 2;
                this.color = '#2196f3';
                break;
        }
    }

    getTypeName() {
        const names = {
            'weapon': 'Оружие',
            'armor': 'Броня',
            'accessory': 'Аксессуар'
        };
        return names[this.type];
    }

    render(ctx, x, y) {
        ctx.fillStyle = this.color;
        ctx.fillRect(x - 15, y - 15, 30, 30);
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.level.toString(), x, y + 4);
    }
}