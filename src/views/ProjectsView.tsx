import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  User, 
  Layers, 
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { ResearchProject, ProjectLevel, ProjectStatus, Researcher, Publication, UserRole } from '../types';
import { DEPARTMENTS, PROJECT_LEVEL_LABELS, PROJECT_STATUS_LABELS } from '../data/mockData';
import { formatShortVND, formatVND, formatDate, exportProjectsToExcel, exportProjectsToCSV } from '../utils/storage';
import { ProjectModal } from '../components/ProjectModal';
import { ProjectDetailModal } from '../components/ProjectDetailModal';
import { ConfirmModal } from '../components/ConfirmModal';

interface ProjectsViewProps {
  projects: ResearchProject[];
  publications: Publication[];
  researchers: Researcher[];
  currentRole: UserRole;
  onSaveProject: (p: ResearchProject) => void;
  onDeleteProject: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  selectedProjectForDetail?: ResearchProject | null;
  onClearSelectedProject?: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  publications,
  researchers,
  currentRole,
  onSaveProject,
  onDeleteProject,
  onShowToast,
  selectedProjectForDetail,
  onClearSelectedProject,
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [quickTab, setQuickTab] = useState<string>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);
  const [viewingProject, setViewingProject] = useState<ResearchProject | null>(selectedProjectForDetail || null);
  const [deletingProject, setDeletingProject] = useState<ResearchProject | null>(null);

  // Sync if selected from outside
  React.useEffect(() => {
    if (selectedProjectForDetail) {
      setViewingProject(selectedProjectForDetail);
    }
  }, [selectedProjectForDetail]);

  // Tab counts
  const countAll = projects.length;
  const countActive = projects.filter((p) => p.status === 'dang_thuc_hien').length;
  const countWaiting = projects.filter((p) => p.status === 'cho_nghiem_thu').length;
  const countOverdue = projects.filter((p) => p.status === 'qua_han').length;
  const countDone = projects.filter((p) => p.status === 'da_nghiem_thu').length;

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Quick tab
      if (quickTab === 'active' && p.status !== 'dang_thuc_hien') return false;
      if (quickTab === 'waiting' && p.status !== 'cho_nghiem_thu') return false;
      if (quickTab === 'overdue' && p.status !== 'qua_han') return false;
      if (quickTab === 'done' && p.status !== 'da_nghiem_thu') return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchCode = p.code.toLowerCase().includes(q);
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchLead = p.leadResearcherName.toLowerCase().includes(q);
        const matchDept = p.department.toLowerCase().includes(q);
        const matchMembers = p.members.some((m) => m.toLowerCase().includes(q));
        if (!matchCode && !matchTitle && !matchLead && !matchDept && !matchMembers) return false;
      }

      // Dropdown filters
      if (filterLevel !== 'all' && p.level !== filterLevel) return false;
      if (filterDept !== 'all' && p.department !== filterDept) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterYear !== 'all') {
        const startYr = new Date(p.startDate).getFullYear().toString();
        if (startYr !== filterYear) return false;
      }

      return true;
    });
  }, [projects, quickTab, searchTerm, filterLevel, filterDept, filterStatus, filterYear]);

  // Handlers
  const handleAddNew = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (p: ResearchProject) => {
    setEditingProject(p);
    setIsModalOpen(true);
  };

  const handleSave = (saved: ResearchProject) => {
    onSaveProject(saved);
    setIsModalOpen(false);
    setEditingProject(null);
    onShowToast('Đã lưu thông tin đề tài thành công!', 'success');
  };

  const handleDeleteConfirm = () => {
    if (deletingProject) {
      onDeleteProject(deletingProject.id);
      onShowToast(`Đã xóa đề tài ${deletingProject.code}`, 'info');
      setDeletingProject(null);
    }
  };

  const handleExportExcel = () => {
    exportProjectsToExcel(filteredProjects);
    onShowToast(`Đã xuất ${filteredProjects.length} đề tài ra file Excel (.xlsx)`, 'success');
  };

  const handleExportCSV = () => {
    exportProjectsToCSV(filteredProjects);
    onShowToast(`Đã xuất ${filteredProjects.length} đề tài ra file CSV`, 'success');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterLevel('all');
    setFilterDept('all');
    setFilterStatus('all');
    setFilterYear('all');
    setQuickTab('all');
  };

  const hasActiveFilters = 
    searchTerm || filterLevel !== 'all' || filterDept !== 'all' || filterStatus !== 'all' || filterYear !== 'all' || quickTab !== 'all';

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Quản lý Đề tài Nghiên cứu Khoa học
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi danh mục đề tài các cấp, tiến độ thực hiện, kinh phí và phân bổ sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg border border-slate-300 bg-white shadow-xs overflow-hidden">
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors border-r border-slate-200"
              title="Xuất file Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              title="Xuất file CSV (UTF-8)"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>CSV</span>
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm đề tài mới</span>
          </button>
        </div>
      </div>

      {/* Quick Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setQuickTab('all')}
          className={`px-3 py-2 rounded-lg font-semibold transition-all shrink-0 ${
            quickTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Tất cả ({countAll})
        </button>
        <button
          onClick={() => setQuickTab('active')}
          className={`px-3 py-2 rounded-lg font-semibold transition-all shrink-0 ${
            quickTab === 'active'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-blue-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          Đang thực hiện ({countActive})
        </button>
        <button
          onClick={() => setQuickTab('waiting')}
          className={`px-3 py-2 rounded-lg font-semibold transition-all shrink-0 ${
            quickTab === 'waiting'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-slate-200'
          }`}
        >
          Chờ nghiệm thu ({countWaiting})
        </button>
        <button
          onClick={() => setQuickTab('overdue')}
          className={`px-3 py-2 rounded-lg font-semibold transition-all shrink-0 ${
            quickTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-slate-200'
          }`}
        >
          Quá hạn ({countOverdue})
        </button>
        <button
          onClick={() => setQuickTab('done')}
          className={`px-3 py-2 rounded-lg font-semibold transition-all shrink-0 ${
            quickTab === 'done'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          Đã nghiệm thu ({countDone})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã, tên đề tài, chủ nhiệm, thành viên..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả cấp đề tài</option>
              {Object.entries(PROJECT_LEVEL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả đơn vị chủ trì</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả năm bắt đầu</option>
              <option value="2025">Năm 2025</option>
              <option value="2024">Năm 2024</option>
              <option value="2023">Năm 2023</option>
              <option value="2022">Năm 2022</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Tìm thấy <strong className="text-slate-900">{filteredProjects.length}</strong> / {projects.length} đề tài phù hợp
            </span>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Projects Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Mã & Tên đề tài</th>
                <th className="py-3 px-4">Cấp đề tài</th>
                <th className="py-3 px-4">Chủ nhiệm & Đơn vị</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4 text-right">Kinh phí (VNĐ)</th>
                <th className="py-3 px-4 text-center">Tiến độ</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((project, idx) => {
                const levelInfo = PROJECT_LEVEL_LABELS[project.level] || { label: project.level, badge: 'bg-slate-100 text-slate-700' };
                const statusInfo = PROJECT_STATUS_LABELS[project.status] || { label: project.status, badge: 'bg-slate-100 text-slate-700' };

                return (
                  <tr 
                    key={project.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setViewingProject(project)}
                  >
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {project.code}
                        </span>
                        {project.notes && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 truncate max-w-[150px]">
                            {project.notes}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {project.title}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${levelInfo.badge}`}>
                        {levelInfo.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {project.leadResearcherName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {project.department}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-600">
                      <div>{formatDate(project.startDate)}</div>
                      <div className="text-slate-400">đến {formatDate(project.endDate)}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatShortVND(project.budget)}
                    </td>

                    <td className="py-3.5 px-4 text-center w-28">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-14 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              project.completionRate === 100 
                                ? 'bg-emerald-500' 
                                : project.status === 'qua_han' 
                                ? 'bg-rose-500' 
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${project.completionRate}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">
                          {project.completionRate}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.badge}`}>
                        {statusInfo.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingProject(project)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết đề tài"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Sửa đề tài"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProject(project)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa đề tài"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">Không tìm thấy đề tài nào</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử điều chỉnh lại từ khóa hoặc các bộ lọc phía trên.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị <strong className="text-slate-900">{filteredProjects.length}</strong> đề tài trong tổng số {projects.length} đề tài.
          </div>
          <div className="flex items-center gap-3">
            <span>Tổng kinh phí hiển thị: <strong className="text-slate-900 font-bold">{formatShortVND(filteredProjects.reduce((s, p) => s + p.budget, 0))}</strong></span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSave}
        projectToEdit={editingProject}
        researchers={researchers}
      />

      <ProjectDetailModal
        project={viewingProject}
        onClose={() => {
          setViewingProject(null);
          if (onClearSelectedProject) onClearSelectedProject();
        }}
        onEdit={(p) => {
          setViewingProject(null);
          handleEdit(p);
        }}
        publications={publications}
      />

      <ConfirmModal
        isOpen={!!deletingProject}
        title="Xác nhận xóa đề tài nghiên cứu"
        message={`Bạn có chắc chắn muốn xóa đề tài "${deletingProject?.code} - ${deletingProject?.title}"? Mọi mốc tiến độ liên quan sẽ bị gỡ bỏ.`}
        confirmLabel="Xác nhận xóa"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProject(null)}
      />
    </div>
  );
};
