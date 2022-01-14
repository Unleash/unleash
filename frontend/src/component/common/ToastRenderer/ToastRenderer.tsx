import { Portal } from '@material-ui/core';
import { useContext, useEffect } from 'react';
import { useCommonStyles } from '../../../common.styles';
import UIContext, { IToastData } from '../../../contexts/UIContext';
import AnimateOnMount from '../AnimateOnMount/AnimateOnMount';
import Toast from './Toast/Toast';

const ToastRenderer = () => {
    // @ts-ignore-next-line
    const { toastData, setToast } = useContext(UIContext);
    const styles = useCommonStyles();

    const hide = () => {
        setToast((prev: IToastData) => ({ ...prev, show: false }));
    };

    useEffect(() => {
        if (!toastData.autoHideDuration) return;
        let timeout = setTimeout(() => {
            hide();
        }, toastData.autoHideDuration);

        return () => {
            clearTimeout(timeout);
        };
        /* eslint-disable-next-line */
    }, [toastData?.show]);

    return (
        <Portal>
            <AnimateOnMount
                mounted={toastData?.show}
                start={styles.fadeInBottomStartWithoutFixed}
                enter={styles.fadeInBottomEnter}
                leave={styles.fadeInBottomLeave}
                container={styles.fullWidth}
            >
                <Toast {...toastData} />
            </AnimateOnMount>
        </Portal>
    );
};

export default ToastRenderer;
