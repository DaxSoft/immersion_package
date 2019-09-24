/**
 * @file [haya_map_editor.js -> Haya - Map Editor]
 * Recommended order of this plugin on 'plugin manager':
 *  - haya-map
 *  - haya-movement
 * * - haya-map-editor
 * =====================================================================
 * @author Dax Soft | Kvothe <dax-soft@live.com>
 * @website www.dax-soft.weebly.com
 * @version 0.3.12
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
 * @plugindesc [0.3.12] Haya Map Editor
 * 
 * @help This is the scene editor made for the
 * immersion package plugin. The editor works in-game,
 * this way you can check up the perfomace when editing
 * and increasing effects and elements.
 * 
 * On this editor you can edit:
 *  - collision of the map
 *  - floors
 *  - lights
 *  - sprite of the map
 *  - particles
 *  - filters
 *  - weathers
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
                value,
                target: type[0]
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
    // | ======================================================================
    // | Sprite_Map
    // | Only create the player character
    // | ======================================================================
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
    // | ======================================================================
    // | Game_Map
    // | Not create any event
    // | ======================================================================
    Game_Map.prototype.setupEvents = function () {
        this._events = [];
    };
    // | ======================================================================
    // | Editor_Sprite
    // | Class to edit the sprite properties
    // | ======================================================================
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
            this.mouse = new Point(0, 0);
            this.tint = null;
        }

        undo() {
            return (Input.isPressed('control') && Input.isPressed('ok'))
        }

        command(value) {
            this.wedit = this.wedit === value ? null : value;
        }

        update() {
            if (this.wedit === 'position') {
                // trigger
                if (Input.isPressed('ok')) {
                    this.wedit = null;
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

                this.target.rotation = Haya.DMath.wheelID(
                    this.target.rotation,
                    -6.2,
                    6.2,
                    0.1,
                    (current) => {

                        this.el.rotation.set(Haya.DMath.float(Haya.DMath.degrees(current)))
                    }
                )
            }

            if (this.wedit === 'opacity') {
                this.target.alpha = Haya.DMath.wheelID(
                    this.target.alpha,
                    0, 1, 0.05,
                    (current) => {
                        this.el.opacity.input.value = current * 100;

                    }
                )
            }

            if (this.wedit === 'scaleX') {
                if (Input.isPressed('control') && Input.isPressed('ok')) {
                    console.log('undo');
                    this.target.scale.x = this.register.scaleX
                }

                this.target.scale.x = Haya.DMath.wheelID(
                    this.target.scale.x,
                    -10, 10, 0.05,
                    (current) => {
                        this.el.scaleX.input.value = current
                    }
                )
            }

            if (this.wedit === 'scaleY') {
                if (Input.isPressed('control') && Input.isPressed('ok')) {
                    console.log('undo');
                    this.target.scale.y = this.register.scaleY
                }

                this.target.scale.y = Haya.DMath.wheelID(
                    this.target.scale.y,
                    -10, 10, 0.05,
                    (current) => {
                        this.el.scaleY.input.value = current
                    }
                )
            }
        }

        dir() {
            if (TouchInput.isPressed() && Input.isPressed('control')) {

                //if ($.editor.wedit = 'point' && !Input.isPressed('ctrl')) return;

                // RIGHT

                if (Haya.Mouse.x > this.mouse.x) {
                    return 'right'
                }

                // LEFT

                if (Haya.Mouse.x < this.mouse.x) {
                    return 'left'
                }

                // UP

                if (Haya.Mouse.y < this.mouse.y) {
                    return 'up'
                }

                // DOWN
                if (Haya.Mouse.y > this.mouse.y) {
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

            this.create_maskLight();

            this.create_maskSprite()

            this.create_Filter()

            this.create_scale();

            this.wedit = null;

            //this.create_remove();
        }

        create_position() {
            this.el.position = new Components.button.Basic({
                label: `x ${Haya.DMath.float(this.target.x)} | y: ${Haya.DMath.float(this.target.y)}`,
                parent: this.editor,
                onclick: () => {
                    this.command('position')
                    this.register.pos = new Haya.DMath.Vector2D(this.target.x, this.target.y);
                    if (this.wedit === 'position') {
                        new Components.alert.Geral({
                            label: 'Press [space bar] to confirm the position'
                        })
                    }
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
                this.command('rotation')
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

            this.el.opacity.container.onclick = () => {
                this.command('opacity')
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
                    // let kind = parseInt(this.el.blendMode.get())

                    // this.target._layerInfo.blendMode = $.editor.blend.list[kind][0];
                    // this.target.children[1].blendMode = this.target._layerInfo.blendMode
                    

                    let kind = this.el.blendMode.data.find(bld => bld.value === parseInt(this.el.blendMode.get())).target

                    this.target._layerInfo.blendMode = kind //$.editor.blend.list[kind][0];
                    this.target.children[1].blendMode = this.target._layerInfo.blendMode
                    
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
                this.command('scaleX')
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
                this.command('scaleY')
                this.register.scaleY = this.target.scale.y
            }
        }

        create_maskSprite() {
            this.el.mask = new Components.list.Select({
                parent: this.editor,
                label: 'Set a sprite to use as mask:',
                data: (SceneManager._scene.spriteTargets())
            })

            this.el.mask.select.onchange = () => {
                var choose = this.el.mask.data.find(el => el.value === +this.el.mask.get())


                if (choose.target) {
                    this.target.children[1].mask = choose.target.children[1]
                }

            }

        }

        create_maskLight() {
            this.el.mask = new Components.list.Select({
                parent: this.editor,
                label: 'Set a light to use as mask:',
                data: (SceneManager._scene.lightTargets())
            })

            this.el.mask.select.onchange = () => {
                var choose = this.el.mask.data.find(el => el.value === +this.el.mask.get())


                if (choose.target) {
                    this.target.children[1].mask = choose.target.sprite
                }

            }

        }

        create_Filter() {
            // create
            this.el.filter = new Components.list.Select({
                label: 'Filter',
                parent: this.editor,
                data: Haya.Filters.list()
            })

            this.el.filter.select.onchange = () => {
                var target = this.el.filter.data.find(el => el.value === +this.el.filter.get()).target
                this.el.filter.choose(0);


                if (!(typeof target === 'object')) return;

                SceneManager._scene.gui.editor.window.setup.title = `Add Filter`
                SceneManager._scene.gui.editor.window.refresh();



                SceneManager._scene.gui.editor.window.components = [{
                    component: 'text',
                    label: 'Name:',
                    value: `Filter ` + String(SceneManager._scene._spriteset.filter.element.length + 1),
                    onchange: (value) => {
                        $.temp.lpName = value;
                    }
                }, {
                    component: 'button',
                    label: 'Create',
                    class: 'btn-standard grid-center',
                    onclick: () => {

                        target.setup = Object.assign({
                            name: ($.temp.lpName || `Filter ` + String(SceneManager._scene._spriteset.filter.element.length + 1)),
                            floor: this.target.floor,
                            from: `sprite_${this.target.linfo}`
                        }, target.setup)


                        SceneManager._scene._spriteset.addFilter(target)

                        $.editor.control = 'sprite-editor';

                        SceneManager._scene.refreshEditor();
                        SceneManager._scene.setupEditor();

                        SceneManager._scene.gui.editor.window.refresh()
                        SceneManager._scene.gui.editor.window.close();
                    }
                }, {
                    component: 'button',
                    label: 'Return',
                    class: 'btn-standard grid-center',
                    onclick: function () {
                        SceneManager._scene.gui.editor.window.refresh()
                        SceneManager._scene.gui.editor.window.close();
                    }
                }]

                SceneManager._scene.gui.editor.window.open();
                SceneManager._scene.gui.editor.window.draw();
                return;

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
                this.tint = "0x" + this.tint.toString(16).toUpperCase();
            }

            return String(this.tint)
        }
    }
    // | ======================================================================
    // | Editor_Particle
    // | Class to edit the particle properties
    // | ======================================================================
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
            this.refresh();
        }

        undo() {
            return (Input.isPressed('control') && Input.isPressed('ok'))
        }

        command(value) {
            this.wedit = this.wedit === value ? null : value;
        }

        refresh() {
            El.removeChild(this.editor)
            this.target = null;
            this.el = {};
            this.wedit = null;
            El.addClass(this.editor, 'nested')
            this.register = {};
            this.mouse = new Point(0, 0);
            this.tint = null;
        }

        update() {
            if (this.wedit === 'position') {
                // trigger
                if (Input.isPressed('ok')) {
                    this.wedit = null;
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
                    this.el.position.button.innerHTML = `x ${Haya.DMath.float(this.target.x)} | y: ${Haya.DMath.float(this.target.y)}`
                }
            }
        }

        dir() {
            if (TouchInput.isPressed() && Input.isPressed('control')) {

                //if ($.editor.wedit = 'point' && !Input.isPressed('ctrl')) return;

                // RIGHT

                if (Haya.Mouse.x > this.mouse.x) {
                    return 'right'
                }

                // LEFT

                if (Haya.Mouse.x < this.mouse.x) {
                    return 'left'
                }

                // UP

                if (Haya.Mouse.y < this.mouse.y) {
                    return 'up'
                }

                // DOWN
                if (Haya.Mouse.y > this.mouse.y) {
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

            this.create_floor()

            this.create_time()

            this.create_remove()

            this.wedit = null
        }

        create_position() {
            this.el.position = new Components.button.Basic({
                label: `x ${Haya.DMath.float(this.target.x)} | y: ${Haya.DMath.float(this.target.y)}`,
                parent: this.editor,
                onclick: () => {
                    this.command('position')
                    this.register.pos = new Haya.DMath.Vector2D(this.target.x, this.target.y);
                    if (this.wedit === 'position') {
                        new Components.alert.Geral({
                            label: 'Press [space bar] to confirm the position'
                        })
                    }
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

        create_time() {
            this.el.time = new Components.list.Select({
                parent: this.editor,
                label: `Period of Time: ${this.target.time}`,
                data: $.config.periodTime,
                onchange: () => {
                    let time = Haya.Map.Time.isPeriod(parseInt(this.el.time.get()));
                    this.target.time = time;
                    this.el.time.label.innerHTML = `Period of Time: ${this.target.time}`
                }
            })
            this.el.time.choose(Haya.Map.Time.isPeriod(this.target.time))
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
                                    SceneManager._scene._spriteset.removeParticle($.editor.target.name);
                                    $.editor.control = 'particle';
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
    }
    // | ======================================================================
    // | Editor_Light
    // | Class to edit the light properties
    // | ======================================================================
    class Editor_Light {
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
        }

        refresh() {
            El.removeChild(this.editor)
            this.target = null;
            this.el = {};
            this.wedit = null;
            El.addClass(this.editor, 'nested')
            this.register = {};
            this.mouse = new Point(0, 0);
            this.tint = null;
        }

        update() {
            if (this.wedit === 'position') {
                // trigger
                if (Input.isPressed('ok')) {
                    this.wedit = null
                }
                // undo
                if (Input.isPressed('control') && Input.isPressed('ok')) {
                    this.target.sprite.x = this.register.pos.x;
                    this.target.sprite.y = this.register.pos.y;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    this.target.sprite.x = Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    this.target.sprite.y = Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    this.el.position.button.innerHTML = `x ${Haya.DMath.float(this.target.sprite.x)} | y: ${Haya.DMath.float(this.target.sprite.y)}`

                }
            }

            if (this.wedit === 'target_pos') {
                // trigger
                if (Input.isPressed('ok')) {
                    this.wedit = null
                }
                // undo
                if (Input.isPressed('control') && Input.isPressed('ok')) {
                    this.target.sprite.target.x = this.register.pos.x;
                    this.target.sprite.target.y = this.register.pos.y;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    this.target.sprite.target.x = Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    this.target.sprite.target.y = Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    this.el.target_pos.button.innerHTML = `Target: x ${Haya.DMath.float(this.target.sprite.target.x)} | y: ${Haya.DMath.float(this.target.sprite.target.y)}`

                }
            }

            if (this.wedit === 'opacity') {
                if (this.undo()) {
                    this.target.sprite.alpha = this.register.alpha
                    this.el.opacity.set(this.target.sprite.alpha * 100)
                }

                this.target.sprite.alpha = Haya.DMath.wheelID(
                    this.target.sprite.alpha,
                    0.05,
                    1,
                    0.05,
                    (current) => {
                        this.el.opacity.set(current * 100)
                    }
                )
            }

            if (this.wedit === 'brightness') {
                if (this.undo()) {
                    this.target.sprite.brightness = this.register.brightness
                    this.el.brightness.set(this.target.sprite.brightness * 100)
                }

                this.target.sprite.brightness = Haya.DMath.wheelID(
                    this.target.sprite.brightness,
                    0.1,
                    100,
                    0.05,
                    (current) => {

                        this.el.brightness.set(current);
                    }
                )
            }

            if (this.wedit === 'light-height') {
                if (this.undo()) {
                    this.target.sprite.lightHeight = this.register.lightHeight
                    this.el.brightness.set(this.target.sprite.lightHeight)
                }

                this.target.sprite.lightHeight = Haya.DMath.wheelID(
                    this.target.sprite.lightHeight,
                    -10,
                    10,
                    0.01,
                    (current) => {

                        this.el.lightHeight.set(current);
                    }
                )
            }

            if (this.wedit === 'falloffA') {
                if (this.undo()) {
                    this.target.sprite.falloff[0] = this.register.falloffA
                    this.el.falloffA.set(this.target.sprite.falloff[0])
                }

                this.target.sprite.falloff[0] = Haya.DMath.wheelID(
                    this.target.sprite.falloff[0],
                    -10,
                    10,
                    0.01,
                    (current) => {

                        this.el.falloffA.set(current);
                    }
                )
            }

            if (this.wedit === 'falloffB') {
                if (this.undo()) {
                    this.target.sprite.falloff[1] = this.register.falloffB
                    this.el.falloffB.set(this.target.sprite.falloff[1])
                }

                this.target.sprite.falloff[1] = Haya.DMath.wheelID(
                    this.target.sprite.falloff[1],
                    -10,
                    10,
                    0.01,
                    (current) => {

                        this.el.falloffB.set(current);
                    }
                )
            }

            if (this.wedit === 'falloffC') {
                if (this.undo()) {
                    this.target.sprite.falloff[2] = this.register.falloffC
                    this.el.falloffC.set(this.target.sprite.falloff[2])
                }

                this.target.sprite.falloff[2] = Haya.DMath.wheelID(
                    this.target.sprite.falloff[2],
                    -100,
                    100,
                    0.5,
                    (current) => {

                        this.el.falloffC.set(current);
                    }
                )
            }

            if (this.wedit === 'scaleX') {
                if (this.undo()) {
                    this.target.sprite.scale.x = this.register.scaleX
                    this.el.scaleX.set(this.target.sprite.scale.x)
                }

                this.target.sprite.scale.x = Haya.DMath.wheelID(
                    this.target.sprite.scale.x,
                    -100,
                    100,
                    0.1,
                    (current) => {

                        this.el.scaleX.set(current);
                    }
                )
            }

            if (this.wedit === 'scaleY') {
                if (this.undo()) {
                    this.target.sprite.scale.y = this.register.scaleY
                    this.el.scaleY.set(this.target.sprite.scale.y)
                }

                this.target.sprite.scale.y = Haya.DMath.wheelID(
                    this.target.sprite.scale.y,
                    -100,
                    100,
                    0.1,
                    (current) => {

                        this.el.scaleY.set(current);
                    }
                )
            }

            if (this.wedit === 'anchorX') {
                if (this.undo()) {
                    this.target.sprite.anchor.x = this.register.anchorX
                    this.el.anchorX.set(this.target.sprite.anchor.x)
                }

                this.target.sprite.anchor.x = Haya.DMath.wheelID(
                    this.target.sprite.anchor.x,
                    -2,
                    2,
                    0.1,
                    (current) => {

                        this.el.anchorX.set(current);
                    }
                )
            }

            if (this.wedit === 'anchorY') {
                if (this.undo()) {
                    this.target.sprite.anchor.y = this.register.anchorY
                    this.el.anchorY.set(this.target.sprite.anchor.y)
                }

                this.target.sprite.anchor.y = Haya.DMath.wheelID(
                    this.target.sprite.anchor.y,
                    -100,
                    100,
                    0.1,
                    (current) => {

                        this.el.anchorY.set(current);
                    }
                )
            }

            if (this.wedit === 'rotation') {
                if (this.undo()) {
                    this.target.sprite.rotation = this.register.rotation
                    this.el.rotation.set(Haya.DMath.float(Haya.DMath.degrees(this.target.sprite.rotation)))
                }

                this.target.sprite.rotation = Haya.DMath.wheelID(
                    this.target.sprite.rotation,
                    -6.2,
                    6.2,
                    0.1,
                    (current) => {

                        this.el.rotation.set(Haya.DMath.float(Haya.DMath.degrees(this.target.sprite.rotation)))
                    }
                )
            }
        }

        undo() {
            return (Input.isPressed('control') && Input.isPressed('ok'))
        }

        dir() {
            if (TouchInput.isPressed() && Input.isPressed('control')) {

                //if ($.editor.wedit = 'point' && !Input.isPressed('ctrl')) return;

                // RIGHT

                if (Haya.Mouse.x > this.mouse.x) {
                    return 'right'
                }

                // LEFT

                if (Haya.Mouse.x < this.mouse.x) {
                    return 'left'
                }

                // UP

                if (Haya.Mouse.y < this.mouse.y) {
                    return 'up'
                }

                // DOWN
                if (Haya.Mouse.y > this.mouse.y) {
                    return 'down'
                }
            } else {
                this.mouse.x = Haya.Mouse.x;
                this.mouse.y = Haya.Mouse.y;
            }

        }

        command(value) {
            this.wedit = this.wedit === value ? null : value;
        }

        create() {

            if (Haya.Utils.invalid(this.target)) return;

            El.removeClass(this.editor, 'nested')

            this.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.editor,
                onclick: () => {
                    $.editor.control = 'light'
                    this.refresh();
                    SceneManager._scene.refreshEditor();
                    SceneManager._scene.setupEditor();
                }
            })

            this.create_position();

            this.opacity_brightness();

            this.create_time();

            this.create_switch();

            this.createFloor()

            this.create_colors();

            this.create_mask()

            if (this.target.kind === 'sprite') {
                this.create_sprite_stuff();
            } else {
                this.create_pixi_stuff();
            }

            this.create_effect()

            this.create_remove();

            this.wedit = null;
        }

        create_sprite_stuff() {
            this.createBlendMode()

            this.create_Filter()

            this.createScales()

            this.createAnchors()

            this.createRotation()

        }

        create_pixi_stuff() {
            // lightHeight
            this.createLightHeight()

            this.createFalloff()
        }

        create_mask() {
            this.el.mask = new Components.list.Select({
                parent: this.editor,
                label: 'Set a sprite to use as mask:',
                data: (SceneManager._scene.spriteTargets())
            })

            this.el.mask.select.onchange = () => {
                var choose = this.el.mask.data.find(el => el.value === +this.el.mask.get())


                if (choose.target) {
                    this.target.sprite.mask = choose.target.children[1]
                }

            }

        }

        create_position() {
            this.el.position = new Components.button.Basic({
                label: `x ${Haya.DMath.float(this.target.sprite.x)} | y: ${Haya.DMath.float(this.target.sprite.y)}`,
                parent: this.editor,
                onclick: () => {
                    this.wedit = this.wedit === 'position' ? null : 'position';
                    this.register.pos = new Haya.DMath.Vector2D(this.target.sprite.x, this.target.sprite.y);
                    if (this.wedit === 'position') {
                        new Components.alert.Geral({
                            label: 'Press [space bar] to confirm the position'
                        })
                    }
                }
            })

            // directional?
            if (this.target.kind === 'directional') {
                this.el.target_pos = new Components.button.Basic({
                    label: `Target: x ${Haya.DMath.float(this.target.sprite.target.x)} | y: ${Haya.DMath.float(this.target.sprite.target.y)}`,
                    parent: this.editor,
                    onclick: () => {
                        this.wedit = this.wedit === 'target_pos' ? null : 'target_pos';
                        if (this.wedit === 'target_pos') {
                            new Components.alert.Geral({
                                label: 'Press [space bar] to confirm the position'
                            })
                        }
                        this.register.pos = new Haya.DMath.Vector2D(this.target.sprite.target.x, this.target.sprite.target.y);
                    }
                })
            }
        }

        opacity_brightness() {
            if (this.target.kind === 'sprite') {
                this.el.opacity = new Components.input.Range({
                    parent: this.editor,
                    label: 'Opacity &value%:',
                    min: 0.0,
                    max: 100.0,
                    default: Haya.DMath.float($.editor.target.sprite.alpha * 100),
                    step: 1.0,
                    format: (value) => {
                        return Haya.DMath.float(+(value))
                    },
                    onchange: (value) => {
                        this.target.sprite.alpha = Haya.DMath.float(value / 100)
                        //this.command('opacity')
                    }
                })
                this.el.opacity.container.onclick = () => {
                    this.register.opacity = this.target.sprite.alpha;
                    this.command('opacity')
                }
            } else {

                this.el.brightness = new Components.input.Range({
                    parent: this.editor,
                    label: 'Brightness &value (v/10):',
                    min: 0.0,
                    max: 100.0,
                    default: this.target.sprite.brightness.toString(),
                    step: .1,
                    format: (value) => {
                        return parseFloat(value)
                    },
                    onchange: (value) => {
                        this.register.brightness = this.target.sprite.brightness;
                        //this.command('brightness')
                        this.target.sprite.brightness = value
                    }
                })

                this.el.brightness.set(this.target.sprite.brightness)

                this.el.brightness.container.onclick = () => {
                    this.register.brightness = this.target.sprite.brightness;
                    this.command('brightness')
                }
            }
        }

        create_time() {
            this.el.time = new Components.list.Select({
                parent: this.editor,
                label: `Period of Time: ${this.target.sprite.time}`,
                data: $.config.periodTime,
                onchange: () => {
                    let time = Haya.Map.Time.isPeriod(parseInt(this.el.time.get()));
                    this.target.sprite.time = time;
                    this.el.time.label.innerHTML = `Period of Time: ${this.target.sprite.time}`
                }
            })
            this.el.time.choose(Haya.Map.Time.isPeriod(this.target.sprite.time))
        }

        create_switch() {
            this.el.switch = new Components.input.Number({
                label: `Switch ID: ${this.target.switch}`,
                parent: this.editor,
                default: this.target.switch,
                min: -1,
                max: Infinity,
                step: 1
            })
            this.el.switch.input.onchange = () => {
                this.target.switch = this.el.switch.get();
                this.el.switch.label = `Switch ID: ${this.target.switch}`
            }
        }

        create_colors() {
            this.el.colors = new Components.button.Basic({
                label: 'Color',
                parent: this.editor,
                onclick: () => {
                    SceneManager._scene.gui.editor.window.setup.title = `Color Editor: ${this.target.sprite.color} <span class='circle-ball-color' style='background-color: ${this.target.sprite.color.replace("0x", "#")};'></span>`
                    let color = Haya.Utils.Color.hexRgb(String(this.target.sprite.color).replace("0x", "#"));

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

                            let color = Haya.Utils.Color.rgbHex($.editor.pallete.red, $.editor.pallete.green, $.editor.pallete.blue, "0x");

                            this.target.sprite.color = color;
                            this.target.sprite.tint = color;

                            SceneManager._scene.gui.editor.window.title.innerHTML = `Color Editor: ${this.target.sprite.color} <span class='circle-ball-color' style='background-color: ${this.target.sprite.color.replace("0x", "#")};'></span>`
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

                            SceneManager._scene.gui.editor.window.title.innerHTML = `Color Editor: ${this.target.sprite.color} <span class='circle-ball-color' style='background-color: ${this.target.sprite.color.replace("0x", "#")};'></span>`
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

                            SceneManager._scene.gui.editor.window.title.innerHTML = `Color Editor: ${this.target.sprite.color} <span class='circle-ball-color' style='background-color: ${this.target.sprite.color.replace("0x", "#")};'></span>`
                        }
                    }, {
                        component: 'modal',
                        class: 'wcolor-list-edit',
                        open: true,
                        components: [{
                            component: 'list-basic',
                            onclick: (object, item) => {
                                this.target.sprite.color = object.color;
                                this.target.sprite.tint = object.color;
                                let color = Haya.Utils.Color.hexRgb(String(object.color).replace("0x", "#"));
                                $.editor.pallete.red = color.red;
                                $.editor.pallete.green = color.green;
                                $.editor.pallete.blue = color.blue;
                                SceneManager._scene.gui.editor.window.components[4].set(color.red);
                                SceneManager._scene.gui.editor.window.components[5].set(color.green);
                                SceneManager._scene.gui.editor.window.components[6].set(color.blue);

                                SceneManager._scene.gui.editor.window.title.innerHTML = `Color Editor: ${this.target.sprite.color} <span class='circle-ball-color' style='background-color: ${this.target.sprite.color.replace("0x", "#")};'></span>`
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

        createLightHeight() {
            this.el.lightHeight = new Components.input.Number({
                parent: this.editor,
                label: 'Light Height (v/100):',
                min: -1000.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.sprite.lightHeight),
                step: ".10",
                format: 'float'
            })
            this.el.lightHeight.input.onchange = () => {
                this.el.lightHeight.input.value = this.el.lightHeight.input.value / 100;
                this.target.sprite.lightHeight = Haya.DMath.float(this.el.lightHeight.get())
            }
            this.el.lightHeight.container.onclick = () => {
                this.register.lightHeight = this.target.sprite.lightHeight
                this.command('light-height')
            }
        }

        createFalloff() {

            this.el.falloffA = new Components.input.Number({
                parent: this.editor,
                label: 'Falloff A (v/100):',
                min: -1000.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.sprite.falloff[0]),
                step: ".10",
                format: 'float'
            })
            this.el.falloffA.input.onchange = () => {
                this.el.lightHeight.input.value = this.el.falloffA.input.value / 100;
                this.target.sprite.falloff[0] = Haya.DMath.float(this.el.falloffA.get())
            }
            this.el.falloffA.container.onclick = () => {
                this.register.falloffA = this.target.sprite.falloff[0]
                this.command('falloffA')
            }

            this.el.falloffB = new Components.input.Number({
                parent: this.editor,
                label: 'Falloff B (v/100):',
                min: -1000.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.sprite.falloff[1]),
                step: ".10",
                format: 'float'
            })
            this.el.falloffB.input.onchange = () => {
                this.el.lightHeight.input.value = this.el.falloffB.input.value / 100;
                this.target.sprite.falloff[1] = Haya.DMath.float(this.el.falloffB.get())
            }
            this.el.falloffB.container.onclick = () => {
                this.register.falloffB = this.target.sprite.falloff[1]
                this.command('falloffB')
            }


            this.el.falloffC = new Components.input.Number({
                parent: this.editor,
                label: 'Falloff C (v/100):',
                min: -1000.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.sprite.falloff[2]),
                step: ".10",
                format: 'float'
            })
            this.el.falloffC.input.onchange = () => {
                this.el.lightHeight.input.value = this.el.falloffC.input.value / 100;
                this.target.sprite.falloff[2] = Haya.DMath.float(this.el.falloffC.get())
            }
            this.el.falloffC.container.onclick = () => {
                this.register.falloffC = this.target.sprite.falloff[2]
                this.command('falloffC')
            }
        }

        createBlendMode() {
            // blend
            this.el.blendMode = new Components.list.Select({
                parent: this.editor,
                label: 'Blend Mode:',
                data: $.blendMode_select(),
                onchange: () => {
    

                    let kind = this.el.blendMode.data.find(bld => bld.value === parseInt(this.el.blendMode.get())).target

                    this.target.sprite.blendMode = kind //$.editor.blend.list[kind][0];
                    
                }
            })
            this.el.blendMode.choose(this.target.sprite.blendMode)
        }

        createScales() {
            // scaleX
            this.el.scaleX = new Components.input.Number({
                parent: this.editor,
                label: 'Scale X (v/100):',
                min: -1000.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.sprite.scale.x),
                step: .1,
                format: 'float'
            })
            this.el.scaleX.input.onchange = () => {
                this.el.scaleX.input.value = this.el.scaleX.input.value / 100;
                this.target.sprite.scale.x = Haya.DMath.float(this.el.scaleX.get())
            }
            this.el.scaleX.container.onclick = () => {
                this.register.scaleX = this.target.sprite.scale.x
                this.command('scaleX')
            }

            // scaleY
            this.el.scaleY = new Components.input.Number({
                parent: this.editor,
                label: 'Scale Y (v/100):',
                min: -1000.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.sprite.scale.y),
                step: .1,
                format: 'float'
            })
            this.el.scaleY.input.onchange = () => {
                this.el.scaleY.input.value = this.el.scaleY.input.value / 100;
                this.target.sprite.scale.y = Haya.DMath.float(this.el.scaleY.get())
            }
            this.el.scaleY.container.onclick = () => {
                this.register.scaleY = this.target.sprite.scale.y
                this.command('scaleY')
            }
        }

        createAnchors() {
            // anchorX
            this.el.anchorX = new Components.input.Number({
                parent: this.editor,
                label: 'Anchor X (v/100):',
                min: -1000.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.sprite.anchor.x),
                step: .1,
                format: 'float'
            })
            this.el.anchorX.input.onchange = () => {
                this.el.anchorX.input.value = this.el.anchorX.input.value / 100;
                this.target.sprite.anchor.x = Haya.DMath.float(this.el.anchorX.get())
            }
            this.el.anchorX.container.onclick = () => {
                this.register.anchorX = this.target.sprite.anchor.x
                this.command('anchorX')
            }

            // scaleY
            this.el.anchorY = new Components.input.Number({
                parent: this.editor,
                label: 'Anchor Y (v/100):',
                min: -1000.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.sprite.anchor.y),
                step: .1,
                format: 'float'
            })
            this.el.anchorY.input.onchange = () => {
                this.el.anchorY.input.value = this.el.anchorY.input.value / 100;
                this.target.sprite.anchor.y = Haya.DMath.float(this.el.anchorY.get())
            }
            this.el.anchorY.container.onclick = () => {
                this.register.anchorY = this.target.sprite.anchor.y
                this.command('anchorY')
            }
        }

        createRotation() {
            // Rotation
            this.el.rotation = new Components.input.Number({
                parent: this.editor,
                label: 'Rotation:',
                min: -360.0,
                max: 360.0,
                default: Haya.DMath.float(Haya.DMath.degrees(this.target.sprite.rotation)),
                step: 1,
                format: 'float'
            })
            this.el.rotation.input.onchange = () => {
                this.target.sprite.rotation = Haya.DMath.radians(Haya.DMath.float(this.el.rotation.get()))

            }

            this.el.rotation.container.onclick = () => {
                this.register.rotation = this.target.sprite.rotation;
                this.command('rotation')
            }
        }

        create_effect() {
            this.el.effects = new Components.button.Basic({
                label: 'Effects',
                parent: this.editor,
                onclick: () => {
                    SceneManager._scene.gui.editor.window.setup.title = 'Effects Property';


                    // comps
                    SceneManager._scene.gui.editor.window.components = [{
                            component: 'modal',
                            class: 'window-sub',
                            components: [{
                                    component: 'checkbox',
                                    label: 'Pulse Effect Active?',
                                    onchange: (checked, checkbox) => {
                                        this.target.pulse.value = checked;
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Speed (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float(this.target.pulse.speed),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        this.target.pulse.speed = Haya.DMath.float(value / 10)
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Mininum (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float(this.target.pulse.min),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        this.target.pulse.min = Haya.DMath.float(value / 10)
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Maximun (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float(this.target.pulse.max),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        this.target.pulse.max = Haya.DMath.float(value / 10)
                                    }
                                }, {
                                    component: 'number',
                                    label: 'Duration (v/10 | seconds):',
                                    min: 0,
                                    max: 1000,
                                    step: 0.1,
                                    format: 'float',
                                    default: Haya.DMath.float(this.target.pulse.duration),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        this.target.pulse.duration = Haya.DMath.float(value / 10)
                                    }
                                }
                            ]
                        },
                        {
                            component: 'modal',
                            class: 'window-sub',
                            components: [{
                                    component: 'checkbox',
                                    checked: this.target.oscilation.value,
                                    label: 'Oscilation Effect Active?',
                                    onchange: (checked, checkbox) => {
                                        this.target.oscilation.value = checked;
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Speed (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float(this.target.oscilation.speed),
                                    onchange: (value, number) => {

                                        number.input.value = value / 10;
                                        this.target.oscilation.speed = Haya.DMath.float(value / 10)
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Mininum (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float(this.target.oscilation.min),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        this.target.oscilation.min = Haya.DMath.float(value / 10)
                                    }
                                },
                                {
                                    component: 'number',
                                    label: 'Maximun (v/10)',
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    format: 'float',
                                    default: Haya.DMath.float(this.target.oscilation.max),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        this.target.oscilation.max = Haya.DMath.float(value / 10)
                                    }
                                }, {
                                    component: 'number',
                                    label: 'Duration (v/10 | seconds):',
                                    min: 0,
                                    max: 1000,
                                    step: 0.1,
                                    format: 'float',
                                    default: Haya.DMath.float(this.target.oscilation.duration),
                                    onchange: (value, number) => {
                                        number.input.value = value / 10;
                                        this.target.oscilation.duration = Haya.DMath.float(value / 10)
                                    }
                                }
                            ]
                        }
                    ]



                    // draw
                    SceneManager._scene.gui.editor.window.open();
                    SceneManager._scene.gui.editor.window.draw();
                }
            })
        }

        create_Filter() {
            // create
            this.el.filter = new Components.list.Select({
                label: 'Filter',
                parent: this.editor,
                data: Haya.Filters.list()
            })

            this.el.filter.select.onchange = () => {
                var target = this.el.filter.data.find(el => el.value === +this.el.filter.get()).target
                this.el.filter.choose(0);


                if (!(typeof target === 'object')) return;

                SceneManager._scene.gui.editor.window.setup.title = `Add Filter`
                SceneManager._scene.gui.editor.window.refresh();



                SceneManager._scene.gui.editor.window.components = [{
                    component: 'text',
                    label: 'Name:',
                    value: `Filter ` + String(SceneManager._scene._spriteset.filter.element.length + 1),
                    onchange: (value) => {
                        $.temp.lpName = value;
                    }
                }, {
                    component: 'button',
                    label: 'Create',
                    class: 'btn-standard grid-center',
                    onclick: () => {

                        console.log(this.target, 'from');
                        

                        target.setup = Object.assign({
                            name: ($.temp.lpName || `Filter ` + String(SceneManager._scene._spriteset.filter.element.length + 1)),
                            floor:  this.target.floor,
                            from: `light_${this.target._name}`
                        }, target.setup)


                        SceneManager._scene._spriteset.addFilter(target)

                        $.editor.control = 'light-editor';

                        SceneManager._scene.refreshEditor();
                        SceneManager._scene.setupEditor();

                        SceneManager._scene.gui.editor.window.refresh()
                        SceneManager._scene.gui.editor.window.close();
                    }
                }, {
                    component: 'button',
                    label: 'Return',
                    class: 'btn-standard grid-center',
                    onclick: function () {
                        SceneManager._scene.gui.editor.window.refresh()
                        SceneManager._scene.gui.editor.window.close();
                    }
                }]

                SceneManager._scene.gui.editor.window.open();
                SceneManager._scene.gui.editor.window.draw();
                return;

            }
        }

        createFloor() {
            this.el.floor = new Components.list.Select({
                parent: this.editor,
                label: 'Floor:',
                data: $.config.floor
            })
            this.el.floor.select.onchange = () => {
                var target = this.el.floor.data.find(el => el.value === +this.el.floor.get())
                this.target.floor = target.label;
                this.change = true
            }
            let defaultFloor = this.el.floor.data.find(el => el.label === this.target.floor).value
            this.el.floor.choose(defaultFloor)
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
                                    this.wedit = null
                                    SceneManager._scene._spriteset.removeLight(
                                        SceneManager._scene.gui.editorLight.target._name
                                    );
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
    }
    // | ======================================================================
    // | Editor_Collision
    // | Class to edit the collision properties
    // | ======================================================================
    class Editor_Collision {
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
            this.refresh()
        }

        refresh() {
            El.removeChild(this.editor)
            this.target = null;
            this.el = {};
            this.wedit = null;
            El.addClass(this.editor, 'nested')
            this.register = {};
            this.mouse = new Point(0, 0);
            this.tint = null;
            this.change = false;
        }

        command(value) {
            this.wedit = this.wedit === value ? null : value;
        }

        undo() {
            return (Input.isPressed('control') && Input.isPressed('ok'))
        }

        update() {
            if (this.change === true) {
                if (this.wedit === "point") {
                    this.target.setPoints(this.target.cachePoints)
                    this.el.points.data = SceneManager._scene.collisionPoints();
                    this.el.points.setOptions();
                }
                this.change = false;
                SceneManager._scene.collisionGraphic(this.target, true)
            }

            if (this.wedit === 'position') {
                // trigger
                if (Input.isPressed('ok')) {
                    this.wedit = null;
                }
                // undo
                if (Input.isPressed('control') && Input.isPressed('ok')) {
                    this.target.x = this.register.pos.x;
                    this.target.y = this.register.pos.y;
                    this.change = true;
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    this.target.x = Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    this.target.y = Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    this.el.position.button.innerHTML = `x ${Haya.DMath.float(this.target.x)} | y: ${Haya.DMath.float(this.target.y)}`
                    this.change = true;
                }
            }

            if (this.wedit === 'radius') {
                if (this.undo()) {
                    this.target.radius = this.register.radius
                    this.el.radius.set(this.target.radius)
                }

                this.target.radius = Haya.DMath.wheelID(
                    this.target.radius,
                    1,
                    1000,
                    0.5,
                    (current) => {
                        this.el.radius.set(current)
                        this.change = true
                    }
                )
            }

            if (this.wedit === 'scale_average') {
                if (this.undo()) {
                    if (this.kind() === 'circle') {
                        this.target.scale = this.register.scale
                    } else {
                        this.target.scale_x = this.register.scale
                        this.target.scale_y = this.register.scale
                    }
                    this.el.scale.set(this.register.scale)
                }

                if (this.kind() === 'circle') {
                    this.target.scale = Haya.DMath.wheelID(
                        this.target.scale,
                        1,
                        1000,
                        0.05,
                        (current) => {
                            this.el.scale.set(current)
                            this.change = true;
                        }
                    )
                } else {
                    if (this.dir() === 'up') {
                        this.target.scale_y -= 0.01
                        this.el.scale.set((this.target.scale_x + this.target.scale_y) / 2)
                        this.change = true
                    } else if (this.dir() === 'down') {
                        this.target.scale_y += 0.01
                        this.el.scale.set((this.target.scale_x + this.target.scale_y) / 2)
                        this.change = true
                    } else if (this.dir() === 'left') {
                        this.target.scale_x -= 0.01
                        this.el.scale.set((this.target.scale_x + this.target.scale_y) / 2)
                        this.change = true
                    } else if (this.dir() === 'right') {
                        this.target.scale_x += 0.01
                        this.el.scale.set((this.target.scale_x + this.target.scale_y) / 2)
                        this.change = true
                    }
                }


            }

            if (this.wedit === 'scaleX') {
                if (this.undo()) {
                    this.target.scale_x = this.register.scale_x
                    this.el.scaleX.set(this.target.scale_x)
                }

                this.target.scale_x = Haya.DMath.wheelID(
                    this.target.scale_x,
                    1,
                    1000,
                    0.05,
                    (current) => {
                        this.el.scaleX.set(current)
                        this.change = true
                    }
                )
            }

            if (this.wedit === 'scaleY') {
                if (this.undo()) {
                    this.target.scale_y = this.register.scale_y
                    this.el.scaleY.set(this.target.scale_y)
                }

                this.target.scale_y = Haya.DMath.wheelID(
                    this.target.scale_y,
                    1,
                    1000,
                    0.05,
                    (current) => {
                        this.el.scaleY.set(current)
                        this.change = true
                    }
                )
            }

            if (this.wedit === 'padding') {
                if (this.undo()) {
                    this.target.padding = this.register.padding
                    this.el.padding.set(this.target.padding)
                }

                this.target.padding = Haya.DMath.wheelID(
                    this.target.padding,
                    1,
                    1000,
                    1,
                    (current) => {
                        this.el.padding.set(current)
                    }
                )
            }

            if (this.wedit === 'angle') {
                if (this.undo()) {
                    this.target.angle = this.register.angle
                    this.el.rotation.set(Haya.DMath.float(Haya.DMath.degrees(this.target.angle)))
                    this.change = true
                }

                this.target.angle = Haya.DMath.wheelID(
                    this.target.angle,
                    -6.2,
                    6.2,
                    0.1,
                    (current) => {
                        this.change = true
                        this.el.rotation.set(Haya.DMath.float(Haya.DMath.degrees(current)))
                    }
                )
            }

            if (this.wedit === 'point') {
                // trigger
                if (Input.isPressed('ok')) {
                    this.wedit = null;

                } else if (Input.isTriggered('d')) {
                    let cachePoints = [];
                    let toDelete = this.target.cachePoints[$.temp.pointId]

                    this.target.cachePoints.forEach((points) => {
                        if (points[0] === toDelete[0] && points[1] === toDelete[1]) {
                            return;
                        } else {
                            cachePoints.push(points)
                        }
                    })

                    this.target.cachePoints = cachePoints;
                    this.wedit = null;
                    this.change = true;
                }

                if (TouchInput.isPressed()) { // isPressed

                    this.target.cachePoints[$.temp.pointId][0] = (Haya.Mouse.x + SceneManager._scene.display.x) - this.target.x;
                    this.target.cachePoints[$.temp.pointId][1] = (Haya.Mouse.y + SceneManager._scene.display.y) - this.target.y;
                    // this.target.cachePoints[$.temp.pointId][0]= Haya.Mouse.x + (-Haya.Map.Viewport.x);
                    // this.target.cachePoints[$.temp.pointId][1]= Haya.Mouse.y + (-Haya.Map.Viewport.y);
                    this.change = true
                }
            }
        }

        dir() {
            if (TouchInput.isPressed() && Input.isPressed('control')) {

                //if ($.editor.wedit = 'point' && !Input.isPressed('ctrl')) return;

                // RIGHT

                if (Haya.Mouse.x > this.mouse.x) {
                    return 'right'
                }

                // LEFT

                if (Haya.Mouse.x < this.mouse.x) {
                    return 'left'
                }

                // UP

                if (Haya.Mouse.y < this.mouse.y) {
                    return 'up'
                }

                // DOWN
                if (Haya.Mouse.y > this.mouse.y) {
                    return 'down'
                }
            } else {
                this.mouse.x = Haya.Mouse.x;
                this.mouse.y = Haya.Mouse.y;
            }
            return 'zero'
        }

        kind() {
            return this.target._kind.toLowerCase();
        }

        create() {

            if (Haya.Utils.invalid(this.target)) return;

            El.removeClass(this.editor, 'nested')

            this.el.back = new Components.button.Basic({
                label: 'Return',
                parent: this.editor,
                onclick: () => {
                    $.editor.control = 'collision'
                    this.refresh();
                    SceneManager._scene.refreshEditor();
                    SceneManager._scene.setupEditor();
                }
            })

            this.create_position();

            this.createRadius();

            this.createScale();

            this.createScaleX()

            this.createScaleY()

            this.createPadding()

            this.createRotation()

            this.createPoints()

            this.create_switch()

            this.createFloor()

            this.create_remove();

            this.wedit = null;
        }

        create_position() {
            this.el.position = new Components.button.Basic({
                label: `x ${Haya.DMath.float(this.target.x)} | y: ${Haya.DMath.float(this.target.y)}`,
                parent: this.editor,
                onclick: () => {
                    this.wedit = this.wedit === 'position' ? null : 'position';
                    this.register.pos = new Haya.DMath.Vector2D(this.target.x, this.target.y);
                    if (this.wedit === 'position') {
                        new Components.alert.Geral({
                            label: 'Press [space bar] to confirm the position'
                        })
                    }
                }
            })
        }

        createRadius() {
            if (this.kind() !== 'circle') return
            this.el.radius = new Components.input.Range({
                parent: this.editor,
                label: 'Radius &value:',
                min: 0.0,
                max: 1000.0,
                default: Haya.DMath.float(this.target.radius),
                step: 1.0,
                format: (value) => {
                    return parseInt(value)
                },
                onchange: (value) => {
                    this.target.radius = value
                    //this.command('opacity')
                    this.change = true
                }
            })
            this.el.radius.container.onclick = () => {
                this.register.radius = this.target.radius;
                this.command('radius')
            }
        }

        createScale() {
            this.el.scale = new Components.input.Number({
                parent: this.editor,
                label: 'Scale (v/100):',
                min: 1,
                max: 1000.0,
                default: Haya.DMath.float(
                    this.kind() === 'circle' ?
                    this.target.scale :
                    (this.target.scale_x + this.target.scale_y) / 2
                ),
                step: 0.1,
                format: 'float'
            })

            this.el.scale.input.onchange = () => {
                this.el.scale.input.value = this.el.scale.get() / 100

                if (this.kind() === 'circle') {
                    this.target.scale = Haya.DMath.float(this.el.scale.get())
                } else {
                    this.target.scale_x = Haya.DMath.float(this.el.scale.get())
                    this.target.scale_y = Haya.DMath.float(this.el.scale.get())
                }

                this.change = true
            }

            this.el.scale.container.onclick = () => {
                if (this.kind() === 'circle') {
                    this.register.scale = this.target.scale
                } else {
                    this.register.scale = (this.target.scale_x + this.target.scale_y) / 2
                }
                this.command('scale_average')
            }
        }

        createScaleX() {
            if (this.kind() === 'circle') return

            this.el.scaleX = new Components.input.Number({
                parent: this.editor,
                label: 'Scale X (v/10):',
                min: 1,
                max: 1000.0,
                default: Haya.DMath.float(this.target.scale_x),
                step: 0.1,
                format: 'float'
            })

            this.el.scaleX.input.onchange = () => {
                this.el.scaleX.input.value = this.el.scaleX.get() / 10
                this.target.scale_x = Haya.DMath.float(this.el.scaleX.get())
                this.change = true
            }

            this.el.scaleX.container.onclick = () => {
                this.register.scale_x = this.target.scale_x
                this.command('scaleX')
            }
        }

        createScaleY() {
            if (this.kind() === 'circle') return
            this.el.scaleY = new Components.input.Number({
                parent: this.editor,
                label: 'Scale Y (v/10):',
                min: 1,
                max: 1000.0,
                default: Haya.DMath.float(this.target.scale_y),
                step: 0.1,
                format: 'float'
            })

            this.el.scaleY.input.onchange = () => {
                this.el.scaleY.input.value = this.el.scaleY.get() / 10
                this.target.scale_y = Haya.DMath.float(this.el.scaleY.get())
                this.change = true
            }

            this.el.scaleY.container.onclick = () => {
                this.register.scale_y = this.target.scale_y
                this.command('scaleY')
            }
        }

        createPoints() {
            if (this.kind() !== 'polygon') return

            // new point
            this.el.newPoint = new Components.button.Basic({
                label: 'New Point',
                parent: this.editor,
                onclick: () => {
                    // this.target.cachePoints.push([
                    //     this.target.x - ((Graphics.width / 2) + this.display.x),
                    //     this.target.y - ((Graphics.width / 2) + this.display.y),
                    // ])

                    this.target.cachePoints.push([
                        this.target.x + 10,
                        this.target.y + 10,
                    ])

                    this.target.setPoints(this.target.cachePoints)

                    this.el.points.data = SceneManager._scene.collisionPoints();
                    this.el.points.setOptions();
                }
            })


            // points
            this.el.points = new Components.list.Select({
                parent: this.editor,
                label: 'Polygon Points:',
                data: SceneManager._scene.collisionPoints()
            })

            this.el.points.select.onchange = () => {
                var target = this.el.points.data.find(el => el.value === +this.el.points.get())
                this.el.points.choose(0);
                if (target.id === null) return;
                $.temp.pointId = target.id
                this.command('point');
            }
        }

        createPadding() {
            this.el.padding = new Components.input.Range({
                parent: this.editor,
                label: 'Padding &value:',
                min: 0,
                max: 1000,
                default: Haya.DMath.float(this.target.padding),
                step: 1,
                format: (value) => {
                    return parseInt(value)
                },
                onchange: (value) => {
                    this.target.padding = value
                    //this.command('opacity')
                    this.change = true
                }
            })
            this.el.padding.container.onclick = () => {
                this.register.padding = this.target.padding;
                this.command('padding')
            }
        }

        createRotation() {
            if (this.kind() === 'circle') return
            // Rotation
            this.el.rotation = new Components.input.Number({
                parent: this.editor,
                label: 'Angle:',
                min: -360.0,
                max: 360.0,
                default: Haya.DMath.float(Haya.DMath.degrees(this.target.angle)),
                step: 1,
                format: 'float'
            })
            this.el.rotation.input.onchange = () => {
                this.target.angle = Haya.DMath.radians(Haya.DMath.float(this.el.rotation.get()))
                // this.change = true
            }

            this.el.rotation.container.onclick = () => {
                this.register.angle = this.target.angle;
                this.command('angle')
            }
        }

        createFloor() {
            this.el.floor = new Components.list.Select({
                parent: this.editor,
                label: 'Floor:',
                data: $.config.floor
            })
            this.el.floor.select.onchange = () => {
                var target = this.el.floor.data.find(el => el.value === +this.el.floor.get())
                this.target.floor = target.label;
                this.change = true
            }
            let defaultFloor = this.el.floor.data.find(el => el.label === this.target.floor).value
            this.el.floor.choose(defaultFloor)


            this.el.linkTo = new Components.boolean.Checkbox({
                parent: this.editor,
                label: 'Link to the floor?',
                checked: this.target.linkto,
                onchange: (checked, checkbox) => {
                    this.target.linkto = checked;
                    if (this.target.linkto === true) {
                        this.target.scale_y = 0.1;
                        this.change = true
                    }
                }
            })

            // kind of link
            this.el.linkKind = new Components.list.Select({
                parent: this.editor,
                label: 'Floor:',
                data: [{
                    label: 'horizontal',
                    value: 0
                }, {
                    label: 'vertical',
                    value: 1
                }]
            })
            this.el.linkKind.select.onchange = () => {
                var target = this.el.linkKind.data.find(el => el.value === +this.el.linkKind.get())
                this.target.linkKind = target.label;
            }
            let defaultKind = this.el.linkKind.data.find(el => el.label === this.target.linkKind.toLowerCase()).value
            this.el.linkKind.choose(defaultKind)
        }

        create_switch() {
            this.el.switch = new Components.input.Number({
                label: `Switch ID: ${this.target.switch}`,
                parent: this.editor,
                default: this.target.switch,
                min: -1,
                max: Infinity,
                step: 1
            })
            this.el.switch.input.onchange = () => {
                this.target.switch = this.el.switch.get();
                this.el.switch.label = `Switch ID: ${this.target.switch}`
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
                                    $.editor.kind = null;
                                    $.editor.weditChange = false;
                                    SceneManager._scene.removeCollision(SceneManager._scene.editorCollision.target._name);
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
    }
    // | ======================================================================
    // | Editor_Sound
    // | Class to edit the sound properties
    // | ======================================================================
    class Editor_Sound {
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
            this.refresh()
        }

        refresh() {
            El.removeChild(this.editor)
            this.target = null;
            this.el = {};
            this.wedit = null;
            El.addClass(this.editor, 'nested')
            this.register = {};
            this.mouse = new Point(0, 0);
            this.tint = null;
            this.change = false;
        }

        command(value) {
            this.wedit = this.wedit === value ? null : value;
        }

        undo() {
            return (Input.isPressed('control') && Input.isPressed('ok'))
        }


        update() {
            if (this.change === true) {
                Haya.Map.sound_setPannerAttr(this.target)
                this.change = false;
            }


            if (this.wedit === 'position') {
                // trigger
                if (Input.isPressed('ok')) {
                    this.wedit = null
                }
                // editing
                if (TouchInput.isLongPressed()) { // isPressed
                    this.target.editor.pos.x = Haya.Mouse.x + -Haya.Map.Viewport.x;
                    this.target.editor.pos.y = Haya.Mouse.y + -Haya.Map.Viewport.y;
                    this.target._pos[0] = this.target.editor.pos.x;
                    this.target._pos[1] = this.target.editor.pos.y;
                    this.change = true
                    this.el.position.button.innerHTML = this.target.editor.pos.string()
                }

                this.target.editor.pos.z = Haya.DMath.wheelID(
                    this.target.editor.pos.z,
                    -500,
                    500,
                    1,
                    (current) => {
                        this.change = true
                        this.el.position.button.innerHTML = this.target.editor.pos.string()
                    }
                )
            }

            if (this.wedit === 'volume') {
                if (this.undo()) {

                    this.target.editor._data.volume = this.register.volume;
                    this.target.volume(this.target.editor._data.volume);
                    this.el.opacity.set(this.register.volume * 100)
                }

                this.target.editor._data.volume = Haya.DMath.wheelID(
                    this.target.editor._data.volume,
                    0.05,
                    1,
                    0.05,
                    (current) => {
                        this.target.volume(current);
                        this.el.opacity.set(current * 100)
                    }
                )
            }

            if (this.wedit === 'rate') {
                if (this.undo()) {

                    this.target.editor._data.rate = this.register.rate;
                    this.el.rate.set(this.register.rate)
                }

                this.target.editor._data.rate = Haya.DMath.wheelID(
                    this.target.editor._data.rate,
                    .5,
                    4,
                    0.05,
                    (current) => {
                        this.el.rate.set(current)
                    }
                )
            }

            if (this.wedit === 'refDistance') {
                if (this.undo()) {

                    this.target.editor._data.refDistance = this.register.refDistance;
                    this.el.refDistance.set(this.register.refDistance)
                }

                this.target.editor._data.refDistance = Haya.DMath.wheelID(
                    this.target.editor._data.refDistance,
                    0,
                    1000,
                    1,
                    (current) => {
                        this.el.refDistance.set(current)
                    }
                )
            }

            if (this.wedit === 'rolloffFactor') {
                if (this.undo()) {

                    this.target.editor._data.rolloffFactor = this.register.rolloffFactor;
                    this.el.rolloffFactor.set(this.register.rolloffFactor)
                }

                this.target.editor._data.rolloffFactor = Haya.DMath.wheelID(
                    this.target.editor._data.rolloffFactor,
                    0,
                    100,
                    0.1,
                    (current) => {
                        this.el.rolloffFactor.set(current)
                    }
                )
            }

            if (this.wedit === 'coneInnerAngle') {
                if (this.undo()) {

                    this.target.editor._data.coneInnerAngle = this.register.coneInnerAngle;
                    this.el.coneInnerAngle.set(this.register.coneInnerAngle)
                }

                this.target.editor._data.coneInnerAngle = Haya.DMath.wheelID(
                    this.target.editor._data.coneInnerAngle,
                    -360,
                    360,
                    1,
                    (current) => {
                        this.el.coneInnerAngle.set(current)
                    }
                )
            }

            if (this.wedit === 'coneOuterAngle') {
                if (this.undo()) {

                    this.target.editor._data.coneOuterAngle = this.register.coneOuterAngle;
                    this.el.coneOuterAngle.set(this.register.coneOuterAngle)
                }

                this.target.editor._data.coneOuterAngle = Haya.DMath.wheelID(
                    this.target.editor._data.coneOuterAngle,
                    -360,
                    360,
                    1,
                    (current) => {
                        this.el.coneOuterAngle.set(current)
                    }
                )
            }

            if (this.wedit === 'coneOuterGain') {
                if (this.undo()) {

                    this.target.editor._data.coneOuterGain = this.register.coneOuterGain;
                    this.el.coneOuterGain.set(this.register.coneOuterGain)
                }

                this.target.editor._data.coneOuterGain = Haya.DMath.wheelID(
                    this.target.editor._data.coneOuterGain,
                    0,
                    360,
                    1,
                    (current) => {
                        this.el.coneOuterGain.set(current)
                    }
                )
            }

            if (this.wedit === 'maxDistance') {
                if (this.undo()) {

                    this.target.editor._data.maxDistance = this.register.maxDistance;
                    this.el.maxDistance.set(this.register.maxDistance)
                }

                this.target.editor._data.maxDistance = Haya.DMath.wheelID(
                    this.target.editor._data.maxDistance,
                    0,
                    1e4,
                    1,
                    (current) => {
                        this.el.maxDistance.set(current)
                    }
                )
            }
        }

        dir() {
            if (TouchInput.isPressed() && Input.isPressed('control')) {

                //if ($.editor.wedit = 'point' && !Input.isPressed('ctrl')) return;

                // RIGHT

                if (Haya.Mouse.x > this.mouse.x) {
                    return 'right'
                }

                // LEFT

                if (Haya.Mouse.x < this.mouse.x) {
                    return 'left'
                }

                // UP

                if (Haya.Mouse.y < this.mouse.y) {
                    return 'up'
                }

                // DOWN
                if (Haya.Mouse.y > this.mouse.y) {
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
                    $.editor.control = 'sound'
                    this.refresh();
                    SceneManager._scene.refreshEditor();
                    SceneManager._scene.setupEditor();
                }
            })

            this.create_playStop()

            this.createAutoPlay()

            this.createLoop()

            this.create_position();

            this.createVolume()

            this.createRate()

            this.createRefDistance()

            this.createRolloffFactor()

            this.createSwitch()

            this.createTime()

            this.createConeInnerAngle()

            this.createConeOuterAngle()

            this.createConeOuterGain()

            this.createMaxDistance();

            this.create_remove()

            this.wedit = null
        }

        create_position() {
            this.el.position = new Components.button.Basic({
                label: `${this.target.editor.pos.string()}`,
                parent: this.editor,
                onclick: () => {
                    this.command('position')
                    this.register.pos = this.target.editor.pos.clone()
                    if (this.wedit === 'position') {
                        new Components.alert.Geral({
                            label: 'Press [space bar] to confirm the position & Use the Wheel of the Mouse to change the Z'
                        })
                    }
                }
            })
        }

        create_playStop() {
            this.el.play = new Components.button.Basic({
                label: 'Play or Stop',
                parent: this.editor,
                onclick: () => {
                    if (this.target.playing() === true) {
                        this.target.stop();
                    } else {
                        this.target.play()
                    }
                    this.change = true
                }
            })
        }

        createAutoPlay() {
            // auto Play?
            this.el.autoPlay = new Components.boolean.Checkbox({
                label: 'Auto play?',
                checked: this.target.editor._data.autoplay,
                parent: this.editor,
                onchange: (checked) => {
                    this.target.editor._data.autoplay = checked;
                    this.target.autoplay = checked
                }
            })
        }

        createVolume() {
            this.el.volume = new Components.input.Range({
                parent: this.editor,
                label: 'Volume &value%:',
                min: 0.0,
                max: 100.0,
                default: Haya.DMath.float(this.target.editor._data.volume * 100),
                step: 1.0,
                format: (value) => {
                    return Haya.DMath.float(+(value))
                },
                onchange: (value) => {
                    this.target.editor._data.volume = value;
                    this.target.volume(this.target.editor._data.volume);
                }
            })
            this.el.volume.container.onclick = () => {
                this.register.volume = this.target.editor._data.volume;
                this.command('volume')
            }
        }

        createSwitch() {
            this.el.switch = new Components.input.Number({
                label: `Switch ID: ${this.target.editor._data.switch}`,
                parent: this.editor,
                default: this.target.switch,
                min: -1,
                max: Infinity,
                step: 1
            })
            this.el.switch.input.onchange = () => {
                this.target.editor._data.switch = this.el.switch.get();
                this.el.switch.label = `Switch ID: ${this.target.editor._data.switch}`
            }
        }

        createTime() {
            this.el.time = new Components.list.Select({
                parent: this.editor,
                label: `Period of Time: ${this.target.editor._data.time}`,
                data: $.config.periodTime,
                onchange: () => {
                    let time = Haya.Map.Time.isPeriod(parseInt(this.el.time.get()));
                    this.target.editor._data.time = time;
                    this.el.time.label.innerHTML = `Period of Time: ${this.target.editor._data.time}`
                }
            })
            this.el.time.choose(Haya.Map.Time.isPeriod(this.target.editor._data.time))
        }

        createLoop() {
            this.el.loop = new Components.boolean.Checkbox({
                label: 'Loop?',
                checked: this.target.editor._data.loop,
                parent: this.editor,
                onchange: (checked) => {
                    this.target.editor._data.loop = checked;
                    this.target.loop = this.target.editor._data.loop;
                }
            })
        }

        createRate() {
            this.el.rate = new Components.input.Number({
                parent: this.editor,
                label: 'Rate (v/100):',
                min: .5,
                max: 4.0,
                default: Haya.DMath.float(this.target.editor._data.rate),
                step: .01,
                format: 'float'
            })
            this.el.rate.input.onchange = () => {
                this.el.rate.input.value = this.el.rate.input.value / 100;
                this.target.editor._data.rate = Haya.DMath.float(this.el.rate.get())
                this.change = true
            }
            this.el.rate.container.onclick = () => {
                this.register.rate = this.target.editor._data.rate
                this.command('rate')
            }
        }

        createRefDistance() {
            // refDistance
            this.el.refDistance = new Components.input.Number({
                parent: this.editor,
                label: 'Reference of Distance:',
                min: 0,
                max: 1000,
                default: Haya.DMath.float(this.target.editor._data.refDistance),
                step: 1
            })
            this.el.refDistance.input.onchange = () => {
                // this.el.refDistance.input.value = this.el.refDistance.input.value;
                this.target.editor._data.refDistance = Haya.DMath.float(parseInt(this.el.refDistance.get()))
                this.change = true
            }

            this.el.refDistance.container.onclick = () => {
                this.command('refDistance')
                this.register.refDistance = this.target.editor._data.refDistance
            }
        }

        createRolloffFactor() {
            this.el.rolloffFactor = new Components.input.Number({
                parent: this.editor,
                label: 'Rolloff Factor (v/10):',
                min: 0,
                max: 100,
                default: Haya.DMath.float(this.target.editor._data.rolloffFactor),
                step: .1,
                format: 'float'
            })

            this.el.rolloffFactor.input.onchange = () => {
                this.el.rolloffFactor.input.value = this.el.rolloffFactor.input.value / 10;
                this.target.editor._data.rolloffFactor = this.el.rolloffFactor.input.value
                this.change = true
            }

            this.el.refDistance.container.onclick = () => {
                this.command('rolloffFactor')
                this.register.rolloffFactor = this.target.editor._data.rolloffFactor
            }
        }

        createConeInnerAngle() {
            this.el.coneInnerAngle = new Components.input.Number({
                parent: this.editor,
                label: 'Cone Inner Angle:',
                min: -360,
                max: 360,
                default: Haya.DMath.float(this.target.editor._data.coneInnerAngle),
                step: 1
            })

            this.el.rolloffFactor.input.onchange = () => {
                this.target.editor._data.coneInnerAngle = +this.el.coneInnerAngle.input.value
                this.change = true
            }

            this.el.coneInnerAngle.container.onclick = () => {
                this.command('coneInnerAngle')
                this.register.coneInnerAngle = this.target.editor._data.coneInnerAngle
            }
        }

        createConeOuterAngle() {
            this.el.coneOuterAngle = new Components.input.Number({
                parent: this.editor,
                label: 'Cone Outer Angle:',
                min: -360,
                max: 360,
                default: Haya.DMath.float(this.target.editor._data.coneOuterAngle),
                step: 1
            })

            this.el.coneOuterAngle.input.onchange = () => {
                this.target.editor._data.coneOuterAngle = +this.el.coneOuterAngle.input.value
                this.change = true
            }

            this.el.coneOuterAngle.container.onclick = () => {
                this.command('coneOuterAngle')
                this.register.coneOuterAngle = this.target.editor._data.coneOuterAngle
            }
        }

        createConeOuterGain() {
            this.el.coneOuterGain = new Components.input.Number({
                parent: this.editor,
                label: 'Cone Outer Gain:',
                min: 0,
                max: 360,
                default: Haya.DMath.float(this.target.editor._data.coneOuterGain),
                step: 1,
            })

            this.el.coneOuterGain.input.onchange = () => {
                this.target.editor._data.coneOuterGain = +this.el.coneOuterGain.input.value
                this.change = true
            }

            this.el.coneOuterGain.container.onclick = () => {
                this.command('coneOuterGain')
                this.register.coneOuterGain = this.target.editor._data.coneOuterGain
            }
        }

        createMaxDistance() {
            this.el.maxDistance = new Components.input.Number({
                parent: this.editor,
                label: 'Max Distance:',
                min: 0,
                max: 360,
                default: Haya.DMath.float(this.target.editor._data.maxDistance),
                step: 1,
            })

            this.el.maxDistance.input.onchange = () => {
                this.target.editor._data.maxDistance = +this.el.maxDistance.input.value
                this.change = true
            }

            this.el.maxDistance.container.onclick = () => {
                this.command('maxDistance')
                this.register.maxDistance = this.target.editor._data.maxDistance
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
                                    $.editor.kind = null;
                                    $.editor.weditChange = false;
                                    SceneManager._scene._spriteset.removeSound($.editor.target.editor.name);
                                    $.editor.control = "sound";
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
    }
    // | ======================================================================
    // | Editor_Filter
    // | Class to edit the filter properties
    // | ======================================================================
    class Editor_Filter {
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
            this.refresh();
        }

        undo() {
            return (Input.isPressed('control') && Input.isPressed('ok'))
        }

        command(value) {
            this.wedit = this.wedit === value ? null : value;
        }

        refresh() {
            El.removeChild(this.editor)
            this.target = null;
            this.el = {};
            this.wedit = null;
            El.addClass(this.editor, 'nested')
            this.register = {};
            this.mouse = new Point(0, 0);
            this.tint = null;
        }

        update() {
            if (Input.isPressed('ok')) {
                this.wedit = null
            }

            if (this.wedit === 'position') {
                // trigger
                if (Input.isPressed('ok')) {
                    this.wedit = null;
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
                    this.el.position.button.innerHTML = `x ${Haya.DMath.float(this.target.x)} | y: ${Haya.DMath.float(this.target.y)}`
                }
            }

            if (Haya.Utils.isFunction(this.wedit)) {
                this.wedit.call(this, this)
            }
        }

        dir() {
            if (TouchInput.isPressed() && Input.isPressed('control')) {

                //if ($.editor.wedit = 'point' && !Input.isPressed('ctrl')) return;

                // RIGHT

                if (Haya.Mouse.x > this.mouse.x) {
                    return 'right'
                }

                // LEFT

                if (Haya.Mouse.x < this.mouse.x) {
                    return 'left'
                }

                // UP

                if (Haya.Mouse.y < this.mouse.y) {
                    return 'up'
                }

                // DOWN
                if (Haya.Mouse.y > this.mouse.y) {
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
                    $.editor.control = 'filter'
                    this.refresh();
                    SceneManager._scene.refreshEditor();
                    SceneManager._scene.setupEditor();
                }
            })

            if (this.target.editor) {

                this.target.editor(this)
            }

            this.create_remove()

            this.wedit = null
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
                                    SceneManager._scene._spriteset.removeFilter($.editor.target.name);
                                    $.editor.control = 'filter';
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
    }
    // | ======================================================================
    // | Editor_Weather
    // | Class to edit the weather properties
    // | ======================================================================
    class Editor_Weather {

    }
    // | ======================================================================
    // | Editor_Option
    // | Class to edit the options of the editor
    // | ======================================================================
    class Editor_Option {

    }
    // | ======================================================================
    // | Scene_Editor
    // | Scene that display over the editor
    // | ======================================================================
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

            new Components.alert.Geral({
                label: 'Press 1, 2, 3 to switch the floor. Or press F!',
                position: 'bottomRight',
                duration: 2000
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

            this.gui.editorLight = new Editor_Light();

            this.gui.editorCollision = new Editor_Collision();

            this.gui.editorSound = new Editor_Sound();

            this.gui.editorFilter = new Editor_Filter;
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
            if (TouchInput.isCancelled()) {
                this.toolbar = !this.toolbar;
                if (this.toolbar === false) {
                    if (typeof $.editor.control === 'string' && $.editor.control.includes('-editor')) {
                        new Components.alert.Geral({
                            label: 'Press Left Button of Mouse while holding CTRL to move the object',
                            duration: 2500
                        })
                    } else {
                        new Components.alert.Geral({
                            label: 'Hold on the Left Button of Mouse to move out the camera',
                            duration: 2000
                        })
                    }
                }
            }

            if (this.toolbar === true) {
                El.removeClass(this.gui.stage, 'nested')
            } else {
                El.addClass(this.gui.stage, 'nested')
            }

            this.graphicCollision.visible = ($.editor.control === "collision" || $.editor.control === "collision-editor");


            // sprite editor
            if (this.gui.editorSprite.target !== null && $.editor.control === 'sprite-editor') {
                this.gui.editorSprite.update();
            }

            // light editor
            if (this.gui.editorLight.target !== null && $.editor.control === 'light-editor') {
                this.gui.editorLight.update();
            }

            // particle editor
            if (this.gui.editorParticle.target !== null && $.editor.control === 'particle-editor') {
                this.gui.editorParticle.update();
            }

            // sound editor
            if (this.gui.editorSound.target !== null && $.editor.control === 'sound-editor') {
                this.gui.editorSound.update();
            }

            // collision editor
            if (this.gui.editorCollision.target !== null && $.editor.control === 'collision-editor') {
                this.gui.editorCollision.update();
            }

            // filter editor
            if (this.gui.editorFilter.target !== null && $.editor.control === 'filter-editor') {
                this.gui.editorFilter.update();
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
            } else if (Input.isTriggered('f')) {
                $.editor.collisionFloor = Haya.Collision.Floor[$.editor.collisionFloor];
                $.editor.collisionFloor = ( $.editor.collisionFloor++ ) % 3;
                $.editor.collisionFloor = Haya.Collision.Floor[$.editor.collisionFloor];
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
            this.gui.editorSprite.refresh()

            this.gui.editorParticle.refresh()

            this.gui.editorLight.refresh()

            this.gui.editorCollision.refresh()

            this.gui.editorSound.refresh()

            this.gui.editorFilter.refresh()
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
                    break;
                case 'filter':
                    this.setupEditorFilter()
                    break;
                case 'filter-editor':
                    this.filterEditor()
                    break;
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
                    this.gui.editorLight.refresh();
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
            $.editor.wedit = null;
            $.editor.weditChange = false;

            this.gui.editorLight.target = $.editor.target;
            this.gui.editorLight.create();
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
                                    radius: 16,
                                    floor: $.temp.lpFloor || $.editor.collisionFloor
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
                                    floor: $.temp.lpFloor || $.editor.collisionFloor
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
            $.editor.wedit = null;
            $.editor.weditChange = false;

            this.gui.editorCollision.target = $.editor.target;
            this.gui.editorCollision.create();
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
                            name: $.temp.lpName || `${kind.toUpperCase()} ` + String(this.sound.element.length + 1),
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
            $.editor.wedit = null;
            $.editor.weditChange = false;

            this.gui.editorSound.target = $.editor.target;
            this.gui.editorSound.create();
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
                                $.temp.config = Haya.File.json($.temp.jurl);

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


                            SceneManager._scene._spriteset.addParticle({
                                config: $.temp.config,
                                setup: {
                                    name: ($.temp.lpName || `particle ` + String(this._spriteset.particle.element.length + 1)),
                                    floor: ($.temp.lpFloor || $.editor.collisionFloor)
                                },
                                textures: [$.temp.url]
                            })

                            $.editor.control = 'particle';
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


            this.gui.editorParticle.target = $.editor.target;
            this.gui.editorParticle.create();
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
        // | Filter Editor 
        // | --------------------------------------------------------

        setupEditorFilter() {
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
            this.gui.editor.el.create = new Components.list.Select({
                label: 'New Filter',
                parent: this.gui.editor,
                data: Haya.Filters.list()
            })

            this.gui.editor.el.create.select.onchange = () => {
                var target = this.gui.editor.el.create.data.find(el => el.value === +this.gui.editor.el.create.get()).target
                this.gui.editor.el.create.choose(0);

                console.log(target);


                if (!(typeof target === 'object')) return;

                this.gui.editor.window.setup.title = `New Filter`
                this.gui.editor.window.refresh();



                this.gui.editor.window.components = [{
                    component: 'text',
                    label: 'Name:',
                    value: `Filter ` + String(this._spriteset.filter.element.length + 1),
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
                    component: 'select',
                    label: 'Range of the Filter:',
                    data: Haya.Filters.range_targets(),
                    onchange: (value) => {
                        $.temp.lpRange = Haya.Filters.range_targets().find(el => el.value === +value).target
                    }
                }, {
                    component: 'button',
                    label: 'Create',
                    class: 'btn-standard grid-center',
                    onclick: () => {

                        target.setup = Object.assign({
                            name: ($.temp.lpName || `Filter ` + String(this._spriteset.filter.element.length + 1)),
                            floor: ($.temp.lpFloor || $.editor.collisionFloor),
                            from: ( $.temp.lpRange  || 'map')
                        }, target.setup)


                        SceneManager._scene._spriteset.addFilter(target)

                        $.editor.control = 'filter';

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


            this.gui.editor.el.targets = new Components.list.Basic({
                parent: this.gui.editor,
                data: this.filterTargets(),
                class: 'tree2',
                onclick: (object, element) => {


                    $.editor.control = 'filter-editor'
                    $.editor.target = object.target

                    this.gui.editorFilter.refresh()
                    this.refreshEditor();
                    this.setupEditor();

                }
            })
        }

        filterEditor() {
            $.editor.wedit = null;
            $.editor.weditChange = false;


            this.gui.editorFilter.target = $.editor.target;
            this.gui.editorFilter.create();
        }

        filterTargets() {
            var data = [];

            this._spriteset.filter.element.map(element => {
                if ($.editor.collisionFloor === "all" || (element.floor === $.editor.collisionFloor)) {
                    data.push({
                        label: `[${element.floor} | ${element.from}]: ${element.name}`,
                        value: data.length,
                        target: element
                    })
                }
            })


            console.log(data);


            return data;
        }



        // | --------------------------------------------------------
        // | Configure the properties of the element
        // | --------------------------------------------------------

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

                            // save particles
                            Object.keys(SceneManager._scene._spriteset.particle.source).map(name => {
                                let particle = SceneManager._scene._spriteset.particle.source[name]

                                $.save.particle[name] = particle.export()
                            })

                            // save filters
                            SceneManager._scene._spriteset.filter.element.map(filter => {
                                $.save.filter[filter.name] = Haya.Filters.export(filter);
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
    // | ======================================================================
    // | Executes some functions to create datas
    // | ======================================================================
    load_setup();
    loadLibrary();
    map_editor_style()
    $.Editor = Scene_Editor;
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