/**
 * @file [Haya_Movement.js] -> Haya - Organic Movement
 * This plugin is not complete!
 * @memberof [Immersion] This plugin is from the serie ->
 * Haya - Immersion, a pack in which contain several plugins that will
 * make your game more immersive.
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 *         Samuel Hodge <https://github.com/Sinova/Collisions>
 * @version 0.2.1
 * @license Haya <https://dax-soft.weebly.com/legal.html>
 * =====================================================================
 * @requires js/plugins/Haya_Core.js <Haya Core>
 * =====================================================================
 * @version 0.1.8
 *  [x] Smart detection of the floor. When the players hit on the region
 * that links to the next floor; when he go back to this region, by automatic
 * will return to the value of the previous floor. So it's like a historic.
 * @version 0.2.0
 *  [x] Fix Event Collision
 * @version 0.2.1
 *  [] Rectangle Collision Body {class}
 *  [] Mutilply bodies for characters {array}
 */

/*:
 * @author @dax-soft | @Samuel Hodge 
 * 
 * @plugindesc [0.2.1] Haya Movement | Organic Movement 
 * 
 * @help
 * Important: Insert this plugin after the [Haya Core] 
 *            The collision system is from Samuel Hodge,
 *            https://github.com/Sinova/Collisions
 * ======================================================================
 * Organic Movement : This plugin will allow to create a immersive game
 * without be limited to the GRID Map from standard RPG Maker. Based
 * on SNES games, Pixel Moviment.
 * ======================================================================
 * This plugins is on test and is it on W.I.P; Then, many bugs and crashes
 * will be found. Anyway, you can help me sending a email with the bugs
 * and crashes that will found.
 * 
 * Any idea you can also contact me. Lets improve this plugin to all folks                
 * ======================================================================
 */

/* ================================================================================
Ctrl+F [locate]:
    collision
        :result
        :sat
        :aabbAABB
        :polygonPolygon
        :polygonCircle
        :circleCircle
        :separatingAxis
        :body
        :BVHBranch
        :bvh
        :circle
        :point
        :polygon
        :collision
    movement
        :character_base
================================================================================ */
/**
 * @var Imported
 * @desc setup of Imported and Haya
 */
var Imported = Imported || {};
/**
 * @desc check out if has Haya Core on your project
 */
if (!(Imported.hasOwnProperty("Haya"))) {
    throw new Error("You are missing the plugin <Haya Core>\n\
Please, download and put him above this plugin\n\
on <Plugin Manager>\n\
Download at my website ~~ :)")
}
/**
 * @var Haya
 * @desc Global variable for 'function'
 */
