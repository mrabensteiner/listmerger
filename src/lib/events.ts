import * as g from "./globalvars";
import * as history from './history';
import * as transfer from './transfer';
import * as ui from "./uihelper";

export enum Action {
  None,
  Move,
  Arrange,
}

let dropOrigin = "";
let dropTarget = "";

let dragAction = Action.None;
let dragPosition = -1;
let mergeListElement: HTMLElement;
let dialog: HTMLDialogElement;

export function init() {
  mergeListElement = document.getElementById(g.SELECTOR.MERGELIST) as HTMLElement;
  initDialog();
  initDragDrop();
  initMoveAll();
  initGeneralEvents();
}

function initDialog() {
  dialog = document.createElement("dialog");
  document.getElementById(g.SELECTOR.CONTAINER)?.append(dialog);
}

function initDragDrop() {
  const listmerger_element = document.getElementById(g.SELECTOR.CONTAINER) as HTMLElement;
  const mergelist_element = listmerger_element.querySelector(`.${g.SELECTOR.LIST}`) as HTMLElement;

  listmerger_element.addEventListener("dragstart", dragStart);
  listmerger_element.addEventListener("dragend", dragEnd);
  mergelist_element.addEventListener("dragover", dragOver);
  mergelist_element.addEventListener("drop", drop);

  listmerger_element.addEventListener("drop", (e) => {
    // prevent dropping into a text field
    if((e.target as HTMLElement).contentEditable) {
      e.preventDefault();
    }
  });
}

function initGeneralEvents() {
  const listmerger_element = document.getElementById(g.SELECTOR.CONTAINER) as HTMLElement;

  listmerger_element.addEventListener("input", inputHandler);
  listmerger_element.addEventListener("mousedown", mousedownHandler);

  listmerger_element.addEventListener("click", clickHandler);
  listmerger_element.addEventListener("click", itemToHash);

  window.addEventListener('hashchange', () => ui.hashUpdate());

  document.addEventListener("keydown", keystrokeHandler);

  ui.hashUpdate();
}

function inputHandler(e: InputEvent) {
  const target = e.target as HTMLElement;

  if (target.contentEditable && !target.dataset.listening) {
    target.dataset.listening = "1";

    const element = target.closest(`.${g.SELECTOR.ITEM}`);

    target.addEventListener("blur", (e) => {
      let key = target.dataset.edit as string;
      let value: any = target.innerText;

      if (target.tagName == "SELECT") {
        const select = target as HTMLSelectElement;
        const options = select.selectedOptions;

        key = select.name;
        value = options.length == 1 ? options[0].value : Array.from(options).map(option => option.value);

        if (element && !value.length) {
          ui.updateItem(element.id);
          return;
        }
      }

      if (!element) {
        return;
      }

      const id = element.id;
      const updated = edit(id, key, value);

      if (!updated && target.tagName == "SELECT") {
        ui.updateItem(id);
      }
    }, { once: true });
  }
}

function mousedownHandler(e: MouseEvent) {
  const target = e.target as HTMLElement;
  let contentEditable = "";

  if (target.tagName == "SUMMARY") {
    target.draggable = true;
  } else if (target.isContentEditable && target.closest("summary")) {
    contentEditable = target.contentEditable;
    target.contentEditable = "false";
    const element = target.closest(`.${g.SELECTOR.ITEM}`) as HTMLDetailsElement;

    if (!element || element.open == true) {
      target.contentEditable = contentEditable;
      (target.closest("summary") as HTMLElement).draggable = false;
    } else {
      target.addEventListener("mouseup", () => {
        target.contentEditable = contentEditable;
      });
    }
  }
}

function clickHandler(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.isContentEditable && target.closest("summary")) {
    e.preventDefault();
    if(!g.preventDetailsOpening && (target.closest("details") as HTMLDetailsElement).open == false) {
      (target.closest("details") as HTMLDetailsElement).open = true;
    }
  } else if (target.classList.contains(g.SELECTOR.BUTTON_DETACH)) {
    detach(e);
  } else if (target.classList.contains(g.SELECTOR.BUTTON_MOVE) && target.closest(`#${g.SELECTOR.MERGELIST}`) && target.closest("details")?.dataset.status != g.Status.MergeItem) {
    const element = target.closest(`.${g.SELECTOR.ITEM}`) as HTMLElement;
    const origin = element.dataset.origin as string;
    const position = Array.prototype.slice.call(element.parentElement?.children).indexOf(element);
    transfer.moveUndo(origin);
    history.log(history.Tasks.UnMove, origin, position.toString());
  } else if (target.classList.contains(g.SELECTOR.BUTTON_MOVE) && !(target.closest(`#${g.SELECTOR.MERGELIST}`)) && !(target.closest("details")?.dataset.status == g.Status.Moved || target.closest("details")?.dataset.status == g.Status.Merged)) {
    const id = target.closest(`.${g.SELECTOR.ITEM}`)?.id as string;
    const newid = transfer.move(id);
    history.log(history.Tasks.Move, id);
    document.getElementById(newid)?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }
}

