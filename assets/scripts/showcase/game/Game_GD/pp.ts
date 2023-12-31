import Res from "../../../common/util/Res";
import {DirUrl} from "../../../common/const/Url";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    bubblePrefab = null;  // 泡泡Prefab

    // 泡泡精灵图片数组
    spritesList:cc.SpriteFrame[]

    //泡泡获取完成
    getPP = false

    @property
    minSpawnInterval = 0.3;  // 最小生成间隔

    @property
    maxSpawnInterval = 2;  // 最大生成间隔

    spawnInterval = 0;  // 当前生成间隔
    spawnTimer = 0;  // 生成计时器

    bubblePool = [];  // 泡泡对象池

    // tweens = [];  // 用于存储所有的Tween

    shsd_01 = 4;  // 上升速度
    shsd_02 = 10;  // 上升速度

    onLoad() {
        this.getGDSprites().then(() => {
            this.getPP = true
        })
    }

    start() {
        // this.spawnInterval = randomRange(this.minSpawnInterval, this.maxSpawnInterval);
        this.spawnInterval = this.getRandom(this.minSpawnInterval, this.maxSpawnInterval,false);
        // 在场景切换时销毁所有的泡泡和Tween
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING, this.destroyAllBubbles, this);
    }

    update(deltaTime) {
        if (!this.getPP){
            return
        }
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnBubble();
            this.spawnTimer = 0;
            // this.spawnInterval = randomRange(this.minSpawnInterval, this.maxSpawnInterval);
            this.spawnInterval = this.getRandom(this.minSpawnInterval, this.maxSpawnInterval,false);
        }

        // 回收超出屏幕的泡泡
        this.bubblePool = this.bubblePool.filter(bubble => {
            if (bubble.position.y > this.node.height / 2) {
                bubble.active = false;
                return false;
            }
            return true;
        });
    }

    spawnBubble() {
        let bubble: cc.Node;
        if (this.bubblePool.length > 0) {
            bubble = this.bubblePool.pop();
            bubble.active = true;
        } else {
            bubble = cc.instantiate(this.bubblePrefab);
            this.node.addChild(bubble);
        }
        // 随机选择一个精灵图片
        const spriteIndex = this.getRandom(0, this.spritesList.length-1,true);
        const spriteFrame = this.spritesList[spriteIndex];
        const sprite = bubble.getComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;

        // 根据精灵图片设置初始大小
        // let sss = new cc.Vec3(spriteFrame.getOriginalSize().width / 100, spriteFrame.getOriginalSize().height / 100, 1);
        bubble.scale = new cc.Vec3(spriteFrame.getOriginalSize().width / 100, spriteFrame.getOriginalSize().height / 100, 1).x;
        // bubble.scale = 1

        bubble.setPosition(cc.v2(this.getRandom(-this.node.width / 2, this.node.width / 2,false), -this.node.height / 2));
        this.animateBubble(bubble);
    }

    animateBubble(bubble) {
        //控制气泡上升速度，值越大，上升越快
        const duration = this.getRandom(4, 10,false);
        const scale = this.getRandom(0.5, 1.3,false);

        const tweenBubble = cc.tween(bubble)
            .parallel(
                cc.tween().by(duration, { position: new cc.Vec3(0, this.node.height, 0) }, { easing: 'quadInOut' }),
                cc.tween().to(duration, { scale: scale}, { easing: 'bounceOut' })
            )
            .call(() => {
                bubble.active = false;
                this.bubblePool.push(bubble);
                tweenBubble.stop()
            })
            .start();
        // this.tweens.push(tweenBubble);

    }

    destroyAllBubbles() {
        // 停止所有的Tween
        // for (const tween of this.tweens) {
        //     tween.stop();
        // }
        // this.tweens = [];

        // 销毁所有的泡泡
        for (const bubble of this.bubblePool) {
            bubble.destroy();
        }
        this.bubblePool = [];
    }

    getRandom(min,max,isFloor){
        if (isFloor){
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return Math.random() * (max - min + 1) + min;
    }

    async getGDSprites(){
        this.spritesList = await Res.loadDir(DirUrl.PP, cc.SpriteFrame, false);
        console.log("11")

    }
}
