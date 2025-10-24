class Enemy {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.level = level;
        this.maxHealth = 50 + level * 10;
        this.health = this.maxHealth;
        this.damage = 5 + level * 2;
        this.defense = level;
        this.speed = 1 + level * 0.1;
        this.radius = 15;
        this.expReward = 10 + level * 5;
        this.goldReward = 5 + level * 2;
        this.attackCooldown = 0;
        this.attackSpeed = 0.5;
        this.color = '#f44336';
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

    attack(player) {
        if (this.attackCooldown <= 0) {
            player.takeDamage(this.damage);
            this.attackCooldown = 1000 / this.attackSpeed;
            return true;
        }
        return false;
    }

    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health -= actualDamage;
        return actualDamage;
    }

    update(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }

    render(ctx) {
        // Рисуем врага
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Рисуем полоску здоровья
        this.renderHealthBar(ctx);
    }

    renderHealthBar(ctx) {
        const barWidth = 30;
        const barHeight = 5;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#443333';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth, barHeight);
        
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth * healthPercent, barHeight);
    }
}