// Credits:
// http://www.gamedevacademy.org/html5-phaser-tutorial-spacehipster-a-space-exploration-game/
// http://www.joshmorony.com/how-to-create-an-animated-character-using-sprites-in-phaser/
// http://jschomay.tumblr.com/post/103568304133/tutorial-building-a-polished-html5-space-shooter
// http://ezelia.com/2014/tutorial-creating-basic-multiplayer-game-phaser-eureca-io

HouseNotHome.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called 'world' or you'll over-write the world reference.
};

HouseNotHome.Game.prototype = {

    // Runs once at start of game
    create: function () {

        // Generate in order of back to front
        var worldSize = 1920; // 1920;
        this.game.world.setBounds(0, 0, worldSize, worldSize);

        this.background = this.game.add.tileSprite(0, 0, this.game.world.width / 2, this.game.world.height / 2, 'tiles', 65);
        this.background.scale.setTo(2);

        this.generateGrid(worldSize);

        // Initialize data
        this.notification = '';
        this.spellCooldown = 0;
        this.taxCooldown = 0;
        this.gold = 0;
        this.xp = 0;
        this.howBig = 2;
        this.xpToNext = 20;
        this.goldForBoss = 5000;
        this.bossSpawned = false;
        this.bossColorIndex = 0;
        this.hasPlayground = false;
        this.hasChildren = false;
        this.hasParents = false;
        this.hasGrandparents = false;
        // Generate objects
        this.generateObstacles();
        this.generateCollectables();

        this.corpses = this.game.add.group();

        // Generate player and set camera to follow
        this.player = this.generatePlayer();
        this.game.camera.follow(this.player);

        this.playerAttacks = this.generateAttacks('sword', 1);
        this.playerSpells = this.generateAttacks('spell', 1);
        this.bossAttacks = this.generateAttacks('spellParticle', 5,2000, 300);
        this.bossAttacks = this.generateAttacks('fireball', 1, 2000, 300);

        // Generate enemies - must be generated after player and player.level
        this.generateEnemies(300);

        // Generate bosses
        this.bosses = this.game.add.group();
        this.bosses.enableBody = true;
        this.bosses.physicsBodyType = Phaser.Physics.ARCADE;

        // Music
		this.music = this.game.add.audio('overworldMusic');
		this.music.loop = true;
		this.music.play();

        // Sound effects
        this.generateSounds();

        // Set the controls
        this.controls = {
            up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
           // touchit: this.game.input.touch.onTouchStart,
            left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
            down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
            right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
            spell: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        };

        // Set the camera
        this.showLabels();
    },

    // Checks for actions and changes
    update: function () {

        this.playerHandler();
        this.enemyHandler();
        this.bossHandler();
        this.collisionHandler();

        this.collectables.forEachDead(function(collectable) {
            collectable.destroy();
        });

        //this.notificationLabel.text = this.notification;
       // this.xpLabel.text = 'Lvl. ' + this.player.level + ' - ' + this.xp + ' XP / ' + this.xpToNext + ' XP';
        this.goldLabel.text = this.gold + ' Gold';
       // this.healthLabel.text = this.player.health + ' / ' + this.player.vitality;
        // if (this.hasPlayground == true) {
        //     this.itemLabel.text = 'Playground: Yes';
        // } else {
        //     this.itemLabel.text = 'Playground: No';
        // }
    },

    playerHandler: function() {

        if (this.player.alive) {
            this.playerMovementHandler();

            // Attack towards mouse click
            if (this.game.input.activePointer.isDown) {
              //  this.playerAttacks.rate = 1000 - (this.player.speed * 4);
               //     if (this.playerAttacks.rate < 200) {
               //         this.playerAttacks.rate = 200;
                //    }
              //  this.playerAttacks.range = this.player.strength * 3;
              //  this.attack(this.player, this.playerAttacks);
            }
            if(this.game.time.now > this.taxCooldown){
                this.taxCooldown = this.game.time.now + 1000;
                if(this.gold > 0){
                    this.gold = this.gold - 10;
                }

            }


            // Use spell when spacebar is pressed
            // if (this.game.time.now > this.spellCooldown) {
            // this.spellLabel.text = "READY!";

            //     if (this.controls.spell.isDown) {
            //         this.playerSpells.rate = 5000;
            //         this.playerSpells.range = this.player.strength * 6;
            //         this.attack(this.player, this.playerSpells);
            //         this.spellCooldown = this.game.time.now + 5000;
            //     }
            // } else {
            //     this.spellLabel.text = "RECHARGING...";
            // }

            // if (this.player.health > this.player.vitality) {
            //     this.player.health = this.player.vitality;
            // }

            // if (this.xp >= this.xpToNext) {
            //     this.levelUp();
            // }
        }

      //  if (!this.player.alive) {
       //     this.deathHandler(this.player);
        //    this.game.time.events.add(1000, this.gameOver, this);
       // }
    },

    enemyHandler: function() {

        this.enemies.forEachAlive(function(enemy) {
            if (enemy.visible && enemy.inCamera) {
                if(enemy.name == 'Spider' &&  this.gold == 0){
                    this.game.physics.arcade.moveToObject(enemy, this.player, enemy.speed);

                } else if  //parent -> playground -> child -> grandparent -> pet
                    (  (enemy.name == 'Parent') //no prereq
                        //playground location is taken care of in collect() function
                    || (enemy.name == 'Child' && this.hasPlayground)
                    || (enemy.name == 'Grandparent' && this.hasParents)
                    || (enemy.name == 'Pet' && this.hasGrandparents)
                    )
                {
                    if(!enemy.collected) { //if this house-item has not been collected yet
                        this.game.physics.arcade.moveToObject(enemy, this.player, enemy.speed)
                    } else { //this house-item has been collected already. display with player at clump-location
                        enemy.position.x = this.player.position.x + enemy.xdiff;
                        enemy.position.y = this.player.position.y + enemy.ydiff;
                        enemy.speed = 0;
                    }
                } else {
                 this.game.physics.arcade.moveFromObject(enemy, this.player, enemy.speed)
                }
                this.enemyMovementHandler(enemy);
            }

        }, this);

        this.enemies.forEachDead(function(enemy) {
            if (this.rng(0, 5)) {
                this.generateGold(enemy);
            } else if (this.rng(0, 2)) {
                this.generatePotion(enemy);
                this.notification = 'The ' + enemy.name + ' dropped a potion!';
            }
            this.xp += enemy.reward;
            this.generateEnemy(this.enemies);
            this.deathHandler(enemy);
        }, this);
    },

    bossHandler: function() {

        // Spawn boss if player obtains enough gold
        if (this.gold > this.goldForBoss && !this.bossSpawned) {
            this.bossSpawned = true;
            this.goldForBoss += 5000;
            var boss = this.generateDragon(this.bossColorIndex);
            this.dragonSound.play();
            this.notification = 'A ' + boss.name + ' appeared!';
        }

        this.bosses.forEachAlive(function(boss) {
            if (boss.visible && boss.inCamera) {
                this.game.physics.arcade.moveToObject(boss, this.player, boss.speed)
                this.enemyMovementHandler(boss);
                this.attack(boss, this.bossAttacks);
            }
        }, this);

        this.bosses.forEachDead(function(boss) {;
            this.bossSpawned = false;
            if (this.bossColorIndex === 7) {
                 this.bossColorIndex = 0;
            } else {
                this.bossColorIndex++;
            }

            this.generateGold(boss);
            this.generateChest(boss);
            this.generateVitalityPotion(boss);
            this.generateStrengthPotion(boss);
            this.generateSpeedPotion(boss);
            this.notification = 'The ' + boss.name + ' dropped a potion!';
            this.xp += boss.reward;

            // Make the dragon explode
            var emitter = this.game.add.emitter(boss.x, boss.y, 100);
            emitter.makeParticles('flame');
            emitter.minParticleSpeed.setTo(-200, -200);
            emitter.maxParticleSpeed.setTo(200, 200);
            emitter.gravity = 0;
            emitter.start(true, 1000, null, 100);

            boss.destroy();

        }, this);
    },

    collisionHandler: function() {
      //  this.game.physics.arcade.overlap(this.enemies, this.player,this.hit, null, this);
       // this.game.physics.arcade.overlap(this.player, this.enemies, this.hit, null, this);
       // this.game.physics.arcade.collide(this.player, this.bosses, this.hit, null, this);
       // this.game.physics.arcade.collide(this.player, this.bossAttacks, this.hit, null, this);

       // this.game.physics.arcade.collide(this.bosses, this.playerAttacks, this.hit, null, this);
       // this.game.physics.arcade.collide(this.enemies, this.playerAttacks, this.hit, null, this);
       // this.game.physics.arcade.overlap(this.bosses, this.playerAttacks, this.hit, null, this);
       // this.game.physics.arcade.overlap(this.enemies, this.playerAttacks, this.hit, null, this);

       //  this.game.physics.arcade.collide(this.bosses, this.playerSpells, this.hit, null, this);
       // this.game.physics.arcade.collide(this.enemies, this.playerSpells, this.hit, null, this);
       // this.game.physics.arcade.overlap(this.bosses, this.playerSpells, this.hit, null, this);
        // this.game.physics.arcade.overlap(this.enemies, this.playerSpells, this.hit, null, this);

         this.game.physics.arcade.collide(this.obstacles, this.player, null, null, this);
         this.game.physics.arcade.collide(this.obstacles, this.playerAttacks, null, null, this);
        this.game.physics.arcade.collide(this.obstacles, this.enemies, null, null, this);

       // this.game.physics.arcade.collide(this.collectables, this.player, this.collect, null, this);

        this.game.physics.arcade.overlap(this.collectables, this.player, this.collect, null, this);

        this.game.physics.arcade.overlap(this.enemies, this.player, this.collect, null, this);
    },

    showLabels: function() {

        var text = '0';
       // style = { font: '10px Arial', fill: '#fff', align: 'center' };
       // this.notificationLabel = this.game.add.text(25, 25, text, style);
       // this.notificationLabel.fixedToCamera = true;

     //   style = { font: '10px Arial', fill: '#ffd', align: 'center' };
      //  this.xpLabel = this.game.add.text(25, this.game.height - 25, text, style);
       // this.xpLabel.fixedToCamera = true;


         //complains when deleted
       // style = { font: '20px Arial', fill: '#f00', align: 'center' };
       // this.healthLabel = this.game.add.text(225, this.game.height - 50, text, style);
       // this.healthLabel.fixedToCamera = true;

       // style = { font: '10px Arial', fill: '#ffd', align: 'center' };
       // this.itemLabel = this.game.add.text(125, this.game.height - 50, text, style);
        //this.itemLabel.fixedToCamera = true;

        var style = { font: '10px Arial', fill: '#fff', align: 'center' };
        this.goldLabel = this.game.add.text(this.game.width - 75, this.game.height - 25, text, style);
        this.goldLabel.fixedToCamera = true;

       // var style = { font: '10px Arial', fill: '#fff', align: 'center' };
       // this.spellLabel = this.game.add.text(230, this.game.height - 25, text, style);
        //this.spellLabel.fixedToCamera = true;
    },

    levelUp: function() {

        this.player.level++;
        this.player.vitality += 5;
        this.player.health += 5;
        this.player.strength += 1;
        this.player.speed += 1;
        this.xp -= this.xpToNext;
        this.xpToNext = Math.floor(this.xpToNext * 1.1);
        this.notification = this.player.name + ' has advanced to level ' + this.player.level + '!';
        this.levelSound.play();
        var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
        emitter.makeParticles('levelParticle');
        emitter.minParticleSpeed.setTo(-200, -200);
        emitter.maxParticleSpeed.setTo(200, 200);
        emitter.gravity = 0;
        emitter.start(true, 1000, null, 100);
    },

    attack: function (attacker, attacks) {

        if (attacker.alive && this.game.time.now > attacks.next && attacks.countDead() > 0) {
            attacks.next = this.game.time.now + attacks.rate;
            var a = attacks.getFirstDead();
            a.scale.setTo(1.5);
            a.name = attacker.name;
            a.strength = attacker.strength;
            a.reset(attacker.x + 16, attacker.y + 16);
            a.lifespan = attacks.rate;
            console.log(attacker.name + " used " + attacks.name + "!");
            if (attacks.name === 'sword') {
                a.rotation = this.game.physics.arcade.moveToPointer(a, attacks.range);
                this.attackSound.play();
            } else if (attacks.name === 'spell') {
                a.rotation = this.game.physics.arcade.moveToPointer(a, attacks.range);
                a.effect = 'spell';
                a.strength *= 3;
                this.fireballSound.play();
            } else if (attacks.name === 'fireball') {
                a.rotation = this.game.physics.arcade.moveToObject(a, this.player, attacks.range);
                this.fireballSound.play();
            }
        }
    },

    generateAttacks: function (name, amount, rate, range) {

        // Generate the group of attack objects
        var attacks = this.game.add.group();
        attacks.enableBody = true;
        attacks.physicsBodyType = Phaser.Physics.ARCADE;
        attacks.createMultiple(amount, name);

        if (name === 'spell') {
            attacks.callAll('animations.add', 'animations', 'particle', [0, 1, 2, 3,4 ,5], 10, true);
            attacks.callAll('animations.play', 'animations', 'particle');
        } else if (name === 'fireball') {
            attacks.callAll('animations.add', 'animations', 'particle', [0, 1, 2, 3], 10, true);
            attacks.callAll('animations.play', 'animations', 'particle');
        }

        attacks.setAll('anchor.x', 0.5);
        attacks.setAll('anchor.y', 0.5);
        attacks.setAll('outOfBoundsKill', true);
        attacks.setAll('checkWorldBounds', true);

        attacks.rate = rate;
        attacks.range = range;
        attacks.next = 0;
        attacks.name = name;

        return attacks;
    },

    hit: function (target, attacker) {

        if (this.game.time.now > target.invincibilityTime) {
            target.invincibilityTime = this.game.time.now + target.invincibilityFrames;
            target.damage(attacker.strength)
            if (target.health < 0) {
                target.health = 0;
            }
            this.playSound(target.name);
            this.notification = attacker.name + ' caused ' + attacker.strength + ' damage to ' + target.name + '!';

            if (attacker.effect === 'spell') {
                var emitter = this.game.add.emitter(attacker.x, attacker.y, 100);
                emitter.makeParticles('spellParticle');
                emitter.minParticleSpeed.setTo(-200, -200);
                emitter.maxParticleSpeed.setTo(200, 200);
                emitter.gravity = 0;
                emitter.start(true, 1000, null, 100);
            }
        }
    },

    deathHandler: function (target) {

        var corpse = this.corpses.create(target.x, target.y, 'dead')
        corpse.scale.setTo(2);
        corpse.animations.add('idle', [target.corpseSprite], 0, true);
        corpse.animations.play('idle');
        corpse.lifespan = 3000;
        target.destroy();
    },

    collect: function(player, collectable) {
        collectable.health = 0;

        //this section is needed since playground isn't handled in enemyHandler
        if (collectable.collected && collectable.name === 'playground') {
            collectable.position.x = this.player.position.x + collectable.xdiff;
            collectable.position.y = this.player.position.y + collectable.ydiff;
        }

        //only allow 'collected=true' if prerequisite is satisfied, otherwise do nothing
        var hasPrerequisite = true;
        //parent has no prereq
        if ((collectable.name == 'playground' && !this.hasParents) //playground-chest needs slime-parents
        ||  (collectable.name == 'Child' && !this.hasPlayground) //child-bat needs playground
        ||  (collectable.name == 'Grandparent' && !this.hasChildren) //grandparent-skeleton needs child-bat
        ||  (collectable.name == 'Pet' && !this.hasGrandparents)) { //ghost-pet needs grandparent-skeleton
            hasPrerequisite = false;
        }

        //this should only be called once per object, the first time you collect while having any prereq
        if (!collectable.collected && hasPrerequisite) {
            collectable.collected = true;

            //if is House-item-prequisite, set xydiff for House-clump-cluster-positioning
            if (collectable.name == 'playground'
                || collectable.name == 'Parent'
                || collectable.name == 'Child'
                || collectable.name == 'Grandparent'
                || collectable.name == 'Pet')
            {
                collectable.xdiff =  (collectable.position.x - this.player.position.x) * 0.5;
                collectable.ydiff =  (collectable.position.y - this.player.position.y) * 0.5;
                collectable.speed = 0;
            }

            var gain;
            if (collectable.name === 'gold') {
                gain = this.player.level + Math.floor(Math.random() * 10);
                this.gold += collectable.value;
                this.goldSound.play();
                this.notification = 'You pick up ' + collectable.value + ' gold.';
                collectable.destroy();
            }
            else if (collectable.name === 'playground') { //prereq is assumed from earlier prereq-check
                this.hasPlayground = true;
                //this.gold -= collectable.value;
            }
            else if ( collectable.name === 'Child'){ //} && this.hasPlayground){ //prereq is assumed from earlier prereq-check
                this.hasChildren = true;
                //this.gold -= collectable.value;
            } else if ( collectable.name === 'Parent') { //no-prereq is assumed from earlier prereq-check
                this.hasParents = true;
                //this.gold -= collectable.value;
            } else if ( collectable.name === 'Grandparent') { //child-prereq is assumed from earlier prereq-check
                this.hasGrandparents = true;
                //this.gold -= collectable.value;
            } else if ( collectable.name === 'Pet') { //grandparent-prereq is assumed from earlier prereq-check
                //this.hasPet = true;
                //this.gold -= collectable.value;
            /////////////////////////////////////
            } else if (  collectable.name === 'Kidnapper' && this.hasPlayground){
                this.hasChildren = false;
                // The child should be destroyed here, but I don't know how...
                // this.enemies.forEachDead(destroyIfDead(enemy));
                //for (let child in children//////////////////////////////////////////////////////)
                //this.gold -= collectable.value;
            } else if (  collectable.name === 'Spider'){
                //this.hasPets = true; // This doesn't exist yet
                this.gameOver();
            } else if (collectable.name === 'chest') {
                collectable.animations.play('open');
                this.gold += collectable.value;
                this.goldSound.play();
                this.notification = 'You open a chest and find ' + collectable.value + ' gold!';
                collectable.lifespan = 1000;
               // console.log("about to grow")
                //console.log("growing to" + this.howBig+2);
                //this.player.scale.setTo(6);
                //this.howBig +=  (0.2)/(Math.sqrt(this.howBig)) ;
                //this.player.scale.setTo(this.howBig);
            } else if (collectable.name === 'healthPotion') {
                player.health += collectable.value;
                this.notification = 'You consume a potion, healing you for ' + collectable.value + ' health.';
                this.potionSound.play();
                collectable.destroy();
            } else if (collectable.name === 'vitalityPotion') {
                player.vitality += collectable.value;
                this.notification = 'You consume a potion, increasing your vitality by ' + collectable.value + '!';
                this.potionSound.play();
                collectable.destroy();
            } else if (collectable.name === 'strengthPotion') {
                player.strength += collectable.value;
                this.notification = 'You consume a potion, increasing your strength by ' + collectable.value + '!';
                this.potionSound.play();
                collectable.destroy();
            } else if (collectable.name === 'speedPotion') {
                player.speed += collectable.value;
                this.notification = 'You consume a potion, increasing your speed by  ' + collectable.value + '!';
                this.potionSound.play();
                collectable.destroy();
            }
            else{ //enemies
                this.howBig +=  (0.2)/(Math.sqrt(this.howBig)) ;
                this.player.scale.setTo(this.howBig);

            }

        }
    },


    setStats: function (entity, name, health, speed, strength, reward, corpseSprite) {

        entity.animations.play('down');
        entity.scale.setTo(2);

        entity.body.collideWorldBounds = true;
        entity.body.velocity.x = 0,
        entity.body.velocity.y = 0,
        entity.alive = true;

        entity.name = name;
        entity.level = this.player.level;
        entity.health = health + (entity.level * 2);
        entity.speed = speed + Math.floor(entity.level * 1.5);;
        entity.strength = strength + Math.floor(entity.level * 1.5);;
        entity.reward = reward + Math.floor(entity.level * 1.5);

        entity.invincibilityFrames = 300;
        entity.invincibilityTime = 0;

        entity.corpseSprite = corpseSprite;

        return entity;
    },





    generatePlayer: function () {

        // Generate the player
        var player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'characters');
        //var influence = this.game.add.sprite(this.game.world.centerX - (5*8), this.game.world.centerY - (5*8), 'characters');
        // Loop through frames 3, 4, and 5 at 10 frames a second while the animation is playing
        player.animations.add('down', [3, 4, 5], 10, true);
        player.animations.add('left', [15, 16, 17], 10, true);
        player.animations.add('right', [27, 28, 29], 10, true);
        player.animations.add('up', [39, 40, 41], 10, true);
        player.animations.play('down');
        player.scale.setTo(2);

       // influence.animations.add('down', [3, 4, 5], 10, true);
       // influence.animations.add('left', [15, 16, 17], 10, true);
       // influence.animations.add('right', [27, 28, 29], 10, true);
       // influence.animations.add('up', [39, 40, 41], 10, true);
       // influence.animations.play('down');
        //influence.scale.setTo(10);



        // Enable player physics;
        this.game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true
        player.alive = true;
       // influence.body.collideWorldBounds = false
       // this.game.physics.arcade.enable(influence);

        player.name = 'House';
        player.level = 1;

        player.health = 100;
        player.vitality = 100;
        player.strength = 25;
        player.speed = 125;

        player.invincibilityFrames = 500;
        player.invincibilityTime = 0;

        player.corpseSprite = 1;

        return player;
    },

    setStats: function (entity, name, health, speed, strength, reward, corpseSprite) {

        entity.animations.play('down');
        entity.scale.setTo(2);

        entity.body.collideWorldBounds = true;
        entity.body.velocity.x = 0,
        entity.body.velocity.y = 0,
        entity.alive = true;

        entity.name = name;
        entity.level = this.player.level;
        entity.health = health + (entity.level * 2);
        entity.speed = speed + Math.floor(entity.level * 1.5);;
        entity.strength = strength + Math.floor(entity.level * 1.5);;
        entity.reward = reward + Math.floor(entity.level * 1.5);

        entity.invincibilityFrames = 300;
        entity.invincibilityTime = 0;

        entity.corpseSprite = corpseSprite;

        return entity;
    },

    generateEnemies: function (amount) {

        this.enemies = this.game.add.group();

        // Enable physics in them
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;

        for (var i = 0; i < amount; i++) {
            this.generateEnemy();
        }
    },

    generateEnemy: function () {

        enemy = this.enemies.create(this.game.world.randomX, this.game.world.randomY, 'characters');

        do {
            enemy.reset(this.game.world.randomX, this.game.world.randomY);
        } while (Phaser.Math.distance(this.player.x, this.player.y, enemy.x, enemy.y) <= 400)

        var rnd = Math.random();
        if (rnd >= 0 && rnd < .3) enemy = this.generateSkeleton(enemy);
        else if (rnd >= .3 && rnd < .4) enemy = this.generateSlime(enemy);
        else if (rnd >= .4 && rnd < .6) enemy = this.generateBat(enemy);
        else if (rnd >= .6 && rnd < .7) enemy = this.generateGhost(enemy);
        else if (rnd >= .7 && rnd < .75) enemy = this.generateSpider(enemy);
        else if (rnd >= .75 && rnd < 1) enemy = this.generateKidnapper(enemy);

        console.log('Generated ' + enemy.name + ' with ' + enemy.health + ' health, ' + enemy.strength + ' strength, and ' + enemy.speed + ' speed.');

        return enemy;
    },

    generateSkeleton: function (enemy) {

        enemy.animations.add('down', [9, 10, 11], 10, true);
        enemy.animations.add('left', [21, 22, 23], 10, true);
        enemy.animations.add('right', [33, 34, 35], 10, true);
        enemy.animations.add('up', [45, 46, 47], 10, true);
        enemy.howBig = 2;
        enemy.value = 6;
         // setStats: function (entity, name, health, speed, strength, reward, corpseSprite)
        return this.setStats(enemy, 'Grandparent', 100, 5, 20, 5, 6);
    },

    generateSlime: function (enemy) {

        enemy.animations.add('down', [48, 49, 50], 10, true);
        enemy.animations.add('left', [60, 61, 62], 10, true);
        enemy.animations.add('right', [72, 73, 74], 10, true);
        enemy.animations.add('up', [84, 85, 86], 10, true);
        enemy.howBig = 1;
        enemy.value = 6;
        return this.setStats(enemy, 'Parent', 300, 5, 50, 10, 7);
    },

    generateBat: function (enemy) {

        enemy.animations.add('down', [51, 52, 53], 10, true);
        enemy.animations.add('left', [63, 64, 65], 10, true);
        enemy.animations.add('right', [75, 76, 77], 10, true);
        enemy.animations.add('up', [87, 88, 89], 10, true);
        enemy.howBig = 0;
        enemy.isCaptured = false;
        enemy.value = 6;
        return this.setStats(enemy, 'Child', 20, 5, 10, 2, 8);
    },

    generateGhost: function (enemy) {

        enemy.animations.add('down', [54, 55, 56], 10, true);
        enemy.animations.add('left', [66, 67, 68], 10, true);
        enemy.animations.add('right', [78, 79, 80], 10, true);
        enemy.animations.add('up', [90, 91, 92], 10, true);
        enemy.howBig = 3;
        enemy.value = 6;
        return this.setStats(enemy, 'Pet', 200, 5, 30, 7, 9);
    },

    generateSpider: function (enemy) {
          ///taxman
        enemy.animations.add('down', [57, 58, 59], 10, true);
        enemy.animations.add('left', [69, 70, 71], 10, true);
        enemy.animations.add('right', [81, 82, 83], 10, true);
        enemy.animations.add('up', [93, 94, 95], 10, true);
        enemy.howBig = 4;
        enemy.value = 6;
        return this.setStats(enemy, 'Spider', 50, 50, 12, 4, 10);
    },

    generateKidnapper: function (enemy) {
          ///taxman
        enemy.animations.add('down', [0, 1, 2], 10, true);
        enemy.animations.add('left', [12, 13, 14], 10, true);
        enemy.animations.add('right', [24, 25, 26], 10, true);
        enemy.animations.add('up', [36, 37, 38], 10, true);
        enemy.howBig = 4;
        enemy.value = 100;
        return this.setStats(enemy, 'Kidnapper', 50, 5, 12, 4, 10);
    },



    generateDragon: function (colorIndex) {

        var boss = this.bosses.create(this.player.x, this.player.y - 300, 'dragons');

        if (colorIndex === 0) {
            boss.animations.add('down', [0, 1, 2], 10, true);
            boss.animations.add('left', [12, 13, 14], 10, true);
            boss.animations.add('right', [24, 25, 26], 10, true);
            boss.animations.add('up', [36, 37, 38], 10, true);
        } else if (colorIndex === 1) {
            boss.animations.add('down', [3, 4, 5], 10, true);
            boss.animations.add('left', [15, 16, 17], 10, true);
            boss.animations.add('right', [27, 28, 29], 10, true);
            boss.animations.add('up', [39, 40, 41], 10, true);
        } else if (colorIndex === 2) {
            boss.animations.add('down', [6, 7, 8], 10, true);
            boss.animations.add('left', [18, 19, 20], 10, true);
            boss.animations.add('right', [30, 31, 32], 10, true);
            boss.animations.add('up', [42, 43, 44], 10, true);
        } else if (colorIndex === 3) {
            boss.animations.add('down', [9, 10, 11], 10, true);
            boss.animations.add('left', [21, 22, 23], 10, true);
            boss.animations.add('right', [33, 34, 35], 10, true);
            boss.animations.add('up', [45, 46, 47], 10, true);
        } else if (colorIndex === 4) {
            boss.animations.add('down', [57, 58, 59], 10, true);
            boss.animations.add('left', [69, 70, 71], 10, true);
            boss.animations.add('right', [81, 82, 83], 10, true);
            boss.animations.add('up', [93, 94, 95], 10, true);
        } else if (colorIndex === 5) {
            boss.animations.add('down', [54, 55, 56], 10, true);
            boss.animations.add('left', [66, 67, 68], 10, true);
            boss.animations.add('right', [78, 79, 80], 10, true);
            boss.animations.add('up', [90, 91, 92], 10, true);
        } else if (colorIndex === 6) {
            boss.animations.add('down', [51, 52, 53], 10, true);
            boss.animations.add('left', [63, 64, 65], 10, true);
            boss.animations.add('right', [75, 76, 77], 10, true);
            boss.animations.add('up', [87, 88, 89], 10, true);
        } else if (colorIndex === 7) {
            boss.animations.add('down', [48, 49, 50], 10, true);
            boss.animations.add('left', [60, 61, 62], 10, true);
            boss.animations.add('right', [72, 73, 74], 10, true);
            boss.animations.add('up', [84, 85, 86], 10, true);
        }

        console.log('Generated dragon!');

        return this.setStats(boss, 'Dragon', 2000, 100, 50, 500, 0);
    },

    generateObstacles: function() {

        this.obstacles = this.game.add.group();
        this.obstacles.enableBody = true;

        var amount = 100;
        for (var i = 0; i < amount; i++) {
            var point = this.getRandomLocation();
            var spriteIndex = Math.floor(Math.random() * 10);
            this.generateObstacle(point, spriteIndex);
        }
    },

    generateObstacle: function (location, spriteIndex) {

        obstacle = this.obstacles.create(location.x, location.y, 'tiles');

        if (spriteIndex === 0) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 1) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 2) {
            obstacle.animations.add('shrub', [20], 0, true);
            obstacle.animations.play('shrub');
        } else if (spriteIndex === 3) {
            obstacle.animations.add('pine', [30], 0, true);
            obstacle.animations.play('pine');
        } else if (spriteIndex === 4) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 5) {
            obstacle.animations.add('column', [39], 0, true);
            obstacle.animations.play('column');
        } else if (spriteIndex === 6) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 7) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 8) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 9) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        }
        obstacle.scale.setTo(2);
        obstacle.body.setSize(8, 8, 4, -2);
        obstacle.body.moves = false;

        return obstacle;
    },

    generateCollectables: function () {

        this.collectables = this.game.add.group();
        this.collectables.enableBody = true;
        this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

        var amount = 100;
        for (var i = 0; i < amount; i++) {
            var point = this.getRandomLocation();
            this.generateChest(point);
        }
        for (var i = 0; i < amount; i++) {
            var point = this.getRandomLocation();
            this.generatePlayground(point);
        }


    },

    generatePlayground: function (location) {

        var collectable = this.collectables.create(location.x, location.y, 'things');
        collectable.scale.setTo(2);
        collectable.animations.add('idle', [1], 0, true);
       // collectable.animations.add('open', [18, 30, 42], 10, false);
        collectable.animations.play('idle');
        collectable.name = 'playground'
        collectable.value =5;// Math.floor(Math.random() * 150);
        return collectable;
    },



    generateChest: function (location) {

        var collectable = this.collectables.create(location.x, location.y, 'things');
        collectable.scale.setTo(2);
        collectable.animations.add('idle', [6], 0, true);
        collectable.animations.add('open', [18, 30, 42], 10, false);
        collectable.animations.play('idle');
        collectable.name = 'chest'
        collectable.value = Math.floor(Math.random() * 150);

        return collectable;
    },

    generateGold: function (enemy) {

        var collectable = this.collectables.create(enemy.x, enemy.y, 'tiles');
        collectable.animations.add('idle', [68], 0, true);
        collectable.animations.play('idle');
        collectable.name = 'gold';
        collectable.value = enemy.reward * 2;
        return collectable;
    },

    generatePotion: function (location) {

        var rnd = Math.random();
        if (rnd >= 0 && rnd < .7) {
            this.generateHealthPotion(location);
        } else if (rnd >= .7 && rnd < .8) {
            this.generateVitalityPotion(location);
        } else if (rnd >= .8 && rnd < .9) {
            this.generateStrengthPotion(location);
        } else if (rnd >= .9 && rnd < 1) {
            this.generateSpeedPotion(location);
        }
    },

    generateHealthPotion: function (location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [0], 0, true);
        collectable.animations.play('idle');
        collectable.name = 'healthPotion'
        collectable.value = 20 + Math.floor(Math.random() * 10) + this.player.level;
        return collectable;
    },

    generateVitalityPotion: function (location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [2], 0, true);
        collectable.animations.play('idle');
        collectable.name = 'vitalityPotion'
        collectable.value = 4 + Math.floor(Math.random() * 10);
        return collectable;
    },

    generateStrengthPotion: function (location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [3], 0, true);
        collectable.animations.play('idle');
        collectable.name = 'strengthPotion'
        collectable.value = 1 + Math.floor(Math.random() * 10);
        return collectable;
    },

    generateSpeedPotion: function (location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [4], 0, true);
        collectable.animations.play('idle');
        collectable.name = 'speedPotion'
        collectable.value = 1 + Math.floor(Math.random() * 10);
        return collectable;
    },

    playSound: function (name) {

        if (name === this.player.name) {
            this.playerSound.play();

        } else if (name === 'Grandparent') {
            this.skeletonSound.play();

        } else if (name === 'Parent') {
            this.slimeSound.play();

        } else if (name === 'Child') {
            this.batSound.play();

        } else if (name === 'Pet') {
            this.ghostSound.play();

        } else if (name === 'Spider') {
            this.spiderSound.play();

        } else if (name === 'Dragon') {
             this.dragonSound.play();
         }
    },

    generateSounds: function () {

        this.attackSound = this.game.add.audio('attackSound');
        this.batSound = this.game.add.audio('batSound');
        this.fireballSound = this.game.add.audio('fireballSound');
        this.dragonSound = this.game.add.audio('dragonSound');
        this.ghostSound = this.game.add.audio('ghostSound');
        this.goldSound = this.game.add.audio('goldSound');
        this.levelSound = this.game.add.audio('levelSound');
        this.playerSound = this.game.add.audio('playerSound');
        this.potionSound = this.game.add.audio('potionSound');
        this.skeletonSound = this.game.add.audio('skeletonSound');
        this.slimeSound = this.game.add.audio('slimeSound');
        this.spiderSound = this.game.add.audio('spiderSound');
    },

    playerMovementHandler: function () {
        isDownTouch = false;
        isUpTouch = false;
        isLeftTouch = false;
        isRightTouch = false;
        if(this.game.input.activePointer.isDown){
            if(this.game.input.activePointer.position.x < this.game.width *0.20 ){
                isLeftTouch = true;
            }
            if(this.game.input.activePointer.position.x > this.game.width *0.80 ){
                isRightTouch = true;
            }
            if(this.game.input.activePointer.position.y < this.game.height *0.20 ){
                isUpTouch = true;
            }
            if(this.game.input.activePointer.position.y > this.game.height *0.80 ){
                isDownTouch = true;
            }





        };

        // Up-Left
        if (this.controls.up.isDown && this.controls.left.isDown) {
            this.player.body.velocity.x = -this.player.speed;
            this.player.body.velocity.y = -this.player.speed;
            this.player.animations.play('left');

        // Up-Right
        } else if (this.controls.up.isDown && this.controls.right.isDown) {
            this.player.body.velocity.x = this.player.speed;
            this.player.body.velocity.y = -this.player.speed;
            this.player.animations.play('right');

        // Down-Left
        } else if (this.controls.down.isDown && this.controls.left.isDown) {
            this.player.body.velocity.x = -this.player.speed;
            this.player.body.velocity.y = this.player.speed;
            this.player.animations.play('left');

        // Down-Right
        } else if (this.controls.down.isDown && this.controls.right.isDown) {
            this.player.body.velocity.x = this.player.speed;
            this.player.body.velocity.y = this.player.speed;
            this.player.animations.play('right');

        // Up
        } else if (this.controls.up.isDown || isUpTouch) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = -this.player.speed;
            this.player.animations.play('up');

        // Down
        } else if (this.controls.down.isDown || isDownTouch) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = this.player.speed;
            this.player.animations.play('down');

        // Left
        } else if (this.controls.left.isDown || isLeftTouch) {
            this.player.body.velocity.x = -this.player.speed;
            this.player.body.velocity.y = 0;
            this.player.animations.play('left');

        // Right
        } else if (this.controls.right.isDown || isRightTouch) {
            this.player.body.velocity.x = this.player.speed;
            this.player.body.velocity.y = 0;
            this.player.animations.play('right');

       // }// else if (this.game.input.activePointer.isDown){
         //   if(this.game.input.activePointer.position.x < this.game.width *0.20 ){

           // console.log(this.game.input.activePointer.position.y);

         //   this.player.body.velocity.x = - this.player.speed;
          //  this.player.body.velocity.y = 0;
           // this.player.animations.play('left');
           // }


        // Still
        } else {
            this.player.animations.stop();
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
        }
      // This does not work.
      //  this.instance.body.velocity.x = this.player.body.velocity.x;
      //  this.instance.body.velocity.x = this.player.body.velocity.y

    },

    enemyMovementHandler: function (enemy) {

        // Left
        if (enemy.body.velocity.x < 0 && enemy.body.velocity.x <= -Math.abs(enemy.body.velocity.y)) {
             enemy.animations.play('left');

        // Right
        } else if (enemy.body.velocity.x > 0 && enemy.body.velocity.x >= Math.abs(enemy.body.velocity.y)) {
             enemy.animations.play('right');

        // Up
        } else if (enemy.body.velocity.y < 0 && enemy.body.velocity.y <= -Math.abs(enemy.body.velocity.x)) {
            enemy.animations.play('up');

        // Down
        } else {
            enemy.animations.play('down');
        }
    },

    gameOver: function() {

        HouseNotHome.MainMenu.isGameOver = true;
        this.background.destroy();
        this.corpses.destroy();
        this.collectables.destroy();
        this.player.destroy();
        this.playerAttacks.destroy();
        this.enemies.destroy();

		this.music.stop();
		this.music.destroy();

        this.attackSound.destroy();
        this.playerSound.destroy();
        this.skeletonSound.destroy();
        this.slimeSound.destroy();
        this.batSound.destroy();
        this.ghostSound.destroy();
        this.spiderSound.destroy();
        this.goldSound.destroy();

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.game.state.start('MainMenu', true, false, this.xp + this.gold);
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
		this.music.stop();

        //  Then let's go back to the main menu.
        this.game.state.start('MainMenu', true, false, this.xp + this.gold);
    },

    rng: function (floor, ceiling) {
        floor /= 10;
        ceiling /= 10;
        var rnd = Math.random();
        if (rnd >= floor && rnd < ceiling) {
            return true;
        }
        return false;
    },

    generateGrid: function (worldSize) {

        this.grid = [];
        var gridSize = 32;
        var grids = Math.floor(worldSize / gridSize);
        for (var x = 0; x < grids; x++) {
            for (var y = 0; y < grids; y++) {
                var gridX = x * gridSize;
                var gridY = y * gridSize;
                this.grid.push({x:gridX, y:gridY});
            }
        }
        this.shuffle(this.grid);
    },

    getRandomLocation: function () {

        var gridIndex = 0;
        var x = this.grid[gridIndex].x;
        var y = this.grid[gridIndex].y;
        this.grid.splice(gridIndex, 1);
        gridIndex++;
        if (gridIndex === this.grid.length) {
            this.shuffle(this.grid);
            gridIndex = 0;
        }
        return {x, y};
    },

    shuffle: function (array) {
       var currentIndex = array.length, temporaryValue, randomIndex ;

       // While there remain elements to shuffle...
       while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
       }

       return array;
    }

    // destroyIfDead: function (collectable){
    //   if (!collectable.alive){
    //     collectable.destroy();
    //   }
    // }
};
