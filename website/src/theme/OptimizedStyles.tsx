import React, { useEffect } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export default function OptimizedStyles() {
    useEffect(() => {
        if (!ExecutionEnvironment.canUseDOM) {
            return;
        }

        // Function to load CSS asynchronously
        const loadStylesheet = (href: string, media: string = 'all') => {
            // Check if already loaded
            if (document.querySelector(`link[href="${href}"]`)) {
                return;
            }

            // Create preload link
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'style';
            preloadLink.href = href;
            
            // Create actual stylesheet link
            const styleLink = document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href = href;
            styleLink.media = media;
            
            // Once preloaded, apply the stylesheet
            preloadLink.onload = () => {
                preloadLink.onload = null;
                // Switch from preload to stylesheet
                preloadLink.rel = 'stylesheet';
            };
            
            // Fallback for browsers that don't support preload
            const noscriptFallback = document.createElement('noscript');
            const fallbackLink = document.createElement('link');
            fallbackLink.rel = 'stylesheet';
            fallbackLink.href = href;
            noscriptFallback.appendChild(fallbackLink);
            
            // Add to document head
            document.head.appendChild(preloadLink);
            document.head.appendChild(noscriptFallback);
            
            // Also add regular link with print media to load in background
            const printLink = document.createElement('link');
            printLink.rel = 'stylesheet';
            printLink.href = href;
            printLink.media = 'print';
            printLink.onload = function() {
                (this as HTMLLinkElement).media = media;
            };
            document.head.appendChild(printLink);
        };

        // Load non-critical styles after initial render
        const loadNonCriticalStyles = () => {
            // Load additional styles based on viewport
            if (window.innerWidth > 996) {
                // Desktop-specific styles
                loadStylesheet('/assets/css/desktop-enhancements.css', 'screen and (min-width: 997px)');
            } else {
                // Mobile-specific styles
                loadStylesheet('/assets/css/mobile-enhancements.css', 'screen and (max-width: 996px)');
            }
            
            // Load animation and interaction styles
            loadStylesheet('/assets/css/animations.css', 'all');
            
            // Load theme-specific styles
            const theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                loadStylesheet('/assets/css/dark-theme.css', 'all');
            }
        };

        // Use requestIdleCallback if available, otherwise setTimeout
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(loadNonCriticalStyles, { timeout: 2000 });
        } else {
            setTimeout(loadNonCriticalStyles, 100);
        }

        // Optimize existing stylesheets
        const optimizeExistingStyles = () => {
            const allStylesheets = document.querySelectorAll('link[rel="stylesheet"]');
            allStylesheets.forEach((stylesheet) => {
                const link = stylesheet as HTMLLinkElement;
                // Skip critical styles and any styles that are already optimized
                if (link.href.includes('critical') || 
                    link.getAttribute('data-critical') === 'true' ||
                    link.getAttribute('data-optimized') === 'true') {
                    return;
                }
                
                // Mark as optimized to avoid re-processing
                link.setAttribute('data-optimized', 'true');
                
                // Convert blocking stylesheets to non-blocking
                if (!link.media || link.media === 'all') {
                    // Temporarily set to print to make non-blocking
                    const originalMedia = link.media || 'all';
                    link.media = 'print';
                    link.onload = function() {
                        (this as HTMLLinkElement).media = originalMedia;
                    };
                }
            });
        };

        // Run optimization immediately
        optimizeExistingStyles();

        // Monitor for dynamically added stylesheets
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeName === 'LINK') {
                            const link = node as HTMLLinkElement;
                            if (link.rel === 'stylesheet' && 
                                !link.getAttribute('data-optimized') &&
                                !link.getAttribute('data-critical') &&
                                !link.href.includes('critical')) {
                                link.setAttribute('data-optimized', 'true');
                                // Make it non-blocking
                                const originalMedia = link.media || 'all';
                                link.media = 'print';
                                link.onload = function() {
                                    (this as HTMLLinkElement).media = originalMedia;
                                };
                            }
                        }
                    });
                }
            });
        });

        // Start observing the document head for changes
        observer.observe(document.head, {
            childList: true,
            subtree: false
        });

        // Cleanup
        return () => {
            observer.disconnect();
        };
    }, []);

    // This component handles non-critical CSS optimization only
    // Critical CSS is handled in Root.tsx
    return null;
}