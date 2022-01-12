import { computeStabilities, condenseTree, getClusterNodes, getClustersAndNoise, labelClusters } from "./clusterTree";
import kdTreePrim from "./kdTreePrim";
import { euclidean } from "./metrics";
import { DebugInfo, MetricFunction, HdbscanInput } from "./types";
import { mstToBinaryTree } from "./mst";

export class Hdbscan {
    private input: Array<Array<number>>;
    private minClusterSize: number;
    private minSamples: number;
    private alpha: number;
    private metric: MetricFunction;
    private debug: boolean;

    private debugInfo?: DebugInfo;
    private clusters: Array<Array<number>>;
    private noise: Array<number>;

    constructor({
        input,
        minClusterSize = 5,
        minSamples = 5,
        clusterSelectionEpsilon = 0.0,
        clusterSelectionMethod = "eom",
        alpha = 1.0,
        metric = euclidean,
        debug = false
    }: HdbscanInput) {
        this.input = input;
        this.minClusterSize = minClusterSize;
        this.minSamples = minSamples;
        this.alpha = alpha;
        this.metric = metric;
        this.debug = debug;

        let debugInfo;

        try {
            // Build the cluster hierarchy using kdTree and Prim
            const { coreDistances, mst, sortedMst, singleLinkage } = kdTreePrim(this.input, this.minSamples, this.alpha, this.metric);

            if (this.debug) {
                debugInfo = { coreDistances, mst, sortedMst, singleLinkage };
            }

            // Condense the cluster tree
            const { bfsNodes, condensedTree } = condenseTree(singleLinkage, this.minClusterSize);

            if (this.debug) {
                debugInfo = { ...debugInfo, bfsNodes, condensedTree }
            }

            // Compute stabilities of condensed clusters
            const stabilityDict = computeStabilities(condensedTree);

            if (this.debug) {
                debugInfo = { ...debugInfo, condensedTree }
            }

            // Extract the clusters
            const { clusterNodes, clusterNodesMap, revClusterNodesMap, clusterTree } = getClusterNodes(
                condensedTree,
                stabilityDict,
                clusterSelectionEpsilon,
                clusterSelectionMethod
            );

            if (this.debug) {
                debugInfo = { ...debugInfo, clusterNodes, clusterNodesMap, revClusterNodesMap, clusterTree };
            }

            // Label the inputs
            const labeledInputs = labelClusters(condensedTree, clusterNodes, clusterNodesMap, clusterSelectionEpsilon);

            if (this.debug) {
                debugInfo = { ...debugInfo, labeledInputs };
            }

            // Get array of clusters and noise from labels
            const { clusters, noise } = getClustersAndNoise(labeledInputs);

            if (this.debug) {
                debugInfo = { ...debugInfo, clusters, noise };
                console.debug('debugInfo: ', debugInfo);
            }

            this.debugInfo = debugInfo;
            this.clusters = clusters;
            this.noise = noise;

        } catch (e) {
            if (this.debug) {
                console.debug('debugInfo: ', debugInfo);
                console.error('Error: Hdbscan: ', e);
            }
            throw e;
        }
    }

    public getDebugInfo() {
        return this.debugInfo;
    }

    public getClusters() {
        return this.clusters;
    }

    public getNoise() {
        return this.noise;
    }
}