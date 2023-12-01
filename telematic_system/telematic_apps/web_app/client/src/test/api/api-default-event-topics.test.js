import axios from 'axios';
import { expect, test } from '@jest/globals';
import { createDefaultTopicsByEventUnits, findAllDefaultTopicsByEventUnits } from '../../api/api-default-event-topics';

test('Search dashboard not throw', async () => {
    await expect(() => findAllDefaultTopicsByEventUnits('event id', [], 'user id')).not.toThrow();
});

test('Get dashboards for a given organization not throw', async () => {
    await expect(() => createDefaultTopicsByEventUnits([], 'user id')).not.toThrow();
});