// biome-ignore lint/correctness/noUnusedImports: Needs this for React to work
import React from 'react';

const Component = () => {
    return (
        <div className='unleash-academy-banner academy-general-banner'>
            <div className='academy-general-banner-content'>
                <h3 className='academy-banner-main-text'>
                    Gain new skills, earn certifications, train your team, and
                    advance your career.
                </h3>
                <ul className='unleash-academy-banner-list'>
                    <li>100% Free & online</li>
                    <li>Valuable certification</li>
                </ul>
                <div className='small-logo' />
            </div>
            <div className='big-logo' />
        </div>
    );
};

export default Component;
