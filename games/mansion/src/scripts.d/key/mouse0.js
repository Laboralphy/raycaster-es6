export function keydown(game) {
    if (game.isCameraRaised()) {
        game.triggerCamera();
    }
}