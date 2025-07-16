# Trait Titans - Blockchain RPG Game

## Overview

Trait Titans is a browser-based RPG game that integrates with the Solana blockchain using Honeycomb Protocol for on-chain progression tracking. The game features trait-based combat, mission systems, and turn-based battles with wallet integration for persistent player data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Vanilla HTML, CSS, and JavaScript with Bootstrap for responsive design
- **Module Organization**: Modular JavaScript architecture with separate files for different game systems
- **UI Framework**: Bootstrap 5.1.3 for responsive components and Font Awesome for icons
- **Design Pattern**: Class-based architecture with clear separation of concerns

### Backend Architecture
- **Serverless Design**: Pure client-side application with no traditional backend
- **Blockchain Integration**: Solana blockchain serves as the data persistence layer
- **Protocol Integration**: Honeycomb Protocol for on-chain mission tracking and player progression

### Data Storage Solutions
- **Primary Storage**: Solana blockchain via Honeycomb Protocol
- **Local Storage**: Browser localStorage for temporary game state and UI preferences
- **Session Management**: Wallet-based authentication without traditional user accounts

## Key Components

### 1. Main Game Controller (`main.js`)
- **Purpose**: Central game state management and UI coordination
- **Responsibilities**: Player stats, battle state, mission management, UI updates
- **Architecture**: Single TraitTitansGame class managing all game logic

### 2. Battle System (`lib/battle.js`)
- **Purpose**: Turn-based combat mechanics and damage calculations
- **Features**: Opponent generation, damage calculation, turn order determination
- **Design**: Static utility class with pure functions for combat logic

### 3. Wallet Integration (`lib/wallet.js`)
- **Purpose**: Solana wallet connection and management
- **Supported Wallets**: Phantom, Solflare, Sollet
- **Network**: Solana devnet for development and testing

### 4. Honeycomb Protocol (`lib/honeycomb.js`)
- **Purpose**: On-chain data persistence and mission tracking
- **Status**: Prepared structure for future SDK integration
- **Functionality**: Player data retrieval, mission completion tracking

### 5. User Interface (`index.html`, `styles.css`)
- **Design**: Responsive card-based layout with glass-morphism effects
- **Mobile Support**: Bootstrap responsive grid system
- **Styling**: Custom CSS with gradient backgrounds and modern UI elements

## Data Flow

### Player Authentication
1. User connects Solana wallet through wallet selector
2. Wallet address serves as unique player identifier
3. Game retrieves player data from blockchain via Honeycomb Protocol
4. Local game state synchronized with on-chain data

### Mission System
1. Player selects available mission from mission list
2. Mission progress tracked locally during execution
3. Completion triggers on-chain transaction via Honeycomb
4. Player stats updated both locally and on-chain

### Battle System
1. Opponent generated based on player stats
2. Turn order determined by speed statistics
3. Damage calculations use strength, speed, wisdom traits
4. Battle results affect player stats and reputation

## External Dependencies

### Blockchain Infrastructure
- **Solana Web3.js**: Core blockchain interaction library
- **Solana Wallet Adapter**: Standard wallet connection interface
- **Honeycomb Protocol**: On-chain game data management (future integration)

### UI Libraries
- **Bootstrap 5.1.3**: Responsive design framework
- **Font Awesome 6.0.0**: Icon library for UI elements
- **Three.js**: 3D visualization library for battle arenas and character avatars

### Development Tools
- **HTTP Server**: Any static file server for local development
- **Solana CLI**: For devnet interaction and testing

## Deployment Strategy

### Development Environment
- **Local Server**: Simple HTTP server for file serving
- **Network**: Solana devnet for testing blockchain interactions
- **Wallet**: Development wallet with devnet SOL for transactions

### Production Considerations
- **Hosting**: Static file hosting (GitHub Pages, Netlify, Vercel)
- **Network**: Solana mainnet for production deployment
- **CDN**: External CDN for Bootstrap and Font Awesome resources
- **Honeycomb Integration**: Full SDK integration required for production

### Architecture Decisions

#### Why Vanilla JavaScript?
- **Simplicity**: Easier to understand and modify without framework complexity
- **Performance**: Lightweight with minimal dependencies
- **Deployment**: No build process required for simple hosting

#### Why Solana Blockchain?
- **Speed**: Fast transaction processing for game actions
- **Cost**: Low transaction fees suitable for frequent game interactions
- **Ecosystem**: Rich DeFi and gaming ecosystem integration potential

#### Why Honeycomb Protocol?
- **Game Focus**: Purpose-built for blockchain gaming applications
- **Scalability**: Handles complex game state management efficiently
- **Developer Experience**: Simplified API for game developers

The architecture prioritizes simplicity and direct blockchain integration over traditional web application patterns, making it suitable for a blockchain-first gaming experience.

## Recent Changes: Latest modifications with dates

### July 16, 2025 - Wallet Integration Fix & 3D Visualization
- **Fixed Critical Bug**: Resolved "WalletManager.getWallet is not a function" error by updating all Honeycomb Protocol calls to use `window.WalletManager` instance
- **Added Three.js Integration**: Implemented 3D battle arena visualization with:
  - Avatar generation based on player stats (size, weapons, glows)
  - Animated battle actions (attack, defend, skill moves)
  - Particle effects for damage and healing
  - Rotating camera view around the battle arena
- **Enhanced Battle System**: Added visual feedback for all battle actions
- **Improved UI**: Added dedicated battle visualization container with styling

### Previous Implementation
- Complete game structure with modular architecture
- Dual-mode gameplay (offline/online) for testing flexibility
- Solana wallet integration with devnet support
- Basic Honeycomb Protocol structure for mission tracking