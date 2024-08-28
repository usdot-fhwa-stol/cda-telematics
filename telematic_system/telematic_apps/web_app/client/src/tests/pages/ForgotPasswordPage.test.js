import { test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ForgetPasswordPage from '../../pages/ForgetPasswordPage';

test('Forgot password page', async () => {
    await act(async () => {
        render(<ForgetPasswordPage />)
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

        fireEvent.input(screen.getByTestId('new_password'), {
            target: {
                value: "test",
            }
        });

        fireEvent.input(screen.getByTestId('email'), {
            target: {
                value: "test",
            }
        });
    });
})
