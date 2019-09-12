'use strict';
var El = {
    CSS: {}
};
/**
 * @file [haya-el.js -> Haya EL]
 * This plugin is useful to create components of HTML Elements
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.5
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * =====================================================================
 * 
 */

/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.5] Essential methods to create HTML Elements
 * 
 * @help
 * Important: Insert this plugin after the haya-core
 */

/**
 * @description methods to work with document elements
 */
void

function (element) {
    // =================================================================================
    /**
     * @function id
     * @description get the element from his ID
     * @param {String} [id] id to search
     * @param {Function} [fallback] if not find, calls a function with the id as param,
     * then return back to the function as callback. Use this to create the element.
     * @returns {HTMLElement}
     */
    element.id = function (el, fallback = null) {
        if (el instanceof HTMLElement) return el;
        const element = document.getElementById(String(el))
        if (!element && Haya.Utils.isFunction(fallback)) {
            fallback.call(this, el);
            //element.id(el);
        }
        return element;
    }
    /**
     * @function is 
     * @description check if the object is HTMLELement
     * @returns {Boolean}
     */
    element.is = function (el) {
        return (el instanceof HTMLElement);
    }
    /**
     * @function create 
     * @description create a element 
     * @param {String} [tagName]
     * @param {HTMLElement} [parent] 
     * @returns {HTMLElement}
     */
    element.create = function (tagName, parent) {
        const element = document.createElement(tagName);
        if (parent instanceof HTMLElement) parent.appendChild(element);
        return element;
    }
    /**
     * @function Attr
     * @description allows you to set multiple attributes 
     * @param {String|HTMLElement} el string search by id 
     * @param {Object} attributes[attr_name: value]
     * @returns {HTMLElement}
     * @example 
     * El.Attr("img", { "src": "../test.png" })
     */
    element.Attr = function (el, attributes) {
        el = element.id(el);
        let keys;
        for (keys in attributes) {
            el.setAttribute(keys, attributes[keys]);
        }
        return el;
    }
    /**
     * @function removeClass
     * @param {String|HTMLElement} el element
     * @param {String} className
     * @description remove class from the element | this is a alternative to 'toggle'
     * @returns {HTMLElement}
     */
    element.removeClass = function (el, className) {
        // el = element.id(el);
        // el.setAttribute("class", ((el.className.split(" ")).filter((value) => value !== className)).join(" "))
        // return el;
        element.id(el).classList.remove(className);
    }
    /**
     * @function addClass
     * @param {String|HTMLElement} el element
     * @param {String} className
     * @returns {HTMLElement}
     */
    element.addClass = function (el, className) {
        // el = element.id(el);
        // var classList = el.className.split(" ");
        // if (classList.indexOf(className) === true) return el;
        // position ? classList.push(className) : classList.unshift(className);
        // el.setAttribute("class", classList.join(" "));
        // return el;
        element.id(el).classList.add(className)
    }
    /**
     * @function toggleClass
     * @param {String|HTMLElement} el element
     * @param {String} className
     * @description toggle the class into the element. If exist, removes; if not exist, add.
     * @returns {HTMLElement}
     */
    element.toggleClass = function (el, className) {
        el = element.id(el);
        el.classList.toggle(className);
        return el;
    }
    /**
     * @function El.removeChildren
     * @param {String|HTMLElement} el element
     * @description remove the childrens of a element
     */
    element.removeChild = function (el) {
        el = element.id(el);
        if (el.children.length > 0) {
            let i = el.children.length;
            while (i--) {
                el.removeChild(el.children.item(i));
            }
        }
    }
    /**
     * @function El.interactChild
     * @param {String|HTMLElement} el element
     */
    element.interactChild = function (el, callback) {
        el = element.id(el);
        if (el.children.length > 0) {
            let i = el.children.length;
            while (i--) {
                callback.call(this, el.children.item(i), i);
            }
        }
    }
    /**
     * @function getRoot 
     * @description get a value from root
     * @param {String} [variable]
     * @param {String|HTMLElement} [el=document.body]
     */
    element.getRoot = function (variable, el = document.body) {
        return getComputedStyle(el).getPropertyValue(variable)
    }
}(El);

/**
 * @description some CSS styles
 */

void 

function (css) {
    /**
     * @function id 
     */
    css.id = function (eid, styles) {
        El.id(eid).style = styles;
    }
}(El.CSS);