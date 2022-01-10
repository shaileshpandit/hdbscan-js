import { SingleLinkage } from ".";

export function bfsFromHierarchy(
    hierarchy: SingleLinkage,
    root: number
) {
    const dim = hierarchy.length;
    const maxNode = 2 * dim;
    const numPoints = maxNode - dim + 1;
    var toProcess = [root]
    let result: number[] = [];

    while (toProcess.length) {
        result = result.concat(toProcess);
        toProcess = toProcess
            .filter(x => x >= numPoints)
            .map(x => x - numPoints)
        if (toProcess.length) {
            toProcess = toProcess.map(t => [hierarchy[t].parent, hierarchy[t].child]).flat();
        }
    }

    return result;
}

export function bfsFromClusterTree(tree: SingleLinkage, bfsRoot: number) {
    var toProcess = [bfsRoot];
    let result: Array<number> = [];

    while (toProcess.length) {
        result = result.concat(toProcess);
        toProcess = tree
            .filter(t => toProcess.indexOf(t.parent) !== -1)
            .map(t => t.child);
    }

    return result;
}

export function recurseLeafDFS(clusterTree: SingleLinkage, currentNode: number) {
    const children = clusterTree
        .filter(c => c.parent === currentNode)
        .map(c => c.child);
    if (children.length === 0) {
        return [currentNode];
    } else {
        const result = new Array<number>();
        for (const child of children) {
            result.push(...recurseLeafDFS(clusterTree, child));
        }
        return result;
    }
}

export function traverseUpwards(
    clusterTree: SingleLinkage,
    clusterSelectionEpsilon: number,
    leaf: number,
    allowSingleCluster: boolean
): number {
    const root = Math.min(...clusterTree.map(c => c.parent));
    const childMatch = clusterTree.find(t => t.child === leaf);
    if (!childMatch) { throw Error('child not found in clusterTree') }
    const parent = childMatch.parent;
    if (parent == root) {
        if (allowSingleCluster) {
            return parent;
        } else {
            return leaf;
        }
    }

    const parentMatch = clusterTree.find(t => t.child === parent);
    if (!parentMatch) { throw Error('parent not found in clusterTree') }
    const parentEps = 1 / parentMatch.lambda;
    if (parentEps > clusterSelectionEpsilon) {
        return parent;
    } else {
        return traverseUpwards(clusterTree, clusterSelectionEpsilon, parent, allowSingleCluster)
    }
}