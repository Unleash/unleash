import { type ComponentType, useState } from 'react';
import {
    Box,
    styled,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { PageFrame } from './frames/PageFrame.tsx';
import { DialogFrame } from './frames/DialogFrame.tsx';
import { DrawerFrame } from './frames/DrawerFrame.tsx';
import { InlineFrame } from './frames/InlineFrame.tsx';
import { SplashFrame } from './frames/SplashFrame.tsx';

interface IFraming {
    key: string;
    label: string;
    component: ComponentType;
}

const FRAMINGS: IFraming[] = [
    { key: 'page', label: '1 · Full page', component: PageFrame },
    { key: 'dialog', label: '2 · Dialog over app', component: DialogFrame },
    { key: 'drawer', label: '3 · Side drawer', component: DrawerFrame },
    { key: 'inline', label: '4 · Inline on project', component: InlineFrame },
    { key: 'splash', label: '5 · Welcome splash', component: SplashFrame },
];

const StyledLab = styled(Box)({
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
});

const StyledBar = styled(Box)(({ theme }) => ({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
}));

const StyledStage = styled(Box)({
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
});

/**
 * TEMPORARY comparison harness: renders every "inside Unleash" framing of the
 * grid demo behind a selector so they can be evaluated side by side under one
 * URL. Remove together with the preview route once a framing is chosen.
 */
export const ClosedDemoLab = () => {
    const [selected, setSelected] = useState(FRAMINGS[0].key);
    const Current =
        FRAMINGS.find((f) => f.key === selected)?.component ??
        FRAMINGS[0].component;

    return (
        <StyledLab>
            <StyledBar>
                <Typography sx={{ fontWeight: 'bold', mr: 1 }}>
                    Closed demo framings
                </Typography>
                <ToggleButtonGroup
                    value={selected}
                    exclusive
                    size='small'
                    onChange={(_, value) => value && setSelected(value)}
                >
                    {FRAMINGS.map((framing) => (
                        <ToggleButton key={framing.key} value={framing.key}>
                            {framing.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </StyledBar>
            <StyledStage>
                <Current />
            </StyledStage>
        </StyledLab>
    );
};
