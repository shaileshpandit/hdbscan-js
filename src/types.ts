export type MetricFunction = (a: Array<number>, b: Array<number>) => number;

export class HierarchyNode {
    public parent: number;
    public child: number;
    public lambda: number;
    public size: number;

    constructor(parent: number, child: number, lambda: number, size: number) {
        this.parent = parent;
        this.child = child;
        this.lambda = lambda;
        this.size = size;
    }
}

export type MST = Array<HierarchyNode>;

export type SingleLinkage = Array<HierarchyNode>;

export type MSTAlgorithm = (
    input: Array<Array<number>>,
    minSamples: number,
    alpha: number,
    metric: MetricFunction
) => SingleLinkage;

export type StabilityDict = Map<number,number>;