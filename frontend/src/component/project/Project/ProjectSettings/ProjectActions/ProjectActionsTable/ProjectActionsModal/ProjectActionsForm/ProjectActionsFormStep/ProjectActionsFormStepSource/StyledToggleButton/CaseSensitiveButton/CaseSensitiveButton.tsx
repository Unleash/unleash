import { Tooltip, Box } from '@mui/material';
import { ReactComponent as CaseSensitive } from 'assets/icons/24_Text format.svg';
import { ReactComponent as CaseSensitiveOff } from 'assets/icons/24_Text format off.svg';
import {
    StyledToggleButtonOff,
    StyledToggleButtonOn,
} from '../StyledToggleButton.tsx';
import type { IConstraint } from 'interfaces/strategy';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender.tsx';

interface CaseSensitiveButtonProps {
    localConstraint: Pick<IConstraint, 'caseInsensitive'>;
    setCaseInsensitive: () => void;
}

export const CaseSensitiveButton = ({
    localConstraint,
    setCaseInsensitive,
}: CaseSensitiveButtonProps) => (
    <Tooltip
        title={
            localConstraint.caseInsensitive
                ? 'Make it case sensitive'
                : 'Make it case insensitive'
        }
        arrow
    >
        <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
            <ConditionallyRender
                condition={Boolean(localConstraint.caseInsensitive)}
                show={
                    <StyledToggleButtonOff
                        onClick={setCaseInsensitive}
                        disableRipple
                    >
                        <CaseSensitiveOff />
                    </StyledToggleButtonOff>
                }
                elseShow={
                    <StyledToggleButtonOn
                        className='operator-is-active'
                        onClick={setCaseInsensitive}
                        disableRipple
                    >
                        <CaseSensitive />
                    </StyledToggleButtonOn>
                }
            />
        </Box>
    </Tooltip>
);
