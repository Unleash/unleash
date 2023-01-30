import { Edit, Delete } from '@mui/icons-material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { UPDATE_FEATURE_ENVIRONMENT_VARIANTS } from 'component/providers/AccessProvider/permissions';
import { IFeatureVariant } from 'interfaces/featureToggle';

interface IVariantsActionCellProps {
    projectId: string;
    environmentId: string;
    variant: IFeatureVariant;
    isLastVariableVariant: boolean;
    editVariant: (variant: IFeatureVariant) => void;
    deleteVariant: (variant: IFeatureVariant) => void;
}

export const VariantsActionCell = ({
    projectId,
    environmentId,
    variant,
    isLastVariableVariant,
    editVariant,
    deleteVariant,
}: IVariantsActionCellProps) => {
    return (
        <ActionCell>
            <PermissionIconButton
                size="large"
                data-testid={`VARIANT_EDIT_BUTTON_${variant.name}`}
                permission={UPDATE_FEATURE_ENVIRONMENT_VARIANTS}
                projectId={projectId}
                environmentId={environmentId}
                onClick={() => editVariant(variant)}
                tooltipProps={{
                    title: 'Edit variant',
                }}
            >
                <Edit />
            </PermissionIconButton>
            <PermissionIconButton
                size="large"
                permission={UPDATE_FEATURE_ENVIRONMENT_VARIANTS}
                data-testid={`VARIANT_DELETE_BUTTON_${variant.name}`}
                projectId={projectId}
                disabled={isLastVariableVariant}
                environmentId={environmentId}
                onClick={() => deleteVariant(variant)}
                tooltipProps={{
                    title: isLastVariableVariant
                        ? 'You need to have at least one variable variant'
                        : 'Delete variant',
                }}
            >
                <Delete />
            </PermissionIconButton>
        </ActionCell>
    );
};
