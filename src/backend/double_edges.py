import networkx as nx
import itertools
from collections import Counter
import numpy as np

# Most of this script was taken from https://www.datacamp.com/community/tutorials/networkx-python-graph-tutorial#solution

def choose_double_edges(edges):
    """Use a brute force approach to choose the optimal double edges"""
    g = create_graph(edges)
    g_aug = evenify_graph(g)
    if g_aug is None:
        return []
    double_edges = expand_edges(g_aug, g)
    return double_edges

def create_graph(edges):
    """Construct a networkx graph from a list of edges"""
    graph = nx.Graph()
    for edge in edges:
        euclidian_distance = np.linalg.norm(np.array(edge[0]) - np.array(edge[1]))
        graph.add_edge(edge[0], edge[1], distance=euclidian_distance)
    return graph

def evenify_graph(g):
    """Adds edges to the graph to ensure all nodes have even degree"""
    nodes_odd_degree = [node for node, degree in g.degree if degree % 2 == 1]
    odd_node_pairs = list(itertools.combinations(nodes_odd_degree, 2))

    # Find the shortest distance between any two nodes (using Djikstra)
    distances = get_shortest_paths_distances(g, odd_node_pairs, 'distance')     # If we don't use the distance, then we just get the number of steps
    if distances is None or len(distances) == 0:
        return None

    # Choose the edges that maximise the overall weight. (without using any node twice)
    # Note: This is a brute force approach, might need to look into a less accurate but more efficient method later
    g_odd_complete = create_complete_graph(distances)
    odd_matching = nx.algorithms.max_weight_matching(g_odd_complete)

    # Add these new edges to the graph
    g_aug = add_augmenting_path_to_graph(g, odd_matching)
    return g_aug

def get_shortest_paths_distances(graph, pairs, edge_weight_name):
    """Compute shortest distance between each pair of nodes in a graph. Return a dictionary keyed on node pairs (tuples)."""
    distances = {}
    for pair in pairs:
        try:
            distances[pair] = nx.dijkstra_path_length(graph, pair[0], pair[1], weight=edge_weight_name)
        except nx.exception.NetworkXNoPath:
            return None
    return distances

def create_complete_graph(pair_weights):
    """Adds weights based on the distances"""
    g = nx.Graph()
    max_distance = max(pair_weights.values())
    for k, v in pair_weights.items():
        # Weights cannot be negative
        g.add_edge(k[0], k[1], weight=-v + max_distance)
    return g

def add_augmenting_path_to_graph(graph, min_weight_pairs):
    """Add the min weight matching edges to the original graph"""
    # We need to make the augmented graph a MultiGraph so we can add parallel edges
    graph_aug = nx.MultiGraph(graph.copy())
    for pair in min_weight_pairs:
        graph_aug.add_edge(pair[0], pair[1])
    return graph_aug


def expand_edges(graph_augmented, graph_original):
    """Fix up the new edges in the graph that didn't exist in the original by connecting a string of initial edges.
        returns just the double edges."""
    double_edges = []
    for edge in graph_augmented.edges:
        # Doubled up edges
        if edge[2] == 1:
            double_edges.append((edge[0], edge[1]))
        # Rural postman edges
        elif edge[:2] not in graph_original.edges:
            aug_path = nx.shortest_path(graph_original, edge[0], edge[1], weight='distance')
            aug_path_pairs = list(zip(aug_path[:-1], aug_path[1:]))
            double_edges.extend(aug_path_pairs)

    # TODO: Make sure none of the edges get recorded more than once. (Any odd numbered edges should get added to the double edges & Any even should numbered edges in double edges get removed.)
    edge_counts = Counter(double_edges)
    rerecorded_edges = [e for e in edge_counts.values() if e != 1]
    assert len(rerecorded_edges) == 0, "Still need to ensure edges don't get duplicated!"

    return double_edges

if __name__ == '__main__':
    edges = [[(244, 313), (309, 421)], [(309, 421), (420, 359)], [(420, 359), (244, 313)], [(244, 313), (350, 237)],
             [(350, 237), (420, 359)], [(350, 237), (557, 134)]]
    double_edges = choose_double_edges(edges)
    print(double_edges)