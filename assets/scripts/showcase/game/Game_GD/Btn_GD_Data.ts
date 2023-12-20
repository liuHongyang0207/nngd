// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Btn_GD_Data extends cc.Component {

    public firstData= {};
    public secondData= {};
    public otherData= {};

    onLoad() {
        this.firstData = {
            //初始化第一关倒计时
            firstLevelTime: 60,
            //初始化第一关的目标分数
            firstNumber:"200",
            //初始化果冻数
            GD_number:5,
            //初始化关卡标题
            leveTitle:"第一关",

        }
        this.secondData = {
            //初始化第二关的目标分数
            endNumber:"2000",
            GD_number:7,
            leveTitle:"第二关",
        }
        this.otherData = {
            // 倒计时- 动画持续时间
            duration: 1,
            // 倒计时- 放大倍数
            scaleFactor: 1.2,
        }
    }
}
