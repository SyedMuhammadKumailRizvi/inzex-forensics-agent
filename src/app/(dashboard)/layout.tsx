import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Optional: Add a global navigation bar here for the authenticated state */}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
