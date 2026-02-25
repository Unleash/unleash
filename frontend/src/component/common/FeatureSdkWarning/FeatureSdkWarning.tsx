import type { FC } from 'react';
import WarningIcon from '@mui/icons-material/WarningAmber';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { Link, styled } from '@mui/material';

interface IFeatureSdkWarningProps {
    featureName: 'regexOperator';
}

const StyledIconContainer = styled('span')({
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    paddingInline: '0.4em',
});

const StyledWarningIcon = styled(WarningIcon)({
    fontSize: '1em',
});

export const FeatureSdkWarning: FC<IFeatureSdkWarningProps> = ({
    featureName,
}) => {
    const shouldShowRegexWarning = featureName === 'regexOperator';
    if (shouldShowRegexWarning) {
        return (
            <HtmlTooltip
                title={
                    <p>
                        Regex operator is supported by only selected SDKs{' '}
                        <Link
                            target='_blank'
                            rel='noopener noreferrer'
                            href='https://docs.getunleash.io/sdks/features/regexOperator' // TODO: this link needs to be created first
                        >
                            regex operator supported SDKs
                        </Link>
                        .
                    </p>
                }
                placement='bottom-start'
                arrow
            >
                <StyledIconContainer>
                    <StyledWarningIcon
                        aria-label='This feature may require specific SDK support'
                        color='warning'
                        data-testid='feature-sdk-warning'
                    />
                </StyledIconContainer>
            </HtmlTooltip>
        );
    }

    return null;
};
