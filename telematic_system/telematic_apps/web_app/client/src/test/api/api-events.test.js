import { expect, test } from '@jest/globals';
import { deleteEvent, createEvent, findAllEvents, editEvent, assignUnit2Event, unAssignUnit2Event } from '../../api/api-events';

test('Delete an event not throw', async () => {
    await expect(() => deleteEvent('id')).not.toThrow();
});

test('Create an event not throw', async () => {
    await expect(() => createEvent({name: 'event name'})).not.toThrow();
});

test('Find all events not throw', async () => {
    await expect(() => findAllEvents([{event_id:'event id'}])).not.toThrow();
});

test('Edit an event not throw', async () => {
    await expect( () => editEvent({id: 'event id'})).not.toThrowError();
})

test('Assign a unit to an event not throw', async () => {
    let unit = {
        id: 'id'
    }
    let event_unit = {event_id: 'event id', unit : unit};
    await expect( () => assignUnit2Event(event_unit)).not.toThrowError();
})

test('Unassign a unit from an event', async () => {
    let unit = {
        id: 'id'
    }
    let event_unit = {event_id: 'event id', unit : unit};
    await expect( () => unAssignUnit2Event(event_unit)).not.toThrowError();
})