function keystrokeHandler(e: KeyboardEvent) {
  const ctrl = e.ctrlKey;
  const key = e.key;

  if (["INPUT", "TEXTAREA", "SPAN"].includes((e.target as HTMLElement).nodeName)) {
    return;
  }

  if (ctrl) {
    if (key === "z") {
      history.undo();
    } else if (key === "y") {
      history.redo();
    }
  } else if (key === "c") {
    document.querySelectorAll(`.${g.SELECTOR.ITEM}`).forEach(element => {
      (element as HTMLDetailsElement).open = false;
    });
  } else if (key in ["1", "2", "3", "4", "5", "6", "7", "8", "9"]) {
    const order = "" + (parseInt(key) - 1);
    const tab = document.querySelector(`.${g.SELECTOR.TAB_BAR} > details[data-order='${order}']`);

    if (tab != undefined) {
      (tab as HTMLDetailsElement).open = true;
      (document.getElementById(g.SELECTOR.TAB_SELECTOR) as HTMLSelectElement).value = order;
    }
  } else if (key == "m") {
    const target = (e.target as HTMLElement).closest(`.${g.SELECTOR.ITEM}:not([data-status='moved'], [data-status='merged'])`);

    if (target == undefined || target.id.startsWith(g.SELECTOR.PREFIX_MERGED) || target.id.startsWith(g.SELECTOR.PREFIX_MOVED)) {
      return;
    }

    transfer.move(target.id);
    history.log(history.Tasks.Move, target.id);
  }
}

function itemToHash(e: MouseEvent) {
  const element = (e.target as HTMLElement).closest("details");

  if (element) {
    ui.setHash(element.id);
  }
}


export function elementDialog(e: Event) {
  const element = (e.target as HTMLElement).closest(`.${g.SELECTOR.ITEM}`);
  
  if(element == null) {
    return;
  }

  const element_id = (element.id.startsWith(g.SELECTOR.PREFIX_MOVED) ? element.getAttribute("data-origin") : element.id) as string;

  const item_modal = document.createElement("dialog");
  item_modal.innerHTML = ui.prepareModal(element_id);
  
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
  
  const input_element = (element.parentElement?.querySelector(`[name="${attribute}"]`) as HTMLInputElement);

  if(element.dataset.singlevalue == "1") {
    input_element.value = value as string;
  } else if (element.dataset.direction == "left" && input_element.value != value) {
    input_element.value = value + " " + input_element.value;
  } else if (element.dataset.direction == "right") {
    input_element.value += " " + value;
  }
}

export function editDialog(id: string) {
  const mergedialogcontainer = document.createElement("div");
  mergedialogcontainer.classList.add(g.SELECTOR.DIALOG_MERGE_CONTAINER);
  mergedialogcontainer.style.display = "flex"

  const merge_center = ui.prepareEditModal("Edit", id);

  mergedialogcontainer.append(merge_center);
  dialog.replaceChildren(mergedialogcontainer);

  const button_container = document.createElement("div");
  button_container.classList.add("buttons");

  const close_button = document.createElement("button");
  close_button.classList.add(g.SELECTOR.BUTTON_CLOSE);
  close_button.classList.add("icontext");
  close_button.innerText = g.SELECTOR.TEXT_BUTTON_CANCEL;

  const save_button = document.createElement("button");
  save_button.classList.add(g.SELECTOR.BUTTON_SAVE);
  save_button.innerText = g.SELECTOR.BUTTON_SAVE;
  save_button.autofocus = true;

  button_container.append(close_button);
  button_container.append(save_button);
  dialog.append(button_container);

  close_button.addEventListener("click", dialogClose);
  save_button.addEventListener("click", () => {
    saveEditDialog(id);
  });
}

