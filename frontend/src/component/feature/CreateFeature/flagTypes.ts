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
import type { Lifetime } from 'component/feature/hooks/useFeatureForm';

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

const defaultLifetimeByType: Record<CreateFeatureSchemaType, Lifetime> = {
    [RELEASE]: { type: 'preset', days: 30 },
    [EXPERIMENT]: { type: 'preset', days: 30 },
    [SUNSET]: { type: 'preset', days: 90 },
    [OPERATIONAL]: { type: 'preset', days: 7 },
    [PERMISSION]: { type: 'permanent' },
    [KILLSWITCH]: { type: 'permanent' },
};

export const defaultLifetimeFor = (type: CreateFeatureSchemaType): Lifetime =>
    defaultLifetimeByType[type] ?? { type: 'preset', days: 30 };
