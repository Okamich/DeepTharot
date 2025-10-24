// Система событий для исследования мира
class EventSystem {
    constructor(game) {
        this.game = game;
        this.locations = [
            {
                name: "Лесная тропа",
                description: "Вы идете по заросшей лесной тропинке. Вокруг шелестят листья, и доносится пение птиц.",
                icon: "🌲"
            },
            {
                name: "Горная тропа", 
                description: "Каменистая тропа ведет вверх по склону горы. Воздух становится прохладнее.",
                icon: "⛰️"
            },
            {
                name: "Речной берег",
                description: "Вы вышли к быстрой реке. Вода чистая и прозрачная, на противоположном берегу виднеются огни.",
                icon: "🌊"
            },
            {
                name: "Заброшенная деревня",
                description: "Разрушенные дома и заросшие улицы. Когда-то здесь кипела жизнь, теперь только ветер гуляет между руин.",
                icon: "🏚️"
            },
            {
                name: "Таинственный лес",
                description: "Древний лес с высокими деревьями, сквозь кроны которых barely пробивается свет. Воздух наполнен магией.",
                icon: "🌳"
            }
        ];
    }

    changeLocation() {
        const location = this.locations[Math.floor(Math.random() * this.locations.length)];
        document.getElementById('locationImage').textContent = location.icon;
        document.getElementById('locationTitle').textContent = location.name;
        document.getElementById('locationDescription').textContent = location.description;
    }

    triggerRandomEvent() {
        const events = [
            this.findGoldEvent.bind(this),
            this.findItemEvent.bind(this),
            this.healingEvent.bind(this),
            this.experienceEvent.bind(this),
            this.discoveryEvent.bind(this),
            this.startBattleEvent.bind(this)
        ];
        
        // Выбираем случайное событие
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        randomEvent();
    }

    findGoldEvent() {
        const goldAmount = 10 + Math.floor(Math.random() * 20) + this.game.currentLevel * 5;
        this.game.player.gold += goldAmount;
        
        this.showEventResult(
            "Найден клад!",
            "Вы нашли спрятанный клад под старым деревом.",
            [{ type: "gold", amount: goldAmount }]
        );
        
        this.game.addLogEntry(`Вы нашли ${goldAmount} золотых монет!`, "gold");
    }

    findItemEvent() {
        const itemTypes = ['weapon', 'armor', 'accessory'];
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const item = new Item(itemType, this.game.currentLevel);
        this.game.player.addItem(item);
        
        this.showEventResult(
            "Найден предмет!",
            "Вы обнаружили сундук с сокровищами.",
            [{ type: "item", item: item }]
        );
        
        this.game.addLogEntry(`Получено: ${item.name}`, "info");
    }

    healingEvent() {
        const healAmount = 10 + Math.floor(Math.random() * 20);
        const oldHealth = this.game.player.health;
        this.game.player.health = Math.min(this.game.player.health + healAmount, this.game.player.maxHealth);
        const actualHeal = this.game.player.health - oldHealth;
        
        this.showEventResult(
            "Целебный источник",
            "Вы нашли природный источник с целебной водой.",
            [{ type: "heal", amount: actualHeal }]
        );
        
        this.game.addLogEntry(`Вы восстановили ${actualHeal} здоровья!`, "heal");
    }

    experienceEvent() {
        const expAmount = 15 + Math.floor(Math.random() * 25) + this.game.currentLevel * 5;
        const levelsGained = this.game.player.gainExp(expAmount);
        
        this.showEventResult(
            "Древние знания",
            "Вы нашли древние руины и почерпнули знания из прошлого.",
            [{ type: "exp", amount: expAmount }]
        );
        
        if (levelsGained > 0) {
            this.game.addLogEntry(`Получено ${expAmount} опыта! Уровень повышен!`, "levelup");
        } else {
            this.game.addLogEntry(`Получено ${expAmount} опыта!`, "exp");
        }
    }

    discoveryEvent() {
        const discoveries = [
            {
                title: "Таинственный алтарь",
                description: "Вы нашли древний алтарь, излучающий магическую энергию.",
                rewards: [
                    { type: "exp", amount: 25 },
                    { type: "gold", amount: 15 }
                ]
            },
            {
                title: "Заброшенная лавка алхимика",
                description: "В разрушенной лавке вы нашли несколько полезных зелий.",
                rewards: [
                    { type: "heal", amount: 20 },
                    { type: "gold", amount: 10 }
                ]
            },
            {
                title: "Гнездо гигантской птицы",
                description: "В гнезде вы нашли блестящие предметы, которые птица собирала.",
                rewards: [
                    { type: "gold", amount: 30 }
                ]
            }
        ];
        
        const discovery = discoveries[Math.floor(Math.random() * discoveries.length)];
        
        // Применяем награды
        discovery.rewards.forEach(reward => {
            if (reward.type === "gold") {
                this.game.player.gold += reward.amount;
            } else if (reward.type === "exp") {
                this.game.player.gainExp(reward.amount);
            } else if (reward.type === "heal") {
                this.game.player.health = Math.min(this.game.player.health + reward.amount, this.game.player.maxHealth);
            }
        });
        
        this.showEventResult(
            discovery.title,
            discovery.description,
            discovery.rewards
        );
        
        this.game.addLogEntry(`Открытие: ${discovery.title}`, "event");
    }

    startBattleEvent() {
        this.game.addLogEntry("Внезапно вас атакуют враги!", "damage");
        this.game.startBattle();
    }

    showEventResult(title, description, rewards) {
        const eventResult = document.getElementById('eventResult');
        const eventTitle = document.getElementById('eventTitle');
        const eventDescription = document.getElementById('eventDescription');
        const eventRewards = document.getElementById('eventRewards');
        
        eventTitle.textContent = title;
        eventDescription.textContent = description;
        eventRewards.innerHTML = '';
        
        rewards.forEach(reward => {
            const rewardElement = document.createElement('div');
            rewardElement.className = 'reward-item';
            
            let icon = '';
            let text = '';
            
            switch (reward.type) {
                case 'gold':
                    icon = '💰';
                    text = `+${reward.amount} золота`;
                    break;
                case 'exp':
                    icon = '⭐';
                    text = `+${reward.amount} опыта`;
                    break;
                case 'heal':
                    icon = '❤️';
                    text = `+${reward.amount} здоровья`;
                    break;
                case 'item':
                    icon = '🎁';
                    text = reward.item.name;
                    break;
            }
            
            rewardElement.innerHTML = `
                <span class="reward-icon">${icon}</span>
                <span>${text}</span>
            `;
            
            eventRewards.appendChild(rewardElement);
        });
        
        eventResult.style.display = 'block';
        
        // Скрываем результат события через 3 секунды
        setTimeout(() => {
            eventResult.style.display = 'none';
            this.changeLocation();
        }, 3000);
    }
}
