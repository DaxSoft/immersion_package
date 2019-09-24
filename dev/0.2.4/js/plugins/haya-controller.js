'use strict';
/**
 * @file [haya-controller.js -> Haya Controller]
 * Controller of elements 
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.5
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * =====================================================================
 * 
 */

var Haya = Haya || {};
Haya.Controller = {};

/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.1] Controller for elements
 * 
 * @help This plugin is used to control the elements to 
 * function like updates and so on. This is used to 
 * increase the performace.
 * Important: Insert this plugin after haya-components
 */

void

function ($) {

    // |-------------------------------------------------------------------------------- 
    // | [Configure]
    // |-------------------------------------------------------------------------------- 

    $._updates = [] // store all elements to update on the 'update' of the scene.

    // |-------------------------------------------------------------------------------- 
    // | [Updator]
    // | Class to manage all elements that needs to be updated 
    // |-------------------------------------------------------------------------------- 

    class Updator {

        /**
         * @constructor
         * Initialize the variables of the instance
         */

        constructor() {

            // hold-on the elements to update by following the stacks 'group of elements'
            // such as 'lights', 'particles'
            this._stack = {};

            // refresh the elements of the updator
            this._refresh = false;
        }

        /**
         * @function create 
         * List all elements inside the 'Haya.Controller._updates'
         * @returns {Updator}
         */
        create() {
            Haya.Controller._updates.length = 0;
            // has?
            if (this.groups().length > 0) {

                // interact
                this.groups().map(name => {

                    // group
                    const group = this._stack[name];

                    // get elements
                    Haya.Controller._updates = [...Haya.Controller._updates, group.elements]
                })

                // // priority
                // Haya.Controller._updates.sort((a, b) => {
                //     return 
                // })

            }

            return this;
        }

        /**
         * @function groups 
         * Returns a list of all groups name
         */

        groups() {
            return Object.keys(this._stack)
        }

        /**
         * @function has 
         * Check out if the group already exists
         * @param {String} [name] name of the group
         * @returns {Boolean}
         */
        has(name) {
            return this._stack.hasOwnProperty(name);
        }

        /**
         * @function onLimit
         * Check out if the group is already on limit
         * @param {*} name name of the group
         * @returns {Boolean}
         */
        onLimit(name) {
            return this._stack[name].elements.length >= this._stack[name].limit
        }

        /**
         * @function set 
         * Add a new 'stack' into the manager
         * @param {String} [name] name of the group, goes to 'this._stack[name]'
         * @param {Object} [setup] define the roles of the group
         * @param {Array} [setup.elements=[]] elements that will be updated
         * @param {Function} [setup.validator=null] function to valid out if the element 
         * will be updated or not
         * @param {Number} [setup.limit=50] limit of elements per updates box
         * @param {Number} [setup.delay=null] set the fps delay that the updates will take on
         * @param {String} [setup.method=update] invokes the method to update the element
         * @param {Number} [setup.priority=0] 
         * @returns {Updator}
         */
        set(name, setup = {}) {

            if (!(this.has(name))) {

                this._stack[name] = Object.assign({
                    elements: [],
                    validator: null,
                    limit: 50,
                    delay: null,
                    method: 'update',
                    priority: 0
                }, setup)

                this._refresh = true;
            }

            return this;
        }

        /**
         * @function attach
         * Attach a new element over a group
         * @param {String} [name] name of the group
         * @param {Object} [element] element that will be added
         * @returns {Updator}
         */
        attach(name, element) {

            if (this.has(name) && !(this.onLimit(name))) {
                element._controller_group = this._stack[name];
                this._stack[name].elements = [...this._stack[name].elements, element]
                this._refresh = true;
            }

            return this;
        }

        /**
         * @function expel
         * Removes an element/elements from a group
         * @param {String} [name]
         * @param {Function} roles function that goes on 'filter' method
         * from the array. It will remove any element that matches this function.
         * It needs to return a {boolean} value
         * @example
         * // removes any element with the name that starts with 'x'
         * Haya.Controller.updator.expel('particles', (element) => /^x/.test(element.name))
         * @returns {Updator}
         */
        expel(name, roles) {

            if (this.has(name)) {
                this._stack[name] = [...this._stack[name].filter(element => !(roles.call(this, element)))]
                this._refresh = true;
            }

            return this;
        }

        /**
         * @function update 
         * Call out this function over the 'update()' function on the Scene
         */
        update() {

            // check out if needs a refresh
            if (this._refresh === true) {
                this.create()
            }

            Haya.Controller._updates.map(element => {

                if (element.hasOwnProperty(element._controller_group.method)) {
                    element[element._controller_group.method]();
                }

            })
        }
    }

    // |-------------------------------------------------------------------------------- 
    // | [Haya.Controller.updator]
    // | Initialize the manager and add standard groups
    // |-------------------------------------------------------------------------------- 

    $.updator = new Updator()
        .set('particles', {
            validator: function (element) {
                return element.isOkay()
            }
        })

}(Haya.Controller);