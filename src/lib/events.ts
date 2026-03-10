import { CssNames, getNextDropSibling, getPositionInList, toggleDrop } from "./uihelper";
import * as transfer from './transfer';
import * as history from './history';
import { mergelistId } from "./globalvars";

export enum Action {
  None,
  Move,
  Arrange,
}

let dropOrigin = "";
let dropTarget = "";

let dragAction = Action.None;
let dragPosition = -1;
let mergeListElement;
let dialog;

export function init() {
  mergeListElement = document.querySelector("#mlist");
  initDialog();
  initDragDrop();
  initMoveAll();
}

function initDialog() {
  dialog = document.querySelector("dialog");

  const closebutton = document.querySelector("dialog button#closebutton");
  const mergebutton = document.querySelector("#mergebutton");
  closebutton.addEventListener("click", dialogClose);
  mergebutton.addEventListener("click", merge);
}

function initDragDrop() {
  const listmerger_element = document.getElementById(mergelistId);
  const mergelist_element = listmerger_element.querySelector(".mergelist");

  listmerger_element.addEventListener("dragstart", dragStart);
  listmerger_element.addEventListener("dragend", dragEnd);
  mergelist_element.addEventListener("dragenter", dragHover);
  mergelist_element.addEventListener("dragleave", dragHover);
  mergelist_element.addEventListener("dragover", dragOver);
  mergelist_element.addEventListener("drop", drop);
}

export function dragStart(e: Event) {
  let element = (e.target as HTMLElement)

  if((element.nodeName != "DIV" && !element.classList.contains(CssNames.ITEM_DRAGHANDLE))
    || element.classList.contains(CssNames.ITEM_ADDED)
    || element.classList.contains(CssNames.ITEM_MERGED)) {
    e.preventDefault();
    return;  
  }

  dropOrigin = element.id;

  if (element.classList.contains(CssNames.ITEM_DRAGHANDLE)) {
    mergeListElement = document.querySelector("#mlist");
    dragAction = Action.Arrange;
    dropOrigin = element.parentElement.id;
    dragPosition = getPositionInList(dropOrigin);

    element.parentElement.classList.add(CssNames.ITEM_DRAGGING);
  } else {
    dragAction = Action.Move;
    document.getElementById(dropOrigin).classList.add(CssNames.ITEM_DRAGGED);
  }
}

export function dragEnd(e: Event) {
  document.querySelectorAll(`.${CssNames.HOVER_DRAG}`).forEach((e) => {
    e.classList.remove(CssNames.HOVER_DRAG);
  })
  document.getElementById(dropOrigin).classList.remove(CssNames.ITEM_DRAGGING);
    dropOrigin = (e.target as Element).id;
    if(dropOrigin == "") {
      return;
    }
    document.getElementById(dropOrigin).classList.remove(CssNames.ITEM_DRAGGED);
    dragAction = Action.None;
}

export function dragHover(e: Event) {
  if(dragAction == Action.Move) {
    toggleDrop(e, dropOrigin) 
  }
}

export function dragOver(e: DragEvent) {
  e.preventDefault();

  if(dragAction == Action.Move) {
    return;
  }

  // https://www.codingnepalweb.com/drag-and-drop-sortable-list-html-javascript/
  const draggingItem = document.querySelector(`.${CssNames.ITEM_DRAGGING}`);
  let nextSibling = getNextDropSibling(e);

  mergeListElement.insertBefore(draggingItem, nextSibling);
}

export function drop(e: DragEvent) {
  if(dragAction == Action.Arrange) {
    let dropPosition = getPositionInList(dropOrigin);

    if (dragPosition != dropPosition) {
      history.log(history.Tasks.Arrange, dropOrigin, dragPosition.toString(), dropPosition.toString());
    }
    dragAction = Action.None;
    return;
  }
  dragAction = Action.None;

  toggleDrop(e, dropOrigin);

  let droporigin_element = document.getElementById(dropOrigin);
  let target = (e.target as HTMLElement);

  if(dropOrigin == target.id) {
    return;
  }

  if(target.classList.contains("draghandle")) {
    target = target.parentElement;
  }
  if (target.getAttribute("data-role") == "finding") {
    // merging target
    const mergeplaceholder = document.querySelector("#mergeplaceholder");

    dropTarget = target.id;
    mergeplaceholder.innerHTML = " (ID " + target.id + " and ID " + dropOrigin + ")";
    let newtitle_element = (dialog.querySelector("input[name='newtitle']") as HTMLInputElement);
    newtitle_element.value = "Merged findings " + target.id + " and " + dropOrigin;
    dialog.showModal();

    return;
  }
  else if (target.getAttribute("data-role") != "zone" && target.id != "mlist") {
    // other target
    return;
  }
  else if (droporigin_element.parentElement.id == target.id) {
    // is already there, move it to the new position
   
    let dragPosition = getPositionInList(dropOrigin);
    let nextSibling = getNextDropSibling(e);

    let dropPosition = nextSibling != undefined
      ? getPositionInList(nextSibling.id)
      : mergeListElement.length - 1;

    if (dragPosition != dropPosition) {
      transfer.arrange(dropOrigin, dropPosition, true);
      history.log(history.Tasks.Arrange, dropOrigin, dragPosition.toString(), dropPosition.toString());
    }

    dragAction = Action.None;
    return;
  }
  else if (droporigin_element.classList.contains(CssNames.ITEM_ADDED) || droporigin_element.classList.contains(CssNames.ITEM_MERGED)) {
    return;
  }

  transfer.move(dropOrigin);
  history.log(history.Tasks.Move, dropOrigin);
}

export function merge(event: Event) {
  event.preventDefault();

  let target = document.getElementById(dropTarget);
  let targetid = target.id;

  let dropOriginelement = document.getElementById(dropOrigin);
  let newtitle_element = (dialog.querySelector("input[name='newtitle']") as HTMLInputElement)
  // target.innerText = newtitle_element.value;

  let origin_id = dropOrigin;

  if(dropOriginelement.hasAttribute("data-origin")) {
    origin_id = dropOriginelement.getAttribute("data-origin");
    let origin_element = document.getElementById(origin_id);
    origin_element.classList.remove(CssNames.ITEM_ADDED);
    origin_element.classList.add(CssNames.ITEM_MERGED);
  } else {
    dropOriginelement.classList.add(CssNames.ITEM_MERGED);
  }

  let mergeid: string = transfer.merge(target.id, dropOrigin, newtitle_element.value)
  history.log(history.Tasks.Merge, targetid, dropOrigin, mergeid, [], newtitle_element.value)
  
  dialog.close();
}

export function dialogClose(e: Event) {
  e.preventDefault();
  dialog.close()
}

export function initMoveAll() {
  const moveallbuttons = document.querySelectorAll(".moveall");

  moveallbuttons.forEach(button => {
    button.addEventListener("click", moveAll);
  });
}

function moveAll(e: Event) {
  let parent = (e.target as Element).parentNode as Element;
  let zonefindings = parent.querySelectorAll("[data-role='finding']");

  if(zonefindings.length == 0) return;

  let moved = transfer.moveAll(zonefindings);
  if(moved.length) {
    history.log(history.Tasks.MoveAll, (e.target as Element).nextElementSibling.id, "", "", moved);
  }
}