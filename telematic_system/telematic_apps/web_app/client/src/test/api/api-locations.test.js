import axios from 'axios';
import { expect, test } from '@jest/globals';
import { createLocation, findAllLocations } from '../../api/api-locations';

test('Create a location not throw', async () => {
    let location = {}
    await expect(() => createLocation(location)).not.toThrow();
});

test('Find all locations not throw', async () => {
    await expect(() => findAllLocations()).not.toThrow();
});
