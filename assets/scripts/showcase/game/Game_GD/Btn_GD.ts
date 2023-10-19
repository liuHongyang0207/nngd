
import Prefab = cc.Prefab;
import EventTouch = cc.Event.EventTouch;
import Res from "../../../common/util/Res";
import {DirUrl} from "../../../common/const/Url";
import ResSprite from "../../../common/cmpt/ui/res/ResSprite";
import SpriteAtlas = cc.SpriteAtlas;

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // 果冻Prefab
    @property(Prefab)
    public GDPrefab: Prefab = null;

    // 果冻精灵图片数组
    public GDSprites: SpriteAtlas[] = [];

    public SpriteFrames = [];

    //上部block
    @property(cc.Node)
    DownNode = null

    @property(cc.Node)
    GD_YB = null


    private GD_num = 0;
    private GD_old = 0;

    private _sprite: ResSprite = null;



    onLoad(){
        this.getGDSprites().then(() => {
            this.GD_YB.active = false

            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
            this.getGD_DD()
        })
    }

    start () {

    }

    // update (dt) {}

    onTouchStart (event:EventTouch) {
        this.GD_YB.active = true
        let touchPoint = event.getLocation();
        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)
        // this.getGD(touchPoint);

        this.getGD_YB(this.getPositions(touchPoint));
    }


    onTouchMove (event:EventTouch) {
        let touchPoint = event.getLocation();
        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)

        this.GD_YB.setPosition(this.getPositions(touchPoint).x,330);
    }


    onTouchEnd (event:EventTouch) {
        this.GD_YB.active = false
        let touchPoint = event.getLocation();
        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)
        touchPoint.y = 330
        this.getGD(this.getPositions(touchPoint));

    }
    onTouchCancel (event:EventTouch) {
        this.GD_YB.active = false
        let touchPoint = event.getLocation();
        touchPoint = this.DownNode.convertToNodeSpaceAR(touchPoint)
        touchPoint.y = 330
        this.getGD(this.getPositions(touchPoint));

    }


    getGD(touchPoint) {
        let bubble: cc.Node;
        bubble = cc.instantiate(this.GDPrefab);
        //将 UI 坐标系下的触点位置转换到当前节点坐标系下的触点位置
        // let v3_touchstart = this.parentBlocks.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(v2_touchstart.x,v2_touchstart.y,0))
        // 随机选择一个精灵图片

        let sprite = bubble.getComponent(cc.Sprite);
        sprite.spriteFrame = this.SpriteFrames[this.GD_old]
        bubble.setPosition(touchPoint.x,touchPoint.y);
        this.node.addChild(bubble);

        // this.getGD_DD()
    }

    //预生成的果冻
    getGD_YB(touchPoint){
        let sprite = this.GD_YB.getComponent(cc.Sprite);
        sprite.spriteFrame = this.SpriteFrames[this.GD_num]
        this.GD_YB.setPosition(touchPoint.x,320);
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


    async getGDSprites(){
        this.GDSprites = await Res.loadDir(DirUrl.GD, cc.SpriteAtlas, false);
        for (let gdSprite of this.GDSprites) {
            this.SpriteFrames.push(gdSprite.getSpriteFrames()[0])
        }
    }


    getPositions(touchPoint){
        if (touchPoint.x<-225){
            touchPoint.x = -225
        }else if (touchPoint.x>230){
            touchPoint.x = 230
        }

        return touchPoint
    }

}
