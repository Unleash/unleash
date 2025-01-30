import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useToast from 'hooks/useToast';
import { styled, Button } from '@mui/material';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

interface IReleasePlanAddChangeRequestDialogProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    releaseTemplate: IReleasePlanTemplate | undefined;
    onClosing: () => void;
}

export const ReleasePlanAddChangeRequestDialog = ({
    projectId,
    featureId,
    environmentId,
    releaseTemplate,
    onClosing,
}: IReleasePlanAddChangeRequestDialogProps) => {
    const { setToastData } = useToast();
    const { addChange } = useChangeRequestApi();

    const addReleasePlanToChangeRequest = async () => {
        addChange(projectId, environmentId, {
            feature: featureId,
            action: 'addReleasePlan',
            payload: {
                templateId: releaseTemplate?.id,
            },
        });

        setToastData({
            type: 'success',
            text: 'Added to draft',
        });
        onClosing();
    };

    return (
        <Dialogue
            title='Request changes'
            open={Boolean(releaseTemplate)}
            secondaryButtonText='Cancel'
            onClose={() => {
                onClosing();
            }}
            customButton={
                <Button
                    color='primary'
                    variant='contained'
                    onClick={addReleasePlanToChangeRequest}
                    autoFocus={true}
                >
                    Add suggestion to draft
                </Button>
            }
        >
            <p>
                <StyledBoldSpan>Add</StyledBoldSpan> release template{' '}
                <StyledBoldSpan>{releaseTemplate?.name}</StyledBoldSpan> to{' '}
                <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                <StyledBoldSpan>{environmentId}</StyledBoldSpan>
            </p>
        </Dialogue>
    );
};
