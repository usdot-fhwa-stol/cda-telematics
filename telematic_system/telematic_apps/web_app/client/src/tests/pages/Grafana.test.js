import { test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { BrowserRouter } from 'react-router-dom'
import Grafana from '../../pages/Grafana'

test('Grafana page', async () => {
    await act(async () => {
        render(
            <BrowserRouter>
                <Grafana />
            </BrowserRouter>)
    })
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
})
