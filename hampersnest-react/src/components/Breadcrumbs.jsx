import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Breadcrumbs.css';

export default function Breadcrumbs({ customCrumbs }) {
  const location = useLocation();
  
  // If customCrumbs are provided, use them. Otherwise, generate from URL
  let crumbs = customCrumbs;
  if (!crumbs) {
    const pathnames = location.pathname.split('/').filter(x => x);
    crumbs = pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      const name = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
      return { name, path: to };
    });
  }

  // Prepend Home
  const allCrumbs = [{ name: 'Home', path: '/' }, ...crumbs];

  // Generate JSON-LD Schema for Breadcrumbs
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allCrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `https://hampersnest.com${crumb.path}`
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <nav className="breadcrumbs" aria-label="breadcrumb">
        <ol>
          {allCrumbs.map((crumb, index) => {
            const isLast = index === allCrumbs.length - 1;
            return (
              <li key={crumb.path} className={isLast ? 'active' : ''} aria-current={isLast ? 'page' : undefined}>
                {isLast ? (
                  <span>{crumb.name}</span>
                ) : (
                  <>
                    <Link to={crumb.path}>{crumb.name}</Link>
                    <span className="separator"><i className="fa-solid fa-chevron-right"></i></span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
