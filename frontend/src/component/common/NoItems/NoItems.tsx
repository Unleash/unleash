import { ReactComponent as NoItemsIcon } from 'assets/icons/addfiles.svg';
import { useStyles } from './NoItems.styles';
import React from 'react';

const NoItems: React.FC = ({ children }) => {
    const { classes: styles } = useStyles();
    return (
        <div className={styles.container}>
            <div className={styles.textContainer}>{children}</div>
            <div className={styles.iconContainer}>
                <NoItemsIcon className={styles.icon} />
            </div>
        </div>
    );
};

export default NoItems;
