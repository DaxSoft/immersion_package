'use strict';

/**
 * @file [haya_particle.js -> Haya - Particle]
 * Partcile system from PIXI.particles adapted to RPG Maker MV Engine
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.3
 * @license MIT
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @requires PIXI.particles
 * =====================================================================
 */

var Imported = Imported || {};
var Haya = Haya || {};
Haya.Particle = Haya.Particle || {};

/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.3] Particle System from Immersion Plugin
 * 
 * @help Particle system from PIXI.particles. 
 * This is just a module that uses as base the
 * PIXI.particles to create particles effects.
 */

void

function ($) {
    // |-------------------------------------------------------------------------------- 
    // | [Configure]
    // |-------------------------------------------------------------------------------- 
    $.config = {
        /**
         * Maximun of particles allowed
         */
        maxParticles: 576,
    }
    // |-------------------------------------------------------------------------------- 
    // | [Emmiter]
    // | Container class to emit the particles sprite
    // |-------------------------------------------------------------------------------- 
    class Emmiter extends PIXI.Container {
        /**
         * Initial variables of the instance
         */
        constructor(setup = {}) {
            super()

            // config variables of the particle
            this.config = setup.config;

            // max particles
            this.config.maxParticles = $.config.maxParticles

            // setup
            this.setup = Object.assign({
                emit: true,
                x: 200,
                y: 200,
                floor: 'base',
                time: 'all',
                name: ($.manager._countID++).toString(16),
                id: $.manager._countID++,
                origin: new Haya.DMath.Vector2D(0, 0)
            }, setup.setup || {})

            if (Array.isArray(this.setup.origin)) {
                this.setup.origin = new Haya.DMath.Vector2D(this.setup.origin[0], this.setup.origin[1])
            }


            // _imageNames
            this._imageNames = setup.textures

            // start out values
            this.start();

            // create sprite
            this.create();
        }

        /**
         * Export variables to save on the editor
         */
        export () {
            return {
                config: this.config,
                setup: {
                    emit: this.setup.emit,
                    x: this.x,
                    y: this.y,
                    floor: this.floor,
                    time: this.time,
                    name: this.name,
                    origin: this.origin.array()
                },
                textures: this._imageNames
            }
        }

        /**
         * Start out the values 
         */
        start() {
            this.x = this.setup.x;
            this.y = this.setup.y;
            this._stop = false;
            this._delete = false;
            this._pause = false;
            this.name = this.setup.name
            this.origin = this.setup.origin
            this._startPos = new Point(this.origin.x, this.origin.y);
            this.z = this._z || 3
            this.time = this.setup.time
            this.floor = this.setup.floor
            this._textures = [];
        }

        /**
         * Create the sprite
         */
        create() {
            // textures
            this._imageNames.map(textureFilepath => {
                // checkout
                if (textureFilepath !== "" && !(Haya.Utils.invalid(textureFilepath))) {
                    // create & push
                    this._textures.push(
                        new PIXI.Texture.fromImage(textureFilepath)
                    )
                }
            })

            // create emmiter
            this.emmiter = new PIXI.particles.Emitter(
                // The PIXI.Container to put the emitter in
                // if using blend modes, it's important to put this
                // on top of a bitmap, and not use the root stage Container
                this,
                // The collection of particle images to use,
                this._textures,
                // Emitter configuration, edit this to change the look
                // of the emitter,
                this.config
            )

            // emmiting?
            this.emmiter.emit = this.setup.emit;

            // configure the paramaters
            this.params()
        }

        /**
         * Configure the paramaters of the emmiter
         */
        params() {
            for (key in this.config._totalParam) {
                if (this[key]) this[key] = this.config._totalParam[key];
            }
        }

        /**
         * Check out if it is okay to update
         */
        isOkay() {
            return (
                Haya.Map.Time.period(this.time) &&
                this.floor === $gamePlayer.floor
            )
        }

        /**
         * Update the particle
         */
        update() {
            if (Haya.Utils.invalid(this.emmiter)) return false;
            this.visible = this.isOkay();
            if ((this.emmiter._emit) === false) return false;
            this.updateEmit();
            this.updatePosition();
            this.updateDelta();
            return true;
        }

        /**
         * Update the emmiter
         */
        updateEmit() {
            if (this.visible === false) {
                this.emmiter.emit = false;
                return;
            }

            if ((this._stop && !this.emmiter.particleCount) || this._delete) {
                this._delete = true;
            } else if (this._pause || this._stop) {
                this.emmiter.emit = false;
            } else if (this.emmiter.emitterLifetime > 0 && this.emmiter._emitterLife == this.emmiter.emitterLifetime && !this.emmiter.emit) {
                if (!this.emmiter.particleCount) {
                    //  $.manager.delete(this.id);
                    this._delete = true;
                }
            }

        }

        /**
         * Update function every frame 
         */
        updateDelta() {
            this.emmiter.update(0.016);
        }

        /**
         * Update the position of the particle
         */
        updatePosition() {
            this.emmiter.updateOwnerPos(this.x, this.y)
        }
    }
    // |-------------------------------------------------------------------------------- 
    // | [Manager]
    // | Control the particles, add, destroy, update and so on
    // |-------------------------------------------------------------------------------- 
    class Manager {
        /**
         * Initial variables of the instance
         */
        constructor() {
            // count the quantity of particles
            this._countID = 0;
            // handles with the particles emmiter variables
            this._particles = {}
            // cycle of particles' keys
            this._keys = [];
        }

        /**
         * Add-on a new particle
         */
        add({
            config,
            textures,
            setup
        }) {
            // check out the id to progress the counter
            if (!(setup.hasOwnProperty('id'))) {
                this._countID++;
                setup.id = this._countID;
            }

            // stage reference (parent)
            Haya.Utils.Object.hasProperty(setup, 'stage', SceneManager._scene)

            // create a new emmiter
            this._particles[setup.id] = new Emmiter({
                // filepath of the config file of this particle (data)
                config,
                // setup
                setup,
                // textures
                textures
            }, setup.id)

            // add to parent
            setup.stage.addChild(this._particles[setup.id])

            // update keys
            this._keys = Object.keys(this._particles);

            // return to emmiter
            return this._particles[setup.id];
        }

        /**
         * Remove a particle based on his id
         */
        remove(id) {
            if (this._particles.hasOwnProperty(id)) {
                this._particles[id].parent.removeChild(this._particles[id])
                delete this._particles[id];
                // update keys
                this._keys = Object.keys(this._particles);
                return true;
            }
            return false;
        }

        /**
         * Update the particles
         */
        update(emmiter) {
            if (this._keys.length < 1) return;

            this._keys.map((id) => {
                // particle element
                const element = this._particles[id];
                // valid?
                if (element) {
                    element.update();
                    if (Haya.Utils.isFunction(emmiter)) emmiter.call(this, element, this);
                }
            })
        }
    }
    // |-------------------------------------------------------------------------------- 
    // | Export to variable .particle from Haya
    // |-------------------------------------------------------------------------------- 
    $.manager = new Manager;
    $.emmiter = Emmiter;
}(Haya.Particle)