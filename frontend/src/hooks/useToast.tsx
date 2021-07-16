import { useState } from 'react';
import Toast from '../component/common/Toast/Toast';

const useToast = () => {
    const [toastData, setToastData] = useState({
        show: false,
        type: 'success',
        text: '',
    });

    const hideToast = () => {
        setToastData(prev => ({ ...prev, show: false }));
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
