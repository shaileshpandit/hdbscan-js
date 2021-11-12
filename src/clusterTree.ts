import { HierarchyNode, SingleLinkage } from "./types";

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

export function condenseTree(
    hierarchy: SingleLinkage,
    minClusterSize: number
) {
    const root = 2 * hierarchy.length;
    const numPoints = Math.floor(root / 2) + 1;
    var nextLabel = numPoints + 1

    var lambdaValue: number;
    var leftCount: number;
    var rightCount: number;

    var relabel = new Array<number>(root + 1).fill(0);
    relabel[root] = numPoints;
    var resultList: SingleLinkage = [];

    const nodeList = bfsFromHierarchy(hierarchy, root);
    console.log("bfs: ", nodeList.length, nodeList);

    const ignore: boolean[] = new Array(nodeList.length).fill(false);
    for (const node of nodeList) {
        if (ignore[node] || node < numPoints) {
            continue;
        }

        const children = hierarchy[node - numPoints];
        const left = children.parent;
        const right = children.child;
        if (children.lambda > 0.0) {
            lambdaValue = 1.0 / children.lambda;
        } else {
            lambdaValue = Infinity;
        }

        if (left >= numPoints) {
            leftCount = hierarchy[left - numPoints].size;
        } else {
            leftCount = 1;
        }

        if (right >= numPoints) {
            rightCount = hierarchy[right - numPoints].size;
        } else {
            rightCount = 1;
        }

        if (leftCount >= minClusterSize && rightCount >= minClusterSize) {
            relabel[left] = nextLabel;
            nextLabel += 1;
            resultList.push(new HierarchyNode(relabel[node], relabel[left], lambdaValue, leftCount));

            relabel[right] = nextLabel;
            nextLabel += 1;
            resultList.push(new HierarchyNode(relabel[node], relabel[right], lambdaValue, rightCount))
        } else if (leftCount < minClusterSize && rightCount < minClusterSize) {
            for (const subNode of bfsFromHierarchy(hierarchy, left)) {
                if (subNode < numPoints) {
                    resultList.push(new HierarchyNode(relabel[node], subNode, lambdaValue, 1));
                }
                ignore[subNode] = true;
            }

            for (const subNode of bfsFromHierarchy(hierarchy, right)) {
                if (subNode < numPoints) {
                    resultList.push(new HierarchyNode(relabel[node], subNode, lambdaValue, 1));
                }
                ignore[subNode] = true;
            }
        } else if (leftCount < minClusterSize) {
            relabel[right] = relabel[node];
            for (const subNode of bfsFromHierarchy(hierarchy, left)) {
                if (subNode < numPoints) {
                    resultList.push(new HierarchyNode(relabel[node], subNode, lambdaValue, 1));
                }
                ignore[subNode] = true;
            }
        } else {
            relabel[left] = relabel[node];
            for (const subNode of bfsFromHierarchy(hierarchy, right)) {
                if (subNode < numPoints) {
                    resultList.push(new HierarchyNode(relabel[node], subNode, lambdaValue, 1));
                }
                ignore[subNode] = true;
            }
        }
    }

    return resultList;
}