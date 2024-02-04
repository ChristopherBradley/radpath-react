// Menu.js 
  
import React from "react"; 
import "../App.css"; 
  
const Menu = ({ edges, setPath, setColours, setBasemap}) => { 
    return ( 
        <div className="Menu"> 
            <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        const img = new Image();
                        img.onload = function () {
                            setBasemap(img);
                        };
                        img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }}} />
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
                            console.log("results", data)
                            setPath(data["path"]);
                            setColours(data["colours"]);
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