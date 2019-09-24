
'use strict';
/**
 * @file [haya-gui.js -> Haya Gui]
 * This plugin is a simple GUI library that uses PIXI as 
 * main componenet.
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.2
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * @requires haya-core 
 * =====================================================================
 * 
 */
Haya.GUI = {};
/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.2] Basic GUI library
 * 
 * @help
 *   Important: Insert this plugin after the haya-core
 * This is a plugin in which contain several simple tools to create
 * GUI elements. It's help you to create menu and so on, in which
 * their mission is to edit something
 */

void function (gui) {
    // =============================================================================
    gui.Themes = {};
    gui.Button = {};
    // =============================================================================
    gui.Themes.load = function (name) {
        var data = Haya.File.json(Haya.File.local(`img/gui/${name}/data.json`));
        // load all sprites
        var sprite = {};
        Haya.File.list(`img/gui/${name}`, (filename) => {
            // replace filename
            let _filename = filename.replace(/^.*[\\\/]/, '');
            // load just '.json' file
            if (_filename.match(/\.png$/gi)) {
                sprite[_filename] = new PIXI.Texture.fromImage(filename)
            }
        })
        //
        return { data: data, sprite: sprite };
    }

    gui.Themes.default = gui.Themes.load("default")
}(Haya.GUI);
// =============================================================================
/**
 * @function Haya.GUI.Button 
 * @description create a simple button with this class-function
 * @param {Object} [setup={}] main parameter
 * @param {Function} [setup.callback=null] calls a function after the creation
 * @param {Function} [setup.callop=null] calls a function on the update 
 * @param {Function} [setup.click=null] calls a function after the click on the button
 * @param {Boolean} [setup.active=true] if the button is active or not
 * @param {Number} [setup.width=texture.width] 
 * @param {Number} [setup.height=texture.height]
 * @param {Array} [setup.position=[0,0]]
 * @param {Object} [setup.theme=default]
 * @param {String} [setup.text="BUTTON"]
 * @param {PIXI.Texture} [setup.texture=null]
 */
