import axios from 'axios';
import { expect, test } from '@jest/globals';
import { findAllStates } from '../../api/api-states';

test('List all states not throw', async () => {
    await expect(() => findAllStates()).not.toThrow();
});
