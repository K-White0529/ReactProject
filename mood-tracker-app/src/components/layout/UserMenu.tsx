import { getStoredUser } from '../../services/authService';
import { HiUser } from 'react-icons/hi';

interface UserMenuProps {
  onLogout: () => void;
  expanded: boolean;
}

function UserMenu({ onLogout, expanded }: UserMenuProps) {
  const user = getStoredUser();

  return (
    <div className="user-menu-container">
      <button className="user-menu" onClick={onLogout}>
        <div className="user-icon">
          <HiUser size={24} />
        </div>
        {expanded && (
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-action">ログアウト</div>
          </div>
        )}
      </button>
    </div>
  );
}

export default UserMenu;