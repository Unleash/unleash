import { IFeatureChange } from '../changeRequest.types';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender';
import { Badge } from '../../common/Badge/Badge';

export const ModifiedInChangeRequestStatusBadge = ({
    change,
    scheduled,
}: {
    change: IFeatureChange | undefined;
    scheduled?: boolean;
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    if (isSmallScreen) {
        return null;
    }

    const modifiedIn = scheduled ? 'scheduled change' : 'draft';

    return (
        <Box sx={{ mr: 1.5 }}>
            <ConditionallyRender
                condition={change?.action === 'updateStrategy'}
                show={<Badge color='warning'>Modified in {modifiedIn}</Badge>}
            />
            <ConditionallyRender
                condition={change?.action === 'deleteStrategy'}
                show={<Badge color='error'>Deleted in {modifiedIn}</Badge>}
            />
        </Box>
    );
};
