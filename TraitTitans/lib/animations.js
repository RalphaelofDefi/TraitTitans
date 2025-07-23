/**
 * Battle Animation System for Trait Titans
 * Handles visual effects and animations for battles
 */

class AnimationSystem {
    constructor() {
        this.isInitialized = false;
        this.activeAnimations = new Map();
        this.animationQueue = [];
    }

    /**
     * Initialize animation system
     */
    init() {
        this.isInitialized = true;
        console.log('Animation System initialized');
    }

    /**
     * Animate PvP battle sequence
     */
    async animatePvPBattle(challenger, opponent, battleResult) {
        try {
            const battleContainer = document.getElementById('pvp-battle-animation');
            if (!battleContainer) {
                console.warn('Battle animation container not found');
                return;
            }

            // Clear previous animations
            this.clearBattleAnimations();

            // Show battle arena
            await this.showBattleArena(challenger, opponent);

            // Animate battle rounds
            for (let round = 1; round <= battleResult.rounds; round++) {
                await this.animateRound(challenger, opponent, round);
            }

            // Show final result
            await this.showBattleResult(battleResult);

        } catch (error) {
            console.error('Battle animation failed:', error);
        }
    }

    /**
     * Show battle arena with both fighters
     */
    async showBattleArena(challenger, opponent) {
        const container = document.getElementById('pvp-battle-animation');
        
        container.innerHTML = `
            <div class="battle-arena-container">
                <div class="fighter fighter-left" id="challenger-fighter">
                    <div class="fighter-avatar">
                        <div class="avatar-body strength-${Math.floor(challenger.strength / 10)}"></div>
                        <div class="fighter-weapons">
                            ${this.getWeaponIcon(challenger)}
                        </div>
                    </div>
                    <div class="fighter-info">
                        <h5>${challenger.name}</h5>
                        <div class="health-bar">
                            <div class="health-fill" id="challenger-health" style="width: 100%"></div>
                        </div>
                        <div class="fighter-stats">
                            <span>💪 ${challenger.strength}</span>
                            <span>⚡ ${challenger.speed}</span>
                            <span>🧠 ${challenger.wisdom}</span>
                        </div>
                    </div>
                </div>

                <div class="battle-vs">
                    <div class="vs-text">VS</div>
                    <div class="battle-log" id="battle-animation-log"></div>
                </div>

                <div class="fighter fighter-right" id="opponent-fighter">
                    <div class="fighter-avatar">
                        <div class="avatar-body strength-${Math.floor(opponent.strength / 10)}"></div>
                        <div class="fighter-weapons">
                            ${this.getWeaponIcon(opponent)}
                        </div>
                    </div>
                    <div class="fighter-info">
                        <h5>${opponent.name}</h5>
                        <div class="health-bar">
                            <div class="health-fill" id="opponent-health" style="width: 100%"></div>
                        </div>
                        <div class="fighter-stats">
                            <span>💪 ${opponent.strength}</span>
                            <span>⚡ ${opponent.speed}</span>
                            <span>🧠 ${opponent.wisdom}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Animate arena entrance
        container.style.opacity = '0';
        container.style.transform = 'scale(0.8)';
        container.style.display = 'block';

        await this.animateElement(container, {
            opacity: 1,
            transform: 'scale(1)'
        }, 500);
    }

    /**
     * Animate a single battle round
     */
    async animateRound(challenger, opponent, roundNumber) {
        const log = document.getElementById('battle-animation-log');
        
        // Add round indicator
        this.addBattleLogEntry(`Round ${roundNumber}`, 'round-indicator');
        
        await this.delay(800);

        // Determine who attacks first based on speed
        const challengerGoesFirst = challenger.speed >= opponent.speed;
        
        if (challengerGoesFirst) {
            await this.animateAttack('challenger', 'opponent');
            await this.delay(500);
            await this.animateAttack('opponent', 'challenger');
        } else {
            await this.animateAttack('opponent', 'challenger');
            await this.delay(500);
            await this.animateAttack('challenger', 'opponent');
        }

        await this.delay(1000);
    }

    /**
     * Animate attack between fighters
     */
    async animateAttack(attackerId, defenderId) {
        const attacker = document.getElementById(`${attackerId}-fighter`);
        const defender = document.getElementById(`${defenderId}-fighter`);
        
        if (!attacker || !defender) return;

        // Attacker animation
        await this.animateElement(attacker, {
            transform: attackerId === 'challenger' ? 'translateX(30px) scale(1.1)' : 'translateX(-30px) scale(1.1)',
            filter: 'brightness(1.2)'
        }, 200);

        // Impact effect
        await this.createImpactEffect(defender);

        // Defender hit animation
        await this.animateElement(defender, {
            transform: 'scale(0.9)',
            filter: 'brightness(0.8) hue-rotate(10deg)'
        }, 150);

        // Reset attacker
        await this.animateElement(attacker, {
            transform: 'translateX(0) scale(1)',
            filter: 'brightness(1)'
        }, 200);

        // Reset defender
        await this.animateElement(defender, {
            transform: 'scale(1)',
            filter: 'brightness(1)'
        }, 200);

        // Update health bar
        await this.updateHealthBar(defenderId, Math.random() * 20 + 10);
    }

    /**
     * Create impact particle effect
     */
    async createImpactEffect(targetElement) {
        const particles = document.createElement('div');
        particles.className = 'impact-particles';
        particles.innerHTML = Array.from({length: 8}, (_, i) => 
            `<div class="particle" style="--angle: ${i * 45}deg"></div>`
        ).join('');

        targetElement.appendChild(particles);

        await this.delay(500);
        particles.remove();
    }

    /**
     * Update health bar animation
     */
    async updateHealthBar(fighterId, damage) {
        const healthBar = document.getElementById(`${fighterId}-health`);
        if (!healthBar) return;

        const currentWidth = parseFloat(healthBar.style.width) || 100;
        const newWidth = Math.max(0, currentWidth - damage);

        await this.animateElement(healthBar, {
            width: `${newWidth}%`
        }, 300);

        // Add damage number
        const damageNumber = document.createElement('div');
        damageNumber.className = 'damage-number';
        damageNumber.textContent = `-${Math.floor(damage)}`;
        
        const fighter = document.getElementById(`${fighterId}-fighter`);
        fighter.appendChild(damageNumber);

        await this.delay(800);
        damageNumber.remove();
    }

    /**
     * Show battle result with animation
     */
    async showBattleResult(battleResult) {
        const container = document.getElementById('pvp-battle-animation');
        
        const resultElement = document.createElement('div');
        resultElement.className = 'battle-result-overlay';
        resultElement.innerHTML = `
            <div class="result-content">
                <h2 class="result-title">${battleResult.winner === 'challenger' ? 'Victory!' : 'Defeat!'}</h2>
                <div class="result-details">
                    <p>Battle completed in ${battleResult.rounds} rounds</p>
                    <div class="result-rewards">
                        <h4>Battle Results:</h4>
                        <ul>
                            <li>Winner: ${battleResult.winner}</li>
                            <li>Rounds: ${battleResult.rounds}</li>
                        </ul>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.style.display='none'">
                    Continue
                </button>
            </div>
        `;

        container.appendChild(resultElement);

        // Animate result appearance
        resultElement.style.opacity = '0';
        resultElement.style.transform = 'scale(0.8)';
        
        await this.animateElement(resultElement, {
            opacity: 1,
            transform: 'scale(1)'
        }, 500);
    }

    /**
     * Animate mission completion
     */
    async animateMissionComplete(mission, rewards) {
        const missionElement = document.querySelector(`[data-mission-id="${mission.id}"]`);
        if (!missionElement) return;

        // Mission completion flash
        await this.animateElement(missionElement, {
            backgroundColor: '#28a745',
            transform: 'scale(1.05)'
        }, 300);

        // Show rewards popup
        await this.showRewardsPopup(rewards);

        // Reset mission element
        await this.animateElement(missionElement, {
            backgroundColor: '',
            transform: 'scale(1)'
        }, 300);
    }

    /**
     * Show rewards popup with animation
     */
    async showRewardsPopup(rewards) {
        const popup = document.createElement('div');
        popup.className = 'rewards-popup';
        popup.innerHTML = `
            <div class="rewards-content">
                <h4>🎉 Mission Complete!</h4>
                <div class="rewards-list">
                    ${Object.entries(rewards).map(([stat, value]) => 
                        `<div class="reward-item">+${value} ${stat.toUpperCase()}</div>`
                    ).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Animate popup
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -60%) scale(0.8)';
        
        await this.animateElement(popup, {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)'
        }, 400);

