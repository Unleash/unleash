import { type ReactNode, type VFC, useState } from 'react';
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
import { Search } from 'component/common/Search/Search';
import { useUiFlag } from 'hooks/useUiFlag';
import Add from '@mui/icons-material/Add';
import FileDownload from '@mui/icons-material/FileDownload';
import { styled } from '@mui/material';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { useNavigate } from 'react-router-dom';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { getCreateTogglePath } from 'utils/routePathHelpers';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import type { FeatureSchema } from 'openapi';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import ReviewsOutlined from '@mui/icons-material/ReviewsOutlined';
import { useFeedback } from '../../../../feedbackNew/useFeedback';

interface IProjectFeatureTogglesHeaderProps {
    isLoading?: boolean;
    totalItems?: number;
    searchQuery?: string;
    onChangeSearchQuery?: (query: string) => void;
    dataToExport?: Pick<FeatureSchema, 'name'>[];
    environmentsToExport?: string[];
    actions?: ReactNode;
}

const StyledResponsiveButton = styled(ResponsiveButton)(() => ({
    whiteSpace: 'nowrap',
}));

export const ProjectFeatureTogglesHeader: VFC<
    IProjectFeatureTogglesHeaderProps
> = ({
    isLoading,
    totalItems,
    searchQuery,
    onChangeSearchQuery,
    environmentsToExport,
    actions,
}) => {
    const projectId = useRequiredPathParam('projectId');
    const headerLoadingRef = useLoading(isLoading || false);
    const [showTitle, setShowTitle] = useState(true);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const featuresExportImportFlag = useUiFlag('featuresExportImport');
    const [showExportDialog, setShowExportDialog] = useState(false);
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();
    const projectOverviewRefactorFeedback = useUiFlag(
        'projectOverviewRefactorFeedback',
    );
    const { openFeedback } = useFeedback('newProjectOverview', 'automatic');
    const handleSearch = (query: string) => {
        onChangeSearchQuery?.(query);
        trackEvent('search-bar', {
            props: {
                screen: 'project',
                length: query.length,
            },
        });
    };

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
                titleElement={
                    showTitle
                        ? `Feature toggles ${
                              totalItems !== undefined ? `(${totalItems})` : ''
                          }`
                        : null
                }
                actions={
                    <>
                        <ConditionallyRender
                            condition={!isSmallScreen}
                            show={
                                <Search
                                    data-loading
                                    placeholder='Search and Filter'
                                    expandable
                                    initialValue={searchQuery || ''}
                                    onChange={handleSearch}
                                    onFocus={() => setShowTitle(false)}
                                    onBlur={() => setShowTitle(true)}
                                    hasFilters
                                    id='projectFeatureToggles'
                                />
                            }
                        />
                        {actions}
                        <PageHeader.Divider sx={{ marginLeft: 0 }} />
                        <ConditionallyRender
                            condition={featuresExportImportFlag}
                            show={
                                <>
                                    <Tooltip
                                        title='Export all project toggles'
                                        arrow
                                    >
                                        <IconButton
                                            data-loading
                                            onClick={() =>
                                                setShowExportDialog(true)
                                            }
                                            sx={(theme) => ({
                                                marginRight: theme.spacing(2),
                                            })}
                                        >
                                            <FileDownload />
                                        </IconButton>
                                    </Tooltip>

                                    <ConditionallyRender
                                        condition={!isLoading}
                                        show={
                                            <ExportDialog
                                                showExportDialog={
                                                    showExportDialog
                                                }
                                                project={projectId}
                                                data={[]}
                                                onClose={() =>
                                                    setShowExportDialog(false)
                                                }
                                                environments={
                                                    environmentsToExport || []
                                                }
                                            />
                                        }
                                    />
                                </>
                            }
                        />
                        <ConditionallyRender
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
                        <StyledResponsiveButton
                            onClick={() =>
                                navigate(getCreateTogglePath(projectId))
                            }
                            maxWidth='960px'
                            Icon={Add}
                            projectId={projectId}
                            permission={CREATE_FEATURE}
                            data-testid='NAVIGATE_TO_CREATE_FEATURE'
                        >
                            New feature toggle
                        </StyledResponsiveButton>
                    </>
                }
            >
                <ConditionallyRender
                    condition={isSmallScreen}
                    show={
                        <Search
                            initialValue={searchQuery || ''}
                            onChange={handleSearch}
                            hasFilters
                            id='projectFeatureToggles'
                        />
                    }
                />
            </PageHeader>
        </Box>
    );
};
