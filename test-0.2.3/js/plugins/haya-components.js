'use strict';

var Components = {
    input: {},
    progress: {},
    boolean: {},
    list: {},
    window: {},
    button: {},
    notification: {
        _id: 0,
        _pops: []
    },
    download: {}
};

/**
 * @file [haya-components.js -> Haya Components]
 * This plugin is useful to create components of HTML Elements
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.3
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * =====================================================================
 * 
 */

/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.3] Essential methods to create some components
 * 
 * @help
 * Important: Insert this plugin after the haya-el
 */

/**
 * @class Components.input.Text 
 * @description To type a single line string
 */
void

function (text) {
    // ===================================================================
    class InputName {

        constructor(setup) {
            this.setup = setup;
            this.configure()
            this.create()
            this.typeof = 'input-text';
            return this;
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                placeholder: 'your text here',
                value: '',
                id: '',
                class: 'input-container',
                classInput: '',
                classLabel: '',
                label: 'Label:',
                style: '',
                onchange: null
            }, this.setup)

            this.parent = this.setup.parent;
        }


        create() {
            // container
            this.container = El.Attr(El.create("div", this.parent), {
                "id": this.setup.id,
                "class": this.setup.class
            })

            //this.zIndex(this.setup.zIndex);

            //this.container.style = this.setup.style

            this.label = El.Attr(El.create("label", this.container), {
                "class": this.setup.classLabel,
                "for": this.container.id
            })

            if (Haya.Utils.invalid(this.setup.label)) {
                this.label.style.display = 'none';
            } else {
                this.label.innerHTML = this.setup.label;
            }


            this.input = El.Attr(El.create("input", this.container), {
                "type": "text",
                "class": this.setup.classInput,
                "placeholder": this.setup.placeholder,
                "value": this.setup.value,
                "contentEditable": true,
                "id": `${this.container.id}__input`
            })

            //this.input.style.zIndex = `${this.container.style.zIndex + 1} !important;`

            if (Haya.Utils.isFunction(this.setup.onchange)) {
                this.input.onchange = () => {
                    this.setup.onchange.call(this, this.get(), this);
                }
            }

        }


        get() {
            return this.input.value;
        }

        set(value) {
            this.input.setAttribute("value", value)
        }

        destroy() {
            El.removeChild(this.container);
        }

        zIndex(n = 500) {
            this.setup.zIndex = n;
            this.container.style = `z-index: ${this.setup.zIndex} !important;`
        }


    };
    text.Text = InputName;
}(Components.input);

/**
 * @class Components.input.TextArea
 * @descriptionTo type multiple line string
 */
void

function (textArea) {
    class TextArea {
        constructor(setup) {
            this.setup = setup;
            this.configure()
            this.create()
            this.typeof = 'textarea'
            return this;
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                placeholder: 'your text here',
                id: '',
                class: 'input-container',
                classLabel: '',
                classInput: '',
                label: 'label:',
                cols: 60,
                rows: 2
            }, this.setup)

            this.parent = this.setup.parent;
        }

        create() {
            // container
            this.container = El.Attr(El.create("div", this.parent), {
                "id": this.setup.id,
                "class": this.setup.class
            })

            this.label = El.Attr(El.create("label", this.container), {
                "class": this.setup.classLabel,
                "for": this.container.id
            })

            this.label.innerHTML = this.setup.label;

            this.input = El.Attr(El.create("textarea", this.container), {
                "type": "text",
                "class": this.setup.classInput,
                "placeholder": this.setup.placeholder,
                "cols": this.setup.cols,
                "rows": this.setup.rows,
                "contentEditable": true
            })
        }


        get() {
            return this.input.value;
        }

        set(value) {
            this.input.value = Array.isArray(value) ? value.join("\n") : value;
        }
    };
    textArea.TextArea = TextArea;
}(Components.input);
/**
 * @class Components.input.Number
 * @description type number
 */
void

