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
  // const [loading, setLoading] = useState(true); // Initialize loading as true
  const currentTime = new Date().getTime();
  const [allTodos, setAllTodos] = useState(() => {
    const storedTodos = localStorage.getItem("todolist");
    return storedTodos ? JSON.parse(storedTodos) : [];
  });
  const [users, setUsers] = useState([]);
  const [usedUserIds, setUsedUserIds] = useState([]);

  const handleAddTodo = async () => {
    if (newTitle.trim() === "") {
      // Check if the title is empty or contains only whitespace
      alert("Title cannot be empty");
      return;
    }

    const user = await fetchUserForTask(allTodos.length + 1); // Get a user for the new task

    if (user) {
      let newTodoItem = {
        title: newTitle,
        description: newDescription,
        createdOn: currentTime,
        user: user, // Include the user in the task data
      };

      setAllTodos((prevTodos) => [...prevTodos, newTodoItem]);

      // Update localStorage after the state has been updated
      localStorage.setItem(
        "todolist",
        JSON.stringify([...allTodos, newTodoItem])
      );

      setNewTitle("");
      setNewDescription("");
    } else {
      // Handle the case where fetching a user failed
      // You can display an error message or handle it as needed
    }
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

  const handleDeleteTodo = (index) => {
    let updatedTodoList = [...allTodos];
    updatedTodoList.splice(index, 1);

    setAllTodos(updatedTodoList);
    localStorage.setItem("todolist", JSON.stringify(updatedTodoList));
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
    if (selectedScreen === "Todo") {
      // Calculate the timestamp for 24:15 of the next day (12:15 AM of the next day)
      const endOfNextDay = new Date();
      endOfNextDay.setDate(endOfNextDay.getDate() + 1); // Move to the next day
      endOfNextDay.setHours(24, 15, 0, 0); // Set to 24:15

      const endOfNextDayTimestamp = endOfNextDay.getTime();

      console.log("Current Time:", currentTime);
      console.log("End of Next Day Timestamp:", endOfNextDayTimestamp);

      // Filter tasks in Todo section
      const updatedTodoList = allTodos.filter((item) => {
        if (!item.completed && item.createdOn <= endOfNextDayTimestamp) {
          console.log("Removing Todo:", item);
          return false;
        }
        return true;
      });

      console.log("Updated Todo List:", updatedTodoList);

      // Set the updated list and save it to localStorage
      setAllTodos(updatedTodoList);
      localStorage.setItem("todolist", JSON.stringify(updatedTodoList));
    }
  };

  // Call handleRemoveExpiredTasks when the component mounts and when the selectedScreen changes to "Todo"

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
  }, []);

  const fetchUserForTask = async (taskId) => {
    try {
      const response = await axios.get(
        `https://swapi.dev/api/people/${taskId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching user for task ${taskId}:`, error);
      return null;
    }
  };

  // Function to attach a random user to a task
  const attachRandomUserToTask = (task) => {
    const availableUsers = users.filter(
      (user) => !usedUserIds.includes(user.id)
    );

    if (availableUsers.length === 0) {
      // Reset usedUserIds when all users have been assigned
      setUsedUserIds([]);
    }

    const randomUser =
      availableUsers[Math.floor(Math.random() * availableUsers.length)];
    setUsedUserIds((prevUsedUserIds) => [...prevUsedUserIds, randomUser.id]);

    return { ...task, user: randomUser };
  };

  //api
  useEffect(() => {
    // Fetch users from the API when the component mounts
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://swapi.dev/api/people");
        setUsers(response.data.results);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

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
                      <p>User: {item.user ? item.user.name : "Unknown"}</p>{" "}
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
                        <small>Completed on: {item.createdOn}</small>
                      </p>
                      <p>User: {item.user ? item.user.name : "Unknown"}</p>{" "}
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
                      <p>User: {item.user ? item.user.name : "Unknown"}</p>{" "}
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
