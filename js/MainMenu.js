HouseNotHome.MainMenu = function (game) {};

HouseNotHome.MainMenu.prototype = {

    init: function(score) {

		var score = score || 0;
		this.isWinner = this.isWinner || 0;
        this.isGameOver = this.isGameOver || 0;
        this.highestScore = this.highestScore || 0;
        this.highestScore = Math.max(score, this.highestScore);
    },

	create: function () {

		// We've already preloaded our assets, so let's kick right into the Main Menu itself.
		// Here all we're doing is playing some music and adding a picture and button
		// Naturally I expect you to do something significantly better :)

		this.music = this.add.audio('openingMusic');
		this.music.loop = true;
		// this.music.play();

		this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'tiles', 92);

		// Give it speed in x
		this.background.autoScroll(-20, 0);

		this.splash = this.add.image(this.game.width/2,this.game.height/2, 'logo');
		this.splash.anchor.setTo(0.5);

    // High score
    text = ""//"High score: "+this.highestScore;
    style = { font: "15px Arial", fill: "#fff", align: "center" };

    this.score = this.game.add.text(this.game.width/2, this.game.height - 50, text, style);
    this.score.anchor.set(0.5);

    // Game Over
    if (HouseNotHome.MainMenu.isGameOver && HouseNotHome.MainMenu.isWinner == true){
      style = { font: "90px Arial", fill: "#FFFF00", align: "center" };
      text = "You're now a Home!";
    } else if (HouseNotHome.MainMenu.isGameOver) {
      style = { font: "90px Arial", fill: "#FF0000", align: "center" };
      text = "Game Over";
    } else { text = ""}
        this.gameOver = this.game.add.text(this.game.width/2, this.game.height / 6, text, style);
        this.gameOver.anchor.set(0.5);

        // Instructions
        text = "Move: WASD Keys, or Touch";
        style = { font: "15px Arial", fill: "#fff", align: "center" };

        this.instructions = this.game.add.text(this.game.width/2, this.game.height - 25, text, style);
        this.instructions.anchor.set(0.5);

		    this.playButton = this.add.button(this.game.width/2, this.game.height/2 + 100, 'playButton', this.startGame, this);
		    this.playButton.anchor.setTo(0.5);
	},

	update: function () {

	},

	startGame: function (pointer) {

		// Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		// this.music.stop();

		// And start the actual game
		this.state.start('Game');
	},

	shutdown: function() {

	    this.music = null;
	    this.splash = null;
        this.score = null;
        this.instructions = null;
        this.background = null;
        this.playButton = null;
    }
};
