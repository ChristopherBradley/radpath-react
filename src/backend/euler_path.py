import networkx as nx
import numpy as np

def euler_path(edges, double_edges):
    """Create a route through the graph that is easy to follow and avoids turning back on itself"""
    if len(edges) == 0:
        return [], []

    graph = create_multi_graph(edges, double_edges)
    last_edge = list(graph.edges)[0]
    ordered_edges = [last_edge[:2]]
    graph.remove_edge(last_edge[0], last_edge[1])
    insertion_index = 1
    loop_size = 0

    current_loop = ordered_edges.copy()
    intersections = []
    loops = []

    # Choose edges one at a time, and remove them from the graph.
    while(len(graph.edges())) > 0:
        possibilities = graph.adj[last_edge[1]]
        if len(possibilities) == 0:
            insertion_index, last_edge = backtrack(insertion_index, ordered_edges, graph.adj)
            possibilities = graph.adj[last_edge[1]]
        possibilities = list(prioritise_double_edges(possibilities))
        try:
            next_node = choose_next_node(last_edge, possibilities)
        except:
            # This is likely because the graph is disjoint
            return None, None
        graph.remove_edge(last_edge[1], next_node)
        last_edge = (last_edge[1], next_node)
        ordered_edges.insert(insertion_index, last_edge)
        
        intersections = [index if index <= insertion_index else index + 1 for index in intersections]
        insertion_index += 1
        loop_size += 1

        # Start a new loop if we intersect with this loop and the intersection results in a loop larger than intersect_lenience + 1
        in_current_loop = next_node in {item for sublist in current_loop for item in sublist}
        intersect_lenience = 5
        in_last_n = next_node in {item for sublist in current_loop[-intersect_lenience:] for item in sublist}
        if in_current_loop and not in_last_n:
            intersections.append(insertion_index)
            current_loop.append(last_edge)
            loops.append(current_loop)
            current_loop = []
            continue
        current_loop.append(last_edge)

    colours = separate_loops(ordered_edges)
    return ordered_edges, colours

def separate_loops(ordered_edges):
    """Give each loop a separate index for determining colours"""
    nodes = [edge[0] for edge in ordered_edges]
    colour_dict = {0:[]}
    current_loop = []   
    colours = []
    loop_number = 0
    lenience = 5
    for node in nodes:
        if node in colour_dict[loop_number] and node not in current_loop[-lenience:]:
            loop_number = (loop_number + 1) % 20    # We only have 20 colours
            current_loop = []
        colours.append(loop_number)
        current_loop.append(node)
        if loop_number not in colour_dict:
            colour_dict[loop_number] = []
        colour_dict[loop_number].append(node)

    # Make each loop end one short to avoid colours running into each other
    colours.append(loop_number)
    colours = colours[1:]
    return colours

def prioritise_double_edges(possibilities):
    """Choose the double edges first to help avoid turning back on yourself"""
    doubled = [k for k, v in possibilities.items() if len(v) > 1]
    return doubled if len(doubled) > 0 else possibilities

def backtrack(insertion_index, ordered_edges, adjacencies):
    """Find the last node where we could have gone in a different direction"""
    while insertion_index > 0:
        insertion_index -= 1
        last_edge = ordered_edges[insertion_index]
        if len(adjacencies[last_edge[0]]) > 0:
            break
    if insertion_index == 0:
        last_edge = [last_edge[0], last_edge[0]]
    else:
        last_edge = ordered_edges[insertion_index - 1]
    return insertion_index, last_edge

def choose_next_node(last_edge, possibilities):
    """Choose the node that is most in a straight line"""
    current_gradient = np.array(last_edge[0]) - np.array(last_edge[1])
    possible_gradients = np.array(last_edge[1]) - possibilities
    similarities = [cosine_distance(current_gradient, p) for p in possible_gradients]
    node_index = np.argmin(similarities)
    next_node = possibilities[node_index]
    return next_node

# Reproducing scipy.spatial.distance.cosine with numpy to avoid an extra dependency
def cosine_similarity(a, b):
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    return dot_product / (norm_a * norm_b)

def cosine_distance(a, b):
    return 1 - cosine_similarity(a, b)

def create_multi_graph(edges, double_edges):
    """Combine the single and double edges into a graph"""
    graph = nx.MultiGraph()
    for edge in edges:
        graph.add_edge(edge[0], edge[1])
    for edge in double_edges:
        graph.add_edge(edge[0], edge[1])
    return graph

if __name__ == '__main__':
    ## Route that requires double edges
    # edges = [[(244, 313), (309, 421)], [(309, 421), (420, 359)], [(420, 359), (244, 313)], [(244, 313), (350, 237)],
    #          [(350, 237), (420, 359)], [(350, 237), (557, 134)]]
    # double_edges = [((244, 313), (420, 359)), ((350, 237), (557, 134))]
    # path, colours = euler_path(edges, double_edges)

    ## Route with no double edges
    # edges = [[(704, 288), (518, 266)], [(518, 266), (675, 173)], [(675, 173), (704, 288)]]
    # double_edges = []
    # path, colours = euler_path(edges, double_edges)

    ## No route
    edges = []
    double_edges = []
    path, colours = euler_path(edges, double_edges)

    print("path", path)
    print("colours", colours)