import * as listmerger from './lib/listmerger.js';

const items = {
  "merged": [],
  "originlists": [
    {
      "id": "list1",
      "name": "John Doe",
      "items": [
        {
          "id": "li1it1",
          "title": "Video on the Start Page",
          "author": ["John Doe"],
          "category": ["Visibility of System Status"],
          "severity": 2,
          "images": [
            {"active": true, "src": "images/tugraz.png"},
            {"active": false, "src": "images/studies.png"},
            {"active": true, "src": "images/steps.png"}
          ],
          "description": "The start page has a muted video that starts automatically."
        },
        {
          "id": "li1it2",
          "title": "Study Programs",
          "author": ["John Doe"],
          "category": ["User Control and Freedom"],
          "severity": 3,
          "images": [{"active": true, "src": "images/studies.png"}],
          "description": "This is the second item in the list."
        },
        {
          "id": "li1it3",
          "title": "Consultation and Tips Boxes",
          "author": ["John Doe"],
          "category": ["Aesthetic and Minimalist Design"],
          "severity": 1,
          "images": [{"active": true, "src": "images/tipps.png"}],
          "description": "This is an item about the Consultation and Tips Boxes."
        },
        {
          "id": "li1it4",
          "title": "Admission",
          "author": ["John Doe"],
          "category": ["User Control and Freedom"],
          "severity": 0,
          "images": [{"active": true, "src": "images/steps.png"}],
          "description": "In this graphic, the steps for admission are shown."
        },
        {
          "id": "li1it5",
          "title": "Major Selection",
          "author": ["John Doe"],
          "category": ["Visibility of System Status"],
          "severity": 4,
          "images": [{"active": true, "src": "images/majors.png"}],
          "description": "A variety of Majors."
        },
        {
          "id": "li1it6",
          "title": "Tiles for Study Programs",
          "author": ["John Doe"],
          "category": ["Help and Documentation"],
          "images": [{"active": true, "src": "images/studies.png"}],
          "description": "Study programs are shown as tiles."
        },
        {
          "id": "li1it7",
          "title": "Footer with many Information",
          "author": ["John Doe"],
          "category": ["User Control and Freedom"],
          "images": [{"active": true, "src": "images/footer.png"}],
          "description": "The footer contains important links, contact information, and partners."
        },
        {
          "id": "li1it8",
          "title": "The Faculty of Computer Science and Biomedical Engineering",
          "author": ["John Doe"],
          "category": ["Consistency and Standards"],
          "images": [{"active": true, "src": "images/faculty.png"}],
          "description": "This faculty is home to 11 institutes."
        },
        {
          "id": "li1it9",
          "title": "Selection of Majors in Computer Science",
          "author": ["John Doe"],
          "category": ["Help Users Recognize, Diagnose, and Recover from Errors"],
          "images": [{"active": true, "src": "images/majors.png"}],
          "description": "Choose one of those."
        },
        {
          "id": "li1it10",
          "title": "This is an example with a very long title to show how the Application copes with it and the <summary> element breaks it to multiple lines. A title should nevertheless not be that long. Also, multiple sentences are maybe a bit unnecessary.",
          "author": ["John Doe"],
          "category": ["Aesthetic and Minimalist Design"],
          "images": [{"active": true, "src": "images/steps.png"}],
          "description": "In contrast, a very short description."
        },
        {
          "id": "li1it11",
          "title": "Import Information about the Study Program",
          "author": ["John Doe"],
          "category": ["Match Between the System and the Real World"],
          "images": [{"active": true, "src": "images/studydata.png"}],
          "description": "We already have 11 items in this list, it represents a long list.",
        },
        {
          "id": "li1it12",
          "title": "Just one last Example of the Homepage",
          "author": ["John Doe"],
          "category": ["Error Prevention"],
          "images": [{"active": true, "src": "images/tugraz.png"}],
          "description": "Now we really have enough items.",
        }
      ]
    },
    {
      "id": "list2",
      "name": "Max Mustermann",
      "items": [
        {
          "id": "li2it1",
          "title": "Description of Majors",
          "author": ["Max Mustermann"],
          "category": ["User Control and Freedom"],
          "severity": 0,
          "images": [{"active": true, "src": "images/majors.png"}],
          "description": "The Master Programe offers 8 specialisation.",
        },
        {
          "id": "li2it2",
          "title": "Study Data",
          "author": ["Max Mustermann"],
          "category": ["Consistency and Standards"],
          "severity": 1,
          "images": [{"active": true, "src": "images/studydata.png"}],
          "description": "A box at the top show the key facts about the program.",
        },
        {
          "id": "li2it3",
          "title": "Tips",
          "author": ["Max Mustermann"],
          "category": ["Visibility of System Status"],
          "severity": 1,
          "images": [{"active": true, "src": "images/tipps.png"}],
          "description": "Short description.",
        }
      ]
    },
    {
      "id": "list3",
      "name": "Mario Rossi",
      "items": [
        {
          "id": "li3it1",
          "title": "3x4 Grid of Master Programs at TU Graz",
          "author": ["Mario Rossi"],
          "category": ["Match Between the System and the Real World"],
          "severity": 2,
          "images": [{"active": true, "src": "images/studies.png"}],
          "description": "A practical alternative to a long list.",
        },
        {
          "id": "li3it2",
          "title": "The Homepage of TU Graz",
          "author": ["Mario Rossi"],
          "category": ["Flexibility and Efficiency of Use"],
          "severity": 3,
          "images": [{"active": true, "src": "images/tugraz.png"}],
          "description": "TU Graz is one of four universities in Austria's second largest city.",
        },
        {
          "id": "li3it3",
          "title": "Large White Space to the Left",
          "author": ["Mario Rossi"],
          "category": ["Visibility of System Status"],
          "severity": 2,
          "images": [{"active": true, "src": "images/faculty.png"}],
          "description": "To the right, institutes are listed.",
        },
        {
          "id": "li3it4",
          "title": "Custom Footer with the Logo",
          "author": ["Mario Rossi"],
          "category": ["Aesthetic and Minimalist Design"],
          "severity": 3,
          "images": [{"active": true, "src": "images/footer.png"}],
          "description": "The logo is integrated into the background image in an unusual colour.",
        },
        {
          "id": "li3it5",
          "title": "Last Item of the whole Example",
          "author": ["Mario Rossi"],
          "category": ["Error Prevention"],
          "severity": 0,
          "images": [{"active": true, "src": "images/studies.png"}],
          "description": "The list of Mario Rossi now has 5 items.",
        }
      ]
    }
  ]
}

