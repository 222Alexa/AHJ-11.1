import { ajax } from "rxjs/ajax";
import { fromEvent, interval, of } from "rxjs";
import { debounceTime, map, switchMap, catchError } from "rxjs/operators";

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
    this.btnSubscribe = document.querySelector(".btn-subscribe");
    this.btnUnSubscribe = document.querySelector(".btn-unsubscribe");

    this.btnUnSubscribe.addEventListener("click", this.unSubscribe.bind(this));
    this.getSource();
  }

  /**
   *стрим кнопки подписки на сообщения
   */

  getSource() {
    this.source$ = fromEvent(this.btnSubscribe, "click");

    if (this.messagesStream$) {
      return;
    }

    this.source$
      .pipe(
        debounceTime(500),

        map((evt) => {
          HTMLElement; // что еще сюда положить...,
          // если мне надо только на кнопку нажать
          console.log(evt);
        })
      )
      .subscribe((evt) => {
        // я не могу придумать способа лучше, чтобы остановить спам кнопки подписки
        if (this.messagesStream$ && this.messagesStream$.closed === false) {
          this.messagesStream$.unsubscribe();
        }
        this.subscribeStream();
      });
  }

  subscribeStream() {
    this.messagesStream$ = interval(2000)
      .pipe(
        switchMap(() =>
          //ajax.getJSON("http://localhost:8080/messages/unread").pipe(
            ajax.getJSON("https://coatest.herokuapp.com/messages/unread").pipe(
            map((response) => {
              const newMsgs = response.messages.filter(
                (message) => !this.messagesId.has(message.id)
              );
              return newMsgs;
            }),
            catchError(() => {
              // так и не поняла, можно ли здесь
              // вставить что-то кроме возврата пустого массива
              this.modal.redrawModalForm();
              // не уверена, что здесь можно отписаться от this.messagesStream$
              // но остановить-то его можно...наверно
              this.messagesStream$.closed = true;
              return of([]);
            })
          )
        )
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

  /**
   *
   * отписка от сообщений
   */
  unSubscribe(e) {
    if (!e.target.classList.contains("btn")) {
      return;
    }
    e.preventDefault();
    this.messagesStream$.unsubscribe();
  }
}
