// Menu.js 
  
import React from "react"; 
import "../App.css"; 
  
const Menu = ({ edges }) => { 
    return ( 
        <div className="Menu"> 
            <button
                onClick={() => { 
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
                            console.log(data);
                        })
                        .catch((error) => {
                            console.error("Fetch error:", error);
                        });
                }}
            > Generate Route </button> 
        </div> 
    ); 
}; 
  
export default Menu;