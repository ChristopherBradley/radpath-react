import os
from pathlib import Path

source_directory = Path(os.path.abspath(os.path.dirname(__file__)))
root_directory = source_directory.parent

data_folder = root_directory / 'data'