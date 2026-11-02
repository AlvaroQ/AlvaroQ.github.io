// Localized structured data (schema.org JSON-LD) for the single-page portfolio.
import type { Lang, Strings } from '../i18n';
import { GITHUB_URL, LINKEDIN_URL, SITE_URL } from './site';

const PERSON_ID = `${SITE_URL}#person`;
const WEBSITE_ID = `${SITE_URL}#website`;

const companyDescription: Record<Lang, string> = {
  es: 'Plataforma IDaaS passwordless para la protección de la identidad',
  en: 'Passwordless IDaaS platform for identity protection',
};

const inLanguage: Record<Lang, string> = { es: 'es-ES', en: 'en-US' };

/** Person + WebSite + ProfilePage graph for the page in `lang`; `image` is an absolute URL. */
export function jsonLd(lang: Lang, strings: Strings, pageUrl: string, image: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: 'Álvaro Quintana',
        alternateName: ['Alvaro Quintana', 'Álvaro Quintana Palacios'],
        url: SITE_URL,
        image,
        jobTitle: strings.jobTitle,
        description: strings.pageDescription,
        worksFor: {
          '@type': 'Organization',
          name: 'B-FY',
          url: 'https://b-fy.com',
          description: companyDescription[lang],
        },
        knowsAbout: [
          'AI Agents', 'LLM', 'MCP', 'RAG', 'Claude', 'LangChain',
          'Kotlin', 'Kotlin Multiplatform', 'Android', 'iOS', 'Jetpack Compose',
          'Security', 'Biometrics', 'Authentication', 'Identity (IDaaS)',
          'CI/CD', 'Jenkins', 'Appium',
          'Next.js', 'React', 'TypeScript', 'Python',
        ],
        address: { '@type': 'PostalAddress', addressLocality: 'Madrid', addressCountry: 'ES' },
        sameAs: [LINKEDIN_URL, GITHUB_URL],
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: 'Álvaro Quintana',
        description: strings.pageDescription,
        inLanguage: ['es-ES', 'en-US'],
        author: { '@id': PERSON_ID },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${pageUrl}#profile`,
        url: pageUrl,
        name: strings.pageTitle,
        inLanguage: inLanguage[lang],
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': PERSON_ID },
      },
    ],
  };
}
