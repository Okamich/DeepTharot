class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = 100;
        this.gold = 0;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damage = 10;
        this.defense = 5;
        this.speed = 3;
        this.attackSpeed = 1.0;
        this.attackCooldown = 0;
        
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        
        this.inventory = [];
        this.color = '#2196f3';
    }

    moveTowards(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    attack(enemy) {
        if (this.attackCooldown <= 0) {
            let totalDamage = this.damage;
            if (this.equipment.weapon) {
                totalDamage += this.equipment.weapon.damageBonus;
            }
            if (this.equipment.accessory) {
                totalDamage += this.equipment.accessory.damageBonus;
            }
            
            enemy.takeDamage(totalDamage);
            this.attackCooldown = 1000 / this.attackSpeed;
            return true;
        }
        return false;
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
        if (this.exp >= this.expToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp -= this.expToNextLevel;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
        
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.damage += 5;
        this.defense += 2;
        this.speed += 0.2;
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
        
        // Применяем бонусы
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
        
        // Убираем бонусы
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

    update(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }

    render(ctx) {
        // Рисуем игрока
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Рисуем полоску здоровья
        this.renderHealthBar(ctx);
    }

    renderHealthBar(ctx) {
        const barWidth = 40;
        const barHeight = 5;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#443333';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth, barHeight);
        
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth * healthPercent, barHeight);
    }

    respawn() {
        this.health = this.maxHealth;
        this.gold = Math.max(0, this.gold - 10); // Штраф за смерть
    }
}