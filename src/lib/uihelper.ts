import mustache from 'mustache';
import { DIALOG_TEMPLATE, getItem, ITEM_TEMPLATE, EDIT_TEMPLATE, PREFIX_MERGED, PREFIX_MOVED, List, Lists, ListItem } from './globalvars';
import { editDialog } from './events';

export const SELECTOR: Record<string, string> = {
  ITEM: "element",
  ITEM_ADDED: "added",
  ITEM_MERGED: "merged",
  ITEM_DRAGHANDLE: "draghandle",
  ITEM_DRAGGING: "dragging",
  ITEM_DRAGGED: "dragg",
  TAB_BAR: "tabbar",
  TAB_LIST: "tablist",
  TAB_COMPACT: "compact",
  TAB_SELECTOR: "detailsselector",
  DIALOG_MERGE_CONTAINER: "mergecontainer",
  MERGE_LIST_CONTAINER: "mergelist",
  MERGE_LIST: "mlist",
  MERGED_ZONE: "zone",
  HOVER_DROP: "drop",
  HOVER_DRAG: "drag",
  LINK_DETACH: "detach",
  BUTTON_SAVE: "save",
  BUTTON_CLOSE: "close",
  BUTTON_MERGE: "merge",
  MOVE_BUTTON: "move",
  MOVE_ALL_BUTTON: "moveall",
  ARRANGEBAR: "arrangebar",
  HISTORY_UNDO: "undo",
  HISTORY_REDO: "redo"
} as const;

export const ICONS = {
  DRAG: "icons/dragicon.svg",
}

export function init_variables(variables: Record<string, string>) {
  for (const [key, value] of Object.entries(variables)) {
    SELECTOR[key] = value;
  }
}

export function init_responsive_tablist(id: string) {
  const details = document.querySelectorAll<HTMLDetailsElement>(`.${SELECTOR.TAB_BAR} > details`);
  const detailsselect = document.getElementById(SELECTOR.TAB_SELECTOR) as HTMLSelectElement;

  detailsselect.addEventListener("change", selectTab)

  details.forEach((detail: HTMLDetailsElement) => {
    detail.addEventListener("toggle", (event) => {
      if (detail.open) {
        detailsselect.nodeValue = detail.dataset.order as string;
      }
    })
  });

  new ResizeObserver(entries => {
    entries.forEach(element => {
      const summaries = element.target.querySelectorAll(`.${SELECTOR.TAB_BAR} > details > summary`) as NodeListOf<HTMLElement>;
      const offset1 = summaries[0].offsetTop;
      const offset2 = summaries[summaries.length - 1].offsetTop;


      if (offset1 == offset2) {
        element.target.classList.remove(SELECTOR.TAB_COMPACT);
      } else {
        element.target.classList.add(SELECTOR.TAB_COMPACT);
      }
    });
  }).observe(document.querySelector(id) as HTMLElement);

  document.querySelectorAll(`.${SELECTOR.TAB_LIST} .${SELECTOR.MERGED_ZONE}`).forEach(zone => {
    new ResizeObserver(zones => {
      zones.forEach(element => {
        const target = element.target as HTMLElement;
        const tabbar = target.closest(`.${SELECTOR.TAB_BAR}`) as HTMLDivElement;
        target.style.height = "100vh"
        target.style.height = tabbar.getBoundingClientRect().height + tabbar.offsetTop - target.offsetTop - 62  + "px"
      });
    }).observe(zone) 
  });
}

export function createDragHandle() {
  let draghandle = document.createElement("img");
  draghandle.classList.add(SELECTOR.ITEM_DRAGHANDLE);
  draghandle.draggable = true;
  draghandle.src = ICONS.DRAG;
  //return draghandle;
  return "";
}

function selectTab(e: Event) {
  let value = Number((e.target as HTMLInputElement).value);
  let details = document.querySelectorAll(`.${SELECTOR.TAB_BAR} > details`)[value];
  details.setAttribute("open", "1");
}

