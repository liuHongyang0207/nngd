import PhysicManager from "./PhysicManager";

const {ccclass, property} = cc._decorator;

import * as LiquidFun from "../Box2D/Common/b2Settings";

@ccclass
export default class LFParticleSystem extends cc.Component {

    private particleSystemDef=null;
    public particleSystem=null;

    public static instance=null;

    onLoad()
    {
        LFParticleSystem.instance=this;
        cc.game.addPersistRootNode(this.node);
        this.init();
    }

    start()
    {

    }

    //初始化liquidFun变量
    public init()
    {
        if (!CC_EDITOR)
        {
            this.createParticleSystem();
        }
    }

    //创建liquidFun粒子系统
    public createParticleSystem()
    {
        this.particleSystemDef=new LiquidFun.b2ParticleSystemDef();
        this.particleSystemDef.radius=10 / PhysicManager.scale;
        this.particleSystem=PhysicManager.physicWorld.CreateParticleSystem(this.particleSystemDef);
    }
}