// Define the Player Select Scene
class PlayerSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayerSelectScene' });
    }

    preload() {
        this.load.image('selectBackground', 'assets/MyCC-Logo-Red-Keyline-Transparent.png');
        this.load.image('player1_icon', 'assets/lily_icon.png');
        this.load.image('player2_icon', 'assets/violet_icon.png');
        this.load.image('background', 'assets/stage1_background.jpg');
        this.load.image('bossSprite', 'assets/boss.png');
        this.load.image('slipSprite', 'assets/detention.png');
        this.load.spritesheet('player', 'assets/animationsL.png', {
            frameWidth: 190,
            frameHeight: 249
        });
        this.load.spritesheet('player2', 'assets/animationsV.png', {
            frameWidth: 150,
            frameHeight: 260
        });
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'selectBackground');
        this.add.text(this.scale.width / 2, 100, 'Select Your Character', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const createCharacterButton = (x, icon, characterKey, name) => {
            const button = this.add.image(x, this.scale.height / 2, icon)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.scene.start('MapTransitionScene', { characterKey });
                });

            this.add.text(button.x, button.y + button.height / 2 + 20, name, {
                fontSize: '24px',
                fill: '#fff'
            }).setOrigin(0.5);
            return button;
        };

        createCharacterButton(this.scale.width / 2 - 150, 'player1_icon', 'player', 'Player 1 - Lily');
        createCharacterButton(this.scale.width / 2 + 150, 'player2_icon', 'player2', 'Player 2 - Violet');
    }
}

class MapTransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapTransitionScene' });
    }

    preload() {
        this.load.image('mapBackground', 'assets/map_background.png');
        this.load.image('stage1', 'assets/stage1_icon.png');
        this.load.image('stage2', 'assets/stage2_icon.png');
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'mapBackground').setScale(0.8);
        const characterKey = this.scene.settings.data.characterKey;

        const createStageButton = (x, icon, scene, name) => {
            const button = this.add.image(x, this.scale.height / 2 - 50, icon)
                .setScale(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.scene.start(scene, { characterKey });
                });
            this.add.text(button.x, button.y + 80, name, {
                fontSize: '24px',
                fill: '#fff'
            }).setOrigin(0.5);
            return button;
        };

        this.add.text(this.scale.width / 2, 100, 'Select Your Stage', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        createStageButton(this.scale.width / 2 - 200, 'stage1', 'MainGameScene', 'Stage 1');
        createStageButton(this.scale.width / 2 + 200, 'stage2', 'Stage2Scene', 'Stage 2');

        // Add leaderboard button
        const leaderboardButton = this.add.text(this.scale.width / 2, this.scale.height - 100, 'View Leaderboard', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        leaderboardButton.on('pointerover', () => leaderboardButton.setStyle({ fill: '#ff0' }));
        leaderboardButton.on('pointerout', () => leaderboardButton.setStyle({ fill: '#fff' }));
        leaderboardButton.on('pointerdown', () => this.scene.start('LeaderboardScene'));
    }
}

// Add this class before the game scenes
class HighScoreManager {
    static showInput(scene, stageNumber) {
        // Add semi-transparent overlay
        const overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.7)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(100);

        // Create UI group to manage all elements
        const uiElements = [];

