import Vector from "../geometry/Vector";
import Geometry from "../geometry";


class Position {
    constructor({x = 0, y = 0, z = 0, angle = 0} = {}) {
        this.x = x;
        this.y = y;
        this.z = z;
        this._angle = angle;
    }

    get angle() {
        return this._angle;
    }

    set angle(value) {
        this._angle = Geometry.normalizeAngle(value);
    }

    set({x = null, y = null, z = null, angle = null}) {
        let bChange = false;
        if (x !== null) {
            this.x = x;
        }
        if (y !== null) {
            this.y = y;
        }
        if (z !== null) {
            this.z = z;
        }
        if (angle !== null) {
            this.angle = angle;
        }
    }

    /**
     * Returns a vector from the position
     * @return {Vector}
     */
    vector() {
        return new Vector(this.x, this.y);
    }

    /**
     * Returns a position vector of a point in front of the position, at a given distance
     * @param d {number} a given distance
     * @return {Vector}
     */
    front(d) {
        return new Vector(this.x + d * Math.cos(this.angle), this.y + d * Math.sin(this.angle));
    }
}


export default Position;
