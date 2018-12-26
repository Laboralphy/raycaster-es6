import * as CONSTS from "./consts";

import DoorManager from "./DoorManager";
import DoorContext from "./DoorContext";
import Scheduler from "./Scheduler";
import Easing from "../tools/Easing";
import util from "util";

class Engine {

    constructor() {
        this._rc = null;
        this._dm = new DoorManager();
        this._TIME_INTERVAL = 40;
        this._timeMod = 0;
        this._time = 0;
        this._scheduler = new Scheduler();
    }

    /**
     * this function iterates throught all adjacent cells and run a given function for each cell
     * @param x {number} cell position x
     * @param y {number} cell position y
     * @param pFunction {function} a function(x, y, n) called each time a cell is iterated
     * @param nType {number} if CELL_NEIGHBOR_SIDE then only side-adjacent cells are iterated -> 4 cells
     * if CELL_NEIGHBOR_CORNER then corner-adjacent cells are iterated -> 4 cells
     * can be a combinason : CELL_NEIGHBOR_SIDE | CELL_NEIGHBOR_CORNER
     */
    _forEachNeighbor(x, y, pFunction, nType) {
        if (!pFunction) {
            return;
        }
        const bSides = (nType & CONSTS.CELL_NEIGHBOR_SIDE) > 0; // if true, then side-sharing cells are selected
        const bCorners = (nType & CONSTS.CELL_NEIGHBOR_CORNER) > 0; // if true, then corner-sharing cells are selected
        const bSelf = (nType & CONSTS.CELL_NEIGHBOR_SELF) > 0; // if true then the cell itself is selected
        for (let xi = -1; xi < 2; ++xi) {
            for (let yi = -1; yi < 2; ++yi) {
                const bxi0 = xi === 0 ? 2 : 0;
                const byi0 = yi === 0 ? 1 : 0;
                const n0 = bxi0 | byi0;
                const xix = xi + x;
                const yiy = yi + y;
                let bTest = false;
                switch (n0) {
                    case 3: // the cell itself
                        bTest = bSelf;
                        break;

                    case 0: // a corner
                        bTest = bCorners;
                        break;

                    case 1:
                    case 2: // a side
                        bTest = bSides;
                        break;
                }
                if (bTest) {
                    pFunction(xix, yiy, this._rc.getCellPhys(xix, yiy));
                }
            }
        }
    }

    /**
     * Same as buildDoorContext, bu with secret blocks
     * @param x {number} cell position x
     * @param y [number} cell position y
     * @private
     */
    _buildSecretDoorContext(x, y) {
        const rc = this._rc;
        const dm = this._dm;
        const metrics = rc.options.metrics;
        const nOffsetMax = metrics.spacing;
        const nSlidingDuration = CONSTS.DOOR_SLIDING_DURATION * 3;
        const nPhysCode = rc.getCellPhys(x, y);
        const sFunction1 = Easing.SQUARE_ACCEL;
        const sFunction2 = Easing.SQUARE_DECCEL;
        const nMaintainDuration = Infinity;
        // primary secret door
        const dc1 = new DoorContext({
            sdur: nSlidingDuration,
            mdur: nMaintainDuration,
            ofsmax: nOffsetMax,
            sfunc: sFunction1
        });
        dc1.data.x = x;
        dc1.data.y = y;
        dc1.data.phys = nPhysCode;
        dc1.event.on('check', event => this._checkDoorClosability(event));
        let nSecurityCheck = 0;
        this._forEachNeighbor(x, y, (xc, yc, phys) => {
            if (phys === CONSTS.RC.PHYS_SECRET_BLOCK) {
                // secondary secret door
                if (++nSecurityCheck > 1) {
                    throw new Error(util.format('this secret block has more than one secret neighbor : (%d, %d)', x, y));
                }
                const dc2 = new DoorContext({
                    sdur: nSlidingDuration,
                    mdur: nMaintainDuration,
                    ofsmax: nOffsetMax,
                    sfunc: sFunction2,
                    ddur: nSlidingDuration
                });
                dc2.data.x = xc;
                dc2.data.y = yc;
                dc2.data.phys = phys;
                dc2.event.on('check', event => this._checkDoorClosability(event));
                dc1.data.child = dc2;
                dm.linkDoorContext(dc2);
            }
        }, CONSTS.CELL_NEIGHBOR_SIDE);
        dm.linkDoorContext(dc1);
    }

