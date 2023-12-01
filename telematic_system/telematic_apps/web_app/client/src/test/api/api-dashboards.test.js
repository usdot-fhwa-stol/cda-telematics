import { expect, test } from '@jest/globals';
import { searchDashboards, listEventDashboards, updateEventDashboards, getDashboardsByOrg, deleteEventDashboards } from '../../api/api-dashboards';

test('Search dashboard not throw', async () => {
    await expect(() => searchDashboards('main org', 'search text')).not.toThrow();
});

test('Get dashboards for a given organization not throw', async () => {
    await expect(() => getDashboardsByOrg('main org')).not.toThrow();
});

test('List dashboards for a given event not throw', async () => {
    await expect(() => listEventDashboards('event id')).not.toThrow();
});

test('Update dashboards that are associated to an event', async () => {
    await expect( () => updateEventDashboards('event id', 'dashboard id')).not.toThrowError();
})

test('Delete dashboards that are associated to an event', async () => {
    await expect( () => deleteEventDashboards('event id', 'dashboard id')).not.toThrowError();
})