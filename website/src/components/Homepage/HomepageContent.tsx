import styles from './content.module.css';
import video from './video-preview.png';
import ExternalIcon from './icons/external.svg';

const HomepageContent = () => {
    return (
        <div className={styles.content}>
            <div>
                <p>
                    Unleash is a <strong>private</strong>,{' '}
                    <strong>secure</strong>, and{' '}
                    <strong>scalable feature management platform</strong> built
                    to reduce the risk of releasing new features and accelerate
                    software development.
                </p>
                <p>
                    Whether you’re a small team or a large enterprise, Unleash
                    enables you to <strong>innovate faster</strong> and make
                    data-driven decisions that{' '}
                    <strong>enhance your user experience</strong>.
                </p>
                <p>
                    With market-leading data governance, robust change and
                    access controls, SaaS or self-hosted deployment options,
                    multi-region support, and the flexibility of{' '}
                    <strong>open-source</strong>, you have the freedom to choose
                    the setup that works best for you while maintaining full
                    control over your data.
                </p>
            </div>
            <a href='https://www.youtube.com/watch?v=3h5NhorR4Ig'>
                <img src={video} alt='video preview' />
                <p
                    style={{
                        display: 'flex',
                        gap: '2px',
                        alignItems: 'center',
                    }}
                >
                    Why Unleash, why now? <ExternalIcon />
                </p>
            </a>
        </div>
    );
};

export default HomepageContent;
