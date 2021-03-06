import ShadedTileSet from './ShadedTileSet';
import {FACE_EAST, FACE_NORTH, FACE_SOUTH, FACE_WEST} from "./consts";
import CanvasHelper from "../canvas-helper";


/**
 * this class allows to add some properties to each surface of a 2-dimensional array of cells
 */
class CellSurfaceManager {
    constructor() {
        this._lmCellCount = 4; // number of lightmap cells in a normal cell
        this._map = null;
        this._lightMap = null;
        this._width = 0;
        this._height = 0;
    }



    /**
     * Defines the meta map size
     * @param w {number} new width
     * @param h {number} new height
     */
    setMapSize(w, h) {
        this._map = [];
        let aBlocks, aRow, x, y, nSide;
        this._width = w;
        this._height = h;
        for (y = 0; y < h; ++y) {
            aRow = [];
            for (x = 0; x < w; ++x) {
                aBlocks = [];
                for (nSide = 0; nSide < 6; ++nSide) {
                    aBlocks[nSide] = {
                        x,
                        y,
                        tileset: null,
                        diffuse: 0,
                        imageData: null,  // these are for the flat textures
                        imageData32: null,
                        lightMap: []
                    };
                    for (let n = 0; n < this._lmCellCount; ++n) {
                        aBlocks[nSide].lightMap[n] = 0;
                    }
                }
                aRow[x] = aBlocks;
            }
            this._map[y] = aRow;
        }
        this._lightMap = [];
        let hLM = h * this._lmCellCount;
        let wLM = w * this._lmCellCount;
        for (y = 0; y < hLM; ++y) {
            aRow = [];
            for (x = 0; x < wLM; ++x) {
                aRow[x] = 0;
            }
            this._lightMap[y] = aRow;
        }
    }


    /**
     * Returns the light map value of spécified texel
     * @param x {number}
     * @param y {number}
     * @param ps {number}
     * @returns {number}
     */
    getLightMap(x, y, ps) {
        let lmc = this._lmCellCount;
        let xLM = lmc * x / ps | 0;
        let yLM = lmc * y / ps | 0;
        return this._lightMap[yLM][xLM];
    }


    setLightMap(xc, yc, value) {
        let lmc = this._lmCellCount;
        const lm = this._lightMap;
        lm[yc][xc] = value;
        const yMod = yc % lmc;
        const xMod = xc % lmc;
        const xCell = xc / lmc | 0;
        const yCell = yc / lmc | 0;
        if (yMod === 0) {
            // NORTH ROW
            // = south of cell x, y-1
            const surf = this.getSurface(xCell, yCell - 1, FACE_SOUTH);
            if (surf) {
                surf.lightMap[xMod] = value;
            }
        }
        if (yMod === lmc - 1) {
            // SOUTH ROW
            // = north of cell x, y+1
            const surf = this.getSurface(xCell, yCell + 1, FACE_NORTH);
            if (surf) {
                surf.lightMap[lmc - 1 - xMod] = value;
            }
        }
        if (xMod === 0) {
            // WEST ROW
            // = east of cell x-1, y
            const surf = this.getSurface(xCell - 1, yCell, FACE_EAST);
            if (surf) {
                surf.lightMap[lmc - 1 - yMod] = value;
            }
        }
        if (xMod === lmc - 1) {
            // EAST ROW
            // = west of cell x+1, y
            const surf = this.getSurface(xCell + 1, yCell, FACE_WEST);
            if (surf) {
                surf.lightMap[yMod] = value;
            }
        }
    }

    /**
     * retrieves data corresponding to the surface of the cell with matching coordinate
     * @param x {number} cell coordinates
     * @param y {number} cell coordinates
     * @param nSide {number} wall index (0 - 5) 0 = west 1; = south 2; = east 3; = north;
     * @returns {*}
     */
    getSurface(x, y, nSide) {
        if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
            return null;
        }
        return this._map[y][x][nSide];
    }

    /**
     * sets data corresponding to the surface of the cell with matching coordinate
     * @param x {number} cell coordinates
     * @param y {number} cell coordinates
     * @param nSide {number} wall index (0 - 5)
     * @param xValue {*}
     */
    setSurface(x, y, nSide, xValue) {
        this._map[y][x][nSide] = xValue;
    }

    /**
     * Rotates all wall surfaces of a cell.
     * case 1 : wall-surface 0 becomes 3, wall-surface 1 becomes 0, wall-surface 2 becomes 1...
     * case 2 : wall-surface 0 becomes 1, wall-surface 1 becomes 2, wall-surface 2 becomes 3...
     * This mechanism is use to create a hidden texture, and show it when needed without redrawing it
     * (because redrawing additional texture takes time)
     * @param x {number} cell coordinates
     * @param y {number} cell coordinates
     * @param bClockwise {boolean} true = clockwise, false = counter clockwise... or not
     * true : 0 devient 3, 1 devient 0...
     * false : 0 devient 1, 1 devient 2, 2 devient 3, 3 devient 0
     */
    rotateWallSurfaces(x, y, bClockwise) {
        let mxy = this._map[y][x];
        let a = mxy
            .slice(0, 4)
            .map(m => m.tileset);
        if (bClockwise) {
            a.push(a.shift());
        } else {
            a.unshift(a.pop());
        }
        a.forEach((m, i) => {
            mxy[i].tileset = m;
        });
    }

    /**
     * defines a new tile for the surface
     * the tile, is just a canvas with appropriate dimension
     * the cell surface manager will do the shading automatically
     * @param x {number} cell coordinate
     * @param y {number} cell coordinate
     * @param nSide {number} wall side index
     * @param oTile {HTMLCanvasElement} the new surface
     */
    setDecal(x, y, nSide, oTile) {
        let oSurface = this.getSurface(x, y, nSide);
        // in case of flat texture
        oSurface.imageData = null;
        oSurface.imageData32 = null;
        const ts = new ShadedTileSet();
        oSurface.tileset = ts;
        ts.setImage(oTile, oTile.width, oTile.height); // will automatically shade
    }

    /**
     * Remove decal from a wall
     * @param x
     * @param y
     * @param nSide
     */
    removeDecal(x, y, nSide) {
        const s = this.getSurface(x, y, nSide);
        if (!!s) {
            s.tileset = null;
        }
    }

    shadeSurface(x, y, nSide, nShades, sFogColor, sFilter, fBrightness) {
        const oSurface = this.getSurface(x, y, nSide);
        const ts = oSurface.tileset;
        if (ts) {
            ts.setShadingLayerCount(nShades);
            ts.compute(sFogColor, sFilter, fBrightness);
            if (nSide >= 4) {
                const oCvs = ts.getImage();
                const oCtx = oCvs.getContext('2d');
                const oImgData = oCtx.getImageData(0, 0, oCvs.width, oCvs.height);
                oSurface.imageData = oImgData;
                oSurface.imageData32 = new Uint32Array(oImgData.data.buffer);
            }
        }
    }

    /**
     * recompute all surfaces if the shading parameters have changed
     */
    shadeAllSurfaces(nShades, sFogColor, sFilter, fBrightness) {
        const ymax = this._height;
        const xmax = this._width;
        for (let y = 0; y < ymax; ++y) {
            for (let x = 0; x < xmax; ++x) {
                for (let nSide = 0; nSide < 6; ++nSide) {
                    this.shadeSurface(x, y, nSide, nShades, sFogColor, sFilter, fBrightness);
                }
            }
        }
    }
}

export default CellSurfaceManager;
