import * as history from './history';
import * as transfer from './transfer';
import * as events from './events';
import * as uihelper from './uihelper';
import * as g from './globalvars';

export function init(id: string, id_undo: string, id_redo: string) {
  g.setMergelistId(id);
  events.init();
  uihelper.init_responsive_tablist(".tablist");
  history.init();
}
