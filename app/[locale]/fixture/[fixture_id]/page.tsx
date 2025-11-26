
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import LanguageSwitcher from '@/components/language-switcher';
import AnimatedBackground from '@/components/animated-background';
import { useEffect, useState } from 'react';

async function getReport(fixtureId: string): Promise<string | null> {
    try {
        const response = await fetch(`/api/fixture-report?fixture_id=${fixtureId}`);
        if (!response.ok) {
            console.error('Failed to fetch report:', response.statusText);
            return null;
        }
        const data = await response.json();
        return data.report;
    } catch (error) {
        console.error('Error fetching report:', error);
        return null;
    }
}

export default function FixturePage({ params: paramsPromise }: { params: Promise<{ locale: string, fixture_id: string }> }) {
  const t = useTranslations();
  const [report, setReport] = useState<string | null>(null);
  const [params, setParams] = useState<{ locale: string, fixture_id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveParamsAndFetch = async () => {
      setLoading(true);
      const resolvedParams = await paramsPromise;
      setParams(resolvedParams);
      
      if (resolvedParams) {
        const reportData = await getReport(resolvedParams.fixture_id);
        setReport(reportData);
      }
      setLoading(false);
    };

    resolveParamsAndFetch();
  }, [paramsPromise]);

  const renderContent = () => {
    if (loading || !params) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <header className="sticky top-0 z-40 backdrop-blur-md border-b" style={{
                backgroundColor: 'rgba(26, 34, 38, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.08)'
            }}>
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/${params.locale}`}>
                            <Image
                                src="/logo横向-白字.svg"
                                alt="BetAIOne Logo"
                                className="h-8 w-auto"
                                width={120}
                                height={32}
                            />
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#E5E8E9' }}>
                        <Link href={`/${params.locale}#best`} className="hover:text-white transition-colors duration-200 hover:scale-105">{t('nav.aiBestRecommendations')}</Link>
                        <Link href={`/${params.locale}#all`} className="hover:text-white transition-colors duration-200 hover:scale-105">{t('nav.allMatches')}</Link>
                        <Link href={`/${params.locale}#consultation`} className="hover:text-white transition-colors duration-200 hover:scale-105">{t('nav.consultationCenter')}</Link>
                        <Link href={`/${params.locale}#promos`} className="hover:text-white transition-colors duration-200 hover:scale-105">{t('nav.promotions')}</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <Link href={`/${params.locale}`}>
                            <button
                                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25 active:scale-95 transform-gpu"
                                style={{
                                    background: 'linear-gradient(135deg, #00B8C8 0%, #4FCFD9 100%)',
                                    color: '#FFFFFF'
                                }}
                            >
                                {t('auth.login')}
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative max-w-7xl mx-auto px-4 py-12">
                <div className="rounded-xl p-6 md:p-8 backdrop-blur-md border" style={{
                    background: 'rgba(42, 59, 64, 0.3)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }}>
                    {report ? (
                        <article className="prose-lg prose-invert max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            table: ({children}) => (
                                                <div className="not-prose">
                                                    <table className="w-full table-fixed border-collapse text-sm">
                                                        <colgroup>
                                                            <col style={{width: '30%'}} />
                                                            <col style={{width: '35%'}} />
                                                            <col style={{width: '35%'}} />
                                                        </colgroup>
                                                        {children}
                                                    </table>
                                                </div>
                                            ),
                                            thead: ({children}) => <thead className="bg-white/10">{children}</thead>,
                                            tr: ({children}) => <tr className="border-b border-white/10">{children}</tr>,
                                            th: ({children}) => <th className="p-3 text-left font-semibold">{children}</th>,
                                            td: ({children}) => <td className="p-3 align-top">{children}</td>,
                                        }}
                                    >
                                        {report}
                                    </ReactMarkdown>
                                </article>
                    ) : (
                        <p>No report found for this fixture.</p>
                    )}
                </div>
            </main>
        </>
    );
  }

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #1A2226 0%, #152A35 50%, #1A2226 100%)',
      color: '#FFFFFF'
    }}>
      <AnimatedBackground />
      {renderContent()}
    </div>
  );
}
