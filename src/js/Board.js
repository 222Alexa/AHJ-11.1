export default class Board {
  constructor(container) {
    this.container = container;
  }

  static get markup() {
    return `
    <div class="polling__widget">
      <div class="messages-container"></div>
    </div>
`;
  }

  bindToDOM() {
    this.container.insertAdjacentHTML("afterbegin", this.constructor.markup);
  }
}
