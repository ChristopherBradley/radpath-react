# lambda_function.py is used for deploying on AWS Lambda
# server.py is used for deploying local backend for the React App
# main.py is a standalone tkinter python app 

from double_edges import choose_double_edges
from euler_path import euler_path
import json

def lambda_handler(event, context):
    print("event: ", event)

    edges = []
    if (event['body']) and (event['body'] is not None):
        body = json.loads(event['body'])
    try:
        edges = body['edges']
    except KeyError:
        print('Invalid json body for radpath')

    edge_tuples = [[tuple(node) for node in edge] for edge in edges]
    print("edge_tuples", edge_tuples)

    double_edges = choose_double_edges(edge_tuples)
    print("double_edges", double_edges)
    
    path, colours = euler_path(edge_tuples, double_edges)
    results = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "*/*",
            "Access-Control-Allow-Origin":"*"
        },
        "body": json.dumps({
            "path":path, 
            "colours":colours,
        })
    }

    print("results: ", results)
    return results

if __name__ == '__main__':
    body = {
        "edges":[[[244, 313], [309, 421]], [[309, 421], [420, 359]], [[420, 359], [244, 313]], [[244, 313], [350, 237]],
                 [[350, 237], [420, 359]], [[350, 237], [557, 134]]]
    }
    event = {
        "body": json.dumps(body)
    }
    result = lambda_handler(event, None)
    print(result)