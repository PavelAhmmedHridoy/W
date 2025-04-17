
import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import Split from '@uiw/react-split';
import './App.css';

const initialFiles = {
  'main.js': '// Welcome to React Code Compiler\nfunction greeting() {\n  return "Hello, World!";\n}\n\ngreeting();',
  'styles.css': '/* Add your styles here */',
  'index.html': '<!DOCTYPE html>\n<html>\n<body>\n  <div id="root"></div>\n</body>\n</html>'
};

const initialCode = `// Welcome to React Code Compiler
function greeting() {
  return "Hello, World!";
}

// Try running this code!
greeting();`;

export default function App() {
  const [files, setFiles] = useState(initialFiles);
  const [currentFile, setCurrentFile] = useState('main.js');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [aiResponses, setAiResponses] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. I aim to be clear, helpful, and honest in our interactions. How can I assist you today?' }
  ]);
  const fileInputRef = useRef(null);

  const handleTerminalCommand = (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.trim();
      if (command) {
        setTerminalHistory([...terminalHistory, command]);
        // Add basic command handling
        if (command === 'clear') {
          setTerminalHistory([]);
        } else if (command === 'ls') {
          setTerminalHistory([...terminalHistory, command, Object.keys(files).join('\n')]);
        } else if (command === 'help') {
          setTerminalHistory([...terminalHistory, command, 'Available commands: clear, ls, help']);
        } else {
          setTerminalHistory([...terminalHistory, command, `Command not found: ${command}`]);
        }
        setTerminalInput('');
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setFiles(prev => ({
        ...prev,
        [file.name]: e.target.result
      }));
      setCurrentFile(file.name);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const blob = new Blob([files[currentFile]], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAskAI = () => {
    setOutput("AI Assistant: How can I help you with your code today?");
  };

  const [aiMessage, setAiMessage] = useState('');
  const [activeTab, setActiveTab] = useState('console');

  const runCode = () => {
    setIsRunning(true);
    try {
      const result = eval(`
        try {
          ${files[currentFile]}
        } catch (error) {
          error.toString()
        }
      `);
      setOutput(result !== undefined ? String(result) : 'undefined');
    } catch (error) {
      setOutput(error.toString());
    }
    setIsRunning(false);
  };

  const handleAiChat = (message) => {
    // Simulate AI response
    setAiMessage("I am your AI assistant. I can help you with coding questions!");
  };

  return (
    <div className="replit-container">
      <div className="header">
        <div className="left">
          <span className="file-name">{currentFile}</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current.click()}>Upload</button>
          <button onClick={handleDownload}>Download</button>
          <button onClick={handleAskAI}>Ask AI</button>
        </div>
        <button 
          className={`run-button ${isRunning ? 'running' : ''}`}
          onClick={runCode}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>
      <Split mode="horizontal" className="split-pane">
        <Split mode="vertical" style={{ height: '100%' }}>
          <div className="file-explorer">
            <div className="files-header">Files</div>
            {Object.keys(files).map(filename => (
              <div
                key={filename}
                className={`file-item ${filename === currentFile ? 'active' : ''}`}
                onClick={() => setCurrentFile(filename)}
              >
                {filename}
              </div>
            ))}
          </div>
          <div className="editor-pane">
            <Editor
              height="100%"
              defaultLanguage={currentFile.endsWith('.js') ? 'javascript' : 
                             currentFile.endsWith('.css') ? 'css' : 
                             currentFile.endsWith('.html') ? 'html' : 'plaintext'}
              theme="vs-dark"
              value={files[currentFile]}
              onChange={(value) => setFiles(prev => ({ ...prev, [currentFile]: value }))}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>
        </Split>
        <div className="output-pane">
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'console' ? 'active' : ''}`}
              onClick={() => setActiveTab('console')}
            >
              Console
            </button>
            <button 
              className={`tab-button ${activeTab === 'terminal' ? 'active' : ''}`}
              onClick={() => setActiveTab('terminal')}
            >
              Terminal
            </button>
            <button 
              className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              AI Assistant
            </button>
          </div>
          <div className="output-content">
            <div className="console-tab" style={{ display: activeTab === 'console' ? 'block' : 'none' }}>
              <pre>{output}</pre>
            </div>
            <div className="terminal-tab" style={{ display: activeTab === 'terminal' ? 'block' : 'none' }}>
              <div className="terminal-history">
                {terminalHistory.map((entry, index) => (
                  <div key={index} className="terminal-entry">
                    <span className="prompt">$ </span>
                    <span>{entry}</span>
                  </div>
                ))}
              </div>
              <input 
                type="text" 
                className="terminal-input"
                placeholder="Enter command..."
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalCommand}
              />
            </div>
            <div className="ai-assistant-tab" style={{ display: activeTab === 'ai' ? 'block' : 'none' }}>
              <div className="chat-history">
                <div className="ai-message">Hello! I'm your AI assistant. How can I help you today?</div>
              </div>
              <div className="chat-input-container">
                <input 
                  type="text" 
                  className="chat-input"
                  placeholder="Ask me anything..."
                />
                <button className="send-button">Send</button>
              </div>
            </div>
          </div>
        </div>
      </Split>
    </div>
  );
}
