import * as g from './globalvars';
import * as events from './events';
import * as history from './history';
import * as ui from './uihelper';

export function init(items: g.Lists, templates: g.Dictionary = {}, selectors: g.Dictionary = {}, history_callback = () => {}) {
  g.setSelectors(selectors); 
  g.setItems(items); 
  g.setTemplates(templates); 

  ui.loadItems(items);
  ui.initResponsiveTabs();
  ui.updateAllIndicators();
  events.init();

  history.setHistoryCallback(history_callback);
  history.init();
}

export function getAllItems() {
  const items = g.getAllItems();
  items["version"] = "ListMerger JSON Version 0.1";
  return items;
}
