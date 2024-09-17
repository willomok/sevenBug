import { useState, useEffect } from 'react';
import { resolveBug } from '../services/bugService';
import { Bug } from '../models/Bug';
import CreateBugForm from '../components/CreateBugForm';
import axios from 'axios';
import '../styles/Home.css';

const HomePage = () => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [userFilter, setUserFilter] = useState<string>('All');
  const [users, setUsers] = useState<{ id: number, name: string }[]>([]);

  useEffect(() => {
    fetchBugs();
    fetchUsers();
  }, []);

  const fetchBugs = async () => {
    try {
      const response = await axios.get('https://localhost:7167/api/bugs');
      if (Array.isArray(response.data)) {
        setBugs(response.data);
      } else {
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://localhost:7167/api/users');
      setUsers(response.data); 
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCloseBug = async (id: number) => {
    try {
      await resolveBug(id);
      setBugs(prevBugs => 
        prevBugs.map(bug => 
          bug.id === id ? { ...bug, status: 'Closed', resolvedDate: new Date().toISOString() } : bug
        )
      );
    } catch (error) {
      console.error('Error closing bug:', error);
    }
  };

  const filteredAndSortedBugs = [...bugs]
    .filter(bug => {
      if (priorityFilter !== 'All' && bug.priority !== priorityFilter) return false;
      if (userFilter !== 'All' && bug.assignedUser?.id !== Number(userFilter)) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.status === 'Closed' && b.status !== 'Closed') return 1;
      if (a.status !== 'Closed' && b.status === 'Closed') return -1;
      return 0;
    });

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className='home-container'>
      <h1>Bug Tracker</h1>

      <section className='bug-form'>
        <h2>Create a New Bug</h2>
        <CreateBugForm />
      </section>

      <section>
        <h2>Existing Bugs</h2>
        <h3>Filters</h3>

        <label>Filter by Priority:</label>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <label>Filter by User:</label>
        <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
          <option value="All">All</option>
          {users.map(user => (
            <option key={user.id} value={user.id.toString()}>
              {user.name}
            </option>
          ))}
        </select>
      </section>

      <section>
        <table className='bugs-table'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Created Date</th>
              <th>Resolved Date</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned User (ID)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedBugs.map(bug => (
              <tr key={bug.id}>
                <td>{bug.id}</td>
                <td>{bug.title}</td>
                <td>{bug.description}</td>
                <td>{bug.createdDate ? new Date(bug.createdDate).toLocaleDateString() : 'N/A'}</td>
                <td>{bug.resolvedDate ? new Date(bug.resolvedDate).toLocaleDateString() : 'Open'}</td>
                <td className={bug.status === 'Open' ? 'status-open' : 'status-closed'}>
                  {bug.status}
                </td>
                <td className={
                  bug.priority === 'High' ? 'priority-high' :
                  bug.priority === 'Medium' ? 'priority-medium' :
                  'priority-low'
                }>
                  {bug.priority}
                </td>
                <td>
                  {bug.assignedUser ? `${bug.assignedUser.name} ( ${bug.assignedUser.id})` : 'Unknown'}
                </td>
                <td>
                  {bug.status === 'Open' && (
                    <button onClick={() => handleCloseBug(bug.id)}>Close</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default HomePage;
