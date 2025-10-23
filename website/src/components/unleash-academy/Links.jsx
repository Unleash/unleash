// biome-ignore lint/correctness/noUnusedImports: Needs this for React to work
import React from 'react';
import Link from '@docusaurus/Link';

const LinkBox = ({ level, header, description, link, academyLink }) => {
    return (
        <article
            className={`${level.toLowerCase()} unleash-academy-level-container`}
        >
            <div className='header'>
                <span className='unleash-academy-level-badge'>{level}</span>
                <h3>{header}</h3>
            </div>
            <p>{description}</p>
            <div className='unleash-academy-buttons'>
                <Link
                    className='unleash-action-button start-learning'
                    to={`/unleash-academy/${link}`}
                    title={header}
                >
                    Start learning
                </Link>
                <div className='button-spacing'></div>
                <Link
                    className='unleash-action-button get-certified'
                    to={academyLink}
                    title={header}
                >
                    Get certified
                </Link>
            </div>
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
        academyLink:
            'https://docs.google.com/forms/d/e/1FAIpQLSe5F9cuGlkkUgVOGZ8Ny6xtsaSRygfUCMR-cab0e_DRIMk5sw/viewform',
    },
    {
        level: 'Advanced',
        header: 'Advanced for Developers',
        description:
            'For Developers only, after Foundational content has been reviewed',
        link: 'advanced-for-devs',
        academyLink:
            'https://docs.google.com/forms/d/e/1FAIpQLSfvux6w80HTHg5SEHxir6vEp5dQxDVsyk_-F2IPKbBgH5faMg/viewform',
    },
    {
        level: 'Advanced',
        header: 'Managing Unleash for DevOps/Admins',
        description:
            'For DevOps, Platform leads and Admins only after Foundational content has been reviewed',
        link: 'managing-unleash-for-devops',
        academyLink:
            'https://docs.google.com/forms/d/e/1FAIpQLScS8yHuDs0xSsqmFs9W9ptBJUKDts7WSi9g_FoU2D-oK2W7Bg/viewform',
    },
];

const Component = () => {
    return (
        <div className='unleash-academy-links-container'>
            <ul className='unleash-academy-links'>
                {links.map(
                    ({ level, header, description, link, academyLink }) => (
                        <li key={header}>
                            <LinkBox
                                level={level}
                                header={header}
                                description={description}
                                link={link}
                                academyLink={academyLink}
                            />
                        </li>
                    ),
                )}
            </ul>
        </div>
    );
};

export default Component;
