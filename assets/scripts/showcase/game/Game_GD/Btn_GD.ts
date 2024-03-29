import Prefab = cc.Prefab;
import EventTouch = cc.Event.EventTouch;
import Layer from "../../../common/cmpt/base/Layer";
import {CommonData} from "../../../common/const/CommonData";
import LFParticleSystem from "../../../LiquidFun/LFParticleSystem";
import * as LiquidFun from "../../../Box2D/Common/b2Settings";
import AnimValueLabel from "../../../common/cmpt/ui/animValue/AnimValueLabel";
import DataList from "./Btn_GD_Data";
import audioUtils from "../../../showcase/dialog/DlgAudio";
import AudioManager, { SfxType } from "../../../common/util/AudioManager";
import Res from "../../../common/util/Res";
import {ResUrl} from "../../../common/const/Url";
import ShakeNode from "../../../common/cmpt/ui/ShakeNode";



const {ccclass, property} = cc._decorator;

@ccclass
export default class Btn_GD extends cc.Component {
    // 果冻Prefab
    @property(Prefab)
    public GDPrefab: Prefab = null;
    //果冻精灵图片数组
    public SpriteFrames = CommonData.instance.getData("GDSpriteFrames");
    //上部block
    @property(cc.Node)
    DownNode = null
    //预生成的果冻
    @property(cc.Node)
    GD_YB = null
    //金币
    @property(cc.Prefab)
    coinPrefab = null

    coinPool: cc.NodePool = null;

    //渐变数字
    @property(AnimValueLabel)
    public animLab: AnimValueLabel = null;

    //音乐类
    public audioUtils: audioUtils = null;

    //预生成的粒子
    @property(cc.Node)
    GuoJiang = null


    //初始化游戏的数据
    private dataList: any = null


    //果冻精灵，这个是最新的
    private GD_num = 0;
    //果冻精灵，这个是即将生成的
    private GD_old = 0;
    //生成果冻的最大数
    private GD_max = 0;
    //点击时间间隔
    private clickInterval: number = 0.4;
    //定时器数量
    private count: number = 0;
    //是否在规定时间内
    private isTime: boolean = false;
    //开始点击事件
    private isStart: boolean = false;

    // 碰撞冷却时间
    private collisionCooldown: number = 1
    // 上次碰撞发生的时间
    private lastCollisionTime: number = 0
    // 允许的最大碰撞次数
    private maxCollisions: number = 3
    //碰撞次数-可以出声音
    private collisionCount: number = 3
    //定义碰撞的半径长度
    private sumOfRadii: number = 110

    //初始化倒计时的Label
    private showTime: cc.Node = null

    //第二关是否开始
    private isTwo: boolean = false;

    //用于记录已经检查过的节点
    private visited = new Set();

    //加一个消除的锁
    private isDelete = false




