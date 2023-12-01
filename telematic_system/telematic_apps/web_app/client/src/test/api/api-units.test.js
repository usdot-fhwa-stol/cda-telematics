import axios from 'axios';
import { expect, test } from '@jest/globals';
import { createUnit, findAllUnits } from '../../api/api-units';

test('Create a unit not throw', async () => {
    await expect(() => createUnit({})).not.toThrow();
});

test('List all units not throw', async () => {
    await expect(() => findAllUnits()).not.toThrow();
});