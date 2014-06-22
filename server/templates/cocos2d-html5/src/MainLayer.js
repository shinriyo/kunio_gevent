var audioEngine = cc.AudioEngine.getInstance();

// gevent
var namespace = ''; // change to an empty string to use the global namespace
var socket;
var myNum = 1;

var MainLayer = cc.LayerColor.extend({

    _myPlayer:null,
    _monsters:[],
    _projectiles:[],
    _monstersDestroyed:0,

    ctor:function() {
        // Rest of file...
        this._super();

        // キーボード
        this.setKeyboardEnabled(true);
        this.keyboardArrows = {
            left : false,
            right : false,
            up : false,
            down : false
        }

        cc.associateWithNative( this, cc.LayerColor );

        // gevent
        var roomName = 'gameplay';
        // the socket.io documentation recommends sending an explicit package upon connection
        // this is specially important when using the global namespace
        socket = io.connect('http://' + document.domain + ':' + location.port + namespace);
            socket.on('connect', function() {
            socket.emit('my event', {data: 'I\'m connected!'});
            socket.emit('join', {room: roomName});
        });

        // event handler for server sent data
        // the data is displayed in the "Received" section of the page
        socket.on('my response', function(msg) {
            var data = msg.data;
            console.log('<br>Received #' + msg.count + ': ' + data);
            if (data['attack'])
            {
               console.log(data['attack']);
            }
            else
            {
               console.log('other');
            }
        });


        this._playerSprite = new Player();
        this.addChild(this._playerSprite);
    },

    onEnter:function () {
        this._super();

        if( 'touches' in sys.capabilities ) {
            this.setTouchEnabled(true);
        }
        if( 'mouse' in sys.capabilities ) {
            this.setMouseEnabled(true);
        }

        var player = cc.Sprite.create(s_player);
        player.setPosition(player.getContentSize().width / 2, winSize.height / 2);
        this.addChild(player);

        var player2 = cc.Sprite.create(s_player);
        player2.setPosition(winSize.width - player.getContentSize().width / 2, winSize.height / 2);
        this.addChild(player2);

        var player3 = cc.Sprite.create(s_player);
        player3.setPosition(winSize.width / 2, player.getContentSize().height / 2);
        this.addChild(player3)

        var player4 = cc.Sprite.create(s_player);
        player4.setPosition(winSize.width / 2, winSize.height - player.getContentSize().height / 2);
        this.addChild(player4);

        // select
        _myPlayer = player4;

        //this.schedule(this.gameLogic, 3);
        this.schedule(this.gameLogic, 0.1);
        this.scheduleUpdate();

        audioEngine.playMusic(s_bgMusic, true);
    },
/*
    addMonster:function() {

        var monster = cc.Sprite.create(s_monster);

        // Determine where to spawn the monster along the Y axis
        var minY = monster.getContentSize().height / 2;
        var maxY = winSize.height - monster.getContentSize().height / 2;
        var rangeY = maxY - minY;
        var actualY = (Math.random() * rangeY) + minY; // 1

        // Create the monster slightly off-screen along the right edge,
        // and along a random position along the Y axis as calculated above
        monster.setPosition(winSize.width + monster.getContentSize().width/2, actualY);
        this.addChild(monster); // 2

        // Determine speed of the monster
        var minDuration = 2.0;
        var maxDuration = 4.0;
        var rangeDuration = maxDuration - minDuration;
        var actualDuration = (Math.random() % rangeDuration) + minDuration;

        // Create the actions
        var actionMove = cc.MoveTo.create(actualDuration, cc.p(-monster.getContentSize().width/2, actualY)); // 3
        var actionMoveDone = cc.CallFunc.create(function(node) { // 4
            cc.ArrayRemoveObject(this._monsters, node); // 5
            node.removeFromParent();

            var scene = GameOver.scene(false);
            cc.Director.getInstance().replaceScene(scene);
        }, this);
        monster.runAction(cc.Sequence.create(actionMove, actionMoveDone));

        // Add to array
        monster.setTag(1);
        this._monsters.push(monster);

    },
*/
    gameLogic:function(dt) {
//        this.addMonster() ;
        this._playerSprite.setDirection(this.keyboardArrows);
        this._playerSprite.move();
    },

    // 矢印キー
    onKeyDown : function(key) {
        switch (key) {
        case 37:
            this.keyboardArrows.left = true;
            break;
        case 38:
            this.keyboardArrows.up = true;
            break;
        case 39:
            this.keyboardArrows.right = true;
            break;
        case 40:
            this.keyboardArrows.down = true;
            break;
        }
    },

    onKeyUp : function(key) {
        switch (key) {
        case 37:
            this.keyboardArrows.left = false;
            break;
        case 38:
            this.keyboardArrows.up = false;
            break;
        case 39:
            this.keyboardArrows.right = false;
            break;
        case 40:
            this.keyboardArrows.down = false;
            break;
        }
    },

    // projectile event
    locationTapped:function(location) {
        // Set up initial location of the projectile
        var projectile = cc.Sprite.create(s_projectile);
        // get from position
        //projectile.setPosition(20, winSize.height/2);
        var myPlayerPos = _myPlayer.getPosition();
        projectile.setPosition(myPlayerPos.x, myPlayerPos.y);

        //cc.JumpTo.create(秒数, cc.p(横位置, 縦位置),ジャンプの高さ,ジャンプ回数);
        var jumpBy = cc.JumpTo.create(0.3, myPlayerPos,30,1);
        _myPlayer.runAction(cc.Sequence.create(jumpBy));

        // Determine offset of location to projectile
        var offset = cc.pSub(location, projectile.getPosition());

        // Bail out if you are shooting down or backwards
        //if (offset.x <= 0) return;

        // Ok to add now - we've double checked position
        this.addChild(projectile);

        // Figure out final destination of projectile
        var realX = winSize.width + (projectile.getContentSize().width / 2);
        if (offset.x <= 0)
        {
           realX *= -1; 
        }

        var ratio = offset.y / offset.x;
        var realY = (realX * ratio) + projectile.getPosition().y;
        var realDest = cc.p(realX, realY);

        // Determine the length of how far you're shooting
        var offset = cc.pSub(realDest, projectile.getPosition());
        var length = cc.pLength(offset);
        //var velocity = 480.0;
        var velocity = 180.0;
        var realMoveDuration = length / velocity;

        // Move projectile to actual endpoint
        projectile.runAction(cc.Sequence.create(
            cc.MoveTo.create(realMoveDuration, realDest),
            cc.CallFunc.create(function(node) {
                cc.ArrayRemoveObject(this._projectiles, node);
                node.removeFromParent();
            }, this)
        ));

        // Add to array
        projectile.setTag(2);
        this._projectiles.push(projectile);

        audioEngine.playEffect(s_shootEffect);

        // gevent
        socket.emit('my broadcast event',
            {
                data: {
                    'attack':
                    {
                        'player': 1,
                        'pos': myPlayerPos.x + ',' + myPlayerPos.y
                    }
                }
            }
        );
        //console.log('attack')
    },

    onMouseUp:function (event) {
        var location = event.getLocation();
        this.locationTapped(location);
    },

    onTouchesEnded:function (touches, event) {
        if (touches.length <= 0)
            return;
        var touch = touches[0];
        var location = touch.getLocation();
        this.locationTapped(location);;
    },

    update:function (dt) {
        for (var i = 0; i < this._projectiles.length; i++) {
            var projectile = this._projectiles[i];
            for (var j = 0; j < this._monsters.length; j++) {
                var monster = this._monsters[j];
                var projectileRect = projectile.getBoundingBox();
                var monsterRect = monster.getBoundingBox();
                if (cc.rectIntersectsRect(projectileRect, monsterRect)) {
                    cc.log("collision!");
                    cc.ArrayRemoveObject(this._projectiles, projectile);
                    projectile.removeFromParent();
                    cc.ArrayRemoveObject(this._monsters, monster);
                    monster.removeFromParent();

                    this._monstersDestroyed++;
                    if (this._monstersDestroyed >= 2) {
                        var scene = GameOver.scene(true);
                        cc.Director.getInstance().replaceScene(scene);
                    }
                }
            }
        }
    }
});