function (number) {
    class InputNumber {
        constructor(setup) {
            this.setup = setup;
            this.configure()
            this.create()
            this.typeof = 'number';
            return this;
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                id: 'number',
                class: 'number-container',
                classInput: '',
                classLabel: '',
                label: 'default',
                min: 1,
                max: 99,
                default: 2,
                format: 'integer',
                pattern: null,
                onchange: null
            }, this.setup)

            this.parent = this.setup.parent;
        }

        create() {
            // container
            this.container = El.Attr(El.create("div", this.parent), {
                "id": this.setup.id,
                "class": this.setup.class
            })

            this.label = El.Attr(El.create("label", this.container), {
                "class": this.setup.classLabel,
                "for": this.setup.id
            })

            this.label.innerHTML = this.setup.label;

            this.input = El.Attr(El.create("input", this.container), {
                "type": "number",
                "class": this.setup.classInput,
                "value": this.setup.default,
                "min": this.setup.min,
                "max": this.setup.max,
                "pattern": this.setup.pattern
            })

            if (Haya.Utils.isFunction(this.setup.onchange)) {
                this.input.onchange = () => {
                    this.setup.onchange.call(this, this.get(), this);
                }
            }
        }


        get() {
            return this.setup.format === 'integer' ? parseInt(this.input.value) : parseFloat(this.input.value)
        }

        set(value) {
            this.input.value = String(value) || this.input.value;
        }
    };
    number.Number = InputNumber;
}(Components.input);

/**
 * @class Components.input.Range
 * 
 */
void

function (range) {
    class NumberRange {
        constructor(setup) {
            this.setup = setup;
            this.configure()
            this.create()
            this.typeof = 'range'
            return this;
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                id: '',
                class: 'range-container',
                classInput: '',
                classLabel: '',
                label: 'default',
                min: 1,
                max: 99,
                default: 2,
                step: 1,
                format: null,
                onchange: null
            }, this.setup)

            this.parent = this.setup.parent;
        }

        create() {
            // container
            this.container = El.Attr(El.create("div", this.parent), {
                "id": this.setup.id,
                "class": this.setup.class
            })

            this.label = El.Attr(El.create("label", this.container), {
                "class": this.setup.classLabel,
                "for": this.setup.id
            })



            this.input = El.Attr(El.create("input", this.container), {
                "type": "range",
                "class": this.setup.classInput,
                "value": this.setup.default,
                "min": this.setup.min,
                "max": this.setup.max,
                "step": this.setup.step
            })


            this.label.innerHTML = this.setup.label.replace(/(&value)/gim, this.input.value);

            this.input.onchange = () => {
                let value = this.input.value;


                if (Haya.Utils.isFunction(this.setup.format)) value = this.setup.format.call(this, value);
                this.label.innerHTML = this.setup.label.replace(/(&value)/gim, value);
                if (Haya.Utils.isFunction(this.setup.onchange)) this.setup.onchange.call(this, value, this);
            }
        }


        get() {
            return this.input.value;
        }

        set(value) {
            this.input.value = value || this.input.value;
            this.label.innerHTML = this.setup.label.replace(/(&value)/gim, this.input.value);
        }
    };
    range.Range = NumberRange;
}(Components.input);

// /**
//  * @class Components.input.Position
//  * 
//  */
// void 

// function (position) {

//     class CompPosition {

//         constructor (setup) {
//             this.setup = setup;
//             this.configure();
//             this.create()
//             return this;
//         }

//         configure () {
//             this.setup({
//                 parent: document.body,
//                 target: new Point(0, 0), 
//                 class: 'input-container',

//             }, this.setup)
//         }

//     }

//     position.Position = CompPosition;

// }(Components.input)

// ! ==========================================================================================

/**
 * @class Components.progress.Basic
 * 
 */
void

