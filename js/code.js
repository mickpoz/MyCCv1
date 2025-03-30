// --- Constants ---
const GAME_WIDTH = 1200;
const GAME_HEIGHT = 768;
const WORLD_WIDTH = 3200;
const GROUND_HEIGHT = 3;
const PLAYER_X = 100;
const PLAYER_Y = GAME_HEIGHT - 120;
const BOSS_X = 1500;
const BOSS_Y = 300;
const PLAYER_SPEED = 200;
const PLAYER_JUMP_VELOCITY = -500;
const BOSS_SPEED = 100;
const BOSS_CHANGE_DIR_DELAY = 2500; // ms
const BOSS_SHOOT_DELAY = 2500; // ms
const BOSS_INITIAL_HITS = 5;
const SLIP_VELOCITY_X = -500;
const PLAYER_BOUNCE_ON_BOSS = -300;

// --- Phaser Scene Class ---
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'gameScene' });

        // Initialize scene properties (replaces global variables)
        this.player = null;
        this.cursors = null;
        this.ground = null;
        this.background = null;
        this.boss = null;
        this.detentionSlips = null;
        this.bossTimer = null;
        this.bossMoveTimer = null;
    }

    preload() {
        this.load.image('background', 'assets/background3.jpg');
        this.load.image('bossSprite', 'assets/boss.png');
        this.load.image('slipSprite', 'assets/detention.png');
        this.load.spritesheet('player', 'assets/animations.png', {
            frameWidth: 190,
            frameHeight: 249
        });
    }

    create() {
        this.createAnimations();
        this.createWorld();
        this.createPlayer();
        this.createBoss();
        this.createDetentionSlips(); // Setup group first
        this.startBossActions();     // Start timers after boss exists
        this.setupColliders();
        this.setupCamera();
    }

    update() {
        // Guard clauses: Check if player and cursors exist before using them
        // Also check if player body is enabled before allowing movement
        if (!this.player || !this.cursors || !this.player.body || !this.player.body.enable) {
            return;
        }
        this.handlePlayerMovement();
        this.updateBackground();
    }

    // --- Creation Methods ---

    createAnimations() {
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 15 }],
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [{ key: 'player', frame: 17 }],
            frameRate: 10
        });
    }

    createWorld() {
        // Background tile sprite
        this.background = this.add.tileSprite(0, 0, WORLD_WIDTH, this.scale.height, 'background').setOrigin(0);

        // World bounds
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, this.scale.height);

        // Static ground platform
        this.ground = this.add.rectangle(
            WORLD_WIDTH / 2,
            GAME_HEIGHT - GROUND_HEIGHT / 2,
            WORLD_WIDTH,
            GROUND_HEIGHT
        );
        this.physics.add.existing(this.ground, true); // true makes it static
    }

    createPlayer() {
        this.player = this.physics.add.sprite(PLAYER_X, PLAYER_Y, 'player');
        this.player.setOrigin(0.5, 1); // Bottom-center origin
        this.player.setScale(0.7);
        this.player.setCollideWorldBounds(true);

        // Enable keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    createBoss() {
        this.boss = this.physics.add.sprite(BOSS_X, BOSS_Y, 'bossSprite');
        this.boss.hitCounter = BOSS_INITIAL_HITS;
        this.boss.setScale(0.5);
        this.boss.setCollideWorldBounds(true);
        this.boss.setBounce(0);
        this.boss.setVelocityX(BOSS_SPEED);
        // Boss will now be affected by gravity by default and fall to ground
        // this.boss.body.setAllowGravity(false); // Removed this line
    }

    createDetentionSlips() {
        // Group to hold the detention slips (projectiles)
        this.detentionSlips = this.physics.add.group({
            allowGravity: false, // Slips ignore gravity
            velocityX: SLIP_VELOCITY_X // Set default velocity for new slips
        });
    }

    // --- Action/Timer Methods ---

    startBossActions() {
        // Timer to reverse boss direction
        this.bossMoveTimer = this.time.addEvent({
            delay: BOSS_CHANGE_DIR_DELAY,
            callback: this.reverseBossDirection,
            callbackScope: this, // Ensure 'this' refers to the scene inside the callback
            loop: true,
        });

        // Timer for the boss to shoot detention slips
        this.bossTimer = this.time.addEvent({
            delay: BOSS_SHOOT_DELAY,
            callback: this.bossShoot,
            callbackScope: this, // Ensure 'this' refers to the scene
            loop: true,
        });
    }

    reverseBossDirection() {
        // Check if boss still exists and has a body
        if (this.boss && this.boss.body) {
            this.boss.setVelocityX(this.boss.body.velocity.x * -1);
        } else {
             // If boss is gone, stop this timer
            if (this.bossMoveTimer) this.bossMoveTimer.remove();
        }
    }

    bossShoot() {
         // Check if boss still exists before shooting
        if (this.boss && this.boss.active) { // Check active state
            // Create a slip at the boss's position
            const slip = this.detentionSlips.create(this.boss.x, this.boss.y, 'slipSprite');
            // Velocity is set by the group defaults
        } else {
            // If boss is gone, stop this timer
             if (this.bossTimer) this.bossTimer.remove();
        }
    }

    // --- Collision and Camera Setup ---

    setupColliders() {
        // Player vs. Ground
        this.physics.add.collider(this.player, this.ground);

        // Player vs. Boss (Overlap check for stomping)
        this.physics.add.overlap(this.player, this.boss, this.handleBossOverlap, null, this);

        // Player vs. Detention Slips <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        // This line sets up the call to the handlePlayerHitBySlip method below
        this.physics.add.collider(this.player, this.detentionSlips, this.handlePlayerHitBySlip, null, this);

        // Boss vs. Ground
        this.physics.add.collider(this.boss, this.ground);
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, this.scale.height);
        this.cameras.main.setDeadzone(200, this.scale.height); // Area where player moves before camera scrolls
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1); // Smoother follow
    }

    // --- Update Handlers ---

    handlePlayerMovement() {
        // This check is now also in update(), but good practice to have it here too
        if (!this.player.body.enable) return;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-PLAYER_SPEED);
            this.player.anims.play('run', true);
            this.player.flipX = true; // Flip sprite left
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(PLAYER_SPEED);
            this.player.anims.play('run', true);
            this.player.flipX = false; // Normal sprite direction
        } else {
            this.player.setVelocityX(0);
            // Only play idle if the player is on the ground
            if (this.player.body.touching.down) {
                this.player.anims.play('idle', true);
            }
        }

        // Jumping - check 'isDown' for single press jump, ensure player is on ground
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.player.body.touching.down) {
            this.player.setVelocityY(PLAYER_JUMP_VELOCITY);
            this.player.anims.play('jump', true); // Play jump animation once
        }
    }

    updateBackground() {
        // Scroll the background tileSprite with the camera
        this.background.tilePositionX = this.cameras.main.scrollX;
    }

    // --- Collision Handlers ---

    handleBossOverlap(player, boss) {
        // Check if player is falling onto the boss (basic stomp check)
        // And ensure the boss hasn't already been defeated
        if (player.body.velocity.y > 0 && boss.hitCounter > 0) {
            boss.hitCounter -= 1;
            console.log(`Boss hit! Remaining hits: ${boss.hitCounter}`);
            player.setVelocityY(PLAYER_BOUNCE_ON_BOSS); // Player bounces up slightly

            // Check if boss is defeated
            if (boss.hitCounter <= 0) {
                this.defeatBoss(boss);
            }
        }
    }

    // --- THIS IS THE MODIFIED METHOD ---
    handlePlayerHitBySlip(player, slip) {
        console.log('Player hit by a detention slip!'); // Log for debugging

        // 1. Immediate Feedback: Shake camera, make player flash red
        this.cameras.main.shake(150, 0.005); // Short shake (duration, intensity)
        player.setTint(0xff0000); // Tint player red

        // 2. Disable Player Temporarily
        player.setVelocity(0, 0);
        player.body.enable = false; // Turn off physics body temporarily

        // 3. Destroy the specific slip that hit the player
        slip.destroy();

        // 4. Restart the Scene after a short delay
        this.time.delayedCall(300, () => {
            // Scene restart handles cleanup like clearing tint and re-enabling body
            this.scene.restart(); // Restart the current scene
        }, [], this);
    }
    // --- END OF MODIFIED METHOD ---


    // --- Other Logic ---

    defeatBoss(boss) {
        console.log('Boss defeated!');
        this.cameras.main.shake(500, 0.01); // Dramatic effect

        // Stop boss actions immediately
        if (this.bossMoveTimer) this.bossMoveTimer.remove();
        if (this.bossTimer) this.bossTimer.remove(); // Stop shooting slips

        boss.setVelocity(0, 0); // Stop movement
        boss.anims.stop(); // Stop any animations if the boss had them
        boss.body.setAllowGravity(true); // Let the boss fall
        boss.body.setVelocityY(150); // Give a slight downward push

        // Remove all existing slips
        this.detentionSlips.clear(true, true); // Destroy children and remove from scene

        // Optional: Delay boss destruction for falling animation
        this.time.delayedCall(2000, () => {
            // Check if boss still exists before destroying (it might have been destroyed by other means)
            if (boss && boss.active) boss.destroy();
        }, [], this);

        // Add win condition logic here (e.g., show win screen, next level)
    }
}

// --- Game Configuration ---
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false // Set to true for physics debugging visuals
        }
    },
    scene: [GameScene] // Use the class here
};

// --- Start Game ---
const game = new Phaser.Game(config);