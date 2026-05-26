import {
    FormControlLabel,
    Switch,
    styled,
    type SwitchProps,
} from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

type Props = {
    checked: boolean;
    onChange: (next: boolean) => void;
    labelOn: string;
    labelOff: string;
    help?: React.ReactNode;
    size?: SwitchProps['size'];
};

const Wrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginLeft: theme.spacing(-1.5),
}));

const StyledFormControlLabel = styled(FormControlLabel)({
    marginLeft: 0,
    marginRight: 0,
});

export const InlineToggleField: React.FC<Props> = ({
    checked,
    onChange,
    labelOn,
    labelOff,
    help,
    size = 'medium',
}) => {
    const label = checked ? labelOn : labelOff;
    return (
        <Wrapper>
            <StyledFormControlLabel
                control={
                    <Switch
                        size={size}
                        checked={checked}
                        onChange={(e) => onChange(e.target.checked)}
                    />
                }
                label={label}
            />
            {help ? <HelpIcon tooltip={help} htmlTooltip /> : null}
        </Wrapper>
    );
};
