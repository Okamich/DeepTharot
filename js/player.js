class Player {
    constructor() {
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = 100;
        this.gold = 0;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damage = 10;
        this.defense = 5;
        this.speed = 12;
        
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        
        this.inventory = [];
    }

    attack(target) {
        let totalDamage = this.damage;
        if (this.equipment.weapon) {
            totalDamage += this.equipment.weapon.damageBonus;
        }
        if (this.equipment.accessory) {
            totalDamage += this.equipment.accessory.damageBonus;
        }
        
        return target.takeDamage(totalDamage);
    }

    takeDamage(damage) {
        let totalDefense = this.defense;
        if (this.equipment.armor) {
            totalDefense += this.equipment.armor.defenseBonus;
        }
        if (this.equipment.accessory) {
            totalDefense += this.equipment.accessory.defenseBonus;
        }
        
        const actualDamage = Math.max(1, damage - totalDefense);
        this.health -= actualDamage;
        return actualDamage;
    }

    gainExp(amount) {
        this.exp += amount;
        let levelsGained = 0;
        
        while (this.exp >= this.expToNextLevel) {
            this.exp -= this.expToNextLevel;
            this.levelUp();
            levelsGained++;
        }
        
        return levelsGained > 0 ? amount : 0;
    }

    levelUp() {
        this.level++;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
        
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.damage += 5;
        this.defense += 2;
        this.speed += 1;
    }

    addItem(item) {
        this.inventory.push(item);
    }

    toggleEquipment(item) {
        if (this.equipment[item.type] === item) {
            this.unequipItem(item.type);
        } else {
            this.equipItem(item);
        }
    }

    equipItem(item) {
        if (this.equipment[item.type]) {
            this.unequipItem(item.type);
        }
        
        this.equipment[item.type] = item;
        
        if (item.damageBonus) this.damage += item.damageBonus;
        if (item.defenseBonus) this.defense += item.defenseBonus;
        if (item.healthBonus) {
            this.maxHealth += item.healthBonus;
            this.health += item.healthBonus;
        }
    }

    unequipItem(itemType) {
        const item = this.equipment[itemType];
        if (!item) return;
        
        if (item.damageBonus) this.damage -= item.damageBonus;
        if (item.defenseBonus) this.defense -= item.defenseBonus;
        if (item.healthBonus) {
            this.maxHealth -= item.healthBonus;
            this.health = Math.min(this.health, this.maxHealth);
        }
        
        this.equipment[itemType] = null;
    }

    sellItem(item) {
        if (this.equipment[item.type] === item) {
            this.unequipItem(item.type);
        }
        
        this.gold += item.value;
        this.inventory = this.inventory.filter(i => i !== item);
    }

    respawn() {
        this.health = this.maxHealth;
        this.gold = Math.max(0, this.gold - 10);
    }
}
