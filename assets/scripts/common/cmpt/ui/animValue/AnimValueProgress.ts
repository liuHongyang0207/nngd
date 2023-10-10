import AnimValue from "./AnimValue";

const { ccclass, property, menu, requireComponent, executeInEditMode } = cc._decorator;

/**
 * 数值渐变的进度条
 */
@ccclass
@executeInEditMode
@requireComponent(cc.ProgressBar)
@menu("Framework/UI组件/AnimValueProgress")
export default class AnimValueProgress extends AnimValue {

    private _progressBar: cc.ProgressBar = null;
    public get progressBar(): cc.ProgressBar {
        if (!this._progressBar) this._progressBar = this.getComponent(cc.ProgressBar);
        return this._progressBar;
    }

    /**
     * @override
     */
    protected onAnimUpdate(): void {
        this.progressBar.progress = this.curValue;
    }
}
