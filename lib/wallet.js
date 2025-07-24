/**
 * Solana Wallet Manager
 * Handles wallet connection using Solana Wallet Adapter
 */

class WalletManager {
    constructor() {
        this.wallet = null;
        this.connection = null;
        this.isConnected = false;
        this.supportedWallets = [];
        this.selectedWallet = null;
        this.isInitialized = false;
    }

    /**
     * Initialize wallet manager and supported wallets
     */
    async init() {
        try {
            // Initialize Solana connection to devnet
            this.connection = new solanaWeb3.Connection(
                'https://api.devnet.solana.com',
                'confirmed'
            );

            // Initialize supported wallets
            this.initializeSupportedWallets();
            
            this.isInitialized = true;
            console.log('Wallet manager initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize wallet manager:', error);
            return false;
        }
    }

    /**
     * Initialize list of supported wallets
     */
    initializeSupportedWallets() {
        this.supportedWallets = [
            {
                name: 'Phantom',
                icon: 'https://phantom.app/img/meta/phantom-icon.png',
                adapter: 'phantom'
            },
            {
                name: 'Solflare',
                icon: 'https://solflare.com/img/favicon.png',
                adapter: 'solflare'
            },
            {
                name: 'Sollet',
                icon: 'https://sollet.io/favicon.ico',
                adapter: 'sollet'
            }
        ];
    }

    /**
     * Connect to a wallet
     */
    async connect(walletName = 'phantom') {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            // Check if wallet is available
            const walletProvider = this.getWalletProvider(walletName);
            if (!walletProvider) {
                throw new Error(`${walletName} wallet not found. Please install it first.`);
            }

            // Connect to wallet
            await walletProvider.connect();
            
            this.wallet = walletProvider;
            this.isConnected = true;
            this.selectedWallet = walletName;

            console.log('Wallet connected:', walletProvider.publicKey.toString());
            
            // Listen for wallet events
            this.setupWalletListeners();
            
            return {
                publicKey: walletProvider.publicKey,
                connected: true,
                wallet: walletName
            };
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            this.isConnected = false;
            this.wallet = null;
            throw error;
        }
    }

    /**
     * Disconnect from wallet
     */
    async disconnect() {
        try {
            if (this.wallet && this.isConnected) {
                await this.wallet.disconnect();
            }
            
            this.wallet = null;
            this.isConnected = false;
            this.selectedWallet = null;
            
            console.log('Wallet disconnected');
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
            throw error;
        }
    }

    /**
     * Get wallet provider by name
     */
    getWalletProvider(walletName) {
        switch (walletName.toLowerCase()) {
            case 'phantom':
                if (window.solana && window.solana.isPhantom) {
                    return window.solana;
                }
                return null;
            case 'solflare':
                if (window.solflare) {
                    return window.solflare;
                }
                return null;
            case 'sollet':
                if (window.sollet) {
                    return window.sollet;
                }
                return null;
            default:
                // Try to auto-detect available wallet
                if (window.solana && window.solana.isPhantom) {
                    return window.solana;
                }
                if (window.solflare) {
                    return window.solflare;
                }
                return null;
        }
    }

    /**
     * Setup wallet event listeners
     */
    setupWalletListeners() {
        if (!this.wallet) return;

        // Listen for account changes
        this.wallet.on('accountChanged', (publicKey) => {
            console.log('Account changed:', publicKey?.toString());
            if (publicKey) {
                // Handle account change
                this.handleAccountChange(publicKey);
            } else {
                // Handle disconnect
                this.handleDisconnect();
            }
        });

        // Listen for disconnection
        this.wallet.on('disconnect', () => {
            console.log('Wallet disconnected');
            this.handleDisconnect();
        });
    }

    /**
     * Handle account change
     */
    handleAccountChange(publicKey) {
        console.log('Wallet account changed to:', publicKey.toString());
        // Refresh game data for new account
        if (window.game) {
            window.game.loadPlayerData();
        }
    }

    /**
     * Handle wallet disconnect
     */
    handleDisconnect() {
        this.wallet = null;
        this.isConnected = false;
        this.selectedWallet = null;
        
        // Update UI
        if (window.game) {
            window.game.updateWalletUI(null);
        }
    }

    /**
     * Get current wallet
     */
    getWallet() {
        return this.wallet;
    }

    /**
     * Get current wallet public key
     */
    getPublicKey() {
        return this.wallet ? this.wallet.publicKey : null;
    }

    /**
     * Get Solana connection
     */
    getConnection() {
        return this.connection;
    }

    /**
     * Check if wallet is connected
     */
    isWalletConnected() {
        return this.isConnected && this.wallet;
    }

    /**
     * Get wallet balance
     */
    async getBalance() {
        try {
            if (!this.isConnected || !this.wallet) {
                throw new Error('Wallet not connected');
            }

            const balance = await this.connection.getBalance(this.wallet.publicKey);
            return balance / solanaWeb3.LAMPORTS_PER_SOL; // Convert to SOL
        } catch (error) {
            console.error('Failed to get wallet balance:', error);
            return 0;
        }
    }

    /**
     * Send transaction
     */
    async sendTransaction(transaction) {
        try {
            if (!this.isConnected || !this.wallet) {
                throw new Error('Wallet not connected');
            }

            // Sign transaction
            const signedTransaction = await this.wallet.signTransaction(transaction);
            
            // Send transaction
            const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
            
            // Confirm transaction
            await this.connection.confirmTransaction(signature, 'confirmed');
            
            console.log('Transaction sent:', signature);
            return signature;
        } catch (error) {
            console.error('Failed to send transaction:', error);
            throw error;
        }
    }

    /**
     * Sign message
     */
    async signMessage(message) {
        try {
            if (!this.isConnected || !this.wallet) {
                throw new Error('Wallet not connected');
            }

            const encodedMessage = new TextEncoder().encode(message);
            const signature = await this.wallet.signMessage(encodedMessage);
            
            return signature;
        } catch (error) {
            console.error('Failed to sign message:', error);
            throw error;
        }
    }

    /**
     * Get supported wallets list
     */
    getSupportedWallets() {
        return this.supportedWallets.map(wallet => ({
            ...wallet,
            available: !!this.getWalletProvider(wallet.adapter)
        }));
    }

    /**
     * Auto-detect and connect to available wallet
     */
    async autoConnect() {
        const availableWallets = this.getSupportedWallets().filter(w => w.available);
        
        if (availableWallets.length === 0) {
            throw new Error('No supported wallets found. Please install Phantom, Solflare, or Sollet.');
        }

        // Try to connect to the first available wallet
        return await this.connect(availableWallets[0].adapter);
    }

    /**
     * Create a simple transfer transaction (for testing)
     */
    async createTransferTransaction(toPublicKey, amount) {
        try {
            if (!this.isConnected || !this.wallet) {
                throw new Error('Wallet not connected');
            }

            const transaction = new solanaWeb3.Transaction();
            const instruction = solanaWeb3.SystemProgram.transfer({
                fromPubkey: this.wallet.publicKey,
                toPubkey: new solanaWeb3.PublicKey(toPublicKey),
                lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
            });

            transaction.add(instruction);
            transaction.feePayer = this.wallet.publicKey;
            
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;

            return transaction;
        } catch (error) {
            console.error('Failed to create transfer transaction:', error);
            throw error;
        }
    }
}

// Create global instance
window.WalletManager = new WalletManager();
