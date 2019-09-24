'use strict';

/**
 * @file [haya-filters.js -> Haya - Filters]
 * Fitler system from PIXI.filters adapted to RPG Maker MV Engine
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.4
 * @license MIT
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @requires PIXI.filters
 * =====================================================================
 */

var Imported = Imported || {};
var Haya = Haya || {};
Haya.Filters = Haya.Filters || {};

/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.4] Filter System from Immersion Plugin
 * 
 * @help Filter system from PIXI.filters. 
 * This is just a module that uses as base the
 * PIXI.filters to create particles effects.
 *
 */

void

function ($) {
    // |-------------------------------------------------------------------------------- 
    // | [Configure]
    // |-------------------------------------------------------------------------------- 

    $._list = {} // control the list of filters
    $._vert = {} // control all vertex strings
    $._frag = {} // control all fragments strings

    // |-------------------------------------------------------------------------------- 
    // | [Vertexs] 
    // | get all vertex file from the folder 'shaders'
    // |-------------------------------------------------------------------------------- 

    Routes.Game.files('shaders', 'vert').map(file => {
        $._vert[file.name] = Haya.File.txt(file.path)
    })

    // |-------------------------------------------------------------------------------- 
    // | [Fragments] 
    // | get all fragments files from the folder 'shaders'
    // |-------------------------------------------------------------------------------- 

    Routes.Game.files('shaders', 'frag').map(file => {
        $._frag[file.name] = Haya.File.txt(file.path)
    })

    // |-------------------------------------------------------------------------------- 
    // | [Manager]
    // | Control the filters, add, destroy, update and so on
    // |-------------------------------------------------------------------------------- 

    class Manager {
        /**
         * Initial variables of the instance
         */
        constructor() {
            // count the quantity of particles
            this._countID = 0;
            // handles with the filters emmiter variables
            this._filters = {}
            // cycle of filters' keys
            this._keys = [];
        }
        /**
         * Add-on a new particle
         */
        add({
            filter, // from Haya.Filters._list
            setup
        }) {
            // check if filter exists
            if (!($._list.hasOwnProperty(filter))) {
                return null;
            }

            // check out the id to progress the counter
            if (!(setup.hasOwnProperty('id'))) {
                this._countID++;
                setup.id = this._countID;
            }

            // create
            this._filters[setup.id] = new $._list[filter](setup)

            // update keys
            this._keys = Object.keys(this._filters);

            // return to emmiter
            return this._filters[setup.id];
        }

        /**
         * Remove a particle based on his id
         */
        remove(id) {
            if (this._filters.hasOwnProperty(id)) {
                this._filters[id].remove()
                delete this._filters[id]
                this._keys = Object.keys(this._filters);
                return true
            }
            return false
        }

        /**
         * Check out if has the filter
         */
        has(filter) {
            return $._list.hasOwnProperty(filter)
        }

        /**
         * Check out if the filter is okay with the states of the map
         */
        isOkay(filter) {
            return (
                (filter.setup.isTime && Haya.Map.Time.period(filter.time)) &&
                (filter.switch_id > 0 ? $gameSwitches.value(this.switch) : true) &&
                (filter.setup.isFloor && filter.floor === $gamePlayer.floor)
            )
        }

        /**
         * Update the filters
         */
        update(emmiter) {
            if (this._keys.length < 1) return;

            this._keys.map((id) => {
                // particle element
                const element = this._filters[id];
                // valid?
                if (element) {
                    // global update
                    if (element.enabled === true) {
                        if (element.actived === true && element.enabled === true) {
                            if (this.isOkay(element) === false) {
                                element.remove()
                            }
                        } else if (element.actived === false) {
                            if (this.isOkay(element) === true) {
                                element.set()
                            }
                        }
                    } else {
                        if (element.actived === true) {
                            element.remove()
                        }
                    }



                    // class update
                    if (element.update) element.update();

                    // costum update
                    if (Haya.Utils.isFunction(emmiter)) emmiter.call(this, element, this);
                }
            })
        }
    }

    // |-------------------------------------------------------------------------------- 
    // | [list]
    // | List of available filters
    // |-------------------------------------------------------------------------------- 
    $.list = function () {
        var data = [{
            label: 'none',
            value: 0
        }];

        Object.keys($._list).map(filters => {
            data.push({
                label: `${filters}`,
                value: data.length,
                target: {
                    filter: filters,
                    setup: {},
                    targets: ['map']
                },
                description: $._list[filters].description
            })
        })


        return data;
    }

    // |-------------------------------------------------------------------------------- 
    // | [set]
    // | Deploy filter on sprite
    // |-------------------------------------------------------------------------------- 
    $.set = function (filter) {
        if (filter.targets.length > 0) {


            filter.targets.map(sprite => {

                if (!sprite) return;

                // light?
                if (sprite.typeof && sprite.typeof === 'light') {
                    if (Array.isArray(sprite._filters)) {
                        sprite._filters.push(filter.filter)
                    } else {
                        sprite._filters = [filter.filter]
                    }
                } else {
                    if (sprite instanceof PIXI.Container) {
                        print('is container!')
                        sprite = sprite.children[0]
                    }



                    if (Array.isArray(sprite._filters)) {
                        sprite._filters.push(filter.filter)
                    } else {
                        sprite._filters = [filter.filter]
                    }

                }


            })

            filter.actived = true;
        }
    }

    // |-------------------------------------------------------------------------------- 
    // | [remove]
    // | Remove filter from sprite
    // |-------------------------------------------------------------------------------- 
    $.remove = function (filter) {
        if (filter.targets.length > 0) {
            filter.targets.map(sprite => {

                if (sprite instanceof PIXI.Container) {
                    sprite = sprite.children[0]
                }

                sprite._filters = sprite._filters.filter(value => value.name !== filter.name)

                filter.actived = false;
            })
        }
    }

    // |-------------------------------------------------------------------------------- 
    // | [glb_properties]
    // | Global components to edit common properties of filters
    // |-------------------------------------------------------------------------------- 
    $.glb_properties = function (editor, target) {

        // |----------------------------------------------------------------------------
        // | switch 
        // | Set on/off the filter by using a switch
        // |----------------------------------------------------------------------------

        editor.el.switch = new Components.input.Number({
            label: `Switch ID: ${target.switch_id}`,
            parent: editor.editor,
            default: target.switch_id,
            min: -1,
            max: Infinity,
            step: 1
        })

        editor.el.switch.input.onchange = () => {
            target.switch_id = +editor.el.switch.get();
            editor.el.switch = `Switch ID: ${target.switch_id}`
        }

        // |----------------------------------------------------------------------------
        // | time
        // | Filter will only be set when it's on the right period of time
        // |----------------------------------------------------------------------------

        editor.el.time = new Components.list.Select({
            parent: editor.editor,
            label: `Period of Time: ${target.time}`,
            data: Haya.Map_Editor.config.periodTime,
            onchange: () => {
                let time = Haya.Map.Time.isPeriod(parseInt(editor.el.time.get()));
                target.time = time;
                editor.el.time.label.innerHTML = `Period of Time: ${target.time}`
            }
        })

        editor.el.time.choose(Haya.Map.Time.isPeriod(target.time))

        // |----------------------------------------------------------------------------
        // | floor
        // | Filter will only be set when the player it's on the same floor as 
        // | this filter 
        // |----------------------------------------------------------------------------

        editor.el.floor = new Components.list.Select({
            parent: editor.editor,
            label: 'Floor:',
            data: Haya.Map_Editor.config.floor
        })

        editor.el.floor.select.onchange = () => {
            var target = editor.el.floor.data.find(el => el.value === +editor.el.floor.get())
            target.floor = target.label;
            editor.change = true
        }

        let defaultFloor = editor.el.floor.data.find(el => el.label === target.floor).value
        editor.el.floor.choose(defaultFloor)

    }

    // |-------------------------------------------------------------------------------- 
    // | [export]
    // | Export datas to save over data.json
    // |-------------------------------------------------------------------------------- 
    $.export = function (filter) {

        var data = filter.export();

        data.setup.targets = [];
        data.setup.from = filter.from;

        // return

        return data;
    }

    // |-------------------------------------------------------------------------------- 
    // | [from]
    // | Set the targets from filter
    // |-------------------------------------------------------------------------------- 
    $.from = function (filter, from = 'map') {
        filter.from = ((Haya.Utils.invalid(filter.from) || filter.from.length < 1) ? from : filter.from)
        filter.targets = []
        if (typeof filter.from === 'string') {
            // all
            if (filter.from === 'all') {
                filter.targets.push(SceneManager._scene._spriteset.sprite)
            } else if (filter.from === 'map') {
                filter.targets.push(...Haya.Map.current.sprite)
            } else if (/^sprite\_(.*)/gi.test(filter.from)) {
                let linfo = String(filter.from).replace(/^sprite_/gi, '');
                filter.targets.push(
                    Haya.Map.current.sprite.find(sprite => sprite.linfo === linfo)
                )
            } else if (/^light\_(.*)/gi.test(filter.from)) {
                let linfo = String(filter.from).replace(/^light_/gi, '');
                console.log(linfo);

                let light = SceneManager._scene._spriteset.light.source[linfo].sprite

                console.log(light);


                filter.targets.push(light)
            }
        }
    }

    // |-------------------------------------------------------------------------------- 
    // | [range_targets]
    // | Exports a array of available range of targets
    // |-------------------------------------------------------------------------------- 
    $.range_targets = function () {
        return [{
            label: 'Sprite Map',
            value: 0,
            target: 'map'
        }, {
            label: 'All Objects',
            value: 1,
            target: 'all'
        }]
    }

    // |-------------------------------------------------------------------------------- 
    // | Export to variable .filters from Haya
    // |-------------------------------------------------------------------------------- 
    $.manager = new Manager;
}(Haya.Filters);