MainLayer.create = function () {
    var sg = new MainLayer();
    if (sg && sg.init(cc.c4b(255, 255, 255, 255))) {
        return sg;
    }
    return null;
};

MainLayer.scene = function () {
    var scene = cc.Scene.create();
    var layer = MainLayer.create();
    scene.addChild(layer);
    return scene;
};


var Player = cc.Sprite.extend({
    width: 30,
    height: 30,
    speed: 20,
    x: 0,
    y: 0,
    vx: 0,//Math.random() - 0.5,
    vy: 0,//Math.random() - 0.5,
    ctor: function() {
        this._super();
        this.initWithFile(s_player);
    },

    setDirection: function(keyboardArrows) {
        var side = (keyboardArrows.left ? -1 : 0) + (keyboardArrows.right ? 1 : 0);
        var upDown = (keyboardArrows.up ? 1 : 0) + (keyboardArrows.down ? -1 : 0);
        this.vx += side; 
        this.vy += upDown;
        console.log (side);
        console.log (upDown);
    },

    move: function() {
        this.x = this.getPosition().x;
        this.y = this.getPosition().y;

        //this.vx += Math.random() * 0.5 - 0.25;
        //this.vy += Math.random() * 0.5 - 0.25;
        this.vx *= 0.9;
        this.vy *= 0.9;
        this.x += this.vx;
        this.y += this.vy;

        //return new cc.Point(this.x, this.y);
        this.setPosition(this.x, this.y);
    }
});