function (progress_basic) {
    class Progress {
        constructor(setup) {
            this.setup = setup;
            this.configure()
            this.create()
            this.typeof = 'progress-basic'
            return this;
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                class: 'number-container',
                classBar: 'progress_bar',
                classBackground: 'progress_background',
                label: 'defauçt',
                min: 1,
                max: 99,
                width: 96
            }, this.setup)

            this.parent = this.setup.parent;
            this.value = 1;
        }

        create() {
            // container
            this.container = El.Attr(El.create("div", this.parent), {
                "id": this.setup.id,
                "class": this.setup.class,
                "name": this.name
            })

            this.label = El.Attr(El.create("label", this.container), {
                "class": this.setup.classLabel
            })


            this.set();
        }


        get() {
            return this.value;
        }

        set(value) {
            this.label.innerHTML = this.setup.label.replace(/(&value)/gim, value);
            this.value = value;
        }
    };
    progress_basic.Basic = Progress;
}(Components.progress);

// ! ==========================================================================================

/**
 * @class Components.boolean.Checkbox
 * @description check
 */
void

function (checkbox) {
    class Checkbox {
        constructor(setup) {
            this.setup = setup;
            this.configure()
            this.create()
            this.typeof = 'checkbox';
            return this;
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                class: 'checkbox-container',
                classInput: '',
                classLabel: '',
                checked: false,
                onchange: null
            }, this.setup)

            this.parent = this.setup.parent;
        }

        create() {
            // container
            this.container = El.Attr(El.create("div", this.parent), {
                "id": this.setup.id,
                "class": this.setup.class
            })

            this.input = El.Attr(El.create("input", this.container), {
                "type": "checkbox",
                "class": this.setup.classInput
            })

            this.set(this.setup.checked);

            this.label = El.Attr(El.create("label", this.container), {
                "class": this.setup.classLabel
            })

            this.label.innerHTML = this.setup.label;

            if (Haya.Utils.isFunction(this.setup.onchange)) {
                this.input.onchange = () => {
                    this.setup.onchange.call(this, this.checked(), this)
                }
            }

        }


        get() {
            return this.input.checked;
        }

        checked() {
            return this.input.checked;
        }

        set(boolean = true) {
            if (boolean) {
                this.input.setAttribute("checked", true);
            } else {
                this.input.removeAttribute("checked");
            }
        }

        onchange(callback) {
            this.input.onchange = () => {
                if (Haya.Utils.isFunction(callback)) {
                    const self = this;
                    callback.call(this, self)
                };
            }
        }

    };
    checkbox.Checkbox = Checkbox;
}(Components.boolean);

// ! ==========================================================================================

/**
 * @class Components.list.Select
 * 
 */
void

function (option) {
    class ListSelect {

        constructor(setup) {
            this.setup = setup;
            this.configure()
            this.create()
            this.typeof = 'select'
            this.open();
            return this;
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                id: '',
                class: 'select-container',
                classSelect: '',
                classLabel: '',
                classOption: '',
                data: [{
                    label: "example",
                    value: 1
                }],
                dataLabel: 'label',
                dataValue: 'value',
                onchange: null,
                onhover: null
            }, this.setup)

            this.parent = this.setup.parent;
            this.data = this.setup.data;
            this.options = []
        }

        create() {
            // container
            this.container = El.Attr(El.create("div", this.parent), {
                "id": this.setup.id,
                "class": this.setup.class,
                "name": this.name
            })

            this.label = El.Attr(El.create("label", this.container), {
                "class": this.setup.classLabel,
            })

            this.label.innerHTML = this.setup.label;

            this.select = El.Attr(El.create("select", this.container), {
                "class": this.setup.classSelect
            })

            if (Haya.Utils.isFunction(this.setup.onchange)) this.select.onchange = () => {
                this.setup.onchange.call(this, this.get())
            };

            // create options
            this.setOptions()
        }

        setOptions() {
            El.removeChild(this.select);
            this.options.length = 0;

            if (this.data.length > 0) {
                this.data.forEach(option => {
                    const element = El.Attr(El.create("option", this.select), {
                        "value": option[this.setup.dataValue]
                    })

                    element.innerHTML = option[this.setup.dataLabel]

                    if (Haya.Utils.isFunction(this.setup.onhover)) {
                        element.onmouseover = () => {
                            this.setup.onhover.call(this, option, element, this)
                        }
                    } else {
                        element.onmouseover = () => {
                            print(option)
                        }
                    }

                    this.options = [...this.options, element]
                })
            }
        }

        choose(value) {
            const option = this.options.find(opt => opt.value === String(value)) //.pop()

            //console.log(option, value);

            if (option) {
                //const index = this.options.indexOf(option);
                const index = option.index;
                //console.log(index, option);

                this.select.value = index;
                this.select.selectIndex = index;
            };
            return option;
        }

        get() {
            return this.select.value;
        }

        current() {
            return this.data.find(el => el[this.setup.dataValue] === +this.get());
        }

        open() {
            El.removeClass(this.container, 'nested')
            this.isOpen = true;
            return this.isOpen;
        }

        close() {
            El.addClass(this.container, 'nested')
            this.isOpen = false;
            return this.isOpen;
        }
    };
    option.Select = ListSelect;
}(Components.list);


