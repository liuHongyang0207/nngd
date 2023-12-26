import DialogBase from "../../common/cmpt/base/DialogBase";
import { DirUrl, ResUrl } from "../../common/const/Url";
import AudioManager, { SfxType } from "../../common/util/AudioManager";
import Res from "../../common/util/Res";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DlgAudio extends DialogBase {
    public static pUrl: string = DirUrl.PREFAB_DIALOG + "DlgAudio";

    @property(cc.Slider) public volumeSlider: cc.Slider = null;

    protected onDestroy() {
        AudioManager.stopAll();
    }

    /**
     * @override
     */
    public onOpen() {
        this.onSlide();
    }

    public onSlide() {
        AudioManager.bgmVolume = this.volumeSlider.progress;
        AudioManager.sfxVolume = this.volumeSlider.progress;
    }

    public onClickBgm1FadeIn() {
        var randomIndex = Math.floor(Math.random() * 2);

        if ((randomIndex+1)==1){
            AudioManager.playBgm({ clip: Res.get(ResUrl.AUDIO.BGM1, cc.AudioClip), fadeDuration: 5 });
        }else {
            AudioManager.playBgm({ clip: Res.get(ResUrl.AUDIO.BGM2, cc.AudioClip), fadeDuration: 5 });

        }

    }

    public onClickBgm1OutBgm2In() {
        AudioManager.stopBgm(Res.get(ResUrl.AUDIO.BGM1, cc.AudioClip), 5);
        AudioManager.playBgm({ clip: Res.get(ResUrl.AUDIO.BGM2, cc.AudioClip), fadeDuration: 5 });
    }

    public onClickBgmFadeOut() {
        AudioManager.stopBgm(Res.get(ResUrl.AUDIO.BGM1, cc.AudioClip), 5);
        AudioManager.stopBgm(Res.get(ResUrl.AUDIO.BGM2, cc.AudioClip), 5);
    }

    // 即使多次点击按钮，此音效也始终只会同时播放一个
    public onClickSfx1(type) {
        if (type=="lose"){
            AudioManager.setSfxData(Res.get<cc.AudioClip>(ResUrl.AUDIO.lose, cc.AudioClip), SfxType.NORMAL, 1, false);
            AudioManager.playSfx(Res.get<cc.AudioClip>(ResUrl.AUDIO.lose, cc.AudioClip), SfxType.NORMAL);
        }else if(type=="click"){
            AudioManager.setSfxData(Res.get<cc.AudioClip>(ResUrl.AUDIO.click, cc.AudioClip), SfxType.NORMAL, 1, false);
            AudioManager.playSfx(Res.get<cc.AudioClip>(ResUrl.AUDIO.click, cc.AudioClip), SfxType.NORMAL);

        }else if(type=="countDown"){
            AudioManager.setSfxData(Res.get<cc.AudioClip>(ResUrl.AUDIO.countDown, cc.AudioClip), SfxType.NORMAL, 1, false);
            AudioManager.playSfx(Res.get<cc.AudioClip>(ResUrl.AUDIO.countDown, cc.AudioClip), SfxType.NORMAL);
        }
        else {
            AudioManager.setSfxData(Res.get<cc.AudioClip>(ResUrl.AUDIO.SFX1, cc.AudioClip), SfxType.NORMAL, 1, false);
            AudioManager.playSfx(Res.get<cc.AudioClip>(ResUrl.AUDIO.SFX1, cc.AudioClip), SfxType.NORMAL);
        }

    }

    // 此音效最多同时播放五个
    public onClickSfx2() {
        AudioManager.setSfxData(Res.get<cc.AudioClip>(ResUrl.AUDIO.SFX2, cc.AudioClip), SfxType.NORMAL, 5, false);
        AudioManager.playSfx(Res.get<cc.AudioClip>(ResUrl.AUDIO.SFX2, cc.AudioClip), SfxType.NORMAL);
    }
}
