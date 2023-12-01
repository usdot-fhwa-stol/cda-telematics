import { expect, test } from '@jest/globals';
import { getAvailableLiveTopicsByEventUnits, requestSelectedLiveUnitsTopics } from '../../api/api-topics';

test('Search dashboard not throw', async () => {
    let selectedUnitIdentifiers = [{ unit_identifier: 'unit_id' }];
    await expect(() => getAvailableLiveTopicsByEventUnits(selectedUnitIdentifiers)).not.toThrow();
});

test('Get dashboards for a given organization not throw', async () => {
    let selectedUnitTopcis = [
        {
            unit_identifier: 'unit_identifier',
            unit_name: 'unit_name',
            unit_topics: [{
                topics: [{ name: 'topic1' }]
            }]
        }];
    await expect(() => requestSelectedLiveUnitsTopics(selectedUnitTopcis)).not.toThrow();
});
