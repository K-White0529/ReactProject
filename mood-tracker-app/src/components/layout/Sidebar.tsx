import { getStoredUser } from '../../services/authService';
import {
  HiMenu,
  HiX,
  HiPlus,
  HiChartBar,
  HiUser,
  HiHome,
  HiViewList
} from 'react-icons/hi';

interface SidebarProps {
  expanded: boolean;
  onToggle?: () => void;
  onLogout: () => void;
  isMobile: boolean;
  onClose?: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

function Sidebar({ expanded, onToggle, onLogout, isMobile, onClose, currentPage, onNavigate }: SidebarProps) {
  const user = getStoredUser();

  const handleNavigation = (page: string) => {
    onNavigate(page);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    onLogout();
    if (isMobile && onClose) {
      onClose();
    }
  };

  const isActive = (page: string) => {
    if (currentPage.startsWith('record-detail')) {
      return page === 'record-list';
    }
    return currentPage === page;
  };

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : 'collapsed'} ${isMobile ? 'mobile' : ''}`}>
      {/* ヘッダー部分 */}
      <div className="sidebar-header">
        {!isMobile && (
          <button className="sidebar-toggle" onClick={onToggle}>
            {expanded ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        )}
        {isMobile && (
          <button className="sidebar-close" onClick={onClose}>
            <HiX size={24} />
          </button>
        )}
        {expanded && (
          <div className="app-logo">
            <span className="app-icon">😊</span>
            <span className="app-name">Mood Tracker</span>
          </div>
        )}
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavigation('dashboard')}
          title="ダッシュボード"
        >
          <HiHome size={24} className="nav-icon" />
          {expanded && <span className="nav-label">ダッシュボード</span>}
        </button>

        <button
          className={`nav-item ${currentPage === 'record' ? 'active' : ''}`}
          onClick={() => handleNavigation('record')}
          title="データ登録"
        >
          <HiPlus size={24} className="nav-icon" />
          {expanded && <span className="nav-label">データ登録</span>}
        </button>

        <button
          className={`nav-item ${currentPage === 'analysis' ? 'active' : ''}`}
          onClick={() => handleNavigation('analysis')}
          title="分析"
        >
          <HiChartBar size={24} className="nav-icon" />
          {expanded && <span className="nav-label">分析</span>}
        </button>

        <button
          className={`nav-item ${isActive('record-list') ? 'active' : ''}`}
          onClick={() => handleNavigation('record-list')}
          title="記録一覧"
        >
          <HiViewList size={24} className="nav-icon" />
          {expanded && <span className="nav-label">記録一覧</span>}
        </button>
      </nav>

      {/* ユーザーメニュー */}
      <div className="sidebar-user">
        <button className="user-menu" onClick={handleLogout} title="ログアウト">
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
    </aside>
  );
}

export default Sidebar;