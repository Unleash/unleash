import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { styled } from '@mui/material';

const StyledWarningAmber = styled(WarningAmber)(({ theme }) => ({
    color: theme.palette.warning.main,
    fontSize: theme.fontSizes.bodySize,
}));

const VariantsWarningTooltip = () => {
    return (
        <HtmlTooltip
            arrow
            title={
                <>
                    This environment has no variants enabled. If you check this
                    feature's variants in this environment, you will get the{' '}
                    <a
                        href='https://docs.getunleash.io/concepts/feature-toggle-variants#the-disabled-variant'
                        target='_blank'
                        rel='noreferrer'
                    >
                        disabled variant
                    </a>
                    .
                </>
            }
        >
            <StyledWarningAmber />
        </HtmlTooltip>
    );
};

export default VariantsWarningTooltip;
