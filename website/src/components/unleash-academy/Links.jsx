import React from 'react';

const LinkBox = ({ level, header, description }) => {
    return (
        <article>
            <div>
                <span className='level'>{level}</span>
                <h3>{header}</h3>
                <p>{description}</p>
            </div>
            <button>Start learning</button>
        </article>
    );
};

const links = [
    {
        level: 'Beginners',
        header: 'Foundational',
        description:
            'For all roles working with Unleash - Developers, Product owners, Leaders',
    },
    {
        level: 'Advanced',
        header: 'Advanced for Developers',
        description:
            'For Developers only, after Foundational content has been reviewed',
    },
    {
        level: 'Advanced',
        header: 'Managing Unleash for DevOps/Admins',
        description:
            'For DevOps, Platform leads and Admins only after Foundational content has been reviewed',
    },
];

const Component = () => {
    return (
        <div className='links-container'>
            <ol className='links-wrapper'>
                {links.map(({ level, header, description }) => (
                    <li>
                        <LinkBox
                            level={level}
                            header={header}
                            description={description}
                        />
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default Component;
