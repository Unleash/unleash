// biome-ignore lint/correctness/noUnusedImports: Needs this for React to work
import React, { useState, useCallback } from 'react';
import Admonition from '@theme/Admonition';
import styles from './VideoContent.module.css';

// Extract YouTube video ID from various URL formats
const extractVideoId = (url) => {
    const regex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

const LazyVideo = ({ url, title = 'YouTube video player', thumbnailUrl }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const videoId = extractVideoId(url);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);

    if (!videoId) {
        return (
            <Admonition type='warning'>Invalid YouTube URL: {url}</Admonition>
        );
    }

    const thumbnailSrc = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    if (!isLoaded) {
        return (
            <div
                className={styles.videoThumbnail}
                onClick={handleLoad}
                onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
                role='button'
                tabIndex={0}
                aria-label={`Load ${title}`}
            >
                <img
                    className={styles.thumbnailImage}
                    src={thumbnailSrc}
                    alt={`${title} thumbnail`}
                    fetchpriority='high'
                />
                <div className={styles.playButton}>
                    <svg
                        width='32'
                        height='32'
                        viewBox='0 0 24 24'
                        fill='white'
                        style={{ marginLeft: '2px' }}
                    >
                        <path d='M8 5v14l11-7z' />
                    </svg>
                </div>

                <div className={styles.loadingHint}>Click to load video</div>
            </div>
        );
    }

    return (
        <div className={styles.videoWrapper}>
            <iframe
                className={styles.loadedVideo}
                src={`${url}${url.includes('?') ? '&' : '?'}autoplay=1`}
                title={title}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
                loading='lazy'
            />
        </div>
    );
};

const VideoContent = ({ videoUrls, thumbnailUrl }) => {
    if (!videoUrls || videoUrls.length === 0) {
        return (
            <Admonition type='danger'>
                You need to provide YouTube video URLs for this component to
                work properly.
            </Admonition>
        );
    }

    return (
        <article className={`unleash-video-container ${styles.videoContainer}`}>
            {videoUrls.map((url, index) => (
                <LazyVideo
                    key={url}
                    url={url}
                    title={`YouTube video player ${index + 1}`}
                    thumbnailUrl={thumbnailUrl}
                />
            ))}
        </article>
    );
};

export default VideoContent;
