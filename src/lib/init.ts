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

function update_history_buttons() {
  let undo_button = document.getElementById("undo") as HTMLButtonElement;
  let redo_button = document.getElementById("redo") as HTMLButtonElement;

  undo_button.disabled = history.length == 0;
  redo_button.disabled = future.length == 0;
}

function log_history(task, id1 = "", id2 = "", id3 = "", array=[]) {
  history.push({
    action: task,
    id1: id1,
    id2: id2,
    id3: id3,
    array: array
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
  }

  console.log(">> redo");
  console.log(history);
  console.log(future);
  update_history_buttons();
}


function move(id, from_history=false) {
  if(!from_history) {
    future = [];
  }

  let element = document.getElementById(id)
  let target = document.getElementById(mergelist_id).querySelector(".zone");
  let clone = (element.cloneNode(true) as HTMLElement);
  clone.id = "merged-" + clone.id;
  clone.setAttribute("data-origin", id);
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
      move(element.id);
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

function merge(id1, id2, title, from_history=false) {
  if(!from_history) {
    future = [];
  }
  
  let target = document.getElementById(id1);
  let origin1 = id1;
  let origin2 = id2;
  let remove_id2 = true;

  let origin1_element, origin2_element;

  if(mergelist[id1] == undefined ) {
    origin1 = document.getElementById(id1).getAttribute("data-origin");
    origin1_element = document.getElementById(origin1);
    origin1_element.classList.remove("added")
    origin1_element.classList.add("merged")
  }

  if(mergelist[id2] == undefined ) {
    origin2 = document.getElementById(id2).getAttribute("data-origin");

    // directly dragged from the list, not the mergelist
    if(origin2 == undefined) {
      origin2 = id2;
      remove_id2 = false;
    }

    origin2_element = document.getElementById(origin2);
    origin2_element.classList.remove("added")
    origin2_element.classList.add("merged")
  }

  let item1: MergeItem = mergelist[id1] != undefined ? mergelist[id1] : {
    id: id1,
    title: origin1_element.innerText
  }

  let item2: MergeItem = mergelist[id2] != undefined ? mergelist[id2] : {
    id: id2,
    title: origin2_element.innerText
  }

  // TODO better way to create new id
  let newid = "mm-" + id1 + "+" + id2;

  mergelist[newid] = {
    id: newid,
    title: title,
    historyA: item1,
    historyB: item2
  }

  target.removeAttribute("data-origin");
  target.id = newid;

  if(remove_id2) {
    document.getElementById(id2).remove()
  }

  return newid;
}

function un_merge(id) {
  console.log("unmerge")
  console.log("needs to be implemented")
  console.log(mergelist[id])

  let mergeitem = mergelist[id];
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
    dropOrigin = (e.target as Element).id;
  });

  mergelist_element.addEventListener("dragenter", (e) => toggleDrop(e));
  mergelist_element.addEventListener("dragleave", (e) => toggleDrop(e));
  mergelist_element.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  mergelist_element.addEventListener("drop", (e) => {
    toggleDrop(e);

    let droporigin_element = document.getElementById(dropOrigin);
    let target = (e.target as HTMLElement);

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

    let dropOriginelement = document.getElementById(dropOrigin);
    let newtitle_element = (dialog.querySelector("input[name='newtitle']") as HTMLInputElement)
    target.innerText = newtitle_element.value;

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
    log_history("merge", target.id, dropOrigin, mergeid)

    dialog.close();
  });
}