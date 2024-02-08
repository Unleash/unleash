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
                <div className='small-logo'></div>
                <a
                    href='https://docs.google.com/forms/d/1iPUk2I0k5xMzicn9aLMcPF3b9ub3ZwdVjRxCxWxV7js/viewform'
                    className='unleash-action-button'
                >
                    Get certified
                </a>
            </div>
            <div className='big-logo'></div>
        </div>
    );
};

export default Component;