        // "High Score" text with animation
        const highScoreText = scene.add.text(scene.scale.width / 2, 100, 'High Score', {
            fontSize: '64px',
            fill: '#ff0',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 8
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(100);

        uiElements.push(highScoreText);

        scene.tweens.add({
            targets: highScoreText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Input name text
        const promptText = scene.add.text(scene.scale.width / 2, 200, 'Please enter your name (3 letters):', {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(100);

        uiElements.push(promptText);

        // Create input element
        const element = document.createElement('div');
        element.innerHTML = `
            <input type="text" id="nameInput" maxlength="3" 
                style="
                    font: 32px monospace;
                    width: 100px;
                    height: 40px;
                    text-align: center;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    border: 2px solid white;
                    text-transform: uppercase;
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1000;
                "
            >
        `;

        // Add the element to the game
        const inputElement = scene.add.dom(scene.scale.width / 2, 250, element)
            .setScrollFactor(0)
            .setDepth(100);
        const input = element.querySelector('input');
        
        // Focus the input
        setTimeout(() => {
            input.focus();
        }, 100);

        // Create submit button
        const submitButton = scene.add.text(scene.scale.width / 2, 320, 'Submit', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(100)
        .setInteractive({ useHandCursor: true });

        uiElements.push(submitButton);

        // Add hover effect to submit button
        submitButton.on('pointerover', () => submitButton.setStyle({ fill: '#ff0' }));
        submitButton.on('pointerout', () => submitButton.setStyle({ fill: '#fff' }));

        // Handle input validation
        input.addEventListener('input', (event) => {
            event.target.value = event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        });

        // Cleanup function
        const cleanup = () => {
            element.remove();
            overlay.destroy();
            uiElements.forEach(element => element.destroy());
            scene.scene.start('MapTransitionScene');
        };

        // Handle submit
        const handleSubmit = () => {
            const name = input.value.trim();
            if (name.length === 3) {
                const finalTime = (scene.time.now - scene.startTime) / 1000;
                const scores = JSON.parse(localStorage.getItem('highScores') || '[]');
                scores.push({
                    name: name,
                    score: finalTime,
                    stage: stageNumber
                });
                scores.sort((a, b) => a.score - b.score);
                localStorage.setItem('highScores', JSON.stringify(scores));
                cleanup();
            }
        };

        // Handle submit button click
        submitButton.on('pointerdown', handleSubmit);

        // Handle Enter key
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                handleSubmit();
            }
        });
    }
}

// Add this class after HighScoreManager and before other scene classes
class BaseGameScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.player = null;
        this.cursors = null;
        this.ground = null;
        this.background = null;
        this.boss = null;
        this.selectedPlayerKey = 'player';
        this.startTime = 0;
        this.timerText = null;
    }

    init(data) {
        if (data?.characterKey) {
            this.selectedPlayerKey = data.characterKey;
        }
    }

    setupAnimations() {
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers(this.selectedPlayerKey, { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: [{ key: this.selectedPlayerKey, frame: 15 }],
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: [{ key: this.selectedPlayerKey, frame: 17 }],
            frameRate: 10
        });
    }

    setupWorld(gameWidth, gameHeight, backgroundKey) {
        this.background = this.add.tileSprite(0, 0, 3200, gameHeight, backgroundKey).setOrigin(0);
        this.physics.world.setBounds(0, 0, 3200, gameHeight);
        this.ground = this.add.rectangle(1600, gameHeight - 1.5, 3200, 3);
        this.physics.add.existing(this.ground, true);
    }

    setupPlayer(gameHeight) {
        this.player = this.physics.add.sprite(100, gameHeight - 120, this.selectedPlayerKey);
        this.player.setOrigin(0.5, 1).setScale(0.7).setCollideWorldBounds(true);
        this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.8);
        this.player.body.setOffset(this.player.width * 0.2, this.player.height * 0.1);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.add.collider(this.player, this.ground);
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, 3200, this.scale.height);
        this.cameras.main.setDeadzone(200, this.scale.height);
        this.cameras.main.startFollow(this.player, true, 0.3, 0.3);
    }

    handlePlayerMovement() {
        const { left, right, up } = this.cursors;
        if (left.isDown) {
            this.player.setVelocityX(-200).anims.play('run', true);
            this.player.flipX = true;
        } else if (right.isDown) {
            this.player.setVelocityX(200).anims.play('run', true);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
            if (this.player.body.touching.down) {
                this.player.anims.play('idle', true);
            }
        }

        if (up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-400).anims.play('jump', true);
        }
    }

    updateBackground() {
        if (this.background) {
            this.background.tilePositionX = this.cameras.main.scrollX;
        }
    }

    update() {
        if (!this.player?.body) return;
        const elapsedTime = (this.time.now - this.startTime) / 1000;
        this.timerText.setText(`Time: ${elapsedTime.toFixed(2)}s`);
        this.handlePlayerMovement();
        this.updateBackground();
    }
}

// Update MainGameScene to extend BaseGameScene
class MainGameScene extends BaseGameScene {
    constructor() {
        super({ key: 'MainGameScene' });
        this.detentionSlips = null;
        this.bossTimer = null;
    }

