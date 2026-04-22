import * as listmerger from './lib/listmerger.js';


function print_results(results) {
  console.log(results);
}

const items = {
  "merged": [],
  "originlists": [
    {
      "id": "eval1",
      "name": "List 1",
      "items": [
        {
          "id": "li1it1",
          "title": "Item 1",
          "author": "Martin Rabensteiner",
          "category": "Category 1",
          "images": [
            "images/tugraz.png",
            "images/steps.png"
          ],
          "description": "This is the first item in the list."
        },
        {
          "id": "li1it2",
          "title": "Item 2",
          "author": "Martin Rabensteiner",
          "category": "Category 1",
          "images": [
            "images/studies.png"
          ],
          "description": "This is the second item in the list."
        },
        {
          "id": "li1it3",
          "title": "Item 3",
          "author": "Martin Rabensteiner",
          "category": "Category 1",
          "description": "This is the third item in the list."
        },
        {
          "id": "li1it4",
          "title": "Item 4",
          "author": "Martin Rabensteiner",
          "category": "Category 1",
          "description": "This is the fourth item in the list."
        },
        {
          "id": "li1it5",
          "title": "Item 5"
        },
        {
          "id": "li1it6",
          "title": "Item 6"
        },
        {
          "id": "li1it7",
          "title": "Item 7"
        },
        {
          "id": "li1it8",
          "title": "Item 8"
        },
        {
          "id": "li1it9",
          "title": "Item 9"
        },
        {
          "id": "li1it10",
          "title": "Item 10"
        },
        {
          "id": "li1it11",
          "title": "Item 11"
        },
        {
          "id": "li1it12",
          "title": "Item 12"
        }
      ]
    },
    {
      "id": "list2",
      "name": "List 2",
      "items": [
        {
          "id": "li2it1",
          "title": "Item 2/1"
        },
        {
          "id": "li2it2",
          "title": "Item 2/2"
        },
        {
          "id": "li2it3",
          "title": "Item 2/3"
        },
        {
          "id": "li2it4",
          "title": "Item 2/4"
        }
      ]
    },
    {
      "id": "list3",
      "name": "List 3",
      "items": [
        {
          "id": "li3it1",
          "title": "Item 3/1"
        },
        {
          "id": "li3it2",
          "title": "Item 3/2"
        },
        {
          "id": "li3it3",
          "title": "Item 3/3"
        },
        {
          "id": "li3it4",
          "title": "Item 3/4"
        }
      ]
    }
  ]
}

const item_template = `
<summary {{#mergedto}}title="Merged to {{title}}"{{/mergedto}}>

<img class='thumbnail' src='{{images.0}}'/>
<span>{{title}}</span></summary>

<section>

{{#author}}
  <div>
    <label>Author</label>
    {{.}}
  </div>
{{/author}}
{{#category}}
  <div>
    <label>Category</label>
    {{.}}
  </div>
{{/category}}
<div>
  {{#images.length}}
    <label>Images</label>
  {{#images}}
    <img class='thumbnail' src='{{.}}'/>
  {{/images}}
  {{/images.length}}
</div>
{{#description}}
  <label>Description</label>
    {{.}}
{{/description}}
<div>

{{#mergedto}}
<hr/>
Merged to: <a href="#{{mergedto.id}}">{{mergedto.title}}</a>
{{/mergedto}}

{{#mergedfrom.length}}
<hr/>
Merged from: 
{{#mergedfrom}}<a href="#{{id}}">{{title}} ({{parent}})</a> {{/mergedfrom}} 
{{/mergedfrom.length}}

</div>
</section>
`;

const dialog_template = `
<h1>{{title}}</h1>
{{#author}}
  <div>Author: {{.}}</div>
{{/author}}
{{#category}}
  <div>Category: {{.}}</div>
{{/category}}
<div>
  {{#images}}
    <img class='thumbnail' src='{{.}}'/>
  {{/images}}
</div>
<div>{{description}}</div>
<div>
Merged with:
{{#merged}}{{.}}{{/merged}}
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

document.getElementById("save-console").addEventListener("click", save_console);
document.getElementById("save-json").addEventListener("click", save_json);

listmerger.init("listmerger", "undo", "redo", items, item_template, dialog_template, merge_template);