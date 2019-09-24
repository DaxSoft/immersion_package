/**
 * @file [haya_map_editor.js -> Haya - Map Editor]
 * @description This is a editor in-game for the maps using
 * Haya elements.
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @thanks to Jonforum!
 * @version 0.2.6
 * @license HAYA <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @todo 
 *  [x] Light Editor
 *      [x] : Editor itself
 *          [x] : position
 *              [x] : Long pressing mouse to change
 *          [x] : light height
 *          [x] : brightness
 *          [x] : radius
 *          [x] : color
 *              [x] : Pallete
 *              [x] : Change value itself
 *          [x] : falloff
 *          [x] : Floor
 *          [x] : Pulse (Effect)
 *          [x] : Switch to On/Off
 *          [x] : Time cycle
 *              [x] : Day, Afternoon, Night
 *          [x] : Blend 
 *      [x] : +Point
 *      [x] : +Directional
 *      [x] : +Picture
 *      [] : Follow: ID #0-> player #-1 -> don't follow up
 *      []  : Framed Light Sprite when the Filename has '!' as prefix and '_XxY' as sufix 
 * !fire_3x3.png
 *  [] Particle Editor
 *      [] Editor itself
 *          [] : Position
 *          [] : Accelaration
 *          [] : Change texture
 *          [] : Z Index
 *          [] : Switch to on/off
 *      [] +Particle
 *  [x] Collision Editor
 *      [x] : Editor itself
 *          [x] : Position
 *          [x] : Radius
 *          [x] : Scale
 *          [x] : Angle
 *          [x] : Point
 *          [x] : Floor
 *          [x] : Switch to on/off
 *      [x] : +Rectangle
 *      [x] : +Polygon
 *      [x] : +Circle
 *      [x] : Category by Floor!
 *  [x] Sound Editor
 *      [x] : Position (X, Y, Z)
 *      [x] : Volume
 *      [x] : Switch
 *      [x] : +BGM
 *      [x] : +BGS
 *      [x] : +ME
 *      [x] : +SE
 *      [x] : Loop
 *      [x] : Rate
 *      [x] : Panner
 *      [] : Fade 
 *      [x] : Time
 *      [] : Region ID #play only if the player is on region
 *      [] : Player Moving #play everytime that the player moves
 *      [] : Follow: ID #0-> player #-1 -> don't follow up
 *  [] Weather Editor
 *      [] : +Rain
 *      [] : +Snow
 *      [] : +Fog
 *          [] : Intesity
 *          [] : Sound
 *          [] : Volume
 *          [] : Switch
 *          [] : Floor
 *          [] : Duration
 *          [] : Loop
 *          [] : Time
 *  [x] Sprite Editor #for the pictures of the map
 *      [] : Opacity #Change the opacity when is above the player
 *      [x] : Alpha #change the overall opacity
 *      [] : Switch #Shows up only when the switch is on
 *      [x] : Floor #change the floor in which the sprite is
 *      [x] : Blend Mode 
 *      [x] : X, Y axis position
 *      [x] : Rotation
 *      [x] : Scale
 *      [x] : Anchor set
 *      [] : Swap Children Position among
 *      [] : Region Collsion Body
 *      [] : Region ID
 *  [x] Edit Parameters List
 *      [] Scrollbar at
 *      [] Import list (more easy for add-ons)
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Map_Editor = Haya.Map_Editor || {};
/*:
 * @author Dax Soft | www.dax-soft.weebly.com
 * 
 * @plugindesc [0.2.6] Haya Map Editor
 * 
 * @help This is a scene editor made for the plugin-pack
 * named Immersion. This editor is for the map itself,
 * in which you will can edit/create stuff as lights,
 * particles, filters, collisions, sounds, weathers and
 * so on.
 * 
 * Important! This is a plugin under development, if 
 * you do find any bug or error, please, contact me!
 * 
 */

