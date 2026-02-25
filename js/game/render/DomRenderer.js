export class DomRenderer {
  constructor(refs) {
    this.refs = refs;
  }

  setPlayerPosition(x, y) {
    this.refs.player.style.left = x + "px";
    this.refs.player.style.top = y + "px";
  }
}
