import React, { useEffect } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
// import OptimizedStyles from './OptimizedStyles';
// import FontLoader from './FontLoader';
// import LayoutStabilizer from './LayoutStabilizer';

// Import critical CSS directly for immediate availability
import criticalCSS from '!raw-loader!../css/critical.css';

export default function Root({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (!ExecutionEnvironment.canUseDOM) {
            return;
        }

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

        const handleUserInteraction = () => {
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

        return () => {
            window.removeEventListener('scroll', handleUserInteraction);
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('touchstart', handleUserInteraction);
            window.removeEventListener('mousemove', handleUserInteraction);
        };
    }, []);

    return (
        <>
            {/* Inline critical CSS for instant rendering */}
            <style
                dangerouslySetInnerHTML={{ __html: criticalCSS }}
                data-critical='true'
            />

            {/* Performance optimization components disabled to prevent style conflicts */}
            {/* <OptimizedStyles /> */}
            {/* <FontLoader /> */}
            {/* <LayoutStabilizer /> */}

            {/* Main app content */}
            {children}
        </>
    );
}
