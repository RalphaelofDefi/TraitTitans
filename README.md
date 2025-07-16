# Trait Titans 🛡️⚔️

A browser-based blockchain RPG game featuring Solana wallet integration, Honeycomb Protocol for on-chain progression, and immersive 3D battle visualization. Built for the Superteam Nigeria Honeycomb bounty.

## 🚀 Features

### Core Gameplay
- **Turn-Based Combat**: Strategic battle system with attack, defend, and skill actions
- **Mission System**: Progressive mission unlocking based on player stats
- **Character Progression**: Strength, Speed, Wisdom, Reputation, and Experience stats
- **3D Battle Arena**: Real-time 3D visualization of battles using Three.js

### Blockchain Integration
- **Solana Wallet Support**: Connect with Phantom, Solflare, or Sollet wallets
- **Honeycomb Protocol**: On-chain mission tracking and player progression
- **Automatic Sync**: Player stats automatically saved to blockchain after missions and battles
- **Devnet Support**: Full testing environment with Solana devnet

### User Experience
- **Dual-Mode Gameplay**: Play offline or connect wallet for blockchain features
- **Mobile-Responsive**: Optimized for desktop and mobile devices
- **Real-Time Updates**: Live battle animations and particle effects
- **Progress Tracking**: Detailed battle logs and mission completion history

## 🎮 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Solana wallet extension (Phantom recommended)
- Devnet SOL for testing (get from [Solana Faucet](https://faucet.solana.com/))

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/TraitTitans.git
   cd TraitTitans
   ```

2. Start a local server:
   ```bash
   # Using Python
   python -m http.server 5000
   
   # Using Node.js
   npx serve . -p 5000
   
   # Using PHP
   php -S localhost:5000
   ```

3. Open your browser and navigate to `http://localhost:5000`

4. Connect your Solana wallet and start playing!

## 🏗️ Technical Architecture

### Project Structure
```
TraitTitans/
├── lib/
│   ├── battle.js          # Combat system and mechanics
│   ├── honeycomb.js       # Honeycomb Protocol integration
│   ├── visualization.js   # Three.js 3D battle arena
│   └── wallet.js          # Solana wallet management
├── index.html             # Main game interface
├── main.js                # Core game logic and UI
├── styles.css             # Responsive styling
├── README.md              # This file
└── replit.md              # Development documentation
```

### Key Components

#### 1. Game Controller (`main.js`)
- Manages game state and player progression
- Handles UI updates and user interactions
- Coordinates between different modules

#### 2. Wallet Manager (`lib/wallet.js`)
- Solana wallet connection and management
- Transaction signing and sending
- Multi-wallet support (Phantom, Solflare, Sollet)

#### 3. Honeycomb Protocol (`lib/honeycomb.js`)
- On-chain mission tracking
- Player stats synchronization
- Battle result recording

#### 4. Battle System (`lib/battle.js`)
- Turn-based combat mechanics
- Damage calculations and stat interactions
- Opponent generation and difficulty scaling

#### 5. 3D Visualization (`lib/visualization.js`)
- Three.js scene management
- Avatar generation based on player stats
- Battle animations and particle effects

## 🎯 Gameplay Features

### Mission System
- **Training Grounds**: Basic combat training (+2 STR, +1 REP)
- **Ancient Library**: Wisdom enhancement (+3 WIS, +2 EXP)
- **Mystic Forest**: Balanced stat growth (+2 SPD, +1 WIS, +1 EXP)
- **Dragon's Lair**: High-risk, high-reward challenge (+3 STR, +2 REP, +5 EXP)

### Combat Mechanics
- **Attack**: Deal damage based on Strength stat
- **Defend**: Reduce incoming damage by 50%
- **Skill**: Special abilities based on highest stat
- **Speed**: Determines turn order
- **Health**: Regenerates after each battle

### 3D Battle Arena
- **Dynamic Avatars**: Size and appearance based on player stats
- **Weapon System**: Different weapons for different stat builds
- **Particle Effects**: Visual feedback for damage and healing
- **Camera Movement**: Cinematic rotating camera view

## 🔧 Development

### Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Protocol**: Honeycomb Protocol for gaming infrastructure
- **3D Graphics**: Three.js for battle visualization
- **UI Framework**: Bootstrap 5 for responsive design

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly on different devices
5. Submit a pull request

### Testing
- Test offline mode functionality
- Verify wallet connection with different providers
- Check responsive design on mobile devices
- Validate blockchain transactions on devnet

## 📱 Mobile Support

The game is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Adaptive layout for different screen sizes
- Optimized 3D rendering for mobile performance
- Mobile wallet integration support

## 🌐 Deployment

### GitHub Pages
The project is configured for easy deployment on GitHub Pages:
1. Push to `main` branch
2. Enable GitHub Pages in repository settings
3. Select "Deploy from a branch" and choose `main`
4. Your game will be available at `https://yourusername.github.io/TraitTitans`

### Alternative Hosting
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **Surge**: Command-line deployment

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Bug Reports**: Use GitHub Issues to report bugs
2. **Feature Requests**: Discuss new features in Issues first
3. **Code Contributions**: Fork, branch, and submit pull requests
4. **Documentation**: Help improve documentation and guides

### Development Guidelines
- Follow existing code style and structure
- Test changes thoroughly before submitting
- Update documentation for new features
- Keep commits focused and well-described

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Superteam Nigeria** for the Honeycomb bounty opportunity
- **Honeycomb Protocol** for providing blockchain gaming infrastructure
- **Solana Foundation** for the fast and efficient blockchain platform
- **Three.js Community** for the excellent 3D graphics library

## 📞 Support

For support, questions, or feedback:
- Create an issue on GitHub
- Join our community discussions
- Check the documentation in `replit.md`

---

**Built with ❤️ for the Solana ecosystem and blockchain gaming community.**