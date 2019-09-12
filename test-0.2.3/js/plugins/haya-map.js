'use strict';
/**
 * @file [haya_map.js -> Haya - Map]
 * This plugin is under [Work in Progress], then any suggestion, 
 * feedback or some tips, it shall be welcome! Just send me a email :)
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @thanks to Jonforum! <for Pixi.Light tips>
 *         to ivanpopelyshev <PIXI display and light>
 *         to davidfig <PIXI viewport>
 * @version 0.2.7
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
 *      [] : BabylonJS
 *  @version 0.2.7
 *      [x] : Better Code
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Map = {};
/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.2.7] Haya Map
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
function Sprite_Map() {
    this.initialize.apply(this, arguments);
};
Sprite_Map.prototype = Object.create(Sprite_Map);
Sprite_Map.prototype.constructor = Sprite_Map;

/**
 * @function Loader_Map
 * @classdesc Pre load all textures before to start the new
 * map, this way the perfomance will be better
 */
function Loader_Map() {
    this.initialize.apply(this, arguments);
};
Loader_Map.prototype = Object.create(Scene_Base.prototype);
Loader_Map.prototype.constructor = Loader_Map;

/**
 * @function Sprite_Light 
 * @classdesc This is a sprite class for the Light objects that 
 * are pictures
 */
function Sprite_Light() {
    this.initialize.apply(this, arguments);
};
Sprite_Light.prototype = Object.create(Sprite_Light);
Sprite_Light.prototype.constructor = Sprite_Light;

/**
 * @function Pixi_Light 
 * @classdesc This is a sprite class for the Light objects that 
 * are pixi-light based
 */
function Pixi_Light() {
    this.initialize.apply(this, arguments);
};
Pixi_Light.prototype = Object.create(Pixi_Light);
Pixi_Light.prototype.constructor = Pixi_Light;

/**
 * @description general setup
 */