    create() {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        this.startTime = this.time.now;
        this.timerText = this.add.text(16, 16, 'Time: 0.00s', {
            fontSize: '32px',
            fill: '#fff'
        });

        this.setupAnimations();
        this.setupWorld(gameWidth, gameHeight, 'background');
        this.setupPlayer(gameHeight);
        this.setupBoss(gameHeight);
        this.setupCamera();
    }

    setupBoss(gameHeight) {
        this.boss = this.physics.add.sprite(1500, 300, 'bossSprite');
        this.boss.hitCounter = 5;
        this.boss.setScale(0.5).setCollideWorldBounds(true);
        this.boss.setVelocityX(100);

        this.time.addEvent({
            delay: 2500,
            callback: () => {
                if (this.boss?.body) {
                    this.boss.setVelocityX(this.boss.body.velocity.x * -1);
                }
            },
            loop: true
        });
        this.detentionSlips = this.physics.add.group();
        this.setupBossAttacks();
        this.setupBossCollision();
    }

    setupBossAttacks() {
        this.bossTimer = this.time.addEvent({
            delay: 1500,
            callback: () => {
                if (this.boss?.active) {
                    const slip = this.detentionSlips.create(this.boss.x, this.boss.y, 'slipSprite');
                    if (slip) {
                        slip.setVelocityX(-600).setVelocityY(0);
                        slip.body.setAllowGravity(false);
                    }
                }
            },
            loop: true
        });
    }

    setupBossCollision() {
        this.physics.add.overlap(this.player, this.boss, this.handleBossCollision, null, this);
        this.physics.add.collider(this.player, this.detentionSlips, this.handleSlipCollision, null, this);
        this.physics.add.collider(this.detentionSlips, this.ground, slip => slip.destroy());
    }

    handleSlipCollision(player, slip) {
        slip.destroy();
        this.cameras.main.shake(100, 0.01);
        player.setTint(0xff0000);
        this.time.delayedCall(200, () => player.clearTint());
    }

    handleBossCollision() {
        if (!this.boss || this.boss.hitCounter <= 0) return;
        this.boss.hitCounter--;
        this.player.setVelocityY(-300);

        if (this.boss.hitCounter <= 0) {
            this.cameras.main.shake(500, 0.01);
            this.boss.setVelocityX(0);

            this.time.delayedCall(100, () => {
                if (this.boss?.body) {
                    this.boss.body.setAllowGravity(true);
                    this.boss.body.setVelocityY(100);
                }
            });

            this.time.delayedCall(1500, () => {
                if (this.boss) {
                    this.boss.destroy();
                    this.boss = null;
                    HighScoreManager.showInput(this, 1);
                }
            });
        }
    }
}

// Update Stage2Scene to extend BaseGameScene
class Stage2Scene extends BaseGameScene {
    constructor() {
        super({ key: 'Stage2Scene' });
    }

    create() {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        this.startTime = this.time.now;
        this.timerText = this.add.text(16, 16, 'Time: 0.00s', {
            fontSize: '32px',
            fill: '#fff'
        });

        this.setupAnimations();
        this.setupWorld(gameWidth, gameHeight, 'stage2Background');
        this.setupPlayer(gameHeight);
        this.setupBoss(gameHeight);
        this.setupCamera();
    }

    setupBoss(gameHeight) {
        this.boss = this.physics.add.sprite(1500, gameHeight - 200, 'bossSprite');
        this.boss.hitCounter = 8;
        this.boss.setScale(0.5).setCollideWorldBounds(true);
        this.boss.setVelocityX(250);
        this.boss.attackRange = 400;
        this.boss.roamingRange = { min: 800, max: 2200 };
        this.boss.canJump = true;

        this.setupBossBehavior();
        this.setupBossCollision();
    }

