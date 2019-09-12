### Immersion Package Plugin 

| Package Plugin | Version |
| ------------- | ------------- |
| Test | 0.2.3 |
| Current | 0.2.3 |

Download the recent 'test' on dropbox: https://www.dropbox.com/s/x67tfv3s0k98eel/immersion-plugin-test.0.2.2.rar?dl=0

-------------

'This is a plugin-package that will allow the RPG Maker MV users to create a more immersive experience for their own game. 
In which include several tools to make more easy to do it!'

-------------

Everything is W.I.P (Work In Progress). So please, consider that this isn't the final product and this readme is very incomplete! By the way,
I'll be very happy if you help with your feedback and if so, please, consider to make a 'pull request' here. 
If you have find any bug, problem, please consider to 'issue' it to me on this Github project.

-------------

The goal of the current test (0.2.3) is:
- Let the users play and test the editor of the map. 

-------------

#### To test

To test, you first need to download the project, see on the header of this readme the most recent version of the 'test', then search for his 
folder and download it (or you can just download everthing).
Or you can just download with the dropbox link (more easy)

Extract on some folder and things must show up as this image:

![](https://i.imgur.com/dogrLhD.png)

So, you just need to test as you already now (rpg maker mv users)

#### Map Test

To test how things goes in real in-game, look at the settings of the Plugin Manager (you just need to turn-off the 'haya-map-editor'):

![](https://i.imgur.com/vXp07sJ.png)

#### Edit the Map

To edit the map, you just need to turn-on the 'haya-map-editor' on Plugin Manager.

#### Be aware

- If you press 1, you will display the 'floor under'
- If you press 2, you will display the 'floor base'
- If you press 3, you will display the 'floor high'

- Press the Right Button of the Mouse to hide the Editor UI. And, by this, you can press down the 'left button' of the mouse and move the camera. 
-- Left Button of the Mouse + Move Down -> move the display camera to bottom
-- Left Button of the Mouse + Move Up -> move the display camera to top
- However, if you press control at the same time you press the right button of the mouse, it will not move the display camera

- If when you click to create a collision shape (in another floor that isn't 'base'), and the collision after created doesn't display on the current floor. Don't worry, just go back to the base floor (press 2), and go to the collision editor, and the shape will be there. Then, you can edit the floor propierty of the collision shape
![](https://i.imgur.com/xq4sIr8.png)

- The sound propierty by now is a bit weirdo of setting. Then, everytime that you edit some property, you need to click down on 'Play & Stop', to refresh the properites and hear the difference. The volume isn't working well (volume property), then, to adjust it, you can choose to the edit the 'reference distance' property.

- When editing the points of a polygon (collision), press the Right Button of the Mouse to hide the Editor UI, then move around pressing the Left Button of the mouse while pressing Control to not move the display camera.
-- As well, if you press 'd' while editing the point, it will delete the point.

- To edit the position property, you just need to click down of the 'x, y' button and press the Left Button of the Mouse, to move around the object in question. 

- Almost any property that handles with number (range, number, position), you can use the wheel of the mouse to edit it. You just need to click hover the button of the property and the start to use the wheel of the mouse.
