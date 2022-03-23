import { Alert } from '@material-ui/lab';

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
            href="https://docs.getunleash.io/advanced/strategy_constraints#strategy-constraint-operators"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'inherit' }}
        >
            Read more
        </a>
    );
};
