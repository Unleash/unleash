import { Typography } from '@material-ui/core';

export const FeatureMetricsEmpty = () => {
    return (
        <>
            <Typography variant="body1" paragraph>
                We have yet to receive any metrics for this feature toggle in
                the selected time period.
            </Typography>
            <Typography variant="body1" paragraph>
                Please note that, since the SDKs send metrics on an interval, it
                might take some time before metrics appear.
            </Typography>
        </>
    );
};
