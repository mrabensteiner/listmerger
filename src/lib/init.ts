// WIP

type MergeItem = {
  id: string,
  title: string,
  historyA?: MergeItem,
  historyB?: MergeItem
};

let mergelist = {};
let mergelist_id = "";

let history = [];
let future = [];

let dropOrigin = "";
let dropTarget = "";
let dragAction = "";
let mergeListElement = document.querySelector("#mlist");

function update_history_buttons() {
  let undo_button = document.getElementById("undo") as HTMLButtonElement;
  let redo_button = document.getElementById("redo") as HTMLButtonElement;

  undo_button.disabled = history.length == 0;
  redo_button.disabled = future.length == 0;
}

function log_history(task, id1 = "", id2 = "", id3 = "", array=[], title = "") {
  history.push({
    action: task,
    id1: id1,
    id2: id2,
    id3: id3,
    array: array,
    title: title
  })
  console.log("history")
  console.log(history)
  console.log(future)
  update_history_buttons();
}

function undo() {
  let last = history.pop();
  if (last == undefined) return;

  if (last.action == "move") {
    un_move(last.id1)
  } else if (last.action == "move_all") {
    un_move_all(last.array)
  } else if (last.action == "merge") {
    un_merge(last.id3)
  }
  future.push(last);

  console.log("<< undo");
  console.log(history);
  console.log(future);
  update_history_buttons();
}


function redo() {
  let last = future.pop();
  if (last == undefined) return;
  history.push(last);

  if (last.action == "move") {
    move(last.id1, true)
  } else if (last.action == "move_all") {
    let zonefindings = document.getElementById(last.id1).querySelectorAll("[data-role='finding']");
    move_all(zonefindings, true);
  } else if (last.action == "merge") {
    merge(last.id1, last.id2, last.title, true, last.id3)
  }

  console.log(">> redo");
  console.log(history);
  console.log(future);
  update_history_buttons();
}

const draghandle = document.createElement("div");
draghandle.classList.add("draghandle");
draghandle.draggable = true;
draghandle.innerHTML = "H"


function move(id, from_history=false) {
  if(!from_history) {
    future = [];
  }

  let element = document.getElementById(id)
  let target = document.getElementById(mergelist_id).querySelector(".zone");
  let clone = (element.cloneNode(true) as HTMLElement);
  clone.id = "merged-" + clone.id;
  clone.setAttribute("data-origin", id);
  clone.classList.remove("dragg");
  clone.append(draghandle.cloneNode(true));
  target.append(clone);
  element.classList.add("added");
}

function un_move(id) {
  let element = document.getElementById(id);
  element.classList.remove("added");
  let clone = document.getElementById("merged-" + id);
  clone.remove();
}

function move_all(zonefindings, from_history=false) {
  if(!from_history) {
    future = [];
  }

  let moved = [];
  zonefindings.forEach(element => {
    if(!element.classList.contains("added") && !element.classList.contains("merged")) {
      move(element.id, from_history);
      moved.push(element.id);
    }
  });
  return moved;
}

function un_move_all(moved) {
  moved.forEach(id => {
    un_move(id)
  })
}

function merge(id1, id2, title, from_history=false, oldmergeid="") {
  if(!from_history) {
    future = [];
  }
  
  let target = document.getElementById(id1);
  let remove_id2 = true;

  let item1 = mergelist[id1];
  let item2 = mergelist[id2];

  if(item1 == undefined) {
    let origin1 = document.getElementById(id1).getAttribute("data-origin");
    let origin1_element = document.getElementById(origin1);
    origin1_element.classList.remove("added")
    origin1_element.classList.add("merged")

    item1 = {
      id: id1,
      title: origin1_element.innerHTML,
      origin: origin1_element.id
    }
  }

  if(item2 == undefined) {
    let origin2 = document.getElementById(id2).getAttribute("data-origin");

    // directly dragged from the list, not the mergelist
    if(origin2 == undefined) {
      origin2 = id2;
      remove_id2 = false;
    }

    let origin2_element = document.getElementById(origin2);
    origin2_element.classList.remove("added")
    origin2_element.classList.add("merged")
    
    item2 = {
      id: id2,
      title: origin2_element.innerHTML,
      origin: origin2_element.id
    }
  }

  // TODO better way to create new id
  let newid = "mm-" + id1 + "+" + id2;
  if(oldmergeid != "") {
    newid = oldmergeid;
  }

  mergelist[newid] = {
    id: newid,
    title: title,
    historyA: item1,
    historyB: item2
  }

  target.innerText = title;
  target.removeAttribute("data-origin");
  target.id = newid;

  if(remove_id2) {
    document.getElementById(id2).remove()
  }

  return newid;
}