export function toggleDrop(e: DragEvent, dropOrigin: string) {
  document.querySelector(`.${SELECTOR.HOVER_DRAG}`)?.classList.remove(`${SELECTOR.HOVER_DRAG}`);

  if (e.target == undefined) return;

  let target = (e.target as HTMLElement).closest(`.${SELECTOR.ITEM}`);

  if(target == undefined) {
    target = (e.target as HTMLElement).closest(`.${SELECTOR.MERGED_ZONE}`)
  }
  if(target == undefined || target.querySelector(`#${dropOrigin}`)) {
    return;
  }

  let classlist = target.classList;

  if (classlist.contains(SELECTOR.HOVER_DRAG)) {
    classlist.remove(SELECTOR.HOVER_DRAG);
  }
  if ((classlist.contains(SELECTOR.MERGED_ZONE) || classlist.contains(SELECTOR.ITEM)) && target.id != dropOrigin) {
    classlist.add(SELECTOR.HOVER_DRAG);
  } 
  if (target.id == dropOrigin) {
    e.dataTransfer!.dropEffect = "none";
  } else if ((e.target as HTMLElement).closest(`.${SELECTOR.ITEM}`)) {
    e.dataTransfer!.dropEffect = "copy";
  } else {
    e.dataTransfer!.dropEffect = "move";
  }
}

export function getOwnPosition(id: string): number {
  const element = document.getElementById(id) as HTMLElement;
  const siblings = element.parentElement?.children as HTMLCollection;
  return [...siblings].indexOf(element);
}

export function getPositionInList(id: string): number {
  const element = document.getElementById(id) as HTMLElement;
  const siblings = element.closest(`.${SELECTOR.MERGED_ZONE}`)?.querySelectorAll(`.${SELECTOR.ITEM}`) as NodeListOf<HTMLElement>;
  return [...siblings].indexOf(element);
}

export function getNextDropSibling(e: DragEvent): HTMLElement {
  let siblings = [...document.querySelectorAll(`#${SELECTOR.MERGE_LIST} .${SELECTOR.ITEM}:not(.${SELECTOR.ITEM_DRAGGING}`)];
  let nextSibling = siblings.find(sibling => {
    const rect = sibling.getBoundingClientRect();
    return e.clientY <= rect.top + rect.height / 2;
  });
  return nextSibling as HTMLElement;
}

export function loadItems(items: Lists) {
  const tabbar = document.querySelector(`.${SELECTOR.TAB_BAR}`) as HTMLElement;
  const mergelist = document.getElementById(SELECTOR.MERGE_LIST) as HTMLElement;
  const select = document.getElementById(SELECTOR.TAB_SELECTOR) as HTMLElement;
  tabbar.innerHTML = "";
  mergelist.innerHTML = "";
  select.innerHTML = "";

  items["merged"].forEach(item => {
    generateItem(SELECTOR.MERGE_LIST, getItem(item.id, true));
  });

  items["originlists"].forEach(list => {
    const details_element = document.createElement("details");
    const summary_element = document.createElement("summary");
    const indicator_element = document.createElement("span");

    const section_element = document.createElement("section");
    const mergeallbutton_element = document.createElement("button");
    const list_element = document.createElement("div");

    details_element.name = "tabs";
    details_element.id = list["id"];
    details_element.setAttribute("data-order", ""+tabbar.children.length);

    summary_element.innerHTML = list["name"];
    indicator_element.classList.add("indicator");
    summary_element.append(indicator_element);

    mergeallbutton_element.classList.add("moveall");
    mergeallbutton_element.innerHTML = "Move Remaining";

    const list_id = list["id"] + "-list";
    list_element.id = list_id;
    list_element.classList.add(SELECTOR.MERGED_ZONE);

    section_element.append(mergeallbutton_element);
    section_element.append(list_element);

    const option_element = document.createElement("option");
    option_element.value = ""+(tabbar.children.length );
    option_element.innerText = list["name"] + " ()";
    select.append(option_element);

    details_element.append(summary_element);
    details_element.append(section_element);
    tabbar.append(details_element);

    list["items"].forEach(item => {
      if ((item["mergedinto"] != undefined && item["mergedinto"].length > 0) || item["images"]) {
        item = getItem(item.id, true);
      }
      generateItem(list_id, item);
    });
  });
  tabbar.children[0].setAttribute("open", "1");
}

export function generateItem(parent_id: string, item: ListItem): HTMLElement {
  const parent_element = document.getElementById(parent_id) as HTMLElement;
  const element = document.createElement("details");
  
  element.id = item["id"];
  element.innerHTML = item["title"];
  element.draggable = true;
  element.classList.add(SELECTOR.ITEM);
  element.dataset.status = item["status"];
  
  var output = mustache.render(ITEM_TEMPLATE, item);
  element.innerHTML = output;
  element.setAttribute("data-role", "finding");

  const summary = element.querySelector("summary");

  if (summary != undefined) {
    summary.draggable = true;
    element.draggable = false;
  }

  if(parent_id != "") {
    parent_element.append(element);
  }
  
  return element;
}

