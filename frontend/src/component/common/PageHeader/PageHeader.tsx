import { type ReactNode, type FC, type VFC, useState } from 'react';
import classnames from 'classnames';

import {
    Divider,
    styled,
    type SxProps,
    type Theme,
    Typography,
    type TypographyProps,
    ToggleButtonGroup,
    ToggleButton,
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

const StyledButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    'html[data-theme="light"] button': {
        '--hover-background-color': '#615BC2',
    },
    'html[data-theme="dark"] button': {
        '--hover-background-color': '#34325E',
    },

    button: {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.background,
        textTransform: 'capitalize',
    },
    'button[aria-pressed=true]': {
        backgroundColor: theme.palette.background.alternative,
        color: theme.palette.primary.contrastText,
    },
    'button[aria-pressed=true]:hover': {
        backgroundColor: 'var(--hover-background-color)',
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

    const [filter, setFilter] = useState('all projects');
    const filters = ['all projects', 'my projects'];

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
                <StyledButtonGroup
                    aria-label='project list filter'
                    color='primary'
                    value={filter}
                    exclusive
                    onChange={(event, value) => {
                        if (value !== null) {
                            setFilter(value);
                        }
                    }}
                >
                    {filters.map((filter) => {
                        return (
                            <ToggleButton key={filter} value={filter}>
                                {filter}
                            </ToggleButton>
                        );
                    })}
                </StyledButtonGroup>
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
