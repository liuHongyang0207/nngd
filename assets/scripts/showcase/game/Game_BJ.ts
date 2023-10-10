import Res from "../../common/util/Res";
import {DirUrl} from "../../common/const/Url";
import ResSprite from "../../common/cmpt/ui/res/ResSprite";
import requireComponent = cc._decorator.requireComponent;
import SpriteFrame = cc.SpriteFrame;

const {ccclass, property} = cc._decorator;

@ccclass
@requireComponent(ResSprite)
export default class NewClass extends cc.Component {

    @property(cc.Node) private BJ: cc.Node = null;

    private _sprite: ResSprite = null;
    private spriteFrameList: SpriteFrame[] = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    }

    start () {
        this.loadDirImage()

    }

    //加载背景资源
    async loadDirImage(){
        this.spriteFrameList = await Res.loadDir(DirUrl.BJ, cc.SpriteFrame, false);
        //生成随机背景,0-长度
        let bg_num = Math.floor(Math.random() * this.spriteFrameList.length);
        //动态引入背景图
        // this.bg.spriteFrame = this.bg_img[bg_num];
        this._sprite = this.getComponent(ResSprite);
        this._sprite.spriteFrame = this.spriteFrameList[0];
    }

    // update (dt) {}
}
