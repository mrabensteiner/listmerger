export let mergelistId;

export const PREFIX_MOVED = "moved-";
export const PREFIX_MERGED = "merged-";

export let ITEM_TEMPLATE = "";
export let DIALOG_TEMPLATE = "";
export let EDIT_TEMPLATE = "";

export let items = {};

export function setMergelistId(id: string) {
    mergelistId = id;
}

export function setItems(set_items: Object) {
    items = set_items;
}

export function setItem(id: string, item: Object) {
  id = id.startsWith(PREFIX_MOVED) ? id.slice(PREFIX_MOVED.length) : id;

  items["merged"].forEach(element => {
    if(element.id == id) {
      Object.assign(element, item)
    }
  });
  items["originlists"].forEach(list => {
    list["items"].forEach(element => {
      if(element.id == id) {
        Object.assign(element, item)
      }
    });
  });
}

export function setTemplates(item_template: string, dialog_template: string, merge_template: string) {
    ITEM_TEMPLATE = item_template;
    DIALOG_TEMPLATE = dialog_template;
    EDIT_TEMPLATE = merge_template;
}

export function getItem(id: string, full = false): Object {
  id = id.startsWith(PREFIX_MOVED) ? id.slice(PREFIX_MOVED.length) : id;

  let item = {};
  items["merged"].forEach(element => {
    if(element.id == id) {
      item = structuredClone(element);

      if(full) {
        const merged_ids = element["mergedfrom"];
        const merged_full = [];

        if (merged_ids) {
          merged_ids.forEach(id => {
            id = id.startsWith(PREFIX_MOVED) ? id.slice(PREFIX_MOVED.length) : id;
            const item = getItem(id);
            item["parent_id"] = element.id;
            merged_full.push(item)
          });

          item["mergedfrom"] = merged_full;
        }
      }
    }
  });
  items["originlists"].forEach(list => {
    list["items"].forEach(element => {
      if(element.id == id) {
        item = structuredClone(element);
        item["parent"] = list["name"];

        if(full && element["mergedinto"] != undefined && element["mergedinto"] != "") {
          item["parent_id"] = element.id;
          item["mergedinto"] = getItem(element["mergedinto"]);
        }
      }
    });
  });
  return item;
}

export function addItemFromList(id: string, position = -1, new_id = id) {
  items["originlists"].forEach(list => {
    list["items"].forEach(element => {
      if(element.id == id) {
        let item = structuredClone(element);
        item.id = new_id;

        addMergeItem(item, position);
      }
    });
  });
}

export function removeItem(id: string) {
  items["merged"].forEach(element => {
    if(element.id == id) {
      const i = items["merged"].indexOf(element);
      items["merged"].splice(i, 1);
    }
  });
}

export function replaceItem(id: string, new_item: Object) {
  items["merged"].forEach(element => {
    if(element.id == id) {
      const i = items["merged"].indexOf(element);
      items["merged"][i] = new_item;
    }
  });
}

export function itemUpdateStatus(id: string, status: string = "") {
   items["originlists"].forEach(list => {
    list["items"].forEach(element => {
      if(element.id == id) {
        element.status = status;
      }
    });
  });
}

export function getAllItems() {
  return items;
}

export function addMergeItem(item: Object, position = -1) {
  if (position < 0) {
    position = items["merged"].length;
  }
  items["merged"].splice(position, 0, item);
}

export function updateMerged(item_id: string, mergedfrom: string[]) {
 items["merged"].forEach(element => {
    if(element.id == item_id) {
      element["mergedfrom"] = mergedfrom
    }
 })
}

export function updateMergedInto(item_id: string, mergedinto_id: string = item_id) {

  if(item_id == mergedinto_id) {
    mergedinto_id = "";
  }

  item_id = item_id.startsWith(PREFIX_MOVED) ? item_id.slice(PREFIX_MOVED.length) : item_id;
  
  items["originlists"].forEach(list => {
    list["items"].forEach(element => {
      if(element.id == item_id) {
        element["mergedinto"] = mergedinto_id;
      }
    });
  });
}

export function mergeAttach(from_id: string, to_id: string) {
  items["merged"].forEach(element => {
    if(element.id == to_id) {
      const tmp = element["mergedfrom"] != undefined ? element["mergedfrom"] : [from_id];
      element["mergedfrom"] = [];

      tmp.forEach(mergedfrom => {
        if (mergedfrom != from_id) {
          element["mergedfrom"].push(mergedfrom);
        }
      });
    }
  });
}

export function mergeDetach(from_id: string, to_id: string) {
  from_id = from_id.startsWith(PREFIX_MOVED) ? from_id.slice(PREFIX_MOVED.length) : from_id;
  let previouslist: string[] = [];
  
  items["originlists"].forEach(list => {
    list["items"].forEach(element => {
      if(element.id == from_id) {
        element["mergedinto"] = "";
      }
    });
  });
  
  items["merged"].forEach(element => {
    if(element.id == to_id) {
      previouslist = element["mergedfrom"];
      element["mergedfrom"] = [];

      previouslist.forEach(mergedfrom => {
        if (mergedfrom != from_id) {
          element["mergedfrom"].push(mergedfrom);
        }
      });
    }
  });

  return previouslist;
}
