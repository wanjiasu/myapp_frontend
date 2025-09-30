"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AnimatedBackground from '@/components/animated-background';

export default function PrivacyPolicy() {
  const t = useTranslations('privacyPolicy');

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #1A2226 0%, #152A35 50%, #1A2226 100%)',
      color: '#FFFFFF'
    }}>
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-300">
            {t('lastUpdated')}: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('introduction.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('introduction.content')}
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('informationWeCollect.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-white mb-2">
                  {t('informationWeCollect.personalInfo.title')}
                </h3>
                <ul className="text-gray-200 space-y-2 ml-4">
                  <li>• {t('informationWeCollect.personalInfo.email')}</li>
                  <li>• {t('informationWeCollect.personalInfo.name')}</li>
                  <li>• {t('informationWeCollect.personalInfo.age')}</li>
                  <li>• {t('informationWeCollect.personalInfo.location')}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">
                  {t('informationWeCollect.usageData.title')}
                </h3>
                <ul className="text-gray-200 space-y-2 ml-4">
                  <li>• {t('informationWeCollect.usageData.browsing')}</li>
                  <li>• {t('informationWeCollect.usageData.preferences')}</li>
                  <li>• {t('informationWeCollect.usageData.interactions')}</li>
                  <li>• {t('informationWeCollect.usageData.device')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('howWeUse.title')}
            </h2>
            <ul className="text-gray-200 space-y-2 ml-4">
              <li>• {t('howWeUse.aiRecommendations')}</li>
              <li>• {t('howWeUse.personalizedContent')}</li>
              <li>• {t('howWeUse.serviceImprovement')}</li>
              <li>• {t('howWeUse.communication')}</li>
              <li>• {t('howWeUse.security')}</li>
              <li>• {t('howWeUse.compliance')}</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('informationSharing.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              {t('informationSharing.intro')}
            </p>
            <ul className="text-gray-200 space-y-2 ml-4">
              <li>• {t('informationSharing.serviceProviders')}</li>
              <li>• {t('informationSharing.legalRequirements')}</li>
              <li>• {t('informationSharing.businessTransfer')}</li>
              <li>• {t('informationSharing.consent')}</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('dataSecurity.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('dataSecurity.content')}
            </p>
          </section>

          {/* Age Verification */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('ageVerification.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('ageVerification.content')}
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('cookies.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('cookies.content')}
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('yourRights.title')}
            </h2>
            <ul className="text-gray-200 space-y-2 ml-4">
              <li>• {t('yourRights.access')}</li>
              <li>• {t('yourRights.correction')}</li>
              <li>• {t('yourRights.deletion')}</li>
              <li>• {t('yourRights.portability')}</li>
              <li>• {t('yourRights.objection')}</li>
            </ul>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('changes.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('changes.content')}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('contact.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('contact.content')}
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-gray-200">
                <strong>Email:</strong> privacy@betaione.com<br />
                <strong>Address:</strong> BetAIOne Privacy Team<br />
                <strong>Response Time:</strong> {t('contact.responseTime')}
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="border-t border-white/20 pt-8">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">
                {t('disclaimer.title')}
              </h3>
              <p className="text-gray-200 text-sm">
                {t('disclaimer.content')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}