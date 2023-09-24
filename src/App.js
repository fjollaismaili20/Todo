import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { AiOutlineDelete } from "react-icons/ai";
import { BsCheckLg } from "react-icons/bs";
import { TbProgress } from "react-icons/tb";

function App() {
  const [selectedScreen, setSelectedScreen] = useState("Todo");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [inProgressTodos, setInProgressTodos] = useState([]);
  const [todos, setTodos] = useState([]); // Initialize todos as an empty array
  const [loading, setLoading] = useState(true); // Initialize loading as true
  const currentTime = new Date().getTime();
  const [allTodos, setAllTodos] = useState(() => {
    const storedTodos = localStorage.getItem("todolist");
    return storedTodos ? JSON.parse(storedTodos) : [];
  });
  const handleAddTodo = () => {
    console.log(currentTime);
    let newTodoItem = {
      title: newTitle,
      description: newDescription,
      createdOn: currentTime,
      characterId: 1,
    };

    setAllTodos([...allTodos, newTodoItem]);
    // console.log(allTodos);
    localStorage.setItem(
      "todolist",
      JSON.stringify([...allTodos, newTodoItem])
    );
    setNewTitle("");
    setNewDescription("");
  };

  const handleDeleteTodo = (index) => {
    let reducedTodo = [...allTodos];
    reducedTodo.splice(index, 1);
    localStorage.setItem("todolist", JSON.stringify(reducedTodo));
    setAllTodos(reducedTodo);
  };

  const handleDeleteCompleted = (index) => {
    let updatedCompletedSection = [...completedTodos];
    updatedCompletedSection.splice(index, 1);
    setCompletedTodos(updatedCompletedSection);
    localStorage.setItem(
      "completedTodos",
      JSON.stringify(updatedCompletedSection)
    );
  };

  const handleDelete = (index, section) => {
    let updatedSection;
    switch (section) {
      case "Todo":
        updatedSection = [...allTodos];
        break;
      case "In Progress":
        updatedSection = [...inProgressTodos];
        break;
      default:
        break;
    }

    updatedSection.splice(index, 1);

    switch (section) {
      case "Todo":
        setAllTodos(updatedSection);
        localStorage.setItem("todolist", JSON.stringify(updatedSection));
        break;
      case "In Progress":
        setInProgressTodos(updatedSection);
        localStorage.setItem("inProgressTodos", JSON.stringify(updatedSection));
        break;
      default:
        break;
    }
  };

  const handleMoveToInProgress = (index) => {
    let selectedItem = allTodos[index];
    let updatedInProgressArr = [...inProgressTodos, selectedItem];
    setInProgressTodos(updatedInProgressArr);
    handleDeleteTodo(index);
    localStorage.setItem(
      "inProgressTodos",
      JSON.stringify(updatedInProgressArr)
    );
  };

  const handleComplete = (index, section) => {
    let filteredItem;
    switch (section) {
      case "Todo":
        filteredItem = {
          ...allTodos[index],
          completed: true,
        };
        handleDelete(index, "Todo");
        setCompletedTodos([...completedTodos, filteredItem]);
        localStorage.setItem(
          "completedTodos",
          JSON.stringify([...completedTodos, filteredItem])
        );
        break;
      case "In Progress":
        filteredItem = {
          ...inProgressTodos[index],
          completed: true,
        };
        handleDelete(index, "In Progress");
        setCompletedTodos([...completedTodos, filteredItem]);
        localStorage.setItem(
          "completedTodos",
          JSON.stringify([...completedTodos, filteredItem])
        );
        break;
      default:
        break;
    }
  };

  const handleRemoveExpiredTasks = () => {
    // Calculate the timestamp for 24 hours ago
    // console.log("current time", currentTime);
    const twentyFourHoursAgo = currentTime - 240000; // 24 hours in milliseconds
    // console.log(typeof twentyFourHoursAgo);
    // Filter tasks in Todo section
    console.log("list before filter:", allTodos);
    if (allTodos.length != 0) {
      const updatedTodoList = allTodos.filter((item) => {
        console.log("item.createdOn:", item.createdOn);
        console.log("twentyFourHoursAgo:", twentyFourHoursAgo);
        if (item.createdOn <= twentyFourHoursAgo) {
          // Keep tasks that are not completed and are older than 24 hours
          console.log("statement is true");
          return true;
        }
        console.log("statement isnt true");
        return false;
      });

      // Filter tasks in In Progress section
      const updatedInProgressList = inProgressTodos.filter((item) => {
        if (!item.completed && item.createdOn <= twentyFourHoursAgo) {
          // Keep tasks that are not completed and are older than 24 hours
          return true;
        }
        return false;
      });

      // Set the updated lists and save them to localStorage
      setAllTodos(updatedTodoList);
      setInProgressTodos(updatedInProgressList);

      // Update localStorage for both lists
      localStorage.setItem("todolist", JSON.stringify(updatedTodoList));
      localStorage.setItem(
        "inProgressTodos",
        JSON.stringify(updatedInProgressList)
      );
    }
  };

  useEffect(() => {
    const savedTodo = JSON.parse(localStorage.getItem("todolist"));
    const savedInProgress = JSON.parse(localStorage.getItem("inProgressTodos"));
    const savedCompletedTodo = JSON.parse(
      localStorage.getItem("completedTodos")
    );

    if (savedTodo) {
      setAllTodos(savedTodo);
    }

    if (savedInProgress) {
      setInProgressTodos(savedInProgress);
    }
    if (savedCompletedTodo) {
      setCompletedTodos(savedCompletedTodo);
    }

    //api

    // Set up a timer to periodically check and remove tasks
    const timer = setInterval(() => {
      handleRemoveExpiredTasks();
    }, 6000); // Check every minute

    return () => clearInterval(timer); // Clear the timer on component unmount
  }, []);

  useEffect(() => {
    const savedTodo = JSON.parse(localStorage.getItem("todolist"));
    const savedInProgress = JSON.parse(localStorage.getItem("inProgressTodos"));
    const savedCompletedTodo = JSON.parse(
      localStorage.getItem("completedTodos")
    );

    if (savedTodo) {
      setAllTodos(savedTodo);
    }

    if (savedInProgress) {
      setInProgressTodos(savedInProgress);
    }
    if (savedCompletedTodo) {
      setCompletedTodos(savedCompletedTodo);
    }
    const fetchDataForTodos = async () => {
      const updatedTodos = await Promise.all(
        allTodos.map(async (todo) => {
          try {
            const response = await axios.get(
              `https://swapi.dev/api/people/${todo.characterId}`
            );
            return { ...todo, characterData: response.data };
          } catch (error) {
            console.error(
              `Error fetching data for task ${todo.characterId}:`,
              error
            );
            return todo;
          }
        })
      );
      setAllTodos(updatedTodos);
      setLoading(false);
    };
    fetchDataForTodos();
  }, [allTodos]);

  return (
    <div className="App">
      <h1>My todo list</h1>
      <div className="todo-wrapper">
        <div className="todo-input">
          <div className="todo-input-item">
            <label>Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What's the task title"
            ></input>
          </div>

          <div className="todo-input-item">
            <label>Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What's the task description"
            ></input>
          </div>

          <div className="todo-input-item">
            <button
              type="button"
              onClick={handleAddTodo}
              className="primaryBtn"
            >
              Add
            </button>
          </div>
        </div>

        <div className="todo-wrapper">
          <div className="btn-area">
            <button
              className={`secondaryBtn ${
                selectedScreen === "Todo" && "active"
              }`}
              onClick={() => setSelectedScreen("Todo")}
            >
              Todo
            </button>
            <button
              className={`secondaryBtn ${
                selectedScreen === "In Progress" && "active"
              }`}
              onClick={() => setSelectedScreen("In Progress")}
            >
              In Progress
            </button>

            <button
              className={`secondaryBtn ${
                selectedScreen === "Completed" && "active"
              }`}
              onClick={() => setSelectedScreen("Completed")}
            >
              Completed
            </button>
          </div>

          <div className="todo-list">
            {selectedScreen === "Todo" &&
              allTodos.map((item, index) => {
                return (
                  <div className="todo-list-item" key={index}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <p>{item.createdOn}</p>
                      <ul>
                        {todos.map((todo, index) => (
                          <li key={index}>{todo.name}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <AiOutlineDelete
                        className="icon"
                        onClick={() => handleDelete(index, "Todo")}
                        title="Delete?"
                      />
                      <TbProgress
                        className="icon"
                        onClick={() => handleMoveToInProgress(index)}
                      />
                      <BsCheckLg
                        className="check-icon"
                        onClick={() => handleComplete(index, "Todo")}
                        title="Complete?"
                      />
                    </div>
                  </div>
                );
              })}

            {selectedScreen === "Completed" &&
              completedTodos.map((item, index) => {
                return (
                  <div className="todo-list-item" key={index}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <p>
                        <small>Completed on: {item.completedOn}</small>
                      </p>
                      <ul>
                        {todos.map((todo, index) => (
                          <li key={index}>{todo.name}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <AiOutlineDelete
                        className="icon"
                        onClick={() => handleDeleteCompleted(index)} // Use the new function
                        title="Delete?"
                      />
                    </div>
                  </div>
                );
              })}

            {selectedScreen === "In Progress" &&
              inProgressTodos.map((item, index) => {
                return (
                  <div className="todo-list-item" key={index}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <ul>
                        {todos.map((todo, index) => (
                          <li key={index}>{todo.name}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <AiOutlineDelete
                        className="icon"
                        onClick={() => handleDelete(index, "In Progress")}
                        title="Delete?"
                      />
                      <BsCheckLg
                        className="check-icon"
                        onClick={() => handleComplete(index, "In Progress")}
                        title="Complete?"
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
