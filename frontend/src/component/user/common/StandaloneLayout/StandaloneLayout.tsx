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
    const styles = useStyles();

    let banner = <StandaloneBanner title="Unleash" />;

    if (BannerComponent) {
        banner = BannerComponent;
    }

    return (
        <div className={styles.container}>
            <div className={styles.leftContainer}>{banner}</div>
            <div className={styles.rightContainer}>
                <div className={styles.innerRightContainer}>{children}</div>
            </div>
        </div>
    );
};

export default StandaloneLayout;
