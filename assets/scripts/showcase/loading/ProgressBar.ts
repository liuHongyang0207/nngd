// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
export type Value = number;

@ccclass
export default class ProgressBar extends cc.Component {

    static num:number = 0
    static title:string = ""


    @property(cc.Label)
    public lab_progress: cc.Label = null;
    @property(cc.Label)
    public lab_prompt: cc.Label = null;


    protected update(dt: number) {

        let progressBar = this.node.getComponent(cc.ProgressBar);
        progressBar.progress = ProgressBar.num;//更新进度条ui的图
        this.lab_progress.getComponent(cc.Label).string= Math.trunc(ProgressBar.num*100)+'%';//更新进度条文字
        this.lab_prompt.getComponent(cc.Label).string= ProgressBar.title;//更新进度条文字
    }

}
