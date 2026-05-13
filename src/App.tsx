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
  const canAddTodo = draft.trim().length > 0;

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

  const clearCompletedTodos = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  };

  const completedCount = todos.filter((todo) => todo.completed).length;

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
                  ? 'Your first todo will appear here.'
                  : `No ${filter} todos found.`}
              </li>
            ) : (
              filteredTodos.map((todo) => (
                <li className={`todo-item${todo.completed ? ' todo-item-complete' : ''}`} key={todo.id}>
                  <span className="todo-bullet" aria-hidden="true" />
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
                    className="todo-remove-button" 
                    onClick={() => removeTodo(todo.id)}
                    aria-label={`Remove todo: ${todo.title}`}
                    title="Remove todo"
                  >
                    ×
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </section>
    </main>
  );
}

export default App;
