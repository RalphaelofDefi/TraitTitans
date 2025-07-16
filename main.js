/**
 * Trait Titans - Main Game Controller
 * Manages UI logic, game state, and coordinates between different modules
 */

class TraitTitansGame {
    constructor() {
        this.playerStats = {
            strength: 10,
            speed: 10,
            wisdom: 10,
            reputation: 10,
            health: 100,
            maxHealth: 100
        };

        this.gameState = {
            isInBattle: false,
            currentMission: null,
            opponent: null,
            battleTurn: 'player',
            isDefending: false
        };

        this.missions = [
            {
                id: 'training_grounds',
                name: 'Training Grounds',
                description: 'Basic combat training to improve your strength.',
                difficulty: 'Easy',
                rewards: { strength: 2, reputation: 1 },
                duration: 3000,
                status: 'available'
            },
            {
                id: 'speed_trial',
                name: 'Speed Trial',
                description: 'Race through the obstacle course to increase agility.',
                difficulty: 'Medium',
                rewards: { speed: 3, reputation: 1 },
                duration: 4000,
                status: 'available'
            },
            {
                id: 'wisdom_quest',
                name: 'Ancient Library',
                description: 'Study ancient texts to gain wisdom and knowledge.',
                difficulty: 'Medium',
                rewards: { wisdom: 4, reputation: 2 },
                duration: 5000,
                status: 'available'
            },
            {
                id: 'reputation_mission',
                name: 'Help the Village',
                description: 'Complete tasks for villagers to build reputation.',
                difficulty: 'Easy',
                rewards: { reputation: 3, wisdom: 1 },
                duration: 3500,
                status: 'available'
            },
            {
                id: 'elite_challenge',
                name: 'Elite Challenge',
                description: 'Face the toughest opponents for ultimate rewards.',
                difficulty: 'Hard',
                rewards: { strength: 3, speed: 2, wisdom: 2, reputation: 3 },
                duration: 8000,
                status: 'locked'
            }
        ];

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateUI();
        this.renderMissions();
        this.addBattleLogMessage('Welcome to Trait Titans! Connect your wallet to start playing.', 'system');
        
        // Initialize 3D visualization
        try {
            await window.GameVisualization.init();
            this.addBattleLogMessage('3D visualization loaded successfully!', 'system');
        } catch (error) {
            console.error('Failed to initialize 3D visualization:', error);
            this.addBattleLogMessage('3D visualization unavailable. Game will run in 2D mode.', 'system');
        }
    }

    setupEventListeners() {
        // Wallet connection
        document.getElementById('walletBtn').addEventListener('click', () => {
            this.connectWallet();
        });

        document.getElementById('disconnectBtn').addEventListener('click', () => {
            this.disconnectWallet();
        });

        // Battle system
        document.getElementById('findOpponentBtn').addEventListener('click', () => {
            this.findOpponent();
        });

        document.getElementById('attackBtn').addEventListener('click', () => {
            this.performBattleAction('attack');
        });

        document.getElementById('defendBtn').addEventListener('click', () => {
            this.performBattleAction('defend');
        });

        document.getElementById('skillBtn').addEventListener('click', () => {
            this.performBattleAction('skill');
        });

        // Battle log
        document.getElementById('clearLogBtn').addEventListener('click', () => {
            this.clearBattleLog();
        });
    }