        await this.delay(2000);

        await this.animateElement(popup, {
            opacity: 0,
            transform: 'translate(-50%, -40%) scale(0.8)'
        }, 300);

        popup.remove();
    }

    /**
     * Animate stat increase
     */
    async animateStatIncrease(statElement, oldValue, newValue) {
        if (!statElement) return;

        // Highlight stat increase
        await this.animateElement(statElement, {
            color: '#28a745',
            transform: 'scale(1.2)'
        }, 200);

        // Animate number change
        await this.animateNumberChange(statElement, oldValue, newValue);

        // Reset styling
        await this.animateElement(statElement, {
            color: '',
            transform: 'scale(1)'
        }, 200);
    }

    /**
     * Animate number change with counting effect
     */
    async animateNumberChange(element, oldValue, newValue) {
        const duration = 500;
        const steps = 20;
        const stepSize = (newValue - oldValue) / steps;
        const stepDuration = duration / steps;

        for (let i = 0; i <= steps; i++) {
            const currentValue = Math.floor(oldValue + (stepSize * i));
            element.textContent = currentValue;
            await this.delay(stepDuration);
        }

        element.textContent = newValue;
    }

    /**
     * Get weapon icon based on player stats
     */
    getWeaponIcon(player) {
        const maxStat = Math.max(player.strength, player.speed, player.wisdom);
        
        if (maxStat === player.strength) {
            return '<i class="fas fa-sword weapon-icon strength-weapon"></i>';
        } else if (maxStat === player.speed) {
            return '<i class="fas fa-bolt weapon-icon speed-weapon"></i>';
        } else {
            return '<i class="fas fa-magic weapon-icon wisdom-weapon"></i>';
        }
    }

    /**
     * Add entry to battle log
     */
    addBattleLogEntry(message, type = 'normal') {
        const log = document.getElementById('battle-animation-log');
        if (!log) return;

        const entry = document.createElement('div');
        entry.className = `battle-log-entry ${type}`;
        entry.textContent = message;
        
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;

        // Remove old entries to prevent overflow
        const entries = log.querySelectorAll('.battle-log-entry');
        if (entries.length > 10) {
            entries[0].remove();
        }
    }

    /**
     * Clear battle animations
     */
    clearBattleAnimations() {
        const container = document.getElementById('pvp-battle-animation');
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }

        // Clear any active animations
        this.activeAnimations.clear();
    }

    /**
     * Generic element animation helper
     */
    async animateElement(element, properties, duration = 300) {
        return new Promise(resolve => {
            if (!element) {
                resolve();
                return;
            }

            // Store original styles
            const originalStyles = {};
            Object.keys(properties).forEach(prop => {
                originalStyles[prop] = element.style[prop];
            });

            // Apply transition
            element.style.transition = `all ${duration}ms ease-in-out`;
            
            // Apply new styles
            Object.entries(properties).forEach(([prop, value]) => {
                element.style[prop] = value;
            });

            // Clean up after animation
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Cleanup animations on destroy
     */
    destroy() {
        this.clearBattleAnimations();
        this.activeAnimations.clear();
        this.animationQueue = [];
        this.isInitialized = false;
    }
}

// Create global instance
window.AnimationSystem = new AnimationSystem();