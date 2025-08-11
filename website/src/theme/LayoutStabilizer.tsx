import React, { useEffect } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Head from '@docusaurus/Head';

export default function LayoutStabilizer(): React.JSX.Element {
    useEffect(() => {
        if (!ExecutionEnvironment.canUseDOM) {
            return;
        }

        // Add layout stability classes
        const stabilizeLayout = () => {
            // Reserve space for navbar
            const navbar = document.querySelector('.navbar');
            if (navbar && !navbar.classList.contains('layout-reserved')) {
                navbar.classList.add('layout-reserved');
            }

            // Reserve space for sidebar
            const sidebar = document.querySelector('aside[class*="docSidebarContainer"]');
            if (sidebar && !sidebar.classList.contains('layout-reserved')) {
                sidebar.classList.add('layout-reserved');
            }

            // Stabilize main container
            const mainContainer = document.querySelector('main[class*="docMainContainer"]');
            if (mainContainer && !mainContainer.classList.contains('layout-stabilized')) {
                mainContainer.classList.add('layout-stabilized');
            }

            // Add skeleton loading for slow content
            const addSkeletonLoading = () => {
                const contentContainers = document.querySelectorAll('article:empty, .markdown:empty');
                contentContainers.forEach(container => {
                    if (!container.querySelector('.skeleton-loader')) {
                        const skeleton = document.createElement('div');
                        skeleton.className = 'skeleton-loader';
                        skeleton.innerHTML = `
                            <div class="skeleton skeleton-title"></div>
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-text" style="width: 80%"></div>
                        `;
                        container.appendChild(skeleton);
                    }
                });
            };

            addSkeletonLoading();

            // Observe images for lazy loading with proper dimensions
            const images = document.querySelectorAll('img:not([data-stabilized])');
            images.forEach(img => {
                const imgElement = img as HTMLImageElement;
                
                // If image has intrinsic dimensions, reserve space
                if (imgElement.naturalWidth && imgElement.naturalHeight) {
                    const aspectRatio = imgElement.naturalHeight / imgElement.naturalWidth;
                    imgElement.style.aspectRatio = `${imgElement.naturalWidth} / ${imgElement.naturalHeight}`;
                } else {
                    // Set a default aspect ratio for common image types
                    if (imgElement.src.includes('screenshot') || imgElement.src.includes('demo')) {
                        imgElement.style.aspectRatio = '16 / 9';
                    } else if (imgElement.src.includes('logo') || imgElement.src.includes('icon')) {
                        imgElement.style.aspectRatio = '1 / 1';
                    } else {
                        imgElement.style.aspectRatio = '4 / 3'; // Default aspect ratio
                    }
                }
                
                imgElement.setAttribute('data-stabilized', 'true');
                imgElement.loading = 'lazy'; // Enable native lazy loading
                imgElement.decoding = 'async'; // Async decoding for better performance
            });
        };

        // Run stabilization immediately
        stabilizeLayout();

        // Re-run on route changes (for SPA navigation)
        const observer = new MutationObserver(() => {
            stabilizeLayout();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Monitor viewport changes
        let resizeTimer: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                stabilizeLayout();
            }, 250);
        };

        window.addEventListener('resize', handleResize, { passive: true });

        // Cleanup
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimer);
        };
    }, []);

    return (
        <Head>
            <style>{`
                /* Layout Stability Styles */
                
                /* Reserve space for navbar */
                .navbar.layout-reserved {
                    min-height: 56px;
                    contain: layout style;
                }

                /* Reserve space for sidebar */
                aside.layout-reserved {
                    min-width: 250px;
                    contain: layout style;
                }

                /* Stabilize main container */
                main.layout-stabilized {
                    min-height: calc(100vh - 56px);
                    contain: layout;
                    will-change: auto;
                }

                /* Prevent layout shifts from async content */
                article {
                    min-height: 400px;
                    contain: layout style;
                }

                /* Image stability */
                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    background: #f0f0f0;
                }

                img[data-stabilized] {
                    background: transparent;
                }

                /* Skeleton loading styles */
                .skeleton-loader {
                    padding: 1rem;
                    animation: fade-in 0.3s ease-in;
                }

                .skeleton {
                    background: linear-gradient(
                        90deg,
                        #f0f0f0 25%,
                        #e0e0e0 50%,
                        #f0f0f0 75%
                    );
                    background-size: 200% 100%;
                    animation: skeleton-shimmer 1.5s infinite;
                    border-radius: 4px;
                    margin-bottom: 1rem;
                }

                .skeleton-title {
                    height: 2rem;
                    width: 60%;
                    margin-bottom: 1.5rem;
                }

                .skeleton-text {
                    height: 1rem;
                    width: 100%;
                    margin-bottom: 0.5rem;
                }

                @keyframes skeleton-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Prevent CLS from font loading */
                body {
                    font-synthesis: none;
                    text-rendering: optimizeLegibility;
                }

                /* Stabilize buttons and interactive elements */
                button, a.button {
                    min-height: 36px;
                    contain: layout style;
                }

                /* Stabilize form elements */
                input, textarea, select {
                    min-height: 36px;
                    contain: layout style;
                }

                /* Code blocks stability */
                pre {
                    min-height: 60px;
                    contain: layout;
                    overflow: auto;
                }

                /* Table stability */
                table {
                    table-layout: fixed;
                    width: 100%;
                    contain: layout;
                }

                /* Mobile stability */
                @media (max-width: 996px) {
                    main.layout-stabilized {
                        min-height: calc(100vh - 60px);
                    }
                    
                    .navbar.layout-reserved {
                        min-height: 60px;
                    }
                }

                /* Prevent layout shift from lazy-loaded content */
                [data-lazy-load] {
                    min-height: 100px;
                    contain: layout;
                }

                /* Optimize Cumulative Layout Shift */
                * {
                    /* Prevent margin collapse issues */
                    margin-top: 0;
                }

                h1, h2, h3, h4, h5, h6, p, ul, ol {
                    margin-bottom: 1rem;
                }
            `}</style>
        </Head>
    );
}