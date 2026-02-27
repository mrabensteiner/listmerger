export declare function move(id: any, from_history?: boolean): void;
export declare function moveUndo(id: any): void;
export declare function moveAll(zonefindings: any, from_history?: boolean): any[];
export declare function moveAllUndo(moved: any): void;
export declare function merge(id1: any, id2: any, title: any, from_history?: boolean, oldmergeid?: string): string;
export declare function mergeUndo(id: any): void;
export declare function arrange(id: any, position: any, insertAfter?: boolean): void;
