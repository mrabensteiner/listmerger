import * as g from './globalvars';
import * as ui from "./uihelper"

export function move(id: string, position = -1) {
  setStatus(id, g.Status.Moved);

  let element = document.getElementById(id)
  let target = document.getElementById(g.SELECTOR.CONTAINER)?.querySelector(`.${g.SELECTOR.MERGED_ZONE}`);
  let clone = (element?.cloneNode(true) as HTMLElement);
  
  clone.id = g.SELECTOR.PREFIX_MOVED + clone.id;
  clone.setAttribute("data-origin", id);
  clone.classList.remove(g.SELECTOR.ITEM_DRAGGED);
  clone.children[0].append(ui.createDragHandle());

  target?.append(clone);

  if (position >= 0) {
    ui.arrange(clone.id, position);
  }

  g.addItemFromList(id, position, clone.id);  
  ui.updateAllIndicators();

  return clone.id;
}

export function moveUndo(id: string) {
  setStatus(id, "");
  let clone = document.getElementById(g.SELECTOR.PREFIX_MOVED + id);
  clone?.remove();
  g.removeItem(g.SELECTOR.PREFIX_MOVED + id);
  ui.updateAllIndicators();
}

export function moveAll(zonefindings: NodeListOf<Element>) {
  let moved: Array<string> = [];
  (zonefindings as NodeListOf<HTMLElement>).forEach(element => {
    if (![g.Status.Moved, g.Status.Merged].includes(element.dataset.status as g.Status)) {
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

export function saveEditDialog(id: string) {
  ui.updateItem(id, false);
  const element = document.getElementById(id);
  element?.children[0].append(ui.createDragHandle());
}

export function merge(id1: string, id2: string, oldmergeid = "", item: g.ListItem = {}) {
  let target = document.getElementById(id1) as HTMLDetailsElement;
  
  let item1 = g.getItem(id1);
  let item2 = g.getItem(id2);
  const remove_id2 = item2["status"] == g.Status.Moved || item2["status"] == g.Status.MergeItem;

  setStatus(id1, g.Status.Merged);;
  setStatus(id2, g.Status.Merged);

  // TODO better way to create new id
  let newid = g.SELECTOR.PREFIX_MERGED + id1 + "+" + id2;
  if (oldmergeid != "") {
    newid = oldmergeid;
  }
  const mergedfrom1 = Array.isArray(item1.mergedfrom) ? item1.mergedfrom : [item1.id];
  const mergedfrom2 = Array.isArray(item2.mergedfrom) ? item2.mergedfrom : [item2.id];

  item["id"] = newid;
  item["mergedfrom"] = mergedfrom1.concat(mergedfrom2);
  item["status"] = "mergeitem";
  g.replaceItem(id1, item);


  item["mergedfrom"].forEach((item_id: string) => {
    g.updateMergedInto(item_id, newid);
    ui.updateItem(item_id);
  });

  target.id = newid;
  ui.updateItem(newid, false);
  target.children[0].append(ui.createDragHandle());
  target.removeAttribute("data-origin");
  target.open = true;

  if (remove_id2) {
    document.getElementById(id2)?.remove()
    g.removeItem(id2);
  }

  ui.updateAllIndicators();
  return newid;
}

export function mergeUndo(id: string, itemA: g.ListItem, itemB: g.ListItem) {
  let mergeelement = document.getElementById(id) as HTMLElement;

  if (itemB["status"] == "mergeitem") {
    g.addMergeItem(itemB);
    ui.generateItem(g.SELECTOR.MERGE_LIST, itemB);
  }

  itemA.id = itemA.status == g.Status.Moved && !itemA.id.startsWith(g.SELECTOR.PREFIX_MOVED) ? g.SELECTOR.PREFIX_MOVED + itemA.id : itemA.id;
  mergeelement.id = itemA.id;
  mergeelement.dataset.status = itemA.status;
  
  g.replaceItem(id, itemA);

  setStatus(itemA.id, itemA.status);
  setStatus(itemB.id, itemB.status);
  g.updateMergedInto(itemA.id);
  g.updateMergedInto(itemB.id);
  ui.updateItem(itemA.id);
  ui.updateItem(itemB.id);
  
  if (itemA["mergedfrom"] != undefined) {
    itemA["mergedfrom"].forEach((id: string) => {
      g.updateMergedInto(id, itemA.id);
      ui.updateItem(id);
    });
  }

  if (itemB["mergedfrom"] != undefined) {
    itemB["mergedfrom"].forEach((id: string) => {
      g.updateMergedInto(id, itemB.id);
      ui.updateItem(id);
    });
  }
}

export function attach(from_id: string, to_id: string, order: Array<string>) {
  g.updateMerged(to_id, order);
  setStatus(from_id, g.Status.MergeItem);
  ui.updateItem(from_id);
  ui.updateItem(to_id);
}

export function detach(from_id: string, to_id: string) {
  const previouslist = g.mergeDetach(from_id, to_id);
  setStatus(from_id, "");
  ui.updateItem(from_id);
  ui.updateItem(to_id);
  return previouslist;
}

function setStatus(id: string, status = "") {
  id = id.startsWith(g.SELECTOR.PREFIX_MOVED) ? id.slice(g.SELECTOR.PREFIX_MOVED.length) : id;

  const element = document.getElementById(id) as HTMLElement;
  element.dataset.status = status;
  g.itemUpdateStatus(id, status);
  ui.updateAllIndicators();
}
