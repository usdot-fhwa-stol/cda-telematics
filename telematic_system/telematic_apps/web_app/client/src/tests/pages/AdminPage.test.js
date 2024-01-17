import { expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from 'react';
import { act } from 'react-dom/test-utils';
import * as orgApi from '../../api/api-org';
import * as userApi from '../../api/api-user';
import AuthContext from '../../context/auth-context';
import AdminPage from '../../pages/AdminPage';


test('Admin page', async () => {
    const users = [{
        id: 1,
        last_seen_at: 1701620657,
        is_admin: "yes",
        login: 'test',
        org_id: 1,
        email: 'test@gmail.com'
    }];

    const orgs = [{
        id: 1,
        version: "1",
        name: "test org",
        created: 1701620657,
        updated: 1701620657
    }]

    const orgUsers = [{
        id: 1,
        org_id: 1,
        user_id: 1,
        role: 'Admin',
        created: 1701620657,
        updated: 1701620657
    }]


    jest.spyOn(userApi, "listUsers").mockResolvedValue(users);
    jest.spyOn(orgApi, 'listOrgs').mockResolvedValue(orgs);
    jest.spyOn(orgApi, 'listOrgUsers').mockResolvedValue(orgUsers);

    await act(async () => {
        render(<AuthContext.Provider value={{ is_admin: 1, org_id: 1 }}>
            <AdminPage />
        </AuthContext.Provider>)
    });

    await waitFor(() => {
        expect(screen.getByText(/Is Server Admin/i)).toBeInTheDocument();
        expect(screen.getByText(/test org/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('user-table-open-btn-1'));
    await waitFor(() => {
        expect(screen.getByText(/Update roles and organizations for user/i)).toBeInTheDocument(); 
        expect(screen.getByText(/Server administrators are allowed/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Is Server Admin/i)).not.toBeNull();
        expect(screen.getByTestId('assign-user-to-org')).toBeInTheDocument();
        expect(screen.getByTestId('change-to-admin-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('assign-user-to-org'));
    fireEvent.click(screen.getByTestId('change-to-admin-btn'));
    await waitFor(()=>{
        expect(screen.getByTestId('confirm-change-to-admin-toggle-btn')).toBeInTheDocument();
        expect(screen.getByTestId('YES-aligned')).toBeInTheDocument();
        expect(screen.getByTestId('NO-aligned')).toBeInTheDocument();
    })

    fireEvent.click(screen.getByTestId('confirm-change-to-admin-toggle-btn'));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
});

afterEach(() => {
    jest.clearAllMocks();
});