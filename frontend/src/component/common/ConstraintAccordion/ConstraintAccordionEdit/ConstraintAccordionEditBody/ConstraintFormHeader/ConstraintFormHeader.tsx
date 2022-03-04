import { makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
    header: {
        fontSize: theme.fontSizes.bodySize,
        fontWeight: 'normal',
        marginTop: '1rem',
    },
}));

export const ConstraintFormHeader: React.FC<
    React.HTMLAttributes<HTMLDivElement>
> = ({ children, ...rest }) => {
    const styles = useStyles();
    return (
        <h3 className={styles.header} {...rest}>
            {children}
        </h3>
    );
};
