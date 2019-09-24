/**
 * @file [haya_particle.js -> Haya - Particle]
 * @description Partcile system from PIXI.particles
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.0
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @requires PIXI.particles
 * @todo 
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Particle = Haya.Particle || {};
/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.1]
 * 
 * @help Particle System 
 * 
 */

(function ($) {
    'use strict';
    // =================================================================================
    // [ General ]
    // =================================================================================
    $.config = {
        // desc: max of particles
        max: 576
    };
    // =================================================================================
    // [Emmiter]
    // =================================================================================

    ImageManager.loadParticle = function (filename, hue) {
        return this.loadBitmap('img/particles/', filename, hue, true);
    };

    /**
     * @class Emmiter
     * @description emition of particles
     */
    class Emmiter extends PIXI.Container {
        /**
         * @constructor
         */
        constructor(hash, id) {
            super();
            this.config = hash.config;
            this.config.maxParticles = $.max;
            this.setup = hash.setup || {};
            this.hash = hash;
            this.x = this.setup.x;
            this.y = this.setup.y;
            this._stop = false;
            this._delete = false;
            this._pause = false;
            this.id = id || $.manager._countID++;
            this.create();
            this.origin = this.hash.origin || new Point(0, 0);
            this._startPos = new Point(this.origin.x, this.origin.y);
        }
        /**
         * @function create 
         * @description create particles
         */
        create() {
            this.z = this._z || 3;
            this.time = "all";
            this._textures = [];
            let index = this.hash._imageNames.length;

            while (index--) {
                if (this.hash._imageNames[index] === "") continue;
                this._textures.push((new Sprite(ImageManager.loadParticle(this.hash._imageNames[index]))).texture)
            }

            this.emmiter = new PIXI.particles.Emitter(
                this,
                this._textures,
                this.config
            );


            this.emmiter.emit = true;
            for (key in this.config._totalParam) {
                if (this[key]) this[key] = this.config._totalParam[key];
            }

            print(this);
        }
        /**
         * @function update 
         */
        update() {
            if (!(this.emmiter._emit)) return false; +
                this.updateEmit();
            this.updatePosition();
            this.updateTime();
        }
        /**
         * @function updateParameter
         */
        refreshParameter() {
            //             angleStart
            // acceleration-x,y
            // maxRotationSpeed
            // maxStartRotation
            // minStartRotation
            // minimumScaleMultiplier
            // minimumSpeedMultiplier
            // startAlpha-value
            // startScale-value
            // startSpeed-value 
            this.emitter.acceleration.x = this.config.acceleration.x;
            
        }
        /**
         * @function updateEmit
         */
        updateEmit() {
            if ((this._stop && !this.emitter.particleCount) || this._delete) {
                this._delete = true;
            } else if (this._pause || this._stop) {
                this.emitter._emit = false;
            } else if (this.emmiter.emitterLifetime > 0 && this.emmiter._emitterLife == this.emmiter.emitterLifetime && !this.emmiter.emit) {
                if (!this.emmiter.particleCount) {
                    $.manager.delete(e._id);
                    this._delete = true;
                }
            } else {
                //this.emitter._emit = true;
            }

        }
        //
        updateTime() {
            this.emmiter.update(0.016);
        }
        //
        updatePosition() {
            this.emmiter.updateOwnerPos(this.x, this.y)
        }
    }; $.Emmiter = Emmiter;

    // =================================================================================
    // [Manager]
    // =================================================================================
    class Manager {
        //
        constructor() {
            this._countID = 0;
            this._particles = {};
        }
        // add
        add(filename, textures, hash) {
            if (!(hash.hasOwnProperty("id"))) {
                this._countID++;
                hash.id = this._countID;
            }
            this._particles[hash.id] = new Emmiter({
                config: this.setup(filename),
                setup: hash,
                _imageNames: textures
            }, hash.id)
            hash.stage = hash.stage || SceneManager._scene;
            hash.stage.addChild(this._particles[hash.id])
            return this._particles[hash.id];
        }
        // delete
        delete(id) {
            if (this._particles.hasOwnProperty(id)) {
                this._particles[id].parent.removeChild(this._particles[id])
                delete this._particles[id];
            }
        }
        // update
        update(callback) {
            Object.keys(this._particles).map((key) => {
                let item = this._particles[key];
                if (item) {
                    item.update();
                    if (Haya.Utils.isFunction(callback)) callback.call(this, item);
                }
            })
        }

        setup(filename) {
            if (Haya.Utils.isObject(filename)) {
                return filename;
            } else if (typeof filename === 'string') {
                return Haya.FileIO.json(Haya.FileIO.local(`data/particles/${filename}.json`))
            }
        }
    } $.manager = new Manager();
})(Haya.Particle);
Imported.Haya_Particle = Haya.Particle;