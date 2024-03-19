// biome-ignore lint/correctness/noUnusedImports: Needs this for React to work
import React from 'react';

const Component = ({ level, description }) => {
    return (
        <div
            className={`unleash-academy-banner course-banner-container unleash-academy-level-container ${level.toLowerCase()}`}
        >
            <span className='unleash-academy-level-badge'>{level}</span>
            <p className='academy-banner-main-text'>{description}</p>
            <ul className='unleash-academy-banner-list'>
                <li>100% Free & online</li>
                <li>Valuable certification</li>
            </ul>
        </div>
    );
};

export default Component;
