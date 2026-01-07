import type { Flag } from 'hooks/useUiFlag';
import type { NewInUnleashItem } from './NewInUnleashItems.tsx';
import { shouldBeDisplayed } from './shouldBeDisplayed.ts';

const itemBase: Omit<NewInUnleashItem, 'filter'> = {
    label: '',
    summary: '',
    preview: null,
};

const defaultShouldBeDisplayedProps = {
    isEnterprise: () => false,
    version: '1.0.0',
    isEnabled: () => false,
};

it('Ignores enterprise and flag status checks if those filters are undefined', () => {
    const test = shouldBeDisplayed(defaultShouldBeDisplayedProps);

    const input: NewInUnleashItem = {
        ...itemBase,
        filter: { versionLowerThan: '2.0.0' },
    };

    expect(test(input)).toBe(true);
});

it.each([
    true,
    false,
])('respects enterprise status if the item is marked with enterprise = %s', (enterprise) => {
    const test = shouldBeDisplayed({
        ...defaultShouldBeDisplayedProps,
        isEnterprise: () => enterprise,
    });

    const input: NewInUnleashItem = {
        ...itemBase,
        filter: {
            versionLowerThan: '2.0.0',
            enterpriseOnly: true,
        },
    };

    expect(test(input)).toBe(enterprise);
});

it.each([
    ['greater than', '2.1.0'],
    ['equal to', '2.0.0'],
])('should not display if the current version is %s the `versionLessThan` property', (_, version) => {
    const test = shouldBeDisplayed({
        ...defaultShouldBeDisplayedProps,
        version,
    });

    const input: NewInUnleashItem = {
        ...itemBase,
        filter: { versionLowerThan: '2.0.0' },
    };

    expect(test(input)).toBe(false);
});

it.each([
    true,
    false,
])(`it should respect the flag's evaluation status when the flag is %s`, (flagEnabled) => {
    const test = shouldBeDisplayed({
        ...defaultShouldBeDisplayedProps,
        isEnabled: () => flagEnabled,
    });

    const input: NewInUnleashItem = {
        ...itemBase,
        filter: {
            versionLowerThan: '2.0.0',
            flag: 'flag-name' as Flag,
        },
    };

    expect(test(input)).toBe(flagEnabled);
});
