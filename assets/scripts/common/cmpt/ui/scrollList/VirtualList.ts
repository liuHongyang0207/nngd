import EditorTool from "../../../util/EditorTool";
import Tool from "../../../util/Tool";
import VirtualLayout from "./VirtualLayout";

const { ccclass, property, requireComponent, executeInEditMode, disallowMultiple, menu } = cc._decorator;

/** 主元素模板类型 */
export enum MainTemplateType {
    NODE,
    PREFAB
}

/** 副元素模板类型 */
export enum OtherTemplateType {
    NODE,
    PREFAB,
    MAIN_ITEM_CHILD,
}

/** 虚拟列表元素参数类型 */
export interface VirtualArgs { }

/**
 * 虚拟列表主容器
 */
@ccclass("MainLayoutData")
export class MainLayoutData {
    @property({
        type: cc.Node,
        tooltip: CC_DEV && "列表容器节点",
        visible() { return false; }
    })
    public content: cc.Node = null;

    @property({ type: cc.Enum(MainTemplateType) })
    private _templateType: MainTemplateType = MainTemplateType.PREFAB;
    @property({
        type: cc.Enum(MainTemplateType),
        tooltip: CC_DEV && "列表元素模板类型"
    })
    public get templateType(): MainTemplateType { return this._templateType; }
    public set templateType(v: MainTemplateType) {
        if (this._templateType === v) {
            return;
        }
        this._templateType = v;
        this.resetMainItemChild(true);
    }

    @property(cc.Prefab)
    private _templatePrefab: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        tooltip: CC_DEV && "列表元素模板预制体",
        visible() { return this.templateType === MainTemplateType.PREFAB; }
    })
    public get templatePrefab(): cc.Prefab { return this._templatePrefab; }
    public set templatePrefab(v: cc.Prefab) {
        if (this._templatePrefab === v) {
            return;
        }
        this._templatePrefab = v;
        this.resetMainItemChild(true);
    }

    @property(cc.Node)
    private _templateNode: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: CC_DEV && "列表元素模板节点",
        visible() { return this.templateType === MainTemplateType.NODE; }
    })
    public get templateNode(): cc.Node { return this._templateNode; }
    public set templateNode(v: cc.Node) {
        if (this._templateNode === v) {
            return;
        }
        this._templateNode = v;
        this.resetMainItemChild(true);
    }

    public editorCall: (mainItemChild: unknown, refresh: boolean) => void = null;

    /**
     * 更新枚举内容
     * @param refresh 是否强制刷新inspector 
     * @returns 
     */
    public resetMainItemChild(refresh: boolean = false): void {
        if (!CC_EDITOR) {
            return;
        }
        let mainItemChild = {};
        if (this.templateType === MainTemplateType.NODE && this.templateNode) {
            this.templateNode.children.forEach((c, i) => { mainItemChild[c.name] = i; });
        } else if (this.templateType === MainTemplateType.PREFAB && this.templatePrefab) {
            this.templatePrefab.data.children.forEach((c, i) => { mainItemChild[c.name] = i; });
        }
        this.editorCall?.(mainItemChild, refresh);
    }
}

/**
 * 虚拟列表副容器
 */
@ccclass("OtherLayoutData")
export class OtherLayoutData {
    @property({
        type: cc.Node,
        tooltip: CC_DEV && "列表容器节点",
    })
    public content: cc.Node = null;

    @property({
        type: cc.Enum(OtherTemplateType),
        tooltip: CC_DEV && "列表元素模板类型"
    })
    public templateType: OtherTemplateType = OtherTemplateType.PREFAB;

    @property({
        type: cc.Prefab,
        tooltip: CC_DEV && "列表元素模板预制体",
        visible() { return this.templateType === OtherTemplateType.PREFAB; }
    })
    public templatePrefab: cc.Prefab = null;

    @property({
        type: cc.Node,
        tooltip: CC_DEV && "列表元素模板节点",
        visible() { return this.templateType === OtherTemplateType.NODE; }
    })
    public templateNode: cc.Node = null;

    @property({
        type: cc.Enum({}),
        tooltip: CC_DEV && "以列表主元素的子节点作为模板节点",
        visible() { return this.templateType === OtherTemplateType.MAIN_ITEM_CHILD; }
    })
    public templateChild: number = -1;
}

/**
 * 虚拟列表
 */
@ccclass
@disallowMultiple
@executeInEditMode
@requireComponent(cc.ScrollView)
@menu("Framework/UI组件/VirtualList")
export default class VirtualList<T extends VirtualArgs> extends cc.Component {
    @property({ type: MainLayoutData, tooltip: CC_DEV && "列表主容器" })
    public main: MainLayoutData = new MainLayoutData();

    @property({ type: OtherLayoutData, tooltip: CC_DEV && "列表副容器\n需要分层显示时使用，一般用于降低draw call" })
    public others: OtherLayoutData[] = [];

    @property({ tooltip: CC_DEV && "元素节点大小是否一致\n大小不一致时必须提供calcItemSize接口，且暂不支持grid排版" })
    public isFixedSize: boolean = true;

    private _scrollView: cc.ScrollView = null;
    public get scrollView(): cc.ScrollView {
        if (!this._scrollView) {
            this._scrollView = this.getComponent(cc.ScrollView);
        }
        return this._scrollView;
    }

    private _layout: VirtualLayout<T> = null;
    public get layout(): VirtualLayout<T> {
        if (!this._layout) {
            this._layout = this.scrollView.content.getComponent(VirtualLayout);
        }
        return this._layout;
    }

    private _argsArr: T[] = [];
    /** 列表缓存的所有数据 */
    public get argsArr(): T[] { return this._argsArr; }
    public set argsArr(v: T[]) {
        this._argsArr = v;
        this.layout.rearrange();
    }

