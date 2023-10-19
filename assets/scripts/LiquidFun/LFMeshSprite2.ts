import LFParticleSystem from "./LFParticleSystem";
import PhysicManager from "./PhysicManager";

import MergeObj from "./MergeObj";


const {ccclass, property} = cc._decorator;

/*
LiquidFun + Mesh类型的精灵
软体精灵添加此组件
 */
@ccclass
export default class LFMeshSprite extends cc.Component {

    sprite: cc.Sprite = null;

    //sprite对象
    //public sprite:cc.Sprite=null;

    //精灵mesh顶点
    public vertices = null;

    //物理group对象
    public lfGroup = null;

    public stopUpdate: boolean = false;

    //merge对象
    public mergeObj: MergeObj = null;

    public firstPos: cc.Vec2 = cc.v2(0, 0);
    public lastPos: cc.Vec2 = cc.v2(0, 0);
    //中心坐标
    public centerPos: cc.Vec2 = cc.v2(0, 0);

    //sprite纹理宽度
    public static spriteWidth = 512;

    //物理group的 startIdx, endIdx
    //public groupStartIdx:number=0;
    //public groupEndIdx:number=0;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }

    start() {
        this.updatess()
    }

    public syncVertices() {
        this.sprite.setVertsDirty();
    }

    /*
    public applyForce()
    {
        if(this.lfGroup!==null)
        {
            this.lfGroup.ApplyForce(new LiquidFun.b2Vec2(0, 4.2));
        }
    }*/

    //
    updatess() {
        if (this.node.width <= 0 || this.node.height <= 0)
            return;

        if (this.lfGroup !== null && this.vertices !== null && this.mergeObj !== null && !this.stopUpdate) {
            let linePointsNum: number = this.mergeObj.softBodyKeyPointsPerLine;
            let spriteWidth: number = this.mergeObj.spriteWidth;

            let particleSystem = LFParticleSystem.instance.particleSystem;
            let particles = particleSystem.GetPositionBuffer();

            // clear vertices
            this.vertices.x.splice(0, this.vertices.x.length);
            this.vertices.y.splice(0, this.vertices.y.length);
            this.vertices.nu.splice(0, this.vertices.nu.length);
            this.vertices.nv.splice(0, this.vertices.nv.length);
            this.vertices.triangles.splice(0, this.vertices.triangles.length);

            //遍历对应particleGroup的物理关键点
            for (let i = this.lfGroup.m_firstIndex; i < this.lfGroup.m_lastIndex; i++) {
                if (!!particles[i]) {
                    //取物理点坐标
                    let x = (particles[i].x) * PhysicManager.scale;
                    let y = (particles[i].y) * PhysicManager.scale;

                    if (i === this.lfGroup.m_firstIndex) {
                        this.firstPos.x = x;
                        this.firstPos.y = y;
                    } else if (i === this.lfGroup.m_lastIndex - 1) {
                        this.lastPos.x = x;
                        this.lastPos.y = y;
                    }

                    let worldPos = cc.v2(x, y);

                    //转到父节点本地坐标系
                    let nodePos = this.node.convertToNodeSpaceAR(worldPos);

                    let xpos: number = (nodePos.x + spriteWidth * 0.5) * (LFMeshSprite.spriteWidth / spriteWidth);
                    let ypos: number = (-nodePos.y + spriteWidth * 0.5) * (LFMeshSprite.spriteWidth / spriteWidth);

                    //填充顶点
                    this.vertices.x.push(xpos);
                    this.vertices.y.push(ypos);

                    //填充uv
                    let idx: number = i - this.lfGroup.m_firstIndex;
                    this.vertices.nu.push((idx % linePointsNum) / (linePointsNum - 1));
                    this.vertices.nv.push(1 - Math.floor(idx / linePointsNum) / (linePointsNum - 1));

                }
            }

            //更新centerPos
            let startToEnd = this.lastPos.sub(this.firstPos);
            let dir = startToEnd.normalize();
            let mag: number = startToEnd.mag();
            this.centerPos = this.firstPos.add(dir.multiplyScalar(mag * 0.5));

            let localCenter = this.node.convertToNodeSpaceAR(this.centerPos);
            if (this.node.childrenCount > 0) {
                this.node.children[0].setPosition(localCenter.x, localCenter.y + this.node.width * 0.5 + 20);
            }

            //顶点索引
            for (let j = 0; j < linePointsNum - 1; j++) {
                let startIdx: number = j * linePointsNum;
                for (let i = 0; i < linePointsNum - 1; i++) {
                    this.vertices.triangles.push(startIdx + i);
                    this.vertices.triangles.push(startIdx + i + 1);
                    this.vertices.triangles.push(startIdx + i + 1 + linePointsNum);

                    this.vertices.triangles.push(startIdx + i + 1 + linePointsNum);
                    this.vertices.triangles.push(startIdx + i + linePointsNum);
                    this.vertices.triangles.push(startIdx + i);
                }
            }
            this.syncVertices();
        }
    }
}
