
export class CommonData {
    private static _instance: CommonData; // 单例实例

    private _data: any = {}; // 存放数据的对象

    /**
     * 获取单例实例
     */
    public static get instance(): CommonData {
        if (!CommonData._instance) {
            CommonData._instance = new CommonData();
        }
        return CommonData._instance;
    }

    /**
     * 设置数据
     * @param key 数据的键
     * @param value 数据的值
     */
    public setData(key: string, value: any): void {
        this._data[key] = value;
    }

    /**
     * 获取数据
     * @param key 数据的键
     * @returns 数据的值
     */
    public getData(key: string): any {
        return this._data[key];
    }
}