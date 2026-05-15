import * as history from './history';
import * as events from './events';
import * as uihelper from './uihelper';
import * as g from './globalvars';

export function init(id: string, id_undo: string, id_redo: string, items: Object, item_template: string, dialog_template: string, merge_template: string) {
  g.setItems(items); 
  g.setTemplates(item_template, dialog_template, merge_template); 
  uihelper.loadItems(items);
  g.setMergelistId(id);
  events.init();
  uihelper.init_responsive_tablist(".tablist");
  history.init();
  uihelper.updateAllIndicators();
}

export function getAllItems() {
  let items = g.getAllItems();

  let merged = items["merged"]
  items["merged"] = [];

  console.log(merged)
  console.log(items["merged"])

  const elements = document.getElementById("mlist")?.childNodes.forEach(element => {
    console.log(element, element.id)

    if (element.id.startsWith(g.PREFIX_MERGED)) {
      items["merged"].push(g.getItem(element.id))
    } else if (element.id.startsWith(g.PREFIX_MOVED)) {
      items["merged"].push(g.getItem(element.id.slice(g.PREFIX_MOVED.length)))
    }
  });

  return items;
}

export { edit } from './transfer'