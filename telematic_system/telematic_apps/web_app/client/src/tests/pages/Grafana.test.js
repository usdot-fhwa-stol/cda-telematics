import { test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../../pages/Dashboard'

test('Dashboard page', async () => {
    await act(async () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>)
    })
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
})
