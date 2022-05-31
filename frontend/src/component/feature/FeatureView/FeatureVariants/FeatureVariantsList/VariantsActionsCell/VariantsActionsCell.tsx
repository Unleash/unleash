import { Edit, Delete } from '@mui/icons-material';
import { Box } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE_VARIANTS } from 'component/providers/AccessProvider/permissions';
import { IFeatureVariant } from 'interfaces/featureToggle';

interface IVarintsActionCellProps {
    projectId: string;
    editVariant: (name: string) => void;
    setDelDialog: React.Dispatch<
        React.SetStateAction<{
            name: string;
            show: boolean;
        }>
    >;
    variant: IFeatureVariant;
}

export const VariantsActionCell = ({
    projectId,
    setDelDialog,
    variant,
    editVariant,
}: IVarintsActionCellProps) => {
    return (
        <Box
            style={{ display: 'flex', justifyContent: 'flex-end' }}
            data-loading
        >
            <PermissionIconButton
                size="large"
                data-testid={`VARIANT_EDIT_BUTTON_${variant.name}`}
                permission={UPDATE_FEATURE_VARIANTS}
                projectId={projectId}
                onClick={() => editVariant(variant.name)}
            >
                <Edit />
            </PermissionIconButton>
            <PermissionIconButton
                size="large"
                permission={UPDATE_FEATURE_VARIANTS}
                data-testid={`VARIANT_DELETE_BUTTON_${variant.name}`}
                projectId={projectId}
                onClick={() =>
                    setDelDialog({
                        show: true,
                        name: variant.name,
                    })
                }
            >
                <Delete />
            </PermissionIconButton>
        </Box>
    );
};
