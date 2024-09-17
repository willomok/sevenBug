import React, { useState } from 'react';
import { User } from '../models/User';
import { Bug } from '../models/Bug';
import { updateUserProfile } from '../services/userService';
import { createBug, getUserBugs, resolveBug } from '../services/bugService';
import Login from '../components/Login';
import '../styles/profile.css';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugDescription, setNewBugDescription] = useState('');
  const [newBugPriority, setNewBugPriority] = useState('Low');
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [isBugFormOpen, setIsBugFormOpen] = useState(false);

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    setNewName(user.name);
    setNewEmail(user.email);
    fetchUserBugs(user.id);
  };

  const fetchUserBugs = async (userId: number) => {
    try {
      const data = await getUserBugs(userId);
      setBugs(data);
    } catch (error) {
      console.error('Error fetching user bugs:', error);
    }
  };

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    try {
      const updatedUser = { ...user, name: newName, email: newEmail };
      if (newPassword) {
        updatedUser.password = newPassword;
      }

      await updateUserProfile(user.id, updatedUser);
      setUser(updatedUser);
      setNewPassword('');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCreateBug = async () => {
    if (!user || !newBugTitle || !newBugDescription || !newBugPriority) {
      alert('Please fill out all fields before submitting.');
      return;
    }

    try {
      await createBug(newBugTitle, newBugDescription, newBugPriority, user.id);
      fetchUserBugs(user.id);
      setNewBugTitle('');
      setNewBugDescription('');
      setNewBugPriority('Low');
    } catch (error) {
      console.error('Error creating bug:', error);
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

  const toggleProfileForm = () => setIsProfileFormOpen(!isProfileFormOpen);
  const toggleBugForm = () => setIsBugFormOpen(!isBugFormOpen);

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className='profile-container'>
      <h1>{user.name}'s Profile</h1>

      <div className="button-group">
        <button 
          onClick={toggleProfileForm} 
          className="expand-btn"
          title="Click to update your profile"
        >
          {isProfileFormOpen ? 'Hide Profile Form' : 'Update Profile'}
        </button>

        <button 
          onClick={toggleBugForm} 
          className="expand-btn"
          title="Click to create a new bug"
        >
          {isBugFormOpen ? 'Hide Bug Form' : 'Create New Bug'}
        </button>
      </div>

      {isProfileFormOpen && (
        <form onSubmit={handleUpdateProfile} className='update-profile-form'>
          <h2>Update Profile</h2>
          <div className="form-group">
            <label>Name: </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email: </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password: </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" className="submit-btn">Update Profile</button>
        </form>
      )}

      {isBugFormOpen && (
        <div className='profile-create-bug'>
          <h2>Create New Bug</h2>
          <div className="form-group">
            <label>Title: </label>
            <input
              type="text"
              value={newBugTitle}
              onChange={(e) => setNewBugTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Description: </label>
            <textarea
              value={newBugDescription}
              onChange={(e) => setNewBugDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Priority: </label>
            <select
              value={newBugPriority}
              onChange={(e) => setNewBugPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <button className="submit-btn" onClick={handleCreateBug}>Create Bug</button>
        </div>
      )}

      <h2>Your Bugs</h2>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bugs.map((bug) => (
              <tr key={bug.id}>
                <td>{bug.id}</td>
                <td>{bug.title}</td>
                <td>{bug.description}</td>
                <td>{bug.createdDate ? new Date(bug.createdDate).toLocaleDateString() : 'N/A'}</td>
                <td>{bug.resolvedDate ? new Date(bug.resolvedDate).toLocaleDateString() : 'Open'}</td>
                <td className={bug.status === 'Open' ? 'status-open' : 'status-closed'}>{bug.status}</td>
                <td className={
                  bug.priority === 'High' ? 'priority-high' :
                  bug.priority === 'Medium' ? 'priority-medium' :
                  'priority-low'
                }>
                  {bug.priority}
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

export default Profile;
