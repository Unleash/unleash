import React, { useEffect } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Head from '@docusaurus/Head';

export default function FontLoader(): React.JSX.Element {
    useEffect(() => {
        if (!ExecutionEnvironment.canUseDOM) {
            return;
        }

        // Font loading strategy
        const loadFonts = async () => {
            // Check if fonts are already loaded
            if (document.fonts && document.fonts.ready) {
                try {
                    await document.fonts.ready;
                    document.documentElement.classList.add('fonts-loaded');
                } catch (error) {
                    console.error('Font loading error:', error);
                }
            }

            // Create font face with font-display: swap
            const senFontFace = new FontFace(
                'Sen',
                `url('/fonts/Sen-Regular.woff2') format('woff2'),
                 url('/fonts/Sen-Regular.woff') format('woff')`,
                {
                    weight: '400',
                    style: 'normal',
                    display: 'swap' // Critical for preventing invisible text
                }
            );

            const senBoldFontFace = new FontFace(
                'Sen',
                `url('/fonts/Sen-Bold.woff2') format('woff2'),
                 url('/fonts/Sen-Bold.woff') format('woff')`,
                {
                    weight: '700',
                    style: 'normal',
                    display: 'swap'
                }
            );

            // Load fonts asynchronously
            try {
                const loadedFonts = await Promise.all([
                    senFontFace.load(),
                    senBoldFontFace.load()
                ]);

                // Add fonts to document
                loadedFonts.forEach(font => {
                    (document.fonts as any).add(font);
                });

                // Mark fonts as loaded
                document.documentElement.classList.add('custom-fonts-loaded');
            } catch (error) {
                console.error('Failed to load custom fonts:', error);
                // Fallback to system fonts is automatic due to font stack
            }
        };

        // Load fonts with requestIdleCallback for better performance
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => loadFonts(), { timeout: 3000 });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(loadFonts, 100);
        }

        // Add CSS for font loading states
        const fontLoadingStyles = document.createElement('style');
        fontLoadingStyles.textContent = `
            /* Use system fonts initially for faster paint */
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
                            Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            }

            /* Apply custom fonts when loaded */
            .custom-fonts-loaded body {
                font-family: "Sen", -apple-system, BlinkMacSystemFont, "Segoe UI", 
                            Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            }

            /* Smooth transition when fonts load */
            body, h1, h2, h3, h4, h5, h6, p, a, li {
                transition: font-family 0.2s ease-in-out;
            }

            /* Prevent layout shift from font loading */
            h1, h2, h3, h4, h5, h6 {
                font-synthesis: none;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
        `;
        document.head.appendChild(fontLoadingStyles);

        return () => {
            // Cleanup if needed
            if (fontLoadingStyles.parentNode) {
                fontLoadingStyles.parentNode.removeChild(fontLoadingStyles);
            }
        };
    }, []);

    return (
        <Head>
            {/* Preload font files for faster loading */}
            <link
                rel="preload"
                href="/fonts/Sen-Regular.woff2"
                as="font"
                type="font/woff2"
                crossOrigin="anonymous"
            />
            <link
                rel="preload"
                href="/fonts/Sen-Bold.woff2"
                as="font"
                type="font/woff2"
                crossOrigin="anonymous"
            />
            
            {/* Font-face declarations with font-display: swap */}
            <style>{`
                @font-face {
                    font-family: 'Sen';
                    src: url('/fonts/Sen-Regular.woff2') format('woff2'),
                         url('/fonts/Sen-Regular.woff') format('woff');
                    font-weight: 400;
                    font-style: normal;
                    font-display: swap; /* Critical: shows text immediately */
                }

                @font-face {
                    font-family: 'Sen';
                    src: url('/fonts/Sen-Bold.woff2') format('woff2'),
                         url('/fonts/Sen-Bold.woff') format('woff');
                    font-weight: 700;
                    font-style: normal;
                    font-display: swap;
                }

                @font-face {
                    font-family: 'Sen';
                    src: url('/fonts/Sen-SemiBold.woff2') format('woff2'),
                         url('/fonts/Sen-SemiBold.woff') format('woff');
                    font-weight: 600;
                    font-style: normal;
                    font-display: swap;
                }

                /* Fallback for older browsers */
                @supports not (font-display: swap) {
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
                                    Roboto, Oxygen, Ubuntu, sans-serif;
                    }
                }
            `}</style>
        </Head>
    );
}