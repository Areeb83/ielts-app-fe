import { useState, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Navigate } from 'react-router-dom';
import { User, Mail, Calendar, Crown, Edit2, Check, X, Camera, Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { userAtom, isAuthLoadingAtom } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { ImageCropper } from '../components/ImageCropper';
import axiosInstance from '../api/axiosInstance';

export function ProfilePage() {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const isLoading = useAtomValue(isAuthLoadingAtom);
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name ?? '');
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const createdDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    pro: 'bg-orange-100 text-orange-700',
    premium: 'bg-purple-100 text-purple-700',
  };

  const handleSaveName = async () => {
    if (newName.length < 2 || newName.length > 100) {
      toast.error('Name must be between 2 and 100 characters');
      return;
    }
    try {
      const { data } = await axiosInstance.patch('/user/profile', { name: newName });
      setUser(data.data);
      setEditingName(false);
      toast.success('Name updated');
    } catch {
      toast.error('Failed to update name');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleCropComplete = async (croppedImage: string) => {
    try {
      const { data } = await axiosInstance.patch('/user/profile', { avatar: croppedImage });
      setUser(data.data);
      setCropperImage(null);
      toast.success('Profile picture updated');
    } catch {
      toast.error('Failed to update profile picture');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const { data } = await axiosInstance.patch('/user/profile', { avatar: null });
      setUser(data.data);
      toast.success('Profile picture removed');
    } catch {
      toast.error('Failed to remove profile picture');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (!/(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast.error('New password must contain at least 1 uppercase letter and 1 number');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await axiosInstance.patch('/user/password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-orange-500 to-orange-600" />

          {/* Avatar + Name */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 mb-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                  {user.avatar ? <AvatarImage src={user.avatar} /> : null}
                  <AvatarFallback className="bg-orange-500 text-white text-3xl font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                {user.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="pb-1 flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planColors[user.plan]}`}>
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                </span>
              </div>
            </div>

            {/* Info Fields */}
            <div className="space-y-5">
              {/* Name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    {editingName ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          autoFocus
                        />
                        <button onClick={handleSaveName} className="text-green-600 hover:text-green-700">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingName(false); setNewName(user.name); }} className="text-gray-400 hover:text-gray-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    )}
                  </div>
                </div>
                {!editingName && (
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* Plan */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Subscription</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">{createdDate}</p>
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Password</p>
                    <p className="text-sm font-medium text-gray-900">••••••••</p>
                  </div>
                </div>
                {!changingPassword && (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Password Change Form */}
              {changingPassword && (
                <form onSubmit={handleChangePassword} className="ml-13 space-y-3 pl-[52px]">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Re-enter new password"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-lg transition-colors cursor-pointer"
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setChangingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperImage(null)}
        />
      )}
    </div>
  );
}

export default ProfilePage;
