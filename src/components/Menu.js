// Menu.js 
  
import React from "react"; 
import "../App.css"; 
  
const Menu = ({ setLineColor, setLineWidth, 
    setLineOpacity, lineColor }) => { 
    return ( 
        <div className="Menu"> 
            <label>Brush Color </label> 
            <input 
                type="color"
                value={lineColor}
                onChange={(e) => { 
                    setLineColor(e.target.value); 
                }} 
            /> 
            <label>Brush Width </label> 
            <input 
                type="range"
                min="3"
                max="20"
                onChange={(e) => { 
                    setLineWidth(e.target.value); 
                }} 
            /> 
            <label>Brush Opacity</label> 
            <input 
                type="range"
                min="1"
                max="100"
                onChange={(e) => { 
                    setLineOpacity(e.target.value / 100); 
                }} 
            /> 
        </div> 
    ); 
}; 
  
export default Menu;