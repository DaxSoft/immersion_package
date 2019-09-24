/**
 * @file [haya_map_editor.js -> Haya - Map Editor]
 * @description This is a editor in-game for the maps using
 * Haya elements.
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @thanks to Jonforum!
 * @version 0.2.1
 * @license HAYA <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @todo 
 *  [x] Light Editor
 *      [x] : Editor itself
 *          [x] : position
 *              [x] : Long pressing mouse to change
 *          [x] : light height
 *              [] : (Low, Middle, Strong)-default:value
 *          [x] : brightness
 *              [] : (Low, Middle, Strong)-default:value
 *          [x] : radius
 *          [x] : color
 *              [x] : Pallete
 *              [] : Change value itself
 *          [x] : falloff
 *          [] : Oscilant (Effect)
 *          [] : Switch to On/Off
 *          [] : Time cycle
 *              [] : Day, Afternoon, Night
 *          [] : Blend 
 *      [x] : +Point
 *      [x] : +Directional
 *      [] : +Picture
 *  [x] Particle Editor
 *      [x] Editor itself
 *          [x] : Position
 *          [] : Accelaration
 *          [] : Change texture
 *          [] : Z Index
 *          [] : Switch to on/off
 *      [x] +Particle
 *  [x] Collision Editor
 *      [x] : Editor itself
 *          [x] : Position
 *          [x] : Radius
 *          [x] : Scale
 *          [x] : Angle
 *          [x] : Point
 *          [] : Label name
 *          [] : Switch to on/off
 *          []
 *      [x] : +Rectangle
 *      [x] : +Polygon
 *      [x] : +Circle
 *  [] Sound Editor
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Map_Editor = Haya.Map_Editor || {};
/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.2.1] Haya Map Editor
 * 
 * @help Scene Editor for the Haya Map. To create/edit all stuff from 
 * map
 * 
 */

Input.keyMapper = {
    9: 'tab',       // tab
    13: 'ok',       // enter
    16: 'shift',    // shift
    17: 'control',  // control
    18: 'control',  // alt
    27: 'escape',   // escape
    32: 'ok',       // space
    33: 'pageup',   // pageup
    34: 'pagedown', // pagedown
    37: 'left',     // left arrow
    38: 'up',       // up arrow
    39: 'right',    // right arrow
    40: 'down',     // down arrow
    45: 'escape',   // insert
    81: 'pageup',   // Q
    87: 'pagedown', // W
    88: 'escape',   // X
    90: 'ok',       // Z
    96: 'escape',   // numpad 0
    98: 'down',     // numpad 2
    100: 'left',    // numpad 4
    102: 'right',   // numpad 6
    104: 'up',      // numpad 8
    120: 'debug',    // F9,
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    90: 'z',
    89: 'x',
    89: 'y',
    82: 'r',
    83: 's',

};

