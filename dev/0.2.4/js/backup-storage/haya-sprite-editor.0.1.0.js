'use strict';
/**
 * @file [haya_map_editor.js -> Haya - Sprite Editor]
 * @description This is a editor in-game for the sprites
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @thanks to Jonforum!
 * @version 0.1.1
 * @license HAYA <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * =====================================================================
 * @version 0.1.0
 *  [x] Setup Light
 *  [x] Edit States {Animation States}
 * @version 0.1.1
 *  [] Setup Collisions
 *  [] Edit bodies
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Sprite_Editor = {};
/*:
 * @author Dax Soft | www.dax-soft.weebly.com
 * 
 * @plugindesc [0.1.1] Haya Sprite Editor
 * 
 * @help This is a in-game editor to edit the overall
 * sprite setup. Such as the animation states, collision
 * bodies and so on.
 * 
 * Important! This is a plugin under development, if 
 * you do find any bug or error, please, contact me!
 * 
 */

void

function ($) {

    // |-------------------------------------------------------------------------------- 
    // | Configure
    // |-------------------------------------------------------------------------------- 

    $.controller = {
        // control in which function are editing
        to: null,
        // load the config json 
        config: Haya.File.json(Routes.Game.plug('characters', '_config.json')),
        // target filepath
        file: null,
        // target setup
        target: {
            states: 'idle',
            config: null,
            direction: 2,
            frame_dir: null 
        },
        default: Haya.File.json(Routes.Game.plug('characters', 'default.json')),
        command: null,
        wedit: null,
        // animatin
        animation: {
            frame: 0,
            speed: 1,
            play: false,
            margin: {
                value: 0,
                max: 8
            }
        }
    }

    $.temp = {
        fpos: new Haya.DMath.Vector2D(1,0),// temp frame pos
    };

    function frame_dir_data() {
        var list_data = [];
        $.controller.target.frame_dir.map((dxy, index) => {
            list_data.push({
                label: `x ${dxy[0]}, y ${dxy[1]}`,
                dxy,
                index
            })
        })
        return list_data
    }
    

    // |-------------------------------------------------------------------------------- 
    // | CSS Style
    // |-------------------------------------------------------------------------------- 

    El.Attr(El.create('link', document.head), {
        'rel': 'stylesheet',
        'type': 'text/css',
        'href': 'js/plugins/haya.css'
    })

    El.Attr(El.create('link', document.head), {
        'rel': 'stylesheet',
        'type': 'text/css',
        'href': 'js/plugins/haya-sprite-editor.css'
    })

    // |-------------------------------------------------------------------------------- 
    // | Properties to edit
    // |-------------------------------------------------------------------------------- 

    class Property {

        /**
         * Set a command
         */
        static command(value) {
            $.controller.command = $.controller.command === value ? null : value;
        }

        /**
         * Set a new property
         */
        static set(property, editor) {
            try {
                this[`prop_${property.toLowerCase()}`](editor)
            } catch (error) {

            }
        }

        /**
         * Delete
         */
        static prop_delete(editor) {
            editor.el.delete = new Components.button.Basic({
                parent: editor,
                label: 'Delete',
                onclick: () => {
                    Components.notification.Create({
                        label: 'Are you sure that you want to delete this states?',
                        time: 5000,
                        components: [{
                                component: 'button',
                                label: 'Delete',
                                onclick: function () {
                                    SceneManager._scene.remove_states();
                                    this._popup.destroy(true);
                                }
                            },
                            {
                                component: 'button',
                                label: 'Back',
                                onclick: function () {
                                    this._popup.destroy(true);
                                }
                            }
                        ]
                    })
                }
            })
        }

        /**
         * Returtn
         */
        static prop_return(editor) {
            editor.el.back = new Components.button.Basic({
                parent: editor,
                label: '&LeftArrow; Return',
                onclick: () => {
                    $.controller.to = 'states';
                    SceneManager._scene.refresh_editor();
                    SceneManager._scene.controller()
                }
            })
        }

        /**
         * Play
         */
        static prop_play(editor) {
            editor.el.play = new Components.button.Basic({
                parent: editor,
                label: 'Play & Stop',
                onclick: () => {
                    $.controller.animation.play = !$.controller.animation.play
                }
            })
        }

        /**
         * Range
         */
        static prop_rate(editor) {
            editor.el.rate = new Components.input.Number({
                parent: editor,
                label: 'Rate (Frame Speed):',
                min: 1,
                max: 100,
                step: .5,
                default: $.controller.target.frame.rate || 9,
                format: 'float',
                onchange: (value) => {
                    $.controller.target.frame.rate = value;
                },
                onclick: () => {

                    Property.command(() => {
                        $.controller.target.frame.rate = Haya.DMath.wheelID(
                            $.controller.target.frame.rate,
                            1,
                            1,
                            0.5,
                            (current) => {
                                editor.el.rate.set(current);
                            }
                        )
                    })
                }
            })


        }

        /**
         * Size (width & height)
         */
        static prop_size(editor) {
            editor.el.size = new Components.input.NV2D({
                label: 'Width x Height:',
                parent: editor,
                x: {
                    min: 1,
                    max: 1000,
                    step: .1,
                    onchange: (value) => {
                        $.controller.target.frame.width = Haya.DMath.float(parseFloat(value))
                        //SceneManager._scene.spriteset_grid();
                    },
                    value: $.controller.target.frame.width
                },
                y: {
                    min: 1,
                    max: 1000,
                    step: .1,
                    onchange: (value) => {
                        $.controller.target.frame.height = Haya.DMath.float(parseFloat(value))
                        //SceneManager._scene.spriteset_grid();
                    },
                    value: $.controller.target.frame.height
                }
            })
        }

        /**
         * Direction {current}
         */
        static prop_direction(editor) {
            editor.el.direction = new Components.list.Select({
                label: 'Direction (current):',
                parent: editor,
                data: $.controller.config.direction,
                onchange: (index) => {
                    const dir = editor.el.direction.data.find(el => el.value === index).dir;
                    $.controller.target.direction = dir;
                }
            })
        }

        /**
         * Edit the current direction
         */
        static prop_edit_direction(editor) {
            editor.el.edit_direction = new Components.button.Basic({
                label: 'Edit Direction',
                parent: editor,
                onclick: () => {
                    
                    SceneManager._scene.gui.drawer.configure({
                        header: 'Edit the direction selected (current)',
                        body: [
                            {
                                component: 'list-basic',
                                class: 'tree-tag2',
                                data: frame_dir_data(),
                                onclick: (object, item) => {
                                    SceneManager._scene.spriteset_grid();
                                    Property.command(() => {
                                        SceneManager._scene.spriteset.grid.map(cells => {
                                            Haya.Mouse.isTriggered(cells, (onArea, isTriggered) => {
                                                if (onArea && isTriggered && !($.temp.isSet_Frame === true)) {
                                                    Components.notification.Close();
                                                    $.temp.isSet_Frame = true;
                                                    Components.notification.Create({
                                                        label: `Frame set to: ${cells.dxy.string()}`,
                                                        time: 2500,
                                                        cell: cells.dxy.array(),
                                                        dxy_index: object.index,
                                                        components: [
                                                            {
                                                                component: 'button',
                                                                label: 'Set',
                                                                class: 'btn-white',
                                                                onclick: function () {
                                                                    SceneManager._scene.spriteset.visible = false;
                                                                    $.controller.target.frame_dir[this._popup.setup.dxy_index] = this._popup.setup.cell;
                                                                    SceneManager._scene.gui.drawer.body.components[0].data = frame_dir_data();
                                                                    SceneManager._scene.gui.drawer.body.components[0].refresh().create()
                                                                    $.temp.isSet_Frame = false;
                                                                    Property.command(null);
                                                                    this._popup.destroy(true);
                                                                }
                                                            },
                                                            {
                                                                component: 'button',
                                                                label: 'Back',
                                                                class: 'btn-white',
                                                                onclick: function () {
                                                                    $.temp.isSet_Frame = false;
                                                                    this._popup.destroy(true);
                                                                }
                                                            }
                                                        ]
                                                    })
                                                }
                                            })
                                        })
                                    })
                                }
                            }
                        ],
                        onclose: () => {
                            Components.notification.Close();
                            Property.command(null);
                            SceneManager._scene.spriteset.visible = false;
                            SceneManager._scene.gui.drawer.hide();
                        }
                    }).refresh().open()
                }
            })
        }

        /**
         * New frame to the current direction
         */
        static prop_new_frame(editor) {
            editor.el.newFrame = new Components.button.Basic({
                label: 'New Frame',
                parent: editor,
                onclick: () => {
                    SceneManager._scene.spriteset_grid();
                    $.temp.frame_dir_data = frame_dir_data();
                    Property.command(() => {
                        SceneManager._scene.spriteset.grid.map(cells => {
                            Haya.Mouse.isTriggered(cells, (onArea, isTriggered) => {
                                if (onArea && isTriggered && !($.temp.isSet_Frame === true)) {
                                    Components.notification.Close();
                                    $.temp.isSet_Frame = true;
                                    Components.notification.Create({
                                        label: `Frame set to: ${cells.dxy.string()}`,
                                        time: 2500,
                                        cell: cells.dxy.array(),
                                        dxy_index: $.temp.frame_dir_data,
                                        components: [{
                                                component: 'button',
                                                label: 'Set',
                                                class: 'btn-white',
                                                onclick: function () {
                                                    SceneManager._scene.spriteset.visible = false;
                                                    $.controller.target.frame_dir.push(this._popup.setup.cell);

                                                    $.temp.isSet_Frame = false;
                                                    Property.command(null);
                                                    this._popup.destroy(true);
                                                }
                                            },
                                            {
                                                component: 'button',
                                                label: 'Back',
                                                class: 'btn-white',
                                                onclick: function () {
                                                    $.temp.isSet_Frame = false;
                                                    this._popup.destroy(true);
                                                }
                                            }
                                        ]
                                    })
                                }
                            })
                        })
                    })
                }
            })
        }
    }

    // |-------------------------------------------------------------------------------- 
    // | [Editor]
    // |-------------------------------------------------------------------------------- 

    class Editor extends Scene_Base {

        /**
         * @constructor
         * Initialize the variables of the instance
         */

        constructor() {
            super()
            // visible?
            this.visible = true;

            // controls gui element
            this.gui = {};
            // editor stage
            this.gui.stage = El.Attr(El.create('section', document.body), {
                id: 'stage'
            })
        }

        // |----------------------------------------------------------------------------
        // | * {CRUD} Main functions
        // |----------------------------------------------------------------------------

        start() {
            super.start.call(this)
        }

        create() {
            super.create.call(this)

            this.createSprite();

            this.createEditor();

            this.createLights();
        }

        terminate() {
            super.terminate.call(this)
        }

        update() {
            super.update.call(this)

            if (TouchInput.isCancelled()) {
                //this.visible = !this.visible;
                El.toggleClass(this.gui.stage, 'nested')
            }

            this.lights.point.sprite.position.set(
                Haya.Mouse.x,
                Haya.Mouse.y
            )

            this.lights.point.update();

            this.update_sprite();
            this.update_commands();
        }

        // |----------------------------------------------------------------------------
        // | * Implement functions to Create
        // |----------------------------------------------------------------------------


        createEditor() {
            // create main options
            this.gui.main = El.Attr(El.create('section', this.gui.stage), {
                id: 'mainopt'
            })

            this.gui.main.el = {};

            // options

            $.controller.config.mainopt.map(option => {

                this.gui.main.el[option.id] = El.Attr(El.create('div', this.gui.main), {
                    id: `main_${option.id}`,
                    class: 'main_options'
                })

                this.gui.main.el[option.id].image = El.Attr(El.create('img', this.gui.main.el[option.id]), {
                    src: Routes.Game.plug('gui', option.icon)
                })

                this.gui.main.el[option.id].label = El.create('label', this.gui.main.el[option.id])
                this.gui.main.el[option.id].label.innerHTML = option.label

                this.gui.main.el[option.id].onclick = () => {
                    $.controller.to = option.id
                    this.controller()
                }

            })

            // create states options class

            this.gui.states = El.Attr(El.create('section', this.gui.stage), {
                id: 'mainopt',
                class: 'nested'
            })

            this.gui.states.el = {};

            // create overall editor properties

            this.gui.editor = El.Attr(El.create('section', this.gui.stage), {
                id: 'editor',
                class: 'editor nested'
            })

            this.gui.editor.el = {};

            // overall drawer
            this.gui.drawer = new Components.window.Drawer({
                parent: this.gui.stage,
                id: 'drawer',
                onclose: () => {
                    this.gui.drawer.hide();
                }
            })

            
        }

        createLights() {
            this.lights = {

                ambient: new Pixi_Light({
                    brightness: .7,
                    color: "0xf5f5f5",
                    position: [Graphics.width / 2, Graphics.height / 2],
                    falloff: [
                        0.75,
                        1,
                        0
                    ],
                    kind: 'ambient'
                }, 'background'),

                directional: new Pixi_Light({
                    brightness: .7,
                    color: '0xD1AC56',
                    target: [0,0],
                    kind: 'directional'
                }),

                point: new Pixi_Light({
                    brightness: .8,
                    color: '0xA62C2A',
                    falloff: [0.75, 1.5, 15],
                    lightHeight: 0.06,
                    radius: Graphics.width
                }, 'point')

            }

            this.addChild(this.lights.ambient.sprite)
            this.addChild(this.lights.directional.sprite)
            this.addChild(this.lights.point.sprite)
            


            this.lights.point.isOkay = function () {
                return true;
            }

            this.lights.point.atRange = function () {
                return true;
            }


            // Editor Light

            this.gui.light = new Haya.Editor.Light;

            this.gui.light.onreturn = function() {
                $.controller.to = null;
                SceneManager._scene.refresh_editor();
                SceneManager._scene.controller()
            }
        }

        createSprite() {

            // window mask
            this.sprite = new PIXI.Container();

            this.sprite.diffuse = new Sprite();
            this.sprite.diffuse.parentGroup = PIXI.lights.diffuseGroup;
            this.sprite.addChild(this.sprite.diffuse)

            this.sprite.normal = new Sprite();
            this.sprite.normal.parentGroup = PIXI.lights.normalGroup;
            this.sprite.addChild(this.sprite.normal)

            this.addChild(this.sprite);

            // collision

            this.graphicCollision = new PIXI.Container();
            this.addChild(this.graphicCollision);

            // spriteset

            this.spriteset = new PIXI.Container();
            this.spriteset.visible = false;
            this.addChild(this.spriteset);

            this.spriteset.background = new PIXI.Graphics;
            this.spriteset.background.beginFill('0x141414',1)
            this.spriteset.addChild(this.spriteset.background);

            this.spriteset.sprite = new Sprite;
            this.spriteset.addChild(this.spriteset.sprite)
            this.spriteset.graphic = new PIXI.Graphics;
            this.spriteset.addChild(this.spriteset.graphic)
            this.spriteset.graphic.grid = new Haya.DMath.Vector2D(1,1);
            this.spriteset.grid = [];
        }

        refresh_states() {
            El.addClass(this.gui.main, 'nested')
            El.removeClass(this.gui.states, 'nested')
            El.removeChild(this.gui.states);

            // recreate

            $.controller.config.states.map(states => {
                const frame = states.id

                this.gui.states.el[frame] = El.Attr(El.create('div', this.gui.states), {
                    id: `states_${frame}`,
                    class: 'main_options'
                })

                this.gui.states.el[frame].icon = El.Attr(El.create('img', this.gui.states.el[frame]), {
                    src: Routes.Game.plug('gui', states.icon)
                })

                this.gui.states.el[frame].label = El.create('label', this.gui.states.el[frame])
                this.gui.states.el[frame].label.innerHTML = states.name

                this.gui.states.el[frame].onclick = () => {

                    if ((states.hasOwnProperty('command'))) {
                        eval(states.command);
                        return;
                    }

                    $.controller.target.states = states;
                    $.controller.target.frame = $.controller.target.config.frame[states.id];
                    $.controller.to = 'states-editor'

                    this.controller()
                }
            })


        }

        add_states() {

        }

        editor_states() {
            El.addClass(this.gui.states, 'nested');
            this.refresh_editor();
            El.removeClass(this.gui.editor, 'nested')

            this.sprite_states();

            Property.set('return', this.gui.editor);

            Property.set('play', this.gui.editor);

            Property.set('direction', this.gui.editor);

            Property.set('edit_direction', this.gui.editor);

            $.controller.target.states.properties.map(property => {
                Property.set(property, this.gui.editor)
            })

            Property.set('new_frame', this.gui.editor)


            Property.set('delete', this.gui.editor);

            //this.spriteset_grid();
        }

        editor_ambient_light() {
            El.addClass(this.gui.states, 'nested');
            this.refresh_editor();
            El.removeClass(this.gui.editor, 'nested')

            this.gui.light.setup({
                properties: [
                    'back',
                    'position',
                    'pixi',
                    'color'
                ],
                editor: this.gui.editor,
                target: this.lights.ambient
            })
        }


        editor_mouse_light() {
            El.addClass(this.gui.states, 'nested');
            this.refresh_editor();
            El.removeClass(this.gui.editor, 'nested')

            this.gui.light.setup({
                properties: [
                    'back',
                    'position',
                    'pixi',
                    'color'
                ],
                editor: this.gui.editor,
                target: this.lights.point
            })
        }

        editor_directional_light() {
            El.addClass(this.gui.states, 'nested');
            this.refresh_editor();
            El.removeClass(this.gui.editor, 'nested')

            this.gui.light.setup({
                properties: [
                    'back',
                    'position',
                    'pixi',
                    'color'
                ],
                editor: this.gui.editor,
                target: this.lights.directional
            })
        }

        editor_collision() {

        }

        editor_body() {

        }

        // |----------------------------------------------------------------------------
        // | * Implement functions to Read
        // |----------------------------------------------------------------------------

        controller() {
            this.spriteset.visible = false;
            switch ($.controller.to) {
                case 'open':
                    this.load_sprite()
                    break;
                case 'states':
                    if (typeof $.controller.target.config !== 'object') break;
                    if (this.sprite.diffuse.width <= 1) break;
                    this.refresh_states();
                    break;
                case 'states-editor':
                    if (typeof $.controller.target.config !== 'object') break;
                    if (typeof $.controller.target.states !== 'object') break;
                    this.editor_states();
                    break;
                case 'save':
                    this.save();
                    break;
                case 'alight':
                    this.editor_ambient_light();
                    break;
                case 'plight':
                    this.editor_mouse_light();
                    break;
                case 'dlight':
                    this.editor_directional_light();
                    break;
                case 'collision':
                    this.editor_collision();
                    break;
                case 'body':
                    this.editor_body()
                    break;
                default:
                    El.removeClass(this.gui.main, 'nested')
                    break;
            }
        }

        refresh_sprite() {
            this.sprite.diffuse.bitmap = ImageManager.loadCharacter($.controller.file.name.replace('.png', ''))
            this.sprite.normal.bitmap = ImageManager.loadCharacter(`!${$.controller.file.name.replace('.png', '')}`);
            setTimeout(this.sprite_states.bind(this), 500)
            this.spriteset.sprite.bitmap = ImageManager.loadCharacter($.controller.file.name.replace('.png', ''));
        }

        refresh_editor() {

            El.removeChild(this.gui.editor)
            El.addClass(this.gui.editor, 'nested')

            //$.controller.target.states = null;
        }


        // |----------------------------------------------------------------------------
        // | * Implement functions to Update
        // |----------------------------------------------------------------------------

        update_sprite() {

            if ($.controller.target.states === null || !$.controller.target.hasOwnProperty('frame')) return;
            if (!$.controller.target.frame.hasOwnProperty('frames')) return;
            if ($.controller.animation.play === false) return;

            const frame = $.controller.target.frame.frames[$.controller.target.direction]
            $.controller.target.frame_dir = frame;

            if (frame) {
                

                // frame rate
                let frameRate = $.controller.target.frame.rate * $.controller.animation.speed
                //$.controller.animation.frame = ($.controller.animation.frame + frameRate) / 60
                $.controller.animation.frame += frameRate / 60;

                // loop

                if ($.controller.animation.frame >= frame.length) {
                    // loop?
                    $.controller.animation.frame = 0
                }

                // split
                let part = frame[$.controller.animation.frame | 0]


                var width = $.controller.target.frame.width;
                var height = $.controller.target.frame.height;
                var y = ~~(part[1] * height);
                var x = ~~(Math.abs(part[0] - 1) * width);

                // set
                this.sprite.diffuse.setFrame(x, y, width, height);
                this.sprite.normal.setFrame(x, y, width, height);
                //this.sprite.position.set(...Haya.DMath.Position.screen({object: this.sprite, type: "center"}).array())

                //console.log('frame', $.controller.animation.frame);
                $.controller.animation.margin.value += $.controller.animation.speed/60  
                this.directional_moving($.controller.target.direction);
                //this.sprite.normal.x = this.sprite.diffuse.x;
                //this.sprite.normal.y = this.sprite.diffuse.y;
            }

            this.lights.ambient.sprite.x = this.sprite.x + (this.sprite.width / 2);
            this.lights.ambient.sprite.y = this.sprite.y + (this.sprite.height / 2);
        }

        update_commands() {
            Haya.Editor.updateCommand()
            if (!Haya.Utils.isFunction($.controller.command)) return;
            $.controller.command();
        }

        directional_moving(dir) {

            if (Math.ceil($.controller.animation.margin.value*5) >= $.controller.animation.margin.max) {
                this.sprite.y = (Graphics.height - $.controller.target.frame.height) / 2
                this.sprite.x = (Graphics.width - $.controller.target.frame.width) / 2
                $.controller.animation.margin.value =  0
            }

            switch (parseInt(dir)) {
                case 2: // down
                    this.sprite.y += ($.controller.animation.margin.value)
                    break;
                case 8:
                    this.sprite.y -= $.controller.animation.margin.value
                    break;
                case 4:
                    this.sprite.x -=  $.controller.animation.margin.value
                    break;
                case 6:
                    this.sprite.x += $.controller.animation.margin.value
                default:
                    break;
            }
        }

        // |----------------------------------------------------------------------------
        // | * Add. functions
        // |----------------------------------------------------------------------------

        return_from_states() {
            Components.notification.Create({
                label: 'Do you want to save the changes before exiting?',
                pause: true,
                parent: this.gui.stage,
                components: [{
                    component: 'button',
                    label: 'Save',
                    class: 'btn-white',
                    time: 5000,
                    onclick: function () {
                        // save

                        // get out
                        $.controller.to = null;
                        El.addClass(SceneManager._scene.gui.states, 'nested')
                        SceneManager._scene.controller();
                        SceneManager._scene.refresh_editor();
                        this._popup.destroy(true);
                    }
                }, {
                    component: 'button',
                    label: 'Return',
                    class: 'btn-white',
                    onclick: function () {
                        $.controller.to = null;
                        El.addClass(SceneManager._scene.gui.states, 'nested')
                        SceneManager._scene.controller();
                        SceneManager._scene.refresh_editor();
                        this._popup.destroy(true);
                    }
                }]
            })
        }

        load_sprite() {
            El.Attr(El.create('input', document.body), {
                type: 'file',
                accept: '.png',
                id: 'file-upload'
            }).onchange = (event) => {

                var path = event.target.files[0].path;
                $.controller.file = {
                    name: Haya.File.path.basename(path),
                    path
                }
                $.controller.to = null;

                // file config
                const file_config = $.controller.file.name.replace('.png', '.json');

                // setup file if doesn't have
                if (!Haya.File.exist(Routes.Game.plug('characters', file_config))) {
                    Haya.File.wjson($.controller.default, Routes.Game.plug('characters', file_config))
                    $.controller.target.config = $.controller.default
                } else {
                    $.controller.target.config = Haya.File.json(Routes.Game.plug('characters', file_config))
                }

                $.controller.file.normal = Routes.Game.plug('characters', `!${$.controller.file.name}`)
                $.controller.file.diffuse = Routes.Game.plug('characters', `${$.controller.file.name}`)

                this.refresh_sprite();
            }

            El.id('file-upload').click();
        }

        remove_states() {

        }

        sprite_states() {
            if (this.sprite.diffuse.width === 1) {
                setTimeout(() => {
                    this.sprite_states()
                }, 1000)
            } else {
                this.sprite.position.set(...Haya.DMath.Position.screen({
                    object: this.sprite,
                    type: "center"
                }).array())

                this.lights.ambient.sprite.x = this.sprite.x + (this.sprite.width / 2);
                this.lights.ambient.sprite.y = this.sprite.y + (this.sprite.height / 2);
            }
        }

        spriteset_grid() {

            this.spriteset.position.set(...Haya.DMath.Position.screen({
                object: this.spriteset,
                type: "center"
            }).array())

            this.spriteset.grid.length = 0;
            this.spriteset.background.clear();

            this.spriteset.background.beginFill('0x141414', 1);
            this.spriteset.background.drawRect(0, 0, this.spriteset.sprite.width, this.spriteset.sprite.height)
            this.spriteset.background.endFill();

            this.spriteset.graphic.clear();

            this.spriteset.graphic.lineStyle(1, '0xffffff', 1, 2)
            this.spriteset.graphic.beginFill('0xff', .25);


            this.spriteset.graphic.grid.x = Haya.DMath.float(this.spriteset.sprite.width / $.controller.target.frame.width);
            this.spriteset.graphic.grid.y = Haya.DMath.float(this.spriteset.sprite.height / $.controller.target.frame.height);

            // cells

            for (let x = 0; x < this.spriteset.graphic.grid.x; x++) {
                for (let y = 0; y < this.spriteset.graphic.grid.y; y++) {

                    var rect = new PIXI.Rectangle(
                        x * $.controller.target.frame.width,
                        y * $.controller.target.frame.width,
                        $.controller.target.frame.width,
                        $.controller.target.frame.height
                    );

                    rect.dxy = new Haya.DMath.Vector2D(x,y);

                    this.spriteset.graphic.drawRect(
                        rect.x,
                        rect.y,
                        rect.width,
                        rect.height
                    )

                    rect.x += this.spriteset.x;
                    rect.y += this.spriteset.y;

                    this.spriteset.grid.push(rect)
                }
            }

            this.spriteset.graphic.endFill()

            this.spriteset.visible = true;
        }

        save() {}

    };

    $.Editor = Editor;

    // |-------------------------------------------------------------------------------- 
    // |  
    // |-------------------------------------------------------------------------------- 

}(Haya.Sprite_Editor);