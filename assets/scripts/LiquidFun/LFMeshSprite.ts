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

    sprite:cc.Sprite=null;

    //精灵mesh顶点
    public vertices=null;

    //物理group对象
    public lfGroup=null;

    public stopUpdate:boolean=false;

    //merge对象
    public mergeObj:MergeObj=null;

    public firstPos:cc.Vec2=cc.v2(0,0);
    public lastPos:cc.Vec2=cc.v2(0,0);
    //中心坐标
    public centerPos:cc.Vec2=cc.v2(0,0);

    //sprite纹理宽度
    public static spriteWidth=514;

    // 缓存的变量，用于减少重复创建对象
    private tempWorldPos: cc.Vec2 = cc.v2(0, 0);
    private tempNodePos: cc.Vec2 = cc.v2(0, 0);
    private tempStartToEnd: cc.Vec2 = cc.v2(0, 0);

    onLoad ()
    {
        this.sprite=this.node.getComponent(cc.Sprite);
        let originFrame=this.sprite.spriteFrame;
        this.sprite.spriteFrame=originFrame.clone();

        //拷贝精灵帧的顶点
        this.sprite.spriteFrame.vertices={};
        this.vertices=this.sprite.spriteFrame.vertices;

        this.vertices.x = [];
        this.vertices.y = [];
        this.vertices.nu = [];
        this.vertices.nv = [];
        this.vertices.triangles = [];

    }

    start () {

    }

    public syncVertices()
    {
        this.sprite.setVertsDirty();
    }


    update(dt) {
        if (this.node.width <= 0 || this.node.height <= 0 || this.stopUpdate)
            return;

        if (this.lfGroup !== null && this.vertices !== null && this.mergeObj !== null) {
            const linePointsNum = this.mergeObj.softBodyKeyPointsPerLine;
            const spriteWidth = this.mergeObj.spriteWidth;
            const particleSystem = LFParticleSystem.instance.particleSystem;
            const particles = particleSystem.GetPositionBuffer();
            const scale = PhysicManager.scale;
            const halfSpriteWidth = spriteWidth * 0.5;
            const lfMeshSpriteWidth = LFMeshSprite.spriteWidth / spriteWidth;
            // 基于当前粒子数预分配顶点数组长度
            const particleCount = this.lfGroup.m_lastIndex - this.lfGroup.m_firstIndex;
            if (this.vertices.x.length !== particleCount) {
                this.vertices.x.length = particleCount;
                this.vertices.y.length = particleCount;
                this.vertices.nu.length = particleCount;
                this.vertices.nv.length = particleCount;
            }

            for (let i = this.lfGroup.m_firstIndex; i < this.lfGroup.m_lastIndex; i++) {
                const idx = i - this.lfGroup.m_firstIndex;
                if (particles[i]) {
                    this.tempWorldPos.x = particles[i].x * scale;
                    this.tempWorldPos.y = particles[i].y * scale;
                    // 将物理坐标转换为精灵的本地坐标
                    this.tempNodePos = this.node.convertToNodeSpaceAR(this.tempWorldPos);
                    // 计算顶点位置和纹理坐标
                    let xpos = (this.tempNodePos.x + halfSpriteWidth) * lfMeshSpriteWidth;
                    let ypos = (-this.tempNodePos.y + halfSpriteWidth) * lfMeshSpriteWidth;
                    let nu = (idx % linePointsNum) / (linePointsNum - 1);
                    let nv = 1 - Math.floor(idx / linePointsNum) / (linePointsNum - 1);
                    // 使用索引访问和分配顶点数据
                    this.vertices.x[idx] = xpos;
                    this.vertices.y[idx] = ypos;
                    this.vertices.nu[idx] = nu;
                    this.vertices.nv[idx] = nv;

                    // 更新 firstPos 和 lastPos
                    if (i === this.lfGroup.m_firstIndex) {
                        this.firstPos.x = this.tempWorldPos.x;
                        this.firstPos.y = this.tempWorldPos.y;
                    } else if (i === this.lfGroup.m_lastIndex - 1) {
                        this.lastPos.x = this.tempWorldPos.x;
                        this.lastPos.y = this.tempWorldPos.y;
                    }
                }
            }

            // 使用 firstPos 和 lastPos 计算中心位置
            this.tempStartToEnd.x = this.lastPos.x - this.firstPos.x;
            this.tempStartToEnd.y = this.lastPos.y - this.firstPos.y;
            let mag = this.tempStartToEnd.mag();
            this.tempStartToEnd.normalizeSelf().multiplyScalar(mag * 0.5);
            this.centerPos.x = this.firstPos.x + this.tempStartToEnd.x;
            this.centerPos.y = this.firstPos.y + this.tempStartToEnd.y;

            // 转换为本地坐标并更新子节点位置（如果有的话）
            let localCenter = this.node.convertToNodeSpaceAR(this.centerPos);
            if (this.node.childrenCount > 0) {
                this.node.children[0].setPosition(localCenter.x, localCenter.y + this.node.width * 0.5 + 20);
            }

            // 填充三角形索引数组
            if (this.vertices.triangles.length !== (linePointsNum - 1) * (linePointsNum - 1) * 6) {
                this.vertices.triangles = new Array((linePointsNum - 1) * (linePointsNum - 1) * 6);
            }
            let triIdx = 0;
            for (let j = 0; j < linePointsNum - 1; j++) {
                let startIdx = j * linePointsNum;
                for (let i = 0; i < linePointsNum - 1; i++) {
                    this.vertices.triangles[triIdx++] = startIdx + i;
                    this.vertices.triangles[triIdx++] = startIdx + i + 1;
                    this.vertices.triangles[triIdx++] = startIdx + i + 1 + linePointsNum;
                    this.vertices.triangles[triIdx++] = startIdx + i + 1 + linePointsNum;
                    this.vertices.triangles[triIdx++] = startIdx + i + linePointsNum;
                    this.vertices.triangles[triIdx++] = startIdx + i;
                }
            }

            // 更新顶点数据
            this.syncVertices();
        }
    }
}