/**
 * @class Components.list.Basic
 */

void

function (basic) {

    // ===================================================================
    class ListBasic {
        /**
         * @constructor
         */
        constructor(setup) {
            this.setup = setup || {};
            this.configure();
            this.create();
            this.typeof = 'list'
            return this;
        }


        configure() {

            this.setup = Object.assign({
                class: 'tree',
                name: 'tree',
                parent: document.body,
                data: [],
                onclick: null,
                icon: null,
                property: 'label',
                onhover: null
            }, this.setup)

            this.items = []
            this.parent = this.setup.parent
            this.data = this.setup.data
            this.stack = [];
        }

        create() {

            if (this.data.length < 1) return;
            this.data.forEach((object) => {

                // create tag
                const item = El.Attr(El.create("div", this.setup.parent), {
                    "class": this.setup.class
                })

                if (typeof this.setup.icon === 'string') {
                    if (Haya.File.exist(Routes.Map.plug('editor', this.setup.icon), false)) {
                        El.Attr(El.create("img", item), {
                            "src": Routes.Map.plug('editor', this.setup.icon),
                            "class": "tree-icon"
                        })
                    }
                }

                El.Attr(El.create("label", item), {
                    "class": "tree-label"
                }).innerHTML = object[this.setup.property];

                item.onclick = () => {
                    if (Haya.Utils.isFunction(this.setup.onclick)) this.setup.onclick.call(this, object, item)
                }

                if (Haya.Utils.isFunction(this.setup.onhover)) {
                    item.onmouseover = () => {
                        this.setup.onhover.call(this, object, item, this)
                    }
                }

                // create subtree
                //this.create_subtree(object.tag, tag);

                this.items = [...this.items, item]

            })
        }

        refresh() {
            El.removeChild(this.setup.parent)
            this.items = []
        }
    };
    basic.Basic = ListBasic;
}(Components.list);

/**
 * @class Components.list.GridCol
 */

void

function (gridCol) {

    // ===================================================================
    class ListGridCol {
        /**
         * @constructor
         */
        constructor(setup) {
            this.setup = setup || {};
            this.configure();
            this.create();
            this.typeof = 'grid-col'
            return this;
        }


        configure() {

            this.setup = Object.assign({
                class: 'grid-col',
                name: 'tree',
                parent: document.body,
                data: [],
                onclick: null,
                icon: null,
                property: 'label'
            }, this.setup)

            this.items = []
            this.parent = this.setup.parent
            this.data = this.setup.data
        }

        create() {

            if (this.data.length < 1) return;
            this.data.forEach((object) => {

            })
        }

        refresh() {
            El.removeChild(this.setup.parent)
            this.items = []
        }
    };
    gridCol.GridCol = ListGridCol;
}(Components.list);

// ! ==========================================================================================

/**
 * @class Components.window.Modal
 * 
 */
void

