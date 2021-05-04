import { FC } from 'react';

import { Typography, useTheme } from '@material-ui/core';
import Gradient from '../../common/Gradient/Gradient';
import { ReactComponent as StarIcon } from '../../../assets/icons/star.svg';
import { ReactComponent as RightToggleIcon } from '../../../assets/icons/toggleRight.svg';
import { ReactComponent as LeftToggleIcon } from '../../../assets/icons/toggleLeft.svg';

import { useStyles } from './StandaloneBanner.styles';
import ConditionallyRender from '../../common/ConditionallyRender';

interface IStandaloneBannerProps {
    showStars?: boolean;
    title: string;
}

const StandaloneBanner: FC<IStandaloneBannerProps> = ({
    showStars = false,
    title,
    children,
}) => {
    const theme = useTheme();
    const styles = useStyles();
    return (
        <Gradient from={theme.palette.primary.main} to={'#173341'}>
            <div className={styles.container}>
                <Typography variant="h1" className={styles.title}>
                    {title}
                </Typography>
                {children}

                <ConditionallyRender
                    condition={showStars}
                    show={
                        <>
                            <StarIcon className={styles.midLeftStarTwo} />
                            <StarIcon className={styles.midLeftStar} />
                            <StarIcon className={styles.midRightStar} />
                            <StarIcon className={styles.bottomRightStar} />
                            <StarIcon className={styles.bottomStar} />
                        </>
                    }
                />
            </div>

            <div className={styles.switchesContainer}>
                <RightToggleIcon className={styles.switchIcon} />
                <br></br>
                <LeftToggleIcon className={styles.switchIcon} />
            </div>
        </Gradient>
    );
};

export default StandaloneBanner;
