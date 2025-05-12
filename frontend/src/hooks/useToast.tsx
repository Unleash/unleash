import { useCallback, useContext } from 'react';
import UIContext from '../contexts/UIContext.ts';
import type { IToast } from '../interfaces/toast.ts';

const useToast = () => {
    const { setToast } = useContext(UIContext);

    const hideToast = () =>
        setToast((prev: IToast) => ({
            ...prev,
            show: false,
        }));

    const setToastApiError = useCallback(
        (text: string, overrides?: IToast) => {
            setToast({
                text: text || 'Something went wrong.',
                type: 'error',
                show: true,
                autoHideDuration: 12000,
                ...overrides,
            });
        },
        [setToast],
    );

    const setToastData = useCallback(
        (toast: IToast) => {
            if (toast.persist) {
                setToast({ ...toast, show: true });
            } else {
                setToast({ autoHideDuration: 6000, ...toast, show: true });
            }
        },
        [setToast],
    );

    return { setToastData, setToastApiError, hideToast };
};

export default useToast;
