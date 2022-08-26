import { useState, useEffect } from 'react';
import { Alert } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Typography } from '@mui/material';
import { useStyles } from './Proclamation.styles';
import { IProclamationToast } from 'interfaces/uiConfig';

interface IProclamationProps {
    toast?: IProclamationToast;
}

const renderProclamation = (id: string) => {
    if (!id) return false;
    if (localStorage) {
        const value = localStorage.getItem(id);
        if (value) {
            return false;
        }
    }
    return true;
};

const Proclamation = ({ toast }: IProclamationProps) => {
    const [show, setShow] = useState(false);
    const { classes: styles } = useStyles();

    useEffect(() => {
        setShow(renderProclamation(toast?.id || ''));
    }, [toast?.id]);

    const onClose = () => {
        if (localStorage) {
            localStorage.setItem(toast?.id || '', 'seen');
        }
        setShow(false);
    };

    if (!toast) return null;

    return (
        <ConditionallyRender
            condition={show}
            show={
                <Alert
                    className={styles.proclamation}
                    severity={toast.severity}
                    onClose={onClose}
                >
                    <Typography className={styles.content} variant="body2">
                        {toast.message}
                    </Typography>
                    <a
                        href={toast.link}
                        className={styles.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View more
                    </a>
                </Alert>
            }
        />
    );
};

export default Proclamation;
