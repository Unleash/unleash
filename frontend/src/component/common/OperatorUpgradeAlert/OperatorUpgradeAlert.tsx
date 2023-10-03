import { Alert } from '@mui/material';

export const OperatorUpgradeAlert = () => {
    return (
        <Alert severity="warning">
            Remember to update your Unleash client! New operators require new
            SDK versions. <OperatorDocsLink />.
        </Alert>
    );
};

const OperatorDocsLink = () => {
    return (
        <a
            href="https://docs.getunleash.io/reference/strategy-constraints#strategy-constraint-operators"
            target="_blank"
            rel="noreferrer"
        >
            Read more
        </a>
    );
};
