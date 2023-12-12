 
const {ccclass, property} = cc._decorator;
 
@ccclass
export default class gameLoading extends cc.Component {
    @property(cc.Camera)
    mainCamera: cc.Camera = null;
    @property(cc.Node)
    loading_1: cc.Node = null;
    @property(cc.Node)
    loading_2: cc.Node = null;
    @property(cc.Node)
    loading_3: cc.Node = null;
 
    private loadingList: cc.Node[] = [];
    private picIndex: number = 0;
 
    onLoad() {
        this.loadingList = [this.loading_1, this.loading_2, this.loading_3];
    }
 
    start() {
        cc.view.setResizeCallback(() => {
            this.windowChange();
        });
        this.windowChange();
 
        
        // this.showLoadingPicsEff();
    }
 
    private showLoadingPicsEff(fromScale: number = 1, toScale: number = 1.2) {
        let curPic: cc.Node = this.loadingList[this.picIndex];
        curPic.active = true;
        curPic.scale = fromScale;
        cc.tween(curPic).to(0.5, {scale: toScale}).to(0.5, {scale: fromScale})
        .call(() => {
            this.picIndex++;
            if (this.picIndex == 3) {
                this.loadingList.length = 0;
                this.loadMainGameScene();
            }
            else {
                curPic.active = false;
                this.showLoadingPicsEff();
            }
        })
        .start();
    }
 
    private loadMainGameScene() {
        
    }
 
    private windowChange(): void {
        // let frameSizeWidth: number = cc.view.getFrameSize().width;
        // let frameSizeHeight: number = cc.view.getFrameSize().height;
        // if (frameSizeWidth > frameSizeHeight) {
        //     cc.view.setDesignResolutionSize(1280, 720, cc.ResolutionPolicy.FIXED_HEIGHT);
        // }
        // else {
        //     cc.view.setDesignResolutionSize(720, 1280, cc.ResolutionPolicy.FIXED_WIDTH);
        // }
    }
}
 
