const CONSTS = require('../../consts');

/**
 * La photo doit faire place au passage secret
 * @param game
 * @param remove
 * @param x
 * @param y
 */

export function main(game, remove, x, y) {
    game.runScript('action.resolveClueUnlockSecret', 'm0_bloody_deadend', CONSTS.PHOTO_SCORE_COMMON);
    game.removeSense('m0_bloody_hands');
    remove();   // supprimer le tag, qui ne doit servir qu'une fois.
}
