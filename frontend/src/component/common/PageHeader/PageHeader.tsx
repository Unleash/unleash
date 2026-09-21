import type React from 'react';
import type { ReactNode, FC } from 'react';
import classnames from 'classnames';

import {
    Divider,
    styled,
    type SxProps,
    type Theme,
    Typography,
    type TypographyProps,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { usePageTitle } from 'hooks/usePageTitle';

const StyledDivider = styled(Divider)(({ theme }) => ({
    height: '100%',
    borderColor: theme.palette.divider,
    width: '1px',
    display: 'inline-block',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    padding: theme.spacing(0.5, 0),
    verticalAlign: 'middle',
}));

const StyledHeaderContainer = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledTopContainer = styled('div')(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
}));

const StyledHeader = styled('div')(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginRight: theme.spacing(5),
}));

const StyledHeaderTitle = styled(Typography)(({ theme }) => ({
    // Line-height is kept fixed so the header row has a stable height — it aligns
    // with the action buttons and avoids layout shift between loading/loaded states.
    lineHeight: theme.spacing(5),
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledHeaderActions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

type PageHeaderTitleProps =
    | {
          /**
           * Displayed as the heading, set as the browser tab title, and
           * announced to screen readers as a navigation.
           */
          title: string;
          heading?: never;
      }
    | {
          /**
           * Displayed as the heading only. For headers that aren't the page's
           * main title (e.g. sidebars, sections within a page).
           */
          heading: ReactNode;
          title?: never;
      };

interface IPageHeaderBaseProps {
    subtitle?: string;
    variant?: TypographyProps['variant'];
    loading?: boolean;
    actions?: ReactNode;
    className?: string;
    children?: React.ReactNode;
}

type PageHeaderProps = IPageHeaderBaseProps & PageHeaderTitleProps;

const PageHeaderComponent: FC<PageHeaderProps> & {
    Divider: typeof PageHeaderDivider;
} = ({
    title,
    heading,
    actions,
    subtitle,
    variant,
    loading,
    className = '',
    children,
}) => {
    const headerClasses = classnames({ skeleton: loading });

    usePageTitle(title);

    return (
        <StyledHeaderContainer>
            <StyledTopContainer>
                <StyledHeader
                    className={classnames(headerClasses)}
                    data-loading
                >
                    <StyledHeaderTitle
                        variant={variant ?? 'h1'}
                        className={classnames(className)}
                    >
                        {title ?? heading}
                    </StyledHeaderTitle>
                    {subtitle && <small>{subtitle}</small>}
                </StyledHeader>
                <ConditionallyRender
                    condition={Boolean(actions)}
                    show={<StyledHeaderActions>{actions}</StyledHeaderActions>}
                />
            </StyledTopContainer>
            {children}
        </StyledHeaderContainer>
    );
};

const PageHeaderDivider: FC<{ sx?: SxProps<Theme> }> = ({ sx }) => {
    return <StyledDivider orientation='vertical' variant='middle' sx={sx} />;
};

PageHeaderComponent.Divider = PageHeaderDivider;

export const PageHeader = PageHeaderComponent;
