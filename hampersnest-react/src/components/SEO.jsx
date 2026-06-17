import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';

export default function SEO({ title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, schema }) {
  const { settings } = useCart();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const siteName = settings?.storeName || 'Hampers Nest';

  const getAbsoluteImageUrl = (img) => {
    if (!img) return typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '';
    if (img.startsWith('http')) return img;
    return typeof window !== 'undefined' ? window.location.origin + img : img;
  };

  const finalTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet>
      {/* Standard Meta */}
      <title>{finalTitle}</title>
      <meta name="description" content={description || settings?.announcementBannerText || ''} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />

      {/* Open Graph / Facebook / Instagram / WhatsApp */}
      <meta property="og:title" content={ogTitle || title || siteName} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={getAbsoluteImageUrl(ogImage)} />
      <meta property="og:url" content={canonicalUrl || currentUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title || siteName} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={getAbsoluteImageUrl(ogImage)} />

      {/* Canonical URL */}
      {(canonicalUrl || currentUrl) && <link rel="canonical" href={canonicalUrl || currentUrl} />}

      {/* JSON-LD Schema Markup */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
