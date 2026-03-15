import os
from dotenv import load_dotenv

load_dotenv()

QDRANT_HOST = os.getenv('QDRANT_HOST', 'localhost')
QDRANT_PORT = int(os.getenv('QDRANT_PORT', '6333'))
QDRANT_COLLECTION_NAME = 'documents'

EMBEDDING_MODEL_NAME = os.getenv('EMBEDDING_MODEL_NAME', 'all-MiniLM-L6-v2')

MAX_CHUNK_SIZE = int(os.getenv('MAX_CHUNK_SIZE', '1000'))
TEMP_DIR = os.getenv('TEMP_DIR', '/tmp')


LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
