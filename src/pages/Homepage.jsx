import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUserThunk } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({ difficulty: 'all', tag: 'all', status: 'all' });

  useEffect(() => {
    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  // Fetch all problems (public)
  const fetchProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problem'); // updated route
      setProblems(data);
    } catch (err) {
      console.error("Fetch Problems Error:", err);
    }
  };

  // Fetch solved problems for logged-in user
  const fetchSolvedProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problem/solved'); // updated route
      setSolvedProblems(data);
    } catch (err) {
      console.error("Fetch Solved Problems Error:", err);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUserThunk());
    setSolvedProblems([]);
  };

  // Fast lookup for solved problems
  const solvedSet = new Set(solvedProblems.map(p => p._id || p));

  const filteredProblems = problems.filter(problem => {
    const isSolved = solvedSet.has(problem._id.toString());

    const statusMatch =
      filters.status === "all" ||
      (filters.status === "solved" && isSolved) ||
      (filters.status === "unsolved" && !isSolved);

    const difficultyMatch = filters.difficulty === "all" || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === "all" || problem.tags === filters.tag;

    return statusMatch && difficultyMatch && tagMatch;
  });

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <nav className="navbar bg-base-100 shadow px-4">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">LeetCode</NavLink>
        </div>
        <div className="flex-none gap-4">
          {user && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} className="btn btn-ghost">{user.firstName}</div>
              <ul className="menu dropdown-content bg-base-100 rounded-box shadow w-52">
                <li><button onClick={handleLogout}>Logout</button></li>
                {user.role === 'admin' && <li><NavLink to="/admin">Admin</NavLink></li>}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Filters */}
      <div className="container mx-auto p-4">
        <div className="flex gap-4 mb-6 flex-wrap">
          <select className="select select-bordered" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
            <option value="unsolved">Unsolved Problems</option>
          </select>

          <select className="select select-bordered" value={filters.difficulty} onChange={e => setFilters({ ...filters, difficulty: e.target.value })}>
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select className="select select-bordered" value={filters.tag} onChange={e => setFilters({ ...filters, tag: e.target.value })}>
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">DP</option>
          </select>
        </div>

        {/* Problems List */}
        <div className="grid gap-4">
          {filteredProblems.map(problem => {
            const isSolved = solvedSet.has(problem._id.toString());
            return (
              <div key={problem._id} className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex justify-between items-center">
                    <NavLink to={`/problem/${problem._id}`} className="card-title hover:text-primary">{problem.title}</NavLink>
                    {isSolved && <span className="badge badge-success">Solved</span>}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className={`badge ${getDifficultyBadge(problem.difficulty)}`}>{problem.difficulty}</span>
                    <span className="badge badge-info">{problem.tags}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function for difficulty badges
const getDifficultyBadge = (difficulty) => {
  switch (difficulty) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;
