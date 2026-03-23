import * as history from './history';
import * as events from './events';
import * as uihelper from './uihelper';
import * as g from './globalvars';

export function init(id: string, id_undo: string, id_redo: string, callback: g.DynamicFunction, items: Object, item_template: string, dialog_template: string) {
  g.setItems(items); 
  g.setTemplates(item_template, dialog_template); 
  uihelper.loadItems(items);
  g.setMergelistId(id);
  g.setCallbackFunction(callback);
  events.init();
  uihelper.init_responsive_tablist(".tablist");
  history.init();
  uihelper.updateAllIndicators();
}
