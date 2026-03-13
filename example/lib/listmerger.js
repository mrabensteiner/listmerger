// Listmerger v0.1 ESM
let mergelistId;
let callback_function = (a) => { };
const PREFIX_MOVED = "moved-";
const PREFIX_MERGED = "merged-";
function setMergelistId(id) {
    mergelistId = id;
}
function setCallbackFunction(callback) {
    callback_function = callback;
}

const CssNames = {
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
};
const dragIconPath = "dragicon.svg";
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
    let draghandle = document.createElement("img");
    draghandle.classList.add(CssNames.ITEM_DRAGHANDLE);
    draghandle.draggable = true;
    draghandle.src = dragIconPath;
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
    if (e.target.parentElement.classList.contains(CssNames.ITEM)) {
        classlist = e.target.parentElement.classList;
    }
    if (classlist.contains(CssNames.HOVER_DRAG)) {
        classlist.remove(CssNames.HOVER_DRAG);
    }
    else if ((classlist.contains(CssNames.MERGED_ZONE) || classlist.contains(CssNames.ITEM)) && e.target.id != dropOrigin) {
        classlist.add(CssNames.HOVER_DRAG);
    }
}
function getPositionInList(id) {
    const element = document.getElementById(id);
    const siblings = element.parentElement.children;
    return [...siblings].indexOf(element);
}
function getNextDropSibling(e) {
    let siblings = [...document.querySelectorAll(`#mlist .element:not(.${CssNames.ITEM_DRAGGING}`)];
    let nextSibling = siblings.find((sibling) => {
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
    return nextSibling;
}

function move(id, from_history = false) {
    if (!from_history) {
        resetFuture();
    }
    let element = document.getElementById(id);
    let target = document.getElementById(mergelistId).querySelector(`.${CssNames.MERGED_ZONE}`);
    let clone = element.cloneNode(true);
    clone.id = PREFIX_MOVED + clone.id;
    clone.setAttribute("data-origin", id);
    clone.classList.remove(CssNames.ITEM_DRAGGED);
    clone.append(createDragHandle());
    target.append(clone);
    element.classList.add(CssNames.ITEM_ADDED);
}
function moveUndo(id) {
    let element = document.getElementById(id);
    element.classList.remove(CssNames.ITEM_ADDED);
    let clone = document.getElementById(PREFIX_MOVED + id);
    clone.remove();
}
function moveAll$1(zonefindings, from_history = false) {
    if (!from_history) {
        resetFuture();
    }
    let moved = [];
    zonefindings.forEach(element => {
        if (!element.classList.contains(CssNames.ITEM_ADDED) && !element.classList.contains(CssNames.ITEM_MERGED)) {
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
        origin1_element.classList.remove(CssNames.ITEM_ADDED);
        origin1_element.classList.add(CssNames.ITEM_MERGED);
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
        origin2_element.classList.remove(CssNames.ITEM_ADDED);
        origin2_element.classList.add(CssNames.ITEM_MERGED);
        item2 = {
            id: id2,
            title: origin2_element.innerHTML,
            origin: origin2_element.id
        };
    }
    // TODO better way to create new id
    let newid = PREFIX_MERGED + id1 + "+" + id2;
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
    let mergeitem = getMergeItem(id);
    let mergeelement = document.getElementById(id);
    // Item A is a moved item
    if (mergeitem.historyA.id.startsWith(PREFIX_MERGED)) {
        mergeelement.setAttribute("data-origin", mergeitem.historyA.origin);
        document.getElementById(mergeitem.historyA.origin).classList.remove(CssNames.ITEM_MERGED);
        document.getElementById(mergeitem.historyA.origin).classList.add(CssNames.ITEM_ADDED);
    }
    // Bring Item A to its previous state
    if (mergeitem.historyA.id.startsWith(PREFIX_MERGED) || mergeitem.historyA.id.startsWith(PREFIX_MOVED)) {
        mergeelement.id = mergeitem.historyA.id;
        mergeelement.innerText = mergeitem.historyA.title;
        mergeelement.append(createDragHandle());
    }
    // Item B was taken from the merged list
    if (mergeitem.historyB.id.startsWith(PREFIX_MERGED) || mergeitem.historyB.id.startsWith(PREFIX_MOVED)) {
        let newelement = document.createElement("div");
        newelement.innerText = mergeitem.historyB.title;
        newelement.id = mergeitem.historyB.id;
        newelement.draggable = true;
        newelement.append(createDragHandle());
        if (mergeitem.historyB.origin != null) {
            document.getElementById(mergeitem.historyB.origin).classList.remove(CssNames.ITEM_MERGED);
            document.getElementById(mergeitem.historyB.origin).classList.add(CssNames.ITEM_ADDED);
            newelement.setAttribute("data-origin", mergeitem.historyB.origin);
        }
        document.getElementById("mlist").append(newelement);
    }
    // Item B was taken directly from an evaluators list
    else {
        let element = document.getElementById(mergeitem.historyB.id);
        element.classList.remove(CssNames.ITEM_MERGED);
    }
    deleteMergeItem(id);
}
function arrange(id, position, insertAfter = false) {
    const element = document.getElementById(id);
    const parent = element.parentElement;
    const children = [...parent.children];
    if (position == children.length - 1) {
        parent.append(element);
        return;
    }
    let neighbour = children[position];
    parent.insertBefore(element, neighbour);
}

var Tasks;
(function (Tasks) {
    Tasks[Tasks["Move"] = 0] = "Move";
    Tasks[Tasks["MoveAll"] = 1] = "MoveAll";
    Tasks[Tasks["Merge"] = 2] = "Merge";
    Tasks[Tasks["Arrange"] = 3] = "Arrange";
})(Tasks || (Tasks = {}));
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
    document.getElementById("save").addEventListener("click", (e) => {
        e.preventDefault();
        let mergedlist = [];
        document.querySelectorAll("#mlist .element").forEach((element) => {
            if (element.getAttribute("data-origin") != undefined) {
                mergedlist.push(element.getAttribute("data-origin"));
            }
            else {
                mergedlist.push(mergelist[element.id]);
            }
        });
        callback_function(mergedlist);
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
    updateButtons();
}
function undo() {
    let last = history.pop();
    if (last == undefined)
        return;
    if (last.action == Tasks.Move) {
        moveUndo(last.id1);
    }
    else if (last.action == Tasks.MoveAll) {
        moveAllUndo(last.array);
    }
    else if (last.action == Tasks.Merge) {
        mergeUndo(last.id3);
    }
    else if (last.action == Tasks.Arrange) {
        arrange(last.id1, +last.id2, true);
    }
    future.push(last);
    updateButtons();
}
function redo() {
    let last = future.pop();
    if (last == undefined)
        return;
    history.push(last);
    if (last.action == Tasks.Move) {
        move(last.id1, true);
    }
    else if (last.action == Tasks.MoveAll) {
        let zonefindings = document.getElementById(last.id1).querySelectorAll("[data-role='finding']");
        moveAll$1(zonefindings, true);
    }
    else if (last.action == Tasks.Merge) {
        merge$1(last.id1, last.id2, last.title, true, last.id3);
    }
    else if (last.action == Tasks.Arrange) {
        arrange(last.id1, +last.id3, true);
    }
    updateButtons();
}

var Action;
(function (Action) {
    Action[Action["None"] = 0] = "None";
    Action[Action["Move"] = 1] = "Move";
    Action[Action["Arrange"] = 2] = "Arrange";
})(Action || (Action = {}));
let dropOrigin = "";
let dropTarget = "";
let dragAction = Action.None;
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
    if ((element.nodeName != "DIV" && !element.classList.contains(CssNames.ITEM_DRAGHANDLE))
        || element.classList.contains(CssNames.ITEM_ADDED)
        || element.classList.contains(CssNames.ITEM_MERGED)) {
        e.preventDefault();
        return;
    }
    dropOrigin = element.id;
    if (element.classList.contains(CssNames.ITEM_DRAGHANDLE)) {
        mergeListElement = document.querySelector("#mlist");
        dragAction = Action.Arrange;
        dropOrigin = element.parentElement.id;
        dragPosition = getPositionInList(dropOrigin);
        element.parentElement.classList.add(CssNames.ITEM_DRAGGING);
    }
    else {
        dragAction = Action.Move;
        document.getElementById(dropOrigin).classList.add(CssNames.ITEM_DRAGGED);
    }
}
function dragEnd(e) {
    document.querySelectorAll(`.${CssNames.HOVER_DRAG}`).forEach((e) => {
        e.classList.remove(CssNames.HOVER_DRAG);
    });
    document.getElementById(dropOrigin).classList.remove(CssNames.ITEM_DRAGGING);
    dropOrigin = e.target.id;
    if (dropOrigin == "") {
        return;
    }
    document.getElementById(dropOrigin).classList.remove(CssNames.ITEM_DRAGGED);
    dragAction = Action.None;
}
function dragHover(e) {
    if (dragAction == Action.Move) {
        toggleDrop(e, dropOrigin);
    }
}
function dragOver(e) {
    e.preventDefault();
    if (dragAction == Action.Move) {
        return;
    }
    // https://www.codingnepalweb.com/drag-and-drop-sortable-list-html-javascript/
    const draggingItem = document.querySelector(`.${CssNames.ITEM_DRAGGING}`);
    let nextSibling = getNextDropSibling(e);
    mergeListElement.insertBefore(draggingItem, nextSibling);
}
function drop(e) {
    if (dragAction == Action.Arrange) {
        let dropPosition = getPositionInList(dropOrigin);
        if (dragPosition != dropPosition) {
            log(Tasks.Arrange, dropOrigin, dragPosition.toString(), dropPosition.toString());
        }
        dragAction = Action.None;
        return;
    }
    dragAction = Action.None;
    toggleDrop(e, dropOrigin);
    let droporigin_element = document.getElementById(dropOrigin);
    let target = e.target;
    if (dropOrigin == target.id) {
        return;
    }
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
        // is already there, move it to the new position
        let dragPosition = getPositionInList(dropOrigin);
        let nextSibling = getNextDropSibling(e);
        let dropPosition = nextSibling != undefined
            ? getPositionInList(nextSibling.id)
            : mergeListElement.length - 1;
        if (dragPosition != dropPosition) {
            arrange(dropOrigin, dropPosition, true);
            log(Tasks.Arrange, dropOrigin, dragPosition.toString(), dropPosition.toString());
        }
        dragAction = Action.None;
        return;
    }
    else if (droporigin_element.classList.contains(CssNames.ITEM_ADDED) || droporigin_element.classList.contains(CssNames.ITEM_MERGED)) {
        return;
    }
    move(dropOrigin);
    log(Tasks.Move, dropOrigin);
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
        origin_element.classList.remove(CssNames.ITEM_ADDED);
        origin_element.classList.add(CssNames.ITEM_MERGED);
    }
    else {
        dropOriginelement.classList.add(CssNames.ITEM_MERGED);
    }
    let mergeid = merge$1(target.id, dropOrigin, newtitle_element.value);
    log(Tasks.Merge, targetid, dropOrigin, mergeid, [], newtitle_element.value);
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
        log(Tasks.MoveAll, e.target.nextElementSibling.id, "", "", moved);
    }
}

function init(id, id_undo, id_redo, callback) {
    setMergelistId(id);
    setCallbackFunction(callback);
    init$1();
    init_responsive_tablist(".tablist");
    init$2();
}

export { init };
//# sourceMappingURL=listmerger.js.map