function (modal) {
    class Window_Modal {

        constructor(setup) {
            this.setup = setup;
            this.configure();
            this.create();
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                id: '',
                components: [],
                class: "window-modal",
                open: true
            }, this.setup)

            this.parent = this.setup.parent;
            this.components = this.setup.components
            this.typeof = 'modal'
        }

        create() {
            this.window = El.Attr(El.create("div", this.parent), {
                "class": this.setup.class,
                "id": this.id
            })

            if (!this.setup.open) return this.close();

            this.draw();
        }

        refresh() {
            this.components.length = 0;
            El.removeChild(this.window)
        }

        draw() {
            if (this.components.length > 0) {
                this.components.forEach(value => {
                    var setup = {}
                    let keys;
                    Haya.Utils.Object.hasProperty(value, "parent", this.window);
                    for (keys in value) {
                        if (keys !== 'component') {
                            setup[keys] = Components.attr(value[keys]);
                        }

                    }

                    const comp = Components.id(value.component, setup)
                    comp._window = this;
                    this.components.push(comp);
                })
            }
        }

        open() {
            El.removeClass(this.window, "nested")

        }

        close() {
            El.addClass(this.window, "nested")
        }

    };
    modal.Modal = Window_Modal;
}(Components.window);

/**
 * @class Components.window.Basic
 */

void

function (basic) {
    class Window {

        constructor(setup) {
            this.setup = setup;
            this.configure();
            this.create();
            this.typeof = 'window';
            return this;
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                id: '',
                class: 'window-classic wsize1 wcenter wpriority',
                classHeader: 'wheader',
                onclose: null,
                components: [],
                title: 'Window'
            }, this.setup)


            this.parent = this.setup.parent;
            this.components = this.setup.components;
        }

        create() {
            this.window = El.Attr(El.create("section", this.parent), {
                "class": this.setup.class,
                "id": this.id
            })

            // this.create_header();

            // this.create_components();

            this.close();
        }

        draw() {
            this.create_header();

            this.create_components();
        }

        create_header() {
            this.header = El.Attr(El.create('section', this.window), {
                'class': this.setup.classHeader
            })

            this.title = El.Attr(El.create('label', this.header), {

            })

            this.title.innerHTML = this.setup.title;

            this.btn_close = new Components.button.Basic({
                label: '&times;',
                parent: this.header,
                onclick: () => {
                    if (Haya.Utils.isFunction(this.setup.onclose)) {
                        this.setup.onclose.call(this, this.window);
                    } else {
                        this.close();
                    }
                }
            })
        }

        create_components() {

            if (this.components.length > 0) {
                this.components.forEach(value => {
                    var setup = {}
                    let keys;
                    Haya.Utils.Object.hasProperty(value, "parent", this.window);
                    for (keys in value) {
                        if (keys !== 'component') {
                            setup[keys] = Components.attr(value[keys]);
                        }

                    }

                    const comp = Components.id(value.component, setup)

                    if (value.component === 'notification') {
                        Components.notification._pops[comp._nid] = comp;
                    }

                    comp._window = this;
                    this.components.push(comp);
                })
            }
        }

        refresh() {
            El.removeChild(this.header);
            El.removeChild(this.window)
            this.components.length = 0;
        }

        window() {
            return this.window;
        }

        open() {
            El.removeClass(this.window, "nested")

        }

        close() {
            El.addClass(this.window, "nested")
        }

    };
    basic.Basic = Window;
}(Components.window);

// ! ==========================================================================================

/**
 * @class Components.button.Basic
 */
void

function (basic) {
    class ButtonBasic {

        constructor(setup) {
            this.setup = setup;
            this.configure()
            this.create()
            this.typeof = 'button';
            return this;
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                id: '',
                class: 'btn-standard',
                label: 'button name',
                value: 0,
                type: 'submit',
                onclick: null
            }, this.setup)

            this.parent = this.setup.parent
        }

        create() {
            this.button = El.Attr(El.create("button", this.parent), {
                "id": this.setup.id,
                "class": this.setup.class,
                "value": this.setup.value,
                "type": this.setup.type
            })

            if (typeof this.setup.onclick === 'string') {
                this.button.setAttribute('onclick', this.setup.onclick);
            } else if (Haya.Utils.isFunction(this.setup.onclick)) {
                this.button.onclick = () => {
                    this.setup.onclick.call(this);
                }
            }



            this.button.innerHTML = this.setup.label;
        }


        get() {
            return this.button.value;
        }

    };

    basic.Basic = ButtonBasic;
}(Components.button);

