import { ReactNode, VFC } from 'react';
import classnames from 'classnames';

import { Typography, TypographyProps } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { useStyles } from './styles';
import { usePageTitle } from 'hooks/usePageTitle';

interface IHeaderTitleProps {
    title: string;
    titleElement?: ReactNode;
    subtitle?: string;
    variant?: TypographyProps['variant'];
    loading?: boolean;
    actions?: ReactNode;
    className?: string;
}

export const HeaderTitle: VFC<IHeaderTitleProps> = ({
    title,
    titleElement,
    actions,
    subtitle,
    variant,
    loading,
    className = '',
}) => {
    const { classes: styles } = useStyles();
    const headerClasses = classnames({ skeleton: loading });

    usePageTitle(title);

    return (
        <div className={styles.headerTitleContainer}>
            <div className={headerClasses} data-loading>
                <Typography
                    variant={variant || 'h1'}
                    className={classnames(styles.headerTitle, className)}
                >
                    {titleElement || title}
                </Typography>
                {subtitle && <small>{subtitle}</small>}
            </div>

            <ConditionallyRender
                condition={Boolean(actions)}
                show={<div className={styles.headerActions}>{actions}</div>}
            />
        </div>
    );
};
