import { toggleDrop } from "./uihelper";
import * as transfer from './transfer';
import * as history from './history';
import { mergelistId } from "./globalvars";

let dropOrigin = "";
let dropTarget = "";

let dragAction = "";
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
  let element = (e.target as Element)
  dropOrigin = element.id;

  if (element.classList.contains("draghandle")) {
    mergeListElement = document.querySelector("#mlist");
    dragAction = "handle";
    dropOrigin = element.parentElement.id;
    console.log("hendl", element.parentElement.id)
    setTimeout(() => element.parentElement.classList.add("dragging"), 0);
  } else {
    dragAction = "move";
    document.getElementById(dropOrigin).classList.add("dragg");
  }
}

export function dragEnd(e: Event) {
  document.getElementById(dropOrigin).classList.remove("dragging");
    dropOrigin = (e.target as Element).id;
    if(dropOrigin == "") {
      return;
    }
    document.getElementById(dropOrigin).classList.remove("dragg");
}

export function dragHover(e: Event) {
  if(dragAction == "move") {
    toggleDrop(e, dropOrigin) 
  }
}

export function dragOver(e: DragEvent) {
  e.preventDefault();

  if(dragAction == "move") {
    return;
  }

  // https://www.codingnepalweb.com/drag-and-drop-sortable-list-html-javascript/
  const draggingItem = document.querySelector(".dragging");
  let siblings = [...mergeListElement.querySelectorAll(".element:not(.dragging)")];
  let nextSibling = siblings.find((sibling: HTMLDivElement) => {
      return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
  });
  mergeListElement.insertBefore(draggingItem, nextSibling);
}

export function drop(e: Event) {
  if(dragAction == "handle") {
    return;
  }

  toggleDrop(e, dropOrigin);

  let droporigin_element = document.getElementById(dropOrigin);
  let target = (e.target as HTMLElement);

  if(dropOrigin == target.id) {
    return;
  }

  console.log(target)
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
    // is already there
    return;
  }
  else if (droporigin_element.classList.contains("added") || droporigin_element.classList.contains("merged")) {
    return;
  }

  transfer.move(dropOrigin);
  history.log("move", dropOrigin);
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
    origin_element.classList.remove("added");
    origin_element.classList.add("merged");
  } else {
    dropOriginelement.classList.add("merged");
  }

  let mergeid: string = transfer.merge(target.id, dropOrigin, newtitle_element.value)
  history.log("merge", targetid, dropOrigin, mergeid, [], newtitle_element.value)
  
  dialog.close();
}

export function dialogClose() {
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
  history.log("move_all", (e.target as Element).nextElementSibling.id, "", "", moved);
}