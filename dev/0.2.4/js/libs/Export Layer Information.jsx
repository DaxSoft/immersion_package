/*
===============================================================================
[Export Layer Information]
by Dax Soft | Kvothe
www.dax-soft.weebly.com
1.0
===============================================================================
Installation Guide:
  1. Place this script in /filename: Export Layer Information.js
    Win: 'C:\Program Files\Adobe\Adobe Photoshop CS#\Presets\Scripts\'
  2. Restart your Photoshop
  3. Choose File > Scripts > Export Layer Information
  4. Or Just go to Choose File > Scripts > Search (Sort by .js files)
===============================================================================
*/
// [Imported]
var Imported = Imported || {};
Imported.Haya = Imported.Haya || {};
Imported.Haya.exportLayerInformation = {};

// [Script]
(function($) {
'use strict';
    // [setup]
    #target photoshop
    app.bringToFront();
    // document variable
    var docRef = app.activeDocument;
    var docName = decodeURI(activeDocument.name);
    var currentPath =  (app.activeDocument.fullName.parent.fsName).toString().replace(/\\/g, '/') + "/";
    var string = "{\n\n";
    var filename = "";
    // create a new folder
    var createFolder = new Folder(currentPath + String(docName.split(".")[0]));
    if (!createFolder.exist) createFolder.create();
    // root
    var root = currentPath + String(docName.split(".")[0]) + "/";
    // add json info
    function addJson(hash) {
        this.string = "";
        hash.space = hash.space === undefined ? "\t\t" : hash.space;
        hash.break = hash.break === undefined ? "\n" : hash.break;
        this.string += hash.space + '"' + hash.key + '": ' + String(hash.value) + "," + hash.break;
        return this.string;
    }
    // default rules
    $.rules = preferences.rulerUnits;
    preferences.rulerUnits = Units.PIXELS;
    // get layer information
    $.layer = {
        // number
        number: app.activeDocument.artLayers.length,
        // layer
        data: app.activeDocument.activeLayer,
    }
    // information data
    $.data = {
        name:               new Array(),
        x:                  new Array(),
        y:                  new Array(),
        width:              new Array(),
        height:             new Array(),
        blendMode:          new Array(),
        kind:               new Array(),
        filename:           new Array(),
        opacity:            new Array() 
    }
    // bring out all visible layer
    function bringOutEachLayerVisible() {
        var visibleLayers = [];
        visibleLayers = collectAllLayersVisible(docRef, visibleLayers);
        for (var i = 0; i < visibleLayers.length; i++) {
            var current = visibleLayers[i];
            // get out the information
            $.data.name.push(current.name);
            $.data.x.push(current.bounds[0].value);
            $.data.y.push(current.bounds[1].value);
            $.data.width.push(parseInt(current.bounds[2].value - current.bounds[0].value));
            $.data.height.push(parseInt(current.bounds[3].value - current.bounds[1].value));
            $.data.blendMode.push(current.blendMode);
            $.data.opacity.push(current.opacity);
            $.data.kind.push(current.kind);
            if (current.name == ":") {
                $.data.filename.push(current.name.split(":")[0])
            } else {
                $.data.filename.push(current.name);
            }
        }
    }
    // collect all Layers
    function collectAllLayersVisible(parent, allLayers) {
        for (var m = 0; m < parent.layers.length; m++) {
            var currentLayer = parent.layers[m];
            if (currentLayer.typename === "ArtLayer") {
                if (currentLayer.visible) {
                    allLayers.push(currentLayer);
                }
            } else {
                // recursive
                collectAllLayersVisible(currentLayer, allLayers);
            }
        }
        return allLayers;
    }
    // test out for a layer set
    function isLayerSetup(current) { try { if (current.layer.length > 0) return true; } catch(error) { return false; } }
    // [FOLDER]
    fileLineFeed = "Windows";
    // Export information
    function exportInformation() {
        // [string]
        for (var index = 0; index < $.data.name.length; index++) {
            string += "\t" + '"' + $.data.name[index] + '": {\n';
            string += addJson({key: "filename", value: '"' + $.data.filename[index] + '"'});
            string += addJson({key: "blendMode", value: '"' + $.data.blendMode[index] + '"'});
            string += addJson({key: "x", value: $.data.x[index]});
            string += addJson({key: "y", value: $.data.y[index]});
            string += addJson({key: "width", value: $.data.width[index]});
            string += addJson({key: "height", value: $.data.height[index]});
            string += "\t\t" + '"opacity": ' + String($.data.opacity[index]) + "\n";
            string += index === $.data.name.length-1 ? "\t}\n" :  "\t},\n\n";
        }
        // out
        string += "}";
        // [file]
        var file = new File(root + "photoshop_file.json");
        file.remove();
        file.open("a");
        file.lineFeed = fileLineFeed;
        file.write(string);
        file.close();
        // [exported]
        alert("Exported at: " + root, "Finished!");
    }
    // [RUNNING OUT]
    bringOutEachLayerVisible();
    preferences.rulerUnits = $.rules; // Set preferences back to user 's defaults
    exportInformation();
})(Imported.Haya.exportLayerInformation);
Imported['exportLayerInformation'] = true;