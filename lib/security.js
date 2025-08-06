/**
 * Security Protocol System for Trait Titans
 * Implements comprehensive security measures for blockchain gaming
 */

class SecurityProtocol {
    constructor() {
        this.isInitialized = false;
        this.securityConfig = {
            maxTransactionAmount: 1000000, // 1 SOL in lamports
            rateLimitWindow: 60000, // 1 minute
            maxActionsPerWindow: 10,
            allowedDomains: ['localhost', '127.0.0.1', '.replit.app', '.replit.dev'],
            sessionTimeout: 1800000, // 30 minutes
            maxRetries: 3
        };
        this.actionHistory = new Map();
        this.failedAttempts = new Map();
        this.sessionData = new Map();
    }

    async init() {
        try {
            console.log('Initializing Security Protocol...');
            
            // Set up Content Security Policy
            this.setupCSP();
            
            // Initialize session management
            this.initializeSession();
            
            // Set up input validation
            this.setupInputValidation();
            
            // Initialize rate limiting
            this.initializeRateLimit();
            
            this.isInitialized = true;
            console.log('Security Protocol initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Security Protocol:', error);
            throw error;
        }
    }

    /**
     * Content Security Policy setup
     */
    setupCSP() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = `
            default-src 'self';
            script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com;
            style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
            img-src 'self' data: https:;
            connect-src 'self' https://api.devnet.solana.com https://api.mainnet-beta.solana.com;
            frame-ancestors 'none';
            base-uri 'self';
            form-action 'self';
        `.replace(/\s+/g, ' ').trim();
        
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            document.head.appendChild(meta);
        }
    }

    /**
     * Validate wallet address format
     */
    validateWalletAddress(address) {
        if (!address || typeof address !== 'string') {
            return { valid: false, error: 'Invalid wallet address format' };
        }

        // Solana wallet address validation (Base58, 32-44 characters)
        const base58Regex = /^[A-HJ-NP-Z1-9]{32,44}$/;
        if (!base58Regex.test(address)) {
            return { valid: false, error: 'Invalid Solana wallet address format' };
        }

        return { valid: true };
    }

    /**
     * Validate transaction parameters
     */
    validateTransaction(params) {
        const errors = [];

        if (!params.to || !this.validateWalletAddress(params.to).valid) {
            errors.push('Invalid recipient address');
        }

        if (!params.amount || params.amount <= 0 || params.amount > this.securityConfig.maxTransactionAmount) {
            errors.push(`Invalid amount. Must be between 0 and ${this.securityConfig.maxTransactionAmount}`);
        }

        if (params.memo && params.memo.length > 255) {
            errors.push('Memo too long (max 255 characters)');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Rate limiting implementation
     */
    checkRateLimit(walletAddress, action) {
        const now = Date.now();
        const key = `${walletAddress}_${action}`;
        
        if (!this.actionHistory.has(key)) {
            this.actionHistory.set(key, []);
        }

        const actions = this.actionHistory.get(key);
        
        // Remove old actions outside the window
        const filtered = actions.filter(timestamp => 
            now - timestamp < this.securityConfig.rateLimitWindow
        );
        
        if (filtered.length >= this.securityConfig.maxActionsPerWindow) {
            return {
                allowed: false,
                error: `Rate limit exceeded. Max ${this.securityConfig.maxActionsPerWindow} actions per minute.`,
                retryAfter: this.securityConfig.rateLimitWindow - (now - filtered[0])
            };
        }

        filtered.push(now);
        this.actionHistory.set(key, filtered);
        
        return { allowed: true };
    }

    /**
     * Input sanitization
     */
    sanitizeInput(input, type = 'text') {
        if (typeof input !== 'string') {
            return String(input);
        }

        switch (type) {
            case 'wallet':
                return input.replace(/[^A-HJ-NP-Z1-9]/g, '').slice(0, 44);
            case 'number':
                return input.replace(/[^0-9.]/g, '');
            case 'text':
                return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
                           .replace(/[<>]/g, '')
                           .slice(0, 1000);
            default:
                return input.slice(0, 1000);
        }
    }

    /**
     * Session management
     */
    initializeSession() {
        const sessionId = this.generateSessionId();
        this.sessionData.set('sessionId', sessionId);
        this.sessionData.set('startTime', Date.now());
        this.sessionData.set('lastActivity', Date.now());
        
        // Set up session timeout
        setInterval(() => {
            this.checkSessionTimeout();
        }, 60000); // Check every minute
    }

    generateSessionId() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    checkSessionTimeout() {
        const lastActivity = this.sessionData.get('lastActivity');
        const now = Date.now();
        
        if (now - lastActivity > this.securityConfig.sessionTimeout) {
            this.expireSession();
        }
    }

    expireSession() {
        console.log('Session expired, logging out...');
        this.sessionData.clear();
        
        // Trigger wallet disconnect if connected
        if (window.WalletManager && window.WalletManager.isWalletConnected()) {
            window.WalletManager.disconnect();
        }
        
        // Clear sensitive data
        localStorage.removeItem('playerStats');
        sessionStorage.clear();
    }

    updateActivity() {
        this.sessionData.set('lastActivity', Date.now());
    }

    /**
     * Transaction security validation
     */
    async validateSecureTransaction(transaction) {
        try {
            // Check if user is authenticated
            if (!window.WalletManager || !window.WalletManager.isWalletConnected()) {
                throw new Error('Wallet not connected');
            }

            const walletAddress = window.WalletManager.getWallet().publicKey.toString();
            
            // Validate transaction parameters
            const validation = this.validateTransaction(transaction);
            if (!validation.valid) {
                throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`);
            }

            // Check rate limits
            const rateCheck = this.checkRateLimit(walletAddress, transaction.type || 'transaction');
            if (!rateCheck.allowed) {
                throw new Error(rateCheck.error);
            }

            // Update activity
            this.updateActivity();

            return { success: true, walletAddress };
            
        } catch (error) {
            this.recordFailedAttempt(transaction);
            throw error;
        }
    }

    /**
     * Record failed attempts for monitoring
     */
    recordFailedAttempt(transaction) {
        const key = transaction.to || 'unknown';
        if (!this.failedAttempts.has(key)) {
            this.failedAttempts.set(key, []);
        }
        
        const attempts = this.failedAttempts.get(key);
        attempts.push({
            timestamp: Date.now(),
            type: transaction.type || 'unknown',
            reason: 'validation_failed'
        });
        
        // Keep only recent attempts
        const recent = attempts.filter(attempt => 
            Date.now() - attempt.timestamp < 3600000 // 1 hour
        );
        
        this.failedAttempts.set(key, recent);
        
        // Alert if too many failed attempts
        if (recent.length > this.securityConfig.maxRetries) {
            console.warn(`Multiple failed attempts detected for ${key}`);
        }
    }

    /**
     * Input validation setup
     */
    setupInputValidation() {
        // Add input validation to forms
        document.addEventListener('input', (event) => {
            const input = event.target;
            
            if (input.id === 'opponentWallet') {
                input.value = this.sanitizeInput(input.value, 'wallet');
                const validation = this.validateWalletAddress(input.value);
                
                if (input.value && !validation.valid) {
                    input.setCustomValidity(validation.error);
                } else {
                    input.setCustomValidity('');
                }
            }
        });
    }

    /**
     * Secure local storage operations
     */
    secureLocalStorage = {
        set: (key, value) => {
            try {
                const encrypted = btoa(JSON.stringify(value));
                localStorage.setItem(key, encrypted);
            } catch (error) {
                console.error('Failed to store data securely:', error);
            }
        },
        
        get: (key) => {
            try {
                const encrypted = localStorage.getItem(key);
                if (!encrypted) return null;
                return JSON.parse(atob(encrypted));
            } catch (error) {
                console.error('Failed to retrieve data securely:', error);
                return null;
            }
        },
        
        remove: (key) => {
            localStorage.removeItem(key);
        }
    };

    /**
     * Security audit function
     */
    auditSecurity() {
        const audit = {
            timestamp: new Date().toISOString(),
            sessionActive: this.sessionData.has('sessionId'),
            walletConnected: window.WalletManager ? window.WalletManager.isWalletConnected() : false,
            rateLimitActive: this.actionHistory.size > 0,
            failedAttempts: Array.from(this.failedAttempts.entries()).map(([key, attempts]) => ({
                target: key,
                count: attempts.length
            })),
            cspActive: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')
        };
        
        console.log('Security Audit:', audit);
        return audit;
    }
}

// Initialize global security protocol
window.SecurityProtocol = new SecurityProtocol();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityProtocol;
}