export function mergeDialog(id1: string, id2: string) {
  let item1 = g.getItem(id1);
  let item2 = g.getItem(id2);

  const mergedialogcontainer = document.createElement("div");
  mergedialogcontainer.classList.add(g.SELECTOR.DIALOG_MERGE_CONTAINER);
  mergedialogcontainer.style.display = "flex"

  const merge_child1 = document.createElement("div");
  merge_child1.innerHTML = ui.prepareModal(id1);
  const merge_center = ui.prepareEditModal("Merge", id1);
  const merge_child2 = document.createElement("div");
  merge_child2.innerHTML = ui.prepareModal(id2);

  mergedialogcontainer.append(merge_child1);
  mergedialogcontainer.append(merge_center);
  mergedialogcontainer.append(merge_child2);
  dialog.replaceChildren(mergedialogcontainer);

  (merge_center.querySelectorAll("input, textarea, select") as NodeListOf<HTMLInputElement>).forEach((element) => {
    const button1 = document.createElement("button");
    button1.innerHTML = ">>";
    button1.setAttribute("data-attribute", element.name);
    button1.setAttribute("data-value", item1[element.name]);
    button1.dataset.direction = "left";
    if(item1[element.name] == undefined) {
      button1.disabled = true;
    }
    element.parentElement?.insertBefore(button1, element);
    button1.addEventListener("click", mergeInputClick);


    const button2 = document.createElement("button");
    button2.innerHTML = "<<";
    button2.setAttribute("data-attribute", element.name);
    button2.setAttribute("data-value", item2[element.name]);
    button2.dataset.direction = "right";
    if(item2[element.name] == undefined) {
      button2.disabled = true;
    }
    element.parentElement?.append(button2);
    button2.addEventListener("click", mergeInputClick);

    if(element.tagName == "SELECT") {
      button1.dataset.singlevalue = "1";
      button2.dataset.singlevalue = "1";
    }
  });

  const button_container = document.createElement("div");
  button_container.classList.add("buttons");

  const close_button = document.createElement("button");
  close_button.classList.add(g.SELECTOR.BUTTON_CLOSE);
  close_button.classList.add("icontext");
  close_button.innerText = g.SELECTOR.TEXT_BUTTON_CANCEL;

  const merge_button = document.createElement("button");
  merge_button.classList.add(g.SELECTOR.BUTTON_MERGE);
  merge_button.innerText = g.SELECTOR.TEXT_BUTTON_MERGE;
  merge_button.autofocus = true;

  button_container.append(close_button);
  button_container.append(merge_button);
  dialog.append(button_container);

  close_button.addEventListener("click", dialogClose);
  merge_button.addEventListener("click", merge);
}

export function dragStart(e: DragEvent) {
  let element = (e.target as HTMLElement)
  
  if (!(element instanceof HTMLElement)) {
    e.preventDefault();
    return;
  }

  if (!element.classList.contains(g.SELECTOR.BUTTON_DRAGHANDLE)) {
    element = element.closest(`.${g.SELECTOR.ITEM}`) as HTMLElement;
  }

  if ((element.nodeName != "DETAILS" && !element.classList.contains(g.SELECTOR.BUTTON_DRAGHANDLE))
    || [g.Status.Moved, g.Status.Merged].includes(element.dataset.status as g.Status) && element.closest(`.${g.SELECTOR.TAB_BAR}`)) {
    
    if (!(e.dataTransfer?.getData("inner"))) {
      e.preventDefault();
    }
      // - what if other dragging???
    return;  
  }

  dropOrigin = element.closest(`.${g.SELECTOR.ITEM}`)?.id as string;

  console.log("do",element.classList.contains(g.SELECTOR.BUTTON_DRAGHANDLE))
  if (element.classList.contains(g.SELECTOR.BUTTON_DRAGHANDLE)) {
    dragAction = Action.Arrange;
    dropOrigin = element.closest(`.${g.SELECTOR.ITEM}`)?.id as string;

    dragPosition = ui.getPositionInList(dropOrigin);

    element.closest(`.${g.SELECTOR.ITEM}`)?.classList.add(g.SELECTOR.ITEM_DRAGHANDLE_ACTIVE);
  } else {
    dragAction = Action.Move;
    document.getElementById(dropOrigin)?.classList.add(g.SELECTOR.ITEM_DRAG_ACTIVE);
  }
}

