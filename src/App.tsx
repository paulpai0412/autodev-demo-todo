import { useEffect, useState } from 'react';

import './App.css';

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

const TODOS_STORAGE_KEY = 'autodev-demo-todos';

const loadTodos = (): Todo[] => {
  const storedTodos = window.localStorage.getItem(TODOS_STORAGE_KEY);

  if (!storedTodos) {
    return [];
  }

  try {
    const parsedTodos = JSON.parse(storedTodos) as Todo[];

    return parsedTodos.filter((todo) => typeof todo.title === 'string' && typeof todo.completed === 'boolean');
  } catch {
    return [];
  }
};

type FilterType = 'all' | 'active' | 'completed';

function App() {
  const [draft, setDraft] = useState('');
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const canAddTodo = draft.trim().length > 0;
  const canSaveEditedTodo = editingTitle.trim().length > 0;

  useEffect(() => {
    window.localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const nextTodo = draft.trim();

    if (!canAddTodo) {
      return;
    }

    setTodos((currentTodos) => [
      ...currentTodos,
      {
        id: crypto.randomUUID(),
        title: nextTodo,
        completed: false,
      },
    ]);
    setDraft('');
  };

  const toggleTodo = (id: string) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    );
  };

  const removeTodo = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  const startEditingTodo = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingTitle(todo.title);
  };

  const saveEditedTodo = (id: string) => {
    const nextTitle = editingTitle.trim();

    if (!nextTitle) {
      return;
    }

    setTodos((currentTodos) =>
      currentTodos.map((todo) => (todo.id === id ? { ...todo, title: nextTitle } : todo)),
    );
    setEditingTodoId(null);
    setEditingTitle('');
  };

  const cancelEditingTodo = () => {
    setEditingTodoId(null);
    setEditingTitle('');
  };

  const clearCompletedTodos = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;
  const activeCount = totalCount - completedCount;
  const completionPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <main className="app-shell">
      <section className="todo-panel">
        <div className="hero-copy">
          <p className="eyebrow">Autodev demo</p>
          <h1>Todo flow</h1>
          <p className="subtitle">The first visible tracer bullet for the demo project.</p>
        </div>

        <form
          className="todo-form"
          onSubmit={(event) => {
            event.preventDefault();
            addTodo();
          }}
        >
          <label className="field-label" htmlFor="todo-title">
            Todo title
          </label>
          <div className="composer-row">
            <input
              id="todo-title"
              name="todo-title"
              placeholder="Draft the first tracer bullet"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="button" onClick={addTodo} disabled={!canAddTodo}>
              Add todo
            </button>
          </div>
        </form>

        <section className="todo-list-section" aria-labelledby="todo-list-heading">
          <section className="status-banner" aria-label="Todo progress summary">
            <div className="status-banner-copy">
              <p className="status-banner-label">Status banner</p>
              <div>
                <strong>{completionPercent}% complete</strong>
                <p>
                  {totalCount === 0
                    ? 'Add your first todo to start moving progress above 0%.'
                    : `${completedCount} of ${totalCount} todos completed so far.`}
                </p>
              </div>
            </div>
            <dl className="status-banner-metrics">
              <div>
                <dt>Total todos</dt>
                <dd>
                  {totalCount} total todo{totalCount === 1 ? '' : 's'}
                </dd>
              </div>
              <div>
                <dt>Active todos</dt>
                <dd>
                  {activeCount} active todo{activeCount === 1 ? '' : 's'}
                </dd>
              </div>
              <div>
                <dt>Completed todos</dt>
                <dd>
                  {completedCount} completed todo{completedCount === 1 ? '' : 's'}
                </dd>
              </div>
            </dl>
          </section>

          <div className="list-header">
            <h2 id="todo-list-heading">Current list</h2>
            <div className="filter-controls" role="radiogroup" aria-label="Todo filters">
              <label>
                <input
                  type="radio"
                  name="filter"
                  value="all"
                  checked={filter === 'all'}
                  onChange={() => setFilter('all')}
                />
                All
              </label>
              <label>
                <input
                  type="radio"
                  name="filter"
                  value="active"
                  checked={filter === 'active'}
                  onChange={() => setFilter('active')}
                />
                Active
              </label>
              <label>
                <input
                  type="radio"
                  name="filter"
                  value="completed"
                  checked={filter === 'completed'}
                  onChange={() => setFilter('completed')}
                />
                Completed
              </label>
            </div>
            <span className="list-count">
              {filter === 'all' && (
                <>{todos.length} item{todos.length === 1 ? '' : 's'}{todos.length > 0 ? ` · ${completedCount} complete` : ''}</>
              )}
              {filter === 'active' && (
                <>{filteredTodos.length} item{filteredTodos.length === 1 ? '' : 's'} active</>
              )}
              {filter === 'completed' && (
                <>{filteredTodos.length} item{filteredTodos.length === 1 ? '' : 's'} completed</>
              )}
            </span>
          </div>
          {completedCount > 0 ? (
            <button type="button" className="clear-completed-button" onClick={clearCompletedTodos}>
              Clear completed
            </button>
          ) : null}
          <ul aria-label="Todo items" className="todo-list">
            {filteredTodos.length === 0 ? (
              <li className="todo-empty-state">
                {filter === 'all'
                  ? 'Your first todo will appear here once you add it.'
                  : `No ${filter} todos found.`}
              </li>
            ) : (
              filteredTodos.map((todo) => {
                const isEditing = editingTodoId === todo.id;

                return (
                  <li className={`todo-item${todo.completed ? ' todo-item-complete' : ''}`} key={todo.id}>
                    <span className="todo-bullet" aria-hidden="true" />
                    {isEditing ? (
                      <form
                        className="todo-edit-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          saveEditedTodo(todo.id);
                        }}
                      >
                        <label className="todo-edit-label" htmlFor={`todo-edit-${todo.id}`}>
                          Edit todo title for {todo.title}
                        </label>
                        <input
                          id={`todo-edit-${todo.id}`}
                          value={editingTitle}
                          onChange={(event) => setEditingTitle(event.target.value)}
                        />
                        <button type="submit" disabled={!canSaveEditedTodo} aria-label={`Save todo: ${todo.title}`}>
                          Save
                        </button>
                        <button type="button" onClick={cancelEditingTodo} aria-label={`Cancel edit for ${todo.title}`}>
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <label className="todo-item-label">
                          <input
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                            type="checkbox"
                          />
                          <span>{todo.title}</span>
                        </label>
                        <button
                          type="button"
                          className="todo-edit-button"
                          onClick={() => startEditingTodo(todo)}
                          aria-label={`Edit todo: ${todo.title}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="todo-remove-button"
                          onClick={() => removeTodo(todo.id)}
                          aria-label={`Remove todo: ${todo.title}`}
                          title="Remove todo"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </section>
      </section>
    </main>
  );
}

export default App;
