"use client";

import { useState, useEffect } from "react";
import { LogOut, ArrowLeft, Calendar, Clock } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { client } from '../../../../sanity/sanity.client'
import { PortableText } from '@portabletext/react'

type Props = { 
  params: Promise<{ slug: string }> 
}

interface Post {
  title: string;
  body: Array<{
    _type: string;
    _key: string;
    children?: Array<{
      _type: string;
      _key: string;
      text: string;
      marks?: string[];
    }>;
    style?: string;
    markDefs?: Array<{
      _type: string;
      _key: string;
      href?: string;
    }>;
  }>;
  _createdAt: string;
  _updatedAt: string;
}

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  title,
  body,
  _createdAt,
  _updatedAt
}`

export default function PostPage({ params }: Props) {
  const [post, setPost] = useState<Post | null>(null);
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
    const initPage = async () => {
      try {
        // 获取参数
        const resolvedParams = await params;

        // 获取用户会话信息
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser(session.data.user);
        } else {
          setUser(null);
        }

        // 获取文章内容
        const fetchedPost = await client.fetch(POST_QUERY, { slug: resolvedParams.slug });
        setPost(fetchedPost);
      } catch (error) {
        console.error('Failed to initialize page:', error);
        setPost(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #1A2226 0%, #152A35 50%, #1A2226 100%)',
        color: '#FFFFFF'
      }}>
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!post) {
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
              {user ? (
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

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="rounded-xl p-12 backdrop-blur-md border" style={{
              background: 'rgba(42, 59, 64, 0.3)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}>
              <h1 className="text-2xl font-bold mb-4">文章不存在</h1>
              <p className="text-lg mb-6" style={{color: '#8A9499'}}>
                抱歉，您访问的文章不存在或已被删除。
              </p>
              <Link 
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00B8C8 0%, #4FCFD9 100%)',
                  color: '#FFFFFF'
                }}
              >
                <ArrowLeft size={20} />
                返回博客列表
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {user ? (
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

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: 'rgba(42, 59, 64, 0.4)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid'
            }}
          >
            <ArrowLeft size={16} />
            返回博客列表
          </Link>
        </div>

        {/* Article */}
        <article className="rounded-xl backdrop-blur-md border" style={{
          background: 'rgba(42, 59, 64, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}>
          {/* Article Header */}
          <header className="p-8 border-b" style={{
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-sm" style={{color: '#8A9499'}}>
              {post._createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <time dateTime={post._createdAt}>
                    {new Date(post._createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              )}
              {post._updatedAt && post._updatedAt !== post._createdAt && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>
                    更新于 {new Date(post._updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Article Body */}
          <div className="p-8">
            <div className="prose prose-lg prose-invert max-w-none">
              <PortableText value={post.body} />
            </div>
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00B8C8 0%, #4FCFD9 100%)',
              color: '#FFFFFF'
            }}
          >
            <ArrowLeft size={20} />
            返回博客列表
          </Link>
        </div>
      </div>
    </div>
  )
}
