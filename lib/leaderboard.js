/**
 * Global Leaderboard System for Trait Titans
 * Manages player rankings and statistics
 */

class LeaderboardSystem {
    constructor() {
        this.players = [];
        this.isInitialized = false;
        this.updateInterval = null;
        this.lastUpdate = null;
    }

    /**
     * Initialize leaderboard system
     */
    async init() {
        try {
            await this.updateLeaderboard();
            this.startAutoUpdate();
            this.isInitialized = true;
            console.log('Leaderboard System initialized');
        } catch (error) {
            console.error('Failed to initialize leaderboard:', error);
        }
    }

    /**
     * Fetch and update leaderboard data
     */
    async updateLeaderboard() {
        try {
            console.log('Updating leaderboard...');
            
            // Try to fetch from Honeycomb Protocol
            let players = await this.fetchFromHoneycomb();
            
            // If no data from Honeycomb, use mock data
            if (!players || players.length === 0) {
                players = this.generateMockLeaderboard();
            }

            // Sort by total XP (sum of all traits + experience)
            players.sort((a, b) => b.totalXP - a.totalXP);
            
            // Keep only top 10
            this.players = players.slice(0, 10);
            this.lastUpdate = new Date();
            
            console.log(`Leaderboard updated with ${this.players.length} players`);
            
            // Trigger UI update if callback exists
            if (window.game && window.game.updateLeaderboardUI) {
                window.game.updateLeaderboardUI(this.players);
            }

        } catch (error) {
            console.error('Failed to update leaderboard:', error);
            // Use mock data as fallback
            this.players = this.generateMockLeaderboard();
        }
    }

    /**
     * Fetch leaderboard data from Honeycomb Protocol
     */
    async fetchFromHoneycomb() {
        try {
            if (!window.HoneycombProtocol || !window.HoneycombProtocol.isInitialized) {
                return null;
            }

            const leaderboardData = await window.HoneycombProtocol.getLeaderboard();
            
            if (!leaderboardData || leaderboardData.length === 0) {
                return null;
            }

            return leaderboardData.map((player, index) => ({
                rank: index + 1,
                wallet: player.publicKey || player.wallet || `Player${index + 1}`,
                name: player.name || `Player ${(player.wallet || player.publicKey || '').slice(0, 8)}...`,
                strength: player.strength || 0,
                speed: player.speed || 0,
                wisdom: player.wisdom || 0,
                reputation: player.reputation || 0,
                experience: player.experience || 0,
                totalXP: (player.strength || 0) + (player.speed || 0) + (player.wisdom || 0) + (player.experience || 0),
                battlesWon: player.battlesWon || 0,
                lastActive: player.lastActive || new Date().toISOString()
            }));

        } catch (error) {
            console.error('Failed to fetch from Honeycomb:', error);
            return null;
        }
    }

    /**
     * Generate mock leaderboard data for testing
     */
    generateMockLeaderboard() {
        const mockPlayers = [
            { name: "DragonSlayer", strength: 45, speed: 38, wisdom: 42, reputation: 35, experience: 89 },
            { name: "ShadowMage", strength: 32, speed: 47, wisdom: 50, reputation: 41, experience: 76 },
            { name: "IronFist", strength: 50, speed: 35, wisdom: 28, reputation: 38, experience: 82 },
            { name: "SwiftBlade", strength: 38, speed: 52, wisdom: 35, reputation: 42, experience: 71 },
            { name: "WiseOwl", strength: 28, speed: 33, wisdom: 55, reputation: 47, experience: 85 },
            { name: "StormRider", strength: 42, speed: 45, wisdom: 38, reputation: 40, experience: 68 },
            { name: "FrostGuard", strength: 46, speed: 29, wisdom: 43, reputation: 36, experience: 74 },
            { name: "FireMancer", strength: 35, speed: 41, wisdom: 48, reputation: 39, experience: 79 },
            { name: "EarthShaker", strength: 49, speed: 31, wisdom: 34, reputation: 43, experience: 67 },
            { name: "VoidWalker", strength: 33, speed: 44, wisdom: 46, reputation: 45, experience: 73 }
        ];

        return mockPlayers.map((player, index) => {
            const wallet = this.generateMockWallet();
            const totalXP = player.strength + player.speed + player.wisdom + player.experience;
            
            return {
                rank: index + 1,
                wallet: wallet,
                name: player.name,
                strength: player.strength,
                speed: player.speed,
                wisdom: player.wisdom,
                reputation: player.reputation,
                experience: player.experience,
                totalXP: totalXP,
                battlesWon: Math.floor(Math.random() * 20) + 5,
                lastActive: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
            };
        });
    }

    /**
     * Generate mock Solana wallet address
     */
    generateMockWallet() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let wallet = '';
        for (let i = 0; i < 44; i++) {
            wallet += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return wallet;
    }

    /**
     * Start automatic leaderboard updates
     */
    startAutoUpdate() {
        // Update every 60 seconds
        this.updateInterval = setInterval(() => {
            this.updateLeaderboard();
        }, 60000);
    }

    /**
     * Stop automatic updates
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Get current leaderboard
     */
    getLeaderboard() {
        return this.players;
    }

    /**
     * Get player rank by wallet address
     */
    getPlayerRank(walletAddress) {
        const player = this.players.find(p => p.wallet === walletAddress);
        return player ? player.rank : null;
    }

    /**
     * Add or update player in leaderboard
     */
    async updatePlayer(walletAddress, stats) {
        try {
            // Try to update on Honeycomb first
            if (window.HoneycombProtocol && window.HoneycombProtocol.isInitialized) {
                await window.HoneycombProtocol.updatePlayerStats(stats);
            }

            // Update local leaderboard
            const existingPlayerIndex = this.players.findIndex(p => p.wallet === walletAddress);
            const totalXP = (stats.strength || 0) + (stats.speed || 0) + (stats.wisdom || 0) + (stats.experience || 0);
            
            const playerData = {
                wallet: walletAddress,
                name: stats.name || `Player ${walletAddress.slice(0, 8)}...`,
                strength: stats.strength || 0,
                speed: stats.speed || 0,
                wisdom: stats.wisdom || 0,
                reputation: stats.reputation || 0,
                experience: stats.experience || 0,
                totalXP: totalXP,
                battlesWon: stats.battlesWon || 0,
                lastActive: new Date().toISOString()
            };

            if (existingPlayerIndex >= 0) {
                this.players[existingPlayerIndex] = { ...this.players[existingPlayerIndex], ...playerData };
            } else {
                this.players.push(playerData);
            }

            // Re-sort and update ranks
            this.players.sort((a, b) => b.totalXP - a.totalXP);
            this.players = this.players.slice(0, 10);
            this.players.forEach((player, index) => {
                player.rank = index + 1;
            });

            // Trigger UI update
            if (window.game && window.game.updateLeaderboardUI) {
                window.game.updateLeaderboardUI(this.players);
            }

        } catch (error) {
            console.error('Failed to update player in leaderboard:', error);
        }
    }

    /**
     * Get formatted leaderboard for display
     */
    getFormattedLeaderboard() {
        return this.players.map(player => ({
            ...player,
            shortWallet: `${player.wallet.slice(0, 4)}...${player.wallet.slice(-4)}`,
            lastActiveFormatted: this.formatTimeAgo(player.lastActive)
        }));
    }

    /**
     * Format time ago string
     */
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
        this.stopAutoUpdate();
        this.players = [];
        this.isInitialized = false;
    }
}

// Create global instance
window.LeaderboardSystem = new LeaderboardSystem();