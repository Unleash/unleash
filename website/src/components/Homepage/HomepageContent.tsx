import styles from './content.module.css';
import VideoContent from '@site/src/components/VideoContent.jsx';

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
            <div className={styles.video}>
                <VideoContent
                    videoUrls={['https://www.youtube.com/embed/3h5NhorR4Ig']}
                />
            </div>
        </div>
    );
};

export default HomepageContent;
