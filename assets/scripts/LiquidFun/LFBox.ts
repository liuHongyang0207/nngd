
import PhysicManager, {LFBodyType} from "./PhysicManager";

import * as LiquidFun from "../Box2D/Common/b2Settings";

const {ccclass, property,executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class LFBox extends cc.Component {

    @property
    useGraphicDraw:boolean=true;

    //矩形圆角半径
    @property
    rectRadius:number=0;

    //Liquid body 类型
    @property({type:cc.Enum(LFBodyType)})
    bodyType:LFBodyType=LFBodyType.Static;

    private graphics:cc.Graphics=null;

    //物理属性定义
    private bodyDef=null;

    public body=null;

    private shape=null;

    private fixture=null;

    public inited:boolean=false;


    // LIFE-CYCLE CALLBACKS:

    onLoad ()
    {
    }

    start ()
    {
        this.graphics=this.node.getComponent(cc.Graphics);

        //this.init();

        this.scheduleOnce(()=>{
            this.init();
        },0.5);
    }

    onDestroy()
    {
        //销毁物理
        this.destroyFixture();
        this.destroyBody();
    }

    //初始化liquidFun变量
    public init()
    {
        if(!CC_EDITOR)
        {
            this.bodyDef = new LiquidFun.b2BodyDef();
            this.bodyDef.type = this.bodyType;
            this.bodyDef.allowSleep=true;
            this.bodyDef.angle = this.node.angle * PhysicManager.radToDeg;

            let parentNode=this.node.parent;
            let nodeWorldPos=parentNode.convertToWorldSpaceAR(this.node.getPosition());
            //console.log("** nodeWorldPos="+JSON.stringify(nodeWorldPos));

            this.bodyDef.position = PhysicManager.convertToLiquidWorldPos(nodeWorldPos);

            //this.bodyDef.angle=parentNode.angle * 2 * Math.PI / 360;
            this.bodyDef.angle=(parentNode.angle+ this.node.angle) * 2 * Math.PI / 360;

            this.body = PhysicManager.physicWorld.CreateBody(this.bodyDef);

            //创建shape
            this.shape = new LiquidFun.b2PolygonShape();

            this.shape.SetAsBox(this.node.width * 0.5 / PhysicManager.scale,
                this.node.height * 0.5 / PhysicManager.scale);
            this.fixture=this.body.CreateFixture(this.shape, 1);

            this.inited=true;
        }
    }

    public createFixture()
    {
        if(this.fixture===null && this.body!==null)
            this.fixture=this.body.CreateFixture(this.shape, 1);
    }

    public destroyFixture()
    {
        if(this.fixture!==null)
        {
            this.body.DestroyFixture(this.fixture);
            this.fixture=null;
        }
    }

    public destroyBody()
    {
        if(this.body!==null)
        {
            PhysicManager.physicWorld.DestroyBody(this.body);
            this.body=null;
        }
    }

    //绘制
    public draw()
    {
        if(!this.useGraphicDraw)
            return;

        if(this.graphics===null)
            return;

        /*
        if(this.graphics===null || !this.inited)
            return;*/

        this.graphics.clear();

        this.graphics.roundRect(-this.node.width * 0.5, -this.node.height * 0.5,
            this.node.width, this.node.height, this.rectRadius);
        this.graphics.fill();
    }

    update (dt)
    {

        if(this.body!==null)
        {
            let worldPos=PhysicManager.convertToCCPos(this.body.GetPosition());
            let parentNode=this.node.parent;
            let nodePos=parentNode.convertToNodeSpaceAR(worldPos);
            this.node.setPosition(nodePos);

            this.node.angle=this.body.GetAngle() / PhysicManager.radToDeg;
        }

        if(this.useGraphicDraw)
        {
            this.draw();
        }
    }

    lateUpdate(dt)
    {
    }
}
