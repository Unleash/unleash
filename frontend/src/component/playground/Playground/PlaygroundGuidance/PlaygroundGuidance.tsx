import { Typography, Box, Divider } from '@mui/material';
import { PlaygroundGuidanceSection } from './PlaygroundGuidanceSection/PlaygroundGuidanceSection.tsx';

export const PlaygroundGuidance = () => {
    return (
        <Box sx={{ ml: 4 }}>
            <Typography variant='body1'>
                Unleash playground is for helping you to understand how Unleash
                works, how feature flags are evaluated and for you to easily
                debug your feature flags.
            </Typography>

            <Divider sx={{ mt: 2, mb: 2 }} />

            <Typography variant='body1' sx={{ mb: 1 }}>
                What you need to do is:
            </Typography>

            <PlaygroundGuidanceSection
                headerText='Select in which environment you want to test your
                            feature flag configuration'
                bodyText='You can also specify specific projects, or check
                            flags in all projects.'
                sectionNumber='1'
            />

            <PlaygroundGuidanceSection
                headerText="Select a context field that you'd like to check"
                bodyText='You can configure as many context fields as you want. You can also leave the context empty to test against an empty context.'
                sectionNumber='2'
            />

            <PlaygroundGuidanceSection
                headerText='Submit the form to try the configuration'
                bodyText='The results of evaluating your feature flags will appear after you submit the form. Then view the results.'
                sectionNumber='3'
            />
        </Box>
    );
};
