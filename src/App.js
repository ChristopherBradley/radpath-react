import { useEffect, useRef, useState } from "react"; 
import Menu from "./components/Menu"; 
import "./App.css"; 
  
function App() { 
    const canvasRef = useRef(null); 
    const [isDrawing, setIsDrawing] = useState(false); 
    const [lineColor, setLineColor] = useState("#ff0000"); 
    const [lastPress, setLastPress] = useState(null);
    const [mousePosition, setMousePosition] = useState(null);
    const [nodes, setNodes] = useState([]);
    const NODE_SIZE = 10; 
  
    // Initialization when the component 
    // mounts for the first time 
    useEffect(() => { 
        console.log('useEffect triggered');
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

    }, [nodes, mousePosition]); 
  
    const mouseDown = (e) => { 
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        setLastPress([x, y]);
        setIsDrawing(true);

        console.log(lastPress);
        console.log(nodes);

        // Check if there is a circle at the clicked position
        const existingNodeIndex = nodes.findIndex(node => {
            const [nx, ny] = node;
            const distance = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
            return distance < NODE_SIZE;
        });

        if (existingNodeIndex !== -1) {
            // If a circle exists at the clicked position, remove it
            const newNodes = [...nodes];
            newNodes.splice(existingNodeIndex, 1);
            setNodes(newNodes);
          } else {
            // Draw a new circle if no circle exists at the clicked position
            setNodes(prevNodes => [...prevNodes, [x, y]]);
          }
    }; 
  
    const mouseMove = (e) => { 
        console.log('mouseMoved');
        if (!isDrawing) { 
            return; 
        } 
        setMousePosition([e.nativeEvent.offsetX, e.nativeEvent.offsetY])
    }; 

    //Function for ending the drawing 
    const mouseUp = () => { 
        // ctxRef.current.closePath(); 
        // setIsDrawing(false); 
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