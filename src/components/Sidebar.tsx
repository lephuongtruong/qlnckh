import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpenCheck, 
  Users, 
  Clock, 
  BarChart3, 
  Settings, 
  X,
  Sparkles,
  Building2,
  FolderGit2
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 'overview' | 'projects' | 'publications' | 'researchers' | 'monitoring' | 'reports' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentRole: UserRole;
  projectCount: number;
  pubCount: number;
  urgentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  currentRole,
  projectCount,
  pubCount,
  urgentCount,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'projects', label: 'Đề tài nghiên cứu', icon: FileText, badge: projectCount, badgeColor: 'bg-blue-100 text-blue-700' },
    { id: 'publications', label: 'Công bố khoa học', icon: BookOpenCheck, badge: pubCount, badgeColor: 'bg-indigo-100 text-indigo-700' },
    { id: 'researchers', label: 'Nhà nghiên cứu', icon: Users },
    { id: 'monitoring', label: 'Tiến độ', icon: Clock, badge: urgentCount > 0 ? urgentCount : undefined, badgeColor: 'bg-rose-100 text-rose-700 font-bold' },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const roleDisplayNames: Record<UserRole, string> = {
    admin: 'Quản trị viên',
    manager: 'Cán bộ QLKH',
    leader: 'Ban Lãnh đạo',
    researcher: 'Giảng viên NCKH',
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-xs tracking-wider">
            HUP
          </div>
          <div>
            <div className="font-extrabold text-white text-xs tracking-wider uppercase">
              ĐH DƯỢC HÀ NỘI
            </div>
            <div className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Phòng QLKH & HTPT
            </div>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role banner in sidebar */}
      <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-slate-400">Góc nhìn:</span>
          <span className="font-semibold text-white">{roleDisplayNames[currentRole]}</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Chức năng chính
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white font-bold' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Info Box in Sidebar */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Quy chế NCKH 2025</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Áp dụng định mức giờ NCKH và tiêu chuẩn thưởng bài báo Q1–Q4 theo Quy chế NCKH Trường Đại học Dược Hà Nội.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
            <span>Phiên bản thử nghiệm</span>
            <span className="text-slate-300">v1.2</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4.25rem)] sticky top-[4.25rem] border-r border-slate-800 z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
