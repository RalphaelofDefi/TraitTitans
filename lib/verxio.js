/**
 * Verxio Integration for Daily Missions and Streaks
 * Manages daily challenges and streak tracking
 */

class VerxioSystem {
    constructor() {
        this.dailyMissions = [];
        this.streakData = {};
        this.isInitialized = false;
        this.apiEndpoint = 'https://api.verxio.xyz'; // Mock endpoint
        this.lastMissionUpdate = null;
    }

    /**
     * Initialize Verxio system
     */
    async init() {
        try {
            await this.loadStreakData();
            await this.updateDailyMissions();
            this.isInitialized = true;
            console.log('Verxio System initialized');
        } catch (error) {
            console.error('Failed to initialize Verxio:', error);
            // Initialize with mock data
            this.initializeMockData();
            this.isInitialized = true;
        }
    }

    /**
     * Load streak data from localStorage or API
     */
    async loadStreakData() {
        try {
            // Try to load from Verxio API first
            const streakData = await this.fetchStreakFromAPI();
            if (streakData) {
                this.streakData = streakData;
                return;
            }
        } catch (error) {
            console.log('Failed to load from Verxio API, using localStorage');
        }

        // Fallback to localStorage
        const storedData = localStorage.getItem('verxio_streak_data');
        if (storedData) {
            this.streakData = JSON.parse(storedData);
        } else {
            this.streakData = this.createNewStreakData();
        }
    }

