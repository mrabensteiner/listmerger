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
          "title": "Item 1"
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

init("listmerger", "undo", "redo", print_results, items);