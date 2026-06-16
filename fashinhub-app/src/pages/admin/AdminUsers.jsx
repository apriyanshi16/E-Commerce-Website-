import { useState, useEffect } from 'react';
import { Search, Mail, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });
    if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    const { data } = await query;
    setUsers(data || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Users</h1><p className="text-gray-500">Manage user accounts</p></div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_, i) => (<div key={i} className="bg-white rounded-xl border p-6 animate-pulse"><div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4" /><div className="h-4 bg-gray-200 rounded mb-2" /><div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" /></div>)) : users.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No users found</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-lg font-bold text-primary-600">{(user.full_name || user.email)?.[0]?.toUpperCase() || 'U'}</span></div>
                <div className="flex-1"><p className="font-semibold">{user.full_name || 'User'}</p><div className="flex items-center gap-1 text-gray-500 text-sm"><Mail className="w-3 h-3" />{user.email}</div></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-full capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role || 'customer'}</span>
                <div className="flex items-center gap-1 text-gray-500"><Calendar className="w-3 h-3" />{formatDate(user.created_at)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
