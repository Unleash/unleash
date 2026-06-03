import {
    EXPERIMENT,
    RELEASE,
    KILLSWITCH,
    OPERATIONAL,
    PERMISSION,
    SUNSET,
} from '../constants/featureToggleTypes.js';

import LoopIcon from '@mui/icons-material/Loop';
import TimelineIcon from '@mui/icons-material/Timeline';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PanToolIcon from '@mui/icons-material/PanTool';
import BuildIcon from '@mui/icons-material/Build';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

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
        case SUNSET:
            return TrendingDownIcon;
        default:
            return LoopIcon;
    }
};
