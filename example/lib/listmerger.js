// Listmerger v0.1 ESM
let mergelistId;
function setMergelistId(id) {
    mergelistId = id;
}

function init_responsive_tablist(id) {
    const details = document.querySelectorAll("details");
    const detailsselect = document.querySelector("#detailsselector");
    detailsselect.addEventListener("change", selectTab);
    details.forEach(detail => {
        detail.addEventListener("toggle", (event) => {
            if (detail.open) {
                detailsselect.nodeValue = detail.dataset.order;
            }
        });
    });
    new ResizeObserver(entries => {
        entries.forEach(element => {
            const summaries = element.target.querySelectorAll("summary");
            const offset1 = summaries[0].offsetTop;
            const offset2 = summaries[summaries.length - 1].offsetTop;
            if (offset1 == offset2) {
                element.target.classList.remove("compact");
            }
            else {
                element.target.classList.add("compact");
            }
        });
    }).observe(document.querySelector(id));
}
function createDragHandle() {
    let draghandle = document.createElement("div");
    draghandle.classList.add("draghandle");
    draghandle.draggable = true;
    draghandle.innerHTML = "H";
    return draghandle;
}
function selectTab(e) {
    let value = e.target.value;
    let details = document.querySelectorAll(".tabbar details")[value];
    details.setAttribute("open", "1");
}
function toggleDrop(e, dropOrigin) {
    let classlist = e.target.classList;
    if (classlist == undefined)
        return;
    if (e.target.parentElement.classList.contains("element")) {
        classlist = e.target.parentElement.classList;
    }
    if (classlist.contains("drag")) {
        classlist.remove("drag");
    }
    else if ((classlist.contains("zone") || classlist.contains("element")) && e.target.id != dropOrigin) {
        classlist.add("drag");
    }
}
function getSiblingsPosition(id) {
    const element = document.getElementById(id);
    const siblings = element.parentElement.children;
    return [...siblings].indexOf(element);
}

function move(id, from_history = false) {
    if (!from_history) {
        resetFuture();
    }
    let element = document.getElementById(id);
    let target = document.getElementById(mergelistId).querySelector(".zone");
    let clone = element.cloneNode(true);
    clone.id = "merged-" + clone.id;
    clone.setAttribute("data-origin", id);
    clone.classList.remove("dragg");
    clone.append(createDragHandle());
    target.append(clone);
    element.classList.add("added");
}
function moveUndo(id) {
    let element = document.getElementById(id);
    element.classList.remove("added");
    let clone = document.getElementById("merged-" + id);
    clone.remove();
}
function moveAll$1(zonefindings, from_history = false) {
    if (!from_history) {
        resetFuture();
    }
    let moved = [];
    zonefindings.forEach(element => {
        if (!element.classList.contains("added") && !element.classList.contains("merged")) {
            move(element.id, from_history);
            moved.push(element.id);
        }
    });
    return moved;
}
function moveAllUndo(moved) {
    moved.forEach(id => {
        moveUndo(id);
    });
}
function merge$1(id1, id2, title, from_history = false, oldmergeid = "") {
    if (!from_history) {
        resetFuture();
    }
    let target = document.getElementById(id1);
    let remove_id2 = true;
    let item1 = getMergeItem(id1);
    let item2 = getMergeItem(id2);
    if (item1 == undefined) {
        let origin1 = document.getElementById(id1).getAttribute("data-origin");
        let origin1_element = document.getElementById(origin1);
        origin1_element.classList.remove("added");
        origin1_element.classList.add("merged");
        item1 = {
            id: id1,
            title: origin1_element.innerHTML,
            origin: origin1_element.id
        };
    }
    if (item2 == undefined) {
        let origin2 = document.getElementById(id2).getAttribute("data-origin");
        // directly dragged from the list, not the mergelist
        if (origin2 == undefined) {
            origin2 = id2;
            remove_id2 = false;
        }
        let origin2_element = document.getElementById(origin2);
        origin2_element.classList.remove("added");
        origin2_element.classList.add("merged");
        item2 = {
            id: id2,
            title: origin2_element.innerHTML,
            origin: origin2_element.id
        };
    }
    // TODO better way to create new id
    let newid = "mm-" + id1 + "+" + id2;
    if (oldmergeid != "") {
        newid = oldmergeid;
    }
    addMergeItem(newid, {
        id: newid,
        title: title,
        historyA: item1,
        historyB: item2
    });
    target.innerText = title;
    target.append(createDragHandle());
    target.removeAttribute("data-origin");
    target.id = newid;
    if (remove_id2) {
        document.getElementById(id2).remove();
    }
    return newid;
}
function mergeUndo(id) {
    console.log("unmerge");
    let mergeitem = getMergeItem(id);
    let mergeelement = document.getElementById(id);
    if (mergeitem.historyA.id.startsWith("merged-")) {
        mergeelement.setAttribute("data-origin", mergeitem.historyA.origin);
        document.getElementById(mergeitem.historyA.origin).classList.remove("merged");
        document.getElementById(mergeitem.historyA.origin).classList.add("added");
    }
    if (mergeitem.historyA.id.startsWith("mm-") || mergeitem.historyA.id.startsWith("merged-")) {
        mergeelement.id = mergeitem.historyA.id;
        mergeelement.innerText = mergeitem.historyA.title;
        mergeelement.append(createDragHandle());
    }
    //if(mergeitem.historyB.id.startsWith("mm-")) {   
    //}
    //else if(mergeitem.historyB.id.startsWith("merged-")) {
    if (mergeitem.historyB.id.startsWith("merged-") || mergeitem.historyB.id.startsWith("mm-")) {
        //mergeelement.setAttribute("data-origin", mergeitem.historyB.origin);
        let newelement = document.createElement("div");
        newelement.innerText = mergeitem.historyB.title;
        newelement.id = mergeitem.historyB.id;
        newelement.draggable = true;
        newelement.append(createDragHandle());
        if (mergeitem.historyB.origin != null) {
            document.getElementById(mergeitem.historyB.origin).classList.remove("merged");
            document.getElementById(mergeitem.historyB.origin).classList.add("added");
            newelement.setAttribute("data-origin", mergeitem.historyB.origin);
        }
        document.getElementById("mlist").append(newelement);
    }
    else {
        let element = document.getElementById(mergeitem.historyB.id);
        element.classList.remove("merged");
    }
    deleteMergeItem(id);
}
function arrange(id, position, insertAfter = false) {
    const element = document.getElementById(id);
    const parent = element.parentElement;
    const children = [...parent.children];
    let neighbour = children[position];
    if (insertAfter) {
        neighbour = neighbour.nextSibling;
    }
    parent.insertBefore(element, neighbour);
}

