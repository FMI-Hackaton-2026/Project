import os
import requests
from tika import parser
import nltk
from app.config import TEMP_DIR
import pandas as pd
from docx import Document
import json

nltk.download('punkt', quiet=True)



def extract_text_from_file(file_path):
    file_extension = os.path.splitext(file_path)[1].lower()
    text = None

    if file_extension == '.pdf':
        parsed = parser.from_file(file_path)
        text = parsed.get('content')
    elif file_extension == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
    elif file_extension in ['.doc', '.docx']:
        doc = Document(file_path)
        text = '\n'.join([para.text for para in doc.paragraphs])
    elif file_extension == '.csv':
        df = pd.read_csv(file_path)
        text = df.to_string()
    elif file_extension == '.json':
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            text = json.dumps(data)
    else:
        parsed = parser.from_file(file_path)
        text = parsed.get('content')

    if text:
        return text.strip()
    else:
        raise Exception(f"No text could be extracted from {file_path}")

def chunk_text(text, max_chunk_size=1000, overlap=200):
    """
    Chunk text into smaller parts for vector embedding with a sliding window (overlap).
    Breaks cleanly at sentence boundaries.
    """
    sentences = nltk.sent_tokenize(text)
    chunks = []
    current_chunk_sentences = []
    current_length = 0

    for sentence in sentences:
        sentence_len = len(sentence)
        if current_length + sentence_len + (1 if current_length > 0 else 0) <= max_chunk_size:
            current_chunk_sentences.append(sentence)
            current_length += sentence_len + (1 if current_length > 0 else 0)
        else:
            if current_chunk_sentences:
                chunks.append(' '.join(current_chunk_sentences))
            
            # Start a new chunk with trailing sentences to satisfy the overlap requirement
            overlap_sentences = []
            overlap_length = 0
            
            for s in reversed(current_chunk_sentences):
                s_len = len(s) + (1 if overlap_length > 0 else 0)
                if overlap_length + s_len <= overlap:
                    overlap_sentences.insert(0, s)
                    overlap_length += s_len
                else:
                    break
            
            current_chunk_sentences = overlap_sentences + [sentence]
            current_length = sum(len(s) for s in current_chunk_sentences) + len(current_chunk_sentences) - 1

    if current_chunk_sentences:
        chunks.append(' '.join(current_chunk_sentences))

    return chunks