function un_merge(id) {
  console.log("unmerge")
  console.log(mergelist)

  let mergeitem = mergelist[id];
  let mergeelement = document.getElementById(id);


  if( mergeitem.historyA.id.startsWith("merged-")) {
    mergeelement.setAttribute("data-origin", mergeitem.historyA.origin);
    document.getElementById(mergeitem.historyA.origin).classList.remove("merged");
    document.getElementById(mergeitem.historyA.origin).classList.add("added");
  }
  if(mergeitem.historyA.id.startsWith("mm-") || mergeitem.historyA.id.startsWith("merged-")) {
    mergeelement.id = mergeitem.historyA.id;
    mergeelement.innerText = mergeitem.historyA.title;
  }

  //if(mergeitem.historyB.id.startsWith("mm-")) {   
  //}
  //else if(mergeitem.historyB.id.startsWith("merged-")) {
  if(mergeitem.historyB.id.startsWith("merged-") || mergeitem.historyB.id.startsWith("mm-")) {
    //mergeelement.setAttribute("data-origin", mergeitem.historyB.origin);


    let newelement = document.createElement("div");
    newelement.innerText = mergeitem.historyB.title;
    newelement.id = mergeitem.historyB.id;
    newelement.draggable = true;

    if(mergeitem.historyB.origin != null) {
      document.getElementById(mergeitem.historyB.origin).classList.remove("merged");
      document.getElementById(mergeitem.historyB.origin).classList.add("added");

      newelement.setAttribute("data-origin", mergeitem.historyB.origin)
    }

    document.getElementById("mlist").append(newelement)
  }
  else {
    let element = document.getElementById(mergeitem.historyB.id);
    element.classList.remove("merged");
  }
  delete mergelist[id];
}


function selecttab(node: any) {
  let details = document.querySelectorAll(".tabbar details")[node.value];
  details.setAttribute("open", "1");
}

function toggleDrop(e) {
  let classlist = e.target.classList;
  if(classlist == undefined) return;

  if (classlist.contains("drag")) {
    classlist.remove("drag");
  } else if((classlist.contains("zone") || classlist.contains("element")) && e.target.id != dropOrigin) {
    classlist.add("drag");
  }
}

