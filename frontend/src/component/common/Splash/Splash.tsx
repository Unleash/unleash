import React, { Fragment, useState } from 'react';
import { Button, IconButton } from '@material-ui/core';
import { useStyles } from './Splash.styles';
import {
    CloseOutlined,
    FiberManualRecord,
    FiberManualRecordOutlined,
} from '@material-ui/icons';
import ConditionallyRender from '../ConditionallyRender';
import { CLOSE_SPLASH } from '../../../testIds';

interface ISplashProps {
    components: React.ReactNode[];
    onFinish: (status: boolean) => void;
}

const Splash: React.FC<ISplashProps> = ({
    components,
    onFinish,
}: ISplashProps) => {
    const styles = useStyles();
    const [counter, setCounter] = useState(0);

    const onNext = () => {
        if (counter === components.length - 1) {
            onFinish(false);
            return;
        }
        setCounter(counter + 1);
    };

    const onBack = () => {
        setCounter(counter - 1);
    };
    const onClose = () => {
        onFinish(false);
    };

    const calculatePosition = () => {
        if (counter === 0) {
            return '0';
        }

        return counter * 24;
    };

    const renderCircles = () => {
        return components.map((_, index) => {
            if (index === 0) {
                // Use index as key because the amount of pages will never dynamically change.
                return (
                    <Fragment key={index}>
                        <FiberManualRecordOutlined />
                        <FiberManualRecord
                            style={{
                                position: 'absolute',
                                transition: 'transform 0.3s ease',
                                left: '0',
                                transform: `translateX(${calculatePosition()}px)`,
                            }}
                        />
                    </Fragment>
                );
            }

            return <FiberManualRecordOutlined key={index} />;
        });
    };

    return (
        <div className={styles.splashMainContainer}>
            <div className={styles.splashContainer}>
                <div className={styles.closeButtonContainer}>
                    <IconButton
                        className={styles.closeButton}
                        onClick={onClose}
                        data-test={CLOSE_SPLASH}
                    >
                        <CloseOutlined />
                    </IconButton>
                </div>
                {components[counter]}
                <div className={styles.controllers}>
                    <div className={styles.circlesContainer}>
                        <div className={styles.circles}>{renderCircles()}</div>
                    </div>
                    <div className={styles.buttonsContainer}>
                        <ConditionallyRender
                            condition={counter > 0}
                            show={
                                <Button
                                    className={styles.button}
                                    disabled={counter === 0}
                                    onClick={onBack}
                                >
                                    Back
                                </Button>
                            }
                        />

                        <Button className={styles.nextButton} onClick={onNext}>
                            {counter === components.length - 1
                                ? 'Finish'
                                : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Splash;
