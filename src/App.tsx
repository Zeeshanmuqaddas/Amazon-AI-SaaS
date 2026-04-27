import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, BarChart2, TrendingUp, TrendingDown, DollarSign, Target, ShoppingCart, Activity, AlertCircle, Percent, ArrowUpRight, CheckCircle2, Box } from 'lucide-react';
import { analyzeProduct, ProductAnalysis } from './lib/gemini';

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProductAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeProduct(query);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze product. Please check your data and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const ScoreCircle = ({ score }: { score: number }) => {
    const color = getScoreColor(score);
    // Simple SVG circle progress
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="text-zinc-800"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            className={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-mono font-bold ${color}`}>{score}</span>
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Score</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold tracking-tight text-lg">Amazon Product Intelligence</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              System Online
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search / Input Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
             Analyze <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Any Amazon Product</span>
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Input an ASIN or product search query to run our enterprise multi-agent analysis for market demand, pricing, and conversion viability.
          </p>

          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. B08N5WRWNW or 'MacBook Air M1'"
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-12 pr-32 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-xl shadow-black/20"
              disabled={isLoading}
            />
            <div className="absolute inset-y-2 right-2">
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="h-full px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </motion.div>

        {/* Results Dashboard */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="space-y-6"
            >
              {/* Product Header Card */}
              <div className="bg-zinc-900 border border-zinc-800/60 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                {/* Background glow decoration */}
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative z-10">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-mono rounded-md border border-zinc-700/50">
                        ASIN: {result.asin}
                      </span>
                      {result.market_analysis.trend_status === 'Rising' && (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-md border border-emerald-500/20 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Trending
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold font-sans text-zinc-100 leading-tight">
                      {result.product_name}
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-6 shrink-0 bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                    <ScoreCircle score={result.final_score} />
                    <div className="space-y-4">
                      <div>
                        <div className="text-zinc-500 text-xs tracking-wider uppercase mb-1">Recommendation</div>
                        <div className="font-medium text-zinc-200 flex items-start gap-2 max-w-[200px]">
                           {result.recommendation}
                        </div>
                      </div>
                      <a 
                        href={result.affiliate_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        View on Amazon
                        <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Layout for Agents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pricing Intelligence */}
                <motion.div className="bg-zinc-900 border border-zinc-800/60 rounded-3xl p-6 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      Pricing Analysis
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Current Price</div>
                      <div className="text-3xl font-mono text-zinc-100">{result.pricing_analysis.current_price}</div>
                    </div>
                    <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Avg Price</div>
                      <div className="text-3xl font-mono text-zinc-400">{result.pricing_analysis.avg_price}</div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <p className="text-sm text-blue-200/80">{result.pricing_analysis.price_drop_signal}</p>
                  </div>
                </motion.div>

                {/* Market Research */}
                <motion.div className="bg-zinc-900 border border-zinc-800/60 rounded-3xl p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                        <Activity className="w-5 h-5" />
                      </div>
                      Market Analysis
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                      <div className="text-sm text-zinc-400">Demand Level</div>
                      <div className="font-medium text-zinc-200">{result.market_analysis.demand_level}</div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                      <div className="text-sm text-zinc-400">Competition</div>
                      <div className="font-medium text-zinc-200">{result.market_analysis.competition_level}</div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                      <div className="text-sm text-zinc-400">Trend Status</div>
                      <div className="font-medium text-purple-400 flex items-center gap-2">
                        {result.market_analysis.trend_status === 'Rising' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4"/>}
                        {result.market_analysis.trend_status}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quality & Reviews */}
                <motion.div className="bg-zinc-900 border border-zinc-800/60 rounded-3xl p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      Quality & Reviews
                    </h3>
                  </div>
                  <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 flex flex-col gap-1 mb-4">
                    <div className="text-zinc-500 text-xs uppercase tracking-wider">Rating Summary</div>
                    <div className="text-lg font-medium text-zinc-200">{result.quality_analysis.rating_summary}</div>
                  </div>
                  <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 mb-4">
                    <p className="text-sm text-zinc-300 italic">"{result.quality_analysis.review_sentiment}"</p>
                  </div>
                  {result.quality_analysis.common_issues.length > 0 && (
                     <div className="space-y-2">
                       <div className="text-xs text-rose-400/80 uppercase tracking-wider font-semibold ml-1">Common Issues flagged:</div>
                       <ul className="space-y-2">
                         {result.quality_analysis.common_issues.map((issue, idx) => (
                           <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                             <AlertCircle className="w-4 h-4 text-rose-400/60 mt-0.5 shrink-0" />
                             {issue}
                           </li>
                         ))}
                       </ul>
                     </div>
                  )}
                </motion.div>

                {/* Conversion Optimization */}
                <motion.div className="bg-zinc-900 border border-zinc-800/60 rounded-3xl p-6 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                        <Target className="w-5 h-5" />
                      </div>
                      Conversion Analysis
                    </h3>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 mb-4">
                    <div className="text-sm text-zinc-400">Target Audience</div>
                    <div className="font-medium text-zinc-200">{result.conversion_analysis.target_audience}</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 mb-6">
                    <div className="text-sm text-zinc-400">Buy Probability</div>
                    <div className="font-medium text-amber-500 flex items-center gap-1">
                      <Percent className="w-4 h-4"/>
                      {result.conversion_analysis.buy_probability}
                    </div>
                  </div>

                  <div className="space-y-2">
                       <div className="text-xs text-emerald-400/80 uppercase tracking-wider font-semibold ml-1">Key Selling Points:</div>
                       <ul className="space-y-2">
                         {result.conversion_analysis.selling_points.map((point, idx) => (
                           <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 shrink-0" />
                             {point}
                           </li>
                         ))}
                       </ul>
                   </div>
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

