import { useEffect } from 'react';

export default function SEO({ title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, schema }) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }
    
    // 2. Helper to update/create meta tag
    const updateMetaTag = (name, content, attribute = 'name') => {
      if (content === undefined || content === null) return;
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // 3. Update Standard SEO Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');
    
    // 4. Update Open Graph (Facebook/Instagram/WhatsApp preview)
    const currentUrl = window.location.href;
    updateMetaTag('og:title', ogTitle || title, 'property');
    updateMetaTag('og:description', ogDescription || description, 'property');
    
    const getAbsoluteImageUrl = (img) => {
      if (!img) return window.location.origin + '/favicon.svg';
      if (img.startsWith('http')) return img;
      return window.location.origin + img;
    };
    
    updateMetaTag('og:image', getAbsoluteImageUrl(ogImage), 'property');
    updateMetaTag('og:url', canonicalUrl || currentUrl, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:site_name', 'Hampers Nest', 'property');
    
    // 5. Update Twitter Cards
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);
    updateMetaTag('twitter:image', getAbsoluteImageUrl(ogImage));
    updateMetaTag('twitter:url', canonicalUrl || currentUrl);

    // 6. Update Canonical Link
    const targetCanonical = canonicalUrl || currentUrl;
    let link = document.querySelector('link[rel="canonical"]');
    if (link) {
      link.setAttribute('href', targetCanonical);
    } else {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', targetCanonical);
      document.head.appendChild(link);
    }

    // 7. Inject JSON-LD Schema
    let schemaScript = document.getElementById('seo-jsonld-schema');
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'seo-jsonld-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.innerHTML = JSON.stringify(schema);
    } else {
      if (schemaScript) {
        schemaScript.remove();
      }
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, schema]);

  return null;
}
