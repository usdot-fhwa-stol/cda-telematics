import axios from 'axios';
import { expect, test } from '@jest/globals';
import { listOrgs, listOrgUsers, addOrgUser, updateOrgUser, deleteOrgUser, getUserRole, getOrgsByUser } from '../../api/api-org';

test('List all organizations not throw', async () => {
    await expect(() => listOrgs()).not.toThrow();
});

test('List all organization users not throw', async () => {
    await expect(() => listOrgUsers()).not.toThrow();
});

test('Add a user to an organization not throw', async () => {
    await expect(() => addOrgUser({})).not.toThrow();
});

test('Update an organization user', async () => {
    await expect( () => updateOrgUser({})).not.toThrowError();
})

test('Delete an organization user', async () => {
    await expect( () => deleteOrgUser({})).not.toThrowError();
})

test('Get an organization user role', async () => {
    await expect( () => getUserRole({})).not.toThrowError();
})


test('Get organizations this user belong to', async () => {
    await expect( () => getOrgsByUser('user id')).not.toThrowError();
})