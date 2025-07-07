import { styled } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { IActionSet } from 'interfaces/action';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { ProjectActionsLastEvent } from './ProjectActionsLastEvent.tsx';

const StyledCell = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
}));

const StyledActionItems = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledParameterList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    paddingLeft: theme.spacing(1),
    margin: 0,
}));

interface IProjectActionsActionsCellProps {
    action: IActionSet;
    onCreateAction?: () => void;
}

export const ProjectActionsActionsCell = ({
    action,
    onCreateAction,
}: IProjectActionsActionsCellProps) => {
    const { actions } = action;

    if (actions.length === 0) {
        if (!onCreateAction) return <TextCell>0 actions</TextCell>;
        else return <LinkCell title='Create action' onClick={onCreateAction} />;
    }

    return (
        <StyledCell>
            <ProjectActionsLastEvent action={action} />
            <TooltipLink
                tooltip={
                    <StyledActionItems>
                        {actions.map(({ id, action, executionParams }) => (
                            <div key={id}>
                                <strong>{action}</strong>
                                <StyledParameterList>
                                    {Object.entries(executionParams).map(
                                        ([param, value]) => (
                                            <li key={param}>
                                                <strong>{param}</strong>:{' '}
                                                {value as any}
                                            </li>
                                        ),
                                    )}
                                </StyledParameterList>
                            </div>
                        ))}
                    </StyledActionItems>
                }
            >
                {actions.length === 1
                    ? '1 action'
                    : `${actions.length} actions`}
            </TooltipLink>
        </StyledCell>
    );
};
