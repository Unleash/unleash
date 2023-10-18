import { Alert } from '@mui/material';

export const DependenciesUpgradeAlert = () => {
    return (
        <Alert severity='warning'>
            Remember to update your Unleash client! Feature dependencies require
            new SDK versions. Read more about <DependenciesDocsLink />.
        </Alert>
    );
};

const DependenciesDocsLink = () => {
    return (
        <a
            href='https://docs.getunleash.io/reference/dependent-features#client-sdk-support'
            target='_blank'
            rel='noreferrer'
        >
            Client SDK support for feature dependencies
        </a>
    );
};