// ! ==========================================================================================

/**
 * @class Components.notification.Popup
 */
void

function (popup) {
    class PopupNotification {

        constructor(setup) {
            Components.notification._id++;
            this.setup = setup;
            this.configure()
            this.create();
            this.counter();
            if (Haya.Utils.isFunction(this.setup.callback)) this.setup.callback.call(this);
            return this;
        }

        configure() {
            this.setup = Object.assign({
                parent: document.body,
                class: 'notification notification-default',
                classDestroy: 'notification-destroy',
                timeDestroy: 500,
                position: 'topCenter',
                time: 3000,
                pause: false,
                label: 'Text',
                icon: null,
                components: {},
                callback: null
            }, this.setup)

            this.parent = this.setup.parent;
            this.time = this.setup.time
            this._nid = Components.notification._id;
            this.id = `notification_${this._nid}`;
            this.components = [];
            this.now = new Date();
        }

        destroy(forced = false) {
            if (forced === true) {
                this.continue()
            };
            if (this.paused()) return false;
            El.addClass(this.container, this.setup.classDestroy);
            setTimeout(() => {
                El.removeChild(this.container);
                this.parent.removeChild(this.container);
                Components.notification._pops[this._nid] = null;
                Components.notification._pops = Components.notification._pops.filter(popup => !Haya.Utils.invalid(popup));
            }, this.setup.timeDestroy || 550)
            return true;
        }

        counter() {
            if (this.paused()) return false;
            this.timeoutId = setTimeout(() => {
                this.destroy();
            }, this.time)
            return true;
        }

        create() {
            this.container = El.Attr(El.create("notification", this.parent), {
                "class": this.setup.class,
                "id": this.id
            })

            if (this.setup.position.length > 0) {
                El.addClass(this.container, this.setup.position);
            }

            // icon?
            if (typeof this.setup.icon === 'string') {
                console.log(Routes.Map.plug('editor', this.setup.icon), this.setup.icon);

                if (Haya.File.exist(Routes.Map.plug('editor', this.setup.icon), false)) {
                    this.icon = El.Attr(El.create("img", this.container), {
                        "class": "notification-icon",
                        "src": Routes.Map.plug('editor', this.setup.icon)
                    })
                }
            }
            // label
            this.label = El.Attr(El.create("label", this.container), {
                "class": "notification-label"
            })

            this.label.innerHTML = this.setup.label;
            // components
            this.create_components();
        }

        create_components() {

            if (this.setup.components.length > 0) {
                this.setup.components.forEach(value => {
                    var setup = {}
                    let keys;
                    Haya.Utils.Object.hasProperty(value, "parent", `@El.id(${this.id})`);
                    for (keys in value) {
                        if (keys !== 'component') {
                            setup[keys] = Components.attr(value[keys]);
                        }

                    }

                    const comp = Components.id(value.component, setup)
                    comp._popup = this;
                    this.components.push(comp);
                })
            }
        }

        /**
         * @method paused 
         * @description check out if is paused the popup
         */
        paused() {
            return this.setup.pause;
        }
        /**
         * @method pause 
         * @description pause the popup
         */
        pause() {
            this.setup.pause = true;
            clearTimeout(this.timeoutId);
            return this;
        }
        /**
         * @method continue 
         * @description continue the popup
         */
        continue () {
            this.setup.pause = false;
            return this;
        }



    };
    popup.Popup = PopupNotification;
}(Components.notification);

/**
 * @function Components.notification.Create 
 * @description create a popup
 */
