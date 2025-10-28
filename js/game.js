// В класс Game добавим методы для работы с модальными окнами

setupEventListeners() {
    console.log("Настройка обработчиков событий...");
    document.getElementById('inventoryBtn').addEventListener('click', () => this.toggleInventory());
    document.getElementById('equipmentBtn').addEventListener('click', () => this.toggleEquipment());
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    
    // Закрытие модальных окон
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => this.closeAllModals());
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'i' || e.key === 'I') {
            this.toggleInventory();
        } else if (e.key === 'e' || e.key === 'E') {
            this.toggleEquipment();
        } else if (e.key === ' ' || e.key === 'Spacebar') {
            this.togglePause();
        } else if (e.key === 'Escape') {
            this.closeAllModals();
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            this.closeAllModals();
        }
    });
    
    console.log("Обработчики событий настроены");
}

closeAllModals() {
    document.getElementById('inventoryModal').style.display = 'none';
    document.getElementById('equipmentModal').style.display = 'none';
}

toggleInventory() {
    const modal = document.getElementById('inventoryModal');
    if (modal.style.display === 'block') {
        this.closeAllModals();
    } else {
        this.closeAllModals();
        this.openInventory();
    }
}

toggleEquipment() {
    const modal = document.getElementById('equipmentModal');
    if (modal.style.display === 'block') {
        this.closeAllModals();
    } else {
        this.closeAllModals();
        this.openEquipment();
    }
}

openInventory() {
    const modal = document.getElementById('inventoryModal');
    const inventoryGrid = document.getElementById('inventoryGrid');
    const emptyInventory = document.getElementById('emptyInventory');
    
    inventoryGrid.innerHTML = '';
    
    if (this.player.inventory.length === 0) {
        emptyInventory.style.display = 'block';
        inventoryGrid.style.display = 'none';
    } else {
        emptyInventory.style.display = 'none';
        inventoryGrid.style.display = 'grid';
        
        this.player.inventory.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            if (this.player.equipment[item.type] === item) {
                itemElement.classList.add('equipped');
            }
            
            itemElement.innerHTML = `
                <div class="item-value">${item.value}💰</div>
                <div class="item-type">${item.getTypeName()}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-stats">
                    ${item.damageBonus ? `⚔️ +${item.damageBonus} урона<br>` : ''}
                    ${item.defenseBonus ? `🛡️ +${item.defenseBonus} защиты<br>` : ''}
                    ${item.healthBonus ? `❤️ +${item.healthBonus} здоровья` : ''}
                </div>
            `;
            
            itemElement.addEventListener('click', (e) => {
                if (e.button === 0) { // ЛКМ
                    this.player.toggleEquipment(item);
                    this.openInventory();
                    this.openEquipment(); // Обновляем окно экипировки
                    this.updatePlayerInfo();
                }
            });
            
            itemElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (confirm(`Продать ${item.name} за ${item.value} золота?`)) {
                    this.player.sellItem(item);
                    this.openInventory();
                    this.openEquipment(); // Обновляем окно экипировки
                    this.updatePlayerInfo();
                }
            });
            
            inventoryGrid.appendChild(itemElement);
        });
    }
    
    modal.style.display = 'block';
}

openEquipment() {
    const modal = document.getElementById('equipmentModal');
    
    // Обновляем слоты экипировки
    this.updateEquipmentSlots();
    
    // Обновляем суммарные бонусы
    this.updateBonusStats();
    
    modal.style.display = 'block';
}

updateEquipmentSlots() {
    const equipment = this.player.equipment;
    
    // Оружие
    const weaponSlot = document.getElementById('weaponSlotModal');
    const weaponStats = document.getElementById('weaponStats');
    if (equipment.weapon) {
        weaponSlot.innerHTML = `
            <div class="equipped-item">
                <div class="equipped-item-name">${equipment.weapon.name}</div>
                <div class="equipped-item-stats">
                    ⚔️ +${equipment.weapon.damageBonus} урона
                </div>
            </div>
        `;
        weaponStats.innerHTML = `⚔️ Бонус урона: +${equipment.weapon.damageBonus}`;
        weaponSlot.parentElement.classList.add('equipped');
    } else {
        weaponSlot.innerHTML = '<div class="empty-slot">Пусто</div>';
        weaponStats.innerHTML = '';
        weaponSlot.parentElement.classList.remove('equipped');
    }
    
    // Броня
    const armorSlot = document.getElementById('armorSlotModal');
    const armorStats = document.getElementById('armorStats');
    if (equipment.armor) {
        armorSlot.innerHTML = `
            <div class="equipped-item">
                <div class="equipped-item-name">${equipment.armor.name}</div>
                <div class="equipped-item-stats">
                    🛡️ +${equipment.armor.defenseBonus} защиты<br>
                    ❤️ +${equipment.armor.healthBonus} здоровья
                </div>
            </div>
        `;
        armorStats.innerHTML = `🛡️ Бонус защиты: +${equipment.armor.defenseBonus}<br>❤️ Бонус здоровья: +${equipment.armor.healthBonus}`;
        armorSlot.parentElement.classList.add('equipped');
    } else {
        armorSlot.innerHTML = '<div class="empty-slot">Пусто</div>';
        armorStats.innerHTML = '';
        armorSlot.parentElement.classList.remove('equipped');
    }
    
    // Аксессуар
    const accessorySlot = document.getElementById('accessorySlotModal');
    const accessoryStats = document.getElementById('accessoryStats');
    if (equipment.accessory) {
        accessorySlot.innerHTML = `
            <div class="equipped-item">
                <div class="equipped-item-name">${equipment.accessory.name}</div>
                <div class="equipped-item-stats">
                    ⚔️ +${equipment.accessory.damageBonus} урона<br>
                    🛡️ +${equipment.accessory.defenseBonus} защиты<br>
                    ❤️ +${equipment.accessory.healthBonus} здоровья
                </div>
            </div>
        `;
        accessoryStats.innerHTML = `
            ⚔️ Бонус урона: +${equipment.accessory.damageBonus}<br>
            🛡️ Бонус защиты: +${equipment.accessory.defenseBonus}<br>
            ❤️ Бонус здоровья: +${equipment.accessory.healthBonus}
        `;
        accessorySlot.parentElement.classList.add('equipped');
    } else {
        accessorySlot.innerHTML = '<div class="empty-slot">Пусто</div>';
        accessoryStats.innerHTML = '';
        accessorySlot.parentElement.classList.remove('equipped');
    }
}

updateBonusStats() {
    let totalDamageBonus = 0;
    let totalDefenseBonus = 0;
    let totalHealthBonus = 0;
    
    Object.values(this.player.equipment).forEach(item => {
        if (item) {
            totalDamageBonus += item.damageBonus || 0;
            totalDefenseBonus += item.defenseBonus || 0;
            totalHealthBonus += item.healthBonus || 0;
        }
    });
    
    document.getElementById('totalDamageBonus').textContent = totalDamageBonus;
    document.getElementById('totalDefenseBonus').textContent = totalDefenseBonus;
    document.getElementById('totalHealthBonus').textContent = totalHealthBonus;
}

// Обновим метод updateEquipment для удаления старого отображения экипировки
updateEquipment() {
    // Теперь экипировка отображается только в модальном окне
    // Этот метод можно оставить пустым или удалить
}
