import React, { useState } from 'react';
import { Search, Loader2, Database, AlertTriangle, ShieldCheck, Zap, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';

interface RAGStats {
  total_docs_queried: number;
  docs_after_filtering: number;
  docs_after_reranking: number;
  vector_search_ms: number;
  rerank_time_ms: number;
  llm_generation_ms: number;
  total_latency_ms: number;
}

interface Citation {
  doc_id: string;
  doc_title: string;
  url?: string;
  text_snippet: string;
  relevance_score: number;
}

interface RAGResponse {
  success: boolean;
  answer: string | null;
  confidence: number;
  citations: Citation[];
  retrieval_stats: RAGStats;
  error?: string | null;
  suggestion?: string | null;
}

export const RagAgentView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState('knowledge_base');
  const [topK, setTopK] = useState(5);
  const [minRelevance, setMinRelevance] = useState(0.5);
  const [enableReranking, setEnableReranking] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RAGResponse | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);

    // Simulate RAG Agent Backend API call latency
    setTimeout(() => {
      const mockResponse: RAGResponse = {
        success: true,
        answer: `This is a synthesized answer from the nextjs-frontend-rag-agent based on retrieved context. The query was "${query}". The agent successfully found relevant documents in the "${collection}" collection and compiled this response. RAG techniques ensure that this generation is grounded in facts, mitigating hallucinations.`,
        confidence: 0.92,
        citations: [
          {
            doc_id: 'doc-101',
            doc_title: 'Sovereign Architecture Guidelines',
            text_snippet: 'RAG techniques ensure that this generation is grounded in facts...',
            relevance_score: 0.95
          },
          {
            doc_id: 'doc-204',
            doc_title: 'Agentic Workflows 2026',
            url: 'https://docs.context.locker/agentic-workflows',
            text_snippet: 'The agent successfully found relevant documents...',
            relevance_score: 0.88
          }
        ],
        retrieval_stats: {
          total_docs_queried: 1500,
          docs_after_filtering: 45,
          docs_after_reranking: topK,
          vector_search_ms: 120,
          rerank_time_ms: 85,
          llm_generation_ms: 450,
          total_latency_ms: 655
        }
      };

      if (query.toLowerCase().includes('error') || query.toLowerCase().includes('fail')) {
        setResult({
          success: false,
          answer: null,
          confidence: 0,
          citations: [],
          retrieval_stats: {
            total_docs_queried: 1500,
            docs_after_filtering: 0,
            docs_after_reranking: 0,
            vector_search_ms: 120,
            rerank_time_ms: 0,
            llm_generation_ms: 0,
            total_latency_ms: 120
          },
          error: "insufficient_context",
          suggestion: "Try rephrasing your query or selecting a different collection."
        });
      } else {
         setResult(mockResponse);
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 p-6 overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-sovereign" />
            RAG Agent Endpoint
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            nextjs-frontend-rag-agent (v3.0.0) • Composite Reflector + ToolUser
          </p>
        </div>
        <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-xs font-mono text-emerald-400">ONLINE</span>
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-0">
        {/* Left Column: Configuration & Search */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-zinc-500" />
              Retrieval Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Document Collection</label>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-sovereign/50 transition-colors"
                >
                  <option value="knowledge_base">knowledge_base</option>
                  <option value="support_docs">support_docs</option>
                  <option value="product_guides">product_guides</option>
                  <option value="custom_data">custom_data</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-zinc-500">Top K Documents</label>
                  <span className="text-xs text-zinc-400 font-mono">{topK}</span>
                </div>
                <input
                  type="range"
                  min="1" max="20"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full accent-sovereign"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-zinc-500">Min Relevance Score</label>
                  <span className="text-xs text-zinc-400 font-mono">{minRelevance.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0" max="1" step="0.05"
                  value={minRelevance}
                  onChange={(e) => setMinRelevance(parseFloat(e.target.value))}
                  className="w-full accent-sovereign"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enableReranking"
                  checked={enableReranking}
                  onChange={(e) => setEnableReranking(e.target.checked)}
                  className="accent-sovereign w-4 h-4 rounded bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="enableReranking" className="text-sm text-zinc-300">Enable LLM Re-ranking</label>
              </div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-2 mt-auto">
             <div className="relative">
               <textarea
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 placeholder="Enter query for RAG processing..."
                 className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-sovereign/50 transition-colors min-h-[100px] resize-none"
               />
               <button
                 type="submit"
                 disabled={!query.trim() || isLoading}
                 className="absolute bottom-3 right-3 bg-sovereign text-black p-2 rounded-lg hover:bg-sovereign/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
               </button>
             </div>
          </form>
        </div>

        {/* Right Column: Results */}
        <div className="w-2/3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 overflow-y-auto custom-scrollbar flex flex-col">
          {isLoading ? (
            <div className="m-auto flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-sovereign" />
              <p className="text-sm font-mono animate-pulse">Running retrieval-augmented generation...</p>
              <div className="mt-4 flex gap-2 text-xs opacity-60">
                 <span className="bg-zinc-800 px-2 py-1 rounded">Vector Search</span>
                 <ChevronRight className="w-4 h-4" />
                 <span className="bg-zinc-800 px-2 py-1 rounded">Re-ranking</span>
                 <ChevronRight className="w-4 h-4" />
                 <span className="bg-zinc-800 px-2 py-1 rounded">Synthesis</span>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in duration-300">
               {/* Status Header */}
               <div className={`p-4 rounded-lg border flex items-start gap-3 ${result.success ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-red-950/20 border-red-900/50'}`}>
                  {result.success ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                  <div className="flex-1">
                     <h3 className={`text-sm font-bold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                       {result.success ? 'Query Processed Successfully' : `Error: ${result.error}`}
                     </h3>
                     {!result.success && result.suggestion && (
                        <p className="text-sm text-zinc-400 mt-1">{result.suggestion}</p>
                     )}

                     {result.success && (
                       <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800/50">
                            <ShieldCheck className="w-3.5 h-3.5 text-sovereign" />
                            Confidence: {(result.confidence * 100).toFixed(1)}%
                         </div>
                         <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800/50">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            Latency: {result.retrieval_stats.total_latency_ms}ms
                         </div>
                       </div>
                     )}
                  </div>
               </div>

               {/* Generated Answer */}
               {result.answer && (
                 <div>
                   <h4 className="text-xs font-mono text-zinc-500 mb-2">SYNTHESIZED ANSWER</h4>
                   <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-200 leading-relaxed">
                     {result.answer}
                   </div>
                 </div>
               )}

               {/* Citations */}
               {result.citations && result.citations.length > 0 && (
                 <div>
                   <h4 className="text-xs font-mono text-zinc-500 mb-2">SOURCE CITATIONS</h4>
                   <div className="grid grid-cols-2 gap-3">
                     {result.citations.map((citation, idx) => (
                       <div key={idx} className="bg-zinc-950 border border-zinc-800 hover:border-sovereign/30 rounded-lg p-3 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                               <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                               <span className="text-xs font-bold text-zinc-300 truncate">{citation.doc_title}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 rounded text-sovereign font-mono shrink-0">
                               {(citation.relevance_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2 italic border-l-2 border-zinc-800 pl-2">
                            "{citation.text_snippet}"
                          </p>
                          <div className="mt-2 text-[10px] text-zinc-600 font-mono">ID: {citation.doc_id}</div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Telemetry/Stats */}
               <div>
                  <h4 className="text-xs font-mono text-zinc-500 mb-2">RETRIEVAL TELEMETRY</h4>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                     <div className="grid grid-cols-3 gap-y-4 gap-x-6 text-sm">
                        <div>
                          <div className="text-zinc-500 text-xs mb-1">Docs Queried</div>
                          <div className="text-zinc-200 font-mono">{result.retrieval_stats.total_docs_queried}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-xs mb-1">Post-Filter</div>
                          <div className="text-zinc-200 font-mono">{result.retrieval_stats.docs_after_filtering}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-xs mb-1">Reranked</div>
                          <div className="text-zinc-200 font-mono">{result.retrieval_stats.docs_after_reranking}</div>
                        </div>

                        <div className="col-span-3 h-px bg-zinc-800/50 my-1"></div>

                        <div>
                          <div className="text-zinc-500 text-xs mb-1">Vector Search</div>
                          <div className="text-zinc-300 font-mono">{result.retrieval_stats.vector_search_ms}ms</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-xs mb-1">LLM Rerank</div>
                          <div className="text-zinc-300 font-mono">{result.retrieval_stats.rerank_time_ms}ms</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-xs mb-1">Generation</div>
                          <div className="text-zinc-300 font-mono">{result.retrieval_stats.llm_generation_ms}ms</div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
          ) : (
            <div className="m-auto text-center max-w-sm text-zinc-500">
               <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <h3 className="text-lg font-bold text-zinc-400 mb-2">Awaiting Query</h3>
               <p className="text-sm">
                 Enter a search query to execute the retrieval-augmented generation pipeline.
                 The system will retrieve relevant context and synthesize a grounded answer.
               </p>
               <div className="mt-6 flex justify-center gap-2">
                 <span className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-500">Try query containing 'error' to test fallback</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
