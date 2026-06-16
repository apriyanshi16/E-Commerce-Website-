import { useState } from 'react';
import { User, Mail, Lock, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ name: user?.user_metadata?.full_name || '', email: user?.email || '', phone: '', address: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  if (!user) return <div className="container py-16 text-center"><User className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h2 className="text-xl font-semibold mb-2">Please login</h2></div>;

  const handleProfileUpdate = async (e) => { e.preventDefault(); setLoading(true); setSaved(false); setTimeout(() => { setLoading(false); setSaved(true); }, 1000); };

  const tabs = [{ id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' }];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Account</h1>
          <div className="flex border-b mb-8">{tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>))}</div>
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center gap-4 mb-6"><div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-2xl font-bold text-primary-600">{(profile.name || user.email)?.[0]?.toUpperCase() || 'U'}</span></div><div><h2 className="font-semibold text-lg">{profile.name || 'User'}</h2><p className="text-gray-500">{profile.email}</p></div></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-2">Full Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /></div></div>
                  <div><label className="block text-sm font-medium mb-2">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" value={profile.email} disabled className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" /></div></div>
                </div>
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50"><Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save Changes'}</button>
                {saved && <p className="text-green-600 text-sm">Profile updated!</p>}
              </form>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-lg mb-6">Change Password</h2>
              <form className="space-y-4">
                <div><label className="block text-sm font-medium mb-2">Current Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div></div>
                <div><label className="block text-sm font-medium mb-2">New Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div></div>
                <div><label className="block text-sm font-medium mb-2">Confirm New Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div></div>
                <button type="submit" className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">Update Password</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
