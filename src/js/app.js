import Board from "./Board";
import Controller from "./Controller";

const container = document.getElementById("container");
const board = new Board(container);

const controller = new Controller(board);
controller.init();
