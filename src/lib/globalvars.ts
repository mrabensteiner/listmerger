export let mergelistId;

export const PREFIX_MOVED = "moved-";
export const PREFIX_MERGED = "merged-";

export let ITEM_TEMPLATE = "";
export let DIALOG_TEMPLATE = "";
export let MERGE_TEMPLATE = "";

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
    MERGE_TEMPLATE = merge_template;
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

        merged_ids.forEach(id => {
          id = id.startsWith(PREFIX_MOVED) ? id.slice(PREFIX_MOVED.length) : id;
          merged_full.push(getItem(id))
        });
        
        item["mergedfrom"] = merged_full;
      }
    }
  });
  items["originlists"].forEach(list => {
    list["items"].forEach(element => {
      if(element.id == id) {
        item = structuredClone(element);
        item["parent"] = list["name"];

        if(full && element["mergedto"] != undefined && element["mergedto"] != "") {
          item["mergedto"] = getItem(element["mergedto"]);
        }
      }
    });
  });
  return item;
}

export function getAllItems() {
  return items;
}

export function addMergeItem(item: Object) {
  items["merged"].push(item);
}

export function updateMergedTo(item_id: string, mergedto_id: string) {

  if(item_id == mergedto_id) {
    mergedto_id = "";
  }

  item_id = item_id.startsWith(PREFIX_MOVED) ? item_id.slice(PREFIX_MOVED.length) : item_id;
  
  items["originlists"].forEach(list => {
    list["items"].forEach(element => {
      if(element.id == item_id) {
        element["mergedto"] = mergedto_id;
      }
    });
  });
}