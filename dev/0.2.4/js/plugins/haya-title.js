/**
 * @file [haya-test-title.js -> Haya Screen Title Test]
 * @type Showcase
 * This plugin was created to test my Haya Core and
 * some of my skills on UI/UX. Then, this is a test Title Screen.
 * Althought, this can be used as well.
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.0
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @requires haya.js [Haya Core]
 * =====================================================================
 * @todo [] Responsive | Positions and Dimensions toward the Screen Size
 * @todo [] Basic Options | New Game; Continue; Options; Exit
 * @todo [] Background | With some effects
 * @todo [] Logo | With some animations
 * @todo [] Cursor | For options
 */
(function () {
    'use strict';

    DataManager.setupNewGame = function() {
        this.createGameObjects();
        this.selectSavefileForNewGame();
        $gameParty.setupStartingMembers();
        $gamePlayer.reserveTransfer($dataSystem.startMapId,
            $dataSystem.startX, $dataSystem.startY);
        Graphics.frameCount = 0;
        print($gamePlayer, $gamePlayer.isTransferring())
    };

    
    Scene_Boot.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        SoundManager.preloadImportantSounds();

        if (Haya.Sprite_Editor) {
            SceneManager.goto(Haya.Sprite_Editor.Editor)

            return;
        }

        if (DataManager.isBattleTest()) {
            DataManager.setupBattleTest();
            SceneManager.goto(Scene_Battle);
        } else if (DataManager.isEventTest()) {
            DataManager.setupEventTest();
            SceneManager.goto(Scene_Map);
        } else {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            SceneManager.goto(Scene_Title);
            Window_TitleCommand.initCommandPosition();
        }
        this.updateDocumentTitle();
    };
    


    Scene_Title.prototype.commandNewGame = function () {
        //DataManager.setupNewGame();
        this._commandWindow.close();
        this.fadeOutAll();
        //console.log($dataSystem);

        Haya.Map.map = Haya.Map.library.mapInfo.find(el => el && el.id === $dataSystem.startMapId).name
        if (Haya.hasOwnProperty('Map_Editor'))  {
            Haya.Map.scene = Haya.Map_Editor.Editor;
        } else {
            Haya.Map.scene = Scene_Map;
        }

        //console.log($gamePlayer, 'player');
        

        SceneManager.goto(Loader_Map);
    };

})();