import clsx from 'clsx';
import type { Props } from '@theme/Footer/Layout';

import FooterGitHubIcon from '../icons/github.svg';
import FooterLinkedInIcon from '../icons/linkedin.svg';
import FooterTwitterIcon from '../icons/twitter.svg';
import FooterSlackIcon from '../icons/slack.svg';
import FooterStackOverflowIcon from '../icons/stackoverflow.svg';
import FooterYouTubeIcon from '../icons/youtube.svg';

import HeartIcon from '../icons/heart.svg';

type IconLink = {
    href: string;
    icon: JSX.Element;
};

const linkIcons: IconLink[] = [
    {
        href: 'https://github.com/unleash/unleash',
        icon: <FooterGitHubIcon />,
    },
    {
        href: 'https://www.linkedin.com/company/getunleash',
        icon: <FooterLinkedInIcon />,
    },
    {
        href: 'https://twitter.com/getunleash',
        icon: <FooterTwitterIcon />,
    },
    {
        href: 'https://slack.unleash.run',
        icon: <FooterSlackIcon />,
    },
    {
        href: 'https://stackoverflow.com/questions/tagged/unleash',
        icon: <FooterStackOverflowIcon />,
    },
    {
        href: 'https://www.youtube.com/channel/UCJjGVOc5QBbEje-r7nZEa4A',
        icon: <FooterYouTubeIcon />,
    },
];

export default function FooterLayout({
    style,
    links,
    logo,
    copyright,
}: Props): JSX.Element {
    const description = (
        <div className='footer-description'>
            {logo}
            <div>
                <p>
                    Unleash reduces the risk of releasing new features, drives
                    innovation by streamlining the software release process, and
                    increases revenue by optimizing end-user experience. While
                    we serve the needs of the world's largest, most
                    security-conscious organizations, we are also rated the
                    “Easiest Feature Management system to use” by G2.
                </p>
                <div className='link-icons'>
                    {linkIcons.map(({ href, icon }) => (
                        <a
                            key={href}
                            href={href}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {icon}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <footer
            className={clsx('footer', {
                'footer--dark': style === 'dark',
            })}
        >
            <div className='footer-body'>
                <div className='footer-content'>
                    <div className='footer-show-large'>{description}</div>
                    <div className='container container-fluid'>{links}</div>
                    <div className='footer-show-small'>{description}</div>
                </div>
                <div className='footer-separator' />
                <div className='footer-bottom'>
                    <div className='footer-bottom-made-with-love'>
                        <HeartIcon /> Made in a cosy atmosphere in the Nordic
                        countries.
                    </div>
                    {copyright && (
                        <div className='footer__bottom'>{copyright}</div>
                    )}
                </div>
            </div>
        </footer>
    );
}
