import React from "react";
import "./App.css";
import FormulaInput from "./components/formula-input/FormulaInput";

function App() {
  return (
    <div className="app-container">
      <div className="card">
        <h1 className="header">Formula Input</h1>
        <p className="description">
          A powerful formula editor similar to Causal. Type numbers, operators,
          or search for variables.
        </p>

        <FormulaInput />

        <div className="instructions">
          <h3 className="instructions-title">How to use:</h3>
          <ul className="instructions-list">
            <li>Type numbers or operators directly (e.g., 2 + 3)</li>
            <li>
              Type '@' after a space (not next to a character) to fetch
              functions
            </li>
            <li>Use arrow keys to navigate suggestions</li>
            <li>Press Enter to select a suggestion</li>
            <li>Use arrow keys to move between tokens</li>
            <li>Press Backspace to delete a token</li>
            <li>Click on a tag to see options</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
