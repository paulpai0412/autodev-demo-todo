import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Todo app shell', () => {
  it('renders the todo composer and list scaffold', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /todo flow/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/todo title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: /todo items/i })).toBeInTheDocument();
  });

  it('adds a todo from the public form flow', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(screen.getByLabelText(/todo title/i), 'Ship the first tracer bullet');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByText('Ship the first tracer bullet')).toBeInTheDocument();
    expect(screen.getByText(/1 item/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/todo title/i)).toHaveValue('');
  });
});
