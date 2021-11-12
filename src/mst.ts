import { MST } from "./types";

export function sortMst(mst: MST) {
    return mst.sort((a, b) => a.lambda - b.lambda);
}