import { ReactNode } from 'react';
import { useStyles } from 'component/menu/Footer/FooterTitle.styles';

interface IFooterTitleProps {
    children: ReactNode;
}

export const FooterTitle = ({ children }: IFooterTitleProps) => {
    const { classes: styles } = useStyles();

    return <h2 className={styles.title}>{children}</h2>;
};
