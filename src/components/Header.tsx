import React, { useState } from 'react';
import { 
  GraduationCap, 
  Bell, 
  Menu, 
  UserCheck, 
  Info, 
  AlertCircle, 
  Clock, 
  ChevronDown,
  Check,
  ShieldAlert
} from 'lucide-react';
import { UserRole, ResearchProject } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  projects: ResearchProject[];
  onOpenMobileMenu: () => void;
  onSelectProject: (project: ResearchProject) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  projects,
  onOpenMobileMenu,
  onSelectProject,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const rolesConfig: Record<UserRole, { label: string; desc: string; badge: string; iconColor: string }> = {
    admin: {
      label: 'Quản trị viên (Admin)',
      desc: 'Quản lý toàn bộ dữ liệu, người dùng, cấu hình hệ thống',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      iconColor: 'text-purple-600',
    },
    manager: {
      label: 'Cán bộ Quản lý Khoa học',
      desc: 'Theo dõi, thẩm định, cập nhật tiến độ đề tài & công bố',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      iconColor: 'text-blue-600',
    },
    leader: {
      label: 'Lãnh đạo (Ban Giám Hiệu / Trưởng Khoa)',
      desc: 'Xem báo cáo thống kê, biểu đồ chiến lược và ra quyết định',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      iconColor: 'text-amber-600',
    },
    researcher: {
      label: 'Giảng viên / Nhà nghiên cứu',
      desc: 'Quản lý hồ sơ cá nhân, cập nhật đề tài & bài báo của mình',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
  };

  // Find urgent alert projects
  const today = new Date().toISOString().slice(0, 10);
  const overdueProjects = projects.filter(
    (p) => p.status === 'qua_han' || (p.status === 'dang_thuc_hien' && p.endDate < today)
  );

  const dueSoonProjects = projects.filter((p) => {
    if (p.status !== 'dang_thuc_hien') return false;
    const end = new Date(p.endDate).getTime();
    const now = new Date(today).getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 45;
  });

  const waitingAcceptance = projects.filter((p) => p.status === 'cho_nghiem_thu');

  const totalAlertCount = overdueProjects.length + dueSoonProjects.length + waitingAcceptance.length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Notice Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[11px]">
            <Info className="w-3 h-3 shrink-0" /> Bản thử nghiệm mô phỏng
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Dữ liệu được lưu trữ trực tiếp trên trình duyệt (LocalStorage), chưa có hệ thống đăng nhập và phân quyền thực tế.
          </span>
          <span className="text-slate-300 sm:hidden">
            Dữ liệu lưu trên trình duyệt (LocalStorage).
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-[11px] shrink-0 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>S-RMS v1.2</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 text-white flex items-center justify-center shadow-md shadow-blue-900/10 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 block sm:inline">
                  TRƯỜNG ĐẠI HỌC DƯỢC HÀ NỘI
                </span>
                <span className="inline-flex items-center text-[10px] font-black px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-300">
                  HUP
                </span>
              </div>
              <h1 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-tight mt-0.5">
                HỆ THỐNG QUẢN LÝ NGHIÊN CỨU KHOA HỌC
              </h1>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Phòng Quản lý Khoa học Công nghệ & Hợp tác Phát triển • HUP S-RMS Portal
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Role Switcher & Notifications */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Thông báo & Cảnh báo đề tài"
            >
              <Bell className="w-5 h-5" />
              {totalAlertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {totalAlertCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-sm text-slate-900">Cảnh báo tiến độ đề tài</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {totalAlertCount} thông báo
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {overdueProjects.length > 0 && (
                    <div className="p-2 bg-rose-50/50">
                      <div className="px-2 py-1 text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Đề tài quá hạn ({overdueProjects.length})
                      </div>
                      {overdueProjects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectProject(p);
                            setShowNotifications(false);
                          }}
                          className="p-2 hover:bg-rose-100/60 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="font-semibold text-slate-900 line-clamp-1">{p.code}: {p.title}</div>
                          <div className="text-rose-700 text-[11px] mt-0.5 flex items-center gap-1">
                            <span>Hạn: {p.endDate}</span> • <span>CN: {p.leadResearcherName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {dueSoonProjects.length > 0 && (
                    <div className="p-2 bg-amber-50/40">
                      <div className="px-2 py-1 text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Sắp đến hạn trong 45 ngày ({dueSoonProjects.length})
                      </div>
                      {dueSoonProjects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectProject(p);
                            setShowNotifications(false);
                          }}
                          className="p-2 hover:bg-amber-100/60 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="font-semibold text-slate-900 line-clamp-1">{p.code}: {p.title}</div>
                          <div className="text-amber-700 text-[11px] mt-0.5">
                            Hạn kết thúc: {p.endDate} • {p.department}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {waitingAcceptance.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                        Chờ nghiệm thu ({waitingAcceptance.length})
                      </div>
                      {waitingAcceptance.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectProject(p);
                            setShowNotifications(false);
                          }}
                          className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="font-semibold text-slate-900 line-clamp-1">{p.code}: {p.title}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Kinh phí: {(p.budget / 1_000_000).toFixed(0)} tr VNĐ • {p.leadResearcherName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {totalAlertCount === 0 && (
                    <div className="p-6 text-center text-slate-500">
                      <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      Không có đề tài nào quá hạn hoặc cần đôn đốc gấp.
                    </div>
                  )}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                  Cảnh báo trực quan giao diện (chưa tự động gửi email)
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 text-slate-800 transition-all text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none">
                  Vai trò mô phỏng
                </div>
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {rolesConfig[currentRole].label.split('(')[0]}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 bg-slate-50 border-b border-slate-200">
                  <div className="font-bold text-xs text-slate-900">CHUYỂN ĐỔI VAI TRÒ MÔ PHỎNG</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Trải nghiệm giao diện và phân quyền theo từng góc nhìn
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  {(Object.keys(rolesConfig) as UserRole[]).map((roleKey) => {
                    const r = rolesConfig[roleKey];
                    const isSelected = currentRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => {
                          onRoleChange(roleKey);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors ${
                          isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isSelected ? (
                            <Check className="w-4 h-4 text-blue-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold flex items-center justify-between">
                            <span>{r.label}</span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-blue-600 text-white rounded">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {r.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 leading-normal">
                  💡 Ghi chú: Ở phiên bản đầu, tính năng chuyển vai trò giúp người dùng xem trước các chế độ thao tác và phân quyền tương lai.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
