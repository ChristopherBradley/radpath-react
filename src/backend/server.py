# Filename - server.py
 
# Import flask and datetime module for showing date and time
from flask import Flask, request
import datetime
 
x = datetime.datetime.now()
 
# Initializing flask app
app = Flask(__name__)
 
 
# Route for seeing a data
@app.route('/data', methods=['POST'])
def get_time():
    print("Route /data called")

    # Retrieve data from the request body as JSON
    data = request.json
    foo = data.get('foo')
    print(f"Foo is: {foo}")

    current_time = datetime.datetime.now().isoformat()

 
    # Returning an api for showing in  reactjs
    foo = request.args.get('foo')
    print(f"Foo is: {foo}")
    return {
        'Name':"Me", 
        "Date":current_time, 
        }
 
     
# Running app
if __name__ == '__main__':
    app.run(debug=True)