(function ($) {
    'use strict';
    // ========================================================================
    //
    /**
     * @var data 
     * @description handle with general information about all maps
     */
    $.data = {
        // handle with all map
        library: { directory: {}, map: {} },
    }
    /**k
     * @description editor variable control
     */
    $.editor = {
        //
        _visible: false,
        // control
        control: null,
        // target
        target: null,
        // control to edit
        wedit: null,
        // buffer
        weditChange: false,
        //
        textInput: false,
        // timeBuffer
        timeBuffer: 1,
        timeBufferMax: 60,
        // color control
        pallete: {
            // colors
            red: 16, green: 16, blue: 16,
            r: 16, g: 16, b: 16,
            // pallete
            color: Haya.FileIO.json(Haya.FileIO.local("img/maps/editor/color.json"))
        },
        // blend mode
        blend: {
            // kind of
            kind: 0,
            // list of
            list: [
                [PIXI.BLEND_MODES.ADD, "ADD"], // 0
                [PIXI.BLEND_MODES.MULTIPLY, "MULTIPLY"],
                [PIXI.BLEND_MODES.SCREEN, "SCREEN"],
                [PIXI.BLEND_MODES.OVERLAY, "OVERLAY"],
                [PIXI.BLEND_MODES.DARKEN, "DARKEN"],
                [PIXI.BLEND_MODES.LIGHTEN, "LIGHTEN"],
                [PIXI.BLEND_MODES.COLOR_DODGE, "COLOR DODGE"],
                [PIXI.BLEND_MODES.COLOR_BURN, "COLOR BURN"],
                [PIXI.BLEND_MODES.HARD_LIGHT, "HARD LIGHT"],
                [PIXI.BLEND_MODES.SOFT_LIGHT, "SOFT LIGHT"],
                [PIXI.BLEND_MODES.DIFFERENCE, "DIFFERENCE"],
                [PIXI.BLEND_MODES.EXCLUSION, "EXCLUSION"],
                [PIXI.BLEND_MODES.HUE, "HUE"],
                [PIXI.BLEND_MODES.SATURATION, "SATURATION"],
                [PIXI.BLEND_MODES.COLOR, "COLOR"],
                [PIXI.BLEND_MODES.LUMINOSITY, "LUMINOSITY"],
                [PIXI.BLEND_MODES.NORMAL, "NORMAL"]
            ]
        },
        // reset all variables
        _reset: () => {
            $.editor.control = null;
            $.editor.target = null;
            $.editor.wedit = null;
            $.editor.blend.kind = 0;
        },
    }
    //
    $.value = {
        micro: 0.1,
        normal: 1,
        macro: 10
    }
    /**
     * @description save variable control
     */
    $.save = {
        // save lights
        light: {},
        //
        collision: {},
        //
        particle: {},
        // 
        sound: {}
    }
    //
    $.particle = { source: {}, textures: {} };
    $.light = { textures: {} }
    $.sound = { bgm: {}, bgs: {}, me: {}, se: {} }
    //
    $.time = 0;
    // =================================================================================
    Haya.FileIO.list("data/particles", function (filename) {
        // replace filename
        let _filename = filename.replace(/^.*[\\\/]/, '');
        // load just '.json' file
        if (_filename.match(/\.json$/gi)) {
            // load data 'npc' setup
            let _json = Haya.FileIO.json(filename);
            let name = _filename.replace(/\.json/gi, "")
            //
            $.particle.source[name] = [_filename, _json, filename];
        }
    }) // end object

    Haya.FileIO.list("img/particles", function (filename) {
        // replace filename
        let _filename = filename.replace(/^.*[\\\/]/, '');
        // load just '.json' file
        if (_filename.match(/\.png$/gi)) {
            // load data 'npc' setup
            let name = _filename.replace(/\.png/gi, "")
            //
            $.particle.textures[name] = [_filename, filename];
        }
    }) // end object

    Haya.FileIO.list("img/maps/lights", function (filename) {
        // replace filename
        let _filename = filename.replace(/^.*[\\\/]/, '');
        // load just '.json' file
        if (_filename.match(/\.png$/gi)) {
            // load data 'npc' setup
            let name = _filename.replace(/\.png/gi, "")
            //
            $.light.textures[name] = [_filename, filename];
        }
    }) // end object

    Haya.FileIO.list("audio/bgm", function (filename) {
        // replace filename
        let _filename = filename.replace(/^.*[\\\/]/, '');
        // load just '.json' file
        if (_filename.match(/\.ogg$/gi)) {
            // load data 'npc' setup
            let name = _filename.replace(/\.ogg/gi, "")
            //
            $.sound.bgm[name] = [_filename, filename];
        }
    }) // end object

    Haya.FileIO.list("audio/bgs", function (filename) {
        // replace filename
        let _filename = filename.replace(/^.*[\\\/]/, '');
        // load just '.json' file
        if (_filename.match(/\.ogg$/gi)) {
            // load data 'npc' setup
            let name = _filename.replace(/\.ogg/gi, "")
            //
            $.sound.bgs[name] = [_filename, filename];
        }
    }) // end object

    Haya.FileIO.list("audio/me", function (filename) {
        // replace filename
        let _filename = filename.replace(/^.*[\\\/]/, '');
        // load just '.json' file
        if (_filename.match(/\.ogg$/gi)) {
            // load data 'npc' setup
            let name = _filename.replace(/\.ogg/gi, "")
            //
            $.sound.me[name] = [_filename, filename];
        }
    }) // end object

    Haya.FileIO.list("audio/se", function (filename) {
        // replace filename
        let _filename = filename.replace(/^.*[\\\/]/, '');
        // load just '.json' file
        if (_filename.match(/\.ogg$/gi)) {
            // load data 'npc' setup
            let name = _filename.replace(/\.ogg/gi, "")
            //
            $.sound.se[name] = [_filename, filename];
        }
    }) // end object
    //
    // load
    Haya.Pixi.Manager.load({
        toolbar_light: Haya.FileIO.local("img/maps/editor/toolbar_light.png"),
        toolbar_collision: Haya.FileIO.local("img/maps/editor/toolbar_light.png"),
        toolbar_particle: Haya.FileIO.local("img/maps/editor/toolbar_light.png"),
        toolbar_sound: Haya.FileIO.local("img/maps/editor/toolbar_light.png"),
        toolbar_setup: Haya.FileIO.local("img/maps/editor/toolbar_light.png"),
        toolbar_filter: Haya.FileIO.local("img/maps/editor/toolbar_light.png"),
        toolbar_event: Haya.FileIO.local("img/maps/editor/toolbar_light.png"),
        save: Haya.FileIO.local("img/maps/editor/save.png")
    })
    //
    //$gameSystem = new Game_System();
    /**
     * @description load all maps information
     */
    function loadLibrary() {
        let directory = Haya.FileIO.dirList(Haya.FileIO.local("img/maps"));
        directory.forEach((dir) => {
            // record all except by editor stuffs
            if (!(dir.match(/(editor|Maps)$/gi))) {
                // get the map name
                let mapName = dir.split(/\\|\//gi); mapName = mapName[mapName.length - 1];
                $.data.library.directory[mapName] = Haya.FileIO.clean(dir);
            }
        })
        // setu´4
        //$.data.library.map = Haya.FileIO.json(Haya.FileIO.local("img/maps/map.json"));
    }; loadLibrary();
    //
    // =================================================================================
    // [List]
    // =================================================================================
    function List() { this.initialize.apply(this, arguments); }
    List.prototype = Object.create(Window_Selectable.prototype);
    List.prototype.constructor = List;

    List.prototype.initialize = function (x, y) {
        Window_Selectable.prototype.initialize.call(this, x, y, 256, Graphics.height - 128)
        this._oldPoint = new Point(x, y);
        this._data = [];
        this.hide();
        this.deactivate();
        this.close();
    }

    List.prototype.maxCols = function () {
        return 1;
    };

    List.prototype.spacing = function () {
        return 32;
    };

    List.prototype.update = function () {
        Window_Selectable.prototype.update.call(this);
    };

    List.prototype.maxItems = function () {
        return this._data ? this._data.length : 1;
    };

    List.prototype.drawItem = function (index) {
        var item = this._data[index];
        if (item === undefined) return;
        var rect = this.itemRect(index);
        this.contents.fontSize = 14;
        if (typeof item === 'string') {
            this.drawText(item, rect.x, rect.y, rect.width, rect.height)
        } else {
            if ($.editor.control === "light") {
                this.drawText(`[${item.time}] ${item.kind}_${item.name}`, rect.x, rect.y, rect.width, rect.height)
            } else if ($.editor.control === "particle") {
                this.drawText(`${item.name}`, rect.x, rect.y, rect.width, rect.height)
            } else if ($.editor.control === "collision") {
                this.drawText(item._name, rect.x, rect.y, rect.width, rect.height)
            } else if ($.editor.control === "setup") {
                this.drawText((item[0] + "\t\t\t" + item[1]), rect.x, rect.y, rect.width, rect.height)
            }

        }

    };

    List.prototype.refresh = function () {
        this.createContents();
        this.drawAllItems();
    };
    // =================================================================================
    // [List]
    // =================================================================================
    function Edit_Tag() { this.initialize.apply(this, arguments); }
    Edit_Tag.prototype = Object.create(Window_Selectable.prototype);
    Edit_Tag.prototype.constructor = Edit_Tag;

    Edit_Tag.prototype.initialize = function (x, y) {
        Window_Selectable.prototype.initialize.call(this, x, y, 256, Graphics.height - 128)
        this._oldPoint = new Point(x, y);
        this._data = [];
        this.hide();
        this.deactivate();
        this.close();
    }

    Edit_Tag.prototype.maxCols = function () {
        return 1;
    };

    Edit_Tag.prototype.spacing = function () {
        return 32;
    };

    Edit_Tag.prototype.maxItems = function () {
        return this._data ? this._data.length : 1;
    };

    Edit_Tag.prototype.update = function () {
        Window_Selectable.prototype.update.call(this);
    };

    Edit_Tag.prototype.drawItem = function (index) {
        var item = this._data[index];
        if (item === undefined) return;
        let text = item[0] + "\t\t\t" + item[1]
        var rect = this.itemRect(index);
        this.contents.fontSize = 14;
        // this.drawText(item[1], rect.x+96, rect.y, rect.width, rect.height)
        // this.contents.fontColor = "0xf39c12"
        this.drawText(text, rect.x, rect.y, rect.width, rect.height, 'left')
    };

    Edit_Tag.prototype.refresh = function () {
        this.createContents();
        this.drawAllItems();
    };
    // =================================================================================
    // [List]
    // =================================================================================
    function Pallete_Color() { this.initialize.apply(this, arguments); }
    Pallete_Color.prototype = Object.create(Window_Selectable.prototype);
    Pallete_Color.prototype.constructor = Pallete_Color;

    Pallete_Color.prototype.initialize = function (x, y) {
        Window_Selectable.prototype.initialize.call(this, x, y, 232, Graphics.height - 128)
        this._oldPoint = new Point(x, y);
        this._data = [];
        this.hide();
        this.deactivate();
        this.close();
    }

    Pallete_Color.prototype.maxCols = function () {
        return 3;
    };

    Pallete_Color.prototype.maxItems = function () {
        return this._data ? this._data.length : 1;
    };

    Pallete_Color.prototype.spacing = function () {
        return 32;
    };

    Pallete_Color.prototype.update = function () {
        Window_Selectable.prototype.update.call(this);
    };

    Pallete_Color.prototype.drawItem = function (index) {
        var item = this._data[index];
        if (item === undefined) return;
        var rect = this.itemRect(index);
        this.contents.fontSize = 72;
        this.contents.textColor = item.replace("0x", "#");
        this.drawText("•", rect.x, rect.y, rect.width, rect.height, 'left')
    };

    Pallete_Color.prototype.refresh = function () {
        this.createContents();
        this.drawAllItems();
    };
    // ========================================================================

    Sprite_Map.prototype.createCharacter = function () {

        
        this._characters = [];
        // create player
        // new Sprite_Character($gamePlayer)
        var player = new Haya.Map.Hayaset_Character($gamePlayer);
        this._characters.push(player);

        // name & zIndex
        this._characters.forEach((value, index) => {
            value.name = `character_${index}`
            value.children.forEach((ch) => {
                ch.z = 3;
                ch.zIndex = Haya.Map.group.layer["object"];
                ch.parentGroup.zIndex = ch.zIndex;
            })
            this.sprite.addChild(value)
            print(value.children[0], 'character')
        })
        // add
        //(...this._characters);
    }

    /**
     * @function updateLight 
     * @description update all light elements
     */
    Sprite_Map.prototype.updateLight = function () {
        // for in each element;
        for (let index = 0; index < this.light.element.length; index++) {
            const element = this.light.element[index];
            // check out if the light requires a switch to activate
            // check oput if is on the right period of the day's time
            if (Haya.Map.Time.period(element.time)) {
                // check out the range of visibility
                // if it is a main componment or a ambient, the range don't affect
                if (element.kind.toLowerCase() === "main" || element.kind.toLowerCase() === "ambient" || element.kind === "directional") {
                    element.visible = true;
                } else {
                    
                    element.visible = (
                        element.x.isBetween(
                            -(120) + (this.display.x), 
                            (Graphics.width) + (this.display.x + 120) )
                        ) 
                        
                        &&

                        (element.y.isBetween(
                            -(120) + (this.display.y), 
                            (Graphics.height) + (this.display.y + 120)
                        )
                    )
                }
                
                // return
                //return;
            } else {
                element.visible = false;
                //element.alpha = 0;
                //return;
            }
        }
    }

    Game_Map.prototype.setupEvents = function() {
        this._events = [];
        
    };
    // ========================================================================
    // ========================================================================
    class Scene_Editor extends Scene_Base {
        // ===========================================================
        constructor() {
            super();
            this._readyCollision = 100;
            //
            this._mapLoaded = false;
            //
            // variable out-editor
            this.editor = {
                // for toolbar: light, collision, filter, particle
                toolbar: false
            }
            //
            this.particle = { element: [], source: {} }
            this.light = { element: [], source: {} }
            this.filter = { element: [], source: {} }
            this.collision = { element: [], source: {}, graphic: [] }
            this.sound = { element: [], source: {}, graphic: [] }
            //
            this.display = new Point(0, 0);
            this.mouse = new Point(0, 0);
            //
            print(this, 'scene editor');
        }

        start() {
            super.start.call(this)
            SceneManager.clearStack();

        }

        update() {
            this.updateMain();
            super.update.call(this);
            this.mouse.x = Graphics.pageToCanvasX(TouchInput.x);
            this.mouse.y = Graphics.pageToCanvasY(TouchInput.y);
            this.updatePivot()
            this.updateLayer();
            this.updateToolbar();
            this.updateUI();
            // check out collisions for the player
            //if (this._readyCollision <= 0) {
            this.collisionUpdate();
            //this._readyCollision = 0;
            //} else {
            //this._readyCollision--;
            //}
        }

        create() {
            super.create.call(this);
            
        }
        // ===========================================================
        isReady() {
            if (!this._mapLoaded) {
                this.onMapLoaded();
                this._mapLoaded = true;
            }
            return this._mapLoaded && super.isReady.call(this);
        }

        onMapLoaded() {
            this.createDisplayObjects();
        }

        updateMain() {
            var active = this.isActive();
            $gameMap.update(active);
            $gamePlayer.update(active);
            $gameTimer.update(active);
            //$gameScreen.update();
            this._spriteset.update();
        }

        isBusy() {
            return super.isBusy.call(this);
        }
        // ===========================================================
        createDisplayObjects() {
            // create
            this.createSpriteset();
            this.createWindowLayer();
            this.graphicCollision = new PIXI.Container();
            this.createCollision();
            //
            this.window = {
                list: new List(64, 64),
                edit: new Edit_Tag(64, 64),
                color: new Pallete_Color(Graphics.width - 256, 64)
            }
            //
            this.window.color._data = [];
            Object.keys($.editor.pallete.color).map((key) => {
                let element = $.editor.pallete.color[key]
                this.window.color._data.push(element)
            })
            this.window.color.refresh();
            //
            this.window.list.setHandler('ok', this.onEditList.bind(this))
            this.window.edit.setHandler('ok', this.onEditTag.bind(this))
            this.window.color.setHandler('ok', this.onColorPick.bind(this))
            //
            this.gui = new PIXI.Container();
            this.addChild(this.gui);

            this.particleSprite = new PIXI.Container();
            this.particleExample = new PIXI.Container();
            this.lightExample = new PIXI.Container();
            this.gui.addChild(this.graphicCollision);
            this.gui.addChild(this.window.list)
            this.gui.addChild(this.window.edit)
            this.gui.addChild(this.window.color)
            this.gui.addChild(this.particleSprite);
            this.gui.addChild(this.particleExample);
            this.gui.addChild(this.lightExample)
            //
            this.createToolbar();
            //
            this.light.source = this._spriteset.light.source;
            this.light.element = this._spriteset.light.element;

            print('Scene:Editor', this);
        }

        createSpriteset() {
            this._spriteset = new Sprite_Map();
            this.addChild(this._spriteset.sprite);
        }

        createCollision() {
            $.collision = Haya.Collision.System;
            $.result = $.collision.createResult();
            if (Object.keys(Haya.Map.current.collisionData).length > 0) {
                Object.keys(Haya.Map.current.collisionData).map((collisionName) => {
                    //
                    let element = Haya.Map.current.collisionData[collisionName];
                    this.collision.source[collisionName] = Haya.Collision.createCollision(
                        $.collision, element.kind, element
                    )
                    this.collision.source[collisionName]._name = collisionName;
                    this.collision.source[collisionName]._kind = element.kind
                    // 
                    this.collision.element.push(this.collision.source[collisionName])
                })
            }

            this.refreshDraw();
        }

        // toolbar
        createToolbar() {
            // toolbar-light
            this.editor.light = new Haya.Pixi.Sprite.Picture({
                stage: this.gui,
                texture: Haya.Pixi.TextureCache.toolbar_light,
            }, function () {
                // position
                this.sprite.position.set(16, 16);
                // mouse
                this.mouse.active = true;
                // over
                this.mouse.over = () => { this.sprite.alpha = 1.0 };
                this.mouse.out = () => { this.sprite.alpha = $.editor.control === "light" ? 1.0 : 0.75 };
                // trigger
                this.mouse.trigger.on = function () {
                    if (typeof $.editor.control === 'string') {
                        if (!($.editor.control.includes("light"))) {
                            $.editor.control = null;
                        }
                    }
                    if ($.editor.control === "light-edit") {

                        $.editor.control = "light";

                        SceneManager._scene.window.edit.deactivate();
                        SceneManager._scene.window.edit.close();
                        SceneManager._scene.window.edit.hide();

                        SceneManager._scene.window.list.activate();
                        SceneManager._scene.window.list.open();
                        SceneManager._scene.window.list.show();
                        SceneManager._scene.refreshLightList();


                    } else {
                        // update
                        $.editor.control = $.editor.control === null ? "light" : null;

                        if ($.editor.control === "light") {
                            SceneManager._scene.refreshLightList();

                        } else {
                            SceneManager._scene.window.list.deactivate();
                            SceneManager._scene.window.list.close();
                            SceneManager._scene.window.list.hide();
                        }
                    }
                }
            });
            // toolbar-particle
            this.editor.particle = new Haya.Pixi.Sprite.Picture({
                stage: this.gui,
                texture: Haya.Pixi.TextureCache.toolbar_particle,
            }, function () {
                // position
                this.sprite.position.set(48, 16);
                // mouse
                this.mouse.active = true;
                // over
                this.mouse.over = () => { this.sprite.alpha = 1.0 };
                this.mouse.out = () => { this.sprite.alpha = $.editor.control === "particle" ? 1.0 : 0.75 };
                // trigger
                this.mouse.trigger.on = function () {
                    if (typeof $.editor.control === 'string') {
                        if (!($.editor.control.includes("particle"))) {
                            $.editor.control = null;
                        }
                    }

                    if ($.editor.control === "particle-edit") {

                        $.editor.control = "particle";

                        SceneManager._scene.window.edit.deactivate();
                        SceneManager._scene.window.edit.close();
                        SceneManager._scene.window.edit.hide();

                        SceneManager._scene.window.list.activate();
                        SceneManager._scene.window.list.open();
                        SceneManager._scene.window.list.show();
                        SceneManager._scene.refreshParticleList();


                    } else {
                        // update
                        $.editor.control = $.editor.control === null ? "particle" : null;

                        if ($.editor.control === "particle") {
                            SceneManager._scene.refreshParticleList();

                        } else {
                            SceneManager._scene.window.list.deactivate();
                            SceneManager._scene.window.list.close();
                            SceneManager._scene.window.list.hide();
                        }
                    }
                }
            });
            // toolbar-collision
            this.editor.collision = new Haya.Pixi.Sprite.Picture({
                stage: this.gui,
                texture: Haya.Pixi.TextureCache.toolbar_collision,
            }, function () {
                // position
                this.sprite.position.set(80, 16);
                // mouse
                this.mouse.active = true;
                // over
                this.mouse.over = () => { this.sprite.alpha = 1.0 };
                this.mouse.out = () => { this.sprite.alpha = $.editor.control === "collision" ? 1.0 : 0.75 };
                // trigger
                this.mouse.trigger.on = function () {
                    if (typeof $.editor.control === 'string') {
                        if (!($.editor.control.includes("collision"))) {
                            $.editor.control = null;
                        }
                    }

                    if ($.editor.control === "collision-edit") {

                        $.editor.control = "collision";

                        SceneManager._scene.window.edit.deactivate();
                        SceneManager._scene.window.edit.close();
                        SceneManager._scene.window.edit.hide();

                        SceneManager._scene.window.list.activate();
                        SceneManager._scene.window.list.open();
                        SceneManager._scene.window.list.show();
                        SceneManager._scene.refreshCollisionList();

                    } else {
                        // update
                        $.editor.control = $.editor.control === null ? "collision" : null;

                        if ($.editor.control === "collision") {
                            SceneManager._scene.refreshCollisionList();

                        } else {
                            SceneManager._scene.window.list.deactivate();
                            SceneManager._scene.window.list.close();
                            SceneManager._scene.window.list.hide();
                        }
                    }
                }
            });
            // toolbar-filters
            this.editor.filter = new Haya.Pixi.Sprite.Picture({
                stage: this.gui,
                texture: Haya.Pixi.TextureCache.toolbar_filter,
            }, function () {
                // position
                this.sprite.position.set(112, 16);
                // mouse
                this.mouse.active = true;
                // over
                this.mouse.over = () => { this.sprite.alpha = 1.0 };
                this.mouse.out = () => { this.sprite.alpha = $.editor.control === "filter" ? 1.0 : 0.75 };
                // trigger
                this.mouse.trigger.on = function () {
                    if (typeof $.editor.control === 'string') {
                        if (!($.editor.control.includes("filter"))) {
                            $.editor.control = null;
                        }
                    }

                    if ($.editor.control === "filter-edit") {

                        $.editor.control = "filter";

                        SceneManager._scene.window.edit.deactivate();
                        SceneManager._scene.window.edit.close();
                        SceneManager._scene.window.edit.hide();

                        SceneManager._scene.window.list.activate();
                        SceneManager._scene.window.list.open();
                        SceneManager._scene.window.list.show();
                        SceneManager._scene.refreshFilterList();

                    } else {
                        // update
                        $.editor.control = $.editor.control === null ? "filter" : null;

                        if ($.editor.control === "filter") {
                            SceneManager._scene.refreshFilterList();

                        } else {
                            SceneManager._scene.window.list.deactivate();
                            SceneManager._scene.window.list.close();
                            SceneManager._scene.window.list.hide();
                        }
                    }
                }
            });
            // toolbar-setup
            this.editor.setup = new Haya.Pixi.Sprite.Picture({
                stage: this.gui,
                texture: Haya.Pixi.TextureCache.toolbar_setup,
            }, function () {
                // position
                this.sprite.position.set(Graphics.width - 64, 16);
                // mouse
                this.mouse.active = true;
                // over
                this.mouse.over = () => { this.sprite.alpha = 1.0 };
                this.mouse.out = () => { this.sprite.alpha = $.editor.control === "setup" ? 1.0 : 0.75 };
                // trigger
                this.mouse.trigger.on = function () {
                    if (typeof $.editor.control === 'string') {
                        if (!($.editor.control.includes("setup"))) {
                            $.editor.control = null;
                        }
                    }

                    if ($.editor.control === "setup-edit") {

                        $.editor.control = "setup";

                        SceneManager._scene.window.edit.deactivate();
                        SceneManager._scene.window.edit.close();
                        SceneManager._scene.window.edit.hide();

                        SceneManager._scene.window.list.activate();
                        SceneManager._scene.window.list.open();
                        SceneManager._scene.window.list.show();
                        SceneManager._scene.refreshSetupList();

                    } else {
                        // update
                        $.editor.control = $.editor.control === null ? "setup" : null;

                        if ($.editor.control === "setup") {
                            SceneManager._scene.refreshSetupList();

                        } else {
                            SceneManager._scene.window.list.deactivate();
                            SceneManager._scene.window.list.close();
                            SceneManager._scene.window.list.hide();
                        }
                    }
                }
            });
            // toolbar-save
            this.editor.save = new Haya.Pixi.Sprite.Picture({
                stage: this.gui,
                texture: Haya.Pixi.TextureCache.save,
            }, function () {
                // position
                this.sprite.position.set(16, Graphics.height - (16 + this.sprite.height));
                // mouse
                this.mouse.active = true;
                // over
                this.mouse.over = () => { this.sprite.alpha = 1.0 };
                this.mouse.out = () => { this.sprite.alpha = 0.75 };
                // trigger
                this.mouse.trigger.on = function () {
                    SceneManager._scene.save();
                }
            });
        }
        // ===========================================================
        refreshFilterList() {
            $.editor.wedit = null;
            this.filter.source = this._spriteset.filter.source;
            this.filter.element = this._spriteset.filter.element;

            this.window.list._data = [];
            this.window.list._data[0] = "New Filter";

            Object.keys(this.filter.source).map((filterName) => {
                // element
                let element = this.filter.source[filterName];
                // push
                this.window.list._data.push(element)
            })

            this.window.list.activate()
            this.window.list.open();
            this.window.list.show();
            this.window.list.refresh();
        }

        refreshFilterNew() {
            $.editor.wedit = null;
            $.editor.control = "filter-new"
            this.window.list._data = [];
            Object.keys(Haya.Map.library.setup.filters).map((filterName) => {
                // push
                this.window.list._data.push(filterName)
            })
            this.window.list.activate()
            this.window.list.open();
            this.window.list.show();
            this.window.list.refresh();

        }

        refreshSetupList() {
            //
            $.editor.wedit = null;
            this.window.list._data = [];

            this.window.list._data[0] = ["Micro Value:", `${Haya.DMath.float($.value.micro)}`];
            this.window.list._data[1] = ["Normal Value:", `${Haya.DMath.float($.value.normal)}`];
            this.window.list._data[2] = ["Time:", Haya.Map.Time.string()]
            this.window.list._data[3] = ["Speed Time:", `${Haya.DMath.float(Haya.Map.Time._speed)}`]

            this.window.list.activate()
            this.window.list.open();
            this.window.list.show();
            this.window.list.refresh();
        }

        refreshLightList() {
            this.light.source = this._spriteset.light.source;
            this.light.element = this._spriteset.light.element;

            print(this.light.source, 'light source');
            //
            $.editor.wedit = null;
            this.window.list._data = [];
            this.window.list._data.push("New Point")
            this.window.list._data.push("New Directional")
            this.window.list._data.push("New Ambient")
            this.window.list._data.push("New Sprite")
            Object.keys(this.light.source).map((lights, index) => {
                // element
                let element = this.light.source[lights];
                // push
                this.window.list._data.push(element)
            })
            this.window.list.activate()
            this.window.list.open();
            this.window.list.show();
            this.window.list.refresh();

        }

        refreshLightNew() {
            $.editor.wedit = null;
            $.editor.control = "light-new"
            this.window.list._data = [];
            this.window.list._data.push("Return")
            this.window.list._data.push("Done")
            Object.keys($.light.textures).map((particleName) => {
                // push
                this.window.list._data.push(particleName)
            })
            this.window.list.activate()
            this.window.list.open();
            this.window.list.show();
            this.window.list.refresh();

        }

        refreshCollisionList() {
            $.editor.wedit = null;
            this.window.list._data = [];
            this.window.list._data.push("New Polygon")
            this.window.list._data.push("New Circle")
            this.window.list._data.push("New Rect")

            if (this.collision.element.length > 0) {
                this.collision.element.forEach((element) => {
                    this.window.list._data.push(element);
                })
            }

            this.window.list.activate()
            this.window.list.open();
            this.window.list.show();
            this.window.list.refresh();


            print($.collision);
            this.refreshDraw();
        }

        refreshParticleList() {
            this.particle.source = this._spriteset.particle.source;
            this.particle.element = this._spriteset.particle.element;
            $.editor.wedit = null;
            this.window.list._data = [];
            this.window.list._data.push("New Particle")
            Object.keys(this.particle.source).map((particles, index) => {
                // element
                let element = this.particle.source[particles];
                // push
                this.window.list._data.push(element)
            })
            this.window.list.activate()
            this.window.list.open();
            this.window.list.show();
            this.window.list.refresh();

        }
        // 
        refreshParticleNew() {
            $.editor.wedit = null;
            $.editor.control = "particle-new"
            this.window.list._data = [];
            Object.keys($.particle.source).map((particleName) => {
                // push
                this.window.list._data.push(particleName)
            })
            this.window.list.activate()
            this.window.list.open();
            this.window.list.show();
            this.window.list.refresh();

        }
        //
        refreshParticleTexture() {
            $.editor.wedit = null;
            $.editor.control = "particle-texture"
            this.window.list._data = [];
            this.window.list._data.push("Return")
            this.window.list._data.push("Done")
            Object.keys($.particle.textures).map((particles, index) => {
                // push
                this.window.list._data.push(particles)
            })
            this.window.list.activate()
            this.window.list.open();
            this.window.list.show();
            this.window.list.refresh();
        }

        refreshCommand() {
            if ($.editor.control === "light-edit") {
                this.window.color.hide();
                this.window.color.deactivate();
                this.window.color.close();
                $.editor.weditChange = false;
                // get info
                $.editor.target = this.window.list._data[this.window.list._index];
                $.time = Haya.Map.Time.isPeriod($.editor.target.time);

                this.window.edit._data = [];

                // get by kind of
                if ($.editor.target.kind === "sprite") {
                    //
                    this.window.edit._data[0] = [`Position:`, `${$.editor.target.x}, ${$.editor.target.y}`]
                    //
                    this.window.edit._data[1] = [`Opacity:`, `${$.editor.target.alpha}`]

                    this.window.edit._data[2] = [`Time:`, `${$.editor.target.time}`]
                } else {
                    // color
                    let color = Haya.Utils.Color.hexRgb(String($.editor.target.color).replace("0x", "#"));
                    $.editor.pallete.red = color.red;
                    $.editor.pallete.green = color.green;
                    $.editor.pallete.blue = color.blue;

                    //
                    this.window.edit._data[0] = [`Position:`, `${$.editor.target.x}, ${$.editor.target.y}`]
                    //
                    this.window.edit._data[1] = [`Light-Height:`, `${Haya.DMath.float($.editor.target.lightHeight)}`]
                    //
                    this.window.edit._data[2] = [`Brightness:`, `${Haya.DMath.float($.editor.target.brightness)}`]
                    //
                    this.window.edit._data[3] = [`Radius:`, `${Haya.DMath.float($.editor.target.radius || 0)}`]
                    //
                    this.window.edit._data[4] = [`Intensity:`, `${Haya.DMath.float($.editor.target.falloff[0])}`]
                    //
                    this.window.edit._data[5] = [`General Intensity:`, `${Haya.DMath.float($.editor.target.falloff[1])}`]
                    //
                    this.window.edit._data[6] = [`Range:`, `${Haya.DMath.float($.editor.target.falloff[2])}`]
                    //
                    this.window.edit._data[7] = [`Color:`, `${$.editor.target.color}`]
                    //
                    this.window.edit._data[8] = [`Time:`, `${$.editor.target.time}`]
                    //
                }

                this.window.edit._data.push([`Delete`, ``])

                this.window.edit.refresh();
            } else if ($.editor.control === "particle-edit") {
                $.editor.weditChange = false;
                // get info
                $.editor.target = this.window.list._data[this.window.list._index];
                print($.editor.target.name)

                this.window.edit._data = [];

                this.window.edit._data.push([`Delete`, ``]);
                //
                this.window.edit._data[1] = [`Position:`, `${$.editor.target.x}, ${$.editor.target.y}`]
                // color-start color-end
                this.window.edit.refresh();
            } else if ($.editor.control === "collision-edit") {
                this.window.edit._data = [];
                //
                this.window.edit._data[0] = [`Position:`, `${$.editor.target.x}, ${$.editor.target.y}`]
                //
                if ($.editor.kind === "circle") {
                    this.window.edit._data[1] = ["Radius:", `${$.editor.target.radius}`];
                    //
                    this.window.edit._data[2] = ["Scale:", `${Haya.DMath.float($.editor.target.scale)}`];
                    //
                    this.window.edit._data[3] = ["Padding:", `${$.editor.target.padding}`]
                } else if ($.editor.kind === "polygon") {
                    // add
                    this.window.edit._data[1] = [`New Point`, ""]
                    //
                    this.window.edit._data[2] = ["Angle:", `${Haya.DMath.float($.editor.target.angle)}`];
                    //
                    this.window.edit._data[3] = ["Scale X:", `${Haya.DMath.float($.editor.target.scale_x)}`];
                    //
                    this.window.edit._data[4] = ["Scale Y:", `${Haya.DMath.float($.editor.target.scale_y)}`];
                    //
                    this.window.edit._data[5] = ["Padding:", `${$.editor.target.padding}`]
                    // points
                    $.editor.target.cachePoints.forEach((points, index) => {
                        this.window.edit._data.push([
                            `Point #${index}:`, `${points[0]}, ${points[1]}`, index
                        ])
                    })
                } else if ($.editor.kind === "rect") {
                    // add
                    //
                    this.window.edit._data[1] = ["Angle:", `${Haya.DMath.float($.editor.target.angle)}`];
                    //
                    this.window.edit._data[2] = ["Scale X:", `${Haya.DMath.float($.editor.target.scale_x)}`];
                    //
                    this.window.edit._data[3] = ["Scale Y:", `${Haya.DMath.float($.editor.target.scale_y)}`];
                    //
                    this.window.edit._data[4] = ["Average Scale:", `${Haya.DMath.float(($.editor.target.scale_y + $.editor.target.scale_x) / 2)}`];
                    //
                    this.window.edit._data[5] = ["Padding:", `${$.editor.target.padding}`]
                    // points
                    // $.editor.target.cachePoints.forEach((points, index) => {
                    //     this.window.edit._data.push([
                    //         `Point #${index}:`, `${points[0]}, ${points[1]}`, index
                    //     ])
                    // })
                }


                //
                this.window.edit._data.push([`Delete`, ``]);
                //
                this.window.edit.refresh();
            }
        }

        refreshDraw() {
            this.collision.element.forEach((element) => {

                if (Haya.Utils.invalid(element._graphic)) {
                    element._graphic = new PIXI.Graphics();
                    this.graphicCollision.addChild(element._graphic);
                }

                this.refreshGraphic(element);

                if (element._graphic.stage === undefined || element._graphic.stage === null) {
                    this.graphicCollision.addChild(element._graphic);
                }
            })
        }

        recursiveNewName(name, id) {
            let text = `${name} #${id}`
            if (this.collision.source.hasOwnProperty(text)) {
                text = this.recursiveNewName(name, id + 1);
                return text;
            } else {
                return text;
            }
        }

        addCollision(kind) {
            if (kind === "polygon") {
                let name = this.recursiveNewName("polygon", this.collision.element.length + 1)
                this.collision.source[name] = Haya.Collision.createCollision(
                    $.collision, "polygon", {
                        kind: "polygon",
                        x: ((Graphics.width / 2) + this.display.x),
                        y: ((Graphics.height / 2) + this.display.y),
                        points: [
                            [0, 0], [0, 100]
                        ]
                    }
                )
                this.collision.source[name]._name = name;
                this.collision.source[name]._kind = kind;
                this.collision.source[name]._graphic = new PIXI.Graphics();
                this.graphicCollision.addChild(this.collision.source[name]._graphic);
                this.collision.element.push(this.collision.source[name]);
            } else if (kind === "circle") {
                let name = this.recursiveNewName("circle", this.collision.element.length + 1)
                this.collision.source[name] = Haya.Collision.createCollision(
                    $.collision, "circle", {
                        kind: "circle",
                        x: ((Graphics.width / 2) + this.display.x),
                        y: ((Graphics.height / 2) + this.display.y),
                        radius: 16
                    }
                )
                this.collision.source[name]._name = name;
                this.collision.source[name]._kind = kind;
                this.collision.source[name]._graphic = new PIXI.Graphics();
                this.graphicCollision.addChild(this.collision.source[name]._graphic);
                this.collision.element.push(this.collision.source[name]);

            } else if (kind === "rect") {
                let name = this.recursiveNewName("rect", this.collision.element.length + 1)
                this.collision.source[name] = Haya.Collision.createCollision(
                    $.collision, "rect", {
                        kind: "rect",
                        x: ((Graphics.width / 2) + this.display.x),
                        y: ((Graphics.height / 2) + this.display.y),
                        points: [60, 20]
                    }
                )
                this.collision.source[name]._name = name;
                this.collision.source[name]._kind = kind;
                this.collision.source[name]._graphic = new PIXI.Graphics();
                this.graphicCollision.addChild(this.collision.source[name]._graphic);
                this.collision.element.push(this.collision.source[name]);
            }

        }
        //
        removeCollision(name) {
            if (this.collision.source.hasOwnProperty(name)) {

                let newElement = [];

                this.collision.element.forEach((value, index) => {
                    if (value._name === name) {
                        this.collision.element.splice(index, 0)
                        return;
                    } else { newElement.push(value) }
                })

                this.collision.element = newElement;
                this.graphicCollision.removeChild(this.collision.source[name]._graphic);
                this.collision.source[name].remove();


                delete this.collision.source[name];
            }

            print(this.collision, name);
        }

        //
        refreshGraphic(element, selected) {
            if (Haya.Utils.invalid(element)) return;
            if (Haya.Utils.invalid(element._graphic)) return;
            element._graphic.clear();
            if (selected === true) {
                element._graphic.lineStyle(1, '0x3498db', 1, 2);
            } else {
                element._graphic.lineStyle(1, '0xe74c3c', 1, 0.5);
            }
            element._graphic.beginFill('0xffffff', 0.1);
            element.draw(element._graphic)
            element._graphic.endFill();
        }
        //
        addExample(setup, element = "particle") {
            if (!(Haya.Utils.invalid(this.example))) {
                if (this.example instanceof Haya.Particle.Emmiter) {
                    print(this.example, "example");
                    Haya.Particle.manager.delete(this.example.id)
                }
            }
            this.example = Haya.Particle.manager.add(setup, [element], {
                stage: this.particleExample,
                x: (256),
                y: (64),
                setup: setup,
                textures: [element]
            })
            print(this.example);
        }

        // 
        addLightExample(element) {
            if (this.lightExample.children.length > 0) {
                this.lightExample.removeChild(this.lightExample.children[0]);
            }

            let example = new PIXI.Sprite.fromImage(Haya.FileIO.local(`img/maps/lights/${element}.png`));
            let pos = Haya.DMath.Position.screen({
                type: "center",
                object: example
            });
            example.position.set(pos.x, pos.y)
            print(example, element);
            this.lightExample.addChild(example);
        }

        addParticle() {
            let setup = this.example.setup;
            let textures = this.example.hash._imageNames
            let id = this.example.id;
            setup.stage = this._spriteset.sprite;
            //
            Haya.Particle.manager.delete(this.example.id)
            //
            let _particle = Haya.Particle.manager.add(setup.setup, textures, setup);
            _particle.name = `particle_${id}`;
            this._spriteset.particle.element.push(_particle);
            this._spriteset.particle.source[_particle.name] = _particle;

            this.particle.source = this._spriteset.particle.source;
            this.particle.element = this._spriteset.particle.element;
        }
        //
        removeParticle(name) {
            if (this._spriteset.particle.source.hasOwnProperty(name)) {
                this._spriteset.particle.source[name].parent.removeChild(this._spriteset.particle.source[name]);
                this._spriteset.particle.element.forEach((value, index) => {
                    if (value.name === name) {
                        this._spriteset.particle.element.splice(index, 0);
                        return;
                    }
                })
                delete this._spriteset.particle.source[name];
            }
            print(name)
            this.particle.source = this._spriteset.particle.source;
            this.particle.element = this._spriteset.particle.element;
        }
        // ===========================================================
        onEditList() {
            if ($.editor.control === "light") {
                let element = this.window.list.current();
                if (typeof element === 'string') {
                    if (element.toLocaleLowerCase() === "new point") {
                        this._spriteset.addLight(
                            {
                                radius: 300,
                                kind: "point"
                            },
                            "point " + String(this.light.element.length + 1),
                            this._spriteset.sprite
                        )
                        this.window.list.activate()
                        this.refreshLightList();
                    } else if (element.toLocaleLowerCase() === "new directional") {
                        this._spriteset.addLight(
                            {
                                radius: 300,
                                kind: "directional",
                                target: new Point(0, 0)
                            },
                            "directional " + String(this.light.element.length + 1),
                            this._spriteset.sprite
                        )
                        this.window.list.activate()
                        this.refreshLightList();
                    } else if (element.toLocaleLowerCase().includes("ambient")) {
                        this._spriteset.addLight(
                            {
                                kind: "ambient"
                            },
                            "ambient " + String(this.light.element.length + 1),
                            this._spriteset.sprite
                        )
                        this.window.list.activate()
                        this.refreshLightList();
                    } else if (element.toLocaleLowerCase() === "new sprite") {
                        this.refreshLightNew();
                    }
                    return;
                }

                $.editor.control = "light-edit";
                $.editor.wedit = null;
                // refresh
                this.refreshCommand();

                this.window.edit.activate();
                this.window.edit.show();
                this.window.edit.open();
            } else if ($.editor.control === "light-new") {
                let element = this.window.list.current();

                if (typeof element === 'string') {
                    if (element.toLocaleLowerCase() === "done") {
                        $.editor.control = "light";
                        $.editor.wedit = null;
                        this._spriteset.addLight({
                            kind: "sprite",
                            texture: this.lightExample.children[0].texture,
                            position: "center",
                        }, "sprite " + String(this.light.element.length + 1), this._spriteset.sprite);
                        this.refreshLightList();
                        return;
                    } else if (element.toLocaleLowerCase() === "return") {
                        $.editor.control = "light";
                        $.editor.wedit = null;
                        this.refreshLightList();
                        return;
                    }
                }

                $.editor.wedit = null;

                this.addLightExample(element)

                this.window.list.activate()
                this.window.list.open();
                this.window.list.show();

            } else if ($.editor.control === "particle") {
                let element = this.window.list.current();
                if (typeof element === 'string') {
                    if (element.toLocaleLowerCase() === "new particle") {
                        this.refreshParticleNew();
                    }
                    return;
                }

                $.editor.control = "particle-edit";
                $.editor.wedit = null;
                // refresh
                this.refreshCommand();

                this.window.edit.activate();
                this.window.edit.show();
                this.window.edit.open();
            } else if ($.editor.control === "collision") {
                let element = this.window.list._data[this.window.list._index]
                if (typeof element === 'string') {
                    if (element.toLocaleLowerCase() === "new polygon") {
                        this.addCollision("polygon")
                        this.window.list.activate()
                        this.refreshCollisionList();
                    } else if (element.toLocaleLowerCase() === "new circle") {
                        this.addCollision("circle")

                        this.window.list.activate()
                        this.refreshCollisionList();
                    } else if (element.toLocaleLowerCase() === "new rect") {
                        this.addCollision("rect")

                        this.window.list.activate()
                        this.refreshCollisionList();
                    }
                    return;
                }

                $.editor.control = "collision-edit";
                $.editor.wedit = null;
                $.editor.weditChange = false;
                $.editor.target = element;
                $.editor.kind = element._kind.toLowerCase();
                // refresh
                this.refreshCommand();

                this.window.edit.activate();
                this.window.edit.show();
                this.window.edit.open();
            } else if ($.editor.control === "particle-new") {
                let element = this.window.list.current();
                $.editor.wedit = null;
                $.editor.control = "particle-texture";
                this.addExample(element)
                this.refreshParticleTexture();
            } else if ($.editor.control === "particle-texture") {
                let element = this.window.list.current();
                if (typeof element === 'string') {
                    if (element.toLocaleLowerCase() === "done") {
                        $.editor.control = "particle";
                        $.editor.wedit = null;
                        this.addParticle();
                        this.refreshParticleList();
                        return;
                    } else if (element.toLocaleLowerCase() === "return") {
                        $.editor.control = "particle-new";
                        $.editor.wedit = null;
                        this.refreshParticleNew();
                        return;
                    }
                }

                this.addExample(this.example.setup.setup, element)

                this.window.list.activate()
                this.window.list.open();
                this.window.list.show();
            } else if ($.editor.control === "setup") {
                switch (this.window.list._index) {
                    case 0: // micro value

                    case 1: // macro value
                    case 2: // time
                    case 3: // speed time
                        Haya.Map.Time.fastTime(true);
                        this.refreshSetupList();
                        this.window.list.activate();
                }
                // $.editor.control = "light-edit";
                // $.editor.wedit = null;
                // // refresh
                // this.refreshCommand();

                // this.window.edit.activate();
                // this.window.edit.show();
                // this.window.edit.open();
            } else if ($.editor.control === "filter") {
                let element = this.window.list.current();
                if (typeof element === 'string') {
                    if (element.toLocaleLowerCase() === "new filter") {
                        this.refreshFilterNew();
                    }
                    return;
                }

                $.editor.control = "filter-edit";
                $.editor.wedit = null;
                // refresh
                this.refreshCommand();

                this.window.edit.activate();
                this.window.edit.show();
                this.window.edit.open();
            } else if ($.editor.control === "filter-new") {
                let element = this.window.list.current();
                $.editor.wedit = null;
                $.editor.control = "filter";
                this._spriteset.addFilter(element)
                this.refreshFilterList();
            }
        }

        onEditTag() {
            if ($.editor.control === "light-edit") {
                if ($.editor.target.kind === "sprite") {
                    switch (this.window.edit._index) {
                        case 0: // position
                            $.editor.wedit = "position";
                            break;
                        case 1: // opacity
                            $.editor.wedit = "alpha";
                            break;
                        case 2: // time
                            $.time++;
                            $.time = $.time > 4 ? 0 : $.time;
                            $.editor.target.time = Haya.Map.Time.isPeriod($.time);
                            this.refreshCommand();
                            this.window.edit.activate();
                            break;
                        case (this.window.edit._data.length - 1): // delete
                            $.editor.wedit = null;
                            this._spriteset.removeLight($.editor.target.name);
                            $.editor.control = "light";
                            this.window.edit.close();
                            this.window.edit.deactivate();
                            this.window.edit.hide();
                            this.refreshLightList();
                            return;
                            break;
                        default:
                            break;
                    }
                } else {
                    switch (this.window.edit._index) {
                        case 0: // position
                            $.editor.wedit = "position";
                            break;
                        case 1: // light-height
                            $.editor.wedit = "height";
                            break;
                        case 2: // brightness
                            $.editor.wedit = "brightness";
                            break;
                        case 3: // radius
                            $.editor.wedit = "radius";
                            break;
                        case 4: // falloffa
                            $.editor.wedit = "falloffa";
                            break;
                        case 5: // falloffb
                            $.editor.wedit = "falloffb";
                            break;
                        case 6: // falloffc
                            $.editor.wedit = "falloffc";
                            break;
                        case 7: // color
                            $.editor.wedit = "color";
                            this.window.color.show();
                            this.window.color.activate();
                            this.window.color.open();
                            this.window.color._index = 0;
                            break;
                        case 8: // time
                            $.time++;
                            $.time = $.time > 4 ? 0 : $.time;
                            $.editor.target.time = Haya.Map.Time.isPeriod($.time);
                            this.refreshCommand();
                            this.window.edit.activate();
                            break;
                        case (this.window.edit._data.length - 1): // delete
                            $.editor.wedit = null;
                            this._spriteset.removeLight($.editor.target.name);
                            $.editor.control = "light";
                            this.window.edit.close();
                            this.window.edit.deactivate();
                            this.window.edit.hide();
                            this.refreshLightList();
                            return;
                            break;
                        default:
                            break;
                    }
                }

                // catchup

            } else if ($.editor.control === "particle-edit") {
                // catchup
                switch (this.window.edit._index) {
                    case 1: // position
                        $.editor.wedit = "position"; break;
                    case 0: // delete
                        $.editor.wedit = null;
                        this.removeParticle($.editor.target.name);
                        $.editor.control = "particle";
                        this.window.edit.close();
                        this.window.edit.deactivate();
                        this.window.edit.hide();
                        this.refreshParticleList();
                        return;
                        break;
                    default:
                        break;
                }
            } else if ($.editor.control === "collision-edit") {
                if ($.editor.kind === "circle") {
                    if (this.window.edit._index === 0) { // pos
                        $.editor.wedit = "position"
                    } else if (this.window.edit._index === 1) { // radius
                        $.editor.wedit = "radius"
                    } else if (this.window.edit._index === 2) { // scale
                        $.editor.wedit = "scale"
                    } else if (this.window.edit._index === 3) { // padding
                        $.editor.wedit = "padding"
                    } else if (this.window.edit._index === (this.window.edit._data.length - 1)) { // delete
                        $.editor.wedit = null;
                        $.editor.kind = null;
                        $.editor.weditChange = false;
                        this.removeCollision($.editor.target._name);
                        $.editor.control = "collision";
                        this.window.edit.close();
                        this.window.edit.deactivate();
                        this.window.edit.hide();
                        this.refreshCollisionList();
                    }
                    return;
                } else if ($.editor.kind === "polygon") {
                    if (this.window.edit._index === 0) { // pos
                        $.editor.wedit = "position"
                    } else if (this.window.edit._index === 1) { // new point
                        //$.editor.target.cachePoints
                        $.editor.target.cachePoints.push([
                            $.editor.target.x - ((Graphics.width / 2) + this.display.x),
                            $.editor.target.y - ((Graphics.width / 2) + this.display.y),
                        ])

                        $.editor.target.setPoints($.editor.target.cachePoints)

                        this.refreshCommand();
                        this.refreshDraw()
                        this.window.edit.activate();
                        return;
                    } else if (this.window.edit._index === 2) { // angle
                        $.editor.wedit = "angle"
                    } else if (this.window.edit._index === 3) { // scaleX
                        $.editor.wedit = "scaleX"
                    } else if (this.window.edit._index === 4) { // scaleY
                        $.editor.wedit = "scaleY"
                    } else if (this.window.edit._index === 5) { // padding
                        $.editor.wedit = "padding"
                    } else if (this.window.edit._index === (this.window.edit._data.length - 1)) { // delete
                        $.editor.wedit = null;
                        $.editor.kind = null;
                        $.editor.weditChange = false;
                        this.removeCollision($.editor.target._name);
                        $.editor.control = "collision";
                        this.window.edit.close();
                        this.window.edit.deactivate();
                        this.window.edit.hide();
                        this.refreshCollisionList();
                    } else if (this.window.edit.current().length === 3) {
                        $.editor.wedit = "point";
                        $.editor.timeBuffer = $.editor.timeBufferMax;
                        $.editor.pointId = this.window.edit.current()[2];
                    }
                } else if ($.editor.kind === "rect") {
                    if (this.window.edit._index === 0) { // pos
                        $.editor.wedit = "position"
                    } else if (this.window.edit._index === 1) { // angle
                        $.editor.wedit = "angle"
                    } else if (this.window.edit._index === 2) { // scaleX
                        $.editor.wedit = "scaleX"
                    } else if (this.window.edit._index === 3) { // scaleY
                        $.editor.wedit = "scaleY"
                    } else if (this.window.edit._index === 4) { // scale
                        $.editor.wedit = "scaleRect"
                    } else if (this.window.edit._index === 5) { // padding
                        $.editor.wedit = "padding"
                    } else if (this.window.edit._index === (this.window.edit._data.length - 1)) { // delete
                        $.editor.wedit = null;
                        $.editor.kind = null;
                        $.editor.weditChange = false;
                        this.removeCollision($.editor.target._name);
                        $.editor.control = "collision";
                        this.window.edit.close();
                        this.window.edit.deactivate();
                        this.window.edit.hide();
                        this.refreshCollisionList();
                    } else if (this.window.edit.current().length === 3) {
                        $.editor.wedit = "point";
                        $.editor.timeBuffer = $.editor.timeBufferMax;
                        $.editor.pointId = this.window.edit.current()[2];
                    }
                }
            }
        }

        onColorPick() {
            $.editor.target.color = this.window.color._data[this.window.color._index];
            this.window.color.activate();
        }
        // ===========================================================
        updateToolbar() {
            // to show, to hide
            if (TouchInput.isCancelled()) this.editor.toolbar = !this.editor.toolbar;
            // [LIGHT]
            this.editor.light.sprite.visible = this.editor.toolbar;
            this.editor.light.update();
            // [PARTICLE]
            this.editor.particle.sprite.visible = this.editor.toolbar;
            this.editor.particle.update();
            // [COLLISION]
            this.editor.collision.sprite.visible = this.editor.toolbar;
            this.editor.collision.update();
            // [SETUP]
            this.editor.setup.sprite.visible = this.editor.toolbar;
            this.editor.setup.update();
            // [Filter]
            this.editor.filter.sprite.visible = this.editor.toolbar;
            this.editor.filter.update();
            // [Save]
            this.editor.save.sprite.visible = this.editor.toolbar;
            this.editor.save.update();
        }

        updatePivot() {
            //
            if (this.mouse.x.isBetween(0, Graphics.width) && (this.mouse.y.isBetween(0, 16))) {
                this.display.y -= 8;
                if (this.display.y <= 8) {
                    this.display.y = 0;
                }
            } else if (this.mouse.x.isBetween(0, Graphics.width) && (this.mouse.y.isBetween(Graphics.height - 16, Graphics.height))) {
                this.display.y += 8;
                if (this.display.y >= ((Haya.Map.current.height || Graphics.height) - Graphics.height)) {
                    this.display.y = ((Haya.Map.current.height || Graphics.height) - Graphics.height);
                }
            } else if (this.mouse.x.isBetween(0, 16) && (this.mouse.y.isBetween(0, Graphics.height))) {
                this.display.x -= 8;
                if (this.display.x <= 8) {
                    this.display.x = 0;
                }
            } else if (this.mouse.x.isBetween(Graphics.width - 16, Graphics.width) && (this.mouse.y.isBetween(0, Graphics.height))) {
                this.display.x += 8;
                if (this.display.x >= ((Haya.Map.current.width || Graphics.width) - Graphics.width)) {
                    this.display.x = ((Haya.Map.current.width || Graphics.width) - Graphics.width);
                }
            }
            //
        }


        updateLayer() {
            this._spriteset.sprite.pivot.x = this.display.x;
            this._spriteset.sprite.pivot.y = this.display.y;

            if ((this._spriteset.display.x !== this.display.x) || (this._spriteset.display.y !== this.display.y)) {
                this._spriteset.display.x = this.display.x;
                this._spriteset.display.y = this.display.y;

                for (let index = 0; index < this.collision.element.length; index++) {
                    const element = this.collision.element[index];
                    element._graphic.pivot.x = this.display.x;
                    element._graphic.pivot.y = this.display.y;
                }
            }
        }

        updateUI() {
            this.particleExample.visible = ($.editor.control === "particle-new" || $.editor.control === "particle-texture")
            this.lightExample.visible = ($.editor.control === "light-new");
            this.graphicCollision.visible = ($.editor.control === "collision" || $.editor.control === "collision-edit");
            if (typeof $.editor.control === 'string') {
                if (!($.editor.control.includes("-edit"))) {
                    this.window.list.update();
                    this.window.list.visible = this.editor.toolbar;
                    this.window.list.x = this.window.list.visible ? this.window.list._oldPoint.x : -Graphics.width;
                    this.window.edit.visible = false;


                    if ($.editor.control === "collision") {
                        if (this.oldIndex !== this.window.list._index) {
                            this.oldIndex = this.window.list._index
                            this.refreshDraw();
                            this.refreshGraphic(this.window.list.current(), true);
                        }
                    }


                } else if (($.editor.control.includes("-edit"))) {
                    // reset
                    this.window.list.close();
                    this.window.list.deactivate();
                    this.window.list.hide();

                    this.window.edit.update();
                    this.window.edit.visible = this.editor.toolbar;
                    this.window.edit.x = this.window.edit.visible ? this.window.edit._oldPoint.x : -Graphics.width;

                    // wedit
                    if ($.editor.wedit !== null) this.wedit();
                }
            };
            if (this.window.color.visible === true) {
                if ($.editor.wedit !== "color" && $.editor.control !== "light-edit") {
                    this.window.color.visible = false;
                    this.window.color.close();
                }
            }
        }

        //
        collisionUpdate() {
            return;
            Haya.Collision.System.update();
            if (Input.isTriggered('r')) print($gamePlayer._collision.body.potentials());
            if (($gamePlayer.isMoving())) {
                this.playerCollision();
            }
        }
        //
        playerCollision() {
            $gamePlayer.updateCollisionPosition();
            // check out all available collisions
            const player_potentials = $gamePlayer._collision.body.potentials();
            //print($gamePlayer._collision.body)
        
            //$.data.collision.base.boucing
            //$.data.collision.base.space

            for (const wall of player_potentials) {
                
                // check out the collision and if is colliding;
                if ($gamePlayer._collision.body.collides(wall, $.result)) {
                    // push against the wall
                    let overlaping_x = ($.result.overlap * $.result.overlap_x);
                    let overlaping_y = ($.result.overlap * $.result.overlap_y);
                    $gamePlayer._x -= overlaping_x;
                    $gamePlayer._y -= overlaping_y;

                    // action;
                    if (wall.label !== 'base') $gamePlayer.collisionAction(wall);

                    $gamePlayer._x += Haya.Movement.bounce * $.result.overlap_x;
                    $gamePlayer._y += Haya.Movement.bounce * $.result.overlap_y;
                }
            }
            // restore the original move speed 
            if ($gamePlayer._moveSpeed !== $gamePlayer._cacheMoveSpeed) {
                $gamePlayer._moveSpeed = $gamePlayer._cacheMoveSpeed
            }
        }
        // ===========================================================
        wedit() {
            if ($.editor.control.includes("light")) {
                this.weditLight()
            } else if ($.editor.control.includes("collision")) {
                this.weditCollision()
            } else if ($.editor.control.includes("particle")) {
                this.weditParticle()
            }
        }

        weditLight() {


            if ($.editor.wedit === "position") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    $.editor.target.position.x = this.mouse.x + this.display.x;
                    $.editor.target.position.y = this.mouse.y + this.display.y;
                    $.editor.weditChange = true;
                }
            } else if ($.editor.wedit === "height") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.lightHeight += 0.01;
                    $.editor.weditChange = true;
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.lightHeight -= 0.01;
                    $.editor.weditChange = true;
                }
            } else if ($.editor.wedit === "brightness") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.brightness += 0.1;
                    $.editor.weditChange = true;
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.brightness -= 0.1;
                    $.editor.weditChange = true;
                }
            } else if ($.editor.wedit === "radius") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.radius += 5;
                    $.editor.weditChange = true;
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.radius -= 5;
                    $.editor.weditChange = true;
                }
            } else if ($.editor.wedit === "falloffa") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.falloff[0] += 0.1;
                    $.editor.weditChange = true;
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.falloff[0] -= 0.1;
                    $.editor.weditChange = true;
                }
            } else if ($.editor.wedit === "falloffb") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.falloff[1] += 0.1;
                    $.editor.weditChange = true;
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.falloff[1] -= 0.1;
                    $.editor.weditChange = true;
                }
            } else if ($.editor.wedit === "falloffc") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.falloff[2] += 1;
                    $.editor.weditChange = true;
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.falloff[2] -= 1;
                    $.editor.weditChange = true;
                }
            } else if ($.editor.wedit === "color") {
                this.window.color.visible = this.editor.toolbar;
                this.window.color.update();
            } else if ($.editor.wedit === "alpha") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.alpha += 0.1;
                    $.editor.weditChange = true;
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.alpha -= 0.1;
                    $.editor.weditChange = true;
                }
            }



            if (this.mouse.x.isBetween(this.window.edit.x, this.window.edit.x + this.window.edit.width)
                && this.mouse.y.isBetween(this.window.edit.y, this.window.edit.y + this.window.edit.height)
                && this.window.edit.visible) {
                if (TouchInput.isTriggered()) {
                    $.editor.wedit = null;
                    $.editor.weditChange = false;
                    this.window.color.hide();
                    this.window.color.close();
                    this.window.color.deactivate();
                    this.window.edit.activate();
                }
            }

            // true
            if ($.editor.weditChange === true) {
                $.editor.weditChange = false;
                this.refreshCommand();
            }
        }

        weditCollision() {
            if ($.editor.wedit === "position") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    $.editor.target.x = this.mouse.x + this.display.x;
                    $.editor.target.y = this.mouse.y + this.display.y;
                    $.editor.weditChange = true
                } else if (Input.isPressed('down')) {
                    $.editor.target.y += 1;
                    $.editor.weditChange = true
                } else if (Input.isPressed('up')) {
                    $.editor.target.y -= 1;
                    $.editor.weditChange = true
                } else if (Input.isPressed('right')) {
                    $.editor.target.x += 1;
                    $.editor.weditChange = true
                } else if (Input.isPressed('left')) {
                    $.editor.target.x -= 1;
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "radius") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.radius += 1;
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.radius -= 1;
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "scale") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.scale += 0.1;
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.scale -= 0.1;
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "padding") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.padding += 1;
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.padding -= 1;
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "angle") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.angle += 0.05;
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.angle -= 0.05;
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "scaleX") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.scale_x += 0.05;
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.scale_x -= 0.05;
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "scaleY") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.scale_y += 0.05;
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.scale_y -= 0.05;
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "scaleRect") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.scale_y += 0.05;
                    $.editor.target.scale_x += 0.05;
                    $.editor.weditChange = 10;
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.scale_y -= 0.05;
                    $.editor.target.scale_x -= 0.05;
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "point") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                } else if (Input.isTriggered('d')) {
                    let cachePoints = [];
                    let toDelete = $.editor.target.cachePoints[$.editor.pointId]

                    $.editor.target.cachePoints.forEach((points) => {
                        if (points[0] === toDelete[0] && points[1] === toDelete[1]) {
                            return;
                        } else {
                            cachePoints.push(points)
                        }
                    })

                    $.editor.target.cachePoints = cachePoints;

                    $.editor.weditChange = true;

                }




                if (this.editor.toolbar === false) {
                    if (TouchInput.isPressed()) { // isPressed

                        $.editor.target.cachePoints[$.editor.pointId][0] = (this.mouse.x + this.display.x) - $.editor.target.x;
                        $.editor.target.cachePoints[$.editor.pointId][1] = (this.mouse.y + this.display.y) - $.editor.target.y;
                        $.editor.weditChange = true
                    }
                }
            }
            //
            if (this.mouse.x.isBetween(this.window.edit.x, this.window.edit.x + this.window.edit.width)
                && this.mouse.y.isBetween(this.window.edit.y, this.window.edit.y + this.window.edit.height)
                && this.window.edit.visible) {
                if (TouchInput.isTriggered()) {
                    $.editor.wedit = null;
                    $.editor.weditChange = false;
                    this.window.edit.activate();
                    return;
                }
            }

            // true
            if ($.editor.weditChange) {
                if ($.editor.wedit === "point") {
                    $.editor.target.setPoints($.editor.target.cachePoints)
                }

                this.refreshCommand();
                this.refreshGraphic($.editor.target)

                $.editor.weditChange = false;
            }
        }

        weditParticle() {

            if ($.editor.wedit === "position") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                if (Input.isPressed('down')) {
                    $.editor.target.y += 1; $.editor.weditChange = true;
                } else if (Input.isPressed('up')) {
                    $.editor.target.y -= 1; $.editor.weditChange = true;
                } else if (Input.isPressed('left')) {
                    $.editor.target.x -= 1; $.editor.weditChange = true;
                } else if (Input.isPressed('right')) {
                    $.editor.target.x += 1; $.editor.weditChange = true;
                }

                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    $.editor.target.x = (this.mouse.x + this.display.x) / 2;
                    $.editor.target.y = (this.mouse.y + this.display.y) / 2;
                    $.editor.weditChange = true;
                }
            }

            if (this.mouse.x.isBetween(this.window.edit.x, this.window.edit.x + this.window.edit.width)
                && this.mouse.y.isBetween(this.window.edit.y, this.window.edit.y + this.window.edit.height)
                && this.window.edit.visible) {
                if (TouchInput.isTriggered()) {
                    $.editor.wedit = null;
                    $.editor.weditChange = false;
                    this.window.color.hide();
                    this.window.color.close();
                    this.window.color.deactivate();
                    this.window.edit.activate();
                }
            }

            // true
            if ($.editor.weditChange === true) {
                $.editor.weditChange = false;
                print($.editor.target)
                this.refreshCommand();
            }
        }

        save() {
            $.save.name = Haya.Map.current.name;
            $.save.id = Haya.Map.id;
            $.save.width = Haya.Map.current.width;
            $.save.height = Haya.Map.current.height;
            // saveLight
            Object.keys(this._spriteset.light.source).map((value, index) => {
                // item
                let item = this._spriteset.light.source[value];
                //

                // is sprite
                if (item.kind === "sprite") {
                    $.save.light[value] = {
                        position: [item.position.x, item.position.y],
                        url: item.texture.baseTexture.imageUrl || null,
                        alpha: item.alpha || 1.0,
                        switch: item.switch,
                        nature: item.nature,
                        name: item.name,
                        kind: item.kind,
                        time: item.time,
                        blendMode: item.blendMode,
                        pivot: [item.pivot.x, item.pivot.y]
                    };
                } else {
                    $.save.light[value] = {
                        position: [item.position.x, item.position.y],
                        range: item.range,
                        switch: item.switch,
                        color: item._color,
                        nature: item.nature,
                        dirty: item.dirty,
                        brightness: Haya.DMath.float(item.brightness),
                        falloff: [Haya.DMath.float(item.falloff[0]), Haya.DMath.float(item.falloff[1]), Haya.DMath.float(item.falloff[2])],
                        name: item.name,
                        kind: item.kind,
                        time: item.time,
                        blendMode: item.blendMode,
                        lightHeight: Haya.DMath.float(item.lightHeight),
                        pivot: [item.pivot.x, item.pivot.y],
                        effect: item.effect
                    };
                }
            })
            // saveParticle
            Object.keys(this._spriteset.particle.source).map((value, index) => {
                // item
                let item = this._spriteset.particle.source[value];
                let name = `${value}`

                let _particle = Haya.Map.current.particle[value];

                $.save.particle[name] = {};
                $.save.particle[name].x = Haya.DMath.float(item.x);
                $.save.particle[name].y = Haya.DMath.float(item.y);
                $.save.particle[name].setup = item.setup.setup;
                $.save.particle[name].textures = item.setup.textures;


            })
            // saveCollision
            Object.keys(this.collision.source).map((value, index) => {
                // item
                let item = this.collision.source[value];
                //
                $.save.collision[value] = {
                    x: item.x,
                    y: item.y,
                    kind: item._kind,
                    name: item._name,
                    padding: item.padding
                };

                // if is circle
                if (item._kind === "circle") {
                    $.save.collision[value]["radius"] = item.radius
                    $.save.collision[value]["scale"] = item.scale;
                } else if (item._kind === "polygon" || item._kind === "rect") {
                    $.save.collision[value]["scale_x"] = Haya.DMath.float(item.scale_x);
                    $.save.collision[value]["scale_y"] = Haya.DMath.float(item.scale_y);
                    $.save.collision[value]["angle"] = item.angle;
                    $.save.collision[value]["points"] = item.cachePoints;
                }
            })
            // save
            Haya.FileIO.wjson($.save, "img/maps/" + Haya.Map.current.name + "/data")
            // end
            alert("Saved!");
        }
    }
    // ========================================================================
    // SCENE TITLE JUMP OUT
    Scene_Title.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
        this.commandNewGame();
        this.centerSprite(this._backSprite1);
        this.centerSprite(this._backSprite2);
        this.playTitleMusic();
        this.startFadeIn(this.fadeSpeed(), false);

    };
    Haya.Map.scene = Scene_Editor;
    // Scene_Title.prototype.commandNewGame = function () {
       
        
    //     DataManager.setupNewGame();
    //     this._commandWindow.close();
    //     this.fadeOutAll();
    //     $._map = $dataMapInfos[$dataSystem.startMapId].name
    //     print($._map);
    //     SceneManager.goto(Loader_Map);
    // };
    // ========================================================================
    print($, "Haya Map Editor")
})(Haya.Map_Editor)

/*
 var gui = new dat.GUI();
  gui.add(text, 'message');
  gui.add(text, 'speed', -5, 5);
  gui.add(text, 'displayOutline');
  gui.add(text, 'explode'); 
 */