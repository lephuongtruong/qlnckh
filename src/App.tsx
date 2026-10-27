/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ProjectsView } from './views/ProjectsView';
import { PublicationsView } from './views/PublicationsView';
import { ResearchersView } from './views/ResearchersView';
import { MonitoringView } from './views/MonitoringView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { 
  ResearchProject, 
  Publication, 
  Researcher, 
  UserRole 
} from './types';
import { 
  getStoredProjects, 
  saveStoredProjects, 
  getStoredPublications, 
  saveStoredPublications, 
  getStoredResearchers, 
  saveStoredResearchers, 
  getStoredRole, 
  saveStoredRole 
} from './utils/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [currentRole, setCurrentRole] = useState<UserRole>('manager');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data State
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);

  // Navigation context
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<ResearchProject | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initial load
  useEffect(() => {
    setProjects(getStoredProjects());
    setPublications(getStoredPublications());
    setResearchers(getStoredResearchers());
    setCurrentRole(getStoredRole());
  }, []);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Project handlers
  const handleSaveProject = (saved: ResearchProject) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      const updated = exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
      saveStoredProjects(updated);
      return updated;
    });
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveStoredProjects(updated);
      return updated;
    });
  };

  // Publication handlers
  const handleSavePublication = (saved: Publication) => {
    setPublications((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      const updated = exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
      saveStoredPublications(updated);
      return updated;
    });
  };

  const handleDeletePublication = (id: string) => {
    setPublications((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveStoredPublications(updated);
      return updated;
    });
  };

  // Researcher handlers
  const handleSaveResearcher = (saved: Researcher) => {
    setResearchers((prev) => {
      const exists = prev.some((r) => r.id === saved.id);
      const updated = exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...prev];
      saveStoredResearchers(updated);
      return updated;
    });
  };

  const handleDeleteResearcher = (id: string) => {
    setResearchers((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveStoredResearchers(updated);
      return updated;
    });
  };

  // Role Switcher
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    saveStoredRole(newRole);
    const roleLabels: Record<UserRole, string> = {
      admin: 'Quản trị viên (Toàn quyền hệ thống)',
      manager: 'Cán bộ Quản lý Khoa học',
      leader: 'Ban Giám Hiệu / Lãnh đạo Khoa',
      researcher: 'Giảng viên / Nhà nghiên cứu',
    };
    showToast(`Đã chuyển góc nhìn mô phỏng sang: ${roleLabels[newRole]}`, 'info');
  };

  // Reload data from local storage
  const handleDataReloaded = () => {
    setProjects(getStoredProjects());
    setPublications(getStoredPublications());
    setResearchers(getStoredResearchers());
  };

  // Quick navigation to project detail
  const handleOpenProjectDetail = (p: ResearchProject) => {
    setSelectedProjectForDetail(p);
    setCurrentTab('projects');
  };

  // Urgent alerts count for sidebar
  const todayStr = new Date().toISOString().slice(0, 10);
  const urgentCount = projects.filter((p) => {
    if (p.status === 'qua_han' || p.status === 'cho_nghiem_thu') return true;
    if (p.status === 'dang_thuc_hien' && p.endDate < todayStr) return true;
    return false;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        projects={projects}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onSelectProject={handleOpenProjectDetail}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          currentRole={currentRole}
          projectCount={projects.length}
          pubCount={publications.length}
          urgentCount={urgentCount}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {currentTab === 'overview' && (
            <DashboardView
              projects={projects}
              publications={publications}
              researchers={researchers}
              currentRole={currentRole}
              onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
              onSelectProject={handleOpenProjectDetail}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              projects={projects}
              publications={publications}
              researchers={researchers}
              currentRole={currentRole}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
              onShowToast={showToast}
              selectedProjectForDetail={selectedProjectForDetail}
              onClearSelectedProject={() => setSelectedProjectForDetail(null)}
            />
          )}

          {currentTab === 'publications' && (
            <PublicationsView
              publications={publications}
              projects={projects}
              researchers={researchers}
              currentRole={currentRole}
              onSavePublication={handleSavePublication}
              onDeletePublication={handleDeletePublication}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'researchers' && (
            <ResearchersView
              researchers={researchers}
              projects={projects}
              publications={publications}
              currentRole={currentRole}
              onSaveResearcher={handleSaveResearcher}
              onDeleteResearcher={handleDeleteResearcher}
              onShowToast={showToast}
              onSelectProject={handleOpenProjectDetail}
            />
          )}

          {currentTab === 'monitoring' && (
            <MonitoringView
              projects={projects}
              currentRole={currentRole}
              onUpdateProject={handleSaveProject}
              onShowToast={showToast}
              onSelectProjectDetail={handleOpenProjectDetail}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              projects={projects}
              publications={publications}
              researchers={researchers}
              currentRole={currentRole}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onDataReloaded={handleDataReloaded}
              onShowToast={showToast}
              projectCount={projects.length}
              pubCount={publications.length}
              researcherCount={researchers.length}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notification Feed */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
