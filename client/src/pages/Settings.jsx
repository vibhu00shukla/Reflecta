import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Trash2, Save, AlertTriangle, CheckCircle, ArrowLeft, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_URL from '../config';

const Settings = () => {
    const { user, updateProfile, deleteAccount, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm({
        defaultValues: {
            name: user?.name || ''
        }
    });

    const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

    const onUpdateProfile = async (data) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        const result = await updateProfile({ name: data.name });
        setLoading(false);
        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const onChangePassword = async (data) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        const result = await updateProfile({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword
        });
        setLoading(false);
        if (result.success) {
            setMessage({ type: 'success', text: 'Password changed successfully' });
            resetPassword();
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const onDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            setLoading(true);
            const result = await deleteAccount();
            if (!result.success) {
                setLoading(false);
                setMessage({ type: 'error', text: result.message });
            }
        }
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen pb-12">
            <nav className="glass sticky top-0 z-10 mb-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="text-gray-500 hover:text-primary-600 transition-colors flex items-center font-medium">
                            <div className="bg-white/50 p-1.5 rounded-full mr-2 hover:bg-white transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </div>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Sidebar */}
                    <div className="md:col-span-3">
                        <div className="glass-card rounded-xl overflow-hidden">
                            <nav className="flex flex-col">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <User className="h-4 w-4 mr-3" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Lock className="h-4 w-4 mr-3" />
                                    Security
                                </button>
                                <button
                                    onClick={() => setActiveTab('danger')}
                                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'danger' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Trash2 className="h-4 w-4 mr-3" />
                                    Danger Zone
                                </button>
                                <div className="border-t border-gray-100 my-2"></div>
                                <button
                                    onClick={logout}
                                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    Log Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-9">
                        <motion.div
                            key={activeTab}
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            transition={{ duration: 0.3 }}
                            className="glass-card rounded-xl p-6 md:p-8"
                        >
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertTriangle className="h-5 w-5 mr-2" />}
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Information</h2>
                                    <p className="text-gray-500 text-sm mb-6">Update your account's profile information.</p>

                                    <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                {...registerProfile('name', { required: 'Name is required' })}
                                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white/50"
                                            />
                                            {profileErrors.name && <p className="mt-1 text-xs text-red-500">{profileErrors.name.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={user?.email}
                                                disabled
                                                className="block w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                            <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                                            >
                                                {loading ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Security Settings</h2>
                                    <p className="text-gray-500 text-sm mb-6">Ensure your account is using a long, random password to stay secure.</p>

                                    <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                            <input
                                                type="password"
                                                {...registerPassword('oldPassword', { required: 'Current password is required' })}
                                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white/50"
                                            />
                                            {passwordErrors.oldPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.oldPassword.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                            <input
                                                type="password"
                                                {...registerPassword('newPassword', {
                                                    required: 'New password is required',
                                                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                                })}
                                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white/50"
                                            />
                                            {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword.message}</p>}
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                                            >
                                                {loading ? 'Updating...' : <><Lock className="h-4 w-4 mr-2" /> Update Password</>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'danger' && (
                                <div>
                                    <h2 className="text-xl font-bold text-red-600 mb-1">Danger Zone</h2>
                                    <p className="text-gray-500 text-sm mb-6">Irreversible actions for your account.</p>

                                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                                        <h3 className="text-sm font-medium text-red-800">Delete Account</h3>
                                        <p className="mt-1 text-sm text-red-600">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                    </div>

                                    <button
                                        onClick={onDeleteAccount}
                                        disabled={loading}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? 'Deleting...' : <><Trash2 className="h-4 w-4 mr-2" /> Delete Account</>}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
