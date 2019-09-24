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
 * @requires haya-movement
 * @requires haya-particle
 * @requires haya-map-editor 
 * =====================================================================
 * @todo [x] Loader_Map : load all textures and collisions before start
 *          [] animation while loading
 * @todo [x] Cutscene : a way to do better and more dynamic cutscenes
 *          [] blur tool : <focus/off focus> camera effect
 *          [] vignette effect
 *          [] filter tools : change colors of a specific part of the map
 * or add a effect and so on
 *          [] sound tool : with xyz axis position, duration and so on
 * @todo [] Cutscene's Editor
 * @todo [] Weather Effects
 *          [] Rain effects 
 * =====================================================================
 * @description [log]
 *  @version 0.1.6
 *      - code restructured 
 *  @version 0.1.7
 *      - [] Sprite_Haya : class of Sprite that contains light support
 * as well other stuff
 *      - [x] Loader_Map :
 *          - [] animated load
 *          - [x] load several sprite texture
 *  @version 0.2.0
 *       - [x] code restructured 
 *  @version 0.2.1
 *      [x] Cutscene : tools to create a dynamic cutscenes
 *  @version 0.2.2
 *      
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Map = {};
/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.2.2] Haya Map
 * 
 * @help
 * This plugin is under [Work in Progress], then any suggestion, 
 * feedback or some tips, it is welcome! Just send me a email :)
 * 
 * =============================================================
 * Credits:
 *   - Jonforum
 *   - ivanpopelyshev
 *   - davidfig
 */


/**
 * @function Sprite_Map
 * @classdesc A new spriteset map that has in your core
 * the pixi-lights and other stuff as well.
 */
function Sprite_Map() { this.initialize.apply(this, arguments); };
Sprite_Map.prototype = Object.create(Sprite_Map);
Sprite_Map.prototype.constructor = Sprite_Map;

/**
 * @function Loader_Map
 * @classdesc Pre load all textures before to start the new
 * map, this way the perfomance will be better
 */
function Loader_Map() { this.initialize.apply(this, arguments); };
Loader_Map.prototype = Object.create(Scene_Base.prototype);
Loader_Map.prototype.constructor = Loader_Map;


