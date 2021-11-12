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

export function computeStabilities(
    condensedTree: SingleLinkage
) {
    var largestChild = Math.max(...condensedTree.map(c => c.child));
    const smallestCluster = Math.min(...condensedTree.map(c => c.parent));
    const largestCluster = Math.max(...condensedTree.map(c => c.parent));
    const numClusters = largestCluster - smallestCluster + 1;

    if (largestChild < smallestCluster) {
        largestChild = smallestCluster;
    }

    // console.log('computeStability: ', largestChild, smallestCluster, numClusters);

    const sortedChildData = condensedTree
        .map(c => [c.child, c.lambda])
        .sort((a, b) => a[0] - b[0]);
    const births = new Array(largestChild + 1).fill(NaN);
    const sortedChildren = sortedChildData.map(s => s[0]);
    const sortedLambdas = sortedChildData.map(s => s[1]);

    const parents = condensedTree.map(c => c.parent);
    const sizes = condensedTree.map(c => c.size);
    const lambdas = condensedTree.map(c => c.lambda);

    // console.log('computeStability: ', births, sortedChildren, sortedLambdas, parents, sizes, lambdas);

    var currentChild = -1
    var minLambda = 0

    for (var row = 0; row < sortedChildData.length; row++) {
        const child = sortedChildren[row];
        const lambda = sortedLambdas[row];

        if (child == currentChild) {
            minLambda = Math.min(minLambda, lambda);
        } else if (currentChild != -1) {
            births[currentChild] = minLambda;
            currentChild = child;
            minLambda = lambda;
        } else {
            currentChild = child;
            minLambda = lambda;
        }
    }

    if (currentChild != -1) {
        births[currentChild] = minLambda
    }
    births[smallestCluster] = 0.0

    const resultArr: Array<number> = new Array(numClusters).fill(0);

    for (var i = 0; i < condensedTree.length; i++) {
        const parent = parents[i];
        const lambda = lambdas[i];
        const childSize = sizes[i];
        const resultIndex = parent - smallestCluster;

        resultArr[resultIndex] += (lambda - births[parent]) * childSize;
    }

    // console.log('resultArr: ', resultArr);

    var resultDict: Map<number, number> = new Map();
    for (var i = 0; i < resultArr.length; i++) {
        resultDict.set(smallestCluster + i, resultArr[i]);
    }
    // console.log('resultDict: ', resultDict);

    return resultDict;
}