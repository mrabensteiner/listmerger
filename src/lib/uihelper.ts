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
  let draghandle = document.createElement("div");
  draghandle.classList.add("draghandle");
  draghandle.draggable = true;
  draghandle.innerHTML = "H";
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

  if (e.target.parentElement.classList.contains("element")) {
    classlist = e.target.parentElement.classList;
  }

  if (classlist.contains("drag")) {
    classlist.remove("drag");
  } else if ((classlist.contains("zone") || classlist.contains("element")) && e.target.id != dropOrigin) {
    classlist.add("drag");
  }
}

export function getSiblingsPosition(id): number {
  const element = document.getElementById(id);
  const siblings = element.parentElement.children;
  return [...siblings].indexOf(element);
}