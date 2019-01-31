import TangibleThinker from "../../src/engine/thinkers/TangibleThinker";

const ANGLE_INT_MAX_VALUE = 0.1;
const SPEED = 6;

class DevKbdMobThinker extends TangibleThinker {

    constructor() {
        super();
            this._keys = {
            up: false,
            down: false,
            right: false,
            left: false
        };
        this.bWalk = false;
        window.addEventListener('keydown', event => this.keyDown(event.key));
        window.addEventListener('keyup', event => this.keyUp(event.key));
    }

    keyDown(key) {
        const k = this._keys;
        switch (key) {
            case 'z':
                if (!k.up) {
                    k.up = this._lastTime;
                }
                break;

            case 's':
                if (!k.down) {
                    k.down = this._lastTime;
                }
                break;

            case 'q':
                if (!k.left) {
                    k.left = this._lastTime;
                }
                break;

            case 'd':
                if (!k.right) {
                    k.right = this._lastTime;
                }
                break;
        }
    }

    keyUp(key) {
        switch (key) {
            case 'z':
                this._keys.up = false;
                break;

            case 's':
                this._keys.down = false;
                break;

            case 'q':
                this._keys.left = false;
                break;

            case 'd':
                this._keys.right = false;
                break;
        }
    }


    computeSpeedVector() {
        const k = this._keys;

        const forw = (k.up !== false ? 'f' : '') + (k.down !== false ? 'b' : '');
        switch (forw) {
            case 'f':
                this.setSpeed(
                    SPEED * Math.cos(this.angle),
                    SPEED * Math.sin(this.angle)
                );
                this.bWalk = true;
                break;

            case 'b':
                this.setSpeed(
                    -SPEED * Math.cos(this.angle),
                    -SPEED * Math.sin(this.angle)
                );
                this.bWalk = true;
                break;

            case '':
            case 'fb':
                // no move
                this.setSpeed(0, 0);
                this.bWalk = false;
                break;
        }

        if (k.right !== false) {
            this.angle += ANGLE_INT_MAX_VALUE;
        }
        if (k.left !== false) {
            this.angle -= ANGLE_INT_MAX_VALUE;
        }

    }

    $move() {
        this.computeSpeedVector();
        super.$move();
        if (this.bWalk) {
            this.entity.sprite.setCurrentAnimation('walk');
        } else {
            this.entity.sprite.setCurrentAnimation('stand');
        }
    }
}

export default DevKbdMobThinker;