export function updateItem(id: string, slice = true) {
  if(slice) {
    id = id.startsWith(PREFIX_MOVED) ? id.slice(PREFIX_MOVED.length) : id;
  }

  const element = document.getElementById(id) as HTMLElement;
  const moved_element = document.getElementById(PREFIX_MOVED + id);

  const item = getItem(id, true);
  const output = mustache.render(ITEM_TEMPLATE, item);
  element.innerHTML = output;
  element.dataset.status = item["status"];

  const summary = element.querySelector("summary");

  if (summary != undefined) {
    summary.draggable = true;
    element.draggable = false;
  }

  if(moved_element != undefined) {
    moved_element.innerHTML = output;
    moved_element.querySelector("summary")?.append(createDragHandle());
  }
}

export function prepareModal(item_id: string): string {
  return mustache.render(DIALOG_TEMPLATE, getItem(item_id, true));
}

export function prepareEditModal(action: string, item_id = "") {
  const item = item_id == "" ? {} : getItem(item_id);
  item["action"] = action;
  let container = document.createElement("div");
  container.innerHTML = mustache.render(EDIT_TEMPLATE, item);
  container.querySelectorAll("select").forEach(select => {
    select.value = item[select.name];
  });
  return container;
}

export function arrange(id: string, position: number) {
  const element = document.getElementById(id) as HTMLElement;
  const parent = element.parentElement as HTMLElement;
  const children = [...parent.children];

  if(position == children.length - 1) {
    parent.append(element);
    return;
  } 

  let neighbour = children[position];
  parent.insertBefore(element, neighbour);
}

export function updateAllIndicators() {
  updateOriginIndicators();
  updateMergeIndicator();
}

function updateMergeIndicator() {
  const list_container = document.querySelector(`.${SELECTOR.MERGE_LIST_CONTAINER}`) as HTMLElement;
  const count = list_container.querySelector(`.${SELECTOR.MERGED_ZONE}`)?.children.length as number;
  const indicator_element = list_container.querySelector(".indicator") as HTMLElement;
  indicator_element.innerHTML = count.toString();
}

function updateOriginIndicators() {
  document.querySelectorAll<HTMLDetailsElement>(`.${SELECTOR.TAB_BAR} > details`).forEach((element) => {
    const count_total = element.querySelector(`.${SELECTOR.MERGED_ZONE}`)?.children.length;
    const count_added = element.querySelectorAll(`.${SELECTOR.MERGED_ZONE} [data-status='moved']`).length;
    const count_merged = element.querySelectorAll(`.${SELECTOR.MERGED_ZONE} [data-status='merged']`).length;

    const moveall_element = element.querySelector(`.${SELECTOR.MOVE_ALL_BUTTON}`) as HTMLButtonElement;
    const indicator_element = element.querySelector(".indicator") as HTMLElement;
    const option_indicator_element = document.querySelector(`#${SELECTOR.TAB_SELECTOR} option[value='${element.dataset.order}']`) as HTMLElement;

    moveall_element.disabled = count_added + count_merged == count_total; 

    const indicator_content = `${count_added + count_merged}/${count_total}`;
    indicator_element.innerHTML = indicator_content;

    let option_text = option_indicator_element.innerHTML;
    let option_text_arr = option_text.split("(");
    option_text_arr[option_text_arr.length - 1] = indicator_content;
    option_text = option_text_arr.join("(") + ")";
    option_indicator_element.innerHTML = option_text;
  });
}

export function hashUpdate(open = false) {
  const id = location.hash.substring(1);
  const element = document.getElementById(id);

  if (element) {
    if (element instanceof HTMLDetailsElement && open) {
      element.open = true;
    }

    const tab = element.closest("[name='tabs']") as HTMLDetailsElement;
    if (tab) {
      const tab_select = document.getElementById(SELECTOR.TAB_SELECTOR) as HTMLSelectElement
      tab_select.value = tab.dataset.order as string;
    }
  }
}

export function setHash(id: string) {
  window.history.replaceState(null, "", '#' + id);
  hashUpdate();
}
