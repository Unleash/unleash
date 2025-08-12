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

// Lazy video component that shows thumbnail until clicked
const LazyVideo = ({ url, title = 'YouTube video player' }) => {
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

    if (!isLoaded) {
        return (
            <div
                className={styles.videoThumbnail}
                onClick={handleLoad}
                onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
                role='button'
                tabIndex={0}
                style={{
                    backgroundImage: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`,
                }}
                aria-label={`Load ${title}`}
            >
                {/* Play button overlay */}
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

                {/* Loading hint */}
                <div className={styles.loadingHint}>Click to load video</div>
            </div>
        );
    }

    return (
        <iframe
            className={styles.loadedVideo}
            width='100%'
            height='315'
            src={`${url}${url.includes('?') ? '&' : '?'}autoplay=1`}
            title={title}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            allowFullScreen
            loading='lazy'
        />
    );
};

const VideoContent = ({ videoUrls }) => {
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
                />
            ))}
        </article>
    );
};

export default VideoContent;
