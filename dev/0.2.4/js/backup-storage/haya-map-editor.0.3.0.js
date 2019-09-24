/**
 * @file [haya_map_editor.js -> Haya - Map Editor]
 * @description This is a editor in-game for the maps using
 * Haya elements.
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @thanks to Jonforum!
 * @version 0.3.1
 * @license HAYA <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Map_Editor = Haya.Map_Editor || {};

/*:
 * @author Dax Soft | www.dax-soft.weebly.com
 * 
 * @plugindesc [0.3.1] Haya Map Editor
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

void

function ($) {
    'use strict';
    /**
     * handle with general information about all maps
     */
    $.data = {
        library: {
            directory: {},
            map: {}
        }
    }
    /**
     * variable control of the editor elements
     */
    $.editor = {
        /**
         * To control in which phase the editor is on 'as on light-editor'
         */
        control: null,
        /**
         * To control what target the editor will focus, such 'Sprite_Light'
         */
        target: null,
        /**
         * To control the subphase in which the editor is on 'as on opacity control 
         * of the light'
         */
        wedit: null,
        weditChange: false,
        /**
         * Control the default floor in which the collision when created will go 
         * to.
         */
        collisionFloor: 'base',
        /**
         * Control the variables of the color pallete
         */
        pallete: {
            // colors
            red: 16,
            green: 16,
            blue: 16,
            // pallete
            color: Haya.File.json(Haya.File.local("img/maps/editor/color.json"))
        },
        /**
         * Control the values of each blend mode
         */
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
        /**
         * Reset the values
         */
        reset: () => {
            $.editor.control = null;
            $.editor.target = null;
            $.editor.wedit = null;
            $.editor.blend.kind = 0;
        }
    }
    /**
     * Export to '<select>' data 
     */
    $.blendMode_select = function () {
        var blend = [];

        $.editor.blend.list.map((type, value) => {
            blend.push({
                label: type[1],
                value: value
            })
        })

        return blend;
    }
    /**
     * handle with the configurable values
     */
    $.config = Haya.File.json(Haya.File.local('img/maps/editor/config.json'))
    /**
     * handle with the data values to save over edition
     */
    $.save = {
        light: {},
        collision: {},
        particle: {},
        sound: {},
        weather: {},
        sprite: {}
    }
    /**
     * handle with the control of each textures, source &from
     */
    $.particle = {
        source: {},
        textures: {}
    };
    $.light = {
        textures: {}
    }
    $.sound = {
        bgm: {},
        bgs: {},
        me: {},
        se: {}
    }
    /**
     * handle with flow control of the time & floor
     */
    $.time = 0;
    $.floor = 0;
    $.temp = {};
    $.mouse_dir = new Point(0, 0);
    // ========================================================================
    /**
     * Load files : config, image, audio
     */
    function load_setup() {
        /**
         * load all particles setup
         */
        Haya.File.treeFile("data/particles", function (filename) {
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
        })
        /**
         * load all particles image
         */
        Haya.File.treeFile("img/particles", function (filename) {
            // replace filename
            let _filename = filename.replace(/^.*[\\\/]/, '');
            // load just '.json' file
            if (_filename.match(/\.png$/gi)) {
                // load data 'npc' setup
                let name = _filename.replace(/\.png/gi, "")
                //
                $.particle.textures[name] = [_filename, filename];
            }
        })
        /**
         * load all light sources
         */
        Haya.File.treeFile("img/maps/lights", function (filename) {
            // replace filename
            let _filename = filename.replace(/^.*[\\\/]/, '');
            // load just '.json' file
            if (_filename.match(/\.png$/gi)) {
                // load data 'npc' setup
                let name = _filename.replace(/\.png/gi, "")
                //
                $.light.textures[name] = [_filename, filename];
            }
        })
        /**
         * load all bgm audio
         */
        Haya.File.treeFile("audio/bgm", function (filename) {
            // replace filename
            let _filename = filename.replace(/^.*[\\\/]/, '');
            // load just '.json' file
            if (_filename.match(/\.ogg$/gi)) {
                // load data 'npc' setup
                let name = _filename.replace(/\.ogg/gi, "")
                //
                $.sound.bgm[name] = [_filename, filename];
            }
        })
        /**
         * load all bgs audio
         */
        Haya.File.treeFile("audio/bgs", function (filename) {
            // replace filename
            let _filename = filename.replace(/^.*[\\\/]/, '');
            // load just '.json' file
            if (_filename.match(/\.ogg$/gi)) {
                // load data 'npc' setup
                let name = _filename.replace(/\.ogg/gi, "")
                //
                $.sound.bgs[name] = [_filename, filename];
            }
        })
        /**
         * load all me audio
         */
        Haya.File.treeFile("audio/me", function (filename) {
            // replace filename
            let _filename = filename.replace(/^.*[\\\/]/, '');
            // load just '.json' file
            if (_filename.match(/\.ogg$/gi)) {
                // load data 'npc' setup
                let name = _filename.replace(/\.ogg/gi, "")
                //
                $.sound.me[name] = [_filename, filename];
            }
        })
        /**
         * load all se audio
         */
        Haya.File.treeFile("audio/se", function (filename) {
            // replace filename
            let _filename = filename.replace(/^.*[\\\/]/, '');
            // load just '.json' file
            if (_filename.match(/\.ogg$/gi)) {
                // load data 'npc' setup
                let name = _filename.replace(/\.ogg/gi, "")
                //
                $.sound.se[name] = [_filename, filename];
            }
        })
        /**
         * load standard textures
         */
        // Haya.Pixi.Manager.load({
        //     toolbar_light: Haya.File.local("img/maps/editor/toolbar_light.png"),
        //     toolbar_collision: Haya.File.local("img/maps/editor/toolbar_light.png"),
        //     toolbar_particle: Haya.File.local("img/maps/editor/toolbar_light.png"),
        //     toolbar_sound: Haya.File.local("img/maps/editor/toolbar_light.png"),
        //     toolbar_setup: Haya.File.local("img/maps/editor/toolbar_light.png"),
        //     toolbar_filter: Haya.File.local("img/maps/editor/toolbar_light.png"),
        //     toolbar_event: Haya.File.local("img/maps/editor/toolbar_light.png"),
        //     save: Haya.File.local("img/maps/editor/save.png")
        // })
    }
    /**
     * Load all maps information
     */
    function loadLibrary() {
        let directory = Haya.File.treeFolder(Haya.File.local("img/maps"));
        directory.forEach((dir) => {
            // record all except by editor stuffs
            if (!(dir.match(/(editor|Maps)$/gi))) {
                // get the map name
                let mapName = dir.split(/\\|\//gi);
                mapName = mapName[mapName.length - 1];
                $.data.library.directory[mapName] = Haya.File.clean(dir);
            }
        })
    };
    /**
     * Load the css file
     */
    function map_editor_style() {

        El.Attr(El.create('link', document.head), {
            'rel': 'stylesheet',
            'type': 'text/css',
            'href': 'js/plugins/haya.css'
        })

        El.Attr(El.create('link', document.head), {
            'rel': 'stylesheet',
            'type': 'text/css',
            'href': 'js/plugins/haya-map-editor.css'
        })
    }

    /**
     * Create the data from color.json
     */
    $.colorPallete = function () {
        var data = [];

        Object.keys($.editor.pallete.color).map(key => {
            let color = $.editor.pallete.color[key]
            let colorCSS = color.replace(/^(0x)/gi, "#")
            data.push({
                label: `${key} : <span class='circle-ball-color' style='background-color: ${colorCSS};'></span>`,
                color: color,
                name: key
            })
        })

        return data;
    }
    // ========================================================================
    /**
     * @function Sprite_Map
     * @method createCharacter
     * Only create the player character
     */
    Sprite_Map.prototype.createCharacter = function () {


        this._characters = [];
        // create player
        // new Sprite_Character($gamePlayer)
        var player = new Haya.Map.Hayaset_Character($gamePlayer);
        //print(player, "PLAYER")
        this._characters.push(player);
        $gamePlayer._moveSpeed = 4;
        // name & zIndex
        this._characters.forEach((value, index) => {
            value.name = `character_${index}`
            value.children.forEach((ch) => {
                ch.z = 3;
                ch.zIndex = Haya.Map.group.layer["object"];
                ch.parentGroup.zIndex = ch.zIndex;
            })
            this.sprite.addChild(value)
        })
    }
    /**
     * @function Game_Map
     * @method setupEvents
     * Not create any event
     */
    Game_Map.prototype.setupEvents = function () {
        this._events = [];
    };
    // ========================================================================
    /**
     * @class Editor_Sprite
     * To edit the sprite sources
     */
    class Editor_Sprite {
        /**
         * @constructor
         */
        constructor() {
            this.target = null;
            this.data = null;
            this.editor = El.Attr(El.create('section', El.id('map_editor_stage')), {
                class: 'editor nested',
                id: 'editor-sprite'
            });
            this.el = {};
            this.wedit = null;
            this.register = {};
            this.tint = null;
        }

        refresh() {
            El.removeChild(this.editor)
            this.target = null;
            this.el = {};
            this.wedit = null;
            El.addClass(this.editor, 'nested')
            this.register = {};
            this.mouse = new Point(0,0);
            this.tint = null;
        }

        update() {
            if (this.wedit === 'position') {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                // undo
                if (Input.isPressed('control') && Input.isPressed('ok')) {
                    console.log('undo');

                    this.target.x = this.register.pos.x;
                    this.target.y = this.register.pos.y;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    this.target.x = Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    this.target.y = Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    //$.editor.target.pivot.set((-Haya.Map.Viewport.x), (-Haya.Map.Viewport.y));
                    //$.editor.weditChange = true;
                    this.el.position.button.innerHTML = `x ${Haya.DMath.float(this.target.x)} | y: ${Haya.DMath.float(this.target.y)}`

                }
            }

            if (this.wedit === 'rotation') {

                if (Input.isPressed('control') && Input.isPressed('ok')) {
                    console.log('undo');
                    this.target.rotation = this.register.rotation
                }

                var dir = this.dir();
                if (dir === 'up') {
                    // this.target.sprite.rotation = Haya.DMath.radians(Haya.DMath.float(this.el.rotation.get()))
                    this.target.rotation -= .05;
                    this.el.rotation.input.value = Haya.DMath.float(Haya.DMath.degrees(this.target.rotation))
                } else if (dir === 'down') {
                    // this.target.sprite.rotation = Haya.DMath.radians(Haya.DMath.float(this.el.rotation.get()))
                    this.target.rotation += .05;
                    this.el.rotation.input.value = Haya.DMath.float(Haya.DMath.degrees(this.target.rotation))
                }
            }

            if (this.wedit === 'opacity') {
                this.target.alpha = Haya.DMath.wheelID(
                    this.target.alpha,
                    0, 1, 0.05,
                    (current) => { 
                        this.el.opacity.input.value = current * 100;

                    },
                    "alt", 0.1
                )
            }

            if (this.wedit === 'scaleX') {
                if (Input.isPressed('control') && Input.isPressed('ok')) {
                    console.log('undo');
                    this.target.scale.x = this.register.scaleX
                }

                var dir = this.dir();
                if (dir === 'up') {
                    // this.target.sprite.rotation = Haya.DMath.radians(Haya.DMath.float(this.el.rotation.get()))
                    this.target.scale.x -= .05;
                    this.el.scaleX.input.value = Haya.DMath.float(this.target.scale.x)
                } else if (dir === 'down') {
                    // this.target.sprite.rotation = Haya.DMath.radians(Haya.DMath.float(this.el.rotation.get()))
                    this.target.scale.x += .05;
                    this.el.scaleX.input.value = Haya.DMath.float(this.target.scale.x)
                }
            }

            if (this.wedit === 'scaleY') {
                if (Input.isPressed('control') && Input.isPressed('ok')) {
                    console.log('undo');
                    this.target.scale.y = this.register.scaleY
                }

                var dir = this.dir();
                if (dir === 'up') {
                    // this.target.sprite.rotation = Haya.DMath.radians(Haya.DMath.float(this.el.rotation.get()))
                    this.target.scale.y -= .05;
                    this.el.scaleY.input.value = Haya.DMath.float(this.target.scale.y)
                } else if (dir === 'down') {
                    // this.target.sprite.rotation = Haya.DMath.radians(Haya.DMath.float(this.el.rotation.get()))
                    this.target.scale.y += .05;
                    this.el.scaleY.input.value = Haya.DMath.float(this.target.scale.y)
                }
            }
        }

        dir() {
            if (TouchInput.isPressed() && Input.isPressed('control')) {

                //if ($.editor.wedit = 'point' && !Input.isPressed('ctrl')) return;

                // RIGHT

                if (Haya.Mouse.x >  this.mouse.x) {
                    return 'right'
                }

                // LEFT

                if (Haya.Mouse.x <  this.mouse.x) {
                    return 'left'
                }

                // UP

                if (Haya.Mouse.y <  this.mouse.y) {
                    return 'up'
                }

                // DOWN
                if (Haya.Mouse.y >  this.mouse.y) {
                    return 'down'
                }
            } else {
                this.mouse.x = Haya.Mouse.x;
                this.mouse.y = Haya.Mouse.y;
            }

        }

        create() {

            if (Haya.Utils.invalid(this.target)) return;

            El.removeClass(this.editor, 'nested')

            this.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.editor,
                onclick: () => {
                    $.editor.control = 'sprite'
                    this.refresh();
                    SceneManager._scene.refreshEditor();
                    SceneManager._scene.setupEditor();
                }
            })

            this.create_position();

            this.create_floor();

            this.create_rotation();

            this.create_opacity();

            this.create_color()

            this.create_blend();

            this.create_scale();

            //this.create_remove();
        }

        create_position() {
            this.el.position = new Components.button.Basic({
                label: `x ${Haya.DMath.float(this.target.x)} | y: ${Haya.DMath.float(this.target.y)}`,
                parent: this.editor,
                onclick: () => {
                    this.wedit = this.wedit === 'position' ? null : 'position';
                    this.register.pos = new Haya.DMath.Vector2D(this.target.x, this.target.y);
                }
            })
        }

        create_floor() {
            // floor
            this.el.floor = new Components.list.Select({
                parent: this.editor,
                label: 'Floor:',
                data: $.config.floor
            })
            this.el.floor.select.onchange = () => {
                var target = this.el.floor.data.find(el => el.value === +this.el.floor.get())
                this.target.floor = target.label;
                SceneManager._scene._spriteset.refreshSprite();
            }
            let defaultFloor = this.el.floor.data.find(el => el.label === $.editor.target.floor).value
            this.el.floor.choose(defaultFloor)

        }

        create_rotation() {
            this.el.rotation = new Components.input.Number({
                parent: this.editor,
                label: 'Rotation:',
                min: -360.0,
                max: 360.0,
                default: Haya.DMath.float(Haya.DMath.degrees(this.target.rotation)),
                step: 1,
                format: 'float'
            })

            this.el.rotation.input.onchange = () => {
                this.target.rotation = Haya.DMath.radians(Haya.DMath.float(this.el.rotation.get()))
            }

            this.el.rotation.input.onclick = () => {
                this.wedit = this.wedit === 'rotation' ? null : 'rotation';
                this.register.rotation = this.target.rotation;
            }
        }

        create_opacity() {
            this.el.opacity = new Components.input.Range({
                parent: this.editor,
                label: 'Opacity &value%',
                min: 0.0,
                max: 100.0,
                default: Haya.DMath.float(this.target.alpha * 100),
                step: 1.0,
                format: (value) => {
                    return Haya.DMath.float(+(value));
                },
                onchange: (value) => {
                    this.target.alpha = Haya.DMath.float(value / 100)
                }
            })

             this.el.opacity.onclick = () => {
                this.wedit = this.wedit === 'opacity' ? null : 'opacity';
             }
        }

        create_color() {
            // color
            this.el.colors = new Components.button.Basic({
                label: 'Color',
                parent: this.editor,
                onclick: () => {
                    this.getTint()
                    SceneManager._scene.gui.editor.window.setup.title = 'Tone'

                    let color = Haya.Utils.Color.hexRgb(String(this.tint).replace("0x", "#"));

                    console.log(color, $.editor.pallete);
                    

                    $.editor.pallete.red = color.red;
                    $.editor.pallete.green = color.green;
                    $.editor.pallete.blue = color.blue;
                    SceneManager._scene.gui.editor.window.components = [{
                        component: 'range',
                        label: 'Red &value:',
                        min: 0,
                        max: 255,
                        step: 1,
                        default: $.editor.pallete.red,
                        onchange: (value) => {
                            $.editor.pallete.red = parseInt(value);

                           // let color = Haya.Utils.Color.rgbHex($.editor.pallete.red, $.editor.pallete.green, $.editor.pallete.blue, "0x");

                            this.tint = color;
                            this.setTint();

                         //   SceneManager._scene.gui.editor.window.setup.title = `Color Editor: ${this.tint} <span class='circle-ball-color' style='background-color: ${this.tint.replace("0x", "#")};'></span>`
                        }
                    }, {
                        component: 'range',
                        label: 'Green &value:',
                        min: 0,
                        max: 255,
                        step: 1,
                        default: $.editor.pallete.green,
                        onchange: (value) => {
                            $.editor.pallete.green = parseInt(value);

                            //let color = Haya.Utils.Color.rgbHex($.editor.pallete.red, $.editor.pallete.green, $.editor.pallete.blue, "#");

                            this.tint = color;
                            this.setTint();

                            //SceneManager._scene.gui.editor.window.setup.title = `Color Editor: ${this.tint} <span class='circle-ball-color' style='background-color: ${this.tint.replace("0x", "#")};'></span>`
                        }
                    }, {
                        component: 'range',
                        label: 'Blue &value:',
                        min: 0,
                        max: 255,
                        step: 1,
                        default: $.editor.pallete.blue,
                        onchange: (value) => {
                            $.editor.pallete.blue = parseInt(value);

                           // let color = Haya.Utils.Color.rgbHex($.editor.pallete.red, $.editor.pallete.green, $.editor.pallete.blue, "0x");

                            this.tint = color;
                            this.setTint();

                           // SceneManager._scene.gui.editor.window.setup.title = `Color Editor: ${this.tint} <span class='circle-ball-color' style='background-color: ${this.tint.replace("0x", "#")};'></span>`
                        }
                    }, {
                        component: 'modal',
                        class: 'wcolor-list-edit',
                        open: true,
                        components: [{
                            component: 'list-basic',
                            onclick: (object, item) => {
                                //this.target.tint = object.color;
                                let color = Haya.Utils.Color.hexRgb(String(object.color).replace("0x", "#"));
                                $.editor.pallete.red = color.red;
                                $.editor.pallete.green = color.green;
                                $.editor.pallete.blue = color.blue;
                                SceneManager._scene.gui.editor.window.components[4].set(color.red);
                                SceneManager._scene.gui.editor.window.components[5].set(color.green);
                                SceneManager._scene.gui.editor.window.components[6].set(color.blue);

                                this.tint = color;
                                this.setTint();

                                //SceneManager._scene.gui.editor.window.setup.title = `Color Editor: ${this.getTint()} <span class='circle-ball-color' style='background-color: ${this.getTint().replace("0x", "#")};'></span>`
                            },
                            data: $.colorPallete(),
                            property: 'label',
                            id: 'color-editor-list',
                            class: 'tree-tag'
                        }]
                    }]


                    SceneManager._scene.gui.editor.window.open();
                    SceneManager._scene.gui.editor.window.draw();
                }
            })
        }

        create_blend() {
            this.el.blendMode = new Components.list.Select({
                parent: this.editor,
                label: 'Blend Mode:',
                data: $.blendMode_select(),
                onchange: () => {
                    let kind = parseInt(this.el.blendMode.get())

                    this.target._layerInfo.blendMode = $.editor.blend.list[kind][0];
                    this.target.children[1].blendMode =  this.target._layerInfo.blendMode 
                   // this.target.children[0].blendMode =  this.target._layerInfo.blendMode 


                    // $.editor.target._layerInfo.blendMode = $.editor.blend.list[$.editor.blend.kind][0];
                    // $.editor.target.children.map((sps) => sps.blendMode = ($.editor.target._layerInfo.blendMode))

                    //this.gui.editor.el.blendMode.choose(kind);
                }
            })
            this.el.blendMode.choose(this.target.blendMode)
        }

        create_scale() {
            // scaleX
            this.el.scaleX = new Components.input.Number({
                parent: this.editor,
                label: 'Scale X (v/100):',
                min: -1000.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.scale.x),
                step: .1,
                format: 'float'
            })
            this.el.scaleX.input.onchange = () => {
                this.el.scaleX.input.value = this.el.scaleX.input.value / 100;
                this.target.scale.x = Haya.DMath.float(this.el.scaleX.get())
            }
            this.el.scaleX.input.onclick = () => {
                this.wedit = this.wedit === 'scaleX' ? null : 'scaleX';
                this.register.scaleX = this.target.scale.x
            }

            // scaleY
            this.el.scaleY = new Components.input.Number({
                parent: this.editor,
                label: 'Scale Y (v/100):',
                min: -1000.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.scale.y),
                step: .1,
                format: 'float'
            })
            this.el.scaleY.input.onchange = () => {
                this.el.scaleY.input.value = this.el.scaleY.input.value / 100;
                this.target.scale.y = Haya.DMath.float(this.el.scaleY.get())
            }
            this.el.scaleY.input.onclick = () => {
                this.wedit = this.wedit === 'scaleY' ? null : 'scaleY';
                this.register.scaleY = this.target.scale.y
            }
        }

        create_remove() {
            this.el.remove = new Components.button.Basic({
                label: 'Delete!',
                parent: this.editor,
                onclick: () => {
                    Components.notification.Create({
                        parent: SceneManager._scene.gui.stage,
                        pause: true,
                        label: 'Are you sure that you want to delete it?',
                        components: [{
                                component: 'button',
                                label: 'Delete',
                                class: 'btn-white',
                                onclick: function () {
                                    $.editor.wedit = null;
                                    SceneManager._scene._spriteset.removeLight($.editor.target._name);
                                    $.editor.control = 'light';
                                    SceneManager._scene.refreshEditor();
                                    SceneManager._scene.setupEditor();
                                    this._popup.destroy(true);
                                }
                            },
                            {
                                component: 'button',
                                label: 'Return',
                                class: 'btn-white',
                                onclick: function () {
                                    this._popup.destroy(true);
                                }
                            }
                        ]
                    })
                }
            })
        }


        setTint() {
            let color = Haya.Utils.Color.rgbHex($.editor.pallete.red, $.editor.pallete.green, $.editor.pallete.blue, '');

            color = parseInt(color, 16);
            
            //console.log('tint', this.target.children[1].tint, 'to', color);

            //this.target.children[0].tint = color
            this.target.children[1].tint = color


        }

        getTint() {
            this.tint = this.target.children[1].tint

            if (typeof this.tint === 'number') {
                this.tint =  "0x" +  this.tint.toString(16).toUpperCase();
            }

            return String(this.tint)
        }
    }
    // ========================================================================
    /**
     * To edit the particles
     */
    class Editor_Particle {
         /**
         * @constructor
         */
        constructor() {
            this.target = null;
            this.data = null;
            this.editor = El.Attr(El.create('section', El.id('map_editor_stage')), {
                class: 'editor nested',
                id: 'editor-sprite'
            });
            this.el = {};
            this.wedit = null;
            this.register = {};
            this.tint = null;
        }

        refresh() {
            El.removeChild(this.editor)
            this.target = null;
            this.el = {};
            this.wedit = null;
            El.addClass(this.editor, 'nested')
            this.register = {};
            this.mouse = new Point(0,0);
            this.tint = null;
        }

        update() {

        }

        dir() {
            if (TouchInput.isPressed() && Input.isPressed('control')) {

                //if ($.editor.wedit = 'point' && !Input.isPressed('ctrl')) return;

                // RIGHT

                if (Haya.Mouse.x >  this.mouse.x) {
                    return 'right'
                }

                // LEFT

                if (Haya.Mouse.x <  this.mouse.x) {
                    return 'left'
                }

                // UP

                if (Haya.Mouse.y <  this.mouse.y) {
                    return 'up'
                }

                // DOWN
                if (Haya.Mouse.y >  this.mouse.y) {
                    return 'down'
                }
            } else {
                this.mouse.x = Haya.Mouse.x;
                this.mouse.y = Haya.Mouse.y;
            }

        }

        create() {

            if (Haya.Utils.invalid(this.target)) return;

            El.removeClass(this.editor, 'nested')

            this.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.editor,
                onclick: () => {
                    $.editor.control = 'sprite'
                    this.refresh();
                    SceneManager._scene.refreshEditor();
                    SceneManager._scene.setupEditor();
                }
            })

            
        }
    }
    // ========================================================================
    /**
     * @class Scene_Editor
     */
    class Scene_Editor extends Scene_Base {

        /**
         * @constructor
         * Initialize the instance of the scene
         */
        constructor() {
            super();

            /**
             * control the gui
             */
            this.toolbar = true;
            this.gui = {};
            this.gui.camera = new Haya.DMath.Vector2D(0, 0)
            this.display = new Haya.DMath.Vector2D(0, 0);
            this.camera = new Haya.DMath.Vector2D(0, 0);

            /**
             * control the elements
             */
            this.particle = {
                element: [],
                source: {}
            }
            this.light = {
                element: [],
                source: {}
            }
            this.filter = {
                element: [],
                source: {}
            }
            this.collision = {
                element: [],
                source: {},
                graphic: []
            }
            this.sound = {
                element: [],
                source: {},
                graphic: []
            }
        }

        // | --------------------------------------------------------
        // | Basic Structure
        // | --------------------------------------------------------

        /**
         * Starts out the scene
         */
        start() {
            super.start.call(this)
            SceneManager.clearStack();
        }

        /**
         * Update the object & sprite & elements over the loop
         */
        update() {
            super.update.call(this);
            this.updateTransferPlayer();
            this.updateMain();
            this.updatePivot();
            this.updateCollisionPivot();
            this.updateUI();
            this.updateKeys();
        }

        updateTransferPlayer() {
            if ($gamePlayer.isTransferring()) {
                $gamePlayer.performTransfer();
            }
        };

        /**
         * Draw the elements
         */
        create() {
            super.create.call(this);
        }

        // | --------------------------------------------------------
        // | Essential to start out
        // | --------------------------------------------------------

        /**
         * Check if the scene is ready to begin
         */
        isReady() {
            if (!this._mapLoaded) {
                this.onMapLoaded();
                this._mapLoaded = true;
            }
            return this._mapLoaded && super.isReady.call(this);
        }

        /**
         * When the scene is ready, create the elements to render
         */
        onMapLoaded() {
            this.createDisplayObjects();
        }

        /**
         * Check out if the scene is busy
         */
        isBusy() {
            return super.isBusy.call(this);
        }

        /**
         * Update the main elements of the map
         */
        updateMain() {
            var active = this.isActive();
            $gameMap._camera = null;
            $gameMap.update(active);
            $gamePlayer.update(active);
            $gameTimer.update(active);
            //$gameScreen.update();
            this._spriteset.update();
        }

        // | --------------------------------------------------------
        // | Structure of creation
        // | --------------------------------------------------------

        /**
         * Create the objects to display, main function to call the 
         * others
         */
        createDisplayObjects() {

            this.createSpriteset();
            this.createWindowLayer();

            this.createCollision();

            this.createUI();

            this.light.source = this._spriteset.light.source;
            this.light.element = this._spriteset.light.element;
        }

        /**
         * Create the spriteset of the map
         */
        createSpriteset() {
            this._spriteset = new Sprite_Map();

            Haya.Map.Viewport = new PIXI.extras.Viewport({
                screenWidth: Graphics.width,
                screenHeight: Graphics.height,
                worldWidth: Haya.Map.current.width || Graphics.width,
                worldHeight: Haya.Map.current.height || Graphics.height
            })

            // clamp direction
            Haya.Map.Viewport.clamp({
                direction: "all"
            })
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

        /**
         * Create the elements of the UI
         */
        createUI() {

            this.gui.stage = El.Attr(El.create('section', document.body), {
                id: 'map_editor_stage'
            })

            this.ucreate_iEdit();

            this.ucreate_eOptions();

            this.gui.editor = El.Attr(El.create('section', this.gui.stage), {
                id: 'editor_stage'
            })

            this.gui.editor.el = {};

            this.gui.editor.window = new Components.window.Basic({
                parent: this.gui.stage,
                id: 'editor-window',
                onclose: function () {
                    this.close();
                    this.refresh()
                },
                title: 'Window'
            })
        }

        /**
         * Create the collision over the map
         */
        createCollision() {
            /**
             * show up the collision elements
             */
            this.graphicCollision = new PIXI.Container();
            this.addChild(this.graphicCollision);

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

        /**
         * Draw up the collision graphics
         */
        collisionDraw() {
            this.collision.element.forEach((element) => {

                if (Haya.Utils.invalid(element._graphic)) {
                    element._graphic = new PIXI.Graphics();
                    this.graphicCollision.addChild(element._graphic);
                }
                element._graphic.clear();
                if ($.editor.collisionFloor === "all" || (element.floor === $.editor.collisionFloor)) {
                    this.collisionGraphic(element);
                }


                if (element._graphic.stage === undefined || element._graphic.stage === null) {
                    this.graphicCollision.addChild(element._graphic);
                }
            })
        }

        /**
         * Render up a unique collision graphic
         * @param {Object<PIXI.Graphics>} [element]
         * @param {Boolean} [selected]
         */
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

        // | --------------------------------------------------------
        // | Draw up the UI elements
        // | --------------------------------------------------------

        /**
         * Create the icon to access the options of edition
         */
        ucreate_iEdit() {

            this.gui.iedit = El.Attr(El.create('img', this.gui.stage), {
                'id': 'iedit',
                'src': Routes.Map.plug('editor', 'system.png')
            })

            this.gui.iedit.onclick = () => {

                //this.gui.eOptions.isOpen ? this.gui.eOptions.close() : this.gui.eOptions.open();
                El.toggleClass(this.gui.iedit_stage, 'overlay_open')
            }

            this.gui.editorSprite = new Editor_Sprite();

            this.gui.editorParticle = new Editor_Particle();
        }

        /**
         * Create the options of the editor
         */
        ucreate_eOptions() {

            this.gui.iedit_stage = El.Attr(El.create('section', this.gui.stage), {
                'id': 'iedit_stage',
                'class': 'overlay_stage'
            })

            this.ucreate_layerControl();

            this.ucreate_suitTools();

        }

        /**
         * Control of the layer
         */
        ucreate_layerControl() {
            this.gui.layerControl = El.Attr(El.create('div', this.gui.iedit_stage), {
                'id': 'layerControl'
            })

            El.Attr(El.create('img', this.gui.layerControl), {
                'src': Routes.Map.plug('editor', 'layer1.png')
            }).onclick = () => {
                $.editor.collisionFloor = 'under'
                $gamePlayer.floor = $.editor.collisionFloor;
                SceneManager._scene._spriteset.refreshSprite();
            }

            El.Attr(El.create('img', this.gui.layerControl), {
                'src': Routes.Map.plug('editor', 'layer2.png')
            }).onclick = () => {
                $.editor.collisionFloor = 'base'
                $gamePlayer.floor = $.editor.collisionFloor;
                SceneManager._scene._spriteset.refreshSprite();
            }

            El.Attr(El.create('img', this.gui.layerControl), {
                'src': Routes.Map.plug('editor', 'layer3.png')
            }).onclick = () => {
                $.editor.collisionFloor = 'high'
                $gamePlayer.floor = $.editor.collisionFloor;
                SceneManager._scene._spriteset.refreshSprite();
            }
        }

        /**
         * Suit of tools
         */
        ucreate_suitTools() {
            this.gui.tools = {};

            this.gui.tools.container = El.Attr(El.create('section', this.gui.iedit_stage), {
                'id': 'suitTools'
            })

            $.config.eOptions.map(option => {
                this.gui.tools[option.control] = El.Attr(El.create('div', this.gui.tools.container), {
                    'class': 'suitTools_block'
                })

                El.Attr(El.create('img', this.gui.tools[option.control]), {
                    src: Routes.Map.plug('editor', option.icon)
                })

                El.Attr(El.create('label', this.gui.tools[option.control]), {}).innerHTML = option.label;

                this.gui.tools[option.control].onclick = () => {
                    $.editor.control = option.control;
                    El.removeClass(this.gui.iedit_stage, 'overlay_open')
                    this.refreshEditor();
                    this.setupEditor();
                }
            })
        }

        // | --------------------------------------------------------
        // | Update the elements over the main loop
        // | --------------------------------------------------------

        /**
         * Update the elements of the UI
         */
        updateUI() {
            if (TouchInput.isCancelled()) this.toolbar = !this.toolbar;

            if (this.toolbar === true) {
                El.removeClass(this.gui.stage, 'nested')
            } else {
                El.addClass(this.gui.stage, 'nested')
            }

            // update GUI.List
            if (typeof $.editor.control === 'string') {

                if (!($.editor.control.includes("-edit"))) {

                    // if ($.editor.control === "collision" && this.toolbar === true) {
                    //     if (this.oldIndex !== +this.gui.editor.el.targets.get()) {
                    //         this.oldIndex = +this.gui.editor.el.targets.get()
                    //         this.collisionDraw();
                    //         this.collisionGraphic(this.gui.editor.el.targets.current().target, true);
                    //     }
                    // }

                } else if (($.editor.control.includes("-edit"))) {
                    // wedit
                    if ($.editor.wedit !== null) {
                        this.wedit()
                    }

                }
            }

            this.graphicCollision.visible = ($.editor.control === "collision" || $.editor.control === "collision-editor");


            // sprite editor
            if (this.gui.editorSprite.target !== null && $.editor.control === 'sprite-editor') {
                this.gui.editorSprite.update();
            }
        }

        /**
         * Update the pivot of the axis position of the collision 
         * graphics
         */
        updateCollisionPivot() {
            for (let index = 0; index < this.collision.element.length; index++) {
                const element = this.collision.element[index];
                element._graphic.pivot.x = -(Haya.Map.Viewport.x);
                element._graphic.pivot.y = -(Haya.Map.Viewport.y);
            }
        }

        /**
         * Update the camera axis position 
         */
        old_updatePivot() {


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

        updatePivot() {
            if (this.toolbar === true) return;

            // direction
            if (TouchInput.isPressed() && !Input.isPressed('control')) {

                //if ($.editor.wedit = 'point' && !Input.isPressed('ctrl')) return;

                // RIGHT

                if (Haya.Mouse.x > $.mouse_dir.x) {
                    this.camera.x = Haya.DMath.fincrease(this.camera.x, 0, (Haya.Map.current.width - Graphics.width) + 1, 8)
                    this.display.x += 8;
                    if (this.display.x >= ((Haya.Map.current.width || Graphics.width) - Graphics.width)) {
                        this.display.x = ((Haya.Map.current.width || Graphics.width) - Graphics.width);
                    }
                }

                // LEFT

                if (Haya.Mouse.x < $.mouse_dir.x) {
                    this.display.x -= 8;
                    if (this.display.x <= 8) {
                        this.display.x = 0;
                    }
                    this.camera.x = Haya.DMath.fdecrease(this.camera.x, 0, (Haya.Map.current.width - Graphics.width) + 1, 8)
                }

                // UP

                if (Haya.Mouse.y < $.mouse_dir.y) {
                    this.camera.y = Haya.DMath.fdecrease(this.camera.y, 0, (Haya.Map.current.height - Graphics.height) * 1.5, 8)

                    //
                    this.display.y -= 8;

                    if (this.display.y <= 8) {
                        this.display.y = 0;
                    }
                }

                // DOWN
                if (Haya.Mouse.y > $.mouse_dir.y) {
                    this.display.y += 8;
                    if (this.display.y >= (Haya.Map.current.height) - (Graphics.height)) {
                        this.display.y = (Haya.Map.current.height) - (Graphics.height)
                    }
                    this.camera.y = Haya.DMath.fincrease(this.camera.y, 0, (Haya.Map.current.height - Graphics.height) * 1.5, 8)
                }
            } else {
                $.mouse_dir.x = Haya.Mouse.x;
                $.mouse_dir.y = Haya.Mouse.y;
            }

            // follow
            Haya.Map.Viewport.follow(this.camera, {
                speed: 4
            });
        }

        /**
         * Keyboard events
         */
        updateKeys() {
            if (Input.isTriggered('1')) {
                $.editor.collisionFloor = 'under'
                $gamePlayer.floor = $.editor.collisionFloor;
                SceneManager._scene._spriteset.refreshSprite();
            } else if (Input.isTriggered('2')) {
                $.editor.collisionFloor = 'base'
                $gamePlayer.floor = $.editor.collisionFloor;
                SceneManager._scene._spriteset.refreshSprite();
            } else if (Input.isTriggered('3')) {
                $.editor.collisionFloor = 'high'
                $gamePlayer.floor = $.editor.collisionFloor;
                SceneManager._scene._spriteset.refreshSprite();
            }
        }

        // | --------------------------------------------------------
        // | Methods to refresh some values & elements
        // | --------------------------------------------------------

        refreshEditor() {
            this.gui.editor.removeAttribute('class');
            El.removeChild(this.gui.editor)
            $.temp = {};
        }

        // | --------------------------------------------------------
        // | Methods to edit things on UI
        // | --------------------------------------------------------

        /**
         * Direct to the correct setup of the editor following the control
         */
        setupEditor() {
            switch ($.editor.control) {
                case 'light':
                    this.setupEditorLight();
                    break;
                case 'light-editor':
                    this.lightEditor();
                    break;
                case 'collision':
                    this.setupEditorCollision();
                    break;
                case 'collision-editor':
                    this.collisionEditor()
                    break;
                case 'sound':
                    this.setupEditorSound();
                    break
                case 'sound-editor':
                    this.soundEditor();
                    break
                case 'sprite':
                    this.setupEditorSprite();
                    break
                case 'sprite-editor':
                    this.spriteEditor();
                    break
                case 'particle':
                    this.setupEditorParticle();
                    break;
                case 'particle-editor':
                    this.particleEditor();
                case 'save':
                    this.save();
                    break;
                default:
                    $.editor.control = null
                    this.refreshEditor();
                    break;
            }
        }

        // | --------------------------------------------------------
        // | Light Editor
        // | --------------------------------------------------------

        setupEditorLight() {
            El.addClass(this.gui.editor, 'editor')

            // back button
            this.gui.editor.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.control = null
                    this.refreshEditor();
                }
            })
            //this.gui.editor.el.back.button.style.zIndex = '101;';

            // choose a target
            this.gui.editor.el.targets = new Components.list.Select({
                parent: this.gui.editor,
                label: 'Choose a target',
                data: this.lightTargets()
            })

            this.gui.editor.el.targets.select.onchange = () => {
                var target = this.gui.editor.el.targets.data.find(el => el.value === +this.gui.editor.el.targets.get())
                this.gui.editor.el.targets.choose(0);

                if (target.hasOwnProperty('target')) {
                    $.editor.control = 'light-editor';
                    $.editor.target = target.target;
                    //El.removeChild(this.gui.editor.el.targetEditor)
                    this.refreshEditor();
                    this.setupEditor();
                } else {
                    if (target.value === 1) { // point of light
                        this.gui.editor.window.setup.title = 'New Point of Light'
                        this.gui.editor.window.refresh();
                        this.gui.editor.window.components = [{
                            component: 'text',
                            label: 'Name:',
                            value: "point " + String(this.light.element.length + 1),
                            onchange: (value) => {
                                $.temp.lpName = value;
                            }
                        }, {
                            component: 'number',
                            min: 0,
                            max: 1e5,
                            default: 300,
                            step: 1,
                            onchange: (value) => {
                                $.temp.lpRadius = parseInt(value);
                            }
                        }, {
                            component: 'select',
                            label: 'Floor: ',
                            data: $.config.floor,
                            onchange: (value) => {
                                $.temp.lpFloor = $.config.floor.find(el => el.value === +value).label;
                            }
                        }, {
                            component: 'button',
                            label: 'Create',
                            class: 'btn-standard grid-center',
                            onclick: () => {
                                SceneManager._scene._spriteset.addLight(
                                    ($.temp.lpName || "point " + String(SceneManager._scene.light.element.length + 1)),
                                    "pixi", {
                                        radius: ($.temp.lpRadius || 300),
                                        kind: "point",
                                        floor: ($.temp.lpFloor || $.editor.collisionFloor)
                                    },
                                    SceneManager._scene._spriteset.sprite
                                )
                                this.gui.editor.el.targets.data = this.lightTargets();
                                this.gui.editor.el.targets.setOptions();

                                this.gui.editor.window.refresh()
                                this.gui.editor.window.close();
                            }
                        }, {
                            component: 'button',
                            label: 'Return',
                            class: 'btn-standard grid-center',
                            onclick: function () {
                                this.gui.editor.window.refresh()
                                this.gui.editor.window.close();
                            }
                        }]
                        this.gui.editor.window.open();
                        this.gui.editor.window.draw();
                        return
                    } else if (target.value === 2) { // dir of light
                        this.gui.editor.window.setup.title = 'New Light Directional'
                        this.gui.editor.window.refresh();

                        this.gui.editor.window.components = [{
                            component: 'text',
                            label: 'Name:',
                            value: "directional " + String(this.light.element.length + 1),
                            onchange: (value) => {
                                $.temp.lpName = value;
                            }
                        }, {
                            component: 'select',
                            label: 'Floor: ',
                            data: $.config.floor,
                            onchange: (value) => {
                                $.temp.lpFloor = $.config.floor.find(el => el.value === +value).label;
                            }
                        }, {
                            component: 'button',
                            label: 'Create',
                            class: 'btn-standard grid-center',
                            onclick: () => {

                                SceneManager._scene._spriteset.addLight(
                                    $.temp.lpName || ("directional " + String(SceneManager._scene.light.element.length + 1)),
                                    "pixi", {
                                        kind: "directional",
                                        target: new Point(0, 0),
                                        floor: ($.temp.lpFloor || $.editor.collisionFloor)
                                    },
                                    SceneManager._scene._spriteset.sprite
                                )
                                this.gui.editor.el.targets.data = this.lightTargets();
                                this.gui.editor.el.targets.setOptions();
                                this.gui.editor.window.refresh()
                                this.gui.editor.window.close();
                            }
                        }, {
                            component: 'button',
                            label: 'Return',
                            class: 'btn-standard grid-center',
                            onclick: function () {
                                this.gui.editor.window.refresh()
                                this.gui.editor.window.close();
                            }
                        }]
                        this.gui.editor.window.open();
                        this.gui.editor.window.draw();
                        return
                    } else if (target.value === 3) { // ambient
                        this.gui.editor.window.setup.title = 'New Light Ambient'
                        this.gui.editor.window.refresh();

                        this.gui.editor.window.components = [{
                            component: 'text',
                            label: 'Name:',
                            value: "ambient " + String(this.light.element.length + 1),
                            onchange: (value) => {
                                $.temp.lpName = value;
                            }
                        }, {
                            component: 'select',
                            label: 'Floor: ',
                            data: $.config.floor,
                            onchange: (value) => {
                                $.temp.lpFloor = $.config.floor.find(el => el.value === +value).label;
                            }
                        }, {
                            component: 'button',
                            label: 'Create',
                            class: 'btn-standard grid-center',
                            onclick: () => {

                                SceneManager._scene._spriteset.addLight(
                                    $.temp.lpName || ("ambient " + String(SceneManager._scene.light.element.length + 1)),
                                    "pixi", {
                                        kind: "ambient",
                                        floor: ($.temp.lpFloor || $.editor.collisionFloor)
                                    },

                                    SceneManager._scene._spriteset.sprite
                                )
                                this.gui.editor.el.targets.data = this.lightTargets();
                                this.gui.editor.el.targets.setOptions();
                                this.gui.editor.window.refresh()
                                this.gui.editor.window.close();
                            }
                        }, {
                            component: 'button',
                            label: 'Return',
                            class: 'btn-standard grid-center',
                            onclick: function () {
                                this.gui.editor.window.refresh()
                                this.gui.editor.window.close();
                            }
                        }]
                        this.gui.editor.window.open();
                        this.gui.editor.window.draw();
                        return;
                    } else if (target.value === 4) { // sprite
                        this.gui.editor.window.setup.title = 'New Sprite Light'
                        this.gui.editor.window.refresh();

                        if (El.is(El.id('file-upload'))) {
                            document.body.removeChild(El.id('file-upload'))
                        }

                        this.gui.editor.window.components = [{
                            component: 'text',
                            label: 'Name:',
                            value: "sprite " + String(this.light.element.length + 1),
                            onchange: (value) => {
                                $.temp.lpName = value;
                            }
                        }, {
                            component: 'select',
                            label: 'Floor: ',
                            data: $.config.floor,
                            onchange: (value) => {
                                $.temp.lpFloor = $.config.floor.find(el => el.value === +value).label;
                            }
                        }, {
                            component: 'button',
                            label: 'File',
                            class: 'btn-standard grid-center',
                            onclick: () => {
                                El.Attr(El.create('input', document.body), {
                                    type: 'file',
                                    accept: '.png, .jpg',
                                    id: 'file-upload'
                                }).onchange = (event) => {
                                    $.temp.url = event.target.files[0].path;

                                }
                                El.id('file-upload').click();
                            }
                        }, {
                            component: 'button',
                            label: 'Create',
                            class: 'btn-standard grid-center',
                            onclick: () => {

                                if (!$.temp.hasOwnProperty('url') || typeof $.temp.url !== 'string') return false;

                                SceneManager._scene._spriteset.addLight(
                                    $.temp.lpName || "sprite " + String(SceneManager._scene.light.element.length + 1),
                                    "sprite", {
                                        texture: $.temp.url,
                                        floor: ($.temp.lpFloor || $.editor.collisionFloor)
                                    },
                                    SceneManager._scene._spriteset.sprite
                                )

                                this.gui.editor.el.targets.data = this.lightTargets();
                                this.gui.editor.el.targets.setOptions();
                                this.gui.editor.window.refresh()
                                this.gui.editor.window.close();
                            }
                        }, {
                            component: 'button',
                            label: 'Return',
                            class: 'btn-standard grid-center',
                            onclick: function () {
                                this.gui.editor.window.refresh()
                                this.gui.editor.window.close();
                            }
                        }]
                        this.gui.editor.window.open();
                        this.gui.editor.window.draw();
                        return;
                    }

                }
            }
        }

        lightEditor() {
            El.addClass(this.gui.editor, 'editor')

            this.gui.editor.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.control = 'light'
                    this.refreshEditor();
                    this.setupEditor();
                }
            })

            // position
            this.gui.editor.el.position = new Components.button.Basic({
                label: `x ${Haya.DMath.float($.editor.target.sprite.x)} | y: ${Haya.DMath.float($.editor.target.sprite.y)}`,
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.wedit = $.editor.wedit === 'position' ? null : 'position';

                }
            })

            // target
            if ($.editor.target.kind === 'directional') {
                this.gui.editor.el.targetPos = new Components.button.Basic({
                    label: `Target: x ${Haya.DMath.float($.editor.target.sprite.target.x)} | y: ${Haya.DMath.float($.editor.target.sprite.target.y)}`,
                    parent: this.gui.editor,
                    onclick: () => {
                        $.editor.wedit = $.editor.wedit === 'targetPos' ? null : 'targetPos';

                    }
                })
            }

            // opacity
            this.gui.editor.el.opacity = new Components.input.Range({
                parent: this.gui.editor,
                label: 'Opacity &value%',
                min: 0.0,
                max: 100.0,
                default: Haya.DMath.float($.editor.target.sprite.alpha * 100),
                step: 1.0,
                format: (value) => {
                    return Haya.DMath.float(+(value));
                },
                onchange: (value) => {
                    $.editor.target.sprite.alpha = Haya.DMath.float(value / 100)
                }
            })

            // time
            this.gui.editor.el.time = new Components.list.Select({
                parent: this.gui.editor,
                label: `Period of Time: ${$.editor.target.sprite.time}`,
                data: $.config.periodTime,
                onchange: () => {
                    let time = Haya.Map.Time.isPeriod(parseInt(this.gui.editor.el.time.get()));
                    $.editor.target.sprite.time = time;
                    this.gui.editor.el.time.label.innerHTML = `Period of Time: ${$.editor.target.sprite.time}`
                }
            })
            this.gui.editor.el.time.choose(Haya.Map.Time.isPeriod($.editor.target.sprite.time))


            // switch
            this.gui.editor.el.switch = new Components.input.Number({
                label: `Switch ID: ${$.editor.target.switch}`,
                parent: this.gui.editor,
                default: $.editor.target.switch,
                min: -1,
                max: Infinity,
                step: 1
            })
            this.gui.editor.el.switch.input.onchange = () => {
                $.editor.target.switch = this.gui.editor.el.switch.get();
                this.gui.editor.el.switch.label = `Switch ID: ${$.editor.target.switch}`
            }

            // //colorListStage
            // this.gui.editor.el.colorListStage = El.Attr(El.create('section', this.gui.editor.window))

            // color
            this.gui.editor.el.colors = new Components.button.Basic({
                label: 'Color',
                parent: this.gui.editor,
                onclick: () => {
                    this.gui.editor.window.setup.title = `Color Editor: ${$.editor.target.sprite.color} <span class='circle-ball-color' style='background-color: ${$.editor.target.sprite.color.replace("0x", "#")};'></span>`
                    let color = Haya.Utils.Color.hexRgb(String($.editor.target.sprite.color).replace("0x", "#"));

                    $.editor.pallete.red = color.red;
                    $.editor.pallete.green = color.green;
                    $.editor.pallete.blue = color.blue;
                    this.gui.editor.window.components = [{
                        component: 'range',
                        label: 'Red &value:',
                        min: 0,
                        max: 255,
                        step: 1,
                        default: $.editor.pallete.red,
                        onchange: (value) => {
                            $.editor.pallete.red = parseInt(value);

                            let color = Haya.Utils.Color.rgbHex($.editor.pallete.red, $.editor.pallete.green, $.editor.pallete.blue, "0x");

                            $.editor.target.sprite.color = color;
                            $.editor.target.sprite.tint = color;

                            this.gui.editor.window.title.innerHTML = `Color Editor: ${$.editor.target.sprite.color} <span class='circle-ball-color' style='background-color: ${$.editor.target.sprite.color.replace("0x", "#")};'></span>`
                        }
                    }, {
                        component: 'range',
                        label: 'Green &value:',
                        min: 0,
                        max: 255,
                        step: 1,
                        default: $.editor.pallete.green,
                        onchange: (value) => {
                            $.editor.pallete.green = parseInt(value);

                            let color = Haya.Utils.Color.rgbHex($.editor.pallete.red, $.editor.pallete.green, $.editor.pallete.blue, "0x");

                            $.editor.target.sprite.color = color;
                            $.editor.target.sprite.tint = color;

                            this.gui.editor.window.title.innerHTML = `Color Editor: ${$.editor.target.sprite.color} <span class='circle-ball-color' style='background-color: ${$.editor.target.sprite.color.replace("0x", "#")};'></span>`
                        }
                    }, {
                        component: 'range',
                        label: 'Blue &value:',
                        min: 0,
                        max: 255,
                        step: 1,
                        default: $.editor.pallete.blue,
                        onchange: (value) => {
                            $.editor.pallete.blue = parseInt(value);

                            let color = Haya.Utils.Color.rgbHex($.editor.pallete.red, $.editor.pallete.green, $.editor.pallete.blue, "0x");

                            $.editor.target.sprite.color = color;
                            $.editor.target.sprite.tint = color;

                            this.gui.editor.window.title.innerHTML = `Color Editor: ${$.editor.target.sprite.color} <span class='circle-ball-color' style='background-color: ${$.editor.target.sprite.color.replace("0x", "#")};'></span>`
                        }
                    }, {
                        component: 'modal',
                        class: 'wcolor-list-edit',
                        open: true,
                        components: [{
                            component: 'list-basic',
                            onclick: (object, item) => {
                                $.editor.target.sprite.color = object.color;
                                $.editor.target.sprite.tint = object.color;
                                let color = Haya.Utils.Color.hexRgb(String(object.color).replace("0x", "#"));
                                $.editor.pallete.red = color.red;
                                $.editor.pallete.green = color.green;
                                $.editor.pallete.blue = color.blue;
                                this.gui.editor.window.components[4].set(color.red);
                                this.gui.editor.window.components[5].set(color.green);
                                this.gui.editor.window.components[6].set(color.blue);

                                this.gui.editor.window.title.innerHTML = `Color Editor: ${$.editor.target.sprite.color} <span class='circle-ball-color' style='background-color: ${$.editor.target.sprite.color.replace("0x", "#")};'></span>`
                            },
                            data: $.colorPallete(),
                            property: 'label',
                            id: 'color-editor-list',
                            class: 'tree-tag'
                        }]
                    }]


                    this.gui.editor.window.open();
                    this.gui.editor.window.draw();
                }
            })


            // PIXI
            if ($.editor.target.kind !== "sprite") {

                // lightHeight
                this.gui.editor.el.lightHeight = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Light Height (v/100):',
                    min: -1000.0,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.sprite.lightHeight),
                    step: ".10",
                    format: 'float'
                })
                this.gui.editor.el.lightHeight.input.onchange = () => {
                    this.gui.editor.el.lightHeight.input.value = this.gui.editor.el.lightHeight.input.value / 100;
                    $.editor.target.sprite.lightHeight = Haya.DMath.float(this.gui.editor.el.lightHeight.get())

                }

                // brightness
                this.gui.editor.el.brightness = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Brightness (v/100):',
                    min: -1000.0,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.sprite.brightness),
                    step: .1,
                    format: 'float'
                })
                this.gui.editor.el.brightness.input.onchange = () => {
                    this.gui.editor.el.brightness.input.value = this.gui.editor.el.brightness.input.value / 100;
                    $.editor.target.sprite.brightness = Haya.DMath.float(this.gui.editor.el.brightness.get())

                }

                //falloffa
                this.gui.editor.el.falloffA = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Falloff A (v/100):',
                    min: -1000.0,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.sprite.falloff[0]),
                    step: .1,
                    format: 'float'
                })
                this.gui.editor.el.falloffA.input.onchange = () => {
                    this.gui.editor.el.falloffA.input.value = this.gui.editor.el.falloffA.input.value / 100;
                    $.editor.target.sprite.falloff[0] = Haya.DMath.float(this.gui.editor.el.falloffA.get())

                }

                //falloffb
                this.gui.editor.el.falloffB = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Falloff B (v/100):',
                    min: -1000.0,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.sprite.falloff[1]),
                    step: .1,
                    format: 'float'
                })
                this.gui.editor.el.falloffB.input.onchange = () => {
                    this.gui.editor.el.falloffB.input.value = this.gui.editor.el.falloffB.input.value / 100;
                    $.editor.target.sprite.falloff[1] = Haya.DMath.float(this.gui.editor.el.falloffB.get())

                }

                //falloffC
                this.gui.editor.el.falloffC = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Falloff C (v/100):',
                    min: -1000.0,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.sprite.falloff[2]),
                    step: .1,
                    format: 'float'
                })
                this.gui.editor.el.falloffC.input.onchange = () => {
                    this.gui.editor.el.falloffC.input.value = this.gui.editor.el.falloffC.input.value / 100;
                    $.editor.target.sprite.falloff[2] = Haya.DMath.float(this.gui.editor.el.falloffC.get())

                }

            } else {
                // blend
                this.gui.editor.el.blendMode = new Components.list.Select({
                    parent: this.gui.editor,
                    label: 'Blend Mode:',
                    data: $.blendMode_select(),
                    onchange: () => {
                        let kind = parseInt(this.gui.editor.el.blendMode.get())

                        $.editor.target.sprite.blendMode = $.editor.blend.list[kind][0];
                        //this.gui.editor.el.blendMode.choose(kind);
                    }
                })
                this.gui.editor.el.blendMode.choose($.editor.target.sprite.blendMode)

                // scaleX
                this.gui.editor.el.scaleX = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Scale X (v/100):',
                    min: -1000.0,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.sprite.scale.x),
                    step: .1,
                    format: 'float'
                })
                this.gui.editor.el.scaleX.input.onchange = () => {
                    this.gui.editor.el.scaleX.input.value = this.gui.editor.el.scaleX.input.value / 100;
                    $.editor.target.sprite.scale.x = Haya.DMath.float(this.gui.editor.el.scaleX.get())

                }

                // scaleY
                this.gui.editor.el.scaleY = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Scale Y (v/100):',
                    min: -1000.0,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.sprite.scale.y),
                    step: .1,
                    format: 'float'
                })
                this.gui.editor.el.scaleY.input.onchange = () => {
                    this.gui.editor.el.scaleY.input.value = this.gui.editor.el.scaleY.input.value / 100;
                    $.editor.target.sprite.scale.y = Haya.DMath.float(this.gui.editor.el.scaleY.get())

                }

                // Anchor X
                this.gui.editor.el.anchorX = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Anchor X (v/100):',
                    min: -1000.0,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.sprite.anchor.x),
                    step: .1,
                    format: 'float'
                })
                this.gui.editor.el.anchorX.input.onchange = () => {
                    this.gui.editor.el.anchorX.input.value = this.gui.editor.el.anchorX.input.value / 100;
                    $.editor.target.sprite.anchor.x = Haya.DMath.float(this.gui.editor.el.anchorX.get())

                }

                // Anchor Y
                this.gui.editor.el.anchorY = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Anchor Y (v/100):',
                    min: -1000.0,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.sprite.anchor.y),
                    step: .1,
                    format: 'float'
                })
                this.gui.editor.el.anchorY.input.onchange = () => {
                    this.gui.editor.el.anchorY.input.value = this.gui.editor.el.anchorY.input.value / 100;
                    $.editor.target.sprite.anchor.y = Haya.DMath.float(this.gui.editor.el.anchorY.get())

                }

                // Rotation
                this.gui.editor.el.rotation = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Rotation:',
                    min: -360.0,
                    max: 360.0,
                    default: Haya.DMath.float(Haya.DMath.degrees($.editor.target.sprite.rotation)),
                    step: 1,
                    format: 'float'
                })
                this.gui.editor.el.rotation.input.onchange = () => {
                    $.editor.target.sprite.rotation = Haya.DMath.radians(Haya.DMath.float(this.gui.editor.el.rotation.get()))

                }

            }

            // Effects
            this.gui.editor.el.effects = new Components.button.Basic({
                label: 'Effects',
                parent: this.gui.editor,
                onclick: () => {
                    this.gui.editor.window.setup.title = 'Effects Property';


                    // comps
                    this.gui.editor.window.components = [{
                            component: 'modal',
                            class: 'window-sub',
                            components: [{
                                    component: 'checkbox',
                                    label: 'Pulse Effect Active?',
                                    onchange: (checked, checkbox) => {
                                        console.log($.editor.target);

                                        $.editor.target.pulse.value = checked;
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Speed (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float($.editor.target.pulse.speed),
                                    onchange: (value, number) => {
                                        console.log(value, number);

                                        number.input.value = value / 10;
                                        $.editor.target.pulse.speed = Haya.DMath.float(value / 10)
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Mininum (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float($.editor.target.pulse.min),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        $.editor.target.pulse.min = Haya.DMath.float(value / 10)
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Maximun (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float($.editor.target.pulse.max),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        $.editor.target.pulse.max = Haya.DMath.float(value / 10)
                                    }
                                }, {
                                    component: 'number',
                                    label: 'Duration (v/10 | seconds):',
                                    min: 0,
                                    max: 1000,
                                    step: 0.1,
                                    format: 'float',
                                    default: Haya.DMath.float($.editor.target.pulse.duration),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        $.editor.target.pulse.duration = Haya.DMath.float(value / 10)
                                    }
                                }
                            ]
                        },
                        {
                            component: 'modal',
                            class: 'window-sub',
                            components: [{
                                    component: 'checkbox',
                                    checked: $.editor.target.oscilation.value,
                                    label: 'Oscilation Effect Active?',
                                    onchange: (checked, checkbox) => {
                                        $.editor.target.oscilation.value = checked;
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Speed (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float($.editor.target.oscilation.speed),
                                    onchange: (value, number) => {
                                        console.log(value, number);

                                        number.input.value = value / 10;
                                        $.editor.target.oscilation.speed = Haya.DMath.float(value / 10)
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Mininum (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float($.editor.target.oscilation.min),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        $.editor.target.oscilation.min = Haya.DMath.float(value / 10)
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Maximun (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float($.editor.target.oscilation.max),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        $.editor.target.oscilation.max = Haya.DMath.float(value / 10)
                                    }
                                }, {
                                    component: 'number',
                                    label: 'Duration (v/10 | seconds):',
                                    min: 0,
                                    max: 1000,
                                    step: 0.1,
                                    format: 'float',
                                    default: Haya.DMath.float($.editor.target.oscilation.duration),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        $.editor.target.oscilation.duration = Haya.DMath.float(value / 10)
                                    }
                                }
                            ]
                        }
                    ]



                    // draw
                    this.gui.editor.window.open();
                    this.gui.editor.window.draw();
                }
            })

            // Delete
            this.gui.editor.el.remove = new Components.button.Basic({
                label: 'Delete!',
                parent: this.gui.editor,
                onclick: () => {
                    Components.notification.Create({
                        parent: this.gui.stage,
                        pause: true,
                        label: 'Are you sure that you want to delete it?',
                        components: [{
                                component: 'button',
                                label: 'Delete',
                                class: 'btn-white',
                                onclick: function () {
                                    $.editor.wedit = null;
                                    SceneManager._scene._spriteset.removeLight($.editor.target._name);
                                    $.editor.control = 'light';
                                    SceneManager._scene.refreshEditor();
                                    SceneManager._scene.setupEditor();
                                    this._popup.destroy(true);
                                }
                            },
                            {
                                component: 'button',
                                label: 'Return',
                                class: 'btn-white',
                                onclick: function () {
                                    this._popup.destroy(true);
                                }
                            }
                        ]
                    })
                }
            })

        }

        lightTargets() {
            // defaults
            var data = [{
                label: 'none',
                value: 0
            }, {
                label: 'New Point Light',
                value: 1
            }, {
                label: 'New Directional Light',
                value: 2
            }, {
                label: 'New Ambient Light',
                value: 3
            }, {
                label: 'New Sprite Light',
                value: 4
            }];

            // targets
            Object.keys(this.light.source).map((lights, index) => {
                let element = this.light.source[lights];

                //console.log('editor:', $.editor.collisionFloor, 'e:', element.floor, element._setup.floor === $.editor.collisionFloor);


                if (element._setup.floor === $.editor.collisionFloor) {

                    data.push({
                        label: `[${element.sprite.time}] ${element.kind}_${element._name}`,
                        value: data.length,
                        target: element
                    })
                }
            })

            return data;
        }

        // | --------------------------------------------------------
        // | Collision Editor
        // | --------------------------------------------------------

        setupEditorCollision() {
            El.addClass(this.gui.editor, 'editor')

            // back button
            this.gui.editor.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.control = null
                    this.refreshEditor();
                }
            })
            //this.gui.editor.el.back.button.style.zIndex = '101;';

            // create
            this.gui.editor.el.create = new Components.list.Select({
                parent: this.gui.editor,
                label: 'Add a new collision',
                data: [{
                    label: 'none',
                    value: 0
                }, {
                    label: 'New Polygon',
                    value: 1
                }, {
                    label: 'New Circle',
                    value: 2
                }, {
                    label: 'New Rect',
                    value: 3
                }]
            })

            this.gui.editor.el.create.select.onchange = () => {
                var target = this.gui.editor.el.create.data.find(el => el.value === +this.gui.editor.el.create.get())
                this.gui.editor.el.create.choose(0);

                // 
                if (target.value === 1) { // polygon
                    this.gui.editor.window.setup.title = 'New Polygon'
                    this.gui.editor.window.refresh();
                    this.gui.editor.window.components = [{
                        component: 'text',
                        label: 'Name:',
                        value: "polygon " + String(SceneManager._scene.collision.element.length + 1),
                        onchange: (value) => {
                            $.temp.lpName = value;
                        }
                    }, {
                        component: 'select',
                        label: 'Floor: ',
                        data: $.config.floor,
                        onchange: (value) => {
                            $.temp.lpFloor = $.config.floor.find(el => el.value === +value).label;
                        }
                    }, {
                        component: 'button',
                        label: 'Create',
                        class: 'btn-standard grid-center',
                        onclick: () => {

                            let name = ($.temp.lpName || "polygon " + String(SceneManager._scene.collision.element.length + 1))
                            SceneManager._scene.collision.source[name] = Haya.Collision.createCollision(
                                $.collision, "polygon", {
                                    kind: "polygon",
                                    x: ((Graphics.width / 2) + SceneManager._scene.display.x),
                                    y: ((Graphics.height / 2) + SceneManager._scene.display.y),
                                    points: [
                                        [0, 0],
                                        [0, 100]
                                    ],
                                    floor: ($.temp.lpFloor || $.editor.collisionFloor)
                                }
                            )
                            SceneManager._scene.collision.source[name]._name = name;
                            SceneManager._scene.collision.source[name]._kind = 'polygon';
                            SceneManager._scene.collision.source[name]._graphic = new PIXI.Graphics();
                            SceneManager._scene.graphicCollision.addChild(SceneManager._scene.collision.source[name]._graphic);
                            SceneManager._scene.collision.element.push(SceneManager._scene.collision.source[name]);


                            this.gui.editor.el.targets.data = this.collisionTargets();
                            this.gui.editor.el.targets.refresh();
                            $.editor.control = 'collision'
                            this.refreshEditor();
                            this.setupEditor();

                            this.gui.editor.window.refresh()
                            this.gui.editor.window.close();
                        }
                    }, {
                        component: 'button',
                        label: 'Return',
                        class: 'btn-standard grid-center',
                        onclick: function () {
                            this.gui.editor.window.refresh()
                            this.gui.editor.window.close();
                        }
                    }]
                    this.gui.editor.window.open();
                    this.gui.editor.window.draw();
                    return
                }

                if (target.value === 2) { // circle
                    this.gui.editor.window.setup.title = 'New Circle'
                    this.gui.editor.window.refresh();
                    this.gui.editor.window.components = [{
                        component: 'text',
                        label: 'Name:',
                        value: "circle " + String(SceneManager._scene.collision.element.length + 1),
                        onchange: (value) => {
                            $.temp.lpName = value;
                        }
                    }, {
                        component: 'select',
                        label: 'Floor: ',
                        data: $.config.floor,
                        onchange: (value) => {
                            $.temp.lpFloor = $.config.floor.find(el => el.value === +value).label;
                        }
                    }, {
                        component: 'button',
                        label: 'Create',
                        class: 'btn-standard grid-center',
                        onclick: () => {

                            let name = ($.temp.lpName || "circle " + String(SceneManager._scene.collision.element.length + 1))
                            SceneManager._scene.collision.source[name] = Haya.Collision.createCollision(
                                $.collision, "circle", {
                                    kind: "circle",
                                    x: ((Graphics.width / 2) + SceneManager._scene.display.x),
                                    y: ((Graphics.height / 2) + SceneManager._scene.display.y),
                                    radius: 16
                                }
                            )
                            SceneManager._scene.collision.source[name]._name = name;
                            SceneManager._scene.collision.source[name]._kind = 'circle';
                            SceneManager._scene.collision.source[name]._graphic = new PIXI.Graphics();
                            SceneManager._scene.graphicCollision.addChild(SceneManager._scene.collision.source[name]._graphic);
                            SceneManager._scene.collision.element.push(SceneManager._scene.collision.source[name]);


                            this.gui.editor.el.targets.data = this.collisionTargets();
                            this.gui.editor.el.targets.refresh();
                            $.editor.control = 'collision'
                            this.refreshEditor();
                            this.setupEditor();

                            this.gui.editor.window.refresh()
                            this.gui.editor.window.close();
                        }
                    }, {
                        component: 'button',
                        label: 'Return',
                        class: 'btn-standard grid-center',
                        onclick: function () {
                            this.gui.editor.window.refresh()
                            this.gui.editor.window.close();
                        }
                    }]
                    this.gui.editor.window.open();
                    this.gui.editor.window.draw();
                    return
                }

                if (target.value === 3) { // rect
                    this.gui.editor.window.setup.title = 'New Rect'
                    this.gui.editor.window.refresh();
                    this.gui.editor.window.components = [{
                        component: 'text',
                        label: 'Name:',
                        value: "rect " + String(SceneManager._scene.collision.element.length + 1),
                        onchange: (value) => {
                            $.temp.lpName = value;
                        }
                    }, {
                        component: 'select',
                        label: 'Floor: ',
                        data: $.config.floor,
                        onchange: (value) => {
                            $.temp.lpFloor = $.config.floor.find(el => el.value === +value).label;
                        }
                    }, {
                        component: 'button',
                        label: 'Create',
                        class: 'btn-standard grid-center',
                        onclick: () => {

                            let name = ($.temp.lpName || "rect " + String(SceneManager._scene.collision.element.length + 1))
                            SceneManager._scene.collision.source[name] = Haya.Collision.createCollision(
                                $.collision, "rect", {
                                    kind: "rect",
                                    x: ((Graphics.width / 2) + SceneManager._scene.display.x),
                                    y: ((Graphics.height / 2) + SceneManager._scene.display.y),
                                    points: [60, 20],
                                    floor: $.temp.lpFloor
                                }
                            )
                            SceneManager._scene.collision.source[name]._name = name;
                            SceneManager._scene.collision.source[name]._kind = 'rect';
                            SceneManager._scene.collision.source[name]._graphic = new PIXI.Graphics();
                            SceneManager._scene.graphicCollision.addChild(SceneManager._scene.collision.source[name]._graphic);
                            SceneManager._scene.collision.element.push(SceneManager._scene.collision.source[name]);


                            this.gui.editor.el.targets.data = this.collisionTargets();
                            this.gui.editor.el.targets.refresh();
                            $.editor.control = 'collision'
                            this.refreshEditor();
                            this.setupEditor();

                            this.gui.editor.window.refresh()
                            this.gui.editor.window.close();
                        }
                    }, {
                        component: 'button',
                        label: 'Return',
                        class: 'btn-standard grid-center',
                        onclick: function () {
                            this.gui.editor.window.refresh()
                            this.gui.editor.window.close();
                        }
                    }]
                    this.gui.editor.window.open();
                    this.gui.editor.window.draw();
                    return
                }
            }

            // target
            this.gui.editor.el.targets = new Components.list.Basic({
                parent: this.gui.editor,
                data: this.collisionTargets(),
                onclick: (object, element) => {

                    $.editor.control = 'collision-editor'
                    $.editor.target = object.target
                    this.collisionDraw();
                    this.collisionGraphic($.editor.target, true);
                    this.refreshEditor();
                    this.setupEditor();

                },
                onhover: (object, element) => {
                    this.collisionDraw();
                    this.collisionGraphic(object.target, true)
                }
            })

        }

        
        collisionEditor() {
            El.addClass(this.gui.editor, 'editor')


            $.editor.wedit = null;
            $.editor.weditChange = false;
            const kind = $.editor.target._kind.toLowerCase()

            // back
            this.gui.editor.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.control = 'collision'
                    this.refreshEditor();
                    this.setupEditor();
                }
            })

            // position
            this.gui.editor.el.position = new Components.button.Basic({
                label: `x ${Haya.DMath.float($.editor.target.x)} | y: ${Haya.DMath.float($.editor.target.y)}`,
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.wedit = $.editor.wedit === 'position' ? null : 'position';

                }
            })

            // KIND.Circle
            if (kind === 'circle') {
                // radius
                this.gui.editor.el.radius = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Radius:',
                    min: 1,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.radius),
                    step: 1
                })
                this.gui.editor.el.radius.input.onchange = () => {
                    $.editor.target.radius = parseInt(this.gui.editor.el.radius.get())
                    this.collisionGraphic($.editor.target, true)
                }

                // scale
                this.gui.editor.el.scale = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Scale (v/10):',
                    min: 1,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.scale),
                    step: 0.1,
                    format: 'float'
                })
                this.gui.editor.el.scale.input.onchange = () => {
                    this.gui.editor.el.scale.input.value = this.gui.editor.el.scale.get() / 10
                    $.editor.target.scale = Haya.DMath.float(this.gui.editor.el.scale.get())
                    this.collisionGraphic($.editor.target, true)
                }
            }

            // KIND.Rect
            if (kind === 'rect') {
                // scale X
                this.gui.editor.el.scaleX = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Scale X (v/10):',
                    min: 1,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.scale_x),
                    step: 0.1,
                    format: 'float'
                })
                this.gui.editor.el.scaleX.input.onchange = () => {
                    this.gui.editor.el.scaleX.input.value = this.gui.editor.el.scaleX.get() / 10
                    $.editor.target.scale_x = Haya.DMath.float(this.gui.editor.el.scaleX.get())
                    this.collisionGraphic($.editor.target, true)
                }

                // scale Y
                this.gui.editor.el.scaleY = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Scale Y (v/10):',
                    min: 1,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.scale_y),
                    step: 0.1,
                    format: 'float'
                })
                this.gui.editor.el.scaleY.input.onchange = () => {
                    this.gui.editor.el.scaleY.input.value = this.gui.editor.el.scaleY.get() / 10
                    $.editor.target.scale_y = Haya.DMath.float(this.gui.editor.el.scaleY.get())
                    this.collisionGraphic($.editor.target, true)
                }

                // scale Average
                this.gui.editor.el.scaleA = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Average Scale (v/10):',
                    min: 1,
                    max: 1000.0,
                    default: Haya.DMath.float(($.editor.target.scale_y + $.editor.target.scale_x) / 2),
                    step: 0.1,
                    format: 'float'
                })
                this.gui.editor.el.scaleA.input.onchange = () => {
                    this.gui.editor.el.scaleA.input.value = this.gui.editor.el.scaleA.get() / 10
                    $.editor.target.scale_x = Haya.DMath.float(this.gui.editor.el.scaleA.get())
                    $.editor.target.scale_y = Haya.DMath.float(this.gui.editor.el.scaleA.get())
                    this.collisionGraphic($.editor.target, true)
                }
            }

            // KIND.Polygon
            if (kind === 'polygon') {
                // new point
                this.gui.editor.el.newPoint = new Components.button.Basic({
                    label: 'New Point',
                    parent: this.gui.editor,
                    onclick: () => {
                        $.editor.target.cachePoints.push([
                            $.editor.target.x - ((Graphics.width / 2) + this.display.x),
                            $.editor.target.y - ((Graphics.width / 2) + this.display.y),
                        ])

                        $.editor.target.setPoints($.editor.target.cachePoints)

                        this.gui.editor.el.points.data = this.collisionPoints();
                        this.gui.editor.el.points.setOptions();
                    }
                })

                // scale X
                this.gui.editor.el.scaleX = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Scale X (v/10):',
                    min: 1,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.scale_x),
                    step: 0.1,
                    format: 'float'
                })
                this.gui.editor.el.scaleX.input.onchange = () => {
                    this.gui.editor.el.scaleX.input.value = this.gui.editor.el.scaleX.get() / 10
                    $.editor.target.scale_x = Haya.DMath.float(this.gui.editor.el.scaleX.get())
                    this.collisionGraphic($.editor.target, true)
                }

                // scale Y
                this.gui.editor.el.scaleY = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Scale Y (v/10):',
                    min: 1,
                    max: 1000.0,
                    default: Haya.DMath.float($.editor.target.scale_y),
                    step: 0.1,
                    format: 'float'
                })
                this.gui.editor.el.scaleY.input.onchange = () => {
                    this.gui.editor.el.scaleY.input.value = this.gui.editor.el.scaleY.get() / 10
                    $.editor.target.scale_y = Haya.DMath.float(this.gui.editor.el.scaleY.get())
                    this.collisionGraphic($.editor.target, true)
                }

                // points
                this.gui.editor.el.points = new Components.list.Select({
                    parent: this.gui.editor,
                    label: 'Polygon Points:',
                    data: this.collisionPoints()
                })

                this.gui.editor.el.points.select.onchange = () => {
                    var target = this.gui.editor.el.points.data.find(el => el.value === +this.gui.editor.el.points.get())
                    this.gui.editor.el.points.choose(0);
                    if (target.id === null) return;
                    $.temp.pointId = target.id
                    $.editor.wedit = 'point';
                }
            }

            // Padding
            this.gui.editor.el.padding = new Components.input.Number({
                parent: this.gui.editor,
                label: 'Padding:',
                min: 1,
                max: 1000.0,
                default: Haya.DMath.float($.editor.target.padding),
                step: 1
            })
            this.gui.editor.el.padding.input.onchange = () => {
                $.editor.target.padding = parseInt(this.gui.editor.el.padding.get())
                this.collisionGraphic($.editor.target, true)
            }

            // not in circle alone
            if (kind !== 'circle') {
                // Rotation
                this.gui.editor.el.rotation = new Components.input.Number({
                    parent: this.gui.editor,
                    label: 'Rotation:',
                    min: -360.0,
                    max: 360.0,
                    default: Haya.DMath.float(Haya.DMath.degrees($.editor.target.angle)),
                    step: 1,
                    format: 'float'
                })
                this.gui.editor.el.rotation.input.onchange = () => {
                    $.editor.target.rotation = Haya.DMath.radians(Haya.DMath.float(this.gui.editor.el.rotation.get()))
                    this.collisionGraphic($.editor.target, true)

                }
            }

            // switch
            this.gui.editor.el.switch = new Components.input.Number({
                label: `Switch ID: ${$.editor.target.switch}`,
                parent: this.gui.editor,
                default: $.editor.target.switch,
                min: -1,
                max: Infinity,
                step: 1
            })
            this.gui.editor.el.switch.input.onchange = () => {
                $.editor.target.switch = this.gui.editor.el.switch.get();
                this.gui.editor.el.switch.label = `Switch ID: ${$.editor.target.switch}`
            }

            // floor
            this.gui.editor.el.floor = new Components.list.Select({
                parent: this.gui.editor,
                label: 'Floor:',
                data: $.config.floor
            })
            this.gui.editor.el.floor.select.onchange = () => {
                var target = this.gui.editor.el.floor.data.find(el => el.value === +this.gui.editor.el.floor.get())
                $.editor.target.floor = target.label;
                this.collisionGraphic($.editor.target, true)
            }
            let defaultFloor = this.gui.editor.el.floor.data.find(el => el.label === $.editor.target.floor).value
            this.gui.editor.el.floor.choose(defaultFloor)

            // link to the floor?
            this.gui.editor.el.linkTo = new Components.boolean.Checkbox({
                parent: this.gui.editor,
                label: 'Link to the floor?',
                checked: $.editor.target.linkto,
                onchange: (checked, checkbox) => {
                    $.editor.target.linkto = checked;
                    if ($.editor.target.linkto === true) {
                        $.editor.target.scale_y = 0.1;
                    }
                }
            })

            // kind of link
            this.gui.editor.el.linkKind = new Components.list.Select({
                parent: this.gui.editor,
                label: 'Floor:',
                data: [{
                    label: 'horizontal',
                    value: 0
                }, {
                    label: 'vertical',
                    value: 1
                }]
            })
            this.gui.editor.el.linkKind.select.onchange = () => {
                var target = this.gui.editor.el.linkKind.data.find(el => el.value === +this.gui.editor.el.linkKind.get())
                $.editor.target.linkKind = target.label;
            }
            let defaultKind = this.gui.editor.el.linkKind.data.find(el => el.label === $.editor.target.linkKind.toLowerCase()).value
            this.gui.editor.el.linkKind.choose(defaultKind)

            // delete
            this.gui.editor.el.remove = new Components.button.Basic({
                label: 'Delete!',
                parent: this.gui.editor,
                onclick: () => {
                    Components.notification.Create({
                        parent: this.gui.stage,
                        pause: true,
                        label: 'Are you sure that you want to delete it?',
                        components: [{
                                component: 'button',
                                label: 'Delete',
                                class: 'btn-white',
                                onclick: function () {
                                    $.editor.wedit = null;
                                    $.editor.kind = null;
                                    $.editor.weditChange = false;
                                    SceneManager._scene.removeCollision($.editor.target._name);
                                    $.editor.control = "collision";
                                    SceneManager._scene.refreshEditor();
                                    SceneManager._scene.setupEditor();
                                    this._popup.destroy(true);
                                }
                            },
                            {
                                component: 'button',
                                label: 'Return',
                                class: 'btn-white',
                                onclick: function () {
                                    this._popup.destroy(true);
                                }
                            }
                        ]
                    })
                }
            })


        }

        collisionTargets() {
            var data = [];

            if (this.collision.element.length > 0) {
                this.collision.element.forEach((element) => {
                    if ($.editor.collisionFloor === "all" || element.floor === $.editor.collisionFloor) {
                        data.push({
                            label: `[${element.floor}] : ${element._name}`,
                            target: element,
                            value: data.length
                        })
                    }

                })
            }

            //this.drawText(`[${item.floor}] : ${item._name}`, rect.x, rect.y, rect.width, rect.height)
            this.collisionDraw();
            return data;

        }

        collisionPoints() {
            var data = [{
                label: '---',
                value: 0,
                id: null
            }];

            $.editor.target.cachePoints.map((point, index) => {
                data.push({
                    label: `Point #${index}: x ${point[0]}, y ${point[1]}`,
                    value: data.length,
                    id: index
                })
            })

            return data;
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
                            [0, 0],
                            [0, 100]
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
                    } else {
                        newElement.push(value)
                    }
                })

                this.collision.element = newElement;
                this.graphicCollision.removeChild(this.collision.source[name]._graphic);
                this.collision.source[name].remove();


                delete this.collision.source[name];
            }

            print('removed', this.collision, name);
        }

        // | --------------------------------------------------------
        // | Sound Editor
        // | --------------------------------------------------------

        setupEditorSound() {
            El.addClass(this.gui.editor, 'editor')

            // back button
            this.gui.editor.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.control = null
                    this.refreshEditor();
                }
            })
            //this.gui.editor.el.back.button.style.zIndex = '101;';

            // create
            this.gui.editor.el.create = new Components.list.Select({
                parent: this.gui.editor,
                label: 'New sound',
                data: [{
                    label: 'none',
                    value: 0
                }, {
                    label: 'BGM',
                    value: 1
                }, {
                    label: 'BGS',
                    value: 2
                }, {
                    label: 'ME',
                    value: 3
                }, {
                    label: 'SE',
                    value: 4
                }]
            })
            this.gui.editor.el.create.select.onchange = () => {
                var target = this.gui.editor.el.create.data.find(el => el.value === +this.gui.editor.el.create.get()).value
                this.gui.editor.el.create.choose(0);

                if (El.is(El.id('file-upload'))) {
                    document.body.removeChild(El.id('file-upload'))
                }

                var kind = null

                // BGM
                if (target === 1) {
                    kind = 'bgm'
                }

                // BGS
                if (target === 2) {
                    kind = 'bgs'
                }

                // ME
                if (target === 3) {
                    kind = 'me'
                }

                // SE
                if (target === 4) {
                    kind = 'se'
                }

                console.log(kind);


                if (kind === null) return;

                this.gui.editor.window.setup.title = `New ${kind.toUpperCase()} Audio`
                this.gui.editor.window.refresh();



                this.gui.editor.window.components = [{
                    component: 'text',
                    label: 'Name:',
                    value: `${kind.toUpperCase()} ` + String(this.sound.element.length + 1),
                    onchange: (value) => {
                        $.temp.lpName = value;
                    }
                }, {
                    component: 'select',
                    label: 'Floor: ',
                    data: $.config.floor,
                    onchange: (value) => {
                        $.temp.lpFloor = $.config.floor.find(el => el.value === +value).label;
                    }
                }, {
                    component: 'button',
                    label: 'File',
                    class: 'btn-standard grid-center',
                    onclick: () => {
                        El.Attr(El.create('input', document.body), {
                            type: 'file',
                            accept: '.ogg, .mp3',
                            id: 'file-upload'
                        }).onchange = (event) => {
                            $.temp.url = event.target.files[0].path;

                        }
                        El.id('file-upload').click();
                    }
                }, {
                    component: 'button',
                    label: 'Create',
                    class: 'btn-standard grid-center',
                    onclick: () => {

                        if (!$.temp.hasOwnProperty('url') || typeof $.temp.url !== 'string') return false;

                        SceneManager._scene._spriteset.addSound({
                            src: $.temp.url,
                            name: $.temp.lpName,
                            kind: kind,
                            floor: $.temp.lpFloor || $.editor.collisionFloor
                        })

                        $.editor.control = 'sound';
                        this.refreshEditor();
                        this.setupEditor();

                        this.gui.editor.window.refresh()
                        this.gui.editor.window.close();
                    }
                }, {
                    component: 'button',
                    label: 'Return',
                    class: 'btn-standard grid-center',
                    onclick: function () {
                        this.gui.editor.window.refresh()
                        this.gui.editor.window.close();
                    }
                }]

                this.gui.editor.window.open();
                this.gui.editor.window.draw();
                return;

            }


            // target
            this.gui.editor.el.targets = new Components.list.Basic({
                parent: this.gui.editor,
                data: this.soundTargets(),
                class: 'tree2',
                onclick: (object, element) => {

                    $.editor.control = 'sound-editor'
                    $.editor.target = object.target

                    this.refreshEditor();
                    this.setupEditor();

                }
            })
        }

        soundEditor() {
            El.addClass(this.gui.editor, 'editor')


            $.editor.wedit = null;
            $.editor.weditChange = false;

            // back
            this.gui.editor.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.control = 'sound'
                    this.refreshEditor();
                    this.setupEditor();
                }
            })

            // play?
            this.gui.editor.el.play = new Components.button.Basic({
                label: 'Play & Stop',
                parent: this.gui.editor,
                onclick: () => {
                    if ($.editor.target.playing() === true) {
                        $.editor.target.stop();
                    } else {
                        $.editor.target.play()
                    }
                }
            })

            console.log($.editor.target);


            // auto Play?
            this.gui.editor.el.autoPlay = new Components.boolean.Checkbox({
                label: 'Auto play?',
                checked: $.editor.target.editor._data.autoplay,
                parent: this.gui.editor,
                onchange: (checked) => {
                    $.editor.target.editor._data.autoplay = checked;
                    $.editor.target.autoplay = $.editor.target.editor._data.autoplay;
                }
            })


            // position
            this.gui.editor.el.position = new Components.button.Basic({
                label: `${$.editor.target.editor.pos.string()}`,
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.wedit = $.editor.wedit === 'position' ? null : 'position';

                }
            })

            // volume
            this.gui.editor.el.volume = new Components.input.Range({
                parent: this.gui.editor,
                label: 'Volume &value%',
                min: 0.0,
                max: 100.0,
                default: Haya.DMath.float($.editor.target.editor._data.volume) * 100,
                step: 1.0,
                format: (value) => {
                    return Haya.DMath.float(+(value));
                },
                onchange: (value, el) => {
                    $.editor.target.editor._data.volume = value;
                    $.editor.target.volume($.editor.target.editor._data.volume);
                    $.editor.weditChange = true

                }
            })


            // switch
            this.gui.editor.el.switch = new Components.input.Number({
                label: `Switch ID: ${$.editor.target.editor._data.switch}`,
                parent: this.gui.editor,
                default: $.editor.target.switch,
                min: -1,
                max: Infinity,
                step: 1
            })
            this.gui.editor.el.switch.input.onchange = () => {
                $.editor.target.editor._data.switch = this.gui.editor.el.switch.get();
                this.gui.editor.el.switch.label = `Switch ID: ${$.editor.target.editor._data.switch}`
            }

            // time
            this.gui.editor.el.time = new Components.list.Select({
                parent: this.gui.editor,
                label: `Period of Time: ${$.editor.target.editor._data.time}`,
                data: $.config.periodTime,
                onchange: () => {
                    let time = Haya.Map.Time.isPeriod(parseInt(this.gui.editor.el.time.get()));
                    $.editor.target.editor._data.time = time;
                    this.gui.editor.el.time.label.innerHTML = `Period of Time: ${$.editor.target.editor._data.time}`
                }
            })
            this.gui.editor.el.time.choose(Haya.Map.Time.isPeriod($.editor.target.editor._data.time))

            // loop?
            this.gui.editor.el.loop = new Components.boolean.Checkbox({
                label: 'Loop?',
                checked: $.editor.target.editor._data.loop,
                parent: this.gui.editor,
                onchange: (checked) => {
                    $.editor.target.editor._data.loop = checked;
                    $.editor.target.loop = $.editor.target.editor._data.loop;
                }
            })

            // rate
            this.gui.editor.el.rate = new Components.input.Number({
                parent: this.gui.editor,
                label: 'Rate (v/100):',
                min: .5,
                max: 4.0,
                default: Haya.DMath.float($.editor.target.editor._data.rate),
                step: .01,
                format: 'float'
            })
            this.gui.editor.el.rate.input.onchange = () => {
                this.gui.editor.el.rate.input.value = this.gui.editor.el.rate.input.value / 100;
                $.editor.target.editor._data.rate = Haya.DMath.float(this.gui.editor.el.rate.get())
            }

            // refDistance
            this.gui.editor.el.refDistance = new Components.input.Number({
                parent: this.gui.editor,
                label: 'Reference of Distance:',
                min: 0,
                max: 1000,
                default: Haya.DMath.float($.editor.target.editor._data.refDistance),
                step: 1
            })
            this.gui.editor.el.refDistance.input.onchange = () => {
                $.editor.target.editor._data.refDistance = Haya.DMath.float(parseInt(this.gui.editor.el.refDistance.get()))
                Haya.Map.sound_setPannerAttr($.editor.target)
            }

            // rolloffFactor
            this.gui.editor.el.rolloffFactor = new Components.input.Number({
                parent: this.gui.editor,
                label: 'Reference of Distance (v/10):',
                min: 0,
                max: 100,
                default: Haya.DMath.float($.editor.target.editor._data.refDistance),
                step: .1,
                format: 'float'
            })
            this.gui.editor.el.rolloffFactor.input.onchange = () => {
                this.gui.editor.el.rolloffFactor.input.value = this.gui.editor.el.rolloffFactor.input.value / 10;
                $.editor.target.editor._data.rolloffFactor = Haya.DMath.float((this.gui.editor.el.rolloffFactor.get()))
                Haya.Map.sound_setPannerAttr($.editor.target)
            }

            // coneInnerAngle
            this.gui.editor.el.coneInnerAngle = new Components.input.Number({
                parent: this.gui.editor,
                label: 'Cone Inner Angle (v/10):',
                min: 0,
                max: Infinity,
                default: Haya.DMath.float($.editor.target.editor._data.coneInnerAngle),
                step: .1,
                format: 'float'
            })
            this.gui.editor.el.coneInnerAngle.input.onchange = () => {
                this.gui.editor.el.coneInnerAngle.input.value = this.gui.editor.el.coneInnerAngle.input.value / 10;
                $.editor.target.editor._data.coneInnerAngle = Haya.DMath.float((this.gui.editor.el.coneInnerAngle.get()))
                Haya.Map.sound_setPannerAttr($.editor.target)
            }

            // coneOuterAngle
            this.gui.editor.el.coneOuterAngle = new Components.input.Number({
                parent: this.gui.editor,
                label: 'Cone Outer Angle (v/10):',
                min: 0,
                max: Infinity,
                default: Haya.DMath.float($.editor.target.editor._data.coneOuterAngle),
                step: .1,
                format: 'float'
            })
            this.gui.editor.el.coneOuterAngle.input.onchange = () => {
                this.gui.editor.el.coneOuterAngle.input.value = this.gui.editor.el.coneOuterAngle.input.value / 10;
                $.editor.target.editor._data.coneOuterAngle = Haya.DMath.float((this.gui.editor.el.coneOuterAngle.get()))
                Haya.Map.sound_setPannerAttr($.editor.target)
            }

            // coneOuterGain
            this.gui.editor.el.coneOuterGain = new Components.input.Number({
                parent: this.gui.editor,
                label: 'Cone Outer Angle (v/100):',
                min: 0,
                max: Infinity,
                default: Haya.DMath.float($.editor.target.editor._data.coneOuterGain),
                step: .1,
                format: 'float'
            })
            this.gui.editor.el.coneOuterGain.input.onchange = () => {
                this.gui.editor.el.coneOuterGain.input.value = this.gui.editor.el.coneOuterGain.input.value / 100;
                $.editor.target.editor._data.coneOuterGain = Haya.DMath.float((this.gui.editor.el.coneOuterGain.get()))
                Haya.Map.sound_setPannerAttr($.editor.target)
            }

            // maxDistance
            this.gui.editor.el.maxDistance = new Components.input.Number({
                parent: this.gui.editor,
                label: 'Maximun Distance:',
                min: 0,
                max: 1000,
                default: Haya.DMath.float($.editor.target.editor._data.maxDistance),
                step: 1
            })
            this.gui.editor.el.maxDistance.input.onchange = () => {
                $.editor.target.editor._data.maxDistance = Haya.DMath.float(parseInt(this.gui.editor.el.maxDistance.get()))
                Haya.Map.sound_setPannerAttr($.editor.target)
            }

            // delete
            // Delete
            this.gui.editor.el.remove = new Components.button.Basic({
                label: 'Delete!',
                parent: this.gui.editor,
                onclick: () => {
                    Components.notification.Create({
                        parent: this.gui.stage,
                        pause: true,
                        label: 'Are you sure that you want to delete it?',
                        components: [{
                                component: 'button',
                                label: 'Delete',
                                class: 'btn-white',
                                onclick: function () {
                                    $.editor.wedit = null;
                                    print($.editor.target.editor.name);
                                    SceneManager._scene._spriteset.removeSound($.editor.target.editor.name);
                                    $.editor.control = 'sound';
                                    SceneManager._scene.refreshEditor();
                                    SceneManager._scene.setupEditor();
                                    this._popup.destroy(true);
                                }
                            },
                            {
                                component: 'button',
                                label: 'Return',
                                class: 'btn-white',
                                onclick: function () {
                                    this._popup.destroy(true);
                                }
                            }
                        ]
                    })
                }
            })
        }

        soundTargets() {
            var data = []

            let msound = Haya.Map.current.sound.element.length;
            if (msound > 0) {
                while (msound--) {
                    let element = Haya.Map.current.sound.element[msound];
                    data.push({
                        label: `${element.editor.name} [${element.editor.kind}]`,
                        value: data.length,
                        target: element
                    })
                }
            }

            return data;
        }

        // | --------------------------------------------------------
        // | Sprite Editor 
        // | --------------------------------------------------------

        setupEditorSprite() {
            El.addClass(this.gui.editor, 'editor')

            print('setup editor sprite')

            // back button
            this.gui.editor.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.control = null
                    this.refreshEditor();
                }
            })

            this.gui.editor.el.targets = new Components.list.Basic({
                parent: this.gui.editor,
                data: this.spriteTargets(),
                class: 'tree2',
                onclick: (object, element) => {

                    $.editor.control = 'sprite-editor'
                    $.editor.target = object.target

                    this.gui.editorSprite.refresh()
                    this.refreshEditor();
                    this.setupEditor();

                }
            })
        }

        spriteEditor() {
            //El.addClass(this.gui.editor, 'editor')


            $.editor.wedit = null;
            $.editor.weditChange = false;


            this.gui.editorSprite.target = $.editor.target;
            this.gui.editorSprite.create();
        }

        spriteTargets() {
            var data = []

            let sprite = Haya.Map.current.sprite.length;
            if (sprite > 0) {
                while (sprite--) {
                    let element = Haya.Map.current.sprite[sprite];
                    //this.gui.list._data.push(element)

                    if ($.editor.collisionFloor === "all" || (element.floor === $.editor.collisionFloor)) {
                        data.push({
                            label: `[${element.floor}]: ${element.linfo}`,
                            value: data.length,
                            target: element
                        })
                    }
                }
            }

            //console.log(data);


            return data;
        }

        // | --------------------------------------------------------
        // | Particle Editor 
        // | --------------------------------------------------------
        setupEditorParticle() {
            El.addClass(this.gui.editor, 'editor')

            // back button
            this.gui.editor.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.gui.editor,
                onclick: () => {
                    $.editor.control = null
                    this.refreshEditor();
                }
            })

            // create
            this.gui.editor.el.create = new Components.button.Basic({
                label: 'New Particle',
                parent: this.gui.editor,
                onclick: () => {
                    this.gui.editor.window.setup.title = `New Particle`
                    this.gui.editor.window.refresh();

                    if (El.is(El.id('file-upload'))) {
                        document.body.removeChild(El.id('file-upload'))
                    }

                    if (El.is(El.id('file-upload-json'))) {
                        document.body.removeChild(El.id('file-upload-json'))
                    }

                    this.gui.editor.window.components = [{
                        component: 'text',
                        label: 'Name:',
                        value: `particle ` + String(this._spriteset.particle.element.length + 1),
                        onchange: (value) => {
                            $.temp.lpName = value;
                        }
                    }, {
                        component: 'select',
                        label: 'Floor: ',
                        data: $.config.floor,
                        onchange: (value) => {
                            $.temp.lpFloor = $.config.floor.find(el => el.value === +value).label;
                        }
                    }, {
                        component: 'button',
                        label: 'Texture',
                        class: 'btn-standard grid-center',
                        onclick: () => {
                            El.Attr(El.create('input', document.body), {
                                type: 'file',
                                accept: '.png, .jpg',
                                id: 'file-upload'
                            }).onchange = (event) => {
                                $.temp.url = event.target.files[0].path;

                            }
                            El.id('file-upload').click();
                        }
                    }, {
                        component: 'button',
                        label: 'Config',
                        class: 'btn-standard grid-center',
                        onclick: () => {
                            El.Attr(El.create('input', document.body), {
                                type: 'file',
                                accept: '.json',
                                id: 'file-upload-json'
                            }).onchange = (event) => {
                                $.temp.jurl = event.target.files[0].path;
                                $.temp.config =  Haya.File.json($.temp.jurl);

                            }
                            El.id('file-upload-json').click();
                        }
                    }, {
                        component: 'button',
                        label: 'Create',
                        class: 'btn-standard grid-center',
                        onclick: () => {

                            if (!$.temp.hasOwnProperty('url') || typeof $.temp.url !== 'string') return false;
                            if (!$.temp.hasOwnProperty('jurl') || typeof $.temp.jurl !== 'string') return false;

                            //let _filename = filename.replace(/^.*[\\\/]/, '');

                            Haya.Particle.config.pathl = Haya.File.path.dirname($.temp.url);
                            Haya.Particle.config._pl = true;

                            let texture = Haya.File.path.basename($.temp.url);

                            console.log('texture-particle', texture);
                            

                            SceneManager._scene._spriteset.addParticle(
                                $.temp.config, // config
                                [texture], // texture
                                {
                                    name: ($.temp.lpName || `particle ` + String(this._spriteset.particle.element.length + 1)),
                                    floor: ($.temp.lpFloor || $.editor.collisionFloor)
                                },
                                false
                            )

                            $.editor.control = 'particle';
                            this.refreshEditor();
                            this.setupEditor();

                            this.gui.editor.window.refresh()
                            this.gui.editor.window.close();
                            Haya.Particle.config.pathl = 'img/particles'
                            Haya.Particle.config._pl = false;
                        }
                    }, {
                        component: 'button',
                        label: 'Return',
                        class: 'btn-standard grid-center',
                        onclick: function () {
                            this.gui.editor.window.refresh()
                            this.gui.editor.window.close();
                        }
                    }]

                    this.gui.editor.window.open();
                    this.gui.editor.window.draw();
                }
            })

            this.gui.editor.el.targets = new Components.list.Basic({
                parent: this.gui.editor,
                data: this.particleTargets(),
                class: 'tree2',
                onclick: (object, element) => {

                    $.editor.control = 'particle-editor'
                    $.editor.target = object.target

                    this.gui.editorParticle.refresh()
                    this.refreshEditor();
                    this.setupEditor();

                }
            })
        }

        particleEditor() {
            $.editor.wedit = null;
            $.editor.weditChange = false;


            this.gui.particleEditor.target = $.editor.target;
            this.gui.particleEditor.create();
        }

        particleTargets() {
            var data = [];

            let keys = Object.keys(Haya.Particle.manager._particles);

            if (keys > 0) {
                keys.map(key => {
                    const element = Haya.Particle.manager._particles[key]

                    if ($.editor.collisionFloor === "all" || (element.floor === $.editor.collisionFloor)) {
                        data.push({
                            label: `[${element.floor}]: ${element.name}`,
                            value: data.length,
                            target: element
                        })
                    }
                })
            }

            return data;
        }

        // | --------------------------------------------------------
        // | Configure the properties of the element
        // | --------------------------------------------------------

        /**
         * Redirect to the proper configuration
         */
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

        /**
         * Configuration of the light
         */
        weditLight() {
            if ($.editor.wedit === "position") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    $.editor.target.sprite.x = Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    $.editor.target.sprite.y = Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    //$.editor.target.pivot.set((-Haya.Map.Viewport.x), (-Haya.Map.Viewport.y));
                    //$.editor.weditChange = true;
                    this.gui.editor.el.position.button.innerHTML = `x ${Haya.DMath.float($.editor.target.sprite.x)} | y: ${Haya.DMath.float($.editor.target.sprite.y)}`

                }
            } else if ($.editor.wedit === "targetPos") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    $.editor.target.sprite.target.x = Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    $.editor.target.sprite.target.y = Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    //$.editor.target.pivot.set((-Haya.Map.Viewport.x), (-Haya.Map.Viewport.y));
                    //$.editor.weditChange = true;
                    this.gui.editor.el.targetPos.button.innerHTML = `Target: x ${Haya.DMath.float($.editor.target.sprite.target.x)} | y: ${Haya.DMath.float($.editor.target.sprite.target.y)}`

                }
            }
        }

        /**
         * Edit properties of collision
         */
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
                    this.gui.editor.el.position.button.innerHTML = `x ${Haya.DMath.float($.editor.target.x)} | y: ${Haya.DMath.float($.editor.target.y)}`
                    $.editor.weditChange = true
                } else if (Input.isPressed('down')) {
                    $.editor.target.y += 1;
                    this.gui.editor.el.position.button.innerHTML = `x ${Haya.DMath.float($.editor.target.x)} | y: ${Haya.DMath.float($.editor.target.y)}`
                    $.editor.weditChange = true
                } else if (Input.isPressed('up')) {
                    $.editor.target.y -= 1;
                    this.gui.editor.el.position.button.innerHTML = `x ${Haya.DMath.float($.editor.target.x)} | y: ${Haya.DMath.float($.editor.target.y)}`
                    $.editor.weditChange = true
                } else if (Input.isPressed('right')) {
                    $.editor.target.x += 1;
                    this.gui.editor.el.position.button.innerHTML = `x ${Haya.DMath.float($.editor.target.x)} | y: ${Haya.DMath.float($.editor.target.y)}`
                    $.editor.weditChange = true
                } else if (Input.isPressed('left')) {
                    $.editor.target.x -= 1;
                    this.gui.editor.el.position.button.innerHTML = `x ${Haya.DMath.float($.editor.target.x)} | y: ${Haya.DMath.float($.editor.target.y)}`
                    $.editor.weditChange = true
                }
            }

            if ($.editor.wedit === "point") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                } else if (Input.isTriggered('d')) {
                    let cachePoints = [];
                    let toDelete = $.editor.target.cachePoints[$.temp.pointId]

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

                if (this.toolbar === false) {
                    if (TouchInput.isPressed()) { // isPressed

                        $.editor.target.cachePoints[$.temp.pointId][0] = (Haya.Mouse.x + this.display.x) - $.editor.target.x;
                        $.editor.target.cachePoints[$.temp.pointId][1] = (Haya.Mouse.y + this.display.y) - $.editor.target.y;
                        $.editor.weditChange = true
                    }
                }
            }


            // true
            if ($.editor.weditChange) {
                if ($.editor.wedit === "point") {
                    $.editor.target.setPoints($.editor.target.cachePoints)
                    this.gui.editor.el.points.data = this.collisionPoints();
                    this.gui.editor.el.points.setOptions();


                }
                this.collisionGraphic($.editor.target, true)
                $.editor.weditChange = false;
            }
        }

        /**
         * Edit properties of sound
         */
        weditSound() {

            if ($.editor.wedit === "position") {
                // trigger
                if (Input.isPressed('ok')) {
                    $.editor.wedit = null;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    $.editor.target.editor.pos.x = Haya.Mouse.x + -Haya.Map.Viewport.x;
                    $.editor.target.editor.pos.y = Haya.Mouse.y + -Haya.Map.Viewport.y;
                    $.editor.target._pos[0] = $.editor.target.editor.pos.x;
                    $.editor.target._pos[1] = $.editor.target.editor.pos.y;
                    $.editor.weditChange = true
                    //$.editor.weditChange = true;
                    //this.gui.editor.button.position.text(`${$.editor.target.haya.pos.string()}`)
                    this.gui.editor.el.position.button.innerHTML = $.editor.target.editor.pos.string()
                }

                if (TouchInput.wheelY >= 20) {
                    $.editor.target.editor.pos.z = Haya.DMath.fincrease($.editor.target.editor.pos.z, -100.0, 100.0, 0.5, "alt", 1);
                    $.editor.target._pos[2] = $.editor.target.editor.pos.z;
                    $.editor.weditChange = true
                    this.gui.editor.el.position.button.innerHTML = $.editor.target.editor.pos.string()
                } else if (TouchInput.wheelY <= -20) {
                    $.editor.target.editor.pos.z = Haya.DMath.fdecrease($.editor.target.editor.pos.z, -100.0, 100.0, 0.5, "alt", 1);
                    $.editor.target._pos[2] = $.editor.target.editor.pos.z;
                    $.editor.weditChange = true
                    this.gui.editor.el.position.button.innerHTML = $.editor.target.editor.pos.string()
                }
            }

            if ($.editor.weditChange === true) {
                // $.htimeout.value = 3;
                // $.htimeout.method = function () { $.editor.target.play() };
                $.editor.weditChange = false;
            }
        }

        /**
         * Save project
         */
        save() {
            Components.notification.Create({
                parent: this.gui.stage,
                pause: true,
                label: 'Are you sure that you want to save it?',
                components: [{
                        component: 'button',
                        label: 'Save',
                        class: 'btn-white',
                        onclick: function () {

                            // header
                            $.save.name = Haya.Map.current.name;
                            $.save.id = Haya.Map.id;
                            $.save.width = Haya.Map.current.width;
                            $.save.height = Haya.Map.current.height;

                            // save light components
                            Object.keys(SceneManager._scene._spriteset.light.source).map((value, index) => {
                                let item = SceneManager._scene._spriteset.light.source[value];
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
                            Object.keys(SceneManager._scene.collision.source).map((value, index) => {
                                // item
                                let item = SceneManager._scene.collision.source[value];
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
                                item.editor._data.pos = item.editor.pos.array();

                                $.save.sound[value] = item.editor._data;
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

                            // return
                            $.editor.wedit = null;
                            $.editor.control = null;
                            this._popup.destroy(true);
                        }
                    },
                    {
                        component: 'button',
                        label: 'Return',
                        class: 'btn-white',
                        onclick: function () {
                            this._popup.destroy(true);
                        }
                    }
                ]
            })
        }


    }
    // ========================================================================
    load_setup();
    loadLibrary();
    $.Editor = Scene_Editor;
    map_editor_style()
    // ========================================================================
    print($, "Haya Map Editor")
}(Haya.Map_Editor)


/*

 [Keyboard line]

 1 -> floor to under;
 2 -> floor to base;
 3 -> floor to high;
 
 [Collision Editor]
 d -> delete point on polygon
*/