import { usePageTitle } from 'hooks/usePageTitle';
import { styled } from '@mui/material';
import { useConnectedEdges } from 'hooks/api/getters/useConnectedEdges/useConnectedEdges';
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
    margin: theme.spacing(5, 0),
}));

export const EnterpriseEdge = () => {
    usePageTitle('Enterprise Edge');

    const { connectedEdges } = useConnectedEdges({ refreshInterval: 30_000 });

    return (
        <StyledPageContent header='Enterprise Edge'>
            {connectedEdges.length > 0 && (
                <>
                    <StyledPageContentSection>
                        <EnterpriseEdgeInstances
                            connectedEdges={connectedEdges}
                        />
                    </StyledPageContentSection>
                    <StyledSeparator />
                </>
            )}
            <StyledPageContentSection>
                <EnterpriseEdgeExplanation />
            </StyledPageContentSection>
        </StyledPageContent>
    );
};

export default EnterpriseEdge;
