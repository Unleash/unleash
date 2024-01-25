import { styled, Typography } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IActionSet } from 'interfaces/action';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
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
        <TextCell>
            <TooltipLink
                tooltip={
                    <>
                        {actions.map(({ id, action, executionParams }) => (
                            <StyledItem key={id}>
                                {action}: {JSON.stringify(executionParams)}
                            </StyledItem>
                        ))}
                    </>
                }
            >
                {actions.length === 1 ? '1 action' : `${actions.length} tokens`}
            </TooltipLink>
        </TextCell>
    );
};
