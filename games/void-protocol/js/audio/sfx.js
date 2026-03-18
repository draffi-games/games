// VOID PROTOCOL — Sound Effects (Web Audio API oscillator-based)

export const SFX = (() => {
    let a = null, k = false;

    function I() {
        if (k) return;
        try { a = new (window.AudioContext || window.webkitAudioContext)(); k = true; } catch (e) {}
    }

    function O(t, f, d, v = .06, e = null) {
        if (!a) return;
        const n = a.currentTime, o = a.createOscillator(), g = a.createGain();
        o.type = t;
        o.frequency.setValueAtTime(f, n);
        if (e) o.frequency.exponentialRampToValueAtTime(e, n + d);
        g.gain.setValueAtTime(v, n);
        g.gain.exponentialRampToValueAtTime(.001, n + d);
        o.connect(g).connect(a.destination);
        o.start(n);
        o.stop(n + d + .01);
    }

    return {
        init: I,
        pistol()  { O('square',   400, .06, .05, 150); },
        shotgun() { O('sawtooth', 200, .1,  .06, 60);  },
        plasma()  { O('sine',     800, .15, .04, 200); },
        rail()    { O('sawtooth', 1200,.2,  .05, 100); },
        flame()   { O('sawtooth', 100, .08, .02, 50);  },
        rocket()  { O('sawtooth', 150, .12, .04, 80);  },
        explode() { O('sine',     100, .3,  .06, 20);  },
        hit()     { O('square',   300, .04, .03, 100); },
        enemyHit(){ O('triangle', 500, .05, .03, 200); },
        door()    { O('sine',     200, .3,  .04, 400); },
        pickup()  { O('sine',     600, .1,  .04);      },
        step()    { O('sine', 60 + Math.random() * 30, .05, .015, 40); }
    };
})();

// Auto-init on first user interaction
document.addEventListener('click', () => SFX.init(), { once: true });

// Step sound timer (managed by player movement update)
export let stepTimer = 0;

export function setStepTimer(val) { stepTimer = val; }
