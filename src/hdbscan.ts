import { kdTree } from "kd-tree-javascript";
import { euclidean } from "./metrics";
import { MetricFunction } from "./types";

export class Hdbscan {
    private input: Array<Array<number>>;
    private minClusterSize: number;
    private minSamples: number;
    private alpha: number;
    private metric: MetricFunction;

    private kdTree: kdTree<number[]>;
    private coreDistances: number[] = [];

    private clusters: Array<Array<number>>;
    private noise: Array<number>;

    constructor(
        input: Array<Array<number>>,
        minClusterSize: number = 5,
        minSamples: number = 5,
        alpha: number = 1.0,
        metric: MetricFunction = euclidean
    ) {
        this.input = input;
        this.minClusterSize = minClusterSize;
        this.minSamples = minSamples;
        this.alpha = alpha;
        this.metric = metric;
        
        // Transform the space - calculate mutual reachability distance(core distance)
        this.kdTree = new kdTree(this.input, this.metric, []);
        this.coreDistances = this.input.map(p => this.kdTree.nearest(p, this.minSamples)[0][1]);
        console.log("coreDistances: ", this.coreDistances);

        this.clusters = [];
        this.noise = [];
    }

    public getClusters() {
        return this.clusters;
    }

    public getNoise() {
        return this.noise;
    }
}