import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="sidebar-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
