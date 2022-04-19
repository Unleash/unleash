import { useStyles } from 'component/context/ContectFormChip/ContextFormChipList.styles';
import React from 'react';

export const ContextFormChipList: React.FC = ({ children }) => {
    const styles = useStyles();

    return <ul className={styles.container}>{children}</ul>;
};