    /**
     * If the cell contains an entity it will cancel the given "door close event"
     * @param context {DoorContext}
     * @param cancel {boolean} will be turn to true if an entity blocks the way
     * @private
     */
    _checkDoorClosability({context, cancel}) {
        const data = context.data;
        const {x, y} = data;
        // TODO check with entity manager
    }

    /**
     * creates a door context for the specified cell.
     * of course the cell must describe a door, and have a phys code of type PHYS_DOOR_* or PHYS_CURT_* or PHYS_SECRET_BLOCK
     * @param x {number} cell position x
     * @param y [number} cell position y
     * @param bAutoclose {boolean} if true, then the door will auto close after a certain time (see DOOR_MAINTAIN_DURATION constant)
     * @private
     */
    _buildDoorContext(x, y, bAutoclose) {
        const rc = this._rc;
        const metrics = rc.options.metrics;
        const nPhysCode = rc.getCellPhys(x, y);
        let nOffsetMax, fSlidingDuration;

        switch (nPhysCode) {
            case CONSTS.RC.PHYS_DOOR_SLIDING_DOUBLE:
                nOffsetMax = metrics.spacing >> 1;
                fSlidingDuration = 0.5;
                break;

            case CONSTS.RC.PHYS_DOOR_SLIDING_RIGHT:
            case CONSTS.RC.PHYS_DOOR_SLIDING_LEFT:
                nOffsetMax = metrics.height;
                fSlidingDuration = 1;
                break;

            case CONSTS.RC.PHYS_DOOR_SLIDING_UP:
            case CONSTS.RC.PHYS_DOOR_SLIDING_DOWN:
                nOffsetMax = metrics.height;
                fSlidingDuration = 1.5;
                break;

            case CONSTS.RC.PHYS_CURT_SLIDING_UP:
            case CONSTS.RC.PHYS_CURT_SLIDING_DOWN:
                nOffsetMax = metrics.height;
                fSlidingDuration = 1.8;
                break;

            case CONSTS.RC.PHYS_SECRET_BLOCK:
                this._buildSecretDoorContext(x, y);
                return;

            default:
                return;
        }
        const dc = new DoorContext({
            sdur: CONSTS.DOOR_SLIDING_DURATION * fSlidingDuration | 0,
            mdur: bAutoclose ? CONSTS.DOOR_MAINTAIN_DURATION : Infinity,
            ofsmax: nOffsetMax,
            sfunc: Easing.SMOOTHSTEP
        });
        dc.data.x = x;
        dc.data.y = y;
        dc.data.phys = nPhysCode;
        dc.event.on('check', event => this._checkDoorClosability(event));
        const dm = this._dm;
        dm.linkDoorContext(dc);
    }

    /**
     * Processes all doors, updates all offsets.
     * @private
     */
    _doorProcess() {
        const rc = this._rc;
        this._dm.process().forEach(dmp => {
            const {x, y, offset, phys} = dmp;
            rc.setCellOffset(x, y, offset);
            rc.setCellPhys(x, y, phys);
        });
    }





    // PUBLIC API

    process(nTime) {
        const tp = this._TIME_INTERVAL;
        this._time += nTime;
        const tm = this._timeMod + nTime;
        const nTimes = Math.min(10, tm / tp | 0);
        this._timeMod = tm % tp;
        for (let i = 0; i < nTimes; ++i) {
            // logic doom loop here
            this._scheduler.schedule(this._time);
            this._dm.process();
            // entity management
            // special effect management
        }
    }


    /**
     * Opens a door at a specified position. The cell at x, y must have a PHYS_DOOR_*, PHYS_CURT_* or PHYS_SECRET_BLOCK physical code
     * @param x {number} position of cell x
     * @param y {number} position of cell y
     * @param bAutoclose {boolean} if true, then the door will auto close after a certain time (see DOOR_MAINTAIN_DURATION constant)
     */
    openDoor(x, y, bAutoclose) {
        this._buildDoorContext(x, y, bAutoclose);
    }

    /**
     * Closes a door that has already been open. This is the only way to close a door that can't automatically close.
     * Note that the door won't immediatly close if an entity is in the way. But rather it will autoclose after the entity
     * is gone, even if it was originally a non-autoclose door.
     * @param x {number} position of door x
     * @param y {number} position of door y
     */
    closeDoor(x, y) {
        const dc = this._dm.getDoorContext(x, y);
        if (dc) {
            if (dc.data.child) {
                dc.event.once('close', () => dc.close());
                dc.data.child.close();
            } else {
                dc.close();
            }
        }
    }
}

export default Engine;