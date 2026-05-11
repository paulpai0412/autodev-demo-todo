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

function App() {
  const [draft, setDraft] = useState('');
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());

  useEffect(() => {
    window.localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const nextTodo = draft.trim();

    if (!nextTodo) {
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

  const completedCount = todos.filter((todo) => todo.completed).length;

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
            <button type="button" onClick={addTodo}>
              Add todo
            </button>
          </div>
        </form>

        <section className="todo-list-section" aria-labelledby="todo-list-heading">
          <div className="list-header">
            <h2 id="todo-list-heading">Current list</h2>
            <span className="list-count">
              {todos.length} item{todos.length === 1 ? '' : 's'}
              {todos.length > 0 ? ` · ${completedCount} complete` : ''}
            </span>
          </div>
          <ul aria-label="Todo items" className="todo-list">
            {todos.length === 0 ? (
              <li className="todo-empty-state">Your first todo will appear here.</li>
            ) : (
              todos.map((todo) => (
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
