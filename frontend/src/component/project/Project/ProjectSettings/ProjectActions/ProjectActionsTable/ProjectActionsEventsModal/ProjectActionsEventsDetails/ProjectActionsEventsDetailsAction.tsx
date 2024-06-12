import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { Alert, CircularProgress, Divider, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IActionEvent } from 'interfaces/action';
import type { ReactNode } from 'react';

const StyledAction = styled('div', {
    shouldForwardProp: (prop) => prop !== 'state',
})<{ state?: IActionEvent['state'] }>(({ theme, state }) => ({
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    ...(state === 'not started' && {
        backgroundColor: theme.palette.background.elevation1,
    }),
}));

const StyledHeader = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const StyledHeaderRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
});

const StyledHeaderState = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.fontSizes.smallBody,
    gap: theme.spacing(2),
}));

export const StyledSuccessIcon = styled(CheckCircleOutline)(({ theme }) => ({
    color: theme.palette.success.main,
}));

export const StyledFailedIcon = styled(ErrorOutline)(({ theme }) => ({
    color: theme.palette.error.main,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(2),
    fontSize: 'inherit',
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: theme.spacing(2, 0),
}));

const StyledActionBody = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledActionLabel = styled('p')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(0.5),
}));

const StyledPropertyLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

interface IProjectActionsEventsDetailsActionProps {
    action: IActionEvent;
    children: ReactNode;
}

export const ProjectActionsEventsDetailsAction = ({
    action: { state, details, action, executionParams },
    children,
}: IProjectActionsEventsDetailsActionProps) => {
    const actionState =
        state === 'success' ? (
            <StyledSuccessIcon />
        ) : state === 'started' ? (
            <CircularProgress size={20} />
        ) : state === 'not started' ? (
            <span>Not started</span>
        ) : null;

    return (
        <StyledAction state={state}>
            <StyledHeader>
                <StyledHeaderRow>
                    <div>{children}</div>
                    <StyledHeaderState>{actionState}</StyledHeaderState>
                </StyledHeaderRow>
                <ConditionallyRender
                    condition={Boolean(details)}
                    show={<StyledAlert severity='error'>{details}</StyledAlert>}
                />
            </StyledHeader>
            <StyledDivider />
            <StyledActionBody>
                <StyledActionLabel>{action}</StyledActionLabel>
                {Object.entries(executionParams).map(([property, value]) => (
                    <div key={property}>
                        <StyledPropertyLabel>{property}:</StyledPropertyLabel>{' '}
                        {value as any}
                    </div>
                ))}
            </StyledActionBody>
        </StyledAction>
    );
};
