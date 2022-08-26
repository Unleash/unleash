import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    valueContainer: {
        lineHeight: 1.1,
        marginTop: -2,
        marginBottom: -10,
    },
    optionContainer: {
        lineHeight: 1.2,
    },
    label: {
        fontSize: theme.fontSizes.smallBody,
    },
    description: {
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.grey[700],
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    separator: {
        position: 'relative',
        overflow: 'visible',
        marginTop: '1rem',
        '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: '-0.5rem',
            left: 0,
            right: 0,
            borderTop: '1px solid',
            borderTopColor: theme.palette.grey[300],
        },
    },
    formInput: {
        [theme.breakpoints.between(1101, 1365)]: {
            width: '170px',
            marginRight: '8px',
        },
    },
}));
