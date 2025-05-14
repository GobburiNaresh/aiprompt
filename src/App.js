import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [documentType, setDocumentType] = useState('');
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
    setResults(null);
    setError(null);
  };

  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
    setResults(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!documentType.trim()) {
      setError('Please enter a Document Type.');
      return;
    }
    if (files.length === 0) {
      setError('Please select at least one file.');
      return;
    }
    setProcessing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    formData.append('documentType', documentType.trim());

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // 3 minutes
      });
      if (response.data && response.data.success) {
        setResults(response.data.files);
      } else {
        setError(response.data.error || 'Unknown error from server');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <h1 style={styles.title}>Document Processor with OCR + AI Prompt</h1>

      <div style={styles.formGroup}>
        <label htmlFor="docType" style={styles.label}>Document Type (used to save/reuse prompt):</label>
        <input
          id="docType"
          type="text"
          value={documentType}
          onChange={handleDocumentTypeChange}
          placeholder="e.g. Invoice, Contract"
          style={styles.input}
          disabled={processing}
        />
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="fileInput" style={styles.label}>Select PNG, TIFF, JPG or JPEG files:</label>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          multiple
          accept=".png,.tiff,.tif,.jpeg,.jpg"
          style={styles.input}
          disabled={processing}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={processing}
        style={processing ? styles.buttonDisabled : styles.button}
      >
        {processing ? 'Processing...' : 'Upload & Process'}
      </button>

      {error && <p style={styles.errorText}>{error}</p>}

      {results && (
        <div style={styles.resultsContainer}>
          <h2>Results for Document Type: "{documentType.trim()}"</h2>

          {results.map((fileResult, idx) => (
            <div key={idx} style={styles.fileResult}>
              <h3>{fileResult.fileName}</h3>

              <div>
                <strong>Extracted Text (OCR):</strong><br />
                <pre style={styles.ocrText}>{fileResult.extractedText}</pre>
              </div>

              <div>
                <strong>AI-Generated Prompt {fileResult.promptCreated ? '(Newly Created Prompt)' : '(Reused Prompt)'}:</strong>
                <pre style={styles.promptText}>{fileResult.prompt}</pre>
              </div>

              <div>
                <strong>Extracted Key-Value Pairs:</strong>
                <pre style={styles.keyValueText}>
                  {typeof fileResult.keyValues === 'string'
                    ? fileResult.keyValues
                    : JSON.stringify(fileResult.keyValues, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer style={styles.footer}>
        <p>Powered by Tesseract.js OCR and OpenAI GPT-4</p>
      </footer>
    </div>
  );
}

const styles = {
  appContainer: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: 900,
    margin: '40px auto',
    padding: 20,
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    display: 'block',
    marginBottom: 8,
    color: '#222',
  },
  input: {
    width: '100%',
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 20px',
    fontSize: 18,
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    width: '100%',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#85b6ff',
    color: 'white',
    padding: '12px 20px',
    fontSize: 18,
    border: 'none',
    borderRadius: 4,
    width: '100%',
    marginTop: 10,
    cursor: 'not-allowed',
  },
  errorText: {
    marginTop: 20,
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 30,
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 20,
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  fileResult: {
    marginBottom: 40,
  },
  ocrText: {
    backgroundColor: '#eef2f7',
    maxHeight: 180,
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    padding: 10,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  promptText: {
    backgroundColor: '#dfefff',
    whiteSpace: 'pre-wrap',
    padding: 10,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
    marginTop: 6,
  },
  keyValueText: {
    backgroundColor: '#dff5df',
    whiteSpace: 'pre-wrap',
    padding: 10,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
    marginTop: 6,
  },
  footer: {
    marginTop: 50,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
};

export default App;
