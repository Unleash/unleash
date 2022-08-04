import { useStyles } from './Toast.styles';
import classnames from 'classnames';
import { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import CheckMarkBadge from 'component/common/CheckmarkBadge/CheckMarkBadge';
import UIContext from 'contexts/UIContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Close from '@mui/icons-material/Close';
import { IToast } from 'interfaces/toast';
import { TOAST_TEXT } from 'utils/testIds';

const Toast = ({ title, text, type, confetti }: IToast) => {
    const { setToast } = useContext(UIContext);

    const { classes: styles } = useStyles();
    const confettiColors = ['#d13447', '#ffbf00', '#263672'];
    const confettiAmount = 200;

    const getRandomNumber = (input: number) => {
        return Math.floor(Math.random() * input) + 1;
    };

    const renderConfetti = () => {
        const elements = new Array(confettiAmount).fill(1);

        const styledElements = elements.map((el, index) => {
            const width = getRandomNumber(8);
            const length = getRandomNumber(100);

            const style = {
                position: 'absolute' as 'absolute',
                width: `${width}px`,
                height: `${width * 0.4}px`,
                backgroundColor: confettiColors[getRandomNumber(2)],
                left: `${length}%`,
                transform: `rotate(${getRandomNumber(101)}deg)`,
                animationDelay: `${getRandomNumber(5)}s`,
                animationDuration: `${getRandomNumber(3)}s`,
                animationEase: `${getRandomNumber(2)}s`,
            };

            return (
                <div
                    key={index}
                    style={style}
                    className={classnames(styles.starting, styles.anim)}
                />
            );
        });

        return styledElements;
    };

    const hide = () => {
        setToast((prev: IToast) => ({ ...prev, show: false }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <div className={styles.confettiContainer}>
                    {confetti && renderConfetti()}
                    <div className={styles.createdContainer}>
                        <div className={styles.headerContainer}>
                            <div>
                                <CheckMarkBadge
                                    type={type}
                                    className={styles.checkMark}
                                />
                            </div>
                            <div className={styles.textContainer}>
                                <h3 className={styles.headerStyles}>{title}</h3>

                                <ConditionallyRender
                                    condition={Boolean(text)}
                                    show={
                                        <p data-testid={TOAST_TEXT}>{text}</p>
                                    }
                                />
                            </div>
                        </div>
                        <Tooltip title="Close" arrow>
                            <IconButton
                                onClick={hide}
                                className={styles.buttonStyle}
                                size="large"
                            >
                                <Close />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;
