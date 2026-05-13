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

    const input = screen.getByLabelText(/todo title/i);
    const addButton = screen.getByRole('button', { name: /add todo/i });

    expect(addButton).toBeDisabled();

    await user.type(input, '   ');

    expect(addButton).toBeDisabled();

    await user.type(input, 'Ship the first tracer bullet   ');

    expect(addButton).toBeEnabled();

    await user.click(addButton);

    expect(screen.getByText('Ship the first tracer bullet')).toBeInTheDocument();
    expect(screen.getByText(/1 item/i)).toBeInTheDocument();
    expect(input).toHaveValue('');
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

  it('filters todos by all, active, and completed', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/todo title/i), 'Active todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    await user.type(screen.getByLabelText(/todo title/i), 'Completed todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await user.click(screen.getByRole('checkbox', { name: /completed todo/i }));

    // By default, All is selected, so both should be visible
    expect(screen.getByText('Active todo')).toBeInTheDocument();
    expect(screen.getByText('Completed todo')).toBeInTheDocument();

    // Select Active filter
    await user.click(screen.getByRole('radio', { name: /^active$/i }));
    expect(screen.getByText('Active todo')).toBeInTheDocument();
    expect(screen.queryByText('Completed todo')).not.toBeInTheDocument();
    expect(screen.getByText(/1 item active/i)).toBeInTheDocument();

    // Select Completed filter
    await user.click(screen.getByRole('radio', { name: /^completed$/i }));
    expect(screen.queryByText('Active todo')).not.toBeInTheDocument();
    expect(screen.getByText('Completed todo')).toBeInTheDocument();
    expect(screen.getByText(/1 item completed/i)).toBeInTheDocument();

    // Select All filter
    await user.click(screen.getByRole('radio', { name: /^all$/i }));
    expect(screen.getByText('Active todo')).toBeInTheDocument();
    expect(screen.getByText('Completed todo')).toBeInTheDocument();
  });

  it('clears completed todos, updates persistence, and keeps filter counts coherent', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    expect(screen.queryByRole('button', { name: /clear completed/i })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/todo title/i), 'Keep me active');
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    await user.type(screen.getByLabelText(/todo title/i), 'Clear me');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.queryByRole('button', { name: /clear completed/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /clear me/i }));

    const clearCompletedButton = screen.getByRole('button', { name: /clear completed/i });
    const activeFilter = screen.getByRole('radio', { name: /^active$/i });

    expect(clearCompletedButton).toBeInTheDocument();

    await user.click(activeFilter);

    expect(screen.getByText(/1 item active/i)).toBeInTheDocument();

    await user.click(clearCompletedButton);

    expect(screen.queryByText('Clear me')).not.toBeInTheDocument();
    expect(screen.getByText('Keep me active')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear completed/i })).not.toBeInTheDocument();
    expect(activeFilter).toBeChecked();
    expect(screen.getByText(/1 item active/i)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /^completed$/i }));

    expect(screen.getByText(/0 items completed/i)).toBeInTheDocument();
    expect(screen.getByText('No completed todos found.')).toBeInTheDocument();

    const storedTodos = window.localStorage.getItem('autodev-demo-todos');
    expect(storedTodos).toContain('Keep me active');
    expect(storedTodos).not.toContain('Clear me');

    unmount();
    render(<App />);

    expect(screen.getByText('Keep me active')).toBeInTheDocument();
    expect(screen.queryByText('Clear me')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear completed/i })).not.toBeInTheDocument();
  });
});
