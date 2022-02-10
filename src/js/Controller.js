import { ajax } from "rxjs/ajax";
import { from, interval, of } from "rxjs";
import { filter, map, mergeMap, catchError } from "rxjs/operators";

import Post from "./Post";

export default class Controller {
  constructor(board) {
    this.board = board;
    this.messagesId = new Set();
  }

  init() {
    this.board.bindToDOM();
    this.subscribeStream();
    this.btn = document.querySelector(".btn");
    this.btn.addEventListener("click", this.unSubscribe.bind(this));
  }

  subscribeStream() {
    this.messagesStream$ = interval(2000)
      .pipe(
        mergeMap(() =>
          //  ajax
          //.getJSON("http://localhost:8080/messages/unread")
          ajax
            .getJSON(`https://polling-alexa222.herokuapp.com/messages/unread`)
            .pipe(
              map((response) => {
                const newMsgs = response.messages.filter(
                  (message) => !this.messagesId.has(message.id)
                );

                newMsgs.forEach((message) => this.messagesId.add(message.id));
                return newMsgs;
              }),
              catchError((err) => {
                err.response === null
                  ? this.messagesStream$.unsubscribe()
                  : of([]);
              })
            )
        )
      )

      .subscribe((response) => {
        this.getValue(response);
      });
  }

  getValue(obj) {
    if (!obj.length) {
      return;
    }
    obj.forEach((elem) => {
      const message = new Post(elem);
      message.init();
    });
  }

  unSubscribe(e) {
    if (!e.target.classList.contains("btn")) {
      return;
    }
    e.preventDefault();
    this.messagesStream$.unsubscribe();
  }
}
