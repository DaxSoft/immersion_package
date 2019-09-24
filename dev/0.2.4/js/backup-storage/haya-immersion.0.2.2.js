/**
 * @file [haya_map.js -> Haya - Map]
 * This plugin is under [Work in Progress], then any suggestion, 
 * feedback or some tips, it shall be welcome! Just send me a email :)
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @thanks to Jonforum! <for Pixi.Light tip>
 *         to ivanpopelyshev <PIXI display and light>
 *         to davidfig <PIXI viewport>
 * @version 0.2.2
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @requires PIXI.lights https://github.com/pixijs/pixi-lights
 * @requires PIXI.display https://github.com/pixijs/pixi-display
 * @requires PIXI.extras.Viewport https://github.com/davidfig/pixi-viewport
 * @requires PIXI.UI
 * @requires haya-core 
 * @requires haya-gui 
 * @requires haya-particle
 * @requires haya-movement
 * @requires haya-map 
 * @requires haya-map-editor 
 * =====================================================================
 * @description [log]
 *  
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Immersion = {};
Haya.Immersion.VERSION = 0.22;
/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.2.2] Haya Immersion | Menu
 * 
 * @help
 * This plugin is under [Work in Progress], then any suggestion, 
 * feedback or some tips, it is welcome! Just send me a email :)
 * 
 * Put this plugin after the haya-core
 * 
 * =============================================================
 * Credits:
 *   - Jonforum <tips>
 *   - <pixi-lights>
 *   - <pixi-ui>
 *   - Samuel Hodge <sinova-collision>
 *   - James Simpson <howlerjs audio library>
 *   - 
 */
// =============================================================================
function Scene_Immersion() { this.initialize.apply(this, arguments); };
Scene_Immersion.prototype = Object.create(Scene_Base.prototype);
Scene_Immersion.prototype.constructor = Scene_Immersion;
// =============================================================================
void function (immersion) {
    'use strict';
    // =============================================================================
    immersion.lmap = {};
    immersion.alist = "map";
    void function list_map() {
        const imap = Haya.File.json(Haya.File.local("data/MapInfos.json"));
        for (let index = 0; index < imap.length; index++) {
            const element = imap[index];
            if (Haya.Utils.isObject(element)) {
                immersion.lmap[element.name] = element;
                if (Haya.File.exist(`img/maps/${element.name}`) === false) {
                    Haya.File.mkdir(`img/maps/${element.name}`)
                    Haya.File.mkdir(`img/maps/${element.name}/src`)
                    Haya.File.wjson({ general: element.name, width: Graphics.width, height: Graphics.height }, `img/maps/${element.name}/data.json`)
                    Haya.File.wjson({}, `img/maps/${element.name}/layer.json`)
                    print(`haya-immersion-map <data> to ${element.name} was created!`)
                }
            }
        }
    }();
    // =============================================================================
    // Go to Scene_Immersion
    // =============================================================================
    //Haya.Map.scene = Scene_Editor;
    Scene_Boot.prototype.start = function () {

        Scene_Base.prototype.start.call(this);
        SoundManager.preloadImportantSounds();
        if (DataManager.isBattleTest()) {
            DataManager.setupBattleTest();
            SceneManager.goto(Scene_Battle);
        } else if (DataManager.isEventTest()) {
            DataManager.setupEventTest();
            SceneManager.goto(Scene_Map);
        } else {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            SceneManager.goto(Scene_Immersion);
            Window_TitleCommand.initCommandPosition();
        }
        this.updateDocumentTitle();
    };
    // =============================================================================
    Scene_Immersion.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
        this.button = {};
        this.gui = {
            menu: new PIXI.Container(),
            about: new PIXI.Text("", {
                fontFamily: "Consolas",
                fontSize: 12,
                fill: "white",
                wordWrap: true,
                align: "right",
                wordWrapWidth: 400
            })
        }
        

    }

    Scene_Immersion.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
    }

    Scene_Immersion.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.gui.about.visible = false;
        this.addChild(this.gui.menu)
        this.addChild(this.gui.about)
        this.createAbout();
        this.createMenu();
        this.createListMap();
    }

    Scene_Immersion.prototype.terminate = function () {
        Scene_Base.prototype.terminate.call(this);
    }

    Scene_Immersion.prototype.update = function () {
        Scene_Base.prototype.update.call(this);
        this.updateMenu();
    }

    Scene_Immersion.prototype.createAbout = function () {
        this.gui.about.text = String(`
        <Haya Immersion ${Haya.Immersion.VERSION}>

        This is a plugin-package that will allow the RPG Maker MV users to create a more immersive 
        experience for their own game. In which include several tools to make more easy to do it!

        For more information, detail and links: https://dax-soft.weebly.com/immersion.html

        <created by Michael Willian Santos (dax-soft)>
        <collision-detection by Sinova/Collision>
        <pixi-text-input by limikael>
        <pixi-viewport by davidfig>
        <spatial-sound by goldfire/howler.js>
        <pixi-lights by pixijs>
        `).trim()
        let position = Haya.DMath.Position.screen({ type: "centerRight", object: this.gui.about });
        this.gui.about.x = position.x - 16;
        this.gui.about.y = position.y;
    }

    Scene_Immersion.prototype.createMenu = function () {
        // play game
        this.button.play = new Haya.GUI.Button({
            position: [0, 0],
            text: "Play",
            action: () => {
                SceneManager.goto(Scene_Title)
            }
        })
        // edit map
        this.button.map = new Haya.GUI.Button({
            position: [100, 0],
            text: "Map",
            action: () => {

            }
        })
        // edit sprite
        this.button.sprite = new Haya.GUI.Button({
            position: [200, 0],
            text: "Sprite",
            action: () => {

            }
        })
        // edit cutscene
        this.button.cutscene = new Haya.GUI.Button({
            position: [300, 0],
            text: "Cutscene",
            action: () => {

            }
        })
        // edit npc
        this.button.npc = new Haya.GUI.Button({
            position: [400, 0],
            text: "NPC",
            action: () => {

            }
        })
        // add plugin
        this.button.plugin = new Haya.GUI.Button({
            position: [500, 0],
            text: "Plugin",
            action: () => {

            }
        })
        // check out updates
        this.button.updated = new Haya.GUI.Button({
            position: [600, 0],
            text: "Update",
            action: () => {

            }
        })
        // about
        this.button.about = new Haya.GUI.Button({
            position: [700, 0],
            text: "About",
            action: () => {
                this.about();
            }
        })
        // add it
        Object.keys(this.button).map((bkey) => {
            if (this.button[bkey]) this.gui.menu.addChild(this.button[bkey]);
        })
    }

    Scene_Immersion.prototype.createListMap = function () {
        this.gui.lmap = new PIXI.UI.Container();
        this.addChild(this.gui.lmap);
        var list = [];
        Object.keys(immersion.lmap).map((key, index) => {
            const element = immersion.lmap[key];

        })

        
    }

    Scene_Immersion.prototype.about = function () {
        this.gui.about.visible = !this.gui.about.visible;
        if (this.gui.about.visible === false) return;
    }

    Scene_Immersion.prototype.updateMenu = function () {
        Object.keys(this.button).map((bkey) => {
            if (this.button[bkey]) {
                this.button[bkey].update()
            }
        })
    }
    // =============================================================================

}(Haya.Immersion)

