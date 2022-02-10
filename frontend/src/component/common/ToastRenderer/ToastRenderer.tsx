import { Portal } from '@material-ui/core';
import { useContext, useEffect } from 'react';
import { useCommonStyles } from '../../../common.styles';
import UIContext, { IToastData } from '../../../contexts/UIContext';
import { useStyles } from './ToastRenderer.styles';
import AnimateOnMount from '../AnimateOnMount/AnimateOnMount';
import Toast from './Toast/Toast';

const ToastRenderer = () => {
    // @ts-expect-error
    const { toastData, setToast } = useContext(UIContext);
    const commonStyles = useCommonStyles();
    const styles = useStyles();

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
                start={commonStyles.fadeInBottomStartWithoutFixed}
                enter={commonStyles.fadeInBottomEnter}
                leave={commonStyles.fadeInBottomLeave}
                container={styles.toastWrapper}
            >
                <Toast {...toastData} />
            </AnimateOnMount>
        </Portal>
    );
};

export default ToastRenderer;
