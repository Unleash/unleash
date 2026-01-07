import { Switch, Tooltip } from '@mui/material';
import { TextCell } from '../TextCell/TextCell.tsx';

interface IToggleCellProps {
    checked: boolean;
    setChecked: (value: boolean) => void;
    title?: string;
}

export const ToggleCell = ({
    checked,
    setChecked,
    title,
}: IToggleCellProps) => (
    <TextCell>
        <Tooltip title={title ? title : checked ? 'Disable' : 'Enable'} arrow>
            <Switch
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
            />
        </Tooltip>
    </TextCell>
);
