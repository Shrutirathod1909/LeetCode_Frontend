import React, { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

const AdminUpdate = () => {
  const [problems, setProblems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    visibleTestCases: [],
    hiddenTestCases: []
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    const { data } = await axiosClient.get("/problem/getAllProblem");
    setProblems(data);
  };

  const handleEditClick = async (id) => {
    const { data } = await axiosClient.get(
      `/problem/problemById/${id}`
    );

    setEditingId(id);
    setCurrentProblem(data);
    setFormData({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      visibleTestCases: data.visibleTestCases || [],
      hiddenTestCases: data.hiddenTestCases || []
    });
  };

  const handleUpdate = async () => {
    await axiosClient.put(`/problem/update/${editingId}`, {
      ...formData,
      tags: currentProblem.tags,
      startCode: currentProblem.startCode,
      referenceSolution: currentProblem.referenceSolution
    });

    alert("✅ Updated");
    setEditingId(null);
    fetchProblems();
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Admin Update Problems</h2>

      {problems.map(p => (
        <div key={p._id} className="border p-4 mb-4 rounded">
          {editingId === p._id ? (
            <>
              <input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="input input-bordered w-full mb-2"
              />

              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="textarea textarea-bordered w-full mb-2"
              />

              <select
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                className="select select-bordered w-full mb-2"
              >
                <option>easy</option>
                <option>medium</option>
                <option>hard</option>
              </select>

              <button className="btn btn-success" onClick={handleUpdate}>
                Save
              </button>
            </>
          ) : (
            <>
              <h3 className="font-semibold">{p.title}</h3>
              <p>Difficulty: {p.difficulty}</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleEditClick(p._id)}
              >
                Edit
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminUpdate;