var Haya = Haya || {};
// for collision section
Haya.Collision = Haya.Collision || {};
// for movement section 
Haya.Movement = Haya.Movement || {};
// ================================================================================
(function ($) {
    'use strict';
    // ============================================================================
    /**
     * :result
     * @class Results
     * @description this class will handle with the Collision results,
     * collecting informations
     */
    // ============================================================================
    class Result {
        // constrcutor
        constructor() {
            // check out if a collision was detected
            this.collision = false;
            // the source body tested
            this.source = null;
            // the target body tested against the source body
            this.target = null;
            // check out if the source body is on target body
            this.sourceInTarget = null;
            // check out if the target body is on source body
            this.targetInSource = null;
            // The magnitude of the shortest axis of overlap
            this.overlap = 0;
            // the directions of the shortest axis of overlap
            this.overlap_x = 0;
            this.overlap_y = 0;
        }
    };
    // ============================================================================
    /**
     * :sat
     * @function SAT Separating Axis Theorem
     * @description Using the Separating Axis Theorem to check out if two bodies 
     * are colliding
     * @param {Polygon?} source the source body to be the host
     * @param {Polygon?} target the target body to be the test against
     * @param {$.Result} [result = null] A Result object on which to store information about the collision
     * @param {Boolean} [aabb = true] False for skip the AABB test
     * @returns {Boolean}
     * 
     * @link https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
     */
    const SAT = function SAT(a, b, result = null, aabb = true) {
        const a_polygon = a._polygon;
        const b_polygon = b._polygon;

        let collision = false;

        if (result) {
            result.a = a;
            result.b = b;
            result.a_in_b = true;
            result.b_in_a = true;
            result.overlap = null;
            result.overlap_x = 0;
            result.overlap_y = 0;
        }

        if (a_polygon) {
            if (
                a._dirty_coords ||
                a.x !== a._x ||
                a.y !== a._y ||
                a.angle !== a._angle ||
                a.scale_x !== a._scale_x ||
                a.scale_y !== a._scale_y
            ) {
                a._calculateCoords();
            }
        }

        if (b_polygon) {
            if (
                b._dirty_coords ||
                b.x !== b._x ||
                b.y !== b._y ||
                b.angle !== b._angle ||
                b.scale_x !== b._scale_x ||
                b.scale_y !== b._scale_y
            ) {
                b._calculateCoords();
            }
        }

        if (!aabb || aabbAABB(a, b)) {
            if (a_polygon && a._dirty_normals) {
                a._calculateNormals();
            }

            if (b_polygon && b._dirty_normals) {
                b._calculateNormals();
            }

            collision = (
                a_polygon && b_polygon ? polygonPolygon(a, b, result) :
                a_polygon ? polygonCircle(a, b, result, false) :
                b_polygon ? polygonCircle(b, a, result, true) :
                circleCircle(a, b, result)
            );
        }

        if (result) {
            result.collision = collision;
        }

        return collision;
    };
    $.SAT = SAT;
    // ============================================================================
    /**
     * :aabbAABB
     * @function aabbAABB
     * @description Determines if two bodies' axis aligned bounding boxes are colliding
     * @param {Polygon?} source the source body to be the host
     * @param {Polygon?} target the target body to be the test against
     */
    // ============================================================================
    const aabbAABB = function aabbAABB(a, b) {
        const a_polygon = a._polygon;
        const a_x = a_polygon ? 0 : a.x;
        const a_y = a_polygon ? 0 : a.y;
        const a_radius = a_polygon ? 0 : a.radius * a.scale;
        const a_min_x = a_polygon ? a._min_x : a_x - a_radius;
        const a_min_y = a_polygon ? a._min_y : a_y - a_radius;
        const a_max_x = a_polygon ? a._max_x : a_x + a_radius;
        const a_max_y = a_polygon ? a._max_y : a_y + a_radius;

        const b_polygon = b._polygon;
        const b_x = b_polygon ? 0 : b.x;
        const b_y = b_polygon ? 0 : b.y;
        const b_radius = b_polygon ? 0 : b.radius * b.scale;
        const b_min_x = b_polygon ? b._min_x : b_x - b_radius;
        const b_min_y = b_polygon ? b._min_y : b_y - b_radius;
        const b_max_x = b_polygon ? b._max_x : b_x + b_radius;
        const b_max_y = b_polygon ? b._max_y : b_y + b_radius;

        return a_min_x < b_max_x && a_min_y < b_max_y && a_max_x > b_min_x && a_max_y > b_min_y;
    };
    $.aabbAABB = aabbAABB;
    // ============================================================================
    /**
     * :polygonPolygon
     * @function polygonPolygon
     * @description Determines if two polygons are colliding
     * @param {Polygon?} source the source body to be the host
     * @param {Polygon?} target the target body to be the test against
     * @param {$.Result} [result = null] A Result object on which to store information about the collision
     */
    // ============================================================================
    const polygonPolygon = function polygonPolygon(a, b, result) {
        const a_count = a._coords.length;
        const b_count = b._coords.length;

        // Handle points specially
        if (a_count === 2 && b_count === 2) {
            const a_coords = a._coords;
            const b_coords = b._coords;

            if (result) {
                result.overlap = 0;
            }

            return a_coords[0] === b_coords[0] && a_coords[1] === b_coords[1];
        }

        const a_coords = a._coords;
        const b_coords = b._coords;
        const a_normals = a._normals;
        const b_normals = b._normals;

        if (a_count > 2) {
            for (let ix = 0, iy = 1; ix < a_count; ix += 2, iy += 2) {
                if (separatingAxis(a_coords, b_coords, a_normals[ix], a_normals[iy], result)) {
                    return false;
                }
            }
        }

        if (b_count > 2) {
            for (let ix = 0, iy = 1; ix < b_count; ix += 2, iy += 2) {
                if (separatingAxis(a_coords, b_coords, b_normals[ix], b_normals[iy], result)) {
                    return false;
                }
            }
        }

        return true;
    };
    $.polygonPolygon = polygonPolygon;
    // ============================================================================
    /**
     * :polygonCircle
     * @function polygonCircle
     * @description if a polygon and a circle are colliding
     * @param {Polygon?} [a=source] the source body to be the host
     * @param {Polygon?} [b=target] the target body to be the test against
     * @param {$.Result} [result = null] A Result object on which to store information about the collision
     * @param {Boolean} [reverse = false] Set to true to reverse [source] and [target] in the result 
     * parameter when testing circle->polygon instead of polygon->circle
     */
    // ============================================================================
    const polygonCircle = function polygonCircle(a, b, result, reverse = false) {
        const a_coords = a._coords;
        const a_edges = a._edges;
        const a_normals = a._normals;
        const b_x = b.x;
        const b_y = b.y;
        const b_radius = b.radius * b.scale;
        const b_radius2 = b_radius * 2;
        const radius_squared = b_radius * b_radius;
        const count = a_coords.length;

        let a_in_b = true;
        let b_in_a = true;
        let overlap = null;
        let overlap_x = 0;
        let overlap_y = 0;

        // Handle points specially
        if (count === 2) {
            const coord_x = b_x - a_coords[0];
            const coord_y = b_y - a_coords[1];
            const length_squared = coord_x * coord_x + coord_y * coord_y;

            if (length_squared > radius_squared) {
                return false;
            }

            if (result) {
                const length = Math.sqrt(length_squared);

                overlap = b_radius - length;
                overlap_x = coord_x / length;
                overlap_y = coord_y / length;
                b_in_a = false;
            }
        } else {
            for (let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
                const coord_x = b_x - a_coords[ix];
                const coord_y = b_y - a_coords[iy];
                const edge_x = a_edges[ix];
                const edge_y = a_edges[iy];
                const dot = coord_x * edge_x + coord_y * edge_y;
                const region = dot < 0 ? -1 : dot > edge_x * edge_x + edge_y * edge_y ? 1 : 0;

                let tmp_overlapping = false;
                let tmp_overlap = 0;
                let tmp_overlap_x = 0;
                let tmp_overlap_y = 0;

                if (result && a_in_b && coord_x * coord_x + coord_y * coord_y > radius_squared) {
                    a_in_b = false;
                }

                if (region) {
                    const left = region === -1;
                    const other_x = left ? (ix === 0 ? count - 2 : ix - 2) : (ix === count - 2 ? 0 : ix + 2);
                    const other_y = other_x + 1;
                    const coord2_x = b_x - a_coords[other_x];
                    const coord2_y = b_y - a_coords[other_y];
                    const edge2_x = a_edges[other_x];
                    const edge2_y = a_edges[other_y];
                    const dot2 = coord2_x * edge2_x + coord2_y * edge2_y;
                    const region2 = dot2 < 0 ? -1 : dot2 > edge2_x * edge2_x + edge2_y * edge2_y ? 1 : 0;

                    if (region2 === -region) {
                        const target_x = left ? coord_x : coord2_x;
                        const target_y = left ? coord_y : coord2_y;
                        const length_squared = target_x * target_x + target_y * target_y;

                        if (length_squared > radius_squared) {
                            return false;
                        }

                        if (result) {
                            const length = Math.sqrt(length_squared);

                            tmp_overlapping = true;
                            tmp_overlap = b_radius - length;
                            tmp_overlap_x = target_x / length;
                            tmp_overlap_y = target_y / length;
                            b_in_a = false;
                        }
                    }
                } else {
                    const normal_x = a_normals[ix];
                    const normal_y = a_normals[iy];
                    const length = coord_x * normal_x + coord_y * normal_y;
                    const absolute_length = length < 0 ? -length : length;

                    if (length > 0 && absolute_length > b_radius) {
                        return false;
                    }

                    if (result) {
                        tmp_overlapping = true;
                        tmp_overlap = b_radius - length;
                        tmp_overlap_x = normal_x;
                        tmp_overlap_y = normal_y;

                        if (b_in_a && length >= 0 || tmp_overlap < b_radius2) {
                            b_in_a = false;
                        }
                    }
                }

                if (tmp_overlapping && (overlap === null || overlap > tmp_overlap)) {
                    overlap = tmp_overlap;
                    overlap_x = tmp_overlap_x;
                    overlap_y = tmp_overlap_y;
                }
            }
        }

        if (result) {
            result.a_in_b = reverse ? b_in_a : a_in_b;
            result.b_in_a = reverse ? a_in_b : b_in_a;
            result.overlap = overlap;
            result.overlap_x = reverse ? -overlap_x : overlap_x;
            result.overlap_y = reverse ? -overlap_y : overlap_y;
        }

        return true;
    };
    $.polygonCircle = polygonCircle;
    // ============================================================================
    /**
     * :circleCircle
     * @function circleCircle
     * @description Determines if two circles are colliding
     * @param {Circle} a The source circle to test
     * @param {Circle} b The target circle to test against
     * @param {Result} [result = null] A Result object on which to store information about the collision
     * @returns {Boolean}
     */
    // ============================================================================
    const circleCircle = function circleCircle(a, b, result) {
        const a_radius = a.radius * a.scale;
        const b_radius = b.radius * b.scale;
        const difference_x = b.x - a.x;
        const difference_y = b.y - a.y;
        const radius_sum = a_radius + b_radius;
        const length_squared = difference_x * difference_x + difference_y * difference_y;

        if (length_squared > radius_sum * radius_sum) {
            return false;
        }

        if (result) {
            const length = Math.sqrt(length_squared);

            result.a_in_b = a_radius <= b_radius && length <= b_radius - a_radius;
            result.b_in_a = b_radius <= a_radius && length <= a_radius - b_radius;
            result.overlap = radius_sum - length;
            result.overlap_x = difference_x / length;
            result.overlap_y = difference_y / length;
        }

        return true;
    };
    $.circleCircle = circleCircle;
    // ============================================================================
    /**
     * :separatingAxis
     * @function separatingAxis
     * @description Determines if two polygons are separated by an axis
     * @param {Array<Number[]>} a_coords The coordinates of the polygon to test
     * @param {Array<Number[]>} b_coords The coordinates of the polygon to test against
     * @param {Number} x The X direction of the axis
     * @param {Number} y The Y direction of the axis
     * @param {Result} [result = null] A Result object on which to store information about the collision
     * @returns {Boolean}
     */
    // ============================================================================
    const separatingAxis = function separatingAxis(a_coords, b_coords, x, y, result = null) {
        const a_count = a_coords.length;
        const b_count = b_coords.length;

        if (!a_count || !b_count) {
            return true;
        }

        let a_start = null;
        let a_end = null;
        let b_start = null;
        let b_end = null;

        for (let ix = 0, iy = 1; ix < a_count; ix += 2, iy += 2) {
            const dot = a_coords[ix] * x + a_coords[iy] * y;

            if (a_start === null || a_start > dot) {
                a_start = dot;
            }

            if (a_end === null || a_end < dot) {
                a_end = dot;
            }
        }

        for (let ix = 0, iy = 1; ix < b_count; ix += 2, iy += 2) {
            const dot = b_coords[ix] * x + b_coords[iy] * y;

            if (b_start === null || b_start > dot) {
                b_start = dot;
            }

            if (b_end === null || b_end < dot) {
                b_end = dot;
            }
        }

        if (a_start > b_end || a_end < b_start) {
            return true;
        }

        if (result) {
            let overlap = 0;

            if (a_start < b_start) {
                result.a_in_b = false;

                if (a_end < b_end) {
                    overlap = a_end - b_start;
                    result.b_in_a = false;
                } else {
                    const option1 = a_end - b_start;
                    const option2 = b_end - a_start;

                    overlap = option1 < option2 ? option1 : -option2;
                }
            } else {
                result.b_in_a = false;

                if (a_end > b_end) {
                    overlap = a_start - b_end;
                    result.a_in_b = false;
                } else {
                    const option1 = a_end - b_start;
                    const option2 = b_end - a_start;

                    overlap = option1 < option2 ? option1 : -option2;
                }
            }

            const current_overlap = result.overlap;
            const absolute_overlap = overlap < 0 ? -overlap : overlap;

            if (current_overlap === null || current_overlap > absolute_overlap) {
                const sign = overlap < 0 ? -1 : 1;

                result.overlap = absolute_overlap;
                result.overlap_x = x * sign;
                result.overlap_y = y * sign;
            }
        }

        return false;
    };
    $.separatingAxis = separatingAxis;

    // ============================================================================
    // ============================================================================

    /**
     * :body
     * @class Body
     * @description The base class for bodies used to detect collisions
     */
    class Body {
        /**
         * @constructor
         * @param {Number} [x = 0] The starting X coordinate
         * @param {Number} [y = 0] The starting Y coordinate
         * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
         */
        constructor(x = 0, y = 0, padding = 0) {
            /**
             * @desc The X coordinate of the body
             * @type {Number}
             */
            this.x = x;

            /**
             * @desc The Y coordinate of the body
             * @type {Number}
             */
            this.y = y;

            /**
             * @desc The amount to pad the bounding volume when testing for potential collisions
             * @type {Number}
             */
            this.padding = padding;

            /**
             * @description the velocity of this body
             * @type {Number}
             */
            this.velocity = 0.5;

            /**
             * @description the mass of this body
             * @type {Number}
             */
            this.mass = 0.1;

            /**
             * @description the name of the body
             * @type {String}
             */
            this.name = "body";

            /**
             * @description label tag of the body
             * @type {String}
             */
            this.label = "base";

            /**
             * @description floor tag of the body
             * @type {String}
             */
            this.floor = "base";

            /**
             * @description body is active or not
             * @type {Boolean}
             */
            this.active = true;

            /** @private */
            this._circle = false;

            /** @private */
            this._polygon = false;

            /** @private */
            this._point = false;

            /** @private */
            this._bvh = null;

            /** @private */
            this._bvh_parent = null;

            /** @private */
            this._bvh_branch = false;

            /** @private */
            this._bvh_padding = padding;

            /** @private */
            this._bvh_min_x = 0;

            /** @private */
            this._bvh_min_y = 0;

            /** @private */
            this._bvh_max_x = 0;

            /** @private */
            this._bvh_max_y = 0;
        }

        /**
         * Determines if the body is colliding with another body
         * @param {Circle|Polygon|Point} target The target body to test against
         * @param {Result} [result = null] A Result object on which to store information about the collision
         * @param {Boolean} [aabb = true] Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
         * @returns {Boolean}
         */
        collides(target, result = null, aabb = true) {
            return SAT(this, target, result, aabb);
        }

        /**
         * Returns a list of potential collisions
         * @returns {Array<Body>}
         */
        potentials() {
            const bvh = this._bvh;

            if (bvh === null) {
                throw new Error('Body does not belong to a collision system');
            }

            return bvh.potentials(this);
        }

        /**
         * Removes the body from its current collision system
         */
        remove() {
            const bvh = this._bvh;

            if (bvh) {
                bvh.remove(this, false);
            }
        }

        /**
         * Creates a {@link Result} used to collect the detailed results of a collision test
         */
        createResult() {
            return new Result();
        }

        /**
         * Creates a Result used to collect the detailed results of a collision test
         */
        static createResult() {
            return new Result();
        }
    };

    // ============================================================================
    // ============================================================================
    const branch_pool = [];
    /**
     * :BVHBranch
     * @class BVHBranch
     * @description A branch within a BVH
     */
    class BVHBranch {
        /**
         * @constructor
         */
        constructor() {
            /** @private */
            this._bvh_parent = null;

            /** @private */
            this._bvh_branch = true;

            /** @private */
            this._bvh_left = null;

            /** @private */
            this._bvh_right = null;

            /** @private */
            this._bvh_sort = 0;

            /** @private */
            this._bvh_min_x = 0;

            /** @private */
            this._bvh_min_y = 0;

            /** @private */
            this._bvh_max_x = 0;

            /** @private */
            this._bvh_max_y = 0;
        }

        /**
         * Returns a branch from the branch pool or creates a new branch
         * @returns {BVHBranch}
         */
        static getBranch() {
            if (branch_pool.length) {
                return branch_pool.pop();
            }

            return new BVHBranch();
        }

        /**
         * Releases a branch back into the branch pool
         * @param {BVHBranch} branch The branch to release
         */
        static releaseBranch(branch) {
            branch_pool.push(branch);
        }

        /**
         * Sorting callback used to sort branches by deepest first
         * @param {BVHBranch} a The first branch
         * @param {BVHBranch} b The second branch
         * @returns {Number}
         */
        static sortBranches(a, b) {
            return a.sort > b.sort ? -1 : 1;
        }
    };

    // ============================================================================
    // ============================================================================

    /**
     * @class BVH :bvh
     * @description A Bounding Volume Hierarchy (BVH) used to find potential collisions quickly
     */
    class BVH {
        /**
         * @constructor
         */
        constructor() {
            /** @private */
            this._hierarchy = null;

            /** @private */
            this._bodies = [];

            /** @private */
            this._dirty_branches = [];
        }

        /**
         * Inserts a body into the BVH
         * @param {Circle|Polygon|Point} body The body to insert
         * @param {Boolean} [updating = false] Set to true if the body already exists in the BVH (used internally when updating the body's position)
         */
        insert(body, updating = false) {
            if (!updating) {
                const bvh = body._bvh;

                if (bvh && bvh !== this) {
                    throw new Error('Body belongs to another collision system');
                }

                body._bvh = this;
                this._bodies.push(body);
            }

            const polygon = body._polygon;
            const body_x = body.x;
            const body_y = body.y;

            if (polygon) {
                if (
                    body._dirty_coords ||
                    body.x !== body._x ||
                    body.y !== body._y ||
                    body.angle !== body._angle ||
                    body.scale_x !== body._scale_x ||
                    body.scale_y !== body._scale_y
                ) {
                    body._calculateCoords();
                }
            }

            const padding = body._bvh_padding;
            const radius = polygon ? 0 : body.radius * body.scale;
            const body_min_x = (polygon ? body._min_x : body_x - radius) - padding;
            const body_min_y = (polygon ? body._min_y : body_y - radius) - padding;
            const body_max_x = (polygon ? body._max_x : body_x + radius) + padding;
            const body_max_y = (polygon ? body._max_y : body_y + radius) + padding;

            body._bvh_min_x = body_min_x;
            body._bvh_min_y = body_min_y;
            body._bvh_max_x = body_max_x;
            body._bvh_max_y = body_max_y;

            let current = this._hierarchy;
            let sort = 0;

            if (!current) {
                this._hierarchy = body;
            } else {
                while (true) {
                    // Branch
                    if (current._bvh_branch) {
                        const left = current._bvh_left;
                        const left_min_y = left._bvh_min_y;
                        const left_max_x = left._bvh_max_x;
                        const left_max_y = left._bvh_max_y;
                        const left_new_min_x = body_min_x < left._bvh_min_x ? body_min_x : left._bvh_min_x;
                        const left_new_min_y = body_min_y < left_min_y ? body_min_y : left_min_y;
                        const left_new_max_x = body_max_x > left_max_x ? body_max_x : left_max_x;
                        const left_new_max_y = body_max_y > left_max_y ? body_max_y : left_max_y;
                        const left_volume = (left_max_x - left._bvh_min_x) * (left_max_y - left_min_y);
                        const left_new_volume = (left_new_max_x - left_new_min_x) * (left_new_max_y - left_new_min_y);
                        const left_difference = left_new_volume - left_volume;

                        const right = current._bvh_right;
                        const right_min_x = right._bvh_min_x;
                        const right_min_y = right._bvh_min_y;
                        const right_max_x = right._bvh_max_x;
                        const right_max_y = right._bvh_max_y;
                        const right_new_min_x = body_min_x < right_min_x ? body_min_x : right_min_x;
                        const right_new_min_y = body_min_y < right_min_y ? body_min_y : right_min_y;
                        const right_new_max_x = body_max_x > right_max_x ? body_max_x : right_max_x;
                        const right_new_max_y = body_max_y > right_max_y ? body_max_y : right_max_y;
                        const right_volume = (right_max_x - right_min_x) * (right_max_y - right_min_y);
                        const right_new_volume = (right_new_max_x - right_new_min_x) * (right_new_max_y - right_new_min_y);
                        const right_difference = right_new_volume - right_volume;

                        current._bvh_sort = sort++;
                        current._bvh_min_x = left_new_min_x < right_new_min_x ? left_new_min_x : right_new_min_x;
                        current._bvh_min_y = left_new_min_y < right_new_min_y ? left_new_min_y : right_new_min_y;
                        current._bvh_max_x = left_new_max_x > right_new_max_x ? left_new_max_x : right_new_max_x;
                        current._bvh_max_y = left_new_max_y > right_new_max_y ? left_new_max_y : right_new_max_y;

                        current = left_difference <= right_difference ? left : right;
                    }
                    // Leaf
                    else {
                        const grandparent = current._bvh_parent;
                        const parent_min_x = current._bvh_min_x;
                        const parent_min_y = current._bvh_min_y;
                        const parent_max_x = current._bvh_max_x;
                        const parent_max_y = current._bvh_max_y;
                        const new_parent = current._bvh_parent = body._bvh_parent = BVHBranch.getBranch();

                        new_parent._bvh_parent = grandparent;
                        new_parent._bvh_left = current;
                        new_parent._bvh_right = body;
                        new_parent._bvh_sort = sort++;
                        new_parent._bvh_min_x = body_min_x < parent_min_x ? body_min_x : parent_min_x;
                        new_parent._bvh_min_y = body_min_y < parent_min_y ? body_min_y : parent_min_y;
                        new_parent._bvh_max_x = body_max_x > parent_max_x ? body_max_x : parent_max_x;
                        new_parent._bvh_max_y = body_max_y > parent_max_y ? body_max_y : parent_max_y;

                        if (!grandparent) {
                            this._hierarchy = new_parent;
                        } else if (grandparent._bvh_left === current) {
                            grandparent._bvh_left = new_parent;
                        } else {
                            grandparent._bvh_right = new_parent;
                        }

                        break;
                    }
                }
            }
        }

        /**
         * Removes a body from the BVH
         * @param {Circle|Polygon|Point} body The body to remove
         * @param {Boolean} [updating = false] Set to true if this is a temporary removal (used internally when updating the body's position)
         */
        remove(body, updating = false) {
            if (!updating) {
                const bvh = body._bvh;

                if (bvh && bvh !== this) {
                    throw new Error('Body belongs to another collision system');
                }

                body._bvh = null;
                this._bodies.splice(this._bodies.indexOf(body), 1);
            }

            if (this._hierarchy === body) {
                this._hierarchy = null;

                return;
            }

            const parent = body._bvh_parent;
            const grandparent = parent._bvh_parent;
            const parent_left = parent._bvh_left;
            const sibling = parent_left === body ? parent._bvh_right : parent_left;

            sibling._bvh_parent = grandparent;

            if (sibling._bvh_branch) {
                sibling._bvh_sort = parent._bvh_sort;
            }

            if (grandparent) {
                if (grandparent._bvh_left === parent) {
                    grandparent._bvh_left = sibling;
                } else {
                    grandparent._bvh_right = sibling;
                }

                let branch = grandparent;

                while (branch) {
                    const left = branch._bvh_left;
                    const left_min_x = left._bvh_min_x;
                    const left_min_y = left._bvh_min_y;
                    const left_max_x = left._bvh_max_x;
                    const left_max_y = left._bvh_max_y;

                    const right = branch._bvh_right;
                    const right_min_x = right._bvh_min_x;
                    const right_min_y = right._bvh_min_y;
                    const right_max_x = right._bvh_max_x;
                    const right_max_y = right._bvh_max_y;

                    branch._bvh_min_x = left_min_x < right_min_x ? left_min_x : right_min_x;
                    branch._bvh_min_y = left_min_y < right_min_y ? left_min_y : right_min_y;
                    branch._bvh_max_x = left_max_x > right_max_x ? left_max_x : right_max_x;
                    branch._bvh_max_y = left_max_y > right_max_y ? left_max_y : right_max_y;

                    branch = branch._bvh_parent;
                }
            } else {
                this._hierarchy = sibling;
            }

            BVHBranch.releaseBranch(parent);
        }

        /**
         * Updates the BVH. Moved bodies are removed/inserted.
         */
        update() {
            const bodies = this._bodies;
            const count = bodies.length;

            for (let i = 0; i < count; ++i) {
                const body = bodies[i];

                let update = false;

                if (!update && body.padding !== body._bvh_padding) {
                    body._bvh_padding = body.padding;
                    update = true;
                }

                if (!update) {
                    const polygon = body._polygon;

                    if (polygon) {
                        if (
                            body._dirty_coords ||
                            body.x !== body._x ||
                            body.y !== body._y ||
                            body.angle !== body._angle ||
                            body.scale_x !== body._scale_x ||
                            body.scale_y !== body._scale_y
                        ) {
                            body._calculateCoords();
                        }
                    }

                    const x = body.x;
                    const y = body.y;
                    const radius = polygon ? 0 : body.radius * body.scale;
                    const min_x = polygon ? body._min_x : x - radius;
                    const min_y = polygon ? body._min_y : y - radius;
                    const max_x = polygon ? body._max_x : x + radius;
                    const max_y = polygon ? body._max_y : y + radius;

                    update = min_x < body._bvh_min_x || min_y < body._bvh_min_y || max_x > body._bvh_max_x || max_y > body._bvh_max_y;
                }

                if (update) {
                    this.remove(body, true);
                    this.insert(body, true);
                }
            }
        }

        /**
         * Returns a list of potential collisions for a body
         * @param {Circle|Polygon|Point} body The body to test
         * @returns {Array<Body>}
         */
        potentials(body) {
            const results = [];
            const min_x = body._bvh_min_x;
            const min_y = body._bvh_min_y;
            const max_x = body._bvh_max_x;
            const max_y = body._bvh_max_y;

            let current = this._hierarchy;
            let traverse_left = true;

            if (!current || !current._bvh_branch) {
                return results;
            }

            while (current) {
                if (traverse_left) {
                    traverse_left = false;

                    let left = current._bvh_branch ? current._bvh_left : null;

                    while (
                        left &&
                        left._bvh_max_x >= min_x &&
                        left._bvh_max_y >= min_y &&
                        left._bvh_min_x <= max_x &&
                        left._bvh_min_y <= max_y
                    ) {
                        current = left;
                        left = current._bvh_branch ? current._bvh_left : null;
                    }
                }

                const branch = current._bvh_branch;
                const right = branch ? current._bvh_right : null;

                if (
                    right &&
                    right._bvh_max_x > min_x &&
                    right._bvh_max_y > min_y &&
                    right._bvh_min_x < max_x &&
                    right._bvh_min_y < max_y
                ) {
                    current = right;
                    traverse_left = true;
                } else {
                    if (!branch && current !== body) {
                        results.push(current);
                    }

                    let parent = current._bvh_parent;

                    if (parent) {
                        while (parent && parent._bvh_right === current) {
                            current = parent;
                            parent = current._bvh_parent;
                        }

                        current = parent;
                    } else {
                        break;
                    }
                }
            }

            return results;
        }

        /**
         * Draws the bodies within the BVH to a CanvasRenderingContext2D's current path
         * @param {CanvasRenderingContext2D} context The context to draw to
         */
        draw(context) {
            const bodies = this._bodies;
            const count = bodies.length;

            for (let i = 0; i < count; ++i) {
                bodies[i].draw(context);
            }
        }

        /**
         * Draws the BVH to a CanvasRenderingContext2D's current path. This is useful for testing out different padding values for bodies.
         * @param {CanvasRenderingContext2D} context The context to draw to
         */
        drawBVH(context) {
            let current = this._hierarchy;
            let traverse_left = true;

            while (current) {
                if (traverse_left) {
                    traverse_left = false;

                    let left = current._bvh_branch ? current._bvh_left : null;

                    while (left) {
                        current = left;
                        left = current._bvh_branch ? current._bvh_left : null;
                    }
                }

                const branch = current._bvh_branch;
                const min_x = current._bvh_min_x;
                const min_y = current._bvh_min_y;
                const max_x = current._bvh_max_x;
                const max_y = current._bvh_max_y;
                const right = branch ? current._bvh_right : null;

                context.moveTo(min_x, min_y);
                context.lineTo(max_x, min_y);
                context.lineTo(max_x, max_y);
                context.lineTo(min_x, max_y);
                context.lineTo(min_x, min_y);

                if (right) {
                    current = right;
                    traverse_left = true;
                } else {
                    let parent = current._bvh_parent;

                    if (parent) {
                        while (parent && parent._bvh_right === current) {
                            current = parent;
                            parent = current._bvh_parent;
                        }

                        current = parent;
                    } else {
                        break;
                    }
                }
            }
        }
    };

    // ============================================================================
    // ============================================================================

    /**
     * @class Circle :circle
     * @description A circle used to detect collisions
     */
    class Circle extends Body {
        /**
         * @constructor
         * @param {Number} [x = 0] The starting X coordinate
         * @param {Number} [y = 0] The starting Y coordinate
         * @param {Number} [radius = 0] The radius
         * @param {Number} [scale = 1] The scale
         * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
         */
        constructor(x = 0, y = 0, radius = 0, scale = 1, padding = 0) {
            super(x, y, padding);

            /**
             * @desc
             * @type {Number}
             */
            this.radius = radius;

            /**
             * @desc
             * @type {Number}
             */
            this.scale = scale;
        }

        /**
         * Draws the circle to a CanvasRenderingContext2D's current path
         * @param {CanvasRenderingContext2D} context The context to add the arc to
         */
        draw(context) {
            const x = this.x;
            const y = this.y;
            const radius = this.radius * this.scale;

            context.moveTo(x + radius, y);
            context.arc(x, y, radius, 0, Math.PI * 2);
        }
    };

    // ============================================================================
    // ============================================================================

    /**
     * @class Polygon :polygon
     * @description A polygon used to detect collisions
     */

    class Polygon extends Body {
        /**
         * @constructor
         * @param {Number} [x = 0] The starting X coordinate
         * @param {Number} [y = 0] The starting Y coordinate
         * @param {Array<Number[]>} [points = []] An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
         * @param {Number} [angle = 0] The starting rotation in radians
         * @param {Number} [scale_x = 1] The starting scale along the X axis
         * @param {Number} [scale_y = 1] The starting scale long the Y axis
         * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
         */
        constructor(x = 0, y = 0, points = [], angle = 0, scale_x = 1, scale_y = 1, padding = 0) {
            super(x, y, padding);

            /**
             * @desc The angle of the body in radians
             * @type {Number}
             */
            this.angle = angle;

            /**
             * @desc The scale of the body along the X axis
             * @type {Number}
             */
            this.scale_x = scale_x;

            /**
             * @desc The scale of the body along the Y axis
             * @type {Number}
             */
            this.scale_y = scale_y;


            /** @private */
            this._polygon = true;

            /** @private */
            this._x = x;

            /** @private */
            this._y = y;

            /** @private */
            this._angle = angle;

            /** @private */
            this._scale_x = scale_x;

            /** @private */
            this._scale_y = scale_y;

            /** @private */
            this._min_x = 0;

            /** @private */
            this._min_y = 0;

            /** @private */
            this._max_x = 0;

            /** @private */
            this._max_y = 0;

            /** @private */
            this._points = null;

            /** @private */
            this._coords = null;

            /** @private */
            this._edges = null;

            /** @private */
            this._normals = null;

            /** @private */
            this._dirty_coords = true;

            /** @private */
            this._dirty_normals = true;

            Polygon.prototype.setPoints.call(this, points);
        }

        /**
         * Draws the polygon to a CanvasRenderingContext2D's current path
         * @param {CanvasRenderingContext2D} context The context to add the shape to
         */
        draw(context) {
            if (
                this._dirty_coords ||
                this.x !== this._x ||
                this.y !== this._y ||
                this.angle !== this._angle ||
                this.scale_x !== this._scale_x ||
                this.scale_y !== this._scale_y
            ) {
                this._calculateCoords();
            }

            const coords = this._coords;

            if (coords.length === 2) {
                context.moveTo(coords[0], coords[1]);
                context.arc(coords[0], coords[1], 1, 0, Math.PI * 2);
            } else {
                context.moveTo(coords[0], coords[1]);

                for (let i = 2; i < coords.length; i += 2) {
                    context.lineTo(coords[i], coords[i + 1]);
                }

                if (coords.length > 4) {
                    context.lineTo(coords[0], coords[1]);
                }
            }
        }

        /**
         * Sets the points making up the polygon. It's important to use this function when changing the polygon's shape to ensure internal data is also updated.
         * @param {Array<Number[]>} new_points An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
         */
        setPoints(new_points) {
            const count = new_points.length;

            this._points = new Float64Array(count * 2);
            this._coords = new Float64Array(count * 2);
            this._edges = new Float64Array(count * 2);
            this._normals = new Float64Array(count * 2);

            const points = this._points;

            for (let i = 0, ix = 0, iy = 1; i < count; ++i, ix += 2, iy += 2) {
                const new_point = new_points[i];

                points[ix] = new_point[0];
                points[iy] = new_point[1];
            }

            this._dirty_coords = true;
        }

        /**
         * Calculates and caches the polygon's world coordinates based on its points, angle, and scale
         */
        _calculateCoords() {
            const x = this.x;
            const y = this.y;
            const angle = this.angle;
            const scale_x = this.scale_x;
            const scale_y = this.scale_y;
            const points = this._points;
            const coords = this._coords;
            const count = points.length;

            let min_x;
            let max_x;
            let min_y;
            let max_y;

            for (let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
                let coord_x = points[ix] * scale_x;
                let coord_y = points[iy] * scale_y;

                if (angle) {
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    const tmp_x = coord_x;
                    const tmp_y = coord_y;

                    coord_x = tmp_x * cos - tmp_y * sin;
                    coord_y = tmp_x * sin + tmp_y * cos;
                }

                coord_x += x;
                coord_y += y;

                coords[ix] = coord_x;
                coords[iy] = coord_y;

                if (ix === 0) {
                    min_x = max_x = coord_x;
                    min_y = max_y = coord_y;
                } else {
                    if (coord_x < min_x) {
                        min_x = coord_x;
                    } else if (coord_x > max_x) {
                        max_x = coord_x;
                    }

                    if (coord_y < min_y) {
                        min_y = coord_y;
                    } else if (coord_y > max_y) {
                        max_y = coord_y;
                    }
                }
            }

            this._x = x;
            this._y = y;
            this._angle = angle;
            this._scale_x = scale_x;
            this._scale_y = scale_y;
            this._min_x = min_x;
            this._min_y = min_y;
            this._max_x = max_x;
            this._max_y = max_y;
            this._dirty_coords = false;
            this._dirty_normals = true;
        }

        /**
         * Calculates the normals and edges of the polygon's sides
         */
        _calculateNormals() {
            const coords = this._coords;
            const edges = this._edges;
            const normals = this._normals;
            const count = coords.length;

            for (let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
                const next = ix + 2 < count ? ix + 2 : 0;
                const x = coords[next] - coords[ix];
                const y = coords[next + 1] - coords[iy];
                const length = x || y ? Math.sqrt(x * x + y * y) : 0;

                edges[ix] = x;
                edges[iy] = y;
                normals[ix] = length ? y / length : 0;
                normals[iy] = length ? -x / length : 0;
            }

            this._dirty_normals = false;
        }
    };

    // ============================================================================

    class Rectangle extends Polygon {
        /**
         * @constructor
         */
    }

    // ============================================================================

    /**
     * @description A point used to detect collisions
     * @class Point :point
     */

    class Point extends Polygon {
        /**
         * @constructor
         * @param {Number} [x = 0] The starting X coordinate
         * @param {Number} [y = 0] The starting Y coordinate
         * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
         */
        constructor(x = 0, y = 0, padding = 0) {
            super(x, y, [
                [0, 0]
            ], 0, 1, 1, padding);

            /** @private */
            this._point = true;
        }
    };



    Point.prototype.setPoints = undefined;

    // ============================================================================
    // ============================================================================

    /**
     * :collision
     * @description A collision system used to track bodies in order to improve 
     * collision detection performance
     * @class Collision
     */

    class Collisions {
        /**
         * @constructor
         */
        constructor() {
            /** @private */
            this._bvh = new BVH();
        }

        /**
         * Creates a {@link Circle} and inserts it into the collision system
         * @param {Number} [x = 0] The starting X coordinate
         * @param {Number} [y = 0] The starting Y coordinate
         * @param {Number} [radius = 0] The radius
         * @param {Number} [scale = 1] The scale
         * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
         * @returns {Circle}
         */
        createCircle(x = 0, y = 0, radius = 0, scale = 1, padding = 0) {
            const body = new Circle(x, y, radius, scale, padding);

            this._bvh.insert(body);

            return body;
        }

        /**
         * Creates a {@link Polygon} and inserts it into the collision system
         * @param {Number} [x = 0] The starting X coordinate
         * @param {Number} [y = 0] The starting Y coordinate
         * @param {Array<Number[]>} [points = []] An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
         * @param {Number} [angle = 0] The starting rotation in radians
         * @param {Number} [scale_x = 1] The starting scale along the X axis
         * @param {Number} [scale_y = 1] The starting scale long the Y axis
         * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
         * @returns {Polygon}
         */
        createPolygon(x = 0, y = 0, points = [
            [0, 0]
        ], angle = 0, scale_x = 1, scale_y = 1, padding = 0) {
            const body = new Polygon(x, y, points, angle, scale_x, scale_y, padding);

            this._bvh.insert(body);

            return body;
        }

        /**
         * Creates a {@link Point} and inserts it into the collision system
         * @param {Number} [x = 0] The starting X coordinate
         * @param {Number} [y = 0] The starting Y coordinate
         * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
         * @returns {Point}
         */
        createPoint(x = 0, y = 0, padding = 0) {
            const body = new Point(x, y, padding);

            this._bvh.insert(body);

            return body;
        }

        /**
         * Creates a {@link Polygon} in a rectangle shape and inserts it into the collision system
         * @param {Number} [x = 0]
         * @param {Number} [y = 0]
         * @param {Number} [width = 10]
         * @param {Number} [height = 10]
         * @param {Number} [angle = 0] The starting rotation in radians
         * @param {Number} [scale_x = 1] The starting scale along the X axis
         * @param {Number} [scale_y = 1] The starting scale long the Y axis
         * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
         * @returns {Polygon}
         */
        createRectangle(x = 0, y = 0, width = 10, height = 10, angle = 0, scale_x = 1, scale_y = 1, padding = 0) {
            const body = new Polygon(
                x, y,
                [
                    [-width, -height],
                    [width, -height],
                    [width, height],
                    [-width, height]
                ],
                angle, scale_x, scale_y, padding
            )
            body.width = width;
            body.height = height;
            this._bvh.insert(body);

            return body;
        }
        /**
         * Creates a {@link Result} used to collect the detailed results of a collision test
         */
        createResult() {
            return new Result();
        }

        /**
         * Creates a Result used to collect the detailed results of a collision test
         */
        static createResult() {
            return new Result();
        }

        /**
         * Inserts bodies into the collision system
         * @param {...Circle|...Polygon|...Point} bodies
         */
        insert(...bodies) {
            for (const body of bodies) {
                this._bvh.insert(body, false);
            }

            return this;
        }

        /**
         * Removes bodies from the collision system
         * @param {...Circle|...Polygon|...Point} bodies
         */
        remove(...bodies) {
            for (const body of bodies) {
                this._bvh.remove(body, false);
            }

            return this;
        }

        /**
         * Updates the collision system. This should be called before any collisions are tested.
         */
        update() {
            this._bvh.update();

            return this;
        }

        /**
         * Draws the bodies within the system to a CanvasRenderingContext2D's current path
         * @param {CanvasRenderingContext2D} context The context to draw to
         */
        draw(context) {
            return this._bvh.draw(context);
        }

        /**
         * Draws the system's BVH to a CanvasRenderingContext2D's current path. This is useful for testing out different padding values for bodies.
         * @param {CanvasRenderingContext2D} context The context to draw to
         */
        drawBVH(context) {
            return this._bvh.drawBVH(context);
        }

        /**
         * Returns a list of potential collisions for a body
         * @param {Circle|Polygon|Point} body The body to test for potential collisions against
         * @returns {Array<Body>}
         */
        potentials(body) {
            return this._bvh.potentials(body);
        }

        /**
         * Determines if two bodies are colliding
         * @param {Circle|Polygon|Point} target The target body to test against
         * @param {Result} [result = null] A Result object on which to store information about the collision
         * @param {Boolean} [aabb = true] Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
         * @returns {Boolean}
         */
        collides(source, target, result = null, aabb = true) {
            return SAT(source, target, result, aabb);
        }
    };

    // ============================================================================
    $.createCollision = function (system, kind, setup) {
        kind = kind.toLowerCase();
        var body = null;
        if (kind === "polygon") {
            body = system.createPolygon(
                setup.x || 0,
                setup.y || 0,
                [...setup.points],
                setup.angle || 0,
                setup.scale_x || 1,
                setup.scale_y || 1,
                setup.padding || 0
            )
            body.cachePoints = [...setup.points];


        } else if (kind === "circle") {
            body = system.createCircle(
                setup.x || 0,
                setup.y || 0,
                setup.radius || 8,
                setup.scale || 1,
                setup.padding || 0
            )
        } else if (kind === "rect") {
            body = system.createPolygon(
                setup.x || 0,
                setup.y || 0,
                [
                    [-setup.points[0], -setup.points[1]],
                    [setup.points[0], -setup.points[1]],
                    [setup.points[0], setup.points[1]],
                    [-setup.points[0], setup.points[1]]
                ],
                setup.angle || 0,
                setup.scale_x || 1,
                setup.scale_y || 1,
                setup.padding || 0
            )
            
            body.cachePoints = [...setup.points];
        }
        if (body !== null) body.floor = setup.floor || "base";
        if (body !== null) body.switch = setup.switch || -1;
        if (body !== null) body.linkto = setup.linkto || false;
        if (body !== null) body.linkKind = setup.linkKind || "horizontal";
        if (body !== null) body.playerLinked = false;
        print(setup)
        return body;
    }

    $.ysize = function (body) {
        if (body instanceof Circle) {
            return body.y + body.radius
        } 
    }
    // ============================================================================

    // to global 
    $.result = Result;
    $.Body = Body;
    $.Polygon = Polygon;
    $.Circle = Circle;
    $.Point = Point;
    $.BVH = BVH;
    $.BVHBranch = BVHBranch;
    $.System = new Collisions();
    $.Collision = Collisions;
    $.Floor = {
        0: "base",
        1: "under",
        2: "high",

        "base": 0,
        "under": 1,
        "high": 2
    }
    $.FloorColor = {
        "base": "0xFF0000",
        "under": "0x0000FF",
        "high": "0x00FF00"
    }

    // print
    print("Haya :: Collision", $);
})(Haya.Collision);
// ================================================================================
/**
 * @field Movement
 */