(function ($) {
    // ========================================================================
    // | [@routes]
    // ========================================================================
    Route.group(instance => {
        // map files
        instance.set('map', Routes.Game.plug('img', 'maps'))
        instance.join('editor', 'map')
    }).namespace('Map')

    // ========================================================================
    // | [@variables]
    // ========================================================================

    /**
     * @description control the scene to go after the map loads
     * @type {String}
     */
    $.scene = Scene_Map;

    /**
     * @description check up if the map has been loaded or not
     * @type {Boolean}
     */
    $._loaded = false;

    /**
     * @description control the id of the map name. Use it to load maps
     * with the id. Give the current id of the map name.
     * @type {String}
     */
    $.map = 'shop'

    /**
     * @description control the map id. 
     * @type {Number}
     */
    $.map_id = -1;

    // starting?
    $.isStarting = true;

    /**
     * @description handle with the current map data
     * @type {Object}
     */
    $.current = {
        texture: {},
        sprite: [],
        spriteUpdate: []
    };

    /**
     * @description handle with the libray (data) of all maps
     * @type {Object}
     */
    $.library = {};

    /**
     * @description  handle with layers and priorities (depth)
     * @type {Object}
     */
    $.group = {};

    /**
     * @description handle with the performace of overall effects
     * @type {String}
     */
    $._performace = "medium";

    /**
     * @description to control time expire out
     * @type {Object}
     */
    $.htimeout = {
        value: 0,
        method: null
    }

    // ========================================================================
    // | [@methods]
    // ========================================================================
    /**
     * @function performaceValues
     * @description return to some datas following the performace setting
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
        })[$._performace]
    }

    /**
     * @function csound
     * @description creates a sound following the Howl class methods
     * @param {Object} data information about the sound
     * @returns {Howl}
     */
    $.csound = function (data) {
        var element = new HowlSound(data);
        return element;
    }

    /**
     * @class HowlSound
     * @description create a Howl class with the sound configured
     */
    class HowlSound {
        /**
         * @constructor 
         * @param {Object} [data] 
         */
        constructor(data) {
            this.sound = null;
            this.data = data;
            this.configure();
            this.create();
            return this.sound;
        }
        /**
         * @method configure 
         * @description configure the default values
         */
        configure() {
            // create default values
            this.data = Object.assign({
                autoplay: true,
                volume: 1,
                loop: false,
                fadeIn: false,
                fadeOut: false,
                rate: 1,
                id: 1,
                panning: 0,
                pos: [0, 0, 0],
                switch: -1,
                time: 'all',
                floor: 'base',
                kind: 'bgm',
                refDistance: 100,
                rolloffFactor: 2.5,
                coneInnerAngle: 6.2,
                coneOuterAngle: 6.2,
                coneOuterGain: 1,
                maxDistance: 500
            }, this.data)
            // chain
            return this;
        }
        /**
         * @method create 
         * @description create the sound 
         */
        create() {
            // class Howl
            this.sound = new Howl({
                src: Array.isArray(this.data.src) ? this.data.src : [this.data.src],
                autoplay: this.data.autoplay,
                volume: this.data.volume,
                loop: this.data.loop,
                rate: this.data.rate,
                panning: this.data.panning, //A value of -1.0 is all the way left and 1.0 is all the way right.
            })
            // settings to editor
            this.sound.editor = {
                switch: this.data.switch,
                time: this.data.time,
                floor: this.data.floor,
                kind: this.data.kind,
                radius: this.data.radius,
                name: this.data.name || String(this.data.src[0]).split("/").pop(),
                pos: new Haya.DMath.Vector3D(this.data.pos[0] || 0, this.data.pos[1] || 0, this.data.pos[2] || 0),
                _data: this.data
            }
            // position
            this.sound.pos(...this.sound.editor.pos.array())
            // panner
            // chain
            return this;
        }
        /**
         * @method sound 
         * @description return to the sound variable
         */
        sound() {
            return this.sound;
        }
        /**
         * @method editor 
         * @description return to the values to editor
         */
        editor() {
            return this.sound.editor;
        }
    }

    $.sound_setPannerAttr = function (sound) {
        sound.pannerAttr({
            panningModel: 'HRTF',
            refDistance: sound.editor._data.refDistance,
            rolloffFactor: sound.editor._data.rolloffFactor,
            coneInnerAngle: sound.editor._data.coneInnerAngle,
            coneOuterAngle: sound.editor._data.coneOuterAngle,
            coneOuterGain: sound.editor._data.coneOuterGain,
            maxDistance: sound.editor._data.maxDistance
        })
    }

    /**
     * @function loadLibrary
     * @description load the libraries data informations
     */
    async function loadLibrary() {
        // get all directories info
        $.library.directory = {}
        // each directory

        Routes.Map.folders('map').map(folder => {
            console.log(folder);
            
            $.library.directory[folder.name] = folder.path;
        })

        // get the setup information file
        $.library.setup = Haya.File.json(Routes.Map.plug('map', 'setup.json'))

        $.library.mapInfo = Haya.File.json(Haya.File.local("data/MapInfos.json"));

        $.library.mapInfo = $.library.mapInfo.filter(el => !Haya.Utils.invalid(el));
    }

    /**
     * @function cload
     * @description loads the current map data
     */
    $.cload = function () {
        // return false if the map doesn't exist
        if (!($.library.directory.hasOwnProperty($.map))) {
            console.error(String($.map) + "\nThis map doesn't exist!\nMake sure that this name is the correct one!");
            return false;
        }

        // set the current pathname
        Routes.Map.setItem('current-path', Routes.Map.plug('map', $.map))
        Routes.Map.join($.map, 'map');
        Routes.Map.join('src', $.map);

        // general information && setup
        $.current.data = Haya.File.json(Routes.Map.plug($.map, 'data.json'));
        $.current.name = $.map;
        $.current.id = $.map_id;
        $.current.width = $.current.data.width;
        $.current.height = $.current.data.height;
        $.current._local = Routes.Map.get($.map).path;

        // setup lights
        if ($.current.data.hasOwnProperty("light") && (Object.keys($.current.data.light)).length > 0) {
            $.current.light = $.current.data.light;
        } else {
            $.current.light = $.library.setup.light.default
        }

        // particle
        if ($.current.data.hasOwnProperty("particle")) {
            $.current.particle = $.current.data.particle;
        } else {
            $.current.particle = {}
        }

        // filter
        if ($.current.data.hasOwnProperty("filter")) {
            $.current.filter = $.current.data.filter;
        } else {
            $.current.filter = {}
        }

        // sound
        if ($.current.data.hasOwnProperty("sound")) {
            $.current.sound = {
                data: $.current.data.sound,
                element: [],
                source: {}
            };
        } else {
            $.current.sound = {
                data: {},
                element: [],
                source: {}
            }
        }

        // collision
        if ($.current.data.hasOwnProperty("collision")) {
            $.current.collisionData = $.current.data.collision;
        } else {
            $.current.collisionData = {}
        }

        // weather
        if ($.current.data.hasOwnProperty("weather")) {
            $.current.weather = $.current.data.weather;
        } else {
            $.current.weather = []
        }

        // texture
        $.current.texture = {
            _baseTexture: []
        };

        // layers
        const layers = Haya.File.json(Routes.Map.plug($.map, 'layer.json'));
        $.current.layer = {};
        Object.keys(layers).map(key => {
            var element = layers[key];
            $.current.layer[key] = element;
        })

        // source of picture & texture
        $.current.src = {};
        Routes.Map.files('src', 'png|jpg').map(file => {
            // if it includes '!'
            if (/^\!/gi.test(file.name)) return;
            // get texture
            let texture = file.name;
            // header element
            var head = '';

            file.name.replace(/^(\H|\M|\G|\SM)\_?/gi, (reg) => {
                head = reg
            })

            // label
            var label = 'M';

            // backstage
            if (file.name.includes("B_")) label = "background";
            if (file.name.includes("G_")) label = "ground";
            // middlestage
            if (file.name.includes("M_") || file.name.includes("O_")) label = "middle";
            if (file.name.includes("SM_")) label = "smiddle";
            // highstage
            if (file.name.includes("H_") || file.name.includes("U_")) label = "upper";
            if (file.name.includes("SH_") || file.name.includes("SU_")) label = "supper";

            // right texture name
            texture = texture.replace(head, "");
            texture = texture.replace(/\-/gmi, " ");

            // information 
            let info = `${head}${texture}`

            // shalow
            $.current.src[texture] = {
                filename: file.filename,
                filepath: file.path,
                extension: file.extension,
                texture: texture,
                label: label,
                info: $.current.layer[info],
                linfo: info
            }
        })

        // print
        //print($.current, 'current source')
    }

    /**
     * @class OrderGroup
     * @description define the group order
     */
    class OrderGroup {
        /**
         * @constructor
         */
        constructor() {
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
        }
    };
    $.group = new OrderGroup();

    /**
     * @function spritel 
     * @description load the sprite texture in normal && diffuse
     */
    $.spritel = function (diffuseTexture, normalTexture, zIndex, callback, hash) {
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

    /**
     * @function loaded
     * @description check out if the map is already loaded
     */
    $.loaded = () => {
        return ($._loaded === true)
    }

    // ========================================================================
    print("[HAYA MAP]", $);
    // ========================================================================
    // [@execute]
    // self execute some methods
    // ========================================================================
    Promise.resolve()
        .then(loadLibrary);
})(Haya.Map);

/**
 * :scene_base
 * @function Scene_Base.initialize
 * @description insert on the child of the current scene, the groups of 
 * light layers
 */
void

function () {
    Scene_Base.prototype.initialize = function () {
        Stage.prototype.initialize.call(this);
        this._active = false;
        this._fadeSign = 0;
        this._fadeDuration = 0;
        this._fadeSprite = null;
        this._imageReservationId = Utils.generateRuntimeId();
        // create light layer
        this.addChild(
            Haya.Map.group._diffuseBlackSprite,
            Haya.Map.group._diffuseGroup,
            Haya.Map.group._normalGroup,
            Haya.Map.group._lightGroup
        )
    };
}();

/**
 * :loader_map
 * @class Loader_Map
 * @description preload all textures and stuff from maps before start
 */
void

function ($) {
    /**
     * @method start 
     * @description start out the scene
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
        // time to checkout
        this._timeInterval = 250;
        this._isDone = false;
        // reset
        $._loaded = false;
    }
    /**
     * @method create 
     * @description create objects to display over screen
     */
    Loader_Map.prototype.create = async function () {
        console.time("loader-map:create")

        Scene_Base.prototype.create.call(this);
        // load current information
        $.cload();

        // clean up sprites
        if ($.current.sprite.length > 0) $.current.sprite.length = 0
        if ($.current.spriteUpdate.length > 0) $.current.spriteUpdate.length = 0

        // load map data information
        DataManager.loadMapData($.map_id);
        $gamePlayer.refresh();

        // create loading
        this.create_loading();

        // preload textures
        await this.preloadTexture()
        // preload Sound
        await this.preloadSound();

        console.timeEnd("loader-map:create")
    }

    /**
     * @method create_loading
     * Create the gif loading animation
     */
    Loader_Map.prototype.create_loading = function () {
        El.Attr(El.create('img', document.body), {
            id: 'loader-map-loading',
            src: Routes.Map.plug('editor', 'loading.gif'),
            style: `
                z-index: 1000 !important;
                display: block;
                position: fixed;
                transform: translate(-50%, -50%);
                left: 3em;
                bottom: 1em;
                width: 48px;
                object-fit: cover;
            `
        })
    }

    /**
     * @method preloadTexture
     * @description preload all textures
     */
    Loader_Map.prototype.preloadTexture = async function () {
        // it does have textures to load? 
        if (Object.keys($.current.src).length < 1) return false;

        // loads
        await Promise.all(Object.keys($.current.src).map(key => {
            // element
            var value = $.current.src[key];
            // load base textures
            $.current.texture._baseTexture.push([
                new PIXI.Texture.fromImage(value.filepath),
                new PIXI.Texture.fromImage(`${$.current._local}/src/!${value.filename}`),
                $.group.layer[value.label],
                value.info
            ])
            // get the last texture
            var texture = $.current.texture._baseTexture[$.current.texture._baseTexture.length - 1];

            /**
             * @description sprite configuration
             */
            var sprite = $.spritel(texture[0], texture[1], texture[2]);

            sprite._layerInfo = texture[3];
            sprite._layerInfo.floor = sprite._layerInfo.floor || "base";
            sprite.position.set(sprite._layerInfo.x || 0, sprite._layerInfo.y || 0)
            sprite.floor = sprite._layerInfo.floor;
            sprite.alpha = sprite._layerInfo.alpha || 1;

            if (typeof sprite._layerInfo.blendMode === 'string') {
                sprite._layerInfo.blendMode = sprite._layerInfo.blendMode.replace("BlendMode", "PIXI.BLEND_MODES");
                sprite._layerInfo.blendMode = eval(sprite._layerInfo.blendMode);
                sprite.children.map((sps) => sps.blendMode = eval(sprite._layerInfo.blendMode))
            } else if (typeof sprite._layerInfo.blendMode === 'number') {
                sprite.children.map((sps) => sps.blendMode = (sprite._layerInfo.blendMode))
            }

            sprite._layerInfo.opacity = sprite._layerInfo.opacity || false;
            sprite.scale.set(sprite._layerInfo.scale_x || 1, sprite._layerInfo.scale_y || 1)
            sprite.rotation = Haya.DMath.degrees(sprite._layerInfo.rotation || 0);
            if (sprite._layerInfo.anchor_x) sprite.anchor.x = sprite._layerInfo.anchor_x
            if (sprite._layerInfo.anchor_y) sprite.anchor.y = sprite._layerInfo.anchor_y
            sprite._spriteName = "map";
            sprite.linfo = value.linfo;
            $.current.sprite.push(sprite);
            if (sprite._layerInfo.opacity === true) $.current.spriteUpdate.push(sprite);

        }))

        //print($.current.texture._baseTexture, 'current - base texture')

        // return
        return true;
    }
    /**
     * @method preloadSound
     * @description preload all sounds
     */
    Loader_Map.prototype.preloadSound = async function () {
        // it does have sounds to load?
        if (Object.keys($.current.sound.data).length < 1) return false;

        // loads
        await Promise.all(Object.keys($.current.sound.data).map(async key => {
            // data
            var data = $.current.sound.data[key];
            // create the sound
            var sound = $.csound(data);
            // store
            $.current.sound.element.push(sound);
            $.current.sound.source[sound.editor.name] = sound;
        }))

        // okay?
        return true;
    }
    /**
     * @method update 
     * @description stay on this screen until preload every texture
     */
    Loader_Map.prototype.update = function () {
        Scene_Base.prototype.update.call(this);

        if (this._isDone === true) return;

        // already preload everything?
        if (this._uploaded === true) {
            this.finish();
        }

        //check out on each interval
        this._checkoutInterval = setInterval(() => {
            // reset 
            this._loaded.length = 0;
            // check if the there isn't texture to check
            if ($.current.texture._baseTexture.length < 1) {
                this._uploaded = true;
            } else {
                // $.current.texture._baseTexture.forEach((value) => {
                //     this._loaded.push(value[1].valid);
                // })
                this._loaded = $.current.texture._baseTexture.filter(value => (value[1].valid === false)) //.length < 1;
            }
            // everthing is loaded?
            this._uploaded = this._loaded.length < 1; //Haya.Utils.Array.isTrue(this._loaded)
        }, this._timeInterval)

    }

    Loader_Map.prototype.finish = function () {
        this._isDone = true;
        // create viewport
        $.Viewport = new PIXI.extras.Viewport({
            screenWidth: Graphics.width,
            screenHeight: Graphics.height,
            worldWidth: $.current.width || Graphics.width,
            worldHeight: $.current.height || Graphics.height
        })



        // confirm that everything was loaded
        $._loaded = true;

        // setup the game map
        $gameMap.setup($.map_id)

        //console.log($gameMap, $gamePlayer);
        //$gamePlayer.reserveTransfer($.map_id, $gamePlayer.x, $gamePlayer.y, $gamePlayer._direction)

        setTimeout(() => {
            // go to scene
            document.body.removeChild(El.id('loader-map-loading'))

            if ($.isStarting === true) {
                $gamePlayer.performTransfer();
                $.isStarting = false;
            } else {
                SceneManager.goto($.scene)
            }

            // SceneManager.goto($.scene)
        }, 60)
    }
}(Haya.Map);

/**
 * :sprite_light
 * @class Sprite_Light
 * @description create a sprite light object using PIXI.Sprite
 */
void

function ($) {
    /**
     * @method initialize
     * @description starts out the creation
     * @param {Object} [setup] settings of the light itself
     * @param {String} [name] to a named light source    
     * @returns {this}
     */
    Sprite_Light.prototype.initialize = function (setup = {}, name = null) {
        // configure the data
        this._setup = setup;
        this._name = name || `light${Haya.DMath.randInt(1, 10000)}`;
        this.configure();
        // refresh the light
        this.refresh();

        //print('sprite_light', this)
        return this;
    }
    /**
     * @method configure 
     * @description configure the data object
     */
    Sprite_Light.prototype.configure = function () {
        // default values;
        this._setup = Object.assign({
            blendMode: PIXI.BLEND_MODES.ADD,
            alpha: 1.0,
            position: 'center',
            switch: -1,
            time: 'all',
            floor: 'base',
            scale_x: 1.0,
            scale_y: 1.0,
            anchor_x: 0,
            anchor_y: 0,
            color: '0xddc83a',
            nature: 'static',
            pulse: {
                duration: 1,
                reverse: false,
                value: false,
                time: 1,
                speed: 0.1,
                min: 0.5,
                max: 1.0
            },
            oscilation: {
                duration: 1,
                time: 0,
                speed: 0.1,
                value: false,
                min: 0.5,
                max: 1.0
            }
        }, this._setup);

        // get texture
        if (typeof this._setup.texture === "string") {
            this.sprite = new PIXI.Sprite.fromImage(this._setup.texture);
        } else {
            this.sprite = new PIXI.Sprite.from(this._setup.texture);
        }

        // related values
        this._setup.tint = this._setup.color;
        this._setup.oscilation.time = this._setup.oscilation.duration * 60;

        // sprite
        this.sprite._self = this;
        this.sprite.color = this._setup.tint;
        this.sprite.scale.set(this._setup.scale_x, this._setup.scale_y)
        this.sprite.anchor.set(this._setup.anchor_x, this._setup.anchor_y)
        this.sprite.blendMode = this._setup.blendMode;
        Haya.Utils.Object.hasProperty(this._setup, "rotation", this.sprite.rotation);
        this.sprite.rotation = this._setup.rotation;
        this.sprite.tint = this._setup.tint
        this.sprite.rgb = Haya.Utils.Color.hexRgb(this.sprite.tint);

        // chain
        return this;
    }
    /**
     * @method refresh
     * @description refresh the values
     */
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

        return this;
    }
    /**
     * @method update 
     * @description update the light on screen
     */
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
    /**
     * @method isOkay
     * @description check if the light is available for use
     */
    Sprite_Light.prototype.isOkay = function () {
        return (
            (this.switch !== -1 ? $gameSwitches.value(this.switch) : true) &&
            $.Time.period(this.time) &&
            this.floor === $gamePlayer.floor
        )
    }
    /**
     * @method atRange
     * @description check out if the light is on the screen range
     * @param {Number} [margin=240]
     */
    Sprite_Light.prototype.atRange = function (margin = 240) {
        return (
            (this.sprite.x.isBetween(
                -margin + ($.Viewport.x),
                (Graphics.width) + ($.Viewport.x + margin))) &&
            (this.sprite.y.isBetween(
                -margin + (-$.Viewport.y),
                (Graphics.height) + (-$.Viewport.y + margin)
            ))
        )
    }
    /**
     * @method pulseEffect
     * @description effect of pulsing
     */
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
    /**
     * @method oscilationEffect
     * @description effect of oscilation
     */
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
     * @method urgb
     * @description converts the rgb color to hex
     */
    Sprite_Light.prototype.urgb = function () {
        this.sprite.color = Haya.Utils.Color.rgbHex(
            this.sprite.rgb.red,
            this.sprite.rgb.green,
            this.sprite.rgb.blue
        );
        this.sprite.tint = this.sprite.color;
    }
}(Haya.Map);