    onLoad() {


        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this,true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this,true);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this,true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this,true);
        this.getGD_DD()

        //加载水波纹
        this.coinPool = new cc.NodePool();
        this.initCoinPool();


        this.dataList = this.node.getComponent(DataList)
        this.audioUtils = this.node.getComponent(audioUtils)


    }

    startGame(){
        //暂停游戏
        this.node.pauseSystemEvents(true);
        //开始倒计时
        let countdown = 3; // 初始倒计时时间
        let StartLabel = this.node.getChildByName("Start").getChildByName("startNum").getComponent(cc.Label)

        this.node.getChildByName("Start").active = true

        StartLabel.string = "Ready.."; // 更新 Label 显示的倒计时数字
        // 执行字体动画
        const scaleAction = cc.scaleTo(0.7, 0.7); // 缩放动画，从原始大小缩放至 0.5 倍
        StartLabel.node.runAction(scaleAction);
        setTimeout(() => {
            StartLabel.string = ""
            StartLabel.node.scale = 1
        }, 900); // 0.5秒 = 500毫秒

        setTimeout(() => {
            //播放倒计时音效
            this.audioUtils.onClickSfx1("sfx_321")
        }, 1000); // 0.5秒 = 500毫秒
        this.schedule(() => {
            if (countdown > 0) {
                StartLabel.string = countdown.toString(); // 更新 Label 显示的倒计时数字
                // 执行字体动画
                const scaleAction = cc.scaleTo(0.7, 0.7); // 缩放动画，从原始大小缩放至 0.5 倍
                StartLabel.node.runAction(scaleAction);
                countdown--;
            } else {
                //恢复游戏
                this.node.resumeSystemEvents(true);
                this.node.getChildByName("Start").active = false
                this.unscheduleAllCallbacks(); // 停止定时器
                this.onCountdownEnd(); // 倒计时结束后执行其他方法
            }
            setTimeout(() => {
                StartLabel.string = ""
                StartLabel.node.scale = 1
            }, 900); // 0.5秒 = 500毫秒
        }, 1, 3); // 1 秒间隔，重复 3 次
    }

    onCountdownEnd() {
        // 倒计时结束后执行的其他方法
        //初始化倒计时的Label
        this.showTime = this.node.getChildByName("Level").getChildByName("showTime")


        //初始化第一关数据
        this.initDate(this.dataList.firstData.firstNumber, this.dataList.firstData.leveTitle, this.dataList.firstData.GD_number, 1)
        //初始化背景音乐
        this.audioUtils.onClickBgm1FadeIn()
    }


    start() {
        //开始游戏
        this.startGame()

    }

    // 深度优先搜索函数
    private dfs = (node, nodes) => {
        this.visited.add(node.uuid); // 标记当前节点为已访问
        let connectedNodes = [node]; // 存储与当前节点相连的所有节点
        for (let i = 4; i < nodes.length; i++) {
            if (node !== nodes[i] && nodes[i]._name === "gd" && !this.visited.has(nodes[i].uuid)) {
                if (this.verifyCollision(node, nodes[i], true)) {
                    connectedNodes = connectedNodes.concat(this.dfs(nodes[i], nodes));
                }
            }
        }
        return connectedNodes;
    };

    update(dt) {
        let downs = this.DownNode.children;
        let downsLength = downs.length;
        if (downsLength > 4) {
            // 检查所有节点
            // var lastElement = downs[downsLength - 1]
            for (let i = 4; i < downs.length; i++) {
                //明天继续判断怎么实现碰撞出声音
                // if (i < downsLength - 1) {
                //     var bool = this.verifyCollision(lastElement, downs[i], false)
                //     let currentTime = Date.now();
                //     // 检查是否碰撞以及是否超过冷却时间
                //     if (bool && (currentTime - this.lastCollisionTime) > this.collisionCooldown * 1000 && this.collisionCount < this.maxCollisions) {
                //         this.lastCollisionTime = currentTime; // 更新上次碰撞时间
                //         // 增加碰撞次数
                //         this.collisionCount++;
                //         console.log("碰撞提醒：物体已碰撞！");
                //         // 播放碰撞声音
                //         // cc.audioEngine.playEffect(this.collisionSound, false);
                //         // Layer.inst.showTip({text: "碰撞提醒：物体已碰撞！", end: cc.v2(0, 100), duration: 0});
                //     }
                // }

                // if (!visited.has(downs[i].uuid)) {
                    //清空set，因为要重新计算是否有相交
                    this.visited.clear()
                    let connectedNodes = this.dfs(downs[i], downs);
                    // 如果相连的节点数大于等于3，则删除这些节点
                    if (connectedNodes.length >= 3) {
                        if (!this.isDelete){
                            this.deletes(connectedNodes)
                        }
                        // 可以在这里添加声音提示和日志记录
                        // Layer.inst.showTip({ text: "需要出声音!", end: cc.v2(0, 100), duration: 0 });
                        // console.log("碰撞了并且删除了" + connectedNodes.length + "个方块！");
                    }
                // }
            }
        }
    }

    //消除的方法
    deletes(connectedNodes){
        this.isDelete = true
        for (let node of connectedNodes) {
            node.addComponent("ShaderShining");
        }
        setTimeout(() => {
            // //消除的音效
            this.audioUtils.onClickSfx1("sfx_xiaochu01")
            for (let node of connectedNodes) {
                if (node.name=="gd"){
                    this.triggerExplosionAt(node)
                    console.log("删除")
                }
            }
            connectedNodes = null
            this.isDelete = false
        }, 500); // 0.5秒 = 500毫秒
    }

    //校验两个物体碰撞的算法
    verifyCollision(nodeA, nodeB, bool) {
        const posA = nodeA.getComponent("LFMeshSprite").centerPos
        const posB = nodeB.getComponent("LFMeshSprite").centerPos
        const deltaX = Math.abs(posA.x - posB.x);
        const deltaY = Math.abs(posA.y - posB.y);
        const sumOfRadii = this.sumOfRadii;
        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= sumOfRadii) {

            if (!bool) {
                return true
            }
            if (nodeA.getComponent(cc.Sprite).name == nodeB.getComponent(cc.Sprite).name) {
                return true
            }


        }
        return false
    }

    onTouchStart(event:EventTouch) {
        //判断是否在有效范围内生成果冻
        if (!this.boolPos(event.getLocation(),this.DownNode)){
            return;
        }
        //获取最后一个果冻，判断是否已经越过生成的线，避免两个果冻生成碰撞
        let downs = this.DownNode.children;
        let downsLength = downs.length;
        if (downsLength > 4) {
            if ( this.getChu(downs[downsLength-1])) {
                Layer.inst.showTip({text: "点击太快啦！", end: cc.v2(0, 100), duration: 0});
                this.isStart = true
                return
            }
        }
        this.isStart = false
        this.GD_YB.active = true
        let touchPoint = event.getLocation();
        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)

        this.getGD_YB(this.getPositions(touchPoint));
    }


    onTouchMove(event: EventTouch) {
        //如果预制果冻没有生成
        if (this.GD_YB.active==false){
            return;
        }

        if (this.isStart) {
            return
        }

        let touchPoint = event.getLocation();

        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)
        this.GD_YB.setPosition(this.getPositions(touchPoint).x, 330);
    }


    onTouchEnd(event: EventTouch) {

        //如果预制果冻没有生成
        if (this.GD_YB.active==false){
            return;
        }

        if (this.isStart) {
            return
        }
        this.GD_YB.active = false
        let touchPoint = event.getLocation();
        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)
        touchPoint.y = 420
        this.getGD(this.getPositions(touchPoint));

    }

    onTouchCancel(event: EventTouch) {

        //如果预制果冻没有生成
        if (this.GD_YB.active==false){
            return;
        }

        if (this.isStart) {
            return
        }
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
        sprite.name = "gd_" + this.GD_old
        bubble.setPosition(touchPoint.x, touchPoint.y);

        this.DownNode.addChild(bubble);

        //碰撞次数清0
        this.collisionCount = 0
        this.audioUtils.onClickSfx1("click")
    }

    //预生成的果冻
    getGD_YB(touchPoint) {
        let sprite = this.GD_YB.getComponent(cc.Sprite);
        sprite.spriteFrame = this.SpriteFrames[this.GD_num]
        this.GD_YB.setPosition(touchPoint.x, 330);
        this.GD_old = this.GD_num
        this.getGD_DD()
    }


    getGD_DD() {
        let min = 0;
        // let max = this.SpriteFrames.length-1;
        this.GD_num = Math.floor(Math.random() * (this.GD_max - min)) + min;
        let nextNode = this.node.getChildByName("Next");

        // 获取Next节点上的gd组件
        let gdComponent = nextNode.getComponentInChildren(cc.Sprite);
        gdComponent.spriteFrame = this.SpriteFrames[this.GD_num]
    }


    getPositions(touchPoint) {
        if (touchPoint.x < -225) {
            touchPoint.x = -225
        } else if (touchPoint.x > 225) {
            touchPoint.x = 225
        }

        return touchPoint
    }

    //判断是否碰撞
    getChu(nodeA){
        return  nodeA.getComponent("LFMeshSprite").centerPos.y > 867
    }

    onDestroy() {
        this.unscheduleAllCallbacks()
    }


    //销毁释放mergeObj,传入node
    public destroyMergeObjNode(obj: cc.Node) {
        if (!obj)
            return;

        let objMeshSprite = obj.getComponent("LFMeshSprite");
        objMeshSprite.lfGroup.DestroyParticles();
        LFParticleSystem.instance.particleSystem.DestroyParticleGroup(objMeshSprite.lfGroup);
        objMeshSprite.lfGroup = null;
        obj.removeFromParent();
        obj.destroy();
    }

    // 触发爆炸效果的函数
    triggerExplosionAt(node: cc.Node) {
        // //消除
        this.destroyMergeObjNode(node);

        //4、消除特效-果冻浆收集
        this.playAnim(node)

        //判断是否达到第二关
        if (!this.isTwo&&(this.animLab.endValue+5 >= Number(this.dataList.firstData.firstNumber))){
            //第二关开始
            this.isTwo = true

            //第二关动画
            this.TwoLevel()

            //第二关数据初始化
            this.scheduleOnce(function(){
                //初始化第二关
                this.initDate(this.dataList.secondData.endNumber, this.dataList.secondData.leveTitle, this.dataList.secondData.GD_number, 2)
            },2.8)


        }
    }



    private initCoinPool(count: number = 20) {
        for (let i = 0; i < count; i++) {
            let coin = cc.instantiate(this.coinPrefab);
            this.coinPool.put(coin);
        }
    }
    /**开始执行动画 */
    private playAnim(nodeA: cc.Node) {

        let Position2 = this.node.convertToWorldSpaceAR(this.GuoJiang.getPosition());
        let PPPosition = this.DownNode.convertToNodeSpaceAR(Position2)

        // let randomCount = Math.random() * 15 + 10;
        let randomCount = 5;
        let stPos = this.DownNode.convertToNodeSpaceAR(nodeA.getComponent("LFMeshSprite").centerPos);
        let edPos = PPPosition;
        this.playCoinFlyAnim(randomCount, stPos, new cc.Vec2(edPos.x, edPos.y - 120));
    }
    // 确保当前节点池有足够的金币
    private playCoinFlyAnim(count: number, stPos: cc.Vec2, edPos: cc.Vec2, r: number = 130) {
        const poolSize = this.coinPool.size();
        const reCreateCoinCount = poolSize > count ? 0 : count - poolSize;
        this.initCoinPool(reCreateCoinCount);
        // 生成圆，并且对圆上的点进行排序
        let points = this.getCirclePoints(r, stPos, count);
        let coinNodeList = points.map(pos => {
            let coin = this.coinPool.get();
            coin.setPosition(stPos);
            this.node.addChild(coin);
            return {
                node: coin,
                stPos: stPos,
                mdPos: pos,
                edPos: edPos,
                dis: (pos as any).sub(edPos).mag()
            };
        });
        coinNodeList = coinNodeList.sort((a, b) => {
            if (a.dis - b.dis > 0) return 1;
            if (a.dis - b.dis < 0) return -1;
            return 0;
        });

        // 执行金币落袋的动画
        coinNodeList.forEach((item, idx) => {
            item.node.runAction(
                cc.sequence(
                    cc.moveTo(0.3, item.mdPos),
                    cc.delayTime(idx * 0.04),
                    cc.moveTo(0.8, item.edPos),
                    cc.callFunc(() => {
                        this.coinPool.put(item.node);
                    })
                )
            );
        });
        //缓动分数
        this.animLab.setValue(this.animLab.endValue + 5);


    }

    /**
     * 以某点为圆心，生成圆周上等分点的坐标
     *
     * @param {number} r 半径
     * @param {cc.Vec2} pos 圆心坐标
     * @param {number} count 等分点数量
     * @param {number} [randomScope=80] 等分点的随机波动范围
     * @returns {cc.Vec2[]} 返回等分点坐标
     */
    private getCirclePoints(r: number, pos: cc.Vec2, count: number, randomScope: number = 60): cc.Vec2[] {
        let points = [];
        let radians = (Math.PI / 180) * Math.round(360 / count);
        for (let i = 0; i < count; i++) {
            let x = pos.x + r * Math.sin(radians * i);
            let y = pos.y + r * Math.cos(radians * i);
            points.unshift(cc.v3(x + Math.random() * randomScope, y + Math.random() * randomScope, 0));
        }
        return points;
    }

    //初始化关卡数据
    initDate(target: string, leveTitle: string, GD_Number: number, levelNumber: number) {

        //如果是第一关
        if (levelNumber == 1) {
            this.GD_YB.active = false
            this.lastCollisionTime = 0; // 上次碰撞发生的时间
            this.animLab.getComponent(cc.Label).string = "0";
            //初始化倒计时
            this.countDownTime(this.dataList.firstData.firstLevelTime, 0)
        } else {
            //清除倒计时
            this.unscheduleAllCallbacks()
            //将倒计时屏蔽
            this.showTime.active = false

        }
        //初始化果冻数
        this.GD_max = GD_Number
        //初始化分数
        this.GuoJiang.getChildByName("target").getComponent(cc.Label).string = target
        //初始化关卡
        this.node.getChildByName("Level").getChildByName("levelTitle").getComponent(cc.Label).string = leveTitle


    }

    //修改第一关的倒计时
    updateShowTime(string: string) {
        this.showTime.getComponent(cc.Label).string = string
    }

    //倒计时函数
    countDownTime(setSecondTime: number, type: number) {//以秒计算时间差 每三分钟恢复1个血量总共18个血量，恢复满需要 54min
        let fenzhong = Math.floor(setSecondTime / 60) //向下取整
        let miaoshu = Math.floor(setSecondTime % 60) //取余数


        this.schedule(() => {
                // ...你的定时器代码
                if (miaoshu == 0) {
                    fenzhong = fenzhong - 1;
                    miaoshu = 60;
                }
                miaoshu = miaoshu - 1;
                switch (type) {
                    //0等于第一关的倒计时
                    case 0:
                        this.showTime.active = true
                        this.updateShowTime(String(fenzhong) + ":" + String(miaoshu))
                        console.log(String(fenzhong) + ":" + String(miaoshu))

                        //判断是否剩下最后10s钟
                        if (fenzhong == 0 && miaoshu == 10){
                            //播放倒计时音乐
                            this.startScaleAction(this.showTime)
                            this.audioUtils.onClickSfx1("countDown")
                            //开始震动
                        }
                        //如果倒计时结束了
                        if (fenzhong == 0 && miaoshu == 0) {
                            //判断分数是否达到
                            if (this.animLab.endValue >= Number(this.dataList.firstData.firstNumber)) {
                                //第二关动画
                                this.TwoLevel()

                                //第二关开始
                                this.isTwo = true

                                this.scheduleOnce(function(){
                                    //初始化第二关
                                    this.initDate(this.dataList.secondData.endNumber, this.dataList.secondData.leveTitle, this.dataList.secondData.GD_number, 2)
                                },2.8)
                                console.log("初始化第二关")
                            } else {
                                //停止倒计时的动作
                                this.showTime.stopAllActions();
                                //播放失败的音乐
                                this.audioUtils.onClickSfx1("lose")
                                this.scheduleOnce(function(){
                                    this.onPauses()
                                    //失败 - 显示失败页面
                                    this.node.getChildByName("layerOver").active = true
                                    console.log("失败了")
                                    this.audioUtils.onClickBgmFadeOut()
                                },0.5)

                            }
                        }
                        break;
                    default:
                        console.log('不满足上述所有case时, 执行默认')
                }
            },1, setSecondTime - 1)


    }

    //暂停游戏
    onPauses() {
        cc.director.pause()
        this.node.pauseSystemEvents(true);
    }

    //恢复游戏
    onResumes() {
        cc.director.resume()
        this.node.resumeSystemEvents(true);
    }

    //点击道具
    onCheckPropOne() {
        this.onPauses()
        //失败 - 显示失败页面
        this.node.getChildByName("layerOver").active = true
    }

    //重新开始
    restartGame() {
        this.audioUtils.onClickBgm1FadeIn()
        //清楚所有的果冻
        let deletes = this.DownNode.children
        let deleteLength = deletes.length
        for (let i = 4; i < deleteLength; i++) {
            this.destroyMergeObjNode(deletes[4])
        }
        //todo 道具归零、复活次数归零
        //初始化第一关数据
        this.onResumes()
        this.scheduleOnce(function(){
            this.node.getChildByName("layerOver").active = false
            this.initDate(this.dataList.firstData.firstNumber, this.dataList.firstData.leveTitle, this.dataList.firstData.GD_number, 1)
        },0.5)
    }

    // 播放背景音乐
    public onClickBgm1FadeIn() {
        // 生成一个 0 到 1 之间的随机数
        let randomNum = Math.random();

        // 根据随机数选择选项
        if (randomNum < 0.5) {
            // 选择第一个选项
            AudioManager.playBgm({ clip: Res.get(ResUrl.AUDIO.BGM1, cc.AudioClip), fadeDuration: 5 });

        } else {
            // 选择第二个选项
            AudioManager.playBgm({ clip: Res.get(ResUrl.AUDIO.BGM2, cc.AudioClip), fadeDuration: 5 });

        }

    }

    //放大缩小
    startScaleAction(node:cc.Node) {
        let scaleUp = cc.scaleTo(this.dataList.otherData.duration / 2, this.dataList.otherData.scaleFactor);
        let scaleDown = cc.scaleTo(this.dataList.otherData.duration / 2, 1);
        let sequence = cc.sequence(scaleUp, scaleDown);
        let repeat = cc.repeatForever(sequence);
        node.runAction(repeat);
    }

    //判断点击的坐标是否在指定位置
    boolPos(touchLocation,childNode){
        let localPos = childNode.convertToNodeSpaceAR(touchLocation);
        let childBoundingBox = childNode.getBoundingBox();
        localPos.y = localPos.y-100

        if (childBoundingBox.contains(localPos)) {
            // 在子节点范围内
            return true
        }
        return false
    }

    //第二关动画
    TwoLevel(){
        let countdown = 1
        let StartLabel = this.node.getChildByName("Start").getChildByName("startNum").getComponent(cc.Label)

        StartLabel.fontSize = 70
        this.node.getChildByName("Start").active = true
        StartLabel.string = " 恭喜第一关通过！"; // 更新 Label 显示的倒计时数字
        // 执行字体动画
        const scaleAction = cc.scaleTo(0.7, 0.7); // 缩放动画，从原始大小缩放至 0.5 倍
        StartLabel.node.runAction(scaleAction);
        setTimeout(() => {
            StartLabel.string = ""
            StartLabel.node.scale = 1
        }, 800); // 0.5秒 = 500毫秒
        this.schedule(() => {
            if (countdown > 0) {
                StartLabel.string = "第二关难度上升~"; // 更新 Label 显示的倒计时数字
                // 执行字体动画
                const scaleAction = cc.scaleTo(0.7, 0.7); // 缩放动画，从原始大小缩放至 0.5 倍
                StartLabel.node.runAction(scaleAction);
                countdown--;
            } else {
                this.node.getChildByName("Start").active = false
                StartLabel.string = ""
                StartLabel.node.scale = 1
                StartLabel.fontSize = 120
            }
            setTimeout(() => {
                StartLabel.string = ""
                StartLabel.node.scale = 1
            }, 800); // 0.5秒 = 500毫秒

        }, 0.9, 2); // 1 秒间隔，重复 3 次

    }

}
