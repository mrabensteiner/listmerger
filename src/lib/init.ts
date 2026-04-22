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
  return g.getAllItems();
}
