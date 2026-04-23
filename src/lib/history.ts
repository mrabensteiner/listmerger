import { getItem, setItem } from './globalvars';
import * as transfer from './transfer'
import { arrange, updateItem } from './uihelper';

export enum Tasks {
    Edit,
    Move,
    MoveAll,
    Merge,
    Arrange
}

export function init() {
  updateButtons();

  document.getElementById("undo").addEventListener("click", (e) => {
    e.preventDefault();
    undo();
  })

  document.getElementById("redo").addEventListener("click", (e) => {
    e.preventDefault();
    redo();
  })
}

let mergelist = {};

let history = [];
let future = [];


export function resetFuture() {
  future = [];
}

export function getMergeItem(id: string) {
  return mergelist[id];
}

export function addMergeItem(id:string, item: any) {
  mergelist[id] = item;
}

export function deleteMergeItem(id:string) {
  delete mergelist[id];
}

export function updateButtons() {
  let undo_button = document.getElementById("undo") as HTMLButtonElement;
  let redo_button = document.getElementById("redo") as HTMLButtonElement;

  undo_button.disabled = history.length == 0;
  redo_button.disabled = future.length == 0;
}

export function log(task, id1 = "", id2 = "", id3 = "", array=[], title = "", item = {}) {
  history.push({
    action: task,
    id1: id1,
    id2: id2,
    id3: id3,
    array: array,
    title: title,
    item: item
  })

  updateButtons();
}

export function undo() {
  let last = history.pop();
  if (last == undefined) return;

  if (last.action == Tasks.Edit) {
    const tmp = getItem(last.id1);
    setItem(last.id1, last.item);
    updateItem(last.id1);
    last.item = tmp;
  } else if (last.action == Tasks.Move) {
    transfer.moveUndo(last.id1)
  } else if (last.action == Tasks.MoveAll) {
    transfer.moveAllUndo(last.array)
  } else if (last.action == Tasks.Merge) {
    transfer.mergeUndo(last.id3)
  } else if (last.action == Tasks.Arrange) {
    arrange(last.id1, +last.id2);
  }
  future.push(last);

  updateButtons();
}

export function redo() {
  let last = future.pop();
  if (last == undefined) return;

  if (last.action == Tasks.Edit) {
    const tmp = getItem(last.id1);
    setItem(last.id1, last.item);
    updateItem(last.id1);
    last.item = tmp;
  } else if (last.action == Tasks.Move) {
    transfer.move(last.id1, true)
  } else if (last.action == Tasks.MoveAll) {
    let zonefindings = document.getElementById(last.id1).querySelectorAll("[data-role='finding']");
    transfer.moveAll(zonefindings, true);
  } else if (last.action == Tasks.Merge) {
    transfer.merge(last.id1, last.id2, last.title, true, last.id3, last.item);
  } else if (last.action == Tasks.Arrange) {
    arrange(last.id1, +last.id3);
  }

  history.push(last);

  updateButtons();
}
