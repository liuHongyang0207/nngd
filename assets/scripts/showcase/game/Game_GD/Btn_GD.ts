
import Prefab = cc.Prefab;
import EventTouch = cc.Event.EventTouch;
import Res from "../../../common/util/Res";
import {DirUrl} from "../../../common/const/Url";
import ResSprite from "../../../common/cmpt/ui/res/ResSprite";
import SpriteAtlas = cc.SpriteAtlas;
import Layer from "../../../common/cmpt/base/Layer";
import {CommonData} from "../../../common/const/CommonData";


import * as LiquidFun from "../../../Box2D/Common/b2Settings";
import PhysicManager from "../../../LiquidFun/PhysicManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    // 果冻Prefab
    @property(Prefab)
    public GDPrefab: Prefab = null;
    // 果冻精灵集数组
    // public GDSprites: SpriteAtlas[] = [];
    //果冻精灵图片数组
    public SpriteFrames =  CommonData.instance.getData("GDSpriteFrames");
    //上部block
    @property(cc.Node)
    DownNode = null
    //预生成的果冻
    @property(cc.Node)
    GD_YB = null
    //果冻精灵，这个是最新的
    private GD_num = 0;
    //果冻精灵，这个是即将生成的
    private GD_old = 0;
    //点击时间间隔
    private clickInterval: number = 0.4;
    //上一次点击的时间戳
    private lastClickTime: number = 0;
    //定时器数量
    private count: number = 0;
    //是否在规定时间内
    private isTime: boolean = false;
    //开始点击事件
    private isStart: boolean = false;
    //时间对象池
    private timerPool: cc.NodePool = null;



    onLoad(){
        // this.getGDSprites().then(() => {
            this.GD_YB.active = false

            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
            this.getGD_DD()
        // })
    }

    start () {
        this.jt()

    }
    jt(){
        // 创建碰撞监听器
        const contactListener = new LiquidFun.b2ContactListener();
        contactListener.BeginContact = function(contact) {
            console.log("处理碰撞开始事件")
            debugger
            // 处理碰撞开始事件
        };
        contactListener.EndContact = function(contact) {
            console.log("处理碰撞结束事件")
            // 处理碰撞结束事件
        };
        contactListener.PreSolve = function(contact, oldManifold) {
            console.log("处理碰撞预处理事件")
            // 处理碰撞预处理事件
        };
        contactListener.PostSolve = function(contact, impulse) {
            console.log("处理碰撞后处理事件")
            // 处理碰撞后处理事件
        };

        PhysicManager.physicWorld.SetContactListener(contactListener);
    }

    // update (dt) {}

    onTouchStart (event:EventTouch) {
        if (this.isTime){
            Layer.inst.showTip({ text: "点击太快啦！", end: cc.v2(0, 100), duration: 0 });
            this.isStart = true
            return
        }
        console.log("点击成功")
        this.isStart = false
        this.GD_YB.active = true
        let touchPoint = event.getLocation();
        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)
        // this.getGD(touchPoint);

        this.getGD_YB(this.getPositions(touchPoint));
    }


    onTouchMove (event:EventTouch) {
        if (this.isStart){
            return
        }
        console.log("移动成功")
        let touchPoint = event.getLocation();
        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)

        this.GD_YB.setPosition(this.getPositions(touchPoint).x,330);
    }


    onTouchEnd (event:EventTouch) {
        if (this.isStart){
            return
        }
        console.log("结束成功")
        this.getTime()
        this.GD_YB.active = false
        let touchPoint = event.getLocation();
        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)
        touchPoint.y = 420
        this.getGD(this.getPositions(touchPoint));

    }
    onTouchCancel (event:EventTouch) {
        if (this.isStart){
            return
        }
        console.log("移除成功")
        this.getTime()
        this.GD_YB.active = false
        let touchPoint = event.getLocation();
        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)
        touchPoint.y = 420
        this.getGD(this.getPositions(touchPoint));

    }


    getGD(touchPoint) {
        let bubble: cc.Node;
        bubble = cc.instantiate(this.GDPrefab);
        // 随机选择一个精灵图片
        let sprite = bubble.getComponent(cc.Sprite);
        sprite.spriteFrame = this.SpriteFrames[this.GD_old]
        bubble.setPosition(touchPoint.x,touchPoint.y);
        this.DownNode.addChild(bubble);

    }

    //预生成的果冻
    getGD_YB(touchPoint){
        let sprite = this.GD_YB.getComponent(cc.Sprite);
        sprite.spriteFrame = this.SpriteFrames[this.GD_num]
        this.GD_YB.setPosition(touchPoint.x,330);
        this.GD_old = this.GD_num
        this.getGD_DD()
    }


    getGD_DD(){
        let min = 0;
        let max = this.SpriteFrames.length-1;
        this.GD_num = Math.floor(Math.random() * (max - min + 1)) + min;
        let nextNode = this.node.getChildByName("Next");

        // 获取Next节点上的gd组件
        let gdComponent = nextNode.getComponentInChildren(cc.Sprite);
        gdComponent.spriteFrame = this.SpriteFrames[this.GD_num]
    }


    getPositions(touchPoint){
        if (touchPoint.x<-225){
            touchPoint.x = -225
        }else if (touchPoint.x>225){
            touchPoint.x = 225
        }

        return touchPoint
    }

    getTime(){
        this.isTime = true
        this.scheduleOnce(() => {
            // 在这里写点击事件的处理逻辑
            this.isTime = false
            this.count++;
            if (this.count > 10) {
                this.count = 0
                // 先移除之前的定时器
                this.unscheduleAllCallbacks();
            }
        }, this.clickInterval);
    }

    onDestroy() {
        this.unscheduleAllCallbacks()
    }

}
