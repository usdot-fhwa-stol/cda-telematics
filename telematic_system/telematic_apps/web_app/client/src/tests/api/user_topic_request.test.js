import axios from 'axios';
import { expect, test } from '@jest/globals';
import { upsertUserTopicRequestForEventUnits, findUserTopicRequestByUserEventUnits, findUsersTopicRequestByEventUnits } from '../../api/user_topic_request';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
})

test('Insert user topic requests not throw', async () => {
    let seletedUnitsTopics = [
        {
            event_id: 'event id',
            unit_identifiers: 'unit_identifier'
        },
        {
            event_id: 'event id 2',
            unit_identifiers: 'unit_identifier 2'
        }
    ]

    await  upsertUserTopicRequestForEventUnits(seletedUnitsTopics, 'user id').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => upsertUserTopicRequestForEventUnits(seletedUnitsTopics, 'user id')).not.toThrow();

    let seletedUnitsTopicsEmpty = []
    await expect(() => upsertUserTopicRequestForEventUnits(seletedUnitsTopicsEmpty, 'user id')).not.toThrow();
});

test('List topic requested by current user for this event and unit', async () => {
    let selectedUnitIdentifiers = ['unit_identifiers'];
    await  findUserTopicRequestByUserEventUnits('event id', selectedUnitIdentifiers, 'user id').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => findUserTopicRequestByUserEventUnits('event id', selectedUnitIdentifiers, 'user id')).not.toThrow();
    await expect(() => findUserTopicRequestByUserEventUnits('event id', [], 'user id')).not.toThrow();
});

test('List topic not requested by current user for this event and unit not throw', async () => {
    let selectedUnitIdentifiers = ['unit_identifiers'];
    await  findUsersTopicRequestByEventUnits(12, selectedUnitIdentifiers, 'user id').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => findUsersTopicRequestByEventUnits(12, selectedUnitIdentifiers, 'user id')).not.toThrow();
    let selectedUnitIdentifiersEmpty = [];
    await expect(() => findUsersTopicRequestByEventUnits(12, selectedUnitIdentifiersEmpty, 'user id')).not.toThrow();
});