import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  Building2, 
  Award, 
  DollarSign, 
  FileText, 
  BookOpenCheck, 
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ResearchProject, Publication, Researcher, UserRole } from '../types';
import { DEPARTMENTS, PROJECT_LEVEL_LABELS, PROJECT_STATUS_LABELS, INDEXING_LABELS } from '../data/mockData';
import { formatVND, formatShortVND, formatDate } from '../utils/storage';

interface ReportsViewProps {
  projects: ResearchProject[];
  publications: Publication[];
  researchers: Researcher[];
  currentRole: UserRole;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  publications,
  researchers,
  currentRole,
  onShowToast,
}) => {
  // Report criteria
  const [reportYear, setReportYear] = useState<string>('all');
  const [reportDept, setReportDept] = useState<string>('all');
  const [reportLevel, setReportLevel] = useState<string>('all');

  // Filtered data based on explicit criteria
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (reportYear !== 'all') {
        const startYr = new Date(p.startDate).getFullYear().toString();
        if (startYr !== reportYear) return false;
      }
      if (reportDept !== 'all' && p.department !== reportDept) return false;
      if (reportLevel !== 'all' && p.level !== reportLevel) return false;
      return true;
    });
  }, [projects, reportYear, reportDept, reportLevel]);

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      if (reportYear !== 'all' && pub.publicationYear.toString() !== reportYear) return false;
      if (reportDept !== 'all' && pub.department !== reportDept) return false;
      return true;
    });
  }, [publications, reportYear, reportDept]);

  // Calculations for current report
  const totalBudget = filteredProjects.reduce((s, p) => s + p.budget, 0);
  const q1Pubs = filteredPublications.filter((p) => p.rank === 'Q1').length;
  const q2Pubs = filteredPublications.filter((p) => p.rank === 'Q2').length;
  const nationalPubs = filteredPublications.filter((p) => p.type === 'trong_nuoc').length;
  const completedProjects = filteredProjects.filter((p) => p.status === 'da_nghiem_thu').length;

  // Level Matrix
  const levelStats: Record<string, { count: number; budget: number }> = {};
  filteredProjects.forEach((p) => {
    if (!levelStats[p.level]) levelStats[p.level] = { count: 0, budget: 0 };
    levelStats[p.level].count += 1;
    levelStats[p.level].budget += p.budget;
  });

  // Department Matrix
  const deptMatrix: Record<string, { projects: number; budget: number; pubs: number; q1q2: number }> = {};
  DEPARTMENTS.forEach((d) => {
    deptMatrix[d] = { projects: 0, budget: 0, pubs: 0, q1q2: 0 };
  });

  filteredProjects.forEach((p) => {
    if (deptMatrix[p.department]) {
      deptMatrix[p.department].projects += 1;
      deptMatrix[p.department].budget += p.budget;
    }
  });

  filteredPublications.forEach((pub) => {
    if (deptMatrix[pub.department]) {
      deptMatrix[pub.department].pubs += 1;
      if (pub.rank === 'Q1' || pub.rank === 'Q2') {
        deptMatrix[pub.department].q1q2 += 1;
      }
    }
  });

  // Export comprehensive multi-sheet Excel report
  const handleExportFullExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng hợp
    const summaryRows = [
      { 'CHỈ SỐ BÁO CÁO': 'Cơ quan chủ quản', 'GIÁ TRỊ': 'Bộ Y tế' },
      { 'CHỈ SỐ BÁO CÁO': 'Đơn vị đào tạo', 'GIÁ TRỊ': 'Trường Đại học Dược Hà Nội (HUP)' },
      { 'CHỈ SỐ BÁO CÁO': 'Năm báo cáo', 'GIÁ TRỊ': reportYear === 'all' ? 'Toàn bộ các năm' : reportYear },
      { 'CHỈ SỐ BÁO CÁO': 'Đơn vị lọc', 'GIÁ TRỊ': reportDept === 'all' ? 'Toàn trường' : reportDept },
      { 'CHỈ SỐ BÁO CÁO': 'Cấp đề tài lọc', 'GIÁ TRỊ': reportLevel === 'all' ? 'Tất cả các cấp' : reportLevel },
      { 'CHỈ SỐ BÁO CÁO': 'Tổng số đề tài', 'GIÁ TRỊ': filteredProjects.length },
      { 'CHỈ SỐ BÁO CÁO': 'Tổng kinh phí (VNĐ)', 'GIÁ TRỊ': totalBudget },
      { 'CHỈ SỐ BÁO CÁO': 'Tổng số công bố khoa học', 'GIÁ TRỊ': filteredPublications.length },
      { 'CHỈ SỐ BÁO CÁO': 'Bài báo Scopus/WoS Q1', 'GIÁ TRỊ': q1Pubs },
      { 'CHỈ SỐ BÁO CÁO': 'Bài báo Scopus/WoS Q2', 'GIÁ TRỊ': q2Pubs },
      { 'CHỈ SỐ BÁO CÁO': 'Bài báo Tạp chí Trong nước', 'GIÁ TRỊ': nationalPubs },
      { 'CHỈ SỐ BÁO CÁO': 'Thời điểm xuất', 'GIÁ TRỊ': new Date().toLocaleString('vi-VN') },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng Hợp');

    // Sheet 2: Danh sách đề tài
    const projectRows = filteredProjects.map((p, idx) => ({
      STT: idx + 1,
      'Mã đề tài': p.code,
      'Tên đề tài': p.title,
      'Cấp đề tài': PROJECT_LEVEL_LABELS[p.level]?.label || p.level,
      'Chủ nhiệm': p.leadResearcherName,
      'Đơn vị chủ trì': p.department,
      'Ngày BĐ': formatDate(p.startDate),
      'Ngày KT': formatDate(p.endDate),
      'Kinh phí (VNĐ)': p.budget,
      'Tiến độ (%)': `${p.completionRate}%`,
      'Trạng thái': PROJECT_STATUS_LABELS[p.status]?.label || p.status,
    }));
    const wsProjects = XLSX.utils.json_to_sheet(projectRows);
    XLSX.utils.book_append_sheet(wb, wsProjects, 'Đề Tài');

    // Sheet 3: Danh sách bài báo
    const pubRows = filteredPublications.map((pub, idx) => ({
      STT: idx + 1,
      'Tên công trình': pub.title,
      'Tác giả chính': pub.firstAuthor,
      'Các tác giả': pub.authors.join('; '),
      'Tạp chí / Hội nghị': pub.journalOrConference,
      'Năm công bố': pub.publicationYear,
      'CSDL': pub.indexing,
      'Phân hạng': pub.rank,
      'Điểm HĐGSNN': pub.pointsHDGSNN ?? '',
      'Đề tài liên quan': pub.relatedProjectCode || '',
    }));
    const wsPubs = XLSX.utils.json_to_sheet(pubRows);
    XLSX.utils.book_append_sheet(wb, wsPubs, 'Công Bố Khoa Học');

    XLSX.writeFile(wb, `Bao_cao_NCKH_${reportYear}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    onShowToast('Đã xuất báo cáo tổng hợp ra file Excel đầy đủ!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Thống kê & Tổng hợp Báo cáo NCKH
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng hợp dữ liệu theo năm, đơn vị, cấp đề tài và phân hạng công bố theo chuẩn Bộ GD&ĐT
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In / Lưu PDF</span>
          </button>

          <button
            onClick={handleExportFullExcel}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Báo cáo Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filter Selector Panel (no-print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 no-print">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" /> Điều kiện thiết lập báo cáo
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Năm báo cáo
            </label>
            <select
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">Tất cả các năm (2022 - 2025)</option>
              <option value="2025">Năm 2025</option>
              <option value="2024">Năm 2024 (Trọng điểm)</option>
              <option value="2023">Năm 2023</option>
              <option value="2022">Năm 2022</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Đơn vị chủ trì / Khoa
            </label>
            <select
              value={reportDept}
              onChange={(e) => setReportDept(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">Toàn trường (Tất cả đơn vị)</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Cấp quản lý đề tài
            </label>
            <select
              value={reportLevel}
              onChange={(e) => setReportLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">Tất cả các cấp</option>
              {Object.entries(PROJECT_LEVEL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Document Presentation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        {/* Formal University Report Header */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 text-xs">
            <div>
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                BỘ Y TẾ
              </div>
              <div className="font-extrabold text-blue-900 uppercase tracking-wider text-xs">
                TRƯỜNG ĐẠI HỌC DƯỢC HÀ NỘI
              </div>
              <div className="font-semibold text-slate-600 text-[11px]">
                PHÒNG QUẢN LÝ KHOA HỌC CÔNG NGHỆ & HỢP TÁC PHÁT TRIỂN
              </div>
              <div className="text-slate-400 text-[10px] mt-0.5">
                Số: ...... /BC-DHDKHCN
              </div>
            </div>

            <div className="sm:text-right">
              <div className="font-bold text-slate-800 uppercase text-[11px]">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-slate-600 italic text-[11px]">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="text-slate-400 text-[10px] mt-0.5">
                Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              BÁO CÁO TỔNG KẾT HOẠT ĐỘNG KHOA HỌC & CÔNG NGHỆ
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Kỳ báo cáo: {reportYear === 'all' ? 'Toàn bộ dữ liệu đề tài & công bố' : `Năm ${reportYear}`}
            </p>
          </div>

          {/* Condition clarity badge */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between flex-wrap gap-2">
            <div>
              <strong className="text-slate-900">Điều kiện dữ liệu đang báo cáo:</strong> Năm: [{reportYear === 'all' ? 'Tất cả' : reportYear}] • Đơn vị: [{reportDept === 'all' ? 'Toàn trường' : reportDept}] • Cấp: [{reportLevel === 'all' ? 'Tất cả các cấp' : PROJECT_LEVEL_LABELS[reportLevel]?.label || reportLevel}]
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Tổng số bản ghi: {filteredProjects.length} đề tài / {filteredPublications.length} công bố
            </div>
          </div>
        </div>

        {/* Section 1: KPI Tiles in Report */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            I. CÁC CHỈ SỐ NGHIÊN CỨU CHÍNH TRONG KỲ
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Tổng số đề tài</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{filteredProjects.length}</span>
              <span className="text-emerald-700 font-semibold">{completedProjects} đã nghiệm thu</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Tổng kinh phí đề tài</span>
              <span className="text-xl font-black text-blue-800 mt-1 block">{formatShortVND(totalBudget)}</span>
              <span className="text-slate-500">nguồn NSNN & trường</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Tổng số bài báo</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">{filteredPublications.length}</span>
              <span className="text-slate-500">{q1Pubs + q2Pubs} bài Scopus Q1/Q2</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Nhà nghiên cứu tham gia</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">{researchers.length}</span>
              <span className="text-slate-500">giảng viên & NC viên</span>
            </div>
          </div>
        </div>

        {/* Section 2: Phân bổ đề tài theo cấp quản lý */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            II. PHÂN BỔ ĐỀ TÀI THEO CẤP QUẢN LÝ
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  <th className="py-2.5 px-3">Cấp đề tài</th>
                  <th className="py-2.5 px-3 text-center">Số lượng</th>
                  <th className="py-2.5 px-3 text-center">Tỷ lệ (%)</th>
                  <th className="py-2.5 px-3 text-right">Tổng kinh phí (VNĐ)</th>
                  <th className="py-2.5 px-3 text-right">Tỷ lệ kinh phí (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(PROJECT_LEVEL_LABELS).map((lvlKey) => {
                  const stat = levelStats[lvlKey] || { count: 0, budget: 0 };
                  const countPct = filteredProjects.length ? Math.round((stat.count / filteredProjects.length) * 100) : 0;
                  const budgetPct = totalBudget ? Math.round((stat.budget / totalBudget) * 100) : 0;

                  return (
                    <tr key={lvlKey} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {PROJECT_LEVEL_LABELS[lvlKey]?.label}
                      </td>
                      <td className="py-2 px-3 text-center font-bold">{stat.count}</td>
                      <td className="py-2 px-3 text-center text-slate-500">{countPct}%</td>
                      <td className="py-2 px-3 text-right font-medium">{formatVND(stat.budget)}</td>
                      <td className="py-2 px-3 text-right text-slate-500">{budgetPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-300 font-bold text-slate-900">
                  <td className="py-2.5 px-3">TỔNG CỘNG</td>
                  <td className="py-2.5 px-3 text-center">{filteredProjects.length}</td>
                  <td className="py-2.5 px-3 text-center">100%</td>
                  <td className="py-2.5 px-3 text-right">{formatVND(totalBudget)}</td>
                  <td className="py-2.5 px-3 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 3: Bảng xếp hạng theo đơn vị / Khoa */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            III. THỐNG KÊ HOẠT ĐỘNG THEO ĐƠN VỊ CHỦ TRÌ
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  <th className="py-2.5 px-3">Đơn vị (Khoa / Viện)</th>
                  <th className="py-2.5 px-3 text-center">Số đề tài</th>
                  <th className="py-2.5 px-3 text-right">Kinh phí (VNĐ)</th>
                  <th className="py-2.5 px-3 text-center">Số bài báo</th>
                  <th className="py-2.5 px-3 text-center">Bài Q1/Q2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEPARTMENTS.map((dept) => {
                  const data = deptMatrix[dept] || { projects: 0, budget: 0, pubs: 0, q1q2: 0 };
                  return (
                    <tr key={dept} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{dept}</td>
                      <td className="py-2 px-3 text-center font-bold text-blue-700">{data.projects}</td>
                      <td className="py-2 px-3 text-right font-medium">{formatVND(data.budget)}</td>
                      <td className="py-2 px-3 text-center font-bold text-indigo-700">{data.pubs}</td>
                      <td className="py-2 px-3 text-center font-bold text-red-600">{data.q1q2}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
          <div>
            <div className="font-bold text-slate-900 uppercase">NGƯỜI LẬP BÁO CÁO</div>
            <div className="text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</div>
            <div className="h-16"></div>
            <div className="font-semibold text-slate-800">Cán bộ Quản lý Khoa học</div>
          </div>
          <div>
            <div className="font-bold text-slate-900 uppercase">TRƯỞNG PHÒNG QUẢN LÝ KH&CN</div>
            <div className="text-slate-400 mt-0.5">(Ký tên và đóng dấu)</div>
            <div className="h-16"></div>
            <div className="font-semibold text-slate-800">Ban Giám Hiệu Phê Duyệt</div>
          </div>
        </div>
      </div>
    </div>
  );
};
