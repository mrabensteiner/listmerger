import { arrange, createDragHandle, CssNames, generateItem, updateAllIndicators, updateItem } from "./uihelper"
import { addItemFromList, addMergeItem, getItem, itemUpdateStatus, mergeDetach, mergelistId, PREFIX_MERGED, PREFIX_MOVED, removeItem, replaceItem, setItem, updateMerged, updateMergedInto } from "./globalvars"

export function move(id: string, position = -1) {
  setStatus(id, "moved");

  let element = document.getElementById(id)
  let target = document.getElementById(mergelistId).querySelector(`.${CssNames.MERGED_ZONE}`);
  let clone = (element.cloneNode(true) as HTMLElement);
  
  clone.id = PREFIX_MOVED + clone.id;
  clone.setAttribute("data-origin", id);
  clone.classList.remove(CssNames.ITEM_DRAGGED);
  clone.children[0].append(createDragHandle());

  target.append(clone);

  if (position >= 0) {
    arrange(clone.id, position);
  }

  addItemFromList(id, position, clone.id);  
  updateAllIndicators();

  return clone.id;
}

export function moveUndo(id: string) {
  setStatus(id, "");
  let clone = document.getElementById(PREFIX_MOVED + id);
  clone.remove();
  removeItem(PREFIX_MOVED + id);
  updateAllIndicators();
}

export function moveAll(zonefindings: NodeListOf<Element>) {
  let moved: Array<string> = [];
  (zonefindings as NodeListOf<HTMLElement>).forEach(element => {
    if (!["moved", "merged"].includes(element.dataset.status as string)) {
      move(element.id, -1);
      moved.push(element.id);
    }
  });
  return moved;
}

export function moveAllUndo(moved: Array<any>) {
  moved.forEach(id => {
    moveUndo(id)
  })
}

export function saveEditDialog(id) {
  updateItem(id, false);
  const element = document.getElementById(id);
  element.children[0].append(createDragHandle());
}

export function merge(id1, id2, oldmergeid = "", item = {}) {
  let target = document.getElementById(id1) as HTMLDetailsElement;
  
  let item1 = getItem(id1);
  let item2 = getItem(id2);
  const remove_id2 = item2["status"] == "moved" || item2["status"] == "mergeitem";

  setStatus(id1, "merged");;
  setStatus(id2, "merged");

  // TODO better way to create new id
  let newid = PREFIX_MERGED + id1 + "+" + id2;
  if (oldmergeid != "") {
    newid = oldmergeid;
  }
  const mergedfrom1 = Array.isArray(item1.mergedfrom) ? item1.mergedfrom : [item1.id];
  const mergedfrom2 = Array.isArray(item2.mergedfrom) ? item2.mergedfrom : [item2.id];

  item["id"] = newid;
  item["mergedfrom"] = mergedfrom1.concat(mergedfrom2);
  item["status"] = "mergeitem";
  replaceItem(id1, item);


  item["mergedfrom"].forEach(item_id => {
    updateMergedInto(item_id, newid);
    updateItem(item_id);
  });

  target.id = newid;
  updateItem(newid, false);
  target.children[0].append(createDragHandle());
  target.removeAttribute("data-origin");
  target.open = true;

  if (remove_id2) {
    document.getElementById(id2).remove()
    removeItem(id2);
  }

  updateAllIndicators();
  return newid;
}

export function mergeUndo(id: string, itemA: Object, itemB: Object) {
  let mergeelement = document.getElementById(id);

  if (itemB["status"] == "mergeitem") {
    addMergeItem(itemB);
    generateItem("mlist", itemB);
  }

  itemA.id = itemA.status == "moved" && !itemA.id.startsWith(PREFIX_MOVED) ? PREFIX_MOVED + itemA.id : itemA.id;
  itemB.status == "moved" ? move(itemB.id) : false;
  mergeelement.id = itemA.id;
  mergeelement.dataset.status = itemA.status;
  
  replaceItem(id, itemA);

  setStatus(itemA.id, itemA.status);
  setStatus(itemB.id, itemB.status);
  updateMergedInto(itemA.id);
  updateMergedInto(itemB.id);
  updateItem(itemA.id);
  updateItem(itemB.id);
  
  if (itemA["mergedfrom"] != undefined) {
    itemA["mergedfrom"].forEach(id => {
      updateMergedInto(id, itemA.id);
      updateItem(id);
    });
  }

  if (itemB["mergedfrom"] != undefined) {
    itemB["mergedfrom"].forEach(id => {
      updateMergedInto(id, itemB.id);
      updateItem(id);
    });
  }
}

export function attach(from_id: string, to_id: string, order: Array<string>) {
  updateMerged(to_id, order);
  setStatus(from_id, "merged");
  updateItem(from_id);
  updateItem(to_id);
}

export function detach(from_id: string, to_id: string) {
  const previouslist = mergeDetach(from_id, to_id);
  setStatus(from_id, "");
  updateItem(from_id);
  updateItem(to_id);
  return previouslist;
}

function setStatus(id: string, status = "") {
  id = id.startsWith(PREFIX_MOVED) ? id.slice(PREFIX_MOVED.length) : id;

  const element = document.getElementById(id) as HTMLElement;
  element.dataset.status = status;
  itemUpdateStatus(id, status);
  updateAllIndicators();
}
