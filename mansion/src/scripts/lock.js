/**
 * Initially locks a door tagged with "lock"
 * @param game {Game} game instance
 * @param remove {function} if called back, the tag is removed from the level.
 * @param x {number} cell door coordinates (x axis)
 * @param y {number} cell door coordinates (y axis)
 */
export function init(game, remove, x, y) {
    game.engine.lockDoor(x, y, true);
}

export function push(game, remove, x, y, key) {
    if (!!key && game.logic.hasQuestItem(key)) {
        const d = game.logic.getItemData(key);
        const bDiscard = d.type === 'key-one';
        if (bDiscard) { // the item is a discardable key
            game.logic.removeQuestItem(key); // remove key from inventory
        }
        remove(); // removes tag
        game.ui.popup('DOOR_UNLOCKED', 'unlock', key);
        game.removeDecals(x, y); // remove keyhole decal from door
        game.engine.lockDoor(x, y, false); // unlock door
    } else {
        // the door is simply locked without key
        game.ui.popup('DOOR_LOCKED', 'keyhole');
    }
}