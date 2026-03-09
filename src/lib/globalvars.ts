export type DynamicFunction = (a: any) => void;

export let mergelistId;
export let callback_function = (a: any) => {};

export const PREFIX_MOVED = "moved-";
export const PREFIX_MERGED = "merged-";

export function setMergelistId(id: string) {
    mergelistId = id;
}

export function setCallbackFunction(callback: DynamicFunction) {
    callback_function = callback;
}
