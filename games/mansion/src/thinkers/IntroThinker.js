import Easing from "libs/easing";
import Thinker from "libs/engine/thinkers/Thinker";
import FadeOut from "../../../../libs/engine/filters/FadeOut";
import SimpleText from "../filters/SimpleText";
import Link from "libs/engine/filters/Link";
import STRINGS from "../../assets/strings";
import CinemaScope from "../filters/CinemaScope";
import Splash from "../filters/Splash";
import CanvasHelper from "libs/canvas-helper";
const STORY = STRINGS.PLOT_SUMMARY;

class IntroThinker extends Thinker {
    constructor() {
        super();
        this._escapeHit = false;
        this._easing = new Easing();
        this.transitions = {
            "s_init": [
                [1, "s_run"]
            ],
            "s_run": [
                ["t_finish", "s_fade_out", "s_wait_fade_out"]
            ],
            "s_wait_fade_out": [
                ["t_full_black", "s_next_level", "s_done"]
            ]
        }
        this.automaton.state = 's_init';
    }

    displayStory() {
        const engine = this.context.game.engine;
        engine.delayCommand(() => {
            engine
                .filters
                .link(this._storyFilter);
        }, 3000);
    }

    async composeStory() {
        const engine = this.engine;
        const aTexts = STORY.map(s => {
            const oText = new SimpleText();
            const cvs = engine.getRenderingCanvas();
            oText.text(s, cvs.width >> 1, cvs.height >> 1);
            return oText;
        });
        const rscNames = [
            'ng-01.png',            // 0
            'ng-02.png',            // 1
            'ng-05.png',            // 2
            'ng-07.png',            // 3
            's0-amulet.png',        // 4
            's0-cult.png',          // 5
            's0-kabbale-0.png',     // 6
            's0-kabbale-1.png'      // 7
        ]
        const loadedRsc = rscNames.map(r => CanvasHelper.loadCanvas(r));
        const rsc = Promise.all(loadedRsc);
        const aSplashes = [
            new Splash([
                rsc[4]
            ], 2),
            new Splash([
                rsc[5],
                rsc[6],
                rsc[7]
            ], 2),

        ];
    }

    keyDown(key) {
        switch (key) {
            case 'Escape':
                this._escapeHit = true;
                break;
        }
    }

    s_init() {
        const g = this.context.game;
        g.screen._enablePointerlock = false;
        const locStart = g.getLocator('mi_start').position;
        const locFinish = g.getLocator('mi_finish').position;
        this
            ._easing
            .reset()
            .from(locStart.y)
            .to(locFinish.y)
            .steps(70000)
            .use(Easing.SMOOTHSTEP);
        this.elapsedTime = 0;
        this._fadeOut = new FadeOut({duration: 1000});
        this._storyFilter = new Link(this.composeStory());
        this._cinemascope = new CinemaScope(15);
        engine.filters.link(this._cinemascope);
        this.displayStory();
    }

    s_run() {
        const y = this._easing.compute(this.elapsedTime).y;
        this.entity.position.y = y;
    }

    s_fade_out() {
        this.engine.filters.link(this._fadeOut);
        this.elapsedTime = 0;
    }

    s_next_level() {
        // achever l'intro, charger le niveau suivant
        const cvs = this.engine.raycaster.renderCanvas;
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        this.context.game.loadLevel('mans-cabin').then(() => {
            this.context.game.screen._enablePointerlock = true;
            this._fadeOut.terminate();
            this._storyFilter.terminate();
            this._cinemascope.terminate();
        });
    }

    s_done() {
    }

    t_finish() {
        return this._escapeHit || this._easing.over();
    }

    t_full_black() {
        return this.elapsedTime > 1500;
    }
}

export default IntroThinker;