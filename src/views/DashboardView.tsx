import React from 'react';
import { 
  FileText, 
  BookOpenCheck, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Building2, 
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { ResearchProject, Publication, Researcher, UserRole } from '../types';
import { PROJECT_LEVEL_LABELS, PROJECT_STATUS_LABELS } from '../data/mockData';
import { formatShortVND, formatVND } from '../utils/storage';

interface DashboardViewProps {
  projects: ResearchProject[];
  publications: Publication[];
  researchers: Researcher[];
  currentRole: UserRole;
  onNavigateTab: (tab: 'projects' | 'publications' | 'researchers' | 'monitoring' | 'reports') => void;
  onSelectProject: (p: ResearchProject) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  publications,
  researchers,
  currentRole,
  onNavigateTab,
  onSelectProject,
}) => {
  // Calculations
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'dang_thuc_hien').length;
  const completedProjects = projects.filter((p) => p.status === 'da_nghiem_thu').length;
  const waitingProjects = projects.filter((p) => p.status === 'cho_nghiem_thu').length;
  const overdueProjects = projects.filter((p) => p.status === 'qua_han').length;
  
  const totalPublications = publications.length;
  const internationalPubs = publications.filter((p) => p.type === 'quoc_te').length;
  const nationalPubs = publications.filter((p) => p.type === 'trong_nuoc').length;
  const conferencePubs = publications.filter((p) => p.type === 'hoi_nghi_qt' || p.type === 'hoi_nghi_tn').length;
  const q1q2Pubs = publications.filter((p) => p.rank === 'Q1' || p.rank === 'Q2').length;

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalResearchers = researchers.length;

  // Breakdown by Year
  const yearCounts: Record<number, number> = {};
  projects.forEach((p) => {
    const yr = new Date(p.startDate).getFullYear();
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;
  });
  const yearsSorted = [2022, 2023, 2024, 2025];

  // Breakdown by Department
  const deptCounts: Record<string, { projects: number; budget: number }> = {};
  projects.forEach((p) => {
    if (!deptCounts[p.department]) {
      deptCounts[p.department] = { projects: 0, budget: 0 };
    }
    deptCounts[p.department].projects += 1;
    deptCounts[p.department].budget += p.budget;
  });

  // Urgent list: Overdue + waiting acceptance + due in 30 days
  const today = new Date().toISOString().slice(0, 10);
  const urgentTasks = projects.filter((p) => {
    if (p.status === 'qua_han' || p.status === 'cho_nghiem_thu') return true;
    if (p.status === 'dang_thuc_hien') {
      const end = new Date(p.endDate).getTime();
      const now = new Date(today).getTime();
      const diff = Math.ceil((end - now) / (1000 * 3600 * 24));
      return diff <= 45;
    }
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-400/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Trường Đại học Dược Hà Nội (HUP) • Trung tâm Quản lý NCKH</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tổng quan Hoạt động Nghiên cứu Khoa học
          </h2>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            Hệ thống theo dõi tiến độ thực hiện đề tài, thống kê công bố quốc tế/trong nước, quản lý định mức kinh phí và hỗ trợ báo cáo theo chuẩn Bộ Y tế & Bộ Giáo dục và Đào tạo.
          </p>

          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-blue-200">
            <div>Cơ sở đào tạo: <strong className="text-white">Trường Đại học Dược Hà Nội</strong></div>
            <div>•</div>
            <div>Năm học: <strong className="text-white">2024 - 2025</strong></div>
            <div>•</div>
            <div>Kinh phí cam kết: <strong className="text-white">{formatShortVND(totalBudget)}</strong></div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Đề tài */}
        <div 
          onClick={() => onNavigateTab('projects')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số đề tài</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalProjects}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +18% y/y
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Đang làm: <strong className="text-blue-600">{activeProjects}</strong></span>
            <span>Nghiệm thu: <strong className="text-emerald-600">{completedProjects}</strong></span>
            <span>Trễ hạn: <strong className="text-rose-600">{overdueProjects}</strong></span>
          </div>
        </div>

        {/* Metric 2: Công bố khoa học */}
        <div 
          onClick={() => onNavigateTab('publications')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Công bố khoa học</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpenCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalPublications}</span>
            <span className="text-xs text-indigo-600 font-medium">bài báo & sách</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Quốc tế: <strong className="text-indigo-600">{internationalPubs}</strong></span>
            <span>Q1/Q2: <strong className="text-purple-600">{q1q2Pubs}</strong></span>
            <span>Trong nước: <strong className="text-slate-700">{nationalPubs}</strong></span>
          </div>
        </div>

        {/* Metric 3: Tổng kinh phí */}
        <div 
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng kinh phí NCKH</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {formatShortVND(totalBudget)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Bình quân đề tài:</span>
            <strong className="text-slate-900 font-semibold">
              {totalProjects > 0 ? formatShortVND(totalBudget / totalProjects) : 0}
            </strong>
          </div>
        </div>

        {/* Metric 4: Giảng viên tham gia */}
        <div 
          onClick={() => onNavigateTab('researchers')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhà nghiên cứu</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalResearchers}</span>
            <span className="text-xs text-slate-500">giảng viên & NC viên</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>GS/PGS: <strong className="text-amber-700">3</strong></span>
            <span>Tiến sĩ: <strong className="text-blue-700">4</strong></span>
            <span>Thạc sĩ: <strong className="text-slate-700">1</strong></span>
          </div>
        </div>
      </div>

      {/* Row: Urgent Alert Items & Project Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Urgent Actions & Follow-ups */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Đề tài cần xử lý & Đôn đốc tiến độ</h3>
                <p className="text-xs text-slate-500">Các đề tài quá hạn, sắp đến hạn kết thúc hoặc chờ nghiệm thu</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('monitoring')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
            >
              Xem tất cả tiến độ <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {urgentTasks.slice(0, 5).map((project) => {
              const statusConf = PROJECT_STATUS_LABELS[project.status];
              const isOverdue = project.status === 'qua_han';
              const isWaiting = project.status === 'cho_nghiem_thu';

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="py-3 px-2 -mx-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {project.code}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusConf.badge}`}>
                        {statusConf.label}
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        {project.department}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600">
                      {project.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span>Chủ nhiệm: <strong className="text-slate-700">{project.leadResearcherName}</strong></span>
                      <span>Hạn: <strong className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>{project.endDate}</strong></span>
                      <span className="hidden md:inline">Tiến độ: <strong>{project.completionRate}%</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(project);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              );
            })}

            {urgentTasks.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                Hiện không có đề tài nào cần đôn đốc khẩn cấp.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Trạng thái Đề tài Nghiên cứu</h3>
            <p className="text-xs text-slate-500 mb-4">Phân bổ theo giai đoạn thực hiện hiện tại</p>

            <div className="space-y-3.5">
              {[
                { status: 'dang_thuc_hien', label: 'Đang thực hiện', count: activeProjects, color: 'bg-blue-600', text: 'text-blue-600' },
                { status: 'da_nghiem_thu', label: 'Đã nghiệm thu', count: completedProjects, color: 'bg-emerald-500', text: 'text-emerald-600' },
                { status: 'cho_nghiem_thu', label: 'Chờ nghiệm thu', count: waitingProjects, color: 'bg-amber-500', text: 'text-amber-600' },
                { status: 'qua_han', label: 'Quá hạn', count: overdueProjects, color: 'bg-rose-500', text: 'text-rose-600' },
                { status: 'de_xuat', label: 'Đang đề xuất', count: projects.filter(p => p.status === 'de_xuat').length, color: 'bg-slate-400', text: 'text-slate-600' },
              ].map((item) => {
                const pct = totalProjects > 0 ? Math.round((item.count / totalProjects) * 100) : 0;
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="font-bold text-slate-900">
                        {item.count} đề tài <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl flex items-center justify-between text-xs">
            <span className="text-slate-600">Tỷ lệ nghiệm thu thành công:</span>
            <span className="font-bold text-emerald-700">
              {totalProjects > 0 ? Math.round((completedProjects / (completedProjects + overdueProjects || 1)) * 100) : 100}%
            </span>
          </div>
        </div>
      </div>

      {/* Row: Analytics Charts by Year & Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Projects by Year */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Số lượng đề tài qua các năm</h3>
              <p className="text-xs text-slate-500">Thống kê theo năm phê duyệt bắt đầu (2022 - 2025)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Xu hướng tăng trưởng
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-52 flex items-end justify-between gap-4 pt-6 px-4 border-b border-slate-200">
            {yearsSorted.map((yr) => {
              const count = yearCounts[yr] || 0;
              const maxCount = Math.max(...Object.values(yearCounts), 5);
              const heightPct = Math.max((count / maxCount) * 100, 15);
              const isCurrent = yr === 2024;

              return (
                <div key={yr} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {count} đề tài
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-full">
                    <div 
                      className={`w-full transition-all duration-500 rounded-t-lg group-hover:brightness-95 ${
                        isCurrent 
                          ? 'bg-blue-600 shadow-md shadow-blue-500/20' 
                          : 'bg-indigo-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold pb-1 ${isCurrent ? 'text-blue-700 font-bold' : 'text-slate-600'}`}>
                    Năm {yr}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-600"></div>
              <span>Năm trọng điểm (2024)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-400"></div>
              <span>Các năm khác</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Publications by Category / Rank */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cơ cấu Công bố Khoa học</h3>
              <p className="text-xs text-slate-500">Phân loại theo chỉ mục CSDL & Phân hạng chất lượng</p>
            </div>
            <button
              onClick={() => onNavigateTab('publications')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Chi tiết →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
            <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-center">
              <div className="text-xl font-extrabold text-red-700">
                {publications.filter(p => p.rank === 'Q1').length}
              </div>
              <div className="text-[11px] font-bold text-red-800 mt-0.5">Scopus/WoS Q1</div>
              <div className="text-[10px] text-red-600">Chất lượng cao nhất</div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
              <div className="text-xl font-extrabold text-blue-700">
                {publications.filter(p => p.rank === 'Q2').length}
              </div>
              <div className="text-[11px] font-bold text-blue-800 mt-0.5">Scopus/WoS Q2</div>
              <div className="text-[10px] text-blue-600">Uy tín quốc tế</div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
              <div className="text-xl font-extrabold text-emerald-700">{nationalPubs}</div>
              <div className="text-[11px] font-bold text-emerald-800 mt-0.5">Tạp chí Trong nước</div>
              <div className="text-[10px] text-emerald-600">Tính điểm HĐGSNN</div>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
              <div className="text-xl font-extrabold text-purple-700">{conferencePubs}</div>
              <div className="text-[11px] font-bold text-purple-800 mt-0.5">Kỷ yếu Hội nghị</div>
              <div className="text-[10px] text-purple-600">IEEE, Springer...</div>
            </div>
          </div>

          {/* Department Breakdown Horizontal List */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Phân bổ đề tài theo đơn vị chủ trì
            </h4>
            <div className="space-y-2 text-xs">
              {Object.entries(deptCounts).slice(0, 4).map(([dept, data]) => {
                const pct = Math.round((data.budget / totalBudget) * 100);
                return (
                  <div key={dept} className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-700 truncate w-1/2" title={dept}>
                      {dept}
                    </span>
                    <span className="text-slate-500 shrink-0">{data.projects} đề tài</span>
                    <span className="font-semibold text-slate-900 shrink-0 w-24 text-right">
                      {formatShortVND(data.budget)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div 
          onClick={() => onNavigateTab('projects')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Quản lý Đề tài</h4>
              <p className="text-xs text-slate-500">Thêm mới, phê duyệt, nghiệm thu</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div 
          onClick={() => onNavigateTab('monitoring')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Theo dõi Tiến độ</h4>
              <p className="text-xs text-slate-500">Cập nhật mốc, xử lý việc trễ hạn</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div 
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Xuất Báo cáo & Excel</h4>
              <p className="text-xs text-slate-500">Tổng hợp số liệu chuẩn Bộ GD&ĐT</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
