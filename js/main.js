// If the object exists already, we�ll use it, otherwise we�ll use a new object
var HouseNotHome = HouseNotHome || {};

// Initiate a new game and set the size of the entire windows
// Phaser.AUTO means that whether the game will be rendered on a CANVAS element or using WebGL will depend on the browser
HouseNotHome.game = new Phaser.Game(512, 384, Phaser.AUTO, '', null, false, false);

HouseNotHome.game.state.add('Boot', HouseNotHome.Boot);
HouseNotHome.game.state.add('Preloader', HouseNotHome.Preloader);
HouseNotHome.game.state.add('MainMenu', HouseNotHome.MainMenu);
HouseNotHome.game.state.add('Game', HouseNotHome.Game);

HouseNotHome.game.state.start('Boot');