const severity_template = `
<div class='formgroup'>
  <label>Severity</label>
  <select name="severity">
    <option value="4">Catastrophic Problem</option>
    <option value="3">Major Problem</option>
    <option value="2">Minor Problem</option>
    <option value="1">Cosmetic Problem only</option>
    <option value="0">Not a Problem at all</option>
  </select>
</div>
`

const item_template = `
<summary {{#mergedinto}}title="Merged into '{{title}}'"{{/mergedinto}}>
  <span class="summary-move move" title="Move to Merged List"></span>
  <span class="summary-moveback move" title="Move back to {{parent}}"></span>
  <span class="summary-triangle" title="Open Element"></span>
  <span class="title" data-edit="title" contenteditable='plaintext-only'>{{title}}</span>
{{#titleimg}}<img class='thumbnail' src='{{src}}'/>{{/titleimg}}
</summary>

<section>

{{#author.length}}
  <div>
    <label class="editable">Author</label>
    <span class="selectedit" data-name="author" data-values="{{author}}" data-mode="multiple" data-options='["John Doe","Max Mustermann","Mario Rossi"]'>
    {{#author}}<span class='enum'>{{.}}</span>{{/author}}
    </span>
  </div>
{{/author.length}}
{{#category.length}}
  <div>
    <label class="editable">Category</label>
    <span class="selectedit" data-name="category" data-values="{{category}}" data-mode="multiple" data-options='[
      "Visibility of System Status",
      "Match Between the System and the Real World",
      "User Control and Freedom",
      "Consistency and Standards",
      "Error Prevention",
      "Recognition Rather than Recall",
      "Flexibility and Efficiency of Use",
      "Aesthetic and Minimalist Design",
      "Help Users Recognize, Diagnose, and Recover from Errors",
      "Help and Documentation"]'>
    {{#category}}<span class='enum'>{{.}}</span>{{/category}}
    </span>
  </div>
{{/category.length}}

{{#images.length}}
<div>
  <label class="editable">Images</label>
  <div class="imageedit">
  {{#images}}
      <div class="imageedit-container{{^active}} imageedit-inactive{{/active}}"><img class="thumbnail" src="{{src}}"/></div>
  {{/images}}
  </div>
</div>
{{/images.length}}

{{#severity}}
<div>
  <label class="editable">Severity</label>
  <span class="severity severity-{{.}} selectedit" data-name="severity" data-values="{{.}}" data-mode="class" data-class="severity-" data-options='{
    "0": "Not a Problem at all", "1": "Cosmetic Problem only", "2": "Minor Problem", "3": "Major Problem", "4": "Catastrophic Problem"
  }'>
</div>
{{/severity}}

{{#description}}
<div>
  <label class="editable">Description</label>
  <div data-edit="description" contenteditable>{{.}}</div>
</div>
{{/description}}

{{#parent}}
<div class="origin">
<hr/>
<label>Origin List</label>
<a href="#{{id}}">{{.}}</a>
</div>
{{/parent}}

{{#mergedinto}}
<hr/>
<label>Merged into</label>
<a href="#{{mergedinto.id}}">{{mergedinto.title}}</a>
<img class="detach" data-from="{{parent_id}}" data-to="{{mergedinto.id}}" src="icons/detach.svg"
  title="Detach this item from '{{mergedinto.title}}'" alt="Detach"/>
{{/mergedinto}}

{{#mergedfrom.length}}
<hr/>
<label>Merged from</label>
{{#mergedfrom}}
  <span class="enum">
    <a href="#{{id}}">{{#parent}}{{.}}: {{/parent}}{{title}}</a>
    <img href="#" class="detach" data-from="{{id}}" data-to="{{parent_id}}" src="icons/detach.svg"
      title="Detach '{{title}}' from this merged item" alt="Detach"/>
  </span>
{{/mergedfrom}} 
{{/mergedfrom.length}}

</div>
</section>
`;

