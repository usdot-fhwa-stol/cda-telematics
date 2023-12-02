import axios from 'axios';
import { expect, test } from '@jest/globals';
import { listOrgs, listOrgUsers, addOrgUser, updateOrgUser, deleteOrgUser, getUserRole, getOrgsByUser } from '../../api/api-org';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
    axios.delete.mockResolvedValue(response);
})

test('List all organizations not throw', async () => {
    await listOrgs()
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => listOrgs()).not.toThrow();
});

test('List all organization users not throw', async () => {
    await listOrgUsers()
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => listOrgUsers()).not.toThrow();
});

test('Add a user to an organization not throw', async () => {
    await addOrgUser({})
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => addOrgUser({})).not.toThrow();
});

test('Update an organization user', async () => {
    await updateOrgUser({})
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => updateOrgUser({})).not.toThrowError();
})

test('Delete an organization user', async () => {
    await deleteOrgUser({org_id: 'org_id',user_id:'user_id'})
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => deleteOrgUser({org_id: 'org_id',user_id:'user_id'})).not.toThrowError();
    await expect(() => deleteOrgUser({})).not.toThrowError();
})

test('Get an organization user role', async () => {
    await getUserRole({})
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => getUserRole({})).not.toThrowError();
})


test('Get organizations this user belong to', async () => {
    await getOrgsByUser('user id')
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    await expect(() => getOrgsByUser('user id')).not.toThrowError();
})