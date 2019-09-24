/**
 * @file [haya_map.js -> Haya - Map]
 * This plugin is under [Work in Progress], then any suggestion, 
 * feedback or some tips, it shall be welcome! Just send me a email :)
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @thanks to Jonforum! <for Pixi.Light tip>
 *         to ivanpopelyshev <PIXI display and light>
 *         to davidfig <PIXI viewport>
 * @version 0.2.6
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
 * @todo [] Weather Effects
 *          [] Rain effects 
 * =====================================================================
 * @description [log]
 *  @version 0.1.6
 *      code restructured 
 *  @version 0.1.7
 *      [] Sprite_Haya : class of Sprite that contains light support
 * as well other stuff
 *      [x] Loader_Map :
 *          [] animated load
 *          [x] load several sprite texture
 *  @version 0.2.0
 *       [x] code restructured 
 *  @version 0.2.1
 *      [x] Cutscene : tools to create a dynamic cutscenes
 *  @version 0.2.2
 *      [x] : a variable for the Scene_Map in which on the Loader_Map
 * catches the textures and already create the texture version
 *  @version 0.2.3
 *      [x] : Sprite_Light class for a better organization
 *          [x] : Pulse effect
 *          [] : Oscilation
 *  @version 0.2.4
 *      [x] : Howler Sound
 *  @version 0.2.5
 *      [x] : More option for Sprite setup
 *  @version 0.2.6
 *      [x] : BabylonJS
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Map = {};
/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.2.6] Haya Map
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

/**
 * @function Sprite_Light 
 * @classdesc This is a sprite class for the Light objects that 
 * are pictures
 */
function Sprite_Light() { this.initialize.apply(this, arguments); };
Sprite_Light.prototype = Object.create(Sprite_Light);
Sprite_Light.prototype.constructor = Sprite_Light;

/**
 * @function Pixi_Light 
 * @classdesc This is a sprite class for the Light objects that 
 * are pixi-light based
 */