/**
 * :pixi_light
 * @class Pixi_Light
 * @description create a sprite light object using PIXI.lights
 */
void

function ($) {
    /**
     * @method initialize
     * @description initialize the instance
     * @param {Object} setup 
     * @param {String} name 
     * @returns {ThisType};
     */
    Pixi_Light.prototype.initialize = function (setup = {}, name = null) {
        // configure
        this._setup = setup;
        this._name = name || `light${Haya.DMath.randInt(1, 10000)}`;
        this.configure();
        // refresh
        this.refresh();
        // return
        return this;
    }
    /**
     * @method update 
     * @description update the object over screen
     */
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
    /**
     * @method configure 
     * @description configure the data
     */
    Pixi_Light.prototype.configure = function () {
        // default values
        this._setup = Object.assign({
            blendMode: PIXI.BLEND_MODES.ADD,
            alpha: 1.0,
            position: 'center',
            switch: -1,
            time: 'all',
            floor: 'base',
            nature: 'static',
            kind: 'point',
            radius: 300,
            brightness: 0.7,
            pulse: {
                duration: 1,
                reverse: false,
                value: false,
                time: 0,
                speed: 0.1
            },
            oscilation: {
                duration: 1,
                time: 0,
                speed: 0.1,
                value: false
            },
            color: "0xddc83a",
            target: new Haya.DMath.Vector2D(0, 0)
        }, this._setup);

        // related values
        Haya.Utils.Object.hasProperty(this._setup.pulse, 'min', this._setup.brightness / 2);
        Haya.Utils.Object.hasProperty(this._setup.pulse, 'max', this._setup.brightness);
        this._setup.pulse.time = this._setup.pulse.duration * 60;
        Haya.Utils.Object.hasProperty(this._setup.oscilation, 'min', this._setup.brightness / 2);
        Haya.Utils.Object.hasProperty(this._setup.oscilation, 'max', this._setup.brightness);
        this._setup.oscilation.time = this._setup.oscilation.duration * 60;

        // set up the kind of light
        if (this._setup.kind === "ambient") {
            this.sprite = new PIXI.lights.AmbientLight(
                this._setup.color,
                this._setup.brightness
            )
        } else if (this._setup.kind === "directional") {
            this.sprite = new PIXI.lights.DirectionalLight(
                this._setup.color,
                this._setup.brightness,
                this._setup.target
            )
        } else {
            this.sprite = new PIXI.lights.PointLight(
                this._setup.color,
                this._setup.brightness
            );
        }

        // sprite
        this.sprite._self = this;
        this.sprite.rgb = Haya.Utils.Color.hexRgb(this.sprite._color);

        // parent Layer
        this.sprite.parentLayer = $.group._lightGroup;

        // refresh to setup
        this.refresh();

        return this;
    }
    /**
     * @method refresh
     * @description refresh the values
     */
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
    /**
     * @method isOkay
     * @description check if the light is available for use
     */
    Pixi_Light.prototype.isOkay = function () {
        return (
            (this.switch !== -1 ? $gameSwitches.value(this.switch) : true) &&
            $.Time.period(this.time) &&
            this.floor === $gamePlayer.floor
        )
    }
    /**
     * @method atRange
     * @description check out if the light is on the screen range
     * @param {Number} [margin=240]
     */
    Pixi_Light.prototype.atRange = function (margin = 240) {
        return (
            (this.sprite.x.isBetween(
                -margin + ($.Viewport.x),
                (Graphics.width) + ($.Viewport.x + margin))) &&
            (this.sprite.y.isBetween(
                -margin + (-$.Viewport.y),
                (Graphics.height) + (-$.Viewport.y + margin)
            ))
        )
    }
    /**
     * @method pulseEffect
     * @description effect of pulsing
     */
    Pixi_Light.prototype.pulseEffect = function () {

        if (this.pulse.time < 2) {
            this.pulse.reverse = !this.pulse.reverse;
            this.pulse.time = this.pulse.duration * 60;
        }

        if (this.pulse.reverse === true) {
            this.sprite.brightness += this.sprite.brightness = Haya.DMath.fincrease(
                this.sprite.brightness,
                this.pulse.min, this.pulse.max,
                1 - (this.pulse.speed * (this.pulse.time - 1)) / this.pulse.time
            )
            //this.sprite.alpha = Haya.DMath.fincrease(this.sprite.alpha, 0, 1.0, (this.pulse.speed * (this.pulse.time-1)) / this.pulse.time)
        } else {
            this.sprite.brightness = Haya.DMath.fdecrease(
                this.sprite.brightness,
                this.pulse.min, this.pulse.max,
                (this.pulse.speed * (this.pulse.time - 1)) / this.pulse.time
            )
        }

        this.pulse.time--;
    }
    /**
     * @method oscilationEffect
     * @description effect of oscilation
     */
    Pixi_Light.prototype.oscilationEffect = function () {
        this.sprite.brightness = (this.oscilation.min * Math.sin(this.oscilation.time)) / this.oscilation.max;
        this.oscilation.time = (this.oscilation.time + this.oscilation.speed) % this.oscilation.duration
        // if (this.oscilation.time > 0) {
        //     this.oscilation.time -= this.oscilation.speed;
        // } else {
        //     this.oscilation.time = this.oscilation.duration;
        // }
        // amplitude * Math.sin(time)
    }
    /**
     * @method urgb
     * @description converts the rgb color to hex
     */
    Pixi_Light.prototype.urgb = function () {
        this.sprite.color = Haya.Utils.Color.rgbHex(
            this.sprite.rgb.red,
            this.sprite.rgb.green,
            this.sprite.rgb.blue
        );
        this.sprite.tint = this.sprite.color;
    }
}(Haya.Map);

