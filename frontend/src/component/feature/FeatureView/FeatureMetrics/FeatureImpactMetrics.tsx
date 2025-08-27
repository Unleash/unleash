import { PageContent } from 'component/common/PageContent/PageContent.tsx';
import { PageHeader } from '../../../common/PageHeader/PageHeader.tsx';
import { Button, styled, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';

const StyledHeaderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: 'normal',
    lineHeight: theme.spacing(5),
}));

export const FeatureImpactMetrics = () => {
    return (
        <PageContent>
            <PageHeader
                titleElement={
                    <StyledHeaderTitle>Impact Metrics</StyledHeaderTitle>
                }
                actions={
                    <Button
                        variant='contained'
                        startIcon={<Add />}
                        onClick={() => {}}
                        disabled={false}
                    >
                        Add Chart
                    </Button>
                }
            />
        </PageContent>
    );
};
