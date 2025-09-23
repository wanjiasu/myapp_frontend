"use client";

import { useState, useEffect } from "react";
import { Heart, Sparkles, ListFilter, Newspaper, Send, Gift, Bot, X, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import TelegramQRModal from "@/components/telegram-qr-modal";

// Generate timestamps on client side to avoid hydration mismatch
const getClientTimestamp = (hoursOffset: number) => {
  if (typeof window === 'undefined') {
    return 0; // Return 0 on server side
  }
  return Date.now() + hoursOffset * 3600e3;
};

// AI推荐数据接口
interface AIRecommendation {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  odds: {
    home_avg: number;
    draw_avg: number;
    away_avg: number;
    statistics: {
      total_bookmakers: number;
      home_bookmakers_count: number;
      draw_bookmakers_count: number;
      away_bookmakers_count: number;
    };
  };
  fixture_date: string;
  recommendation_index: number;
  analysis: string;
  prediction_result: string;
}

// 比赛数据接口
interface Match {
  id: string;
  date: string;
  time: string;
  league: string;
  home_team: string;
  away_team: string;
  home_odds: number;
  draw_odds: number;
  away_odds: number;
  ai_prediction: string;
  is_recommended: boolean;
  analysis: string;
  fixture_date: string;
  recommendation_index: number;
}

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
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // 获取AI推荐数据
  const fetchAIRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/ai-recommendations`);
      if (response.ok) {
        const data = await response.json();
        setAiRecommendations(data);
      } else {
        console.error('Failed to fetch AI recommendations:', response.statusText);
        // 如果API失败，使用mock数据
        setAiRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      // 如果API失败，使用mock数据
      setAiRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // 获取比赛数据
  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/matches`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      } else {
        console.error('Failed to fetch matches:', response.statusText);
        // 如果API失败，使用空数组
        setMatches([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      // 如果API失败，使用空数组
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleTelegramClick = () => {
    if (!user) {
      // 未登录，跳转到登录页面
      window.location.href = '/login';
    } else {
      // 已登录，显示二维码弹窗
      setShowTelegramModal(true);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    // 获取用户会话信息
    const getSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser(session.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to get session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();
    // 获取AI推荐数据
    fetchAIRecommendations();
    // 获取比赛数据
    fetchMatches();
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
      const matchDate = new Date(match.fixture_date);
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
      if (!match.home_team.toLowerCase().includes(searchTerm) && 
          !match.away_team.toLowerCase().includes(searchTerm)) {
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
            <img src="/logo.png" alt="BetAIOne Logo" className="w-8 h-8 rounded-2xl" />
            <b>BetAIOne</b>
            
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <a href="#best" className="hover:text-white">AI 最佳推荐</a>
            <a href="#all" className="hover:text-white">全部比赛</a>
            <a href="#consultation" className="hover:text-white">咨询中心</a>
            <a href="#promos" className="hover:text-white">活动</a>
          </nav>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="text-sm opacity-70">加载中...</div>
            ) : user ? (
              <div className="relative">
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={() => setShowDropdown(true)}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{user.name || user.email}</div>
                  </div>
                </div>
                
                {/* 下拉菜单 */}
                {showDropdown && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-50"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors"
                      >
                        <LogOut size={16} />
                        登出
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login" className="btn btn-primary">登录</a>
            )}
          </div>
        </div>
      </header>

      {/* Top banners */}
      <section id="promos" className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="banner glass rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs opacity-70 mb-1">AI 投注助理</div>
              <div className="text-base font-extrabold">添加 Telegram，领专属下注建议</div>
              <div className="text-xs opacity-70 mt-1">赛前提醒 · 实时盘口变动 · 风险提示</div>
            </div>
            <button 
              className="btn btn-primary whitespace-nowrap inline-flex items-center gap-2 text-sm"
              onClick={handleTelegramClick}
            >
              <Send className="w-4 h-4" /> 立即添加
            </button>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at top, rgba(165,180,252,.18), transparent 60%)'}}></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">所有比赛 · 一站式可下注</h1>
            <p className="mt-3 text-white/80 text-sm md:text-base">聚合主流联赛与电竞盘口，<b>AI 给出"最有把握"投注建议</b>，并提示"最划算渠道"。</p>
          </div>
          <aside className="glass rounded-xl p-4">
            <div className="text-sm opacity-80 mb-2">AI 投注助理（Telegram）</div>
            <p className="text-sm text-white/75">把你关注的球队加到清单，AI 会根据盘口变动和历史模型，推送合适的下注窗口。</p>
            <button 
              className="btn btn-primary mt-3 w-full inline-flex items-center justify-center gap-2 text-sm"
              onClick={handleTelegramClick}
            >
              <Bot className="w-4 h-4" /> 添加 Telegram
            </button>
            <p className="text-[11px] opacity-50 mt-2">* 请遵循当地法律与 18+ 责任博彩。</p>
          </aside>
        </div>
      </section>

      {/* AI Best Bets */}
      <section id="best" className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI 最有把握的投注
          </h2>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            实时数据（来自 PostgreSQL）
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center max-w-6xl mx-auto">
          {loadingRecommendations ? (
            // 加载状态
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl transition-all duration-300" style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}>
                {/* 渐变边框效果 */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-500 opacity-80"></div>
                <div className="p-4">
                  <div className="text-center text-gray-400 py-6 flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                    <span className="text-sm">正在获取最新推荐...</span>
                  </div>
                </div>
              </div>
            ))
          ) : aiRecommendations.length > 0 ? (
            // 使用真实数据
            aiRecommendations.map((recommendation) => {
              // 根据 predicted_result 确定哪个队伍应该高亮
              const getHighlightedTeam = (predictedResult: string, homeTeam: string, awayTeam: string) => {
                const result = predictedResult.toLowerCase()
                if (result.includes('home') || result.includes('主')) {
                  return 'home'
                } else if (result.includes('away') || result.includes('客')) {
                  return 'away'
                }
                return 'none'
              }
              
              const highlightedTeam = getHighlightedTeam(recommendation.prediction_result, recommendation.home_team, recommendation.away_team)
              
              return (
                <div key={recommendation.id} className="relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-0.5 hover:shadow-xl" style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(14px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                }}>
                  {/* 渐变边框效果 */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-500 opacity-80"></div>
                  {/* 紧迫感指示器 */}
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs font-bold px-2 py-1 rounded-bl-md flex items-center gap-1">
                    <span className="animate-pulse text-xs">🔥</span>
                    限时推荐
                  </div>
                  
                  <div className="p-4">
                    {/* League Name */}
                    <div className="text-xs text-gray-400 mb-2 font-medium">{recommendation.league}</div>
                    
                    {/* 高亮队伍名称 */}
                    <div className="mb-3">
                      <span className={`text-base font-bold transition-all duration-200 ${highlightedTeam === 'home' ? 'text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/30' : 'text-white'}`}>
                        {recommendation.home_team}
                      </span>
                      <span className="text-gray-400 mx-1.5 text-base font-light"> vs </span>
                      <span className={`text-base font-bold transition-all duration-200 ${highlightedTeam === 'away' ? 'text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/30' : 'text-white'}`}>
                        {recommendation.away_team}
                      </span>
                    </div>
                    
                    {/* 增强的统计数据显示 */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1 transition-all duration-200 hover:scale-105">
                        <span className="text-sm">🎯</span>
                        推荐指数 {Math.round(recommendation.recommendation_index * 100)}
                      </div>
                      {recommendation.prediction_result && (
                        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 px-2 py-1 rounded-full text-xs font-bold border border-indigo-500/30 flex items-center gap-1 transition-all duration-200 hover:scale-105">
                          <span className="text-sm">⚡</span>
                          {recommendation.prediction_result}
                        </div>
                      )}
                    </div>

                    {/* 赔率分析 */}
                    <div className="text-xs text-gray-300 mb-3 bg-gray-800/20 rounded-lg p-2.5 border border-gray-700/30">
                      <div className="font-medium text-white mb-1.5 flex items-center gap-1.5">
                        <span className="text-sm">📊</span>
                        赔率分析
                      </div>
                      <div className="font-mono text-gray-200 text-xs">主 {recommendation.odds.home_avg.toFixed(2)} / 平 {recommendation.odds.draw_avg.toFixed(2)} / 客 {recommendation.odds.away_avg.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <span>⏰</span>
                        比赛时间: {new Date(recommendation.fixture_date).toLocaleString('zh-CN')}
                      </div>
                    </div>

                    {/* 推荐分析 */}
                    <div className="text-xs text-gray-400 mb-4 leading-relaxed bg-gray-900/20 rounded-lg p-2.5 border border-gray-700/20">
                      <div className="font-medium text-white mb-1.5 flex items-center gap-1.5">
                        <span className="text-sm">🤖</span>
                        AI 分析
                      </div>
                      <div className="text-gray-300 leading-relaxed text-xs">
                        {recommendation.analysis}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        className="bg-gradient-to-r from-white to-gray-100 text-gray-900 font-bold py-2.5 px-3 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg transform hover:scale-105 hover:-translate-y-0.5 relative overflow-hidden text-xs"
                        onClick={() => openDealModal(recommendation.id)}
                      >
                        <span className="relative z-10 flex items-center gap-1">
                          🚀 去下注
                        </span>
                        {/* 闪光效果 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </button>
                      <button 
                        className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 text-white font-medium py-2.5 px-3 rounded-lg hover:from-gray-700/60 hover:to-gray-600/60 transition-all duration-300 flex items-center justify-center gap-1.5 border border-gray-600/40 hover:border-gray-500/60 transform hover:scale-105 hover:-translate-y-0.5 text-xs"
                        onClick={handleTelegramClick}
                      >
                        <Send className="w-3 h-3" /> AI 跟单
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            // 使用mock数据作为后备
            bestBets.map((bet) => (
              <div key={bet.id} className="relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-0.5 hover:shadow-xl" style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}>
                {/* 渐变边框效果 */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-500 opacity-80"></div>
                {/* 紧迫感指示器 */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                  限时推荐
                </div>
                
                <div className="p-4">
                  {/* League Name */}
                  <div className="text-xs text-gray-400 mb-2 font-medium">{bet.league}</div>
                  
                  {/* Teams */}
                  <h3 className="text-base font-bold text-white mb-3">{bet.teams}</h3>
                  
                  {/* Stats with enhanced styling */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold border border-green-500/30">
                      推荐指数 {bet.recommendation}
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-bold border border-blue-500/30">
                      {bet.prediction}
                    </div>
                  </div>

                  {/* Odds */}
                  <div className="text-xs text-gray-300 mb-3 bg-gray-800/20 rounded-lg p-2.5 border border-gray-700/30">
                    <div className="font-medium text-white mb-1.5 flex items-center gap-1.5">
                      <span className="text-sm">📊</span>
                      赔率分析
                    </div>
                    <div className="font-mono text-xs">主 {bet.odds} / 平 3.38 / 客 1.93</div>
                  </div>

                  {/* Reason */}
                  <div className="text-xs text-gray-400 mb-4 leading-relaxed bg-gray-900/20 rounded-lg p-2.5 border border-gray-700/20">
                    <div className="font-medium text-white mb-1.5 flex items-center gap-1.5">
                      <span className="text-sm">🤖</span>
                      AI 分析
                    </div>
                    <div className="text-gray-300 leading-relaxed text-xs">
                      {bet.reason}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      className="bg-gradient-to-r from-white to-gray-100 text-gray-900 font-bold py-2.5 px-3 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg transform hover:scale-105 text-xs"
                      onClick={() => openDealModal(bet.id)}
                    >
                      🚀 去下注
                    </button>
                    <button 
                      className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 text-white font-medium py-2.5 px-3 rounded-lg hover:from-gray-700/60 hover:to-gray-600/60 transition-all duration-300 flex items-center justify-center gap-1.5 border border-gray-600/40 hover:border-gray-500/60 transform hover:scale-105 text-xs"
                      onClick={handleTelegramClick}
                    >
                      <Send className="w-4 h-4" /> 让 AI 跟单
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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
              {loadingMatches ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      加载比赛数据中...
                    </div>
                  </td>
                </tr>
              ) : filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 opacity-60">
                    暂无比赛数据
                  </td>
                </tr>
              ) : (
                filteredMatches.map((match) => {
                  const matchTime = isClient ? new Date(match.fixture_date) : new Date();
                  const isFav = favorites[match.home_team];
                  
                  return (
                    <tr key={match.id} className="border-b border-white/10">
                      <td>{match.date}</td>
                      <td>{match.time}</td>
                      <td>{match.league}</td>
                      <td className="whitespace-nowrap">
                        <button 
                          className={`mr-2 ${isFav ? 'fav-on' : ''}`}
                          onClick={() => toggleFavorite(match.home_team)}
                          title={isFav ? '已关注' : '关注'}
                        >
                          <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                        <span>{match.home_team} <span className="opacity-60">vs</span> {match.away_team}</span>
                      </td>
                      <td>{match.home_odds.toFixed(2)}</td>
                      <td>{match.draw_odds.toFixed(2)}</td>
                      <td>{match.away_odds.toFixed(2)}</td>
                      <td>{match.ai_prediction || ''}</td>
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
                })
              )}
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

      {/* Telegram QR Modal */}
      <TelegramQRModal 
        isOpen={showTelegramModal} 
        onClose={() => setShowTelegramModal(false)} 
        userId={user?.id}
      />
    </div>
  );
}
