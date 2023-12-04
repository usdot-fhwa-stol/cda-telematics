import { test, expect, jest, afterEach } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import RegisterUser from '../../components/users/RegisterUser'
import { act } from 'react-dom/test-utils'
import * as orgApi from '../../api/api-org'
import * as userApi from '../../api/api-user'

test('Register user page', async () => {
    const orgs = [{
        id: 1,
        version: "1",
        name: "test org",
        created: 1701620657,
        updated: 1701620657
    }]
    jest.spyOn(orgApi, 'listOrgs').mockResolvedValue(orgs);
    jest.spyOn(userApi, 'registerNewUser').mockResolvedValue({ status: 'success' });

    await act(async () => {
        render(<RegisterUser />)
    })

    await act(async () => {
        fireEvent.input(screen.getByTestId('username'), {
            target: {
                value: "test",
            }
        });
        fireEvent.input(screen.getByTestId('email'), {
            target: {
                value: "test@email.com",
            }
        });
        fireEvent.input(screen.getByTestId('password'), {
            target: {
                value: "test",
            }
        });    
    });
})

afterEach(()=>{
    jest.resetAllMocks();
})