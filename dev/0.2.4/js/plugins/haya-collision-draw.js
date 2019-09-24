'use strict';

/*:
 * @author Dax Soft | Kvothe
 * 
 * @plugindesc [0.1.0] Draw collision graphic over map
 * 
 * @help
 * Important: Insert this plugin after the haya-map
 */

void 

function () {

    const collisionGraphic = function (element, selected=false, player=false) {
        if (Haya.Utils.invalid(element)) return;
        if (Haya.Utils.invalid(element._graphic)) return;
        element._graphic.clear();
        if (selected === true) {
            element._graphic.lineStyle(1, '0xffffff', 1, 0.5);
        } else {
            element._graphic.lineStyle(1, Haya.Collision.FloorColor[element.floor], 1, 0.5);
        }
        element._graphic.beginFill(Haya.Collision.FloorColor[element.floor], 0.25);
        if (player === false) {
            element.draw(element._graphic)
        } else {
            if (element.character.isCollision()) element.character._collision.body.draw(element._graphic)
        }
        element._graphic.endFill();
    }


    var Sprite_Map_create = Sprite_Map.prototype.create;

    Sprite_Map.prototype.create = function () {
        Sprite_Map_create.call(this);

        this.graphicCollision = new PIXI.Container();
        SceneManager._scene.addChild(this.graphicCollision);

        SceneManager._scene.collision.element.forEach((element) => {

            if (Haya.Utils.invalid(element._graphic)) {
                element._graphic = new PIXI.Graphics();
                this.graphicCollision.addChild(element._graphic);
            }
            element._graphic.clear();
            if ((element.floor === $gamePlayer.floor)) {
                collisionGraphic(element);
            }


            if (element._graphic.stage === undefined || element._graphic.stage === null) {
                this.graphicCollision.addChild(element._graphic);
            }
        })

        this.updateCollisionGraphic();
    }

    Sprite_Map.prototype.updateCollisionGraphic = function () {
        setTimeout(() => {
            this._characters.map(element => {

                if (!(element._graphic)) {
                    element._graphic = new PIXI.Graphics();
                    this.graphicCollision.addChild(element._graphic);
                }
    
    
                //if (element.character.floor === $gamePlayer.floor) {
                    collisionGraphic(element, true, true);
                    
                //}
    
                if (element._graphic.stage === undefined || element._graphic.stage === null) {
                    this.graphicCollision.addChild(element._graphic);
                }
    
                this.updateCollisionGraphic()
            })
        }, 500);
    }


    var Sprite_Map_update = Sprite_Map.prototype.update;

    Sprite_Map.prototype.update = function () {
        Sprite_Map_update.call(this);

        for (let index = 0; index < SceneManager._scene.collision.element.length; index++) {
            const element = SceneManager._scene.collision.element[index];
            if (element._graphic && element._graphic.pivot) {    
                    element._graphic.pivot.x = -(Haya.Map.Viewport.x);
                    element._graphic.pivot.y = -(Haya.Map.Viewport.y);
                
            } 
        }

        this._characters.map(element => {

            if (element.character.isCollision() && element._graphic) {
                element._graphic.pivot.x = -(Haya.Map.Viewport.x);
                element._graphic.pivot.y = -(Haya.Map.Viewport.y);
            }

        })
        

        if (Input.isTriggered('a')) {
            this._characters.map(element => {

                if (!(element._graphic)) {
                    element._graphic = new PIXI.Graphics();
                    this.graphicCollision.addChild(element._graphic);
                }
    
                element._graphic.clear();
                //print(element, 'element')
                //if (element.character.floor === $gamePlayer.floor) {
                    collisionGraphic(element, true, true);
                //}
                print(element.character._collision, 'collision')
    
                if (element._graphic.stage === undefined || element._graphic.stage === null) {
                    this.graphicCollision.addChild(element._graphic);
                }
    
            })
        }
    }
}();

