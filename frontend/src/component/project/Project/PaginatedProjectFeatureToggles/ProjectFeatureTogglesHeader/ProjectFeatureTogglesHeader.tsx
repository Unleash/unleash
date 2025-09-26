import { type FC, useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import useLoading from 'hooks/useLoading';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import Add from '@mui/icons-material/Add';
import { styled } from '@mui/material';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { useSearchParams } from 'react-router-dom';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import type { FeatureSchema } from 'openapi';
import ReviewsOutlined from '@mui/icons-material/ReviewsOutlined';
import { useFeedback } from 'component/feedbackNew/useFeedback';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { CreateFeatureDialog } from './CreateFeatureDialog.tsx';
import ExportIcon from '@mui/icons-material/IosShare';
import type { OverridableStringUnion } from '@mui/types';
import type { ButtonPropsVariantOverrides } from '@mui/material/Button/Button';
import { NAVIGATE_TO_CREATE_FEATURE } from 'utils/testIds';
import { ImportButton } from './ImportButton/ImportButton.tsx';

interface IProjectFeatureTogglesHeaderProps {
    isLoading?: boolean;
    totalItems?: number;
    dataToExport?: Pick<FeatureSchema, 'name'>[];
    environmentsToExport?: string[];
}

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

export const ProjectFeatureTogglesHeader: FC<
    IProjectFeatureTogglesHeaderProps
> = ({ isLoading, totalItems, environmentsToExport }) => {
    const projectId = useRequiredPathParam('projectId');
    const headerLoadingRef = useLoading(isLoading || false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [showExportDialog, setShowExportDialog] = useState(false);
    const projectOverviewRefactorFeedback = useUiFlag(
        'projectOverviewRefactorFeedback',
    );
    const { openFeedback } = useFeedback('newProjectOverview', 'automatic');

    const createFeedbackContext = () => {
        openFeedback({
            title: 'How easy was it to work with the project overview in Unleash?',
            positiveLabel:
                'What do you like most about the updated project overview?',
            areasForImprovementsLabel:
                'What improvements are needed in the project overview?',
        });
    };

    return (
        <Box
            ref={headerLoadingRef}
            aria-busy={isLoading}
            aria-live='polite'
            sx={(theme) => ({
                padding: `${theme.spacing(2.5)} ${theme.spacing(3.125)}`,
            })}
        >
            <PageHeader
                titleElement={`Feature flags ${
                    totalItems !== undefined ? `(${totalItems})` : ''
                }`}
                actions={
                    <>
                        <Tooltip title='Export all project flags' arrow>
                            <IconButton
                                data-loading
                                onClick={() => setShowExportDialog(true)}
                            >
                                <ExportIcon />
                            </IconButton>
                        </Tooltip>
                        <ImportButton />

                        <ConditionallyRender
                            condition={!isLoading}
                            show={
                                <ExportDialog
                                    showExportDialog={showExportDialog}
                                    project={projectId}
                                    data={[]}
                                    onClose={() => setShowExportDialog(false)}
                                    environments={environmentsToExport || []}
                                />
                            }
                        />

                        <ConditionallyRender
                            // FIXME: remove - flag has been archived
                            condition={
                                projectOverviewRefactorFeedback &&
                                !isSmallScreen
                            }
                            show={
                                <Button
                                    startIcon={<ReviewsOutlined />}
                                    onClick={createFeedbackContext}
                                    variant='outlined'
                                    data-loading
                                >
                                    Provide feedback
                                </Button>
                            }
                        />
                        <FlagCreationButton isLoading={isLoading} />
                    </>
                }
            />
        </Box>
    );
};
