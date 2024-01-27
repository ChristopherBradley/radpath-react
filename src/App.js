import { useEffect, useRef, useState } from "react"; 
import Menu from "./components/Menu"; 
import "./App.css"; 
  
function App() { 
    const canvasRef = useRef(null); 
    const ctxRef = useRef(null); 
    const [isDrawing, setIsDrawing] = useState(false); 
    const [lineWidth, setLineWidth] = useState(5); 
    const [lineColor, setLineColor] = useState("#ff0000"); 
    const [lineOpacity, setLineOpacity] = useState(0.1); 
    const [lastPress, setLastPress] = useState(null);
    const [nodes, setNodes] = useState([]);
    const NODE_SIZE = 10 
  
    // Initialization when the component 
    // mounts for the first time 
    useEffect(() => { 
        const canvas = canvasRef.current; 
        const ctx = canvas.getContext("2d"); 

        // Clear the entire canvas before redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node[0], node[1], NODE_SIZE, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.closePath();
          });
    }, [nodes]); 
  
    // Function for starting the drawing 
    const startDrawing = (e) => { 
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        setLastPress([x, y]);
        console.log(lastPress);
        console.log(nodes)

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
  
    //Function for ending the drawing 
    const endDrawing = () => { 
        // ctxRef.current.closePath(); 
        // setIsDrawing(false); 
    }; 
  
    const draw = (e) => { 
        // if (!isDrawing) { 
        //     return; 
        // } 
        // ctxRef.current.lineTo( 
        //     e.nativeEvent.offsetX, 
        //     e.nativeEvent.offsetY 
        // ); 
  
        // ctxRef.current.stroke(); 
    }; 
  
    return ( 
        <div className="App"> 
            <h1>Paint App</h1> 
            <div className="draw-area"> 
                <Menu 
                    setLineColor={setLineColor} 
                    setLineWidth={setLineWidth} 
                    setLineOpacity={setLineOpacity} 
                    lineColor={lineColor}
                /> 
                <canvas 
                    onMouseDown={startDrawing} 
                    onMouseUp={endDrawing} 
                    onMouseMove={draw} 
                    ref={canvasRef} 
                    width={`1280px`} 
                    height={`720px`} 
                /> 
            </div> 
        </div> 
    ); 
} 
  
export default App;