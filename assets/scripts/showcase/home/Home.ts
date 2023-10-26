import Layer from "../../common/cmpt/base/Layer";
import {DirUrl, ResUrl} from "../../common/const/Url";
import Res from "../../common/util/Res";
import {CommonData} from "../../common/const/CommonData";
import ProgressBar from "../loading/ProgressBar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Home extends cc.Component {

    private spriteFrameList: cc.SpriteFrame[] = null;
    // 果冻精灵集数组
    public GDSprites: cc.SpriteAtlas[] = [];
    //果冻精灵图片数组
    public SpriteFrames = [];


    private onClickGame() {

        Layer.inst.showLoading()
        ProgressBar.lab_num = "1 / 3";
        ProgressBar.title = "努力加载背景资源中...";
        this.getBjData().then(() => {
            Layer.inst.hideLoadingTwo()
            ProgressBar.lab_num = "2 / 3";
            ProgressBar.title = "努力加载游戏资源中...";

            this.getGDSprites().then(() => {
                Layer.inst.hideLoadingTwo()
                ProgressBar.lab_num = "3 / 3";
                ProgressBar.title = "努力加载页面中...";

                Layer.inst.enterMain(ResUrl.PREFAB.Game_GD);
            })

        })
    }

    async getBjData(){
        this.spriteFrameList =  await Res.loadDir(DirUrl.BJ, cc.SpriteFrame, false);
        CommonData.instance.setData("getBjData", this.spriteFrameList);
    }


    async getGDSprites(){
        this.GDSprites = await Res.loadDir(DirUrl.GD, cc.SpriteAtlas, false);
        for (let gdSprite of this.GDSprites) {
            this.SpriteFrames.push(gdSprite.getSpriteFrames()[0])
        }
        CommonData.instance.setData("GDSpriteFrames", this.SpriteFrames);

    }


}
