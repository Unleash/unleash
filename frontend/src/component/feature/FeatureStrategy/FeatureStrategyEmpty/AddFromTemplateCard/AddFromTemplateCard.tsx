import { ElementType, FC } from 'react';
import { Card, CardContent, Typography, styled, Box } from '@mui/material';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from 'hooks/useToast';
import { AddStrategyMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/AddStrategyMessage';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestAddStrategy } from 'hooks/useChangeRequestAddStrategy';
import { formatUnknownError } from 'utils/formatUnknownError';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { IFeatureStrategyPayload } from 'interfaces/strategy';

interface IAddFromTemplateCardProps {
    title: string;
    featureId: string;
    projectId: string;
    environmentId: string;
    strategy: IFeatureStrategyPayload;
    Icon: ElementType;
    onAfterAddStrategy: () => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusMedium,
}));

export const AddFromTemplateCard: FC<IAddFromTemplateCardProps> = ({
    title,
    children,
    featureId,
    projectId,
    environmentId,
    strategy,
    Icon,
    onAfterAddStrategy,
}) => {
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { setToastApiError } = useToast();

    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const {
        changeRequestDialogDetails,
        onChangeRequestAddStrategy,
        onChangeRequestAddStrategyConfirm,
        onChangeRequestAddStrategyClose,
    } = useChangeRequestAddStrategy(projectId, featureId, 'addStrategy');

    const onStrategyAdd = async () => {
        try {
            if (isChangeRequestConfigured(environmentId)) {
                onChangeRequestAddStrategy(environmentId, strategy);
            } else {
                await addStrategyToFeature(
                    projectId,
                    featureId,
                    environmentId,
                    strategy
                );
                onAfterAddStrategy();
            }
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <StyledCard variant="outlined">
                <CardContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                    }}
                >
                    <Typography
                        variant="body1"
                        fontWeight="medium"
                        sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}
                    >
                        <Icon color="disabled" sx={{ mr: 1 }} /> {title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        component="p"
                    >
                        {children}
                    </Typography>

                    <Box
                        sx={{
                            ml: 'auto',
                            mt: 'auto',
                            pt: 1,
                            mr: { xs: 'auto', sm: 0 },
                        }}
                    >
                        <PermissionButton
                            permission={CREATE_FEATURE_STRATEGY}
                            projectId={projectId}
                            environmentId={environmentId}
                            variant="outlined"
                            size="small"
                            onClick={onStrategyAdd}
                        >
                            Use template
                        </PermissionButton>
                    </Box>
                </CardContent>
            </StyledCard>
            <ChangeRequestDialogue
                isOpen={changeRequestDialogDetails.isOpen}
                onClose={onChangeRequestAddStrategyClose}
                environment={changeRequestDialogDetails?.environment}
                onConfirm={onChangeRequestAddStrategyConfirm}
                messageComponent={
                    <AddStrategyMessage
                        environment={environmentId}
                        payload={changeRequestDialogDetails.strategy!}
                    />
                }
            />
        </>
    );
};
