import axios from 'axios';
import { expect, test } from '@jest/globals';
import { createLocation, findAllLocations } from '../../api/api-locations';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
    axios.delete.mockResolvedValue(response);
})

test('Create a location not throw', async () => {
    let location = {}
    await createLocation(location)
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => createLocation(location)).not.toThrow();
});

test('Find all locations not throw', async () => {
    await findAllLocations()
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => findAllLocations()).not.toThrow();
});
