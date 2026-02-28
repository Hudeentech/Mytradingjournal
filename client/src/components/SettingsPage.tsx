import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  User,
  Lock,
  LogOut,
  Trash2,
  Monitor
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeSwitcher from './ThemeSwitcher';
import { ModeToggle } from './ModeToggle';

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Dashboard Style Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto w-full space-y-6">

        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-2 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Theme Switcher section */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">Appearance</CardTitle>
                <CardDescription>Customize the theme and layout of your journal</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ThemeSwitcher />
            </CardContent>
          </Card>

          {/* Profile Section */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 mb-8 border-t space-y-4">
          <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" /> Log out
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Delete Account
            </Button>
          </div>
        </div>

      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 shadow-xl border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOut className="h-5 w-5" /> Confirm Logout
              </CardTitle>
              <CardDescription>
                Are you sure you want to log out of your account?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleLogout(navigate)}>
                Yes, Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 shadow-xl border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" /> Delete Account
              </CardTitle>
              <CardDescription className="text-base text-foreground mt-2">
                This action is <span className="font-semibold text-destructive">permanent</span> and will delete your account and all your trades. This cannot be undone.
                <br /><br />
                Are you absolutely sure you want to delete your account?
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deleteError && (
                <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-md">
                  {deleteError}
                </div>
              )}
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteLoading}
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
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
