import React, { useEffect } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export default function Root({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (!ExecutionEnvironment.canUseDOM) {
            return;
        }

        const loadGoogleAnalytics = () => {
            // Skip Google Analytics in development
            if (process.env.NODE_ENV === 'development') {
                return;
            }

            if (
                window.gtag ||
                document.querySelector('script[src*="googletagmanager"]')
            ) {
                return;
            }

            // Load Google Analytics
            const gaScript = document.createElement('script');
            gaScript.async = true;
            gaScript.src =
                'https://www.googletagmanager.com/gtag/js?id=UA-134882379-1';
            document.head.appendChild(gaScript);

            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            function gtag(...args: any[]) {
                window.dataLayer.push(args);
            }
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'UA-134882379-1');
        };

        const loadGoogleTagManager = () => {
            // Skip GTM in development
            if (process.env.NODE_ENV === 'development') {
                return;
            }

            if (
                window.google_tag_manager ||
                document.querySelector(
                    'script[src*="googletagmanager.com/gtm.js"]',
                )
            ) {
                return;
            }

            // Load GTM script
            const gtmScript = document.createElement('script');
            gtmScript.async = true;
            gtmScript.src =
                'https://www.googletagmanager.com/gtm.js?id=GTM-KV5PRR2';
            document.head.appendChild(gtmScript);

            // Initialize dataLayer
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js',
            });
        };

        const loadKapaWidget = () => {
            if (
                document.querySelector('script[src*="kapa-widget.bundle.js"]')
            ) {
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://widget.kapa.ai/kapa-widget.bundle.js';
            script.async = true;
            script.defer = true;

            script.setAttribute(
                'data-website-id',
                '1d187510-1726-4011-b0f7-62742ae064ee',
            );
            script.setAttribute('data-project-name', 'Unleash');
            script.setAttribute('data-project-color', '#1A4049');
            script.setAttribute(
                'data-project-logo',
                'https://cdn.getunleash.io/uploads/2024/05/logo-unleash-white.svg',
            );
            script.setAttribute(
                'data-modal-image',
                'https://cdn.getunleash.io/uploads/2022/05/logo.png',
            );
            script.setAttribute('data-button-position-right', '0');
            script.setAttribute(
                'data-button-border-radius',
                '10px 0px 0px 10px',
            );
            script.setAttribute('data-button-width', '80px');
            script.setAttribute('data-button-height', '100px');
            script.setAttribute('data-button-image-height', '55px');
            script.setAttribute('data-button-image-width', '55px');
            script.setAttribute('data-button-text-font-weight', '400');
            script.setAttribute('data-button-text-font-size', '16px');
            script.setAttribute(
                'data-button-text-font-family',
                '"Sen", sans-serif',
            );
            script.setAttribute('data-button-text', 'ASK AI');

            document.head.appendChild(script);
        };

        let hasInteracted = false;
        let fallbackTimer: NodeJS.Timeout;

        const handleUserInteraction = () => {
            if (hasInteracted) return;
            hasInteracted = true;

            if (fallbackTimer) {
                clearTimeout(fallbackTimer);
            }

            loadGoogleAnalytics();
            loadGoogleTagManager();
            loadKapaWidget();

            window.removeEventListener('scroll', handleUserInteraction);
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('touchstart', handleUserInteraction);
            window.removeEventListener('mousemove', handleUserInteraction);
        };

        window.addEventListener('scroll', handleUserInteraction, {
            once: true,
            passive: true,
        });
        window.addEventListener('click', handleUserInteraction, { once: true });
        window.addEventListener('touchstart', handleUserInteraction, {
            once: true,
            passive: true,
        });
        window.addEventListener('mousemove', handleUserInteraction, {
            once: true,
            passive: true,
        });

        fallbackTimer = setTimeout(() => {
            if (!hasInteracted) {
                hasInteracted = true;
                loadGoogleAnalytics();
                loadGoogleTagManager();
            }
        }, 3000);

        return () => {
            window.removeEventListener('scroll', handleUserInteraction);
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('touchstart', handleUserInteraction);
            window.removeEventListener('mousemove', handleUserInteraction);
            if (fallbackTimer) {
                clearTimeout(fallbackTimer);
            }
        };
    }, []);

    return <>{children}</>;
}
