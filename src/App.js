import { useEffect, useRef, useState } from "react"; 
import Menu from "./components/Menu"; 
import "./App.css"; 
  
const NODE_SIZE = 10; 


function App() { 
    const canvasRef = useRef(null); 
    const [isDrawing, setIsDrawing] = useState(false); 
    const [lineColor, setLineColor] = useState("#ff0000"); 
    const [lastPress, setLastPress] = useState(null);
    const [mousePosition, setMousePosition] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [newNode, setNewNode] = useState(false)
    const [edges, setEdges] = useState([]);
  
    useEffect(() => { 
        const canvas = canvasRef.current; 
        const ctx = canvas.getContext("2d"); 

        // Clear the entire canvas before redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node[0], node[1], NODE_SIZE, 0, 2 * Math.PI);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
          });

        // Draw a line from the last node
        if (lastPress !== null && mousePosition !== null){
            ctx.beginPath();
            ctx.moveTo(lastPress[0], lastPress[1]);
            ctx.lineTo(mousePosition[0], mousePosition[1]);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        }

        // Draw the edges
        edges.forEach(edge => {
            ctx.beginPath();
            ctx.moveTo(edge[0][0], edge[0][1]);
            ctx.lineTo(edge[1][0], edge[1][1]);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        });

    }, [nodes, mousePosition, edges]);  // useEffect runs whenever these variables get changed
    
  
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
            <button
                onClick={() => { 
                    // Using fetch to fetch the api from 
                    // flask server it will be redirected to proxy
                    fetch("/data?foo=5")
                        .then((res) => {
                            if (!res.ok) {
                                throw new Error(`HTTP error! Status: ${res.status}`);
                            }
                            return res.json();
                        })
                        .then((data) => {
                            // Setting data from the API
                            console.log(data);
                        })
                        .catch((error) => {
                            console.error("Fetch error:", error);
                        });
                }}
            > Generate Route </button> 
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