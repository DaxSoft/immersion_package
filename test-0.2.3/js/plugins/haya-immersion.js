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
 *   - Samuel Hodge <sinova-collision>
 *   - James Simpson <howlerjs audio library>
 */
// =============================================================================
function Scene_Immersion() {
    this.initialize.apply(this, arguments);
};
Scene_Immersion.prototype = Object.create(Scene_Base.prototype);
Scene_Immersion.prototype.constructor = Scene_Immersion;
// =============================================================================
void

function (immersion) {
    'use strict';
    // =============================================================================
    immersion.lmap = {};
    immersion.lsprite = {};
    immersion.alist = "map";
    immersion.sprite_editor = {};
    /**
     * @function list_map
     * @description generates the list of available maps to edit
     */
    void

    function list_map() {
        const imap = Haya.File.json(Haya.File.local("data/MapInfos.json"));
        for (let index = 0; index < imap.length; index++) {
            const element = imap[index];
            if (Haya.Utils.isObject(element)) {
                immersion.lmap[element.name] = element;
                if (Haya.File.exist(`img/maps/${element.name}`) === false) {
                    Haya.File.mkdir(`img/maps/${element.name}`)
                    Haya.File.mkdir(`img/maps/${element.name}/src`)
                    Haya.File.wjson({
                        general: element.name,
                        width: Graphics.width,
                        height: Graphics.height
                    }, `img/maps/${element.name}/data.json`)
                    Haya.File.wjson({}, `img/maps/${element.name}/layer.json`)
                    print(`haya-immersion-map <data> to ${element.name} was created!`)
                }
            }
        }
    }();
    /**
     * @function list_sprite
     * @description generates the list of available sprites to edit
     */
    void

    function list_sprite() {
        Haya.File.treeFile("img/characters", (filename) => {
            // replace filename
            let _filename = filename.replace(/^.*[\\\/]/, '');
            // [texture]
            if (_filename.match(/\.png$/gi)) {
                // [exclude normalmap texture]
                if (/^\!/gim.test(_filename) === false) {
                    let name = _filename.replace(/\.png/gi, "")
                    immersion.lsprite[name] = {
                        name: name,
                        path: filename,
                        filename: _filename
                    }
                }
            }
        })
    }();

    immersion.gui = function (filename) {
        return Haya.File.local(`img/gui/default/${filename}.png`);
    }
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
    }

    Scene_Immersion.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
    }

    Scene_Immersion.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.button = {};

        this.gui = {
            about: new PIXI.Text("", {
                fontFamily: "Consolas",
                fontSize: 14,
                fill: "white",
                wordWrap: true,
                align: "right",
                wordWrapWidth: 400
            }),
            menu: new PIXI.Container()
        }

        this.gui.about.visible = false;
        this.createAbout();
        this.createMenu();
        this.createListMap();
        this.createListSprite();
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
        <mikebolt, sole and everyone for tweenjs/tween.js>
        `).trim()
        let position = Haya.DMath.Position.screen({
            type: "centerRight",
            object: this.gui.about
        });
        this.gui.about.x = position.x - 16;
        this.gui.about.y = position.y;
        this.addChild(this.gui.about);
    }

    Scene_Immersion.prototype.createMenu = function () {
        this.addChild(this.gui.menu);

        this.button.play = new Haya.GUI.Button({
            stage: this.gui.menu,
            text: "PLAY",
            position: [0, 0],
            click: () => {
                SceneManager.goto(Scene_Title)
            }
        })

        this.button.map = new Haya.GUI.Button({
            stage: this.gui.menu,
            text: "MAP",
            position: [0, 0],
            click: () => {
                this.gui.lmap.visible = !this.gui.lmap.visible;
                this.gui.lmap.active = true;
            }
        })

        this.button.sprite = new Haya.GUI.Button({
            stage: this.gui.menu,
            text: "SPRITE",
            position: [192, 0],
            click: () => {
                this.gui.lsprite.visible = !this.gui.lsprite.visible;
                this.gui.lsprite.active = true;
            }
        })

        this.button.npc = new Haya.GUI.Button({
            stage: this.gui.menu,
            text: "NPC",
            position: [288, 0],
            click: () => {}
        })

        this.button.cutscene = new Haya.GUI.Button({
            stage: this.gui.menu,
            text: "CUTSCENE",
            position: [384, 0],
            click: () => {}
        })

        this.button.update = new Haya.GUI.Button({
            stage: this.gui.menu,
            text: "UPDATE",
            position: [480, 0],
            click: () => {}
        })

        this.button.import = new Haya.GUI.Button({
            stage: this.gui.menu,
            text: "IMPORT",
            position: [672, 0],
            click: () => {}
        })

        this.button.setup = new Haya.GUI.Button({
            stage: this.gui.menu,
            text: "SETUP",
            position: [672, 0],
            click: () => {}
        })

        this.button.about = new Haya.GUI.Button({
            stage: this.gui.menu,
            text: "ABOUT",
            position: [576, 0],
            click: () => {
                this.about()
            }
        })

        Object.keys(this.button).map((bkey, index) => {
            if (this.button[bkey]) {
                this.button[bkey].x = (0) + (96 * index)
            }
        })
    }

    Scene_Immersion.prototype.createListMap = function () {
        var list = [];
        Object.keys(immersion.lmap).map((key, index) => {
            const element = immersion.lmap[key];
            list.push(new Haya.GUI.Button({
                text: element.name,
                width: 164,
                click: () => {
                    Haya.Map.map = element.name;
                    Haya.Map.scene = Haya.Map_Editor.Scene_Editor;
                    SceneManager.goto(Loader_Map);
                }
            }))
        })

        this.gui.lmap = new Haya.GUI.ScrollBox({
            list: list,
            position: [16, 100],
            width: 196,
        })
        this.gui.lmap.visible = false;

        this.addChild(this.gui.lmap)
    }

    Scene_Immersion.prototype.createListSprite = function () {
        var list = [];
        Object.keys(immersion.lsprite).map((key, index) => {
            const element = immersion.lsprite[key];
            list.push(new Haya.GUI.Button({
                text: element.name,
                width: 164,
                click: () => {
                    Haya.Sprite_Editor.sprite = element;
                    immersion.sprite_editor.diffuse = new PIXI.Texture.fromImage(Haya.File.local(`img/characters/${element.filename}`))
                    immersion.sprite_editor.normal = new PIXI.Texture.fromImage(Haya.File.local(`img/characters/!${element.filename}`))
                    SceneManager.goto(Haya.Sprite_Editor.Scene);
                }
            }))
        })

        this.gui.lsprite = new Haya.GUI.ScrollBox({
            list: list,
            position: [16, 100],
            width: 196,
        })
        this.gui.lsprite.visible = false;

        this.addChild(this.gui.lsprite)
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
        this.gui.lmap.update();
        this.gui.lsprite.update();
    }
    // =============================================================================

}(Haya.Immersion)