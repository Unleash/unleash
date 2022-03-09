import { useContext } from 'react';
import UIContext from '../contexts/UIContext';
import { IToast } from '../interfaces/toast';

const useToast = () => {
    const { setToast } = useContext(UIContext);

    const hideToast = () =>
        setToast((prev: IToast) => ({
            ...prev,
            show: false,
        }));

    const setToastApiError = (errorText: string, overrides?: IToast) => {
        setToast({
            title: 'Something went wrong',
            text: `We had trouble talking to our API. Here's why: ${errorText}`,
            type: 'error',
            show: true,
            autoHideDuration: 12000,
            ...overrides,
        });
    };

    const setToastData = (toast: IToast) => {
        if (toast.persist) {
            setToast({ ...toast, show: true });
        } else {
            setToast({ ...toast, show: true, autoHideDuration: 6000 });
        }
    };

    return { setToastData, setToastApiError, hideToast };
};

export default useToast;
