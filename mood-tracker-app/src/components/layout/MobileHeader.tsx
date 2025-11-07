import { HiMenu } from 'react-icons/hi';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="mobile-header">
      <button className="mobile-menu-button" onClick={onMenuClick}>
        <HiMenu size={24} />
      </button>
      <div className="mobile-app-logo">
        <span className="app-icon">😊</span>
        <span className="app-name">Mood Tracker</span>
      </div>
    </header>
  );
}

export default MobileHeader;