"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AnimatedBackground from '@/components/animated-background';

export default function TermsOfService() {
  const t = useTranslations('termsOfService');

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

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('acceptance.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('acceptance.content')}
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('serviceDescription.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              {t('serviceDescription.intro')}
            </p>
            <ul className="text-gray-200 space-y-2 ml-4">
              <li>• {t('serviceDescription.aiRecommendations')}</li>
              <li>• {t('serviceDescription.personalizedMatching')}</li>
              <li>• {t('serviceDescription.contentCuration')}</li>
              <li>• {t('serviceDescription.userProfiles')}</li>
              <li>• {t('serviceDescription.communicationTools')}</li>
            </ul>
          </section>

          {/* Age Requirements */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('ageRequirements.title')}
            </h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-gray-200 leading-relaxed">
                {t('ageRequirements.content')}
              </p>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('userAccounts.title')}
            </h2>
            <div className="space-y-4">
              <p className="text-gray-200 leading-relaxed">
                {t('userAccounts.intro')}
              </p>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">
                  {t('userAccounts.responsibilities.title')}
                </h3>
                <ul className="text-gray-200 space-y-2 ml-4">
                  <li>• {t('userAccounts.responsibilities.accurate')}</li>
                  <li>• {t('userAccounts.responsibilities.secure')}</li>
                  <li>• {t('userAccounts.responsibilities.notify')}</li>
                  <li>• {t('userAccounts.responsibilities.liable')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('acceptableUse.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              {t('acceptableUse.intro')}
            </p>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">
                {t('acceptableUse.prohibited.title')}
              </h3>
              <ul className="text-gray-200 space-y-2 ml-4">
                <li>• {t('acceptableUse.prohibited.illegal')}</li>
                <li>• {t('acceptableUse.prohibited.harassment')}</li>
                <li>• {t('acceptableUse.prohibited.spam')}</li>
                <li>• {t('acceptableUse.prohibited.impersonation')}</li>
                <li>• {t('acceptableUse.prohibited.malware')}</li>
                <li>• {t('acceptableUse.prohibited.copyright')}</li>
                <li>• {t('acceptableUse.prohibited.minors')}</li>
                <li>• {t('acceptableUse.prohibited.interference')}</li>
              </ul>
            </div>
          </section>

          {/* AI Recommendations */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('aiRecommendations.title')}
            </h2>
            <div className="space-y-4">
              <p className="text-gray-200 leading-relaxed">
                {t('aiRecommendations.intro')}
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-400 font-semibold mb-2">
                  {t('aiRecommendations.disclaimer.title')}
                </h3>
                <p className="text-gray-200 text-sm">
                  {t('aiRecommendations.disclaimer.content')}
                </p>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('privacyData.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('privacyData.content')}
              <Link href="/privacypolicy" className="text-blue-400 hover:text-blue-300 underline ml-1">
                {t('privacyData.policyLink')}
              </Link>
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('intellectualProperty.title')}
            </h2>
            <div className="space-y-4">
              <p className="text-gray-200 leading-relaxed">
                {t('intellectualProperty.ownership')}
              </p>
              <p className="text-gray-200 leading-relaxed">
                {t('intellectualProperty.userContent')}
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('disclaimers.title')}
            </h2>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-gray-200 leading-relaxed">
                {t('disclaimers.content')}
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('limitationLiability.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('limitationLiability.content')}
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('termination.title')}
            </h2>
            <div className="space-y-4">
              <p className="text-gray-200 leading-relaxed">
                {t('termination.byUser')}
              </p>
              <p className="text-gray-200 leading-relaxed">
                {t('termination.byUs')}
              </p>
              <p className="text-gray-200 leading-relaxed">
                {t('termination.effect')}
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('governingLaw.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('governingLaw.content')}
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('changes.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('changes.content')}
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('contact.title')}
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {t('contact.content')}
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-gray-200">
                <strong>Email:</strong> legal@betaione.com<br />
                <strong>Address:</strong> BetAIOne Legal Department<br />
                <strong>Response Time:</strong> {t('contact.responseTime')}
              </p>
            </div>
          </section>

          {/* Effective Date */}
          <section className="border-t border-white/20 pt-8">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">
                {t('effectiveDate.title')}
              </h3>
              <p className="text-gray-200 text-sm">
                {t('effectiveDate.content')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}