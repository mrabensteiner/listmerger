import * as globalvars from "./globalvars"
import * as uihelper from "./uihelper"
import * as history from "./history"

export function move(id, from_history = false) {
  if (!from_history) {
    history.resetFuture();
  }

  let element = document.getElementById(id)
  let target = document.getElementById(globalvars.mergelistId).querySelector(".zone");
  let clone = (element.cloneNode(true) as HTMLElement);
  clone.id = "merged-" + clone.id;
  clone.setAttribute("data-origin", id);
  clone.classList.remove("dragg");
  clone.append(uihelper.createDragHandle());
  target.append(clone);
  element.classList.add("added");
}

export function moveUndo(id) {
  let element = document.getElementById(id);
  element.classList.remove("added");
  let clone = document.getElementById("merged-" + id);
  clone.remove();
}

export function moveAll(zonefindings, from_history = false) {
  if (!from_history) {
    history.resetFuture();
  }

  let moved = [];
  zonefindings.forEach(element => {
    if (!element.classList.contains("added") && !element.classList.contains("merged")) {
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
    origin1_element.classList.remove("added")
    origin1_element.classList.add("merged")

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
    origin2_element.classList.remove("added")
    origin2_element.classList.add("merged")

    item2 = {
      id: id2,
      title: origin2_element.innerHTML,
      origin: origin2_element.id
    }
  }

  // TODO better way to create new id
  let newid = "mm-" + id1 + "+" + id2;
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
  target.append(uihelper.createDragHandle());
  target.removeAttribute("data-origin");
  target.id = newid;

  if (remove_id2) {
    document.getElementById(id2).remove()
  }

  return newid;
}

export function mergeUndo(id) {
  console.log("unmerge")

  let mergeitem = history.getMergeItem(id);
  let mergeelement = document.getElementById(id);


  if (mergeitem.historyA.id.startsWith("merged-")) {
    mergeelement.setAttribute("data-origin", mergeitem.historyA.origin);
    document.getElementById(mergeitem.historyA.origin).classList.remove("merged");
    document.getElementById(mergeitem.historyA.origin).classList.add("added");
  }
  if (mergeitem.historyA.id.startsWith("mm-") || mergeitem.historyA.id.startsWith("merged-")) {
    mergeelement.id = mergeitem.historyA.id;
    mergeelement.innerText = mergeitem.historyA.title;
  }

  //if(mergeitem.historyB.id.startsWith("mm-")) {   
  //}
  //else if(mergeitem.historyB.id.startsWith("merged-")) {
  if (mergeitem.historyB.id.startsWith("merged-") || mergeitem.historyB.id.startsWith("mm-")) {
    //mergeelement.setAttribute("data-origin", mergeitem.historyB.origin);


    let newelement = document.createElement("div");
    newelement.innerText = mergeitem.historyB.title;
    newelement.id = mergeitem.historyB.id;
    newelement.draggable = true;
    newelement.append(uihelper.createDragHandle());

    if (mergeitem.historyB.origin != null) {
      document.getElementById(mergeitem.historyB.origin).classList.remove("merged");
      document.getElementById(mergeitem.historyB.origin).classList.add("added");

      newelement.setAttribute("data-origin", mergeitem.historyB.origin)
    }

    document.getElementById("mlist").append(newelement)
  }
  else {
    let element = document.getElementById(mergeitem.historyB.id);
    element.classList.remove("merged");
  }
  history.deleteMergeItem(id);
}

export function arrange(id, position, insertAfter = false) {
  const element = document.getElementById(id);
  const parent = element.parentElement;
  const children = [...parent.children];
  let neighbour = children[position];

  if(insertAfter){
    neighbour = neighbour.nextSibling as Element;
  }
  
  parent.insertBefore(element, neighbour);
}
