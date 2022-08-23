import { makeStyles } from 'tss-react/mui';
import { formTemplateSidebarWidth } from 'component/common/FormTemplate/FormTemplate.styles';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: 30,
        left: 0,
        right: formTemplateSidebarWidth,
        [theme.breakpoints.down(1100)]: {
            right: 0,
        },
    },
    steps: {
        position: 'relative',
        borderRadius: 10,
        background: theme.palette.background.paper,
        padding: '0.6rem 1.5rem',
        margin: 'auto',
        display: 'flex',
        alignItems: 'center',
    },
    stepsText: {
        marginRight: 15,
        fontSize: theme.fontSizes.smallBody,
    },
    circle: {
        fill: theme.palette.primary.main,
        fontSize: 17,
        opacity: 0.4,
        transition: 'opacity 0.4s ease',
    },
    filledCircle: {
        opacity: 1,
        fontSize: 20,
    },
}));