var HistoryTasks;
(function (HistoryTasks) {
    HistoryTasks[HistoryTasks["Move"] = 0] = "Move";
    HistoryTasks[HistoryTasks["UnMove"] = 1] = "UnMove";
    HistoryTasks[HistoryTasks["MoveAll"] = 2] = "MoveAll";
    HistoryTasks[HistoryTasks["Merge"] = 3] = "Merge";
    HistoryTasks[HistoryTasks["UnMerge"] = 4] = "UnMerge";
})(HistoryTasks || (HistoryTasks = {}));
function init$2() {
    updateButtons();
    document.getElementById("undo").addEventListener("click", (e) => {
        e.preventDefault();
        undo();
    });
    document.getElementById("redo").addEventListener("click", (e) => {
        e.preventDefault();
        redo();
    });
}
let mergelist = {};
let history = [];
let future = [];
function resetFuture() {
    future = [];
}
function getMergeItem(id) {
    return mergelist[id];
}
function addMergeItem(id, item) {
    mergelist[id] = item;
}
function deleteMergeItem(id) {
    delete mergelist[id];
}
function updateButtons() {
    let undo_button = document.getElementById("undo");
    let redo_button = document.getElementById("redo");
    undo_button.disabled = history.length == 0;
    redo_button.disabled = future.length == 0;
}
function log(task, id1 = "", id2 = "", id3 = "", array = [], title = "") {
    history.push({
        action: task,
        id1: id1,
        id2: id2,
        id3: id3,
        array: array,
        title: title
    });
    console.log("history");
    console.log(history);
    console.log(future);
    updateButtons();
}
function undo() {
    let last = history.pop();
    if (last == undefined)
        return;
    if (last.action == "move") {
        moveUndo(last.id1);
    }
    else if (last.action == "move_all") {
        moveAllUndo(last.array);
    }
    else if (last.action == "merge") {
        mergeUndo(last.id3);
    }
    else if (last.action == "arrange") {
        arrange(last.id1, +last.id2);
    }
    future.push(last);
    console.log("<< undo");
    console.log(history);
    console.log(future);
    updateButtons();
}
function redo() {
    let last = future.pop();
    if (last == undefined)
        return;
    history.push(last);
    if (last.action == "move") {
        move(last.id1, true);
    }
    else if (last.action == "move_all") {
        let zonefindings = document.getElementById(last.id1).querySelectorAll("[data-role='finding']");
        moveAll$1(zonefindings, true);
    }
    else if (last.action == "merge") {
        merge$1(last.id1, last.id2, last.title, true, last.id3);
    }
    else if (last.action == "arrange") {
        arrange(last.id1, +last.id3, true);
    }
    console.log(">> redo");
    console.log(history);
    console.log(future);
    updateButtons();
}

