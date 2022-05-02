import { makeStyles } from 'tss-react/mui';
import React from 'react';

const useStyles = makeStyles()(theme => ({
    header: {
        fontSize: theme.fontSizes.bodySize,
        fontWeight: 'normal',
        marginTop: '1rem',
        marginBottom: '0.25rem',
    },
}));

export const ConstraintFormHeader: React.FC<
    React.HTMLAttributes<HTMLDivElement>
> = ({ children, ...rest }) => {
    const { classes: styles } = useStyles();
    return (
        <h3 {...rest} className={styles.header}>
            {children}
        </h3>
    );
};