    private _calcItemSize: (args: T) => cc.Size = null;
    /** 根据参数计算元素大小的接口（isFixedSize为false时必须提供） */
    public get calcItemSize(): (args: T) => cc.Size { return this._calcItemSize; };

    protected onLoad(): void {
        if (CC_EDITOR) {
            this.runEditor();
            return;
        }

        if (this.layout) {
            this.layout.onInit(this);
        }
    }

    protected resetInEditor(): void {
        this.runEditor();
    }

    protected onFocusInEditor(): void {
        this.main.resetMainItemChild();
    }

    /**
     * 编辑器模式下的一些设置
     */
    private runEditor(): void {
        if (!CC_EDITOR) {
            return;
        }
        let scrollView = this.getComponent(cc.ScrollView);
        let layout = scrollView.content.getComponent(VirtualLayout);
        if (!this.main.content) {
            this.main.content = scrollView.content;
        }
        if (!layout) {
            scrollView.content.addComponent(VirtualLayout);
        }
        this.main.editorCall = (mainItemChild: unknown, refresh: boolean): void => {
            let hasChildType = false;
            for (let i = 0; i < this.others.length; i++) {
                if (this.others[i].templateType === OtherTemplateType.MAIN_ITEM_CHILD) {
                    hasChildType = true;
                    break;
                }
            }
            if (hasChildType) {
                EditorTool.setClassAttrPropEnum(OtherLayoutData, "templateChild", cc.Enum["getList"](mainItemChild));
                if (refresh) {
                    EditorTool.refreshSelectedInspector(this.node);
                }
            }
        };
        this.main.resetMainItemChild();
    }

    /**
     * 滚动元素节点到view的指定位置
     * @param idx 元素下标
     * @param itemAnchor 元素的锚点位置（左下角为0点）
     * @param viewAnchor view的锚点位置（左下角为0点）
     * @param t 时间 s
     * @param a 加速度是否衰减，为true且滚动距离大时滚动会不准确
     */
    public scrollItemToView(idx: number, itemAnchor: cc.Vec2 = cc.v2(), viewAnchor: cc.Vec2 = cc.v2(), t: number = 0, a: boolean = true): void {
        this.scrollView.scrollToOffset(this.layout.getScrollOffset(idx, itemAnchor, viewAnchor), t, a);
    }

    /**
     * 滚动到视图顶部
     */
    public scrollToTop(timeInSecond: number = 0, attenuated: boolean = true): void {
        this.scrollView.scrollToTop(timeInSecond, attenuated);
    }

    /**
     * 滚动到视图底部
     */
    public scrollToBottom(timeInSecond: number = 0, attenuated: boolean = true): void {
        this.scrollView.scrollToBottom(timeInSecond, attenuated);
    }

    /**
     * 滚动到视图左部
     */
    public scrollToLeft(timeInSecond: number = 0, attenuated: boolean = true): void {
        this.scrollView.scrollToLeft(timeInSecond, attenuated);
    }

    /**
     * 滚动到视图右部
     */
    public scrollToRight(timeInSecond: number = 0, attenuated: boolean = true): void {
        this.scrollView.scrollToRight(timeInSecond, attenuated);
    }

    /**
     * 根据参数计算元素大小的接口（isFixedSize为false时必须提供）
     */
    public setCalcItemSize(call: (args: T) => cc.Size): void {
        this._calcItemSize = call;
    }

    /**
     * 立即更新布局
     */
    public forceUpdate(): void {
        this.layout.forceUpdate();
    }

    /**
     * 刷新所有激活的item
     */
    public refreshAllItems(): void {
        this.layout.refreshAllItems();
    }

    /**
     * 重置某个元素数据
     * @param index 
     * @param args 元素所需参数
     */
    public reset(index: number, args: T): void {
        if (Tool.inRange(0, this._argsArr.length - 1, index)) {
            this._argsArr[index] = args;
            this.layout.rearrange();
        }
    }

    /**
     * 添加元素数据到尾部
     * @param args 元素所需参数
     */
    public push(args: T): number {
        let result = this._argsArr.push(args);
        this.layout.rearrange(false);
        return result;
    }

    /**
     * 删除尾部元素数据
     */
    public pop(): T {
        let result = this._argsArr.pop();
        this.layout.rearrange();
        return result;
    }

    /**
     * 添加元素数据到头部
     * @param args 
     */
    public unshift(args: T): number {
        let result = this._argsArr.unshift(args);
        this.layout.rearrange();
        return result;
    }

    /**
     * 删除头部元素数据
     */
    public shift(): T {
        let result = this._argsArr.shift();
        this.layout.rearrange();
        return result;
    }

    /**
     * 插入或删除元素 用法同数组splice
     */
    public splice(start: number, deleteCount?: number, ...argsArr: T[]): T[] {
        let result: T[];
        if (deleteCount === undefined) {
            result = this._argsArr.splice(start);
        } else {
            if (argsArr === undefined || argsArr.length === 0) {
                result = this._argsArr.splice(start, deleteCount);
            } else {
                result = this._argsArr.splice(start, deleteCount, ...argsArr);
            }
        }

        this.layout.rearrange();
        return result;
    }

    /**
     * 数据排序
     * @param call 
     */
    public sort(call: (a: T, b: T) => number): T[] {
        let result = this._argsArr.sort(call);
        this.layout.rearrange();
        return result;
    }

    /**
     * 数据过滤
     */
    public filter(call: (value: T, index: number, array: T[]) => boolean): T[] {
        this._argsArr = this._argsArr.filter(call);
        this.layout.rearrange();
        return this._argsArr;
    }
}