let dropOrigin = "";
let dropTarget = "";
let dragAction = "";
let dragPosition = -1;
let mergeListElement;
let dialog;
function init$1() {
    mergeListElement = document.querySelector("#mlist");
    initDialog();
    initDragDrop();
    initMoveAll();
}
function initDialog() {
    dialog = document.querySelector("dialog");
    const closebutton = document.querySelector("dialog button#closebutton");
    const mergebutton = document.querySelector("#mergebutton");
    closebutton.addEventListener("click", dialogClose);
    mergebutton.addEventListener("click", merge);
}
function initDragDrop() {
    const listmerger_element = document.getElementById(mergelistId);
    const mergelist_element = listmerger_element.querySelector(".mergelist");
    listmerger_element.addEventListener("dragstart", dragStart);
    listmerger_element.addEventListener("dragend", dragEnd);
    mergelist_element.addEventListener("dragenter", dragHover);
    mergelist_element.addEventListener("dragleave", dragHover);
    mergelist_element.addEventListener("dragover", dragOver);
    mergelist_element.addEventListener("drop", drop);
}
function dragStart(e) {
    let element = e.target;
    if (element.nodeName != "DIV" || element.classList.contains("added") || element.classList.contains("merged")) {
        e.preventDefault();
        return;
    }
    dropOrigin = element.id;
    if (element.classList.contains("draghandle")) {
        mergeListElement = document.querySelector("#mlist");
        dragAction = "handle";
        dropOrigin = element.parentElement.id;
        dragPosition = getSiblingsPosition(dropOrigin);
        // This fake-delay leaves the object the same in the "drop preview", 
        // but makes it appear as a skeleton in the list
        setTimeout(() => element.parentElement.classList.add("dragging"), 0);
    }
    else {
        dragAction = "move";
        document.getElementById(dropOrigin).classList.add("dragg");
    }
}
function dragEnd(e) {
    document.getElementById(dropOrigin).classList.remove("dragging");
    dropOrigin = e.target.id;
    if (dropOrigin == "") {
        return;
    }
    document.getElementById(dropOrigin).classList.remove("dragg");
}
function dragHover(e) {
    if (dragAction == "move") {
        toggleDrop(e, dropOrigin);
    }
}
function dragOver(e) {
    e.preventDefault();
    if (dragAction == "move") {
        return;
    }
    // https://www.codingnepalweb.com/drag-and-drop-sortable-list-html-javascript/
    const draggingItem = document.querySelector(".dragging");
    let siblings = [...mergeListElement.querySelectorAll(".element:not(.dragging)")];
    let nextSibling = siblings.find((sibling) => {
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
    mergeListElement.insertBefore(draggingItem, nextSibling);
}
function drop(e) {
    if (dragAction == "handle") {
        let dropPosition = getSiblingsPosition(dropOrigin);
        if (dragPosition != dropPosition) {
            log("arrange", dropOrigin, dragPosition.toString(), dropPosition.toString());
        }
        return;
    }
    toggleDrop(e, dropOrigin);
    let droporigin_element = document.getElementById(dropOrigin);
    let target = e.target;
    if (dropOrigin == target.id) {
        return;
    }
    console.log(target);
    if (target.classList.contains("draghandle")) {
        target = target.parentElement;
    }
    if (target.getAttribute("data-role") == "finding") {
        // merging target
        const mergeplaceholder = document.querySelector("#mergeplaceholder");
        dropTarget = target.id;
        mergeplaceholder.innerHTML = " (ID " + target.id + " and ID " + dropOrigin + ")";
        let newtitle_element = dialog.querySelector("input[name='newtitle']");
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
    log("move", dropOrigin);
}
function merge(event) {
    event.preventDefault();
    let target = document.getElementById(dropTarget);
    let targetid = target.id;
    let dropOriginelement = document.getElementById(dropOrigin);
    let newtitle_element = dialog.querySelector("input[name='newtitle']");
    // target.innerText = newtitle_element.value;
    let origin_id = dropOrigin;
    if (dropOriginelement.hasAttribute("data-origin")) {
        origin_id = dropOriginelement.getAttribute("data-origin");
        let origin_element = document.getElementById(origin_id);
        origin_element.classList.remove("added");
        origin_element.classList.add("merged");
    }
    else {
        dropOriginelement.classList.add("merged");
    }
    let mergeid = merge$1(target.id, dropOrigin, newtitle_element.value);
    log("merge", targetid, dropOrigin, mergeid, [], newtitle_element.value);
    dialog.close();
}
function dialogClose(e) {
    e.preventDefault();
    dialog.close();
}
function initMoveAll() {
    const moveallbuttons = document.querySelectorAll(".moveall");
    moveallbuttons.forEach(button => {
        button.addEventListener("click", moveAll);
    });
}
function moveAll(e) {
    let parent = e.target.parentNode;
    let zonefindings = parent.querySelectorAll("[data-role='finding']");
    if (zonefindings.length == 0)
        return;
    let moved = moveAll$1(zonefindings);
    if (moved.length) {
        log("move_all", e.target.nextElementSibling.id, "", "", moved);
    }
}

function init(id, id_undo, id_redo) {
    setMergelistId(id);
    init$1();
    init_responsive_tablist(".tablist");
    init$2();
}

export { init };
//# sourceMappingURL=listmerger.js.map
