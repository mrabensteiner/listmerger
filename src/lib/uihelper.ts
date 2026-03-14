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
const dragIconPath = "dragicon.svg";

export function init_responsive_tablist(id: string) {
  const details = document.querySelectorAll("details");
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
      const summaries = element.target.querySelectorAll("summary");
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
  let details = document.querySelectorAll(".tabbar details")[value];
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