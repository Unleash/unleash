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

const Separator = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    margin: theme.spacing(0, 0.5),
}));

const Title = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.body1.fontWeight,
    color: theme.palette.text.primary,
}));

const StaticTitle = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.body1.fontWeight,
    color: theme.palette.text.primary,
    padding: theme.spacing(0.5, 1),
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

    const handleChange = (next: string) => {
        onChange(next);
        setAnchorEl(null);
    };

    const showSelector = options.length > 1;

    if (!showSelector) {
        return (
            <Bar>
                <StaticTitle>{title}</StaticTitle>
            </Bar>
        );
    }

    return (
        <Bar>
            <div ref={ref}>
                <ProjectButton
                    endIcon={<ArrowDropDownIcon />}
                    onClick={() => setAnchorEl(ref.current)}
                    aria-label='Select project'
                >
                    {valueLabel ?? value}
                </ProjectButton>
            </div>
            <Separator>/</Separator>
            <Title>{title}</Title>
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <DropdownList<string>
                    options={options}
                    onChange={handleChange}
                    search={{
                        label: 'Filter projects',
                        placeholder: 'Select project',
                    }}
                />
            </StyledPopover>
        </Bar>
    );
};