function Pixi_Light() { this.initialize.apply(this, arguments); };
Pixi_Light.prototype = Object.create(Pixi_Light);
Pixi_Light.prototype.constructor = Pixi_Light;


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
    $.current = { texture: {}, sprite: [], spriteUpdate: [] };

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

    $.createSound = function (data) {
        data.autoplay = Haya.Utils.Object.hasProperty(data, "autoplay", true)
        data.volume = Haya.Utils.Object.hasProperty(data, "volume", 1)
        data.loop = Haya.Utils.Object.hasProperty(data, "loop", false)
        data.fadeIn = Haya.Utils.Object.hasProperty(data, "fadeIn", false)
        data.fadeOut = Haya.Utils.Object.hasProperty(data, "fadeOut", false)
        data.rate = Haya.Utils.Object.hasProperty(data, "rate", 1)
        data.id = Haya.Utils.Object.hasProperty(data, "id", 1)
        data.panning = Haya.Utils.Object.hasProperty(data, "panning", 0)
        data.pos = Haya.Utils.Object.hasProperty(data, "pos", [0, 0, 0])
        data.switch = Haya.Utils.Object.hasProperty(data, "switch", -1)
        data.time = Haya.Utils.Object.hasProperty(data, "time", "all")
        data.floor = Haya.Utils.Object.hasProperty(data, "floor", "base")
        data.kind = Haya.Utils.Object.hasProperty(data, "kind", "bgm")
        data.refDistance = Haya.Utils.Object.hasProperty(data, "refDistance", 100)
        data.rolloffFactor = Haya.Utils.Object.hasProperty(data, "rolloffFactor", 2.5)
        data.coneInnerAngle = Haya.Utils.Object.hasProperty(data, "coneInnerAngle", 360)
        data.coneOuterAngle = Haya.Utils.Object.hasProperty(data, "coneOuterAngle", 360)
        data.coneOuterGain = Haya.Utils.Object.hasProperty(data, "coneOuterGain", 1)
        data.maxDistance = Haya.Utils.Object.hasProperty(data, "maxDistance", 500)
        // preload
        data.pos = Array.isArray(data.pos) ? data.pos : [0, 0, 0];
        let sound = new Howl({
            src: Array.isArray(data.src) ? data.src : [data.src],
            autoplay: data.autoplay,
            volume: data.volume,
            loop: data.loop,
            rate: data.rate,
            panning: data.panning, //A value of -1.0 is all the way left and 1.0 is all the way right.
        })
        // other setup
        sound.haya = {
            switch: data.switch,
            time: data.time,
            floor: data.floor,
            kind: data.kind,
            radius: data.radius,
            name: data.name || String(data.src[0]).split("/").pop(),
            pos: new Haya.DMath.Vector3D(data.pos[0] || 0, data.pos[1] || 0, data.pos[2] || 0),
            _data: data
        }

        sound.pos(...sound.haya.pos.array())


        sound.pannerAttr({
            panningModel: 'HRTF',
            refDistance: data.refDistance,
            rolloffFactor: data.rolloffFactor,
            coneInnerAngle: data.coneInnerAngle,
            coneOuterAngle: data.coneOuterAngle,
            coneOuterGain: data.coneOuterGain,
            maxDistance: data.maxDistance
        })

        return sound;
    }

    /**
     * @function loadLibrary
     * @description load the library informations
     */
    function loadLibrary() {
        // get all directories info
        $.library.directory = {}
        // get the general directory path
        let dirList = Haya.File.dirList(Haya.File.local("img/maps"));
        // get all map and his directory path
        dirList.forEach((element) => {
            // record all except by editor stuffs
            if (!(element.match(/(editor|lights)$/gi))) {
                // get the map name
                let mapName = element.split(/\\|\//gi); mapName = mapName[mapName.length - 1];
                $.library.directory[mapName] = Haya.File.clean(element);
            }
        })
        // get the setup information file
        $.library.setup = Haya.File.json(Haya.File.local("img/maps/setup.json"));
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
        $.current.data = Haya.File.json(Haya.File.local(path + "/data.json"));
        $.current.name = $.map;
        $.current.id = $.map_id;
        $.current.width = $.current.data.width;
        $.current.height = $.current.data.height;
        $.current._local = Haya.File.local(path);

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
            $.current.sound = { data: $.current.data.sound, element: [], source: {} };
        } else { $.current.sound = { data: {}, element: [], source: {} } }

        // collision
        if ($.current.data.hasOwnProperty("collision")) {
            $.current.collisionData = $.current.data.collision;
        } else { $.current.collisionData = {} }

        // weather
        if ($.current.data.hasOwnProperty("weather")) {
            $.current.weather = $.current.data.weather;
        } else { $.current.weather = [] }

        // texture
        $.current.texture = { _baseTexture: [] };

        // layers
        const layers = Haya.File.json(Haya.File.local(path + "/layer.json"));
        $.current.layer = {};
        Object.keys(layers).map(key => {
            var element = layers[key]; $.current.layer[key] = element;
        })

        // source of picture & texture
        $.current.src = {};
        Haya.File.list(path + "/src", (filename) => {
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
                    info: $.current.layer[_infoL],
                    linfo: _infoL
                }
            }
        })

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

    $.htimeout = {value: 0, method: null}
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
        console.time("loader-map:create")
        Scene_Base.prototype.create.call(this);
        // load current information
        loadCurrent()
        // clean up sprites
        if ($.current.sprite.length > 0) {
            $.current.sprite.length = 0
        }

        if ($.current.spriteUpdate.length > 0) {
            $.current.spriteUpdate.length = 0
        };
        // load map data information
        DataManager.loadMapData($.map_id);
        $gamePlayer.refresh();
        // preload textures
        this.preloadTexture()
        // preload Sound
        this.preloadSound();
        console.timeEnd("loader-map:create")
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
                // last one texture
                let texture = $.current.texture._baseTexture[$.current.texture._baseTexture.length - 1];
                let sprite = $.loadSprite(texture[0], texture[1], texture[2])
                sprite._layerInfo = texture[3];
                //print(key,  value, sprite._layerInfo);
                sprite._layerInfo.floor = sprite._layerInfo.floor || "base"; 
                sprite.position.set(sprite._layerInfo.x, sprite._layerInfo.y)
                //
                sprite.floor = sprite._layerInfo.floor;
                sprite.alpha = sprite._layerInfo.alpha || 1;
                if (typeof sprite._layerInfo.blendMode === 'string') {
                    sprite._layerInfo.blendMode = sprite._layerInfo.blendMode.replace("BlendMode", "PIXI.BLEND_MODES");
                    sprite._layerInfo.blendMode = eval(sprite._layerInfo.blendMode);
                    sprite.children.map((sps) => sps.blendMode = eval(sprite._layerInfo.blendMode))
                } else if (typeof sprite._layerInfo.blendMode === 'number') {
                   sprite.children.map((sps) => sps.blendMode = (sprite._layerInfo.blendMode)) 
                }
                //
                sprite._layerInfo.opacity = sprite._layerInfo.opacity || false;
                //
                sprite.scale.set( sprite._layerInfo.scale_x || 1, sprite._layerInfo.scale_y || 1 )
                //
                sprite.rotation = Haya.DMath.degrees(sprite._layerInfo.rotation || 0); 
                //
                if (sprite._layerInfo.anchor_x)  sprite.anchor.x = sprite._layerInfo.anchor_x 
                if (sprite._layerInfo.anchor_y)  sprite.anchor.y = sprite._layerInfo.anchor_y 
                //
                sprite._spriteName = "map";
                sprite.linfo = value.linfo;
                //sprite.filterArea = sprite.getBounds();
                //sprite
                $.current.sprite.push(sprite);
                if (sprite._layerInfo.opacity === true) $.current.spriteUpdate.push(sprite);
            })
            print($.current.texture._baseTexture, 'current - base texture')
        }
    }

    Loader_Map.prototype.preloadSound = function () {
        if (Object.keys($.current.sound.data).length > 0) {
            Object.keys($.current.sound.data).map((key) => {
                var data = $.current.sound.data[key];
                // data itself
                var sound = $.createSound(data);
                // store at
                $.current.sound.element.push(sound);
                $.current.sound.source[sound.haya.name] = sound;
            })
        }
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
     * :sprite_light
     * @function Sprite_Light
     * @param {Object} [setup]
     * setup: {
     *  texture: [PIXI.Texture] if there is already a valid texture or if is 
     * a [String]
     *  blendMode: [PIXI.BLEND_MODES]
     * }
     */
    Sprite_Light.prototype.initialize = function (setup = {}, name = null) {
        // setup
        this._setup = setup;
        this._setup.blendMode = Haya.Utils.Object.hasProperty(this._setup, "blendMode", PIXI.BLEND_MODES.ADD)
        this._setup.alpha = Haya.Utils.Object.hasProperty(this._setup, "alpha", 1.0);
        this._setup.position = Haya.Utils.Object.hasProperty(this._setup, "position", "center");
        this._setup.switch = Haya.Utils.Object.hasProperty(this._setup, "switch", -1)
        this._setup.time = Haya.Utils.Object.hasProperty(this._setup, "time", "all")
        this._setup.floor = Haya.Utils.Object.hasProperty(this._setup, "floor", "base")
        this._setup.scale_x = Haya.Utils.Object.hasProperty(this._setup, "scale_x", 1.0);
        this._setup.scale_y = Haya.Utils.Object.hasProperty(this._setup, "scale_y", 1.0);
        this._setup.anchor_x = Haya.Utils.Object.hasProperty(this._setup, "anchor_x", 0);
        this._setup.anchor_y = Haya.Utils.Object.hasProperty(this._setup, "anchor_y", 0);
        this._setup.blendMode = Haya.Utils.Object.hasProperty(this._setup, "blendMode", 0);
        this._setup.tint = Haya.Utils.Object.hasProperty(this._setup, "tint", "0xFFFFFF");
        this._name = name || `light${Haya.DMath.randInt(1, 10000)}`;
        this._setup.nature = Haya.Utils.Object.hasProperty(this._setup, "nature", "static")
        this._setup.pulse = Haya.Utils.Object.hasProperty(this._setup, "pulse", {
            duration: 1, reverse: false, value: false, time: 1, speed: 0.1, min: 0.5, max: 1.0
        })

        this._setup.pulse.time = this._setup.pulse.duration * 60;
        this._setup.oscilation = Haya.Utils.Object.hasProperty(this._setup, "oscilation", {
            duration: 1, time: 0, speed: 0.1, value: false,
            min: 0.5, max: 1.0
        })
        this._setup.oscilation.time = this._setup.oscilation.duration * 60;
        this._setup.color = Haya.Utils.Object.hasProperty(this._setup, "color", "0xddc83a")
        // get texture
        if (typeof setup.texture === "string") {
            this.sprite = new PIXI.Sprite.fromImage(setup.texture);
        } else {
            this.sprite = new PIXI.Sprite.from(setup.texture);
        }
        this.sprite._self = this;
        this.sprite.color = "#ffffff"
        this.sprite.scale.set(this._setup.scale_x, this._setup.scale_y)
        this.sprite.anchor.set(this._setup.anchor_x, this._setup.anchor_y)
        this.sprite.blendMode = this._setup.blendMode || this.sprite.blendMode;

        this._setup.rotation = Haya.Utils.Object.hasProperty(this._setup, "rotation", this.sprite.rotation);

        this.sprite.rotation = this._setup.rotation;
        this.sprite.tint = this._setup.tint
        // refresh to setup
        this.refresh();
    }

    Sprite_Light.prototype.update = function () {
        if (this.time !== this.sprite.time) this.time = this.sprite.time;
        // is it everthing okay?
        if (this.isOkay() === false) {
            this.sprite.visible = false;
            return;
        }
        // check out the range of visibility
        // if it is a main componment or a ambient, the range don't affect
        if (this.kind.toLowerCase() === "main" || this.kind.toLowerCase() === "ambient" ||
            this.kind === "directional") {
            this.sprite.visible = true;
        } else {
            // range of visibility
            this.sprite.visible = this.atRange();
        }
        // check out the visibility
        if (this.sprite.visible === false) return;
        // [nature effect]
        if (this.pulse.value === true) this.pulseEffect();
        if (this.oscilation.value === true) this.oscilationEffect();
    }

    Sprite_Light.prototype.refresh = function () {
        //this.sprite.blendMode = this._setup.blendMode;
        this.sprite.alpha = this._setup.alpha;

        if (typeof this._setup.position === "string") {
            if (this._setup.position.toLowerCase() === "center-main") {
                this.sprite.position.set(
                    (-($.current.width / 2)),
                    (($.current.height / 2))
                )
            } else if (this._setup.position.toLowerCase() === "center") {
                this.sprite.position.set(
                    (($.current.width / 2)),
                    (($.current.height / 2))
                );
            }
        } else if (Array.isArray(this._setup.position)) {
            this.sprite.position.set(
                this._setup.position[0],
                this._setup.position[1] || this._setup.position[0]
            )
        }

        this.kind = "sprite";
        this.switch = this._setup.switch;
        this.sprite.time = this._setup.time;
        this.time = this._setup.time;
        this.blendMode = this._setup.blendMode;
        this.floor = this._setup.floor;
        //this.name = this._setup.name;
        this.nature = this._setup.nature;
        this.color = this._setup.color;
        this.pulse = this._setup.pulse;
        this.oscilation = this._setup.oscilation;
    }

    Sprite_Light.prototype.isOkay = function () {
        return (
            (this.switch !== -1 ? $gameSwitches.value(this.switch) : true) && 
            $.Time.period(this.time) &&
            this.floor === $gamePlayer.floor
        )
    }

    Sprite_Light.prototype.atRange = function (margin = 240) {
        return (
            (this.sprite.x.isBetween(
                -margin + ($.Viewport.x),
                (Graphics.width) + ($.Viewport.x + margin))
            ) &&
            (this.sprite.y.isBetween(
                -margin + (-$.Viewport.y),
                (Graphics.height) + (-$.Viewport.y + margin)
            ))
        )
    }

    Sprite_Light.prototype.pulseEffect = function () {

        if (this.pulse.time < 2) {
            this.pulse.reverse = !this.pulse.reverse;
            this.pulse.time = this.pulse.duration * 60;
        }

        if (this.pulse.reverse === true) {
            this.sprite.alpha += this.sprite.alpha = Haya.DMath.fincrease(
                this.sprite.alpha,
                this.pulse.min, this.pulse.max,
                1 - (this.pulse.speed * (this.pulse.time - 1)) / this.pulse.time
            )
            //this.sprite.alpha = Haya.DMath.fincrease(this.sprite.alpha, 0, 1.0, (this.pulse.speed * (this.pulse.time-1)) / this.pulse.time)
        } else {
            this.sprite.alpha = Haya.DMath.fdecrease(
                this.sprite.alpha,
                this.pulse.min, this.pulse.max,
                (this.pulse.speed * (this.pulse.time - 1)) / this.pulse.time
            )
        }

        this.pulse.time--;
    }

    Sprite_Light.prototype.oscilationEffect = function () {
        this.sprite.alpha = (this.oscilation.min * Math.sin(this.oscilation.time)) / this.oscilation.max;
        this.oscilation.time = (this.oscilation.time + this.oscilation.speed) % this.oscilation.duration
        // if (this.oscilation.time > 0) {
        //     this.oscilation.time -= this.oscilation.speed;
        // } else {
        //     this.oscilation.time = this.oscilation.duration;
        // }
        // amplitude * Math.sin(time)
    }

    /**
     * :pixi_light
     * @function Pixi_Light
     * @param {Object} [setup]
     * setup: {
     *  texture: [PIXI.Texture] if there is already a valid texture or if is 
     * a [String]
     *  blendMode: [PIXI.BLEND_MODES]
     * }
     */
    Pixi_Light.prototype.initialize = function (setup = {}, name = null) {
        // setup
        this._setup = setup;
        this._setup.blendMode = Haya.Utils.Object.hasProperty(this._setup, "blendMode", PIXI.BLEND_MODES.ADD)
        this._setup.alpha = Haya.Utils.Object.hasProperty(this._setup, "alpha", 1.0);
        this._setup.position = Haya.Utils.Object.hasProperty(this._setup, "position", "center");
        this._setup.switch = Haya.Utils.Object.hasProperty(this._setup, "switch", -1)
        this._setup.time = Haya.Utils.Object.hasProperty(this._setup, "time", "all")
        this._setup.floor = Haya.Utils.Object.hasProperty(this._setup, "floor", "base")
        this._name = name || `light${Haya.DMath.randInt(1, 10000)}`;
        this._setup.nature = Haya.Utils.Object.hasProperty(this._setup, "nature", "static")
        this._setup.kind = Haya.Utils.Object.hasProperty(this._setup, "kind", "point").toLowerCase();
        this._setup.radius = Haya.Utils.Object.hasProperty(this._setup, "radius", 300)
        this._setup.brightness = Haya.Utils.Object.hasProperty(this._setup, "brightness", 0.7)
        this._setup.pulse = Haya.Utils.Object.hasProperty(this._setup, "pulse", {
            duration: 1, reverse: false, value: false, time: 0, speed: 0.1, 
            min: this._setup.brightness / 2, max: this._setup.brightness
        })
        this._setup.pulse.time = this._setup.pulse.duration * 60;
        this._setup.oscilation = Haya.Utils.Object.hasProperty(this._setup, "oscilation", {
            duration: 1, time: 0, speed: 0.1,value: false,
            min: this._setup.brightness / 2, max: this._setup.brightness
        })
        this._setup.oscilation.time = this._setup.oscilation.duration * 60;
        this._setup.color = Haya.Utils.Object.hasProperty(this._setup, "color", "0xddc83a");
        this._setup.target = Haya.Utils.Object.hasProperty(this._setup, "target", new Point(0, 0))

        // set up the kind of light
        if (this._setup.kind === "ambient") {
            this.sprite = new PIXI.lights.AmbientLight(this._setup.color || "0xddc83a", this._setup.brightness)
        } else if (this._setup.kind === "directional") {
            this.sprite = new PIXI.lights.DirectionalLight(
                this._setup.color,
                this._setup.brightness, this._setup.target
            )
        } else {
            this.sprite = new PIXI.lights.PointLight(this._setup.color || "0xddc83a", this._setup.brightness || 0.6);
        }

        this.sprite._self = this;

        // parent Layer
        this.sprite.parentLayer = $.group._lightGroup;
        // refresh to setup
        this.refresh();
    }

    Pixi_Light.prototype.update = function () {
        if (this.time !== this.sprite.time) this.time = this.sprite.time;
        // is it everthing okay?
        if (this.isOkay() === false) {
            this.sprite.visible = false;
            return;
        }
        // check out the range of visibility
        // if it is a main componment or a ambient, the range don't affect
        if (this.kind.toLowerCase() === "main" || this.kind.toLowerCase() === "ambient" ||
            this.kind === "directional") {
            this.sprite.visible = true;
        } else {
            // range of visibility
            this.sprite.visible = this.atRange();
        }
        // check out the visibility
        if (this.sprite.visible === false) return;
        // [nature effect]
        if (this.pulse.value === true) this.pulseEffect();
        if (this.oscilation.value === true) this.oscilationEffect();
    }

    Pixi_Light.prototype.refresh = function () {
        //this.sprite.blendMode = this._setup.blendMode;
        this.sprite.alpha = this._setup.alpha;
        this.sprite.lightHeight = this._setup.lightHeight || this.sprite.lightHeight;
        this.sprite.falloff = this._setup.falloff || this.sprite.falloff;

        this.sprite.radius = this._setup.radius || 300;

        if (typeof this._setup.position === "string") {
            if (this._setup.position.toLowerCase() === "center-main") {
                this.sprite.position.set(
                    (-($.current.width / 2)),
                    (($.current.height / 2))
                )
            } else if (this._setup.position.toLowerCase() === "center") {
                this.sprite.position.set(
                    (($.current.width / 2)),
                    (($.current.height / 2))
                );
            }
        } else if (Array.isArray(this._setup.position)) {
            if (this._setup.position[0]) this.sprite.position.x = this._setup.position[0];
            if (this._setup.position[1]) this.sprite.position.y = this._setup.position[1];
        }


        this.kind = this._setup.kind;
        this.switch = this._setup.switch;
        this.sprite.time = this._setup.time;
        this.time = this._setup.time;
        this.floor = this._setup.floor || "base";
        this.nature = this._setup.nature;
        this.pulse = this._setup.pulse;
        this.oscilation = this._setup.oscilation;
    }

    Pixi_Light.prototype.isOkay = function () {
        return (
            (this.switch !== -1 ? $gameSwitches.value(this.switch) : true) && 
            $.Time.period(this.time) &&
            this.floor === $gamePlayer.floor
        )
    }

    Pixi_Light.prototype.atRange = function (margin = 240) {
        return (
            (this.sprite.x.isBetween(
                -margin + ($.Viewport.x),
                (Graphics.width) + ($.Viewport.x + margin))
            ) &&
            (this.sprite.y.isBetween(
                -margin + (-$.Viewport.y),
                (Graphics.height) + (-$.Viewport.y + margin)
            ))
        )
    }

    Pixi_Light.prototype.pulseEffect = function () {

        if (this.pulse.time < 2) {
            this.pulse.reverse = !this.pulse.reverse;
            this.pulse.time = this.pulse.duration * 60;
        }

        if (this.pulse.reverse === true) {
            this.sprite.brightness += this.sprite.alpha = Haya.DMath.fincrease(
                this.sprite.brightness,
                this.pulse.min, this.pulse.max,
                1 - ((this.pulse.speed * (this.pulse.time - 1)) / this.pulse.time)
            )
            //this.sprite.alpha = Haya.DMath.fincrease(this.sprite.alpha, 0, 1.0, (this.pulse.speed * (this.pulse.time-1)) / this.pulse.time)
        } else {
            this.sprite.brightness = this.sprite.alpha = Haya.DMath.fdecrease(
                this.sprite.brightness,
                this.pulse.min, this.pulse.max,
                (this.pulse.speed * (this.pulse.time - 1)) / this.pulse.time
            )
        }

        this.pulse.time--;
    }

    Pixi_Light.prototype.oscilationEffect = function () {
        this.sprite.brightness = (this.oscilation.min * Math.sin(this.oscilation.time)) / this.oscilation.max;
        this.oscilation.time = ((this.oscilation.time * 60) + this.oscilation.speed) % this.oscilation.duration
        // if (this.oscilation.time > 0) {
        //     this.oscilation.time -= this.oscilation.speed;
        // } else {
        //     this.oscilation.time = this.oscilation.duration;
        // }
        // amplitude * Math.sin(time)
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
            this._speed = 0.1; // 0.1
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
        this.light = { element: [], source: {}, _updateBuffer: 3, _max: 0 };

        this.particle = { source: {}, element: [] }
        this.particleBuffer = 1;

        this.sound = { element: [], source: {} }

        this.filter = { source: {}, element: [] };

        this._characters = [];

        this.display = new Point(0, 0);

        //
        

        // create
        this.create();

        // print
        print("[Sprite_Map]: ", this);
    }

    Sprite_Map.prototype.create = function () {
        console.time("sprite-map:create")
        // stage for almost all sprites

        // create the base
        this.createBaseSprite();

        // create babylon
        this.createBabylon()

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

        // create Weather
        this.createWeather();

        // create Sound
        this.sound.source = $.current.sound.source;
        this.sound.element = $.current.sound.element;
        this.sound.max = $.current.sound.element.length;

        this.refreshSprite();

        // print
        print("[Sprite_Map]:sprite ", this.sprite);

        console.timeEnd("sprite-map:create")
    }

    Sprite_Map.prototype.update = function () {
        $.Time.progress();
        this.updateCharacters();
        //this.sprite.updateTransform();

        // if (this.light._updateBuffer < 1) {

        //     this.light._updateBuffer = 90 //$.performaceValues()["buffer"]
        // } else { this.light._updateBuffer--; }
        this.light._max = this.light.element.length;
        this.updateLight()

        this.updateParticle()

        this.updateScreenSprites();

        this.updateSound();

        if (Haya.Weather.element.length > 0) {
            this.updateWeather()
        };

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
        if ($.current.sprite.length > 0) {
            this.sprite.addChild(...$.current.sprite)
        };
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
            this.addLight(value, item.kind, item, this.sprite)
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

    Sprite_Map.prototype.createWeather = function () {
        if ($.current.weather.length < 1) return false;
        let iweather = $.current.weather.length;
        while (iweather--) {
            var item = $.current.weather[iweather];
            this.addWeather(item.kind, item, this.sprite)
        }
    }

    Sprite_Map.prototype.createBabylon = function () {
        this.babylon = {
            canvas: document.getElementById('GameCanvas')
        }

        this.babylon.engine = new BABYLON.Engine(this.babylon.canvas, true, {preserveDrawingBuffer: true, stencil: true})

        this.babylon.scene = new BABYLON.Scene(this.babylon.engine);

        this.babylon.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 1.3, 20, new BABYLON.Vector3(0, 0, 0), this.babylon.scene);
        //this.babylon.camera.setTarget(BABYLON.Vector3.Zero());
        this.babylon.camera.wheelPrecision = 100;
        this.babylon.camera.attachControl(this.babylon.canvas, true);
    }

    Sprite_Map.prototype.updateLight = function () {
        let index = 0;
        for (; index < this.light._max; index++) {
            const element = this.light.element[index];
            if (element) {
                element.update();
            }
        }
    }

    Sprite_Map.prototype.updateSound = function () {
        // Howler.orientation(
        //     Math.cos($gamePlayer._direction),
        //     Math.sin($gamePlayer._direction),
        //     $gamePlayer.z,
        //     0, 1, 0
        // )
        Howler.pos($gamePlayer.x * 8, $gamePlayer.y * 8, $gamePlayer.z);

        let index = 0;
        for (; index < this.sound.max; index++) {
            var sound = this.sound.element[index];
            if (sound) {
                if (sound.playing()) {
                    if (($.Time.period(sound.haya._data.time)) === false) {
                        sound.stop()
                        continue;
                    } else if (sound.haya._data.switch > 1) {
                        if ($gameSwitches.value(sound.haya._data.switch) === false) {
                            sound.stop()
                            continue;
                        }
                    }
                } else {
                    if (sound.loop() === true) {
                        if (($.Time.period(sound.haya._data.time)) === true) {
                            sound.play()
                            continue;
                        } else if (sound.haya._data.switch > 1) {
                            if ($gameSwitches.value(sound.haya._data.switch) === true) {
                                sound.play()
                                continue;
                            }
                        }
                    }
                }
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

    Sprite_Map.prototype.updateSprite = function () {
        if ($.current.spriteUpdate.length < 1) return;
        $.current.spriteUpdate.map((sprite) => {
            if (sprite.opacity === true) {
                sprite.alpha = (
                    (sprite.x.isBetween($gamePlayer._collision.body.x, $gamePlayer._collision.body.x+30)) &&
                    (sprite.x.isBetween($gamePlayer._collision.body.x, $gamePlayer._collision.body.x+30))
                )
            }
        })
    }

    Sprite_Map.prototype.updateWeather = function () {
        let index = 0;
        for (; index < Haya.Weather.element.length; index++) {
            const element = Haya.Weather.element[index];
            if (element) {
                element.update();
            }
        }
    }

    Sprite_Map.prototype.addLight = function (name, type, setup = {}, addch = this.sprite) {
        // create
        if (type === "sprite") {
            setup.texture = typeof setup.url === "string" ? setup.url : setup.texture
            this._light = new Sprite_Light(setup, name)
        } else {
            this._light = new Pixi_Light(setup, name)
        }

        // into child and screen
        this._light._stage = addch;
        addch.addChild(this._light.sprite);

        this.light.source[name] = this._light;
        this.light.element.push(this._light);

        print(this._light);
    }

    Sprite_Map.prototype.removeLight = function (name) {
        if (this.light.source.hasOwnProperty(name)) {
            this.light.source[name]._stage.removeChild(this.light.source[name].sprite)
            var copy = [];
            this.light.element.forEach((value, index) => {
                if (value.name !== name) {
                    copy.push(value)
                }
            })
            this.light.element = copy
            delete this.light.source[name];
        }
    }

    Sprite_Map.prototype.removeParticle = function (name) {
        if (this.particle.source.hasOwnProperty(name)) {
            this.particle.source[name].parent.removeChild(this.particle.source[name]);
            var copy = []
            this.particle.element.forEach((value, index) => {
                if (value.name !== name) {
                    copy.push(value)
                }
            })
            this.particle.element = copy
            delete this.particle.source[name];
        }
    }

    Sprite_Map.prototype.addSound = function (data) {

        var sound = $.createSound(data);

        $.current.sound.element.push(sound);
        $.current.sound.source[sound.haya.name] = sound;

        this.sound.source = $.current.sound.source;
        this.sound.element = $.current.sound.element;
        this.sound.max = $.current.sound.element.length;
    }

    Sprite_Map.prototype.removeSound = function (name) {
        if ($.current.sound.source.hasOwnProperty(name)) {
            var copy = [];
            $.current.sound.element.map((value, index) => {
                if (value.haya.name !== name) {
                    copy.push(value);
                } else { value.unload() }
            })
            $.current.sound.element = copy;
            delete $.current.sound.source[name];

            this.sound.source = $.current.sound.source;
            this.sound.element = $.current.sound.element;
            this.sound.max = $.current.sound.element.length;
        }
    }

    Sprite_Map.prototype.refreshSprite = function () {
        let index = $.current.sprite.length;
        while (index--) {
            var element = $.current.sprite[index];
            // floor
            if ($gamePlayer.floor === "all") {
                element.visible = true
            } else {
                element.visible = element.floor.toLowerCase() === $gamePlayer.floor.toLowerCase()
            }
        }
    }

    Sprite_Map.prototype.addWeather = function (kind, setup={}, stage=this.sprite) {
        var weather;
        if (kind === "fog") {
            weather = new Haya.Weather.Fog(setup, babylon=this.babylon);
            weather.id = Haya.Weather.element.length++;
        } else if (kind === "rain") {

        } else {
            return;
        }

        //
        Haya.Weather.element.push(weather)
        stage.addChild(weather)
    }

    Sprite_Map.prototype.removeWeather = function (id) {
        if (Haya.Weather.element[id]) {
            var copy = [];
            Haya.Weather.element.map((value, index) => {
                if (value.id !== id) {
                    copy.push(value);
                } else { value.clear() }
            })
            Haya.Weather.element = copy;
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
        console.time("scene-map | until all creation")
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

        console.timeEnd("scene-map | after all creation")

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
    Game_Screen.prototype.erasePicture = function (pictureId) {
        if (Array.isArray(pictureId)) {
            pictureId.forEach((id) => {
                var realPictureId = this.realPictureId(id);
                this._pictures[realPictureId] = null;
            })
            return;
        } else {
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
// ========================================================================

/*
[WORKFLOW]:
    ** The process until the map
    (Loader Process Scene: Load all the textures, sounds and assets) ->
        (Create Objects on Map) ->
        (Update Objects) <->
        (Delete Objects) ->
    (Loader Process Scene)
*/

// ========================================================================

/**
 * @field [Filename on Layers from Pictures]
 *
 * @field [Prefix] like G_Street.png <> !G_Street.png
 * @var [!] : indicates that the picture will be a normal map texture
 * @var [B_] : indicates that the Z-Index will be at the background level
 * the lowest
 * @var [G_] : indicates that the Z-Index will be at the ground level
 * @var [M_] : indicates that will be at the same z-index in which
 * the player and npc/object:interaction stay at
 * @var [SM_] : indicates that will be above that the z-index of the
 * interaction
 * @var [H_] : indicates that will be at the high z-index
 * @var [SH_] : indicates that will be at the highest z-index
 *
 * @field [Sufix] : you can merge differnt kind of sufix at:
 *  H_Test.F1S.AH.png, H_Test.F2S.AH.png
 * @var [.F(X)(S|N|F)] : the file need to be with the same for all
 *  .F -> show that the picture is a framered picture, in which
 * should be animated
 *  (X) -> the index of the frame
 *  (S|N|F) -> the speed in which it will be animated, can be:
 *      S:Slow | N:Normal | F:Fast
 *      The Default is the Normal, so you don't need to configure at all,
 *      and you just need to configure on the first one.
 *  Example:
 *      G_Water.F1S.png, G_Water.F2.png, G_Water.F3.png
 * @var [.AH] : indicates that if this picture is above the player
 * it will be turned transparent.
 *  H_Roof.AH.png
 * @var [.SW(X)] : show up this picture only when the switch
 * of ID (X) is turned ON
 * @var [.ID(X)] : this is for the sake of doing label
 * on the files. Then, if you wish to, for example, not show
 * all the pictures with the same ID, just take the command
 * and use the ID. The Default ID for all picture is null/0
 *
 */

// ========================================================================

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