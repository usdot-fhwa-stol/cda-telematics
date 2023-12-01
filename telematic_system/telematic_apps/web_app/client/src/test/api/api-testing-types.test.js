import { expect, test } from '@jest/globals';
import { findAllTestingTypes } from '../../api/api-testing-types';

test('Find all testing types not throw', async () => {
    await expect(() => findAllTestingTypes()).not.toThrow();
});
