export default class Message {
  constructor(data) {
    this.data = data;
    this.created = new Date(data.received).toLocaleString();
  }

  init() {
    this.bindToDOM();
  }

  template(data, created) {
    const date = this.dateFormatted(data);
    return `
      <li class="posts__card" data-id="${data.id}" data-time="${date}" data-author="${data.from}">
        <div class="post__wrapper">
            <span class="posts__author">${data.from}, </span>
            <div class="post__content">${data.body}</div>
            <span class="posts__datetime">${date}</span>  
        </div>
      </li>
      `;
  }

  dateFormatted(data) {
    const date = new Date(data.received).toLocaleString().split(",").reverse();
    return `${date[0]}, ${date[1]}`;
  }

  bindToDOM() {
    const panel = document.querySelector(".messages-container");

    const post = this.addPost(this.data, this.created);

    panel.insertAdjacentHTML("afterbegin", post);
  }

  addPost() {
    if (this.data) {
      this.getFormattedText(this.data);

      const result = this.template(this.data, this.created);

      return result;
    }
    return false;
  }

  getFormattedText(data) {
    const text = data.body.split("");
    if (text.length <= 15) {
      return;
    }
    const result = text.slice(0, 15);
    data.body = result.toString().replaceAll(",", "").concat("...");
  }
}
