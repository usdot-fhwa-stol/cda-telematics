import axios from 'axios';
import { expect, test } from '@jest/globals';
import { createDefaultTopicsByEventUnits, findAllDefaultTopicsByEventUnits } from '../../api/api-default-event-topics';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
    axios.delete.mockResolvedValue(response);
})

test('Get all default topics for units not throw', async () => {
    await findAllDefaultTopicsByEventUnits('event id', ['unit identifier'], 'user id')
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => findAllDefaultTopicsByEventUnits('event id', ['unit identifier'], 'user id')).not.toThrow();
    await expect(() => findAllDefaultTopicsByEventUnits('event id', [], 'user id')).not.toThrow();
});

test('Save default topics for units not throw', async () => {
    const seletedUnitsTopics = [
        {
            event_id: 'event id',
            unit_identifier: 'unit_identifier'
        }
    ]
    await createDefaultTopicsByEventUnits(seletedUnitsTopics, 'user id')
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => createDefaultTopicsByEventUnits(seletedUnitsTopics, 'user id')).not.toThrow();
    await expect(() => createDefaultTopicsByEventUnits([], 'user id')).not.toThrow();
});