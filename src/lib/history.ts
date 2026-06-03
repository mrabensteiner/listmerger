import { getItem, mergeDetach, setItem, updateMerged, updateMergedInto } from './globalvars';
import * as transfer from './transfer'
import { arrange, CssNames, updateAllIndicators, updateItem } from './uihelper';

export enum Tasks {
    Edit,
    Move,
    MoveAll,
    Merge,
    Arrange,
    Detach
}

export function init() {
  updateButtons();

  document.getElementById("undo")?.addEventListener("click", (e) => {
    e.preventDefault();
    undo();
  })

  document.getElementById("redo")?.addEventListener("click", (e) => {
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

export function log(task: Tasks, id1 = "", id2 = "", id3 = "", array: any[] =[], title = "", item = {}, item2 = {}) {
  history.push({
    action: task,
    id1: id1,
    id2: id2,
    id3: id3,
    array: array,
    title: title,
    item: item,
    item2: item2
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
    transfer.mergeUndo(last.id3, last.item.A, last.item.B)
  } else if (last.action == Tasks.Arrange) {
    arrange(last.id1, +last.id2);
  } else if (last.action == Tasks.Detach) {
    transfer.attach(last.id1, last.id2, last.array);
  }

  document.getElementById(last.id1).parentElement.closest("details").open = true;
  window.history.replaceState(null, "", '#' + last.id1);
  document.getElementById(last.id1)?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'nearest' 
  });
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
    transfer.move(last.id1, +last.id3-1, true)
  } else if (last.action == Tasks.MoveAll) {
    let zonefindings = document.getElementById(last.id1)?.querySelectorAll("[data-role='finding']");
    transfer.moveAll(zonefindings, true);
  } else if (last.action == Tasks.Merge) {
    transfer.merge(last.id1, last.id2, last.title, true, last.id3, last.item.merged);
  } else if (last.action == Tasks.Arrange) {
    arrange(last.id1, +last.id3);
  } else if (last.action == Tasks.Detach) {
    transfer.detach(last.id1, last.id2);
  }

  document.getElementById(last.id1).parentElement.closest("details").open = true;
  window.history.replaceState(null, "", '#' + last.id1);
  document.getElementById(last.id1)?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'nearest' 
  });
  history.push(last);

  updateButtons();
}
