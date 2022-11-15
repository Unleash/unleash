import { Edit, Delete } from '@mui/icons-material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { UPDATE_FEATURE_VARIANTS } from 'component/providers/AccessProvider/permissions';
import { IFeatureVariant } from 'interfaces/featureToggle';

interface IVarintsActionCellProps {
    projectId: string;
    variant: IFeatureVariant;
    editVariant: (variant: IFeatureVariant) => void;
    deleteVariant: (variant: IFeatureVariant) => void;
}

export const VariantsActionCell = ({
    projectId,
    variant,
    editVariant,
    deleteVariant,
}: IVarintsActionCellProps) => {
    return (
        <ActionCell>
            <PermissionIconButton
                size="large"
                data-testid={`VARIANT_EDIT_BUTTON_${variant.name}`}
                permission={UPDATE_FEATURE_VARIANTS}
                projectId={projectId}
                onClick={() => editVariant(variant)}
            >
                <Edit />
            </PermissionIconButton>
            <PermissionIconButton
                size="large"
                permission={UPDATE_FEATURE_VARIANTS}
                data-testid={`VARIANT_DELETE_BUTTON_${variant.name}`}
                projectId={projectId}
                onClick={() => deleteVariant(variant)}
            >
                <Delete />
            </PermissionIconButton>
        </ActionCell>
    );
};
