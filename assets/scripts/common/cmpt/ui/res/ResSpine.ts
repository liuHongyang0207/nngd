import Res from "../../../util/Res";


const { ccclass, menu, disallowMultiple, requireComponent } = cc._decorator;



/**
 * spine组件，自动管理资源的引用计数
 */
@ccclass
@disallowMultiple
@requireComponent(cc.RenderComponent)
@menu("Framework/UI组件/ResSpine")
export default class ResSpine extends cc.Component {
    // 动态加载的资源
    private _asset: cc.Asset = null;

    private _url: string = "";

    private _spine: cc.RenderComponent = null;
    private get spine(): cc.RenderComponent {
        if (!this._spine) {
            this._spine = this.getComponent(cc.RenderComponent);
        }
        return this._spine;
    }

    public get skeletonData(): cc.Asset {
        return this.spine.skeletonData;
    }
    public set skeletonData(v: cc.Asset) {
        if (!this.isValid || this.spine.skeletonData === v) {
            return;
        }
        v?.addRef();
        this._asset?.decRef();
        this._asset = v;
        this.spine.skeletonData = v;
    }

    protected onDestroy(): void {
        this._asset?.decRef();
    }

    /**
     * 设置skeletonData
     * @param url 骨骼资源路径，规则同Res加载路径
     */
    public async setSkeletonData(url: string): Promise<void> {
        this._url = url;
        let result = Res.get(url, cc.Asset) || await Res.load(url, cc.Asset);
        // 如短时间内多次调用，需保证使用最后一次加载的资源
        if (result instanceof cc.Asset && this._url === url) {
            this.skeletonData = result;
        }
    }
}
