import { Button, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledTab = styled(Button)<{ selected: boolean }>(
    ({ theme, selected }) => ({
        '&.MuiButton-root': {
            cursor: 'pointer',
            height: theme.spacing(6.5),
            border: 0,
            backgroundColor: selected
                ? theme.palette.background.paper
                : 'transparent',
            borderLeft: `${theme.spacing(1)} solid ${
                selected ? theme.palette.background.alternative : 'transparent'
            }`,
            borderRadius: theme.shape.borderRadiusMedium,
            justifyContent: 'start',
            transition: 'background-color 0.2s ease',
            color: theme.palette.text.primary,
            textAlign: 'left',
            padding: theme.spacing(0, 2),
            gap: theme.spacing(1),
            // fontSize: theme.fontSizes.bodySize,
            fontSize: theme.typography.body2.fontSize,
            fontWeight: selected
                ? theme.fontWeight.bold
                : theme.fontWeight.medium,
            lineHeight: 1.2,
        },
        '&:hover': {
            backgroundColor: theme.palette.neutral.light,
        },
        '&.Mui-disabled': {
            pointerEvents: 'auto',
        },
        '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
        },
        justifyContent: 'space-between',
        '& > span': {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
        },
    }),
);

const StyledTabLabel = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StyledTabDescription = styled('div')(({ theme }) => ({
    fontWeight: theme.fontWeight.medium,
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

interface IVerticalTabProps {
    label: string;
    description?: string;
    selected?: boolean;
    onClick: () => void;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

export const VerticalTab = ({
    label,
    description,
    selected,
    onClick,
    startIcon,
    endIcon,
}: IVerticalTabProps) => (
    <StyledTab
        selected={Boolean(selected)}
        className={selected ? 'selected' : ''}
        onClick={onClick}
        disableElevation
        disableFocusRipple
        fullWidth
    >
        {startIcon}
        <StyledTabLabel>
            {label}
            <ConditionallyRender
                condition={Boolean(description)}
                show={
                    <StyledTabDescription>{description}</StyledTabDescription>
                }
            />
        </StyledTabLabel>
        {endIcon}
    </StyledTab>
);
