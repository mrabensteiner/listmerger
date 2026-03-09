import * as history from './history';
import * as transfer from './transfer';
import * as events from './events';
import * as uihelper from './uihelper';
import * as g from './globalvars';

export function init(id: string, id_undo: string, id_redo: string, callback: g.DynamicFunction) {
  g.setMergelistId(id);
  g.setCallbackFunction(callback);
  events.init();
  uihelper.init_responsive_tablist(".tablist");
  history.init();
}
