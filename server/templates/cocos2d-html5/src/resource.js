//var resource = "res/";
var resource = "cocos2d-html5/res/";
var dirArt = resource + "art/";
var dirSounds = resource + "sounds/";

var s_player = dirArt + "player.png";
var s_monster = dirArt + "monster.png";
var s_projectile = dirArt + "projectile.png";

var s_bgMusic = dirSounds + "background-music.mp3";
var s_bgMusicOgg = dirSounds + "background-music.ogg";
// caf is not support Cocos2d-html5-v2.2.3 version
//var s_bgMusicCaf = dirSounds + "background-music.caf";

var s_shootEffect = dirSounds + "pew-pew-lei.mp3";
var s_shootEffectOgg = dirSounds + "pew-pew-lei.ogg";
var s_shootEffectWav = dirSounds + "pew-pew-lei.wav";

var g_resources = [

    {type:"image", src:s_player},
    {type:"image", src:s_monster},
    {type:"image", src:s_projectile},

    {type:"sound", src:s_bgMusic},
    {type:"sound", src:s_bgMusicOgg},
	// caf is not support Cocos2d-html5-v2.2.3 version
    //{type:"sound", src:s_bgMusicCaf},

    {type:"sound", src:s_shootEffect},
    {type:"sound", src:s_shootEffectOgg},
    {type:"sound", src:s_shootEffectWav}

];