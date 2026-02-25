import * as transfer from './transfer'

enum HistoryTasks {
    Move,
    UnMove,
    MoveAll,
    Merge,
    UnMerge
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

export function log(task, id1 = "", id2 = "", id3 = "", array=[], title = "") {
  history.push({
    action: task,
    id1: id1,
    id2: id2,
    id3: id3,
    array: array,
    title: title
  })
  console.log("history")
  console.log(history)
  console.log(future)
  updateButtons();
}

export function undo() {
  let last = history.pop();
  if (last == undefined) return;

  if (last.action == "move") {
    transfer.moveUndo(last.id1)
  } else if (last.action == "move_all") {
    transfer.moveAllUndo(last.array)
  } else if (last.action == "merge") {
    transfer.mergeUndo(last.id3)
  }
  future.push(last);

  console.log("<< undo");
  console.log(history);
  console.log(future);
  updateButtons();
}

export function redo() {
  let last = future.pop();
  if (last == undefined) return;
  history.push(last);

  if (last.action == "move") {
    transfer.move(last.id1, true)
  } else if (last.action == "move_all") {
    let zonefindings = document.getElementById(last.id1).querySelectorAll("[data-role='finding']");
    transfer.moveAll(zonefindings, true);
  } else if (last.action == "merge") {
    transfer.merge(last.id1, last.id2, last.title, true, last.id3)
  }

  console.log(">> redo");
  console.log(history);
  console.log(future);
  updateButtons();
}