const dialog_template = `
<h3>{{#parent}}{{.}}: {{/parent}}{{title}}</h3>

{{#author.length}}
  <div>
    <label>Author</label>
    {{#author}}<span class='enum'>{{.}}</span>{{/author}}
  </div>
{{/author.length}}
{{#category.length}}
  <div>
    <label>Category</label>
    {{#category}}<span class='enum'>{{.}}</span>{{/category}}
  </div>
{{/category.length}}
<div>
  {{#images.length}}
    <label>Images</label>
    {{#images}}
      {{#active}}<div><img class='thumbnail' src='{{src}}'/></div>{{/active}}
    {{/images}}
  {{/images.length}}
</div>

{{#severity}}
<div>
  <label>Severity</label>
  <span class="severity severity-{{.}}"></span>
</div>
{{/severity}}

{{#description}}
  <label>Description</label>
    {{.}}
{{/description}}


<div>
{{#mergedfrom.length}}
<hr/>
<label>Merged from</label>
{{#mergedfrom}}<span class="enum">{{parent}}: {{title}}</span>{{/mergedfrom}} 
{{/mergedfrom.length}}
</div>
`;

const merge_template = `
<h2>{{action}}</h2>

<div class='formgroup'>
  <label>Title</label>
  <input name='title' value="{{title}}">
</div>

{{#category.length}}
  <div>
    <label>Category</label>
    <span class="selectedit" data-name="category" data-values="{{category}}" data-mode="multiple" data-options='[
      "Visibility of System Status",
      "Match Between the System and the Real World",
      "User Control and Freedom",
      "Consistency and Standards",
      "Error Prevention",
      "Recognition Rather than Recall",
      "Flexibility and Efficiency of Use",
      "Aesthetic and Minimalist Design",
      "Help Users Recognize, Diagnose, and Recover from Errors",
      "Help and Documentation"]'>
    {{#category}}<span class='enum'>{{.}}</span>{{/category}}
    </span>
  </div>
{{/category.length}}

${severity_template}

<div class='formgroup'>
  <label>Description</label>
  <textarea name='description'>{{description}}</textarea>
</div>
`;

