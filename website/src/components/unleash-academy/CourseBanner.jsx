import React from 'react';

const Component = ({ level, description }) => {
    return (
        <div className={ `academy-banner course-banner-container ${level.toLowerCase()}`}>
            <span className='level'>{level}</span>
            <p>{description}</p>
            <ul className="unleash-academy-banner-list">
                <li>100% Free & online</li>
                <li>Valuable certification</li>
            </ul>
        </div>
    );
};

export default Component;
