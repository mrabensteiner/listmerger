import { createDragHandle, CssNames } from "./uihelper"
import * as history from "./history"
import { mergelistId, PREFIX_MERGED, PREFIX_MOVED } from "./globalvars"

export function move(id, from_history = false) {
  if (!from_history) {
    history.resetFuture();
  }

  let element = document.getElementById(id)
  let target = document.getElementById(mergelistId).querySelector(`.${CssNames.MERGED_ZONE}`);
  let clone = (element.cloneNode(true) as HTMLElement);
  
  clone.id = PREFIX_MOVED + clone.id;
  clone.setAttribute("data-origin", id);
  clone.classList.remove(CssNames.ITEM_DRAGGED);
  clone.append(createDragHandle());

  target.append(clone);
  element.classList.add(CssNames.ITEM_ADDED);
}

export function moveUndo(id) {
  let element = document.getElementById(id);
  element.classList.remove(CssNames.ITEM_ADDED);
  let clone = document.getElementById(PREFIX_MOVED + id);
  clone.remove();
}

export function moveAll(zonefindings, from_history = false) {
  if (!from_history) {
    history.resetFuture();
  }

  let moved = [];
  zonefindings.forEach(element => {
    if (!element.classList.contains(CssNames.ITEM_ADDED) && !element.classList.contains(CssNames.ITEM_MERGED)) {
      move(element.id, from_history);
      moved.push(element.id);
    }
  });
  return moved;
}

export function moveAllUndo(moved) {
  moved.forEach(id => {
    moveUndo(id)
  })
}

export function merge(id1, id2, title, from_history = false, oldmergeid = "") {
  if (!from_history) {
    history.resetFuture();
  }

  let target = document.getElementById(id1);
  let remove_id2 = true;

  let item1 = history.getMergeItem(id1);
  let item2 = history.getMergeItem(id2);

  if (item1 == undefined) {
    let origin1 = document.getElementById(id1).getAttribute("data-origin");
    let origin1_element = document.getElementById(origin1);
    origin1_element.classList.remove(CssNames.ITEM_ADDED)
    origin1_element.classList.add(CssNames.ITEM_MERGED)

    item1 = {
      id: id1,
      title: origin1_element.innerHTML,
      origin: origin1_element.id
    }
  }

  if (item2 == undefined) {
    let origin2 = document.getElementById(id2).getAttribute("data-origin");

    // directly dragged from the list, not the mergelist
    if (origin2 == undefined) {
      origin2 = id2;
      remove_id2 = false;
    }

    let origin2_element = document.getElementById(origin2);
    origin2_element.classList.remove(CssNames.ITEM_ADDED)
    origin2_element.classList.add(CssNames.ITEM_MERGED)

    item2 = {
      id: id2,
      title: origin2_element.innerHTML,
      origin: origin2_element.id
    }
  }

  // TODO better way to create new id
  let newid = PREFIX_MERGED + id1 + "+" + id2;
  if (oldmergeid != "") {
    newid = oldmergeid;
  }

  history.addMergeItem(newid, {
    id: newid,
    title: title,
    historyA: item1,
    historyB: item2
  });

  target.innerText = title;
  target.append(createDragHandle());
  target.removeAttribute("data-origin");
  target.id = newid;

  if (remove_id2) {
    document.getElementById(id2).remove()
  }

  return newid;
}

export function mergeUndo(id) {
  let mergeitem = history.getMergeItem(id);
  let mergeelement = document.getElementById(id);


  // Item A is a moved item
  if (mergeitem.historyA.id.startsWith(PREFIX_MOVED)) {
    mergeelement.setAttribute("data-origin", mergeitem.historyA.origin);
    document.getElementById(mergeitem.historyA.origin).classList.remove(CssNames.ITEM_MERGED);
    document.getElementById(mergeitem.historyA.origin).classList.add(CssNames.ITEM_ADDED);
  }

  // Bring Item A to its previous state
  if (mergeitem.historyA.id.startsWith(PREFIX_MERGED) || mergeitem.historyA.id.startsWith(PREFIX_MOVED)) {
    mergeelement.id = mergeitem.historyA.id;
    mergeelement.innerText = mergeitem.historyA.title;
    mergeelement.append(createDragHandle());
  }

  // Item B was taken from the merged list
  if (mergeitem.historyB.id.startsWith(PREFIX_MERGED) || mergeitem.historyB.id.startsWith(PREFIX_MOVED)) {
    let newelement = document.createElement("div");
    newelement.innerText = mergeitem.historyB.title;
    newelement.id = mergeitem.historyB.id;
    newelement.draggable = true;
    newelement.append(createDragHandle());

    if (mergeitem.historyB.origin != null) {
      document.getElementById(mergeitem.historyB.origin).classList.remove(CssNames.ITEM_MERGED);
      document.getElementById(mergeitem.historyB.origin).classList.add(CssNames.ITEM_ADDED);

      newelement.setAttribute("data-origin", mergeitem.historyB.origin)
    }

    document.getElementById("mlist").append(newelement)
  }
  // Item B was taken directly from an evaluators list
  else {
    let element = document.getElementById(mergeitem.historyB.id);
    element.classList.remove(CssNames.ITEM_MERGED);
  }
  history.deleteMergeItem(id);
}

export function arrange(id, position, insertAfter = false) {
  const element = document.getElementById(id);
  const parent = element.parentElement;
  const children = [...parent.children];

  if(position == children.length - 1) {
    parent.append(element);
    return;
  } 

  let neighbour = children[position];
  parent.insertBefore(element, neighbour);
}
