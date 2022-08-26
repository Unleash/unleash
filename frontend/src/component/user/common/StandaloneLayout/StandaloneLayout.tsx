import { FC } from 'react';
import StandaloneBanner from 'component/user/StandaloneBanner/StandaloneBanner';
import { useStyles } from './StandaloneLayout.styles';

interface IStandaloneLayout {
    BannerComponent?: JSX.Element;
    showMenu?: boolean;
}

const StandaloneLayout: FC<IStandaloneLayout> = ({
    children,
    BannerComponent,
}) => {
    const { classes: styles } = useStyles();

    let banner = <StandaloneBanner title="Unleash" />;

    if (BannerComponent) {
        banner = BannerComponent;
    }

    return (
        <div className={styles.container}>
            <header className={styles.leftContainer}>{banner}</header>
            <main className={styles.rightContainer}>
                <div className={styles.innerRightContainer}>{children}</div>
            </main>
        </div>
    );
};

export default StandaloneLayout;
