import React, { useRef, useState } from 'react';
import { 
  Settings, 
  Database, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Building2,
  Users,
  KeyRound,
  FileCheck2,
  Lock
} from 'lucide-react';
import { UserRole } from '../types';
import { DEPARTMENTS } from '../data/mockData';
import { exportAllDataJSON, importAllDataJSON, resetAllData } from '../utils/storage';
import { ConfirmModal } from '../components/ConfirmModal';

interface SettingsViewProps {
  currentRole: UserRole;
  onRoleChange: (r: UserRole) => void;
  onDataReloaded: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  projectCount: number;
  pubCount: number;
  researcherCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  onRoleChange,
  onDataReloaded,
  onShowToast,
  projectCount,
  pubCount,
  researcherCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const handleReset = () => {
    resetAllData();
    onDataReloaded();
    setShowResetConfirm(false);
    onShowToast('Đã khôi phục dữ liệu mẫu ban đầu thành công!', 'success');
  };

  const handleExportJSON = () => {
    exportAllDataJSON();
    onShowToast('Đã tải xuống tệp sao lưu JSON.', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importAllDataJSON(content);
        if (res.success) {
          onDataReloaded();
          onShowToast(res.message, 'success');
        } else {
          onShowToast(res.message, 'error');
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePurgeAll = () => {
    localStorage.removeItem('srms_projects_v1');
    localStorage.removeItem('srms_publications_v1');
    localStorage.removeItem('srms_researchers_v1');
    onDataReloaded();
    setShowPurgeConfirm(false);
    onShowToast('Đã xóa toàn bộ dữ liệu trên trình duyệt!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700" />
            Cài đặt Hệ thống & Quản trị Dữ liệu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý lưu trữ cục bộ, phân quyền mô phỏng, sao lưu dự phòng và thông tin phiên bản
          </p>
        </div>
      </div>

      {/* Scope and Transparency Section */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-blue-950 text-sm">
              Phạm vi phiên bản thử nghiệm (Phase 1)
            </h3>
            <p className="text-xs text-blue-800">
              Công bố rõ ràng về kiến trúc lưu trữ và tính năng phân quyền
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-blue-900">
          <div className="p-3 bg-white/80 rounded-xl border border-blue-100 space-y-1">
            <strong className="font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" /> Lưu trữ cục bộ (LocalStorage)
            </strong>
            <p className="text-slate-600 leading-relaxed">
              Mọi thay đổi dữ liệu (thêm, sửa, xóa đề tài, công bố, nhà nghiên cứu) được lưu trực tiếp trên trình duyệt của bạn. Dữ liệu này độc lập và chưa được đồng bộ hoặc chia sẻ tập trung qua máy chủ đám mây.
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-blue-100 space-y-1">
            <strong className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" /> Mô phỏng vai trò người dùng
            </strong>
            <p className="text-slate-600 leading-relaxed">
              Phiên bản hiện tại chưa tích hợp xác thực thực tế (SSO/LDAP/Mật khẩu). Chức năng chuyển đổi vai trò ở thanh công cụ giúp mô phỏng luồng thao tác của Quản trị viên, Cán bộ QLKH, Lãnh đạo và Giảng viên.
            </p>
          </div>
        </div>
      </div>

      {/* Database Management Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            Quản trị & Sao lưu Dữ liệu NCKH
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hiện có <strong className="text-slate-900">{projectCount}</strong> đề tài, <strong className="text-slate-900">{pubCount}</strong> công bố, <strong className="text-slate-900">{researcherCount}</strong> nhà nghiên cứu trong bộ nhớ trình duyệt.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action 1: Reset Default */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900 text-xs">Khôi phục Dữ liệu mẫu</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              Nạp lại danh sách đề tài và bài báo mẫu đại học chuẩn ban đầu.
            </div>
          </button>

          {/* Action 2: Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900 text-xs">Sao lưu file JSON</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              Tải toàn bộ cơ sở dữ liệu về máy tính dưới dạng tệp JSON dự phòng.
            </div>
          </button>

          {/* Action 3: Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900 text-xs">Nhập dữ liệu từ JSON</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              Phục hồi dữ liệu từ bản sao lưu JSON đã tải về trước đó.
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </button>

          {/* Action 4: Purge All */}
          <button
            onClick={() => setShowPurgeConfirm(true)}
            className="p-4 rounded-xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="font-bold text-rose-700 text-xs">Xóa trắng bộ nhớ</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              Xóa sạch toàn bộ bản ghi trên trình duyệt để bắt đầu nhập thủ công.
            </div>
          </button>
        </div>
      </div>

      {/* Role Configuration Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Phân quyền vai trò trong hệ thống
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng mô tả quyền hạn của 4 nhóm người dùng theo yêu cầu thiết kế
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <th className="py-2.5 px-3">Nhóm người dùng</th>
                <th className="py-2.5 px-3">Phạm vi trách nhiệm</th>
                <th className="py-2.5 px-3">Thao tác chính</th>
                <th className="py-2.5 px-3 text-center">Trạng thái mô phỏng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Quản trị viên (Admin)</td>
                <td className="py-2.5 px-3 text-slate-600">Quản lý toàn bộ danh mục, người dùng, cấu hình và dữ liệu gốc</td>
                <td className="py-2.5 px-3 text-slate-600">Toàn quyền thêm, sửa, xóa, khôi phục hệ thống</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                    Sẵn sàng
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Cán bộ Quản lý Khoa học</td>
                <td className="py-2.5 px-3 text-slate-600">Theo dõi tiến độ, đôn đốc nghiệm thu, thẩm định công bố, lập báo cáo</td>
                <td className="py-2.5 px-3 text-slate-600">Cập nhật mốc, duyệt trạng thái, xuất Excel</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                    Mặc định
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Ban Lãnh đạo Trường / Khoa</td>
                <td className="py-2.5 px-3 text-slate-600">Theo dõi KPI chiến lược, phân bổ ngân sách, phê duyệt danh mục trọng điểm</td>
                <td className="py-2.5 px-3 text-slate-600">Xem biểu đồ, thống kê đa chiều, xem báo cáo</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    Sẵn sàng
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Giảng viên / Nhà nghiên cứu</td>
                <td className="py-2.5 px-3 text-slate-600">Cập nhật lý lịch khoa học, đăng ký đề tài, khai báo bài báo và mốc tiến độ</td>
                <td className="py-2.5 px-3 text-slate-600">Khai báo công bố, cập nhật tiến độ đề tài phụ trách</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    Sẵn sàng
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Khôi phục dữ liệu mẫu ban đầu?"
        message="Hành động này sẽ thay thế các bản ghi hiện tại bằng tập dữ liệu đề tài, công bố khoa học và giảng viên mẫu tiêu chuẩn của trường đại học."
        confirmLabel="Đồng ý khôi phục"
        isDestructive={false}
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmModal
        isOpen={showPurgeConfirm}
        title="Xóa toàn bộ dữ liệu trên trình duyệt?"
        message="Cảnh báo: Toàn bộ danh mục đề tài, bài báo và nhà nghiên cứu trong LocalStorage sẽ bị xóa sạch. Bạn sẽ cần nhập mới hoặc nạp lại dữ liệu mẫu."
        confirmLabel="Xác nhận xóa sạch"
        isDestructive={true}
        onConfirm={handlePurgeAll}
        onCancel={() => setShowPurgeConfirm(false)}
      />
    </div>
  );
};
