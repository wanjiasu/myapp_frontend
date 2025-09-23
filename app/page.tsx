"use client";

import { useState, useEffect } from "react";
import { Heart, Sparkles, ListFilter, Newspaper, Send, Gift, Bot, X } from "lucide-react";

// Generate timestamps on client side to avoid hydration mismatch
const getClientTimestamp = (hoursOffset: number) => {
  if (typeof window === 'undefined') {
    return 0; // Return 0 on server side
  }
  return Date.now() + hoursOffset * 3600e3;
};

// Mock data
const bestBets = [
  {
    id: 'e1',
    league: 'THA League 1',
    teams: 'Buriram vs BG Pathum',
    recommendation: 85, // 推荐指数 0-100
    prediction: '主胜', // 胜负预测
    odds: 1.95, // 赔率
    reason: '主队近期 xG 2.0 对 1.1；盘口微降；赔率仍有 7% 价值'
  },
  {
    id: 'e2',
    league: 'Série A',
    teams: 'Flamengo vs Palmeiras',
    recommendation: 78,
    prediction: '主胜',
    odds: 2.10,
    reason: '主强客强但主场加成明显；平局保护'
  },
  {
    id: 'e3',
    league: 'LOL LCK',
    teams: 'GenG vs T1',
    recommendation: 72,
    prediction: 'GenG胜',
    odds: 1.80,
    reason: '近期对位强势与滚盘节奏优势'
  }
];

const matches = [
  {
    id: 'e1',
    ts: getClientTimestamp(2),
    sport: 'soccer',
    region: 'TH',
    league: 'THA League 1',
    home: 'Buriram United',
    away: 'BG Pathum United',
    odds: [1.85, 3.20, 4.50],
    ai: '主胜 61%',
    favIds: ['BUR']
  },
  {
    id: 'e2',
    ts: getClientTimestamp(9),
    sport: 'soccer',
    region: 'BR',
    league: 'Série A',
    home: 'Flamengo',
    away: 'Palmeiras',
    odds: [2.10, 3.40, 3.20],
    ai: '主胜 DNB 58%'
  },
  {
    id: 'e3',
    ts: getClientTimestamp(5),
    sport: 'soccer',
    region: 'EN',
    league: 'Premier League',
    home: 'Manchester City',
    away: 'Liverpool',
    odds: [2.25, 3.60, 2.90],
    ai: '主胜 55%'
  },
  {
    id: 'e4',
    ts: getClientTimestamp(26),
    sport: 'soccer',
    region: 'ES',
    league: 'La Liga',
    home: 'Real Madrid',
    away: 'Barcelona',
    odds: [2.40, 3.30, 2.80],
    ai: '客胜 52%'
  },
  {
    id: 'e5',
    ts: getClientTimestamp(1),
    sport: 'tennis',
    region: 'AR',
    league: 'ATP Challenger',
    home: 'Diaz',
    away: 'Gomez',
    odds: [1.70, '-', 2.20],
    ai: '主胜 56%'
  }
];

const articles = [
  {
    id: 201,
    title: '[TH] 今晚 3 场性价比汇总',
    tag: ['Value', '等效赔率'],
    date: typeof window !== 'undefined' ? new Date().toISOString() : ''
  },
  {
    id: 202,
    title: '[BR Série A] 主胜价值票：弗拉门戈 vs 帕尔梅拉斯',
    tag: ['主胜', '盘口背离'],
    date: typeof window !== 'undefined' ? new Date(Date.now() - 3600e3).toISOString() : ''
  },
  {
    id: 203,
    title: '[电竞] 今日 2 场稳胆 & 1 场冷门',
    tag: ['LOL', 'CS2'],
    date: typeof window !== 'undefined' ? new Date(Date.now() - 7200e3).toISOString() : ''
  }
];

