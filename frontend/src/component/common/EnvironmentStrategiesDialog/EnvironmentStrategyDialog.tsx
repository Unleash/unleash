import { useNavigate } from 'react-router-dom';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { formatCreateStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { styled } from '@mui/material';

interface IEnvironmentStrategyDialogProps {
    open: boolean;
    featureId: string;
    projectId: string;
    onClose: () => void;
    environmentName: string;
}

const StyledParagraph = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(0.5),
    fontSize: theme.fontSizes.bodySize,
}));
const EnvironmentStrategyDialog = ({
    open,
    environmentName,
    featureId,
    projectId,
    onClose,
}: IEnvironmentStrategyDialogProps) => {
    const navigate = useNavigate();

    const createStrategyPath = formatCreateStrategyPath(
        projectId,
        featureId,
        environmentName,
        'default'
    );

    const onClick = () => {
        onClose();
        navigate(createStrategyPath);
    };

    return (
        <Dialogue
            open={open}
            maxWidth="sm"
            onClose={() => onClose()}
            title="You need to add a strategy to your toggle"
            primaryButtonText="Take me directly to add strategy"
            permissionButton={
                <PermissionButton
                    type="button"
                    permission={CREATE_FEATURE_STRATEGY}
                    projectId={projectId}
                    environmentId={environmentName}
                    onClick={onClick}
                >
                    Take me directly to add strategy
                </PermissionButton>
            }
            secondaryButtonText="Cancel"
        >
            <StyledParagraph>
                Before you can enable the toggle in the environment, you need to
                add an activation strategy.
            </StyledParagraph>
            <StyledParagraph>
                You can add the activation strategy by selecting the toggle,
                open the environment accordion and add the activation strategy.
            </StyledParagraph>
        </Dialogue>
    );
};

export default EnvironmentStrategyDialog;
