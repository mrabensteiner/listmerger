import { init } from './lib/listmerger.js';


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

{{#mergedto}}
Merged to: <a href="#{{mergedto.id}}">{{mergedto.title}}</a>
{{/mergedto}}

{{#mergedfrom.length}}
Merged from: 
{{#mergedfrom}}<a href="#{{id}}">{{title}}</a> {{/mergedfrom}} 
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
<h2>Merge</h2>

<div class='formgroup'>
  <label>Title</label>
  <input name='title'>
</div>

<div class='formgroup'>
  <label>Description</label>
  <textarea name='description'>{{description}}</textarea>
</div>
`;


init("listmerger", "undo", "redo", print_results, items, item_template, dialog_template, merge_template);