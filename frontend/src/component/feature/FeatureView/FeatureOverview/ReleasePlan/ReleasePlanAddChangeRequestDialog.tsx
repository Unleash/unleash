import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useReleasePlanTemplate } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplate';
import useToast from 'hooks/useToast';
import { styled, Button } from '@mui/material';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

export const ReleasePlanAddChangeRequestDialog = ({
    featureId,
    environmentId,
    releaseTemplateId,
    onClosing,
}: {
    featureId: string;
    environmentId: string;
    releaseTemplateId: string | undefined;
    onClosing: () => void;
}) => {
    if (!releaseTemplateId) {
        return null;
    }
    const template = useReleasePlanTemplate(releaseTemplateId);
    const { setToastData } = useToast();

    const addReleasePlanToChangeRequest = async () => {
        setToastData({
            type: 'success',
            text: 'Added to draft',
        });
        onClosing();
    };

    return (
        <Dialogue
            title='Request changes'
            open={true}
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
                <StyledBoldSpan>{template?.template.name}</StyledBoldSpan> to{' '}
                <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                <StyledBoldSpan>{environmentId}</StyledBoldSpan>
            </p>
        </Dialogue>
    );
};
