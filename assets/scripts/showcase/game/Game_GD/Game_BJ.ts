import Res from "../../../common/util/Res";
import {DirUrl} from "../../../common/const/Url";
import ResSprite from "../../../common/cmpt/ui/res/ResSprite";
import requireComponent = cc._decorator.requireComponent;
import SpriteFrame = cc.SpriteFrame;
import {CommonData} from "../../../common/const/CommonData";
import PZ from "./PZ";

const {ccclass, property} = cc._decorator;
import * as LiquidFun from "../../../Box2D/Common/b2Settings";

@ccclass
@requireComponent(ResSprite)
export default class NewClass extends cc.Component {

    private _sprite: ResSprite = null;
    private spriteFrameList: SpriteFrame[] = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.loadDirImage()
        // let physic=cc.director.getPhysicsManager();
        // physic.enabled=true;

    }

    start () {
    }

    //加载背景资源
    loadDirImage(){
        this.spriteFrameList = CommonData.instance.getData("getBjData");

        //生成随机背景,0-长度
        let bg_num = Math.floor(Math.random() * this.spriteFrameList.length);
        //动态引入背景图
        // this.bg.spriteFrame = this.bg_img[bg_num];
        this._sprite = this.getComponent(ResSprite);
        this._sprite.spriteFrame = this.spriteFrameList[bg_num];
    }

    // update (dt) {}
}
