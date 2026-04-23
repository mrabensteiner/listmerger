import { arrange, CssNames, getNextDropSibling, getPositionInList, prepareMergeModal, prepareModal, toggleDrop } from "./uihelper";
import * as transfer from './transfer';
import * as history from './history';
import { addMergeItem, getItem, mergelistId, PREFIX_MERGED, PREFIX_MOVED, setItem } from "./globalvars";

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
let dialog: HTMLDialogElement;

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

  listmerger_element.addEventListener("pointerdown", preventDrag);
  //listmerger_element.addEventListener("click", elementDialog);
  listmerger_element.addEventListener("dragstart", dragStart);
  listmerger_element.addEventListener("dragend", dragEnd);
  mergelist_element.addEventListener("dragenter", dragHover);
  mergelist_element.addEventListener("dragleave", dragHover);
  mergelist_element.addEventListener("dragover", dragOver);
  mergelist_element.addEventListener("drop", drop);

  listmerger_element.addEventListener("click", itemToHash);
  window.addEventListener('hashchange', updateHash);

  updateHash();
}

function updateHash() {
  const id = location.hash.substring(1);
  const element = document.getElementById(id);

  if(element instanceof HTMLDetailsElement) {
    element.open = true;

    const tab = element.closest("[name='tabs']") as HTMLDetailsElement;
    const tab_select = document.getElementById(CssNames.TAB_SELECTOR) as HTMLSelectElement
    tab_select.value = tab.dataset.order;
  }
}

function itemToHash(e: MouseEvent) {
  const element = (e.target as HTMLElement).closest("details");

  if(element != undefined) {
    window.history.replaceState(null, null, '#' + element.id);
  }
}

function preventDrag(e: DragEvent) {
  let element = (e.target as HTMLElement);

  if(element.draggable && !element.classList.contains("element") && !element.classList.contains("draghandle")) {
    element.draggable = false;
  }
}

export function elementDialog(e: Event) {
  const element = (e.target as HTMLElement).closest(".element");
  
  if(element == null) {
    return;
  }

  const element_id = element.id.startsWith(PREFIX_MOVED) ? element.getAttribute("data-origin") : element.id;

  const item_modal = document.createElement("dialog");
  item_modal.innerHTML = prepareModal(element_id);
  
  const close_button = document.createElement("button");
  close_button.classList.add("close");
  close_button.addEventListener("click", () => {
    const open_dialog = document.querySelector("dialog[open]") as HTMLDialogElement;
    open_dialog.close();
  })

  item_modal.addEventListener("close", () => {
    item_modal.remove();
  })

  item_modal.prepend(close_button);

  document.body.append(item_modal);
  item_modal.showModal();
}

export function mergeInputClick(e: Event) {
  const element = (e.target as HTMLButtonElement)
  element.disabled = true;

  // TODO replace them all with .dataset
  const attribute = element.getAttribute("data-attribute");
  const value = element.getAttribute("data-value");
  
  const input_element = element.parentElement.querySelector(`[name="${attribute}"]`);
  (input_element as HTMLInputElement).value += value;
}

export function editDialog(id: string) {
  const mergecontainer = document.createElement("div");
  mergecontainer.classList.add("mergecontainer");
  mergecontainer.style.display = "flex"

  const merge_center = document.createElement("div");
  merge_center.innerHTML = prepareMergeModal(id);

  mergecontainer.append(merge_center);
  dialog.replaceChildren(mergecontainer);

  const button_container = document.createElement("div");
  button_container.classList.add("buttons");

  const close_button = document.createElement("button");
  close_button.classList.add("close");
  close_button.classList.add("icontext");
  close_button.innerText = "Cancel";

  const save_button = document.createElement("button");
  save_button.classList.add("merge");
  save_button.innerText = "Save";
  save_button.autofocus = true;

  button_container.append(close_button);
  button_container.append(save_button);
  dialog.append(button_container);

  close_button.addEventListener("click", dialogClose);
  save_button.addEventListener("click", () => {
    saveEdit(id);
  });
}

export function mergeDialog(id1: string, id2: string) {
  const element1 = document.getElementById(id1);
  const element2 = document.getElementById(id2);

  if(id1.startsWith(PREFIX_MOVED)) {
    id1 = element1.getAttribute("data-origin");
  }
  if(id2.startsWith(PREFIX_MOVED)) {
    id2 = element2.getAttribute("data-origin");
  }

  let item1 = getItem(id1);
  let item2 = getItem(id2);

  const mergecontainer = document.createElement("div");
  mergecontainer.classList.add("mergecontainer");
  mergecontainer.style.display = "flex"

  const merge_child1 = document.createElement("div");
  merge_child1.innerHTML = prepareModal(id1);
  const merge_center = document.createElement("div");
  merge_center.innerHTML = prepareMergeModal();
  const merge_child2 = document.createElement("div");
  merge_child2.innerHTML = prepareModal(id2);

  mergecontainer.append(merge_child1);
  mergecontainer.append(merge_center);
  mergecontainer.append(merge_child2);
  dialog.replaceChildren(mergecontainer);

  merge_center.querySelectorAll("input, textarea").forEach((element: HTMLInputElement) => {
    const button1 = document.createElement("button");
    button1.innerHTML = ">>";
    button1.setAttribute("data-attribute", element.name);
    button1.setAttribute("data-value", item1[element.name]);
    if(item1[element.name] == undefined) {
      button1.disabled = true;
    }
    element.parentElement.insertBefore(button1, element);
    button1.addEventListener("click", mergeInputClick);


    const button2 = document.createElement("button");
    button2.innerHTML = "<<";
    button2.setAttribute("data-attribute", element.name);
    button2.setAttribute("data-value", item2[element.name]);
    if(item2[element.name] == undefined) {
      button2.disabled = true;
    }
    element.parentElement.append(button2);
    button2.addEventListener("click", mergeInputClick);
  });

  const button_container = document.createElement("div");
  button_container.classList.add("buttons");

  const close_button = document.createElement("button");
  close_button.classList.add("close");
  close_button.classList.add("icontext");
  close_button.innerText = "Cancel";

  const merge_button = document.createElement("button");
  merge_button.classList.add("merge");
  merge_button.innerText = "Merge";
  merge_button.autofocus = true;

  button_container.append(close_button);
  button_container.append(merge_button);
  dialog.append(button_container);

  close_button.addEventListener("click", dialogClose);
  merge_button.addEventListener("click", merge);
}

