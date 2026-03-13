export declare const CssNames: {
    ITEM: string;
    ITEM_ADDED: string;
    ITEM_MERGED: string;
    ITEM_DRAGHANDLE: string;
    ITEM_DRAGGING: string;
    ITEM_DRAGGED: string;
    TAB_COMPACT: string;
    TAB_SELECTOR: string;
    MERGED_ZONE: string;
    HOVER_DROP: string;
    HOVER_DRAG: string;
};
export declare function init_responsive_tablist(id: string): void;
export declare function createDragHandle(): HTMLImageElement;
export declare function toggleDrop(e: any, dropOrigin: any): void;
export declare function getOwnPosition(id: string): number;
export declare function getPositionInList(id: string): number;
export declare function getNextDropSibling(e: DragEvent): Element;