/**
 * :time
 * @class TimeSystem
 * @description time system to dynamic events
 */
void

function ($) {
    // class
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
            if (this._sec >= 60) {
                this._sec = 0;
                this._min += 1;
            }
            if (this._min >= 60) {
                this._min = 0;
                this._hour += 1;
            }
            if (this._hour >= 24) {
                this._hour = 0;
                this._day += 1;
            }
            if (this._day >= 31) {
                this._day = 1;
                this._month += 1;
            }
            if (this._month >= 12) {
                this._month = 1;
                this._year += 1;
            }
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
        sec(value) {
            this._sec = this.set(value, 60);
            return this._sec;
        }
        min(value) {
            this._min = this.set(value, 60);
            return this._min;
        }
        hour(value) {
            this._hour = this.set(value, 24);
            return this._hour;
        }
        day(value) {
            this._day = this.set(value, 31);
            return this._day;
        }
        week() {
            return (((this.month() * 12) + this.day()) % 7);
        }
        month(value) {
            this._month = this.set(value, 12);
            return this._month;
        }
        year(value) {
            this._year = this.set(value, 2000);
            return this._year;
        }
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
            } [value])
        }
        /**
         * @desc check out the period of day
         * @return {boolean}
         */
        dawn() {
            return this._hour.isBetween(4, 6, false);
        }
        morning() {
            return this._hour.isBetween(7, 12, false);
        }
        afternoon() {
            return this._hour.isBetween(13, 17, false);
        }
        night() {
            return (this.evening() || this.midnight())
        }
        evening() {
            return this._hour.isBetween(18, 24, false);
        }
        midnight() {
            return this._hour.isBetween(0, 3, false);
        }

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
    };
    // reference
    $.Time = new TimeSystem();
}(Haya.Map)

