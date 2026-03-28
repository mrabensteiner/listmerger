import * as Mustache from 'mustache';
import { DIALOG_TEMPLATE, getItem, ITEM_TEMPLATE, MERGE_TEMPLATE } from './globalvars';

export const CssNames = {
  ITEM: "element",
  ITEM_ADDED: "added",
  ITEM_MERGED: "merged",
  ITEM_DRAGHANDLE: "draghandle",
  ITEM_DRAGGING: "dragging",
  ITEM_DRAGGED: "dragg",
  TAB_COMPACT: "compact",
  TAB_SELECTOR: "detailsselector",
  MERGED_ZONE: "zone",
  HOVER_DROP: "drop",
  HOVER_DRAG: "drag"
}
const dragIconPath = "icons/dragicon.svg";

export function init_responsive_tablist(id: string) {
  const details = document.querySelectorAll(".tabbar > details");
  const detailsselect: Node = document.querySelector("#detailsselector");

  detailsselect.addEventListener("change", selectTab)

  details.forEach(detail => {
    detail.addEventListener("toggle", (event) => {
      if (detail.open) {
        detailsselect.nodeValue = detail.dataset.order;
      }
    })
  });

  new ResizeObserver(entries => {
    entries.forEach(element => {
      const summaries = element.target.querySelectorAll(".tabbar > details > summary");
      const offset1 = summaries[0].offsetTop;
      const offset2 = summaries[summaries.length - 1].offsetTop;


      if (offset1 == offset2) {
        element.target.classList.remove("compact");
      } else {
        element.target.classList.add("compact");
      }
    });
  }).observe(document.querySelector(id));
}

export function createDragHandle() {
  let draghandle = document.createElement("img");
  draghandle.classList.add(CssNames.ITEM_DRAGHANDLE);
  draghandle.draggable = true;
  draghandle.src = dragIconPath;
  return draghandle;
}

function selectTab(e: Event) {
  let value = (e.target as HTMLInputElement).value
  let details = document.querySelectorAll(".tabbar > details")[value];
  details.setAttribute("open", "1");
}

export function toggleDrop(e, dropOrigin) {
  let classlist = e.target.classList;
  if (classlist == undefined) return;

  if (e.target.parentElement.classList.contains(CssNames.ITEM)) {
    classlist = e.target.parentElement.classList;
  }

  if (classlist.contains(CssNames.HOVER_DRAG)) {
    classlist.remove(CssNames.HOVER_DRAG);
  } else if ((classlist.contains(CssNames.MERGED_ZONE) || classlist.contains(CssNames.ITEM)) && e.target.id != dropOrigin) {
    classlist.add(CssNames.HOVER_DRAG);
  }
}

export function getOwnPosition(id: string): number {
  const element = document.getElementById(id);
  const siblings = element.parentElement.children;
  return [...siblings].indexOf(element);
}

export function getPositionInList(id: string): number {
  const element = document.getElementById(id);
  const siblings = element.parentElement.children;
  return [...siblings].indexOf(element);
}

export function getNextDropSibling(e: DragEvent): Element {
  let siblings = [...document.querySelectorAll(`#mlist .element:not(.${CssNames.ITEM_DRAGGING}`)];
  let nextSibling = siblings.find((sibling: HTMLDivElement) => {
    return e.pageY <= sibling.offsetTop + sibling.offsetHeight / 2;
  });
  return nextSibling;
}

export function loadItems(items: Object) {
  const tabbar = document.querySelector(".tabbar");

  items["originlists"].forEach(list => {


    const details_element = document.createElement("details");
    const summary_element = document.createElement("summary");
    const indicator_element = document.createElement("span");

    const section_element = document.createElement("section");
    const mergeallbutton_element = document.createElement("button");
    const list_element = document.createElement("div");

    details_element.name = "tabs";
    details_element.setAttribute("data-order", ""+tabbar.children.length);

    summary_element.innerHTML = list["name"];
    indicator_element.classList.add("indicator");
    summary_element.append(indicator_element);

    mergeallbutton_element.classList.add("moveall");
    mergeallbutton_element.innerHTML = "Move All";

    const list_id = list["id"] + "-list";
    list_element.id = list_id;
    list_element.classList.add("zone");

    section_element.append(mergeallbutton_element);
    section_element.append(list_element);

    const select = document.getElementById("detailsselector");
    const option_element = document.createElement("option");
    option_element.value = ""+(tabbar.children.length );
    option_element.innerText = list["name"] + " ()";
    select.append(option_element);

    details_element.append(summary_element);
    details_element.append(section_element);
    tabbar.append(details_element);

    list["items"].forEach(item => {
      generateItem(list_id, item);
    });
  });
  tabbar.children[0].setAttribute("open", "1");
}

export function generateItem(parent_id: string, item: Object): HTMLElement {
  const parent_element = document.getElementById(parent_id);
  const element = document.createElement("details");
  
  element.id = item["id"];
  element.innerHTML = item["title"];
  element.draggable = true;
  element.classList.add("element");
  
  var output = Mustache.render(ITEM_TEMPLATE, item);
  element.innerHTML = output;
  element.setAttribute("data-role", "finding");

  if(parent_id != "") {
    parent_element.append(element);
  }
  
  return element;
}

export function prepareModal(item_id: string): string {
  return Mustache.render(DIALOG_TEMPLATE, getItem(item_id));
}

export function prepareMergeModal(item_id = "") {
  const item = item_id == "" ? {} : getItem(item_id);
  return Mustache.render(MERGE_TEMPLATE, item);
}

export function arrange(id, position) {
  const element = document.getElementById(id);
  const parent = element.parentElement;
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
  const list_container = document.querySelector(".mergelist");
  const count = list_container.querySelector(".zone").children.length;
  const indicator_element = list_container.querySelector(".indicator");
  indicator_element.innerHTML = count.toString();
}

function updateOriginIndicators() {
  document.querySelectorAll(".tabbar > details").forEach((element) => {
    const count_total = element.querySelector(".zone").children.length;
    const count_added = element.querySelectorAll(".zone .added").length;
    const count_merged = element.querySelectorAll(".zone .merged").length;

    const indicator_element = element.querySelector(".indicator");
    const option_indicator_element = document.querySelector(`#detailsselector option[value='${element.attributes["data-order"].value}']`);

    const indicator_content = `${count_added + count_merged}/${count_total}`;
    indicator_element.innerHTML = indicator_content;

    let option_text = option_indicator_element.innerHTML;
    let option_text_arr = option_text.split("(");
    option_text_arr[option_text_arr.length - 1] = indicator_content;
    option_text = option_text_arr.join("(") + ")";
    option_indicator_element.innerHTML = option_text;
  });
}
