import { test, expect, jest, afterEach } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Login from '../../pages/Login'
import { act } from 'react-dom/test-utils'
import * as orgApi from '../../api/api-org'
import * as userApi from '../../api/api-user'

test('Invalid login', async () => {
    await act(async () => {
        render(<Login />)
    })
    jest.spyOn(userApi, 'loginUser').mockResolvedValue({ errCode: 404, errMsg: 'Login failure' });
    await act(async () => {
        fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }))
    })
});

test('Login user page', async () => {
    const orgs = [{
        id: 1,
        version: "1",
        name: "test org",
        created: 1701620657,
        updated: 1701620657
    }]

    const user_orgs = [{
        id: 1,
        org_id: 1,
        user_id: 1,
        role: 'Admin',
        created: 1701620657,
        updated: 1701620657
    }]
    jest.spyOn(orgApi, 'getOrgsByUser').mockResolvedValue(user_orgs);
    jest.spyOn(userApi, 'loginUser').mockResolvedValue({ id: 1 });
    jest.spyOn(orgApi, 'listOrgs').mockResolvedValue(orgs);

    await act(async () => {
        render(<Login />)
    })

    await act(async () => {
        fireEvent.input(screen.getByTestId('username'), {
            target: {
                value: "test",
            }
        });
        fireEvent.input(screen.getByTestId('password'), {
            target: {
                value: "test",
            }
        });
    });

    await act(async () => {
        fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }))
    });
})


afterEach(() => {
    jest.resetAllMocks();
})