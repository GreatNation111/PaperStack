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
    title = 'PaperStack for UNN Students - Past Questions and Offline Study',
    description = 'PaperStack helps UNN students in affiliation with YABATECH find verified past questions, course materials, timetables, repeated questions and offline study resources by department, level and semester.',
    name = 'PaperStack',
    type = 'website',
    image = 'https://paperstack.com.ng/pwa-512x512.png',
    url = 'https://paperstack.com.ng/'
}: SEOProps) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        description,
        url,
        image,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'NGN'
        }
    };

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={url} />

            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="PaperStack" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}
