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

export type StabilityDict = Map<number, number>;

export interface HdbscanInput {
    input: Array<Array<number>>;
    minClusterSize?: number;
    minSamples?: number;
    alpha?: number;
    metric?: MetricFunction;
    debug?: boolean;
}

export class DebugInfo {
    public coreDistances?: Array<number>;
    public mst?: MST;
    public sortedMst?: MST;
    public mstBinaryTree?: TreeNode<number>;
    public singleLinkage?: SingleLinkage;
    public bfsNodes?: Array<number>;
    public condensedTree?: SingleLinkage;
    public clusterNodes?: Array<number>;
    public clusterNodesMap?: Map<number, number>;
    public revClusterNodesMap?: Map<number, number>;
    public clusterTree?: SingleLinkage;
    public labeledInputs?: Array<number>;
    public clusters?: Array<Array<number>>;
    public noise?: Array<number>;

    constructor() {

    }
}

export class TreeNode<T> {
    public left?: TreeNode<T>;
    public right?: TreeNode<T>;
    public data: T;
    public parent?: TreeNode<T>;

    constructor(data: T) {
        this.data = data;
    }

    public getAncestor(): TreeNode<T> {
        if (!this.parent) {
            return this;
        }
        return this.parent.getAncestor();
    }
}