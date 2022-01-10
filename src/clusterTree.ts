import { bfsFromHierarchy } from "./traversals";
import { selectClustersUsingEOM, selectClustersUsingLEAF } from "./clusterSelection";
import { HierarchyNode, SingleLinkage, StabilityDict } from "./types";
import { TreeUnionFind } from "./unionFind";

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
    var condensedTree: SingleLinkage = [];

    const bfsNodes = bfsFromHierarchy(hierarchy, root);

    const ignore: boolean[] = new Array(bfsNodes.length).fill(false);
    for (const node of bfsNodes) {
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
            condensedTree.push(new HierarchyNode(relabel[node], relabel[left], lambdaValue, leftCount));

            relabel[right] = nextLabel;
            nextLabel += 1;
            condensedTree.push(new HierarchyNode(relabel[node], relabel[right], lambdaValue, rightCount))
        } else if (leftCount < minClusterSize && rightCount < minClusterSize) {
            for (const subNode of bfsFromHierarchy(hierarchy, left)) {
                if (subNode < numPoints) {
                    condensedTree.push(new HierarchyNode(relabel[node], subNode, lambdaValue, 1));
                }
                ignore[subNode] = true;
            }

            for (const subNode of bfsFromHierarchy(hierarchy, right)) {
                if (subNode < numPoints) {
                    condensedTree.push(new HierarchyNode(relabel[node], subNode, lambdaValue, 1));
                }
                ignore[subNode] = true;
            }
        } else if (leftCount < minClusterSize) {
            relabel[right] = relabel[node];
            for (const subNode of bfsFromHierarchy(hierarchy, left)) {
                if (subNode < numPoints) {
                    condensedTree.push(new HierarchyNode(relabel[node], subNode, lambdaValue, 1));
                }
                ignore[subNode] = true;
            }
        } else {
            relabel[left] = relabel[node];
            for (const subNode of bfsFromHierarchy(hierarchy, right)) {
                if (subNode < numPoints) {
                    condensedTree.push(new HierarchyNode(relabel[node], subNode, lambdaValue, 1));
                }
                ignore[subNode] = true;
            }
        }
    }

    return { bfsNodes, condensedTree };
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

export function getClusterNodes(
    condensedTree: SingleLinkage,
    stability: StabilityDict,
    clusterSelectionEpsilon = 0.0,
    clusterSelectionMethod = "eom",
    allowSingleCluster = false,
    maxClusterSize = 0
) {
    if (allowSingleCluster) {
        throw Error('singleCluster is not supported now.');
    }

    var nodeList: Array<number>;
    if (allowSingleCluster) {
        nodeList = [...stability.keys()].sort((a, b) => b - a);
    } else {
        nodeList = [...stability.keys()].sort((a, b) => b - a).slice(0, stability.size - 1);
    }

    const clusterTree = condensedTree.filter(t => t.size > 1);
    const isCluster = new Map<number, boolean>();
    nodeList.forEach(n => isCluster.set(n, true));
    const nonClusterChilds = condensedTree
        .filter(t => t.size === 1)
        .map(t => t.child);
    const numPoints = Math.max(...nonClusterChilds) + 1;
    const maxLambda = Math.max(...condensedTree.map(t => t.lambda));

    if (maxClusterSize <= 0) {
        maxClusterSize = numPoints + 1
    }

    if (clusterSelectionMethod === "eom") {
        selectClustersUsingEOM(clusterTree, stability, nodeList, isCluster,
            clusterSelectionEpsilon, allowSingleCluster, maxClusterSize);
    } else if (clusterSelectionMethod === "leaf") {
        selectClustersUsingLEAF(clusterTree, isCluster, clusterSelectionEpsilon, allowSingleCluster);
    } else {
        throw Error('Unknown cluster selection method');
    }

    const clusterNodes = [...isCluster.entries()].filter(e => e[1]).map(e => e[0]).sort();
    const clusterNodesMap = new Map<number, number>();
    const revClusterNodesMap = new Map<number, number>();
    for (var i = 0; i < clusterNodes.length; i++) {
        clusterNodesMap.set(clusterNodes[i], i);
        revClusterNodesMap.set(i, clusterNodes[i]);
    }

    return { clusterNodes, clusterNodesMap, revClusterNodesMap, clusterTree };
}

export function labelClusters(
    condensedTree: SingleLinkage,
    clusterNodes: number[],
    clusterLabelMap: Map<number, number>,
    clusterSelectionEpsilon: number = 0.0,
    allowSingleCluster: boolean = false,
    matchReferenceImplementation: boolean = false
): Array<number> {
    if (allowSingleCluster) {
        throw Error('singleCluster is not supported now.');
    }
    if (matchReferenceImplementation) {
        throw Error('matchReferenceImplementation is not supported now.');
    }

    // parent_array = tree['parent']
    const parentArray = condensedTree.map(c => c.parent);
    const childArray = condensedTree.map(c => c.child);

    const rootCluster = Math.min(...parentArray);
    const result = new Array(rootCluster);

    const maxParent = Math.max(...parentArray);
    const unionFind = new TreeUnionFind(maxParent + 1);

    for (var n = 0; n < condensedTree.length; n++) {
        const child = childArray[n]
        const parent = parentArray[n];
        if (clusterNodes.indexOf(child) === -1) {
            unionFind.union(parent, child);
        }
    }

    for (var n = 0; n < rootCluster; n++) {
        const cluster = unionFind.find(n);
        if (cluster < rootCluster) {
            result[n] = -1
        } else if (cluster === rootCluster) {
            if (clusterNodes.length === 1 && allowSingleCluster) {
                // tree['lambda_val'][tree['child'] == n]
                const childMatch = condensedTree.find(t => t.child === n);
                if (clusterSelectionEpsilon !== 0.0) {
                    if (childMatch && childMatch.lambda >= 1 / clusterSelectionEpsilon) {
                        result[n] = clusterLabelMap.get(cluster);
                    } else {
                        result[n] = -1
                    }
                } else {
                    const parentMatches = condensedTree
                        .filter(t => t.child === cluster)
                        .map(t => t.lambda);
                    if (childMatch && parentMatches &&
                        childMatch.lambda >= Math.max(...parentMatches)) {
                        result[n] = clusterLabelMap.get(cluster);
                    } else {
                        result[n] = -1
                    }
                }
            } else {
                result[n] = -1
            }
        } else {
            if (matchReferenceImplementation) {
                const childNMatch = condensedTree.find(t => t.child === n);
                const point_lambda = childNMatch && childNMatch.lambda;
                const childClusterMatch = condensedTree.find(t => t.child === cluster);
                const cluster_lambda = childClusterMatch && childClusterMatch.lambda;
                if (point_lambda && cluster_lambda && point_lambda > cluster_lambda) {
                    result[n] = clusterLabelMap.get(cluster);
                } else {
                    result[n] = -1
                }
            } else {
                result[n] = clusterLabelMap.get(cluster);
            }
        }
    }

    return result;
}

export function getClustersAndNoise(labels: Array<number>) {
    const clusters: Array<Array<number>> = [];
    const noise: Array<number> = [];

    for (var i = 0; i < labels.length; i++) {
        const label = labels[i];
        if (label === -1) {
            noise.push(i);
        } else {
            if (!clusters[label]) {
                clusters[label] = [];
            }
            clusters[label].push(i);
        }
    }

    return { clusters, noise };
}