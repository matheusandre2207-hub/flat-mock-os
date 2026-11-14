// Tamanho da "tela do aparelho" (o palco). Em retrato é a janela inteira;
// em paisagem é um palco com proporção de celular deitado, centralizado.
// Os gestos usam estas medidas em vez de window.innerWidth/innerHeight.

const PORTRAIT_RATIO = 390 / 844;   // celular em pé
const LANDSCAPE_RATIO = 844 / 390;  // celular deitado

let current = { w: 390, h: 844 };

export function setScreenSize(w: number, h: number) {
  current = { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
}
export function screenW() { return current.w; }
export function screenH() { return current.h; }

export function stageFor(landscape: boolean, vw: number, vh: number) {
  if (!landscape) return { w: vw, h: vh, left: 0, top: 0 };
  let w = vw;
  let h = vw / LANDSCAPE_RATIO;
  if (h > vh) {
    h = vh;
    w = vh * LANDSCAPE_RATIO;
  }
  w = Math.round(w);
  h = Math.round(h);
  return { w, h, left: Math.round((vw - w) / 2), top: Math.round((vh - h) / 2) };
}

export { PORTRAIT_RATIO };
