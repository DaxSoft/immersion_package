/**
 * @file [haya_map_editor.js -> Haya - Map Editor]
 * @description This is a editor in-game for the maps using
 * Haya elements.
 * =====================================================================
 * @author Dax Soft | Kvothe <www.dax-soft.weebly.com> / <dax-soft@live.com>
 * @thanks to Jonforum!
 * @version 0.1.0
 * @license HAYA <https://dax-soft.weebly.com/legal.html>
 * @requires 1.6.+ <<RPG Maker MV Version>>
 * =====================================================================
 */
var Imported = Imported || {};
var Haya = Haya || {};
Haya.Sprite_Editor = {};
/*:
 * @author Dax Soft | www.dax-soft.weebly.com
 * 
 * @plugindesc [0.1.0] Haya Sprite Editor
 * 
 * @help 
 * 
 * Important! This is a plugin under development, if 
 * you do find any bug or error, please, contact me!
 * 
 */
void

function ($) {
    'use strict';
    // ========================================================================
    $.sprite = null;
    $.data = {};
    $.visible = true;
    // ========================================================================
    /**
     * @class Editor
     * @classdesc the editor's scene
     */
    class Editor extends Scene_Base {

        constructor() {
            super()
            if ($.sprite === null || $.sprite === undefined) SceneManager.goto(Scene_Immersion);
        }

        // ========================================================================

        start() {
            super.start.call(this)

        }

        create() {
            super.create.call(this)

            this.cviewport();
            this.csprite();
            this.clight();
            this.ctoolbar();
            this.cstates();
            this.ceditor();

            this.addChild(this.toolbar);
        }

        terminate() {
            super.terminate.call(this)
            $.sprite = null;
        }

        update() {
            super.update.call(this)
            if (TouchInput.isCancelled()) $.visible = !$.visible;
            this.utoolbar();
            //this.ucamera();
            this.usprite();
            this.ueditor();
        }
        // ========================================================================

        cviewport() {
            this.viewport = new PIXI.extras.Viewport({
                screenHeight: Graphics.width,
                screenHeight: Graphics.height,
                worldHeight: Graphics.height,
                worldWidth: Graphics.width
            })
            // clamp direction
            this.viewport.clamp({
                direction: "all"
            })
            // clamp zoom
            this.viewport.clampZoom({
                minWidth: Graphics.width / 3,
                minHeight: Graphics.height / 3,
                maxWidth: this.viewport.worldWidth,
                maxHeight: this.viewport.worldHeight,
            })
            // available zoom
            this.viewport.wheel();
            // cmaera
            this.camera = new Haya.DMath.Vector2D(0, 0);

            this.addChild(this.viewport);
        }

        csprite() {
            this.sprite = Haya.Map.loadSprite(
                Haya.Immersion.sprite_editor.diffuse,
                Haya.Immersion.sprite_editor.normal
            );

            this.sprite.position.set(...(Haya.DMath.Position.screen({
                object: this.sprite.children[0],
                type: "center"
            })).array())

            this.viewport.addChild(this.sprite);
        }

        clight() {
            // [ambient light]
            this.ambient = new Pixi_Light({
                kind: "ambient"
            }, "ambient");
            this.ambient.atRange = function () {
                return true;
            }
            // [point light]
            this.point = new Pixi_Light({
                kind: "point",
                color: "0xFF0000"
            }, "point");
            this.point.atRange = function () {
                return true;
            }

            this.addChild(this.ambient.sprite)
            this.viewport.addChild(this.point.sprite)
        }

        ctoolbar() {
            this.toolbar = new PIXI.Container;
            // [return to Immersion Scene]
            this.toolbar.back = new Haya.GUI.Button({
                stage: this.toolbar,
                text: "RETURN",
                click: () => {
                    if (confirm("Are you sure that you want to return?")) {
                        SceneManager.goto(Scene_Immersion);
                    }
                }
            })
            // [ambient light]
            this.toolbar.lambient = new Haya.GUI.Button({
                stage: this.toolbar,
                text: "AMBIENT LIGHT",
                width: 164,
                click: () => {
                    if (this.editor.light.visible === true) {
                        this.editor.light.visible = false;
                        return;
                    } else {
                        this.editor.light.target = this.ambient;
                        this.editor.light.refresh();
                        this.editor.light.open();
                        //print(this.editor.light, "light")
                    }
                }
            })
            // [point light]
            this.toolbar.lpoint = new Haya.GUI.Button({
                stage: this.toolbar,
                text: "POINT LIGHT",
                click: () => {
                    if (this.editor.light.visible === true) {
                        this.editor.light.visible = false;
                        return;
                    } else {
                        this.editor.light.target = this.point;
                        this.editor.light.refresh();
                        this.editor.light.open();
                        //print(this.editor.light, "light")
                    }
                }
            })
            // [states]
            this.toolbar.states = new Haya.GUI.Button({
                stage: this.toolbar,
                text: "STATES",
                click: () => {
                    this.listStates.visible = !this.listStates.visible;
                }
            })
            // [save]
            this.toolbar.save = new Haya.GUI.Button({
                stage: this.toolbar,
                text: "SAVE",
                click: () => {

                }
            })
            // organize the position
            this.toolbar.children.map((button, index) => {
                if (button) {
                    if (index > 0) {
                        let previous = this.toolbar.children[index - 1];
                        button.x = (previous.x + previous.width)
                    } else {
                        button.x = 0;
                    }
                }
            })
        }

        cstates() {
            var list = [];
            Haya.Movement.setup.states.forEach((states, index) => {
                list.push(new Haya.GUI.Button({
                    text: states.toUpperCase(),
                    width: 164,
                    click: () => {

                    }
                }))
            })

            this.listStates = new Haya.GUI.ScrollBox({
                list: list,
                position: [0, 48],
                width: 196,
                height: Graphics.height - 48
            })
            this.listStates.visible = false;

            this.addChild(this.listStates)
        }

        ceditor() {
            this.editor = new PIXI.Container;
            this.addChild(this.editor);
            // [editor of light]
            this.editor.light = new Haya.GUI.LIGHT({
                viewport: this.viewport,
                position: [Graphics.width - 384, 0]
            })
            this.editor.light.visible = false;

            this.editor.addChild(this.editor.light)
        }

        // ========================================================================

        utoolbar() {
            this.toolbar.visible = $.visible;
            this.toolbar.children.map((btn) => {
                if (btn) {
                    btn.visible = $.visible;
                    btn.update()
                }
            })

            this.listStates.update();
        }

        ucamera() {
            if ($.visible === true) return;
            if (Haya.Mouse.y.isBetween(0, Graphics.width) && (Haya.Mouse.y.isBetween(0, 16))) {
                this.camera.y = Haya.DMath.fdecrease(this.camera.y, 0)
            } else if (Haya.Mouse.y.isBetween(0, Graphics.width) && (Haya.Mouse.y.isBetween(Graphics.height - 16, Graphics.height))) {

            } else if (Haya.Mouse.x.isBetween(0, 16) && (Haya.Mouse.y.isBetween(0, Graphics.height))) {

            } else if (Haya.Mouse.x.isBetween(Graphics.width - 16, Graphics.width) && (Haya.Mouse.y.isBetween(0, Graphics.height))) {
                this.display.x += 8;
                if (this.display.x >= ((Haya.Map.current.width || Graphics.width) - Graphics.width)) {
                    this.display.x = ((Haya.Map.current.width || Graphics.width) - Graphics.width);
                }
                if ((this.toolbar === false)) {
                    this.camera.x = Haya.DMath.fincrease(this.camera.x, 0, (Haya.Map.current.width - Graphics.width) + 1, 8)
                }
            }

            this.vewport.follow(this.camera, {
                speed: 4
            });
        }

        usprite() {
            this.viewport.update();
            this.ambient.update();
            this.point.update();
        }

        ueditor() {
            this.editor.light.update();
        }
    };
    $.Scene = Editor;
}(Haya.Sprite_Editor);
/**
 * @var Imported 
 * @description describes the name and version of the plugin
 */
Imported["haya_immersion_sprite_editor"] = 0.1;