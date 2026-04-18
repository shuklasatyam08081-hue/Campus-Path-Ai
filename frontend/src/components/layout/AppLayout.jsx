import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Background is clean and focused, following GitHub's aesthetic */}
      <Sidebar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative z-10 transition-all">
        {children}
      </main>
    </div>
  );
}
