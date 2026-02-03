import {mergelist, mergelist_id} from './init';

function move(element_id) {
    mergelist.push(element_id);
    let element = document.getElementById(element_id);
    let mergelist_element = document.getElementById(mergelist_id);
    mergelist_element.append(element)
}

function un_move() {

}

function move_all() {

}

function un_move_all() {

}

function toggle_css_move() {

}

function toggle_css_merge() {
    
}