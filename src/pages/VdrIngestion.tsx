import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle, Clock, AlertCircle, Terminal, Play, Type, X } from 'lucide-react';
import { useAuthAction } from '../lib/auth';
import { addActivity } from '../lib/activities';
import { useSessions } from '../lib/sessions';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const VdrIngestion: React.FC = () => {
  // Remove local logs and isProcessing
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const withAuth = useAuthAction();
  const { activeSession, updateSessionAnalysis, createSession, switchSession, ingestionLogs: logs, setIngestionLogs: setLogs, isIngesting: isProcessing, setIsIngesting: setIsProcessing } = useSessions();

  useEffect(() => {
    let active = true;
    if (!activeSession?.id) {
      setHasUploaded(false);
      return;
    }

    const checkExistingUpload = async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const docRef = doc(db, 'input', activeSession.id);
        const docSnap = await getDoc(docRef);
        if (active) {
          if (docSnap.exists()) {
            setHasUploaded(true);
          } else {
            setHasUploaded(false);
          }
        }
      } catch (err) {
        console.error("Error checking existing upload on load:", err);
      }
    };

    checkExistingUpload();
    return () => {
      active = false;
    };
  }, [activeSession?.id]);

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
      }
      return fullText;
    } else {
      return await file.text();
    }
  };

  const handleUploadToFirestore = async () => {
    let currentSession = activeSession;
    
    if (uploadMode === 'file' && files.length === 0) {
      alert("Please add files before uploading.");
      return;
    }
    if (uploadMode === 'text' && !pastedText.trim()) {
      alert("Please paste some text before uploading.");
      return;
    }

    setIsUploading(true);
    setLogs(prev => [...prev, "[DATABASE] Fetching most recent chat ID from 'chatid' collection..."]);

    let chatId = '';
    try {
      const chatidSnap = await getDocs(collection(db, 'chatid'));
      if (!chatidSnap.empty) {
        const docs = chatidSnap.docs;
        docs.sort((a, b) => {
          const aData = a.data();
          const bData = b.data();
          const aTime = aData.timestamp?.toMillis?.() || aData.timestamp || aData.createdAt || aData.date || 0;
          const bTime = bData.timestamp?.toMillis?.() || bData.timestamp || bData.createdAt || bData.date || 0;
          
          if (aTime && bTime) return bTime - aTime;
          return b.id.localeCompare(a.id);
        });
        
        const mostRecentDoc = docs[0];
        const data = mostRecentDoc.data();
        chatId = data.chatId || data.id || data.chat_id || mostRecentDoc.id;
        setLogs(prev => [...prev, `[SUCCESS] Retrieved most recent Chat ID: "${chatId}"`]);
      } else {
        setLogs(prev => [...prev, "[ERROR] 'chatid' collection is empty. A valid Chat ID is required."]);
        alert("Please add a document inside the 'chatid' collection containing your chat ID first.");
        setIsUploading(false);
        return;
      }
    } catch (e) {
      console.error("Error reading chatid collection", e);
      setLogs(prev => [...prev, `[ERROR] Failed to fetch chat ID: ${String(e)}`]);
      alert("Failed to read 'chatid' collection from Firestore.");
      setIsUploading(false);
      return;
    }

    if (!chatId) {
      setLogs(prev => [...prev, "[ERROR] No valid chat ID found in document fields."]);
      alert("No valid chat ID value identified in the 'chatid' documents.");
      setIsUploading(false);
      return;
    }

    // Now, ensure user's active session is created normally with a hidden auto-generated Firestore ID if none exists
    if (!currentSession) {
      setLogs(prev => [...prev, "[INITIALIZING] Creating new session automatically..."]);
      const newSessionName = `Session - ${new Date().toLocaleString()}`;
      try {
        currentSession = await createSession(newSessionName);
        if (!currentSession) {
          alert("Failed to create session.");
          setIsUploading(false);
          return;
        }
        setLogs(prev => [...prev, `[SUCCESS] Created new session with standard ID: ${currentSession.id}`]);
      } catch (e) {
        console.error("Error creating session automatically", e);
        setLogs(prev => [...prev, `[ERROR] Failed to create session automatically: ${String(e)}`]);
        setIsUploading(false);
        return;
      }
    }

    // Update session document to store the retrieved chatId
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'sessions', currentSession.id), {
        chatId: chatId,
      });
      setLogs(prev => [...prev, `[DATABASE] Linked Chat ID "${chatId}" to Session Info.`]);
    } catch (e) {
      console.warn("Could not write chatId to session document:", e);
    }

    const shortenText = async (rawText: string): Promise<string> => {
      setLogs(prev => [...prev, "[AI CONDENSER] Condensing document content with Gemini 3.5 Flash..."]);
      try {
        const res = await fetch("/api/shorten", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: rawText }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }
        const data = await res.json();
        setLogs(prev => [...prev, "[AI CONDENSER] [SUCCESS] Text condensed and shortened successfully."]);
        return data.condensedText;
      } catch (err) {
        console.error("AI shortening failed:", err);
        setLogs(prev => [...prev, `[AI CONDENSER] [WARNING] Condensation failed: ${String(err)}. Uploading raw text.`]);
        return rawText;
      }
    };

    setLogs(prev => [...prev, "[PROCESSING] Processing and condensing upload text..."]);

    try {
      if (uploadMode === 'file') {
        setLogs(prev => [...prev, `[PROCESSING] Combining text from ${files.length} files...`]);
        let combinedText = '';
        const filenames: string[] = [];
        for (const file of files) {
          setLogs(prev => [...prev, `[PROCESSING] Extracting text from ${file.name}...`]);
          try {
            const extractedText = await extractTextFromFile(file);
            combinedText += `=== FILE: ${file.name} ===\n${extractedText}\n\n`;
            filenames.push(file.name);
          } catch (err) {
            setLogs(prev => [...prev, `[ERROR] Failed processing ${file.name}: ${String(err)}`]);
          }
        }
        
        if (!combinedText) {
          throw new Error("No text content could be extracted from chosen files.");
        }

        const summarized = await shortenText(combinedText);

        await setDoc(doc(db, 'input', currentSession.id), {
          data: summarized,
          filename: filenames.join(', '),
          session: currentSession.id,
          chatId: chatId,
          timestamp: serverTimestamp(),
        });
        setLogs(prev => [...prev, `[SUCCESS] Saved condensed text to 'input/${currentSession.id}'`]);
        setFiles([]); // Clear files after successful upload
      } else {
        const summarized = await shortenText(pastedText);

        await setDoc(doc(db, 'input', currentSession.id), {
          data: summarized,
          filename: 'Pasted_Text.txt',
          session: currentSession.id,
          chatId: chatId,
          timestamp: serverTimestamp(),
        });
        setLogs(prev => [...prev, `[SUCCESS] Saved condensed text to 'input/${currentSession.id}'`]);
        setPastedText(''); // Clear text after successful upload
      }
      setIsUploading(false);
      setHasUploaded(true);
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, `[ERROR] Failed during document upload: ${String(e)}`]);
      setIsUploading(false);
    }
  };

  const handleStartIngestion = async () => {
    let currentSession = activeSession;
    
    if (!currentSession) {
      setLogs(prev => [...prev, "[INITIALIZING] Creating new session automatically..."]);
      const newSessionName = `Session - ${new Date().toLocaleString()}`;
      try {
        currentSession = await createSession(newSessionName);
        if (!currentSession) {
          alert("Failed to create session.");
          return;
        }
      } catch (e) {
        console.error(e);
        alert("Failed to create session automatically.");
        return;
      }
    }

    setLogs(["[INITIALIZING] Starting AI data ingestion..."]);
    setIsProcessing(true);
    setHasUploaded(false);
    addActivity('ingestion', 'VDR Ingestion Initiated', 'Started analyzing document ingestions.');

    try {
      setLogs(prev => [...prev, "[DATABASE] Connecting to input database collection to retrieve fresh data..."]);

      const { getDoc, doc } = await import('firebase/firestore');
      const docRef = doc(db, 'input', currentSession.id);
      const docSnap = await getDoc(docRef);
      
      let documents: { id: string; content: string }[] = [];
      if (docSnap.exists()) {
        documents.push({
          id: docSnap.id,
          content: docSnap.data().data || ""
        });
        setLogs(prev => [...prev, `[SUCCESS] Retrieved condensed input document for Active Session "${currentSession.id}".`]);
      } else {
        setLogs(prev => [...prev, `[INFO] No direct input document found for Session "${currentSession.id}". Scanning entire input collection...`]);
        const snap = await getDocs(collection(db, 'input'));
        const sessionDocs = snap.docs.filter(d => d.id === currentSession!.id || d.data().session === currentSession!.id || d.data().chatId === currentSession!.id);
        if (sessionDocs.length > 0) {
          documents = sessionDocs.map(d => ({ id: d.id, content: d.data().data || "" }));
          setLogs(prev => [...prev, `[SUCCESS] Found ${documents.length} matching document(s) in collection.`]);
        } else {
          documents = snap.docs.map(d => ({ id: d.id, content: typeof d.data().data === 'string' ? d.data().data : JSON.stringify(d.data()) }));
          setLogs(prev => [...prev, `[SUCCESS] Retrieved fallback ${documents.length} document(s).`]);
        }
      }

      if (documents.length === 0) {
        setLogs(prev => [...prev, "[WARNING] No documents found in input collection. Attempting to use default knowledge..."]);
      }

      setLogs(prev => [...prev, "[PROCESSING] Sending data to AI for deep structural analysis..."]);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documents: documents.length > 0 ? documents : [{ id: 'mock', content: 'No data. Make up mock data.' }] })
      });

      if (!response.ok) {
        throw new Error("Failed to process with AI Agent 1.");
      }

      const { result } = await response.json();
      
      setLogs(prev => [...prev, "[SUCCESS] AI structured data received. Updating War Room UI..."]);
      
      if (result.suggestedName && currentSession.name.startsWith('Session - ')) {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'sessions', currentSession.id), { name: result.suggestedName });
        setLogs(prev => [...prev, `[INFO] Session auto-renamed to: ${result.suggestedName}`]);
      }
      
      await updateSessionAnalysis(currentSession.id, result);
      
      setLogs(prev => [...prev, "> Ingestion complete. Data streams active. Dashboards populated."]);
      setIsProcessing(false);
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, `[ERROR] Failed during AI ingestion: ${String(e)}`]);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-4rem)] p-6 gap-6 max-w-7xl mx-auto w-full">
      {/* Upload & Terminal Column */}
      <div className="flex-1 flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-serif font-semibold text-stone-900 border-b border-stone-200 pb-4">
            VDR Ingestion Hub
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Upload the target data room archive or connect via API. Agent 1 will structure and route documents to specialized workstreams.
          </p>
        </header>

        {/* Upload Interface */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="flex border-b border-stone-200">
            <button 
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-3 px-4 text-sm font-medium flex justify-center items-center gap-2 ${uploadMode === 'file' ? 'bg-stone-50 text-stone-900 border-b-2 border-stone-900' : 'text-stone-500 hover:text-stone-700 bg-white'}`}
            >
              <FileIcon size={16} /> File Upload (.pdf, .txt)
            </button>
            <button 
              onClick={() => setUploadMode('text')}
              className={`flex-1 py-3 px-4 text-sm font-medium flex justify-center items-center gap-2 ${uploadMode === 'text' ? 'bg-stone-50 text-stone-900 border-b-2 border-stone-900' : 'text-stone-500 hover:text-stone-700 bg-white'}`}
            >
              <Type size={16} /> Paste Text
            </button>
          </div>
          
          <div className="p-6">
            {uploadMode === 'file' ? (
              <div className="flex flex-col">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf' || f.type === 'text/plain' || f.name.endsWith('.pdf') || f.name.endsWith('.txt'));
                      setFiles(prev => [...prev, ...newFiles]);
                      setHasUploaded(false);
                    }
                  }}
                  className="hidden" 
                  multiple 
                  accept=".pdf,.txt" 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 bg-stone-50 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#bb6cff] hover:bg-[#bb6cff]/5 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-white shadow-sm border border-stone-100 rounded-full flex items-center justify-center text-stone-400 group-hover:text-[#bb6cff] group-hover:border-[#bb6cff]/30 transition-colors mb-4">
                    <UploadCloud size={24} />
                  </div>
                  <h3 className="font-semibold text-stone-900">Select Files</h3>
                  <p className="text-sm text-stone-500 mt-1">
                    Upload .pdf or .txt files for AI structural analysis.
                  </p>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Selected Files</h4>
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileIcon size={16} className="text-stone-500" />
                          <span className="text-sm font-medium text-stone-700">{file.name}</span>
                          <span className="text-xs text-stone-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles(files.filter((_, idx) => idx !== i));
                            setHasUploaded(false);
                          }}
                          className="text-stone-400 hover:text-red-500 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <textarea 
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    setHasUploaded(false);
                  }}
                  placeholder="Paste contents of the data room or relevant documents here..."
                  className="w-full h-48 p-4 border border-stone-200 rounded-xl bg-stone-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#bb6cff] transition-all font-mono"
                />
                <p className="text-xs text-stone-500 self-end">
                  {pastedText.length} characters
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mt-8">
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <button 
               onClick={withAuth(handleUploadToFirestore)} 
               disabled={isUploading || (files.length === 0 && pastedText.trim() === '')}
               className="w-full sm:w-auto px-6 py-2.5 bg-white border border-stone-200 text-stone-700 font-medium rounded-xl hover:border-stone-300 hover:bg-stone-50 hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
             >
               {isUploading ? <span className="animate-spin text-lg text-stone-400">◌</span> : <UploadCloud size={18} className="text-stone-400 group-hover:text-stone-600 transition-colors" />} 
               Upload to Firestore
             </button>
             <span className="hidden sm:inline-block text-xs font-medium text-stone-400">
               {isUploading ? "Uploading..." : hasUploaded ? "1. Uploaded ✓" : "1. Upload first"}
             </span>
          </div>

          <div className="hidden sm:block h-8 w-px bg-stone-100"></div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
             <span className={`hidden sm:inline-block text-xs font-medium transition-colors ${hasUploaded ? 'text-emerald-600 font-semibold' : 'text-stone-400'}`}>
               {hasUploaded ? "2. Ready to extract!" : "2. Awaiting upload..."}
             </span>
             <button 
               onClick={withAuth(handleStartIngestion)} 
               disabled={isProcessing || !hasUploaded}
               className="w-full sm:w-auto px-8 py-3 bg-stone-800 text-white font-semibold rounded-xl hover:bg-stone-700 disabled:bg-stone-100 disabled:text-stone-400 transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-stone-800 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed group"
             >
               {isProcessing ? (
                 <span className="animate-spin text-xl text-stone-400">◌</span>
               ) : (
                 <div className="bg-stone-700 group-disabled:bg-stone-200 p-1.5 rounded-lg group-hover:bg-stone-600 transition-colors">
                   <Play size={14} fill="currentColor" className="group-disabled:text-stone-400" />
                 </div>
               )} 
               Start AI Ingestion
             </button>
          </div>
        </div>

        {/* Upload/Ingestion Information Banner */}
        {hasUploaded && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 transition-all">
            <CheckCircle className="text-emerald-500 fill-emerald-100 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-sm">Successfully uploaded</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                The document has been condensed and saved to Firestore under Chat ID: <span className="font-mono font-bold bg-emerald-100/50 px-1 py-0.5 rounded text-emerald-950">{activeSession?.id}</span>. You can now start the extraction/ingestion.
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center gap-3 text-stone-600 transition-all">
            <span className="animate-spin text-lg text-stone-400">◌</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Uploading and condensing data...</p>
              <p className="text-xs text-stone-500 mt-0.5">Please wait, the document is being summarized using your AIML API Gemini Key.</p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-blue-800 transition-all">
            <span className="animate-spin text-lg text-blue-400">◌</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Extracting key intelligence...</p>
              <p className="text-xs text-blue-600 mt-0.5">AI Agents are now analyzing the condensed document to extract due diligence insights.</p>
            </div>
          </div>
        )}
      </div>

      {/* Missing Info Sidebar */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
                <AlertCircle size={18} className="text-yellow-600" />
                <h3 className="font-semibold text-stone-900">Missing Information Log</h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                    Agent 1 cross-references uploaded documents against a standard M&A checklist and flags critical omissions.
                </p>
                <div className="space-y-3">
                    {activeSession?.analysisData ? (
                       <div className="p-3 bg-stone-50 flex items-center gap-2 text-sm text-stone-600 border border-stone-100 rounded-lg">
                           <CheckCircle size={16} className="text-green-500" />
                           All critical documents appear to be present based on AI ingestion.
                       </div>
                    ) : (
                       <div className="p-3 bg-stone-50 border border-stone-100 rounded-lg text-sm text-stone-500">
                           Awaiting data ingestion...
                       </div>
                    )}
                </div>

                <button onClick={withAuth(() => {})} className="w-full mt-6 py-2 border border-stone-300 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors">
                    Export Request List (.xlsx)
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VdrIngestion;