export function dragEnd(e: Event) {
  document.querySelector(`.${g.SELECTOR.ARRANGEBAR}`)?.remove();
  document.querySelector(`.${g.SELECTOR.HOVER_DROP}`)?.classList.remove(g.SELECTOR.HOVER_DROP);

  document.querySelectorAll(`.${g.SELECTOR.HOVER_DROP}`).forEach((e) => {
    e.classList.remove(g.SELECTOR.HOVER_DROP);
  })
  document.getElementById(dropOrigin)?.classList.remove(g.SELECTOR.ITEM_DRAGHANDLE_ACTIVE);
    if(dropOrigin == "") {
      return;
    }
    document.getElementById(dropOrigin)?.classList.remove(g.SELECTOR.ITEM_DRAG_ACTIVE);
    dragAction = Action.None;
}

export function dragOver(e: DragEvent) {
  if (e.dataTransfer?.getData("inner") == "true") {
    return;
  }

  e.preventDefault();

  if(dragAction == Action.Move) {
    const zone = (e.target as HTMLElement).closest(`.${g.SELECTOR.LIST}`);
    let nextSibling = ui.getNextDropSibling(e);
    ui.toggleDrop(e, dropOrigin) 

    if (zone && zone.children.length > 0) {
      let bar = document.querySelector(`.${g.SELECTOR.ARRANGEBAR}`);

      if (bar == undefined) {
        bar = document.createElement("hr");
        bar.classList.add(g.SELECTOR.ARRANGEBAR);
      } else if (bar.nextElementSibling == nextSibling) {
        return;
      }

      if (nextSibling != undefined) {
        mergeListElement.insertBefore(bar, nextSibling)
      } else {
        mergeListElement.append(bar)
      }
    }
    return;
  }

  // https://www.codingnepalweb.com/drag-and-drop-sortable-list-html-javascript/
  const draggingItem = document.querySelector(`.${g.SELECTOR.ITEM_DRAGHANDLE_ACTIVE}`) as HTMLElement;
  let nextSibling = ui.getNextDropSibling(e);

  mergeListElement.insertBefore(draggingItem, nextSibling);
}

export function drop(e: DragEvent) {
  if(dragAction == Action.Arrange) {
    let dropPosition = ui.getPositionInList(dropOrigin);

    if (dragPosition != dropPosition) {
      history.log(history.Tasks.Arrange, dropOrigin, dragPosition.toString(), dropPosition.toString());
    }
    dragAction = Action.None;
    return;
  }
  dragAction = Action.None;

  ui.toggleDrop(e, dropOrigin);

  let droporigin_element = document.getElementById(dropOrigin);
  let target = (e.target as HTMLElement);

  if(!target.classList.contains(g.SELECTOR.LIST)) {
    target = target.closest(`.${g.SELECTOR.ITEM}`) as HTMLElement;
  }
  if(target == undefined) {
    return
  }
  if(dropOrigin == target.id) {
    return;
  }
  if (target.getAttribute("data-role") == g.SELECTOR.ITEM) {
    dropTarget = target.id;
    (target as HTMLDetailsElement).open = false;
    mergeDialog(target.id, dropOrigin)
    dialog.showModal();

    return;
  }
  else if (target.getAttribute("data-role") != "zone" && target.id != g.SELECTOR.MERGELIST) {
    // other target
    return;
  }
  else if (droporigin_element?.parentElement?.id == target.id) {
    // is already there, move it to the new position

    let dragPosition = ui.getPositionInList(dropOrigin);
    let nextSibling = ui.getNextDropSibling(e);

    let dropPosition = nextSibling != undefined
      ? ui.getPositionInList(nextSibling.id)
      : mergeListElement.children.length - 1;

    if (dragPosition != dropPosition) {
      ui.arrange(dropOrigin, dropPosition);
      history.log(history.Tasks.Arrange, dropOrigin, dragPosition.toString(), dropPosition.toString());
    }

    dragAction = Action.None;
    return;
  }
  else if ([g.Status.Moved, g.Status.Merged].includes(droporigin_element?.dataset.status as g.Status) && droporigin_element?.closest(`.${g.SELECTOR.TAB_BAR}`)) {
    return;
  }

  (droporigin_element as HTMLDetailsElement).open = false;

  const nextSibling = ui.getNextDropSibling(e);
  let dropPosition = nextSibling != undefined
      ? ui.getPositionInList(nextSibling.id)
      : mergeListElement.children.length - 1;
  
  transfer.move(dropOrigin, dropPosition);
  history.log(history.Tasks.Move, dropOrigin, dropPosition.toString());
}

