import Layer from "../../common/cmpt/base/Layer";
import {DirUrl, ResUrl} from "../../common/const/Url";
import Res from "../../common/util/Res";
import {CommonData} from "../../common/const/CommonData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Home extends cc.Component {

    private spriteFrameList: cc.SpriteFrame[] = null;


    private onClickGame() {
        Layer.inst.showLoading()
        this.getBjData().then(() => {
            Layer.inst.hideLoadingTwo()
            Layer.inst.enterMain(ResUrl.PREFAB.Game_GD);
        })
    }

    async getBjData(){
        this.spriteFrameList =  await Res.loadDir(DirUrl.BJ, cc.SpriteFrame, false);
        CommonData.instance.setData("getBjData", this.spriteFrameList);
    }


}
