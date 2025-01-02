import Footer from '@theme-original/Footer';
import type FooterType from '@theme/Footer';
import type { WrapperProps } from '@docusaurus/types';
import styles from './footer.module.css';
import Heart from './Heart';
import LinkedinIcon from './icons/linkedin.svg';
import TwitterIcon from './icons/Twitter.svg';
import SlackIcon from './icons/Slack.svg';
import YoutubeIcon from './icons/youtube.svg';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): JSX.Element {
    return (
        <div className={styles.wrapper}>
            <div className={styles.footer}>
                <div className={styles.unleash}>
                    <img
                        src='/img/logo.svg'
                        width='70'
                        height='70'
                        alt='Unleash logo'
                    />
                    <div style={{ maxWidth: '300px' }}>
                        <p>
                            Unleash reduces the risk of releasing new features,
                            drives innovation by streamlining the software
                            release process. While we serve the needs of the
                            world's largest, most security-conscious
                            organizations, we are also rated the “Easiest
                            Feature Management system to use” by G2.
                        </p>
                        <div className={styles.social}>
                            <a
                                href='https://www.linkedin.com/company/getunleash/'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <LinkedinIcon />
                            </a>
                            <a
                                href='https://twitter.com/getunleash'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <TwitterIcon />
                            </a>
                            <a
                                href='https://unleash-community.slack.com/signup/'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <SlackIcon />
                            </a>
                            <a
                                href='https://www.youtube.com/channel/UCJjGVOc5QBbEje-r7nZEa4A'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <YoutubeIcon />
                            </a>
                        </div>
                    </div>
                </div>
                <Footer {...props} />
            </div>
            <div className={styles.copyright}>
                <p style={{ display: 'flex', gap: '5px' }}>
                    <Heart />
                    Made in a cosy atmosphere in the Nordic countries.
                </p>
                <p>
                    {`Copyright © ${new Date().getFullYear()} Unleash. Built with Docusaurus.`}
                </p>
            </div>
        </div>
    );
}