function open() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const items = JSON.parse(text);
      listmerger.init("listmerger", "undo", "redo", items, item_template, dialog_template, merge_template);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };
  input.click();
}

function save_console() {
  console.log(listmerger.getAllItems());
}

function save_json() {
  const items = listmerger.getAllItems();

  const file = new Blob([JSON.stringify(items, null, 2)], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = "items.json";
  a.click();
}

function history_callback(is_new) {
  if (is_new) {
    console.log("changes deteced");
  } else {
    console.log("undo/redo deteced");
  }
}

function image_edit(editContainer) {
  let active = editContainer.dataset.active == "true";
  editContainer.dataset.active = !active;
  const start_order = Array.from(editContainer.children).map(container => container.querySelector("img").src);

  // Focus on the box and remove selections
  editContainer.tabIndex = 0;
  window.getSelection().empty();

  let draggedImage = null;

  editContainer.addEventListener("dragstart", (e) => {
    if (e.target.closest(".imageedit-container")) {
      draggedImage = e.target.closest(".imageedit-container");

      // Prevent calling event.preventDefault() in the library's event.ts
      e.dataTransfer.setData("inner", "true");
    }
  });
  
  editContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    const image = e.target.closest(".imageedit-container");

    if (image && image !== draggedImage) {
      const rect = image.getBoundingClientRect();
      const next = (e.clientX > rect.left + rect.width / 2) ? image.nextElementSibling : image;
      
      let bar = document.querySelector(".arrangebar");

      if (bar == undefined) {
        bar = document.createElement("hr");
        bar.classList.add("arrangebar");
      } else if (bar.nextElementSibling == next) {
        return;
      }

      if (next != undefined) {
        editContainer.insertBefore(bar, next)
      } else {
        editContainer.append(bar)
      }
    }
  });
  
  editContainer.addEventListener('dragend', (e) => {
    const bar = document.querySelector(".arrangebar");
    const image = e.target.closest(".imageedit-container");

    if (bar && image) {
      editContainer.insertBefore(image, bar);
      bar.remove();

      const element = editContainer.closest(".element");

      if (!element) {
        return;
      }

      const id = element.id;
      const order = Array.from(editContainer.children).map(container => container.querySelector("img").src);
    }
  });

  return function () {
    editContainer.dataset.active = false;
    const element = editContainer.closest(".element");
    const id = element.id;

    const end_order = Array.from(editContainer.children).map(container => {
      return {
        "active": !container.classList.contains("imageedit-inactive"),
        "src": container.querySelector("img").src
      }
    });
    
    if (JSON.stringify(start_order) != JSON.stringify(end_order)) {
      listmerger.edit(element.id, "images", end_order);
    }
  }
}

function select_edit(selectTarget) {
  const innerText = selectTarget.innerHTML;
  let preserveclassname = "";
  const name = selectTarget.dataset.name;
  let options = JSON.parse(selectTarget.dataset.options);
  let values = selectTarget.dataset.values;

  if(Array.isArray(options)) {
    options = Object.fromEntries(
      options.map(key => [key, key])
    );
  }

  try {
    values = JSON.parse(values);
  } catch {
    values = values.split(',').map(item => item.trim());
  }

  const mode = selectTarget.dataset.mode;
  const classprefix = selectTarget.dataset.class;

  if (mode == "class") {
    selectTarget.classList.forEach(classname => {
      if (classname.startsWith(classprefix)) {
        preserveclassname = classname;
        selectTarget.classList.remove(classname);
      }
    });
  } else {
    selectTarget.innerHTML = "";
  }

  const select = document.createElement("select");
  select.name = name;

  if (mode == "multiple") {
    select.multiple = true;
  }

  Object.entries(options).forEach(element => {
    const option = document.createElement("option");
    option.value = element[0];
    option.innerText = element[1];

    if (Array.isArray(values) && (values.includes(element[0]) || values.includes(element[1]))) {
      option.selected = true;
    } else if (values == element[0] || values == element[1]) {
      option.selected = true;
    }

    select.append(option);
  });
  selectTarget.append(select);
  select.focus();

  return function() {

    if (select.closest("dialog")) {
      return;
    }

    select.remove();
    selectTarget.innerHTML = innerText;

    if (preserveclassname != "") {
      selectTarget.classList.add(preserveclassname);
    }
  };
}

