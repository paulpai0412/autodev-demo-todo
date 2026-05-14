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
    expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/0 total todos/i)).toBeInTheDocument();
    expect(screen.getByText(/0 active todos/i)).toBeInTheDocument();
    expect(screen.getByText(/0 completed todos/i)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: /todo items/i })).toBeInTheDocument();
  });

  it('shows zero progress in the status banner and empty state when there are no todos', () => {
    render(<App />);

    expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/0 total todos/i)).toBeInTheDocument();
    expect(screen.getByText(/0 active todos/i)).toBeInTheDocument();
    expect(screen.getByText(/0 completed todos/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first todo to start moving progress above 0%/i)).toBeInTheDocument();
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
    expect(screen.getByText('Your first todo will appear here once you add it.')).toBeInTheDocument();
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

  it('disables the bulk toggle button when there are no visible todos', async () => {
    const user = userEvent.setup();
    render(<App />);

    const bulkToggleButton = screen.getByRole('button', { name: /mark visible todos complete/i });

    expect(bulkToggleButton).toBeDisabled();

    await user.type(screen.getByLabelText(/todo title/i), 'Completed todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    await user.click(screen.getByRole('checkbox', { name: /completed todo/i }));
    await user.click(screen.getByRole('radio', { name: /^active$/i }));

    expect(bulkToggleButton).toBeDisabled();
    expect(screen.getByText('No active todos found.')).toBeInTheDocument();
  });

  it('bulk toggles only visible todos in all, active, and completed filters and persists the updates', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.type(screen.getByLabelText(/todo title/i), 'First todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    await user.type(screen.getByLabelText(/todo title/i), 'Second todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    await user.type(screen.getByLabelText(/todo title/i), 'Third todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    const bulkToggleButton = screen.getByRole('button', { name: /mark visible todos complete/i });

    await user.click(bulkToggleButton);

    expect(screen.getByRole('checkbox', { name: /first todo/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /second todo/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /third todo/i })).toBeChecked();
    expect(screen.getByText(/3 items · 3 complete/i)).toBeInTheDocument();
    expect(screen.getByText(/0 active todos/i)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /^completed$/i }));
    await user.click(screen.getByRole('button', { name: /mark visible todos active/i }));

    expect(screen.getByText('No completed todos found.')).toBeInTheDocument();
    expect(screen.getByText(/0 items completed/i)).toBeInTheDocument();
    expect(screen.getByText(/3 active todos/i)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /^all$/i }));
    await user.click(screen.getByRole('checkbox', { name: /first todo/i }));
    await user.click(screen.getByRole('radio', { name: /^active$/i }));
    await user.click(screen.getByRole('button', { name: /mark visible todos complete/i }));

    expect(screen.queryByText('Second todo')).not.toBeInTheDocument();
    expect(screen.queryByText('Third todo')).not.toBeInTheDocument();
    expect(screen.getByText(/0 items active/i)).toBeInTheDocument();
    expect(screen.getByText(/3 completed todos/i)).toBeInTheDocument();

    const storedTodos = window.localStorage.getItem('autodev-demo-todos');
    expect(storedTodos).toContain('First todo');
    expect(storedTodos).toContain('"completed":true');

    unmount();
    render(<App />);

    expect(screen.getByRole('checkbox', { name: /first todo/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /second todo/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /third todo/i })).toBeChecked();
  });

  it('switches a todo into edit mode with the current title and saves the trimmed value', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/todo title/i), '  Rename me later  ');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await user.click(screen.getByRole('button', { name: /edit todo: rename me later/i }));

    const editInput = screen.getByLabelText(/edit todo title for rename me later/i);

    expect(editInput).toHaveValue('Rename me later');

    await user.clear(editInput);
    await user.type(editInput, '  Renamed todo  ');
    await user.click(screen.getByRole('button', { name: /save todo: rename me later/i }));

    expect(screen.getByText('Renamed todo')).toBeInTheDocument();
    expect(screen.queryByText('Rename me later')).not.toBeInTheDocument();
  });

  it('cancels edit mode without changing the todo title', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/todo title/i), 'Keep original title');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await user.click(screen.getByRole('button', { name: /edit todo: keep original title/i }));

    const editInput = screen.getByLabelText(/edit todo title for keep original title/i);
    await user.clear(editInput);
    await user.type(editInput, 'Changed but cancelled');
    await user.click(screen.getByRole('button', { name: /cancel edit for keep original title/i }));

    expect(screen.getByText('Keep original title')).toBeInTheDocument();
    expect(screen.queryByText('Changed but cancelled')).not.toBeInTheDocument();
  });

  it('blocks saving an empty edited title and preserves completion state after rename and reload', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.type(screen.getByLabelText(/todo title/i), 'Persist edited todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    const todoToggle = screen.getByRole('checkbox', { name: /persist edited todo/i });
    await user.click(todoToggle);
    expect(todoToggle).toBeChecked();

    await user.click(screen.getByRole('button', { name: /edit todo: persist edited todo/i }));

    const editInput = screen.getByLabelText(/edit todo title for persist edited todo/i);
    const saveButton = screen.getByRole('button', { name: /save todo: persist edited todo/i });

    await user.clear(editInput);
    await user.type(editInput, '   ');

    expect(saveButton).toBeDisabled();

    await user.clear(editInput);
    await user.type(editInput, '  Persisted edited todo  ');
    await user.click(saveButton);

    expect(screen.getByText('Persisted edited todo')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /persisted edited todo/i })).toBeChecked();

    unmount();
    render(<App />);

    expect(screen.getByText('Persisted edited todo')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /persisted edited todo/i })).toBeChecked();
  });

  it('keeps the status banner in sync across add, edit, toggle, delete, and clear flows', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/todo title/i), 'First todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/1 total todo/i)).toBeInTheDocument();
    expect(screen.getByText(/1 active todo/i)).toBeInTheDocument();
    expect(screen.getByText(/0 completed todos/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/todo title/i), 'Second todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/2 total todos/i)).toBeInTheDocument();
    expect(screen.getByText(/2 active todos/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /edit todo: second todo/i }));
    const editInput = screen.getByLabelText(/edit todo title for second todo/i);
    await user.clear(editInput);
    await user.type(editInput, 'Renamed second todo');
    await user.click(screen.getByRole('button', { name: /save todo: second todo/i }));

    expect(screen.getByText(/2 total todos/i)).toBeInTheDocument();
    expect(screen.getByText(/2 active todos/i)).toBeInTheDocument();
    expect(screen.getByText(/0 completed todos/i)).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /first todo/i }));

    expect(screen.getByText(/50% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/2 total todos/i)).toBeInTheDocument();
    expect(screen.getByText(/1 active todo/i)).toBeInTheDocument();
    expect(screen.getByText(/1 completed todo/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove todo: renamed second todo/i }));

    expect(screen.getByText(/100% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/1 total todo/i)).toBeInTheDocument();
    expect(screen.getByText(/0 active todos/i)).toBeInTheDocument();
    expect(screen.getByText(/1 completed todo/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear completed/i }));

    expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/0 total todos/i)).toBeInTheDocument();
    expect(screen.getByText(/0 active todos/i)).toBeInTheDocument();
    expect(screen.getByText(/0 completed todos/i)).toBeInTheDocument();
  });
});