    async connectWallet() {
        try {
            // Check if any wallet is available
            const hasPhantom = window.solana && window.solana.isPhantom;
            const hasSolflare = window.solflare;
            
            if (!hasPhantom && !hasSolflare) {
                this.addBattleLogMessage('No wallet detected. Please install Phantom or Solflare wallet extension.', 'system');
                return;
            }
            
            // Initialize wallet manager first
            await window.WalletManager.init();
            
            // Try to connect with available wallet
            const walletType = hasPhantom ? 'phantom' : 'solflare';
            const wallet = await window.WalletManager.connect(walletType);
            
            if (wallet) {
                this.updateWalletUI(wallet.publicKey.toString());
                this.addBattleLogMessage('Wallet connected successfully!', 'system');
                
                // Load player data from Honeycomb
                await this.loadPlayerData();
                this.unlockMissions();
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.addBattleLogMessage(`Failed to connect wallet: ${error.message}`, 'system');
        }
    }

    async disconnectWallet() {
        try {
            await window.WalletManager.disconnect();
            this.updateWalletUI(null);
            this.addBattleLogMessage('Wallet disconnected.', 'system');
        } catch (error) {
            console.error('Wallet disconnection failed:', error);
            this.addBattleLogMessage(`Failed to disconnect wallet: ${error.message}`, 'system');
        }
    }

    updateWalletUI(address) {
        const walletBtn = document.getElementById('walletBtn');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');

        if (address) {
            walletBtn.classList.add('d-none');
            walletInfo.classList.remove('d-none');
            walletAddress.textContent = `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
        } else {
            walletBtn.classList.remove('d-none');
            walletInfo.classList.add('d-none');
        }
    }

    async loadPlayerData() {
        try {
            const playerData = await window.HoneycombProtocol.getPlayerData();
            if (playerData) {
                this.playerStats = { ...this.playerStats, ...playerData.traits };
                this.updateUI();
                this.addBattleLogMessage('Player data loaded from blockchain.', 'system');
            }
        } catch (error) {
            console.error('Failed to load player data:', error);
            this.addBattleLogMessage('Using local player data. Blockchain sync will happen on next mission.', 'system');
        }
    }

    unlockMissions() {
        const totalStats = this.playerStats.strength + this.playerStats.speed + 
                          this.playerStats.wisdom + this.playerStats.reputation;
        
        this.missions.forEach(mission => {
            if (mission.id === 'elite_challenge' && totalStats >= 60) {
                mission.status = 'available';
            }
        });
        
        this.renderMissions();
    }

    updateUI() {
        // Update stat values and progress bars
        const stats = ['strength', 'speed', 'wisdom', 'reputation'];
        stats.forEach(stat => {
            const value = this.playerStats[stat];
            const maxValue = 100; // Max stat value for progress bar calculation
            const percentage = (value / maxValue) * 100;
            
            document.getElementById(`${stat}Value`).textContent = value;
            document.getElementById(`${stat}Bar`).style.width = `${Math.min(percentage, 100)}%`;
        });

        // Update health
        const healthPercentage = (this.playerStats.health / this.playerStats.maxHealth) * 100;
        document.getElementById('healthValue').textContent = this.playerStats.health;
        document.getElementById('healthBar').style.width = `${healthPercentage}%`;
    }

    renderMissions() {
        const missionsList = document.getElementById('missionsList');
        missionsList.innerHTML = '';

        this.missions.forEach(mission => {
            const missionElement = document.createElement('div');
            missionElement.className = `mission-item ${mission.status}`;
            
            const rewardsHtml = Object.entries(mission.rewards)
                .map(([stat, value]) => `<span class="reward-badge">+${value} ${stat}</span>`)
                .join('');

            missionElement.innerHTML = `
                <h6>${mission.name}</h6>
                <p>${mission.description}</p>
                <div class="mission-rewards">${rewardsHtml}</div>
                <small class="text-muted">Difficulty: ${mission.difficulty}</small>
                ${this.getMissionButton(mission)}
            `;

            missionsList.appendChild(missionElement);
        });
    }

    getMissionButton(mission) {
        switch (mission.status) {
            case 'available':
                return `<button class="btn btn-primary btn-sm" onclick="game.startMission('${mission.id}')">
                    <i class="fas fa-play"></i> Start Mission
                </button>`;
            case 'in-progress':
                return `<button class="btn btn-warning btn-sm" disabled>
                    <i class="fas fa-spinner fa-spin"></i> In Progress...
                </button>`;
            case 'completed':
                return `<button class="btn btn-success btn-sm" disabled>
                    <i class="fas fa-check"></i> Completed
                </button>`;
            case 'locked':
                return `<button class="btn btn-secondary btn-sm" disabled>
                    <i class="fas fa-lock"></i> Locked
                </button>`;
            default:
                return '';
        }
    }

    async startMission(missionId) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission || mission.status !== 'available') return;

        mission.status = 'in-progress';
        this.gameState.currentMission = mission;
        this.renderMissions();
        
        this.addBattleLogMessage(`Started mission: ${mission.name}`, 'system');
        this.showLoadingModal(true);

        try {
            // Submit mission to blockchain (only if wallet is connected)
            if (window.WalletManager && window.WalletManager.isWalletConnected()) {
                await window.HoneycombProtocol.startMission(missionId);
            } else {
                // Simulate blockchain call delay for better UX
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.addBattleLogMessage('Playing in offline mode. Connect wallet to save progress.', 'system');
            }
            
            // Simulate mission duration
            setTimeout(() => {
                this.completeMission(mission);
            }, mission.duration);
        } catch (error) {
            console.error('Failed to start mission:', error);
            mission.status = 'available';
            this.renderMissions();
            this.showLoadingModal(false);
            
            // Better error message handling
            const errorMessage = error && error.message ? error.message : 'Unknown error occurred';
            this.addBattleLogMessage(`Mission failed to start: ${errorMessage}`, 'system');
        }
    }

    async completeMission(mission) {
        try {
            // Apply rewards
            Object.entries(mission.rewards).forEach(([stat, value]) => {
                this.playerStats[stat] += value;
            });

            // Save player stats to blockchain first
            await this.savePlayerStatsToBlockchain();

            // Update blockchain (only if wallet is connected)
            if (window.WalletManager && window.WalletManager.isWalletConnected()) {
                await window.HoneycombProtocol.completeMission(mission.id, mission.rewards);
            } else {
                // Simulate blockchain call delay for better UX
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            mission.status = 'completed';
            this.gameState.currentMission = null;
            
            this.updateUI();
            this.renderMissions();
            this.unlockMissions();
            this.showLoadingModal(false);
            
            const rewardsText = Object.entries(mission.rewards)
                .map(([stat, value]) => `+${value} ${stat}`)
                .join(', ');
            
            this.addBattleLogMessage(`Mission completed! Rewards: ${rewardsText}`, 'system');
        } catch (error) {
            console.error('Failed to complete mission:', error);
            mission.status = 'available';
            this.renderMissions();
            this.showLoadingModal(false);
            
            // Better error message handling
            const errorMessage = error && error.message ? error.message : 'Unknown error occurred';
            this.addBattleLogMessage(`Mission completion failed: ${errorMessage}`, 'system');
        }
    }

    findOpponent() {
        if (this.gameState.isInBattle) return;

        const opponent = BattleSystem.generateOpponent(this.playerStats);
        this.gameState.opponent = opponent;
        this.gameState.isInBattle = true;
        
        // Reset health
        this.playerStats.health = this.playerStats.maxHealth;
        opponent.health = opponent.maxHealth;
        
        this.updateBattleUI();
        this.addBattleLogMessage(`Found opponent: ${opponent.name}!`, 'system');
        
        // Determine who goes first based on speed
        const playerSpeed = this.playerStats.speed;
        const opponentSpeed = opponent.speed;
        
        if (playerSpeed >= opponentSpeed) {
            this.gameState.battleTurn = 'player';
            this.addBattleLogMessage('You go first!', 'system');
        } else {
            this.gameState.battleTurn = 'opponent';
            this.addBattleLogMessage('Opponent goes first!', 'system');
            setTimeout(() => this.opponentTurn(), 1000);
        }
    }

    updateBattleUI() {
        const battleInfo = document.querySelector('.battle-info');
        const battleInterface = document.getElementById('battleInterface');
        const opponent = this.gameState.opponent;

        if (this.gameState.isInBattle && opponent) {
            battleInfo.classList.add('d-none');
            battleInterface.classList.remove('d-none');
            
            document.getElementById('opponentName').textContent = opponent.name;
            document.getElementById('opponentStrength').textContent = opponent.strength;
            document.getElementById('opponentSpeed').textContent = opponent.speed;
            document.getElementById('opponentWisdom').textContent = opponent.wisdom;
            document.getElementById('opponentHealth').textContent = opponent.health;
            
            const opponentHealthPercentage = (opponent.health / opponent.maxHealth) * 100;
            document.getElementById('opponentHealthBar').style.width = `${opponentHealthPercentage}%`;
            
            // Update 3D visualization
            this.update3DVisualization();
        } else {
            battleInfo.classList.remove('d-none');
            battleInterface.classList.add('d-none');
        }
        
        this.updateUI();
    }

    performBattleAction(action) {
        if (!this.gameState.isInBattle || this.gameState.battleTurn !== 'player') return;

        const result = BattleSystem.performAction(this.playerStats, this.gameState.opponent, action);
        
        this.addBattleLogMessage(result.message, 'player');
        
        // Animate 3D battle action
        window.GameVisualization.animateBattleAction('player', action);
        
        if (result.damage > 0) {
            this.gameState.opponent.health -= result.damage;
            this.gameState.opponent.health = Math.max(0, this.gameState.opponent.health);
            
            // Add damage particle effect
            window.GameVisualization.createParticleEffect('damage', { x: 3, y: 1, z: 0 });
        }
        
        this.gameState.isDefending = action === 'defend';
        
        this.updateBattleUI();
        
        if (this.gameState.opponent.health <= 0) {
            this.endBattle('victory');
            return;
        }
        
        // Switch to opponent turn
        this.gameState.battleTurn = 'opponent';
        setTimeout(() => this.opponentTurn(), 1500);
    }

    opponentTurn() {
        if (!this.gameState.isInBattle || this.gameState.battleTurn !== 'opponent') return;

        const actions = ['attack', 'skill'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        const result = BattleSystem.performAction(this.gameState.opponent, this.playerStats, randomAction);
        
        this.addBattleLogMessage(result.message, 'opponent');
        
        let damage = result.damage;
        if (this.gameState.isDefending) {
            damage = Math.floor(damage * 0.5);
            this.addBattleLogMessage('Damage reduced by defending!', 'system');
        }
        
        if (damage > 0) {
            this.playerStats.health -= damage;
            this.playerStats.health = Math.max(0, this.playerStats.health);
        }
        
        this.gameState.isDefending = false;
        
        this.updateBattleUI();
        
        if (this.playerStats.health <= 0) {
            this.endBattle('defeat');
            return;
        }
        
        // Switch back to player turn
        this.gameState.battleTurn = 'player';
    }

    async endBattle(result) {
        this.gameState.isInBattle = false;
        this.gameState.opponent = null;
        this.gameState.battleTurn = 'player';
        
        if (result === 'victory') {
            this.addBattleLogMessage('Victory! You defeated your opponent!', 'system');
            
            // Award experience and reputation
            const rewards = { reputation: 2, wisdom: 1 };
            Object.entries(rewards).forEach(([stat, value]) => {
                this.playerStats[stat] += value;
            });
            
            try {
                if (window.WalletManager && window.WalletManager.isWalletConnected()) {
                    await window.HoneycombProtocol.recordBattleResult('victory', rewards);
                }
            } catch (error) {
                console.error('Failed to record battle result:', error);
            }
        } else {
            this.addBattleLogMessage('Defeat! Better luck next time!', 'system');
            
            try {
                if (window.WalletManager && window.WalletManager.isWalletConnected()) {
                    await window.HoneycombProtocol.recordBattleResult('defeat', {});
                }
            } catch (error) {
                console.error('Failed to record battle result:', error);
            }
        }
        
        // Save updated player stats to blockchain
        await this.savePlayerStatsToBlockchain();
        
        // Reset health
        this.playerStats.health = this.playerStats.maxHealth;
        
        this.updateBattleUI();
        this.unlockMissions();
    }

    addBattleLogMessage(message, type = 'system') {
        const battleLog = document.getElementById('battleLog');
        const messageElement = document.createElement('p');
        messageElement.className = `${type}-action`;
        messageElement.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        
        battleLog.appendChild(messageElement);
        battleLog.scrollTop = battleLog.scrollHeight;
    }

    clearBattleLog() {
        const battleLog = document.getElementById('battleLog');
        battleLog.innerHTML = '<p class="text-muted">Battle log cleared.</p>';
    }

    showLoadingModal(show) {
        const modal = document.getElementById('loadingModal');
        if (show) {
            modal.classList.add('show');
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        } else {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }

    /**
     * Update 3D visualization with current game state
     */
    update3DVisualization() {
        try {
            if (window.GameVisualization.isInitialized) {
                window.GameVisualization.updateAvatars(this.playerStats, this.gameState.opponent);
                
                // Attach to battle visualization container if not already attached
                if (!document.querySelector('#battleVisualization canvas')) {
                    window.GameVisualization.attachToElement('battleVisualization');
                }
            }
        } catch (error) {
            console.error('Failed to update 3D visualization:', error);
        }
    }

    /**
     * Save player stats to blockchain
     */
    async savePlayerStatsToBlockchain() {
        try {
            if (window.WalletManager && window.WalletManager.isWalletConnected()) {
                await window.HoneycombProtocol.updatePlayerStats(this.playerStats);
                console.log('Player stats saved to blockchain');
            } else {
                console.log('Wallet not connected, stats saved locally only');
            }
        } catch (error) {
            console.error('Failed to save player stats to blockchain:', error);
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new TraitTitansGame();
});
