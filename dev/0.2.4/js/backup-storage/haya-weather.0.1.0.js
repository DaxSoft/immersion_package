/**
 * @file [haya_weather.js -> Haya - Weather]
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.0
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @todo 
 *  [] : Fog
 *  
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
void function (weather) {
'use strict';
    weather.element = [];
}(Haya.Weather)
// ========================================================================
void function (fog) {
    'use strict';
    // ========================================================================
    fog.fogs = {textures: {}};

    Haya.File.list("img/particles/fog", function (filename) {
        // replace filename
        let _filename = filename.replace(/^.*[\\\/]/, '');
        // load just '.json' file
        if (_filename.match(/\.png$/gi)) {
            // load data 'npc' setup
            let name = _filename.replace(/\.png/gi, "")
            //
            fog.fogs.textures[name] = {url: filename, filename: _filename, src: new PIXI.Texture.fromImage(filename)}
        }
    }) // end object


    class Fog extends PIXI.Container {
        /**
         * @param {Array} [setup.pos]
         * @param {Array} [setup.acceleration]
         * @param {Array} [setup.gravity]
         * @param {Array} [setup.alpha{x: <start>, y: <end>}]
         * @param {Array} [setup.scale]
         * @param {String|HexaDecimal} [setup.color]
         * @param {String} [setup.floor]
         * @param {String} [setup.time]
         * @param {Number} [setup.switch]
         * @param {Number} [setup.blend]
         * @param {Number} [setup.duration]
         * @param {Number} [setup.speed]
         * @param {Number} [setup.max]
         * @param {String} [setup.texture]
         */
        constructor(setup = {}) {
            super()
            this.setup = setup;
            
        }

        configure() { 
            this.setup.pos = Haya.Utils.Object.hasProperty(this.setup, "pos", [0,0,2])
            this.setup.pos[2] = this.setup.pos[2] || 2;

            this.setup.alpha = Haya.Utils.Object.hasProperty(this.setup, "alpha", 0.9)

            this.setup.floor = Haya.Utils.Object.hasProperty(this.setup, "floor", "base")
            this.setup.time = Haya.Utils.Object.hasProperty(this.setup, "time", "all")
            this.setup.switch = Haya.Utils.Object.hasProperty(this.setup, "switch", -1)

        }

        clear() {
            
        }

        update() {
            this.visible = this.isOkay();
            if (this.visible === false) return;

        }

        create() {
            let element = new PIXI.Sprite(fog.fogs.textures[this.setup.texture].src);
            //element.pivot.set(-( (this.x * (this.setup.pos[2]/100)) ), -( (this.y * (this.setup.pos[2]/100)) ) )
            element.blendMode = this.setup.blend
            element.tint = this.setup.tint;
            element.alpha = this.setup.alpha;

            element.acceleration = new Point(
                (this.setup.acceleration[0]/this.setup.pos[2]) * (-(this.setup.acceleration[0]*this.setup.pos[2]) + Haya.DMath.rand(0, this.setup.acceleration[0])) / this.setup.acceleration[0],
                Haya.DMath.rand(-this.setup.acceleration[1], this.setup.acceleration[1])
            )

            element.gravity = new Point(
                Haya.DMath.rand(-this.setup.gravity[0], this.setup.gravity[0]),
                Haya.DMath.rand(-this.setup.gravity[1], this.setup.gravity[1])
            )
            this.addChild(element)
            this._max = this.children.length;

            print("fog created", element)
        }

        z(value) {
            this.setup.pos[2] = value || 2;
        }

        isOkay() {
            return (
                (this.setup.switch !== -1 ? $gameSwitches.value(this.setup.switch) : true) &&
                Haya.Map.Time.period(this.setup.time) &&
                this.setup.floor === $gamePlayer.floor
            )
        }
    }; fog.Fog = Fog;

}(Haya.Weather)