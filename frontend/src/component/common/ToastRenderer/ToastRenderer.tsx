import { Portal } from '@mui/material';
import { useContext, useEffect, useMemo } from 'react';
import {
    fadeInBottomEnter,
    fadeInBottomLeave,
    fadeInBottomStartWithoutFixed,
} from 'themes/themeStyles';
import UIContext from 'contexts/UIContext';
import AnimateOnMount from '../AnimateOnMount/AnimateOnMount';
import Toast from './Toast/Toast';
import { IToast } from 'interfaces/toast';

const ToastRenderer = () => {
    const { toastData, setToast } = useContext(UIContext);

    const hide = () => {
        setToast((prev: IToast) => ({ ...prev, show: false }));
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

    const animations = useMemo(
        () => ({
            start: {
                ...fadeInBottomStartWithoutFixed,
                right: 0,
                left: 0,
                margin: '0 auto',
                maxWidth: '450px',
            },
            enter: fadeInBottomEnter,
            leave: fadeInBottomLeave,
        }),
        []
    );

    return (
        <Portal>
            <AnimateOnMount
                mounted={Boolean(toastData?.show)}
                start={animations.start}
                enter={animations.enter}
                leave={animations.leave}
            >
                <Toast {...toastData} />
            </AnimateOnMount>
        </Portal>
    );
};

export default ToastRenderer;
