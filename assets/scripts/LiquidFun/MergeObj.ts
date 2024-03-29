

const {ccclass, property} = cc._decorator;

@ccclass
export default class MergeObj extends cc.Component {

    //对象等级
    public level:number=0;

    //等级对应的显示宽度
    public spriteWidth:number=80;

    //等级对应的软体每行关键点数量
    public softBodyKeyPointsPerLine:number=2;

    public mergeFlag:boolean=false;

    public mergeTarget:MergeObj=null;

    public inited:boolean=false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    public reset()
    {
        this.level=0;
        this.spriteWidth=80;
        this.softBodyKeyPointsPerLine=2
        this.mergeFlag=false;
        this.mergeTarget=null;
        this.inited=false;
    }

    public init(level:number, spriteWidth:number, keyPointsNum:number)
    {
        this.level=level;
        this.spriteWidth=spriteWidth;
        this.node.width=spriteWidth;
        this.node.height=spriteWidth;
        this.softBodyKeyPointsPerLine=keyPointsNum;
        this.mergeFlag=false;
        this.mergeTarget=null;
        this.inited=true;
    }


    // update (dt) {}
}