    setupBossBehavior() {
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.boss?.body) {
                    this.handleBossJump();
                    this.handleBossMovement();
                }
            },
            loop: true
        });
    }

    handleBossJump() {
        if (this.boss.canJump && Phaser.Math.Between(1, 100) <= 20) {
            this.boss.setVelocityY(-400);
            this.boss.canJump = false;
            this.time.delayedCall(2000, () => {
                if (this.boss) this.boss.canJump = true;
            });
        }
    }

    handleBossMovement() {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.boss.x, this.boss.y,
            this.player.x, this.player.y
        );
        if (distanceToPlayer < this.boss.attackRange) {
            this.boss.setVelocityX(this.boss.body.velocity.x * 1.5);
            this.time.delayedCall(500, () => {
                if (this.boss?.body) {
                    this.boss.setVelocityX(this.boss.body.velocity.x * -1);
                }
            });
        } else {
            if (this.boss.x <= this.boss.roamingRange.min) {
                this.boss.setVelocityX(250);
            } else if (this.boss.x >= this.boss.roamingRange.max) {
                this.boss.setVelocityX(-250);
            }
        }
    }

    setupBossCollision() {
        this.physics.add.overlap(this.player, this.boss, this.handleBossCollision, null, this);
        this.physics.add.collider(this.boss, this.ground, () => {
            if (this.boss) this.boss.setVelocityY(0);
        });
    }

    handleBossCollision() {
        if (!this.boss || this.boss.hitCounter <= 0) return;
        this.boss.hitCounter--;
        this.player.setVelocityY(-300);

        if (this.boss.hitCounter <= 0) {
            this.cameras.main.shake(500, 0.01);
            this.boss.setVelocityX(0);

            this.time.delayedCall(100, () => {
                if (this.boss?.body) {
                    this.boss.body.setAllowGravity(true);
                    this.boss.body.setVelocityY(100);
                }
            });

            this.time.delayedCall(1500, () => {
                if (this.boss) {
                    this.boss.destroy();
                    this.boss = null;
                    HighScoreManager.showInput(this, 2);
                }
            });
        }
    }
}

class HighScoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HighScoreScene' });
        this.scores = [];
    }

    init(data) {
        this.finalTime = data.time;
    }

    preload() {
        this.load.image('background', 'assets/stage1_background.jpg');
    }

    create() {
        // Add semi-transparent background
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8)
            .setOrigin(0);

        // "High Score" text with animation
        const highScoreText = this.add.text(this.scale.width / 2, 100, 'High Score', {
            fontSize: '64px',
            fill: '#ff0',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.tweens.add({
            targets: highScoreText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Input name text
        this.add.text(this.scale.width / 2, 200, 'Please enter your name (3 letters):', {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Create a basic HTML input element
        const element = document.createElement('div');
        element.innerHTML = `
            <input type="text" id="nameInput" maxlength="3" 
                style="
                    font: 32px monospace;
                    width: 100px;
                    height: 40px;
                    text-align: center;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    border: 2px solid white;
                    text-transform: uppercase;
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1000;
                "
            >
        `;

        // Add the element to the game
        const inputElement = this.add.dom(this.scale.width / 2, 250, element);
        const input = element.querySelector('input');
        
        // Focus the input
        setTimeout(() => {
            input.focus();
        }, 100);

        // Create submit button
        const submitButton = this.add.text(this.scale.width / 2, 320, 'Submit', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Add hover effect to submit button
        submitButton.on('pointerover', () => {
            submitButton.setStyle({ fill: '#ff0' });
        });
        submitButton.on('pointerout', () => {
            submitButton.setStyle({ fill: '#fff' });
        });

        // Handle input validation
        input.addEventListener('input', (event) => {
            event.target.value = event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        });

        // Handle submit
        const handleSubmit = () => {
            const name = input.value.trim();
            if (name.length === 3) {
                this.saveScore(name, this.finalTime);
                element.remove();
                this.displayLeaderboard();
            }
        };

        // Handle submit button click
        submitButton.on('pointerdown', handleSubmit);

        // Handle Enter key
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                handleSubmit();
            }
        });

        this.loadScores();
    }

    saveScore(name, score) {
        this.scores.push({ name: name, score: score });
        this.scores.sort((a, b) => a.score - b.score); // Sort by score (ascending)
        localStorage.setItem('highScores', JSON.stringify(this.scores));
    }

    loadScores() {
        const storedScores = localStorage.getItem('highScores');
        if (storedScores) {
            this.scores = JSON.parse(storedScores);
        }
    }

    displayLeaderboard() {
        // Clear existing elements
        this.children.list.forEach(child => {
            if (child.type !== 'Text') return;
            child.destroy();
        });

        // Add leaderboard title
        this.add.text(this.scale.width / 2, 100, 'Leaderboard', {
            fontSize: '48px',
            fill: '#ff0',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Display top 10 scores
        for (let i = 0; i < Math.min(10, this.scores.length); i++) {
            const score = this.scores[i];
            this.add.text(this.scale.width / 2, 200 + i * 40, `${i + 1}. ${score.name} - ${score.score.toFixed(2)}s`, {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
            }).setOrigin(0.5);
        }

        // Add back button
        const backButton = this.add.text(this.scale.width / 2, this.scale.height - 100, 'Back to Menu', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backButton.on('pointerover', () => {
            backButton.setStyle({ fill: '#ff0' });
        });
        backButton.on('pointerout', () => {
            backButton.setStyle({ fill: '#fff' });
        });
        backButton.on('pointerdown', () => {
            this.scene.start('PlayerSelectScene');
        });
    }
}

// Add this class before the config
class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
        this.scores = [];
        this.currentStage = 1;
    }

    create() {
        // Add semi-transparent background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8)
            .setOrigin(0);

        // Add title
        const title = this.add.text(this.scale.width / 2, 50, 'Leaderboard', {
            fontSize: '48px',
            fill: '#ff0',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Add stage selection buttons
        const stage1Button = this.add.text(this.scale.width / 3, 120, 'Stage 1', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const stage2Button = this.add.text(this.scale.width * 2/3, 120, 'Stage 2', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Add hover effects
        [stage1Button, stage2Button].forEach(button => {
            button.on('pointerover', () => button.setStyle({ fill: '#ff0' }));
            button.on('pointerout', () => button.setStyle({ fill: '#fff' }));
        });

        // Add click handlers
        stage1Button.on('pointerdown', () => {
            this.currentStage = 1;
            this.displayScores();
        });

        stage2Button.on('pointerdown', () => {
            this.currentStage = 2;
            this.displayScores();
        });

        // Add back button
        const backButton = this.add.text(this.scale.width / 2, this.scale.height - 50, 'Back to Map', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backButton.on('pointerover', () => backButton.setStyle({ fill: '#ff0' }));
        backButton.on('pointerout', () => backButton.setStyle({ fill: '#fff' }));
        backButton.on('pointerdown', () => this.scene.start('MapTransitionScene'));

        // Display initial scores
        this.displayScores();
    }

    displayScores() {
        // Clear existing score texts
        if (this.scoreTexts) {
            this.scoreTexts.forEach(text => text.destroy());
        }
        this.scoreTexts = [];

        // Load and filter scores
        const allScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        const stageScores = allScores.filter(score => score.stage === this.currentStage)
            .sort((a, b) => a.score - b.score)
            .slice(0, 10);

        // Display stage title
        const stageTitle = this.add.text(this.scale.width / 2, 180, `Stage ${this.currentStage} High Scores`, {
            fontSize: '36px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.scoreTexts.push(stageTitle);

        // Display scores
        if (stageScores.length === 0) {
            const noScores = this.add.text(this.scale.width / 2, 250, 'No scores yet!', {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
            }).setOrigin(0.5);
            this.scoreTexts.push(noScores);
        } else {
            stageScores.forEach((score, index) => {
                const scoreText = this.add.text(this.scale.width / 2, 250 + index * 40,
                    `${index + 1}. ${score.name} - ${score.score.toFixed(2)}s`, {
                        fontSize: '32px',
                        fill: index === 0 ? '#ff0' : '#fff',
                        stroke: '#000',
                        strokeThickness: 4
                    }).setOrigin(0.5);
                this.scoreTexts.push(scoreText);
            });
        }
    }
}

// --- Original Config Modified ---
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 768,
    parent: 'game',
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [PlayerSelectScene, MainGameScene, MapTransitionScene, Stage2Scene, HighScoreScene, LeaderboardScene]
};
// Start the game
const game = new Phaser.Game(config);

// Remove the old global functions (preload, create, update)
// function preload() { ... } // DELETE or comment out
// function create() { ... } // DELETE or comment out
// function update() { ... } // DELETE or comment out