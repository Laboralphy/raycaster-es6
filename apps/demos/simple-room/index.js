import Engine from "libs/engine/Engine";

/**
 * This program is one of the simplest example we can give to build a level, and control a visor view inside
 */

const LEVEL = {
    "version": "RCE-100",

    "tilesets": [],
        // there is no tilset in this example
        // we only have textures

    "blueprints": [],
        // there are no blueprint in this example, we don't have any sprites

    "level": {
        "metrics": {
            "spacing": 64,  // each map cell is 64 texel-wide
            "height": 96    // ceilling height is 96 texels height
        },
        "textures": {
            "flats": "textures/flats.png",
            "walls": "textures/walls.png",
            "sky": "",
            "smooth": false,
            "stretch": false
        },
        "map": [ // the map may be defined as an array of strings. each character is a code depicted in the "legend" section
            "########",
            "#  ##  #",
            "#      #",
            "#      #",
            "#      #",
            "#      #",
            "#      #",
            "########",
        ],
        "legend": [{
            "code": ' ',
            "phys": "@PHYS_NONE", // you can walk on this "character"
            "faces": {
                "f": 0, // floor texture (taken from "flats" property)
                "c": 1  // ceiling texture (taken from "flats" property)
            }
        }, {
            "code": '#',
            "phys": "@PHYS_WALL", // you cannot walk on this character,
            "faces": {
                "n": 0, // north wall
                "e": 0, // east wall
                "w": 0, // west wall
                "s": 0, // south wall
            }
        }]
    },
    "startpoints": [{
        x: 5, // visor coordinates (x-axis)
        y: 6, // visor coordinates (y-axis)
        angle: -Math.PI / 2 - 0.4, // looking angle
        z: 1 // visor altitude (1 is the default object)
    }],
    "camera": {
        "thinker": "FPSControlThinker"
    },
    "objects": [
        // there is no object
    ],
    "decals": [],
    "tags": [],
    "lightsources": []
};

// note that we use an "async" function, because we deal with promises when textures are loading
async function main() {
    // creates engine
    const engine = new Engine();

    // defines which DOM canvas to use
    engine.setRenderingCanvas(document.getElementById('screen'));

    // builds level.
    // buildLevel() is an ASYNCHRONOUS function, which return a promise
    // we use the "await" keywork to be sure the level is completly loaded before doing something else.
    await engine.buildLevel(LEVEL, { startpoint: 0 });

    // bindings keyboard events
    window.addEventListener('keydown', event => engine.camera.thinker.keyDown(event.key));
    window.addEventListener('keyup', event => engine.camera.thinker.keyUp(event.key));

    // starts engine doomloop
    engine.startDoomLoop();
}

window.addEventListener('load', main);
