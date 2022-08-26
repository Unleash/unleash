import { SKIP_NAV_TARGET_ID } from 'component/common/SkipNav/SkipNavTarget';
import { useStyles } from 'component/common/SkipNav/SkipNavLink.styles';

export const SkipNavLink = () => {
    const { classes: styles } = useStyles();

    return (
        <a href={`#${SKIP_NAV_TARGET_ID}`} className={styles.link}>
            Skip to content <span aria-hidden>&darr;</span>
        </a>
    );
};
