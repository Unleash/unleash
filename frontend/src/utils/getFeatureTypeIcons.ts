import {
    EXPERIMENT,
    RELEASE,
    KILLSWITCH,
    OPERATIONAL,
    PERMISSION,
} from '../constants/featureToggleTypes';

import LoopIcon from '@mui/icons-material/Loop';
import TimelineIcon from '@mui/icons-material/Timeline';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PanToolIcon from '@mui/icons-material/PanTool';
import BuildIcon from '@mui/icons-material/Build';

export const getFeatureTypeIcons = (type?: string) => {
    switch (type) {
        case RELEASE:
            return LoopIcon;
        case EXPERIMENT:
            return TimelineIcon;
        case KILLSWITCH:
            return PowerSettingsNewIcon;
        case OPERATIONAL:
            return BuildIcon;
        case PERMISSION:
            return PanToolIcon;
        default:
            return LoopIcon;
    }
};
