// Define the Player Select Scene
class PlayerSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayerSelectScene' });
    }

    preload() {
        // Load assets needed for the selection screen ITSELF
        this.load.image('selectBackground', 'assets/MyCC-Logo-Red-Keyline-Transparent.png'); // Example: Background for this screen
        this.load.image('player1_icon', 'assets/lily_icon.png'); // Example: Icon for player 1
        this.load.image('player2_icon', 'assets/violet_icon.png'); // Example: Icon for player 2

        // *** Important: Preload assets for the NEXT scene (MainGameScene) here ***
        // This avoids loading delays when switching scenes.
        this.load.image('background', 'assets/stage1_background.jpg');
        this.load.image('bossSprite', 'assets/boss.png');
        this.load.image('slipSprite', 'assets/detention.png');

        // Load ALL potential player spritesheets
        this.load.spritesheet('player', 'assets/animationsL.png', {
            frameWidth: 190,
            frameHeight: 249
        });
        this.load.spritesheet('player2', 'assets/animationsV.png', { // Assuming you have this file
            frameWidth: 150, // Assuming same dimensions
            frameHeight: 260
        });
    }

    create() {
        // Add background for selection screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'selectBackground');

        // Add title text
        this.add.text(this.scale.width / 2, 100, 'Select Your Character', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // --- Option 1: Player 1 ---
        const player1Button = this.add.image(this.scale.width / 2 - 150, this.scale.height / 2, 'player1_icon')
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                console.log('Selected Player 1');
                // Store selected player and go to map screen
                this.selectedPlayerKey = 'player';
                this.scene.start('MapTransitionScene', { characterKey: 'player' });
            });

        this.add.text(player1Button.x, player1Button.y + player1Button.height / 2 + 20, 'Player 1 - Lily', {
             fontSize: '24px', fill: '#fff'
        }).setOrigin(0.5);


        // --- Option 2: Player 2 ---
        const player2Button = this.add.image(this.scale.width / 2 + 150, this.scale.height / 2, 'player2_icon')
             .setInteractive({ useHandCursor: true })
             .on('pointerdown', () => {
                console.log('Selected Player 2');
                // Store selected player and go to map screen
                this.selectedPlayerKey = 'player2';
                this.scene.start('MapTransitionScene', { characterKey: 'player2' });
             });

         this.add.text(player2Button.x, player2Button.y + player2Button.height / 2 + 20, 'Player 2 - Violet', {
              fontSize: '24px', fill: '#fff'
         }).setOrigin(0.5);

        // Add more characters similarly...
    }

    // No update needed for this simple scene
    // update() {}
}