void function (button) {
    // =============================================================================
    class Button extends PIXI.Container {

        constructor(setup) {
            super();
            this.setup = setup;
            this.configure();
            this.create();
            if (this.setup.stage !== null) this.setup.stage.addChild(this);
            if (Haya.Utils.isFunction(this.setup.callback)) this.setup.callback.call(this);
            this.update();
        }

        configure() {
            this.theme = Haya.Utils.Object.hasProperty(this.setup, "theme", Haya.GUI.Themes.default);
            this.active = Haya.Utils.Object.hasProperty(this.setup, "active", true)
            Haya.Utils.Object.hasProperty(this.setup, "width", null)
            Haya.Utils.Object.hasProperty(this.setup, "height", null)
            Haya.Utils.Object.hasProperty(this.setup, "position", [0, 0]);
            Haya.Utils.Object.hasProperty(this.setup, "text", "BUTTON")
            Haya.Utils.Object.hasProperty(this.setup, "texture", null)
            Haya.Utils.Object.hasProperty(this.setup, "stage", null)

            this._area = false;
            this._triggered = false;
        }

        create() {

            this.background = new PIXI.Sprite(this.setup.texture || this.theme.sprite["btn.default.png"])
            this.background.width = this.setup.width || this.background.width;
            this.background.height = this.setup.height || this.background.height;
            this.addChild(this.background);

            this.label = new PIXI.Text(this.setup.text, this.theme.data.button.font.default)
            this.label.position.set(-1, -1);
            this.addChild(this.label);

            this.rect = new PIXI.Rectangle(-10, -10, this.background.width, this.background.height);

            this.x = this.setup.position[0];
            this.y = this.setup.position[1]
        }

        update() {
            if (this.visible === false) return;

            this.urect();

            if (this.active === true) {
                Haya.Mouse.isTriggered(this.rect, (area, isTriggered) => {
                    this._triggered = isTriggered && area;
                    this._area = area;
                    if (Haya.Utils.isFunction(this.setup.click) && this._triggered) {
                        this.setup.click.call(this);
                        this._triggered = false;
                    }
                    this.background.alpha = this._area ? 0.75 : 1;
                })
            }

            if (Haya.Utils.isFunction(this.setup.callop)) this.setup.callop.call(this);
        }

        text(value = "") {
            if (value !== this.label.text) {
                this.label.text = value;
            }
        }

        urect() {
            if (
                this.rect.x !== this.x || this.rect.y !== this.y ||
                this.rect.width !== this.background.width || this.rect.height !== this.background.height
            ) {
                this.rect.x = this.x;
                this.rect.y = this.y;
                this.rect.width = this.background.width;
                this.rect.height = this.background.height;

                this.label.position.set(...Haya.DMath.Position.sprite({ type: "center", a: this.label, b: this.background }).array())
            };
        }
    }; button.Button = Button;
    // =============================================================================
}(Haya.GUI);
// =============================================================================
void function (checkbox) {
    'use strict';
    // =============================================================================
    class Checkbox extends PIXI.Container {
        /**
        * 
        * @param {Object} setup 
        * setup:callback | call a function after create the checkbox
        * setup:callop   | call a function on the update section
        * setup:active #default is true
        * setup:position
        * setup:theme #default
        * setup:action #function when triggered
        */
        constructor(setup = {}) {
            super();
            this.setup = setup;
            this.setup.position = this.setup.position || [0, 0];
            this.isTriggered = false;
            this.active = this.setup.active || true;
            this.isArea = false;
            this.theme = this.setup.theme || Haya.GUI.Themes.default;
            this.create();
            if (Haya.Utils.isFunction(this.setup.callback)) this.setup.callback.call(this);
        }

        create() {
            // background
            this.sprite = new PIXI.Sprite(this.theme.sprite["radion.off.png"])
            if (Array.isArray(this.setup.position)) {
                this.sprite.position.set(
                    this.setup.position[0],
                    this.setup.position[1]
                )
            } else if (this.setup.position instanceof Point) {
                this.sprite.x = this.setup.position.x;
                this.sprite.y = this.setup.position.y;
            }
            this.addChild(this.sprite);
        }

        update() {
            if (this.sprite.visible === false) return;
            Haya.Mouse.isTriggered(this.sprite, (area, triggered) => {
                this.isTriggered = triggered && area && this.active
                if (Haya.Utils.isFunction(this.setup.action) && this.isTriggered) {
                    this.setup.action.apply(this);
                    this.isTriggered = false;
                }
                this.isArea = area;

            })
            if (this.active === true) this.sprite.alpha = this.isArea ? 0.75 : 1;
            if (Haya.Utils.isFunction(this.setup.callop)) this.setup.callop.call(this);
        }
    }; checkbox.Checkbox = Checkbox;
}(Haya.GUI)
/**
 * @function Haya.GUI.ScrollBox 
 * @description create a window-scrollbox content
 * @param {Object} [setup={}]
 * @param {Function} [setup.callback=null] calls a function after the creation
 * @param {Function} [setup.callop=null] calls a function on the update 
 * @param {Boolean} [setup.active=true] if is active or not
 * @param {Number} [setup.width=128] 
 * @param {Number} [setup.height=196]
 * @param {Array} [setup.position=[0,0]]
 * @param {Array} [setup.list=[]] list of content
 * @param {String} [setup.align="center"] alignment of the content
 * @param {Number} [setup.spacing=10]
 * @param {Number} [setup.max=4]
 */
