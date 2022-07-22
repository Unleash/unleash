import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles<{ lineClamp?: number }>()(
    (theme, { lineClamp }) => ({
        wrapper: {
            padding: theme.spacing(1, 2),
            display: '-webkit-box',
            overflow: lineClamp ? 'hidden' : 'auto',
            WebkitLineClamp: lineClamp ? lineClamp : 'none',
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-all',
        },
    })
);
