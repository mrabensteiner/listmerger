export type DynamicFunction = (a: any) => void;

export let mergelistId;
export let callback_function = (a: any) => {};

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

export function setTemplates(item_template: string, dialog_template: string, merge_template: string) {
    ITEM_TEMPLATE = item_template;
    DIALOG_TEMPLATE = dialog_template;
    MERGE_TEMPLATE = merge_template;
}

export function setCallbackFunction(callback: DynamicFunction) {
    callback_function = callback;
}

export function getItem(id: string): Object {
  let item = {};
  items["merged"].forEach(element => {
    if(element.id == id) {
      item = element;
    }
  });
  items["originlists"].forEach(list => {
    list["items"].forEach(element => {
      if(element.id == id) {
        item = element;
      }
    });
  });
  return item;
}