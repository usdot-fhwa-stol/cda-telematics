import axios from 'axios';
import { expect, test } from '@jest/globals';
import { loginUser, deleteUser, updatePassword, registerNewUser, listUsers, updateUserServerAdmin, checkServerSession } from '../../api/api-user';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
    axios.delete.mockResolvedValue(response);
})

test('Search dashboard not throw', async () => {
    await loginUser('username', 'password').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => loginUser('username', 'password')).not.toThrow();
});

test('Get dashboards for a given organization not throw', async () => {
    await deleteUser('username').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => deleteUser('username')).not.toThrow();
});

test('List dashboards for a given event not throw', async () => {
    await updatePassword('username', 'email', 'new_password').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => updatePassword('username', 'email', 'new_password')).not.toThrow();
});

test('Update dashboards that are associated to an event', async () => {
    await registerNewUser('user name', 'email', 'password', 'org id').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => registerNewUser('user name', 'email', 'password', 'org id')).not.toThrowError();
})

test('Delete dashboards that are associated to an event', async () => {
    await listUsers().then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => listUsers()).not.toThrowError();
})

test('Delete dashboards that are associated to an event', async () => {
    await updateUserServerAdmin({}).then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => updateUserServerAdmin({})).not.toThrowError();
})

test('Delete dashboards that are associated to an event', async () => {
    await checkServerSession().then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => checkServerSession()).not.toThrowError();
})

