import { useState } from 'react';

import './App.css';

function App() {
  const [draft, setDraft] = useState('');
  const [todos, setTodos] = useState<string[]>([]);

  const addTodo = () => {
    const nextTodo = draft.trim();

    if (!nextTodo) {
      return;
    }

    setTodos((currentTodos) => [...currentTodos, nextTodo]);
    setDraft('');
  };

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
            <span className="list-count">{todos.length} item{todos.length === 1 ? '' : 's'}</span>
          </div>
          <ul aria-label="Todo items" className="todo-list">
            {todos.length === 0 ? (
              <li className="todo-empty-state">Your first todo will appear here.</li>
            ) : (
              todos.map((todo) => (
                <li className="todo-item" key={todo}>
                  <span className="todo-bullet" aria-hidden="true" />
                  <span>{todo}</span>
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
