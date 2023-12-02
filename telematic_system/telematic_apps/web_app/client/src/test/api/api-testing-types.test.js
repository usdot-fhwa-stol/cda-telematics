import { expect, test } from '@jest/globals';
import { findAllTestingTypes } from '../../api/api-testing-types';

import axios from 'axios';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
})
test('Find all testing types not throw', async () => {    
    await findAllTestingTypes()
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => findAllTestingTypes()).not.toThrow();
});
