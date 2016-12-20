/**
 * 新版 RES API
 */
@RES.mapConfig("config.json", () => "resource", path => {
    var ext = path.substr(path.lastIndexOf(".") + 1);
    var typeMap = {
        "jpg": "image",
        "png": "image",
        "webp": "image",
        "json": "json",
        "fnt": "font",
        "pvr": "pvr",
        "mp3": "sound"
    }
    var type = typeMap[ext];
    if (type == "json") {
        if (path.indexOf("sheet") >= 0) {
            type = "sheet";
        } else if (path.indexOf("movieclip") >= 0) {
            type = "movieclip";
        };
    }
    return type;
})
class Main extends egret.DisplayObjectContainer {

    private sky: egret.Bitmap;

    public constructor() {
        super();
        this.once(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {


        let testNull = () => RES.getRes("");

        let testBitmapFont = () =>
            RES.getResAsync("assets/font/font.fnt").then(value => {
                console.log(value)
                var text = new egret.BitmapText();
                text.font = value;
                this.addChild(text);
                text.text = "0";
            });
        ;

        let testSpriteSheet = () =>
            RES.getResAsync("assets/sheet/sheet1.json")
                .then((value: egret.SpriteSheet) => {

                    var button = new egret.Bitmap();
                    this.addChild(button);
                    // button.texture = value.getTexture("off");
                    let texture = RES.getRes("assets/sheet/sheet1.json#off");
                    console.log('111', texture)
                    console.assert(texture instanceof egret.Texture, "测试SpriteSheet纹理")
                    button.texture = texture;
                    button.y = 100;
                });

        let testLoadResByUrl = () =>
            RES.getResByUrl("resource/assets/bg.jpg", (value) => { console.log(value) }, this);


        let testSoundByUrl = () =>
            RES.getResAsync("assets/sound/sound_go.mp3").then((value) => {
                console.log(value)
                console.log('sound play')
                var sound: egret.Sound = value;
                sound.play();
            })


        let testCreateAndDestoryResource = () => {
            let reporter = {

                onProgress: (current, total) => {
                    console.log(current, total);
                }
            }
            return RES.loadGroup("preload", 0, reporter)
                .then(() => this.createGameScene())
                .then(() => sleep(1000))
                .then(() => RES.destroyRes("preload"))
                .then(() => RES.destroyRes("assets/bg.jpg"))
                .then(() => RES.loadGroup("preload", 0, reporter).then(() => {
                    this.sky.texture = RES.getRes("assets/bg.jpg")
                }))
        }

        /**
         * 关闭整个 RES 模块
         */
        let testDestroy = () => {
            console.log('test destroy');
            RES.getResAsync("assets/bg.jpg").then(() => console.error('never get here'))
            RES.manager.destory();
        }

        let testAnimationByUrl = () =>
            RES.getResAsync("assets/movieclip/movieclip.json").then((value) => {
                var mcDataFactory: egret.MovieClipDataFactory = value;
                var attack = new egret.MovieClip(mcDataFactory.generateMovieClipData("test"));
                this.addChild(attack);
                attack.x = 50;
                attack.y = 150;
                attack.gotoAndPlay(1, -1);
            });


        let testPVR = () =>
            RES.getResAsync("assets/pvr/0.pvr")
                .then(value => {
                    console.log(value)
                });




        RES.loadConfig()
            .then(testNull)
            .then(testCreateAndDestoryResource)
            .then(testLoadResByUrl)
            .then(testBitmapFont)
            .then(testNetworkDelay)
            .then(testSpriteSheet)
            .then(testSoundByUrl)
            .then(testAnimationByUrl)
            .then(testPVR)
            .then(testDestroy)
            .catch((e) => {
                console.warn(e);
                console.log(e.stack)
                // throw e;
            });
    }


    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene(): void {
        var sky: egret.Bitmap = createBitmapByName("assets/bg.jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        this.sky = sky;

    }
}


function sleep(time): Promise<void> {
    return new Promise<void>((reslove, reject) => {
        setTimeout(reslove, time);
    });

}

function createBitmapByName(name: string): egret.Bitmap {
    var result = new egret.Bitmap();
    var texture: egret.Texture = RES.getRes(name);
    result.texture = texture;
    return result;
}