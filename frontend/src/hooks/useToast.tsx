import { Dispatch, SetStateAction, useState } from 'react';
import Toast from '../component/common/Toast/Toast';

export interface IToast {
    show: boolean;
    type: 'success' | 'info' | 'warning' | 'error';
    text: string;
}

export type TSetToastData = Dispatch<SetStateAction<IToast>>;

const useToast = () => {
    const [toastData, setToastData] = useState<IToast>({
        show: false,
        type: 'success',
        text: '',
    });

    const hideToast = () => {
        setToastData((prev: IToast) => ({ ...prev, show: false }));
    };
    const toast = (
        <Toast
            show={toastData.show}
            onClose={hideToast}
            text={toastData.text}
            type={toastData.type}
        />
    );

    return { toast, setToastData, hideToast };
};

export default useToast;
