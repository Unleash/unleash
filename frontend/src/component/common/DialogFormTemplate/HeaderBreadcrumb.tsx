import { useState, useRef } from 'react';
import { styled, Button } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DropdownList } from './ConfigButtons/DropdownList.tsx';
import { StyledPopover } from './ConfigButtons/shared.styles';

type Option = { label: string; value: string };

type Props = {
    options: Option[];
    value: string;
    valueLabel?: string;
    onChange: (value: string) => void;
    title: string;
};

const Bar = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    gap: theme.spacing(1),
    height: theme.spacing(8),
}));

const ProjectButton = styled(Button)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: theme.typography.body1.fontWeight,
    textTransform: 'none',
    padding: theme.spacing(0.5, 1),
    minWidth: 0,
}));

export const HeaderBreadcrumb: React.FC<Props> = ({
    options,
    value,
    valueLabel,
    onChange,
    title,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const showSelector = options.length > 1;

    return (
        <Bar>
            {showSelector ? (
                <>
                    <div ref={ref}>
                        <ProjectButton
                            endIcon={<ArrowDropDownIcon />}
                            onClick={() => setAnchorEl(ref.current)}
                            aria-label='Select project'
                        >
                            {valueLabel ?? value}
                        </ProjectButton>
                    </div>
                    <span style={{ margin: '0 4px' }}>/</span>
                </>
            ) : null}
            <span>{title}</span>
            {showSelector ? (
                <StyledPopover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                    <DropdownList<string>
                        options={options}
                        onChange={(next) => {
                            onChange(next);
                            setAnchorEl(null);
                        }}
                        search={{
                            label: 'Filter projects',
                            placeholder: 'Select project',
                        }}
                    />
                </StyledPopover>
            ) : null}
        </Bar>
    );
};
