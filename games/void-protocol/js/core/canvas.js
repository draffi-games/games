// VOID PROTOCOL — Canvas Setup & Resize

export const DEBUG = false;
if (!DEBUG) {
    const n = () => {};
    console.log = n;
    console.warn = n;
    console.info = n;
}

export const gc = document.getElementById('gc');
export const ctx = gc.getContext('2d');
export const lc = document.getElementById('lc');
export const lctx = lc.getContext('2d');

export let W, H;

export function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    gc.width = W;
    gc.height = H;
    lc.width = W;
    lc.height = H;
}

resize();
window.addEventListener('resize', resize);
