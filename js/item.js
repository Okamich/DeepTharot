class Item {
    constructor(type, level) {
        this.type = type;
        this.level = level;
        this.name = `${this.getTypeName()} Ур. ${level}`;
        this.value = 10 * level;
        
        switch (type) {
            case 'weapon':
                this.damageBonus = 3 + level * 2;
                this.defenseBonus = 0;
                this.healthBonus = 0;
                break;
            case 'armor':
                this.damageBonus = 0;
                this.defenseBonus = 2 + level;
                this.healthBonus = 10 + level * 3;
                break;
            case 'accessory':
                this.damageBonus = 1 + level;
                this.defenseBonus = 1 + level;
                this.healthBonus = 5 + level * 2;
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
}
