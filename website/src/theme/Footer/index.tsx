import Footer from '@theme-original/Footer';
import type FooterType from '@theme/Footer';
import type { WrapperProps } from '@docusaurus/types';
import styles from './footer.module.css';
import Heart from './Heart';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): JSX.Element {
    return (
        <div className={styles.wrapper}>
            <div className={styles.footer}>
                <div className={styles.unleash}>
                    <p>
                        Unleash reduces the risk of releasing new features,
                        drives innovation by streamlining the software release
                        process. While we serve the needs of the world's
                        largest, most security-conscious organizations, we are
                        also rated the “Easiest Feature Management system to
                        use” by G2.
                    </p>
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
