import type { FC } from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { styled, Tooltip } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { IPersonalAPIToken } from 'interfaces/personalAPIToken';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { getLocalizedDateString } from 'component/common/util';

const StyledContent = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledWarningIcon = styled(WarningAmberIcon)(({ theme }) => ({
    color: theme.palette.warning.main,
    fontSize: theme.spacing(2.25),
}));

const warningTexts = {
    'expires-soon': 'This token expires soon',
    expired: 'This token has expired',
} as const;

interface ITokenExpiryCellProps {
    token: Pick<IPersonalAPIToken, 'expiresAt' | 'expiryWarning'>;
}

export const TokenExpiryCell: FC<ITokenExpiryCellProps> = ({ token }) => {
    const { locationSettings } = useLocationSettings();

    const expiresAt = new Date(token.expiresAt);
    if (expiresAt.getFullYear() > new Date().getFullYear() + 100) {
        return <TextCell>Never</TextCell>;
    }

    const date = getLocalizedDateString(
        token.expiresAt,
        locationSettings.locale,
    );
    return (
        <TextCell lineClamp={1}>
            <StyledContent>
                {date}
                {token.expiryWarning ? (
                    <Tooltip title={warningTexts[token.expiryWarning]} arrow>
                        <StyledWarningIcon
                            titleAccess={warningTexts[token.expiryWarning]}
                        />
                    </Tooltip>
                ) : null}
            </StyledContent>
        </TextCell>
    );
};