export function init(id: string, id_undo: string, id_redo: string) {

  update_history_buttons();
  const listmerger_element = document.getElementById(id);
  const mergelist_element = listmerger_element.querySelector(".mergelist");

  mergelist_id = id;

  document.getElementById(id_undo).addEventListener("click", (event) => {
    event.preventDefault();
    undo();
  })

  document.getElementById(id_redo).addEventListener("click", (event) => {
    event.preventDefault();
    redo();
  })

  const details = document.querySelectorAll("details");
  const detailsselect: Node = document.querySelector("#detailsselector");

  detailsselect.addEventListener("change", (event) => {
    event.preventDefault();
    selecttab(event.target);
  })
  
  details.forEach(detail => {
    detail.addEventListener("toggle", (event) => {
      if (detail.open) {
        detailsselect.nodeValue = detail.dataset.order;
      }
    })
  });

  const ro = new ResizeObserver(entries => {
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
  });
  ro.observe(document.querySelector(".tablist"));


  const dialog = document.querySelector("dialog");
  const closebutton = document.querySelector("dialog button#closebutton");
  const mergebutton = document.querySelector("#mergebutton");
  const mergeplaceholder = document.querySelector("#mergeplaceholder");
  const moveallbuttons = document.querySelectorAll(".moveall");

  moveallbuttons.forEach(button => {
    button.addEventListener("click", (e) => {

      let parent = (e.target as Element).parentNode as Element;
      let zonefindings = parent.querySelectorAll("[data-role='finding']");

      if(zonefindings.length == 0) return;

      let moved = move_all(zonefindings);
      log_history("move_all", (e.target as Element).nextElementSibling.id, "", "", moved);
    });
  });

  listmerger_element.addEventListener("dragstart", (e) => {
    let element = (e.target as Element)
    dropOrigin = element.id;

    if(element.classList.contains("draghandle")) {
      mergeListElement = document.querySelector("#mlist");
      dragAction = "handle";
      dropOrigin = element.parentElement.id;
      console.log("hendl", element.parentElement.id)
      setTimeout(() => element.parentElement.classList.add("dragging"), 0);
    } else {
      dragAction = "move";
      document.getElementById(dropOrigin).classList.add("dragg");
    }
  });

  listmerger_element.addEventListener("dragend", (e) => {
    document.getElementById(dropOrigin).classList.remove("dragging");
    dropOrigin = (e.target as Element).id;
    document.getElementById(dropOrigin).classList.remove("dragg");
  });
  mergelist_element.addEventListener("dragenter", (e) => {
    if(dragAction == "move") {
      toggleDrop(e) 
    }
  });
  mergelist_element.addEventListener("dragleave", (e) => {
    if(dragAction == "move") {
      toggleDrop(e) 
    }
  });
  mergelist_element.addEventListener("dragover", (ev) => {
    let e = ev as DragEvent;
    e.preventDefault();

    if(dragAction == "move") {
      return;
    }

    // https://www.codingnepalweb.com/drag-and-drop-sortable-list-html-javascript/
    const draggingItem = document.querySelector(".dragging");
    let siblings = [...mergeListElement.querySelectorAll(".element:not(.dragging)")];
    let nextSibling = siblings.find(sibling => {
      sibling = sibling as HTMLDivElement;
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
    mergeListElement.insertBefore(draggingItem, nextSibling);
  });

  mergelist_element.addEventListener("drop", (e) => {
    if(dragAction == "handle") {
      return;
    }

    toggleDrop(e);

    let droporigin_element = document.getElementById(dropOrigin);
    let target = (e.target as HTMLElement);

    if(dropOrigin == target.id) {
      return;
    }

    if (target.getAttribute("data-role") == "finding") {
      // merging target
      dropTarget = target.id;
      mergeplaceholder.innerHTML = " (ID " + target.id + " and ID " + dropOrigin + ")";
      let newtitle_element = (dialog.querySelector("input[name='newtitle']") as HTMLInputElement);
      newtitle_element.value = "Merged findings " + target.id + " and " + dropOrigin;
      dialog.showModal();

      return;
    }
    else if (target.getAttribute("data-role") != "zone" && target.id != "mlist") {
      // other target
      return;
    }
    else if (droporigin_element.parentElement.id == target.id) {
      // is already there
      return;
    }
    else if (droporigin_element.classList.contains("added") || droporigin_element.classList.contains("merged")) {
      return;
    }
  
    move(dropOrigin);
    log_history("move", dropOrigin);
  });

  closebutton.addEventListener("click", () => {
    dialog.close();
  });

  // Merge two findings
  mergebutton.addEventListener("click", (event) => {
    event.preventDefault();

    let target = document.getElementById(dropTarget);
    let targetid = target.id;

    let dropOriginelement = document.getElementById(dropOrigin);
    let newtitle_element = (dialog.querySelector("input[name='newtitle']") as HTMLInputElement)
    // target.innerText = newtitle_element.value;

    let origin_id = dropOrigin;

    if(dropOriginelement.hasAttribute("data-origin")) {
      origin_id = dropOriginelement.getAttribute("data-origin");
      let origin_element = document.getElementById(origin_id);
      origin_element.classList.remove("added");
      origin_element.classList.add("merged");
    } else {
      dropOriginelement.classList.add("merged");
    }

    let mergeid: string = merge(target.id, dropOrigin, newtitle_element.value)
    log_history("merge", targetid, dropOrigin, mergeid, [], newtitle_element.value)
    
    dialog.close();
  });
}