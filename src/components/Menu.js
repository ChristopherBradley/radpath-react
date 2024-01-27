// Menu.js 
  
import React from "react"; 
import "../App.css"; 
  
const Menu = ({ setLineColor, lineColor }) => { 
    return ( 
        <div className="Menu"> 
            <label>Generate Route </label> 
            <input 
                type="color"
                value={lineColor}
                onChange={(e) => { 
                    setLineColor(e.target.value); 
                }} 
            />       
        </div> 
    ); 
}; 
  
export default Menu;