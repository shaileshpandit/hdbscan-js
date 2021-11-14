import { sortMst } from "./mst";
import { HierarchyNode, MST, SingleLinkage } from "./types";
import { UnionFind } from "./unionFind";

function createSingleLinkage(
    sortedMst: MST
) {
    const result: SingleLinkage = new Array<HierarchyNode>(sortedMst.length);
    var forest = new UnionFind(sortedMst.length + 1);
    for (var i = 0; i < sortedMst.length; ++i) {
        const parent = sortedMst[i].parent;
        const child = sortedMst[i].child;
        const weight = sortedMst[i].lambda;
        const parentF = forest.fastFind(parent);
        const childF = forest.fastFind(child);
        const sizeF = forest.sizeOf(parentF) + forest.sizeOf(childF);
        result[i] = new HierarchyNode(parentF, childF, weight, sizeF);
        forest.union(parentF, childF);
    }

    return result;
}

export function buildSingleLinkage(
    mst: MST,
    sorted: boolean = false
) {
    var sortedMst = mst;
    if(!sorted) {
        sortedMst = sortMst(mst);
    }

    const singleLinkage = createSingleLinkage(sortedMst);

    return {sortedMst, singleLinkage};
}