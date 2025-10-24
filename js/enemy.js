class Enemy {
    constructor(level, name) {
        this.level = level;
        this.name = name;
        this.maxHealth = 30 + level * 15;
        this.health = this.maxHealth;
        this.damage = 5 + level * 2;
        this.defense = level;
        this.speed = 8 + level;
        this.expReward = 10 + level * 5;
        this.goldReward = 5 + level * 2;
    }

    attack(target) {
        return target.takeDamage(this.damage);
    }

    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health -= actualDamage;
        return actualDamage;
    }
}
