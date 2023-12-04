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

test('Login user not throw', async () => {
    await loginUser('username', 'password').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => loginUser('username', 'password')).not.toThrow();
});

test('Delete a user not throw', async () => {
    await deleteUser('username').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => deleteUser('username')).not.toThrow();
});

test('Update password not throw', async () => {
    await updatePassword('username', 'email', 'new_password').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => updatePassword('username', 'email', 'new_password')).not.toThrow();
});

test('Register a user', async () => {
    await registerNewUser('user name', 'email', 'password', 'org id').then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => registerNewUser('user name', 'email', 'password', 'org id')).not.toThrowError();
})

test('List all users', async () => {
    await listUsers().then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => listUsers()).not.toThrowError();
})

test('Update user permission to server admin', async () => {
    await updateUserServerAdmin({}).then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => updateUserServerAdmin({})).not.toThrowError();
})

test('Check if server session is established', async () => {
    await checkServerSession().then(data=>expect(data).toEqual({status: 'success'}));
    jest.resetAllMocks();
    await expect(() => checkServerSession()).not.toThrowError();
})

