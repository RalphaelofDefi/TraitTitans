/**
 * PvP Battle System for Trait Titans
 * Handles player vs player battles using wallet addresses
 */

class PvPBattleSystem {
    constructor() {
        this.battleHistory = [];
        this.isInitialized = false;
    }

    /**
     * Initialize PvP system
     */
    async init() {
        this.isInitialized = true;
        console.log('PvP Battle System initialized');
    }

    /**
     * Challenge another player by wallet address
     */
    async challengePlayer(challengerWallet, opponentWallet) {
        try {
            if (!challengerWallet || !opponentWallet) {
                throw new Error('Both player wallets are required');
            }

            if (challengerWallet === opponentWallet) {
                throw new Error('Cannot challenge yourself');
            }

            console.log(`Initiating PvP battle: ${challengerWallet} vs ${opponentWallet}`);

            // Fetch player traits from Honeycomb
            const challengerTraits = await this.getPlayerTraits(challengerWallet);
            const opponentTraits = await this.getPlayerTraits(opponentWallet);

            if (!challengerTraits || !opponentTraits) {
                throw new Error('Unable to fetch player traits');
            }

            // Execute battle
            const battleResult = await this.executeBattle(challengerTraits, opponentTraits);
            
            // Store battle result
            await this.storeBattleResult(challengerWallet, opponentWallet, battleResult);

            return {
                success: true,
                challenger: challengerTraits,
                opponent: opponentTraits,
                result: battleResult
            };

        } catch (error) {
            console.error('PvP challenge failed:', error);
            throw error;
        }
    }

    /**
     * Get player traits from Honeycomb or fallback
     */
    async getPlayerTraits(walletAddress) {
        try {
            // Try to fetch from Honeycomb Protocol
            if (window.HoneycombProtocol && window.HoneycombProtocol.isInitialized) {
                const playerData = await window.HoneycombProtocol.getPlayerDataByWallet(walletAddress);
                if (playerData) {
                    return {
                        wallet: walletAddress,
                        strength: playerData.strength || 10,
                        speed: playerData.speed || 10,
                        wisdom: playerData.wisdom || 10,
                        reputation: playerData.reputation || 10,
                        experience: playerData.experience || 0,
                        name: `Player ${walletAddress.slice(0, 8)}...`
                    };
                }
            }

            // Fallback: Generate mock traits based on wallet address
            return this.generateMockTraits(walletAddress);
        } catch (error) {
            console.error('Failed to get player traits:', error);
            return this.generateMockTraits(walletAddress);
        }
    }

    /**
     * Generate mock traits based on wallet address for testing
     */
    generateMockTraits(walletAddress) {
        // Use wallet address as seed for consistent mock data
        const seed = this.hashCode(walletAddress);
        const random = this.seededRandom(seed);

        return {
            wallet: walletAddress,
            strength: Math.floor(random() * 20) + 10,
            speed: Math.floor(random() * 20) + 10,
            wisdom: Math.floor(random() * 20) + 10,
            reputation: Math.floor(random() * 20) + 10,
            experience: Math.floor(random() * 100),
            name: `Player ${walletAddress.slice(0, 8)}...`
        };
    }

    /**
     * Execute battle between two players
     */
    async executeBattle(challenger, opponent) {
        const battleLog = [];
        
        // Calculate total power for each player
        const challengerPower = challenger.strength + challenger.speed + challenger.wisdom;
        const opponentPower = opponent.strength + opponent.speed + opponent.wisdom;
        
        battleLog.push(`${challenger.name} (Power: ${challengerPower}) vs ${opponent.name} (Power: ${opponentPower})`);

        // Simulate battle rounds
        let challengerHealth = 100;
        let opponentHealth = 100;
        let round = 1;

        while (challengerHealth > 0 && opponentHealth > 0 && round <= 10) {
            battleLog.push(`--- Round ${round} ---`);

            // Determine turn order based on speed
            const challengerGoesFirst = challenger.speed >= opponent.speed;
            
            if (challengerGoesFirst) {
                // Challenger attacks first
                const damage = this.calculateDamage(challenger, opponent);
                opponentHealth = Math.max(0, opponentHealth - damage);
                battleLog.push(`${challenger.name} deals ${damage} damage to ${opponent.name} (${opponentHealth} HP remaining)`);
                
                if (opponentHealth > 0) {
                    const counterDamage = this.calculateDamage(opponent, challenger);
                    challengerHealth = Math.max(0, challengerHealth - counterDamage);
                    battleLog.push(`${opponent.name} deals ${counterDamage} damage to ${challenger.name} (${challengerHealth} HP remaining)`);
                }
            } else {
                // Opponent attacks first
                const damage = this.calculateDamage(opponent, challenger);
                challengerHealth = Math.max(0, challengerHealth - damage);
                battleLog.push(`${opponent.name} deals ${damage} damage to ${challenger.name} (${challengerHealth} HP remaining)`);
                
                if (challengerHealth > 0) {
                    const counterDamage = this.calculateDamage(challenger, opponent);
                    opponentHealth = Math.max(0, opponentHealth - counterDamage);
                    battleLog.push(`${challenger.name} deals ${counterDamage} damage to ${opponent.name} (${opponentHealth} HP remaining)`);
                }
            }

            round++;
        }

        // Determine winner
        let winner, loser;
        if (challengerHealth > opponentHealth) {
            winner = challenger;
            loser = opponent;
        } else if (opponentHealth > challengerHealth) {
            winner = opponent;
            loser = challenger;
        } else {
            // Tie - higher total power wins
            if (challengerPower > opponentPower) {
                winner = challenger;
                loser = opponent;
            } else {
                winner = opponent;
                loser = challenger;
            }
        }

        battleLog.push(`🏆 ${winner.name} wins the battle!`);

        return {
            winner: winner.wallet,
            loser: loser.wallet,
            challengerHealth,
            opponentHealth,
            rounds: round - 1,
            battleLog,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Calculate damage based on attacker and defender stats
     */
    calculateDamage(attacker, defender) {
        const baseDamage = attacker.strength * 0.8;
        const speedBonus = attacker.speed * 0.3;
        const wisdomBonus = attacker.wisdom * 0.2;
        
        const defense = defender.wisdom * 0.5;
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
        
        const totalDamage = Math.max(1, (baseDamage + speedBonus + wisdomBonus - defense) * randomFactor);
        
        return Math.floor(totalDamage);
    }

    /**
     * Store battle result locally and attempt blockchain storage
     */
    async storeBattleResult(challenger, opponent, result) {
        try {
            // Store locally
            this.battleHistory.push({
                challenger,
                opponent,
                result,
                timestamp: new Date().toISOString()
            });

            // Try to store on-chain via Honeycomb
            if (window.HoneycombProtocol && window.HoneycombProtocol.isInitialized) {
                await window.HoneycombProtocol.recordPvPBattle(challenger, opponent, result);
            }

            console.log('Battle result stored successfully');
        } catch (error) {
            console.error('Failed to store battle result:', error);
        }
    }

    /**
     * Get battle history for a player
     */
    getBattleHistory(walletAddress) {
        return this.battleHistory.filter(battle => 
            battle.challenger === walletAddress || battle.opponent === walletAddress
        );
    }

    /**
     * Utility functions
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    seededRandom(seed) {
        let state = seed;
        return function() {
            state = (state * 1664525 + 1013904223) % Math.pow(2, 32);
            return state / Math.pow(2, 32);
        };
    }
}

// Create global instance
window.PvPBattleSystem = new PvPBattleSystem();