/**
 * Filter.BlurFilter
 * Emits a blur field over sprite
 * @see http://pixijs.download/release/docs/PIXI.filters.BlurFilter.html
 */
void

function (blur) {
    class BlurFilter {

        /**
         * Initial variables of the instance
         */
        constructor(setup) {
            this.setup = setup || {};
            this.configure()
            this.create()
            return this;
        }


        /**
         * Configure the variables
         */
        configure() {
            this.setup = Object.assign({
                name: (Haya.Filters.manager._countID).toString(16),
                targets: [],
                speed: .1,
                duration: .5,
                strength: 8,
                blur: [1, 1, 2], // blurX, blurY, blur
                quality: 4,
                kernelSize: 5,
                autoFit: true,
                blendMode: PIXI.BLEND_MODES.NORMAL,
                enabled: true,
                pulse: {
                    min: 1,
                    max: 4
                },
                resolution: 1,
                floor: 'base',
                time: 'all',
                switch_id: -1,
                isTime: true,
                isFloor: true,
                from: 'map'
            }, this.setup)

            this.targets = this.setup.targets
            this.name = this.setup.name
            this.floor = this.setup.floor
            this.time = this.setup.time
            this.switch_id = this.setup.switch_id
            this.actived = false;
            this.enabled = true;
            this.from = this.setup.from;
        }

        /**
         * Refresh setup variables with new values
         */
        refresh_setup() {
            this.setup.blur = [this.filter.blurX, this.filter.blurY, this.filter.blur]
            this.setup.floor = this.filter.floor
            this.setup.time = this.filter.time
            this.setup.blendMode = this.filter.blendMode
            this.setup.targets = this.targets
            this.setup.switch_id = this.switch_id
            this.setup.name = this.name
        }

        /**
         * Export object to save as data
         */
        export () {

            this.refresh_setup()

            return {
                filter: 'BlurFilter',
                setup: {
                    name: this.setup.name,
                    floor: this.setup.floor,
                    time: this.setup.time,
                    blendMode: this.setup.blendMode,
                    switch_id: this.setup.switch_id,
                    targets: this.setup.targets,
                    blur: this.setup.blur,
                    isTime: this.setup.isTime,
                    isFloor: this.setup.isFloor
                }
            }
        }

        /**
         * Deploy to editor
         */
        editor(editor) {
            this._editor = editor;

            // blur cell size
            editor.el.blur = new Components.input.NV3D({
                label: '(x, y, average):',
                parent: editor.editor,
                x: {
                    min: 1,
                    max: 100,
                    step: .5,
                    value: this.filter.blurX,
                    onchange: (value) => {
                        this.filter.blurX = parseFloat(value)
                    },
                    onclick: (element) => {
                        editor.register.blurX = this.filter.blurX
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.blurX = editor.register.blurX
                            }

                            this.filter.blurX = Haya.DMath.wheelID(
                                this.filter.blurX,
                                .5,
                                100,
                                .5,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: 1,
                    max: 100,
                    step: .5,
                    value: this.filter.blurY,
                    onchange: (value) => {
                        this.filter.blurY = parseFloat(value)
                    },
                    onclick: (element) => {
                        editor.register.blurY = this.filter.blurY
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.blurY = editor.register.blurY
                            }

                            this.filter.blurY = Haya.DMath.wheelID(
                                this.filter.blurY,
                                .5,
                                100,
                                .5,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }

                },
                z: {
                    min: 1,
                    max: 100,
                    step: .5,
                    value: this.filter.blur,
                    onchange: (value) => {
                        this.filter.blur = parseFloat(value)
                    },
                    onclick: (element) => {
                        editor.register.blur = this.filter.blur
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.blur = editor.register.blur
                            }

                            this.filter.blur = Haya.DMath.wheelID(
                                this.filter.blur,
                                .5,
                                100,
                                .5,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }

                }
            })

            // blendMode
            editor.el.blendMode = new Components.list.Select({
                parent: editor.editor,
                label: 'Blend Mode:',
                data: Haya.Map_Editor.blendMode_select(),
                onchange: () => {
                    // let kind = parseInt(editor.el.blendMode.get())
                    // this.filter.blendMode = Haya.Map_Editor.editor.blend.list[kind][0];

                    let kind = editor.el.blendMode.data.find(bld => bld.value === parseInt(editor.el.blendMode.get())).target
                    this.filter.blendMode = kind //$.editor.blend.list[kind][0];
                }
            })
            editor.el.blendMode.choose(this.filter.blendMode)

            // deploy the possibility of changing global properties
            Haya.Filters.glb_properties(editor, this)
        }

        /**
         * Create the filter element
         */
        create() {
            // create the filter element

            this.filter = new PIXI.filters.BlurFilter(
                this.setup.strength,
                this.setup.quality
            )

            // setup his values

            this.filter.autoFit = this.setup.autoFit;
            this.filter.blur = this.setup.blur[2]
            this.filter.blurX = this.setup.blur[0]
            this.filter.blurY = this.setup.blur[1]
            this.filter.blendMode = this.setup.blendMode
            this.filter.enabled = this.setup.enabled
        }

        /**
         * Set the filter to targets
         */
        set() {
            Haya.Filters.set(this)
            return this;
        }

        /**
         * Removes the filter from targets
         */
        remove() {
            if (this.targets.length > 0) {
                this.targets.map(sprite => {
                    if (sprite instanceof PIXI.Sprite) {
                        if (Array.isArray(sprite.filters)) {
                            sprite.filters = sprite.filters.filter(flt => flt !== this.filter)
                        }
                    }
                })
            }

            return this;
        }

        /**
         * Description of the filter
         */
        static get description() {
            return "Emits a blur field over sprite"
        }
    }
    blur.BlurFilter = BlurFilter;
}(Haya.Filters._list)

/**
 * Filter.RGBSplitFilter 
 * An RGB Split Filter.
 * @see https://pixijs.io/pixi-filters/docs/PIXI.filters.RGBSplitFilter.html
 */
void

function (rgbslit) {
    class RGBSplitFilter {
        /**
         * Initial variables of the instance
         */
        constructor(setup) {
            this.setup = setup || {};
            this.configure()
            this.create()
            return this;
        }

        /**
         * Configure the variables
         */
        configure() {
            this.setup = Object.assign({
                name: (Haya.Filters.manager._countID).toString(16),
                targets: [],
                red: [-10, 0],
                blue: [0, 10],
                green: [0, 0],
                floor: 'base',
                time: 'all',
                switch_id: -1,
                isTime: true,
                isFloor: true,
                from: 'map'
            }, this.setup)

            this.targets = this.setup.targets
            this.name = this.setup.name
            this.floor = this.setup.floor
            this.time = this.setup.time
            this.switch_id = this.setup.switch_id
            this.actived = false;
            this.enabled = true;
            this.from = this.setup.from;
        }

        /**
         * Deploy to editor
         */
        editor(editor) {
            this._editor = editor;

            // red
            editor.el.red = new Components.input.NV2D({
                label: 'Red:',
                parent: editor.editor,
                x: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.red[0],
                    onchange: (value) => {
                        this.filter.red[0] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.red = this.filter.red[0]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.red[0] = editor.register.red
                            }

                            this.filter.red[0] = Haya.DMath.wheelID(
                                this.filter.red[0],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.red[1],
                    onchange: (value) => {
                        this.filter.red[1] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.red = this.filter.red[1]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.red[1] = editor.register.red
                            }

                            this.filter.red[1] = Haya.DMath.wheelID(
                                this.filter.red[1],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                }
            })

            // green
            editor.el.green = new Components.input.NV2D({
                label: 'Green:',
                parent: editor.editor,
                x: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.green[0],
                    onchange: (value) => {
                        this.filter.green[0] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.green = this.filter.green[0]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.green[0] = editor.register.green
                            }

                            this.filter.green[0] = Haya.DMath.wheelID(
                                this.filter.green[0],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.green[1],
                    onchange: (value) => {
                        this.filter.green[1] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.green = this.filter.green[1]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.green[1] = editor.register.green
                            }

                            this.filter.green[1] = Haya.DMath.wheelID(
                                this.filter.green[1],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                }
            })

            // blue
            editor.el.blue = new Components.input.NV2D({
                label: 'Blue:',
                parent: editor.editor,
                x: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.blue[0],
                    onchange: (value) => {
                        this.filter.blue[0] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.blue = this.filter.blue[0]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.blue[0] = editor.register.blue
                            }

                            this.filter.blue[0] = Haya.DMath.wheelID(
                                this.filter.blue[0],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.blue[1],
                    onchange: (value) => {
                        this.filter.blue[1] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.blue = this.filter.blue[1]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.blue[1] = editor.register.blue
                            }

                            this.filter.blue[1] = Haya.DMath.wheelID(
                                this.filter.blue[1],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                }
            })

            // deploy the possibility of changing global properties
            Haya.Filters.glb_properties(editor, this)
        }

        /**
         * Refresh setup variables with new values
         */
        refresh_setup() {
            this.setup.red = this.filter.red
            this.setup.blue = this.filter.blue
            this.setup.floor = this.filter.floor
            this.setup.time = this.filter.time
            this.setup.green = this.filter.green
            this.setup.targets = this.targets
            this.setup.switch_id = this.switch_id
            this.setup.name = this.name
        }

        /**
         * Export object to save as data
         */
        export () {

            this.refresh_setup()

            return {
                filter: 'RGBSplitFilter',
                setup: {
                    name: this.setup.name,
                    floor: this.setup.floor,
                    time: this.setup.time,
                    switch_id: this.setup.switch_id,
                    targets: this.setup.targets,
                    red: this.setup.red,
                    blue: this.setup.blend,
                    green: this.setup.green,
                    isTime: this.setup.isTime,
                    isFloor: this.setup.isFloor
                }
            }
        }

        /**
         * Create the filter element
         */
        create() {
            // create the filter element

            this.filter = new PIXI.filters.RGBSplitFilter(
                this.setup.red,
                this.setup.green,
                this.setup.blue
            )
        }

        /**
         * Set the filter to targets
         */
        set() {
            Haya.Filters.set(this)
            return this;
        }

        /**
         * Removes the filter from targets
         */
        remove() {
            Haya.Filters.remove(this)
            return this;
        }

        /**
         * Description of the filter
         */
        static get description() {
            return "An RGB Split Filter."
        }

    }
    rgbslit.RGBSplitFilter = RGBSplitFilter;
}(Haya.Filters._list)


/**
 * Filter.AdjustmentFilter 
 * The ability to adjust gamma, contrast, saturation, brightness, alpha or color-channel shift. 
 * This is a faster and much simpler to use than ColorMatrixFilter because it does not use a matrix.
 * @see https://pixijs.io/pixi-filters/docs/PIXI.filters.AdjustmentFilter.html
 */
void

function (adjustment) {
    class AdjustmentFilter {
        /**
         * Initial variables of the instance
         */
        constructor(setup) {
            this.setup = setup || {};
            this.configure()
            this.create()
            return this;
        }

        /**
         * Description of the filter
         */
        static get description() {
            return `
            The ability to adjust gamma, contrast, saturation, brightness, alpha or color-channel shift. 
            This is a faster and much simpler to use than ColorMatrixFilter because it does not use a matrix.
            `
        }

        /**
         * Configure the variables
         */
        configure() {
            this.setup = Object.assign({
                name: (Haya.Filters.manager._countID).toString(16),
                targets: [],
                gamma: 1,
                saturation: 1,
                contrast: 1,
                brightness: 1,
                red: 1,
                green: 1,
                blue: 1,
                alpha: 1,
                floor: 'base',
                time: 'all',
                switch_id: -1,
                isTime: true,
                isFloor: true,
                from: 'map'
            }, this.setup)

            this.targets = this.setup.targets
            this.name = this.setup.name
            this.floor = this.setup.floor
            this.time = this.setup.time
            this.switch_id = this.setup.switch_id
            this.actived = false;
            this.enabled = true;
            this.from = this.setup.from;
        }

        /**
         * Export data to save
         */
        export () {
            return {
                filters: 'AdjustmentFilter',
                setup: {
                    name: this.name,
                    time: this.time,
                    floor: this.floor,
                    switch_id: this.switch_id,
                    isTime: this.setup.isTime,
                    isFloor: this.setup.isFloor,
                    red: this.filter.red,
                    blue: this.filter.blue,
                    green: this.filter.green,
                    alpha: this.filter.alpha,
                    brightness: this.filter.brightness,
                    gamma: this.filter.gamma,
                    contrast: this.filter.contrast,
                    saturation: this.filter.saturation
                }
            }
        }

        /**
         * Deploy to editor
         */
        editor(editor) {
            this._editor = editor
            // red
            editor.el.red = new Components.input.Number({
                parent: editor.editor,
                label: 'Red:',
                min: 0.1,
                max: 10,
                step: .1,
                default: this.filter.red,
                format: 'float',
                onchange: (value) => {
                    this.filter.red = value;
                },
                onclick: (component) => {
                    editor.register.red = this.filter.red
                    editor.command(() => {

                        if (editor.undo()) {
                            this.filter.red = editor.register.red
                        }

                        this.filter.red = Haya.DMath.wheelID(
                            this.filter.red,
                            .1,
                            10,
                            .1,
                            (current) => {
                                component.input.value = current
                            }
                        )

                    })
                }
            })

            // green
            editor.el.green = new Components.input.Number({
                parent: editor.editor,
                label: 'Green:',
                min: 0.1,
                max: 10,
                step: .1,
                default: this.filter.green,
                format: 'float',
                onchange: (value) => {
                    this.filter.green = value;
                },
                onclick: (component) => {
                    editor.register.green = this.filter.green
                    editor.command(() => {

                        if (editor.undo()) {
                            this.filter.green = editor.register.green
                        }

                        this.filter.green = Haya.DMath.wheelID(
                            this.filter.green,
                            .1,
                            10,
                            .1,
                            (current) => {
                                component.input.value = current
                            }
                        )

                    })
                }
            })

            // Blue
            editor.el.blue = new Components.input.Number({
                parent: editor.editor,
                label: 'Blue:',
                min: 0.1,
                max: 10,
                step: .1,
                default: this.filter.blue,
                format: 'float',
                onchange: (value) => {
                    this.filter.blue = value;
                },
                onclick: (component) => {
                    editor.register.blue = this.filter.blue
                    editor.command(() => {

                        if (editor.undo()) {
                            this.filter.blue = editor.register.blue
                        }

                        this.filter.blue = Haya.DMath.wheelID(
                            this.filter.blue,
                            .1,
                            10,
                            .1,
                            (current) => {
                                component.input.value = current
                            }
                        )

                    })
                }
            })

            // Alpha
            editor.el.alpha = new Components.input.Number({
                parent: editor.editor,
                label: 'Alpha:',
                min: 0.1,
                max: 10,
                step: .1,
                default: this.filter.alpha,
                format: 'float',
                onchange: (value) => {
                    this.filter.alpha = value;
                },
                onclick: (component) => {
                    editor.register.alpha = this.filter.alpha
                    editor.command(() => {

                        if (editor.undo()) {
                            this.filter.alpha = editor.register.alpha
                        }

                        this.filter.alpha = Haya.DMath.wheelID(
                            this.filter.alpha,
                            .1,
                            10,
                            .1,
                            (current) => {
                                component.input.value = current
                            }
                        )

                    })
                }
            })

            // Gamma
            editor.el.gamma = new Components.input.Number({
                parent: editor.editor,
                label: 'Gamma:',
                min: 0.1,
                max: 10,
                step: .1,
                default: this.filter.gamma,
                format: 'float',
                onchange: (value) => {
                    this.filter.gamma = value;
                },
                onclick: (component) => {
                    editor.register.gamma = this.filter.gamma
                    editor.command(() => {

                        if (editor.undo()) {
                            this.filter.gamma = editor.register.gamma
                        }

                        this.filter.gamma = Haya.DMath.wheelID(
                            this.filter.gamma,
                            .1,
                            10,
                            .1,
                            (current) => {
                                component.input.value = current
                            }
                        )

                    })
                }
            })

            // Saturation
            editor.el.saturation = new Components.input.Number({
                parent: editor.editor,
                label: 'Saturation:',
                min: 0.1,
                max: 10,
                step: .1,
                default: this.filter.gamma,
                format: 'float',
                onchange: (value) => {
                    this.filter.saturation = value;
                },
                onclick: (component) => {
                    editor.register.saturation = this.filter.saturation
                    editor.command(() => {

                        if (editor.undo()) {
                            this.filter.saturation = editor.register.saturation
                        }

                        this.filter.saturation = Haya.DMath.wheelID(
                            this.filter.saturation,
                            .1,
                            10,
                            .1,
                            (current) => {
                                component.input.value = current
                            }
                        )

                    })
                }
            })

            // Brightness
            editor.el.brightness = new Components.input.Number({
                parent: editor.editor,
                label: 'Brightness:',
                min: 0.1,
                max: 10,
                step: .1,
                default: this.filter.brightness,
                format: 'float',
                onchange: (value) => {
                    this.filter.brightness = value;
                },
                onclick: (component) => {
                    editor.register.brightness = this.filter.brightness
                    editor.command(() => {

                        if (editor.undo()) {
                            this.filter.brightness = editor.register.brightness
                        }

                        this.filter.brightness = Haya.DMath.wheelID(
                            this.filter.brightness,
                            .1,
                            10,
                            .1,
                            (current) => {
                                component.input.value = current
                            }
                        )

                    })
                }
            })

            // Contrast
            editor.el.contrast = new Components.input.Number({
                parent: editor.editor,
                label: 'Contrast:',
                min: 0.1,
                max: 10,
                step: .1,
                default: this.filter.contrast,
                format: 'float',
                onchange: (value) => {
                    this.filter.contrast = value;
                },
                onclick: (component) => {
                    editor.register.contrast = this.filter.contrast
                    editor.command(() => {

                        if (editor.undo()) {
                            this.filter.contrast = editor.register.contrast
                        }

                        this.filter.contrast = Haya.DMath.wheelID(
                            this.filter.contrast,
                            .1,
                            10,
                            .1,
                            (current) => {
                                component.input.value = current
                            }
                        )

                    })
                }
            })

            // deploy the possibility of changing global properties
            Haya.Filters.glb_properties(editor, this)
        }

        /**
         * Create the filter element
         */
        create() {
            // create the filter element

            this.filter = new PIXI.filters.AdjustmentFilter({
                gamma: this.setup.gamma,
                saturation: this.setup.saturation,
                brightness: this.setup.brightness,
                red: this.setup.red,
                green: this.setup.green,
                blue: this.setup.blue,
                apha: this.setup.apha,
                contrast: this.setup.contrast
            })
        }

        /**
         * Set the filter to targets
         */
        set() {
            Haya.Filters.set(this)
            return this;
        }

        /**
         * Removes the filter from targets
         */
        remove() {
            Haya.Filters.remove(this)
            return this;
        }
    }
    adjustment.AdjustmentFilter = AdjustmentFilter;
}(Haya.Filters._list)

/**
 * Filter.GlitchFilter 
 * The GlitchFilter applies a glitch effect to an object.
 * @see https://pixijs.io/pixi-filters/docs/PIXI.filters.GlitchFilter.html
 */
void

function (glitch) {
    class GlitchFilter {
        /**
         * Initial variables of the instance
         */
        constructor(setup) {
            this.setup = setup || {};
            this.configure()
            this.create()
            return this;
        }

        /**
         * Description of the filter
         */
        static get description() {
            return `The GlitchFilter applies a glitch effect to an object.`
        }

        /**
         * Configure the variables
         */
        configure() {
            this.setup = Object.assign({
                name: (Haya.Filters.manager._countID).toString(16),
                targets: [],
                slices: 5,
                offset: 10,
                direction: 0,
                fillMode: 4,
                seed: 0,
                average: false,
                minSize: 8,
                sampleSize: 48,
                red: [0, 0],
                green: [0, 0],
                blue: [0, 0],
                floor: 'base',
                time: 'all',
                switch_id: -1,
                isTime: true,
                isFloor: true,
                from: 'map'
            }, this.setup)

            this.targets = this.setup.targets
            this.name = this.setup.name
            this.floor = this.setup.floor
            this.time = this.setup.time
            this.switch_id = this.setup.switch_id
            this.actived = false;
            this.enabled = true;
            this.from = this.setup.from;
        }

        /**
         * Deploy to editor
         */
        editor(editor) {
            this._editor = editor;

            // min & sample size
            editor.el.size = new Components.input.NV2D({
                label: 'Min & Sample Size:',
                parent: editor.editor,
                x: {
                    min: 1,
                    max: 100,
                    step: 1,
                    value: this.filter.minSize,
                    onchange: (value) => {
                        this.filter.minSize = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.size_x = this.filter.minSize
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.minSize = editor.register.size_x
                            }

                            this.filter.minSize = Haya.DMath.wheelID(
                                this.filter.minSize,
                                1,
                                100,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: 1,
                    max: 100,
                    step: 1,
                    value: this.filter.sampleSize,
                    onchange: (value) => {
                        this.filter.sampleSize = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.size_y = this.filter.sampleSize
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.sampleSize = editor.register.size_y
                            }

                            this.filter.sampleSize = Haya.DMath.wheelID(
                                this.filter.sampleSize,
                                1,
                                100,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                }
            })

            // slices & direction
            editor.el.sldir = new Components.input.NV2D({
                label: 'Slices & Direction:',
                parent: editor.editor,
                x: {
                    min: 1,
                    max: 100,
                    step: 1,
                    value: this.filter.slices,
                    onchange: (value) => {
                        this.filter.slices = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.size_x = this.filter.slices
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.slices = editor.register.size_x
                            }

                            this.filter.slices = Haya.DMath.wheelID(
                                this.filter.slices,
                                1,
                                100,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: -360,
                    max: 360,
                    step: 1,
                    value: Haya.DMath.float(Haya.DMath.degrees(this.filter.direction)),
                    onchange: (value) => {
                        this.filter.direction = Haya.DMath.radians(Haya.DMath.float(+value))
                    },
                    onclick: (element) => {
                        editor.register.size_y = this.filter.direction
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.direction = editor.register.size_y
                            }

                            this.filter.direction = Haya.DMath.wheelID(
                                this.filter.sampleSize,
                                -6.2,
                                6.2,
                                1,
                                (current) => {
                                    element.value = Haya.DMath.float(Haya.DMath.degrees(current))
                                }
                            )

                        })
                    }
                }
            })

            // offset & seed
            editor.el.offseed = new Components.input.NV2D({
                label: 'Offset & Seed:',
                parent: editor.editor,
                x: {
                    min: 1,
                    max: 100,
                    step: 1,
                    value: this.filter.offset,
                    onchange: (value) => {
                        this.filter.offset = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.size_x = this.filter.offset
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.offset = editor.register.size_x
                            }

                            this.filter.offset = Haya.DMath.wheelID(
                                this.filter.offset,
                                1,
                                100,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: 1,
                    max: 100,
                    step: 1,
                    value: this.filter.seed,
                    onchange: (value) => {
                        this.filter.seed = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.size_y = this.filter.seed
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.seed = editor.register.size_y
                            }

                            this.filter.seed = Haya.DMath.wheelID(
                                this.filter.seed,
                                1,
                                100,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                }
            })

            // averege?
            editor.el.averege = new Components.boolean.Checkbox({
                label: 'Averege?',
                checked: this.filter.averege,
                parent: this.editor,
                onchange: (checked) => {
                    this.filter.averege = checked;
                }
            })

            // blendMode
            editor.el.fillMode = new Components.list.Select({
                parent: editor.editor,
                label: 'Fill Mode:',
                data: [{
                    label: 'none',
                    value: 0,
                }, {
                    label: 'loop',
                    value: 1,
                }, {
                    label: 'clamp',
                    value: 2,
                }, {
                    label: 'mirror',
                    value: 3,
                }, {
                    label: 'original',
                    value: 4,
                }, {
                    label: 'transparent',
                    value: 5,
                }],
                onchange: () => {
                    let kind = parseInt(editor.el.fillMode.get())
                    this.mode(editor.el.fillMode.data[kind].label)
                }
            })

            // red
            editor.el.red = new Components.input.NV2D({
                label: 'Red:',
                parent: editor.editor,
                x: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.red[0],
                    onchange: (value) => {
                        this.filter.red[0] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.red = this.filter.red[0]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.red[0] = editor.register.red
                            }

                            this.filter.red[0] = Haya.DMath.wheelID(
                                this.filter.red[0],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.red[1],
                    onchange: (value) => {
                        this.filter.red[1] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.red = this.filter.red[1]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.red[1] = editor.register.red
                            }

                            this.filter.red[1] = Haya.DMath.wheelID(
                                this.filter.red[1],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                }
            })

            // green
            editor.el.green = new Components.input.NV2D({
                label: 'Green:',
                parent: editor.editor,
                x: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.green[0],
                    onchange: (value) => {
                        this.filter.green[0] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.green = this.filter.green[0]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.green[0] = editor.register.green
                            }

                            this.filter.green[0] = Haya.DMath.wheelID(
                                this.filter.green[0],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.green[1],
                    onchange: (value) => {
                        this.filter.green[1] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.green = this.filter.green[1]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.green[1] = editor.register.green
                            }

                            this.filter.green[1] = Haya.DMath.wheelID(
                                this.filter.green[1],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                }
            })

            // blue
            editor.el.blue = new Components.input.NV2D({
                label: 'Blue:',
                parent: editor.editor,
                x: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.blue[0],
                    onchange: (value) => {
                        this.filter.blue[0] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.blue = this.filter.blue[0]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.blue[0] = editor.register.blue
                            }

                            this.filter.blue[0] = Haya.DMath.wheelID(
                                this.filter.blue[0],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: -255,
                    max: 255,
                    step: 1,
                    value: this.filter.blue[1],
                    onchange: (value) => {
                        this.filter.blue[1] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.blue = this.filter.blue[1]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.blue[1] = editor.register.blue
                            }

                            this.filter.blue[1] = Haya.DMath.wheelID(
                                this.filter.blue[1],
                                -255,
                                255,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                }
            })

            // deploy the possibility of changing global properties
            Haya.Filters.glb_properties(editor, this)
        }

        /**
         * Create the filter element
         */
        create() {
            // create the filter element

            this.filter = new PIXI.filters.GlitchFilter({
                slices: this.setup.slices,
                offset: this.setup.offset,
                direction: this.setup.direction,
                fillMode: this.setup.fillMode,
                seed: this.setup.seed,
                average: this.setup.average,
                minSize: this.setup.minSize,
                sampleSize: this.setup.sampleSize,
                red: this.setup.red,
                green: this.setup.green,
                blue: this.setup.blue
            })
        }

        /**
         * Export object to save as data
         */
        export () {
            return {
                filter: 'GlitchFilter',
                setup: {
                    name: this.name,
                    floor: this.floor,
                    time: this.time,
                    switch_id: this.switch_id,
                    targets: this.targets,
                    red: this.filter.red,
                    blue: this.filter.blend,
                    green: this.filter.green,
                    slices: this.filter.slices,
                    direction: this.filter.direction,
                    offset: this.filter.offset,
                    direction: this.filter.direction,
                    fillMode: this.filter.fillMode,
                    seed: this.filter.seed,
                    average: this.filter.average,
                    minSize: this.filter.minSize,
                    sampleSize: this.filter.sampleSize,
                    isTime: this.setup.isTime,
                    isFloor: this.setup.isFloor
                }
            }
        }

        /**
         * Mode of the glitch
         * @param {String} [value='loop']
         */
        mode(value = 'loop') {
            switch (value) {
                case 'loop':
                    this.filter.fillMode = PIXI.filters.GlitchFilter.LOOP
                    break;
                case 'clamp':
                    this.filter.fillMode = PIXI.filters.GlitchFilter.CLAMP
                    break;
                case 'mirror':
                    this.filter.fillMode = PIXI.filters.GlitchFilter.MIRROR
                    break;
                case 'original':
                    this.filter.fillMode = PIXI.filters.GlitchFilter.ORIGINAL
                    break;
                case 'transparent':
                    this.filter.fillMode = PIXI.filters.GlitchFilter.TRANSPARENT
                    break;
                default:
                    break;
            }
        }

        /**
         * Set the filter to targets
         */
        set() {
            Haya.Filters.set(this)
            return this;
        }

        /**
         * Removes the filter from targets
         */
        remove() {
            Haya.Filters.remove(this)
            return this;
        }
    }
    glitch.GlitchFilter = GlitchFilter;
}(Haya.Filters._list)

/**
 * Filter.PixelateFilter 
 * This filter applies a pixelate effect making display objects appear 'blocky'.
 * @see https://pixijs.io/pixi-filters/docs/PIXI.filters.PixelateFilter.html
 */
void

function (pixelate) {
    class PixelateFilter {

        /**
         * Initial variables of the instance
         */
        constructor(setup) {
            this.setup = setup || {};
            this.configure()
            this.create()
            return this;
        }

        /**
         * Description of the filter
         */
        static get description() {
            return `This filter applies a pixelate effect making display objects appear 'blocky'.`
        }

        /**
         * Configure the variables
         */
        configure() {
            this.setup = Object.assign({
                name: (Haya.Filters.manager._countID).toString(16),
                targets: [],
                size: [2, 2],
                floor: 'base',
                time: 'all',
                switch_id: -1,
                isTime: true,
                isFloor: true,
                from: 'map'
            }, this.setup)

            this.targets = this.setup.targets
            this.name = this.setup.name
            this.floor = this.setup.floor
            this.time = this.setup.time
            this.switch_id = this.setup.switch_id
            this.actived = false;
            this.enabled = true;
            this.from = this.setup.from;
        }

        /**
         * Export data to save
         */
        export () {
            return {
                filters: 'PixelateFilter',
                setup: {
                    name: this.name,
                    size: this.filter.size,
                    floor: this.floor,
                    time: this.time,
                    switch_id: this.switch_id,
                    isTime: this.setup.isTime,
                    isFloor: this.setup.isFloor
                }
            }
        }

        /**
         * Create the filter element
         */
        create() {
            // create the filter element

            this.filter = new PIXI.filters.PixelateFilter(this.setup.size)
        }

        /**
         * Set the filter to targets
         */
        set() {
            Haya.Filters.set(this)
            return this;
        }

        /**
         * Update
         */
        update() {

        }

        /**
         * Removes the filter from targets
         */
        remove() {
            Haya.Filters.remove(this)
            return this;
        }

        /**
         * Deploy to editor
         */
        editor(editor) {
            this._editor = editor;

            // size
            editor.el.size = new Components.input.NV2D({
                label: 'Cell Size:',
                parent: editor.editor,
                x: {
                    min: 1,
                    max: 100,
                    step: 1,
                    value: this.filter.size[0],
                    onchange: (value) => {
                        this.filter.size[0] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.size_x = this.filter.size[0]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.size[0] = editor.register.size_x
                            }

                            this.filter.size[0] = Haya.DMath.wheelID(
                                this.filter.size[0],
                                1,
                                100,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                },
                y: {
                    min: 1,
                    max: 100,
                    step: 1,
                    value: this.filter.size[1],
                    onchange: (value) => {
                        this.filter.size[1] = parseInt(value)
                    },
                    onclick: (element) => {
                        editor.register.size_y = this.filter.size[1]
                        editor.command(() => {

                            if (editor.undo()) {
                                this.filter.size[1] = editor.register.size_y
                            }

                            this.filter.size[1] = Haya.DMath.wheelID(
                                this.filter.size[1],
                                1,
                                100,
                                1,
                                (current) => {
                                    element.value = current
                                }
                            )

                        })
                    }
                }
            })

            // deploy the possibility of changing global properties
            Haya.Filters.glb_properties(editor, this)
        }
    }
    pixelate.PixelateFilter = PixelateFilter;
}(Haya.Filters._list)

/**
 * Filter.Test
 * This is just a class to test out my skills with WebGL xD
 */
void

function (test) {
    class TestFilter {

        /**
         * Initial variables of the instance
         */
        constructor(setup) {
            this.setup = setup || {};
            this.configure()
            this.create()
            return this;
        }

        /**
         * Description of the filter
         */
        static get description() {
            return `This is just a class to test out my skills with WebGL xD`
        }

        /**
         * Configure the variables
         */
        configure() {
            this.setup = Object.assign({
                name: (Haya.Filters.manager._countID).toString(16),
                targets: [],
                size: [2, 2],
                floor: 'base',
                time: 'all',
                switch_id: -1,
                isTime: true,
                isFloor: true,
                from: 'map'
            }, this.setup)

            this.targets = this.setup.targets
            this.name = this.setup.name
            this.floor = this.setup.floor
            this.time = this.setup.time
            this.switch_id = this.setup.switch_id
            this.actived = false;
            this.enabled = true;
            this.from = this.setup.from;
        }

        /**
         * Export data to save
         */
        export () {
            return {
                filters: 'TestFilter',
                setup: {
                    name: this.name,
                    floor: this.floor,
                    time: this.time,
                    switch_id: this.switch_id,
                    isTime: this.setup.isTime,
                    isFloor: this.setup.isFloor
                }
            }
        }

        /**
         * Create the filter element
         */
        create() {
            // create the filter element

            this.filter = new PIXI.Filter(
                Haya.Filters._vert.test,
                Haya.Filters._frag.test
            )

            //  255i to 1f | 1/255 | or Haya.DMath.percentTo(1,1,255) ((current * min) / max);

            //this.filter.uniforms.u_time = 0.0;
            this.filter.uniforms.tred = Haya.DMath.lerp(
                Haya.DMath.FRGB * 128,
                Haya.DMath.FRGB * 164,
                .4
            )

            // this.filter.uniforms.green = Haya.DMath.lerp(
            //     Haya.DMath.FRGB * 128,
            //     Haya.DMath.FRGB * 164,
            //     .4
            // )

            // this.filter.uniforms.blue = Haya.DMath.lerp(
            //     Haya.DMath.FRGB * 128,
            //     Haya.DMath.FRGB * 164,
            //     .4
            // )

        }

        /**
         * Set the filter to targets
         */
        set() {
            Haya.Filters.set(this)
            return this;
        }

        /**
         * Update
         */
        update() {

        }

        /**
         * Removes the filter from targets
         */
        remove() {
            Haya.Filters.remove(this)
            return this;
        }

        /**
         * Deploy to editor
         */
        editor(editor) {
            // editor.el.rgb = new Components.input.NV3D({
            //     label: 'RGB',
            //     x: {
            //         min: 0,
            //         max: 255,
            //         step: 1,
            //         onchange: (current) => {
            //             this.filter.uniforms.tred = Haya.DMath.lerp(
            //                 Haya.DMath.FRGB * 128,
            //                 Haya.DMath.FRGB * current,
            //                 .4
            //             )
            //         }
            //     },
            //     y: {
            //         min: 0,
            //         max: 255,
            //         step: 1,
            //         onchange: (current) => {

            //         }
            //     },
            //     z: {
            //         min: 0,
            //         max: 255,
            //         step: 1,
            //         onchange: (current) => {

            //         }
            //     },
            // })

            // deploy the possibility of changing global properties
            Haya.Filters.glb_properties(editor, this)
        }
    }
    test.TestFilter = TestFilter;
}(Haya.Filters._list);