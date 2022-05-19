import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()({
    container: {
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        zIndex: -1,
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        overflow: 'hidden',
    },
});
