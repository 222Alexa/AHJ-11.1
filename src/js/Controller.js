import { ajax } from "rxjs/ajax";
import { fromEvent, interval, of, EMPTY, merge } from "rxjs";
import {
  takeWhile,
  takeUntil,
  repeat,
  map,
  switchMap,
  catchError,
  mapTo,
} from "rxjs/operators";

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
    this.modal.redrawModalForm();
    this.startClick$ = fromEvent(
      document.querySelector(".btn-subscribe"),
      "click"
    );
    this.stopClick$ = fromEvent(
      document.querySelector(".btn-unsubscribe"),
      "click"
    );
    this.closeModalClick$ = fromEvent(
      document.querySelector(".modal-send__btn"),
      "click"
    );

    this.toggleClick();
  }

  subscribeStream() {
    //ajax.getJSON("http://localhost:8080/messages/unread").pipe(

    return ajax
      .getJSON("https://coatest.herokuapp.com/messages/unread")
      .pipe(
        map((response) => {
          const newMsgs = response.messages.filter(
            (message) => !this.messagesId.has(message.id)
          );

          return newMsgs;
        }),

        catchError((err) => {
          // поскольку fromEvent не может быть создан с несуществующим элементом
          //приходится заранее держать модальное окно в разметке
          //это не очень

          document.querySelector(".modal").classList.add("modal-active");
          return of([]);
        })
      )

      .subscribe((response) => {
        // console.log(response);
        response.forEach((message) => this.messagesId.add(message.id));
        this.getValue(response);
      });
  }

  toggleClick() {
    this.startClick$ = merge(
      this.startClick$.pipe(mapTo(true)),
      this.stopClick$.pipe(mapTo(false)),
      this.closeModalClick$.pipe(mapTo(false))
    );

    this.startClick$
      .pipe(switchMap((isStart) => (isStart ? interval(2000) : EMPTY)))
      //и вот здесь подписка в подписке
      .subscribe(() => this.subscribeStream());

    // this.stopClick$.subscribe(() => {
    // console.log("stop");
    // });
  }

  /*я пытаюсь сделать  в subscribeStream() примерно такое:
 ... this.stream = ajax
  .getJSON("https://coatest.herokuapp.com/messages")
  .pipe(
    map((response) => {
      const newMsgs = response.messages.filter(
        (message) => !this.messagesId.has(message.id)
      );

      return newMsgs;
    }),
    timer(2000),
    repeat(),

    catchError((err) => {
      document.querySelector(".modal").classList.add("modal-active");
      return of([]);
    }),

  )...
  и уже это использовать вместо interval(2000) в toggleClick()

  но и это не работает, 
  и еще много вариантов за неделю перепробовала, 
  но у меня либо не получается совместить потокиб
  либо я не могу написать им общий subscribe()  
  
  */

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
