import { useEffect, useRef, useState } from "react"; 
import "./App.css"; 


const PATH_COLOURS = ["#c40034",  "#ffaa0d",  "#ffeb0d", "#60d40d",  "#00ab25",  "#00fff7", "#001fbd",  "#9000ff",  "#4b0085", "#fb00ff", // Red, Orange, Yellow, Light green, Dark green, Light blue, Dark blue, Violet, Magenta, Pink
                      "#f7786d", "#deb968", "#f5fc88", "#b7ff78", "#7ef295", "#85dede", "#829cfa", "#c379fc", "#925cbf", "#fd96ff", // Lighter versions
                     ]; 
const NODE_SIZE = 10; 


function App() { 
    const canvasRef = useRef(null); 
    const [canvasWidth, setCanvasWidth] = useState(null);
    const [canvasHeight, setCanvasHeight] = useState(null);
    const [baseMap, setBasemap] = useState(null);
    const [baseMapWidth, setBaseMapWidth] = useState(null);
    const [baseMapHeight, setBaseMapHeight] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false); 
    const [lastPress, setLastPress] = useState(null);
    const [mousePosition, setMousePosition] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [newNode, setNewNode] = useState(false)
    const [edges, setEdges] = useState([]);
    const [path, setPath] = useState([]);
    const [colours, setColours] = useState([]);
  
    useEffect(() => { 
        const canvas = canvasRef.current; 
        const ctx = canvas.getContext("2d"); 

        setCanvasWidth(canvas.width);
        setCanvasHeight(canvas.height);
        const handleResize = () => {
            const { clientWidth, clientHeight } = document.documentElement;
            setCanvasWidth(clientWidth * 0.98);
            setCanvasHeight(clientHeight * 0.9);
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // Clear the entire canvas before redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#000000";

        if (baseMap) {
            ctx.drawImage(baseMap, 0, 0, baseMapWidth, baseMapHeight);
        }

        // Draw the nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node[0], node[1], NODE_SIZE, 0, 2 * Math.PI);
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
          });

        // Draw a line from the last node
        if (lastPress !== null && mousePosition !== null){
            ctx.beginPath();
            ctx.moveTo(lastPress[0], lastPress[1]);
            ctx.lineTo(mousePosition[0], mousePosition[1]);
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        }

        // Draw the edges
        edges.forEach(edge => {
            ctx.beginPath();
            ctx.moveTo(edge[0][0], edge[0][1]);
            ctx.lineTo(edge[1][0], edge[1][1]);
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        });

        // Draw the path
        const usedEdges = new Set();
        path.forEach((edge, index) => {
            // Find the gradient perpendicular to the edge to draw a coloured line slightly left of center
            const gradient = [edge[1][0] - edge[0][0], edge[1][1] - edge[0][1]];
            const unitVector = [gradient[0] / Math.hypot(...gradient), gradient[1] / Math.hypot(...gradient)];
            
            // Use the right hand side if the left hand side is already taken
            const rotationMatrix = usedEdges.has(JSON.stringify(edge)) ? [[0, -1], [1, 0]] : [[0, 1], [-1, 0]];
            usedEdges.add(JSON.stringify(edge));
            const newVector = [
                rotationMatrix[0][0] * unitVector[0] + rotationMatrix[0][1] * unitVector[1],
                rotationMatrix[1][0] * unitVector[0] + rotationMatrix[1][1] * unitVector[1]
              ];

            // Distance away from the center to draw the coloured line
            const dist = 4;
            const xChange = dist * newVector[0];
            const yChange = dist * newVector[1];
            const x1 = edge[0][0] + xChange
            const y1 = edge[0][1] + yChange
            const x2 = edge[1][0] + xChange
            const y2 = edge[1][1] + yChange
    
            // Draw this segment of the path
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = dist;
            ctx.strokeStyle = PATH_COLOURS[colours[index]];
            ctx.stroke();
            ctx.closePath();
        });

    }, [nodes, mousePosition, edges, path, baseMap]);  // useEffect runs whenever these variables get changed
  
    const mouseDown = (e) => { 
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        // Check if there is a node at the clicked position
        const existingNodeIndex = findExistingNode(x, y, nodes);

        // Draw a new node if no node exists at the clicked position
        if (existingNodeIndex === -1) {
            setNewNode(true);
            setLastPress([x, y]);
            setNodes([...nodes, [x, y]]);

        // Center the coordinates if a node already exists at the clicked position
        } else {
            setNewNode(false);
            setLastPress(nodes[existingNodeIndex]);
        }
        setIsDrawing(true);
    }; 
  
    const mouseMove = (e) => { 
        if (!isDrawing) { 
            return; 
        } 
        setMousePosition([e.nativeEvent.offsetX, e.nativeEvent.offsetY])
    }; 

    const mouseUp = (e) => { 
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        const node1 = lastPress;
        const existingNodeIndex = findExistingNode(x, y, nodes);
        const node2 = (existingNodeIndex !== -1) ? nodes[existingNodeIndex] : [x, y];
        const existingEdgeIndex = findExistingEdge(node1, node2, edges);
        
        // Clear the last press and mouse position to stop drawing a new edge
        setLastPress(null);
        setMousePosition(null);

        // MouseDown and MouseUp on the same node
        if (node1[0] === node2[0] && node1[1] === node2[1]) {
            // Placing an unconnected new node
            if (newNode){
                return;
            }
            // Removing an existing node that isn't connected by an edge
            if (!isNodeInEdges(node2, edges)){
                nodes.splice(existingNodeIndex, 1);
                return;
            }
        }

        // Placing a new node about to be connected by an edge
        if (existingNodeIndex === -1){
            setNodes([...nodes, node2]);
        } 

        // Placing a new edge 
        if (existingEdgeIndex === -1){
            setEdges([...edges, [node1, node2]]);

        // Removing an existing edge
        } else {
            edges.splice(existingEdgeIndex, 1);
        }
    }; 

    const uploadBasemap = (e) => { 
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    setBasemap(img);
                    const baseMapDimensions = img.width / img.height
                    const canvasDimensions = canvasWidth / canvasHeight
                    // Set the width and height to be as large as possible while maintaing dimensions and staying in the canvas
                    if (baseMapDimensions > canvasDimensions) {
                        // Width is the limiting factor
                        const scaledHeight = (canvasWidth / img.width) * img.height;
                        setBaseMapWidth(canvasWidth);
                        setBaseMapHeight(scaledHeight);
                    } else {
                        // Height is the limiting factor
                        const scaledWidth = (canvasHeight / img.height) * img.width;
                        setBaseMapWidth(scaledWidth);
                        setBaseMapHeight(canvasHeight);
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
        setNodes([])
        setEdges([])
        setPath([])
    }

    const generatePath = () => {
        // This fetch goes to the proxy address which is set in package.json
        fetch("/data", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "edges": edges }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log("results", data)
                if(data["path"] === null){
                    console.log("ERROR: Graph is disjoint");
                    return;
                }
                setPath(data["path"]);
                setColours(data["colours"]);
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    }
    
    return ( 
        <div className="App"> 
            <div className="title-and-menu">
                <div className="left-menu"> 
                    <input type="file" accept="image/*" onChange={uploadBasemap} />
                    <button className="button"
                        onClick={generatePath}
                    > Generate Path </button> 
                </div>                 
                <h1>Radpath</h1> 
            </div>
            <div className="canvas"> 
                <canvas 
                    onMouseDown={mouseDown} 
                    onMouseUp={mouseUp} 
                    onMouseMove={mouseMove} 
                    ref={canvasRef} 
                    width={canvasWidth} 
                    height={canvasHeight} 
                /> 
            </div> 
        </div> 
    ); 

}

////////////////////////////
// Extra helper functions //
////////////////////////////

const findExistingNode = (x, y, nodes) => {
    return nodes.findIndex(node => {
        const [nx, ny] = node;
        const distance = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
        return distance < NODE_SIZE;
    });
}

const findExistingEdge = (node1, node2, edges) => {
    return edges.findIndex(edge => {
        return (
            (edge[0][0] === node1[0] && edge[0][1] === node1[1] &&
             edge[1][0] === node2[0] && edge[1][1] === node2[1]) ||
            (edge[0][0] === node2[0] && edge[0][1] === node2[1] &&
             edge[1][0] === node1[0] && edge[1][1] === node1[1])
        );
    });
};

const isNodeInEdges = (node, edges) => {
    return edges.some(edge => edge.some(edgeNode => edgeNode[0] === node[0] && edgeNode[1] === node[1]));
};
  
export default App;