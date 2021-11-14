import { MST, TreeNode } from "./types";

export function sortMst(mst: MST) {
    return mst.sort((a, b) => a.lambda - b.lambda);
}

export function mstToBinaryTree(mst: MST) {
    const nodes: Array<TreeNode<number>> = [...new Array(mst.length + 1).keys()]
        .map(i => new TreeNode(i));
    var root: TreeNode<number> = nodes[0];
    sortMst(mst).forEach((val) => {
        const left = nodes[val.parent].getAncestor();
        const right = nodes[val.child].getAncestor();
        const node = new TreeNode(val.lambda);
        node.left = left;
        node.right = right;

        left.parent = right.parent = root = node;
    });

    return root;
}