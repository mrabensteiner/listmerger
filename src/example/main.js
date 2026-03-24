import { init } from './lib/listmerger.js';


function print_results(results) {
  console.log(results);
}

const items = {
  "merged": [],
  "originlists": [
    {
      "id": "eval1",
      "name": "List 4",
      "items": [
        {
          "id": "li4it1",
          "title": "Item 1",
          "image": "images/tugraz.png",
          "description": "This is the first item in the list."
        },
        {
          "id": "li4it2",
          "title": "Item 2"
        },
        {
          "id": "li4it3",
          "title": "Item 3"
        },
        {
          "id": "li4it4",
          "title": "Item 4"
        }
      ]
    }
  ]
}

const item_template = `
<img class='thumbnail' src='{{image}}'/>
Item: {{title}}
`;

const dialog_template = `
<h1>{{title}}</h1>
<div>{{description}}</div>
`;

const merge_template = `
<h2>{{title}}</h2>

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