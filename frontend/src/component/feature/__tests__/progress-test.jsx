import React from 'react';

import Progress from '../ProgressWheel';
import renderer from 'react-test-renderer';

jest.mock('@material-ui/core');

test('renders correctly with 15% done no fallback', () => {
    const percent = 15;
    const tree = renderer.create(
        <Progress strokeWidth={15} percentage={percent} isFallback={false} />
    );

    expect(tree).toMatchSnapshot();
});

test('renders correctly with 0% done no fallback', () => {
    const percent = 0;
    const tree = renderer.create(
        <Progress strokeWidth={15} percentage={percent} isFallback={false} />
    );

    expect(tree).toMatchSnapshot();
});

test('renders correctly with 15% done with fallback', () => {
    const percent = 15;
    const tree = renderer.create(
        <Progress strokeWidth={15} percentage={percent} isFallback />
    );

    expect(tree).toMatchSnapshot();
});

test('renders correctly with 0% done with fallback', () => {
    const percent = 0;
    const tree = renderer.create(
        <Progress strokeWidth={15} percentage={percent} isFallback />
    );

    expect(tree).toMatchSnapshot();
});
