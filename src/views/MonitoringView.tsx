import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  User, 
  Building2, 
  Plus, 
  Trash2, 
  Info, 
  ChevronRight, 
  ShieldAlert, 
  Edit3, 
  Save, 
  Check,
  Search,
  ExternalLink
} from 'lucide-react';
import { ResearchProject, Milestone, UserRole } from '../types';
import { formatDate } from '../utils/storage';

interface MonitoringViewProps {
  projects: ResearchProject[];
  currentRole: UserRole;
  onUpdateProject: (p: ResearchProject) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSelectProjectDetail: (p: ResearchProject) => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  projects,
  currentRole,
  onUpdateProject,
  onShowToast,
  onSelectProjectDetail,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'overdue' | 'dueSoon' | 'waiting'>('all');
  const [searchProject, setSearchProject] = useState('');
  const [activeProjectForMilestones, setActiveProjectForMilestones] = useState<ResearchProject | null>(null);

  // New milestone draft
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [newMilestoneAssignee, setNewMilestoneAssignee] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const nowMs = new Date(todayStr).getTime();

  // Categorize projects
  const overdueProjects = projects.filter((p) => {
    if (p.status === 'qua_han') return true;
    if (p.status === 'dang_thuc_hien' && p.endDate < todayStr) return true;
    return false;
  });

  const dueSoonProjects = projects.filter((p) => {
    if (p.status !== 'dang_thuc_hien') return false;
    const endMs = new Date(p.endDate).getTime();
    const diffDays = Math.ceil((endMs - nowMs) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 45;
  });

  const waitingProjects = projects.filter((p) => p.status === 'cho_nghiem_thu');

  // Filtered
  const displayProjects = projects.filter((p) => {
    if (filterMode === 'overdue' && !overdueProjects.some(op => op.id === p.id)) return false;
    if (filterMode === 'dueSoon' && !dueSoonProjects.some(dsp => dsp.id === p.id)) return false;
    if (filterMode === 'waiting' && p.status !== 'cho_nghiem_thu') return false;

    if (searchProject.trim()) {
      const q = searchProject.toLowerCase();
      const matchCode = p.code.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchLead = p.leadResearcherName.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchLead) return false;
    }
    return true;
  });

