import { fireEvent, render, screen } from '@testing-library/react';
import AuthContext, { AuthContextProvider } from "../../context/auth-context";
import { expect, test } from '@jest/globals';
import React, { useContext, useEffect } from 'react';

test("Auth context login", () => {
    const TestContextComponent = () => {
        const authCtx = useContext(AuthContext);
        return (<React.Fragment>
            {authCtx.sessionToken !== null && <p>Logged In </p>}
            {authCtx.sessionToken !== null && <p>{authCtx.role}</p>}
            {authCtx.sessionToken !== null && <p>{authCtx.org_name} </p>}
            {authCtx.sessionToken === null && <p>Log out</p>}
            <button onClick={() => { authCtx.login(1, 'test user name', 'session token', 1000,'email', 'last seen at', 1, 'org name', false) }}>login</button>
            <button onClick={() => { authCtx.logout() }}>logout</button>
            <button onClick={() => { authCtx.login(1, undefined, undefined, 'email', 'last seen at', 1, 'org name', false) }}>invalid login</button>
            <button onClick={() => { authCtx.updateRole('viewer') }}>update role</button>
            <button onClick={() => { authCtx.updateOrg(1, 'org name updated') }}>update org</button>

        </React.Fragment>)
    }
    render(<AuthContextProvider>
        <TestContextComponent />
    </AuthContextProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'login' }));
    expect(screen.getByText('Logged In')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'update org' }));
    expect(screen.getByText('org name updated')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'update role' }));
    expect(screen.getByText('viewer')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));
    expect(screen.getByText('Log out')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'invalid login' }));
    expect(screen.getByText('Log out')).toBeInTheDocument();

})