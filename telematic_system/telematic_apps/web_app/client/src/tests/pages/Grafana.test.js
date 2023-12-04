import { afterEach, jest, test } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import Grafana from '../../pages/Grafana'

test('Forgot password page', async () => {
    await act(async () => {
        render(<Grafana />)
    })

    await act(async () => {
        // fireEvent.load()
    });
})
