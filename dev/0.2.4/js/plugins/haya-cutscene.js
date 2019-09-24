/**
 * @file [haya_map.js -> Haya - Map]
 * This plugin is under [Work in Progress], then any suggestion, 
 * feedback or some tips, it shall be welcome! Just send me a email :)
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @thanks to Jonforum! <for Pixi.Light tip>
 *         to ivanpopelyshev <PIXI display and light>
 *         to davidfig <PIXI viewport>
 * @version 0.1.1
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @requires PIXI.lights https://github.com/pixijs/pixi-lights
 * @requires PIXI.display https://github.com/pixijs/pixi-display
 * @requires PIXI.extras.Viewport https://github.com/davidfig/pixi-viewport
 * @requires haya-core 
 * @requires haya-map
 * @requires haya-movement
 * @requires haya-particle
 * =====================================================================
 * @todo [x] Cutscene : a way to do better and more dynamic cutscenes
 *          [] blur tool : <focus/off focus> camera effect
 *          [] vignette effect
 *          [] filter tools : change colors of a specific part of the map
 * or add a effect and so on
 *          [] sound tool : with xyz axis position, duration and so on
 * @todo [] Cutscene's Editor
 * =====================================================================
 * @description [log]
 *  @version 0.1.1
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Cutscene = {};
/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.1] Haya Cutscene
 * 
 * @help
 * This plugin is under [Work in Progress], then any suggestion, 
 * feedback or some tips, it is welcome! Just send me a email :)
 * 
 * =============================================================
 * Credits:
 *   
 */


/**
 * @function Game_Cutscene
 * @description a game class for dynamic cutscenes
 */
function Game_Cutscene() {
    this.initialize.apply(this, arguments);
}

var DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function () {
    DataManager_createGameObjects.call(this);
    $gameCutscene = new Game_Cutscene();
};

