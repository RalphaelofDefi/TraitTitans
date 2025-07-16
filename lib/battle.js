/**
 * Battle System
 * Handles turn-based combat mechanics and damage calculations
 */

class BattleSystem {
    /**
     * Generate a random opponent based on player stats
     */
    static generateOpponent(playerStats) {
        const opponentNames = [
            'Shadow Warrior', 'Iron Golem', 'Swift Assassin', 'Wise Sage',
            'Brutal Berserker', 'Arcane Mage', 'Noble Knight', 'Cunning Rogue',
            'Frost Giant', 'Fire Demon', 'Storm Caller', 'Earth Guardian'
        ];

        const name = opponentNames[Math.floor(Math.random() * opponentNames.length)];
        
        // Generate opponent stats based on player level with some randomness
        const playerLevel = Math.floor((playerStats.strength + playerStats.speed + 
                                      playerStats.wisdom + playerStats.reputation) / 4);
        
        const baseStats = Math.max(5, playerLevel - 5 + Math.floor(Math.random() * 10));
        const variance = Math.floor(Math.random() * 6) - 3; // -3 to +3 variance
        
        const opponent = {
            name: name,
            strength: Math.max(1, baseStats + variance + Math.floor(Math.random() * 5)),
            speed: Math.max(1, baseStats + variance + Math.floor(Math.random() * 5)),
            wisdom: Math.max(1, baseStats + variance + Math.floor(Math.random() * 5)),
            reputation: Math.max(1, baseStats + Math.floor(Math.random() * 3)),
            maxHealth: 100,
            health: 100
        };

        return opponent;
    }

    /**
     * Calculate damage based on attacker's strength and defender's stats
     */
    static calculateDamage(attacker, defender, actionType = 'attack') {
        let baseDamage = 0;
        let criticalChance = 0.1; // 10% base critical chance
        let criticalMultiplier = 1.5;

        switch (actionType) {
            case 'attack':
                baseDamage = attacker.strength + Math.floor(Math.random() * 10);
                criticalChance += (attacker.speed / 100); // Speed increases crit chance
                break;
            
            case 'skill':
                // Skill attacks use wisdom for damage calculation
                baseDamage = Math.floor((attacker.wisdom + attacker.strength) / 2) + 
                           Math.floor(Math.random() * 15);
                criticalChance += (attacker.wisdom / 100);
                criticalMultiplier = 2.0; // Skills have higher crit multiplier
                break;
            
            default:
                baseDamage = Math.floor(attacker.strength / 2) + Math.floor(Math.random() * 5);
        }

        // Apply defense reduction (defender's wisdom reduces damage)
        const defenseReduction = Math.floor(defender.wisdom / 4);
        baseDamage = Math.max(1, baseDamage - defenseReduction);

        // Check for critical hit
        const isCritical = Math.random() < criticalChance;
        if (isCritical) {
            baseDamage = Math.floor(baseDamage * criticalMultiplier);
        }

        return {
            damage: baseDamage,
            isCritical: isCritical
        };
    }

    /**
     * Perform a battle action and return the result
     */
    static performAction(attacker, defender, action) {
        let message = '';
        let damage = 0;

        switch (action) {
            case 'attack':
                const attackResult = this.calculateDamage(attacker, defender, 'attack');
                damage = attackResult.damage;
                message = `${attacker.name || 'You'} attack${attacker.name ? 's' : ''} for ${damage} damage`;
                if (attackResult.isCritical) {
                    message += ' (CRITICAL HIT!)';
                }
                break;

            case 'defend':
                message = `${attacker.name || 'You'} take${attacker.name ? 's' : ''} a defensive stance`;
                // Defending doesn't deal damage but will reduce incoming damage
                break;

            case 'skill':
                const skillResult = this.calculateDamage(attacker, defender, 'skill');
                damage = skillResult.damage;
                const skillName = this.getRandomSkillName(attacker);
                message = `${attacker.name || 'You'} use${attacker.name ? 's' : ''} ${skillName} for ${damage} damage`;
                if (skillResult.isCritical) {
                    message += ' (CRITICAL HIT!)';
                }
                break;

            default:
                message = 'Invalid action';
        }

        return {
            message: message,
            damage: damage,
            action: action
        };
    }

    /**
     * Get a random skill name based on character stats
     */
    static getRandomSkillName(character) {
        const strengthSkills = ['Power Strike', 'Crushing Blow', 'Berserker Rage', 'Mighty Swing'];
        const speedSkills = ['Lightning Strike', 'Quick Slash', 'Rapid Fire', 'Blitz Attack'];
        const wisdomSkills = ['Arcane Bolt', 'Mind Blast', 'Wisdom Strike', 'Mystic Wave'];
        
        const highestStat = Math.max(character.strength, character.speed, character.wisdom);
        
        let skillPool = [];
        if (character.strength === highestStat) {
            skillPool = strengthSkills;
        } else if (character.speed === highestStat) {
            skillPool = speedSkills;
        } else {
            skillPool = wisdomSkills;
        }

        return skillPool[Math.floor(Math.random() * skillPool.length)];
    }

    /**
     * Check if a character can perform a specific action
     */
    static canPerformAction(character, action) {
        switch (action) {
            case 'attack':
                return true; // Always available
            
            case 'defend':
                return true; // Always available
            
            case 'skill':
                // Skills require minimum wisdom
                return character.wisdom >= 5;
            
            default:
                return false;
        }
    }

    /**
     * Calculate battle outcome prediction
     */
    static predictBattleOutcome(player, opponent) {
        const playerTotal = player.strength + player.speed + player.wisdom;
        const opponentTotal = opponent.strength + opponent.speed + opponent.wisdom;
        
        const playerAdvantage = playerTotal - opponentTotal;
        
        let winChance = 0.5; // Base 50% chance
        
        // Adjust based on stat difference
        winChance += (playerAdvantage / 100);
        
        // Speed advantage for going first
        if (player.speed > opponent.speed) {
            winChance += 0.1;
        } else if (player.speed < opponent.speed) {
            winChance -= 0.1;
        }
        
        // Clamp between 0.1 and 0.9
        winChance = Math.max(0.1, Math.min(0.9, winChance));
        
        return {
            winChance: winChance,
            difficulty: this.getDifficultyRating(playerAdvantage)
        };
    }

    /**
     * Get difficulty rating based on stat difference
     */
    static getDifficultyRating(statDifference) {
        if (statDifference > 20) return 'Very Easy';
        if (statDifference > 10) return 'Easy';
        if (statDifference > -10) return 'Medium';
        if (statDifference > -20) return 'Hard';
        return 'Very Hard';
    }

    /**
     * Generate battle summary
     */
    static generateBattleSummary(player, opponent, winner, totalTurns) {
        const playerDamageDealt = opponent.maxHealth - opponent.health;
        const opponentDamageDealt = player.maxHealth - player.health;
        
        return {
            winner: winner,
            totalTurns: totalTurns,
            playerDamageDealt: playerDamageDealt,
            opponentDamageDealt: opponentDamageDealt,
            playerHealthRemaining: player.health,
            opponentHealthRemaining: opponent.health
        };
    }

    /**
     * Get status effects (for future implementation)
     */
    static getStatusEffects(character) {
        const effects = [];
        
        // Example status effects based on stats
        if (character.strength > 30) {
            effects.push('Mighty');
        }
        if (character.speed > 30) {
            effects.push('Swift');
        }
        if (character.wisdom > 30) {
            effects.push('Wise');
        }
        if (character.reputation > 30) {
            effects.push('Renowned');
        }
        
        return effects;
    }
}

// Export for use in main game
window.BattleSystem = BattleSystem;
