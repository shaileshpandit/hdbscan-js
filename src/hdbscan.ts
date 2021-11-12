import { euclidean } from "./metrics";
import { MetricFunction } from "./types";

export class Hdbscan {
    private input: Array<Array<number>>;
    private minClusterSize: number;
    private minSamples: number;
    private alpha: number;
    private metric: MetricFunction;

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