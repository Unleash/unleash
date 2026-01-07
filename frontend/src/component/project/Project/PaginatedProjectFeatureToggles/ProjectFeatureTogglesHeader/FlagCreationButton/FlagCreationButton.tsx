import { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { styled } from '@mui/material';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { useSearchParams } from 'react-router-dom';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { CreateFeatureDialog } from '../CreateFeatureDialog.tsx';
import type { OverridableStringUnion } from '@mui/types';
import type { ButtonPropsVariantOverrides } from '@mui/material/Button/Button';
import { NAVIGATE_TO_CREATE_FEATURE } from 'utils/testIds';

interface IFlagCreationButtonProps {
    text?: string;
    variant?: OverridableStringUnion<
        'text' | 'outlined' | 'contained',
        ButtonPropsVariantOverrides
    >;
    skipNavigationOnComplete?: boolean;
    isLoading?: boolean;
    onSuccess?: () => void;
}

const StyledResponsiveButton = styled(ResponsiveButton)(() => ({
    whiteSpace: 'nowrap',
}));

export const FlagCreationButton = ({
    variant,
    text = 'New feature flag',
    skipNavigationOnComplete,
    isLoading,
    onSuccess,
}: IFlagCreationButtonProps) => {
    const { loading } = useUiConfig();
    const [searchParams] = useSearchParams();
    const projectId = useRequiredPathParam('projectId');
    const showCreateDialog = Boolean(searchParams.get('create'));
    const [openCreateDialog, setOpenCreateDialog] = useState(showCreateDialog);

    return (
        <>
            <StyledResponsiveButton
                onClick={() => setOpenCreateDialog(true)}
                maxWidth='960px'
                Icon={Add}
                projectId={projectId}
                disabled={loading || isLoading}
                variant={variant}
                permission={CREATE_FEATURE}
                data-testid={
                    loading || isLoading ? '' : NAVIGATE_TO_CREATE_FEATURE
                }
            >
                {text}
            </StyledResponsiveButton>
            <CreateFeatureDialog
                open={openCreateDialog}
                onClose={() => setOpenCreateDialog(false)}
                skipNavigationOnComplete={skipNavigationOnComplete}
                onSuccess={onSuccess}
            />
        </>
    );
};
