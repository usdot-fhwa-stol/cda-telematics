import { afterAll, afterEach, beforeAll, beforeEach, expect, jest, test } from '@jest/globals';
import { searchDashboards, listEventDashboards, updateEventDashboards, getDashboardsByOrg, deleteEventDashboards } from '../../api/api-dashboards';
import axios from 'axios';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
    axios.delete.mockResolvedValue(response);
})

test('Search dashboard not throw', async () => {
    await searchDashboards('main org', 'search text')
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => searchDashboards('main org', 'search text')).not.toThrow();
});

test('Get dashboards for a given organization not throw', async () => {
    await getDashboardsByOrg('main org')
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => getDashboardsByOrg('main org')).not.toThrow();
});

test('List dashboards for a given event not throw', async () => {
    await listEventDashboards('event id')
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => listEventDashboards('event id')).not.toThrow();
});

test('Update dashboards that are associated to an event', async () => {
    await  updateEventDashboards('event id', 'dashboard id')
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => updateEventDashboards('event id', 'dashboard id')).not.toThrowError();
})

test('Delete dashboards that are associated to an event', async () => {
    await deleteEventDashboards('event id', 'dashboard id')
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => deleteEventDashboards('event id', 'dashboard id')).not.toThrowError();
})
