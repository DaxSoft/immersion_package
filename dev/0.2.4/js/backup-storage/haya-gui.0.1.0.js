

/**
 * @file [haya-gui.js -> Haya Gui]
 * This plugin is a simple GUI library that uses PIXI as 
 * main componenet.
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @version 0.1.0
 * @license MIT <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * =====================================================================
 * 
 */
Haya.GUI = {};
/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.0] Basic GUI library
 * 
 * @help
 * Important: Insert this plugin after my haya-core
 */

void function (gui) {
    'use strict';
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
    // =============================================================================
    print("haya gui", gui);
}(Haya.GUI);
// =============================================================================
void function (button) {
    'use strict';
    // =============================================================================
    class Button extends PIXI.Container {
        /**
         * 
         * @param {Object} setup 
         * setup:callback | call a function after create the button
         * setup:callop   | call a function on the update section
         * setup:text 
         * setup:width
         * setup:height 
         * setup:active #default is true
         * setup:position
         * setup:theme #default
         * setup:action #function when triggered
         * setup:kind #trigger or #press
         */
        constructor(setup = {}) {
            super();
            this.setup = setup;
            this.setup.kind = (this.setup.kind || "trigger").toLowerCase();
            this.setup.position = this.setup.position || [0, 0];
            this.information = this.setup.information || "[no information]";
            this.isTriggered = false;
            this.isPressed = 0;
            this.active = this.setup.active || true;
            this.isArea = false;
            this.theme = this.setup.theme || Haya.GUI.Themes.default;
            this.create();
            this.setup.self = this.setup.self || this.sprite;
            if (Haya.Utils.isFunction(this.setup.callback)) this.setup.callback.call(this);
        }

        create() {
            // background
            this.sprite = new PIXI.Sprite(this.theme.sprite["btn.default.png"])
            if (Array.isArray(this.setup.position)) {
                this.sprite.position.set(
                    this.setup.position[0],
                    this.setup.position[1]
                )
            } else if (this.setup.position instanceof Point) {
                this.sprite.x = this.setup.position.x;
                this.sprite.y = this.setup.position.y;
            }
            this.sprite.width = this.setup.width || this.sprite.width;
            this.sprite.height = this.setup.height || this.sprite.height;
            this.addChild(this.sprite);
            // text
            this.sprite.text = new PIXI.Text(this.setup.text || "text", this.theme.data.button.font.default)
            this.addChild(this.sprite.text);
            this.sprite.hitArea = new PIXI.Rectangle(this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height)

        }

        update() {
            this.sprite.text.visible = this.sprite.visible;
            if (this.sprite.visible === false) return;
            this.sprite.text.position.set(
                this.sprite.x + (this.sprite.width - this.sprite.text.width) / 2,
                this.sprite.y + (this.sprite.height - this.sprite.text.height) / 2
            )
            if (this.setup.kind === "trigger") {
                Haya.Mouse.isTriggered(this.sprite.hitArea, (area, triggered) => {
                    this.isTriggered = triggered && area && this.active
                    if (Haya.Utils.isFunction(this.setup.action) && this.isTriggered) {
                        this.setup.action.apply(this);
                        this.isTriggered = false;
                    }
                    this.isArea = area;

                })
            } else if (this.setup.kind === "press") {
                Haya.Mouse.isLongPressed(this.sprite.hitArea, (area, pressed) => {
                    if (pressed && area) { this.isPressed++ } else { this.isPressed = 0; };
                    this.isArea = area;
                })
            }

            if (this.active === true) this.sprite.alpha = this.isArea ? 0.75 : 1;
            if (Haya.Utils.isFunction(this.setup.callop)) this.setup.callop.call(this);
        }

        text(value = "") {
            if (value !== this.sprite.text.text) {
                this.sprite.text.text = value;
            }
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
// =============================================================================
void function (scrollBox) {
    'use strict';
    // =============================================================================
    class ScrollBox extends PIXI.Container {
        /**
         * 
         * @param {Object} setup 
         * setup:list #[text,action]
         * setup:width 
         * setup:height
         * setup:action #callback when clicked on the file
         * setup:callback #callback after creating the object
         */
        constructor(setup) {
            super()

            this.setup = setup;
            this.setup.list = this.setup.list || [];
            this.setup.width = this.setup.width || 256;
            this.setup.height = this.setup.height || 256;
            this.buttons = [];
            this.index = 0;

            this.window = new PIXI.Graphics();
            this.window.alpha = 1.0;
            this.window.beginFill(0x212121, 0.0)
            this.window.drawRect(0, 0, this.setup.width, this.setup.width);
            this.window.endFill();
            this.addChild(this.window)

            this.refresh();

            if (Haya.Utils.isFunction(this.setup.callback)) this.setup.callback.call(this)
        }

        refresh() {
            if (this.buttons.length > 0) {
                this.buttons.forEach((btn) => {
                    this.removeChild(btn)
                })
            }

            this.buttons.length = 0;


            if (this.setup.list.length > 0) {
                for (let index = 0; index < this.setup.list.length; index++) {


                    const element = this.setup.list[index];

                    let btn = new Haya.GUI.Button({
                        position: [
                            0,
                            (30 * (index % 5))
                        ],
                        width: this.window.width,
                        text: element[0],
                        self: this,
                        action: element[1],
                        callback: function () {
                            this.sprite.hitArea.x = this.setup.self.x;
                            this.sprite.hitArea.y += this.setup.self.y;
                        }
                    });
                    btn._index = index;
                    print(element[0], "index at", index)
                    if (index > 4) btn.visible = false;
                    this.buttons.push(btn)

                }

                this.addChild(...this.buttons)
            }


        }

        update() {
            if (this.visible === false) return;
            this.children.forEach((btn) => {
                if (btn instanceof Haya.GUI.Button)
                    btn.update()
            })

            if (this.buttons.length > 4) {
                if (TouchInput.wheelY >= 30) {
                    this.index = Haya.DMath.fincrease(
                        this.index,
                        0,
                        Math.max((this.buttons.length - 5), 1),
                        1
                    );
                    print("index", this.index)
                    this.buttons.map((btn) => {
                        if (this.index === 0) {
                            btn.visible = (btn._index < 4);
                        } else {
                            btn.visible = this.index >= btn._index ? false : true;
                        }

                    })
                } else if (TouchInput.wheelY <= -30) {
                    this.index = Haya.DMath.fdecrease(
                        this.index,
                        0,
                        Math.max((this.buttons.length - 5), 1),
                        1
                    );
                    print("index", this.index)
                    this.buttons.map((btn) => {
                        if (this.index === 0) {
                            btn.visible = (btn._index < 4);
                        } else {
                            btn.visible = this.index >= btn._index ? false : true;
                        }
                    })
                }
            }
        }

    }; scrollBox.ScrollBox = ScrollBox;
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