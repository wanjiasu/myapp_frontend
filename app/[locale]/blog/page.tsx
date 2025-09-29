"use client";

import { useState, useEffect } from "react";
import { LogOut, Newspaper } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
// 从正确的相对路径导入 sanity client
import { client } from '../../../sanity/sanity.client'

interface Post {
  _id: string
  title: string
  slug: string
  _createdAt: string
}

const QUERY = `*[_type == "post"] | order(_createdAt desc){
  _id, title, "slug": slug.current, _createdAt
}`

export default function BlogIndex() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<{id: string; email: string; name?: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

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

    // 获取博客文章
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await client.fetch(QUERY);
        setPosts(fetchedPosts || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setPosts([]);
      }
    };

    getSession();
    fetchPosts();
  }, []);

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
            <Link href="/">
              <Image 
                src="/logo横向-白字.svg" 
                alt="BetAIOne Logo" 
                className="h-8 w-auto cursor-pointer" 
                width={120} 
                height={32} 
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm" style={{color: '#E5E8E9'}}>
            <Link href="/" className="hover:text-white transition-colors duration-200 hover:scale-105">首页</Link>
            <Link href="/blog" className="text-white font-medium">博客</Link>
          </nav>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="text-sm" style={{color: '#8A9499'}}>加载中...</div>
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
                        登出
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
                登录
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at top, rgba(0, 184, 200, 0.15), transparent 60%)'
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 flex items-center justify-center gap-3">
              <Newspaper className="w-8 h-8 md:w-12 md:h-12" style={{color: '#00B8C8'}} />
              咨询中心
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{color: '#E5E8E9'}}>
              深度分析、投注策略、市场洞察 - 让数据为您的决策提供支持
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {posts.length > 0 ? (
            posts.map((post: Post) => (
              <article key={post._id} className="rounded-xl p-6 backdrop-blur-md border transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl" style={{
                background: 'rgba(42, 59, 64, 0.4)',
                borderColor: 'rgba(255, 255, 255, 0.08)'
              }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2 hover:text-white transition-colors">
                      <Link href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h2>
                    <div className="flex items-center gap-4 text-sm" style={{color: '#8A9499'}}>
                      <time dateTime={post._createdAt}>
                        {new Date(post._createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                  </div>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #00B8C8 0%, #4FCFD9 100%)',
                      color: '#FFFFFF'
                    }}
                  >
                    阅读全文
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="rounded-xl p-8 backdrop-blur-md border" style={{
                background: 'rgba(42, 59, 64, 0.3)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}>
                <Newspaper className="w-16 h-16 mx-auto mb-4" style={{color: '#8A9499'}} />
                <h3 className="text-xl font-bold mb-2">暂无文章</h3>
                <p className="text-sm mb-4" style={{color: '#8A9499'}}>
                  我们正在准备精彩的内容，敬请期待！
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #00B8C8 0%, #4FCFD9 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  返回首页
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
