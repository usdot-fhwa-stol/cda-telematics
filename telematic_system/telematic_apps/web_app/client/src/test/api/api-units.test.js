import axios from 'axios';
import { expect, jest, test } from '@jest/globals';
import { createUnit, findAllUnits } from '../../api/api-units';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
})

test('Create a unit not throw', async () => {
    await createUnit({}).then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => createUnit({})).not.toThrow();
});

test('List all units not throw', async () => {
    await findAllUnits({}).then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => findAllUnits()).not.toThrow();
});