import { Box, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { GuidanceIndicator } from 'component/common/GuidanceIndicator/GuidanceIndicator';
import { VFC } from 'react';

interface IPlaygroundGuidanceSectionProps {
    headerText: string;
    bodyText?: string;
    sectionNumber: string;
}

export const PlaygroundGuidanceSection: VFC<
    IPlaygroundGuidanceSectionProps
> = ({ headerText, bodyText, sectionNumber }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mt: 2,
                flexDirection: 'column',
            }}
        >
            <Box sx={{ display: 'flex' }}>
                <Box>
                    <GuidanceIndicator>{sectionNumber}</GuidanceIndicator>
                </Box>
                <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {headerText}
                    </Typography>
                    <ConditionallyRender
                        condition={Boolean(bodyText)}
                        show={
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                {bodyText}
                            </Typography>
                        }
                    />
                </Box>
            </Box>
        </Box>
    );
};
