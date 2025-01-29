import clsx from 'clsx';
import type { Props } from '@theme/Footer/Layout';

import ThemedImage from '@theme/ThemedImage';

import HeartIcon from '../icons/heart.svg';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';

type IconLink = {
    href: string;
    src: string;
    srcDark: string;
    alt: string;
};

const linkIcons: IconLink[] = [
    {
        href: 'https://github.com/unleash/unleash',
        src: '/img/footer/githubLight.png',
        srcDark: '/img/footer/githubDark.png',
        alt: 'GitHub',
    },
    {
        href: 'https://www.linkedin.com/company/getunleash',
        src: '/img/footer/linkedinLight.png',
        srcDark: '/img/footer/linkedinDark.png',
        alt: 'LinkedIn',
    },
    {
        href: 'https://twitter.com/getunleash',
        src: '/img/footer/twitterLight.png',
        srcDark: '/img/footer/twitterDark.png',
        alt: 'Twitter',
    },
    {
        href: 'https://slack.unleash.run',
        src: '/img/footer/slackLight.png',
        srcDark: '/img/footer/slackDark.png',
        alt: 'Slack',
    },
    {
        href: 'https://stackoverflow.com/questions/tagged/unleash',
        src: '/img/footer/stackoverflowLight.png',
        srcDark: '/img/footer/stackoverflowDark.png',
        alt: 'Stack Overflow',
    },
    {
        href: 'https://www.youtube.com/channel/UCJjGVOc5QBbEje-r7nZEa4A',
        src: '/img/footer/youtubeLight.png',
        srcDark: '/img/footer/youtubeDark.png',
        alt: 'YouTube',
    },
];

export default function FooterLayout({
    style,
    links,
    logo,
    copyright,
}: Props): JSX.Element {
    const { withBaseUrl } = useBaseUrlUtils();

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
                    {linkIcons.map(({ href, src, srcDark, alt }) => (
                        <a
                            key={alt}
                            href={href}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <ThemedImage
                                alt={alt}
                                sources={{
                                    light: withBaseUrl(src),
                                    dark: withBaseUrl(srcDark),
                                }}
                                width={40}
                                height={40}
                            />
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