Components.notification.Create = async function (setup) {
    const popup = new Components.notification.Popup(setup)
    Components.notification._pops[popup._nid] = popup;
}



// ! ==========================================================================================


/**
 * @function Components.id()
 * @description set a component by his id
 */

Components.id = function (id, setup) {
    const component = Components.get_component(id);
    if (!component) return false;
    return new component(setup);
}

/**
 * @function Components.get_component
 */
Components.get_component = function (id) {
    return {
        'text': Components.input.Text,
        'textarea': Components.input.TextArea,
        'number': Components.input.Number,
        'range': Components.input.Range,
        'checkbox': Components.boolean.Checkbox,
        'select': Components.list.Select,
        'modal': Components.window.Modal,
        'window': Components.window.Basic,
        'list-basic': Components.list.Basic,
        'button': Components.button.Basic,
        'progress-basic': Components.progress.Basic,
        'grid-col': Components.list.GridCol,
        'notification': Components.notification.Popup
    } [id];
}

/**
 * @function Components.attr 
 */
Components.attr = function (setup) {
    if (typeof setup === 'string') {
        if (/^\@/gi.test(setup)) {
            return eval(setup.replace(/^\@/gi, ""));
        } else {
            return setup;
        }
    } else {
        return setup;
    }
}

/**
 * @function dt_prop
 * @description return the property value
 * @param {Object} dataItem 
 * @param {String|Array|Object} property
 * @returns {Object} return to the value of the property or
 * undefined, if doesn't exist
 */
Components.dt_prop = function (dataItem, property) {
    if (Haya.Utils.invalid(dataItem)) return;
    //console.log(dataItem, property, 'dt_prop');

    // array?
    if (Array.isArray(property)) {
        return dataItem.hasOwnProperty(property[0]) ? dataItem[property[0]][property[1]] : undefined;
    } else if (typeof property === 'object' && property.hasOwnProperty("key") && property.hasOwnProperty("value")) {
        return dataItem.hasOwnProperty(property.key) ? dataItem[property.key][property.value] : undefined;
    } else if (typeof property === 'string') {
        if (/^\s?\@/gmi.test(property)) {
            try {
                return eval(property.replace(/^\s?\@/gmi, ""))
            } catch (err) {}
        } else {
            return dataItem[property];
        }
    }
}
/**
 * @function st_prop 
 * @description set the property value
 * @param {Object} dataItem 
 * @param {String|Array|Object} property 
 * @param {Any} value 
 */
Components.st_prop = function (dataItem, property, value) {
    if (Haya.Utils.invalid(dataItem)) return;
    // types
    if (Array.isArray(property)) {
        if (dataItem.hasOwnProperty(property[0])) {
            return dataItem[property[0]][property[1]] = Components.attr(value);
        } else {
            return undefined;
        }
    } else if (typeof property === 'object' && property.hasOwnProperty("key") && property.hasOwnProperty("value")) {
        if (dataItem.hasOwnProperty(property.key)) {
            return dataItem[property.key][property.value] = Components.attr(value);
        } else {
            return undefined;
        }
    } else if (typeof property === 'string') {
        if (/^\s?\@/gmi.test(property)) {
            try {
                const prop = eval(property.replace(/^\s?\@/gmi, ""))
                dataItem[prop] = Components.attr(value);
            } catch (err) {
                return undefined;
            }
        } else {
            return dataItem[property] = Components.attr(value);
        }
    }
}
/**
 * @function onchange 
 * @description each document has his unique 'onchange'
 */
Components.onchange = function (comp, callback) {
    if (!Haya.Utils.isFunction(callback)) return false;
    if (comp.onchange) {
        comp.onchange(callback)
        return true;
    } else {
        return false;
    }
}
/**
 * @function typeof 
 * @description return the proper value towards typeof
 * @param {Object} value 
 * @param {String} type
 */
Components.typeof = function (value, type) {
    const kinds = {
        'boolean': !!value
    } [type];

    return kinds || value;
}