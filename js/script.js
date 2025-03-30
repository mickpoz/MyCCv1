let player;
let cursors;
let platforms;
let ground;
let background; // Variable for the tileable background

const config = {
    type: Phaser.AUTO,
    width: 1200, // Adjusted game width
    height: 768, // Adjusted game height
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false // Disable debugging
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Load game assets
    this.load.image('background', 'assets/background3.jpg'); // Replace with a tileable background
    this.load.image('bossSprite', 'assets/boss.png');
    this.load.image('slipSprite', 'assets/detention.png');
    this.load.spritesheet('player', 'assets/animations.png', {
        frameWidth: 190, // Width of each frame
        frameHeight: 249 // Height of each frame
    });
}

function create() {
    // Animations
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }), // Adjust start & end based on your sprite sheet
        frameRate: 8, // Frames per second
        repeat: -1 // Loop animation
    });
    
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'player', frame: 15 }], // Single frame for idle
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'jump',
        frames: [{ key: 'player', frame: 17 }], // Single frame for jump
        frameRate: 10
    });

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    // Add a tileSprite for the background
    background = this.add.tileSprite(
        0, 0,
        3200, this.scale.height, // Match the viewport dimensions
        'background'
    ).setOrigin(0);
    
    // Expand the world and camera bounds
    this.physics.world.setBounds(0, 0, 3200, this.scale.height); // Increase world width
    this.cameras.main.setBounds(0, 0, 3200, this.scale.height); // Match camera bounds    
    this.cameras.main.setDeadzone(200, this.scale.height);

    // Create the ground as a static rectangle
    const groundHeight = 3;
    ground = this.add.rectangle(
        3200 / 2, // Center it in the expanded world
        gameHeight - groundHeight / 2, // Position near the bottom
        3200, // Match world width
        groundHeight
    );
    this.physics.add.existing(ground, true); // Add physics and make it static

    // Create a player sprite
    player = this.physics.add.sprite(100, gameHeight - 120, 'player'); // Adjusted spawn position
    player.setOrigin(0.5, 1);
    player.setScale(0.7);
    player.setCollideWorldBounds(true); // Prevent player from leaving the screen

    // Enable keyboard input
    cursors = this.input.keyboard.createCursorKeys();

    // Add collision between player and ground
    this.physics.add.collider(player, ground);

    // Make the camera follow the player
    this.cameras.main.startFollow(player, true, 0.3, 0.3);

    // Create Boss
    this.boss = this.physics.add.sprite(1500, 300, 'bossSprite');
    this.boss.hitCounter = 5;
    this.boss.setScale(0.5);
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setBounce(0);
    this.boss.setVelocityX(100);

    // Boss movement timer
    this.time.addEvent({
        delay: 2500, // Change direction every 2 seconds
        callback: () => {
            // Check if the boss still exists before changing its velocity
            if (this.boss && this.boss.body) {
                this.boss.setVelocityX(this.boss.body.velocity.x * -1); // Reverse direction
            }
        },
        loop: true,
    });
    

    // Detention slip group
    this.detentionSlips = this.physics.add.group();

    // Boss behavior
    this.bossTimer = this.time.addEvent({
        delay: 1500, // Throws slips every second
        callback: () => {
            const slip = this.detentionSlips.create(this.boss.x, this.boss.y, 'slipSprite');
            slip.setVelocityX(-600); // Make slips fly straight horizontally
            slip.setVelocityY(0); // No vertical motion
        },
        loop: true,
    });

    // Overlap for stomping boss
    this.physics.add.overlap(player, this.boss, () => {
        // Prevent hits if the boss is already defeated
        if (this.boss.hitCounter <= 0) {
            return; // Exit the overlap callback immediately
        }
    
        // Reduce the boss's health
        this.boss.hitCounter -= 1;
        console.log(`Boss hit! Remaining hits: ${this.boss.hitCounter}`);
        player.setVelocityY(-300); // Player bounces after hitting the boss
    
        // Check if the boss is defeated
        if (this.boss.hitCounter <= 0) {
            // Screen shake for dramatic effect
            this.cameras.main.shake(500, 0.01);
    
            // Stop boss movement and make it fall
            this.boss.setVelocityX(0); // Stop horizontal movement
            this.time.delayedCall(100, () => {
                this.boss.body.setAllowGravity(true); // Enable gravity
                this.boss.body.setVelocityY(100); // Slow fall
            });
    
            // Destroy the boss after it falls
            this.time.delayedCall(1500, () => {
                this.boss.destroy(); // Remove the boss
                console.log('Boss defeated!');
                this.detentionSlips.clear(true, true); // Remove all detention slips
                if (this.bossTimer) this.bossTimer.remove(); // Stop slip spawning
            });
        }
    });  
    

    // Collision with detention slips
    this.physics.add.collider(player, this.detentionSlips, () => {
        console.log('Player hit by a detention slip!');
    });
}

function update() {
    // Handle player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
        player.anims.play('run', true);
        player.flipX = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
        player.anims.play('run', true);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
        player.anims.play('idle', true);
    }

    // Handle jumping
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-400);
        player.anims.play('jump', true);
    }

    // Scroll the background with the camera
    background.tilePositionX = this.cameras.main.scrollX;
}
