// player, enemy and environment assets by hugues laborde https://hugues-laborde.itch.io/
// load / get all assets needed for the game
class Assets {
    constructor() {
        this.player = {
            idle: [],
            attack1: [],
            attack3: [],
            changeState: [],
            death: [],
            run: [],
        };
        this.enemy1 = {
            attack: [],
            hit: [],
            idle: [],
            run: [],
        }
        this.enemy2 = {
            attack: [],
            hit: [],
            idle: [],
            run: [],
        }
        this.Texture = {};
        this.bullet = {};
        this.food = {};
        this.finish = [];
        this.init();
    }
    // load sprites and textures
    init() {
        let type = '.png';
        let spritePath = '/client/Assets/Player/Run/Run_';
        this.addSprite(spritePath, type, this.player.run, 8);
        spritePath = '/client/Assets/Player/Attack03/Attack03_';
        this.addSprite(spritePath, type, this.player.attack3, 16);
        spritePath = '/client/Assets/Player/Attack01/Attack01_';
        this.addSprite(spritePath, type, this.player.attack1, 9);
        spritePath = '/client/Assets/Player/Idle/Idle_';
        this.addSprite(spritePath, type, this.player.idle, 5);
        spritePath = '/client/Assets/Player/ChangeState/ChangeState_';
        this.addSprite(spritePath, type, this.player.changeState, 7);
        spritePath = '/client/Assets/Player/Death/Death_';
        this.addSprite(spritePath, type, this.player.death, 12);
        // load enemy 1 sprites
        spritePath = '/client/Assets/Enemies/Enemy01/Attack/Enemy01_Attack_';
        this.addSprite(spritePath, type, this.enemy1.attack, 21)
        spritePath = '/client/Assets/Enemies/Enemy01/Hit/Enemy01_Hit_';
        this.addSprite(spritePath, type, this.enemy1.hit, 9);
        spritePath = '/client/Assets/Enemies/Enemy01/Idle/Enemy01_Idle_';
        this.addSprite(spritePath, type, this.enemy1.idle, 8);
        spritePath = '/client/Assets/Enemies/Enemy01/Run/Enemy01_Run_';
        this.addSprite(spritePath, type, this.enemy1.run, 8);
        // load enemy 2 sprites
        spritePath = '/client/Assets/Enemies/Enemy02/Shoot/Enemy02_Shoot_';
        this.addSprite(spritePath, type, this.enemy2.attack, 16)
        spritePath = '/client/Assets/Enemies/Enemy02/Hit/Enemy02_Hit_';
        this.addSprite(spritePath, type, this.enemy2.hit, 7);
        spritePath = '/client/Assets/Enemies/Enemy02/Idle/Enemy02_Idle_';
        this.addSprite(spritePath, type, this.enemy2.idle, 8);
        spritePath = '/client/Assets/Enemies/Enemy02/Run/Enemy02_Run_';
        this.addSprite(spritePath, type, this.enemy2.run, 8);
        // load food
        this.food.apple = new Image();
        this.food.apple.src = '/client/Assets/appleCoin.png';
        // load finish point
        spritePath = '/client/Assets/Environments/GiantSword/GiantSword_'
        this.addSprite(spritePath, type, this.finish, 40);
        // load bullets
        this.bullet.b1 = new Image();
        this.bullet.b1.src = '/client/Assets/b1T.png';
        this.bullet.b2 = new Image();
        this.bullet.b2.src = '/client/Assets/b2T.png';
        // load backgrounds
        this.Texture.map = new Image();
        this.Texture.map.src = '/client/Assets/Backgrounds/forest.png';
        this.Texture.map2 = new Image();
        this.Texture.map2.src = '/client/Assets/Backgrounds/city.jpg';
        this.Texture.map3 = new Image();
        this.Texture.map3.src = '/client/Assets/Backgrounds/fire.jpg';
        this.Texture.map4 = new Image();
        this.Texture.map4.src = '/client/Assets/Backgrounds/forestfire.jpg';
        this.Texture.map5 = new Image();
        this.Texture.map5.src = '/client/Assets/Backgrounds/forestrain.jpg';
        this.Texture.map6 = new Image();
        this.Texture.map6.src = '/client/Assets/Backgrounds/skybackgound.jpg';
        this.Texture.map7 = new Image();
        this.Texture.map7.src = '/client/Assets/Backgrounds/underwater.jpg';
        // load tiles
        this.Texture.tile1 = new Image();
        this.Texture.tile1.src = '/client/Assets/tiles.png';
        this.Texture.tile2 = new Image();
        this.Texture.tile2.src = '/client/Assets/tile2.png';
        this.Texture.tile3 = new Image();
        this.Texture.tile3.src = '/client/Assets/tile3.png';
        this.Texture.tile4 = new Image();
        this.Texture.tile4.src = '/client/Assets/Environments/Rocks/Rock01.png';
        this.Texture.tile5 = new Image();
        this.Texture.tile5.src = '/client/Assets/Environments/Rocks/Rock02.png';
    }
    // add sprite to given container 
    addSprite(path, type, container, length) {
        let newString = '';
        let img = new Image();
        for (let i = 1; i <= length; i++) {
            newString = (i < 10) ? '0' + i : String(i);
            newString = path + newString + type;
            img = new Image();
            img.src = newString;
            container.push(img);
        }
    }
    // get player sprites
    getPlayer(name) {
        switch (name) {
            case 'idle':
                return this.player.idle;
            case 'attack1':
                return this.player.attack1;
            case 'attack3':
                return this.player.attack3;
            case 'run':
                return this.player.run;
            default:
                return null;
        }
    }
    // get enemy sprites
    getEnemy(id) {
        switch (id) {
            case 1:
                return this.enemy1;
            case 2:
                return this.enemy2;
        }
    }
    // get textures
    getTexture(id) {
        switch (id) {
            case 1:
                return this.Texture.tile1
            case 2:
                return this.Texture.tile2;
            case 3:
                return this.Texture.tile3;
            case 4:
                return this.Texture.tile4;
            case 5:
                return this.Texture.tile5;
            default:
                return null;
        }
    }
    // get decorations
    getMap(id) {
        switch (id) {
            case 1:
                return this.Texture.map;
            case 2:
                return this.Texture.map2;
            case 3:
                return this.Texture.map3;
            case 4:
                return this.Texture.map4;
            case 5:
                return this.Texture.map5;
            case 6:
                return this.Texture.map6;
            case 7:
                return this.Texture.map7;
            default:
                return null;
        }
    }
    // get bullets
    getBullet(id) {
        switch (id) {
            case 1:
                return this.bullet.b1;
            case 2:
                return this.bullet.b2;
            default:
                return null;
        }
    }
    // get coins
    getFood() {
        return this.food.apple;
    }
    // get finish point
    getFinish() {
        return this.finish;
    }
}