import React from 'react';
import Admonition from '@theme/Admonition';

const Component = ({ videoUrls, children }) => {
    return (
        <article className="unleash-video-wrapper">
            <div className="unleash-video-container">
                <Admonition type="tip" title="Video content">
                    {children}
                    Hey! Did you know that the content in this guide is also
                    available in video format? If that's more your speed, feel
                    free to check out one of these related videos 🍿📽
                </Admonition>

                <div className="videos">
                    {videoUrls ? (
                        videoUrls.map((url) => (
                            <div className="video-wrapper">
                                <iframe
                                    key={url}
                                    width="100%"
                                    height="auto"
                                    src={url}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ))
                    ) : (
                        <Admonition type="danger">
                            You need to provide YouTube video URLs for this
                            component to work properly.
                        </Admonition>
                    )}
                </div>
            </div>
        </article>
    );
};

export default Component;