// ================================================================================
(function ($) {
    'use strict';
    // ============================================================================
    $.setup = Haya.File.json(Haya.File.local("data/immersion/movement.json"));
    $.data = {};
    $.bounce = 0.9;
    $.refreshFloor = {
        value: 0,
        duration: 20
    }
    /**
     * @description reference for 'pos' number
     * @default 0 center-bottom
     * @default 1 center
     * @default 2 center-top
     */

    /**
     * @function defaultCollisionBody
     * @description this is the default collision body for every body
     */
    function defaultCollisionBody(parent) {
        let width = 13;
        let height = 16;
        var body = new Haya.Collision.Polygon(
            0, 0,
            [
                [-width, -height],
                [width, -height],
                [width, height],
                [-width, height]
            ]
        )
        body.width = width;
        body.height = height;
        body.label = "object";
        body.pos = 0;
        body.parent = parent;
        return body;
    }

    /**
     * @function setStateBody
     * @description set the collision body following the state
     */
    Haya.Movement.setStateBody = function (data, parent) {
        var body = null;
        data.type = Haya.Utils.Object.hasProperty(data, "type", "rect");

        // type of body
        if (data.type === "circle") {
            data.pos = Haya.Utils.Object.hasProperty(data, "pos", 0);
            data.radius = Haya.Utils.Object.hasProperty(data, "radius", 12);
            //body = $.collision.createCircle(0, 0, data.radius);

            if ($.collision === undefined || $.collision === null) {
                body = new Haya.Collision.Circle(
                    0, 0,
                    data.radius
                )
            } else {
                body = $.collision.createCircle(0, 0, data.radius);
            }

            body.pos = data.pos;
        } else if (data.type === "rect") {
            data.pos = Haya.Utils.Object.hasProperty(data, "pos", 0);
            data.width = data.width || 12;
            data.height = Haya.Utils.Object.hasProperty(data, "height", 16);

            if ($.collision === undefined || $.collision === null) {
                body = new Haya.Collision.Polygon(
                    0, 0,
                    [
                        [-data.width, -data.height],
                        [data.width, -data.height],
                        [data.width, data.height],
                        [-data.width, data.height]
                    ]
                )
            } else {
                body = $.collision.createRectangle(0, 0, data.width, data.height);
            }

            body.pos = data.pos;
        }

        // return
        body.label = "object";
        body.parent = parent;
        return body;
    }
    // ============================================================================
    /**
     * @function Game_CharacterBase
     * @description the base for all object class
     */

    var Alias_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function () {
        this.label = null;
        Alias_Game_CharacterBase_initMembers.call(this);
        // [animation] | handles with the animation
        this.animation = {
            lastState: {},
            state: {
                jumping: 0,
                dashing: 0,
                moving: 0,
                idle: 0
            },
            idling: true,
            get: "idle",
            override: -1,
            x: -1,
            y: -1,
            rect: new PIXI.Rectangle(0, 0, 1, 1),
            data: null,
            collisionState: null
        }

        // [collision]
        this._collision = {
            body: null,//defaultCollisionBody(this),
            state: "general",
            _x: -1,
            _y: -1,
            _action: null
        }

        // [camera]
        this._difX = 0;
        this._difY = 0;

        // [z position for audio and so on]
        this.z = 0;

        // [flooor]
        this.floor = "base";
        this.pfloor = "base";
        this.wfloor = null;

        // [cacheMoveSpeed] : 
        this._cacheMoveSpeed = this._moveSpeed;


    };

    Game_CharacterBase.prototype.isCollision = function () {
        return ( (this._collision.body) && (this._collision.body.y) )
    }

    Game_CharacterBase.prototype.refreshCollisionBody = function () {

        //console.log('refresh collision body', this.animation.data);
        

        if (Haya.Utils.isObject(this.animation.data)) {

            if (this.animation.data.hasOwnProperty("collision")) {
                if (this.animation.collisionState !== this._collision.state) {
                    this._collision.body = Haya.Movement.setStateBody(
                        this.animation.data.collision[this._collision.state],
                        this
                    )
                    this._collision.body.label = this.label || "object"
                    this.animation.collisionState = this._collision.state;
                    print("refresh collision body", this._collision.body, this.animation.data)
                }

            }

            return true;
        }


        return false;

    }

    Game_CharacterBase.prototype.updateMove = function () {
        //print(this._x, this._realX, 'x', '\t', this._y, this._realY, 'y')


        if (this._x < this._realX) {
            this._realX = Math.max(this._realX - this.distancePerFrame(), this._x);
        }
        if (this._x > this._realX) {
            this._realX = Math.min(this._realX + this.distancePerFrame(), this._x);
        }
        if (this._y < this._realY) {
            this._realY = Math.max(this._realY - this.distancePerFrame(), this._y);
        }
        if (this._y > this._realY) {
            this._realY = Math.min(this._realY + this.distancePerFrame(), this._y);
        }
        //print(this._x, this._realX, 'x', '\t', this._y, this._realY, 'y')

        if (!this.isMoving()) {
            this.refreshBushDepth();
        }
    };

    Game_CharacterBase.prototype.isMoving = function () {
        return this._realX !== this._x || this._realY !== this._y;
    };

    Game_CharacterBase.prototype.distancePerFrame = function () {
        return (Math.pow(2, this.realMoveSpeed()) / 256);
    };

    Game_CharacterBase.prototype.updateAnimationCount = function () {
        if (this.isMoving() && this.hasWalkAnime()) {
            this._animationCount += 2; //1.5
        } else if (this.hasStepAnime() || !this.isOriginalPattern()) {
            this._animationCount++;
        }
    };

    Game_CharacterBase.prototype.canPass = function (x, y, d) {
        return true;
    };

    Game_CharacterBase.prototype.canPassDiagonally = function (x, y, horz, vert) {
        return true;
    };

    Game_CharacterBase.prototype.isMapPassable = function (x, y, d) {
        return true;
    };

    Game_CharacterBase.prototype.isCollidedWithCharacters = function (x, y) {
        return false;
    };

    Game_CharacterBase.prototype.isCollidedWithEvents = function (x, y) {
        return false;
    };

    Game_CharacterBase.prototype.setPosition = function (x, y) {
        x *= 6;
        y *= 6;
        this._x = Math.round(x);
        this._y = Math.round(y);
        this._realX = x;
        this._realY = y;
        console.log(x, y, this._x, this._y);
        
    };

    Game_CharacterBase.prototype.scrolledX = function () {
        return $gameMap.adjustX(this._realX);
    };

    Game_CharacterBase.prototype.scrolledY = function () {
        return $gameMap.adjustY(this._realY);
    };

    Game_CharacterBase.prototype.screenX = function () {
        var tw = $gameMap.tileWidth();
        return Math.round(this.scrolledX() * tw + tw / 2);
    };

    Game_CharacterBase.prototype.screenY = function () {
        var th = $gameMap.tileHeight();
        return Math.round(this.scrolledY() * th + th -
            this.shiftY() - this.jumpHeight());
    };

    Game_CharacterBase.prototype.moveStraight = function (d) {
        this.setMovementSuccess(this.canPass(this._x, this._y, d));
        if (this.isMovementSucceeded()) {
            this.setDirection(d);
            this._x = $gameMap.roundXWithDirection(this._x, d);
            this._y = $gameMap.roundYWithDirection(this._y, d);
            this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
            this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
            this.increaseSteps();
        } else {
            this.setDirection(d);
            this.checkEventTriggerTouchFront(d);
        }
    };
    // ============================================================================
    /**
     * @function Game_Character
     * @description The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.
     */

    var Alias_Game_Character_update = Game_Character.prototype.update;
    Game_Character.prototype.update = function () {
        Alias_Game_Character_update.call(this);
        // if (this.isMoving()) {
        //     this.updateCollisionPosition();
        // }
    }

    Game_Character.prototype.updateCollisionPosition = function () {

        if (this._collision.body.pos === 0) { // center-bottom
            // if it is a Polygon
            if (this._collision.body instanceof Haya.Collision.Polygon) {
                this._collision.body.x = this.screenX() - (this._collision.body.height / 2);
                this._collision.body.y = this.screenY() - (this._collision.body.height);
                return;
                // if it is a Circle
            } else if (this._collision.body instanceof Haya.Collision.Circle) {
                this._collision.body.x = (this.screenX());
                this._collision.body.y = (this.screenY()) - (this._collision.body.radius);
                return;
            }
        } else {
            this._collision.body.x = -(Graphics.width * 2);
            this._collision.body.y = -(Graphics.height * 2);
        }

    }

    Game_Character.prototype.animationStateUpdate = function () {
        // state update
        this.animation.idling = true;
        if (this.isMoving()) {
            this.animation.state.moving++;
            this.animation.idling = false;
        } else {
            this.animation.state.moving = 0;
        }
        // idle?
        if (this.animation.idling) {
            this.animation.state.idle++;
        } else {
            this.animation.state.idle = 0;
        }
    }

    Game_Character.prototype.animationStateGet = function () {
        if (this.animation.state.moving > 0) return "moving";
        if (this.animation.state.idle > 0) return "idle";
    }
    // ============================================================================
    /**
     * @function Game_Player
     * @description the class of the player
     */

    Game_Player.prototype.collisionAction = function (wall) {
        //if (wall.parent === undefined || wall.parent === null) return;
        // if the wall is a object
        if (wall.parent instanceof Game_Event) {
            // (_trigger: 0) -> trigger key
            if (Input.isTriggered('ok') && wall.parent._trigger === 0) {
                // wall.parent.start();
                this._collision._action = wall.parent;
                return;
            }
            // (_trigger: 1) -> player collides
            if (wall.parent._trigger === 1) {
                // wall.parent.start();
                this._collision._action = wall.parent;
                return;
            }
            // (_trigger: 2) -> event collides
            // (_trigger: 3) -> automatic
            // (_trigger: 4) -> parallel
        }
    }

    Game_Player.prototype.triggerAction = function () {
        return false;
    };

    Game_Player.prototype.refresh = function () {
        this.animation = {
            lastState: {},
            state: {
                jumping: 0,
                dashing: 0,
                moving: 0,
                idle: 0
            },
            idling: true,
            get: "idle",
            override: -1,
            x: -1,
            y: -1,
            rect: new PIXI.Rectangle(0, 0, 1, 1),
            data: null,
            collisionState: null
        }

        // [collision]
        this._collision = {
            body: defaultCollisionBody(this),
            state: "general",
            _x: -1,
            _y: -1,
            _action: null
        }
        var actor = $gameParty.leader();
        var characterName = actor ? actor.characterName() : '';
        var characterIndex = actor ? actor.characterIndex() : 0;
        this.setImage(characterName, characterIndex);
        this._followers.refresh();
    };

    Game_Player.prototype.reserveTransfer = function(mapId, x, y, d, fadeType) {
        this._transferring = true;
        this._newMapId = mapId;
        this._newX = x;
        this._newY = y;
        this._newDirection = d;
        this._fadeType = fadeType;

        //console.log('transferring', this);
        
    };
    // ============================================================================
    /**
     * @function Game_Event
     * @description the class of the event
     */

    var Alias_Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function (mapId, eventId) {
        Alias_Game_Event_initialize.call(this, mapId, eventId);
        this.name = this.event()["name"];
        this.note = this.event()["note"];
        this.label = 'object';
        // start-up notes
        this.setupNote();
    };

    var Alias_Game_Event_initMembers = Game_Event.prototype.initMembers;
    Game_Event.prototype.initMembers = function () {
        Alias_Game_Event_initMembers.call(this);
        this._collideWithPlayer = false;
    };

    Game_Event.prototype.isCollidedWithPlayerCharacters = function (x, y) {
        return this._collideWithPlayer;
    };

    Game_Event.prototype.setupNote = function () {
        // [y]
        if (/(\-)?(\d+)(yp)/gim.test(this.note)) {
            let y = /(\-)?(\d+)(yp)/gim.exec(this.note)
            this._realY += (y[2]) * (y[1] === "-" ? -1 : 1)
            this._y += (y[2]) * (y[1] === "-" ? -1 : 1)
        }

        // [x]
        if (/(\-)?(\d+)(xp)/gim.test(this.note)) {
            let x = /(\-)?(\d+)(xp)/gim.exec(this.note)
            this._realX += (x[2]) * (x[1] === "-" ? -1 : 1)
            this._x += (x[2]) * (x[1] === "-" ? -1 : 1)
        }


        // [label]
        if (/\#(\w+)\#/gmi.test(this.note)) {
            this.label = /\#(\w+)\#/gmi.exec(this.note)[1]
        }

    };

    // ============================================================================
    /**
     * @function Sprite_Character
     * @description changes for movement
     */

    var Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
    Sprite_Character.prototype.initMembers = function () {
        // [animation]
        this.animation = {
            // direction
            direction: 0,
            //
            stop: null,
            // frame kind 
            type: "moving",
            // bitmap
            bitmap: "main",
            // loop:
            loop: true,
            // speed
            speed: 1,
            // state
            state: 0,
            // current
            current: null,
            // frame count
            frame: 0,
            // frame split
            _frames: [],
            // rect
            rect: new PIXI.Rectangle(0, 0, 0, 0),
            frect: null,
            // default?
            isDefault: true
        }
        this._refreshImage = true;
        Sprite_Character_initMembers.call(this);
    };

    var Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function () {
        this.updateMovementState();
        Sprite_Character_update.call(this);
    };

    Sprite_Character.prototype.updateBitmap = function () {
        if (this.isImageChanged()) {
            this._characterName = this._character.characterName();
            this._characterIndex = this._character.characterIndex();
            this.setCharacterBitmap();
            this._refreshImage = false;
        }
    };

    Sprite_Character.prototype.updateMovementState = function () {
        if (this._character.animation.data && this.animation.isDefault === false) {
            // update states
            this._character.animationStateUpdate();
            let param = this._character.animationStateGet();
            // param
            if (param === "moving") {
                // if the direction is different
                if (this.animation.direction !== this._character.direction()) {
                    this.animation.current = this._character.animation.data.frame["moving"];
                    this.animation._frames = this.animation.current.frames[this._character.direction()];
                    this.animation.frame = 0;
                    this.animation.stop = null;
                    this.animation.direction = this._character.direction()
                } else {
                    if (Input._dir4 > 0) {
                        if (this.animation.frame > this.animation._frames.length - 1) {
                            this.animation.frame = 0;
                            this.animation.stop = null;
                        }
                    } else {
                        if (this.animation.frame > this.animation._frames.length - 1) {
                            this.animation.frame = 0;
                            this.animation.stop = null;
                        }
                    }
                }
            } else if (param === "idle") {
                // if the direction is different
                if (this.animation.direction !== this._character.direction()) {
                    this.animation.current = this._character.animation.data.frame["idle"];
                    this.animation._frames = this.animation.current.frames[this._character.direction()];
                    this.animation.frame = 0;
                    this.animation.stop = null;
                    this.animation.direction = this._character.direction()
                }
            }
        }
    }

    //var Sprite_Character_updateFrame = Sprite_Character.prototype.updateFrame;
    Sprite_Character.prototype.updateFrame = function () {


        if (this._character.animation.data && this.animation.current && this.animation.isDefault === false) {
            // [frame rate]
            let frameRate = this.animation.current.rate * this.animation.speed;
            this.animation.frame = (this.animation.frame) + (frameRate) / 60; // frame per second

            // [loop & end & stop]
            if (this.animation.frame >= this.animation._frames.length) {
                // if there is loop
                if (this.animation.current.loop) {
                    this.animation.frame = this.animation.frame % (this.animation._frames.length);
                } else {
                    this.animation.stop = this.animation.current.hasOwnProperty("stop") ? this.animation.current.stop : null;
                    this.animation.frame = this.animation._frames.length - 1;
                }
            }
            // [frame split]
            let frame = this.animation._frames[(this.animation.stop !== null) ? this.animation.stop : (this.animation.frame | 0)];
            if (this._data.isDefault === true && this.bitmap.width !== 0) {
                this.animation.current.width = Math.round(this.bitmap.width / 4);
                this.animation.current.height = Math.round(this.bitmap.height / 4);
            }
            this.animation.rect.height = (this.animation.current.height);
            this.animation.rect.width = (this.animation.current.width);
            this.animation.rect.y = (frame[1] * this.animation.rect.height);
            this.animation.rect.x = (Math.abs(frame[0] - 1) * this.animation.rect.width);
            // [set frame]
            this.setFrame(this.animation.rect.x, this.animation.rect.y, this.animation.rect.width, this.animation.rect.height)
        } else {
            //Sprite_Character_updateFrame.call(this);
            this.updateCharacterFrame();
        }
    }

    Sprite_Character.prototype.updateCharacterFrame = function () {
        var pw = this.patternWidth();
        var ph = this.patternHeight();
        var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
        var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
        this.setFrame(sx, sy, pw, ph);
    };

    Sprite_Character.prototype.characterBlockX = function () {

        var index = this._character.characterIndex();
        return index % 4;

    };

    Sprite_Character.prototype.characterBlockY = function () {
        var index = this._character.characterIndex();
        return Math.floor(index / 4) * 4;
    };

    Sprite_Character.prototype.characterPatternX = function () {
        return this._character.pattern();
    };

    Sprite_Character.prototype.characterPatternY = function () {
        return (this._character.direction() - 2) / 2;
    };

    Sprite_Character.prototype.patternWidth = function () {
        return this.bitmap.width / 4;
    };

    Sprite_Character.prototype.patternHeight = function () {
        return this.bitmap.height / 4;
    };

    Sprite_Character.prototype.setCharacterBitmap = function () {
        if (this._characterName === "" || (Haya.File.exist("img/characters/" + this._characterName + ".png")) === false) {
            this.bitmap = ImageManager.loadCharacter(null);
            this._data = Haya.File.json(Haya.File.local("img/characters/default.json"))
            this.animation.isDefault = true;
            this._character.animation.data = this._data;
            this._character.refreshCollisionBody();
            this._character.updateCollisionPosition();
            return;
        } else {
            //print(this);
            if (this.normal === true) {
                this.bitmap = ImageManager.loadCharacter("!" + this._characterName);
            } else {
                this.bitmap = ImageManager.loadCharacter(this._characterName);
            }
            // check out if there is a personal setup
            let characterSetup = "";
            if (this._characterName.match(/\.png$/gi)) {
                characterSetup = this._characterName.replace(".png", ".json")
            } else {
                characterSetup = this._characterName + ".json";
            }

            if (Haya.File.exist("img/characters/" + characterSetup)) {
                this._data = Haya.File.json(Haya.File.local("img/characters/" + characterSetup));
                this.animation.isDefault = false;
            } else {
                this._data = Haya.File.json(Haya.File.local("img/characters/default.json"))
                this.animation.isDefault = true;
            }
            // animation data
            this._character.animation.data = this._data;
            this._character.refreshCollisionBody();
            this._character.updateCollisionPosition();

            // print("setCharacterBitmap", this._character)
        }
    };

    // ============================================================================
    /**
     * @function Scene_Map
     * @description handle with collision update
     */



    var Scene_Map_Collision_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function () {
        this.collision = {
            source: {},
            element: []
        }
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
        //print($.collision, 'collision element')

        Scene_Map_Collision_createDisplayObjects.call(this);

    };


    var Scene_Map_Collision_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        Scene_Map_Collision_update.call(this);
        this.collisionUpdate();
    };

    Scene_Map.prototype.collisionUpdate = function () {
        //Haya.Collision.System.update();
        $.collision.update();
        if (($gamePlayer.isMoving()) && !$gamePlayer.isTransferring()) {
            this.playerCollision();
        }

        $gameMap.events().map(event => {
            if ((event.isMoving()) && event.isCollision()) {
                event.updateCollisionPosition();
                if (event.label === "object") this.eventCollision(event);
            }
        });
    }

    Scene_Map.prototype.playerCollision = function () {
        if ($gamePlayer._collision.body === null || $gamePlayer._collision.body === undefined) return;
        if ($.refreshFloor.value > 1) {
            $.refreshFloor.value--
        };
        $gamePlayer.updateCollisionPosition();
        // check out all available collisions
        const player_potentials = $gamePlayer._collision.body.potentials();
        //$.data.collision.base.boucing
        //$.data.collision.base.space

        for (const wall of player_potentials) {
            if (wall.linkto === false && wall.floor !== $gamePlayer.floor) continue;
            if (wall.switch > -1 && $gameSwitches.value(wall.switch) === true) continue;
            if (wall.label === "object") $gamePlayer.collisionAction(wall);
            // check out the collision and if is colliding;
            if ($gamePlayer._collision.body.collides(wall, $.result)) {
                if ($.refreshFloor.value < 2) {
                    if (wall.playerLinked === true) {
                        $gamePlayer.floor = $gamePlayer.pfloor

                        if (wall.linkKind === "horizontal") {
                            if ($gamePlayer._direction === 8) {
                                $gamePlayer._y -= 4 * $.result.overlap
                            } else if ($gamePlayer._direction === 2) {
                                $gamePlayer._y += 4 * $.result.overlap
                            }
                        };
                        if (wall.linkKind === "vertical") $gamePlayer._x += 4 * $.result.overlap;
                        if ($gamePlayer.floor === $gamePlayer.pfloor) {
                            wall.playerLinked = false
                            $.refreshFloor.value = $.refreshFloor.duration;
                            this._spriteset.refreshSprite();
                        };
                        continue
                    } else if (wall.linkto === true && wall.playerLinked === false) {
                        $gamePlayer.floor = wall.floor
                        if (wall.linkKind === "horizontal") {
                            if ($gamePlayer._direction === 8) {
                                $gamePlayer._y -= 4 * $.result.overlap
                            } else if ($gamePlayer._direction === 2) {
                                $gamePlayer._y += 4 * $.result.overlap
                            }
                        };
                        if (wall.linkKind === "vertical") $gamePlayer._x -= 4 * $.result.overlap;
                        if ($gamePlayer.floor === wall.floor) {
                            wall.playerLinked = true
                            $.refreshFloor.value = $.refreshFloor.duration;
                            this._spriteset.refreshSprite();
                        };
                        continue;
                    }
                } else {
                    continue;
                }

                if (wall.label === "object" && wall.parent._through === true) continue;
                // push against the wall
                let overlaping_x = ($.result.overlap * $.result.overlap_x);
                let overlaping_y = ($.result.overlap * $.result.overlap_y);
                $gamePlayer._x -= overlaping_x;
                $gamePlayer._y -= overlaping_y;

                // action;
                if (wall.label === "object") $gamePlayer.collisionAction(wall);

                $gamePlayer._x += $.bounce * $.result.overlap_x;
                $gamePlayer._y += $.bounce * $.result.overlap_y;
            }
        }
        // restore the original move speed 
        if ($gamePlayer._moveSpeed !== $gamePlayer._cacheMoveSpeed) {
            $gamePlayer._moveSpeed = $gamePlayer._cacheMoveSpeed
        }

        // there is a action (?)
        if ($gamePlayer._collision._action !== null) {
            // if is function
            $gamePlayer._collision._action.start();
            print($gamePlayer._collision._action, 'action')
            // break action
            $gamePlayer._collision._action = null;
        }
    }

    // Scene_Map.prototype.eventCollision = function (event) {

    // }


    Scene_Map.prototype.eventCollision = function (event) {
        // check out all available collisions
        const event_potentials = event._collision.body.potentials();

        //$.data.collision.base.boucing
        //$.data.collision.base.space

        for (const wall of event_potentials) {
            //if (wall.floor !== event._collision.body.floor) continue;
            //if (wall.switch > -1 && $gameSwitches.value(wall.switch) === true) continue;
            // check out the collision and if is colliding;
            if (event._collision.body.collides(wall, $.result)) {
                
                // push against the wall
                let overlaping_x = ($.result.overlap * $.result.overlap_x);
                let overlaping_y = ($.result.overlap * $.result.overlap_y);
                event._x -= overlaping_x;
                event._y -= overlaping_y;

                // speed up
                event._moveSpeed = (event._cacheMoveSpeed * $.result.overlap);

                // the difference between the original position with the position when pushed against the wall
                event._x += $.bounce * $.result.overlap_x
                event._y += $.bounce * $.result.overlap_y
            }
        }
        // restore the original move speed 
        if (event._moveSpeed != event._cacheMoveSpeed) {
            event._moveSpeed = event._cacheMoveSpeed
        }

    }

    // ============================================================================

})(Haya.Movement);
// ================================================================================
Imported["Haya - Collision"] = true;
Imported["Haya - Movement"] = true;