(function ($) {
    'use strict';
    // ========================================================================
    // ** General setup [:general]
    // ========================================================================
    $.scene = Scene_Map;
    $.loaded = false;
    $.map = "";
    $.map_id = -1;

    /**
     * @var current
     * @description handle with the current map data
     */
    $.current = { texture: {} };

    /**
     * @var library
     * @description handle with the library data of all maps
     */
    $.library = {};

    /**
     * @var group
     * @description handle with layers and priorities (depth)
     */
    $.group = {};

    /**
     * @var performace
     * @description handle with the performace of overall effects
     */
    $.performace = "medium";

    /**
     * @function perfomance
     * @description get all information & data of perfomace's values
     */
    $.performaceValues = function () {
        return ({
            // medium performace
            "medium": {
                // [light]
                "light-range": 120, // range in which extend of the limit of visibility for lights
                "light-effect": true, // all effects
                "buffer": 90,
                // [rage]
                "range": 120
            }
        })[$.performace]
    }


    /**
     * @function loadLibrary
     * @description load the library informations
     */
    function loadLibrary() {
        // get all directories info
        $.library.directory = {}
        // get the general directory path
        let dirList = Haya.FileIO.dirList(Haya.FileIO.local("img/maps"));
        // get all map and his directory path
        dirList.forEach((element) => {
            // record all except by editor stuffs
            if (!(element.match(/(editor|lights)$/gi))) {
                // get the map name
                let mapName = element.split(/\\|\//gi); mapName = mapName[mapName.length - 1];
                $.library.directory[mapName] = Haya.FileIO.clean(element);
            }
        })
        // get the setup information file
        $.library.setup = Haya.FileIO.json(Haya.FileIO.local("img/maps/setup.json"));
    }; loadLibrary();

    /**
     * @function loadCurrent
     * @description load the current map informations
     */
    function loadCurrent() {
        // return false if the map doesn't exist
        if (($.library.directory.hasOwnProperty($.map)) === false) {
            console.error(String($.map) + "\nThis map doesn't exist!\nMake sure that this name is the correct.");
            return false;
        }
        // pathname
        const path = "img/maps/" + $.map;

        // general information
        $.current.data = Haya.FileIO.json(Haya.FileIO.local(path + "/data.json"));
        $.current.name = $.map;
        $.current.id = $.map_id;
        $.current.width = $.current.data.width;
        $.current.height = $.current.data.height;
        $.current._local = Haya.FileIO.local(path);

        // light
        if ($.current.data.hasOwnProperty("light") && (Object.keys($.current.data.light)).length) {
            $.current.light = $.current.data.light;
        } else { $.current.light = $.library.setup.light.default }

        // particle
        if ($.current.data.hasOwnProperty("particle")) {
            $.current.particle = $.current.data.particle;
        } else { $.current.particle = {} }

        // filter
        if ($.current.data.hasOwnProperty("filter")) {
            $.current.filter = $.current.data.filter;
        } else { $.current.filter = {} }

        // sound
        if ($.current.data.hasOwnProperty("sound")) {
            $.current.sound = $.current.data.sound;
        } else { $.current.sound = {} }

        // collision
        if ($.current.data.hasOwnProperty("collision")) {
            $.current.collisionData = $.current.data.collision;
        } else { $.current.collisionData = {} }

        // texture
        $.current.texture = { _baseTexture: [] };

        // layers
        const layers = Haya.FileIO.json(Haya.FileIO.local(path + "/layer.json"));
        $.current.layer = {};
        Object.keys(layers).map(key => {
            var element = layers[key]; $.current.layer[key] = element;
        })

        // source of picture & texture
        $.current.src = {};
        Haya.FileIO.list(path + "/src", (filename) => {
            // replace filename
            let _filename = filename.replace(/^.*[\\\/]/, '');

            if (_filename.includes("!")) return;
            // load just '.json' file
            if (_filename.match(/\.(png|json)$/gi)) {
                let texture = _filename;
                let head = "";
                _filename.replace(/^(\H|\M|\G|\SM)\_?/gi, (reg) => {
                    head = reg;
                })
                // label
                let label = "M";
                if (_filename.includes("B_")) label = "background";
                if (_filename.includes("G_")) label = "ground";

                if (_filename.includes("M_") || _filename.includes("O_")) label = "middle";
                if (_filename.includes("SM_")) label = "smiddle";

                if (_filename.includes("H_") || _filename.includes("U_")) label = "upper";
                if (_filename.includes("SH_") || _filename.includes("SU_")) label = "supper";
                //
                texture = texture.replace(head, "");
                texture = texture.replace(/\-/gmi, " ");
                // info
                let _infoL = `${head}${texture.replace(/\.(png|jpg)$/gmi, "")}`
                //
                $.current.src[texture] = {
                    filename: _filename,
                    filepath: filename,
                    texture: texture,
                    label: label,
                    info: $.current.layer[_infoL]
                }
            }
        })

        // creates collision
        // $.collision = Haya.Collision.System;
        // $.result = $.collision.createResult();
        // $.current.collision = { source: {}, element: [] }

        // if (Object.keys($.current.collisionData).length > 0) {
        //     Object.keys($.current.collisionData).map((collisionName) => {
        //         const element = $.current.collisionData[collisionName];
        //         // create
        //         $.current.collision.source[collisionName] = Haya.Collision.createCollision(
        //             $.collision,
        //             element.kind,
        //             element
        //         )
        //         // define
        //         $.current.collision.source[collisionName]._name = collisionName;
        //         $.current.collision.source[collisionName]._kind = element.kind;
        //         // push
        //         $.current.collision.element.push($.current.collision.source[collisionName])
        //     })
        // }

        // print
        print($.current)
    }

    /**
     * @function orderGroup
     * @description layout
     */
    const orderGroup = function () {
        // light field
        this._diffuseGroup = new PIXI.display.Layer(PIXI.lights.diffuseGroup, true);
        this._diffuseGroup.clearColor = [0, 0, 0, 0];
        this._diffuseBlackSprite = new PIXI.Sprite(this._diffuseGroup.getRenderTexture());
        this._diffuseBlackSprite.tint = 0;
        this._diffuseBlackSprite.name = "blackSprite_Display";
        this._normalGroup = new PIXI.display.Layer(PIXI.lights.normalGroup);
        this._lightGroup = new PIXI.display.Layer(PIXI.lights.lightGroup);

        // enable sort
        this._diffuseGroup.group.enableSort = true;
        this._diffuseGroup.zIndex = 0;
        this._diffuseGroup.group.zIndex = 0;

        this._normalGroup.group.enableSort = true;
        this._normalGroup.zIndex = 0;
        this._normalGroup.group.zIndex = 0;

        this._lightGroup.group.enableSort = true;
        this._lightGroup.zIndex = 1;
        this._lightGroup.group.zIndex = 1;

        this.layer = {
            "background": 1,
            "ground": 2,

            "object": 3,
            "middle": 3,

            "sobject": 4,
            "smiddle": 4,

            "head": 5,
            "upper": 5,

            "shead": 6,
            "supper": 6,

            "light": 7,

            "gui": 8,
            "text": 9
        }
    }; $.group = new orderGroup();

    /**
     * @function spriteLoad 
     * @description load the sprite texture in normal && diffuse
     */
    $.loadSprite = function (diffuseTexture, normalTexture, zIndex, callback, hash) {
        // container
        this.container = new PIXI.Container();
        // diffuse
        this.diffuseSprite = new PIXI.Sprite(diffuseTexture);
        this.diffuseSprite.parentGroup = PIXI.lights.diffuseGroup;
        this.diffuseSprite.zIndex = zIndex || 2;
        this.diffuseSprite.parentGroup.zIndex = zIndex || 2;
        // normal
        this.normalSprite = new PIXI.Sprite(normalTexture)
        this.normalSprite.parentGroup = PIXI.lights.normalGroup;
        this.normalSprite.zIndex = zIndex || 2;
        this.normalSprite.parentGroup.zIndex = zIndex || 2;
        // callback
        this.container.addChild(this.diffuseSprite);
        this.container.addChild(this.normalSprite);

        if (Haya.Utils.isFunction(callback)) callback.call(this, this.container, this.diffuseSprite, hash);
        // return
        return this.container;
    }
    // ========================================================================
    /**
     * @function Scene_Base.initialize
     * @description insert on the child of the current scene, the groups of 
     * light layers
     */
    Scene_Base.prototype.initialize = function () {
        Stage.prototype.initialize.call(this);
        this._active = false;
        this._fadeSign = 0;
        this._fadeDuration = 0;
        this._fadeSprite = null;
        this._imageReservationId = Utils.generateRuntimeId();
        // create light layer
        this.addChild(
            $.group._diffuseBlackSprite,
            $.group._diffuseGroup,
            $.group._normalGroup,
            $.group._lightGroup
        )
    };
    // ========================================================================
    /**
     * @function Loader_Map
     * @description preload all textures and stuff from maps before start
     */
    Loader_Map.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        // check out if everything is loaded
        this._uploaded = false;
        // last texture
        this._last = null;
        // buffer
        this._buffer = 200;
        // loaded
        this._loaded = [];
        // 
        $.loaded = false;
    }

    Loader_Map.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        // load current information
        loadCurrent()
        // load map data information
        DataManager.loadMapData($.map_id);
        $gamePlayer.refresh();
        // preload textures
        this.preloadTexture()
    }

    Loader_Map.prototype.preloadTexture = function () {
        // load textures of the map
        if (Object.keys($.current.src).length > 0) {
            // if there is
            Object.keys($.current.src).map((key) => {
                let value = $.current.src[key]
                // load
                $.current.texture._baseTexture.push([
                    new PIXI.Texture.fromImage(value.filepath),
                    new PIXI.Texture.fromImage(`${$.current._local}/src/!${value.filename}`),
                    $.group.layer[value.label],
                    value.info
                ])

            })
            print($.current.texture._baseTexture, 'current - base texture')
        }
        // load video 

    }

    Loader_Map.prototype.update = function () {
        Scene_Base.prototype.update.call(this);
        // if is okay
        if (this._uploaded === true) {
            // create viewport
            $.Viewport = new PIXI.extras.Viewport({
                screenWidth: Graphics.width,
                screenHeight: Graphics.height,
                worldWidth: $.current.width || Graphics.width,
                worldHeight: $.current.height || Graphics.height
            })

            $.loaded = true;
            $gameMap.setup($.map_id)
            // go to the scene
            SceneManager.goto($.scene);

        } else {
            if (this._buffer < 1) {
                this._loaded.length = 0;
                if ($.current.texture._baseTexture.length < 1) {
                    this._uploaded = true;
                } else {
                    $.current.texture._baseTexture.forEach((value) => {
                        this._loaded.push(value[1].valid);
                    })
                }

                // everthing is loaded?
                this._uploaded = Haya.Utils.Array.isTrue(this._loaded)
                this._buffer = 100;
            } else { this._buffer-- }
        }

    }
    // ========================================================================
    /**
     * :time
     * @function TimeSystem
     * @description Time system for light and everything
     */
    class TimeSystem {
        /**
         * @desc constructor of class
         */
        constructor() {
            this._sec = 0;
            this._min = 0;
            this._hour = 17;
            this._day = 1;
            this._month = 1;
            this._year = 1;
            this._paused = false;
            this._speed = 10.0; // 0.1
            this._fastTime = false;
            this._fastSpeed = 1000;
        }
        /**
         * @desc update the TimeSystem
         */
        update() {
            if (this._sec >= 60) { this._sec = 0; this._min += 1; }
            if (this._min >= 60) { this._min = 0; this._hour += 1; }
            if (this._hour >= 24) { this._hour = 0; this._day += 1; }
            if (this._day >= 31) { this._day = 1; this._month += 1; }
            if (this._month >= 12) { this._month = 1; this._year += 1; }
        }
        /**
         * @desc run the time to make progress
         */
        progress() {
            if (this._paused === true) return;
            // check out if is on Scene_Map
            this._sec += this._speed;
            this.update();
        }
        //
        fastTime() {
            this._fastTime = !this._fastTime;
            this._speed = this._fastTime ? 100.0 : 0.1;
        }
        /**
         * @desc set the time
         * @param {number, string} value to change 
         * @param {string} type of time | sec...
         * @return {number}
         */
        set(value, type) {
            if (!Haya.Utils.invalid(value)) {
                if (typeof value === 'number') {
                    return value % type;
                } else if (typeof value === 'string') {
                    return eval(value) % type;
                }
            }
        }
        /**
         * @desc get value or set and get
         * @param {number} value change value if is defined
         * @return {boolean}
         */
        sec(value) { this._sec = this.set(value, 60); return this._sec; }
        min(value) { this._min = this.set(value, 60); return this._min; }
        hour(value) { this._hour = this.set(value, 24); return this._hour; }
        day(value) { this._day = this.set(value, 31); return this._day; }
        week() { return (((this.month() * 12) + this.day()) % 7); }
        month(value) { this._month = this.set(value, 12); return this._month; }
        year(value) { this._year = this.set(value, 2000); return this._year; }
        /**
         * @desc general to check period
         * @param {string} type object
         * @return {boolean} 
         */
        isPeriod(value) {
            return ({

                morning: 1,
                dawn: 0,
                afternoon: 2,
                night: 3,
                all: 4,

                0: "dawn",
                1: "morning",
                2: "afternoon",
                3: "night",
                4: "all",
            }[value])
        }
        /**
         * @desc check out the period of day
         * @return {boolean}
         */
        dawn() { return this._hour.isBetween(4, 6, false); }
        morning() { return this._hour.isBetween(7, 12, false); }
        afternoon() { return this._hour.isBetween(13, 17, false); }
        night() { return (this.evening() || this.midnight()) }
        evening() { return this._hour.isBetween(18, 24, false); }
        midnight() { return this._hour.isBetween(0, 3, false); }

        /**
         * @desc get a sum of time. Useful to compare
         */
        total(h, m, s) {
            h = h || this._hour;
            m = m || this._min;
            s = s || this._sec;
            return ~~((h * 1000) + (m * 100) + (s * 10));
        }
        /**
         * @desc get a sum of date. Useful to compare
         */
        dtotal(d, m, y) {
            d = d || this._day;
            m = m || this._month;
            y = y || this._year;
            return ~~((d * 1000) + (m * 100) + (y * 10));
        }
        /**
         * @desc display at string the time
         * @param {boolean} boolean if display all values
         * @return {boolean} 
         */
        string(boolean) {
            if (boolean) {
                return (String(
                    this._day.padZero(2) + "/" + this._month.padZero(2) + "/" + this._year.padZero(4) + " | " +
                    this._hour.padZero(2) + ":" + this._min.padZero(2) + ":" + this._sec.padZero(2)
                ));
            } else {
                return (String(
                    this._hour.padZero(2) + ":" + this._min.padZero(2) + ":" + this._sec.padZero(2)
                ));
            }
        }
        /**
         * @desc get the period of day by string
         * @param {string} period
         * @return {boolean}
         */
        period(string) {
            // check out if is dawn
            if (string.match(/(dawn)/gi)) {
                return this.dawn();
            } else if (string.match(/(morning)/gi)) {
                return this.morning();
            } else if (string.match(/(afternoon)/gi)) {
                return this.afternoon();
            } else if (string.match(/(evening)/gi)) {
                return this.evening();
            } else if (string.match(/(midnight)/gi)) {
                return this.midnight();
            } else if (string.match(/(night)/gi)) {
                return this.night();
            } else if (string.match(/(all)/gi)) {
                return true;
            } else {
                return false;
            }
        }
        /**
         * @desc check out if is at specific hour
         * @param {number} h hour
         * @param {number} m min
         * @param {number} s sec
         * @param {string} compare | "<", ">", "<=", ">=" | default is "==="
         * @returns {boolean}
         */
        at(h, m, s, compare) {
            compare = compare.clean() || "";
            if (compare.match(/(^\<)/i)) {
                return (this.total() < this.total(h, m, s))
            } else if (compare.match(/(^\>)/i)) {
                return (this.total() > this.total(h, m, s));
            } else if (compare.match(/(^\<\=)/i)) {
                return (this.total() <= this.total(h, m, s))
            } else if (compare.match(/(^\>\=)/i)) {
                return (this.total() >= this.total(h, m, s))
            } else {
                return (this.total() === this.total(h, m, s))
            }
        }
        /**
         * @desc check out if is at specific day
         * @param {number} d day
         * @param {number} m month
         * @param {number} y year
         * @param {string} compare | "<", ">", "<=", ">=" | default is "==="
         * @returns {boolean}
         */
        date(d, m, y, compare) {
            compare = compare.clean() || "";
            if (compare.match(/(^\<)/i)) {
                return (this.dtotal() < this.dtotal(d, m, y))
            } else if (compare.match(/(^\>)/i)) {
                return (this.dtotal() > this.dtotal(d, m, y));
            } else if (compare.match(/(^\<\=)/i)) {
                return (this.dtotal() <= this.dtotal(d, m, y))
            } else if (compare.match(/(^\>\=)/i)) {
                return (this.dtotal() >= this.dtotal(d, m, y))
            } else {
                return (this.dtotal() === this.dtotal(d, m, y))
            }
        }
    }; $.Time = new TimeSystem();
    // ========================================================================
    var _Sprite_Picture_updatePosition = Sprite_Picture.prototype.updatePosition;
    Sprite_Picture.prototype.updatePosition = function () {
        if (/^FX/gim.test(this.picture().name())) {
            var picture = this.picture();
            this.x = ~~(Math.floor(picture.x()) - ($.Viewport.x));
            this.y = ~~(Math.floor(picture.y()) - ($.Viewport.y));
        } else {
            _Sprite_Picture_updatePosition.call(this);
        }
    };
    // ========================================================================
    /**
     * @function Sprite_Map
     * @description the new spriteset_map that handle with everything about
     * sprites and so on
     */
    Sprite_Map.prototype.initialize = function () {
        this.sprite = new PIXI.Container();
        this.sprite.filterArea = new PIXI.Rectangle(0, 0, $.Viewport.worldWidth, $.Viewport.worldHeight)
        // picture stage
        this.pictureStage = new PIXI.Container();
        // variables
        this.light = { element: [], source: {}, _updateBuffer: 3 };

        this.particle = { source: {}, element: [] }
        this.particleBuffer = 1;

        this.filter = { source: {}, element: [] };

        this._characters = [];

        this.display = new Point(0, 0);

        // create
        this.create();

        // print
        print("[Sprite_Map]: ", this);
    }

    Sprite_Map.prototype.create = function () {
        // stage for almost all sprites

        // create the base
        this.createBaseSprite();

        // create the map itself
        this.createMap();

        // create the charactes
        this.createCharacter();

        // create the lights
        this.createLightSprite();

        // create the particles
        this.createParticle();

        // create ScreenSprite
        this.createScreenSprite();

        // create the pictures
        this.createPictures();

        // print
        print("[Sprite_Map]:sprite ", this.sprite);
    }

    Sprite_Map.prototype.update = function () {
        $.Time.progress();
        this.updateCharacters();
        //this.sprite.updateTransform();

        if (this.light._updateBuffer < 1) {
            this.updateLight(); this.light._updateBuffer = 90 //$.performaceValues()["buffer"]
        } else { this.light._updateBuffer--; }

        this.updateParticle()

        this.updateScreenSprites();
    }

    Sprite_Map.prototype.dispose = function () {
        // destroy it
        this.sprite.destroy();
        // and lights
        // for (let index = 0; index < this.light.element.length; index++) {
        //     const element = this.light.element[index];
        //     element.parent.removeChild(element);
        // }
    }

    Sprite_Map.prototype.createBaseSprite = function () {
        this._baseSprite = new PIXI.Container();
        this._baseSprite.position.set(0, 0);
        this.sprite.addChild(this._baseSprite);
    }

    Sprite_Map.prototype.createMap = function () {
        if ($.current.texture._baseTexture.length > 0) {
            $.current.texture._baseTexture.forEach((texture) => {
                let mtexture = $.loadSprite(
                    texture[0],
                    texture[1],
                    texture[2]
                );
                mtexture._layerInfo = texture[3];
                mtexture.position.set(
                    mtexture._layerInfo.x,
                    mtexture._layerInfo.y
                )
                mtexture._spriteName = "map";
                mtexture.filterArea = mtexture.getBounds();
                this.sprite.addChild(mtexture)
            })
        }
        print(this.sprite.children)
    }

    Sprite_Map.prototype.createCharacter = function () {
        this._characters = [];
        // create player
        // new Sprite_Character($gamePlayer)

        //create events
        $gameMap.events().forEach((event) => {
            //event.setPosition(event._x, event._y)

            let _event = new Hayaset_Character(event);
            this._characters.push(_event)
        })

        var player = new Hayaset_Character($gamePlayer);
        this._characters.push(player);

        // name & zIndex
        this._characters.forEach((value, index) => {
            value.name = `character_${index}`
            value.children.forEach((ch) => {
                ch.z = 3;
                ch.zIndex = $.group.layer["object"];
                ch.parentGroup.zIndex = ch.zIndex;
            })
            this.sprite.addChild(value)
            //print(value.children[0], 'character')
        })
        // add
        //(...this._characters);
    }

    Sprite_Map.prototype.createLightSprite = function () {
        Object.keys($.current.light).map((value) => {
            var item = $.current.light[value];
            this.addLight(item, value, this.sprite)
        })
    }

    Sprite_Map.prototype.createParticle = function () {
        Object.keys($.current.particle).map((key) => {
            let item = $.current.particle[key]
            let hash = $.current.particle[key];
            hash._item = item;
            hash.stage = this.sprite;
            hash.setupFilename = item.setup;
            let _particle = Haya.Particle.manager.add(item.setup, item.textures, hash)
            _particle.name = key;
            this.particle.element.push(_particle)
            this.particle.source[key] = _particle;
        })
    }

    Sprite_Map.prototype.createFilter = function () {
        return;
    }

    Sprite_Map.prototype.createScreenSprite = function () {
        this._flashSprite = new ScreenSprite();
        this._fadeSprite = new ScreenSprite();
        SceneManager._scene.addChild(this._flashSprite);
        SceneManager._scene.addChild(this._fadeSprite);
    }

    Sprite_Map.prototype.createPictures = function () {
        this._pictureContainer = new Sprite();
        this._pictureContainer.setFrame(
            (Graphics.width - Graphics.boxWidth) / 2,
            (Graphics.height - Graphics.boxHeight) / 2,
            Graphics.boxWidth,
            Graphics.boxHeight
        )
        for (var i = 1; i <= $gameScreen.maxPictures(); i++) {

            this._pictureContainer.addChild(new Sprite_Picture(i));
        }
        SceneManager._scene.addChild(this._pictureContainer);
    }

    Sprite_Map.prototype.updateLight = function () {
        // for in each element;
        for (let index = 0; index < this.light.element.length; index++) {
            const element = this.light.element[index];
            // check out if the light requires a switch to activate
            // check oput if is on the right period of the day's time
            if ($.Time.period(element.time)) {
                // check out the range of visibility
                // if it is a main componment or a ambient, the range don't affect
                if (element.kind.toLowerCase() === "main" || element.kind.toLowerCase() === "ambient" || element.kind === "directional") {
                    element.visible = true;
                } else {
                    // element.pivot.x = this.display.x;
                    // element.pivot.y = this.display.y;
                    // element.visible = (element.x.isBetween(0 + $._lightRangeX, (Graphics.width) + $._lightRangeX)) &&
                    //     (element.y.isBetween(0 + $._lightRangeY, (Graphics.height) + $._lightRangeY))

                    if ($gameCutscene.isCutscene()) {
                        element.visible = true;
                    } else {
                        element.visible = (
                            (element.x.isBetween(
                                -120 + ($.Viewport.x),
                                (Graphics.width) + ($.Viewport.x + 120))
                            ) &&
                            (element.y.isBetween(
                                -120 + (-$.Viewport.y),
                                (Graphics.height) + (-$.Viewport.y + 120)
                            ))
                        )
                    }

                }
                // check out if the light is dynamic or static
                if (element.nature.toLowerCase() === "dynamic") {

                }
            } else {
                element.visible = false;
                //element.alpha = 0;
                //return;
            }
        }
    }

    Sprite_Map.prototype.updateCharacters = function () {
        if (this._characters.length < 1) return;
        // for in 
        for (let index = 0; index < this._characters.length; index++) {
            const element = this._characters[index];
            if (element) {
                element.children[0].update();
                element.children[1].update();
            }
        }
    }

    Sprite_Map.prototype.updateParticle = function () {
        Haya.Particle.manager.update((particle) => {
            if ($.Time.period(particle.time)) {
                let px = 0;
                let py = 0;

                if ($gameCutscene.isCutscene()) {
                    particle.visible = true;
                } else {
                    particle.visible = (
                        (particle.x.isBetween(
                            -120 + ($gameMap._camera.x),
                            (Graphics.width) + ($gameMap._camera.x + 120))
                        ) &&
                        (particle.y.isBetween(
                            -120 + (-$gameMap._camera.y),
                            (Graphics.height) + (-$gameMap._camera.y + 120)
                        ))
                    )
                }

                particle.emmiter._emit = particle.visible;
            } else {
                particle.visible = false;
                particle.emmiter._emit = false;
            }
        });
    }

    Sprite_Map.prototype.updateScreenSprites = function () {
        var color = $gameScreen.flashColor();
        this._flashSprite.setColor(color[0], color[1], color[2]);
        this._flashSprite.opacity = color[3];
        this._fadeSprite.opacity = 255 - $gameScreen.brightness();
    }

    Sprite_Map.prototype.addLight = function (hash, name, addch = this.sprite) {
        if (hash.kind === "sprite") {
            // light sprite
            if (hash.url) {
                this._light = new PIXI.Sprite.fromImage(hash.url);
            } else { this._light = new PIXI.Sprite.from(hash.texture); }


            // set up the configuration of the light itself
            if (hash.blendMode) eval(String("this._light.blendMode = " + hash.blendMode));
            this._light.alpha = hash.alpha || this._light.alpha;

        } else {
            // set up the kind of light
            if (hash.kind === "ambient") {
                this._light = new PIXI.lights.AmbientLight(hash.color || "0xddc83a", hash.brightness || 0.6)
            } else if (hash.kind === "directional") {
                this._light = new PIXI.lights.DirectionalLight(
                    hash.color || "0xddc83a",
                    hash.brightness || 0.6, hash.target || new Point(0, 0)
                )
            } else {
                this._light = new PIXI.lights.PointLight(hash.color || "0xddc83a", hash.brightness || 0.6);
            }

            // set up the configuration of the light itself
            this._light.lightHeight = hash.lightHeight || this._light.lightHeight;
            this._light.falloff = hash.falloff || this._light.falloff;
            if (hash.blendMode) eval(String("this._light.blendMode = " + hash.blendMode));
            this._light.dirty = hash.dirty || this._light.dirty;
            this._light.radius = hash.radius || 300;

            // parent Layer
            this._light.parentLayer = $.group._lightGroup;
        }

        // set up the axis position
        if (typeof hash.position === 'string') {
            if (hash.position === "center-main") {
                this._light.position.set(
                    (-($.current.width / 2)),
                    (($.current.height / 2))
                );
            } else if (hash.position === "center") {
                this._light.position.set(
                    (($.current.width / 2)),
                    (($.current.height / 2))
                );
            }
        } else if (Haya.Utils.isArray(hash.position)) {

            if (hash.position[0]) this._light.position.x = hash.position[0];
            if (hash.position[1]) this._light.position.y = hash.position[1];

        }


        // set up extra configuration
        this._light.switch = hash.switch || -1;
        this._light.time = hash.time || "all";
        this._light.name = hash.name || name;
        this._light.kind = hash.kind;
        this._light.nature = hash.nature || "static";
        this._light._stage = addch;
        this._light.layer = hash.layer;
        this._light._editor = false;



        // into child and screen
        addch.addChild(this._light);
        this.light.source[name] = this._light;
        this.light.element.push(this._light);

        print(this._light);
    }

    Sprite_Map.prototype.removeLight = function (name) {
        if (this.light.source.hasOwnProperty(name)) {
            this.light.source[name]._stage.removeChild(this.light.source[name])
            this.light.element.forEach((value, index) => {
                if (value.name === name) {
                    this.light.element.splice(index, 0);
                    return;
                }
            })
            delete this.light.source[name];
        }
    }

    Sprite_Map.prototype.removeParticle = function (name) {
        if (this.particle.source.hasOwnProperty(name)) {
            this.particle.source[name].parent.removeChild(this.particle.source[name]);
            this.particle.element.forEach((value, index) => {
                if (value.name === name) {
                    this.particle.element.splice(index, 0);
                    return;
                }
            })
            delete this.particle.source[name];
        }
    }

    // ========================================================================
    class Hayaset_Character extends PIXI.Container {
        // constructor
        constructor(character) {
            super();
            // initMembers
            this._diffuse = new Sprite_Character(character);
            this._diffuse.parentGroup = PIXI.lights.diffuseGroup;
            this._normal = new Sprite_Character(character, true);
            this._normal.parentGroup = PIXI.lights.normalGroup;
            this.addChild(this._diffuse, this._normal);
        }
        // ini
        initMembers() {
            this._diffuse.initMembers();
            this._normal.initMembers();
        }
        // set
        setCharacter(character) {
            this._diffuse.setCharacter(character);
            this._normal.setCharacter(character);
        }

        update() {
            this._diffuse.update();
            this._normal.update();
        }

        updateBitmap() {
            this._diffuse.updateBitmap();
            this._normal.updateBitmap();
        }

        updateFrame() {
            this._diffuse.updateFrame();
            this._normal.updateFrame();
        }

        updatePosition() {
            this._diffuse.updatePosition();
            this._normal.updatePosition();
        }

        updateAnimation() {
            this._diffuse.updateAnimation();
            this._normal.updateAnimation();
        }

        updateBalloon() {
            this._diffuse.updateBalloon();
            this._normal.updateBalloon();
        }

        updateOther() {
            this._diffuse.updateOther();
            this._normal.updateOther();
        }

        updateVisibility() {
            this._diffuse.updateVisibility();
            this._normal.updateVisibility();
        }

        isTile() {
            return this._diffuse.isTile();
            //this._normal.isTile();
        }

        tilesetBitmap(tileId) {
            this._diffuse.tilesetBitmap(tileId);
            this._normal.tilesetBitmap(tileId);
        }

        patternWidth() {
            return this._diffuse.patternWidth();
            this._normal.patternWidth();
        }

        patternHeight() {
            return this._diffuse.patternHeight();
            this._normal.patternHeight();
        }

        updateHalfBodySprites() {
            this._diffuse.updateHalfBodySprites();
            this._normal.updateHalfBodySprites();
        }

        setupAnimation() {
            this._diffuse.setupAnimation();
            this._normal.setupAnimation();
        }

        setupBalloon() {
            this._diffuse.setupBalloon();
            this._normal.updsetupBalloonate();
        }

        createHalfBodySprites() {
            this._diffuse.createHalfBodySprites();
            this._normal.createHalfBodySprites();
        }

        startBalloon() {
            this._diffuse.startBalloon();
            this._normal.startBalloon();
        }

        endBalloon() {
            this._diffuse.endBalloon();
            this._normal.endBalloon();
        }

        isBalloonPlaying() {
            return this._diffuse.isBalloonPlaying();
            this._normal.isBalloonPlaying();
        }

        characterPatternY() {
            return this._diffuse.characterPatternY();
        }


        characterPatternX() {
            return this._diffuse.characterPatternX();
        }

        characterBlockY() {
            return this._diffuse.characterBlockY();
        }

        characterBlockX() {
            return this._diffuse.characterBlockX();
        }

        updateCharacterFrame() {
            this._diffuse.updateCharacterFrame();
            this._normal.updateCharacterFrame();
        }

        updateTileFrame() {
            this._diffuse.updateTileFrame();
            this._normal.updateTileFrame();
        }

        setCharacterBitmap() {
            this._diffuse.setCharacterBitmap();
            this._normal.setCharacterBitmap();
        }

        setTileBitmap() {
            this._diffuse.setTileBitmap();
            this._normal.setTileBitmap();
        }

        isImageChanged() {
            return this._diffuse.isImageChanged();
        }
    }; $.Hayaset_Character = Hayaset_Character;
    // ========================================================================
    /**
     * @function Sprite_Character
     * @description new sprite character to support normal and diffuse map
     */
    Sprite_Character.prototype.initialize = function (character, normal = false) {
        Sprite_Base.prototype.initialize.call(this);
        this.normal = normal;
        this._refreshImage = true;
        //
        this.initMembers();
        this.setCharacter(character);
    };

    Sprite_Character.prototype.initMembers = function () {
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this._character = null;
        this._balloonDuration = 0;
    };

    Sprite_Character.prototype.updateVisibility = function () {
        Sprite_Base.prototype.updateVisibility.call(this);
        if (this._character.isTransparent()) {
            this.visible = false;
        }
    };

    Sprite_Character.prototype.updateFrame = function () {
        this.updateCharacterFrame();
    };

    Sprite_Character.prototype.isImageChanged = function () {
        return (
            this._refreshImage === true ||
            this._characterName !== this._character.characterName() ||
            this._characterIndex !== this._character.characterIndex()
        );
    };

    Sprite_Character.prototype.setCharacterBitmap = function () {
        if (this.normal === true) {
            this.bitmap = ImageManager.loadCharacter("!" + this._characterName);
        }
        return this.bitmap = ImageManager.loadCharacter(this._characterName);
    };

    Sprite_Character.prototype.updateCharacterFrame = function () {
        var pw = this.patternWidth();
        var ph = this.patternHeight();
        var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
        var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
        //this.updateHalfBodySprites();
        this.setFrame(sx, sy, pw, ph);
    };

    Sprite_Character.prototype.patternWidth = function () {
        return 32;
    };

    Sprite_Character.prototype.patternHeight = function () {
        return 48;
    };

    Sprite_Character.prototype.updatePosition = function () {
        this.x = this._character.screenX();
        this.y = this._character.screenY();
        this.z = this._character.screenZ();
        //print(this._character._difX, this._character._difY)
    };
    // ========================================================================
    /**
     * @function Scene_Map 
     * @description Reformed scene map for the new system
     */
    Scene_Map.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
        // change when the map is loaded
        this._mapLoaded = false;
        this._encounterEffectDuration = 0;
        this._waitCount = 0;
    };

    Scene_Map.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
        if (this._transfer) {
            this.fadeInForTransfer();
            $gameMap.autoplay();
        } else if (this.needsFadeIn()) {
            this.startFadeIn(this.fadeSpeed(), false);
        }
        this.menuCalling = false;
    };

    Scene_Map.prototype.update = function () {
        this.updateMainMultiply();
        if (this.isSceneChangeOk()) {
            this.updateScene();
        } else if (SceneManager.isNextScene(Scene_Battle)) {
            this.updateEncounterEffect();
        }
        this.updateWaitCount();
        Scene_Base.prototype.update.call(this);
    };

    Scene_Map.prototype.updateMainMultiply = function () {
        this.updateMain();
        if (this.isFastForward()) {
            this.updateMain();
        }
    };

    Scene_Map.prototype.updateMain = function () {
        var active = this.isActive();
        $gameMap.update(active);
        $gamePlayer.update(active);
        $gameTimer.update(active);
        $gameScreen.update();
        this._spriteset.update();
    };

    Scene_Map.prototype.updateScene = function () {
        this.checkGameover();
        if (!SceneManager.isSceneChanging()) {
            this.updateTransferPlayer();
            this.updateEncounter();
            this.updateCallMenu();
            this.updateCallDebug();
        }
    };

    Scene_Map.prototype.updateWaitCount = function () {
        if (this._waitCount > 0) {
            this._waitCount--;
            return true;
        }
        return false;
    };

    Scene_Map.prototype.updateTransferPlayer = function () {
        if ($gamePlayer.isTransferring()) {
            $gamePlayer.performTransfer();
        }
    };

    Scene_Map.prototype.updateEncounter = function () {
        return;
        if ($gamePlayer.executeEncounter()) {
            SceneManager.push(Scene_Battle);
        }
    };

    Scene_Map.prototype.updateCallMenu = function () {
        if (this.isMenuEnabled()) {
            if (this.isMenuCalled()) {
                this.menuCalling = true;
            }
            if (this.menuCalling && !$gamePlayer.isMoving()) {
                this.callMenu();
            }
        } else {
            this.menuCalling = false;
        }
    };

    Scene_Map.prototype.isFastForward = function () {
        return ($gameMap.isEventRunning() && !SceneManager.isSceneChanging() &&
            (Input.isLongPressed('ok') || TouchInput.isLongPressed()));
    };

    Scene_Map.prototype.isBusy = function () {
        return ((this._messageWindow && this._messageWindow.isClosing()) ||
            this._waitCount > 0 ||
            this._encounterEffectDuration > 0 ||
            Scene_Base.prototype.isBusy.call(this));
    };

    Scene_Map.prototype.stop = function () {
        Scene_Base.prototype.stop.call(this);
        $gamePlayer.straighten();
        if (this.needsSlowFadeOut()) {
            this.startFadeOut(this.slowFadeSpeed(), false);
        } else if (SceneManager.isNextScene(Scene_Map)) {
            this.fadeOutForTransfer();
        } else if (SceneManager.isNextScene(Scene_Battle)) {
            this.launchBattle();
        }
    };

    Scene_Map.prototype.terminate = function () {
        Scene_Base.prototype.terminate.call(this);
        if (!SceneManager.isNextScene(Scene_Battle)) {
            this._spriteset.update();
            SceneManager.snapForBackground();
        } else {
            ImageManager.clearRequest();
        }

        if (SceneManager.isNextScene(Scene_Map)) {
            ImageManager.clearRequest();
        }

        this._spriteset.dispose();

        $gameScreen.clearZoom();

        this.removeChild(this._fadeSprite);
        this.removeChild(this._windowLayer);
        this.removeChild(this._spriteset);
    };

    Scene_Map.prototype.isSceneChangeOk = function () {
        return this.isActive() && !$gameMessage.isBusy();
    };

    Scene_Map.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this._transfer = $gamePlayer.isTransferring();
    };

    Scene_Map.prototype.isReady = function () {
        if (!this._mapLoaded) {
            this.onMapLoaded();
            this._mapLoaded = true;
        }
        return this._mapLoaded && Scene_Base.prototype.isReady.call(this);
    };

    Scene_Map.prototype.onMapLoaded = function () {
        if (this._transfer) {
            $gamePlayer._transferring = false;
        }
        this.createDisplayObjects();
    };

    Scene_Map.prototype.needsFadeIn = function () {
        return (SceneManager.isPreviousScene(Scene_Battle) ||
            SceneManager.isPreviousScene(Scene_Load));
    };

    Scene_Map.prototype.needsSlowFadeOut = function () {
        return (SceneManager.isNextScene(Scene_Title) ||
            SceneManager.isNextScene(Scene_Gameover));
    };

    Scene_Map.prototype.createDisplayObjects = function () {

        this.createViewport()

        this.createSpriteset();

        this.createWindowLayer();

        this.createAllWindows();

        // wide
        this.addChild($gameCutscene._focusLight)
        this.addChild($gameCutscene._wideSprite);

        $gameMap.target = null;

        print($gameMap, 'game map')
    };

    Scene_Map.prototype.createViewport = function () {
        $.Viewport = new PIXI.extras.Viewport({
            screenWidth: Graphics.width,
            screenHeight: Graphics.height,
            worldWidth: $.current.width || Graphics.width,
            worldHeight: $.current.height || Graphics.height
        })

        // clamp direction
        $.Viewport.clamp({ direction: "all" })
        // clamp zoom
        $.Viewport.clampZoom({
            minWidth: Graphics.width / 3,
            minHeight: Graphics.height / 3,
            maxWidth: $.Viewport.worldWidth,
            maxHeight: $.Viewport.worldHeight,
        })
        // available zoom
        //$.Viewport.wheel();

        print($.Viewport, 'viewport')
        this.addChild($.Viewport);
    }

    Scene_Map.prototype.createSpriteset = function () {
        this._spriteset = new Sprite_Map();
        $.Viewport.addChild(this._spriteset.sprite);
    };

    Scene_Map.prototype.createAllWindows = function () {
        this.createMessageWindow();
        this.createScrollTextWindow();
    };

    Scene_Map.prototype.createMessageWindow = function () {
        this._messageWindow = new Window_Message();
        this.addWindow(this._messageWindow);
        this._messageWindow.subWindows().forEach(function (window) {
            this.addWindow(window);
        }, this);
    };

    Scene_Map.prototype.createScrollTextWindow = function () {
        this._scrollTextWindow = new Window_ScrollText();
        this.addWindow(this._scrollTextWindow);
    };

    Scene_Map.prototype.isMenuEnabled = function () {
        return $gameSystem.isMenuEnabled() && !$gameMap.isEventRunning();
    };

    Scene_Map.prototype.isMenuCalled = function () {
        return Input.isTriggered('menu') || TouchInput.isCancelled();
    };

    Scene_Map.prototype.callMenu = function () {
        SoundManager.playOk();
        SceneManager.push(Scene_Menu);
        Window_MenuCommand.initCommandPosition();
        $gameTemp.clearDestination();
        this._waitCount = 2;
    };

    Scene_Map.prototype.updateCallDebug = function () {
        if (this.isDebugCalled()) {
            SceneManager.push(Scene_Debug);
        }
    };

    Scene_Map.prototype.isDebugCalled = function () {
        return Input.isTriggered('debug') && $gameTemp.isPlaytest();
    };
    // ========================================================================
    /**
     * @function Game_Map
     * @description redraw game map for the new system
     */
    Game_Map.prototype.initialize = function () {
        this._interpreter = new Game_Interpreter();
        this._mapId = 0;
        this._tilesetId = 0;
        this._events = [];
        this._commonEvents = [];
        this._vehicles = [];
        this._displayX = 0;
        this._displayY = 0;
        this._nameDisplay = true;
        this._scrollDirection = 2;
        this._scrollRest = 0;
        this._scrollSpeed = 4;
        this._parallaxName = '';
        this._parallaxZero = false;
        this._parallaxLoopX = false;
        this._parallaxLoopY = false;
        this._parallaxSx = 0;
        this._parallaxSy = 0;
        this._parallaxX = 0;
        this._parallaxY = 0;
        this._viewportVY = null;
        this._viewportXY = null;
        this._battleback1Name = null;
        this._battleback2Name = null;
        //
        this.target = null;
        this._camera = new Point(0, 0);
        this._camera.speed = 0.75;
        // this.createVehicles();
    };

    Game_Map.prototype.setup = function (mapId) {
        if (!$dataMap) {
            throw new Error('The map data is not available');
        }
        this._mapId = mapId;
        this._tilesetId = $dataMap.tilesetId;
        this._displayX = 0;
        this._displayY = 0;
        $gameCutscene.refresh();
        this.setupEvents();
        this.setupBattleback();
        this._needsRefresh = false;
    };

    Game_Map.prototype.setupEvents = function () {
        this._events = [];
        for (var i = 0; i < $dataMap.events.length; i++) {
            if ($dataMap.events[i]) {
                this._events[i] = new Game_Event(this._mapId, i);
            }
        }
        this._commonEvents = this.parallelCommonEvents().map(function (commonEvent) {
            return new Game_CommonEvent(commonEvent.id);
        });
        this.refreshTileEvents();
    };

    Game_Map.prototype.update = function (sceneActive) {
        this.refreshIfNeeded();
        if (sceneActive) {
            this.updateInterpreter();
        }
        this.updateScroll();
        this.updateEvents();
        this.updateVehicles();
    };

    Game_Map.prototype.tileWidth = function (scale = false) {
        return 8;
    };

    Game_Map.prototype.tileHeight = function (scale = false) {
        return 8;
    };

    Game_Map.prototype.width = function () {
        return $.Viewport.worldWidth;
    };

    Game_Map.prototype.height = function () {
        return $.Viewport.worldHeight;
    };

    Game_Map.prototype.screenTileX = function () {
        return $.Viewport.screenWidth / this.tileWidth();
    };

    Game_Map.prototype.screenTileY = function () {
        return $.Viewport.screenHeight / this.tileHeight();
    };

    Game_Map.prototype.snap = function (x, y, options = { topLeft: true }) {
        return;
        x = Math.max(0, Math.min(x, this.width()));
        y = Math.max(0, Math.min(y, this.height()));
        $.Viewport.snap(x, y, options)
    };

    Game_Map.prototype.scrollDown = function (distance) {
        return;
    };

    Game_Map.prototype.scrollLeft = function (distance) {
        return;
    };

    Game_Map.prototype.scrollRight = function (distance) {
        return;
    };

    Game_Map.prototype.scrollUp = function (distance) {
        return;
    };

    Game_Map.prototype.follow = function (target, speed) {
        this._camera.speed = speed || 0.9;
        if (target < 0) {
            this.target = $gamePlayer;
            return this.target;
        } else if (target > 0) {
            this.target = this.event(target)
            return this.target;
        }

    };

    Game_Map.prototype.character = function (target) {
        if (target < 0) {
            this.target = $gamePlayer;
            return this.target;
        } else if (target > 0) {
            this.target = this.event(target)
            return this.target;
        }
    }

    Game_Map.prototype.updateScroll = function () {
        if (this._camera) {

            if (this.target !== null) {
                this._camera.x = this.getCamPosX(this.target);
                this._camera.y = this.getCamPosY(this.target);
            } else {
                this._camera.x = this.getCamPosX($gamePlayer);
                this._camera.y = this.getCamPosY($gamePlayer);
            }

            // follow up event
            $.Viewport.follow(this._camera, {
                speed: this._camera.speed
            });
        }

    };

    Game_Map.prototype.getCamPosX = function (target) {
        return target.screenX ? target.screenX() : target.x;
    }

    Game_Map.prototype.getCamPosY = function (target) {
        return target.screenY ? target.screenY() : target.y;
    }

    Game_Map.prototype.updateEvents = function () {
        this.events().forEach(function (event) {
            event.update();
        });
        this._commonEvents.forEach(function (event) {
            event.update();
        });
    };

    Game_Map.prototype.adjustX = function (x) {
        if (this.isLoopHorizontal() && x < this._displayX -
            (this.width() - this.screenTileX()) / 2) {
            return x - this._displayX + $dataMap.width;
        } else {
            return x - this._displayX;
        }
    };

    Game_Map.prototype.adjustY = function (y) {
        if (this.isLoopVertical() && y < this._displayY -
            (this.height() - this.screenTileY()) / 2) {
            return y - this._displayY + $dataMap.height;
        } else {
            return y - this._displayY;
        }
    };

    Game_Map.prototype.deltaX = function (x1, x2) {
        var result = x1 - x2;
        if (this.isLoopHorizontal() && Math.abs(result) > this.width() / 2) {
            if (result < 0) {
                result += this.width();
            } else {
                result -= this.width();
            }
        }
        return result;
    };

    Game_Map.prototype.deltaY = function (y1, y2) {
        var result = y1 - y2;
        if (this.isLoopVertical() && Math.abs(result) > this.height() / 2) {
            if (result < 0) {
                result += this.height();
            } else {
                result -= this.height();
            }
        }
        return result;
    };

    Game_Map.prototype.xWithDirection = function (x, d) {
        return x + (d === 6 ? 1 : d === 4 ? -1 : 0);
    };

    Game_Map.prototype.yWithDirection = function (y, d) {
        return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
    };

    Game_Map.prototype.roundXWithDirection = function (x, d) {
        return this.roundX(x + (d === 6 ? 1 : d === 4 ? -1 : 0));
    };

    Game_Map.prototype.roundYWithDirection = function (y, d) {
        return this.roundY(y + (d === 2 ? 1 : d === 8 ? -1 : 0));
    };

    // ========================================================================
    /**
     * @function Game_Player
     * @description redraw of some functions
     */

    Game_Player.prototype.performTransfer = function () {
        if (this.isTransferring()) {
            this.setDirection(this._newDirection);
            print(this._newMapId, $gameMap.mapId())
            if (this._newMapId !== $gameMap.mapId() || this._needsMapReload) {
                $.map = $dataMapInfos[this._newMapId].name
                $.map_id = this._newMapId;
                $gameMap.setup(this._newMapId);
                //

                //
                this._needsMapReload = false;
                print($gamePlayer._x, $gamePlayer._y, 'before going on')
                print(Haya.Movement.collision, 'collision element dispose')
                
                SceneManager.goto(Loader_Map);
                this.refresh();
            }

            this.setPosition(this._newX, this._newY);
            print($gamePlayer._x, $gamePlayer._y, 'after going on')
            //this.refresh();
            this.clearTransferInfo();
        }
    };
    // ========================================================================
    Game_Screen.prototype.erasePicture = function(pictureId) {
        if (Array.isArray(pictureId)) {
            pictureId.forEach((id) => {
                var realPictureId = this.realPictureId(id);
                this._pictures[realPictureId] = null;
            })
            return;
        } else  {
            var realPictureId = this.realPictureId(pictureId);
            this._pictures[realPictureId] = null;
            return;
        }
        
    };
    // ========================================================================
    // ========================================================================
    Game_Interpreter.requestImages = function (list, commonList) {
        if (!list) return;

        list.forEach(function (command) {
            var params = command.parameters;
            switch (command.code) {
                // Show Text
                case 101:
                    ImageManager.requestFace(params[0]);
                    break;

                // Common Event
                case 117:
                    var commonEvent = $dataCommonEvents[params[0]];
                    if (commonEvent) {
                        if (!commonList) {
                            commonList = [];
                        }
                        if (!commonList.contains(params[0])) {
                            commonList.push(params[0]);
                            Game_Interpreter.requestImages(commonEvent.list, commonList);
                        }
                    }
                    break;

                // Change Party Member
                case 129:
                    var actor = $gameActors.actor(params[0]);
                    if (actor && params[1] === 0) {
                        var name = actor.characterName();
                        ImageManager.requestCharacter(name);
                    }
                    break;

                // Set Movement Route
                case 205:
                    if (params[1]) {
                        params[1].list.forEach(function (command) {
                            var params = command.parameters;
                            if (command.code === Game_Character.ROUTE_CHANGE_IMAGE) {
                                ImageManager.requestCharacter(params[0]);
                            }
                        });
                    }
                    break;

                // Show Animation, Show Battle Animation
                case 212: case 337:
                    if (params[1]) {
                        var animation = $dataAnimations[params[1]];
                        if (animation === undefined || animation === null) break;
                        var name1 = animation.animation1Name;
                        var name2 = animation.animation2Name;
                        var hue1 = animation.animation1Hue;
                        var hue2 = animation.animation2Hue;
                        ImageManager.requestAnimation(name1, hue1);
                        ImageManager.requestAnimation(name2, hue2);
                    }
                    break;

                // Change Player Followers
                case 216:
                    if (params[0] === 0) {
                        $gamePlayer.followers().forEach(function (follower) {
                            var name = follower.characterName();
                            ImageManager.requestCharacter(name);
                        });
                    }
                    break;

                // Show Picture
                case 231:
                    ImageManager.requestPicture(params[1]);
                    break;

                // Change Tileset
                case 282:
                    var tileset = $dataTilesets[params[0]];
                    tileset.tilesetNames.forEach(function (tilesetName) {
                        ImageManager.requestTileset(tilesetName);
                    });
                    break;

                // Change Battle Back
                case 283:
                    if ($gameParty.inBattle()) {
                        ImageManager.requestBattleback1(params[0]);
                        ImageManager.requestBattleback2(params[1]);
                    }
                    break;

                // Change Parallax
                case 284:
                    if (!$gameParty.inBattle()) {
                        ImageManager.requestParallax(params[0]);
                    }
                    break;

                // Change Actor Images
                case 322:
                    ImageManager.requestCharacter(params[1]);
                    ImageManager.requestFace(params[3]);
                    ImageManager.requestSvActor(params[5]);
                    break;

                // Change Vehicle Image
                case 323:
                    var vehicle = $gameMap.vehicle(params[0]);
                    if (vehicle) {
                        ImageManager.requestCharacter(params[1]);
                    }
                    break;

                // Enemy Transform
                case 336:
                    var enemy = $dataEnemies[params[1]];
                    var name = enemy.battlerName;
                    var hue = enemy.battlerHue;
                    if ($gameSystem.isSideView()) {
                        ImageManager.requestSvEnemy(name, hue);
                    } else {
                        ImageManager.requestEnemy(name, hue);
                    }
                    break;
            }
        });
    }
    // ========================================================================
    print("[HAYA MAP]", $);
})(Haya.Map);

Imported["haya-map"] = true;

/*

Tilemap.prototype._sortChildren = function() {
    this.children.sort(this._compareChildOrder.bind(this));
};


Tilemap.prototype._compareChildOrder = function(a, b) {
    if (a.z !== b.z) {
        return a.z - b.z;
    } else if (a.y !== b.y) {
        return a.y - b.y;
    } else {
        return a.spriteId - b.spriteId;
    }
};

*/