import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CreateBugForm.css'; 

interface User {
  id: number;
  name: string;
}

interface CreateBugFormProps {
  loggedInUserId?: number;
}

const CreateBugForm: React.FC<CreateBugFormProps> = ({ loggedInUserId }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>('Low');
  const [status, setStatus] = useState<string>('Open');
  const [assignedUserId, setAssignedUserId] = useState<number | null>(loggedInUserId || null);
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!loggedInUserId) {
      const fetchUsers = async () => {
        try {
          const response = await axios.get('https://localhost:7167/api/users');
          setUsers(response.data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      fetchUsers();
    }
  }, [loggedInUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !priority || !status || (assignedUserId === null && !loggedInUserId)) {
      alert("Please fill out all required fields.");
      return;
    }

    const createdDate = new Date().toISOString();

    const newBug = {
      title,
      description,
      priority,
      status,
      assignedUserId: assignedUserId ?? loggedInUserId as number,
      createdDate,
    };

    try {
      const response = await axios.post('https://localhost:7167/api/bugs', newBug);
      console.log('Bug created:', response.data);

      // Reset form after successful creation
      setTitle('');
      setDescription('');
      setPriority('Low');
      setStatus('Open');
      setAssignedUserId(loggedInUserId || null);

      alert('Bug created successfully!');
    } catch (error) {
      console.error('Error creating bug:', error);
      alert('Failed to create bug. Please try again.');
    }
  };

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  return (
    <div className='create-bug-form'>
      <button onClick={toggleForm} className="expand-btn">
        {isFormOpen ? 'Hide Bug Form' : 'Create Bug'}
      </button>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bug-form">
          <div className="form-group">
            <label>Title:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Priority:</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          {!loggedInUserId && (
            <div className="form-group">
              <label>Assigned User:</label>
              <select value={assignedUserId ?? ''} onChange={(e) => setAssignedUserId(Number(e.target.value))} required>
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} (ID: {user.id})
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="submit-btn">Create Bug</button>
        </form>
      )}
    </div>
  );
};

export default CreateBugForm;
