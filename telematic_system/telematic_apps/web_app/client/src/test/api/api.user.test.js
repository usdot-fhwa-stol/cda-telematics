import axios from 'axios';
import { expect, test } from '@jest/globals';
import { loginUser, deleteUser, updatePassword, registerNewUser, listUsers, updateUserServerAdmin, checkServerSession } from '../../api/api-user';


test('Search dashboard not throw', async () => {
    await expect(() => loginUser('username', 'password')).not.toThrow();
});

test('Get dashboards for a given organization not throw', async () => {
    await expect(() => deleteUser('username')).not.toThrow();
});

test('List dashboards for a given event not throw', async () => {
    await expect(() => updatePassword('username', 'email', 'new_password')).not.toThrow();
});

test('Update dashboards that are associated to an event', async () => {
    await expect(() => registerNewUser('user name', 'email', 'password', 'org id')).not.toThrowError();
})

test('Delete dashboards that are associated to an event', async () => {
    await expect(() => listUsers()).not.toThrowError();
})

test('Delete dashboards that are associated to an event', async () => {
    await expect(() => updateUserServerAdmin({})).not.toThrowError();
})

test('Delete dashboards that are associated to an event', async () => {
    await expect(() => checkServerSession()).not.toThrowError();
})

