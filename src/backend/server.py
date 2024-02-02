# Filename - server.py
 
# Import flask and datetime module for showing date and time
from flask import Flask, request
import datetime
 
x = datetime.datetime.now()
 
# Initializing flask app
app = Flask(__name__)
 
 
# Route for seeing a data
@app.route('/data')
def get_time():
    print("Route /data called")
 
    # Returning an api for showing in  reactjs
    foo = request.args.get('foo')
    print(f"Foo is: {foo}")
    return {
        'Name':"geek", 
        "Age":"22",
        "Date":x, 
        "programming":"python"
        }
 
     
# Running app
if __name__ == '__main__':
    app.run(debug=True)