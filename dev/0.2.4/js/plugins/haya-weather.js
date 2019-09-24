'use strict';
/**
 * @file [haya_weather.js -> Haya - Weather]
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.0
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @todo 
 *  [] : Fog
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Weather = Haya.Weather || {};
/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.0] Weather System
 * 
 * @help This is the weather system for the Immersion Package
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
    // | [has?] 
    // | Check out if there are the 'vert' & 'frag' files
    // |-------------------------------------------------------------------------------- 

    $.has = function (name) {
        return ($._vert.hasOwnProperty(name) && $._frag.hasOwnProperty(name))
    }

    // |-------------------------------------------------------------------------------- 
    // | [list]
    // | List of available weathers
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
                    weather: filters,
                    setup: {},
                    targets: ['map']
                }
            })
        })

        return data;
    }

    // |-------------------------------------------------------------------------------- 
    // | [set]
    // | Deploy filter on sprite
    // |-------------------------------------------------------------------------------- 
    $.set = function (weather) {
        if (weather.targets.length > 0) {


            weather.targets.map(sprite => {

                if (!sprite) return;

                // light?
                if (sprite.typeof && sprite.typeof === 'light') {
                    if (Array.isArray(sprite._filters)) {
                        sprite._filters.push(weather.filter)
                    } else {
                        sprite._filters = [weather.filter]
                    }
                } else {
                    if (sprite instanceof PIXI.Container) {
                        print('is container!')
                        sprite = sprite.children[0]
                    }



                    if (Array.isArray(sprite._filters)) {
                        sprite._filters.push(weather.filter)
                    } else {
                        sprite._filters = [weather.filter]
                    }

                }


            })

            weather.actived = true;
        }
    }

    // |-------------------------------------------------------------------------------- 
    // | [remove]
    // | Remove filter from sprite
    // |-------------------------------------------------------------------------------- 
    $.remove = function (weather) {
        if (weather.targets.length > 0) {
            weather.targets.map(sprite => {

                if (sprite instanceof PIXI.Container) {
                    sprite = sprite.children[0]
                }

                sprite._filters = sprite._filters.filter(value => value !== weather.filter)

                weather.actived = false;
            })
        }
    }

    // |-------------------------------------------------------------------------------- 
    // | [glb_properties]
    // | Global components to edit common properties of weathers
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
    // | Set the targets from weather
    // |-------------------------------------------------------------------------------- 
    $.from = function (filter, from = 'map') {
        console.log('filter', filter);
        
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
    // | [Manager]
    // | Control the weaters, add, destroy, update and so on
    // |-------------------------------------------------------------------------------- 

    class Manager {
        /**
         * Initial variables of the instance
         */
        constructor() {
            // count the quantity of particles
            this._countID = 0;
            // handles with the filters emmiter variables
            this._weathers = {}
            // cycle of filters' keys
            this._keys = [];
        }
        /**
         * Add-on a new weather
         */
        add({
            weather, // from Haya.Weather._list
            setup
        }) {
            // check if filter exists
            if (!($._list.hasOwnProperty(weather))) {
                return null;
            }

            // check out the id to progress the counter
            if (!(setup.hasOwnProperty('id'))) {
                this._countID++;
                setup.id = this._countID;
            }

            // create
            this._weathers[setup.id] = new $._list[weather](setup)

            // update keys
            this._keys = Object.keys(this._weathers);

            // return to emmiter
            return this._weathers[setup.id];
        }

        /**
         * Remove a weather based on his id
         */
        remove(id) {
            if (this._weathers.hasOwnProperty(id)) {
                this._weathers[id].remove()
                delete this._weathers[id]
                this._keys = Object.keys(this._weathers);
                return true
            }
            return false
        }

        /**
         * Check out if has the weather
         */
        has(weather) {
            return $._list.hasOwnProperty(weather)
        }

        /**
         * Check out if the weather is okay with the states of the map
         */
        isOkay(weather) {
            return (
                (weather.setup.isTime && Haya.Map.Time.period(weather.time)) &&
                (weather.switch_id > 0 ? $gameSwitches.value(this.switch) : true) &&
                (weather.setup.isFloor && weather.floor === $gamePlayer.floor)
            )
        }

        /**
         * Update the weather
         */
        update(emmiter) {
            if (this._keys.length < 1) return;

            this._keys.map((id) => {
                // particle element
                const element = this._weathers[id];
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
    // | Export to variable .Weather from Haya
    // |-------------------------------------------------------------------------------- 
    $.manager = new Manager;
}(Haya.Weather)

// | =====================================================================
// | [Fog Weather System]
// | =====================================================================
void

function (fog) {
    /**
     * @class FogFilter
     * @extends PIXI.Filter 
     */
    class HayaFog {
        /**
         * @constructor
         */
        constructor(setup) {
            this.setup = setup;

            this.configure();

            this.create();

            return this;
        }

        /**
         * Configure 
         */
        configure() {
            this.setup = Object.assign({
                floor: 'base',
                time: 'all',
                switch_id: -1,
                isTime: true,
                isFloor: true,
                from: 'map',
                tagets: [],
                name: (Haya.Weather.manager._countID).toString(16),
                octaves: 4
            }, this.setup);

            this.name = this.setup.name
            this.floor = this.setup.floor
            this.time = this.setup.time
            this.switch_id = this.setup.switch_id
            this.actived = false;
            this.enabled = true;
            this.from = this.setup.from;
        }

        /**
         * Export to save
         */
        export() {
            return {
                weather: 'HayaFog',
                setup: {
                    floor: this.floor,
                    switch_id: this.switch_id,
                    time: this.time,
                    octaves: this.filter.octaves,
                    targets: this.targets,
                    isTime: this.setup.isTime,
                    isFloor: this.setup.isFloor,
                    from: this.from,

                }
            }
        }

        /**
         * Create the filter element
         */
        create() {
            this.filter = new PIXI.Filter(
                Haya.Weather._vert.haya_fog,
                Haya.Weather._frag.haya_fog, {
                    octaves: 0,
                    time: 0
                }
            )

            this.filter.uniforms.octaves = this.setup.octaves || 4;
            this.filter.uniforms.time = 1;
        }

        /**
         * Set the filter to targets
         */
        set() {
            Haya.Weather.set(this)
            return this;
        }

        /**
         * Removes the filter from targets
         */
        remove() {
            Haya.Weather.remove(this)
            return this;
        }

        /**
         * Update
         */
        update() {

        }

        /**
         * Deploy to editor
         */
        editor(editor) {
            // change octaves
            editor.el.octaves = new Components.input.Number({
                parent: editor.editor,
                label: 'Octaves',
                min: 1,
                max: 100,
                step: 1,
                default: parseInt(this.filter.uniforms.octaves),
                onchange: (current) => {
                    this.filter.uniforms.octaves = current
                }
            })

            // deploy the possibility of changing global properties
            Haya.Filters.glb_properties(editor, this)
        }
    };
    fog.HayaFog = HayaFog;
}(Haya.Weather._list)