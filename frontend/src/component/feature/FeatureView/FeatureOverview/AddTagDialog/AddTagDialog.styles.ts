import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    dialogFormContent: {
        ['& > *']: {
            margin: '0.5rem 0',
        },
    },
}));
