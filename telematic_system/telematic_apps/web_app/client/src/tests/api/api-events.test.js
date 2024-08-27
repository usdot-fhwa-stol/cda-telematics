import { expect, test } from '@jest/globals';
import { deleteEvent, createEvent, findAllEvents, editEvent, assignUnit2Event, unAssignUnit2Event } from '../../api/api-events';
import axios from 'axios';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
    axios.delete.mockResolvedValue(response);
    axios.put.mockResolvedValue(response);
})

test('Delete an event not throw', async () => {
    await deleteEvent('id')
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => deleteEvent('id')).not.toThrow();
});

test('Create an event not throw', async () => {
    await createEvent({name: 'event name'})
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => createEvent({name: 'event name'})).not.toThrow();
});

test('Find all events not throw', async () => {
    await findAllEvents([{event_id:'event id'}])
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => findAllEvents([{event_id:'event id'}])).not.toThrow();
});

test('Edit an event not throw', async () => {
    await editEvent({id: 'event id'})
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect( () => editEvent({id: 'event id'})).not.toThrowError();
})

test('Assign a unit to an event not throw', async () => {
    let unit = {
        id: 'id'
    }
    let event_unit = {event_id: 'event id', unit : unit};
    await assignUnit2Event(event_unit)
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect( () => assignUnit2Event(event_unit)).not.toThrowError();
})

test('Unassign a unit from an event', async () => {
    let unit = {
        id: 'id'
    }
    let event_unit = {event_id: 'event id', unit : unit};
    await unAssignUnit2Event(event_unit)
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect( () => unAssignUnit2Event(event_unit)).not.toThrowError();
})