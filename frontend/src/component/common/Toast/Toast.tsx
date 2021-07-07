import { Portal, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useCommonStyles } from '../../../common.styles';
import AnimateOnMount from '../AnimateOnMount/AnimateOnMount';

interface IToastProps {
    show: boolean;
    onClose: () => void;
    type: string;
    text: string;
    autoHideDuration?: number;
}

const Toast = ({
    show,
    onClose,
    type,
    text,
    autoHideDuration = 6000,
}: IToastProps) => {
    const styles = useCommonStyles();

    return (
        <Portal>
            <AnimateOnMount
                mounted={show}
                start={styles.fadeInBottomStart}
                enter={styles.fadeInBottomEnter}
                leave={styles.fadeInBottomLeave}
                container={styles.fullWidth}
            >
                <Snackbar
                    open={show}
                    onClose={onClose}
                    autoHideDuration={autoHideDuration}
                >
                    <Alert variant="filled" severity={type} onClose={onClose}>
                        {text}
                    </Alert>
                </Snackbar>
            </AnimateOnMount>
        </Portal>
    );
};

export default Toast;
