from flask import Flask, request
import numpy as np
from double_edges import choose_double_edges
from euler_path import euler_path

app = Flask(__name__)
 
@app.route("/data", methods=["POST"])
def get_time():
    print("Route /data called")
    data = request.json
    edges = data.get("edges")
    print("edges:", edges)
    print("edges type: ", type(edges))

    edges_array = np.array(edges)
    double_edges = choose_double_edges(edges_array)
    path, colours = euler_path(edges, double_edges)
    results = {
        "path":path, 
        "colours":colours,
    }
    print("results: ", results)
    return results
 
if __name__ == '__main__':
    app.run(debug=True)