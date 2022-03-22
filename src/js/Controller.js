import { ajax } from "rxjs/ajax";
import { fromEvent, interval, of, EMPTY, merge } from "rxjs";
import { map, switchMap, catchError, mapTo } from "rxjs/operators";

import Message from "./Message";
import Modal from "./Modal";

export default class Controller {
  constructor(board) {
    this.board = board;
    this.messagesId = new Set();
  }

  init() {
    this.board.bindToDOM();
    this.modal = new Modal(document.querySelector("#container"));

    this.btnClick$ = fromEvent(document.querySelector("#container"), "click");

    this.toggleClick();
  }

  subscribeStream() {
    // ajax.getJSON("http://localhost:8080/messages/unread").pipe(

    return ajax.getJSON("https://coatest.herokuapp.com/messages/unread").pipe(
      map((response) => {
        const newMsgs = response.messages.filter(
          (message) => !this.messagesId.has(message.id)
        );

        return newMsgs;
      }),

      catchError((err) => {
        this.modal.redrawModalForm();

        return of([]);
      })
    );
  }

  toggleClick() {
    let isRun;
    this.startClick$ = this.btnClick$.pipe(
      map((event) => {
        if (event.target.classList.contains("btn-subscribe")) {
          isRun = true;
        }
        if (
          event.target.classList.contains("modal-send__btn") ||
          event.target.classList.contains("btn-unsubscribe")
        ) {
          isRun = false;
        }
        console.log(isRun, "isRun");
        return isRun;
      })
    );

    this.startClick$
      .pipe(
        switchMap((isStart) => (isStart ? interval(2000) : EMPTY)),
        switchMap(() => this.subscribeStream())
      )

      .subscribe((response) => {
        console.log(response);
        response.forEach((message) => this.messagesId.add(message.id));
        this.getValue(response);
      });
  }

  getValue(obj) {
    if (!obj.length) {
      return;
    }
    obj.forEach((elem) => {
      const message = new Message(elem);
      message.init();
    });
  }
}
