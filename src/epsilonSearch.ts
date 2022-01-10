import { SingleLinkage } from ".";
import { bfsFromClusterTree, traverseUpwards } from "./traversals";

export function epsilonSearch(
    leaves: Set<number>,
    clusterTree: SingleLinkage,
    clusterSelectionEpsilon: number,
    allowSingleCluster: boolean
): Set<number> {

    const selectedClusters = new Set<number>();
    const processed = new Set<number>();

    for (const leaf of leaves) {
        const childMatch = clusterTree.find(t => t.child === leaf);
        if (!childMatch) { throw Error('child not found in clusterTree') }
        const eps = 1 / childMatch.lambda;
        if (eps < clusterSelectionEpsilon) {
            if (!processed.has(leaf)) {
                const epsilonChild = traverseUpwards(clusterTree, clusterSelectionEpsilon, leaf, allowSingleCluster);
                selectedClusters.add(epsilonChild);

                const bfsFromSubtree = bfsFromClusterTree(clusterTree, epsilonChild);
                for (const subNode of bfsFromSubtree) {
                    if (subNode != epsilonChild) {
                        processed.add(subNode);
                    }
                }
            }
        } else {
            selectedClusters.add(leaf);
        }
    }

    return selectedClusters;
}