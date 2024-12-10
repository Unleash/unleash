import { useStyles } from './Toast.styles';
import classnames from 'classnames';
import { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import CheckMarkBadge from 'component/common/CheckmarkBadge/CheckMarkBadge';
import UIContext from 'contexts/UIContext';
import Close from '@mui/icons-material/Close';
import type { IToast } from 'interfaces/toast';

const Toast = ({ title, type }: IToast) => {
    const { setToast } = useContext(UIContext);

    const { classes: styles } = useStyles();

    const hide = () => {
        setToast((prev: IToast) => ({ ...prev, show: false }));
    };

    return (
        <div className={classnames(styles.container, 'dropdown-outline')}>
            <CheckMarkBadge type={type} className={styles.checkMark} />

            <h3 className={styles.headerStyles}>{title}</h3>

            <Tooltip title='Close' arrow>
                <IconButton
                    onClick={hide}
                    className={styles.buttonStyle}
                    size='small'
                >
                    <Close />
                </IconButton>
            </Tooltip>
        </div>
    );
};

export default Toast;
