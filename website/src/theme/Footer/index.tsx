import Footer from '@theme-original/Footer';
import type FooterType from '@theme/Footer';
import type { WrapperProps } from '@docusaurus/types';
import styles from './footer.module.css';

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
                    <svg
                        width='21'
                        height='21'
                        viewBox='0 0 21 21'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <title>Heart</title>
                        <path
                            d='M17.0674 4.53516V10.5352H19.0674V4.53516H17.0674Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M1.06738 4.53516L1.06738 10.5352H3.06738L3.06738 4.53516H1.06738Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M17.0674 2.53516H13.0674V10.5352H17.0674V2.53516Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M7.06738 2.53516H3.06738V10.5352H7.06738V2.53516Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M13.0674 12.5352H5.06738V14.5352H13.0674V12.5352Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M15.0674 10.5352H3.06738V12.5352H15.0674V10.5352Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M11.0674 6.53516H9.06738V10.5352H11.0674V6.53516Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M13.0674 4.53516H11.0674V10.5352H13.0674V4.53516Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M9.06738 4.53516H7.06738V10.5352H9.06738V4.53516Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M11.0674 14.5352H7.06738V16.5352H11.0674V14.5352Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M11.0674 16.5352H9.06738V18.5352H11.0674V16.5352Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M13.0674 14.5352H11.0674V16.5352H13.0674V14.5352Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M15.0674 12.5352H13.0674V14.5352H15.0674V12.5352Z'
                            fill='#817AFE'
                        />
                        <path
                            d='M17.0674 10.5352H15.0674V12.5352H17.0674V10.5352Z'
                            fill='#817AFE'
                        />
                    </svg>
                    Made in a cosy atmosphere in the Nordic countries.
                </p>
                <p>
                    {`Copyright © ${new Date().getFullYear()} Unleash. Built with Docusaurus.`}
                </p>
            </div>
        </div>
    );
}
