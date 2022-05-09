import React, { FC, ReactNode } from 'react';
import classnames from 'classnames';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Paper, PaperProps } from '@mui/material';
import { useStyles } from './PageContent.styles';
import useLoading from 'hooks/useLoading';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

interface IPageContentProps extends PaperProps {
    header?: ReactNode;
    isLoading?: boolean;
    /**
     * @deprecated fix feature event log and remove
     */
    disablePadding?: boolean;
    /**
     * @deprecated fix feature event log and remove
     */
    disableBorder?: boolean;
    bodyClass?: string;
}

export const PageContent: FC<IPageContentProps> = ({
    children,
    header,
    disablePadding = false,
    disableBorder = false,
    bodyClass = '',
    isLoading = false,
    className,
    ...rest
}) => {
    const { classes: styles } = useStyles();
    const ref = useLoading(isLoading);

    const headerClasses = classnames(styles.headerContainer, {
        [styles.paddingDisabled]: disablePadding,
        [styles.borderDisabled]: disableBorder,
    });

    const bodyClasses = classnames(styles.bodyContainer, {
        [styles.paddingDisabled]: disablePadding,
        [styles.borderDisabled]: disableBorder,
        [bodyClass]: bodyClass,
    });

    const paperProps = disableBorder ? { elevation: 0 } : {};

    return (
        <div ref={ref}>
            <Paper
                {...rest}
                {...paperProps}
                className={classnames(styles.container, className)}
            >
                <ConditionallyRender
                    condition={Boolean(header)}
                    show={
                        <div className={headerClasses}>
                            <ConditionallyRender
                                condition={typeof header === 'string'}
                                show={<PageHeader title={header as string} />}
                                elseShow={header}
                            />
                        </div>
                    }
                />
                <div className={bodyClasses}>{children}</div>
            </Paper>
        </div>
    );
};
