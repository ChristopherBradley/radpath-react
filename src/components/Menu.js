// Menu.js 
  
import React from "react"; 
import "../App.css"; 
  
const Menu = ({ edges }) => { 
    return ( 
        <div className="Menu"> 
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
        </div> 
    ); 
}; 
  
export default Menu;