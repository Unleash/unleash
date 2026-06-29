import { Portal } from '@mui/material';
import { useContext, useEffect, useMemo } from 'react';
import {
    fadeInBottomEnter,
    fadeInBottomLeave,
    fadeInBottomStartWithoutFixed,
} from 'themes/themeStyles';
import UIContext from 'contexts/UIContext';
import AnimateOnMount from '../AnimateOnMount/AnimateOnMount.tsx';
import Toast from './Toast/Toast.tsx';
import type { IToast } from 'interfaces/toast';

const ToastRenderer = () => {
    const { toastData, setToast } = useContext(UIContext);

    const hide = () => {
        setToast((prev: IToast) => ({ ...prev, show: false }));
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — timeout should only reset when show changes; hide and autoHideDuration are intentionally omitted to avoid restarting the timer on every render
    useEffect(() => {
        if (!toastData.autoHideDuration) return;
        const timeout = setTimeout(() => {
            hide();
        }, toastData.autoHideDuration);
        return () => {
            clearTimeout(timeout);
        };
    }, [toastData?.show]);

    const animations = useMemo(
        () => ({
            start: {
                ...fadeInBottomStartWithoutFixed,
                right: 0,
                left: 0,
                margin: '0 auto',
                width: 'fit-content',
            },
            enter: fadeInBottomEnter,
            leave: fadeInBottomLeave,
        }),
        [],
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
