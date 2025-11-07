import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

function Layout({ children, onLogout }: LayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="layout">
      {/* PC用サイドバー */}
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
        onLogout={onLogout}
        isMobile={false}
      />

      {/* スマホ用ヘッダー */}
      <MobileHeader onMenuClick={toggleMobileSidebar} />

      {/* スマホ用サイドバー（オーバーレイ） */}
      {mobileSidebarOpen && (
        <>
          <div className="mobile-overlay" onClick={closeMobileSidebar} />
          <Sidebar
            expanded={true}
            onLogout={onLogout}
            isMobile={true}
            onClose={closeMobileSidebar}
          />
        </>
      )}

      {/* メインコンテンツ */}
      <main className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        {children}
      </main>
    </div>
  );
}

export default Layout;