(function ($) {
    'use strict';
    // ========================================================================
    // ** General setup [:general]
    // ========================================================================

    // ========================================================================

    // ========================================================================

    // ========================================================================
    var Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function (mapId) {
        Game_Map_setup.call(this, mapId)
        $gameCutscene.refresh();
    };

    var Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function (sceneActive) {
        Game_Map_update.call(this, sceneActive);
        this.updateCutscene();
    };

    Game_Map.prototype.updateCutscene = function () {
        $gameCutscene.update();
    }
    // ========================================================================
    Game_Cutscene.prototype.initialize = function () {
        // [camera]
        this._camera = new Point(0, 0);
        this._previous = new Point(0, 0);

        // [action]
        this._predVariables = {};
        this._restoreZoom = null;
        this._next = null;
        this._cutscene = null;

        // [wide screen]
        this._wideScreen = false;
        this._wideSprite = new PIXI.Graphics();
        this._wideSprite.visible = this._wideScreen;

        // [focusLight]
        this._focusLight = new PIXI.lights.PointLight(0xddc83a, 1.0);
        this._focusLight.visible = false;
        this._focusLight._target = null;
        this._focusLight.falloff = [0.45, 1.0, 45];
        this._focusLight.time = "all"
        this._focusLight.kind = "point"
        this._focusLight._switchID = 587;
        this._focusLight.lightHeight = 0.07;
        this._focusLight.range = 200;
        this._focusLight._showingDirection = 0;

        // [refresh]
        this.refresh();
    }

    /**
     * @description update over map
     */
    Game_Cutscene.prototype.update = function () {
        // [cutscene]?
        if (this.isCutscene()) {
            if (this._duration > 1) {
                if (this._cutscene === 0) {
                    // [delay duration]
                    var duration = this._duration;

                    // [zoom]
                    if (this._zoom.target !== null) {
                        this._zoom.value = ((this._zoom.value * (duration - 1)) + this._zoom.target) / duration
                        // effects
                        if (this._zoomIn === false) {
                            Haya.Map.Viewport.zoomPercent(0.0 - (this._zoom.value))
                            if (this._directCut === true) Haya.Map.Viewport.moveCenter($gameMap._camera)
                        } else {
                            Haya.Map.Viewport.zoomPercent(1.0 - (this._zoom.value))
                            if (this._directCut === true) Haya.Map.Viewport.moveCenter($gameMap._camera)
                        }
                    }

                    // [progress]
                    this._duration--;
                } else if (this._cutscene === 1) {
                    // [delay duration]
                    var duration = this._duration;

                    // [zoom]
                    this._zoom.value = ((this._zoom.value * (duration - 1)) + this._zoom.target) / duration
                    Haya.Map.Viewport.zoomPercent(1.0 - this._zoom.value, false)
                    Haya.Map.Viewport.moveCenter($gameMap._camera)

                    // [progress]
                    this._duration--;
                }
            } else {
                this.end()
            }
            // [cutscene:zoomIn]
        }

        // [focusLight]
        if (this._focusLight._target !== null) {
            this._focusLight.visible = Input.isPressed('d') && ((
                Math.abs($gamePlayer.screenX() - $gameMap.getCamPosX(this._focusLight._target)) +
                Math.abs($gamePlayer.screenY() - $gameMap.getCamPosY(this._focusLight._target))
            ) <= Math.abs(this._focusLight.range))
            $gameSwitches.setValue(this._focusLight._switchID, this._focusLight.visible)
            if (this._focusLight.visible === true) {
                this._focusLight.x = $gameMap.getCamPosX(this._focusLight._target) + Haya.Map.Viewport.x;
                this._focusLight.y = ($gameMap.getCamPosY(this._focusLight._target) + Haya.Map.Viewport.y) - 32;
            }
        } else {
            this._focusLight.visible = false
        }

    }
    /**
     * @description refresh variables
     */
    Game_Cutscene.prototype.refresh = function () {
        this._active = false;
        this._cutscene = null;
        this._duration = 0;
        this._directCut = false;
        this._period = 0;
        this._speed = {
            value: 0.75,
            standard: 0.9,
            fast: 3.0,
            slow: 0.5,
            refresh: 1.0
        }
        this._zoom = {
            value: 1.0,
            target: null
        }
        this._blur = {
            current: null,
            data: [],
            duration: null,
            strength: 1,
            quality: 1
        }
        this._zoomIn = true;
        if (Haya.Map.Viewport) Haya.Map.Viewport.scale.set(1.0, 1.0)
    }

    /**
     * @description check out if is on a cutscene' scene
     */
    Game_Cutscene.prototype.isCutscene = function () {
        return this._active === true;
    }

    /**
     * @description start scene
     */
    Game_Cutscene.prototype.start = function () {
        this._active = true
        return this._active;
    }

    /**
     * @description end scene
     */
    Game_Cutscene.prototype.end = function () {
        print(this._next)
        if (this._next === 0) { // original
            this.refresh();
            $gameMap.target = null;
            //print( $gameMap, this, 'end up')
            this._active = false
            this.wideScreenClose();
            print($gameMap, this, Haya.Map.Viewport, 'end up')
            return this._active;
        } else if (this._next === 1) { // to player
            this.refresh();
            $gameMap.target = null;
            //print( $gameMap, this, 'end up')
            this._active = true
            this.wideScreenClose();
            print($gameMap, this, Haya.Map.Viewport, 'end up')
            this._next = -1;
            return this._active;
        } else if (this._next === null) {
            print("original")
            this.refresh();
            this._active = false
        }
        return this._active;

    }

    /**
     * @description set the cam in a event 
     */
    Game_Cutscene.prototype.focusEvent = function (id, setup = {}, refresh = true) {
        this._zoom.refresh = Haya.Utils.Object.hasProperty(setup, "zoomRefresh", 1.0)
        if (refresh === true) this.refresh();
        this._previous = $gameMap.target || $gamePlayer;
        // options
        this._speed.value = Haya.Utils.Object.hasProperty(setup, "speed", this._speed.fast);

        this._zoom.target = Haya.Utils.Object.hasProperty(setup, "zoom", null)
        this._restoreZoom = this._zoom.target === null ? null : this._zoom.target;
        this._zoomIn = Haya.Utils.Object.hasProperty(setup, "zoomIn", true);

        this._directCut = Haya.Utils.Object.hasProperty(setup, "directCut", false)

        this._duration = Math.round(Haya.Utils.Object.hasProperty(setup, "duration", 3) * 60)
        // action - after option
        this._next = setup.action === null ? false : setup.action;
        // pred variables
        this._predVariables.zoomTarget = this._zoom.target;
        this._predVariables.duration = (this._duration / 60) - 1;
        this._predVariables.speedValue = this._speed.value;
        //
        $gameMap.follow(id, this._speed.value)
        this._camera = $gameMap._camera;
        //
        this._cutscene = 0;
        // active
        this.start();
    }


    /**
     * @description give a zoom in with smooth movement
     */
    Game_Cutscene.prototype.zoomIn = function (setup = {}, refresh = false) {
        if (refresh === true) this.refresh();
        this.wideScreenOpen();
        this._duration = Math.round(Haya.Utils.Object.hasProperty(setup, "duration", 3) * 60)
        this._period = Math.round(this._duration / 2);

        this._speed.value = Haya.Utils.Object.hasProperty(setup, "speed", 0.01);
        this._zoom.target = Haya.Utils.Object.hasProperty(setup, "zoom", 0.75);
        this._zoom.value = 1.0;

        // action - after option
        this._next = Haya.Utils.Object.hasProperty(setup, "action", 0);
        // pred variables
        this._predVariables.zoomTarget = 1.0 - this._zoom.target;
        this._predVariables.duration = (this._duration / 60) - 1;
        this._predVariables.speedValue = this._speed.value;

        this._cutscene = 1;

        print(this);

        this.start();
    }


    /**
     * @description focus light upon a point/event
     */
    Game_Cutscene.prototype.focusLight = function (target, setup = null) {
        // [setup]
        if (setup !== null && Haya.Utils.isObject(setup)) {
            this._focusLight._switchID = Haya.Utils.Object.hasProperty(setup, "switch", 587);
            this._focusLight.color = Haya.Utils.Object.hasProperty(setup, "color", 0xddc83a);
            this._focusLight.brightness = Haya.Utils.Object.hasProperty(setup, "brightness", 1.0);
            this._focusLight.range = Haya.Utils.Object.hasProperty(setup, "range", 200);
            this._focusLight._showingDirection = Haya.Utils.Object.hasProperty(setup, "showingDirection", 0);
        }

        // [target]
        if (target === null || target === undefined) {
            this._focusLight._target = null;
        } else if (Array.isArray(target)) {
            this._focusLight._target = new Point(target[0], target[1]);
        } else if (Number.isInteger(target)) {
            this._focusLight._target = $gameMap.character(target);
        } else if (target instanceof Point) {
            this._focusLight._target = target;
        }

        if (this._focusLight._showingDirection < 100 || this._focusLight._showingDirection === null) {
            $gameMap.character(-1)
        } else {
            setTimeout(() => {
                $gameMap.character(-1)
            }, this._focusLight._showingDirection)
        }


        return this._focusLight._target;
    }

    /**
     * @description active on wide screen view
     */
    Game_Cutscene.prototype.wideScreenOpen = function () {
        this._wideSprite.visible = true;
        this._wideSprite.clear();
        this._wideSprite.beginFill(0x000000)
        this._wideSprite.drawRect(0, Graphics.height - 48, Graphics.width, 48);
        this._wideSprite.drawRect(0, 0, Graphics.width, 48);
        this._wideSprite.endFill()
    }

    /**
     * @description active on wide screen view
     */
    Game_Cutscene.prototype.wideScreenClose = function () {
        this._wideSprite.visible = false;
    }
    // ========================================================================
    // ========================================================================
    print("[HAYA CUTSCENE]", $);
})(Haya.Cutscene);

Imported["haya-cutscene"] = true;