void function ($) {
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
        weditCallback: null,
        //
        textInput: false,
        //
        collisionCategory: "base",
        // timeBuffer
        timeBuffer: 1,
        timeBufferMax: 60,
        //
        swap: {value: null, target: null},
        // color control
        pallete: {
            // colors
            red: 16, green: 16, blue: 16,
            r: 16, g: 16, b: 16,
            // pallete
            color: Haya.File.json(Haya.File.local("img/maps/editor/color.json"))
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
        sound: {},
        //
        weather: {},
        //
        sprite: {}
    }
    //
    $.particle = { source: {}, textures: {} };
    $.light = { textures: {} }
    $.sound = { bgm: {}, bgs: {}, me: {}, se: {} }
    //
    $.time = 0;
    $.floor = 0;
    //
    $.htimeout = { value: 0, method: null }
    // =================================================================================
    Haya.File.list("data/particles", function (filename) {
        // replace filename
        let _filename = filename.replace(/^.*[\\\/]/, '');
        // load just '.json' file
        if (_filename.match(/\.json$/gi)) {
            // load data 'npc' setup
            let _json = Haya.File.json(filename);
            let name = _filename.replace(/\.json/gi, "")
            //
            $.particle.source[name] = [_filename, _json, filename];
        }
    }) // end object

    Haya.File.list("img/particles", function (filename) {
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

    Haya.File.list("img/maps/lights", function (filename) {
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

    Haya.File.list("audio/bgm", function (filename) {
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

    Haya.File.list("audio/bgs", function (filename) {
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

    Haya.File.list("audio/me", function (filename) {
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

    Haya.File.list("audio/se", function (filename) {
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
        toolbar_light: Haya.File.local("img/maps/editor/toolbar_light.png"),
        toolbar_collision: Haya.File.local("img/maps/editor/toolbar_light.png"),
        toolbar_particle: Haya.File.local("img/maps/editor/toolbar_light.png"),
        toolbar_sound: Haya.File.local("img/maps/editor/toolbar_light.png"),
        toolbar_setup: Haya.File.local("img/maps/editor/toolbar_light.png"),
        toolbar_filter: Haya.File.local("img/maps/editor/toolbar_light.png"),
        toolbar_event: Haya.File.local("img/maps/editor/toolbar_light.png"),
        save: Haya.File.local("img/maps/editor/save.png")
    })
    //
    //$gameSystem = new Game_System();
    /**
     * @description load all maps information
     */
    function loadLibrary() {
        let directory = Haya.File.dirList(Haya.File.local("img/maps"));
        directory.forEach((dir) => {
            // record all except by editor stuffs
            if (!(dir.match(/(editor|Maps)$/gi))) {
                // get the map name
                let mapName = dir.split(/\\|\//gi); mapName = mapName[mapName.length - 1];
                $.data.library.directory[mapName] = Haya.File.clean(dir);
            }
        })
        // setu´4
        //$.data.library.map = Haya.File.json(Haya.File.local("img/maps/map.json"));
    }; loadLibrary();
    // ========================================================================
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
                this.drawText(`[${item.sprite.time}] ${item.kind}_${item._name}`, rect.x, rect.y, rect.width, rect.height)
            } else if ($.editor.control === "particle") {
                this.drawText(`${item.name}`, rect.x, rect.y, rect.width, rect.height)
            } else if ($.editor.control === "collision") {
                this.drawText(`[${item.floor}] : ${item._name}`, rect.x, rect.y, rect.width, rect.height)
            } else if ($.editor.control === "setup") {
                this.drawText((item[0] + "\t\t\t" + item[1]), rect.x, rect.y, rect.width, rect.height)
            } else if ($.editor.control === "sound") {
                this.drawText(`${item[1]}: ${item[0]}`, rect.x, rect.y, rect.width, rect.height)
            } else if ($.editor.control === "sprite") {
                this.drawText(`[${item.floor}]: ${item.linfo}`, rect.x, rect.y, rect.width, rect.height)
            } else if ($.editor.control === "weather") {
                this.drawText(`[${item.setup.floor}]: ${item.kind} <${item.id}>`, rect.x, rect.y, rect.width, rect.height)
            }

        }

    };

    List.prototype.refresh = function () {
        this.createContents();
        this.drawAllItems();
    };
    // ========================================================================
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

    // ========================================================================

    Sprite_Map.prototype.createCharacter = function () {


        this._characters = [];
        // create player
        // new Sprite_Character($gamePlayer)
        var player = new Haya.Map.Hayaset_Character($gamePlayer);
        print(player, "PLAYER")
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

    Game_Map.prototype.setupEvents = function () {
        this._events = [];

    };
    // ========================================================================
    // ========================================================================
    class Scene_Editor extends Scene_Base {
        // ===========================================================
        constructor() {
            super();
            this.toolbar = true;
            this.button = {};
            this.gui = new PIXI.Container();
            this.gui.toolbar = new PIXI.Container();
            this.graphicCollision = new PIXI.Container();
            this.addChild(this.graphicCollision);
            this.gui.editor = new PIXI.Container();
            this.gui.camera = new Point(0, 0)
            this.gui.addChild(this.gui.toolbar, this.gui.editor)


            this.particle = { element: [], source: {} }
            this.light = { element: [], source: {} }
            this.filter = { element: [], source: {} }
            this.collision = { element: [], source: {}, graphic: [] }
            this.sound = { element: [], source: {}, graphic: [] }

            this.display = new Point(0, 0);
            this.camera = new Point(0, 0);
        }

        start() {
            super.start.call(this)
            SceneManager.clearStack();
        }

        update() {
            super.update.call(this);
            this.updateMain();
            this.updateUI();
            this.updatePivot();
            if (Haya.Utils.isFunction($.htimeout.method)) {
                if ($.htimeout.value < 1) {
                    $.htimeout.method.call(this);
                    $.htimeout.method = null;
                } else { $.htimeout.value-- }
            }
            if (this.graphicCollision.visible === true) this.updateCollisionPivot();
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
            $gameMap._camera = null;
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

            this.createCollision();
            this.gui.list = new List(64, 64);
            this.gui.list.setHandler('ok', this.onEditList.bind(this))
            this.gui.addChild(this.gui.list)

            this.gui.pallete = new Pallete_Color(Graphics.width - 256, 64);
            this.gui.addChild(this.gui.pallete)
            this.gui.pallete._data = [];
            Object.keys($.editor.pallete.color).map((key) => {
                let element = $.editor.pallete.color[key]
                this.gui.pallete._data.push(element)
            })
            this.gui.pallete.setHandler('ok', this.onColorPick.bind(this))
            this.gui.pallete.refresh();
            // createUI
            this.createUI();
            //
            this.light.source = this._spriteset.light.source;
            this.light.element = this._spriteset.light.element;

            this.gui.folderLight = new Haya.GUI.FolderManager({
                folder: "img/maps/lights",
                filetype: /\.png$/gi,
                action: function (texture) {
                    SceneManager._scene._spriteset.addLight(
                        "sprite " + String(SceneManager._scene.light.element.length + 1),
                        "sprite",
                        {
                            texture: texture.url,
                            kind: "sprite"
                        },
                        SceneManager._scene._spriteset.sprite
                    )
                }
            })
            this.gui.addChild(this.gui.folderLight)
            this.addChild(this.gui)

        }

        createSpriteset() {
            this._spriteset = new Sprite_Map();

            Haya.Map.Viewport = new PIXI.extras.Viewport({
                screenWidth: Graphics.width,
                screenHeight: Graphics.height,
                worldWidth: Haya.Map.current.width || Graphics.width,
                worldHeight: Haya.Map.current.height || Graphics.height
            })

            // clamp direction
            Haya.Map.Viewport.clamp({ direction: "all" })
            // clamp zoom
            Haya.Map.Viewport.clampZoom({
                minWidth: Graphics.width / 3,
                minHeight: Graphics.height / 3,
                maxWidth: Haya.Map.Viewport.worldWidth,
                maxHeight: Haya.Map.Viewport.worldHeight,
            })
            this.addChild(Haya.Map.Viewport);
            Haya.Map.Viewport.addChild(this._spriteset.sprite);
        }

        createUI() {

            this.button.light = new Haya.GUI.Button({
                text: "LIGHT",
                action: () => {
                    this.refresh();
                    if (typeof $.editor.control === 'string') {
                        if (!($.editor.control.includes("light"))) {
                            $.editor.control = null;
                        }
                    }
                    if ($.editor.control === "light-edit") {

                        $.editor.control = "light";

                        // deactive edit gui
                        this.refreshEditor();

                        SceneManager._scene.gui.list.activate();
                        SceneManager._scene.gui.list.open();
                        SceneManager._scene.gui.list.show();
                        SceneManager._scene.refreshLightList();


                    } else {
                        // update
                        $.editor.control = $.editor.control === null ? "light" : null;

                        if ($.editor.control === "light") {
                            SceneManager._scene.refreshLightList();

                        } else {
                            SceneManager._scene.gui.list.deactivate();
                            SceneManager._scene.gui.list.close();
                            SceneManager._scene.gui.list.hide();
                        }
                    }
                }
            })
            this.gui.toolbar.addChild(this.button.light)

            this.button.collision = new Haya.GUI.Button({
                text: "COLLISION",
                position: [100, 0],
                action: () => {
                    this.refresh();
                    if (typeof $.editor.control === 'string') {
                        if (!($.editor.control.includes("collision"))) {
                            $.editor.control = null;
                        }
                    }

                    if ($.editor.control === "collision-edit") {

                        $.editor.control = "collision";

                        SceneManager._scene.refreshEditor();

                        SceneManager._scene.gui.list.activate();
                        SceneManager._scene.gui.list.open();
                        SceneManager._scene.gui.list.show();
                        SceneManager._scene.refreshCollisionList();

                    } else {
                        // update
                        $.editor.control = $.editor.control === null ? "collision" : null;

                        if ($.editor.control === "collision") {
                            SceneManager._scene.refreshCollisionList();

                        } else {
                            SceneManager._scene.gui.list.deactivate();
                            SceneManager._scene.gui.list.close();
                            SceneManager._scene.gui.list.hide();
                        }
                    }
                }
            })
            this.gui.toolbar.addChild(this.button.collision)

            this.button.particle = new Haya.GUI.Button({
                text: "PARTICLE",
                position: [200, 0],
                action: () => {
                    this.refresh();
                }
            })
            this.gui.toolbar.addChild(this.button.particle)

            this.button.sound = new Haya.GUI.Button({
                text: "SOUND",
                position: [300, 0],
                action: () => {
                    this.refresh();
                    if (typeof $.editor.control === 'string') {
                        if (!($.editor.control.includes("sound"))) {
                            $.editor.control = null;
                        }
                    }

                    if ($.editor.control === "sound-edit") {

                        $.editor.control = "sound";

                        SceneManager._scene.refreshEditor();

                        SceneManager._scene.gui.list.activate();
                        SceneManager._scene.gui.list.open();
                        SceneManager._scene.gui.list.show();
                        SceneManager._scene.refreshSoundList();

                    } else {
                        // update
                        $.editor.control = $.editor.control === null ? "sound" : null;

                        if ($.editor.control === "sound") {
                            SceneManager._scene.refreshSoundList();

                        } else {
                            SceneManager._scene.gui.list.deactivate();
                            SceneManager._scene.gui.list.close();
                            SceneManager._scene.gui.list.hide();
                        }
                    }
                }
            })
            this.gui.toolbar.addChild(this.button.sound)

            this.button.weather = new Haya.GUI.Button({
                text: "WEATHER",
                position: [400, 0],
                action: () => {
                    this.refresh();
                    if (typeof $.editor.control === 'string') {
                        if (!($.editor.control.includes("weather"))) {
                            $.editor.control = null;
                        }
                    }

                    if ($.editor.control === "weather-edit") {

                        $.editor.control = "weather";

                        SceneManager._scene.refreshEditor();

                        SceneManager._scene.gui.list.activate();
                        SceneManager._scene.gui.list.open();
                        SceneManager._scene.gui.list.show();
                        SceneManager._scene.refreshWeatherList();

                    } else {
                        // update
                        $.editor.control = $.editor.control === null ? "weather" : null;

                        if ($.editor.control === "weather") {
                            SceneManager._scene.refreshWeatherList();

                        } else {
                            SceneManager._scene.gui.list.deactivate();
                            SceneManager._scene.gui.list.close();
                            SceneManager._scene.gui.list.hide();
                        }
                    }
                }
            })
            this.gui.toolbar.addChild(this.button.weather)

            this.button.sprite = new Haya.GUI.Button({
                text: "SPRITE",
                position: [500, 0],
                action: () => {
                    this.refresh();
                    if (typeof $.editor.control === 'string') {
                        if (!($.editor.control.includes("sprite"))) {
                            $.editor.control = null;
                        }
                    }

                    if ($.editor.control === "sprite-edit") {

                        $.editor.control = "sprite";

                        SceneManager._scene.refreshEditor();

                        SceneManager._scene.gui.list.activate();
                        SceneManager._scene.gui.list.open();
                        SceneManager._scene.gui.list.show();
                        SceneManager._scene.refreshSpriteList();

                    } else {
                        // update
                        $.editor.control = $.editor.control === null ? "sprite" : null;

                        if ($.editor.control === "sprite") {
                            SceneManager._scene.refreshSpriteList();

                        } else {
                            SceneManager._scene.gui.list.deactivate();
                            SceneManager._scene.gui.list.close();
                            SceneManager._scene.gui.list.hide();
                        }
                    }
                }
            })
            this.gui.toolbar.addChild(this.button.sprite)

            this.button.save = new Haya.GUI.Button({
                text: "SAVE",
                position: [600, 0],
                action: () => {
                    // header
                    $.save.name = Haya.Map.current.name;
                    $.save.id = Haya.Map.id;
                    $.save.width = Haya.Map.current.width;
                    $.save.height = Haya.Map.current.height;
                    // save light components
                    Object.keys(this._spriteset.light.source).map((value, index) => {
                        let item = this._spriteset.light.source[value];
                        // is sprite
                        if (item.kind === "sprite") {
                            $.save.light[value] = {
                                position: [item.sprite.x, item.sprite.y],
                                url: item.sprite.texture.baseTexture.imageUrl || null,
                                alpha: item.sprite.alpha || 1.0,
                                switch: item.switch,
                                nature: item.nature,
                                name: item.name,
                                kind: item.kind,
                                blend: item.sprite.blendMode,
                                time: item.time,
                                blendMode: item.sprite.blendMode,
                                pivot: [item.sprite.pivot.x, item.sprite.pivot.y],
                                scale_x: item.sprite.scale.x,
                                scale_y: item.sprite.scale.y,
                                floor: item.floor,
                                rotation: item.sprite.rotation,
                                tint: item.sprite.tint,
                                anchor_x: item.sprite.anchor.x,
                                anchor_y: item.sprite.anchor.y,
                                pulse: item.pulse,
                                oscilation: item.oscilation
                            };
                        } else {
                            $.save.light[value] = {
                                position: [item.sprite.x, item.sprite.y],
                                range: item.sprite.range,
                                switch: item.switch,
                                color: item.sprite._color,
                                nature: item.nature,
                                dirty: item.sprite.dirty,
                                brightness: Haya.DMath.float(item.sprite.brightness),
                                falloff: [Haya.DMath.float(item.sprite.falloff[0]), Haya.DMath.float(item.sprite.falloff[1]), Haya.DMath.float(item.sprite.falloff[2])],
                                name: item.name,
                                kind: item.kind,
                                time: item.time,
                                floor: item.floor,
                                blendMode: item.sprite.blendMode,
                                lightHeight: Haya.DMath.float(item.sprite.lightHeight),
                                pivot: [item.sprite.pivot.x, item.sprite.pivot.y],
                                pulse: item.pulse,
                                oscilation: item.oscilation
                            };
                        }
                    })
                    // save collision components
                    Object.keys(this.collision.source).map((value, index) => {
                        // item
                        let item = this.collision.source[value];
                        //
                        $.save.collision[value] = {
                            x: item.x,
                            y: item.y,
                            kind: item._kind,
                            name: item._name,
                            padding: item.padding,
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

                        $.save.collision[value]["switch"] = item.switch;
                        $.save.collision[value]["floor"] = item.floor;
                        $.save.collision[value]["linkto"] = item.linkto;
                        $.save.collision[value]["linkKind"] = item.linkKind;
                    })
                    // save sound components
                    Object.keys(Haya.Map.current.sound.source).map((value) => {
                        let item = Haya.Map.current.sound.source[value];
                        item.haya._data.pos = item.haya.pos.array();

                        $.save.sound[value] = item.haya._data;
                    })
                    // save
                    Haya.File.wjson($.save, "img/maps/" + Haya.Map.current.name + "/data")
                    // save sprite information
                    Haya.Map.current.sprite.forEach((sprite) => {
                        sprite._layerInfo.floor = sprite.floor;
                        sprite._layerInfo.alpha = sprite.alpha;
                        sprite._layerInfo.x = sprite.x;
                        sprite._layerInfo.y = sprite.y;
                        sprite._layerInfo.rotation = sprite.rotation;
                        sprite._layerInfo.scale_x = sprite.scale.x;
                        sprite._layerInfo.scale_y = sprite.scale.y;
                        $.save.sprite[sprite.linfo] = sprite._layerInfo;
                    })
                    // save
                    Haya.File.wjson($.save.sprite, "img/maps/" + Haya.Map.current.name + "/layer")
                    // alert it
                    alert("Saved!");
                    return;
                }
            })
            this.gui.toolbar.addChild(this.button.save)
        }

        createCollision() {
            $.collision = new Haya.Collision.Collision();
            $.result = Haya.Collision.System.createResult();
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

            this.collisionDraw();
        }

        collisionDraw() {
            this.collision.element.forEach((element) => {

                if (Haya.Utils.invalid(element._graphic)) {
                    element._graphic = new PIXI.Graphics();
                    this.graphicCollision.addChild(element._graphic);
                }
                element._graphic.clear();
                if ($.editor.collisionCategory === "all") {
                    this.collisionGraphic(element);
                } else { if (element.floor === $.editor.collisionCategory) this.collisionGraphic(element); }



                if (element._graphic.stage === undefined || element._graphic.stage === null) {
                    this.graphicCollision.addChild(element._graphic);
                }
            })
        }

        collisionGraphic(element, selected) {
            if (Haya.Utils.invalid(element)) return;
            if (Haya.Utils.invalid(element._graphic)) return;
            element._graphic.clear();
            if (selected === true) {
                element._graphic.lineStyle(1, '0xffffff', 1, 2);
            } else {
                element._graphic.lineStyle(1, Haya.Collision.FloorColor[element.floor], 1, 0.5);
            }
            element._graphic.beginFill(Haya.Collision.FloorColor[element.floor], 0.25);
            element.draw(element._graphic)
            element._graphic.endFill();
        }
        // ===========================================================
        updateUI() {
            // to show, to hide
            if (TouchInput.isCancelled()) this.toolbar = !this.toolbar;
            this.gui.visible = this.toolbar;
            Object.keys(this.button).map((bkey) => {
                if (this.button[bkey]) {
                    if (this.gui.visible === true) this.button[bkey].update()
                }
            })
            // update GUI.List
            if (typeof $.editor.control === 'string') {
                if (!($.editor.control.includes("-edit"))) {
                    this.gui.list.update();
                    this.gui.list.visible = this.toolbar;
                    this.gui.list.x = this.gui.list.visible ? this.gui.list._oldPoint.x : -Graphics.width;

                    this.gui.pallete.hide();
                    this.gui.pallete.deactivate();
                    this.gui.pallete.close();
                    //this.window.edit.visible = false;


                    if ($.editor.control === "collision" && this.toolbar === true) {
                        if (this.oldIndex !== this.gui.list._index) {
                            this.oldIndex = this.gui.list._index
                            this.collisionDraw();
                            this.collisionGraphic(this.gui.list.current(), true);
                        }
                    }
                } else if (($.editor.control.includes("-edit"))) {
                    // reset
                    this.gui.list.close();
                    this.gui.list.deactivate();
                    this.gui.list.hide();
                    // 
                    Object.keys(this.gui.editor.button).map((bkey) => {
                        if (this.gui.editor.button[bkey]) {
                            if (this.gui.visible === true) {
                                this.gui.editor.button[bkey].update()
                                
                            } 
                        }
                    })
                    // wedit
                    if ($.editor.wedit !== null) {
                        this.wedit()
                    }

                }
            }

            this.graphicCollision.visible = ($.editor.control === "collision" || $.editor.control === "collision-edit");
            this.gui.folderLight.update();
            //Howler.orientation($gamePlayer.x*8, $gamePlayer.y*8, $gamePlayer.y, 0, 1, 0)

        }

        updateCollisionPivot() {
            for (let index = 0; index < this.collision.element.length; index++) {
                const element = this.collision.element[index];
                element._graphic.pivot.x = -(Haya.Map.Viewport.x);
                element._graphic.pivot.y = -(Haya.Map.Viewport.y);
            }
        }

        updatePivot() {
            //
            if (Haya.Mouse.y.isBetween(0, Graphics.width) && (Haya.Mouse.y.isBetween(0, 16))) {
                if ((this.toolbar === false)) {
                    this.camera.y = Haya.DMath.fdecrease(this.camera.y, 0, (Haya.Map.current.height - Graphics.height) * 1.5, 8)
                }

                //
                this.display.y -= 8;

                if (this.display.y <= 8) {
                    this.display.y = 0;
                }
            } else if (Haya.Mouse.y.isBetween(0, Graphics.width) && (Haya.Mouse.y.isBetween(Graphics.height - 16, Graphics.height))) {
                this.display.y += 8;
                if (this.display.y >= (Haya.Map.current.height) - (Graphics.height)) {
                    this.display.y = (Haya.Map.current.height) - (Graphics.height)
                }
                if ((this.toolbar === false)) {
                    this.camera.y = Haya.DMath.fincrease(this.camera.y, 0, (Haya.Map.current.height - Graphics.height) * 1.5, 8)
                }
            } else if (Haya.Mouse.x.isBetween(0, 16) && (Haya.Mouse.y.isBetween(0, Graphics.height))) {
                this.display.x -= 8;
                if (this.display.x <= 8) {
                    this.display.x = 0;
                }
                if ((this.toolbar === false)) {
                    this.camera.x = Haya.DMath.fdecrease(this.camera.x, 0, (Haya.Map.current.width - Graphics.width) + 1, 8)
                }
            } else if (Haya.Mouse.x.isBetween(Graphics.width - 16, Graphics.width) && (Haya.Mouse.y.isBetween(0, Graphics.height))) {
                this.display.x += 8;
                if (this.display.x >= ((Haya.Map.current.width || Graphics.width) - Graphics.width)) {
                    this.display.x = ((Haya.Map.current.width || Graphics.width) - Graphics.width);
                }
                if ((this.toolbar === false)) {
                    this.camera.x = Haya.DMath.fincrease(this.camera.x, 0, (Haya.Map.current.width - Graphics.width) + 1, 8)
                }
            }

            if (this.toolbar === false) {
                Haya.Map.Viewport.follow(this.camera, {
                    speed: 4
                });
            }

            //if (this.graphicCollision.visible === true) this.updateCollisionPivot();

            //
        }

        // ===========================================================
        refreshLightList() {
            this.light.source = this._spriteset.light.source;
            this.light.element = this._spriteset.light.element;
            //
            $.editor.wedit = null;
            this.gui.list._data = [];
            this.gui.list._data.push("New Point")
            this.gui.list._data.push("New Directional")
            this.gui.list._data.push("New Ambient")
            this.gui.list._data.push("New Sprite")
            this.gui.list._data.push("Display Base")
            this.gui.list._data.push("Display Under")
            this.gui.list._data.push("Display High")
            Object.keys(this.light.source).map((lights, index) => {
                // element
                let element = this.light.source[lights];
                // push
                if (element.floor === $.editor.collisionCategory) this.gui.list._data.push(element);
            })
            this.gui.list.activate()
            this.gui.list.open();
            this.gui.list.show();
            this.gui.list.refresh();

        }

        refreshCollisionList() {
            $.editor.wedit = null;
            this.gui.list._data = [];
            this.gui.list._data.push("New Polygon")
            this.gui.list._data.push("New Circle")
            this.gui.list._data.push("New Rect")
            //
            this.gui.list._data.push("Display Base")
            this.gui.list._data.push("Display Under")
            this.gui.list._data.push("Display High")
            this.gui.list._data.push("Display All")

            if (this.collision.element.length > 0) {
                this.collision.element.forEach((element) => {
                    if ($.editor.collisionCategory === "all") {
                        this.gui.list._data.push(element)
                    } else { if (element.floor === $.editor.collisionCategory) this.gui.list._data.push(element); }

                })
            }

            this.gui.list.activate()
            this.gui.list.open();
            this.gui.list.show();
            this.gui.list.refresh();


            print($.collision);
            this.collisionDraw();
        }

        refreshSoundList() {
            //
            $.editor.wedit = null;
            this.gui.list._data = [];
            this.gui.list._data.push("+BGM")
            this.gui.list._data.push("+BGS")
            this.gui.list._data.push("+ME")
            this.gui.list._data.push("+SE")

            let msound = Haya.Map.current.sound.element.length;
            if (msound > 0) {
                while (msound--) {
                    let element = Haya.Map.current.sound.element[msound];
                    this.gui.list._data.push([element.haya.name, element.haya.kind])
                }
            }

            this.gui.list.activate()
            this.gui.list.open();
            this.gui.list.show();
            this.gui.list.refresh();
        }

        refreshSpriteList() {
            //
            $.editor.wedit = null;
            this.gui.list._data = [];
            this.gui.list._data.push("Display Base")
            this.gui.list._data.push("Display Under")
            this.gui.list._data.push("Display High")
            this.gui.list._data.push("Display All")

            $gamePlayer.floor = $.editor.collisionCategory;

            let sprite = Haya.Map.current.sprite.length;
            if (sprite > 0) {
                while (sprite--) {
                    let element = Haya.Map.current.sprite[sprite];
                    //this.gui.list._data.push(element)

                    if ($.editor.collisionCategory === "all") {
                        this.gui.list._data.push(element)
                    } else { if (element.floor === $.editor.collisionCategory) this.gui.list._data.push(element); }
                }
            }
            this._spriteset.refreshSprite();

            this.gui.list.activate()
            this.gui.list.open();
            this.gui.list.show();
            this.gui.list.refresh();
        }

        refreshWeatherList() {
            //
            $.editor.wedit = null;
            this.gui.list._data = [];
            this.gui.list._data.push("New Fog")
            this.gui.list._data.push("Display Base")
            this.gui.list._data.push("Display Under")
            this.gui.list._data.push("Display High")

            $gamePlayer.floor = $.editor.collisionCategory;

            let weather = Haya.Weather.element.length;
            if (weather > 0) {
                while (weather--) {
                    let element = Haya.Weather.element[weather];
                    if (element) {  
                        if (element.setup.floor === $.editor.collisionCategory) this.gui.list._data.push(element); 
                    }
                    //
                }
            }
            //this._spriteset.refreshSprite();

            this.gui.list.activate()
            this.gui.list.open();
            this.gui.list.show();
            this.gui.list.refresh();
        }

        refreshSoundBGM() {
            //
            $.editor.wedit = null;
            this.gui.list._data = [];

            //$.sound.bgm[name] = [_filename, filename];

            Object.keys($.sound.bgm).map((key) => {
                this.gui.list._data.push(key)
            })

            this.gui.list.activate()
            this.gui.list.open();
            this.gui.list.show();
            this.gui.list.refresh();
        }

        refreshSoundBGS() {
            //
            $.editor.wedit = null;
            this.gui.list._data = [];

            //$.sound.bgm[name] = [_filename, filename];

            Object.keys($.sound.bgs).map((key) => {
                this.gui.list._data.push(key)
            })

            this.gui.list.activate()
            this.gui.list.open();
            this.gui.list.show();
            this.gui.list.refresh();
        }

        refreshSoundME() {
            //
            $.editor.wedit = null;
            this.gui.list._data = [];

            //$.sound.bgm[name] = [_filename, filename];

            Object.keys($.sound.me).map((key) => {
                this.gui.list._data.push(key)
            })

            this.gui.list.activate()
            this.gui.list.open();
            this.gui.list.show();
            this.gui.list.refresh();
        }

        refreshSoundSE() {
            //
            $.editor.wedit = null;
            this.gui.list._data = [];

            //$.sound.bgm[name] = [_filename, filename];

            Object.keys($.sound.se).map((key) => {
                this.gui.list._data.push(key)
            })

            this.gui.list.activate()
            this.gui.list.open();
            this.gui.list.show();
            this.gui.list.refresh();
        }

        refreshEditor() {
            if (this.gui.editor.children.length > 0) {
                let ixd = this.gui.editor.children.length;
                while (ixd--) {
                    this.gui.editor.removeChild(this.gui.editor.children[ixd])
                }
                this.gui.editor.children.length = 0;
            }
            $.editor.blend.kind = 0;
            this.gui.editor.button = {};
        }

        refresh() {
            this.refreshEditor();
            this.gui.folderLight.close();
        }
        // ===========================================================
        onEditList() {
            if ($.editor.control === "light") {
                let element = this.gui.list.current();
                if (typeof element === 'string') {
                    if (element.toLowerCase() === "new point") {
                        this._spriteset.addLight(
                            "point " + String(this.light.element.length + 1),
                            "pixi",
                            {
                                radius: 300,
                                kind: "point"
                            },
                            this._spriteset.sprite
                        )
                        this.gui.list.activate()
                        this.refreshLightList();
                    } else if (element.toLowerCase() === "new directional") {
                        this._spriteset.addLight(
                            "directional " + String(this.light.element.length + 1),
                            "pixi",
                            {
                                radius: 300,
                                kind: "directional",
                                target: new Point(0, 0)
                            },
                            this._spriteset.sprite
                        )
                        this.gui.list.activate()
                        this.refreshLightList();
                    } else if (element.toLowerCase().includes("ambient")) {
                        this._spriteset.addLight(
                            "ambient " + String(this.light.element.length + 1),
                            "pixi",
                            {
                                kind: "ambient"
                            },

                            this._spriteset.sprite
                        )
                        this.gui.list.activate()
                        this.refreshLightList();
                    } else if (element.toLowerCase() === "new sprite") {
                        this.gui.list.close();
                        this.gui.list.deactivate();
                        this.gui.list.hide()
                        this.gui.folderLight.open();
                    } else if (element.toLowerCase().includes("base")) {
                        $.editor.collisionCategory = "base"
                        $gamePlayer.floor = $.editor.collisionCategory
                        this.refreshLightList();
                        this._spriteset.refreshSprite()
                    } else if (element.toLowerCase().includes("under")) {
                        $.editor.collisionCategory = "under"
                        $gamePlayer.floor = $.editor.collisionCategory
                        this.refreshLightList();
                        this._spriteset.refreshSprite()
                    } else if (element.toLowerCase().includes("high")) {
                        $.editor.collisionCategory = "high"
                        $gamePlayer.floor = $.editor.collisionCategory
                        this.refreshLightList();
                        this._spriteset.refreshSprite()
                    }
                    return;
                }

                $.editor.control = "light-edit";
                $.editor.wedit = null;
                this.gui.list.close();
                this.gui.list.deactivate();
                this.gui.list.hide()
                // refresh
                this.refreshEditLight();
                this.gui.editor.worldHeight = Math.abs((60 * (Object.keys(this.gui.editor.button).length)) - Graphics.height)
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

            } else if ($.editor.control === "collision") {
                let element = this.gui.list.current()
                if (typeof element === 'string') { //$.editor.collisionCategory
                    if (element.toLowerCase() === "new polygon") {
                        this.addCollision("polygon")
                        this.gui.list.activate()
                        this.refreshCollisionList();
                    } else if (element.toLowerCase() === "new circle") {
                        this.addCollision("circle")
                        this.gui.list.activate()
                        this.refreshCollisionList();
                    } else if (element.toLowerCase() === "new rect") {
                        this.addCollision("rect")
                        this.gui.list.activate()
                        this.refreshCollisionList();
                    } else if (element.toLowerCase().includes("base")) {

                        $.editor.collisionCategory = "base"
                        this.collisionDraw();
                        this.refreshCollisionList();
                    } else if (element.toLowerCase().includes("under")) {
                        $.editor.collisionCategory = "under"
                        this.collisionDraw();
                        this.refreshCollisionList();
                    } else if (element.toLowerCase().includes("high")) {
                        $.editor.collisionCategory = "high"
                        this.collisionDraw();
                        this.refreshCollisionList();
                    } else if (element.toLowerCase().includes("all")) {
                        $.editor.collisionCategory = "all"
                        this.collisionDraw();
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
                this.refreshEditor();

                this.refreshEditCollision();
                this.gui.editor.worldHeight = Math.abs((60 * (Object.keys(this.gui.editor.button).length)) - Graphics.height)
            } else if ($.editor.control === "sound") {
                let element = this.gui.list.current();
                if (typeof element === 'string') {
                    if (element.toLocaleLowerCase() === "+bgm") {
                        $.editor.control = "bgm";
                        this.refreshSoundBGM();
                        return;
                    } else if (element.toLocaleLowerCase() === "+bgs") {
                        $.editor.control = "bgs"
                        this.refreshSoundBGS();
                        return;
                    } else if (element.toLocaleLowerCase().includes("+me")) {
                        $.editor.control = "me"
                        this.refreshSoundME();
                        return;
                    } else if (element.toLocaleLowerCase() === "+se") {
                        $.editor.control = "se"
                        this.refreshSoundSE();
                        return;
                    }

                }

                $.editor.control = "sound-edit";
                $.editor.wedit = null;
                $.editor.weditChange = false;
                $.editor.target = Haya.Map.current.sound.source[element[0]];
                $.editor.kind = element[1];
                this.gui.list.close();
                this.gui.list.deactivate();
                this.gui.list.hide()
                // refresh
                this.refreshSoundEdit();
                this.gui.editor.worldHeight = Math.abs((60 * (Object.keys(this.gui.editor.button).length)) - Graphics.height)
            } else if ($.editor.control === "bgm") {
                let element = this.gui.list.current();

                this._spriteset.addSound({ src: $.sound.bgm[element][1], name: element, kind: "bgm" })

                $.editor.control = "sound";
                $.editor.wedit = null;
                // refresh
                this.refreshSoundList();
            } else if ($.editor.control === "bgs") {
                let element = this.gui.list.current();
                this._spriteset.addSound({ src: $.sound.bgs[element][1], name: element, kind: "bgs" })
                $.editor.control = "sound";
                $.editor.wedit = null;
                // refresh
                this.refreshSoundList();
            } else if ($.editor.control === "me") {
                let element = this.gui.list.current();
                this._spriteset.addSound({ src: $.sound.me[element][1], name: element, kind: "me" })
                $.editor.control = "sound";
                $.editor.wedit = null;
                // refresh
                this.refreshSoundList();
            } else if ($.editor.control === "se") {
                let element = this.gui.list.current();
                this._spriteset.addSound({ src: $.sound.se[element][1], name: element, kind: "se" })
                $.editor.control = "sound";
                $.editor.wedit = null;
                // refresh
                this.refreshSoundList();
            } else if ($.editor.control === "sprite") {
                let element = this.gui.list.current()
                if (typeof element === 'string') { //$.editor.collisionCategory
                    if (element.toLowerCase().includes("base")) {
                        $.editor.collisionCategory = "base"
                        this.refreshSpriteList();
                        this._spriteset.refreshSprite();

                    } else if (element.toLowerCase().includes("under")) {
                        $.editor.collisionCategory = "under"
                        this.refreshSpriteList();
                        this._spriteset.refreshSprite();

                    } else if (element.toLowerCase().includes("high")) {
                        $.editor.collisionCategory = "high"
                        this.refreshSpriteList();
                        this._spriteset.refreshSprite();

                    } else if (element.toLowerCase().includes("all")) {
                        $.editor.collisionCategory = "all"
                        this.refreshSpriteList();
                        this._spriteset.refreshSprite();

                    }
                    return;
                }

                $.editor.control = "sprite-edit";
                $.editor.wedit = null;
                $.editor.weditChange = false;
                $.editor.target = element;
                //$.editor.kind = element._kind.toLowerCase();
                // refresh
                this.refreshEditor();

                this.refreshSpriteEdit();
                this.gui.editor.worldHeight = Math.abs((60 * (Object.keys(this.gui.editor.button).length)) - Graphics.height)
            } else if ($.editor.control === "weather") {
                let element = this.gui.list.current()
                if (typeof element === 'string') { //$.editor.collisionCategory
                    if (element.toLowerCase().includes("base")) {
                        $.editor.collisionCategory = "base"
                        this.refreshWeatherList();
                        this._spriteset.refreshSprite();

                    } else if (element.toLowerCase().includes("under")) {
                        $.editor.collisionCategory = "under"
                        this.refreshWeatherList();
                        this._spriteset.refreshSprite();

                    } else if (element.toLowerCase().includes("high")) {
                        $.editor.collisionCategory = "high"
                        this.refreshWeatherList();
                        this._spriteset.refreshSprite();

                    } else if (element.toLowerCase() === "new fog") {
                        this._spriteset.addWeather(
                            "fog", {},
                            this._spriteset.sprite
                        )
                        this.gui.list.activate()
                        this.refreshWeatherList();
                    }
                    return;
                }

                $.editor.control = "weather-edit";
                $.editor.wedit = null;
                $.editor.weditChange = false;
                $.editor.target = element;
                //$.editor.kind = element._kind.toLowerCase();
                // refresh
                this.refreshEditor();

                this.refreshWeaherEdit();
                //this.gui.editor.worldHeight = Math.abs((60 * (Object.keys(this.gui.editor.button).length)) - Graphics.height)
            }
        }

        onColorPick() {
            $.editor.target.color = this.gui.pallete.current();
            $.editor.target.tint = $.editor.target.color;
            this.gui.pallete.activate();
            let color = Haya.Utils.Color.hexRgb(String($.editor.target.color).replace("0x", "#"));
            $.editor.pallete.red = color.red;
            $.editor.pallete.green = color.green;
            $.editor.pallete.blue = color.blue;
            this.gui.editor.button.color.sprite.text.style.fill = $.editor.target.color
            this.gui.editor.button.color.text(`Color: ${$.editor.target.color}`);
        }

        wedit() {
            if ($.editor.control.includes("light")) {
                this.weditLight()
            } else if ($.editor.control.includes("collision")) {
                this.weditCollision()
            } else if ($.editor.control.includes("particle")) {
                this.weditParticle()
            } else if ($.editor.control.includes("sound")) {
                this.weditSound()
            } else if ($.editor.control.includes("sprite")) {
                this.weditSprite()
            } else if ($.editor.control.includes("weather")) {
                this.weditWeather()
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
                    $.editor.target.x = Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    $.editor.target.y = Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    //$.editor.target.pivot.set((-Haya.Map.Viewport.x), (-Haya.Map.Viewport.y));
                    //$.editor.weditChange = true;
                    this.gui.editor.button.position.text(`Position: ${$.editor.target.x}, ${$.editor.target.y}`)
                }
            } else if ($.editor.wedit === "light-height") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.lightHeight = Haya.DMath.fincrease($.editor.target.lightHeight, -5.0, 5.0, 0.01, "alt", 0.1);
                    this.gui.editor.button.lightHeight.text(`Light Height: ${Haya.DMath.float($.editor.target.lightHeight)}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.lightHeight = Haya.DMath.fdecrease($.editor.target.lightHeight, -5.0, 5.0, 0.01, "alt", 0.1);
                    this.gui.editor.button.lightHeight.text(`Light Height: ${Haya.DMath.float($.editor.target.lightHeight)}`)
                }
            } else if ($.editor.wedit === "brightness") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.brightness = Haya.DMath.fincrease($.editor.target.brightness, 0.0, 10.0, 0.1, "alt", 1);
                    this.gui.editor.button.brightness.text(`Brightness: ${Haya.DMath.float($.editor.target.brightness)}`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.brightness = Haya.DMath.fdecrease($.editor.target.brightness, 0.0, 10.0, 0.1, "alt", 1);
                    this.gui.editor.button.brightness.text(`Brightness: ${Haya.DMath.float($.editor.target.brightness)}`)
                }
            } else if ($.editor.wedit === "radius") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.radius = Haya.DMath.fincrease($.editor.target.radius, 0.0, 1000, 5, "alt", 50);
                    this.gui.editor.button.radius.text(`Radius: ${Haya.DMath.float($.editor.target.radius)}`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.radius = Haya.DMath.fdecrease($.editor.target.radius, 0.0, 1000, 5, "alt", 50);
                    this.gui.editor.button.radius.text(`Radius: ${Haya.DMath.float($.editor.target.radius)}`)
                }
            } else if ($.editor.wedit === "falloffa") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.falloff[0] = Haya.DMath.fincrease($.editor.target.falloff[0], -10.0, 10.0, 0.1, "alt", 1.0);
                    this.gui.editor.button.falloffA.text(`Falloff A: ${Haya.DMath.float($.editor.target.falloff[0])}`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.falloff[0] = Haya.DMath.fdecrease($.editor.target.falloff[0], -10.0, 10.0, 0.1, "alt", 1.0);
                    this.gui.editor.button.falloffA.text(`Falloff A: ${Haya.DMath.float($.editor.target.falloff[0])}`)
                }
            } else if ($.editor.wedit === "falloffb") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.falloff[1] = Haya.DMath.fincrease($.editor.target.falloff[1], -10.0, 10.0, 0.1, "alt", 1.0);
                    this.gui.editor.button.falloffB.text(`Falloff B: ${Haya.DMath.float($.editor.target.falloff[1])}`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.falloff[1] = Haya.DMath.fdecrease($.editor.target.falloff[1], -10.0, 10.0, 0.1, "alt", 1.0);
                    this.gui.editor.button.falloffB.text(`Falloff B: ${Haya.DMath.float($.editor.target.falloff[1])}`)
                }
            } else if ($.editor.wedit === "falloffc") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.falloff[2] = Haya.DMath.fincrease($.editor.target.falloff[2], -50.0, 50.0, 0.1, "alt", 1.0);
                    this.gui.editor.button.falloffC.text(`Falloff C: ${Haya.DMath.float($.editor.target.falloff[2])}`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.falloff[2] = Haya.DMath.fdecrease($.editor.target.falloff[2], -50.0, 50.0, 0.1, "alt", 1.0);
                    this.gui.editor.button.falloffC.text(`Falloff C: ${Haya.DMath.float($.editor.target.falloff[2])}`)
                }
            } else if ($.editor.wedit === "color") {
                this.gui.pallete.visible = this.toolbar;
                this.gui.pallete.update();
            } else if ($.editor.wedit === "alpha") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.alpha = Haya.DMath.fincrease($.editor.target.alpha, 0.0, 1.0, 0.01, "alt", 0.05);
                    this.gui.editor.button.opacity.text(`Opacity: ${Haya.DMath.float($.editor.target.alpha * 100)}%`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.alpha = Haya.DMath.fdecrease($.editor.target.alpha, 0.0, 1.0, 0.01, "alt", 0.05);
                    this.gui.editor.button.opacity.text(`Opacity: ${Haya.DMath.float($.editor.target.alpha * 100)}%`)
                }
            } else if ($.editor.wedit === "switch") {
                if (this.gui.editor.button.switch.sprite.input.visible === true) {
                    this.gui.editor.button.switch.sprite.input.focus();
                    if (/^(\d+)/gmi.test(this.gui.editor.button.switch.sprite.input.text.trim())) {
                        $.editor.target._self.switch = Number(this.gui.editor.button.switch.sprite.input.text);
                        this.gui.editor.button.switch.text(`Switch: ${$.editor.target._self.switch}`)
                    }


                }
            } else if ($.editor.wedit === "scaleX") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.scale.x = Haya.DMath.fincrease($.editor.target.scale.x, 0.0, 10.0, 0.1, "alt", 0.5);
                    this.gui.editor.button.scaleX.text(`Scale X: ${Haya.DMath.float($.editor.target.scale.x)}`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.scale.x = Haya.DMath.fdecrease($.editor.target.scale.x, 0.0, 10.0, 0.1, "alt", 0.5);
                    this.gui.editor.button.scaleX.text(`Scale X: ${Haya.DMath.float($.editor.target.scale.x)}`)
                }
            } else if ($.editor.wedit === "scaleY") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.scale.y = Haya.DMath.fincrease($.editor.target.scale.y, 0.0, 10.0, 0.1, "alt", 0.5);
                    this.gui.editor.button.scaleY.text(`Scale Y: ${Haya.DMath.float($.editor.target.scale.y)}`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.scale.y = Haya.DMath.fdecrease($.editor.target.scale.y, 0.0, 10.0, 0.1, "alt", 0.5);
                    this.gui.editor.button.scaleY.text(`Scale Y: ${Haya.DMath.float($.editor.target.scale.y)}`)
                }
            } else if ($.editor.wedit === "anchorX") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.anchor.x = Haya.DMath.fincrease($.editor.target.anchor.x, 0.0, 1.0, 0.1, "alt", 0.5);
                    this.gui.editor.button.anchorX.text(`Anchor X: ${Haya.DMath.float($.editor.target.anchor.x)}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.anchor.x = Haya.DMath.fdecrease($.editor.target.anchor.x, 0.0, 1.0, 0.1, "alt", 0.5);
                    this.gui.editor.button.anchorX.text(`Anchor X: ${Haya.DMath.float($.editor.target.anchor.x)}`)
                }
            } else if ($.editor.wedit === "anchorY") {
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.anchor.y = Haya.DMath.fincrease($.editor.target.anchor.y, 0.0, 1.0, 0.1, "alt", 0.5);
                    this.gui.editor.button.anchorY.text(`Anchor Y: ${Haya.DMath.float($.editor.target.anchor.y)}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.anchor.y = Haya.DMath.fdecrease($.editor.target.anchor.y, 0.0, 1.0, 0.1, "alt", 0.5);
                    this.gui.editor.button.anchorY.text(`Anchor Y: ${Haya.DMath.float($.editor.target.anchor.y)}`)
                }
            } else if ($.editor.wedit === "rotation") {
                if (TouchInput.wheelY >= 10) {
                    // $.editor.target.rotation += 0.1;
                    // $.editor.target.rotation = Haya.DMath.fclamp($.editor.target.rotation, -6.2, 6.2)
                    $.editor.target.rotation = Haya.DMath.fincrease($.editor.target.rotation, -6.2, 6.2, 0.1, "alt", 0.5);
                    this.gui.editor.button.rotation.text(`Rotation: ${Haya.DMath.float(Haya.DMath.degrees($.editor.target.rotation))}°`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.rotation = Haya.DMath.fdecrease($.editor.target.rotation, -6.2, 6.2, 0.1, "alt", 0.5);
                    this.gui.editor.button.rotation.text(`Rotation: ${Haya.DMath.float(Haya.DMath.degrees($.editor.target.rotation))}°`)
                }
            } else if ($.editor.wedit === "pulseSpeed") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target._self.pulse.speed = Haya.DMath.fincrease($.editor.target._self.pulse.speed, 0.0, 1, 0.05, "alt", 0.5);
                    this.gui.editor.button.pulseSpeed.text(`Pulse Speed: ${Haya.DMath.float($.editor.target._self.pulse.speed)}`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target._self.pulse.speed = Haya.DMath.fdecrease($.editor.target._self.pulse.speed, 0.0, 1, 0.05, "alt", 0.5);
                    this.gui.editor.button.pulseSpeed.text(`Pulse Speed: ${Haya.DMath.float($.editor.target._self.pulse.speed)}`)
                }
            } else if ($.editor.wedit === "pulseMin") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target._self.pulse.min = Haya.DMath.fincrease($.editor.target._self.pulse.min, 0.0, 10, 0.05, "alt", 0.5);
                    this.gui.editor.button.pulseMin.text(`Pulse Minimun: ${Haya.DMath.float($.editor.target._self.pulse.min)}`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target._self.pulse.min = Haya.DMath.fdecrease($.editor.target._self.pulse.min, 0.0, 10, 0.05, "alt", 0.5);
                    this.gui.editor.button.pulseMin.text(`Pulse Minimun: ${Haya.DMath.float($.editor.target._self.pulse.min)}`)
                }
            } else if ($.editor.wedit === "pulseMax") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target._self.pulse.max = Haya.DMath.fincrease($.editor.target._self.pulse.max, 0.0, 10, 0.05, "alt", 0.5);
                    this.gui.editor.button.pulseMax.text(`Pulse Maximun: ${Haya.DMath.float($.editor.target._self.pulse.max)}`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target._self.pulse.max = Haya.DMath.fdecrease($.editor.target._self.pulse.max, 0.0, 10, 0.05, "alt", 0.5);
                    this.gui.editor.button.pulseMax.text(`Pulse Maximun: ${Haya.DMath.float($.editor.target._self.pulse.max)}`)
                }
            } else if ($.editor.wedit === "pulseDuration") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target._self.pulse.duration = Haya.DMath.fincrease($.editor.target._self.pulse.duration, 0.1, 10, 0.1, "alt", 1);
                    this.gui.editor.button.pulseDuration.text(`Pulse Duration: ${Haya.DMath.float($.editor.target._self.pulse.duration)}s`)
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target._self.pulse.duration = Haya.DMath.fdecrease($.editor.target._self.pulse.duration, 0.1, 10, 0.1, "alt", 1);
                    this.gui.editor.button.pulseDuration.text(`Pulse Duration: ${Haya.DMath.float($.editor.target._self.pulse.duration)}s`)
                }
            } else if ($.editor.wedit === "oscilationSpeed") {
                // edit
                //wheelID = function (current, min, max, amount, onchange=null, key="alt", keyAmount=1, wheelV=20) 
                $.editor.target._self.oscilation.speed = Haya.DMath.wheelID(
                    $.editor.target._self.oscilation.speed,
                    0.1,
                    1,
                    0.05,
                    (current) => { this.gui.editor.button.oscilationSpeed.text(`Oscilation Speed: ${Haya.DMath.float(current)}`) }
                )
            } else if ($.editor.wedit === "oscilationMin") {
                // edit
                $.editor.target._self.oscilation.min = Haya.DMath.wheelID(
                    $.editor.target._self.oscilation.min,
                    0.1,
                    10,
                    0.05,
                    (current) => { this.gui.editor.button.oscilationMin.text(`Oscilation Minimun: ${Haya.DMath.float(current)}`) }
                )
            } else if ($.editor.wedit === "oscilationMax") {
                // edit
                $.editor.target._self.oscilation.max = Haya.DMath.wheelID(
                    $.editor.target._self.oscilation.max,
                    0.1,
                    10,
                    0.05,
                    (current) => { this.gui.editor.button.oscilationMax.text(`Oscilation Maximun: ${Haya.DMath.float(current)}`) }
                )
            } else if ($.editor.wedit === "oscilationDuration") {
                // edit
                $.editor.target._self.oscilation.duration = Haya.DMath.wheelID(
                    $.editor.target._self.oscilation.duration,
                    0.1,
                    10,
                    0.1,
                    (current) => { this.gui.editor.button.oscilationDuration.text(`Oscilation Duration: ${Haya.DMath.float(current)}`) }
                )
            }

            //


        }

        weditCollision() {
            if ($.editor.wedit === "position") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    $.editor.target.x = Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    $.editor.target.y = Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    //$.editor.target._graphic.pivot.set(-(Haya.Map.Viewport.x), -(Haya.Map.Viewport.y));
                    this.gui.editor.button.position.text(`Position: ${$.editor.target.x}, ${$.editor.target.y}`)
                    $.editor.weditChange = true
                } else if (Input.isPressed('down')) {
                    $.editor.target.y += 1;
                    this.gui.editor.button.position.text(`Position: ${$.editor.target.x}, ${$.editor.target.y}`)
                    $.editor.weditChange = true
                } else if (Input.isPressed('up')) {
                    $.editor.target.y -= 1;
                    this.gui.editor.button.position.text(`Position: ${$.editor.target.x}, ${$.editor.target.y}`)
                    $.editor.weditChange = true
                } else if (Input.isPressed('right')) {
                    $.editor.target.x += 1;
                    this.gui.editor.button.position.text(`Position: ${$.editor.target.x}, ${$.editor.target.y}`)
                    $.editor.weditChange = true
                } else if (Input.isPressed('left')) {
                    $.editor.target.x -= 1;
                    this.gui.editor.button.position.text(`Position: ${$.editor.target.x}, ${$.editor.target.y}`)
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "radius") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.radius = Haya.DMath.fincrease($.editor.target.radius, 0, 1000, 1, "alt", 10);
                    this.gui.editor.button.radius.text(`Radius: ${$.editor.target.radius}`)
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.radius = Haya.DMath.fdecrease($.editor.target.radius, 0, 1000, 1, "alt", 10);
                    this.gui.editor.button.radius.text(`Radius: ${$.editor.target.radius}`)
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "scale") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.scale = Haya.DMath.fincrease($.editor.target.scale, 0, 10.0, 0.1, "alt", 1.0);
                    this.gui.editor.button.scale.text(`Scale: ${$.editor.target.scale}`)
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.scale = Haya.DMath.fdecrease($.editor.target.scale, 0, 10.0, 0.1, "alt", 1.0);
                    this.gui.editor.button.scale.text(`Scale: ${$.editor.target.scale}`)
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "padding") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.padding = Haya.DMath.fincrease($.editor.target.padding, 0, 1000, 1, "alt", 10);
                    this.gui.editor.button.padding.text(`Padding: ${Haya.DMath.float($.editor.target.padding)}`)
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.padding = Haya.DMath.fdecrease($.editor.target.padding, 0, 1000, 1, "alt", 10);
                    this.gui.editor.button.padding.text(`Padding: ${Haya.DMath.float($.editor.target.padding)}`)
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "angle") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.angle = Haya.DMath.fincrease($.editor.target.angle, -6.2, 6.2, 0.1, "alt", 0.5);
                    this.gui.editor.button.angle.text(`Angle: ${Haya.DMath.float(Haya.DMath.degrees($.editor.target.angle))}°`)
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.angle = Haya.DMath.fdecrease($.editor.target.angle, -6.2, 6.2, 0.1, "alt", 0.5);
                    this.gui.editor.button.angle.text(`Angle: ${Haya.DMath.float(Haya.DMath.degrees($.editor.target.angle))}°`)
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "scaleX") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.scale_x = Haya.DMath.fincrease($.editor.target.scale_x, 0, 10.0, 0.01, "alt", 0.5);
                    this.gui.editor.button.scaleX.text(`Scale X: ${$.editor.target.scale_x}`)
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.scale_x = Haya.DMath.fdecrease($.editor.target.scale_x, 0, 10.0, 0.01, "alt", 0.5);
                    this.gui.editor.button.scaleX.text(`Scale X: ${$.editor.target.scale_x}`)
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "scaleY") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.scale_y = Haya.DMath.fincrease($.editor.target.scale_y, 0, 10.0, 0.01, "alt", 0.5);
                    this.gui.editor.button.scaleY.text(`Scale Y: ${$.editor.target.scale_y}`)
                    $.editor.weditChange = true
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.scale_y = Haya.DMath.fdecrease($.editor.target.scale_y, 0, 10.0, 0.01, "alt", 0.5);
                    this.gui.editor.button.scaleY.text(`Scale Y: ${$.editor.target.scale_y}`)
                    $.editor.weditChange = true
                }
            } else if ($.editor.wedit === "scaleA") {
                // edit
                if (TouchInput.wheelY >= 10) {
                    $.editor.target.scale_y = Haya.DMath.fincrease($.editor.target.scale_y, 0, 10.0, 0.05, "alt", 0.5);
                    $.editor.target.scale_x = Haya.DMath.fincrease($.editor.target.scale_x, 0, 10.0, 0.05, "alt", 0.5);
                    this.gui.editor.button.scaleY.text(`Scale Y: ${$.editor.target.scale_y}`)
                    this.gui.editor.button.scaleX.text(`Scale X: ${$.editor.target.scale_x}`)
                    this.gui.editor.button.scaleA.text(`Average Scale: ${Haya.DMath.float(($.editor.target.scale_y + $.editor.target.scale_x) / 2)}`)
                    $.editor.weditChange = 10;
                } else if (TouchInput.wheelY <= -10) {
                    $.editor.target.scale_y = Haya.DMath.fdecrease($.editor.target.scale_y, 0, 10.0, 0.05, "alt", 0.5);
                    $.editor.target.scale_x = Haya.DMath.fdecrease($.editor.target.scale_x, 0, 10.0, 0.05, "alt", 0.5);
                    this.gui.editor.button.scaleY.text(`Scale Y: ${$.editor.target.scale_y}`)
                    this.gui.editor.button.scaleX.text(`Scale X: ${$.editor.target.scale_x}`)
                    this.gui.editor.button.scaleA.text(`Average Scale: ${Haya.DMath.float(($.editor.target.scale_y + $.editor.target.scale_x) / 2)}`)
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

                    this.refreshEditCollision();

                    $.editor.weditChange = true;



                }




                if (this.toolbar === false) {
                    if (TouchInput.isPressed()) { // isPressed

                        $.editor.target.cachePoints[$.editor.pointId][0] = (Haya.Mouse.x + this.display.x) - $.editor.target.x;
                        $.editor.target.cachePoints[$.editor.pointId][1] = (Haya.Mouse.y + this.display.y) - $.editor.target.y;
                        $.editor.weditChange = true
                    }
                }
            } else if ($.editor.wedit === "switch") {
                if (this.gui.editor.button.switch.sprite.input.visible === true) {
                    this.gui.editor.button.switch.sprite.input.focus();
                    if (/^(\d+)/gmi.test(this.gui.editor.button.switch.sprite.input.text.trim())) {
                        $.editor.target.switch = Number(this.gui.editor.button.switch.sprite.input.text);
                        this.gui.editor.button.switch.text(`Switch: ${$.editor.target.switch}`)
                    }


                }
            }
            // true
            if ($.editor.weditChange) {
                if ($.editor.wedit === "point") {
                    $.editor.target.setPoints($.editor.target.cachePoints)
                }
                this.collisionGraphic($.editor.target)
                $.editor.weditChange = false;
            }
        }

        weditSound() {
            if ($.editor.wedit === "position") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    $.editor.target.haya.pos.x = Haya.Mouse.x + -Haya.Map.Viewport.x;
                    $.editor.target.haya.pos.y = Haya.Mouse.y + -Haya.Map.Viewport.y;
                    $.editor.target._pos[0] = $.editor.target.haya.pos.x;
                    $.editor.target._pos[1] = $.editor.target.haya.pos.y;
                    $.editor.weditChange = true
                    //$.editor.weditChange = true;
                    this.gui.editor.button.position.text(`${$.editor.target.haya.pos.string()}`)
                }

                if (TouchInput.wheelY >= 20) {
                    $.editor.target.haya.pos.z = Haya.DMath.fincrease($.editor.target.haya.pos.z, -100.0, 100.0, 0.5, "alt", 1);
                    $.editor.target._pos[2] = $.editor.target.haya.pos.z;
                    $.editor.weditChange = true
                    this.gui.editor.button.position.text(`${$.editor.target.haya.pos.string()}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.haya.pos.z = Haya.DMath.fdecrease($.editor.target.haya.pos.z, -100.0, 100.0, 0.5, "alt", 1);
                    $.editor.target._pos[2] = $.editor.target.haya.pos.z;
                    $.editor.weditChange = true
                    this.gui.editor.button.position.text(`${$.editor.target.haya.pos.string()}`)
                }
            } else if ($.editor.wedit === "volume") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.haya._data.volume = Haya.DMath.fincrease($.editor.target.haya._data.volume, 0, 1.0, 0.01, "alt", 0.1);
                    $.editor.target.volume($.editor.target.haya._data.volume);
                    $.editor.weditChange = true
                    this.gui.editor.button.volume.text(`Volume: ${Haya.DMath.float($.editor.target.haya._data.volume) * 100}%`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.haya._data.volume = Haya.DMath.fdecrease($.editor.target.haya._data.volume, 0, 1.0, 0.01, "alt", 0.1);
                    $.editor.target.volume($.editor.target.haya._data.volume);
                    $.editor.weditChange = true
                    this.gui.editor.button.volume.text(`Volume: ${Haya.DMath.float($.editor.target.haya._data.volume) * 100}%`)
                }
            } else if ($.editor.wedit === "switch") {
                if (this.gui.editor.button.switch.sprite.input.visible === true) {
                    this.gui.editor.button.switch.sprite.input.focus();
                    if (/^(\d+)/gmi.test(this.gui.editor.button.switch.sprite.input.text.trim())) {
                        $.editor.target.haya._data.switch = Number(this.gui.editor.button.switch.sprite.input.text);
                        this.gui.editor.button.switch.text(`Switch: ${$.editor.target.haya._data.switch}`)
                    }


                }
            } else if ($.editor.wedit === "rate") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.haya._data.rate = Haya.DMath.fincrease($.editor.target.haya._data.rate, 0.5, 4, 0.1, "alt", 1);
                    $.editor.target.rate = ($.editor.target.haya._data.rate);
                    this.gui.editor.button.rate.text(`Rate: ${$.editor.target.haya._data.rate}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.haya._data.rate = Haya.DMath.fdecrease($.editor.target.haya._data.rate, 0.5, 4, 0.1, "alt", 1);
                    $.editor.target.rate = ($.editor.target.haya._data.rate);
                    this.gui.editor.button.rate.text(`Rate: ${$.editor.target.haya._data.rate}`)
                }
            } else if ($.editor.wedit === "refDistance") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.haya._data.refDistance = Haya.DMath.fincrease($.editor.target.haya._data.refDistance, 0, 100, 1, "alt", 10);
                    this.changePannerAttr();
                    this.gui.editor.button.refDistance.text(`refDistance: ${$.editor.target.haya._data.refDistance}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.haya._data.refDistance = Haya.DMath.fdecrease($.editor.target.haya._data.refDistance, 0, 100, 1, "alt", 10);
                    this.changePannerAttr();
                    this.gui.editor.button.refDistance.text(`refDistance: ${$.editor.target.haya._data.refDistance}`)
                }
            } else if ($.editor.wedit === "rolloffFactor") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.haya._data.rolloffFactor = Haya.DMath.fincrease($.editor.target.haya._data.rolloffFactor, 0, 10, 0.1, "alt", 1);
                    this.changePannerAttr();
                    this.gui.editor.button.rolloffFactor.text(`rolloffFactor: ${$.editor.target.haya._data.rolloffFactor}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.haya._data.rolloffFactor = Haya.DMath.fdecrease($.editor.target.haya._data.rolloffFactor, 0, 10, 0.1, "alt", 1);
                    this.changePannerAttr();
                    this.gui.editor.button.rolloffFactor.text(`rolloffFactor: ${$.editor.target.haya._data.rolloffFactor}`)
                }
            } else if ($.editor.wedit === "coneInnerAngle") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.haya._data.coneInnerAngle = Haya.DMath.fincrease($.editor.target.haya._data.coneInnerAngle, 0, 360, 1, "alt", 15);
                    this.changePannerAttr();
                    this.gui.editor.button.coneInnerAngle.text(`coneInnerAngle: ${$.editor.target.haya._data.coneInnerAngle}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.haya._data.coneInnerAngle = Haya.DMath.fdecrease($.editor.target.haya._data.coneInnerAngle, 0, 360, 1, "alt", 15);
                    this.changePannerAttr();
                    this.gui.editor.button.coneInnerAngle.text(`coneInnerAngle: ${$.editor.target.haya._data.coneInnerAngle}`)
                }
            } else if ($.editor.wedit === "coneOuterAngle") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.haya._data.coneOuterAngle = Haya.DMath.fincrease($.editor.target.haya._data.coneOuterAngle, 0, 360, 1, "alt", 15);
                    this.changePannerAttr();
                    this.gui.editor.button.coneOuterAngle.text(`coneOuterAngle: ${$.editor.target.haya._data.coneOuterAngle}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.haya._data.coneOuterAngle = Haya.DMath.fdecrease($.editor.target.haya._data.coneOuterAngle, 0, 360, 1, "alt", 15);
                    this.changePannerAttr();
                    this.gui.editor.button.coneOuterAngle.text(`coneOuterAngle: ${$.editor.target.haya._data.coneOuterAngle}`)
                }
            } else if ($.editor.wedit === "coneOuterGain") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.haya._data.coneOuterGain = Haya.DMath.fincrease($.editor.target.haya._data.coneOuterGain, 0, 1, 0.05, "alt", 0.1);
                    this.changePannerAttr();
                    this.gui.editor.button.coneOuterGain.text(`coneOuterGain: ${$.editor.target.haya._data.coneOuterGain}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.haya._data.coneOuterGain = Haya.DMath.fdecrease($.editor.target.haya._data.coneOuterGain, 0, 1, 0.05, "alt", 0.1);
                    this.changePannerAttr();
                    this.gui.editor.button.coneOuterGain.text(`coneOuterGain: ${$.editor.target.haya._data.coneOuterGain}`)
                }
            } else if ($.editor.wedit === "maxDistance") {
                // edit
                if (TouchInput.wheelY >= 20) {
                    $.editor.target.haya._data.maxDistance = Haya.DMath.fincrease($.editor.target.haya._data.maxDistance, 0, 1000, 10, "alt", 100);
                    this.changePannerAttr();
                    this.gui.editor.button.maxDistance.text(`maxDistance: ${$.editor.target.haya._data.maxDistance}`)
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.haya._data.maxDistance = Haya.DMath.fdecrease($.editor.target.haya._data.maxDistance, 0, 1000, 10, "alt", 100);
                    this.changePannerAttr();
                    this.gui.editor.button.maxDistance.text(`maxDistance: ${$.editor.target.haya._data.maxDistance}`)
                }
            }

            if ($.editor.weditChange === true) {
                // $.htimeout.value = 3;
                // $.htimeout.method = function () { $.editor.target.play() };
                $.editor.weditChange = false;
            }

            //
        }

        weditSprite() {
            if ($.editor.wedit === "alpha") {
                $.editor.target.alpha = Haya.DMath.wheelID(
                    $.editor.target.alpha,
                    0, 1, 0.05,
                    (current) => { this.gui.editor.button.opacity.text(`Opacity: ${Haya.DMath.float(current) * 100}%`) },
                    "alt", 0.1
                )
            } else if ($.editor.wedit === "scaleX") {
                $.editor.target.scale.x = Haya.DMath.wheelID(
                    $.editor.target.scale.x,
                    0.1, 10, 0.05,
                    (current) => { this.gui.editor.button.scaleX.text(`Scale X: ${Haya.DMath.float(current) * 100}%`) },
                    "alt", 0.1
                )
            } else if ($.editor.wedit === "scaleY") {
                $.editor.target.scale.y = Haya.DMath.wheelID(
                    $.editor.target.scale.y,
                    0.1, 10, 0.05,
                    (current) => { this.gui.editor.button.scaleY.text(`Scale Y: ${Haya.DMath.float(current) * 100}%`) },
                    "alt", 0.1
                )
            } else if ($.editor.wedit === "rotation") {
                $.editor.target.rotation = Haya.DMath.wheelID(
                    $.editor.target.rotation,
                    -6.2, 6.2, 0.1,
                    (current) => { this.gui.editor.button.rotation.text(`Rotation: ${Haya.DMath.float(Haya.DMath.degrees(current))}°`) },
                    "alt", 0.5
                )
            } else if ($.editor.wedit === "position") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    $.editor.target.x = Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    $.editor.target.y = Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    //$.editor.target.pivot.set((-Haya.Map.Viewport.x), (-Haya.Map.Viewport.y));
                    //$.editor.weditChange = true;
                    this.gui.editor.button.position.text(`Position: ${$.editor.target.x}, ${$.editor.target.y}`)
                }
            } 
        }

        weditWeather() {
            if ($.editor.wedit === "position") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    $.editor.target.x = Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    $.editor.target.y = Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    $.editor.target.pivot.set((-Haya.Map.Viewport.x), (-Haya.Map.Viewport.y));
                    //$.editor.weditChange = true;
                    this.gui.editor.button.position.text(`Position: ${$.editor.target.x}, ${$.editor.target.y}`)
                }
            } else if ($.editor.wedit === "duration") {
                $.editor.target.setup.duration = Haya.DMath.wheelID(
                    $.editor.target.setup.duration,
                    0.1, 10, 0.1,
                    (current) => { this.gui.editor.button.duration.text(`Duration: ${Haya.DMath.float(current) * 60}s`) },
                    "alt", 1
                )
            }
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

        changePannerAttr() {
            $.editor.target.pannerAttr({
                panningModel: 'HRTF',
                refDistance: $.editor.target.haya._data.refDistance,
                rolloffFactor: $.editor.target.haya._data.rolloffFactor,
                coneInnerAngle: $.editor.target.haya._data.coneInnerAngle,
                coneOuterAngle: $.editor.target.haya._data.coneOuterAngle,
                coneOuterGain: $.editor.target.haya._data.coneOuterGain,
                maxDistance: $.editor.target.haya._data.maxDistance
            })
            // $.htimeout.value = 3;
            // $.htimeout.method = function () { $.editor.target.play() };
            //$.editor.target.play();
        }
        // ===========================================================
        refreshEditLight() {
            // delete
            this.refreshEditor();
            //
            $.editor.weditChange = false;
            // get info
            $.editor.target = this.gui.list.current().sprite;
            $.time = Haya.Map.Time.isPeriod($.editor.target.time);
            print($.editor.target)
            // y
            let yPos = 30;
            let xPos = 200;
            // general
            this.gui.editor.button.position = new Haya.GUI.Button({
                text: `Position: ${$.editor.target.x}, ${$.editor.target.y}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "position"; },
                information: "Change the X, Y axis position of the light source by moving around the Mouse.",
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.opacity = new Haya.GUI.Button({
                text: `Opacity: ${Haya.DMath.float($.editor.target.alpha * 100)}%`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "alpha"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.time = new Haya.GUI.Button({
                text: `Time: ${$.editor.target.time}`,
                position: [0, yPos],
                action: function () {
                    $.editor.wedit = null;
                    $.time++;
                    $.time = $.time > 4 ? 0 : $.time;
                    $.editor.target.time = Haya.Map.Time.isPeriod($.time);
                    print($.time, $.editor.target.time)
                    this.text(`Time: ${$.editor.target.time}`)
                    return;
                },
                width: 196
            })

            // color
            let color = Haya.Utils.Color.hexRgb(String($.editor.target.color).replace("0x", "#"));
            $.editor.pallete.red = color.red;
            $.editor.pallete.green = color.green;
            $.editor.pallete.blue = color.blue;



            yPos += 30;
            this.gui.editor.button.switch = new Haya.GUI.Button({
                text: `Switch: ${$.editor.target._self.switch}`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = "switch";
                    this.gui.editor.button.switch.sprite.input.visible = !this.gui.editor.button.switch.sprite.input.visible;
                    this.gui.editor.button.switch.sprite.input.text = "";
                },
                callback: function () {
                    this.sprite.input = new PixiTextInput(`${$.editor.target._self.switch}`);
                    this.sprite.input.width = this.sprite.width;
                    this.sprite.input.background = false;
                    this.sprite.input.visible = false;
                    this.sprite.input.alpha = 0;
                    this.sprite.input.position.set(
                        this.sprite.x,
                        this.sprite.y
                    )
                    this.addChild(this.sprite.input)
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.color = new Haya.GUI.Button({
                text: `Color: ${$.editor.target.color}`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = $.editor.wedit === "color" ? null : "color";
                    if ($.editor.wedit === null) {
                        this.gui.pallete.hide();
                        this.gui.pallete.deactivate();
                        this.gui.pallete.close();
                        return;
                    }
                    this.gui.pallete.show();
                    this.gui.pallete.activate();
                    this.gui.pallete.open();
                    this.gui.pallete._index = 0;
                },
                callback: function () {
                    this.sprite.text.style.fill = $.editor.target.color
                    this.text(`Color: ${$.editor.target.color}`)
                },
                width: 196
            })

            // pixi
            if ($.editor.target._self.kind !== "sprite") {

                yPos += 30;
                this.gui.editor.button.lightHeight = new Haya.GUI.Button({
                    text: `Light Height: ${Haya.DMath.float($.editor.target.lightHeight)}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "light-height"; },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.brightness = new Haya.GUI.Button({
                    text: `Brightness: ${Haya.DMath.float($.editor.target.brightness)}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "brightness"; },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.radius = new Haya.GUI.Button({
                    text: `Radius: ${Haya.DMath.float($.editor.target.radius)}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "radius"; },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.falloffA = new Haya.GUI.Button({
                    text: `Falloff A: ${Haya.DMath.float($.editor.target.falloff[0])}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "falloffa"; },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.falloffB = new Haya.GUI.Button({
                    text: `Falloff B: ${Haya.DMath.float($.editor.target.falloff[1])}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "falloffb"; },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.falloffC = new Haya.GUI.Button({
                    text: `Falloff C: ${Haya.DMath.float($.editor.target.falloff[2])}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "falloffc"; },
                    width: 196
                })
            } else {
                yPos += 30;
                this.gui.editor.button.blend = new Haya.GUI.Button({
                    text: `Blend Mode: ${$.editor.blend.list[$.editor.target.blendMode][1]}`,
                    position: [0, yPos],
                    action: function () {
                        $.editor.blend.kind++;
                        $.editor.blend.kind = $.editor.blend.kind >= $.editor.blend.list.length ? 0 : $.editor.blend.kind;
                        $.editor.target.blendMode = $.editor.blend.list[$.editor.blend.kind][0];
                        this.text(`Blend Mode: ${$.editor.blend.list[$.editor.target.blendMode][1]}`)
                    },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.scaleX = new Haya.GUI.Button({
                    text: `Scale X: ${Haya.DMath.float($.editor.target.scale.x)}`,
                    position: [0, yPos],
                    action: function () {
                        $.editor.wedit = "scaleX"
                    },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.scaleY = new Haya.GUI.Button({
                    text: `Scale Y: ${Haya.DMath.float($.editor.target.scale.y)}`,
                    position: [0, yPos],
                    action: function () {
                        $.editor.wedit = "scaleY"
                    },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.anchorX = new Haya.GUI.Button({
                    text: `Anchor X: ${Haya.DMath.float($.editor.target.anchor.x)}`,
                    position: [0, yPos],
                    action: function () {
                        $.editor.wedit = "anchorX"
                    },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.anchorY = new Haya.GUI.Button({
                    text: `Anchor Y: ${Haya.DMath.float($.editor.target.anchor.y)}`,
                    position: [0, yPos],
                    action: function () {
                        $.editor.wedit = "anchorY"
                    },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.rotation = new Haya.GUI.Button({
                    text: `Rotation: ${Haya.DMath.float(Haya.DMath.degrees($.editor.target.rotation))}°`,
                    position: [0, yPos],
                    action: function () {
                        $.editor.wedit = "rotation"
                    },
                    width: 196
                })
            } //$.editor.blend.kind, $.editor.list[kind][blendmode, string]

            yPos += 30;
            this.gui.editor.button.pulse = new Haya.GUI.Button({
                text: `Pulse: ${$.editor.target._self.pulse.value}`,
                position: [0, yPos],
                action: () => {
                    $.editor.target._self.pulse.value = !$.editor.target._self.pulse.value;
                    this.gui.editor.button.pulse.text(`Pulse: ${$.editor.target._self.pulse.value}`)
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.pulseSpeed = new Haya.GUI.Button({
                text: `Pulse Speed: ${Haya.DMath.float($.editor.target._self.pulse.speed)}`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = "pulseSpeed"
                    //$.editor.target._self.pulse.speed
                },

                width: 196
            })

            yPos += 30;
            this.gui.editor.button.pulseMin = new Haya.GUI.Button({
                text: `Pulse Minimum: ${Haya.DMath.float($.editor.target._self.pulse.min)}`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = "pulseMin"
                    //$.editor.target._self.pulse.speed
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.pulseMax = new Haya.GUI.Button({
                text: `Pulse Maximun: ${Haya.DMath.float($.editor.target._self.pulse.max)}`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = "pulseMax"
                    //$.editor.target._self.pulse.speed
                },
                width: 196
            })

            //
            yPos += 30;
            this.gui.editor.button.pulseDuration = new Haya.GUI.Button({
                text: `Pulse Duration: ${Haya.DMath.float($.editor.target._self.pulse.duration)}s`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = "pulseDuration"
                    //$.editor.target._self.pulse.speed
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.floor = new Haya.GUI.Button({
                text: `Floor: ${$.editor.target._self.floor}`,
                position: [0, yPos],
                action: function () {
                    $.editor.wedit = null;
                    $.time = $.time > 2 ? 0 : $.time;
                    $.time++;
                    $.time = $.time > 2 ? 0 : $.time;
                    $.editor.target._self.floor = Haya.Collision.Floor[$.time];
                    $gamePlayer.floor = $.editor.target._self.floor;
                    $.editor.collisionCategory = $gamePlayer.floor;
                    SceneManager._scene._spriteset.refreshSprite();
                    this.text(`Floor: ${$.editor.target._self.floor}`)
                    return;
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.delete = new Haya.GUI.Button({
                text: `Delete!`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = null;
                    this._spriteset.removeLight($.editor.target._self._name);
                    $.editor.control = "light";
                    this.refreshEditor();
                    this.refreshLightList();
                    return;
                },
                width: 196
            })

            //xPos += 100;
            yPos = 30;
            this.gui.editor.button.oscilation = new Haya.GUI.Button({
                text: `Oscilation: ${$.editor.target._self.oscilation.value}`,
                position: [xPos, yPos],
                action: () => {
                    $.editor.target._self.oscilation.value = !$.editor.target._self.oscilation.value;
                    this.gui.editor.button.oscilation.text(`Oscilation: ${$.editor.target._self.oscilation.value}`)
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.oscilationSpeed = new Haya.GUI.Button({
                text: `Oscilation Speed: ${Haya.DMath.float($.editor.target._self.oscilation.speed)}`,
                position: [xPos, yPos],
                action: () => {
                    $.editor.wedit = "oscilationSpeed"
                    //$.editor.target._self.pulse.speed
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.oscilationMin = new Haya.GUI.Button({
                text: `Oscilation Minimum: ${Haya.DMath.float($.editor.target._self.oscilation.min)}`,
                position: [xPos, yPos],
                action: () => {
                    $.editor.wedit = "oscilationMin"
                    //$.editor.target._self.pulse.speed
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.oscilationMax = new Haya.GUI.Button({
                text: `Oscilation Maximun: ${Haya.DMath.float($.editor.target._self.oscilation.max)}`,
                position: [xPos, yPos],
                action: () => {
                    $.editor.wedit = "oscilationMax"
                    //$.editor.target._self.pulse.speed
                },
                width: 196
            })

            //
            yPos += 30;
            this.gui.editor.button.oscilationDuration = new Haya.GUI.Button({
                text: `Oscilation Duration: ${Haya.DMath.float($.editor.target._self.oscilation.duration)}s`,
                position: [xPos, yPos],
                action: () => {
                    $.editor.wedit = "oscilationDuration"
                    //$.editor.target._self.pulse.speed
                },
                callback: function () {
                },
                width: 196
            })



            Object.keys(this.gui.editor.button).map((bkey) => {
                if (this.gui.editor.button[bkey]) {
                    this.gui.editor.addChild(this.gui.editor.button[bkey]);
                }
            })
        }

        refreshEditCollision() {
            // delete
            this.refreshEditor();
            //
            $.editor.weditChange = false;
            $.time = Haya.Collision.Floor[$.editor.target.floor]
            // y
            let yPos = 30;
            // general
            this.gui.editor.button.position = new Haya.GUI.Button({
                text: `Position: ${$.editor.target.x}, ${$.editor.target.y}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "position"; },
                width: 196
            })
            
            // kind
            if ($.editor.kind === "circle") {
                yPos += 30;
                this.gui.editor.button.radius = new Haya.GUI.Button({
                    text: `Radius: ${$.editor.target.radius}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "radius"; },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.scale = new Haya.GUI.Button({
                    text: `Scale: ${Haya.DMath.float($.editor.target.scale)}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "scale"; },
                    width: 196
                })


            } else if ($.editor.kind === "polygon") {
                yPos += 30;
                this.gui.editor.button.npoint = new Haya.GUI.Button({
                    text: `New Point!`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "npoint"; },
                    width: 196
                })


                yPos += 30;
                this.gui.editor.button.scaleX = new Haya.GUI.Button({
                    text: `Scale X: ${Haya.DMath.float($.editor.target.scale_x)}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "scaleX"; },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.scaleY = new Haya.GUI.Button({
                    text: `Scale Y: ${Haya.DMath.float($.editor.target.scale_y)}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "scaleY"; },
                    width: 196
                })

                // points
                $.editor.target.cachePoints.forEach((points, index) => {
                    this.gui.editor.button[`point ${index}`] = new Haya.GUI.Button({
                        text: `Point #${index}: ${points[0]}, ${points[1]}`,
                        position: [200, 50 + (30 * index)],
                        action: function () {
                            $.editor.pointId = this.setup.index;
                            $.editor.wedit = "point";
                        },
                        width: 196,
                        index: index
                    })
                })

            } else if ($.editor.kind === "rect") {
                //
                yPos += 30;
                this.gui.editor.button.scaleX = new Haya.GUI.Button({
                    text: `Scale X: ${Haya.DMath.float($.editor.target.scale_x)}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "scaleX"; },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.scaleY = new Haya.GUI.Button({
                    text: `Scale Y: ${Haya.DMath.float($.editor.target.scale_y)}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "scaleY"; },
                    width: 196
                })

                yPos += 30;
                this.gui.editor.button.scaleA = new Haya.GUI.Button({
                    text: `Average Scale: ${Haya.DMath.float(($.editor.target.scale_y + $.editor.target.scale_x) / 2)}`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "scaleA"; },
                    width: 196
                })
            }
            yPos += 30;
            this.gui.editor.button.padding = new Haya.GUI.Button({
                text: `Padding: ${Haya.DMath.float($.editor.target.padding)}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "padding"; },
                width: 196
            })


            if ($.editor.kind !== "circle") {
                yPos += 30;
                this.gui.editor.button.angle = new Haya.GUI.Button({
                    text: `Angle: ${Haya.DMath.float(Haya.DMath.degrees($.editor.target.angle))}°`,
                    position: [0, yPos],
                    action: () => { $.editor.wedit = "angle"; },
                    width: 196
                })
            }

            yPos += 30;
            this.gui.editor.button.floor = new Haya.GUI.Button({
                text: `Floor: ${$.editor.target.floor}`,
                position: [0, yPos],
                action: function () {
                    $.editor.wedit = null;
                    $.time++;
                    $.time = $.time > 3 ? 0 : $.time;
                    $.editor.target.floor = Haya.Collision.Floor[$.time];
                    this.text(`Floor: ${$.editor.target.floor}`)
                    return;
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.switch = new Haya.GUI.Button({
                text: `Switch: ${$.editor.target.switch}`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = "switch";
                    this.gui.editor.button.switch.sprite.input.visible = !this.gui.editor.button.switch.sprite.input.visible;
                    this.gui.editor.button.switch.sprite.input.text = "";
                },
                callback: function () {
                    this.sprite.input = new PixiTextInput(`${$.editor.target.switch}`);
                    this.sprite.input.width = this.sprite.width;
                    this.sprite.input.background = false;
                    this.sprite.input.visible = false;
                    this.sprite.input.alpha = 0;
                    this.sprite.input.position.set(
                        this.sprite.x,
                        this.sprite.y
                    )
                    this.addChild(this.sprite.input)
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.linkto = new Haya.GUI.Button({
                text: `To the floor: ${$.editor.target.linkto}`,
                position: [0, yPos],
                action: () => {
                    $.editor.target.linkto = !$.editor.target.linkto;
                    if ($.editor.target.linkto === true) {
                        $.editor.target.scale_y = 0.1;
                    }
                    this.gui.editor.button.linkto.text(`To the floor: ${$.editor.target.linkto}`)
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.linkKind = new Haya.GUI.Button({
                text: `Link Direction: ${$.editor.target.linkKind}`,
                position: [0, yPos],
                action: () => {
                    $.editor.target.linkKind = $.editor.target.linkKind.toLowerCase()
                    $.editor.target.linkKind = $.editor.target.linkKind === "horizontal" ? "vertical" : "horizontal";
                    this.gui.editor.button.linkKind.text(`Link Direction: ${$.editor.target.linkKind}`)
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.delete = new Haya.GUI.Button({
                text: `Delete!`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = null;
                    $.editor.kind = null;
                    $.editor.weditChange = false;
                    this.removeCollision($.editor.target._name);
                    $.editor.control = "collision";
                    this.refreshEditor();
                    this.refreshCollisionList();
                },
                width: 196
            })



            Object.keys(this.gui.editor.button).map((bkey) => {
                if (this.gui.editor.button[bkey]) {
                    if (Array.isArray(this.gui.editor.button[bkey])) {
                        this.gui.editor.addChild(...this.gui.editor.button[bkey])
                    } else {
                        this.gui.editor.addChild(this.gui.editor.button[bkey])
                    };
                }
            })

        }

        refreshSoundEdit() {
            // delete
            this.refreshEditor();
            //
            $.editor.weditChange = false;
            let yPos = 50;

            print($.editor.target, $.editor.target._pos)

            this.gui.editor.button.play = new Haya.GUI.Button({
                text: `Play/Stop`,
                position: [0, yPos],
                action: () => {
                    print($.editor.target, $.editor.target._pos)
                    if ($.editor.target.playing() === true) {
                        $.editor.target.stop();
                    } else { $.editor.target.play() }
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.autoPlay = new Haya.GUI.Button({
                text: `Autoplay: ${$.editor.target.haya._data.autoplay}`,
                position: [0, yPos],
                action: function () {
                    $.editor.target.haya._data.autoplay = !$.editor.target.haya._data.autoplay;
                    $.editor.target.autoplay = $.editor.target.haya._data.autoplay;
                    this.text(`Autoplay: ${$.editor.target.haya._data.autoplay}`)
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.position = new Haya.GUI.Button({
                text: `${$.editor.target.haya.pos.string()}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "position"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.volume = new Haya.GUI.Button({
                text: `Volume: ${Haya.DMath.float($.editor.target.haya._data.volume) * 100}%`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "volume"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.switch = new Haya.GUI.Button({
                text: `Switch: ${$.editor.target.haya._data.switch}`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = "switch";
                    this.gui.editor.button.switch.sprite.input.visible = !this.gui.editor.button.switch.sprite.input.visible;
                    this.gui.editor.button.switch.sprite.input.text = "";
                },
                callback: function () {
                    this.sprite.input = new PixiTextInput(`${$.editor.target.haya._data.switch}`);
                    this.sprite.input.width = this.sprite.width;
                    this.sprite.input.background = false;
                    this.sprite.input.visible = false;
                    this.sprite.input.alpha = 0;
                    this.sprite.input.position.set(
                        this.sprite.x,
                        this.sprite.y
                    )
                    this.addChild(this.sprite.input)
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.loop = new Haya.GUI.Button({
                text: `Loop: ${$.editor.target.haya._data.loop}`,
                position: [0, yPos],
                action: function () {
                    $.editor.target.haya._data.loop = !$.editor.target.haya._data.loop;
                    $.editor.target.loop($.editor.target.haya._data.loop);
                    this.text(`Loop: ${$.editor.target.haya._data.loop}`)
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.rate = new Haya.GUI.Button({
                text: `Rate: ${$.editor.target.haya._data.rate}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "rate"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.refDistance = new Haya.GUI.Button({
                text: `refDistance: ${$.editor.target.haya._data.refDistance}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "refDistance"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.rolloffFactor = new Haya.GUI.Button({
                text: `rolloffFactor: ${$.editor.target.haya._data.rolloffFactor}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "rolloffFactor"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.coneInnerAngle = new Haya.GUI.Button({
                text: `coneInnerAngle: ${$.editor.target.haya._data.coneInnerAngle}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "coneInnerAngle"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.coneOuterAngle = new Haya.GUI.Button({
                text: `coneOuterAngle: ${$.editor.target.haya._data.coneOuterAngle}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "coneOuterAngle"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.coneOuterGain = new Haya.GUI.Button({
                text: `coneOuterGain: ${$.editor.target.haya._data.coneOuterGain}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "coneOuterGain"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.maxDistance = new Haya.GUI.Button({
                text: `maxDistance: ${$.editor.target.haya._data.maxDistance}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "maxDistance"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.time = new Haya.GUI.Button({
                text: `Time: ${$.editor.target.haya._data.time}`,
                position: [0, yPos],
                action: function () {
                    $.editor.wedit = null;
                    $.time++;
                    $.time = $.time > 4 ? 0 : $.time;
                    $.editor.target.haya._data.time = Haya.Map.Time.isPeriod($.time);
                    this.text(`Time: ${$.editor.target.haya._data.time}`)
                    return;
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.delete = new Haya.GUI.Button({
                text: `Delete!`,
                position: [0, yPos],
                action: () => {
                    $.editor.wedit = null;
                    print($.editor.target.haya.name);
                    this._spriteset.removeSound($.editor.target.haya.name);
                    $.editor.control = "sound";
                    this.refreshEditor();
                    this.refreshSoundList();
                    return;
                },
                width: 196
            })



            // add into
            Object.keys(this.gui.editor.button).map((bkey) => {
                if (this.gui.editor.button[bkey]) {
                    if (Array.isArray(this.gui.editor.button[bkey])) {
                        print(this.gui.editor.button[bkey])
                        this.gui.editor.addChild(...this.gui.editor.button[bkey])
                    } else {
                        this.gui.editor.addChild(this.gui.editor.button[bkey])
                    };
                }
            })
        }

        refreshSpriteEdit() {
            // delete
            this.refreshEditor();
            //
            $.editor.weditChange = false;
            // get info
            $.editor.target = this.gui.list.current();
            $.time = Haya.Collision.Floor[$.editor.target.floor]
            // y
            let yPos = 30;
            this.gui.editor.button.position = new Haya.GUI.Button({
                text: `Position: ${$.editor.target.x}, ${$.editor.target.y}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "position"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.floor = new Haya.GUI.Button({
                text: `Floor: ${$.editor.target.floor}`,
                position: [0, yPos],
                action: function () {
                    $.editor.wedit = null;
                    $.time++;
                    $.time = $.time > 2 ? 0 : $.time;
                    $.editor.target.floor = Haya.Collision.Floor[$.time];
                    $.editor.collisionCategory = $.editor.target.floor
                    this.text(`Floor: ${$.editor.target.floor}`)
                    return;
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.opacity = new Haya.GUI.Button({
                text: `Opacity: ${Haya.DMath.float($.editor.target.alpha * 100)}%`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "alpha"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.blend = new Haya.GUI.Button({
                text: `Blend Mode: ${$.editor.blend.list[$.editor.target._layerInfo.blendMode][1]}`,
                position: [0, yPos],
                action: function () {
                    $.editor.blend.kind++;
                    $.editor.blend.kind = $.editor.blend.kind >= $.editor.blend.list.length ? 0 : $.editor.blend.kind;
                    $.editor.target._layerInfo.blendMode = $.editor.blend.list[$.editor.blend.kind][0];
                    $.editor.target.children.map((sps) => sps.blendMode = ($.editor.target._layerInfo.blendMode))
                    this.text(`Blend Mode: ${$.editor.blend.list[$.editor.target._layerInfo.blendMode][1]}`)
                },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.scaleX = new Haya.GUI.Button({
                text: `Scale X: ${Haya.DMath.float($.editor.target.scale.x * 100)}%`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "scaleX"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.scaleY = new Haya.GUI.Button({
                text: `Scale Y: ${Haya.DMath.float($.editor.target.scale.y * 100)}%`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "scaleY"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.rotation = new Haya.GUI.Button({
                text: `Rotation: ${Haya.DMath.float(Haya.DMath.degrees($.editor.target.rotation))}°`,
                position: [0, yPos],
                action: function () {
                    $.editor.wedit = "rotation"
                },
                width: 196
            })



            Object.keys(this.gui.editor.button).map((bkey) => {
                if (this.gui.editor.button[bkey]) {
                    this.gui.editor.addChild(this.gui.editor.button[bkey]);
                }
            })
        }

        refreshWeaherEdit() {
            // delete
            this.refreshEditor();

            // get info
            $.editor.target = this.gui.list.current();
            $.floor = Haya.Collision.Floor[$.editor.target.setup.floor]
            // y
            let yPos = 30;
            this.gui.editor.button.position = new Haya.GUI.Button({
                text: `Position: ${$.editor.target.x}, ${$.editor.target.y}`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "position"; },
                width: 196
            })

            yPos += 30;
            this.gui.editor.button.duration = new Haya.GUI.Button({
                text: `Duration: ${$.editor.target.setup.duration * 60}s`,
                position: [0, yPos],
                action: () => { $.editor.wedit = "duration"; },
                width: 196
            })

            Object.keys(this.gui.editor.button).map((bkey) => {
                if (this.gui.editor.button[bkey]) {
                    this.gui.editor.addChild(this.gui.editor.button[bkey]);
                }
            })
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
    // ========================================================================
    print($, "Haya Map Editor")
}(Haya.Map_Editor)