  // Handle milestone update
  const handleUpdateMilestoneStatus = (
    project: ResearchProject,
    milestoneId: string,
    newStatus: Milestone['status'],
    newProgress?: number
  ) => {
    const updatedMilestones = project.milestones.map((m) => {
      if (m.id === milestoneId) {
        const progress = newProgress !== undefined ? newProgress : newStatus === 'hoan_thanh' ? 100 : m.progressPct;
        return {
          ...m,
          status: newStatus,
          progressPct: progress,
          completedDate: newStatus === 'hoan_thanh' ? todayStr : undefined,
        };
      }
      return m;
    });

    // Calculate new average progress
    const avgProgress = Math.round(
      updatedMilestones.reduce((s, m) => s + m.progressPct, 0) / (updatedMilestones.length || 1)
    );

    const updatedProj: ResearchProject = {
      ...project,
      milestones: updatedMilestones,
      completionRate: avgProgress,
      status: avgProgress === 100 && project.status === 'dang_thuc_hien' ? 'cho_nghiem_thu' : project.status,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProject(updatedProj);
    if (activeProjectForMilestones?.id === project.id) {
      setActiveProjectForMilestones(updatedProj);
    }
    onShowToast('Đã cập nhật tiến độ mốc công việc!', 'success');
  };

  const handleAddMilestoneToProject = (project: ResearchProject) => {
    if (!newMilestoneTitle.trim()) {
      onShowToast('Vui lòng nhập tên mốc công việc', 'error');
      return;
    }

    const newM: Milestone = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      dueDate: newMilestoneDueDate || project.endDate,
      assignee: newMilestoneAssignee.trim() || project.leadResearcherName,
      status: 'chua_bat_dau',
      progressPct: 0,
    };

    const updatedMilestones = [...(project.milestones || []), newM];
    const avgProgress = Math.round(
      updatedMilestones.reduce((s, m) => s + m.progressPct, 0) / (updatedMilestones.length || 1)
    );

    const updatedProj: ResearchProject = {
      ...project,
      milestones: updatedMilestones,
      completionRate: avgProgress,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProject(updatedProj);
    setActiveProjectForMilestones(updatedProj);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
    setNewMilestoneAssignee('');
    onShowToast('Đã thêm mốc tiến độ mới!', 'success');
  };

  const handleDeleteMilestone = (project: ResearchProject, milestoneId: string) => {
    const updatedMilestones = project.milestones.filter((m) => m.id !== milestoneId);
    const avgProgress = updatedMilestones.length
      ? Math.round(updatedMilestones.reduce((s, m) => s + m.progressPct, 0) / updatedMilestones.length)
      : project.completionRate;

    const updatedProj: ResearchProject = {
      ...project,
      milestones: updatedMilestones,
      completionRate: avgProgress,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProject(updatedProj);
    setActiveProjectForMilestones(updatedProj);
    onShowToast('Đã xóa mốc tiến độ', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-600" />
            Theo dõi Tiến độ & Đôn đốc Nghiệm thu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cập nhật chi tiết các mốc nhiệm vụ, tỷ lệ hoàn thành và cảnh báo thời hạn đề tài
          </p>
        </div>
      </div>

      {/* Transparent Disclaimer Notice mandated by requirements */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-950">
            Cơ chế cảnh báo trực quan trên giao diện ứng dụng
          </div>
          <p className="text-amber-800 leading-relaxed">
            Trong phiên bản đầu tiên này, hệ thống tập trung nhận diện và hiển thị trực quan các cảnh báo đề tài trễ hạn, sắp đến hạn và chờ nghiệm thu ngay trên màn hình. Hệ thống <strong>không giả lập việc đã gửi email hoặc tin nhắn SMS tự động</strong> ra bên ngoài.
          </p>
        </div>
      </div>

      {/* KPI Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterMode(filterMode === 'overdue' ? 'all' : 'overdue')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            filterMode === 'overdue' 
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20' 
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Đề tài quá hạn</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-700 mt-2">{overdueProjects.length}</div>
          <p className="text-xs text-rose-600 mt-1">Đã quá ngày kết thúc được duyệt</p>
        </div>

        <div 
          onClick={() => setFilterMode(filterMode === 'dueSoon' ? 'all' : 'dueSoon')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            filterMode === 'dueSoon' 
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20' 
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Sắp đến hạn (≤ 45 ngày)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-700 mt-2">{dueSoonProjects.length}</div>
          <p className="text-xs text-amber-600 mt-1">Cần hoàn thiện báo cáo tổng kết</p>
        </div>

        <div 
          onClick={() => setFilterMode(filterMode === 'waiting' ? 'all' : 'waiting')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            filterMode === 'waiting' 
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20' 
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Chờ nghiệm thu</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-blue-700 mt-2">{waitingProjects.length}</div>
          <p className="text-xs text-blue-600 mt-1">Đang chờ thành lập Hội đồng đánh giá</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchProject}
            onChange={(e) => setSearchProject(e.target.value)}
            placeholder="Tìm kiếm đề tài để theo dõi tiến độ..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Bộ lọc:</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
            {filterMode === 'all' ? 'Tất cả đề tài' : filterMode === 'overdue' ? 'Đề tài quá hạn' : filterMode === 'dueSoon' ? 'Sắp đến hạn' : 'Chờ nghiệm thu'}
          </span>
          {filterMode !== 'all' && (
            <button
              onClick={() => setFilterMode('all')}
              className="text-blue-600 hover:underline"
            >
              Xem tất cả
            </button>
          )}
        </div>
      </div>

      {/* Projects List with Inline Milestone Monitor */}
      <div className="space-y-4">
        {displayProjects.map((project) => {
          const isOverdue = overdueProjects.some(op => op.id === project.id);
          const isDueSoon = dueSoonProjects.some(dp => dp.id === project.id);
          const isWaiting = project.status === 'cho_nghiem_thu';

          return (
            <div
              key={project.id}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                isOverdue
                  ? 'border-rose-300 bg-rose-50/20'
                  : isDueSoon
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Project Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {project.code}
                    </span>
                    {isOverdue && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> QUÁ HẠN NGHIỆM THU
                      </span>
                    )}
                    {isDueSoon && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> SẮP ĐẾN HẠN
                      </span>
                    )}
                    {isWaiting && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> CHỜ NGHIỆM THU
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {project.department}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {project.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-0.5">
                    <span>Chủ nhiệm: <strong className="text-slate-800">{project.leadResearcherName}</strong></span>
                    <span>•</span>
                    <span>Thời hạn: <strong className={isOverdue ? 'text-rose-600' : 'text-slate-800'}>{formatDate(project.startDate)} → {formatDate(project.endDate)}</strong></span>
                  </div>
                </div>

                {/* Progress Circle & Detail Button */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 font-medium">Tiến độ tổng thể</div>
                    <div className="text-lg font-extrabold text-blue-700">{project.completionRate}%</div>
                  </div>

                  <button
                    onClick={() => onSelectProjectDetail(project)}
                    className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    Hồ sơ đề tài <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span>Các mốc công việc & nhiệm vụ ({project.milestones?.length || 0})</span>
                  <button
                    onClick={() => setActiveProjectForMilestones(project)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 lowercase"
                  >
                    <Plus className="w-3.5 h-3.5" /> thêm mốc mới
                  </button>
                </div>

                <div className="grid grid-cols-1 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  {project.milestones && project.milestones.length > 0 ? (
                    project.milestones.map((m, idx) => {
                      const isDone = m.status === 'hoan_thanh';
                      const isLate = m.status === 'tre_han';

                      return (
                        <div key={m.id} className="p-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() =>
                                handleUpdateMilestoneStatus(
                                  project,
                                  m.id,
                                  isDone ? 'dang_thuc_hien' : 'hoan_thanh',
                                  isDone ? 50 : 100
                                )
                              }
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                                isDone 
                                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                                  : 'border-slate-300 hover:border-slate-400 bg-white'
                              }`}
                              title={isDone ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                            >
                              {isDone && <Check className="w-3.5 h-3.5" />}
                            </button>

                            <div className="min-w-0">
                              <span className={`font-semibold block truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {m.title}
                              </span>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                                <span>Hạn: <strong className={isLate ? 'text-rose-600' : 'text-slate-700'}>{formatDate(m.dueDate)}</strong></span>
                                <span>Phụ trách: <strong>{m.assignee}</strong></span>
                                {m.note && <span className="italic text-slate-400 truncate max-w-xs">{m.note}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Status selector */}
                            <select
                              value={m.status}
                              onChange={(e) =>
                                handleUpdateMilestoneStatus(project, m.id, e.target.value as Milestone['status'])
                              }
                              className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                                isDone 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : isLate 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              <option value="chua_bat_dau">Chưa bắt đầu</option>
                              <option value="dang_thuc_hien">Đang làm</option>
                              <option value="hoan_thanh">Đã hoàn thành</option>
                              <option value="tre_han">Trễ hạn</option>
                            </select>

                            <button
                              onClick={() => handleDeleteMilestone(project, m.id)}
                              className="text-slate-300 hover:text-rose-600 p-1 rounded"
                              title="Xóa mốc"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      Đề tài này chưa thiết lập các mốc tiến độ cụ thể.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayProjects.length === 0 && (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tất cả đề tài đều đang tiến triển thuận lợi</p>
            <p className="text-xs text-slate-400 mt-1">Không có đề tài nào nằm trong danh mục lọc hiện tại.</p>
          </div>
        )}
      </div>

      {/* Modal Add Milestone Quickly */}
      {activeProjectForMilestones && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Thêm Mốc Tiến độ Mới
              </h3>
              <button
                onClick={() => setActiveProjectForMilestones(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Đề tài: <strong>{activeProjectForMilestones.code}</strong> - {activeProjectForMilestones.title.slice(0, 45)}...
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung mốc công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g. Thu thập mẫu đợt 2, nộp báo cáo sơ kết..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Thời hạn hoàn thành
                </label>
                <input
                  type="date"
                  value={newMilestoneDueDate}
                  onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Người chịu trách nhiệm chính
                </label>
                <input
                  type="text"
                  value={newMilestoneAssignee}
                  onChange={(e) => setNewMilestoneAssignee(e.target.value)}
                  placeholder={activeProjectForMilestones.leadResearcherName}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveProjectForMilestones(null)}
                className="px-4 py-2 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleAddMilestoneToProject(activeProjectForMilestones)}
                className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Lưu mốc tiến độ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