export function dragStart(e: DragEvent) {
  let element = (e.target as HTMLElement)

  if(!element.classList.contains(CssNames.ITEM_DRAGHANDLE)) {
    element = element.closest(".element");
  }

  if((element.nodeName != "DETAILS" && !element.classList.contains(CssNames.ITEM_DRAGHANDLE))
    || element.classList.contains(CssNames.ITEM_ADDED)
    || element.classList.contains(CssNames.ITEM_MERGED)) {
    e.preventDefault();
    return;  
  }

  dropOrigin = element.closest(".element").id;

  if (element.classList.contains(CssNames.ITEM_DRAGHANDLE)) {
    mergeListElement = document.querySelector("#mlist");
    dragAction = Action.Arrange;
    dropOrigin = element.closest(".element").id;

    dragPosition = getPositionInList(dropOrigin);

    element.closest(".element").classList.add(CssNames.ITEM_DRAGGING);
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
    //dropOrigin = (e.target as Element).closest(".element").id;
    if(dropOrigin == "") {
      return;
    }
    document.getElementById(dropOrigin).classList.remove(CssNames.ITEM_DRAGGED);
    dragAction = Action.None;
}

export function dragHover(e: DragEvent) {
  e.preventDefault();
  if(dragAction == Action.Move) {
    toggleDrop(e, dropOrigin) 
  }
}

export function dragOver(e: DragEvent) {
  e.preventDefault();

  if((e.target as HTMLElement).closest(".element")) {
    e.dataTransfer.dropEffect = "copy";
  }

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

  if(!target.classList.contains("zone")) {
    target = target.closest(".element");
  }
  if(target == undefined) {
    return
  }
  if(dropOrigin == target.id) {
    return;
  }
  if (target.getAttribute("data-role") == "finding") {
    // merging target
    // const mergeplaceholder = document.querySelector("#mergeplaceholder");

    dropTarget = target.id;
    // mergeplaceholder.innerHTML = " (ID " + target.id + " and ID " + dropOrigin + ")";
    // let newtitle_element = (dialog.querySelector("input[name='newtitle']") as HTMLInputElement);
    // newtitle_element.value = "Merged findings " + target.id + " and " + dropOrigin;
    mergeDialog(target.id, dropOrigin)
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
      arrange(dropOrigin, dropPosition);
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

export function saveEdit(id: string) {
  const item = getItem(id);
  let new_item = {};
  Object.assign(new_item, item);

  dialog.querySelectorAll("input, textarea").forEach((element: HTMLInputElement) => {
    const key = element.name;
    const value = element.value;

    new_item[key] = value;
  });

  setItem(id, new_item);

  transfer.edit(id);
  history.log(history.Tasks.Edit, id, "", "", [], "", item);

  dialog.close();
}

export function merge(event: Event) {
  event.preventDefault();

  let target = document.getElementById(dropTarget);
  let targetid = target.id;

  let dropOriginelement = document.getElementById(dropOrigin);
  // let newtitle_element = (dialog.querySelector("input[name='newtitle']") as HTMLInputElement)
  // target.innerText = newtitle_element.value;

  let new_item = {};

  dialog.querySelectorAll("input, textarea").forEach((element: HTMLInputElement) => {
    const key = element.name;
    const value = element.value;

    new_item[key] = value;
  });

  let item1 = getItem(target.id);
  let item2 = getItem(dropOrigin);

  const keys1 = Object.keys(item1);
  const keys2 = Object.keys(item2);

  keys1.forEach(key => {
    if(Array.isArray(item1[key])) {
      new_item[key] = item1[key].concat(item2[key]);
    } else if(Array.isArray(item2[key])) {
      new_item[key] = item2[key];
    } else if(new_item[key] == "") {
      new_item[key] = item1[key];
    }
  });

  keys2.filter(n => !keys1.includes(n)).forEach(key => {
    new_item[key] = item2[key];
  });

  let origin_id = dropOrigin;

  if(dropOriginelement.hasAttribute("data-origin")) {
    origin_id = dropOriginelement.getAttribute("data-origin");
    let origin_element = document.getElementById(origin_id);
    origin_element.classList.remove(CssNames.ITEM_ADDED);
    origin_element.classList.add(CssNames.ITEM_MERGED);
  } else {
    dropOriginelement.classList.add(CssNames.ITEM_MERGED);
  }

  let mergeid: string = transfer.merge(target.id, dropOrigin, new_item["title"], false, "", new_item)
  new_item["id"] = mergeid;
  history.log(history.Tasks.Merge, targetid, dropOrigin, mergeid, [], new_item["title"], new_item)
  

  dialog.close();
}

function dialogClose(e: Event) {
  e.preventDefault();
  dialog.close()
}

function initMoveAll() {
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