void function (scrollbox) {
    class ScrollBox extends PIXI.Container {

        constructor(setup={}) {
            super();
            this.setup = setup;
            this.configure();
            this.create();
            //this.x = this.setup.position[0];
            //this.y = this.setup.position[1];
            this.clist();
            this.update();
        }

        update() {
            if (this.visible === false) return;

            this.ucontent();

            this.index = Haya.DMath.wheelID(this.index, 0, (this.list.length - 1), 1, (current, dir) => {
                
                print(current, dir)

                if (current >= (this.list.length - 1) && dir === 1) {
                    this.list.map((element, ilist) => {
                        if (ilist === 0) {
                            element.y = this.window.y;
                        } else {
                            element.y = (this.list[ilist - 1].y + this.list[ilist - 1].height) + this.setup.spacing; 
                        }
                    })
                    return;
                } else if (current <= 0 && dir === -1) {
                    return;
                }

                this.list.map((value, index) => {
                    if (value) {
                        value.y -= (this.list[index < 1 ? this.list.length - 1 : index - 1].height + this.setup.spacing) * dir
                    }
                })


            }, "alt", 1, 20, true);
        }

        ucontent() {
            if (this.list.length < 1) return;
            
            let ilist = 0;

            for (; ilist < this.list.length; ilist++) {

                var element = this.list[ilist]

                if (element) {
                    element.visible = this.inside(element);
                    element.update();
                }
            }
        }

        configure() {
            this.theme = Haya.Utils.Object.hasProperty(this.setup, "theme", Haya.GUI.Themes.default);
            this.active = Haya.Utils.Object.hasProperty(this.setup, "active", true)
            this.list = Haya.Utils.Object.hasProperty(this.setup, "list", [])
            Haya.Utils.Object.hasProperty(this.setup, "width", 128)
            Haya.Utils.Object.hasProperty(this.setup, "height", 196)
            Haya.Utils.Object.hasProperty(this.setup, "position", [0, 0]);
            Haya.Utils.Object.hasProperty(this.setup, "stage", null)
            Haya.Utils.Object.hasProperty(this.setup, "spacing", 10)
            Haya.Utils.Object.hasProperty(this.setup, "max", 4)


            // index of the context
            this.index = 0;

            this.oindex = 0;
        }

        create() {
            this.window = new PIXI.Graphics();
            this.window.beginFill(0, 0x000000)
            this.window.drawRect(0, 0, this.setup.width, this.setup.height);
            this.window.endFill();
            this.addChild(this.window)
            this.window.position.set(this.setup.position[0],this.setup.position[1])
        }

        clist() {
            if (this.list.length < 1) return;
            
            let ilist = 0;

            for (; ilist < this.list.length; ilist++) {

                var element = this.list[ilist]

                element.mask = this.window;

                element.x = this.window.x;

                if (ilist === 0) {
                    element.y = this.window.y;
                } else {
                    element.y = (this.list[ilist - 1].y + this.list[ilist - 1].height) + this.setup.spacing; 
                }

                element.visible = this.inside(element);


                this.addChild(element);
            }
        }

        inside(element) {
            return (
                (element.x.isBetween(this.window.x, this.window.x+this.window.width)) &&
                (element.y.isBetween(this.window.y, this.window.y+this.window.width))
            )
        }

    }; scrollbox.ScrollBox = ScrollBox;
}(Haya.GUI)
// =============================================================================
void function (folderManager) {
    'use strict';
    // =============================================================================
    class FolderManager extends PIXI.Container {
        /**
         * 
         * @param {Object} setup 
         * setup:folder #folder name
         * setup:filetype 
         * setup:preview #preview the file by clicking up | ONLY FOR PICTURES
         * setup:action #callback when clicked on the file
         * setup:callback #callback after creating the object
         */
        constructor(setup) {
            super()

            this.setup = setup;
            this.setup.preview = setup.preview || null;
            //if (this.setup.preview === null)
            this.setup.filetype = setup.filetype || /\.png$/gi;
            this.files = { list: [], source: {} }
            this.current = null;
            this.bcurrent = null;
            this.duration = 60;
            this.preview = false;
            this.visible = false;
            this.alpha = 1;

            this.window = new PIXI.Graphics();
            this.window.alpha = 1;
            this.window.beginFill(0x212121, 1.0)
            this.window.drawRect(0, 0, Graphics.width / 2, Graphics.height / 2);
            this.window.endFill();
            this.window.position.set(
                (Graphics.width - this.window.width) / 2,
                (Graphics.height - this.window.height) / 2
            )
            this.window.text = new PIXI.Text(this.setup.folder, { fontFamily: "Consolas", fontSize: 14, fill: "white" })
            this.window.text.position.set(
                (this.window.width - this.window.text.width) - 16,
                16
            )

            this.window.addChild(this.window.text)
            this.addChild(this.window)


            this.previewPicture = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture()));

            this.back = new Haya.GUI.Button({
                position: [
                    this.window.x + 8,
                    this.window.y + 8
                ],
                text: "RETURN",
                action: () => {
                    if (this.preview === false) {
                        this.close()
                    } else {
                        this.previewPicture.texture = new PIXI.Texture(new PIXI.BaseTexture());
                        this.preview = false;
                    };
                    return;
                }
            })

            Haya.File.list(this.setup.folder, (filename) => {
                // replace filename
                let _filename = filename.replace(/^.*[\\\/]/, '');
                // load just '.json' file
                if (_filename.match(this.setup.filetype)) {
                    // load data 'npc' setup
                    let name = _filename.replace(this.setup.filetype, "")
                    //
                    this.files.source[name] = { name: name, url: filename };
                    //
                    this.files.list.push([
                        name, () => {
                            this.current = this.files.source[name].url;
                            this.previewPicture.texture = new PIXI.Texture.fromImage(this.current);
                            this.previewPicture.url = this.current;
                            this.preview = true;
                        }
                    ])
                }
            })

            this.scrollBox = new Haya.GUI.ScrollBox({
                list: this.files.list,
                width: 200,
                height: 200
            })

            this.choose = new Haya.GUI.Button({
                position: [
                    this.window.x + 112,
                    this.window.y + 8
                ],
                text: "CHOOSE",
                action: () => {
                    this.setup.action.call(this, this.previewPicture)
                    this.close();
                }
            }); this.choose.visible = false;



            this.scrollBox.position.set(
                this.window.x + ((this.window.width - this.scrollBox.width) / 2),
                this.window.y + ((this.window.height - this.scrollBox.height) / 2),
            )

            this.addChild(this.scrollBox);

            this.addChild(this.back);

            this.addChild(this.choose);

            this.addChild(this.previewPicture);

            print("folder", this)
        }

        update() {
            if (this.visible === false) return;
            this.alpha = Haya.DMath.fincrease(this.alpha, 0.0, 1.0, 0.05)
            this.previewPicture.visible = this.preview;
            this.choose.visible = !this.scrollBox.visible;
            this.back.update();

            if (this.preview === true) {
                this.scrollBox.visible = false;
                this.choose.update();
                if (this.previewPicture.width >= this.window.width) this.previewPicture.width = this.window.width
                if (this.previewPicture.height >= this.window.height) this.previewPicture.height = this.window.height
                this.previewPicture.position.set(
                    this.window.x + (this.window.width - this.previewPicture.width) / 2,
                    this.window.y + (this.window.height - this.previewPicture.height) / 2,
                )

            } else {
                this.scrollBox.visible = true;
                this.scrollBox.update();
            }
        }

        close() {
            this.previewPicture.texture = new PIXI.Texture(new PIXI.BaseTexture())
            this.visible = false;
            this.alpha = 0;
            this.current = null;
        }

        open() {
            this.visible = true;
            this.scrollBox.refresh();
        }
    }; folderManager.FolderManager = FolderManager;
}(Haya.GUI)
// =============================================================================
void function (information) {
    'use strict';

    class Information extends PIXI.Container {
        /**
         * @param {Object} [setup]
         * @param {String} [setup<text>]
         * @param {Point} [setup<pos>]
         */
        constructor(setup = {}) {
            super();
            this.setup = setup;
            this.setup.text = this.setup.text || "[no information]"
            this.setup.pos = this.setup.pos || new Point(0, 0);
            this.isTriggered = false;
            this.countdown = { value: 60 * 2, duration: 60 * 2 }
            this.isArea = false;
            this.theme = this.setup.theme || Haya.GUI.Themes.default;
            this.create();
            this.setup.self = this.setup.self || this.sprite;
            if (Haya.Utils.isFunction(this.setup.callback)) this.setup.callback.call(this);
        }

        create() {
            this.text = this.setup.text
            this.sprite = new PIXI.Sprite(this.theme.sprite["information.png"])
            this.sprite.visible = false
            this.sprite.text = new PIXI.Text(this.setup.text, this.theme.data.information.font)
            this.addChild(this.sprite.text);
        }

        update() {
            if (this.visible === false) return;
            if (this.countdown.value < 1) {
                if (this.text !== this.sprite.text.text) {
                    this.text = this.sprite.text.text;
                    this.sprite.width = this.sprite.text.width;
                    this.sprite.height = this.sprite.text.height;
                    this.sprite.text.position.set(
                        this.sprite.x + (this.sprite.width - this.sprite.text.width) / 2,
                        this.sprite.y + (this.sprite.height - this.sprite.text.height) / 2
                    )
                }
            } else {
                this.countdown.value = this.countdown.duration
                this.visible = false;
            }
        }

        text(value = "") {
            this.visible = true;
            this.text = null;
            this.sprite.text.text = value || "";
        }
    }; information.Information = Information;
}(Haya.GUI)