import { ReactNode, FC, VFC } from 'react';
import classnames from 'classnames';

import {
    Divider,
    styled,
    SxProps,
    Theme,
    Typography,
    TypographyProps,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { useStyles } from './PageHeader.styles';
import { usePageTitle } from 'hooks/usePageTitle';

const StyledDivider = styled(Divider)(({ theme }) => ({
    height: '100%',
    borderColor: theme.palette.dividerAlternative,
    width: '1px',
    display: 'inline-block',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    padding: '10px 0',
    verticalAlign: 'middle',
}));

interface IPageHeaderProps {
    title?: string;
    titleElement?: ReactNode;
    subtitle?: string;
    variant?: TypographyProps['variant'];
    loading?: boolean;
    actions?: ReactNode;
    className?: string;
    secondary?: boolean;
}

const PageHeaderComponent: FC<IPageHeaderProps> & {
    Divider: typeof PageHeaderDivider;
} = ({
    title,
    titleElement,
    actions,
    subtitle,
    variant,
    loading,
    className = '',
    secondary,
    children,
}) => {
    const { classes: styles } = useStyles();
    const headerClasses = classnames({ skeleton: loading });

    usePageTitle(secondary ? '' : title);

    return (
        <div className={styles.headerContainer}>
            <div className={styles.topContainer}>
                <div
                    className={classnames(styles.header, headerClasses)}
                    data-loading
                >
                    <Typography
                        variant={variant || secondary ? 'h2' : 'h1'}
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
            {children}
        </div>
    );
};

const PageHeaderDivider: VFC<{ sx?: SxProps<Theme> }> = ({ sx }) => {
    return <StyledDivider orientation="vertical" variant="middle" sx={sx} />;
};

PageHeaderComponent.Divider = PageHeaderDivider;

export const PageHeader = PageHeaderComponent;
