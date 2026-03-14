import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { API_BASE_URL } from '../../api/config';

export function LogoutButton() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      aria-label="Log out"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
