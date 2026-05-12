import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Todo app shell', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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

  it('marks a todo complete from the public list flow', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(screen.getByLabelText(/todo title/i), 'Verify complete-todo behavior');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    const todoToggle = screen.getByRole('checkbox', {
      name: /verify complete-todo behavior/i,
    });

    expect(todoToggle).not.toBeChecked();

    await user.click(todoToggle);

    expect(todoToggle).toBeChecked();
  });

  it('reloads persisted todo state from local storage', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.type(screen.getByLabelText(/todo title/i), 'Persist this todo across reloads');
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    await user.click(
      screen.getByRole('checkbox', {
        name: /persist this todo across reloads/i,
      }),
    );

    unmount();
    render(<App />);

    expect(screen.getByText('Persist this todo across reloads')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: /persist this todo across reloads/i,
      }),
    ).toBeChecked();
  });

  it('removes a todo from the list and restores empty state', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/todo title/i), 'Temporary todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByText('Temporary todo')).toBeInTheDocument();
    expect(screen.getByText(/1 item/i)).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: /remove todo/i });
    await user.click(removeButton);

    expect(screen.queryByText('Temporary todo')).not.toBeInTheDocument();
    expect(screen.getByText('Your first todo will appear here.')).toBeInTheDocument();
  });
});
