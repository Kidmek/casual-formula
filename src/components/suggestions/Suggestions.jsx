import { useState, useEffect } from "react";
import "./suggestions.css";

const Suggestions = ({ items, command }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = items[index];
    if (item) command({ id: item.id, label: item.name, data: item });
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      event.preventDefault();
      return true;
    }
    if (event.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev + 1) % items.length);
      event.preventDefault();
      return true;
    }
    if (event.key === "Enter") {
      selectItem(selectedIndex);
      event.preventDefault();
      return true;
    }
    return false;
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selectedIndex]);

  return items.length ? (
    <div className="suggestions">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`suggestion ${index === selectedIndex ? "selected" : ""}`}
          onClick={() => selectItem(index)}
        >
          {item.name}
        </div>
      ))}
    </div>
  ) : null;
};

export default Suggestions;
