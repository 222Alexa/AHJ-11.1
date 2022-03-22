export default class Modal {
  constructor(parentEl) {
    this.parentEl = parentEl;
  }

  static get markup() {
    return `
        <div class="modal modal-active">
		      <div class="modal-content">
			      <h3 class="description__title"></h3>
            <p class="modal-text">Что-то пошло не так...</p>
            <div class="modal-button__block">
          	<button class="modal-send__btn">Ok!</button>
						</div>
				  </div>  
        </div>
`;
  }

  redrawModalForm() {
    if (document.querySelector(".modal")) {
      return;
    }
    this.parentEl.insertAdjacentHTML("afterbegin", this.constructor.markup);

    this.modalButtonEl.addEventListener("click", (e) => {
      e.preventDefault();
      this.closeModalForm();
    });
  }

  get modalWrapperEl() {
    return this.parentEl.querySelector(".modal");
  }

  get modalButtonEl() {
    return this.parentEl.querySelector(".modal-send__btn");
  }

  closeModalForm() {
    this.modalWrapperEl.classList.remove("modal-active");
    this.parentEl.querySelector(".modal").remove();
  }
}
