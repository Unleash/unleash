// biome-ignore lint/correctness/noUnusedImports: Needs this for React to work
import React from 'react';
import Link from '@docusaurus/Link';

const LinkBox = ({ level, header, description, link }) => {
    return (
        <article
            className={`${level.toLowerCase()} unleash-academy-level-container`}
        >
            <div className='header'>
                <span className='unleash-academy-level-badge'>{level}</span>
                <h3>{header}</h3>
            </div>
            <p>{description}</p>
            <Link
                className='unleash-action-button'
                to={`/unleash-academy/${link}`}
                title={header}
            >
                Start learning
            </Link>
        </article>
    );
};

const links = [
    {
        level: 'Beginners',
        header: 'Foundational',
        description:
            'For all roles working with Unleash - Developers, Product owners, Leaders',
        link: 'foundational',
    },
    {
        level: 'Advanced',
        header: 'Advanced for Developers',
        description:
            'For Developers only, after Foundational content has been reviewed',
        link: 'advanced-for-devs',
    },
    {
        level: 'Advanced',
        header: 'Managing Unleash for DevOps/Admins',
        description:
            'For DevOps, Platform leads and Admins only after Foundational content has been reviewed',
        link: 'managing-unleash-for-devops',
    },
];

const Component = () => {
    return (
        <div className='unleash-academy-links-container'>
            <ul className='unleash-academy-links'>
                {links.map(({ level, header, description, link }) => (
                    <li key={header}>
                        <LinkBox
                            level={level}
                            header={header}
                            description={description}
                            link={link}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Component;
