
class Node {
    constructor(value, parent = null, left = null, right = null) {
        this.value  = value;
        this.left   = left;
        this.right  = right;
        this.parent = parent;
        this.height = 0;
        this.level  = 0;

        this.extras = {
            initialized: false,
            entered: false
        };
    }
}


export default class BST {
    static *push(node, value, parent = null, level = 0) {
        if (!node) {
            yield ({ info: "", highlightedNode: null });
            return new Node(value, parent);
        }

        if (value > node.value) {
            yield({
                highlightedNode: node,
                info: `Insertando ${value} | ${value} es mayor que ${node.value} va a la derecha!`
            });

            node.right = yield *BST.push(node.right, value, node, level + 1);
        } else if (value < node.value) {
            yield({
                highlightedNode: node,
                info: `Insertando ${value} | ${value} es menor que ${node.value} va a la izquierda!`
            });

            node.left = yield *BST.push(node.left, value, node, level + 1);
        } else {
            yield({
                highlightedNode: null,
                info: ""
            });
        }

        node.height = Math.max(BST.height(node.left), BST.height(node.right)) + 1;
        node.level  = level;

        return node;
    }

    static height(node) {
        if (!node) return 0;
        return node.height;
    }

    static breadthFirstTraverse(node, callback) {
        if (!node) return;
        const deque = [];

        deque.push(node);

        while (deque.length) {
            const current = deque.shift();
            callback(current);
            if (current.left) deque.push(current.left);
            if (current.right) deque.push(current.right);
        }
    }
    static preOrderTraversal(node, array = []) {
        if (node) {
            array.push(node.value);
            BST.preOrderTraversal(node.left, array);
            BST.preOrderTraversal(node.right, array);
        }
        return array;
    }
    
    static inOrderTraversal(node, array = []) {
        if (node) {
            BST.inOrderTraversal(node.left, array);
            array.push(node.value);
            BST.inOrderTraversal(node.right, array);
        }
        return array;
    }
    
    static postOrderTraversal(node, array = []) {
        if (node) {
            BST.postOrderTraversal(node.left, array);
            BST.postOrderTraversal(node.right, array);
            array.push(node.value);
        }
        return array;
    }
    
    
}