/**
 * :sprite_picture
 * @class Sprite_Picture
 * @description fix it to the script
 */
void

function () {
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
}();

/**
 * :sprite_map
 * @class Sprite_Map
 * @description the default class to print sprites over screen of the map
 */
void

function ($) {
    /**
     * @method initialize
     * @description initialize the instance of the class
     */
    Sprite_Map.prototype.initialize = async function () {
        // container of overall sprites
        this.sprite = new PIXI.Container();
        this.sprite.filterArea = new PIXI.Rectangle(0, 0, $.Viewport.worldWidth, $.Viewport.worldHeight)

        // picture stage
        this.pictureStage = new PIXI.Container();

        // control the access to the light objects
        this.light = {
            element: [],
            source: {},
            _updateBuffer: 3,
            _max: 0
        };

        // control the access to the particle objects
        this.particle = {
            source: {},
            element: []
        }
        this.particleBuffer = 1;

        // control the access to the sound objects
        this.sound = {
            element: [],
            source: {}
        }

        // control the access to the filter objects
        this.filter = {
            source: {},
            element: []
        };

        // control the access to the character objects  
        this._characters = [];

        // control the screen display viewport  
        this.display = new Point(0, 0);

        // create
        await this.create();

        // print
        //print("[Sprite_Map]: ", this);
    }
    /**
     * @method create 
     * @description create the object over screen
     */
    Sprite_Map.prototype.create = function () {
        //console.time("sprite-map:create")
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

        // create Weather
        this.createWeather();

        // create Sound
        this.createSound();

        // refresh the sprites
        this.refreshSprite();

        // print
        //print("[Sprite_Map]:sprite ", this.sprite);

        //console.timeEnd("sprite-map:create")
    }
    /**
     * @method update 
     * @description update the objects over screen
     */
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
    /**
     * @method dispose 
     * @description destroy the objects
     */
    Sprite_Map.prototype.dispose = function () {
        // destroy it
        this.sprite.destroy();
        // and lights
        // for (let index = 0; index < this.light.element.length; index++) {
        //     const element = this.light.element[index];
        //     element.parent.removeChild(element);
        // }
    }

    // ! ========================================================================

    /**
     * @method createBaseSprite
     * @description create the base sprite 
     */
    Sprite_Map.prototype.createBaseSprite = function () {
        this._baseSprite = new PIXI.Container();
        this._baseSprite.position.set(0, 0);
        this.sprite.addChild(this._baseSprite);
    }
    /**
     * @method createMap
     * @description add the preload textures on map
     */
    Sprite_Map.prototype.createMap = function () {
        if ($.current.sprite.length > 0) {
            this.sprite.addChild(...$.current.sprite)
        };
    }
    /**
     * @method createCharacter
     * @description create the characters and events on map
     */
    Sprite_Map.prototype.createCharacter = function () {
        this._characters = [];
        // create player
        // new Sprite_Character($gamePlayer)

        var player = new Haya.Map.Hayaset_Character($gamePlayer);
        this._characters.push(player);

        //create events
        $gameMap.events().forEach((event) => {
            //event.setPosition(event._x, event._y)

            let _event = new Hayaset_Character(event);
            this._characters.push(_event)
        })



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
    /**
     * @method createLightSprite
     * @description create lights source on map
     */
    Sprite_Map.prototype.createLightSprite = function () {
        Object.keys($.current.light).map((value) => {
            var item = $.current.light[value];
            this.addLight(value, item.kind, item, this.sprite)
        })
    }
    /**
     * @method createParticle
     * @description create particles source on map
     */
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
    /**
     * @method createFilter
     * @description create filters source on map
     */
    Sprite_Map.prototype.createFilter = function () {
        return;
    }
    /**
     * @method createScreenSprite
     * @description screen to effect of flash & fade
     */
    Sprite_Map.prototype.createScreenSprite = function () {
        this._flashSprite = new ScreenSprite();
        this._fadeSprite = new ScreenSprite();
        SceneManager._scene.addChild(this._flashSprite);
        SceneManager._scene.addChild(this._fadeSprite);
    }
    /**
     * @method createPictures
     * @description create the pictures over map
     */
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
    /**
     * @method createWeather
     * @description create weather objects on screen
     */
    Sprite_Map.prototype.createWeather = function () {
        if ($.current.weather.length < 1) return false;
        let iweather = $.current.weather.length;
        while (iweather--) {
            var item = $.current.weather[iweather];
            this.addWeather(item.kind, item, this.sprite)
        }
    }
    /**
     * @method createSound
     * @description create the sound sources on screen
     */
    Sprite_Map.prototype.createSound = function () {
        this.sound.source = $.current.sound.source;
        this.sound.element = $.current.sound.element;
        this.sound.max = $.current.sound.element.length;
    }

    // ! ========================================================================

    /**
     * @method updateLight
     * @description update the light source on screen
     */
    Sprite_Map.prototype.updateLight = function () {
        let index = 0;
        for (; index < this.light._max; index++) {
            const element = this.light.element[index];
            if (element) {
                element.update();
            }
        }
    }

    /**
     * @method updateSound
     * @description update the sound source on screen
     */
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
                    if (($.Time.period(sound.editor._data.time)) === false) {
                        sound.stop()
                        continue;
                    } else if (sound.editor._data.switch > 1) {
                        if ($gameSwitches.value(sound.editor._data.switch) === false) {
                            sound.stop()
                            continue;
                        }
                    }
                } else {
                    if (sound.loop === true) {
                        if (($.Time.period(sound.editor._data.time)) === true) {
                            sound.play()
                            continue;
                        } else if (sound.editor._data.switch > 1) {
                            if ($gameSwitches.value(sound.editor._data.switch) === true) {
                                sound.play()
                                continue;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * @method updateCharacters
     * @description update the characters on screen
     */
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

    /**
     * @method updateParticle
     * @description update the particle source on screen
     */
    Sprite_Map.prototype.updateParticle = function () {
        Haya.Particle.manager.update((particle) => {
            if ($.Time.period(particle.time)) {
                let px = 0;
                let py = 0;

                if ($gameCutscene.isCutscene()) {
                    particle.visible = true;
                } else {
                    particle.visible = true
                }

                particle.emmiter._emit = particle.visible;
            } else {
                particle.visible = false;
                particle.emmiter._emit = false;
            }
        });
    }

    /**
     * @method updateScreenSprites
     * @description update the flash & fade on screen
     */
    Sprite_Map.prototype.updateScreenSprites = function () {
        return;
        var color = $gameScreen.flashColor();
        this._flashSprite.setColor(color[0], color[1], color[2]);
        this._flashSprite.opacity = color[3];
        this._fadeSprite.opacity = 255 - $gameScreen.brightness();
    }

    /**
     * @method updateSprite
     * @description update the sprites on screen
     */
    Sprite_Map.prototype.updateSprite = function () {
        if ($.current.spriteUpdate.length < 1) return;
        $.current.spriteUpdate.map((sprite) => {
            if (sprite.opacity === true) {
                sprite.alpha = (
                    (sprite.x.isBetween($gamePlayer._collision.body.x, $gamePlayer._collision.body.x + 30)) &&
                    (sprite.x.isBetween($gamePlayer._collision.body.x, $gamePlayer._collision.body.x + 30))
                )
            }
        })
    }

    /**
     * @method updateWeather
     * @description update the weather source on screen
     */
    Sprite_Map.prototype.updateWeather = function () {
        let index = 0;
        for (; index < Haya.Weather.element.length; index++) {
            const element = Haya.Weather.element[index];
            if (element) {
                element.update();
            }
        }
    }

    // ! ========================================================================

    /**
     * @method addLight
     * @description add a new light source on screen
     * @param {String} name light name 
     * @param {String} type can be: 'sprite', or 'pixi', by default goes 'pixi'.
     * @param {Object} setup 
     * @see Sprite_Light
     * @see Pixi_Light
     * @param {Object<PIXI>} addch the parent to accept this new child, by default is
     * the map
     */
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

        //print(this._light);
    };
    /**
     * @method removeLight 
     * @description remove a ligth source from screen
     * @param {String} [name] name of the light source to remove
     */
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

    /**
     * @method addParticle
     * @description adds a new particle source into the map
     */
    Sprite_Map.prototype.addParticle = function (filename, textures, setup, local = true) {

        var particle = Haya.Particle.manager.add(
            filename,
            textures,
            setup,
            local
        )


        this.particle.source[particle.name] = particle;
        this.particle.element.push(particle);

        console.log(this.particle);

    }

    /**
     * @method removeParticle
     * @description removes a particle from screen
     * @param {String} [name] name of the particle source
     */
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
    /**
     * @method addSound 
     * @description add a sound source to the screen
     * @param {Object} data 
     * @see {HowlSound}
     */
    Sprite_Map.prototype.addSound = function (data) {

        var sound = $.csound(data);

        $.current.sound.element.push(sound);
        $.current.sound.source[sound.editor.name] = sound;

        this.sound.source = $.current.sound.source;
        this.sound.element = $.current.sound.element;
        this.sound.max = $.current.sound.element.length;
    }
    /**
     * @method removeSound
     * @description removes a sound source from screen
     * @param {String} [name] name of the sound source
     */
    Sprite_Map.prototype.removeSound = function (name) {
        if ($.current.sound.source.hasOwnProperty(name)) {
            var copy = [];
            $.current.sound.element.map((value, index) => {
                if (value.editor.name !== name) {
                    copy.push(value);
                } else {
                    value.unload()
                }
            })
            $.current.sound.element = copy;
            delete $.current.sound.source[name];

            this.sound.source = $.current.sound.source;
            this.sound.element = $.current.sound.element;
            this.sound.max = $.current.sound.element.length;
        }
    }
    /**
     * @method addWeather
     * @description adds a weather source
     */
    Sprite_Map.prototype.addWeather = function (kind, setup = {}, stage = this.sprite) {
        var weather;
        if (kind === "fog") {
            weather = new Haya.Weather.Fog(setup, babylon = this.babylon);
            weather.id = Haya.Weather.element.length++;
        } else if (kind === "rain") {

        } else {
            return;
        }

        //
        Haya.Weather.element.push(weather)
        stage.addChild(weather)
    }
    /**
     * @method removeWeather
     * @description removes a sound source from screen
     * @param {String} [id] id of the weather source
     */
    Sprite_Map.prototype.removeWeather = function (id) {
        if (Haya.Weather.element[id]) {
            var copy = [];
            Haya.Weather.element.map((value, index) => {
                if (value.id !== id) {
                    copy.push(value);
                } else {
                    value.clear()
                }
            })
            Haya.Weather.element = copy;
        }
    }

    // ! ========================================================================

    /**
     * @method refreshSprite
     * @description refresh all sprite values
     */
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
}(Haya.Map)

/**
 * :hayaset_character
 * @class Hayaset_Character
 * @description a alternative to Spriteset_Character, to be able to use
 * the PIXI.lights
 */
void

function ($) {
    // class
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
    };
    // reference
    $.Hayaset_Character = Hayaset_Character;
}(Haya.Map)

/**
 * :sprite_character
 * @class Sprite_Character
 * @description changes on sprite character class to fit on PIXI.lights
 */
void

function ($) {
    /**
     * @method initialize
     * @description initialize the instance of the class
     * @param {Boolean} [normal=false] is it a 'normalmap' texture? 
     */
    Sprite_Character.prototype.initialize = function (character, normal = false) {
        Sprite_Base.prototype.initialize.call(this);
        this.normal = normal;
        this._refreshImage = true;
        //
        this.initMembers();
        this.setCharacter(character);
    };
    /**
     * @method initMembers
     * @description initialize the paramaters
     */
    Sprite_Character.prototype.initMembers = function () {
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this._character = null;
        this._balloonDuration = 0;
    };
    /**
     * @method updateVisibility
     * @description check out the visibility of the character
     */
    Sprite_Character.prototype.updateVisibility = function () {
        Sprite_Base.prototype.updateVisibility.call(this);
        if (this._character.isTransparent()) {
            this.visible = false;
        }
    };
    /**
     * @method updateFrame
     * @description update the frames over screen
     */
    Sprite_Character.prototype.updateFrame = function () {
        this.updateCharacterFrame();
    };
    /**
     * @method isImageChanged
     * @description check out if the image changed
     */
    Sprite_Character.prototype.isImageChanged = function () {
        return (
            this._refreshImage === true ||
            this._characterName !== this._character.characterName() ||
            this._characterIndex !== this._character.characterIndex()
        );
    };
    /**
     * @method setCharacterBitmap
     * @description loads the bitmap of the character
     */
    Sprite_Character.prototype.setCharacterBitmap = function () {
        return this.bitmap = ImageManager.loadCharacter((this.normal ? "!" : "") + this._characterName);
    };
    /**
     * @method updateCharacterFrame
     * @description update the pattern of the frame & set 
     */
    Sprite_Character.prototype.updateCharacterFrame = function () {
        var pw = this.patternWidth();
        var ph = this.patternHeight();
        var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
        var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
        //this.updateHalfBodySprites();
        this.setFrame(sx, sy, pw, ph);
    };
    /**
     * @method patternWidth
     * @description the width size of the pattern to the frame
     */
    Sprite_Character.prototype.patternWidth = function () {
        return 32;
    };
    /**
     * @method patternHeight
     * @description the height size of the pattern to the frame
     */
    Sprite_Character.prototype.patternHeight = function () {
        return 48;
    };
    /**
     * @method updatePosition
     * @description update the position over screen
     */
    Sprite_Character.prototype.updatePosition = function () {
        this.x = this._character.screenX();
        this.y = this._character.screenY();
        this.z = this._character.screenZ();
        //print(this._character._difX, this._character._difY)
    };
}(Haya.Map)

/**
 * :scene_map
 * @class Scene_Map
 * @description changes on Scene Map class to fit for this plugin
 */
void

function ($) {
    /**
     * @method initialize 
     * @description initialize the instance of the class
     */
    Scene_Map.prototype.initialize = function () {
        //console.time("scene-map | until all creation")
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
            //this.updateTransferPlayer();
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
        this.updateTransferPlayer();
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
            print('transfering')
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
        $.Viewport.clamp({
            direction: "all"
        })
        // clamp zoom
        $.Viewport.clampZoom({
            minWidth: Graphics.width / 3,
            minHeight: Graphics.height / 3,
            maxWidth: $.Viewport.worldWidth,
            maxHeight: $.Viewport.worldHeight,
        })
        // available zoom
        //$.Viewport.wheel();

        //print($.Viewport, 'viewport')
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
}(Haya.Map);

/**
 * :game_map
 * @class Game_Map
 * @description changes on Game_Map class to fit for this plugin
 */
void

function ($) {
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

    Game_Map.prototype.snap = function (x, y, options = {
        topLeft: true
    }) {
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
}(Haya.Map)


/**
 * :game_player
 * @class
 * @description changes on Game Player class to fit for this plugin
 */
void

function () {
    /**
     * @method performTransfer
     * @description when the player go to another scene map
     */
    Game_Player.prototype.performTransfer = function () {

        if (this.isTransferring()) {
            print('hit transfer')
            this.setDirection(this._newDirection);
            //print(this._newMapId, $gameMap.mapId())
            if (this._newMapId !== $gameMap.mapId() || this._needsMapReload) {
                Haya.Map.map = $dataMapInfos[this._newMapId].name
                Haya.Map.map_id = this._newMapId;
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

}()

/**
 * :game_screen
 * @class Game_Screen
 */
void

function () {
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
}()

/**
 * :game_interpreter
 * @class Game_Interpreter
 */
void

function () {
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
                case 212:
                case 337:
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
}()

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