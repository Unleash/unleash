import React from 'react';
import Admonition from '@theme/Admonition';

const Component = ({ videoUrls }) => {
    return (
        <article className='unleash-video-container'>
            {videoUrls ? (
                videoUrls.map((url) => (
                    <iframe
                        key={url}
                        width='100%'
                        height='auto'
                        src={url}
                        title='YouTube video player'
                        frameBorder='0'
                        allowFullScreen
                    ></iframe>
                ))
            ) : (
                <Admonition type='danger'>
                    You need to provide YouTube video URLs for this component to
                    work properly.
                </Admonition>
            )}
        </article>
    );
};

export default Component;