export function saveEditDialog(id: string) {
  const item = g.getItem(id);
  let new_item: g.ListItem = {};
  Object.assign(new_item, item);

  (dialog.querySelectorAll("input, textarea, select") as NodeListOf<HTMLInputElement>).forEach(element => {
    const key = element.name;
    const value = element.value;

    new_item[key] = value;
  });

  g.setItem(id, new_item);

  transfer.saveEditDialog(id);
  history.log(history.Tasks.Edit, id, "", "", [], item);

  dialog.close();
}

export function merge(event: Event) {
  event.preventDefault();

  let target = document.getElementById(dropTarget) as HTMLElement;
  let targetid = target?.id;

  let dropOriginelement = document.getElementById(dropOrigin);
  // let newtitle_element = (dialog.querySelector("input[name='newtitle']") as HTMLInputElement)
  // target.innerText = newtitle_element.value;

  let new_item: g.ListItem = {};

  (dialog.querySelectorAll("input, textarea, select") as NodeListOf<HTMLInputElement>).forEach(element => {
    let key = (element as HTMLInputElement).name;
    let value: string|string[] = (element as HTMLInputElement).value;
    
    if (element instanceof HTMLSelectElement) {
      const select = element as HTMLSelectElement;
      const options = select.selectedOptions;

      key = select.name;
      value = options.length == 1 ? options[0].value : Array.from(options).map(option => option.value);
    }

    new_item[key] = value;
  });

  let item1 = g.getItem(target.id);
  let item2 = g.getItem(dropOrigin);

  const keys1 = Object.keys(item1);
  const keys2 = Object.keys(item2);

  keys1.forEach(key => {
    if (!Array.isArray(new_item[key])) {
      if (Array.isArray(item1[key])) {
        new_item[key] = [].concat(item1[key] as any);

        if(Array.isArray(item2[key])) {
          item2[key].forEach(value => {
            if(!new_item[key].includes(value)) {
              new_item[key].push(value);
            }
          });
        }
      } else if(Array.isArray(item2[key])) {
        new_item[key] = [].concat(item2[key] as any);
      } else if(new_item[key] == "") {
        new_item[key] = item1[key];
      }
    }
  });

  keys2.filter(n => !keys1.includes(n)).forEach(key => {
    new_item[key] = item2[key];
  });

  (dropOriginelement as HTMLDetailsElement).open = false;

  let mergeid: string = transfer.merge(target.id, dropOrigin, "", new_item)
  new_item["id"] = mergeid;
  history.log(history.Tasks.Merge, targetid, dropOrigin, mergeid, [], {
    A: item1,
    B: item2,
    merged: new_item
  });
  

  dialog.close();
}

function dialogClose(e: Event) {
  e.preventDefault();
  dialog.close()
}

function initMoveAll() {
  const moveallbuttons = document.querySelectorAll(`.${g.SELECTOR.BUTTON_MOVEALL}`);

  moveallbuttons.forEach(button => {
    button.addEventListener("click", moveAll);
  });
}

function moveAll(e: Event) {
  let parent = (e.target as Element).parentNode as Element;
  let zone_elements = parent.querySelectorAll(`[data-role='${g.SELECTOR.ITEM}']`);

  if(zone_elements.length == 0) return;

  let moved = transfer.moveAll(zone_elements);
  if(moved.length) {
    history.log(history.Tasks.MoveAll, (e.target as Element).nextElementSibling?.id);
  }
}

function detach(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const from = target.dataset.from as string;
  const to = target.dataset.to as string;

  let previouslist = transfer.detach(from, to);
  history.log(history.Tasks.Detach, from, to, "", previouslist);
}

export function edit(id: string, key: string, value: any) {
  const item = g.getItem(id);

  if (JSON.stringify(item[key]) == JSON.stringify(value)) {
    return false;
  }

  let new_item: g.ListItem = {};
  Object.assign(new_item, item);
  new_item[key] = value;

  g.setItem(id, new_item);
  history.log(history.Tasks.Edit, id, "", "", [], item);
  ui.updateItem(id);

  return true;
}
