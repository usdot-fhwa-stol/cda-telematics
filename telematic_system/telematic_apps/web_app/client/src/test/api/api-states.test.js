import axios from 'axios';
import { expect, test } from '@jest/globals';
import { findAllStates } from '../../api/api-states';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
})

test('List all states not throw', async () => {
    await findAllStates()
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => findAllStates()).not.toThrow();
});