function init_select_edit() {
  const parent = document.getElementById("listmerger");

  parent.addEventListener("dblclicka", (e) => {
    let selectTarget = e.target.closest(".selectedit");
    let imageTarget = e.target.closest(".imageedit");

    if (!selectTarget && !imageTarget) {
      selectTarget = e.target.parentNode.querySelector(":scope > .selectedit");
      imageTarget = e.target.parentNode.querySelector(":scope > .imageedit");
    }

    if (!selectTarget && !imageTarget) {
      return;
    }

    if (imageTarget) {
      image_edit(imageTarget);
    } else {
      select_edit(selectTarget);
    }
  });

  parent.addEventListener("click", (e) => {
    if (e.target.tagName == "LABEL") {
      const inline_edit_element = e.target.parentNode.querySelector("[contenteditable]")
      const image_edit_element = e.target.parentNode.querySelector(".imageedit")
      const select_edit_element = e.target.parentNode.querySelector(".selectedit");
      const label = e.target;

      if (label.classList.contains("editing")) {
        return;
      } else if (inline_edit_element || image_edit_element || select_edit_element) {
        label.classList.add("editing");
      }

      let save = function() {};

      if (inline_edit_element) {
        inline_edit_element.focus();
      } else if (image_edit_element) {
        save = image_edit(image_edit_element);
      } else if (select_edit_element) {
        save = select_edit(select_edit_element);
      }

      label.addEventListener("click", (e) => {
        e.stopImmediatePropagation();
        save();
        label.classList.remove("editing");
      }, { once: true })
    }

    if (e.target.closest(".imageedit") && e.target.closest(".imageedit").dataset.active == "true") {
      const container = e.target.closest(".imageedit-container");
      if (container) {
        container.classList.toggle("imageedit-inactive");
      }
    }
  });
}

init_select_edit();

document.getElementById("open").addEventListener("click", open);
document.getElementById("save-console").addEventListener("click", save_console);
document.getElementById("save-json").addEventListener("click", save_json);

const selectors = {"id": "listmerger"};
const templates = {
  "item": item_template,
  "dialog": dialog_template,
  "merge": merge_template
}
listmerger.init(items, templates, selectors, history_callback);

// Image thumbnail previews
document.addEventListener("click", (e) => {
  if (e.target.tagName == "IMG" && e.target.classList.contains("thumbnail") && !e.target.closest(".imageedit[data-active='true']")) {
    const dialog = document.createElement("dialog");
    document.getElementById("listmerger").append(dialog);

    const closeButton = document.createElement("button");
    closeButton.classList.add("close");
    dialog.append(closeButton);

    const image = document.createElement("img");
    image.src = e.target.src;
    image.classList.add("thumbnail-full")
    dialog.append(image);
    dialog.showModal();

    dialog.addEventListener("close", (e) => {
      dialog.remove();
    });
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.classList.contains("close")) {
        dialog.close();
      }
    });
  }
});

document.getElementById("listmerger").addEventListener("click", (e) => {
  const target = e.target;
  const details = target.closest("details");

  if (target.closest("summary:has(> .summary-triangle)")) {
    if (target.closest(".summary-triangle") || target.isContentEditable) {
      details.open = details.open;
    } else {
      details.open = !details.open;
    }
  }
});