export default function Home() {
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [filters, setFilters] = useState({
    time: '',
    league: '',
    search: ''
  });
  const [showDealModal, setShowDealModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('betaione:favTeams');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: {[key: string]: boolean}) => {
    setFavorites(newFavorites);
    localStorage.setItem('betaione:favTeams', JSON.stringify(newFavorites));
  };

  const toggleFavorite = (teamId: string) => {
    const newFavorites = { ...favorites };
    if (newFavorites[teamId]) {
      delete newFavorites[teamId];
    } else {
      newFavorites[teamId] = true;
    }
    saveFavorites(newFavorites);
  };

  const openDealModal = (matchId: string) => {
    setSelectedMatch(matchId);
    setShowDealModal(true);
  };

  const closeDealModal = () => {
    setShowDealModal(false);
    setSelectedMatch('');
  };

  // Filter matches
  const filteredMatches = matches.filter(match => {
    if (!isClient) return true;
    
    // 时间筛选
    if (filters.time) {
      const matchDate = new Date(match.ts);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      if (filters.time === 'today' && matchDate.toDateString() !== today.toDateString()) {
        return false;
      }
      if (filters.time === 'tomorrow' && matchDate.toDateString() !== tomorrow.toDateString()) {
        return false;
      }
      if (filters.time === 'week') {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);
        if (matchDate > weekFromNow) return false;
      }
    }
    
    // 联赛筛选
    if (filters.league && match.league !== filters.league) {
      return false;
    }
    
    // 搜索筛选
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (!match.home.toLowerCase().includes(searchTerm) && 
          !match.away.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(#0B1224, #0E1630)', color: '#E5EAF5'}}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur bg-[#0B1224]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-8 rounded-2xl overflow-hidden">
              <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A5B4FC"/>
                    <stop offset="100%" stopColor="#6EE7F9"/>
                  </linearGradient>
                </defs>
                <rect x="32" y="32" width="448" height="448" rx="96" fill="url(#g1)"/>
                <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" 
                      fontFamily="Inter,system-ui" fontWeight="900" fontSize="280" fill="#0B1224">β</text>
              </svg>
            </span>
            <b>Betaione</b>
            
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <a href="#best" className="hover:text-white">AI 最佳推荐</a>
            <a href="#all" className="hover:text-white">全部比赛</a>
            <a href="#consultation" className="hover:text-white">咨询中心</a>
            <a href="#promos" className="hover:text-white">活动</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#" className="btn btn-primary">登录</a>
          </div>
        </div>
      </header>

      {/* Top banners */}
      <section id="promos" className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="banner glass rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs opacity-70 mb-1">AI 投注助理</div>
              <div className="text-lg font-extrabold">添加 Telegram，领专属下注建议</div>
              <div className="text-xs opacity-70 mt-1">赛前提醒 · 实时盘口变动 · 风险提示</div>
            </div>
            <a href="https://t.me/" className="btn btn-primary whitespace-nowrap inline-flex items-center gap-2">
              <Send className="w-4 h-4" /> 立即添加
            </a>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at top, rgba(165,180,252,.18), transparent 60%)'}}></div>
        <div className="relative max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">所有比赛 · 一站式可下注</h1>
            <p className="mt-3 text-white/80">聚合主流联赛与电竞盘口，<b>AI 给出"最有把握"投注建议</b>，并提示"最划算渠道"。</p>
          </div>
          <aside className="glass rounded-2xl p-5">
            <div className="text-sm opacity-80 mb-2">AI 投注助理（Telegram）</div>
            <p className="text-sm text-white/75">把你关注的球队加到清单，AI 会根据盘口变动和历史模型，推送合适的下注窗口。</p>
            <a href="https://t.me/" className="btn btn-primary mt-3 w-full inline-flex items-center justify-center gap-2">
              <Bot className="w-4 h-4" /> 添加 Telegram
            </a>
            <p className="text-[11px] opacity-50 mt-2">* 请遵循当地法律与 18+ 责任博彩。</p>
          </aside>
        </div>
      </section>

      {/* AI Best Bets */}
      <section id="best" className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> AI 最有把握的投注
          </h2>
          <div className="text-xs opacity-70">实时性：</div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {bestBets.map((bet) => (
            <div key={bet.id} className="glass rounded-2xl p-4">
              <div className="text-xs opacity-70 mb-1">{bet.league}</div>
              <div className="font-bold">{bet.teams}</div>
              <div className="mt-1 text-sm">
                <span className="chip px-2 py-0.5 rounded">推荐指数 {bet.recommendation}%</span>
              </div>
              <div className="mt-2 text-sm">
                <b>预测：</b>{bet.prediction} · <span className="opacity-80">赔率：{bet.odds}</span>
              </div>
              <div className="mt-2 text-xs text-white/80">理由：{bet.reason}</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => openDealModal(bet.id)}
                >
                  去下注（最划算）
                </button>
                <a className="btn btn-secondary inline-flex items-center justify-center gap-2" href="https://t.me/">
                  <Send className="w-4 h-4" /> 让 AI 跟单
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Matches */}
      <section id="all" className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <ListFilter className="w-5 h-5" /> 全部比赛
          </h2>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4">
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="opacity-80 mb-1">时间</div>
              <select 
                className="w-full glass rounded-xl px-3 py-2"
                value={filters.time}
                onChange={(e) => setFilters({...filters, time: e.target.value})}
              >
                <option value="">全部</option>
                <option value="today">今天</option>
                <option value="tomorrow">明天</option>
                <option value="week">本周</option>
              </select>
            </div>
            <div>
              <div className="opacity-80 mb-1">联赛</div>
              <select 
                className="w-full glass rounded-xl px-3 py-2"
                value={filters.league}
                onChange={(e) => setFilters({...filters, league: e.target.value})}
              >
                <option value="">全部</option>
                <option value="Premier League">Premier League</option>
                <option value="La Liga">La Liga</option>
                <option value="Série A">Série A</option>
                <option value="THA League 1">THA League 1</option>
              </select>
            </div>
            <div>
              <div className="opacity-80 mb-1">搜索</div>
              <input 
                type="text"
                placeholder="搜索队伍..."
                className="w-full glass rounded-xl px-3 py-2"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 glass rounded-2xl overflow-x-auto">
          <table className="min-w-full text-sm table">
            <thead className="text-white/80">
              <tr className="border-b border-white/10">
                <th className="text-left">日期</th>
                <th className="text-left">时间</th>
                <th className="text-left">联赛</th>
                <th className="text-left">对阵</th>
                <th className="text-left">主胜</th>
                <th className="text-left">平</th>
                <th className="text-left">客胜</th>
                <th className="text-left">AI</th>
                <th className="text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match) => {
                const matchTime = isClient ? new Date(match.ts) : new Date();
                const isFav = favorites[match.home];
                const oddsFormatted = match.odds.map(o => o === '-' ? '-' : Number(o).toFixed(2));
                
                return (
                  <tr key={match.id} className="border-b border-white/10">
                    <td>{isClient ? matchTime.toLocaleDateString() : '--/--/--'}</td>
                    <td>{isClient ? matchTime.toTimeString().slice(0, 5) : '--:--'}</td>
                    <td>{match.league}</td>
                    <td className="whitespace-nowrap">
                      <button 
                        className={`mr-2 ${isFav ? 'fav-on' : ''}`}
                        onClick={() => toggleFavorite(match.home)}
                        title={isFav ? '已关注' : '关注'}
                      >
                        <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                      <span>{match.home} <span className="opacity-60">vs</span> {match.away}</span>
                    </td>
                    <td>{oddsFormatted[0]}</td>
                    <td>{oddsFormatted[1]}</td>
                    <td>{oddsFormatted[2]}</td>
                    <td>{match.ai || ''}</td>
                    <td>
                      <button 
                        className="btn btn-secondary text-xs"
                        onClick={() => openDealModal(match.id)}
                      >
                        最划算渠道
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Consultation center */}
      <section id="consultation" className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Newspaper className="w-5 h-5" /> 咨询中心
          </h2>
          <div className="text-xs opacity-70">支持自动更新到此区域</div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {articles.map((article) => (
            <a key={article.id} href="#" className="glass rounded-2xl p-4 block hover:border-white/30">
              <div className="text-xs opacity-70 mb-1">
                {isClient && article.date ? new Date(article.date).toLocaleString('zh-CN') : '加载中...'}
              </div>
              <div className="font-bold mb-2">{article.title}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {article.tag.map((tag, index) => (
                  <span key={index} className="chip px-2 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-white/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="chip px-2 py-0.5 rounded">18+ 责任博彩</span>
              <span className="chip px-2 py-0.5 rounded">SEA & LATAM</span>
              <a className="chip px-2 py-0.5 rounded" href="https://t.me/">Telegram</a>
            </div>
            <div className="text-xs opacity-60">演示页面 · 数据为示例 · 请遵循当地法律</div>
          </div>
        </div>
      </footer>

      {/* Modal: 渠道选择 / 最划算 */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101830] rounded-2xl max-w-lg w-full p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">最划算渠道</div>
              <button onClick={closeDealModal} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { name: '1xBet', odds: '1.95', promo: '首充100% / 变体：等效 2.05', link: '#' },
                { name: 'Parimatch', odds: '1.93', promo: '返现 10% / 等效 2.02', link: '#' },
                { name: 'Betano', odds: '1.92', promo: '串关加成 5% / 等效 2.01', link: '#' }
              ].map((book, index) => (
                <div key={index} className="glass rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{book.name}</div>
                    <div className="text-xs opacity-70">赔率 {book.odds} · {book.promo}</div>
                  </div>
                  <a href={book.link} className="btn btn-primary text-sm">前往</a>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/50 mt-3">根据渠道福利与当前赔率折算为"等效赔率"。</p>
          </div>
        </div>
      )}
    </div>
  );
}
