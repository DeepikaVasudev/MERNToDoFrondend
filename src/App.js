import "./styles.css";
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const fetchTask = async (token) => {
    const response = await fetch(
      "https://merntodobackend-n74h.onrender.com/tasks",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    console.log("Fetched tasks:", data);

    setTasks(Array.isArray(data) ? data : data.tasks || []);
  };

  useEffect(() => {
    if (token) fetchTask(token);
  }, [token]);

  //logout
  const logOut = () => {
    setToken("");
    localStorage.removeItem("token");
    setTasks([]);
  };

  const addTasks = async (text) => {
    const response = await fetch(
      "https://merntodobackend-n74h.onrender.com/tasks",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, status: "pending", priority: "medium" }),
      }
    );
    const newTask = await response.json();
    setTasks([...tasks, newTask]);
  };

  const deleteTask = async (id) => {
    await fetch(`https://merntodobackend-n74h.onrender.com/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setTasks(tasks.filter((task) => task._id !== id));
  };

  const updateTaskStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    const response = await fetch(
      `https://merntodobackend-n74h.onrender.com/tasks/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
  };

  const updateTaskPriority = async (id, newPriority) => {
    const response = await fetch(
      `https://merntodobackend-n74h.onrender.com/tasks/${id}/priority`,
      {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      }
    );
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
  };

  const filterTask = tasks.filter(
    (task) =>
      (filterStatus === "all" || task.status === filterStatus) &&
      (filterPriority === "all" || task.priority === filterPriority)
  );

  const MainApp = () => (
    <div className="min-h-screen bg-pink-50 flex flex-col">
      <nav className="bg-pink-500 text-white px-6 py-4 flex justify-between items-center ">
        <ul className="flex space-x-4">
          <li>
            <a
              href="#"
              className="px-4 py-2 rounded-full font-semibold transition-colors duration-200 hover:bg-pink-600 hover:text-white focus:bg-pink-700 focus:outline-none shadow-sm"
            >
              Home
            </a>
          </li>
        </ul>
        <button
          onClick={logOut}
          className="px-4 py-2 rounded-full font-semibold transition-colors duration-200 hover:bg-pink-600 hover:text-white focus:bg-pink-700 focus:outline-none shadow-sm"
        >
          LogOut
        </button>
      </nav>
      <main className="flex-1 p=8">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-pink-800 drop-shadow ">
          MERN To-Do App
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTasks(e.target[0].value);
            e.target[0].value = "";
          }}
          className="mb-6 flex gap-2 justify-center"
        >
          <input
            type="text"
            className="p-3 border-2 border-pink-300 rounded-lg w-2/3 focus:outline-none focus:ring-pink-400"
            placeholder="Add a Task"
          />
          <button
            type="submit"
            className=" px-4 py-2 bg-pink-500 rounded-lg font-bold transition-colors duration-200 hover:bg-pink-600 text-white "
          >
            Add
          </button>
        </form>
        <div className="mb-6 flex gap-4 justify-center">
          <select
            onChange={(e) => {
              setFilterStatus(e.target.value);
            }}
            className="p-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={filterStatus}
            name=""
            id=""
          >
            <option value="all">All status</option>
            <option value="Completed">Completed</option>
            <option value="pending">Pending</option>
          </select>

          <select
            onChange={(e) => {
              setFilterPriority(e.target.value);
            }}
            className="p-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={filterPriority}
            name=""
            id=""
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <ul className="space-y-4">
          {filterTask.map((task) => (
            <li
              key={task._id}
              className="p-4 bg-white rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-pink-100 transition duration-300"
            >
              <div className="flex-1">
                <span className="text-lg text-pink-800">{task.text}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({task.status},{task.priority})
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => updateTaskStatus(task._id, task.status)}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors duration-200 ${
                    task.status === "pending"
                      ? "bg-yellow-400 text-yellow-900 hover:yellow-500"
                      : "bg-green-400 text-green-900 hover:green-500"
                  }`}
                >
                  {task.status === "pending"
                    ? "Mark as Completed"
                    : "Mark pending"}
                </button>

                <select
                  value={task.priority}
                  onChange={(e) => {
                    updateTaskPriority(task._id, e.target.value);
                  }}
                  className="p-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  name=""
                  id=""
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <button
                  onClick={() => deleteTask(task._id)}
                  title="Delete task"
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-full transition-color duration-200 ml-2"
                >
                  <i className="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <footer className="bg-pink-500 text-white p-4 mt-auto text-center shadow-inner">
        2025 Your ToDo App
      </footer>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />

        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/"
          element={token ? <MainApp /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}
