from flask import Flask, request
from double_edges import choose_double_edges
from euler_path import euler_path

app = Flask(__name__)
 
@app.route("/data", methods=["POST"])
def get_time():
    print("Route /data called")
    data = request.json
    edges = data.get("edges")
    edge_tuples = [[tuple(node) for node in edge] for edge in edges]
    print("edge_tuples", edge_tuples)

    double_edges = choose_double_edges(edge_tuples)
    print("double_edges", double_edges)
    
    path, colours = euler_path(edge_tuples, double_edges)
    results = {
        "path":path, 
        "colours":colours,
    }
    print("results: ", results)
    return results
 
if __name__ == '__main__':
    app.run(debug=True)