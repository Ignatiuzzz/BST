import { BST, Node } from "./bst";
import { sleep } from "./utils";

export default function initHtml(visualizer) {
    const $insert = document.querySelector("#insert"),
        $delay = document.querySelector("#delay"),
        $random = document.querySelector("#random"),
        $help = document.querySelector("#help"),
        $downloadLink = document.querySelector("#download-link");
    const $preorder = document.querySelector("#preorder");
    const $inorder = document.querySelector("#inorder");
    const $postorder = document.querySelector("#postorder");
    const $visualizePre = document.querySelector("#visualize-pre");
    const $visualizePost = document.querySelector("#visualize-post");

    $delay.value = visualizer.delay;

    const resize = () => {
        const { dimensions, canvas } = visualizer;
        dimensions.width = window.innerWidth;
        dimensions.height = window.innerHeight;

        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
    };

    window.addEventListener("resize", resize);
    resize();

    canvas.addEventListener("mousedown", ({ clientX, clientY }) => {
        const { mouse, camera, canvas } = visualizer;

        mouse.downPos.x = clientX;
        mouse.downPos.y = clientY;

        mouse.oldCamera.x = camera.x;
        mouse.oldCamera.y = camera.y;

        mouse.isDown = true;
        canvas.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", () => {
        const { mouse, canvas } = visualizer;
        mouse.isDown = false;
        canvas.style.cursor = "grab";
    });

    window.addEventListener('keydown', ({ key }) => {
        const { camera } = visualizer;
        switch (key) {
            case "ArrowUp": // Up
                camera.zoom += 0.05;
                break;
            case "ArrowDown": // Down
                camera.zoom = Math.max(camera.zoom - 0.05, 0);
                break;
        }
    });

    window.addEventListener("mousemove", ({ clientX, clientY }) => {
        const { mouse, tree, camera } = visualizer;

        if (mouse.isDown && tree) {
            const newX = (clientX - mouse.downPos.x) + mouse.oldCamera.x,
                newY = (clientY - mouse.downPos.y) + mouse.oldCamera.y;

            camera.x = newX;
            camera.y = newY;
        }
    });

    async function insertNode(visualizer, value) {
        const gen = BST.push(visualizer.tree, value);

        let data = gen.next();
        while (!data.done) {
            const { highlightedNode, info } = data.value;
            visualizer.highlightedNode = highlightedNode;
            visualizer.info = info;
            if (visualizer.highlightedNode)
                await sleep(visualizer.delay);
            data = gen.next();
        }

        return data.value;
    }

    document.querySelector("#insert-button").addEventListener("click", () => {
        const { value } = $insert;
        if (visualizer.inserting) return;
        if (!value.length || Number.isNaN(+value)) return;

        visualizer.inserting = true;
        insertNode(visualizer, +value)
            .then((tree) => {
                visualizer.tree = tree;
                visualizer.inserting = false;
            })
            .catch(console.log);
        $insert.value = "";
    });

    document.querySelector("#delay-button").addEventListener("click", () => {
        const { value } = $delay;
        if (!value.length || Number.isNaN(+value)) return;

        visualizer.delay = +value;
    });

    $random.addEventListener("click", async () => {
        if (visualizer.inserting) return;
        visualizer.inserting = true;

        insertNode(visualizer, Math.floor(Math.random() * 1000))
            .then((tree) => {
                visualizer.tree = tree;
                visualizer.inserting = false;
            })
            .catch(console.log);
    });

    document.querySelector("#close-help").addEventListener("click", () => {
        $help.style.display = "none";
    });

    document.querySelector("#open-help").addEventListener("click", () => {
        $help.style.display = "block";
    });

    document.querySelector("#download").addEventListener("click", () => {
        if (!visualizer.tree) return;
        const { camera, radius, padding, dimensions, canvas } = visualizer;

        const zoom = camera.zoom;
        const oldCam = { x: camera.x, y: camera.y };
        const spacing = (radius + padding) * 2;
        camera.zoom = 1;
        camera.x = -camera.bounds.minX - dimensions.width / 2 + spacing / 2;
        camera.y = -camera.bounds.minY - dimensions.height / 2 + spacing / 2;
        canvas.width = camera.bounds.maxX - camera.bounds.minX + spacing;
        canvas.height = camera.bounds.maxY - camera.bounds.minY + spacing;

        setTimeout(() => {
            const data = canvas.toDataURL("image/png");
            let filename = prompt("Introduzca el nombre del archivo de imagen:", `bst_${Date.now()}`);
            if (filename) {
                if (!filename.endsWith('.png')) {
                    filename += '.png'; // Ensure the filename has .png extension
                }
                $downloadLink.href = data;
                $downloadLink.download = filename;
                $downloadLink.click();
            }
            camera.zoom = zoom;
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            camera.x = oldCam.x;
            camera.y = oldCam.y;
        }, 100);
    });

    function downloadTextFile(text, filename) {
        const element = document.createElement('a');
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    }

    document.querySelector("#download-txt").addEventListener("click", () => {
        if (!visualizer.tree) return;
        const preOrderArray = BST.preOrderTraversal(visualizer.tree);
        const inOrderArray = BST.inOrderTraversal(visualizer.tree);
        const postOrderArray = BST.postOrderTraversal(visualizer.tree);

        const textContent = `Preorder: ${preOrderArray.join(", ")}\nInorder: ${inOrderArray.join(", ")}\nPostorder: ${postOrderArray.join(", ")}`;

        let filename = prompt("Introduzca el nombre del archivo:", `bst_arrays_${Date.now()}.txt`);
        if (filename) {
            if (!filename.endsWith('.txt')) {
                filename += '.txt'; // Ensure the filename has .txt extension
            }
            downloadTextFile(textContent, filename);
        }
    });

    document.querySelector("#show-preorder").addEventListener("click", () => {
        if (!visualizer.tree) return;
        const preOrderArray = BST.preOrderTraversal(visualizer.tree);
        alert("Preorder: " + preOrderArray.join(", "));
    });

    document.querySelector("#show-inorder").addEventListener("click", () => {
        if (!visualizer.tree) return;
        const inOrderArray = BST.inOrderTraversal(visualizer.tree);
        alert("Inorder: " + inOrderArray.join(", "));
    });

    document.querySelector("#show-postorder").addEventListener("click", () => {
        if (!visualizer.tree) return;
        const postOrderArray = BST.postOrderTraversal(visualizer.tree);
        alert("Postorder: " + postOrderArray.join(", "));
    });

    document.querySelector("#clear-all").addEventListener("click", () => {
        window.location.reload();
    });

    document.querySelector("#upload-btn").addEventListener("click", () => {
        document.querySelector("#upload").click(); // Triggers hidden file input
    });

    document.querySelector("#upload").addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error("No file uploaded.");
            alert("Error: No file uploaded.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            const lines = content.trim().split('\n');
            if (lines.length < 2) {
                console.error("Error de formato: Se esperaban dos líneas para preorder e inorder.");
                alert("Error de formato: Se esperaban dos líneas para preorder e inorder.");
                return;
            }
            const preorder = lines[0].split(':')[1].trim().split(',').map(Number);
            const inorder = lines[1].split(':')[1].trim().split(',').map(Number);

            console.log("Preorder Array:", preorder);
            console.log("Inorder Array:", inorder);

            if (preorder.some(isNaN) || inorder.some(isNaN)) {
                console.error("Parsing error: Arrays contain invalid numbers.");
                alert("Parsing error: Arrays contain invalid numbers.");
            }

            const preorderSet = new Set(preorder);
            const inorderSet = new Set(inorder);

            if (preorderSet.size !== inorderSet.size || [...preorderSet].some(item => !inorderSet.has(item))) {
                console.error("Mismatch error: Arrays contain different elements.");
                alert("Error: hay un elemento incorrecto en inorder o preorder");
                return;
            }

            const tree = rebuildTree(preorder, inorder, "preorder");
            if (!tree) {
                console.error("Tree reconstruction failed: Preorder and Inorder sequences are incorrect.");
                alert("Fallo en la reconstrucción del árbol: Las secuencias Preorder e Inorder son incorrectas.");
                return;
            }

            visualizer.tree = tree;
            visualizer.updateNode(visualizer.tree);
            visualizer.renderNode(visualizer.tree);
            console.log("El árbol debe ser actualizado y renderizado.");
        };
        reader.readAsText(file);
    });

    $visualizePre.addEventListener("click", () => {
        const preorder = $preorder.value.trim().split(',').map(Number);
        const inorder = $inorder.value.trim().split(',').map(Number);

        if (preorder.length > 0 && inorder.length > 0) {
            const tree = validateAndBuildTree(preorder, inorder, "preorder");
            if (tree) {
                visualizer.tree = tree;
                visualizer.updateNode(visualizer.tree);
                visualizer.renderNode(visualizer.tree);
            }
        } else {
            alert("Por favor, proporcione secuencias válidas de prepedido y pedido.");
        }
    });

    $visualizePost.addEventListener("click", () => {
        const postorder = $postorder.value.trim().split(',').map(Number);
        const inorder = $inorder.value.trim().split(',').map(Number);

        if (postorder.length > 0 && inorder.length > 0) {
            const tree = validateAndBuildTree(postorder, inorder, "postorder");
            if (tree) {
                visualizer.tree = tree;
                visualizer.updateNode(visualizer.tree);
                visualizer.renderNode(visualizer.tree);
            }
        } else {
            alert("Por favor, proporcione secuencias válidas de postpedido y pedido.");
        }
    });

    function validateAndBuildTree(order1, inorder, type) {
        if (order1.length !== inorder.length) {
            alert("Las secuencias proporcionadas deben tener la misma longitud.");
            return null;
        }

        const orderSet = new Set(order1);
        const inorderSet = new Set(inorder);

        if (orderSet.size !== inorderSet.size || [...orderSet].some(item => !inorderSet.has(item))) {
            alert("Las secuencias proporcionadas deben contener los mismos elementos.");
            return null;
        }

        return rebuildTree(order1, inorder, type);
    }

    function rebuildTree(order, inorder, type) {
        let index = type === "preorder" ? 0 : order.length - 1;
        const map = new Map();
        inorder.forEach((value, idx) => map.set(value, idx));

        function arrayToTree(start, end) {
            if (start > end) {
                return null;
            }

            const rootValue = order[index];
            index = type === "preorder" ? index + 1 : index - 1;
            if (!map.has(rootValue)) {
                alert(`Error de reconstrucción del árbol: Elemento '${rootValue}' no se encuentra en la matriz Inorder.`);
                return null;
            }
            const root = new Node(rootValue);
            const inorderIndex = map.get(rootValue);

            if (type === "preorder") {
                root.left = arrayToTree(start, inorderIndex - 1);
                root.right = arrayToTree(inorderIndex + 1, end);
            } else if (type === "postorder") {
                root.right = arrayToTree(inorderIndex + 1, end);
                root.left = arrayToTree(start, inorderIndex - 1);
            }

            return root;
        }
        return arrayToTree(0, inorder.length - 1);
    }
}
