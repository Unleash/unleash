import type { ReactNode, FC, VFC } from 'react';
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
    marginRight: theme.spacing(2),
}));

const StyledHeaderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: 'normal',
    lineHeight: theme.spacing(5),
}));

const StyledHeaderActions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledFilterSelector = styled('fieldset')(({ theme }) => ({
    padding: 0,
    border: 'none',

    label: {
        '--border-radius': '3px',
        color: theme.palette.primary.main,
        background: theme.palette.background,
        paddingInline: theme.spacing(2),
        paddingBlock: theme.spacing(1),
        border: `1px solid ${theme.palette.background.alternative}`,
        borderInlineStart: 'none',
    },
    'label:first-of-type': {
        borderInlineStart: `1px solid ${theme.palette.background.alternative}`,
        borderRadius: `var(--border-radius) 0 0 var(--border-radius)`,
    },
    'label:last-of-type': {
        borderRadius: `0 var(--border-radius) var(--border-radius) 0`,
    },
    'label:has(input:checked)': {
        background: theme.palette.background.alternative,
        color: theme.palette.primary.contrastText,
    },
    'label:focus-within': {
        outline: `2px solid ${theme.palette.background.alternative}`,
        outlineOffset: theme.spacing(0.5),
    },
    '.sr-only': {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 'auto',
        margin: 0,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        width: '1px',
        whiteSpace: 'nowrap',
    },
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
    const headerClasses = classnames({ skeleton: loading });

    usePageTitle(secondary ? '' : title);

    return (
        <StyledHeaderContainer>
            <StyledTopContainer>
                <StyledHeader
                    className={classnames(headerClasses)}
                    data-loading
                >
                    <StyledHeaderTitle
                        variant={variant || secondary ? 'h2' : 'h1'}
                        className={classnames(className)}
                    >
                        {titleElement || title}
                    </StyledHeaderTitle>
                    {subtitle && <small>{subtitle}</small>}
                </StyledHeader>
                <StyledFilterSelector>
                    <legend className='sr-only'>Set project list filter</legend>
                    <label>
                        All projects
                        <input
                            className='sr-only'
                            name='filter'
                            type='radio'
                            value='all projects'
                            checked
                        />
                    </label>
                    <label>
                        My projects
                        <input
                            className='sr-only'
                            name='filter'
                            type='radio'
                            value='my projects'
                        />
                    </label>
                </StyledFilterSelector>
                <ConditionallyRender
                    condition={Boolean(actions)}
                    show={<StyledHeaderActions>{actions}</StyledHeaderActions>}
                />
            </StyledTopContainer>
            {children}
        </StyledHeaderContainer>
    );
};

const PageHeaderDivider: VFC<{ sx?: SxProps<Theme> }> = ({ sx }) => {
    return <StyledDivider orientation='vertical' variant='middle' sx={sx} />;
};

PageHeaderComponent.Divider = PageHeaderDivider;

export const PageHeader = PageHeaderComponent;
