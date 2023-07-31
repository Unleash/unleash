import { Alert } from '@mui/material';

export const StrategyVariantsUpgradeAlert = () => {
    return (
        <Alert severity="warning" sx={{ mb: 3 }}>
            Remember to update your Unleash client! Strategy variants require
            new SDK versions. <DocsLink />.
        </Alert>
    );
};

const DocsLink = () => {
    return (
        <a
            href="https://docs.getunleash.io/reference/feature-strategy-variants#client-sdk-support"
            target="_blank"
            rel="noreferrer"
        >
            Read more
        </a>
    );
};
