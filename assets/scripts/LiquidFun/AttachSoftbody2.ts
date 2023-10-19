// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import PhysicManager from "./PhysicManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AttachSoftbody extends cc.Component
{

    displayWidth:number=100;
    // LIFE-CYCLE CALLBACKS:

    onLoad ()
    {
        this.attachSoftbody();
    }

    start () {

    }

    attachSoftbody()
    {
        let mergeComponent = this.node.getComponent("MergeObj");

        let worldPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        //创建物理对象
        let lfSoftBodyGroup =PhysicManager.createSoftBodyGroup(this.displayWidth, worldPos);
        //console.log("** Mass="+lfSoftBodyGroup.GetMass());

        //计算物理网格每行的关键点数量
        let keyPointsNum:number=Math.sqrt( lfSoftBodyGroup.m_lastIndex - lfSoftBodyGroup.m_firstIndex);

        let meshSpriteComponent = this.node.addComponent("LFMeshSprite2");
        meshSpriteComponent.lfGroup = lfSoftBodyGroup;
        meshSpriteComponent.mergeObj = mergeComponent;
        //设置mergeObj参数
        mergeComponent.init(1, this.displayWidth, keyPointsNum);
    }

    // update (dt) {}
}
