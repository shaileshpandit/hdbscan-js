import { SingleLinkage } from ".";
import { bfsFromClusterTree, recurseLeafDFS } from "./traversals";
import { epsilonSearch } from "./epsilonSearch";
import { StabilityDict } from "./types";

export function selectClustersUsingEOM(
    clusterTree: SingleLinkage,
    stability: StabilityDict,
    nodeList: Array<number>,
    isCluster: Map<number, boolean>,
    clusterSelectionEpsilon = 0,
    allowSingleCluster = false,
    maxClusterSize = 0
) {
    const clusterSizes = new Map<number, number>();
    clusterTree.forEach(t => clusterSizes.set(t.child, t.size));

    for (const node of nodeList) {
        const childSelection = clusterTree
            .filter(c => c.parent === node)
            .map(c => c.child);
        const subtreeStability = childSelection
            .map(cs => stability.get(cs) || 0)
            .reduce((r, n) => r + n, 0);
        if (subtreeStability > (stability.get(node) || 0) || (clusterSizes.get(node) || 0) > maxClusterSize) {
            isCluster.set(node, false);
            stability.set(node, subtreeStability);
        } else {
            for (const subNode of bfsFromClusterTree(clusterTree, node)) {
                if (subNode !== node) {
                    isCluster.set(subNode, false);
                }
            }
        }
    }

    if (clusterSelectionEpsilon !== 0 && clusterTree.length > 0) {
        const eomClusters: Set<number> = new Set();
        for (const [c, cIsCluster] of isCluster) {
            cIsCluster && eomClusters.add(c);
        }
        let selectedClusters: Set<number> = new Set();
        // first check if eomClusters only has root node, which skips epsilon check.
        const root = Math.min(...clusterTree.map(c => c.parent));
        if (eomClusters.size == 1 && [...eomClusters.keys()][0] == root) {
            if (allowSingleCluster) {
                selectedClusters = eomClusters
            }
        } else {
            selectedClusters = epsilonSearch(eomClusters, clusterTree, clusterSelectionEpsilon, allowSingleCluster);
        }

        for (const [c] of isCluster) {
            isCluster.set(c, selectedClusters.has(c));
        }
    }
}

export function getClusterTreeLeaves(clusterTree: SingleLinkage) {
    if (clusterTree.length == 0) {
        return [];
    }
    const root = Math.min(...clusterTree.map(c => c.parent));
    return recurseLeafDFS(clusterTree, root);
}

export function selectClustersUsingLEAF(
    clusterTree: SingleLinkage,
    isCluster: Map<number, boolean>,
    clusterSelectionEpsilon = 0,
    allowSingleCluster = false
) {
    const leaves = new Set(getClusterTreeLeaves(clusterTree));
    if (leaves.size == 0) {
        for (const [c] of isCluster) {
            isCluster.set(c, false);
        }
        const minParent = Math.min(...clusterTree.map(t => t.parent));
        isCluster.set(minParent, true);
    }

    let selectedClusters: Set<number>;
    if (clusterSelectionEpsilon !== 0) {
        selectedClusters = epsilonSearch(leaves, clusterTree, clusterSelectionEpsilon, allowSingleCluster);
    } else {
        selectedClusters = leaves;
    }

    for (const [c] of isCluster) {
        isCluster.set(c, selectedClusters.has(c));
    }
}