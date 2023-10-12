import LFParticleSystem from "./LFParticleSystem";


const {ccclass, property} = cc._decorator;

import * as LiquidFun from "../Box2D/Common/b2Settings";

// Liquid 刚体类型
export enum LFBodyType
{
    Static = 0,    // 静态
    Kinematic = 1,    // 运动
    Dynamic = 2,   // 动态
};

@ccclass
export default class PhysicManager extends cc.Component
{

    public static scale: number = 64;

    public static radToDeg: number = Math.PI / 180;

    public timeStep: number = 1 / 60;

    public velocityIterations: number = 8;
    public positionIterations: number = 3;
    public particleIterations: number = 3;

    public gravity = new LiquidFun.b2Vec2(0, -10);

    public static physicWorld = null;

    public static instance = null;

    public updateFlag:boolean=true;

    // LIFE-CYCLE CALLBACKS:

    onLoad()
    {
        console.log("** PhysicManager onLoad");

        PhysicManager.instance = this;
        //physicManager 为常驻对象
        cc.game.addPersistRootNode(this.node);

        PhysicManager.physicWorld = new LiquidFun.b2World(this.gravity);

        window.world = PhysicManager.physicWorld;
    }

    start()
    {

    }

    //开始物理update
    public startPhysicUpdate()
    {
        this.schedule(this.physicUpdate, 1 / 60, cc.macro.REPEAT_FOREVER, 0);
    }

    //停止物理update
    public stopPhysicUpdate()
    {
        this.unschedule(this.physicUpdate);
    }

    public physicUpdate()
    {
        if (!!PhysicManager.physicWorld)
        {
            PhysicManager.physicWorld.Step(this.timeStep, this.velocityIterations, this.positionIterations,
                this.particleIterations);
        }
    }

    //转换为liquid坐标
    public static convertToLiquidWorldPos(nodePos)
    {
        return new LiquidFun.b2Vec2(nodePos.x / PhysicManager.scale, nodePos.y / PhysicManager.scale);
    }

    //转换为cc坐标
    public static convertToCCPos(bodyPos)
    {
        return cc.v2(bodyPos.x * PhysicManager.scale, bodyPos.y * PhysicManager.scale);
    }

    //创建软体物理
    public static createSoftBodyGroup(spriteWidth:number, worldPos:cc.Vec2)
    {
        let groupDef=new LiquidFun.b2ParticleGroupDef();

        //softbody 物理形状
        let width:number=spriteWidth * 0.5;
        let box=new LiquidFun.b2PolygonShape();
        box.SetAsBox(width / PhysicManager.scale, width / PhysicManager.scale);

        //box.m_centroid=physicManager.convertToLiquidWorldPos(nodeWorldPos);
        groupDef.shape=box;
        groupDef.flags=LiquidFun.b2ParticleFlag.b2_elasticParticle;

        //b2_rigidParticleGroup
        //b2_solidParticleGroup
        groupDef.groupFlags=LiquidFun.b2ParticleGroupFlag.b2_solidParticleGroup;
        groupDef.position=PhysicManager.convertToLiquidWorldPos(worldPos);
        groupDef.angularVelocity=0;

        //groupDef.strength=1;

        //创建物理group对象
        let softBodyGroup=LFParticleSystem.instance.particleSystem.CreateParticleGroup(groupDef);
        console.log("** soft firstIdx="+softBodyGroup.m_firstIndex+" lastIdx="+softBodyGroup.m_lastIndex);
        return softBodyGroup;
    }

    update(dt)
    {
        if(this.updateFlag)
            this.physicUpdate();
    }
}
