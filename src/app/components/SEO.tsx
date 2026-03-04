import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    image?: string;
    url?: string;
}

export function SEO({
    title = 'PaperStack — Your Ultimate Past Questions Repository',
    description = 'Caleb University\'s premier platform for past examination questions, study resources, and digital timetables.',
    name = 'PaperStack',
    type = 'website',
    image = 'https://calebdeck.com/pwa-512x512.png', // Assuming canonical URL for open graph images
    url = 'https://calebdeck.com/' // Assuming target domain from the user's guide
}: SEOProps) {

    // JSON-LD structured data for Google Knowledge Graph
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": name,
        "description": description,
        "url": url,
        "image": image,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Imota",
            "addressRegion": "Lagos",
            "addressCountry": "NG"
        }
    };

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* Open Graph Meta Tags (Facebook/LinkedIn) */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />

            {/* Twitter Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}
