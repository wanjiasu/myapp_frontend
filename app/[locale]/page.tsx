"use client";

import { useState, useEffect } from "react";
import { Heart, Sparkles, ListFilter, Newspaper, Send, Bot, X, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import TelegramQRModal from "@/components/telegram-qr-modal";
import Image from "next/image";
import Link from "next/link";
import { client } from '../../sanity/sanity.client';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';

// Generate timestamps on client side to avoid hydration mismatch
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
  reason_dict?: {[key: string]: string}; // 添加reason_dict字段
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

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  _createdAt: string;
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
  const t = useTranslations();
  const locale = useLocale(); // 获取当前用户语言
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [filters, setFilters] = useState({
    time: '',
    league: '',
    search: ''
  });
  const [showDealModal, setShowDealModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<{id: string; email: string; name?: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 获取AI推荐数据
  const fetchAIRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/api/ai-recommendations?locale=${locale}`);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
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

  // 获取博客文章数据
  const fetchBlogPosts = async () => {
    try {
      const QUERY = `*[_type == "post"] | order(_createdAt desc)[0...3]{
        _id, title, "slug": slug.current, _createdAt
      }`;
      const posts = await client.fetch(QUERY);
      setBlogPosts(posts || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setBlogPosts([]);
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
    // 获取博客文章数据
    fetchBlogPosts();
  }, [])

  // 当locale变化时重新获取AI推荐数据
  useEffect(() => {
    fetchAIRecommendations();
  }, [locale]);

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

  const openDealModal = () => {
    setShowDealModal(true);
  };

  const closeDealModal = () => {
    setShowDealModal(false);
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

  // 分页逻辑
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMatches = filteredMatches.slice(startIndex, endIndex);

  // 分页控制函数
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #1A2226 0%, #152A35 50%, #1A2226 100%)',
      color: '#FFFFFF'
    }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{
        backgroundColor: 'rgba(26, 34, 38, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.08)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo横向-白字.svg" 
              alt="BetAIOne Logo" 
              className="h-8 w-auto" 
              width={120} 
              height={32} 
            />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm" style={{color: '#E5E8E9'}}>
            <a href="#best" className="hover:text-white transition-colors duration-200 hover:scale-105">{t('nav.aiBestRecommendations')}</a>
            <a href="#all" className="hover:text-white transition-colors duration-200 hover:scale-105">{t('nav.allMatches')}</a>
            <a href="#consultation" className="hover:text-white transition-colors duration-200 hover:scale-105">{t('nav.consultationCenter')}</a>
            <a href="#promos" className="hover:text-white transition-colors duration-200 hover:scale-105">{t('nav.promotions')}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {isLoading ? (
              <div className="text-sm" style={{color: '#8A9499'}}>{t('common.loading')}</div>
            ) : user ? (
              <div className="relative">
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={() => setShowDropdown(true)}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{
                    background: 'linear-gradient(135deg, #00B8C8 0%, #4FCFD9 100%)'
                  }}>
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{user.name || user.email}</div>
                  </div>
                </div>
                
                {/* 下拉菜单 */}
                {showDropdown && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 backdrop-blur-md border rounded-lg shadow-lg z-50"
                    style={{
                      backgroundColor: 'rgba(42, 59, 64, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white rounded-md transition-colors duration-200 hover:bg-white/10"
                      >
                        <LogOut size={16} />
                        {t('auth.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00B8C8 0%, #4FCFD9 100%)',
                  color: '#FFFFFF'
                }}
              >
                {t('auth.login')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Top banners */}
      <section id="promos" className="border-b" style={{borderColor: 'rgba(255, 255, 255, 0.08)'}}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="rounded-xl p-4 flex items-center justify-between backdrop-blur-md border" style={{
            background: 'rgba(42, 59, 64, 0.3)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}>
            <div>
              <div className="text-xs mb-1" style={{color: '#8A9499'}}>{t('telegram.aiAssistant')}</div>
              <div className="text-lg font-bold">{t('telegram.addTelegramTitle')}</div>
              <div className="text-xs mt-1" style={{color: '#8A9499'}}>{t('telegram.features')}</div>
            </div>
            <button 
              className="whitespace-nowrap inline-flex items-center gap-2 text-sm px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00B8C8 0%, #4FCFD9 100%)',
                color: '#FFFFFF'
              }}
              onClick={handleTelegramClick}
            >
              <Send className="w-4 h-4" /> {t('telegram.addNow')}
            </button>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at top, rgba(0, 184, 200, 0.15), transparent 60%)'
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-lg" style={{color: '#E5E8E9'}}>
              {t('hero.subtitle')} <span className="font-bold" style={{color: '#00B8C8'}}>{t('hero.aiRecommendation')}</span>{t('hero.subtitleEnd')}
            </p>
          </div>
          <aside className="rounded-xl p-6 backdrop-blur-md border" style={{
            background: 'rgba(42, 59, 64, 0.3)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}>
            <div className="text-sm mb-3" style={{color: '#8A9499'}}>{t('telegram.aiAssistant')}</div>
            <p className="text-sm mb-4" style={{color: '#E5E8E9'}}>
              {t('telegram.description')}
            </p>
            <button 
              className="w-full inline-flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00B8C8 0%, #4FCFD9 100%)',
                color: '#FFFFFF'
              }}
              onClick={handleTelegramClick}
            >
              <Bot className="w-4 h-4" /> {t('telegram.addTelegram')}
            </button>
            <p className="text-xs mt-3" style={{color: '#5D6B70'}}>
              {t('common.disclaimer')}
            </p>
          </aside>
        </div>
      </section>

      {/* AI Best Bets */}
      <section id="best" className="max-w-7xl mx-auto px-4 py-8 h-screen flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Sparkles className="w-6 h-6" style={{color: '#00B8C8'}} />
            {t('betting.aiBestBets')}
          </h2>
          <div className="text-sm flex items-center gap-2" style={{color: '#8A9499'}}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#00D084'}}></div>
            {t('betting.realTimeData')}
          </div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center max-w-6xl mx-auto">
          {loadingRecommendations ? (
            // 加载状态
            Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl transition-all duration-300 w-full h-[540px] flex flex-col" style={{
                background: 'rgba(42, 59, 64, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}>
                {/* 渐变边框效果 */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{
                  background: 'linear-gradient(90deg, #00B8C8 0%, #4FCFD9 50%, #00B8C8 100%)'
                }}></div>
                <div className="p-6 flex-1 flex items-center justify-center">
                  <div className="text-center flex items-center justify-center gap-2" style={{color: '#8A9499'}}>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{borderColor: '#00B8C8'}}></div>
                    <span className="text-sm">{t('betting.loadingRecommendations')}</span>
                  </div>
                </div>
              </div>
            ))
          ) : aiRecommendations.length > 0 ? (
            // 使用真实数据
            aiRecommendations.map((recommendation) => {
              // 根据 predicted_result 确定哪个队伍应该高亮
              const getHighlightedTeam = (predictedResult: string) => {
                const result = predictedResult.toLowerCase()
                if (result.includes('home') || result.includes('主')) {
                  return 'home'
                } else if (result.includes('away') || result.includes('客')) {
                  return 'away'
                }
                return 'none'
              }
              
              const highlightedTeam = getHighlightedTeam(recommendation.prediction_result)
              
              return (
                <div key={recommendation.id} className="relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-1 w-full hover:shadow-2xl h-[540px] flex flex-col" style={{
                  background: 'rgba(42, 59, 64, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(14px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                  {/* 渐变边框效果 */}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{
                    background: 'linear-gradient(90deg, #00B8C8 0%, #4FCFD9 50%, #00B8C8 100%)'
                  }}></div>
                  {/* 紧迫感指示器 */}
                  <div className="absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1" style={{
                    background: 'linear-gradient(135deg, #FF3B5C 0%, #FF6B7A 100%)'
                  }}>
                    <span className="animate-pulse text-xs">🔥</span>
                    {t('betting.limitedTimeRecommendation')}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    {/* League Name and Match Time */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-medium" style={{color: '#8A9499'}}>
                        {recommendation.league}
                      </div>
                      {recommendation.fixture_date && (
                        <div className="text-xs font-medium px-2 py-1 rounded border" style={{
                          color: '#00B8C8',
                          backgroundColor: 'rgba(0, 184, 200, 0.1)',
                          borderColor: 'rgba(0, 184, 200, 0.3)'
                        }}>
                          {new Date(recommendation.fixture_date).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric'
                          })} {new Date(recommendation.fixture_date).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                    {/* 高亮队伍名称 */}
                    <div className="mb-4">
                      <span className={`text-base font-bold transition-all duration-200 ${
                        highlightedTeam === 'home' 
                          ? 'px-2 py-1 rounded border' 
                          : ''
                      }`} style={{
                        color: highlightedTeam === 'home' ? '#00B8C8' : '#FFFFFF',
                        backgroundColor: highlightedTeam === 'home' ? 'rgba(0, 184, 200, 0.1)' : 'transparent',
                        borderColor: highlightedTeam === 'home' ? 'rgba(0, 184, 200, 0.3)' : 'transparent'
                      }}>
                        {recommendation.home_team}
                      </span>
                      <span className="mx-2 text-base font-light" style={{color: '#8A9499'}}> vs </span>
                      <span className={`text-base font-bold transition-all duration-200 ${
                        highlightedTeam === 'away' 
                          ? 'px-2 py-1 rounded border' 
                          : ''
                      }`} style={{
                        color: highlightedTeam === 'away' ? '#00B8C8' : '#FFFFFF',
                        backgroundColor: highlightedTeam === 'away' ? 'rgba(0, 184, 200, 0.1)' : 'transparent',
                        borderColor: highlightedTeam === 'away' ? 'rgba(0, 184, 200, 0.3)' : 'transparent'
                      }}>
                        {recommendation.away_team}
                      </span>
                    </div>
                    
                    {/* 增强的统计数据显示 */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <div className="px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 transition-all duration-200 hover:scale-105" style={{
                        background: 'rgba(0, 208, 132, 0.2)',
                        color: '#00D084',
                        borderColor: 'rgba(0, 208, 132, 0.3)'
                      }}>
                        <span className="text-sm">🎯</span>
                        {t('betting.recommendationIndex')} {Math.round(recommendation.recommendation_index * 100)}
                      </div>
                      {recommendation.prediction_result && (
                        <div className="px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 transition-all duration-200 hover:scale-105" style={{
                          background: 'rgba(79, 207, 217, 0.2)',
                          color: '#4FCFD9',
                          borderColor: 'rgba(79, 207, 217, 0.3)'
                        }}>
                          <span className="text-sm">⚡</span>
                          {recommendation.prediction_result}
                        </div>
                      )}
                    </div>

                    {/* 赔率分析 */}
                    <div className="text-xs mb-4 rounded-lg p-3 border" style={{
                      color: '#E5E8E9',
                      backgroundColor: 'rgba(26, 34, 38, 0.3)',
                      borderColor: 'rgba(93, 107, 112, 0.3)'
                    }}>
                      <div className="font-medium text-white mb-2 flex items-center gap-2">
                        <span className="text-sm">📊</span>
                        {t('betting.oddsAnalysis')}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-xs" style={{color: '#8A9499'}}>{t('betting.homeWin')}</div>
                            <div className="font-bold" style={{color: '#FFFFFF'}}>
                              {recommendation.odds.home_avg.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs" style={{color: '#8A9499'}}>{t('betting.draw')}</div>
                            <div className="font-bold" style={{color: '#FFFFFF'}}>
                              {recommendation.odds.draw_avg.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs" style={{color: '#8A9499'}}>{t('betting.awayWin')}</div>
                            <div className="font-bold" style={{color: '#FFFFFF'}}>
                              {recommendation.odds.away_avg.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      <div className="text-xs mt-2 flex items-center justify-center gap-1" style={{color: '#8A9499'}}>
                          <div className="w-1 h-1 rounded-full" style={{backgroundColor: '#00D084'}}></div>
                          {t('betting.realTimeDataShort')}
                        </div>
                    </div>

                    {/* AI 分析 */}
                    {recommendation.analysis && (
                      <div className="text-xs rounded-lg p-3 border flex-1 flex flex-col max-h-48" style={{
                        color: '#E5E8E9',
                        backgroundColor: 'rgba(0, 184, 200, 0.05)',
                        borderColor: 'rgba(0, 184, 200, 0.2)'
                      }}>
                        <div className="font-medium mb-1 flex items-center gap-2" style={{color: '#00B8C8'}}>
                          <span className="text-sm">🤖</span>
                          {t('betting.aiAnalysis')}
                        </div>
                        <div className="leading-relaxed overflow-y-auto flex-1">
                          {recommendation.analysis}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            // 使用 mock 数据
            bestBets.map((bet) => (
              <div key={bet.id} className="relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-1 w-full h-[540px] flex flex-col" style={{
                background: 'rgba(42, 59, 64, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}>
                {/* 渐变边框效果 */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{
                  background: 'linear-gradient(90deg, #00B8C8 0%, #4FCFD9 50%, #00B8C8 100%)'
                }}></div>
                {/* 紧迫感指示器 */}
                <div className="absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1" style={{
                  background: 'linear-gradient(135deg, #FF3B5C 0%, #FF6B7A 100%)'
                }}>
                  <span className="animate-pulse text-xs">🔥</span>
                  {t('betting.limitedTimeRecommendation')}
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* League Name */}
                  <div className="text-xs font-medium mb-3" style={{color: '#8A9499'}}>
                    {bet.league}
                  </div>
                  
                  {/* Teams */}
                  <div className="text-base font-bold mb-4">{bet.teams}</div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <div className="px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 transition-all duration-200 hover:scale-105" style={{
                      background: 'rgba(0, 208, 132, 0.2)',
                      color: '#00D084',
                      borderColor: 'rgba(0, 208, 132, 0.3)'
                    }}>
                      <span className="text-sm">🎯</span>
                      {t('betting.recommendationIndex')} {bet.recommendation}
                    </div>
                    <div className="px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 transition-all duration-200 hover:scale-105" style={{
                      background: 'rgba(79, 207, 217, 0.2)',
                      color: '#4FCFD9',
                      borderColor: 'rgba(79, 207, 217, 0.3)'
                    }}>
                      <span className="text-sm">⚡</span>
                      {bet.prediction}
                    </div>
                  </div>

                  {/* Odds */}
                  <div className="text-xs mb-4 rounded-lg p-3 border" style={{
                    color: '#E5E8E9',
                    backgroundColor: 'rgba(26, 34, 38, 0.3)',
                    borderColor: 'rgba(93, 107, 112, 0.3)'
                  }}>
                    <div className="font-medium text-white mb-2 flex items-center gap-2">
                      <span className="text-sm">💰</span>
                      {t('betting.recommendedOdds')}: {bet.odds}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="text-xs rounded-lg p-3 border flex-1 flex flex-col max-h-48" style={{
                    color: '#E5E8E9',
                    backgroundColor: 'rgba(0, 184, 200, 0.05)',
                    borderColor: 'rgba(0, 184, 200, 0.2)'
                  }}>
                    <div className="font-medium mb-1 flex items-center gap-2" style={{color: '#00B8C8'}}>
                      <span className="text-sm">🤖</span>
                      {t('betting.aiAnalysis')}
                    </div>
                    <div className="leading-relaxed overflow-y-auto flex-1">
                      {bet.reason}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </section>

      {/* All Matches */}
      <section id="all" className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <ListFilter className="w-5 h-5" /> {t('allMatches.title')}
          </h2>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4">
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="opacity-80 mb-1">{t('allMatches.filters.time')}</div>
              <select 
                className="w-full glass rounded-xl px-3 py-2"
                value={filters.time}
                onChange={(e) => setFilters({...filters, time: e.target.value})}
              >
                <option value="">{t('allMatches.filters.all')}</option>
                <option value="today">{t('allMatches.filters.today')}</option>
                <option value="tomorrow">{t('allMatches.filters.tomorrow')}</option>
                <option value="week">{t('allMatches.filters.thisWeek')}</option>
              </select>
            </div>
            <div>
              <div className="opacity-80 mb-1">{t('allMatches.filters.league')}</div>
              <select 
                className="w-full glass rounded-xl px-3 py-2"
                value={filters.league}
                onChange={(e) => setFilters({...filters, league: e.target.value})}
              >
                <option value="">{t('allMatches.filters.all')}</option>
                <option value="Premier League">Premier League</option>
                <option value="La Liga">La Liga</option>
                <option value="Série A">Série A</option>
                <option value="THA League 1">THA League 1</option>
              </select>
            </div>
            <div>
              <div className="opacity-80 mb-1">{t('allMatches.filters.search')}</div>
              <input 
                type="text"
                placeholder={t('allMatches.filters.searchTeams')}
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
                <th className="text-left">{t('allMatches.table.date')}</th>
                <th className="text-left">{t('allMatches.table.time')}</th>
                <th className="text-left">{t('allMatches.table.league')}</th>
                <th className="text-left">{t('allMatches.table.match')}</th>
                <th className="text-left">{t('allMatches.table.homeWin')}</th>
                <th className="text-left">{t('allMatches.table.draw')}</th>
                <th className="text-left">{t('allMatches.table.awayWin')}</th>
                <th className="text-left">{t('allMatches.table.ai')}</th>
                <th className="text-left">{t('allMatches.table.action')}</th>
              </tr>
            </thead>
            <tbody>
              {loadingMatches ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('allMatches.loading')}
                    </div>
                  </td>
                </tr>
              ) : paginatedMatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 opacity-60">
                    {t('allMatches.noData')}
                  </td>
                </tr>
              ) : (
                paginatedMatches.map((match) => {
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
                          title={isFav ? t('allMatches.followed') : t('allMatches.follow')}
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
                        onClick={() => openDealModal()}
                      >
                        {t('allMatches.bestChannel')}
                      </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分页组件 */}
        {!loadingMatches && filteredMatches.length > 0 && (
          <div className="flex items-center justify-between mt-6 px-4">
            <div className="text-sm opacity-70">
              {t('allMatches.pagination.showing')} {startIndex + 1}-{Math.min(endIndex, filteredMatches.length)} {t('allMatches.pagination.of')} {filteredMatches.length} {t('allMatches.pagination.entries')}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  currentPage === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-white/10'
                }`}
              >
                {t('allMatches.pagination.previous')}
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // 显示逻辑：当前页前后各2页
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return (
                      <span key={page} className="px-2 opacity-50">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-white/10'
                }`}
              >
                {t('allMatches.pagination.next')}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Consultation center */}
      <section id="consultation" className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Newspaper className="w-5 h-5" /> {t('consultationCenter.title')}
          </h2>
          
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="glass rounded-2xl p-4 block hover:border-white/30">
                <div className="text-xs opacity-70 mb-1">
                  {isClient && post._createdAt ? new Date(post._createdAt).toLocaleString('zh-CN') : t('consultationCenter.loading')}
                </div>
                <div className="font-bold mb-2">{post.title}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="chip px-2 py-0.5 rounded">{t('consultationCenter.blogArticle')}</span>
                </div>
              </Link>
            ))
          ) : (
            // 如果没有博客文章，显示原来的 mock 数据
            articles.map((article) => (
              <a key={article.id} href="#" className="glass rounded-2xl p-4 block hover:border-white/30">
                <div className="text-xs opacity-70 mb-1">
                  {isClient && article.date ? new Date(article.date).toLocaleString('zh-CN') : t('consultationCenter.loading')}
                </div>
                <div className="font-bold mb-2">{article.title}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {article.tag.map((tag, index) => (
                    <span key={index} className="chip px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </a>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-white/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="chip px-2 py-0.5 rounded">18+</span>
              <span className="chip px-2 py-0.5 rounded">SEA & LATAM</span>
              <a className="chip px-2 py-0.5 rounded" href="https://t.me/">Telegram</a>
            </div>
            <div className="text-xs opacity-60">{t('common.followLocalLaws')}</div>
          </div>
        </div>
      </footer>

      {/* Modal: 渠道选择 / 最划算 */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101830] rounded-2xl max-w-lg w-full p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">{t('allMatches.bestChannel')}</div>
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
                    <div className="text-xs opacity-70">{t('consultationCenter.odds')} {book.odds} · {book.promo}</div>
                  </div>
                  <a href={book.link} className="btn btn-primary text-sm">{t('consultationCenter.goTo')}</a>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/50 mt-3">{t('consultationCenter.equivalentOddsNote')}</p>
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
