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

  /* ✅ GET ALL PROBLEMS */
  const fetchProblems = async () => {
    try {
      const { data } = await axiosClient.get("/problem");
      setProblems(data);
    } catch (err) {
      alert("Failed to load problems");
    }
  };

  /* ✅ GET PROBLEM BY ID */
  const handleEditClick = async (id) => {
    try {
      const { data } = await axiosClient.get(`/problem/${id}`);

      setEditingId(id);
      setCurrentProblem(data);

      setFormData({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        visibleTestCases: data.visibleTestCases || [],
        hiddenTestCases: data.hiddenTestCases || []
      });
    } catch (err) {
      alert("Failed to fetch problem");
    }
  };

  /* ✅ UPDATE PROBLEM */
  const handleUpdate = async () => {
    try {
      await axiosClient.put(`/problem/admin/update/${editingId}`, {
        ...formData,
        tags: currentProblem.tags,
        startCode: currentProblem.startCode,
        referenceSolution: currentProblem.referenceSolution
      });

      alert("✅ Problem Updated Successfully");
      setEditingId(null);
      fetchProblems();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Admin Update Problems</h2>

      {problems.map((p) => (
        <div key={p._id} className="border p-4 mb-4 rounded">
          {editingId === p._id ? (
            <>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input input-bordered w-full mb-2"
              />

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="textarea textarea-bordered w-full mb-2"
              />

              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                className="select select-bordered w-full mb-2"
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
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
                className="btn btn-primary btn-sm mt-2"
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
