// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import "minigame-api-typings"

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    protected onLoad() {
        this.getIsLH()
    }

    getIsLH(){

        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            // 当前运行环境为微信小游戏sw

            let systemInfo = wx.getSystemInfoSync();
            let safeArea = systemInfo.safeArea;

            if (safeArea.top > 24) {
                console.log("当前为刘海屏");
                console.log("top："+safeArea.top);
                const widget = this.node.getComponent(cc.Widget);
                widget.top = widget.top - safeArea.top-10
                widget.isAbsoluteTop = true;
            } else {
                console.log("当前不是刘海屏");
            }
        }

    }
}
