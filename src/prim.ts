import { MetricFunction, HierarchyNode, MST } from "./types";

export function buildMstUsingPrim(
    input: Array<Array<number>>,
    alpha: number,
    metric: MetricFunction,
    coreDistances: Array<number>
) {
    const numPoints = input.length;
    const inTree: Array<number> = [];
    const result: MST = [];
    const currentDistances: Array<number> = new Array(numPoints).fill(Infinity);
    var currentNode = 0
    var currentNodeCoreDistance = Infinity
    var newNode = Infinity
    var newDistance = Infinity
    var rightValue = Infinity
    var leftValue = Infinity

    for (var i = 1; i < numPoints; i++) {
        inTree[currentNode] = 1
        currentNodeCoreDistance = coreDistances[currentNode]
        newDistance = Infinity
        newNode = 0

        for (var j = 0; j < numPoints; j++) {
            if (inTree[j]) { continue; }

            rightValue = currentDistances[j];
            leftValue = metric(input[currentNode], input[j]);

            if (alpha != 1.0) {
                leftValue /= alpha;
            }

            const coreValue = coreDistances[j]
            if (currentNodeCoreDistance > rightValue ||
                coreValue > rightValue ||
                leftValue > rightValue) {

                if (rightValue < newDistance) {
                    newDistance = rightValue
                    newNode = j
                }
                continue;
            }

            if (coreValue > currentNodeCoreDistance) {
                if (coreValue > leftValue) {
                    leftValue = coreValue
                }
            } else if (currentNodeCoreDistance > leftValue) {
                leftValue = currentNodeCoreDistance
            }

            if (leftValue < rightValue) {
                currentDistances[j] = leftValue
                if (leftValue < newDistance) {
                    newDistance = leftValue
                    newNode = j
                }
            } else if (rightValue < newDistance) {
                newDistance = rightValue
                newNode = j
            }
        }

        result[i - 1] = new HierarchyNode(currentNode, newNode, newDistance, 0);
        currentNode = newNode
    }

    return result;
}
