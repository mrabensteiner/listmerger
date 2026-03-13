import {init} from './lib/listmerger.js';


function print_results(results) {
    console.log(results);
}

init("listmerger", "undo", "redo", print_results);