// Define the Main Game Scene (using your existing code, adapted)
class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
        this.player = null; // Use 'this' scope
        this.cursors = null;
        this.platforms = null;
        this.ground = null;
        this.background = null;
        this.boss = null;
        this.detentionSlips = null;
        this.bossTimer = null;
        this.selectedPlayerKey = 'player'; // Default key, will be overwritten
    }

    // Receive data from the previous scene (PlayerSelectScene)
    init(data) {
        console.log('Received data in MainGameScene:', data);
        // Store the selected character key
        if (data && data.characterKey) {
             this.selectedPlayerKey = data.characterKey;
        }
         console.log('Using character key:', this.selectedPlayerKey);
    }

    // Preload is now handled by PlayerSelectScene to avoid re-loading
    preload() {
        console.log('MainGameScene preload');
        // Assets are preloaded in PlayerSelectScene
        // If you had MANY assets, you might put a loading bar here
        // based on the load progress from the previous scene, or
        // have this scene load its own assets if preferred.
    }

    // Create function adapted from your original code
    create() {
        console.log('MainGameScene create');
        // --- Animations ---
        // IMPORTANT: Define animations potentially based on the selected player
        // IF the frame numbers are different per character sheet, create specific keys like:
        // this.anims.create({ key: this.selectedPlayerKey + '_run', ... });
        // IF the frame numbers ARE THE SAME, you can keep generic keys:
        this.anims.create({
            key: 'run', // Generic key
            // Use frames from the CORRECT spritesheet using this.selectedPlayerKey
            frames: this.anims.generateFrameNumbers(this.selectedPlayerKey, { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: this.selectedPlayerKey, frame: 15 }], // Use correct key
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [{ key: this.selectedPlayerKey, frame: 17 }], // Use correct key
            frameRate: 10
        });

        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        // Background (using 'this' scope)
        this.background = this.add.tileSprite(0, 0, 3200, gameHeight, 'background').setOrigin(0);

        this.physics.world.setBounds(0, 0, 3200, gameHeight);
        this.cameras.main.setBounds(0, 0, 3200, gameHeight);
        this.cameras.main.setDeadzone(200, gameHeight);

        // Ground (using 'this' scope)
        this.ground = this.add.rectangle(1600, gameHeight - 1.5, 3200, 3);
        this.physics.add.existing(this.ground, true);

        // --- Create the player USING the selected character key ---
        this.player = this.physics.add.sprite(100, gameHeight - 120, this.selectedPlayerKey); // Use the key!
        this.player.setOrigin(0.5, 1);
        this.player.setScale(0.7);
        this.player.setCollideWorldBounds(true);

        // Input (using 'this' scope)
        this.cursors = this.input.keyboard.createCursorKeys();

        // Colliders (using 'this' scope)
        this.physics.add.collider(this.player, this.ground);

        this.cameras.main.startFollow(this.player, true, 0.3, 0.3);

        // --- Boss setup (using 'this' scope) ---
        this.boss = this.physics.add.sprite(1500, 300, 'bossSprite');
        this.boss.hitCounter = 5;
        this.boss.setScale(0.5);
        this.boss.setCollideWorldBounds(true);
        this.boss.body.setBounce(0); // Keep bounce if desired
        // Ensure boss has gravity disabled initially if needed - it looks like it is by default
        // this.boss.body.setAllowGravity(false); // Explicitly if needed
        this.boss.setVelocityX(100);


        // Boss movement timer (using 'this' scope for boss)
        this.time.addEvent({
            delay: 2500,
            callback: () => {
                if (this.boss && this.boss.body) { // Check using this.boss
                    this.boss.setVelocityX(this.boss.body.velocity.x * -1);
                }
            },
            loop: true,
        });

        // Detention slip group (using 'this' scope)
        this.detentionSlips = this.physics.add.group();

        // Boss behavior timer (using 'this' scope)
        this.bossTimer = this.time.addEvent({
            delay: 1500,
            callback: () => {
                 // Check if boss exists before creating slip
                 if (this.boss && this.boss.active) {
                    const slip = this.detentionSlips.create(this.boss.x, this.boss.y, 'slipSprite');
                    // Check if slip was created successfully before setting velocity
                    if (slip) {
                         slip.setVelocityX(-600);
                         slip.setVelocityY(0);
                         slip.body.setAllowGravity(false); // Make sure slips don't fall
                    }
                 }
            },
            loop: true,
        });


        // Overlap for stomping boss (using 'this' scope)
        this.physics.add.overlap(this.player, this.boss, () => {
            if (!this.boss || this.boss.hitCounter <= 0) {
                return;
            }

            this.boss.hitCounter -= 1;
            console.log(`Boss hit! Remaining hits: ${this.boss.hitCounter}`);
            this.player.setVelocityY(-300);

            if (this.boss.hitCounter <= 0) {
                this.cameras.main.shake(500, 0.01);
                this.boss.setVelocityX(0);

                // Use a variable for the timer if you need to cancel it
                 const fallTimer = this.time.delayedCall(100, () => {
                     // Check if boss still exists before applying gravity
                     if (this.boss && this.boss.body) {
                        this.boss.body.setAllowGravity(true);
                        this.boss.body.setVelocityY(100); // Adjust fall speed if needed
                     }
                 });


                // Use a variable for the timer if you need to cancel it
                const destroyTimer = this.time.delayedCall(1500, () => {
                     if (this.boss) {
                        this.boss.destroy();
                        this.boss = null;
                        console.log('Boss defeated!');
                        // Transition to map screen
                        this.scene.start('MapTransitionScene');
                     }
                     if (this.detentionSlips) {
                         this.detentionSlips.clear(true, true);
                     }
                     if (this.bossTimer) {
                        this.bossTimer.remove();
                        this.bossTimer = null;
                     }
                });
            }
        });

        // Collision with detention slips (using 'this' scope)
        this.physics.add.collider(this.player, this.detentionSlips, (playerHit, slip) => {
             console.log('Player hit by a detention slip!');
             slip.destroy(); // Destroy the slip on collision
             
             // Add visual feedback for the hit
             this.cameras.main.shake(100, 0.01);
             
             // Add a brief invulnerability period
             this.player.setTint(0xff0000); // Flash red
             this.time.delayedCall(200, () => {
                 this.player.clearTint();
             });
             
             // Add game over logic here if needed
             // For example:
             // this.scene.restart();
        }, null, this);

        // Ensure proper physics body configuration
        this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.8);
        this.player.body.setOffset(this.player.width * 0.2, this.player.height * 0.1);

        // Collider between boss and ground (using 'this' scope)
        this.physics.add.collider(this.boss, this.ground);

        // Collider between slips and ground (optional: destroy slips hitting ground)
        this.physics.add.collider(this.detentionSlips, this.ground, (slip, ground) => {
            slip.destroy(); // Destroy slips when they hit the ground
        });
    }

    // Update function adapted from your original code
    update() {
        // Check if player exists before controlling
        if (!this.player || !this.player.body) {
            return; // Exit if player is destroyed or not ready
        }

        // Handle player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
            this.player.anims.play('run', true); // Use generic animation key
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
            this.player.anims.play('run', true); // Use generic animation key
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
            // Only play idle if ON the ground, otherwise might look weird mid-air
             if (this.player.body.touching.down) {
                 this.player.anims.play('idle', true); // Use generic animation key
             }
        }

        // Handle jumping
        // Check if player is on the ground before allowing jump
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-400);
            this.player.anims.play('jump', true); // Use generic animation key
        }

        // Update background scrolling
        if (this.background) {
            this.background.tilePositionX = this.cameras.main.scrollX;
        }

        // Flip boss sprite based on direction (optional visual enhancement)
        if (this.boss && this.boss.body) {
             if (this.boss.body.velocity.x < 0) {
                 this.boss.flipX = true; // Facing left
             } else if (this.boss.body.velocity.x > 0) {
                 this.boss.flipX = false; // Facing right
             }
        }

         // Optional: Remove slips that go off-screen to the left
         if (this.detentionSlips) {
             this.detentionSlips.children.each(slip => {
                 if (slip && slip.x < this.cameras.main.scrollX - slip.width) {
                     slip.destroy();
                 }
             });
         }
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
        // Add map background
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'mapBackground')
            .setScale(0.8);

        // Get the selected character from the previous scene
        const characterKey = this.scene.settings.data.characterKey;

        // Add stage icons with proper scaling and positioning
        const stage1 = this.add.image(this.scale.width / 2 - 200, this.scale.height / 2, 'stage1')
            .setScale(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('MainGameScene', { characterKey: characterKey });
            });

        const stage2 = this.add.image(this.scale.width / 2 + 200, this.scale.height / 2, 'stage2')
            .setScale(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Stage2Scene', { characterKey: characterKey });
            });

        // Add text with adjusted positioning
        this.add.text(this.scale.width / 2, 100, 'Select Your Stage', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(stage1.x, stage1.y + 80, 'Stage 1', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.add.text(stage2.x, stage2.y + 80, 'Stage 2', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
    }
}

class Stage2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Stage2Scene' });
        this.player = null;
        this.cursors = null;
        this.platforms = null;
        this.ground = null;
        this.background = null;
        this.selectedPlayerKey = 'player'; // Default value
    }

    // Receive data from the previous scene
    init(data) {
        console.log('Received data in Stage2Scene:', data);
        if (data && data.characterKey) {
            this.selectedPlayerKey = data.characterKey;
        }
        console.log('Using character key:', this.selectedPlayerKey);
    }

    preload() {
        // Load stage 2 specific assets
        this.load.image('stage2Background', 'assets/stage2_background.jpg');
        this.load.image('platform', 'assets/platform.png');
    }

    create() {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        // --- Animations ---
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

        // Background
        this.background = this.add.tileSprite(0, 0, 3200, gameHeight, 'stage2Background')
            .setOrigin(0);

        this.physics.world.setBounds(0, 0, 3200, gameHeight);
        this.cameras.main.setBounds(0, 0, 3200, gameHeight);
        this.cameras.main.setDeadzone(200, gameHeight);

        // Ground (adjusted height)
        this.ground = this.add.rectangle(1600, gameHeight - 1.5, 3200, 3);
        this.physics.add.existing(this.ground, true);

        // Player (using the selected character)
        this.player = this.physics.add.sprite(100, gameHeight - 120, this.selectedPlayerKey);
        this.player.setOrigin(0.5, 1);
        this.player.setScale(0.7);
        this.player.setCollideWorldBounds(true);
        
        // Set up player physics body
        this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.8);
        this.player.body.setOffset(this.player.width * 0.2, this.player.height * 0.1);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Colliders
        this.physics.add.collider(this.player, this.ground);

        // Stage 2 Boss setup
        this.boss = this.physics.add.sprite(1500, gameHeight - 200, 'bossSprite');
        this.boss.hitCounter = 8;
        this.boss.setScale(0.5);
        this.boss.setCollideWorldBounds(true);
        this.boss.setVelocityX(250);
        this.boss.attackRange = 400;
        this.boss.roamingRange = { min: 800, max: 2200 };
        this.boss.canJump = true;

        // Boss movement and attack pattern
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.boss && this.boss.body) {
                    // Random jump (20% chance)
                    if (this.boss.canJump && Phaser.Math.Between(1, 100) <= 20) {
                        this.boss.setVelocityY(-400);
                        this.boss.canJump = false;
                        this.time.delayedCall(2000, () => {
                            if (this.boss) this.boss.canJump = true;
                        });
                    }

                    const distanceToPlayer = Phaser.Math.Distance.Between(
                        this.boss.x, this.boss.y,
                        this.player.x, this.player.y
                    );

                    if (distanceToPlayer < this.boss.attackRange) {
                        this.boss.setVelocityX(this.boss.body.velocity.x * 1.5);
                        this.time.delayedCall(500, () => {
                            if (this.boss && this.boss.body) {
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
            },
            loop: true,
        });

        // Boss ground collision
        this.physics.add.collider(this.boss, this.ground, () => {
            if (this.boss) this.boss.setVelocityY(0);
        });

        this.cameras.main.startFollow(this.player, true, 0.3, 0.3);
    }

    update() {
        if (!this.player || !this.player.body) return;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
            this.player.anims.play('run', true);
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
            this.player.anims.play('run', true);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
            if (this.player.body.touching.down) {
                this.player.anims.play('idle', true);
            }
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-400);
            this.player.anims.play('jump', true);
        }

        if (this.background) {
            this.background.tilePositionX = this.cameras.main.scrollX;
        }
    }
}

// --- Original Config Modified ---
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 768,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    // Define ALL scenes in the game configuration
    scene: [PlayerSelectScene, MainGameScene, MapTransitionScene, Stage2Scene] // PlayerSelectScene will run first by default
};

// Start the game
const game = new Phaser.Game(config);

// Remove the old global functions (preload, create, update)
// function preload() { ... } // DELETE or comment out
// function create() { ... } // DELETE or comment out
// function update() { ... } // DELETE or comment out