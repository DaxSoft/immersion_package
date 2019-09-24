
/**
 * @file [Ulse | Ultimate Sensor Event]
 * @author Dax Soft | Kvothe <www.dax-soft.weebly> / <dax-soft@live.com>
 * @version 1.7.0
 * @license Haya <https://dax-soft.weebly.com/legal.html>
 * @tutorial https://dax-soft.weebly.com/ulse---mv.html
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Ulse = {};
/*:
 * @author Dax Soft  | Kvothe
 * 
 * @plugindesc Ultimate Sensor Event [1.7.0]
 * 
 * @help
 * [Sensor]: You can use this plugin to make the npc detect the 
 * presence of the player or of another npc! 
 * 
 * [Example]: Useful in the creation of stealth elements, in which
 * the player must keep his presence hidden to advance.
 * 
 * [Support]:
 *  - Sensor between player and npc.
 *  - Sensor between npcs.
 * 
 * [How it Works]: 
 * Any command will only be checked if the player (or npc) is
 * on a range of 20 tiles. This way will the performance will get 
 * better. You change the value at will, just hit Ctrl+F and 
 * type 'RangeLimit'. By default will return to 'false', if the player
 * or npc isn't in this range. You can change it as well.
 * 
 * [Tutorial]: Check out on the link below
 *  https://dax-soft.weebly.com/ulse---mv.html
 * ===========================================================================
 * List of code to use on 'script' paramater: [this¹.sensor] ...
 *  this.sensor(type, range, target) 
 *  example: this.sensor("area", 5, -1) (or) this.sensor("a", 5, -1)
 *  ¹ : [this] is the trigger command to call the function by the event.
 * You can use other way to trigger the command as well, by it is recommended
 * that you this way :)
 * ===========================================================================
 * [range] {number} : by tile quantity
 * [target] {number} : -1 -> Player | 0 -> local event | x -> id of another 
 * event
 * [type] {string} : see below 
 * ===========================================================================
 * type: {string}
 *  "area"|"a": Check out by square area
 *  "on"|"o": Check out if the targe is on (above)
 *  "right"|"r": Sensor by a right line. ​Static line: would fix independent of 
 * the direction that the event is.
 *  "left"|"l": Sensor by a left line. ​Static line: would fix independent of
 * the direction that the event is.
 *  "front"|"f": Sensor by a front line. ​Static line: would fix independent of 
 * the direction that the event is.
 *  "ago"|"a": Sensor by a back line. ​Static line: would fix independent of 
 * the direction that the event is.
 *  "cross"|"+": Sensor as cross form (+ symbol). ​Static line:
 * would fix independent of the direction that the event is.
 *  "vision"|"v": Sensor just on vision of the event.  In straight line
 *  "behind"|"b": Sensor just on behind of the event (watch your backs). 
 * In straight line
 *  "left-arm"|"la": Sensor just on left of the event.  In straight line.
 *  "right-arm"|"ra": Sensor just on right of the event.  In straight line
 *  "top-left"|"tl": Sensor ​on the top-left. Diagonal
 *  "top-right"|"tr": Sensor ​on the top-right. Diagonal
 *  "bottom-right"|"br": Sensor ​on the bottom-right. Diagonal
 *  "bottom-left"|"bl": Sensor ​on the bottom-right. Diagonal
 *  "diagonal"|"x": Sensor as cross form (x symbol). 
 * Sensor on all diagonal sides
 *  "diagonal-vision"|"dv": Sensor just on vision of the event. 
 * In DIAGONAL side
 *  "diagonal-back"|"db": Sensor just on backs (behind) of the event. 
 * In DIAGONAL side
 *  "circle"|"c": Sensor on circle form.
 *  "full-vision"|"fv": Sensor on full field of vision
 *  "full-back"|"fb": Sensor on full field of vision (on backs)
 * ===========================================================================
*/
(function ($) {
    'use strict';
    /**
     * @var $.RangeLimit
     * @description Limit of tiles distance. If the player or npc is not
     * in this limit, the condition will not be checked!
     * @default 20
     */
    $.RangeLimit = 20;
    /**
     * @var $.RangeReturn
     * @description If the player or npc isn't in the range limit, this value
     * will be returned
     * @default false 
     */
    $.RangeReturn = false;
    // ============================================================================
    /**
     * :gameCharacter
     * @class Game_Character
     * @classdesc addons toward this class
     * @memberof Game_CharacterBase
    */

    /**
     * @desc check out if the target of sensor is valid
     * @param {Game_Character} target
     * @returns {boolean}
    */
    Game_Character.prototype.sensorTargetValid = function (target) {
        if (target === undefined || target === null) return false;
        if (!(target instanceof Game_Character)) return false;
        return true;
    }

    /**
     * @desc Check out by square area
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean}
    */
    Game_Character.prototype.sensorArea = function (range, target) {
        // check out target
        if (this.sensorTargetValid(target) === false) return false;
        // return
        return ((Math.abs(target._x - this._x) + Math.abs(target._y - this._y)) <= Math.abs(range));
    }

    /**
     * @description Check out if the targe is on (above)
     * @param {Game_Character} target
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorOn = function (target) {
        // check out target
        if (this.sensorTargetValid(target) === false) return false;
        // return
        return (this.pos(target.x, target.y));
    }

    /**
     * @desc Sensor by a right line. ​Static line: would fix independent of 
     * the direction that the event is.
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean}
     */
    Game_Character.prototype.sensorRight = function (range, target) {
        // check out target
        if (this.sensorTargetValid(target) === false) return false;
        // variable
        var _switch = _switch || false;
        // check out
        if (target._y === this._y) {
            for (let x = this._x; x < (this._x + Math.floor(range)); x++) {
                if (!(this.isMapPassable(x, this._y, 6))) break;
                if (target._x === x) _switch = true;
            }
        }
        // return
        return _switch;
    }

    /**
     * @desc Sensor by a left line. ​Static line: would fix independent of 
     * the direction that the event is.
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean}
     */
    Game_Character.prototype.sensorLeft = function (range, target) {
        // check out target
        if (this.sensorTargetValid(target) === false) return false;
        // variable
        var _switch = _switch || false;
        // check out
        if (target._y === this._y) {
            for (let x = this._x; x > (this._x - Math.floor(range)); x--) {
                if (!(this.isMapPassable(x, this._y, 4))) break;
                if (target._x === x) _switch = true;
            }
        }
        // return
        return _switch;
    }

    /**
     * @desc Sensor by a front line. ​Static line: would fix independent of 
     * the direction that the event is.
     * @param {number} range 
     * @param {Game_Character} target
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorFront = function (range, target) {
        // check out target
        if (this.sensorTargetValid(target) === false) return false;
        // variable
        var _switch = _switch || false;
        // check out
        if (target._x === this._x) {
            for (let y = this._y; y < (this._y + Math.floor(range)); y++) {
                if (!(this.isMapPassable(this._x, y, 2))) break;
                if (target._y === y) _switch = true;
            }
        }
        // return
        return _switch;
    }

    /**
     * @description Sensor by a back line. ​Static line: would fix independent of 
     * the direction that the event is.
     * @param {number} range 
     * @param {Game_Character} target 
     */
    Game_Character.prototype.sensorAgo = function (range, target) {
        // check out target
        if (this.sensorTargetValid(target) === false) return false;
        // variable
        var _switch = _switch || false;
        // check out
        if (target._x === this._x) {
            for (let y = this._y; y > (this._y - Math.floor(range)); y--) {
                if (!(this.isMapPassable(this._x, y, 8))) break;
                if (target._y === y) _switch = true;
            }
        }
        // return
        return _switch;
    }

    /**
     * @description Sensor as cross form (+ symbol). ​Static line:
     * would fix independent of the direction that the event is.
     * @param {number} range 
     * @param {Game_Character} target
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorCross = function (range, target) {
        // return if any is true
        return (
            this.sensorAgo(range, target) ||
            this.sensorFront(range, target) ||
            this.sensorLeft(range, target) ||
            this.sensorRight(range, target)
        );
    }

    /**
     * @description Sensor just on vision of the event.  In straight line
     * @param {number} range 
     * @param {Game_Character} target
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorVision = function (range, target) {
        switch (this.direction()) {
            case 2: return (this.sensorFront(range, target));
            case 4: return (this.sensorLeft(range, target));
            case 6: return (this.sensorRight(range, target));
            case 8: return (this.sensorAgo(range, target));
            default: break;
        }
    }

    /**
     * @desc Sensor just on behind of the event (watch your backs). In straight line
     * @param {number} range 
     * @param {Game_Character} target
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorBack = function (range, target) {
        switch (this.direction()) {
            case 8: return (this.sensorFront(range, target));
            case 6: return (this.sensorLeft(range, target));
            case 4: return (this.sensorRight(range, target));
            case 2: return (this.sensorAgo(range, target));
            default: break;
        }
    }

    /**
     * @description Sensor just on left of the event.  In straight line
     * @param {number} range 
     * @param {Game_Character} target
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorLeftArm = function (range, target) {
        switch (this.direction()) {
            case 4: return (this.sensorFront(range, target));
            case 8: return (this.sensorLeft(range, target));
            case 2: return (this.sensorRight(range, target));
            case 6: return (this.sensorAgo(range, target));
            default: break;
        }
    }

    /**
     * @desc Sensor just on right of the event.  In straight line
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorRightArm = function (range, target) {
        switch (this.direction()) {
            case 4: return (this.sensorFront(range, target));
            case 2: return (this.sensorLeft(range, target));
            case 8: return (this.sensorRight(range, target));
            case 6: return (this.sensorAgo(range, target));
            default: break;
        }
    }

    /**
     * @desc Sensor ​on the top-left. Diagonal
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorTopLeft = function (range, target) {
        // check out target
        if (this.sensorTargetValid(target) === false) return false;
        // variable
        var _switch = _switch || false;
        // check out
        for (let i = 0; i < Math.floor(range) + 1; i++) {
            if ((target._x === (this._x - i)) && (target._y === (this._y - i))) _switch = true;
        }
        // return
        return _switch;
    }

    /**
     * @desc Sensor ​on the top-right. Diagonal
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorTopRight = function (range, target) {
        // check out target
        if (this.sensorTargetValid(target) === false) return false;
        // variable
        var _switch = _switch || false;
        // check out
        for (let i = 0; i < Math.floor(range) + 1; i++) {
            if ((target._x === (this._x + i)) && (target._y === (this._y - i))) _switch = true;
        }
        // return
        return _switch;
    }

    /**
     * @desc Sensor ​on the bottom-right. Diagonal
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorBottomRight = function (range, target) {
        // check out target
        if (this.sensorTargetValid(target) === false) return false;
        // variable
        var _switch = _switch || false;
        // check out
        for (let i = 0; i < Math.floor(range) + 1; i++) {
            if ((target._x === (this._x + i)) && (target._y === (this._y + i))) _switch = true;
        }
        // return
        return _switch;
    }

    /**
     * @desc Sensor ​on the bottom-right. Diagonal
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorBottomLeft = function (range, target) {
        // check out target
        if (this.sensorTargetValid(target) === false) return false;
        // variable
        var _switch = _switch || false;
        // check out
        for (let i = 0; i < Math.floor(range) + 1; i++) {
            if ((target._x === (this._x - i)) && (target._y === (this._y + i))) _switch = true;
        }
        // return
        return _switch;
    }

    /**
     * @desc Sensor as cross form (x symbol). Sensor on all diagonal sides
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorDiagonal = function (range, target) {
        // return if any is true
        return (
            this.sensorTopLeft(range, target) ||
            this.sensorTopRight(range, target) ||
            this.sensorBottomLeft(range, target) ||
            this.sensorBottomRight(range, target)
        );
    }

    /**
     * @desc Sensor just on vision of the event. In DIAGONAL side
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorDiagonalVision = function (range, target) {
        switch (this.direction()) {
            case 2: return (this.sensorBottomLeft(range, target) || this.sensorBottomRight(range, target));
            case 4: return (this.sensorTopLeft(range, target) || this.sensorBottomLeft(range, target));
            case 6: return (this.sensorBottomRight(range, target) || this.sensorTopRight(range, target));
            case 8: return (this.sensorTopLeft(range, target) || this.sensorTopRight(range, target));
            default: break;
        }
    }

    /**
     * @desc Sensor just on backs (behind) of the event. In DIAGONAL side
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorDiagonalBack = function (range, target) {
        switch (this.direction()) {
            case 8: return (this.sensorBottomLeft(range, target) || this.sensorBottomRight(range, target));
            case 6: return (this.sensorTopLeft(range, target) || this.sensorBottomLeft(range, target));
            case 4: return (this.sensorBottomRight(range, target) || this.sensorTopRight(range, target));
            case 2: return (this.sensorTopLeft(range, target) || this.sensorTopRight(range, target));
            default: break;
        }
    }

    /**
     * @desc Sensor on circle form.
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorCircle = function (range, target) {
        range = Math.floor(range) < 2 ? 2 : Math.floor(range);
        return (this.sensorDiagonal(range - 1, target) || this.sensorCross(range, target));
    }

    /**
     * @desc Sensor on full field of vision
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorFullVision = function (range, target) {
        range = Math.floor(range) < 2 ? 2 : Math.floor(range);
        return (
            this.sensorDiagonalVision(range, target) ||
            this.sensorVision(range, target)
        );
    }

    /**
     * @desc Sensor on full field of vision
     * @param {number} range 
     * @param {Game_Character} target 
     * @returns {boolean} 
     */
    Game_Character.prototype.sensorFullBack = function (range, target) {
        range = Math.floor(range) < 2 ? 2 : Math.floor(range);
        return (
            this.sensorDiagonalBack(range, target) ||
            this.sensorBack(range, target)
        );
    }
    // ============================================================================
    /**
     * @class Game_Interpreter
     * @classdesc interpreter of actions from events
     */

    /**
     * @function sensor
     * @description make more easy to check out sensors on 'event page manager'
     * @param {string} type see on '@help' section
     * @param {number} range
     * @param {number} target
     * @returns {boolean}
    */
    Game_Interpreter.prototype.sensor = function (type, range, target) {
        // target
        type = type.trim();
        target = this.character(target);
        // limit
        if (!(this.character(0).sensorArea(20, target))) return ($.RangeReturn);
        // return
        if (type.match(/^(area|a)/i)) {
            return (this.character(0).sensorArea(range, target));
        } else if (type.match(/^(on|o)/i)) {
            return (this.character(0).sensorOn(range, target));
        } else if (type.match(/^(right|r)/i)) {
            return (this.character(0).sensorRight(range, target));
        } else if (type.match(/^(left|l)/i)) {
            return (this.character(0).sensorLeft(range, target));
        } else if (type.match(/^(ago|ag)/i)) {
            return (this.character(0).sensorAgo(range, target));
        } else if (type.match(/^(cross|\+)/i)) {
            return (this.character(0).sensorCross(range, target));
        } else if (type.match(/^(vision|v)/i)) {
            return (this.character(0).sensorVision(range, target));
        } else if (type.match(/^(behind|b)/i)) {
            return (this.character(0).sensorBehind(range, target));
        } else if (type.match(/^(left-arm|la)/i)) {
            return (this.character(0).sensorLeftArm(range, target));
        } else if (type.match(/^(right-arm|ra)/i)) {
            return (this.character(0).sensorRightArm(range, target));
        } else if (type.match(/^(top-left|tl)/i)) {
            return (this.character(0).sensorTopLeft(range, target));
        } else if (type.match(/^(top-right|tr)/i)) {
            return (this.character(0).sensorTopRight(range, target));
        } else if (type.match(/^(bottom-left|bl)/i)) {
            return (this.character(0).sensorBottomLeft(range, target));
        } else if (type.match(/^(bottom-right|br)/i)) {
            return (this.character(0).sensorBottomRight(range, target));
        } else if (type.match(/^(diagonal|x)/i)) {
            return (this.character(0).sensorDiagonal(range, target));
        } else if (type.match(/^(diagonal-vision|dv)/i)) {
            return (this.character(0).sensorDiagonalVision(range, target));
        } else if (type.match(/^(diagonal-back|db)/i)) {
            return (this.character(0).sensorDiagonalBack(range, target));
        } else if (type.match(/^(circle|c)/i)) {
            return (this.character(0).sensorCircle(range, target));
        } else if (type.match(/^(full-vision|fv)/i)) {
            return (this.character(0).sensorFullVision(range, target));
        } else if (type.match(/^(full-back|fb)/i)) {
            return (this.character(0).sensorFullBack(range, target));
        }
    };
})(Haya.Ulse);
Imported["Ulse"] = true;
