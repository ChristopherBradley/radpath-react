import tkinter as tk
from tkinter import font as tkFont
from tkinter import filedialog
from PIL import ImageTk, Image
import numpy as np
import json
import matplotlib.pyplot as plt
import shutil
import os
import io

from double_edges import choose_double_edges
from euler_path import euler_path
from path_variables import data_folder

CIRCLE_SIZE = 10
DOUBLE_EDGE_WIDTH = 5
BACKGROUND_FILENAME = data_folder / "map.png"
EDGES_FILENAME = data_folder / "edges.json"

class Radpath:

    # We need this to be a class so that we can access the canvas from outside functions
    def __init__(self):
        root = tk.Tk()
        root.title("Radpath")

        # With this current system, you need to enter full screen mode for it to work properly
        self.map_name = "map"
        self.distance = 0
        self.screen_width = root.winfo_screenwidth()
        self.screen_height = root.winfo_screenheight()

        self.canvas = tk.Canvas(root, width=self.screen_width, height=self.screen_height)
        self.canvas.grid()
        self.canvas.bind('<ButtonPress-1>', self.mouse_press)
        self.canvas.bind('<B1-Motion>', self.mouse_drag)
        self.canvas.bind('<ButtonRelease-1>', self.mouse_release)
        self.canvas.focus_set()

        self.background = self.setup_background(BACKGROUND_FILENAME) 
        self.canvas_background = self.canvas.create_image(0, 0, image=self.background, anchor='nw')

        button_font = tkFont.Font(size=16, weight='bold')
        button_background = 'black'
        button_height = 1
        button_width = 10

        button1 = tk.Button(root, text="Upload Basemap", command=self.upload_basemap, font=button_font, highlightbackground=button_background, height=button_height, width=button_width)
        button1.grid(row=0, column=0, padx=10, pady=10, sticky="nw")
        button2 = tk.Button(root, text="Upload Edges", command=self.upload_edges, font=button_font, highlightbackground=button_background, height=button_height, width=button_width)
        button2.grid(row=0, column=0, padx=10, pady=50, sticky="nw")
        button3 = tk.Button(root, text="Generate Route", command=self.calculate_route, font=button_font, highlightbackground=button_background, height=button_height, width=button_width)
        button3.grid(row=0, column=0, padx=10, pady=90, sticky="nw")
        button4 = tk.Button(root, text="Download Route", command=self.download_route, font=button_font, highlightbackground=button_background, height=button_height, width=button_width)
        button4.grid(row=0, column=0, padx=10, pady=150, sticky="nw")

        self.message_label = tk.Label(root, text="-----------------------")
        self.message_label.grid(row=0, column=0, padx=10, pady=120, sticky="nw")

        self.nodes = []
        self.node_drawings = []
        self.edges = []
        self.edge_drawings = []
        self.loop_drawings = []
        self.number_drawings = []

        self.double_edges = []
        self.last_press = None
        self.last_line = None
        self.new_node = True

        self.preload_edges()
        root.mainloop()

    def upload_basemap(self):
        """Override the current map.png with the new image"""
        filename = filedialog.askopenfilename()
        # TODO: Check the file is a png, and if not then give an error message
        self.map_name, _ = os.path.splitext(os.path.basename(filename))
        shutil.copy(filename, data_folder)
        old_filename = os.path.join(data_folder, os.path.basename(filename))
        new_filename = os.path.join(data_folder, "map.png")
        os.rename(old_filename, new_filename)
        self.background = self.setup_background(BACKGROUND_FILENAME) 
        self.canvas_background = self.canvas.create_image(0, 0, image=self.background, anchor='nw')
        self.preload_edges()

    def setup_background(self, BACKGROUND_FILENAME):
        """Prepare the image to be used as a tkinter background"""
        background_image = Image.open(BACKGROUND_FILENAME)
        background_image = self.rescale_background(background_image, self.screen_width, self.screen_height)
        return ImageTk.PhotoImage(background_image)

    def rescale_background(self, background_image, screen_width, screen_height):
        """Adjust the image size to use the full screen width/height but without distorting the image"""
        screen_ratio = screen_width/screen_height
        image_width = background_image.width
        image_height = background_image.height
        image_ratio = image_width/image_height
        if image_ratio >= screen_ratio:
            image_width = screen_width
            image_height = image_width/image_ratio
        else:
            image_height = screen_height
            image_width = image_height * image_ratio
        background_image = background_image.resize((int(image_width), int(image_height)), Image.LANCZOS)
        return background_image
    
    def upload_edges(self):
        """Override the current edges.json with the new edges"""
        filename = filedialog.askopenfilename()
        # TODO: Check the file is a json, and if not then give an error message
        os.remove(os.path.join(data_folder, "edges.json"))
        shutil.copy(filename, data_folder)
        old_filename = os.path.join(data_folder, os.path.basename(filename))
        new_filename = os.path.join(data_folder, "edges.json")
        os.rename(old_filename, new_filename)
        self.edges = []
        self.preload_edges()
        for loop_drawing in self.loop_drawings:
            self.canvas.delete(loop_drawing)
        self.loop_drawings = []

    def download_route(self):
        """Download the basemap, edges, and an image of the route itself"""
        # Name the basemap: map_name.png
        # Name the edges:   map_name - edges - distance.json
        # Name the route:   map_name - route - distance.png

        downloads_path = os.path.join(os.path.expanduser("~"), 'Downloads')
        old_basemap_path = os.path.join(data_folder, "map.png")
        old_edge_path = os.path.join(data_folder, "edges.json")
        new_basemap_path = os.path.join(downloads_path, f"{self.map_name}.png")
        new_edge_path = os.path.join(downloads_path, f"{self.map_name} - edges x{round(self.distance)}.json")

        shutil.copy(old_basemap_path, new_basemap_path)
        shutil.copy(old_edge_path, new_edge_path)

        new_route_path = os.path.join(downloads_path, f"{self.map_name} - route x{round(self.distance)}.png")
        ps_data = self.canvas.postscript(colormode='color')
        pil_image = Image.open(io.BytesIO(ps_data.encode('utf-8')))
        pil_image.save(new_route_path, format="PNG", quality=95)


    def clear_nodes_and_edges(self):
        """Clear all the drawings"""
        for edge_drawing in self.edge_drawings:
            self.canvas.delete(edge_drawing)
        for node_drawing in self.node_drawings:
            self.canvas.delete(node_drawing)
        self.edge_drawings = []
        self.node_drawings = []

    def draw_nodes_and_edges(self):
        "Draw all the drawings"
        for edge in self.edges:
            line = self.canvas.create_line(edge[0][0], edge[0][1], edge[1][0], edge[1][1])
            self.edge_drawings.append(line)

        # Extract and draw the nodes
        nodes = set()
        for edge in self.edges:
            nodes.add(edge[0])
            nodes.add(edge[1])
        self.nodes = list(nodes)
        for node in self.nodes:
            circle = self.draw_node(node)
            self.node_drawings.append(circle)

    def preload_edges(self):
        """Load from a previously saved set of edges"""
        self.clear_nodes_and_edges()
        # Load in the edges from file if the file exists
        try:
            with open(EDGES_FILENAME, 'r') as file:
                self.edges = json.load(file)
                # Nodes need to be tuples for dictionary hashing to work
                self.edges = [[tuple(edge[0]),tuple(edge[1])] for edge in self.edges]
        except:
            print("There is no edges.json file for preloading, so we are starting from scratch")
            return
        self.draw_nodes_and_edges()

    def mouse_press(self, event):
        """If we press somewhere that doesn't yet have a node, then place a node there"""
        # 0. Clear the old route if we start editing the nodes/edges
        if self.loop_drawings != []:
            for loop_drawing in self.loop_drawings:
                self.canvas.delete(loop_drawing)
            self.loop_drawings = []
            self.clear_nodes_and_edges()
            self.draw_nodes_and_edges()
            self.distance = 0

        node = (event.x, event.y)
        self.new_node = self.overlapping_node(node) is None
        if self.new_node:
            circle = self.draw_node(node)
            self.nodes.append(node)
            self.node_drawings.append(circle)
        else:
            node = self.overlapping_node(node)
        self.last_press = node

    def mouse_drag(self, event):
        """If we press and drag, then draw a line from the last press position to the current mouse position"""
        self.canvas.delete(self.last_line)
        self.last_line = self.canvas.create_line(self.last_press[0], self.last_press[1], event.x, event.y)

    def mouse_release(self, event):
        """Create and delete a node and or edge based on this logic:
            1. if the 1st and 2nd nodes are the same and the 1st node is new then ignore it, otherwise delete it
            2. if the second node is new then create and draw it, if not then centre it
            3. if the edge is old then delete it, if not then create and draw it"""
        node1 = self.last_press
        node2 = (event.x, event.y)
        node2_centred = self.overlapping_node(node2)

        # 1. if the 1st and 2nd nodes are the same and the 1st node is new then ignore it, otherwise delete it
        if node1 == node2_centred:
            if self.new_node:
                self.canvas.delete(self.last_line)
                return
            # Don't delete a node if it's connected to an edge
            edge_nodes = {node for edge in self.edges for node in edge}
            if node1 in edge_nodes:
                self.canvas.delete(self.last_line)
                return
            else:
                index = self.nodes.index(node1)
                del self.nodes[index]
                self.canvas.delete(self.node_drawings[index])
                del self.node_drawings[index]

                self.canvas.delete(self.last_line)
                return

        # 2. if the second node is new then create and draw it, if not then centre it
        if node2_centred is None:
            circle = self.draw_node(node2)
            self.nodes.append(node2)
            self.node_drawings.append(circle)
        else:
            node2 = node2_centred

        # 3. if the edge is old then delete it, if not then create and draw it
        edge = [node1,node2]
        reverse_edge = [node2, node1]
        if edge in self.edges or reverse_edge in self.edges:
            edge = edge if edge in self.edges else reverse_edge
            index = self.edges.index(edge)
            del self.edges[index]
            self.canvas.delete(self.edge_drawings[index])
            del self.edge_drawings[index]
        else:
            line = self.canvas.create_line(edge[0][0], edge[0][1], edge[1][0], edge[1][1])
            self.edges.append(edge)
            self.edge_drawings.append(line)

        self.canvas.delete(self.last_line)

    def overlapping_node(self, node):
        """returns the centre coordinates of the node that overlaps, or None if none overlap"""
        for old_node in self.nodes:
            euclidian_distance = np.sqrt(np.square(node[0] - old_node[0]) + np.square(node[1] - old_node[1]))
            if euclidian_distance < CIRCLE_SIZE:
                return old_node
        return None

    def draw_node(self, node):
        """Draw the node centred at the coordinate"""
        return self.canvas.create_oval(node[0] - CIRCLE_SIZE / 2, node[1] - CIRCLE_SIZE / 2, node[0] + CIRCLE_SIZE / 2,
                                node[1] + CIRCLE_SIZE / 2)

    def calculate_route(self):
        """Make the edges that need to be repeated get drawn in bold"""
        if self.edges == []:
            print("Cannot calculate route for an empty network")
            return

        self.double_edges = choose_double_edges(self.edges)
        self.path, self.colours = euler_path(self.edges, self.double_edges)

        if self.path is None:
            self.message_label.config(text="Error: disjoint graph", bg="#fcdddc")

        colour_map = plt.get_cmap('tab20').colors * 10
        rainbow = colour_map[6:8] + colour_map[2:6] + colour_map[0:2] + colour_map[8:]
        colour_ints = [[int(c*255) for c in colour] for colour in rainbow]
        colour_hex = ["#" + ''.join('%02x'%i for i in colour) for colour in colour_ints]

        # Draw each edge with it's given colours
        used_edges = set()
        for i, edge in enumerate(self.path):
            gradient = np.array(edge[1]) - np.array(edge[0])
            unit_vector = gradient / np.linalg.norm(gradient)
            rotation_matrix = [[0, 1], [-1, 0]]
            if edge in used_edges:
                rotation_matrix = [[0, -1], [1, 0]]
            new_vector = np.dot(rotation_matrix, unit_vector)
            dist = 3
            x_change = dist * new_vector[0]
            y_change = dist * new_vector[1]
            line = self.canvas.create_line(edge[0][0] + x_change,
                                    edge[0][1] + y_change, 
                                    edge[1][0] + x_change, 
                                    edge[1][1] + y_change, 
                                    width=DOUBLE_EDGE_WIDTH, 
                                    fill=colour_hex[self.colours[i]])
            self.loop_drawings.append(line)
            used_edges.add(edge)

        debug = False
        # # Draw numbers on the edges
        if debug == True:
            for i, edge in enumerate(self.path):
                # Only draw the edge number if this is the start of a new loop
                midpoint = ((edge[0][0] + edge [1][0])/2, (edge[0][1] + edge [1][1])/2)
                gradient = np.array(edge[1]) - np.array(edge[0])
                unit_vector = gradient / np.linalg.norm(gradient)

                rotation_matrix = [[0, 1], [-1, 0]]
                if edge in used_edges:
                    # Place the number on the other side of the double edge
                    rotation_matrix = [[0, -1], [1, 0]]
                new_vector = np.dot(rotation_matrix, unit_vector)

                dist = 5
                x_change = dist * new_vector[0]
                y_change = dist * new_vector[1]
                offset_midpoint = (midpoint[0] + x_change, midpoint[1] + y_change)

                # Use this line to draw a number on each edge
                number_drawing = self.canvas.create_text(offset_midpoint[0], offset_midpoint[1], fill="orange", font="Times 8",
                    text=i)   
                
                ## Use this line to draw the coordinate of each node
                number_drawing = self.canvas.create_text(edge[0][0], edge[0][1], fill="darkblue", font="Times 8",
                    text=edge[0])   
                
                self.number_drawings.append(number_drawing)
                used_edges.add(edge)

        # Calculate the total length of the path
        route_length = total_length(self.path, self.background.width())
        self.distance = round(route_length, 1)
        self.message_label.config(text=f'distance = map width x {self.distance}', bg="#d9ffe0")
        
        # Save the edges to file
        with open(EDGES_FILENAME, 'w') as file:
            json.dump(self.edges, file)
        self.preload_edges()

def total_length(edges, window_width):
    """Calculate the total length of the route"""
    total_length = 0
    for edge in edges:
        total_length += np.linalg.norm(np.array(edge[0]) - np.array(edge[1]))   # Euclidean distance
    scaling_factor = 1 / window_width
    actual_length = total_length * scaling_factor
    return actual_length

if __name__ == '__main__':
    Radpath()