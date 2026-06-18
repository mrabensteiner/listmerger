import * as g from './globalvars';
import * as transfer from './transfer'
import * as ui from './uihelper';

export enum Tasks {
    Edit,
    Move,
    UnMove,
    MoveAll,
    Merge,
    Arrange,
    Detach
}

export type HistoryItem = {
  action: Tasks,
  id1: string,
  id2: string,
  id3: string,
  array: Array<any>,
  item: g.ListItem,
  item2: g.ListItem
};

export type HistoryCallback = (is_new: boolean) => void;
let history_callback_function: HistoryCallback = () => {};

export function init() {
  updateButtons();

  document.getElementById(g.SELECTOR.BUTTON_UNDO)?.addEventListener("click", (e) => {
    e.preventDefault();
    undo();
  })

  document.getElementById(g.SELECTOR.BUTTON_REDO)?.addEventListener("click", (e) => {
    e.preventDefault();
    redo();
  })
}

let history: Array<HistoryItem> = [];
let future: Array<HistoryItem> = [];

export function resetFuture() {
  future = [];
}

export function updateButtons() {
  let undo_button = document.getElementById(g.SELECTOR.BUTTON_UNDO) as HTMLButtonElement;
  let redo_button = document.getElementById(g.SELECTOR.BUTTON_REDO) as HTMLButtonElement;

  undo_button.disabled = history.length == 0;
  redo_button.disabled = future.length == 0;

  if (!undo_button.disabled) {
    const string = historyItemToString(history.at(-1));
    undo_button.title = `Undo ${string}`;
  } else {
    undo_button.title = "";
  }
  if (!redo_button.disabled) {
    const string = historyItemToString(future.at(-1));
    redo_button.title = `Redo ${string}`;
  } else {
    redo_button.title = "";
  }
}

export function setHistoryCallback(callback: () => void) {
  history_callback_function = callback;
}

export function log(task: Tasks, id1 = "", id2 = "", id3 = "", array: any[] = [], item = {}, item2 = {}) {
  resetFuture();
  history.push({
    action: task,
    id1: id1,
    id2: id2,
    id3: id3,
    array: array,
    item: item,
    item2: item2
  })

  history_callback_function(true);
  updateButtons();
}

export function undo() {
  let last = history.pop();
  if (last == undefined) return;

  if (last.action == Tasks.Edit) {
    const tmp = g.getItem(last.id1);
    g.setItem(last.id1, last.item);
    ui.updateItem(last.id1);
    last.item = tmp;
  } else if (last.action == Tasks.Move) {
    transfer.moveUndo(last.id1)
  } else if (last.action == Tasks.UnMove) {
    transfer.move(last.id1, +last.id3)
  } else if (last.action == Tasks.MoveAll) {
    transfer.moveAllUndo(last.array)
  } else if (last.action == Tasks.Merge) {
    transfer.mergeUndo(last.id3, last.item.A, last.item.B)
  } else if (last.action == Tasks.Arrange) {
    ui.arrange(last.id1, +last.id2);
  } else if (last.action == Tasks.Detach) {
    transfer.attach(last.id1, last.id2, last.array);
  }

  if (document.getElementById(last.id1) && document.getElementById(last.id1)?.parentElement?.closest("details")) {
    document.getElementById(last.id1)!.parentElement!.closest("details")!.open = true;
  }
  ui.setHash(last.id1);
  document.getElementById(last.id1)?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'nearest' 
  });
  future.push(last);

  history_callback_function(false);
  updateButtons();
}

export function redo() {
  let last = future.pop();
  if (last == undefined) return;

  if (last.action == Tasks.Edit) {
    const tmp = g.getItem(last.id1);
    g.setItem(last.id1, last.item);
    ui.updateItem(last.id1);
    last.item = tmp;
  } else if (last.action == Tasks.Move) {
    transfer.move(last.id1, +last.id3-1)
  } else if (last.action == Tasks.UnMove) {
    transfer.moveUndo(last.id1)
  } else if (last.action == Tasks.MoveAll) {
    let zone_elements = document.getElementById(last.id1)?.querySelectorAll(`[data-role='${g.SELECTOR.ITEM}']`) as NodeListOf<Element>;
    transfer.moveAll(zone_elements);
  } else if (last.action == Tasks.Merge) {
    transfer.merge(last.id1, last.id2, last.id3, last.item.merged);
  } else if (last.action == Tasks.Arrange) {
    ui.arrange(last.id1, +last.id3);
  } else if (last.action == Tasks.Detach) {
    transfer.detach(last.id1, last.id2);
  }

  if (document.getElementById(last.id1) && document.getElementById(last.id1)!.parentElement!.closest("details")) {
    document.getElementById(last.id1)!.parentElement!.closest("details")!.open = true;
  }
  ui.setHash(last.id1);
  document.getElementById(last.id1)?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'nearest' 
  });
  history.push(last);

  history_callback_function(false);
  updateButtons();
}

function historyItemToString(historyitem: any) {
  let item = g.getItem(historyitem.id1);
  let string = "";

  if (historyitem.action == Tasks.Edit) {
    string = `edit '${item.parent}: ${item.title}'`;
  }
  else if (historyitem.action == Tasks.Move) {
    string = `move '${item.parent}: ${item.title}' to mergelist`;
  }
  else if (historyitem.action == Tasks.UnMove) {
    string = `remove '${item.parent}: ${item.title}' from mergelist`;
  }
  else if (historyitem.action == Tasks.MoveAll) {
    item = g.getItem(historyitem.array[0]);
    string = `move all from '${item.parent}'`;
  }
  else if (historyitem.action == Tasks.Merge) {
    const item2 = g.getItem(historyitem.id2);
    const title1 = item.parent == undefined ? historyitem.item.A.title : `${item.parent}: ${item.title}`;
    const title2 = item2.parent == undefined ? historyitem.item.B.title : `${item2.parent}: ${item2.title}`;
    string = `merge '${title1}' and '${title2}' to '${historyitem.item.merged.title}'`;
  }
  else if (historyitem.action == Tasks.Arrange) {
    string = `arrange '${item.parent}: ${item.title}'`;
  }
  else if (historyitem.action == Tasks.Detach) {
    const item2 = g.getItem(historyitem.id2);
    string = `detach '${item.parent}: ${item.title}' from '${item2.parent}: ${item2.title}'`;
  }

  return string;
}
