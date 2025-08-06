/**
 * Three.js Visualization for Trait Titans
 * Handles 3D avatars and battle arenas
 */

class GameVisualization {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.playerAvatar = null;
        this.opponentAvatar = null;
        this.battleArena = null;
        this.isInitialized = false;
        this.animationId = null;
    }

    /**
     * Initialize Three.js scene
     */
    async init() {
        try {
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.set(0, 5, 10);
            this.camera.lookAt(0, 0, 0);

            // Create renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(400, 300);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Add lighting
            this.setupLighting();

            // Create basic arena
            this.createBattleArena();

            this.isInitialized = true;
            console.log('Three.js visualization initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Three.js:', error);
            return false;
        }
    }

    /**
     * Setup lighting for the scene
     */
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);

        // Point light for dramatic effect
        const pointLight = new THREE.PointLight(0xff6600, 0.5, 100);
        pointLight.position.set(0, 8, 0);
        this.scene.add(pointLight);
    }

    /**
     * Create the battle arena
     */
    createBattleArena() {
        // Create arena floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            transparent: true,
            opacity: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Create arena walls
        const wallHeight = 3;
        const wallGeometry = new THREE.BoxGeometry(0.5, wallHeight, 20);
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });

        // Left wall
        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.position.set(-10, wallHeight / 2, 0);
        leftWall.castShadow = true;
        this.scene.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.position.set(10, wallHeight / 2, 0);
        rightWall.castShadow = true;
        this.scene.add(rightWall);

        // Back wall
        const backWallGeometry = new THREE.BoxGeometry(20, wallHeight, 0.5);
        const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        backWall.position.set(0, wallHeight / 2, -10);
        backWall.castShadow = true;
        this.scene.add(backWall);

        // Front wall (partial for visibility)
        const frontWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        frontWall.position.set(0, wallHeight / 2, 10);
        frontWall.castShadow = true;
        this.scene.add(frontWall);

        this.battleArena = {
            floor,
            walls: [leftWall, rightWall, backWall, frontWall]
        };
    }

    /**
     * Create a character avatar based on stats
     */
    createAvatar(stats, isPlayer = true) {
        const group = new THREE.Group();

        // Body (size based on strength)
        const bodyScale = 1 + (stats.strength / 100);
        const bodyGeometry = new THREE.CapsuleGeometry(0.5 * bodyScale, 2 * bodyScale, 4, 8);
        const bodyColor = isPlayer ? 0x4CAF50 : 0xF44336; // Green for player, red for opponent
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: bodyColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1 * bodyScale;
        body.castShadow = true;
        group.add(body);

        // Add player/opponent indicator above head
        const labelGeometry = new THREE.PlaneGeometry(1, 0.3);
        const labelMaterial = new THREE.MeshBasicMaterial({ 
            color: isPlayer ? 0x00FF00 : 0xFF0000,
            transparent: true,
            opacity: 0.8
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.y = 3.5 * bodyScale;
        label.lookAt(0, 0, 1); // Face camera
        group.add(label);

        // Add text texture for player/opponent label
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        context.fillStyle = isPlayer ? '#00FF00' : '#FF0000';
        context.fillRect(0, 0, 256, 64);
        context.fillStyle = '#FFFFFF';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(isPlayer ? 'PLAYER' : 'OPPONENT', 128, 40);
        
        const textTexture = new THREE.CanvasTexture(canvas);
        label.material.map = textTexture;
        label.material.needsUpdate = true;

        // Head
        const headGeometry = new THREE.SphereGeometry(0.3 * bodyScale, 8, 6);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.5 * bodyScale;
        head.castShadow = true;
        group.add(head);

        // Eyes (wisdom indicator)
        const eyeGeometry = new THREE.SphereGeometry(0.05, 4, 4);
        const eyeMaterial = new THREE.MeshLambertMaterial({ 
            color: stats.wisdom > 20 ? 0x0066FF : 0x000000 
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 2.6 * bodyScale, 0.25 * bodyScale);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 2.6 * bodyScale, 0.25 * bodyScale);
        group.add(rightEye);

        // Weapon (based on stats)
        this.addWeapon(group, stats, bodyScale);

        // Add glow effect based on reputation
        if (stats.reputation > 30) {
            const glowGeometry = new THREE.SphereGeometry(1.5 * bodyScale, 8, 6);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFD700,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.y = 1.5 * bodyScale;
            group.add(glow);
        }

        // Position avatar
        group.position.x = isPlayer ? -3 : 3;
        group.position.y = 0;
        group.position.z = 0;

        return group;
    }

    /**
     * Add weapon to avatar based on stats
     */
    addWeapon(group, stats, bodyScale) {
        const highestStat = Math.max(stats.strength, stats.speed, stats.wisdom);
        let weaponGeometry, weaponMaterial, weaponColor;

        if (stats.strength === highestStat) {
            // Sword for strength
            weaponGeometry = new THREE.BoxGeometry(0.1, 2, 0.1);
            weaponColor = 0xC0C0C0;
        } else if (stats.speed === highestStat) {
            // Dagger for speed
            weaponGeometry = new THREE.BoxGeometry(0.05, 1.5, 0.05);
            weaponColor = 0x808080;
        } else {
            // Staff for wisdom
            weaponGeometry = new THREE.BoxGeometry(0.1, 2.5, 0.1);
            weaponColor = 0x8B4513;
        }

        weaponMaterial = new THREE.MeshLambertMaterial({ color: weaponColor });
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weapon.position.set(0.8 * bodyScale, 1.5 * bodyScale, 0);
        weapon.rotation.z = Math.PI / 6;
        weapon.castShadow = true;
        group.add(weapon);

        // Add weapon glow for magical weapons
        if (stats.wisdom === highestStat) {
            const glowGeometry = new THREE.SphereGeometry(0.2, 6, 6);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x9966FF,
                transparent: true,
                opacity: 0.5
            });
            const weaponGlow = new THREE.Mesh(glowGeometry, glowMaterial);
            weaponGlow.position.set(0.8 * bodyScale, 2.5 * bodyScale, 0);
            group.add(weaponGlow);
        }
    }

    /**
     * Update avatars with new stats
     */
    updateAvatars(playerStats, opponentStats = null) {
        if (!this.isInitialized) return;

        // Remove existing avatars
        if (this.playerAvatar) {
            this.scene.remove(this.playerAvatar);
        }
        if (this.opponentAvatar) {
            this.scene.remove(this.opponentAvatar);
        }

        // Create new avatars
        this.playerAvatar = this.createAvatar(playerStats, true);
        this.scene.add(this.playerAvatar);

        if (opponentStats) {
            this.opponentAvatar = this.createAvatar(opponentStats, false);
            this.scene.add(this.opponentAvatar);
        }
    }

    /**
     * Animate battle action
     */
    animateBattleAction(attacker, action) {
        if (!this.isInitialized) return;

        const avatar = attacker === 'player' ? this.playerAvatar : this.opponentAvatar;
        if (!avatar) return;

        const originalPosition = avatar.position.clone();

        switch (action) {
            case 'attack':
                // Move forward and back
                avatar.position.x += attacker === 'player' ? 1 : -1;
                setTimeout(() => {
                    avatar.position.copy(originalPosition);
                }, 500);
                break;

            case 'defend':
                // Crouch down
                avatar.position.y -= 0.5;
                setTimeout(() => {
                    avatar.position.copy(originalPosition);
                }, 1000);
                break;

            case 'skill':
                // Spin attack
                const spinAnimation = () => {
                    avatar.rotation.y += 0.3;
                    if (avatar.rotation.y < Math.PI * 2) {
                        requestAnimationFrame(spinAnimation);
                    } else {
                        avatar.rotation.y = 0;
                    }
                };
                spinAnimation();
                break;
        }
    }

    /**
     * Add particle effects for battle
     */
    createParticleEffect(type, position) {
        if (!this.isInitialized) return;

        const particleCount = 20;
        const particles = new THREE.Group();

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 4, 4),
                new THREE.MeshBasicMaterial({ 
                    color: type === 'damage' ? 0xFF0000 : 0x00FF00 
                })
            );

            particle.position.copy(position);
            particle.position.x += (Math.random() - 0.5) * 2;
            particle.position.y += (Math.random() - 0.5) * 2;
            particle.position.z += (Math.random() - 0.5) * 2;

            particles.add(particle);
        }

        this.scene.add(particles);

        // Remove particles after animation
        setTimeout(() => {
            this.scene.remove(particles);
        }, 1000);
    }

    /**
     * Attach renderer to DOM element
     */
    attachToElement(elementId) {
        if (!this.isInitialized) return false;

        const container = document.getElementById(elementId);
        if (!container) return false;

        // Clear existing content
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);

        // Start render loop
        this.animate();
        return true;
    }

    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Rotate camera around the scene
        const time = Date.now() * 0.0005;
        this.camera.position.x = Math.cos(time) * 12;
        this.camera.position.z = Math.sin(time) * 12;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Stop animation and cleanup
     */
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.isInitialized = false;
    }

    /**
     * Handle window resize
     */
    onWindowResize(width, height) {
        if (!this.isInitialized) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Create global instance
window.GameVisualization = new GameVisualization();