    /**
     * Create new streak data structure
     */
    createNewStreakData() {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastMissionDate: null,
            totalMissionsCompleted: 0,
            streakMultiplier: 1.0,
            userId: this.getCurrentUserId()
        };
    }

    /**
     * Get current user ID (wallet address or fallback)
     */
    getCurrentUserId() {
        if (window.WalletManager && window.WalletManager.isWalletConnected()) {
            const wallet = window.WalletManager.getWallet();
            return wallet ? wallet.publicKey.toString() : 'anonymous';
        }
        return 'anonymous';
    }

    /**
     * Update daily missions
     */
    async updateDailyMissions() {
        try {
            // Check if missions need updating (once per day)
            const today = new Date().toDateString();
            if (this.lastMissionUpdate === today) {
                return; // Already updated today
            }

            // Try to fetch from Verxio API
            const missions = await this.fetchMissionsFromAPI();
            if (missions && missions.length > 0) {
                this.dailyMissions = missions;
            } else {
                // Use mock missions
                this.dailyMissions = this.generateMockMissions();
            }

            this.lastMissionUpdate = today;
            console.log(`Updated daily missions: ${this.dailyMissions.length} missions available`);

        } catch (error) {
            console.error('Failed to update daily missions:', error);
            this.dailyMissions = this.generateMockMissions();
        }
    }

    /**
     * Fetch missions from Verxio API
     */
    async fetchMissionsFromAPI() {
        try {
            // Mock API call - replace with actual Verxio API
            const response = await fetch(`${this.apiEndpoint}/daily-missions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAPIKey()}`
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.missions;

        } catch (error) {
            console.log('Verxio API not available, using mock data');
            return null;
        }
    }

    /**
     * Fetch streak data from Verxio API
     */
    async fetchStreakFromAPI() {
        try {
            const userId = this.getCurrentUserId();
            const response = await fetch(`${this.apiEndpoint}/streak/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAPIKey()}`
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.log('Failed to fetch streak from API');
            return null;
        }
    }

    /**
     * Generate mock daily missions
     */
    generateMockMissions() {
        const missionTemplates = [
            {
                id: 'strength_training',
                title: 'Strength Training',
                description: 'Complete 3 battles to increase your physical power',
                type: 'battle',
                target: 3,
                progress: 0,
                rewards: { strength: 2, experience: 15 },
                difficulty: 'easy'
            },
            {
                id: 'wisdom_quest',
                title: 'Ancient Knowledge',
                description: 'Visit the library mission to gain wisdom',
                type: 'mission',
                target: 1,
                progress: 0,
                rewards: { wisdom: 3, experience: 20 },
                difficulty: 'medium'
            },
            {
                id: 'speed_challenge',
                title: 'Swift Victory',
                description: 'Win a battle in under 5 rounds',
                type: 'speed_battle',
                target: 1,
                progress: 0,
                rewards: { speed: 2, reputation: 1, experience: 25 },
                difficulty: 'hard'
            }
        ];

        // Randomly select 1-3 missions for today
        const numMissions = Math.floor(Math.random() * 3) + 1;
        const selectedMissions = missionTemplates
            .sort(() => Math.random() - 0.5)
            .slice(0, numMissions)
            .map((mission, index) => ({
                ...mission,
                id: `daily_${new Date().toDateString()}_${index}`,
                expiresAt: this.getEndOfDay(),
                isCompleted: false
            }));

        return selectedMissions;
    }

    /**
     * Complete a daily mission
     */
    async completeMission(missionId, progressData = {}) {
        try {
            const mission = this.dailyMissions.find(m => m.id === missionId);
            if (!mission) {
                throw new Error('Mission not found');
            }

            if (mission.isCompleted) {
                throw new Error('Mission already completed');
            }

            // Update progress
            mission.progress = Math.min(mission.target, mission.progress + (progressData.increment || 1));

            if (mission.progress >= mission.target) {
                mission.isCompleted = true;
                await this.processMissionCompletion(mission);
            }

            return {
                success: true,
                mission: mission,
                isCompleted: mission.isCompleted
            };

        } catch (error) {
            console.error('Failed to complete mission:', error);
            throw error;
        }
    }

    /**
     * Process mission completion and update streaks
     */
    async processMissionCompletion(mission) {
        try {
            // Update streak data
            const today = new Date().toDateString();
            const lastMissionDate = this.streakData.lastMissionDate;

            if (lastMissionDate === today) {
                // Already completed a mission today, no streak update
                console.log('Mission completed, but streak already updated today');
            } else {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toDateString();

                if (lastMissionDate === yesterdayString) {
                    // Consecutive day, increase streak
                    this.streakData.currentStreak += 1;
                } else if (lastMissionDate === null || new Date(lastMissionDate) < yesterday) {
                    // Streak broken or first mission, reset to 1
                    this.streakData.currentStreak = 1;
                }

                this.streakData.lastMissionDate = today;
                this.streakData.totalMissionsCompleted += 1;
                this.streakData.longestStreak = Math.max(this.streakData.longestStreak, this.streakData.currentStreak);
                this.streakData.streakMultiplier = this.calculateStreakMultiplier(this.streakData.currentStreak);
            }

            // Apply streak bonus to rewards
            const bonusRewards = this.applyStreakBonus(mission.rewards);

            // Store streak data
            await this.saveStreakData();

            // Apply rewards to player
            if (window.game) {
                window.game.applyMissionRewards(bonusRewards);
            }

            console.log(`Mission completed with ${this.streakData.currentStreak} day streak!`);

            return bonusRewards;

        } catch (error) {
            console.error('Failed to process mission completion:', error);
            throw error;
        }
    }

    /**
     * Calculate streak multiplier
     */
    calculateStreakMultiplier(streak) {
        if (streak >= 7) return 2.0;  // 100% bonus after 7 days
        if (streak >= 5) return 1.5;  // 50% bonus after 5 days
        if (streak >= 3) return 1.3;  // 30% bonus after 3 days
        return 1.0;  // No bonus
    }

    /**
     * Apply streak bonus to rewards
     */
    applyStreakBonus(baseRewards) {
        const bonusRewards = { ...baseRewards };
        const multiplier = this.streakData.streakMultiplier;

        Object.keys(bonusRewards).forEach(key => {
            bonusRewards[key] = Math.floor(bonusRewards[key] * multiplier);
        });

        return bonusRewards;
    }

    /**
     * Save streak data to localStorage and API
     */
    async saveStreakData() {
        try {
            // Save to localStorage
            localStorage.setItem('verxio_streak_data', JSON.stringify(this.streakData));

            // Try to save to Verxio API
            await this.saveStreakToAPI();

        } catch (error) {
            console.error('Failed to save streak data:', error);
        }
    }

    /**
     * Save streak data to Verxio API
     */
    async saveStreakToAPI() {
        try {
            const response = await fetch(`${this.apiEndpoint}/streak`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAPIKey()}`
                },
                body: JSON.stringify(this.streakData)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            console.log('Streak data saved to Verxio API');

        } catch (error) {
            console.log('Failed to save to Verxio API, using localStorage only');
        }
    }

    /**
     * Get current daily missions
     */
    getDailyMissions() {
        return this.dailyMissions.filter(mission => !this.isMissionExpired(mission));
    }

    /**
     * Get streak information
     */
    getStreakInfo() {
        return {
            ...this.streakData,
            nextMilestone: this.getNextStreakMilestone(),
            daysUntilMilestone: this.getDaysUntilMilestone()
        };
    }

    /**
     * Get next streak milestone
     */
    getNextStreakMilestone() {
        const current = this.streakData.currentStreak;
        if (current < 3) return 3;
        if (current < 5) return 5;
        if (current < 7) return 7;
        return Math.ceil(current / 7) * 7 + 7;
    }

    /**
     * Get days until next milestone
     */
    getDaysUntilMilestone() {
        return this.getNextStreakMilestone() - this.streakData.currentStreak;
    }

    /**
     * Check if mission is expired
     */
    isMissionExpired(mission) {
        return new Date() > new Date(mission.expiresAt);
    }

    /**
     * Get end of current day
     */
    getEndOfDay() {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end.toISOString();
    }

    /**
     * Get API key (mock implementation)
     */
    getAPIKey() {
        // In a real implementation, this would be stored securely
        return process.env.VERXIO_API_KEY || 'mock_api_key';
    }

    /**
     * Initialize with mock data for testing
     */
    initializeMockData() {
        this.streakData = this.createNewStreakData();
        this.dailyMissions = this.generateMockMissions();
        this.lastMissionUpdate = new Date().toDateString();
    }

    /**
     * Reset daily progress (for testing)
     */
    resetDailyProgress() {
        this.dailyMissions.forEach(mission => {
            mission.progress = 0;
            mission.isCompleted = false;
        });
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
        this.dailyMissions = [];
        this.streakData = {};
        this.isInitialized = false;
    }
}

// Create global instance
window.VerxioSystem = new VerxioSystem();