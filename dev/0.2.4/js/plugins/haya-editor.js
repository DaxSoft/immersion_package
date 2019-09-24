'use strict';
/**
 * @file [haya-editor.js -> Haya Editor Components]
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.1
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * =====================================================================
 * 
 */

var Haya = Haya || {};
Haya.Editor = {};

/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.1] Editor components & modules
 * 
 * @help Editor components to edit stuff as light, 
 * particle and so on, on the in-game editor
 * Important: Insert this plugin after haya-components
 */

void

function ($) {
    // |-------------------------------------------------------------------------------- 
    // | [Configure]
    // |-------------------------------------------------------------------------------- 

    /**
     * Blend values
     */
    $.blend = {
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
            ],
            // to Components.list.Select
            select_data: function () {
                var blend = [];

                $.blend.list.map((type, value) => {
                    blend.push({
                        label: type[1],
                        value,
                        target: type[0]
                    })
                })

                return blend;
            }
        }
    }

    /**
     * Pallete colors
     */
    $.color = {
        // colors
        red: 16,
        green: 16,
        blue: 16,
        // pallete
        pallete: Haya.File.json(Haya.File.local("img/maps/editor/color.json")),
        // data to select
        data: function () {
            var data = [];

            Object.keys($.color.pallete).map(key => {
                let color = $.color.pallete[key]
                let colorCSS = color.replace(/^(0x)/gi, "#")
                data.push({
                    label: `${key} : <span class='circle-ball-color' style='background-color: ${colorCSS};'></span>`,
                    color: color,
                    name: key
                })
            })

            return data;
        }
    }

    /**
     * Hold on temporary values
     */
    $.temp = {}

    /**
     * Command function
     */
    $.command = null;

    // |-------------------------------------------------------------------------------- 
    // | [updateCommand]
    // |-------------------------------------------------------------------------------- 

    $.updateCommand = function () {
        if (Haya.Utils.isFunction($.command)) {
            $.command()
        }
    }

    // |-------------------------------------------------------------------------------- 
    // | [Editor] Common functions to editor
    // |--------------------------------------------------------------------------------

    class Editor {

        /**
         * @constructor
         * Init variables 
         */
        constructor() {
            this.target = null;
            this.change = null;
            this.mouse = new Point(0, 0);
            this.editor = null;
            this.tint = null;
            this.threshold_mouse = 5
        }

        /**
         * Executes when has changed something
         */
        onchange() {}

        /**
         * Updates, call it with 
         * @example
         * Haya.Editor.command(() => {
         *  this.update();
         *  // ...
         * })
         */
        update() {
            if (this.change === true) {
                this.onchange();
            }
        }

        /**
         * Call over a property from the class
         * @param {String} property 
         */
        property(property_name, editor) {
            try {
                this[`prop_${property_name.toLowerCase()}`](editor)
            } catch (error) {

            }
        }

        /**
         * Call over a on'change' from the class
         * @param {String} change 
         */
        on(change_name, args) {
            try {
                this[`on${change_name}`](args)
            } catch (error) {

            }
        }

        /**
         * Set the properties and editor
         * @param {Array} [properties]
         * @param {HTMLElement} [editor]
         */
        set(properties, editor) {
            if (Array.isArray(properties)) {
                properties.map(property => this.property(property, editor))
            }
        }

        /**
         * Set a command
         */
        command(value) {
            $.command = $.command === value ? null : value;
        }

        /**
         * Keys to undo
         */
        undo() {
            return (Input.isPressed('control') && Input.isPressed('ok'))
        }

        /**
         * Get the direction of the mouse
         */
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
                this.mouse.x = Haya.Mouse.x + this.threshold_mouse;
                this.mouse.y = Haya.Mouse.y + this.threshold_mouse;
            }

        }
    };

    // |-------------------------------------------------------------------------------- 
    // | [Light] * Properties from Sprite_Light & Pixi_Light
    // |-------------------------------------------------------------------------------- 

    $.Light = class Editor_Light extends Editor {

        /**
         * @constructor
         * Init variables from instance
         */
        constructor() {
            super();

            this.drawer = new Components.window.Drawer({
                parent: document.body,
                id: 'drawer',
                onclose: () => {
                    this.gui.drawer.hide();
                }
            });
        }

        /**
         * Setup the editor
         */
        setup({
            properties,
            editor,
            target
        }) {

            this.target = target;
            this.editor = editor;

            this.set(properties, editor);
        }

        // |-----------------------------------------------------------------------------
        // | Properties
        // |-----------------------------------------------------------------------------

        /**
         * Return to
         * * set up the this.onreturn as function
         */
        prop_back(editor) {
            editor.el.back = new Components.button.Basic({
                label: '&LeftArrow; Return',
                parent: editor,
                onclick: () => {
                    this.command(null);
                    this.drawer.hide();
                    this.on('return');
                }
            })
        }

        /**
         * Position
         */
        prop_position(editor) {

            // Position
            editor.el.position = new Components.button.Basic({
                label: `x ${Haya.DMath.float(this.target.sprite.x)} | y: ${Haya.DMath.float(this.target.sprite.y)}`,
                parent: editor,
                onclick: () => {

                    this.command(() => {
                        // return
                        if (Input.isPressed('ok')) {
                            this.command(null);
                        }

                        // undo
                        if (this.undo()) {
                            this.target.sprite.x = $.temp.position.x;
                            this.target.sprite.y = $.temp.position.y;
                        }

                        // edit while pressing the Left Button of the Mouse
                        if (TouchInput.isLongPressed()) {
                            this.target.sprite.x = Haya.Mouse.x //+ (-Haya.Map.Viewport.x);
                            this.target.sprite.y = Haya.Mouse.y //+ (-Haya.Map.Viewport.y);
                            editor.el.position.button.innerHTML = `x ${Haya.DMath.float(this.target.sprite.x)} | y: ${Haya.DMath.float(this.target.sprite.y)}`;
                        }

                    })

                    $.temp.position = new Haya.DMath.Vector2D(this.target.sprite.x, this.target.sprite.y);

                    if (!Haya.Utils.invalid($.command)) {
                        new Components.alert.Geral({
                            label: 'Press [space bar] to confirm the position'
                        })
                    }
                }
            })

            //print(this.target, this.target.kind, this.target.kind === 'directional')
        }

        /**
         * Target pos
         */
        prop_target_pos(editor) {

            if (this.target.kind !== 'directional') {
                return;
            };

            editor.el.target_pos = new Components.button.Basic({
                label: `Target: x ${Haya.DMath.float(this.target.sprite.target.x)} | y: ${Haya.DMath.float(this.target.sprite.target.y)}`,
                parent: editor,
                onclick: () => {

                    this.command(() => {
                        // return
                        if (Input.isPressed('ok')) {
                            this.command(null);
                        }

                        // undo
                        if (this.undo()) {
                            this.target.sprite.target.x = $.temp.position.x;
                            this.target.sprite.target.y = $.temp.position.y;
                        }

                        // edit while pressing the Left Button of the Mouse
                        if (TouchInput.isLongPressed()) {
                            this.target.sprite.target.x = Haya.Mouse.x //+ (-Haya.Map.Viewport.x);
                            this.target.sprite.target.y = Haya.Mouse.y //+ (-Haya.Map.Viewport.y);
                            editor.el.target_pos.button.innerHTML = `x ${Haya.DMath.float(this.target.sprite.target.x)} | y: ${Haya.DMath.float(this.target.sprite.target.y)}`;
                        }
                    })

                    $.temp.position = new Haya.DMath.Vector2D(this.target.sprite.target.x, this.target.sprite.target.y);

                    if (!Haya.Utils.invalid($.command)) {
                        new Components.alert.Geral({
                            label: 'Press [space bar] to confirm the position'
                        })
                    }
                }
            })

            print(editor, editor.el.target_pos)
        }

        /**
         * Overall properties from Pixi_Light
         */
        prop_pixi(editor) {
            [
                'target_pos',
                'brightness',
                'light_height',
                'falloff'
            ].map(overall_pixi => this.property(overall_pixi, editor))
        }

        /**
         * Brightness
         */
        prop_brightness(editor) {
            editor.el.brightness = new Components.input.Number({
                parent: editor,
                min: .0,
                max: 10.0,
                step: .1,
                value: this.target.sprite.brightness.toString(),
                format: 'float',
                label: 'Brightness',
                onchange: (value) => {
                    this.target.sprite.brightness = value;
                },
                onclick: () => {

                    $.temp.brightness = this.target.sprite.brightness;

                    this.command(() => {

                        if (this.undo()) {
                            this.target.sprite.brightness = $.temp.brightness;
                        }

                        this.target.sprite.brightness = Haya.DMath.wheelID(
                            this.target.sprite.brightness,
                            .0,
                            10.0,
                            .05,
                            current => editor.el.brightness.set(current)
                        )

                    })

                    new Components.alert.Geral({
                        label: 'Use the wheel of the mouse to change the value'
                    })
                }
            })
        }

        /**
         * Light Height
         */
        prop_light_height(editor) {
            editor.el.lightHeight = new Components.input.Number({
                parent: editor,
                min: -50.0,
                max: 50.0,
                step: .1,
                value: this.target.sprite.lightHeight.toString(),
                format: 'float',
                label: 'Light Height',
                onchange: (value) => {
                    this.target.sprite.lightHeight = value;
                },
                onclick: () => {

                    $.temp.lightHeight = this.target.sprite.lightHeight;

                    this.command(() => {

                        if (this.undo()) {
                            this.target.sprite.lightHeight = $.temp.lightHeight;
                        }

                        this.target.sprite.lightHeight = Haya.DMath.wheelID(
                            this.target.sprite.lightHeight,
                            -50.0,
                            50.0,
                            .05,
                            current => editor.el.lightHeight.set(current)
                        )

                    })

                    new Components.alert.Geral({
                        label: 'Use the wheel of the mouse to change the value'
                    })
                }
            })
        }

        /**
         * Falloff [A,B,C]
         */
        prop_falloff(editor) {
            editor.el.falloff = new Components.input.NV3D({
                label: 'Falloff:',
                parent: editor,
                x: {
                    min: -100.0,
                    max: 100.0,
                    step: .01,
                    value: this.target.sprite.falloff[0],
                    format: 'float',
                    onchange: (value) => this.target.sprite.falloff[0] = value,
                    onclick: () => {
                        $.temp.falloff = this.target.sprite.falloff;

                        this.command(() => {

                            if (this.undo()) {
                                this.target.sprite.falloff[0] = $.temp.falloff[0]
                            }

                            this.target.sprite.falloff[0] = Haya.DMath.wheelID(
                                this.target.sprite.falloff[0],
                                -100.0,
                                100.0,
                                .01,
                                current => editor.el.falloff.x.value = (current)
                            )
                        })

                        new Components.alert.Geral({
                            label: 'Use the wheel of the mouse to change the value'
                        })
                    }
                },
                y: {
                    min: -100.0,
                    max: 100.0,
                    step: .01,
                    value: this.target.sprite.falloff[1],
                    format: 'float',
                    onchange: (value) => this.target.sprite.falloff[1] = value,
                    onclick: () => {
                        $.temp.falloff = this.target.sprite.falloff;

                        this.command(() => {

                            if (this.undo()) {
                                this.target.sprite.falloff[1] = $.temp.falloff[1]
                            }

                            this.target.sprite.falloff[1] = Haya.DMath.wheelID(
                                this.target.sprite.falloff[1],
                                -100.0,
                                100.0,
                                .01,
                                current => editor.el.falloff.y.value = (current)
                            )
                        })

                        new Components.alert.Geral({
                            label: 'Use the wheel of the mouse to change the value'
                        })
                    }
                },
                z: {
                    min: -1000.0,
                    max: 1000.0,
                    step: 1,
                    value: this.target.sprite.falloff[2],
                    format: 'float',
                    onchange: (value) => this.target.sprite.falloff[2] = value,
                    onclick: () => {
                        $.temp.falloff = this.target.sprite.falloff;

                        this.command(() => {

                            if (this.undo()) {
                                this.target.sprite.falloff[2] = $.temp.falloff[2]
                            }

                            this.target.sprite.falloff[2] = Haya.DMath.wheelID(
                                this.target.sprite.falloff[2],
                                -1000.0,
                                1000.0,
                                .5,
                                current => editor.el.falloff.z.value = (current)
                            )
                        })

                        new Components.alert.Geral({
                            label: 'Use the wheel of the mouse to change the value'
                        })
                    }
                }
            })
        }

        /**
         * Overall properties from Sprite_Light
         */
        prop_sprite(editor) {

        }

        /**
         * Color property
         */
        prop_color(editor) {
            editor.el.color = new Components.button.Basic({
                label: 'Color',
                parent: editor,
                onclick: () => {
                    $.temp.color = Haya.Utils.Color.hexRgb(String(this.target.sprite.color).replace("0x", "#"));

                    $.color.red = $.temp.color.red;
                    $.color.green = $.temp.color.green;
                    $.color.blue = $.temp.color.blue;

                    this.drawer.configure({
                        onclose: () => {
                            this.command(null);
                            this.drawer.hide();
                        },
                        header: 'Pick up a new color:',
                        body: [{
                                component: 'range',
                                label: 'Red &value:',
                                min: 0,
                                max: 255,
                                step: 1,
                                default: $.color.red,
                                onchange: (value) => {
                                    $.color.red = parseInt(value);
                                    this.on('color');
                                }
                            },
                            {
                                component: 'range',
                                label: 'Green &value:',
                                min: 0,
                                max: 255,
                                step: 1,
                                default: $.color.green,
                                onchange: (value) => {
                                    $.color.green = parseInt(value);
                                    this.on('color');
                                }
                            },
                            {
                                component: 'range',
                                label: 'Blue &value:',
                                min: 0,
                                max: 255,
                                step: 1,
                                default: $.color.blue,
                                onchange: (value) => {
                                    $.color.blue = parseInt(value);
                                    this.on('color');
                                }
                            },
                            {
                                component: 'modal',
                                class: 'wcolor-list-edit',
                                open: true,
                                components: [{
                                    component: 'list-basic',
                                    onclick: (object, item) => {

                                        this.target.sprite.color = object.color;
                                        this.target.sprite.tint = object.color;

                                        let color = Haya.Utils.Color.hexRgb(String(object.color).replace("0x", "#"));
                                        $.color.red = color.red;
                                        $.color.green = color.green;
                                        $.color.blue = color.blue;

                                        this.drawer.body.components[0].set(color.red);
                                        this.drawer.body.components[1].set(color.green);
                                        this.drawer.body.components[2].set(color.blue);

                                        print(this.drawer, 'color')
                                    },
                                    data: $.color.data(),
                                    property: 'label',
                                    id: 'color-editor-list',
                                    class: 'tree-tag2'
                                }]
                            }
                        ]
                    }).refresh().open()


                }
            })
        }

        // |-----------------------------------------------------------------------------
        // | On changes
        // |-----------------------------------------------------------------------------

        oncolor() {
            let color = Haya.Utils.Color.rgbHex($.color.red, $.color.green, $.color.blue, "0x");
            this.target.sprite.color = color;
            this.target.sprite.tint = color;
        }

    }

    // |-------------------------------------------------------------------------------- 
    // | [Collision] * Properties from Collision Bodies
    // |-------------------------------------------------------------------------------- 

    $.Collision = class Editor_Collision extends Editor {
        // |-----------------------------------------------------------------------------
        // | Initi
        // |-----------------------------------------------------------------------------

        constructor() {
            super()
            this.drawer = new Components.window.Drawer({
                parent: document.body,
                id: 'drawer',
                onclose: () => {
                    this.gui.drawer.hide();
                }
            });
        }

        setup({
            properties,
            editor,
            target
        }) {

            this.target = target;
            this.editor = editor;

            this.set(properties, editor);
        }

        sprite_list_data() {
            var data = [];

            const keys = Object.keys(this.target.collision);

            keys.map(key => {
                data.push({
                    label: key,
                    index: data.length,
                    target: this.target.collision[key]
                })
            })

            console.log(keys, data, this.target);
            

            return data;
        }

        to_id(value) {
            return value.replace(/\s+/gim, '_').toLowerCase();
        }

        collision_kind_data() {
            return ([{
                    label: 'Circle',
                    value: 0,
                    kind: 'circle'
                },
                {
                    label: 'Rectangle',
                    value: 0,
                    kind: 'rect'
                }
            ])
        }

        // |-----------------------------------------------------------------------------
        // | Properties
        // |-----------------------------------------------------------------------------

        /**
         * Return to
         * * set up the this.onreturn as function
         */
        prop_back(editor) {
            editor.el.back = new Components.button.Basic({
                label: '&LeftArrow; Return',
                parent: editor,
                onclick: () => {
                    this.command(null);
                    this.drawer.hide();
                    this.on('return');
                }
            })
        }

        // |-----------------------------------------------------------------------------
        // | Properties for Sprite Editor
        // |-----------------------------------------------------------------------------

        /**
         * List of collisions to edit
         */
        prop_sprite_list(editor) {
            editor.el.spriteList = new Components.list.Basic({
                parent: editor,
                class: 'tree-tag',
                data: this.sprite_list_data(),
                onclick: (object, item) => {
                    this.drawer.configure({
                        onclose: () => {
                            this.command(null);
                            this.drawer.hide()
                        },
                        header: `Edit &RightArrow; ${object.label}:`,
                        body: [{
                                component: 'number',
                                label: 'Radius',
                                step: 1,
                                min: 1,
                                max: 1000,
                                default: object.target.radius,
                                onchange: (current) => object.target.radius = current,
                                _validator: (setup) => {
                                    return object.target.type === 'circle'
                                }
                            },
                            {
                                component: 'nv2d',
                                label: 'Width x Height',
                                x: {
                                    min: .1,
                                    max: 1000.0,
                                    step: .1,
                                    format: 'float',
                                    value: object.target.width,
                                    onchange: (current) => object.target.width = parseFloat(current),
                                },
                                y: {
                                    min: .1,
                                    max: 1000.0,
                                    step: .1,
                                    format: 'float',
                                    value: object.target.height,
                                    onchange: (current) => object.target.height = parseFloat(current),
                                },
                                _validator: (setup) => {
                                    return object.target.type === 'rect'
                                }
                            }
                        ]
                    }).refresh().open();
                }
            })
        }

        /**
         * Add a new collision body
         */
        prop_new_collision_body(editor) {
            editor.el.newCollisionBody = new Components.button.Basic({
                label: 'New Collision Body',
                parent: editor,
                onclick: () => {
                    Components.notification.Close();

                    Components.notification.Create({
                        label: 'Select the kind of body',
                        pause: true,
                        components: [{
                                component: 'select',
                                label: 'Kind:',
                                data: this.collision_kind_data(),
                                onchange: (current) => {
                                    $.temp.kind = current.kind;
                                }
                            },
                            {
                                component: 'text',
                                placeholder: 'Set the name of your collision body',
                                label: 'Name ID:',
                                onchange: (value, element) => {
                                    value = this.to_id(value);
                                    element.set(value);
                                    $.temp.name = value;
                                }
                            },
                            {
                                component: 'button',
                                label: 'Create',
                                editor: this,
                                class: 'btn-white',
                                onclick: function () {
                                    //this.setup.editor.new_collision_body_option(this.setup.editor.editor)
                                    $.temp.kind = $.temp.kind || 'circle';
                                    // if ($.temp.kind === 'circle') {
                                    //     this.setup.editor.new_collision_body_circle(this.setup.editor.editor)
                                    // } else if ($.temp.kind === 'rect') {
                                    //     this.setup.editor.new_collision_body_rect(this.setup.editor.editor)
                                    // }
                                    this.setup.editor.new_collision_body_option(this.setup.editor.editor)
                                    //
                                    this._popup.destroy(true)
                                }
                            },
                            {
                                component: 'button',
                                label: 'Return',
                                class: 'btn-white',
                                onclick: function () {
                                    this._popup.destroy(true)
                                }
                            }
                        ]
                    })
                }
            })
        }

        /**
         * Edit new collision body before creating
         */
        new_collision_body_option(editor) {
            var collision_id = $.temp.name || `collision_${Object.keys(this.target.collision).toString(16)}`
            // choose
            switch ($.temp.kind) {
                case 'circle':
                    this.target.collision[collision_id] = {
                        type: "circle",
                        pos: 0,
                        radius: 12
                    };
                    break;
                case 'rect':
                    this.target.collision[collision_id] = {
                        type: "circle",
                        pos: 0,
                        width: 12,
                        height: 16
                    };
                    break;
                default:
                    this.target.collision[collision_id] = {
                        type: "circle",
                        pos: 0,
                        radius: 12
                    };
                    break;
            }
            // refresh
            this.on('refresh');
        }

        // |-----------------------------------------------------------------------------
        // | Changes
        // |-----------------------------------------------------------------------------
    }

}(Haya.Editor)