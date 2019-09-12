/**
 * @file [haya.js -> Haya Core]
 * This plugin is useful for making some stuffs more easy. 
 * There are several classes, methods and so on.
 * Special thanks for Fehu (Alisson)
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.3.8
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * =====================================================================
 * 
 */

/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.3.6] Essential core for my plugins to MV. 
 * 
 * @help
 * Important: Insert this plugin before every Haya plugin on the list.
 * Or, every plugin that need this Core.
 */
var Imported = Imported || new Object();
var Haya = new Object();
/**
 * @description more key
 */
Input.keyMapper = Object.assign({
    9: 'tab', // tab
    13: 'ok', // enter
    16: 'shift', // shift
    17: 'control', // control
    18: 'control', // alt
    27: 'escape', // escape
    32: 'ok', // space
    33: 'pageup', // pageup
    34: 'pagedown', // pagedown
    37: 'left', // left arrow
    38: 'up', // up arrow
    39: 'right', // right arrow
    40: 'down', // down arrow
    45: 'escape', // insert
    81: 'pageup', // Q
    87: 'pagedown', // W
    88: 'escape', // X
    90: 'ok', // Z
    96: 'escape', // numpad 0
    98: 'down', // numpad 2
    100: 'left', // numpad 4
    102: 'right', // numpad 6
    104: 'up', // numpad 8
    120: 'debug', // F9,
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    90: 'z',
    89: 'x',
    89: 'y',
    82: 'r',
    83: 's',
    49: '1',
    50: '2',
    51: '3'
}, Input.keyMapper);
// =================================================================================
// [Global function] :global
// =================================================================================
function print(...value) {
    console.log(...value)
};
// =================================================================================
// [Number: extension] :number
// =================================================================================
// isBetween
if (typeof Number.prototype.isBetween === 'undefined') {
    /**
     * @desc Check out if the value is between 'min' and 'max'
     * @param {number} min minumum value 
     * @param {number} max maximum value
     * @param {boolean} equalNo default is false
     *  [true] will check based on '<' and '>'
     *  [false] will check based on '<=' and '>='
     * @return {boolean}
     */
    Number.prototype.isBetween = function (min, max, equalNo) {
        var _isBetween = false;
        if (equalNo) {
            if ((this < max) && (this > min))
                _isBetween = true;
        } else {
            if ((this <= max) && (this >= min))
                _isBetween = true;
        }
        return _isBetween;
    }
};
// isOdd
if (typeof Number.prototype.isOdd === 'undefined') {
    /**
     * @desc check out if the current value is odd
     * @return {boolean}
     */
    Number.prototype.isOdd = function () {
        return (this & 1);
    }
}
// isEven
if (typeof Number.prototype.isEven === 'undefined') {
    /**
     * @desc check out if the current value is evan
     * @return {boolean}
     */
    Number.prototype.isEven = function () {
        return !(this & 1);
    }
}
// =================================================================================
// [String: extension] :string
// =================================================================================
// isEmpty
if (typeof String.prototype.isEmpty === 'undefined') {
    /**
     * @desc check out if an string is empty
     * @return {boolean}
     */
    String.prototype.isEmpty = function () {
        return (this.length === 0 || !this.trim());
    };
};
// clean
if (typeof String.prototype.clean === 'undefined') {
    /**
     * @desc clean the string of break lines elements and empty spaces
     * @return {string}
     */
    String.prototype.clean = function () {
        return this.replace(/(\r\n|\n|\r)/gm, "").replace(/^\s+|\s+$/g, "");
    }
};
// =================================================================================
// [Main] :main
// =================================================================================
(function ($) {
    'use strict';
    // =============================================================================
    // [Global variable]: $ -> Haya
    // =============================================================================
    /**
     * @var $.alias
     * @type {object}
     * @description aliasing
     * @var $.Pixi
     * @type {function}
     * @description take care of PIXI tools
     * @var $.Pixi.TextureCache
     * @type {object}
     * @description take care of loaded textures
     * @function $.Tree
     * @type {function}
     * @description Create a tree-list based on JSON file.
     */
    $.alias = new Object();
    $.Pixi = function () {
        throw new Error('This is a static class');
    };
    $.Pixi.TextureCache = new Object();
    $.Mouse = {};
    $.GUI = {};
    /**
     * @description some constants from Node
     * @constant fs require('fs')
     * @constant path require('path')
     * @constant https require('https)
     */
    const fs = require('fs');
    const path = require('path');
    // var befor = process.memoryUsage().heapUsed / 1024 / 1024;
    //     // your code
    // var after = process.memoryUsage().heapUsed / 1024 / 1024;
    // var r = `code consume ~${after-befor} MB in memory`;
    // console.log(r)
    // =============================================================================
    /**
     * :fileio
     * @function FileIO
     * @memberof Haya
     * @description Tools and useful stuffs to manager files
     */
    $.File = function () {
        throw new Error('This is a static class');
    }

    Haya.File.path = path;
    Haya.File.fs = fs;
    //Haya.File.request = require('request');
    /**
     * @function Download
     * @memberof FileIO
     * @description Tools and useful stuffs to download things
     */
    $.File.Download = function () {
        throw new Error('This is a static class');
    }
    /**
     * @param {string} filepath local filepath to file | url;
     * @param {string} type MimeType
     * @type {string}
     * @return {string}
     */
    $.File.ajax = function (filepath, type) {
        type = type || "application/json";
        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.open("GET", filepath, false);
        if (type && xmlHttpRequest.overrideMimeType) {
            xmlHttpRequest.overrideMimeType(type);
        }
        xmlHttpRequest.send();
        if (xmlHttpRequest.status < 400) {
            return xmlHttpRequest.responseText
        } else {
            throw new Error("Cannot load file " + filepath);
        }
    }
    /**
     * @desc read xml string and return to document
     * @param {string} filepath local filepath to file | url
     * @return {object} return to HTTLDocument 
     */
    $.File.xml = function (filepath, mime) {
        var string = $.File.txt(filepath);
        return (new DOMParser()).parseFromString(string, mime || "application/xml");
    }
    /**
     * @desc read JSON file and return to object
     * @param {string} filepath local filepath to file | url
     * @return {object}
     */
    $.File.json = function (filepath) {
        return (JSON.parse($.File.ajax(filepath)));
    }
    /**
     * @description create json file
     * @param {object} [data]
     * @param {string} [filepath]
     * @returns {boolean}
     */
    $.File.wjson = function (data, filepath) {
        if (typeof filepath !== 'string') return false;
        if (!($.Utils.isObject(data))) return false;
        filepath = /.json$/i.test(filepath) ? filepath : filepath + ".json";
        let local = $.File.local(filepath);
        fs.writeFile(local, JSON.stringify(data))
        return true;
    }
    /**
     * @desc read a TXT file
     * @param {string} filepath local filepath to file | url
     * @return {string}
     */
    $.File.txt = function (filepath) {
        return ($.File.ajax(filepath, "text/plain"))
    }
    /**
     * @desc clean the '\' of pathname
     * @param {string} pathname
     * @return {string}
     */
    $.File.clean = function (pathaname) {
        return pathaname.replace(/(\/)[(/)]/g, '/')
    }
    /**
     * @desc get the local folder
     * @param {string} pathname to folders inside of 'local folder'
     * @return {string}
     */
    $.File.local = function (pathname) {
        var localDirBase = path.dirname(process.mainModule.filename);
        return path.join(localDirBase, pathname);
    }
    /**
     * @desc get the local parameters of the plugin
     */
    $.File.params = function () {
        return PluginManager.parameters(decodeURI(/([^\/]+)\.js$/.exec(document.currentScript.src)[1]))
    }
    /**
     * @desc create a new folder
     * @param {string} pathname
     * @returns {string}
     */
    $.File.mkdir = function (pathname, localable = true) {
        if (localable == true) pathname = $.File.local(pathname);
        if (!fs.existsSync(pathname)) fs.mkdirSync(pathname);
    }
    // file exist?
    $.File.exist = function (path, local = true) {
        return (fs.existsSync(local ? Haya.File.local(path) : path));
    }
    /**
     * @function treeFolder
     * @param {String} [source] is the pathname of the folder
     * @description gets a list of folder pathname
     * @returns {Array}
     */
    $.File.treeFolder = function (source) {
        // is directory
        const isDirectory = source => fs.lstatSync(source).isDirectory();
        return fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
    }
    /**
     * @desc get a tree-list of the files
     * @param {string} filepath local filepath to file | url
     * @param {function} callback function that has as argument, the filepath
     * @param {boolean} [local=true] if true, will search on local filepath
     */
    $.File.treeFile = async function (filepath, callback, local = true) {
        // get filepath
        filepath = local === true ? $.File.local(filepath) : filepath;
        // folder exist?
        if (!fs.existsSync(filepath)) {
            console.warn("folder not found", filepath);
            return [];
        }
        // get
        let files = fs.readdirSync(filepath);
        // each
        let i = files.length;
        while (i--) {
            let filename = path.join(filepath, files[i]);
            let status = fs.lstatSync(filename);
            // check out if is not directory
            if (!status.isDirectory()) {
                callback(filename);
            }
        }
        return files;
    }
    /**
     * @description recursive xml reader that transform the elements into Object
     * @param {XMLDocument} xml 
     * @returns {object}
     * @example return 
     *  {"x": { "y": [ {obj...} ] } }
     */
    $.File.oxml = function (xml) {
        // return case
        if (Haya.Utils.invalid(xml)) return {};
        // check out children nodes
        if ((xml.childNodes.length > 0) && (xml.children.length < 1)) {
            // if is equal 1
            if (xml.childNodes.length === 1) return xml.childNodes[0].nodeValue;
            // data
            var data = [];
            // get each node
            var i = xml.childNodes.length;
            while (i--) {
                // item
                var item = xml.childNodes.item(i);
                data.push(item.nodeValue);
            }
            return data;
        }
        // if is XMLDocument
        if (xml instanceof XMLDocument) {
            // var
            var data = {};
            // children first
            if (xml.children.length > 0) {
                // get each children
                var i = xml.children.length;
                while (i--) {
                    // get item
                    var item = xml.children.item(i);
                    data[item.nodeName] = data[item.nodeName] || {}; // recursive
                    data[item.nodeName] = $.File.oxml(item, data)
                }
            }
        } else if (xml instanceof Element) { // if is Element
            // check out children
            if (xml.children.length > 0) {
                // data
                var data = {};
                // get each children
                var i = xml.children.length;
                while (i--) {
                    // item
                    var item = xml.children.item(i);
                    data[item.nodeName] = data[item.nodeName] || [];
                    data[item.nodeName].push($.File.oxml(item, data));
                }
            }
        }
        // return
        return data;
    }
    /**
     * @description deletes a file
     * @param {String} [filepath]
     */
    $.File.dfile = async function (filepath) {
        return fs.unlink(filepath, (err) => {
            if (err) throw err;
            console.log('The file has been deleted!');
        })
    }
    /**
     * @description download the file type text
     * @param {string} url http link
     * @param {string} dest folder to save
     * @param {string} filename if is not defined will be http filename
     * @param {function} onLoad function to call when it is ready
     *                   (basename, dest + filename)
     * @returns {boolean}
     * @example
     *  Haya.FileIO.Download.txt(
     *      "http://humanstxt.org/humans.txt",
     *      "",
     *      null,
     *      function () { alert("File downloaded!") }
     *  )
     */
    $.File.Download.txt = function (url, dest, filename, onLoad) {
        // return case
        if ($.Utils.invalid(url)) return false;
        // setup
        var fname = filename || path.basename(url);
        dest = $.File.local(dest || "");
        $.File.mkdir(dest);
        let destination = dest + "/" + fname;
        // request
        this.xhttp = new XMLHttpRequest();
        // load
        this.xhttp.onload = function () {
            fs.writeFile(destination, this.responseText);
            if ($.Utils.isFunction(onLoad)) onLoad.call(this, path.basename(destination), destination);
        }
        // open
        this.xhttp.open("GET", url, true);
        this.xhttp.send(null);
        return true;
    }
    /**
     * @description download image type
     * @param {string} url http link
     * @param {string} dest folder to save
     * @param {string} filename if is not defined will be http filename
     * @param {string} type blob type ("image/png" or "image/jpg")
     * @param {function} onLoad function to call when it is ready
     *                   (basename, dest + filename)
     * @returns {boolean}
     */
    $.File.Download.img = function (url, dest, filename, type, onLoad) {
        // return case
        if ($.Utils.invalid(url)) return false;
        // setup
        var fname = filename || path.basename(url);
        dest = $.File.local(dest || "");
        $.File.mkdir(dest);
        let destination = dest + "/" + fname;
        // request
        this.xhttp = new XMLHttpRequest();
        let mreader = new FileReader();
        if ($.Utils.invalid(type) || String(type || "").isEmpty()) {
            if (url.match(/jpg/i)) {
                type = "jpg"
            } else if (url.match(/png/i)) {
                type = "png";
            } else {
                type = "png";
            }
        }
        // destinanation
        if (!(destination.match(/\.(\w+)$/i))) {
            destination += "." + type;
        }
        // setup
        this.xhttp.responseType = 'arraybuffer';
        this.xhttp.open('GET', url, true);
        // stage
        this.xhttp.onreadystatechange = function () {
            if (this.readyState == this.DONE) {
                let blob = new Blob([this.response], {
                    type: String("image/" + type)
                });

                mreader.onload = function () {
                    fs.writeFile(destination, Buffer(new Uint8Array(this.result)));
                    if ($.Utils.isFunction(onLoad)) onLoad(fname, destination);
                }
                mreader.readAsArrayBuffer(blob);
            }
        }
        // send
        this.xhttp.send(null)
    }
    // =============================================================================
    /**
     * :util
     * @function Utils
     * @memberof Haya
     * @description Tools and useful stuffs to check up things.
     * 
     * @function Object
     * @memberof Utils
     * @description Tools and useful stuffs for Object
     * 
     * @function String
     * @memberof Utils
     * @description Tools and useful stuffs for String
     * 
     * @function Array
     * @memberof Utils
     * @description Tools and useful stuffs for Array
     * 
     * @function Color
     * @memberof Utils
     * @description Tools and useful stuffs for Color
     */
    $.Utils = function () {
        throw new Error('This is a static class');
    };
    $.Utils.Object = function () {
        throw new Error('This is a static class');
    };
    $.Utils.String = function () {
        throw new Error('This is a static class');
    };
    $.Utils.Array = function () {
        throw new Error('This is a static class');
    };
    $.Utils.Color = function () {
        throw new Error('This is a static class');
    };
    /**
     * @description execute cmd commands
     * @returns {function}
     * @see https://msdn.microsoft.com/en-us/library/windows/desktop/gg537745(v=vs.85).aspx
     * @tutorial 
     * Shell.ShellExecute(sFile, [ vArguments ], [ vDirectory ], [ vOperation ], [ vShow ])
     * [sFile] : A String that contains the name of the file on which ShellExecute will perform the action specified by vOperation.
     * [vArguments] : A string that contains parameter values for the operation.
     * [vDirectory] : The fully qualified path of the directory that contains the file specified by sFile. 
     * If this parameter is not specified, the current working directory is used.
     * [vOperation] : The operation to be performed. This value is set to one of the verb strings that is supported by the file. 
     * For a discussion of verbs, see the Remarks section. If this parameter is not specified, the default operation is performed.
     * [vShow] : A recommendation as to how the application window should be displayed initially. The application can ignore this recommendation. 
     * This parameter can be one of the following values. If this parameter is not specified, the application uses its default value.
     *      0 : Open the application with a hidden window.
     *      1 : Open the application with a normal window. 
     * If the window is minimized or maximized, the system restores it to its original size and position.
     *      2 : Open the application with a minimized window.
     *      3 : Open the application with a maximized window.
     *      4 : Open the application with its window at its most recent size and position. The active window remains active.
     *      5 : Open the application with its window at its current size and position.
     *      7 : Open the application with a minimized window. The active window remains active.
     *      10 : Open the application with its window in the default state specified by the application.
     * @example 
     * let test = Haya.Utils.shell();
     * test.ShellExecute("cmd.exe", "cd C: C:\\cd c:\\ext_file main.exe test.txt", "C:\\WINDOWS\\system32", "open", 1);
     * // or
     * test.ShellExecute("notepad.exe", "", "", "open", 1);
     */
    $.Utils.shell = function () {
        return (new ActiveXObject("shell.application"));
    }
    /**
     * @description convert a array into point
     * @param {Array} [pos=[x, y]]
     * @returns Point
     */
    $.Utils.arrayToPoint = function (pos = [0, 0]) {
        return (Array.isArray(pos) ? new Point(pos[0], pos[1]) : pos)
    }
    /**
     * @desc check out if is object
     * @param {any}
     * @return {boolean}
     */
    $.Utils.isObject = function (type) {
        return (type !== null && typeof type === 'object');
    }
    /**
     * @desc check out if is array type. Array.isArray()
     * @param {any}
     * @return {boolean}
     */
    $.Utils.isArray = function (type) {
        return (type && Object.prototype.toString.call(type) === '[object Array]');
    }
    /**
     * @desc check out if is function
     * @param {any} 
     * @return {boolean}
     */
    $.Utils.isFunction = function (type) {
        return (type && Object.prototype.toString.call(type) === '[object Function]');
    }
    /**
     * @desc check out if is boolean type
     * @param {string} type 
     * if is 'string', will check out by:
     *  return [true] when is "true", "yes", "on"
     *  return [false] when is "false", "no", "off"
     * if is 'number', will check out by:
     *  return [true] when is 1
     *  return [false] when is 0
     * @param {boolean} booleanDefault | for default, return this param. Default is false
     * @return {boolean}
     */
    $.Utils.isBoolean = function (type, booleanDefault) {
        // if is boolean
        if (type instanceof Boolean) return type;
        // if is string
        if (type instanceof String) {
            // lowercase
            type = type.toLowerCase();
            // check out true value
            if (type.match(/^(true|yes|on|enable)/i)) return true;
            // check out false value
            if (type.match(/^(false|no|off|disable)/i)) return false;
        } else if (type instanceof Number) {
            // return true
            if (type === 1) return true;
            // return false
            if (type === 0) return false;
        }
        // default return
        return booleanDefault || false;
    }
    /**
     * @desc check out if the object is invalid (neither undefined either null)
     * @param {any} object
     * @return {boolean}
     */
    $.Utils.invalid = function (object) {
        return (
            typeof object === 'undefined' ||
            typeof object === 'null'
        );
    }
    /**
     * @description check up if object is false (undefined, null, NaN, false, 0, -1)
     * @param {any} [object]
     * @returns {boolean}
     */
    $.Utils.isFalse = function (object) {
        if ($.Utils.invalid(object) || object === NaN || object === 0 || object === -1 || object === false) return true;
        return false;
    }
    /**
     * @description check up if object is true (undefined, null, NaN, false, 0, -1)
     * @param {any} [object]
     * @returns {boolean}
     */
    $.Utils.isTrue = function (object) {
        return (!($.Utils.isFalse(object)));
    }
    /**
     * @desc get index by propriety of object
     * @param {object} object that will be checked
     * @param {string} propriety that will be checked
     * @param {string} value -> that will be found and return to his index;
     */
    $.Utils.Object.index = function (object, propriety, value) {
        object.map(function (element) {
            return element[propriety];
        }).indexOf(value);
    };
    /**
     * @description check out if there is a property 
     */
    $.Utils.Object.hasProperty = function (object, property, value) {
        if (object.hasOwnProperty(property) === false) object[property] = value;
        return object[property];
    }
    /**
     * @desc return the next element from 'object'
     * @param {object} object
     * @param {string} current keyname
     * @return {*} 
     */
    $.Utils.Object.next = function (object, current) {
        return object[$.DMath.fincrease(Object.keys(object).indexOf(current), 0, Object.keys(object).length, 1)]
    }
    /**
     * @desc return the previous element from 'object'
     * @param {object} 
     * @param {string} current keyname
     * @return {*}
     */
    $.Utils.Object.pred = function (object, current) {
        return object[$.DMath.fdecrease(Object.keys(object).indexOf(current), 0, Object.keys(object).length, 1)]
    }
    /**
     * @desc merge into 'object' another 'object' and return to a new Object
     * @param {object} object that will receive the merge
     * @param {object} mobject that will be merged
     * @param {boolean} replace replace elements that 'object' have. Default is [true]
     * @return {obejct}
     */
    $.Utils.Object.merge = function (object, mobject, replace) {
        // replace 
        replace = replace || true;
        // new object
        var nobject = new Object();
        // check out if object and mobject is Object
        if (!$.Utils.isObject(object) || !$.Utils.isObject(mobject)) return nobject;
        // merge function
        Object.keys(object).map(function (keyname) { // each keyname from mobject
            // check out if mobject has the keyname
            if (mobject.hasOwnProperty(keyname)) {
                // check out if the value is a Object
                if ($.Utils.isObject(mobject[keyname])) {
                    nobject[keyname] = $.Utils.merge(
                        object[keyname],
                        $.Utils.merge(object[keyname], mobject[keyname], replace),
                        replace
                    );
                } else {
                    nobject[keyname] = replace ? mobject[keyname] : object[keyname];
                }
            } else {
                nobject[keyname] = object[keyname]
            }
        })
        // return to new object based on 'object' and 'mobejct'
        return nobject;
    }
    /**
     * @description Iterate through the properties of any object.
     * @param {Object} [object] Iterate through the properties of any object.
     * @param {!function(this:scope, keyname, value, index, object)} [callback]
     * @param {any} [scope] use as scope for 'callback'. If don't set up is by default, the object.
     * @returns {Object}
     */
    $.Utils.Object.each = function (object, callback, scope) {
        // check out if object is Object
        if (!($.Utils.isObject(object))) return {};
        // get each keys
        this.keys = [];
        for (kobj in object) {
            this.keys.push(kobj);
        }
        // values
        var i = 0;
        const max = this.keys.length;
        // get into each properties from object
        for (; i < max; i++) {
            if ($.Utils.isFunction(callback)) {
                callback.call(
                    scope || object,
                    this.keys[i],
                    object[this.keys[i]],
                    i,
                    object
                )
            }
        }
        // return
        return object;
    }
    /**
     * @description capitalize [automatic punctuation]
     * @param {string} [string]
     * @returns {string}
     */
    $.Utils.String.capitalize = function (string) {
        return string.replace(/(^|\. *)([a-z])/g, function (result, separator, char) {
            return (separator + char.toUpperCase());
        });
    }
    /**
     * @description get a random element from array
     * @param {array} [array]
     * @param {number} [at] (optional, default is 0) 
     * at the element index until 'end'
     * @param {number} [end] (optional, default is length) 
     * until 'end' element index.
     * @returns {Array}
     */
    $.Utils.Array.random = function (array, at, end) {
        return array[$.DMath.randInt((at || 0), (end || array.length) - 1)];
    }
    /**
     * @description check up if all element on Array is false. Will only
     * check out elements that is Boolean type.
     * This is useful only if the array has elements that isn't boolean type.
     * Otherwise, you can use the function 'every' from Array. Vanilla method.
     * @see $.Utils.isBoolean();
     * @param {array} [array]
     * @param {*} [scope] by default is [array]
     * @param {!function(this:scope, array)} [callback]
     * @returns {Boolean}
     *  [true] if every value is false
     *  [false] if isn't
     */
    $.Utils.Array.isFalse = function (array, callback, scope) {
        // get each 'boolean' element
        this.boolean = [];
        let i = array.length;
        while (i--) {
            if ($.Utils.isBoolean(array[i], -1) !== -1) {
                this.boolean.push($.Utils.isBoolean(array[i]));
                callback.call(scope || array, array[i]);
            }
        }
        // return
        return this.boolean.every(function (el) {
            return el === false;
        })
    }
    /**
     * @description check up if all element on Array is true. Will only
     * check out elements that is Boolean type.
     * This is useful only if the array has elements that isn't boolean type.
     * Otherwise, you can use the function 'every' from Array. Vanilla method.
     * @see $.Utils.isBoolean();
     * @param {array} [array]
     * @param {*} [scope] by default is [array]
     * @param {!function(this:scope, array)} [callback]
     * @returns {Boolean}
     *  [true] if every value is true
     *  [false] if isn't
     */
    $.Utils.Array.isTrue = function (array, callback, scope) {
        // get each 'boolean' element
        this.boolean = [];
        let i = array.length;
        while (i--) {
            if ($.Utils.isBoolean(array[i], -1) !== -1) {
                this.boolean.push($.Utils.isBoolean(array[i]));
                callback.call(scope || array, array[i]);
            }
        }
        // return
        return this.boolean.every(function (el) {
            return el === true;
        })
    }
    /**
     * @description remove a element if it exists
     * @param {Array} [array]
     * @param {element} [element]
     * @returns {Boolean}
     */
    $.Utils.Array.remove = (array, element) => {
        if ($.Utils.Array.contain(array, element)) {
            array.splice(array.indexOf(element), 1);
            return true;
        } else {
            return false;
        }
    }
    /**
     * @description expand a array until 'limit' by following the 
     * 'step' value.
     * @example 
     *  Haya.Utils.Array.step(0, 10, 2) // [0, 2, 4, 6, 8, 10];
     * @param {number} [start]
     * @param {number} [end]
     * @param {number} [step] will divide the limit
     * @param {!function(this:scope, element, start, end, step, array)} [callback] 
     * @param {*} [scope] by default is [array]
     * @returns {array}
     */
    $.Utils.Array.step = function (start, end, step, callback, scope) {
        // checkup
        start = start || 0;
        step = step || 1;
        // into
        for (let array = [];
            (end - start) * step > 0; start += step) {
            array.push(start);
            if ($.Utils.isFunction(callback)) callback.call(scope || array, array.pop(), start, end, step, array);
        }
        return array;
    }
    /**
     * @description chunk a array into smaller arrays
     * @example
     * Haya.Utils.Array.chunk([1,2,3,4], 2) // [[1, 2], [3, 4]]
     * @param {array} [array=[]] to chunk up
     * @param {number} [size=2] the amount of element into each smaller array
     * @returns {array}
     */
    $.Utils.Array.chunk = function (array, size = 2) {
        Array.from({
                length: Math.ceil(array.length / size)
            }, (v, i) =>
            array.slice(i * size, i * size + size)
        );
    }
    /**
     * @description get a random color
     * @return {string} <hex>
     */
    $.Utils.Color.random = function () {
        let random = (Math.random() * 0x1000000 << 0).toString(16);
        let array = new Array(7 - random.length).join("0") + random;
        return String("#" + array);
    }
    /**
     * @description get hex into rgb
     * @param {String} [hex="#..."|"0x..."]
     * @returns Object {red, green, blue};
     */
    $.Utils.Color.hexRgb = function (hex) {
        hex = hex.replace(/^0x/, "#")

        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            red: parseInt(result[1], 16),
            green: parseInt(result[2], 16),
            blue: parseInt(result[3], 16)
        } : null;
    }
    /**
     * @description get rgb into hex
     * @param {Number} [...color(red, green, blue)]
     * @returns String
     */
    $.Utils.Color.rgbHex = function (r, g, b, type = "#") {
        return type + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    /**
     * @description correlated color temperature to rgb in Kelvin
     * @param {NUmber} kelvin 
     * @returns {Object} {hex: String, red: Number, green: Number, blue: Number}
     */
    $.Utils.Color.kelvin = function (kelvin) {
        // limit it
        kelvin = $.DMath.fclamp(kelvin, 1000, 40000) / 100;

        var color = new Vector3D(0, 0, 0);
        // 66?RED
        //
        color.x = kelvin <= 66 ? 255 : $.DMath.fclamp(~~(329.698 * ((kelvin - 60) ** -0.133)), 0, 255)

        // 66?GREEN
        color.y = kelvin <= 66 ?
            $.DMath.fclamp(~~(99.47 * Math.log(kelvin) - 161.119), 0, 255) :
            $.DMath.fclamp(~~(288.122 * ((kelvin - 60) ** -0.0755)), 0, 255);

        // 66?BLUE
        color.z = kelvin >= 66 ? 255 : kelvin <= 19 ? 0 : $.DMath.fclamp(~~(138.517 * Math.log(kelvin - 10) - 305.044), 0, 255);
        return {
            hex: $.Utils.Color.rgbHex(color.x, color.y, color.z),
            red: color.x,
            green: color.y,
            blue: color.z
        }
    }
    // =============================================================================
    /**
     * :dmath
     * @function DMath
     * @memberof Haya
     * @desc tools for calcs
     * 
     * @function Position
     * @memberof DMath
     * @desc tools for positions calcs
     * 
     * @function Vector
     * @memberof DMath
     * @description Tool for Vector classes
     */
    $.DMath = function () {
        throw new Error('This is a static class');
    };
    $.DMath.Position = function () {
        throw new Error('This is a static class');
    };
    $.DMath.Vector = function () {
        throw new Error('This is a static class');
    };
    /**
     * @from https://30secondsofcode.org/math
     * @description Initializes an array containing the numbers in the specified range where start and 
     * end are inclusive and the ratio between two terms is step. Returns an error if step equals 1.
     * @example
     * Haya.DMath.geometricProgression(256) // [1, 2, 4, 8, 16, 32, 64, 128, 256]
     *           .geometricProgression(256, 3); // [3, 6, 12, 24, 48, 96, 192]
     *           .geometricProgression(256, 1, 4); // [1, 4, 16, 64, 256]
     */
    $.DMath.geometricProgression = function (end, start = 1, step = 2) {
        return Array.from({
            length: Math.floor(Math.log(end / start) / Math.log(step)) + 1
        }).map(
            (v, i) => start * step ** i
        );
    }
    /**
     * @from https://30secondsofcode.org/math
     * @description Calculates the midpoint between two pairs of (x,y) points.
     * @example 
     * midpoint([2, 2], [4, 4]); // [3, 3]
     * midpoint([4, 4], [6, 6]); // [5, 5]
     * midpoint([1, 3], [2, 4]); // [1.5, 3.5]
     */
    $.DMath.midpoint = ([x1, y1], [x2, y2]) => {
        return [(x1 + x2) / 2, (y1 + y2) / 2]
    }
    /**
     * @desc turn value to percent by max
     * @param {number, number, number}
     * @return {number}
     */
    $.DMath.percentTo = function (current, min, max) {
        return ((current * min) / max);
    }
    /**
     * @desc turn value to percent
     * @param {number, number}
     * @return {number}
     */
    $.DMath.toPercent = function (current, min) {
        return ((current * min) / 100);
    }
    /**
     * @desc get a random numeric between a min and max value.
     * @param {number, number}
     * @return {number}
     */
    $.DMath.rand = function (min, max) {
        return Math.random() * (max - min) + min;
    }
    /**
     * @desc get a random numeric between a min and max value with integer value.
     * @param {number, number}
     * @return {number}
     */
    $.DMath.randInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return ~~(Math.random() * (max - min + 1)) + min;
    }
    /**
     * @desc get a randomic variation of a number
     * @param {number, number}
     * @return {number}
     */
    $.DMath.randomic = function (current, variation) {
        let random = $.DMath.randInt(0, 1) === 0 ? $.DMath.rand(0, variation) : -$.DMath.rand(0, variation);
        current = (current + $.DMath.rand(0, 2)) + (current + random);
        return (current / 2);
    }
    /**
     * @description catch up the distance between 2 number and return
     * the absolute value
     * @param {number} [x]
     * @param {number} [y]
     * @returns {number}
     */
    $.DMath.distance = function (x, y) {
        return Math.abs(x - y);
    }
    /**
     * @description get the (Euclidean Distance) between two
     * point position.
     * @param {Vector|Point} [a]
     * @param {Vector|Point} [b]
     * @returns {Number}
     */
    $.DMath.euclidean2d = (a, b) => {
        return Math.sqrt(
            Math.pow((b.x - a.x), 2) +
            Math.pow((b.y - a.y), 2)
        );
    }
    /**
     * @description Converts from radians to degrees.
     * @param {number} [radians]
     * @example 
     * Haya.DMath.degrees(~1.570) // 90
     * @returns {number}
     */
    $.DMath.degrees = function (radians) {
        return (radians * 180 / Math.PI);
    };
    /**
     * @description Converts from degrees to radians.
     * @param {number} [degrees]
     * @example 
     * Haya.DMath.radians(90) // ~1.570
     * @returns {number}
     */
    $.DMath.radians = function (degrees) {
        return (degrees * Math.PI / 180);
    };
    /**
     * @description Iterates over 'start' numeric value until 'end' 
     * numeric value.
     * @param {number} [start] initial value, Math.trunc is used
     * @param {number} [end] end value, Math.trunc is used
     * @param {*} [scope] used on callback
     * @param {!function(this:scope, current, start, end, array)} [callback]
     * @returns {array}
     */
    $.DMath.upto = function (start, end, callback, scope) {
        this.array = [];
        let i = Math.trunc(start);
        while (i <= Math.trunc(end)) {
            this.array.push(i);
            callback.call(scope || this, i, Math.trunc(start), Math.trunc(end), array);
        }
        return this.array;
    }
    /**
     * @description Iterates over 'end' numeric value until 'start' 
     * numeric value. Reverse of 'upto'
     * @param {number} [end] end value, Math.trunc is used
     * @param {number} [limit] end down to until 'limit'
     * @param {*} [scope] used on callback
     * @param {!function(this:scope, current, limit, end, array)} [callback]
     * @returns {array}
     */
    $.DMath.downto = function (end, limit, callback, scope) {
        this.array = [];
        let i = Math.trunc(end);
        while (i--) {
            this.array.push(i);
            callback.call(scope || this, i, Math.trunc(limit), Math.trunc(end), array);
            if (i === Math.trunc(limit)) break;
        }
        return this.array;
    }
    /**
     * @description Sigmoid functions have domain of all real numbers,
     * with return value monotonically increasing most often from 0 to 1 or 
     * alternatively from −1 to 1, depending on convention. The standard logistic 
     * function is the logistic function with parameters 
     * (k = 1, x0 = 0, l = 1) which yields
     * @see https://en.wikipedia.org/wiki/Logistic_function
     * @param {Number} [x] the value. Recommended small real numbers. 
     * Due to nature of 'Math.E'
     * @param {Number} [x0=0] the x-value of the sigmoid's midpoint
     * @param {Number} [l=1] the curve's maximum value
     * @param {Number} [k=1] the steepness of the curve
     * @returns {Number}
     */
    $.DMath.sigmoid = (x, x0 = 0, l = 1, k = 1) => {
        return (
            (l) /
            (1 + (Math.pow(Math.E, -k * (x - x0))))
        );
    }
    /**
     * @description fix the float
     */
    $.DMath.float = (value, n = 2) => {
        return parseFloat(value.toFixed(n || 2));
    }
    /**
     * @description clamping a float number
     * @param {Number} [current]
     * @param {Number} [min]
     * @param {Number} [max]
     * @returns {Number}
     */
    $.DMath.fclamp = (current, min, max) => {
        //min: (current > min ? min : current)
        //Math.min(Math.max(min, val), max)
        return (
            (current > min ? (current < max ? current : max) : min)
        );
    }
    /**
     * @description increase a float value for a variable
     * while clamping the value
     * @param {Number} [current] // value to increase
     * @param {Number} [min]
     * @param {Number} [max]
     * @param {Number} [amount] // how many will increase
     * @param {String} [key] // while pressing the key will change the
     * amount to the next 'amount' | Put null to not use
     * @param {Number} [keyAmount]
     */
    $.DMath.fincrease = (current, min, max, amount, key = "alt", keyAmount = 1) => {
        current += (Input.isLongPressed(key)) ? keyAmount : amount;
        return $.DMath.fclamp(current, min, max);
    }
    /**
     * @description decrease a float value for a variable
     * while clamping the value
     * @param {Number} [current] // value to decrease
     * @param {Number} [min]
     * @param {Number} [max]
     * @param {Number} [amount] // how many will decrease
     * @param {String} [key] // while pressing the key will change the
     * amount to the next 'amount' | Put null to not use
     * @param {Number} [keyAmount]
     */
    $.DMath.fdecrease = (current, min, max, amount, key = "alt", keyAmount = 1) => {
        current -= (typeof key === 'string' && Input.isLongPressed(key)) ? keyAmount : amount;
        return $.DMath.fclamp(current, min, max);
    }
    /**
     * @description use the wheel of the mouse to change the value
     * @param {Number} [current] // value to decrease
     * @param {Number} [min]
     * @param {Number} [max]
     * @param {Number} [amount] // how many will decrease
     * @param {Function} [onchange] // when change the value
     * @param {String} [key] // while pressing the key will change the
     * amount to the next 'amount' | Put null to not use
     * @param {Number} [keyAmount]
     * @param {Number} [wheelV]
     */
    $.DMath.wheelID = function (current, min, max, amount, onchange = null, key = "alt", keyAmount = 1, wheelV = 20, reverse = false) {
        if (TouchInput.wheelY >= wheelV) {
            current = $.DMath.fincrease(current, min, max, amount, key, keyAmount);
            if ($.Utils.isFunction(onchange)) onchange.call(this, $.DMath.float(current), 1);
        } else if (TouchInput.wheelY <= -wheelV) {
            current = $.DMath.fdecrease(current, min, max, amount, key, keyAmount);
            if ($.Utils.isFunction(onchange)) onchange.call(this, $.DMath.float(current), -1);
        }
        if (reverse === true) {
            current = current >= max ? min : current <= min ? max : current;
        }
        return current;
    }
    /**
     * @function rotate 
     * @description rotates a object based in his angle
     * @param {Body.?(Vector|Point)} [body=body.vel]
     * @param {Float} [angle]
     * @returns {Vector};
     */
    $.DMath.rotate = function (body, angle) {
        return (new $.DMath.Vector2D(
            (body.x * Math.cos(angle)) - (body.y * Math.sin(angle)),
            (body.x * Math.sin(angle)) + (body.y * Math.cos(angle))
        ));
    }
    /**
     * @function collision_AVM
     * @description free resolve the collision between two bodies. In this case,
     * just change the velocity based on mass, angle and position of two bodies.
     */
    $.DMath.collision_AVM = function (a, b, as, bs, callback) {
        // difference between axis based on velocity
        var diffVX = av.x - bv.y;
        var diffVY = av.x - bv.y;
        // get the distance based on 'b'
        var distX = bs.x - as.x;
        var distY = bs.y - as.y;
        // Prevent accidental overlap of particles
        if (~~((diffVX * distX) + (diffVY * distY)) >= 0) {
            // math of the angle between this two bodies
            var angle = -Math.atan2(bs.y - as.y, bs.x - as.y);
            // get the mass
            var massA = a.mass;
            var massB = b.mass;
            // get the rotate velocity before the collision equation
            var u1 = $.DMath.rotate(av, angle);
            var u2 = $.DMath.rotate(bv, angle);
            // velocity after collision
            var v1 = new Haya.DMath.Vector2D(
                (u1.x * (massA - massB)) / (massA + massB) + u2.x * 2 * massB / (massA + massB),
                u1.y
            )

            var v2 = new Haya.DMath.Vector2D(
                (u2.x * (massA - massB)) / (massA + massB) + u1.x * 2 * massB / (massA + massB),
                u2.y
            )

            // final velocity after rotating axis back
            var vfA = $.DMath.rotate(v1, -angle);
            var vfB = $.DMath.rotate(v2, -angle);
            // Swap particle velocities for realistic bounce effect
            // a.velocity.x = vfA.x;
            // a.velocity.y = vfA.y;
            // b.velocity.x = vfB.x;
            // b.velocity.y = vfB.y;
            let c = {
                a: a,
                b: b,
                diffVX: diffVX,
                diffVY: diffVY,
                distX: distX,
                distY: distY,
                angle: angle,
                massA: massA,
                massB: massB,
                u1: u1,
                u2: u2
            }
            if ($.Utils.isFunction(callback)) callback.call(this, vfA, vfB, c);
        }
    }
    /**
     * @desc display object based on screen
     * @param {object} hash that contains:
     *      type: [type of position],
     *      object: [this class need to have width & height function],
     *      [optional] width: [width of object, case don't have]
     *      [optional] height [height of object, case don't have]
     * @return {Point}
     */
    $.DMath.Position.screen = function (hash) {
        // default position 
        let point = new $.DMath.Vector2D(0, 0);
        let width = hash.object === undefined ? hash.width : hash.object.width;
        let height = hash.object === undefined ? hash.height : hash.object.height;
        // condition
        if (hash.type === "center" || hash.type === "c" || hash.type === 0) {
            point.x = (Graphics.boxWidth - width) / 2;
            point.y = (Graphics.boxHeight - height) / 2;
        } else if (hash.type === "centerLeft" || hash.type === "cl" || hash.type === 1) {
            point.x = 0;
            point.y = (Graphics.boxHeight - height) / 2;
        } else if (hash.type === "centerRight" || hash.type === "cr" || hash.type === 2) {
            point.x = Graphics.boxWidth - width;
            point.y = (Graphics.boxHeight - height) / 2;
        } else if (hash.type === "centerTop" || hash.type === "ct" || hash.type === 3) {
            point.x = (Graphics.boxWidth - width) / 2;
        } else if (hash.type === "centerBottom" || hash.type === "cb" || hash.type === 4) {
            point.x = (Graphics.boxWidth - width) / 2;
            point.y = Graphics.boxHeight - height;
        } else if (hash.type === "upperRight" || hash.type === "ur" || hash.type === 5) {
            point.x = Graphics.boxWidth - width;
        } else if (hash.type === "bottomRight" || hash.type === "br" || hash.type === 6) {
            point.x = Graphics.boxWidth - width;
            point.y = Graphics.boxHeight - height;
        } else if (hash.type === "bottomLeft" || hash.type === "bf" || hash.type === 7) {
            point.y = Graphics.boxHeight - height;
        }
        // return default if nothing is setup
        return point;
    }
    /**
     * @desc display object based on another obejct
     * @param {object} hash that contains:
     *      type: [type of position],
     *      a: [first object, that will change the position |need to have x, y, width, height|]
     *      b: [second object, that will be the reference point |need to have x, y, width, height|]
     * @return {Point}
     */
    $.DMath.Position.sprite = function (hash) {
        // default position 
        let point = new $.DMath.Vector2D(hash.a.x, hash.a.y);
        // type
        if (hash.type === "center" || hash.type === "c" || hash.type === 0) {
            point.x = hash.b.x + ((hash.b.width - hash.a.width) / 2);
            point.y = hash.b.y + ((hash.b.height - hash.a.height) / 2);
        } else if (hash.type === "centerLeft" || hash.type === "cl" || hash.type === 1) {
            point.x = hash.b.x;
            point.y = hash.b.y + (hash.b.height - hash.a.height) / 2;
        } else if (hash.type === "centerRight" || hash.type === "cr" || hash.type === 2) {
            point.x = hash.b.x + hash.a.width;
            point.y = hash.b.y + (hash.b.height - hash.a.height) / 2;
        } else if (hash.type === "centerTop" || hash.type === "ct" || hash.type === 3) {
            point.x = hash.b.x + (hash.b.width - hash.a.width) / 2;
            point.y = hash.b.y;
        } else if (hash.type === "centerBottom" || hash.type === "cb" || hash.type === 4) {
            point.x = hash.b.x + (hash.b.width - hash.a.width) / 2;
            point.y = hash.b.y + hash.b.height;
        } else if (hash.type === "upperRight" || hash.type === "ur" || hash.type === 5) {
            point.x = hash.b.x + hash.b.width;
            point.y = hash.b.y - hash.b.height;
        } else if (hash.type === "upperLeft" || hash.type === "ul" || hash.type === 6) {
            point.x = hash.b.x;
            point.y = hash.b.y - hash.b.height;
        } else if (hash.type === "bottomRight" || hash.type === "br" || hash.type === 7) {
            point.x = hash.b.x + hash.b.width;
            point.y = hash.b.y + hash.b.height;
        } else if (hash.type === "bottomLeft" || hash.type === "bf" || hash.type === 8) {
            point.x = hash.b.x;
            point.y = hash.b.y + hash.b.height;
        }
        // return
        return point;
    }
    /**
     * @class Vector :vector
     * @classdesc A simple and useful Vector 2D class
     * @memberof Vector
     * @constructor
     * @param {number} [x] axis
     * @param {number} [y] axis
     */
    class Vector2D {
        /**
         * @constructor
         * @param {number} [x] axis
         * @param {number} [y] axis
         */
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        /**
         * @description sum to another vector class
         * @param {Vector2D|Point|Array} [vector] If is number then will
         * add the number toward the x and y axis.
         * @returns {Vector2D}
         */
        add(vector) {
            if ($.Utils.isArray(vector)) {
                vector = new Point(vector.shift(), vector.pop());
            }
            if (typeof vector === 'number') {
                vector = new Point(vector, vector)
            };
            return new $.DMath.Vector2D(this.x + vector.x, this.y + vector.y);
        }
        /**
         * @description substract to another vector class
         * @param {Vector2D|Point|Array} [vector] If is number then will
         * add the number toward the x and y axis.
         * @returns {Vector2D}
         */
        sub(vector) {
            if ($.Utils.isArray(vector)) {
                vector = new Point(vector.shift(), vector.pop());
            }
            if (typeof vector === 'number') {
                vector = new Point(vector, vector)
            };
            return new $.DMath.Vector2D(this.x - vector.x, this.y - vector.y);
        }
        /**
         * @description multiply to another vector class
         * @param {Vector2D|Point|Array} [vector] If is number then will
         * add the number toward the x and y axis.
         * @returns {Vector2D}
         */
        mult(vector) {
            if ($.Utils.isArray(vector)) {
                vector = new Point(vector.shift(), vector.pop());
            }
            if (typeof vector === 'number') {
                vector = new Point(vector, vector)
            };
            return new $.DMath.Vector2D(this.x * vector.x, this.y * vector.y);
        }
        /**
         * @description divide to another vector class
         * @param {Vector2D|Point|Array} [vector] If is number then will
         * add the number toward the x and y axis.
         * @returns {Vector2D}
         */
        div(vector) {
            if ($.Utils.isArray(vector)) {
                vector = new Point(vector.shift(), vector.pop());
            }
            if (typeof vector === 'number') {
                vector = new Point(vector, vector)
            };
            vector.x = vector.x === 0 ? 1 : vector.x;
            vector.y = vector.y === 0 ? 1 : vector.y;
            return new $.DMath.Vector2D(this.x / vector.x, this.y / vector.y);
        }
        /**
         * @description get a dot point based on vector
         * @param {Vector2D|Point|Array} [vector]
         * @returns {numeric}
         */
        dot(vector) {
            if ($.Utils.isArray(vector)) {
                vector = new Point(vector.shift(), vector.pop());
            }
            if (typeof vector === 'numeric') {
                vector = new Point(vector, vector)
            };
            return this.x * vector.x + this.y * vector.y;
        }
        /**
         * @description get the length
         */
        length() {
            return Math.sqrt(this.dot(this));
        }
        /**
         * @description check up if is equals toward another
         * vector
         * @param {Vector2D} [vector] 
         * @returns {Boolean}
         */
        equals(vector) {
            if (vector instanceof $.DMath.Vector2D) {
                return (this.x === vector.x && this.y === vector.y);
            }
            return false;
        }
        /**
         * @description get the magnitude value from axis position
         * @returns {numeric}
         */
        magnitude() {
            return (Math.sqrt((this.x * this.x) + (this.y * this.y)));
        }
        /**
         * @description normalize the axis scale
         * @returns {boolean}
         */
        normalize() {
            if (this.x === 0 || this.y === 0) return false;
            length = this.magnitude();
            this.x /= length;
            this.y /= length;
            return true;
        }
        /**
         * @description get a new Vector2D based on
         * normalize value
         * @returns {Vector2D}
         */
        normalized() {
            return (new $.DMath.Vector2D(this.x, this.y).normalize());
        }
        /**
         * @description scale the value
         * @param {Point|Vector2D|Array} [sc] anything that has '.x' and '.y'
         * or a array with two elements.
         */
        scale(sc) {
            if ($.Utils.isArray(sc)) {
                sc = new Point(sc.shift(), sc.pop());
            }
            this.x *= sc.x;
            this.y *= sc.y;
        }
        /**
         * @description set a new axis value
         * @param {Point|Vector2D|Array} [sc] anything that has '.x' and '.y'
         * or a array with two elements.
         */
        set(sc) {
            if ($.Utils.isArray(sc)) {
                sc = new Point(sc[0], sc[1]);
            }
            this.x = sc.x;
            this.y = sc.y;
        }
        /**
         * @description clone the class
         * @returns {Vector2D}
         */
        clone() {
            return (new $.DMath.Vector2D(this.x, this.y));
        }
        /**
         * @description return a perpendicular vector class
         * @returns {Vector2D} 
         */
        perpendicular() {
            return (new $.DMath.Vector2D(this.y, -(this.x)));
        }
        /**
         * @description get the negative version of this vector class
         * @returns {Vector2D} 
         */
        negative() {
            return new $.DMath.Vector2D(-this.x, -this.y);
        }
        /**
         * @description to angles
         * @returns {numeric}
         */
        toa() {
            return -Math.atan2(-this.y, this.x);
        }
        /**
         * @description get angles into
         * @param {Vector2D} [vector]
         * @returns {numeric}
         */
        ato(vector) {
            return Math.acos(this.dot(vector) / (this.length() * vector.length()));
        }

        string() {
            return `x: ${$.DMath.float(this.x)}, y: ${$.DMath.float(this.y)}`;
        }

        array() {
            return [this.x, this.y]
        }
    };
    $.DMath.Vector2D = Vector2D;
    /**
     * @description return the angle between 2 vector 2d.
     * @param {Vector2D} [to]
     * @param {Vector2D} [from]
     * @returns {Numeric}
     */
    $.DMath.Vector.angle2d = function (to, from) {
        return $.DMath.degrees(Math.atan2(to.y - from.y, to.x - from.x));
    }
    /**
     * @description compare to vector 2d class and return with
     * the minimum value
     * @param {Vector2D} [from]
     * @param {VecVector2Dtor} [to]
     * @returns {Vector2D}
     */
    $.DMath.Vector.min2d = function (from, to) {
        return (new $.DMath.Vector2D(
            Math.min(from.x, to.x),
            Math.min(from.y, to.y)
        ));
    }
    /**
     * @description compare to vector 2d class and return with
     * the maximum value
     * @param {Vector2D} [from]
     * @param {Vector2D} [to]
     * @returns {Vector2D}
     */
    $.DMath.Vector.max2d = function (from, to) {
        return (new $.DMath.Vector2D(
            Math.max(from.x, to.x),
            Math.max(from.y, to.y)
        ));
    }
    /**
     * @description get the cross product between two vector 2d class
     * @see https://en.wikipedia.org/wiki/Cross_product
     * @param {Vector2D} [from]
     * @param {Vector2D} [to]
     * @returns {Numeric}
     */
    $.DMath.Vector.cross2d = function (from, to) {
        return from.x * to.y - from.y * to.x;
    }
    /**
     * @description get the dot product between two vector 2d class
     * @see https://en.wikipedia.org/wiki/Dot_product
     * @param {Vector2D} [from]
     * @param {Vector2D} [to]
     * @returns {Numeric}
     */
    $.DMath.Vector.dot2d = function (from, to) {
        return from.x * to.x + from.y * to.y;
    }
    /**
     * @see https://github.com/evanw/lightgl.js/blob/master/src/vector.js
     * @class
     * @classdesc A simple and useful vector 3d class
     * @memberof Vector
     */
    class Vector3D {
        /**
         * @constructor 
         * @param {number} [x] axis
         * @param {number} [y] axis
         * @param {number} [z] depth
         */
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        /**
         * @description return a new vector 3d class based
         * on negative values
         * @returns {Vector3D} 
         */
        negative() {
            return new $.DMath.Vector3D(-this.x, -this.y, -this.z);
        }
        /**
         * @description add values (sum) into this class
         * based on another vector class
         * @param {Vector3D|Number} [vector]
         * @returns {Vector3D}
         */
        add(vector) {
            if (vector instanceof $.DMath.Vector3D) {
                return new $.DMath.Vector3D(this.x + vector.x, this.y + vector.y, this.z + vector.z);
            } else if (typeof vector === 'number') {
                return new $.DMath.Vector3D(this.x + vector, this.y + vector, this.z + vector);
            } else {
                this;
            }
        }
        /**
         * @description subtract values (sum) into this class
         * based on another vector class
         * @param {Vector3D|Number} [vector]
         * @returns {Vector3D}
         */
        sub(vector) {
            if (vector instanceof $.DMath.Vector3D) {
                return new $.DMath.Vector3D(this.x - vector.x, this.y - vector.y, this.z - vector.z);
            } else if (typeof vector === 'number') {
                return new $.DMath.Vector3D(this.x - vector, this.y - vector, this.z - vector);
            } else {
                this;
            }
        }
        /**
         * @description multiply values (sum) into this class
         * based on another vector class
         * @param {Vector3D|Number} [vector]
         * @returns {Vector3D}
         */
        mult(vector) {
            if (vector instanceof $.DMath.Vector3D) {
                return new $.DMath.Vector3D(this.x * vector.x, this.y * vector.y, this.z * vector.z);
            } else if (typeof vector === 'number') {
                return new $.DMath.Vector3D(this.x * vector, this.y * vector, this.z * vector);
            } else {
                this;
            }
        }
        /**
         * @description divide values (sum) into this class
         * based on another vector class
         * @param {Vector3D|Number} [vector]
         * @returns {Vector3D}
         */
        div(vector) {
            if (vector instanceof $.DMath.Vector3D) {
                vector.x = vector.x === 0 ? 1 : vector.x;
                vector.y = vector.y === 0 ? 1 : vector.y;
                vector.z = vector.x === 0 ? 1 : vector.z;
                return new $.DMath.Vector3D(this.x / vector.x, this.y / vector.y, this.z / vector.z);
            } else if (typeof vector === 'number') {
                vector = vector === 0 ? 1 : vector;
                return new $.DMath.Vector3D(this.x / vector, this.y / vector, this.z / vector);
            } else {
                this;
            }
        }
        /**
         * @description check out if the values is equal to another
         * vector class
         * @param {Vector3D} [vector]
         * @returns {Boolean}
         */
        equals(vector) {
            return this.x == vector.x && this.y == vector.y && this.z == vector.z;
        }
        /**
         * @description get the dot product based on another vector
         * @param {Vector3D} [vector]
         * @returns {Number}
         */
        dot(vector) {
            return this.x * vector.x + this.y * vector.y + this.z * vector.z;
        }
        /**
         * @description get the cross product based on another vector
         * @param {Vector3D} [vector]
         * @returns {Vector3D}
         */
        cross(vector) {
            return new $.DMath.Vector3D(
                this.y * vector.z - this.z * vector.y,
                this.z * vector.x - this.x * vector.z,
                this.x * vector.y - this.y * vector.x
            );
        }
        /**
         * @description get the length from this class
         * @returns {Number}
         */
        length() {
            return Math.sqrt(this.dot(this));
        }
        /**
         * @description unit all values from this class into
         * one
         * @returns {Vector3D}
         */
        unit() {
            return (this.div(this.length()));
        }
        /**
         * @description get the minimum value based on z
         * @returns {Number}
         */
        min() {
            return Math.min(Math.min(this.x, this.y), this.z);
        }
        /**
         * @description get the maximum value based on z
         * @returns {Number}
         */
        max() {
            return Math.max(Math.max(this.x, this.y), this.z);
        }
        /**
         * @description get the phi angle
         * @returns {Number}
         */
        phi() {
            return Math.asin(this.y / this.length());
        }
        /**
         * @description get the theta angle
         * @returns {Number}
         */
        theta() {
            return Math.atan2(this.z, this.x);
        }
        /**
         * @description angle into... based on another vector
         * @returns {Number}
         */
        ato(vector) {
            return Math.acos(this.dot(vector) / (this.length() * vector.length()));
        }
        /**
         * @description clone this class
         * @returns {Vector3D}
         */
        clone() {
            new $.DMath.Vector3D(this.x, this.y, this.z);
        }

        string() {
            return `x: ${$.DMath.float(this.x)}, y: ${$.DMath.float(this.y)}, z: ${$.DMath.float(this.z)}`;
        }

        array() {
            return [this.x, this.y, this.z]
        }
    };
    $.DMath.Vector3D = Vector3D;
    /**
     * @description cross produtc between vector 3d class
     * @param {Vector3D} [a]
     * @param {Vector3D} [b]
     * @param {Vector3D} [c]
     * @returns {Vector3D}
     */
    $.DMath.Vector.cross3d = function (a, b, c) {
        c.x = a.y * b.z - a.z * b.y;
        c.y = a.z * b.x - a.x * b.z;
        c.z = a.x * b.y - a.y * b.x;
        return c;
    }
    /**
     * @description unifique values
     * @param {Vector3D} [a]
     * @param {Vector3D} [b]
     * @returns {Vector3D}
     */
    $.DMath.Vector.unit3d = function (a, b) {
        let length = a.length();
        b.x = a.x / length;
        b.y = a.y / length;
        b.z = a.z / length;
        return b;
    }
    /**
     * @description create a vector based on angles
     * @param {Number} [theta]
     * @param {Number} [phi]
     * @returns {Vector3D}
     */
    $.DMath.Vector.fangle3d = function (theta, phi) {
        return new $.DMath.Vector3D(
            Math.cos(theta) * Math.cos(phi),
            Math.sin(phi),
            Math.sin(theta) * Math.cos(phi));
    }
    /**
     * @description create a random vector based on angles
     * @returns {Vector3D}
     */
    $.DMath.Vector.rand3d = function () {
        return $.DMath.Vector.fangle3d(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
    }
    /**
     * @description create a vector based on minimum value between two 
     * vectors
     * @param {Vector3D} [a]
     * @param {Vector3D} [b]
     * @returns {Vector3D}
     */
    $.DMath.Vector.min3d = function (a, b) {
        return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
    }
    /**
     * @description create a vector based on maximum value between two 
     * vectors
     * @param {Vector3D} [a]
     * @param {Vector3D} [b]
     * @returns {Vector3D}
     */
    $.DMath.Vector.max3d = function (a, b) {
        return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
    }
    /**
     * @description Linearly interpolates between two vectors.
     * @param {Vector3D} [a]
     * @param {Vector3D} [b]
     * @param {Number} [fraction] nterpolates between from and to by amount 'fraction'.
     * @returns {Vector3D}
     */
    $.DMath.Vector.lerp = function (a, b, fraction) {
        return b.sub(a).mult(fraction).add(a);
    }
    /**
     * @description between angles of two vectors
     * @param {Vector3D} [a]
     * @param {Vector3D} [b]
     * @returns {Vector3D}
     */
    $.DMath.Vector.bangle = function (a, b) {
        return a.ato(b);
    }
    // ============================================================================= 
    // [TouchInput] :touch
    // =============================================================================
    /**
     * @desc remove the limit to check out the position of mouse
     * @type {Snippet}
     * @return {function}
     */
    TouchInput._onMouseMove = function (event) {
        var x = Graphics.pageToCanvasX(event.pageX);
        var y = Graphics.pageToCanvasY(event.pageY);
        this._onMove(x, y);
    };
    // ============================================================================= 
    // [SceneManager] :sceneManager
    // ============================================================================= 
    /**
     * @desc check out if the current scene is
     * @type {Snippet}
     * @param {string} name 
     * @return {boolean}
     */
    SceneManager.prototype.isScene = function (name) {
        return SceneManager._scene && SceneManager._scene.constructor === name;
    }
    // ============================================================================= 
    /**
     * :piximanager
     * @function Pixi.Manager
     * @memberof Haya.Pixi
     * @desc manager for some functios toward PIXI
     */
    $.Pixi.Manager = function () {
        throw new Error('This is a static class');
    }
    /**
     * @desc load texture using PIXI
     * @param {object} request that:
     *      keyname shall be the ID to '$.Pixi.Manager.cache(id)'
     *      value shall be the filepath to load the texture
     * @return {boolean}
     */
    $.Pixi.Manager.load = function (request) {
        // return
        if (!$.Utils.isObject(request)) return false;
        // loader
        var loader = loader || new PIXI.loaders.Loader();
        // add
        for (name in request) {
            let pathname = request[name];
            if (!$.Pixi.TextureCache.hasOwnProperty(name)) {
                loader.add({
                    name: name,
                    url: pathname
                });
            }
        }
        // load
        loader.load(function (ld, resource) {
            for (let name in resource) {
                $.Pixi.TextureCache[name] = resource[name].texture;
            }
        })
        return true;
    }
    /**
     * @desc Rreturn to texture cache by ID | setup on '$.Pixi.Manager.load'
     * @param {string} 
     * @return {*} 
     *  return to PIXI.Texture
     *  if don't exist, return to empty.
     */
    $.Pixi.Manager.cache = function (id) {
        if ($.Pixi.TextureCache.hasOwnProperty(id)) {
            return $.Pixi.TextureCache[id];
        } else {
            return PIXI.Texture.EMPTY;
        }
    }
    // =============================================================================
    /**
     * @function $.Pixi.mirror
     * @description invert sprite (x or y)
     * @param {sprite} sprite PIXI.Sprite
     * @param {boolean} type
     *  [true] will invert by X axis
     *  [false] will invert by Y axis
     * @param {number} point to anchor set 
     */
    $.Pixi.mirror = (sprite, type, point) => {
        point = point || 1;
        type = type || 0;
        if (type) {
            sprite.anchor.x = point; /* 0 = top, 0.5 = center, 1 = bottom */
            sprite.scale.x *= -1;
        } else {
            sprite.anchor.y = point; /* 0 = top, 0.5 = center, 1 = bottom */
            sprite.scale.y *= -1;
        }
    }
    // =============================================================================
    $.Pixi.Sprite = {};
    /** 
     * :sprite
     * @class 
     * @function PBase_Sprite
     * @memberof $.Pixi.Sprite
     * @classdesc Base class for 'Sprite' manager based on PIXI.
     */
    class PBase_Sprite {
        /**
         * @constructor
         * @param {stage} stage 
         *  [setup here what stage function will take in your children, default: current scene]
         * @param {function} callback
         *  [calls after the load]
         */
        constructor(stage, callback, hash) {
            this.stage = stage || SceneManager._scene;
            this.callback = callback;
            this._hitArea_Sprite = true;
            this.hash = hash;
            this.setup();
            this.load();
            if ($.Utils.isFunction(this.callback)) this.callback.apply(this, arguments);
        }
        /**
         * @function setup
         * @description default setup of sprite
         */
        setup() {
            this._x = 0;
            this._y = 0;
            this._loaded = false;
            this._update = null;
            this.mouse = {
                x: 0,
                y: 0,
                active: false,
                over: null,
                out: null,
                trigger: {
                    on: null,
                    off: null
                },
                press: {
                    on: null,
                    off: null
                },
                repeat: {
                    on: null,
                    off: null
                },
                drag: {
                    active: false,
                    start: false,
                    on: null
                }
            };
        }
        /**
         * @function load
         * @description load the sprite.
         */
        load() {
            // after load
            this.stage.addChild(this.sprite);
            this.sprite.renderable = true;
            this.sprite.hitArea = new PIXI.Rectangle(this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height);
            this._loaded = true;
        }
        /**
         * @function dispose
         * @description destroy the sprite
         */
        dispose(destroy) {
            if (this._loaded) {
                this.sprite.destroy(destroy);
            }
        }
        /**
         * @function update
         * @description update the sprite
         */
        update() {
            // return if is not loaded
            if (this._loaded === false) return;
            // update hit area
            if (this._hitArea_Sprite === true) {
                this.sprite.hitArea.x = this.sprite.x;
                this.sprite.hitArea.y = this.sprite.y;
                this.sprite.hitArea.width = this.sprite.width;
                this.sprite.hitArea.height = this.sprite.height;
            }
            // render
            this.sprite.updateTransform();
            Graphics.render(this.sprite);
            // check up if the mouse is active and the sprite is visible
            if (this.sprite.visible && this.mouse.active) {
                // get the mouse position
                this.mouse.x = Graphics.pageToCanvasX(TouchInput.x);
                this.mouse.y = Graphics.pageToCanvasY(TouchInput.y);
                this.updateMouse();
            }
            // _update
            if ($.Utils.isFunction(this._update)) this._update.apply(this, arguments);
        }
        /**
         * @function position
         * @description display the sprite toward the screen based on $.DMath.Position.screen
         * @see $.DMath.Position.screen
         * @param {string, number} type
         */
        position(type) {
            let _position = $.DMath.Position.screen({
                type: type,
                object: this.sprite
            });
            this.sprite.x = _position.x;
            this.sprite.y = _position.y;
        }
        /**
         * @function mirror
         * @description invert sprite (x or y)
         * @param {boolean} type
         *  [true] will invert by X axis
         *  [false] will invert by Y axis
         * @param {number} point to anchor set 
         */
        mirror(type, point) {
            point = point || 1;
            type = type || 0;
            if (type) {
                this.sprite.anchor.x = point; /* 0 = top, 0.5 = center, 1 = bottom */
                this.sprite.scale.x *= -1;
            } else {
                this.sprite.anchor.y = point; /* 0 = top, 0.5 = center, 1 = bottom */
                this.sprite.scale.y *= -1;
            }
        }
        /**
         * @function mouseOver
         * @description check out if mouse is over sprite (based on hitArea)
         * @returns {Boolean} 
         */
        mouseOver() {
            if (!Graphics.isInsideCanvas(this.mouse.x, this.mouse.y)) return false;
            if (this.mouse.x.isBetween(this.sprite.hitArea.x, this.sprite.hitArea.x + this.sprite.hitArea.width)) {
                if (this.mouse.y.isBetween(this.sprite.hitArea.y, this.sprite.hitArea.y + this.sprite.hitArea.height)) {
                    return true;
                }
            }
            return false;
        }
        /**
         * @function updateMouse
         * @description update the mouse functions if is active
         */
        updateMouse() {
            // check out if the mouse is over or not
            if (this.mouseOver()) {
                // function that will be call
                if ($.Utils.isFunction(this.mouse.over)) this.mouse.over.apply(this);
                // check out if was triggered inside
                if (TouchInput.isTriggered() && $.Utils.isFunction(this.mouse.trigger.on)) this.mouse.trigger.on.apply(this);
                // check out if was pressed inside
                if (TouchInput.isLongPressed()) {
                    if (!this.mouse.drag.active) {
                        if ($.Utils.isFunction(this.mouse.press.on)) this.mouse.press.on.apply(this);
                    } else {

                        this.sprite.x = this.mouse.x - (((this.sprite.hitArea.width)) / 2)
                        this.sprite.y = this.mouse.y - (((this.sprite.hitArea.height)) / 2)
                        if ($.Utils.isFunction(this.mouse.drag.on)) this.mouse.drag.on.apply(this);
                    }
                } else {
                    if (this.mouse.drag.active) this.mouse.drag.start = false;
                }
                // check out if was repeated inside
                if (TouchInput.isRepeated() && $.Utils.isFunction(this.mouse.repeat.on)) this.mouse.repeat.on.apply(this);
            } else {
                // function that will be call
                if ($.Utils.isFunction(this.mouse.out)) this.mouse.out.apply(this);
                // check out if was triggered inside
                if (TouchInput.isTriggered() && $.Utils.isFunction(this.mouse.trigger.off)) this.mouse.trigger.off.apply(this);
                // check out if was pressed inside
                if (TouchInput.isLongPressed() && $.Utils.isFunction(this.mouse.press.off)) this.mouse.press.off.apply(this);
                // check out if was repeated inside
                if (TouchInput.isRepeated() && $.Utils.isFunction(this.mouse.repeat.off)) this.mouse.repeat.off.apply(this);
            }
        }
    };
    $.Pixi.Sprite.Base = PBase_Sprite;
    /**
     * :picture
     * @class
     * @function PBase_Picture
     * @memberof $.Pixi.Sprite
     * @classdesc class to manager picture pixi based on $.Pixi.Sprite.Base
     */
    class PBase_Picture extends PBase_Sprite {
        /**
         * @constructor
         * @param {object} hash
         *  {stage} stage: stage that will get this children
         *  {texture} texture: texture to display 
         * @param {function} callback
         *  [calls after the load]
         */
        constructor(hash, callback) {
            super(hash.stage, callback, hash);
        }
        /**
         * @function load
         * @description load the texture
         */
        load() {
            this.sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
            // there is texture?
            if (this.hash.texture) this.sprite.texture = this.hash.texture;
            // after load
            super.load.call(this);
        }
    };
    $.Pixi.Sprite.Picture = PBase_Picture;
    // =============================================================================
    /**
     * @function Mouse.position
     * @description get the position
     */
    $.Mouse.position = new Point(0, 0);
    /**
     * @function Mouse.x 
     * @description get the updated X axis position
     */
    Object.defineProperty($.Mouse, 'x', {
        get: () => {
            $.Mouse.position.x = Graphics.pageToCanvasX(TouchInput.x);
            return $.Mouse.position.x;
        },

        set: (value) => {
            $.Mouse.position.x = Graphics.pageToCanvasX(value || TouchInput.x);
            return $.Mouse.position.x;
        },

        configurable: true
    });
    /**
     * @function Mouse.y
     * @description get the updated Y axis position
     */
    Object.defineProperty($.Mouse, 'y', {
        get: () => {
            $.Mouse.position.y = Graphics.pageToCanvasY(TouchInput.y);
            return $.Mouse.position.y;
        },

        set: (value) => {
            $.Mouse.position.y = Graphics.pageToCanvasY(value || TouchInput.y);
            return $.Mouse.position.y;
        },

        configurable: true
    });
    /**
     * @function Mouse.area
     * @description check out if the mouse is on this area
     * @param {Object:Sprite:Rectangle} [object={object.x, object.y, object.width, object.height}]
     * @returns Boolean
     */
    $.Mouse.area = function (object, callback) {
        let area = ($.Mouse.x.isBetween(object.x, (object.x + object.width)) &&
            $.Mouse.y.isBetween(object.y, (object.y + object.height)));
        return $.Utils.isFunction(callback) ? callback.call(this, area) : area;
    }
    /**
     * @function Mouse.isTriggered 
     * @description Check out if the mouse is at area and if it was triggered
     * @param {Object:Sprite:Rectangle} [object={object.x, object.y, object.width, object.height}]
     * @param {Function:(value)} [callback=(area, value)] callback function, area that if is on area or
     * not; value if it was triggered or not
     * @example 
     * $.Mouse.isTriggered(sprite, (onArea, triggered) => {
     *      if (area && triggered) return 'triggered at area';
     *      if (!area && triggered) return 'triggered off area'
     * })
     */
    $.Mouse.isTriggered = function (object, callback) {
        return $.Utils.isFunction(callback) ? callback.call(this, $.Mouse.area(object), TouchInput.isTriggered()) : false;
    }
    /**
     * @function Mouse.isLongPressed 
     * @description Check out if the mouse is at area and if it was long pressed
     * @param {Object:Sprite:Rectangle} [object={object.x, object.y, object.width, object.height}]
     * @param {Function:(value)} [callback=(area, value)] callback function, area that if is on area or
     * not; value if it was triggered or not
     * @example 
     * $.Mouse.isLongPressed(sprite, (onArea, triggered) => {
     *      if (area && triggered) return 'is long pressed at area';
     *      if (!area && triggered) return 'is long pressed off area'
     * })
     */
    $.Mouse.isLongPressed = function (object, callback) {
        return $.Utils.isFunction(callback) ? callback.call(this, $.Mouse.area(object), TouchInput.isLongPressed()) : false;
    }
    // =============================================================================
    $.Plugin = function () {
        throw new Error('this is a static class')
    };
    $.Plugin._register = {};
    /**
     * @function Haya.Plugin.register
     * @description register the plugin
     * @param {object} [data] setup
     *  {string} [author:]
     *  {number} [version:]
     *  {string} [name:] plugin name
     * @returns {Boolean}
     */
    $.Plugin.register = (data) => {
        if (!($.Plugin.registred(data.author, data.name, data.version))) {
            $.Plugin._register[data.name] = {};
            $.Plugin._register[data.name].author = data.author;
            $.Plugin._register[data.name].version = data.version;
        } else {
            console.warn("This plugin is already registred!");
        }
    }
    /**
     * @function Haya.Plugin.registered
     * @description check out if already have the plugin registred
     * @param {string} [author]
     * @param {string} [name] plugin name
     * @param {number} [version]
     * @returns {boolean}
     */
    $.Plugin.registred = (author, name, version) => {
        if ($.Plugin._register.hasOwnProperty(name)) {
            if ($.Plugin._register.author == author) {
                if (!(Haya.Utils.invalid(version))) {
                    return ($.Plugin._register.version >= version);
                } else {
                    return true;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    /**
     * @function Haya.Plugin.import  
     * @description load a file code and run. This create 
     * a document 'script' and then run.
     * @param {string} [pathname]
     * @param {string|array:string} [filename]
     */
    $.Plugin.load = (pathname, filename) => {
        // script
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = false;
        // string
        if (typeof filename === 'string') {
            script.src = pathname + filename;
            script._url = pathname + filename;
            print("Loaded:", filename, pathname);
        } else if (Haya.Utils.isArray(filename)) {
            filename.forEach((value) => {
                if (typeof value === 'string') {
                    $.Plugin.load(pathname, value);
                }
            })
        }
        document.body.appendChild(script);
    }
    // =============================================================================
    /**
     * @function Cache 
     * @description used to store and allocate values to be re-used after 
     */
    class Cache {
        /**
         * @param {Object} [setup={}] 
         * @param {Number} [setup.max=50] max elements
         * @param {Boolean} [setup.oldest=true] when it is close to the max
         * the oldest element will be removed 
         */
        constructor(setup = {}) {
            this._max = $.Utils.Object.hasProperty(setup, "max", 50);
            this._oldest = $.Utils.Object.hasProperty(setup, "oldest", true);
            this.clear();
        }
        /**
         * @description get the size of the Cache
         */
        size() {
            return this._size;
        }
        /**
         * @description set a value for the cache
         * @param {*?} [value] 
         * @param {String|Number} [key=0] 
         */
        set(value, key) {
            key = key || '_default';

            if ((this._data.hasOwnProperty(key)) === false) {
                this._size++;
                if (this._oldest && this.size() >= this._max) this.refresh();
            }

            this.allocate(key, value);

            print(this._data);

            return value;
        }
        /**
         * @description get a value for a key on cache;
         * @param {Key}
         */
        get(key) {
            if (!(this._data.hasOwnProperty(key))) return undefined;
            if (Array.isArray(this._data[key])) {
                return this._data[key];
            } else if ($.Utils.isObject(this._data[key])) {
                return this._data[key];
            }
        }

        allocate(key, value) {
            if ((this._data.hasOwnProperty(key)) === false) {
                this._data[key] = value;
                return;
            } else {
                if (Array.isArray(this._data[key])) {
                    if (!(this._data[key].includes(value))) this._data[key].push(value);
                    return;
                } else if ($.Utils.isObject(this._data[key])) {
                    if (!(this._data[key].hasOwnProperty(value))) this._data[key][value] = value;
                    return;
                }
            }
        }

        clear() {
            this._size = 0;
            this._data = {};
        }

        refresh() {
            var first = Object.keys(this._data).shift();
            const data = {};
            const keys = Object.keys(this._data);
            const max = keys.length;
            let index = max;
            while (index--) {
                if (!(first === keys[index])) data[keys[index]] = this._data[keys[index]]
            }
            this._data = data;
            this._size--;
        }
    };
    $.Cache = Cache;

    // General Cache
    $.Keeper = new $.Cache({})
    // =============================================================================

    // =============================================================================
    Window_Selectable.prototype.current = function () {
        return this._data[this._index];
    }
})(Haya);
// =================================================================================
// [Route] :route
// =================================================================================
/**
 * @file route.js
 * @description use this file to access directories of this app 
 * and of the game folder
 */
var Route = {
    // groups
    _groups: {},
    // routes
    _routes: [],
};
/**
 * @description this variable will stock all namespace
 */
var Routes = {

}
/**
 * @description schema to define routes
 */
void

function (route) {
    /**
     * @method env 
     * @description get env object
     */
    route.env = function () {
        //return Core.electron.remote.process.env;
    }
    /**
     * @function findBy 
     * @description get the route defined
     * @param {String} [string] value to search by
     * @param {String} [kind] what will search for:
     * 'namespace'
     */
    route.findBy = function (string, kind = 'namespace') {
        if (kind === 'namespace') {
            return global.Routes[string]
        }
    }
    /**
     * @function set 
     * @description set a route 
     * @returns {Route}
     */
    route.set = function () {
        return new Routes();
    }
    /**
     * @function group 
     * @description set a grupo of routes
     * @param {function} [callback]
     */
    route.group = function (callback) {
        const instance = new Routes();
        callback.call(this, instance);
        return instance;
    }
    /**
     * @function prefix 
     * @description access a route by the prefix
     * @param {String} [prefix]
     */
    route.prefix = function (prefixValue) {
        if (route._groups.hasOwnProperty(prefixValue)) {
            return route._groups[prefixValue]
        } else {
            return undefined;
        }
    }
    /**
     * @class Routes
     * @classdesc control the route defined
     */
    class Routes {
        /**
         * @constructor
         */
        constructor() {
            this._routes = [];
            this._prefix = '';
            this._namespace = '';
            this._storage = {};
            // get this class
            Route._routes.push(this);
        }
        /**
         * @method setItem
         * @description stores a value
         * @param {String} variableName
         * @param {Any} variableValue 
         */
        setItem(variableName, variableValue) {
            if (variableName && variableValue) {
                this._storage[variableName] = variableValue;
            }
        }
        /**
         * @method getItem
         * @description get a stored value
         * @param {String} variableName
         */
        getItem(variableName) {
            if (this._storage.hasOwnProperty(variableName)) {
                return this._storage[variableName]
            } else {
                return undefined;
            }
        }
        /**
         * @method set 
         * @description set a new route
         * @param {String} [routeName]
         * @param {String} [url]
         * @returns {Object} return the route object
         */
        set(routeName, url) {
            // if don't have
            if (!(this.has(routeName))) {
                // new route
                const nroute = {
                    name: routeName,
                    path: url
                }
                // push
                this._routes.push(nroute)
                // return
                return nroute;
            } else {
                // get
                return this.get(routeName);
            }
        }
        /**
         * @method get 
         * @description get the route by name
         * @param {String} routeName 
         */
        get(routeName) {
            return this._routes.find(element => element.name === routeName);
        }
        /**
         * @method join
         * @description join up a route to another {url}
         * @param {String} routeName 
         * @param {String} reference route name of the reference
         * @param {String} folder 
         */
        join(routeName, reference, folder = null) {
            if (this.has(reference)) {
                //
                reference = this.get(reference);

                // new route
                const nroute = {
                    name: routeName,
                    path: Haya.File.path.join(reference.path, folder || routeName)
                }
                // push
                this._routes.push(nroute)
                // return
                return nroute;
            }
            return undefined;
        }
        /**
         * @method inject
         * @description create the folder if doesn't exist and join up the route
         * to another (mix of the method join with setFolder)
         * @param {String} routeName 
         * @param {String} reference route name of the reference
         * @returns {this}
         */
        inject(routeName, reference) {
            // if (Core.Utils.invalid(instance.hasFolder('js', 'extensions'))) instance.setFolder('js', 'extensions')
            // instance.join('extensions', 'js');
            if (Haya.Utils.invalid(this.hasFolder(reference, routeName))) this.setFolder(reference, routeName)
            this.join(routeName, reference);
            return this;
        }
        /**
         * @method has 
         * @description check out if already has the route
         * @param {String} [routeName]
         */
        has(routeName) {
            // filter
            const find = this._routes.find(element => element.name === routeName);
            // return
            return !(Haya.Utils.invalid(find));
        }
        /**
         * @method prefix 
         * @param {String} [value]
         * @description defines a prefix for each routes
         * @return {this}
         */
        prefix(value) {
            this._prefix = value;
            // in each
            this._routes.forEach(route => {
                // check if there is a prefix already
                if (route.hasOwnProperty('prefix')) {
                    route.name.replace(route.prefix, value);
                } else {
                    route.name = `${value}/${route.name}`;
                    route.prefix = value;
                }
            })
            // 
            return this;
        }
        /**
         * @method unique
         * @description if the prefix is created, use it to 
         * be able to access via 'Route.prefix()'
         * @return {this}
         */
        unique() {
            if (this._prefix.length > 0) {
                Route._groups[this._prefix] = this;
            }
            return this;
        }
        /**
         * @method routes 
         * @description return all routes
         * @return {Array}
         */
        routes() {
            return this._routes;
        }
        /**
         * @method namespace
         * @description defines the namespace of the route.
         * This will set this class to the variable 'Routes'
         * @param {String} name 
         * @return {this}
         */
        namespace(name) {
            Route.namespace(name, this);
            return this;
        }
        /**
         * @method files 
         * @description return all files inside of the route
         * @param {String} routeName this need to be registred on route
         * @param {String} [extension=undefined] if you want to filter the files
         * by extensions.
         * @example
         * Routes.App.files('home')
         * Routes.App.files('home', 'json')
         * Routes.App.files('home', 'json|js')
         * @returns {Array} each element on this <array> will be a <object> with 
         * the follow pattern:
         * {
         *  name: name of the file,
         *  filename: name of the file with extension,
         *  path: path to file,
         *  extension: extension of the file
         * }
         */
        files(routeName, extension = undefined) {
            // route
            if (!this.has(routeName)) return [];
            const route = this.get(routeName);
            // extension
            if (typeof extension === 'string') {
                extension = new RegExp(`\.(${extension})$`, "gi")
            }
            // stocker
            var _files = [];
            // list
            Haya.File.treeFile(route.path, filepath => {

                // filename
                var filename = filepath.replace(/^.*[\\\/]/, '');
                // extension
                var ext = Haya.File.path.extname(filename);
                // filter?
                if (extension) {

                    // match?
                    if (filename.match(extension)) {
                        // get the name of the filename
                        let name = filename.replace(ext, "")
                        // get
                        _files.push({
                            name: name,
                            filename: filename,
                            path: filepath,
                            extension: ext
                        })
                    }
                } else {
                    // get
                    _files.push({
                        name: filename.replace(ext, ""),
                        filename: filename,
                        path: filepath,
                        extension: ext
                    })
                }
            }, false)
            // return
            return _files;
        }
        /**
         * @method hasFile
         * @description check out if have the file on the folder
         * @param {String} routeName 
         * @param {String} filename 
         * @returns {Object|undefined}
         */
        hasFile(routeName, filename) {
            return this.files(routeName).find(file => file.filename === filename)
        }
        /**
         * @method folders 
         * @description return all directories of the route
         * @param {String} routeName this need to be registred on route
         * @param {RegExp} [filter=undefined] this is a regexp
         * @example
         * Routes.App.files('home')
         * Routes.App.files('home', /^\a/gi)
         * @return {Array} each element on this <array> will be a <object> with 
         * the follow pattern:
         * {
         *  name: name of the folder,
         *  path: path to folder,
         * }
         */
        folders(routeName, filter = undefined) {
            // route
            if (!this.has(routeName)) return [];
            const route = this.get(routeName);
            // directories
            var directories = [];
            // filter?
            if (!Haya.Utils.invalid(filter) && filter instanceof RegExp) {
                [...(
                    Haya.File.treeFolder(route.path).filter(fsource => filter.test(fsource.replace(/^.*[\\\/]/, '')))
                )].map(source => {
                    directories.push({
                        name: source.replace(/^.*[\\\/]/, ''),
                        path: source
                    })
                })
            } else {
                [...Haya.File.treeFolder(route.path)].map(source => {
                    directories.push({
                        name: source.replace(/^.*[\\\/]/, ''),
                        path: source
                    })
                })
            }
            // return
            return directories;
        }
        /**
         * @method setFolder
         * @description create a folder
         * @param {String} routeName 
         * @param {String} folderName 
         */
        setFolder(routeName, folderName) {
            if (this.hasFolder(routeName, folderName)) return this;
            Haya.File.mkdir(Haya.File.path.join(this.get(routeName).path, folderName), false)
            return this;
        }
        /**
         * @method hasFolder
         * @description check out if have the file on the folder
         * @param {String} routeName 
         * @param {String} folderName 
         * @returns {Object|undefined}
         */
        hasFolder(routeName, folderName) {
            return this.folders(routeName).find(file => file.name === folderName)
        }
        /**
         * @method plug
         * @description plug the path with a folder
         * @param {String} routeName 
         * @param {String} folder
         * @returns {String}
         */
        plug(routeName, folder) {
            return Haya.File.path.join(this.get(routeName).path, folder);
        }
    }
}(Route);
/**
 * @function namespace
 * @description set a namespace for the route name. This will bind the 
 * route to a variable.
 * @param {String} [value]
 * @param {Routes} [instance]
 */
Route.namespace = function (value, instance) {
    instance._namespace = name;
    Routes[value] = instance;
}
/**
 * @description pre-defined routes of this app
 */
Route.group((instance) => {

    const _home = require('path').dirname(process.mainModule.filename)

    // home <main.js>
    instance.set('home', _home);
    //
    print(instance, instance.get('home'))
    // [data]
    instance.join('data', 'home');
    // [audio]
    instance.join('audio', 'home');
    instance.join('bgm', 'audio');
    instance.join('bgs', 'audio');
    instance.join('me', 'audio')
    instance.join('se', 'audio')
    // [fonts]
    instance.join('fonts', 'home');
    // [movies]
    instance.join('movies', 'home');
    // [icon]
    instance.join('icon', 'home')
    // [img]
    instance.join('img', 'home');
    instance.join('animations', 'img')
    instance.join('battlebacks1', 'img')
    instance.join('battlebacks2', 'img')
    instance.join('characters', 'img')
    instance.join('enemies', 'img')
    instance.join('parallaxes', 'img')
    instance.join('pictures', 'img')
    instance.join('sv_actors', 'img')
    instance.join('sv_enemies', 'img')
    instance.join('system', 'img')
    instance.join('tilesets', 'img')
    instance.join('titles1', 'img')
    instance.join('titles2', 'img')
    // [js]
    instance.join('js', 'home');
    instance.join('plugins', 'js');
    instance.join('libs', 'js');
    instance.inject('extensions', 'js');
    instance.inject('paramaters', 'plugins');
    // [save?]
    instance.join('save', 'home');
}).namespace('Game');
Imported["Haya"] = true;