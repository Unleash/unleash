import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import ScienceIcon from '@mui/icons-material/ScienceOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import {
    EXPERIMENT,
    KILLSWITCH,
    OPERATIONAL,
    PERMISSION,
    RELEASE,
    SUNSET,
} from 'constants/featureToggleTypes';
import type { CreateFeatureSchemaType } from 'openapi';

export type FlagTypeGroup = 'standard' | 'experiment' | 'kill-switch';

export const flagTypeGroups: {
    group: FlagTypeGroup;
    label: string;
    icon: typeof OutlinedFlagIcon;
    type: CreateFeatureSchemaType;
}[] = [
    {
        group: 'standard',
        label: 'Standard',
        icon: OutlinedFlagIcon,
        type: RELEASE,
    },
    {
        group: 'experiment',
        label: 'Experiment',
        icon: ScienceIcon,
        type: EXPERIMENT,
    },
    {
        group: 'kill-switch',
        label: 'Kill switch',
        icon: PowerSettingsNewIcon,
        type: KILLSWITCH,
    },
];

export const groupOfType = (type: string): FlagTypeGroup =>
    type === EXPERIMENT || type === KILLSWITCH ? type : 'standard';

export const lifetimePresets = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
];

export const permanentLifetime = 0;

const defaultLifetimeByType: Record<CreateFeatureSchemaType, number> = {
    [RELEASE]: 30,
    [EXPERIMENT]: 30,
    [SUNSET]: 90,
    [OPERATIONAL]: 7,
    [PERMISSION]: permanentLifetime,
    [KILLSWITCH]: permanentLifetime,
};

export const defaultLifetimeFor = (type: CreateFeatureSchemaType) =>
    defaultLifetimeByType[type] ?? 30;
