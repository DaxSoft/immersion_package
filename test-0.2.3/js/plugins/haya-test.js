/**
 * @description scene for tests
 */
(function() {
    'use strict'; 
    // =================================================================================
    // [Scene_Boot] :boot
    // =================================================================================
    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        if (!DataManager.isBattleTest() && !DataManager.isEventTest()) {
            SceneManager.goto(Scene_Test);
        } else {
            _Scene_Boot_start.call(this);
        }
    };
    // ============================================================================= 
    // [Scene_Test]
    // ============================================================================= 
    class Scene_Test extends Scene_Base {
        constructor() {
            super();
        }
        /**
         * @description start the scene
         */
        start() {
            super.start.call(this);
            
        }
        /**
         * @description create
         */
        create() {
            super.create.call(this);
            
        }

        /**
         * @description update the scene
         */
        update() {
            super.update.call(this);
            
        }
    }
})();