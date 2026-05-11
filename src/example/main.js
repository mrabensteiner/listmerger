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
            "images/tugraz.png",
            "images/steps.png"
          ],
          "description": "The start page has a muted video that starts automatically."
        },
        {
          "id": "li1it2",
          "title": "Study Programs",
          "author": ["John Doe"],
          "category": ["User Control and Freedom"],
          "severity": 3,
          "images": ["images/studies.png"],
          "description": "This is the second item in the list."
        },
        {
          "id": "li1it3",
          "title": "Consultation and Tips Boxes",
          "author": ["John Doe"],
          "category": ["Aesthetic and Minimalist Design"],
          "severity": 1,
          "images": ["images/tipps.png"],
          "description": "This is an item about the Consultation and Tips Boxes."
        },
        {
          "id": "li1it4",
          "title": "Admission",
          "author": ["John Doe"],
          "category": ["User Control and Freedom"],
          "severity": 0,
          "images": ["images/steps.png"],
          "description": "In this graphic, the steps for admission are shown."
        },
        {
          "id": "li1it5",
          "title": "Major Selection",
          "author": ["John Doe"],
          "category": ["Visibility of System Status"],
          "severity": 4,
          "images": ["images/majors.png"],
          "description": "A variety of Majors."
        },
        {
          "id": "li1it6",
          "title": "Tiles for Study Programs",
          "author": ["John Doe"],
          "category": ["Help and Documentation"],
          "images": ["images/studies.png"],
          "description": "Study programs are shown as tiles."
        },
        {
          "id": "li1it7",
          "title": "Footer with many Information",
          "author": ["John Doe"],
          "category": ["User Control and Freedom"],
          "images": ["images/footer.png"],
          "description": "The footer contains important links, contact information, and partners."
        },
        {
          "id": "li1it8",
          "title": "The Faculty of Computer Science and Biomedical Engineering",
          "author": ["John Doe"],
          "category": ["Consistency and Standards"],
          "images": ["images/faculty.png"],
          "description": "This faculty is home to 11 institutes."
        },
        {
          "id": "li1it9",
          "title": "Selection of Majors in Computer Science",
          "author": ["John Doe"],
          "category": ["Help Users Recognize, Diagnose, and Recover from Errors"],
          "images": ["images/majors.png"],
          "description": "Choose one of those."
        },
        {
          "id": "li1it10",
          "title": "This is an example with a very long title to show how the Application copes with it and the <summary> element breaks it to multiple lines. A title should nevertheless not be that long. Also, multiple sentences are maybe a bit unnecessary.",
          "author": ["John Doe"],
          "category": ["Aesthetic and Minimalist Design"],
          "images": ["images/steps.png"],
          "description": "In contrast, a very short description."
        },
        {
          "id": "li1it11",
          "title": "Import Information about the Study Program",
          "author": ["John Doe"],
          "category": ["Match Between the System and the Real World"],
          "images": ["images/studydata.png"],
          "description": "We already have 11 items in this list, it represents a long list.",
        },
        {
          "id": "li1it12",
          "title": "Just one last Example of the Homepage",
          "author": ["John Doe"],
          "category": ["Error Prevention"],
          "images": ["images/tugraz.png"],
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
          "images": ["images/majors.png"],
          "description": "The Master Programe offers 8 specialisation.",
        },
        {
          "id": "li2it2",
          "title": "Study Data",
          "author": ["Max Mustermann"],
          "category": ["Consistency and Standards"],
          "severity": 1,
          "images": ["images/studydata.png"],
          "description": "A box at the top show the key facts about the program.",
        },
        {
          "id": "li2it3",
          "title": "Tips",
          "author": ["Max Mustermann"],
          "category": ["Visibility of System Status"],
          "severity": 1,
          "images": ["images/tipps.png"],
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
          "images": ["images/studies.png"],
          "description": "A practical alternative to a long list.",
        },
        {
          "id": "li3it2",
          "title": "The Homepage of TU Graz",
          "author": ["Mario Rossi"],
          "category": ["Flexibility and Efficiency of Use"],
          "severity": 3,
          "images": ["images/tugraz.png"],
          "description": "TU Graz is one of four universities in Austria's second largest city.",
        },
        {
          "id": "li3it3",
          "title": "Large White Space to the Left",
          "author": ["Mario Rossi"],
          "category": ["Visibility of System Status"],
          "severity": 2,
          "images": ["images/faculty.png"],
          "description": "To the right, institutes are listed.",
        },
        {
          "id": "li3it4",
          "title": "Custom Footer with the Logo",
          "author": ["Mario Rossi"],
          "category": ["Aesthetic and Minimalist Design"],
          "severity": 3,
          "images": ["images/footer.png"],
          "description": "The logo is integrated into the background image in an unusual colour.",
        },
        {
          "id": "li3it5",
          "title": "Last Item of the whole Example",
          "author": ["Mario Rossi"],
          "category": ["Error Prevention"],
          "severity": 0,
          "images": ["images/studies.png"],
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
    <option value="4">Very High</option>
    <option value="3">High</option>
    <option value="2">Medium</option>
    <option value="1">Low</option>
    <option value="0">Very Low</option>
  </select>
</div>
`

const item_template = `
<summary {{#mergedinto}}title="Merged into {{title}}"{{/mergedinto}}>
  <span data-edit="title" contenteditable='plaintext-only'>{{title}}</span>
<img class='thumbnail' src='{{images.0}}'/>
</summary>

<section>

{{#author.length}}
  <div>
    <label>Author</label>
    <span class="selectedit" data-name="author" data-values="{{author}}" data-mode="multiple" data-options='["John Doe","Max Mustermann","Mario Rossi"]'>
    {{#author}}<span class='enum'>{{.}}</span>{{/author}}
    </span>
  </div>
{{/author.length}}
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

{{#images.length}}
<div>
    <label>Images</label>
  <div class="imageedit">
    {{#images}}
      <img class='thumbnail' src='{{.}}'/>
    {{/images}}
  </div>
</div>
{{/images.length}}

{{#severity}}
<div>
  <label>Severity</label>
  <span class="severity severity-{{.}} selectedit" data-name="severity" data-values="{{.}}" data-mode="class" data-class="severity-" data-options='{"0": "Very Low", "1": "Low", "2": "Medium", "3": "High", "4": "Very High"}'>
</div>
{{/severity}}

{{#description}}
<div>
  <label>Description</label>
    <div data-edit="description" contenteditable>{{.}}</div>
</div>
{{/description}}

{{#mergedinto}}
<hr/>
<label>Merged into</label>
<a href="#{{mergedinto.id}}">{{mergedinto.title}}</a>
{{/mergedinto}}

{{#mergedfrom.length}}
<hr/>
<label>Merged from</label>
{{#mergedfrom}}
  <span class="enum"><a href="#{{id}}">{{parent}}: {{title}}</a></span>
{{/mergedfrom}} 
{{/mergedfrom.length}}

</div>
</section>
`;

const dialog_template = `
<h3>{{title}}</h3>

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
      <img class='thumbnail' src='{{.}}'/>
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
{{#mergedfrom}}<span class="enum">{{title}} ({{parent}})</span>{{/mergedfrom}} 
{{/mergedfrom.length}}
</div>
`;

const merge_template = `
<h2>{{action}}</h2>

<div class='formgroup'>
  <label>Title</label>
  <input name='title' value="{{title}}">
</div>

<div class='formgroup'>
  <label>Description</label>
  <textarea name='description'>{{description}}</textarea>
</div>
${severity_template}
`;

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

function image_edit(editContainer) {
  let active = editContainer.dataset.active == "true";
  editContainer.dataset.active = !active;

  // Focus on the box and remove selections
  editContainer.tabIndex = 0;
  editContainer.focus();
  window.getSelection().empty();

  let draggedImage = null;

  editContainer.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("thumbnail")) {
      draggedImage = e.target;
      e.target.classList.add("dragging");
    }
  });
  
  editContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    const image = e.target.closest(".thumbnail");

    if (image && image !== draggedImage) {
      const rect = image.getBoundingClientRect();
      const next = (e.clientX > rect.left + rect.width / 2) ? image.nextElementSibling : image;
      editContainer.insertBefore(draggedImage, next);
    }
  });
  
  editContainer.addEventListener('dragend', (e) => {
    if (e.target.classList.contains("thumbnail")) {
      e.target.classList.remove("dragging");

      const element = editContainer.closest(".element");

      if (!element) {
        return;
      }

      const id = element.id;
      const order = Array.from(editContainer.children).map(img => img.src);

      // alternative: saving when finishing image editing?
      listmerger.edit(id, "images", order)
    }
  });
}

function init_select_edit() {
  const parent = document.getElementById("listmerger");

  parent.addEventListener("dblclick", (e) => {
    const selectTarget = e.target.closest(".selectedit");
    const imageTarget = e.target.parentNode.querySelector(":scope > .imageedit");

    if (!selectTarget && !imageTarget) {
      return;
    }

    if (imageTarget) {
      image_edit(imageTarget);
      return;
    }

    const innerText = selectTarget.innerHTML;
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

    select.addEventListener("blur", () => {

      if (select.closest("dialog")) {
        return;
      }

      select.remove();
      selectTarget.innerHTML = innerText;
    });
  });

  parent.addEventListener("click", (e) => {
    if (e.target.closest(".imageedit") && e.target.closest(".imageedit").dataset.active == "true" && e.target.tagName == "IMG") {
      if (e.target.classList.contains("imageedit-inactive")) {
        e.target.classList.remove("imageedit-inactive");
      } else {
        e.target.classList.add("imageedit-inactive");
      }
    }
  });
}

init_select_edit();

document.getElementById("save-console").addEventListener("click", save_console);
document.getElementById("save-json").addEventListener("click", save_json);

listmerger.init("listmerger", "undo", "redo", items, item_template, dialog_template, merge_template);

// Image thumbnail previews
document.addEventListener("click", (e) => {
  if (e.target.tagName == "IMG" && e.target.classList.contains("thumbnail") && !e.target.closest(".imageedit[data-active='true']")) {
    const dialog = document.createElement("dialog");
    document.getElementById("listmerger").append(dialog);

    const image = document.createElement("img");
    image.src = e.target.src;
    image.classList.add("thumbnail-full")

    dialog.append(image);
    dialog.showModal();

    dialog.addEventListener("close", (e) => {
      dialog.remove();
    });
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.close();
      }
    });
  }
});
