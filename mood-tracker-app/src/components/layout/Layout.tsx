import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

function Layout({ children, onLogout, currentPage, onNavigate }: LayoutProps) {
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
        currentPage={currentPage}
        onNavigate={onNavigate}
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
            currentPage={currentPage}
            onNavigate={onNavigate}
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