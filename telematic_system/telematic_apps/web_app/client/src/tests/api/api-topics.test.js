import { expect, test } from '@jest/globals';
import { getAvailableLiveTopicsByEventUnits, requestSelectedLiveUnitsTopics } from '../../api/api-topics';
import axios from 'axios';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
})

test('Get available topics for each event and their units not throw', async () => {
    let selectedUnitIdentifiers = [{ unit_identifier: 'unit_id' }];
    await getAvailableLiveTopicsByEventUnits(selectedUnitIdentifiers)
        .then(data => expect(data).toEqual([{ status: 'success' }]));
    jest.resetAllMocks();
    await expect(() => getAvailableLiveTopicsByEventUnits(selectedUnitIdentifiers)).not.toThrow();
});

test('Request selected topics for selected units not throw', async () => {
    let selectedUnitTopcis = [
        {
            unit_identifier: 'unit_identifier',
            unit_name: 'unit_name',
            unit_topics: [{
                topics: [{ name: 'topic1' }]
            }]
        }];
    await requestSelectedLiveUnitsTopics(selectedUnitTopcis)
        .then(data => expect(data).not.toBeNull());
    jest.resetAllMocks();
    await expect(() => requestSelectedLiveUnitsTopics(selectedUnitTopcis)).not.toThrow();
});
