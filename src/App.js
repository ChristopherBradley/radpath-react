import { useEffect, useRef, useState } from "react"; 
import Menu from "./components/Menu"; 
import "./App.css"; 
  
// red, orange, yellow, light green, dark green, light blue, dark blue, violet, magenta, pink
// with a dark version and light version of each
// const PATH_COLOURS = ["#c40034", "#f7786d", "#ffaa0d", "#deb968", "#ffeb0d", "#ded468", // Red, Orange, Yellow
//                       "#60d40d", "#b7ff78", "#00ab25", "#7ef295", "#00fff7", "#60bfb9", // Light green, dark green, light blue
//                       "#001fbd", "#829cfa", "#9000ff", "#c379fc", "#4b0085", "#925cbf", // Dark blue, violet, magenta
//                       "#fb00ff", "#fd96ff"]; // pink
const PATH_COLOURS = ["#c40034",  "#ffaa0d",  "#ffeb0d", "#60d40d",  "#00ab25",  "#00fff7", "#001fbd",  "#9000ff",  "#4b0085", "#fb00ff", // Red, Orange, Yellow, Light green, Dark green, Light blue, Dark blue, Violet, Magenta, Pink
                      "#f7786d", "#deb968", "#f5fc88", "#b7ff78", "#7ef295", "#85dede", "#829cfa", "#c379fc", "#925cbf", "#fd96ff", // Lighter versions
                     ]; 
const NODE_SIZE = 10; 


function App() { 
    const canvasRef = useRef(null); 
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

        // Clear the entire canvas before redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#000000";

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

    }, [nodes, mousePosition, edges, path]);  // useEffect runs whenever these variables get changed
    
  
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
        if (node1[0] == node2[0] && node1[1] == node2[1]) {
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
    
    return ( 
        <div className="App"> 
            <h1>Radpath</h1> 
            <Menu edges={edges} setPath={setPath} setColours={setColours}> </Menu>
            <div className="draw-area"> 
                <canvas 
                    onMouseDown={mouseDown} 
                    onMouseUp={mouseUp} 
                    onMouseMove={mouseMove} 
                    ref={canvasRef} 
                    width={`1280px`} 
                    height={`720px`} 
                /> 
            </div> 
        </div> 
    ); 

}

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
            (edge[0][0] == node1[0] && edge[0][1] == node1[1] &&
             edge[1][0] == node2[0] && edge[1][1] == node2[1]) ||
            (edge[0][0] == node2[0] && edge[0][1] == node2[1] &&
             edge[1][0] == node1[0] && edge[1][1] == node1[1])
        );
    });
};

const isNodeInEdges = (node, edges) => {
    return edges.some(edge => edge.some(edgeNode => edgeNode[0] == node[0] && edgeNode[1] == node[1]));
};
  
export default App;