import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import BottomNav from './BottomNav';
import ThemeSwitcher from './ThemeSwitcher';
import CollapsibleCard from './CollapsibleCard';

interface SettingsFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  email: string;
  name: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://mytradingjournal-api.vercel.app/';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SettingsFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: '',
    name: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_URL}/settings/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_URL}/settings/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (navigate: any) => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-200 to-white flex flex-col justify-between">
      <div className="w-full max-w-lg mx-auto pt-8 pb-20 px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-left">Settings</h1>
        <button
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold"
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        {/* Theme Switcher */}
        <CollapsibleCard title="Theme" defaultOpen>
          <ThemeSwitcher />
        </CollapsibleCard>
        {/* Profile Section */}
        <CollapsibleCard title="Profile Information">
          <form onSubmit={handleUpdateProfile} className="space-y-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50 mt-2 border border-gray-200"
            >
              Update Profile
            </button>
          </form>
        </CollapsibleCard>
        {/* Password Section */}
        <CollapsibleCard title="Change Password">
          <form onSubmit={handleUpdatePassword} className="space-y-2">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50 mt-2 border border-gray-200"
            >
              Update Password
            </button>
          </form>
        </CollapsibleCard>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full mt-8 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:scale-105 transition-transform border border-gray-200"
        >
          Log out
        </button>
        {/* Delete Account Button */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full mt-3  border-red-500 text-red-500 font-semibold py-3 rounded-lg hover:scale-105 transition-transform border"
        >
          Delete My Account
        </button>
        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-xs w-full flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4">Log out?</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-500 text-center">Are you sure you want to log out?</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleLogout(navigate)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform border border-gray-200"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 border border-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white  rounded-xl shadow-lg p-4 max-w-xs w-full flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4 text-red-700">Delete Account</h2>
              <p className="mb-4 text-gray-700  text-center">
                This action is <span className='font-medium text-red-600'>permanent</span> and will delete your account and all your trades. This cannot be undone.<br/><br/>
                Are you absolutely sure you want to delete your account?
              </p>
              {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
              <div className="flex gap-4 mt-2">
                <button
                  onClick={async () => {
                    setDeleteLoading(true);
                    setDeleteError('');
                    try {
                      const res = await fetch(`${API_URL}/delete-account`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                      });
                      if (!res.ok) throw new Error('Failed to delete account.');
                      localStorage.removeItem('token');
                      navigate('/login');
                    } catch (err: any) {
                      setDeleteError(err.message || 'Failed to delete account.');
                    } finally {
                      setDeleteLoading(false);
                    }
                  }}
                  disabled={deleteLoading}
                  className="bg-gradient-to-r text-gray-200 from-red-600 to-pink-500  px-4 py-2 rounded-lg font-medium shadow hover:scale-105 transition-transform disabled:opacity-60 border border-gray-200"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className=" text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 border border-gray-200"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {message.text && (
          <div className={`p-3 mt-4 rounded-lg ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default SettingsPage;
