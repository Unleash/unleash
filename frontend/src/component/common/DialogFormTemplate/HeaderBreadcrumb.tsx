import { useState, useRef } from 'react';
import { styled, Button } from '@mui/material';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
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
    gap: theme.spacing(0),
    height: theme.spacing(8),
}));

const ProjectButton = styled(Button)(({ theme }) => ({
    color: theme.palette.text.primary,
    textTransform: 'none',
    padding: theme.spacing(0.5, 1),
    minWidth: 0,
}));

const StyledSeparator = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    margin: theme.spacing(0, 0.5),
}));

const Separator = () => <StyledSeparator aria-hidden>/</StyledSeparator>;

const Title = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
    paddingLeft: theme.spacing(0.5),
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
                            endIcon={<KeyboardArrowDownOutlined />}
                            onClick={() => setAnchorEl(ref.current)}
                            aria-label='Select project'
                        >
                            {valueLabel ?? value}
                        </ProjectButton>
                    </div>
                    <Separator />
                </>
            ) : null}
            <Title>{title}</Title>
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
