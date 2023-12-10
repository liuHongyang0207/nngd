
import Prefab = cc.Prefab;
import EventTouch = cc.Event.EventTouch;
import Layer from "../../../common/cmpt/base/Layer";
import {CommonData} from "../../../common/const/CommonData";
import LFParticleSystem from "../../../LiquidFun/LFParticleSystem";
import * as LiquidFun from "../../../Box2D/Common/b2Settings";



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
    //预生成的粒子
    @property(cc.Node)
    particlePrefab = null

    //预生成的粒子
    @property(cc.Node)
    GuoJiang = null
    //预生成的爆炸的特效
    @property(cc.Node)
    BaoZha = null
    //果冻精灵，这个是最新的
    private GD_num = 0;
    //果冻精灵，这个是即将生成的
    private GD_old = 0;
    //生成果冻的最大数
    private GD_max = 1;
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

    // 碰撞冷却时间
    private  collisionCooldown:number = 1
    // 上次碰撞发生的时间
    private  lastCollisionTime:number = 0
    // 允许的最大碰撞次数
    private  maxCollisions:number = 3
    //碰撞次数
    private  collisionCount:number = 3
    //消除动画的速度
    private  durations:number = 1


    onLoad(){
            this.GD_YB.active = false
            this.lastCollisionTime = 0; // 上次碰撞发生的时间
            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
            this.getGD_DD()

    }

    start () {


    }


    update(dt) {
        let downs = this.DownNode.children;
        let downsLength = downs.length;
        let visited = new Set(); // 用于记录已经检查过的节点

        if (downsLength>4){


        // 深度优先搜索函数
        const dfs = (node, nodes) => {
            visited.add(node.uuid); // 标记当前节点为已访问
            let connectedNodes = [node]; // 存储与当前节点相连的所有节点
            for (let i = 4; i < nodes.length; i++) {
                if (node !== nodes[i] && nodes[i]._name === "gd" && !visited.has(nodes[i].uuid)) {
                    if (this.verifyCollision(node, nodes[i],true)) {
                        connectedNodes = connectedNodes.concat(dfs(nodes[i], nodes));
                    }
                }
            }
            return connectedNodes;
        };
        // 检查所有节点
        var lastElement = downs[downsLength - 1]
        for (let i = 4; i < downs.length; i++) {
            //明天继续判断怎么实现碰撞出声音
            if (i<downsLength-1){
                var bool = this.verifyCollision(lastElement,downs[i],false)
                let currentTime = Date.now();
                // 检查是否碰撞以及是否超过冷却时间
                if (bool&&(currentTime - this.lastCollisionTime) > this.collisionCooldown * 1000&&this.collisionCount < this.maxCollisions){
                    this.lastCollisionTime = currentTime; // 更新上次碰撞时间
                    // 增加碰撞次数
                    this.collisionCount++;
                    console.log("碰撞提醒：物体已碰撞！");
                    // 播放碰撞声音
                    // cc.audioEngine.playEffect(this.collisionSound, false);
                    Layer.inst.showTip({ text: "碰撞提醒：物体已碰撞！", end: cc.v2(0, 100), duration: 0 });
                }
            }

            if (!visited.has(downs[i].uuid)) {
                let connectedNodes = dfs(downs[i], downs);
                // 如果相连的节点数大于等于3，则删除这些节点
                if (connectedNodes.length >= 3) {
                    for (let node of connectedNodes) {
                        this.destroyMergeObjNode(node);
                        this.triggerExplosionAt(node.getComponent("LFMeshSprite").centerPos)
                    }

                    // 可以在这里添加声音提示和日志记录
                    // Layer.inst.showTip({ text: "需要出声音!", end: cc.v2(0, 100), duration: 0 });
                    // console.log("碰撞了并且删除了" + connectedNodes.length + "个方块！");
                }
            }
        }
        }
    }

    //校验两个物体碰撞的算法
    verifyCollision(nodeA, nodeB,bool) {
        const posA = nodeA.getComponent("LFMeshSprite").centerPos
        const posB = nodeB.getComponent("LFMeshSprite").centerPos
        const deltaX = Math.abs(posA.x - posB.x);
        const deltaY = Math.abs(posA.y - posB.y);
        const sumOfRadii = 100;
        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= sumOfRadii){

            if (!bool){
                return true
            }
            if (nodeA.getComponent(cc.Sprite).name==nodeB.getComponent(cc.Sprite).name){
                return true
            }


        }
        return false
    }

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
        // console.log("移动1："+touchPoint)

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
        sprite.name="gd_"+this.GD_old
        bubble.setPosition(touchPoint.x,touchPoint.y);

        this.DownNode.addChild(bubble);

        //碰撞次数清0
        this.collisionCount = 0
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
        // let max = this.SpriteFrames.length-1;
        this.GD_num = Math.floor(Math.random() * (this.GD_max - min + 1)) + min;
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


    //销毁释放mergeObj,传入node
    public destroyMergeObjNode(obj:cc.Node)
    {
        if(!obj)
            return;

        let objMeshSprite = obj.getComponent("LFMeshSprite");
        objMeshSprite.lfGroup.DestroyParticles();
        LFParticleSystem.instance.particleSystem.DestroyParticleGroup(objMeshSprite.lfGroup);
        objMeshSprite.lfGroup = null;
        obj.removeFromParent();
        obj.destroy();
    }

// 触发爆炸效果的函数
    triggerExplosionAt(position) {
        debugger
        let particleNode: cc.Node;

        // 实例化粒子系统预制体
        particleNode = cc.instantiate(this.particlePrefab);


        // particleNode.parent = this.node; // 将粒子系统作为当前节点的子节点
        // particleNode.parent =cc.director.getScene(); // 将粒子系统作为当前节点的子节点
        // 将世界坐标转换为粒子系统父节点的局部坐标
        var newLocalPosition = this.BaoZha.convertToNodeSpaceAR(position);

        particleNode.setPosition(newLocalPosition); // 设置粒子系统的位置

        // 获取粒子系统组件
        var particleSystem = particleNode.getComponent(cc.ParticleSystem);
        this.BaoZha.addChild(particleNode);



        if (particleSystem) {
            particleSystem.resetSystem(); // 播放粒子效果
            let Position2 = this.GuoJiang.convertToWorldSpaceAR(this.GuoJiang.getPosition());
            let PPPosition = this.BaoZha.convertToNodeSpaceAR(Position2)

            //1秒后移动粒子
            this.scheduleOnce(function () {

                var children = this.BaoZha.children;
                for (let i = 0; i < children.length; ++i) {

                    let particle = children[i];
                    //TODO
                    cc.tween(particle)
                        // .to(this.durations, { position: new cc.Vec3(PPPosition.x,PPPosition.y,0) })
                        .to(this.durations, { position: new cc.Vec3(particle.getPosition().x,particle.getPosition().y+100,0) })
                        .call(() => {
                            // particle.destroy()
                        })
                        .start();
                }


                // 移动结束后销毁或回收粒子节点
                // this.scheduleOnce(function () {
                //     // 销毁粒子节点
                //     particleNode.destroy();
                //     // 或回收粒子节点到对象池（需要你自己实现对象池的逻辑）
                //     // this.particlePool.put(particleNode);
                // }, 2); // 假设移动动作持续时间为1秒
            }, 1);
        }
    }



}
