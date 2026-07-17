import { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import type { Story, StoryMeta } from 'component/stories/types';
import { FilterItem, type FilterItemParams } from './FilterItem.tsx';

export const meta: StoryMeta = {
    title: 'Filter/FilterItem',
    background: 'application',
};

const singularOperators: [string, ...string[]] = ['IS', 'IS_NOT'];
const pluralOperators: [string, ...string[]] = ['IS_ANY_OF', 'IS_NONE_OF'];

const FIRST_NAMES = [
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Ethan',
    'Fiona',
    'George',
    'Hannah',
    'Ivan',
    'Julia',
    'Kevin',
    'Laura',
    'Michael',
    'Nora',
    'Oscar',
    'Paula',
    'Quentin',
    'Rachel',
    'Sam',
    'Tina',
    'Ursula',
    'Victor',
    'Wendy',
    'Xavier',
    'Yara',
    'Zach',
    'Aaron',
    'Beatrice',
    'Caleb',
    'Delia',
    'Elliot',
    'Freya',
    'Gabriel',
    'Helena',
    'Isaac',
    'Jasmine',
    'Kai',
    'Leon',
    'Maya',
    'Nathan',
    'Olivia',
    'Penelope',
    'Quinn',
    'Ruby',
    'Silas',
    'Theo',
    'Uma',
    'Vincent',
    'Willa',
    'Xander',
    'Yosef',
    'Zara',
    'Adrian',
    'Bianca',
    'Cyrus',
    'Daphne',
    'Emmett',
    'Frida',
    'Gideon',
    'Hazel',
    'Ismael',
    'June',
    'Kian',
    'Lila',
    'Milo',
    'Naomi',
    'Otto',
    'Piper',
    'Rex',
    'Sienna',
    'Tomas',
    'Ulric',
    'Vera',
    'Wesley',
    'Xiomara',
    'Yannick',
    'Zelda',
    'August',
    'Blythe',
    'Cassius',
    'Dahlia',
    'Emil',
    'Faye',
    'Gunnar',
    'Ines',
    'Jonah',
    'Kyra',
    'Lars',
    'Mira',
    'Nils',
    'Ophelia',
    'Perry',
    'Quill',
    'Rowan',
    'Soren',
    'Tessa',
    'Ulysses',
    'Vale',
    'Wren',
    'Xenia',
    'Yves',
    'Zephyr',
];

const LAST_NAMES = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
    'Hernandez',
    'Lopez',
    'Wilson',
    'Anderson',
    'Thomas',
    'Taylor',
    'Moore',
    'Jackson',
    'Martin',
    'Lee',
    'Perez',
    'Thompson',
    'White',
    'Harris',
    'Sanchez',
    'Clark',
    'Ramirez',
    'Lewis',
    'Robinson',
    'Walker',
    'Young',
    'Allen',
    'King',
    'Wright',
    'Scott',
    'Torres',
    'Nguyen',
    'Hill',
    'Flores',
    'Green',
    'Adams',
    'Nelson',
    'Baker',
    'Hall',
    'Rivera',
    'Campbell',
    'Mitchell',
    'Carter',
    'Roberts',
    'Gomez',
    'Phillips',
    'Evans',
    'Turner',
    'Diaz',
    'Parker',
    'Cruz',
    'Edwards',
    'Collins',
    'Reyes',
    'Stewart',
    'Morris',
    'Morales',
    'Murphy',
    'Cook',
    'Rogers',
    'Gutierrez',
    'Ortiz',
    'Morgan',
    'Cooper',
    'Peterson',
    'Bailey',
    'Reed',
    'Kelly',
    'Howard',
    'Ramos',
    'Kim',
    'Cox',
    'Ward',
    'Richardson',
    'Watson',
    'Brooks',
    'Chavez',
    'Wood',
    'James',
    'Bennett',
    'Gray',
    'Mendoza',
    'Ruiz',
    'Hughes',
    'Price',
    'Alvarez',
    'Castillo',
    'Sanders',
    'Patel',
    'Myers',
    'Long',
    'Ross',
    'Foster',
    'Jimenez',
    'Powell',
    'Jenkins',
    'Perry',
    'Russell',
    'Sullivan',
    'Bell',
    'Coleman',
    'Butler',
    'Henderson',
    'Barnes',
    'Fisher',
    'Vasquez',
    'Simmons',
    'Romero',
];

const generateUsers = (count: number) =>
    Array.from({ length: count }, (_, i) => {
        const id = i + 1;
        const first = FIRST_NAMES[id % FIRST_NAMES.length];
        const last = LAST_NAMES[(id * 7) % LAST_NAMES.length];
        return { label: `${first} ${last}`, value: String(id) };
    });

const Demo = ({
    options,
    caption,
}: {
    options: Array<{ label: string; value: string }>;
    caption: string;
}) => {
    const [state, setState] = useState<FilterItemParams | null | undefined>(
        null,
    );
    const rawBytes = useMemo(
        () =>
            new Blob([
                JSON.stringify({
                    total: options.length,
                    flagCreators: options.map((o) => ({
                        id: Number(o.value),
                        name: o.label,
                    })),
                }),
            ]).size,
        [options],
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {caption} — raw JSON payload {(rawBytes / 1024).toFixed(1)} KB
            </Typography>
            <Box>
                <FilterItem
                    initMode='manual'
                    name='Created by'
                    label='Created by'
                    options={options}
                    state={state}
                    onChange={setState}
                    singularOperators={singularOperators}
                    pluralOperators={pluralOperators}
                    onChipClose={() => setState(null)}
                />
            </Box>
        </Box>
    );
};

export const None: Story = () => (
    <Demo options={generateUsers(0)} caption='No options' />
);

export const One: Story = () => (
    <Demo options={generateUsers(1)} caption='1 option' />
);

export const TenOptions: Story = () => (
    <Demo options={generateUsers(10)} caption='10 options' />
);

export const TwoHundredFiftyOptions: Story = () => (
    <Demo options={generateUsers(250)} caption='250 options' />
);

export const OneThousandOptions: Story = () => (
    <Demo options={generateUsers(1000)} caption='1 000 options' />
);

export const TenThousandOptions: Story = () => (
    <Demo
        options={generateUsers(10000)}
        caption='10 000 options — expect a noticeable freeze when opening the popover without virtualization'
    />
);
