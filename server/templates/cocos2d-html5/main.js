var cocos2dApp = cc.Application.extend({
    config:document['ccConfig'],
    ctor:function (scene) {
        this._super();
        this.startScene = scene;
        cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
        cc.initDebugSetting();
        cc.setup(this.config['tag']);
        cc.AppController.shareAppController().didFinishLaunchingWithOptions();
    },
    applicationDidFinishLaunching:function () {
       
        director = cc.Director.getInstance();
       
        director.setDisplayStats(this.config['showFPS']);
        director.setAnimationInterval(1.0 / this.config['frameRate']);

        cc.EGLView.getInstance().setDesignResolutionSize(320,480,cc.RESOLUTION_POLICY.SHOW_ALL); 
        cc.EGLView.getInstance().resizeWithBrowserSize(true);
       
        // 1
        winSize   = director.getWinSize();
        centerPos = cc.p( winSize.width/2, winSize.height/2 );
       
        //load resources
        cc.Loader.preload(g_resources, function () {
            cc.Director.getInstance().runWithScene(new this.startScene());
        }, this);
      
        // old 
        // director.runWithScene(new this.startScene());
        return true;
    }
});
// 2
var director;
var winSize;
var centerPos;
var myApp = new cocos2dApp(MainLayer.scene);