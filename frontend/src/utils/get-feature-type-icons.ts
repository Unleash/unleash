import {
    EXPERIMENT,
    RELEASE,
    KILLSWITCH,
    OPERATIONAL,
    PERMISSION,
} from '../constants/featureToggleTypes';

import LoopIcon from '@material-ui/icons/Loop';
import TimelineIcon from '@material-ui/icons/Timeline';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import PanToolIcon from '@material-ui/icons/PanTool';
import BuildIcon from '@material-ui/icons/Build';

export const getFeatureTypeIcons = (type: string) => {
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
