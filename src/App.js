import { useEffect, useRef, useState } from "react"; 
import Menu from "./components/Menu"; 
import "./App.css"; 
  
const NODE_SIZE = 10; 

const findExistingNode = (x, y, nodes) => {
    return nodes.findIndex(node => {
        const [nx, ny] = node;
        const distance = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
        return distance < NODE_SIZE;
    });
}

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
            ctx.strokeStyle = lineColor; // Set the stroke color
            ctx.lineWidth = 1; // Set the line width
            ctx.stroke();
            ctx.closePath();
          });

        // Draw a line from the last node
        if (lastPress !== null && mousePosition !== null){
            ctx.beginPath();
            ctx.moveTo(lastPress[0], lastPress[1]);
            ctx.lineTo(mousePosition[0], mousePosition[1]);
            ctx.strokeStyle = lineColor; // Set the stroke color
            ctx.lineWidth = 1; // Set the line width
            ctx.stroke();
            ctx.closePath();
        }

    }, [nodes, mousePosition]);  // useEffect runs whenever these variables get changed
  
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

        // Clear the last press and mouse position to stop drawing a new edge
        setLastPress(null);
        setMousePosition(null);

        // MouseDown and MouseUp on the same node
        if (node1[0] == node2[0] && node1[1] == node2[1]) {
            // Placing an unconnected new node
            if (newNode){
                return;
            }
            // Ignoring a node connected by an edge (must delete the edges first)
            console.log("bla")

            // Removing an existing node
            nodes.splice(existingNodeIndex, 1);
            return;
        }

        // Placing a new node connected by an edge
        if (existingNodeIndex === -1){
            setNodes([...nodes, node2]);
        } 

        // TODO: Placing a new edge 
        const edge = [node1,node2]
        const reverse_edge = [node2, node1]

        // TODO: Removing an existing edge 



        console.log("nodes", nodes)
    }; 
    
    return ( 
        <div className="App"> 
            <h1>Radpath</h1> 
            <Menu setLineColor={setLineColor} lineColor={lineColor} /> 
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
  
export default App;