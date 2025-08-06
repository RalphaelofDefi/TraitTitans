/**
 * Security Configuration for Trait Titans
 * Production-ready security settings for blockchain gaming
 */

const SECURITY_CONFIG = {
    // Network Security
    allowedNetworks: ['devnet', 'mainnet-beta'],
    allowedRPCEndpoints: [
        'https://api.devnet.solana.com',
        'https://api.mainnet-beta.solana.com'
    ],
    
    // Transaction Limits
    maxTransactionAmount: 1000000, // 1 SOL in lamports
    minTransactionAmount: 1000,    // 0.001 SOL in lamports
    maxDailyTransactions: 100,
    maxHourlyTransactions: 20,
    
    // Rate Limiting
    rateLimits: {
        walletConnection: { max: 5, window: 60000 },   // 5 per minute
        pvpChallenge: { max: 10, window: 300000 },     // 10 per 5 minutes
        missionComplete: { max: 20, window: 300000 },  // 20 per 5 minutes
        dataSync: { max: 30, window: 60000 },          // 30 per minute
        leaderboardUpdate: { max: 60, window: 60000 }  // 60 per minute
    },
    
    // Session Management
    sessionTimeout: 1800000,      // 30 minutes
    maxSessionDuration: 14400000, // 4 hours
    sessionRefreshInterval: 300000, // 5 minutes
    
    // Input Validation
    maxInputLength: {
        walletAddress: 44,
        memo: 255,
        playerName: 32,
        missionNote: 500
    },
    
    // Wallet Security
    supportedWallets: ['phantom', 'solflare', 'sollet'],
    requiredWalletVersion: '1.0.0',
    
    // Content Security Policy
    csp: {
        defaultSrc: "'self'",
        scriptSrc: "'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
        styleSrc: "'self' 'unsafe-inline' https://cdn.jsdelivr.net",
        imgSrc: "'self' data: https:",
        connectSrc: "'self' https://api.devnet.solana.com https://api.mainnet-beta.solana.com",
        frameAncestors: "'none'",
        baseUri: "'self'",
        formAction: "'self'"
    },
    
    // Error Handling
    maxRetries: 3,
    retryDelay: 1000,
    errorCooldown: 30000,
    
    // Logging
    logLevel: 'INFO',
    logRetention: 86400000, // 24 hours
    
    // Feature Flags
    features: {
        pvpBattles: true,
        leaderboard: true,
        dailyMissions: true,
        blockchainSync: true,
        offlineMode: true
    }
};

// Security validation patterns
const VALIDATION_PATTERNS = {
    solanaAddress: /^[A-HJ-NP-Z1-9]{32,44}$/,
    base58: /^[A-HJ-NP-Z1-9]+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    safeText: /^[a-zA-Z0-9\s\-_.,!?]+$/
};

// Export configuration
if (typeof window !== 'undefined') {
    window.SECURITY_CONFIG = SECURITY_CONFIG;
    window.VALIDATION_PATTERNS = VALIDATION_PATTERNS;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SECURITY_CONFIG, VALIDATION_PATTERNS };
}