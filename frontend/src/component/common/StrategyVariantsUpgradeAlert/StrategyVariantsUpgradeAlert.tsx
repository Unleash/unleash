import { Alert } from '@mui/material';

export const StrategyVariantsUpgradeAlert = () => {
    return (
        <Alert severity='warning' sx={{ mb: 3 }}>
            Remember to update your Unleash client! Strategy variants require
            new SDK versions. <DocsSdkSupportLink />.
        </Alert>
    );
};

export const StrategyVariantsPreferredAlert = () => {
    return (
        <Alert severity='warning' sx={{ mb: 4 }}>
            If you want advanced targeting capabilities you should use{' '}
            <b>variants inside strategies</b>. <DocsLink />
        </Alert>
    );
};

const DocsSdkSupportLink = () => {
    return (
        <a
            href='https://docs.getunleash.io/concepts/strategy-variants#client-sdk-support'
            target='_blank'
            rel='noreferrer'
        >
            Read more
        </a>
    );
};

const DocsLink = () => {
    return (
        <a
            href='https://docs.getunleash.io/concepts/strategy-variants'
            target='_blank'
            rel='noreferrer'
        >
            Read more
        </a>
    );
};
