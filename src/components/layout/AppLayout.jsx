import { useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from './ToastContainer';

export function AppLayout({ children }) {
  const drawerToggleRef = useRef(null);

  const openDrawer = () => {
    if (drawerToggleRef.current) drawerToggleRef.current.checked = true;
  };

  const closeDrawer = () => {
    if (drawerToggleRef.current) drawerToggleRef.current.checked = false;
  };

  return (
    <div className="drawer lg:drawer-open h-screen">
      <input
        id="app-drawer"
        type="checkbox"
        className="drawer-toggle"
        ref={drawerToggleRef}
      />
      <div className="drawer-content flex flex-col overflow-hidden">
        <Header onMenuClick={openDrawer} />
        <main className="flex-1 overflow-y-auto p-6 bg-base-200">
          {children}
        </main>
      </div>
      <div className="drawer-side z-40">
        <label htmlFor="app-drawer" className="drawer-overlay" aria-label="Fermer le menu" />
        <div className="w-64 border-r border-base-300 h-full">
          <Sidebar onNavClick={closeDrawer} />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
