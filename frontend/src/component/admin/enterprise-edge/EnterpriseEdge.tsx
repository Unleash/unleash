import { usePageTitle } from 'hooks/usePageTitle';
import { styled } from '@mui/material';
import { useEdgeObservability } from '../../../hooks/api/getters/useConnectedEdges/useEdgeObservability.ts';
import { EnterpriseEdgeInstances } from './EnterpriseEdgeInstances/EnterpriseEdgeInstances.tsx';
import { PageContent } from 'component/common/PageContent/PageContent.tsx';
import { EnterpriseEdgeExplanation } from './EnterpriseEdgeExplanation.tsx';

const StyledPageContent = styled(PageContent)(({ theme }) => ({
    '.body': {
        padding: theme.spacing(0),
    },
}));

const StyledPageContentSection = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
}));

const StyledSeparator = styled('hr')(({ theme }) => ({
    border: 'none',
    height: '1px',
    background: theme.palette.divider,
    width: '100%',
    margin: theme.spacing(2, 0),
}));

export const EnterpriseEdge = () => {
    usePageTitle('Enterprise Edge');

    const { edgeObservability } = useEdgeObservability({
        refreshInterval: 30_000,
    });
    const hasConnectedEdges = edgeObservability.connectedEdges.length > 0;

    return (
        <StyledPageContent header='Enterprise Edge'>
            {hasConnectedEdges && (
                <>
                    <StyledPageContentSection>
                        <EnterpriseEdgeInstances
                            connectedEdges={edgeObservability.connectedEdges}
                            revisionIds={edgeObservability.revisionIds}
                        />
                    </StyledPageContentSection>
                    <StyledSeparator />
                </>
            )}
            <StyledPageContentSection sx={{ pb: hasConnectedEdges ? 6 : 4 }}>
                <EnterpriseEdgeExplanation />
            </StyledPageContentSection>
        </StyledPageContent>
    );
};

export default EnterpriseEdge;
