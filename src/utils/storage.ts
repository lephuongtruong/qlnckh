import * as XLSX from 'xlsx';
import { ResearchProject, Publication, Researcher, UserRole } from '../types';
import { INITIAL_PROJECTS, INITIAL_PUBLICATIONS, INITIAL_RESEARCHERS, PROJECT_LEVEL_LABELS, PROJECT_STATUS_LABELS } from '../data/mockData';

const STORAGE_KEYS = {
  PROJECTS: 'srms_hup_projects_v1',
  PUBLICATIONS: 'srms_hup_publications_v1',
  RESEARCHERS: 'srms_hup_researchers_v1',
  ROLE: 'srms_hup_current_role_v1',
};

export const getStoredProjects = (): ResearchProject[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading projects from localStorage:', err);
    return INITIAL_PROJECTS;
  }
};

export const saveStoredProjects = (projects: ResearchProject[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
};

export const getStoredPublications = (): Publication[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PUBLICATIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PUBLICATIONS, JSON.stringify(INITIAL_PUBLICATIONS));
      return INITIAL_PUBLICATIONS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading publications from localStorage:', err);
    return INITIAL_PUBLICATIONS;
  }
};

export const saveStoredPublications = (publications: Publication[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PUBLICATIONS, JSON.stringify(publications));
  } catch (err) {
    console.error('Error saving publications to localStorage:', err);
  }
};

export const getStoredResearchers = (): Researcher[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESEARCHERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.RESEARCHERS, JSON.stringify(INITIAL_RESEARCHERS));
      return INITIAL_RESEARCHERS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading researchers from localStorage:', err);
    return INITIAL_RESEARCHERS;
  }
};

export const saveStoredResearchers = (researchers: Researcher[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RESEARCHERS, JSON.stringify(researchers));
  } catch (err) {
    console.error('Error saving researchers to localStorage:', err);
  }
};

export const getStoredRole = (): UserRole => {
  try {
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (role && ['admin', 'manager', 'leader', 'researcher'].includes(role)) {
      return role as UserRole;
    }
    return 'manager'; // Default role: Cán bộ QLKH
  } catch {
    return 'manager';
  }
};

export const saveStoredRole = (role: UserRole): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  } catch (err) {
    console.error('Error saving role to localStorage:', err);
  }
};

export const resetAllData = (): { projects: ResearchProject[]; publications: Publication[]; researchers: Researcher[] } => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(STORAGE_KEYS.PUBLICATIONS, JSON.stringify(INITIAL_PUBLICATIONS));
  localStorage.setItem(STORAGE_KEYS.RESEARCHERS, JSON.stringify(INITIAL_RESEARCHERS));
  return {
    projects: INITIAL_PROJECTS,
    publications: INITIAL_PUBLICATIONS,
    researchers: INITIAL_RESEARCHERS,
  };
};

export const exportAllDataJSON = (): void => {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.2.0',
    description: 'Bản sao lưu cơ sở dữ liệu NCKH - Trường Đại học Dược Hà Nội (HUP)',
    projects: getStoredProjects(),
    publications: getStoredPublications(),
    researchers: getStoredResearchers(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NCKH_DHDuocHN_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importAllDataJSON = (
  jsonString: string
): { success: boolean; message: string; projects?: ResearchProject[]; publications?: Publication[]; researchers?: Researcher[] } => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.projects || !data.publications || !data.researchers) {
      return { success: false, message: 'Tệp JSON không đúng cấu trúc sao lưu của hệ thống.' };
    }
    saveStoredProjects(data.projects);
    saveStoredPublications(data.publications);
    saveStoredResearchers(data.researchers);
    return {
      success: true,
      message: 'Nhập dữ liệu thành công!',
      projects: data.projects,
      publications: data.publications,
      researchers: data.researchers,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Lỗi đọc file: ${errorMsg}` };
  }
};

// Formatting helpers
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatShortVND = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2).replace(/\.00$/, '')} tỷ VNĐ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(0)} triệu VNĐ`;
  }
  return formatVND(amount);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// Excel & CSV Exporters
export const exportProjectsToExcel = (projects: ResearchProject[], filename = 'Danh_sach_de_tai_NCKH_DHDuocHN.xlsx'): void => {
  const rows = projects.map((p, idx) => ({
    STT: idx + 1,
    'Mã đề tài': p.code,
    'Tên đề tài': p.title,
    'Cấp đề tài': PROJECT_LEVEL_LABELS[p.level]?.label || p.level,
    'Chủ nhiệm': p.leadResearcherName,
    'Đơn vị chủ trì': p.department,
    'Ngày bắt đầu': formatDate(p.startDate),
    'Ngày kết thúc': formatDate(p.endDate),
    'Kinh phí (VNĐ)': p.budget,
    'Trạng thái': PROJECT_STATUS_LABELS[p.status]?.label || p.status,
    'Tiến độ (%)': `${p.completionRate}%`,
    'Sản phẩm dự kiến': p.expectedProducts,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Đề tài NCKH - ĐH Dược HN');
  XLSX.writeFile(workbook, filename);
};

export const exportProjectsToCSV = (projects: ResearchProject[], filename = 'Danh_sach_de_tai_NCKH_DHDuocHN.csv'): void => {
  const headers = ['STT', 'Mã đề tài', 'Tên đề tài', 'Cấp đề tài', 'Chủ nhiệm', 'Đơn vị', 'Ngày BĐ', 'Ngày KT', 'Kinh phí (VNĐ)', 'Trạng thái', 'Tiến độ (%)'];
  const rows = projects.map((p, idx) => [
    idx + 1,
    `"${p.code.replace(/"/g, '""')}"`,
    `"${p.title.replace(/"/g, '""')}"`,
    `"${PROJECT_LEVEL_LABELS[p.level]?.label || p.level}"`,
    `"${p.leadResearcherName.replace(/"/g, '""')}"`,
    `"${p.department.replace(/"/g, '""')}"`,
    p.startDate,
    p.endDate,
    p.budget,
    `"${PROJECT_STATUS_LABELS[p.status]?.label || p.status}"`,
    `${p.completionRate}%`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportPublicationsToExcel = (pubs: Publication[], filename = 'Danh_sach_cong_bo_khoa_hoc_DHDuocHN.xlsx'): void => {
  const rows = pubs.map((p, idx) => ({
    STT: idx + 1,
    'Tên bài báo / công trình': p.title,
    'Tác giả chính': p.firstAuthor,
    'Các tác giả': p.authors.join('; '),
    'Đơn vị': p.department,
    'Tạp chí / Hội nghị': p.journalOrConference,
    'Năm công bố': p.publicationYear,
    'Loại công bố': p.type === 'quoc_te' ? 'Quốc tế' : p.type === 'trong_nuoc' ? 'Trong nước' : 'Hội nghị/Sách',
    'Cơ sở dữ liệu': p.indexing,
    'Phân hạng (Q1-Q4)': p.rank !== 'none' ? p.rank : 'Không',
    'Điểm HĐGSNN': p.pointsHDGSNN ?? '',
    'DOI / Đường dẫn': p.doi ? `https://doi.org/${p.doi}` : p.url || '',
    'Mã đề tài liên quan': p.relatedProjectCode || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Công bố KH - ĐH Dược HN');
  XLSX.writeFile(workbook, filename);
};

export const exportPublicationsToCSV = (pubs: Publication[], filename = 'Danh_sach_cong_bo_khoa_hoc_DHDuocHN.csv'): void => {
  const headers = ['STT', 'Tên bài báo', 'Tác giả chính', 'Đơn vị', 'Tạp chí/Hội nghị', 'Năm', 'CSDL', 'Phân hạng', 'DOI', 'Đề tài liên quan'];
  const rows = pubs.map((p, idx) => [
    idx + 1,
    `"${p.title.replace(/"/g, '""')}"`,
    `"${p.firstAuthor.replace(/"/g, '""')}"`,
    `"${p.department.replace(/"/g, '""')}"`,
    `"${p.journalOrConference.replace(/"/g, '""')}"`,
    p.publicationYear,
    `"${p.indexing}"`,
    `"${p.rank}"`,
    `"${p.doi || ''}"`,
    `"${p.relatedProjectCode || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ==========================================
// EXCEL IMPORT TEMPLATE & PARSER FOR PROJECTS
// ==========================================

export const mapLevelStringToKey = (str?: string): import('../types').ProjectLevel => {
  if (!str) return 'truong';
  const s = str.toLowerCase();
  if (s.includes('quốc tế') || s.includes('quoc te')) return 'quoc_te';
  if (s.includes('quốc gia') || s.includes('quoc gia') || s.includes('nafosted')) return 'quoc_gia';
  if (s.includes('bộ') || s.includes('bo y te') || s.includes('bo gd')) return 'bo';
  if (s.includes('tỉnh') || s.includes('tinh') || s.includes('thành phố')) return 'tinh';
  if (s.includes('sinh viên') || s.includes('sinh vien')) return 'sinh_vien';
  if (s.includes('trường') || s.includes('truong') || s.includes('cơ sở') || s.includes('co so')) return 'truong';
  return 'khac';
};

export const mapStatusStringToKey = (str?: string): import('../types').ProjectStatus => {
  if (!str) return 'dang_thuc_hien';
  const s = str.toLowerCase();
  if (s.includes('đề xuất') || s.includes('de xuat')) return 'de_xuat';
  if (s.includes('phê duyệt') || s.includes('phe duyet')) return 'duoc_phe_duyet';
  if (s.includes('đã nghiệm thu') || s.includes('da nghiem thu') || s.includes('hoàn thành')) return 'da_nghiem_thu';
  if (s.includes('chờ nghiệm thu') || s.includes('cho nghiem thu')) return 'cho_nghiem_thu';
  if (s.includes('quá hạn') || s.includes('qua han') || s.includes('trễ hạn')) return 'qua_han';
  return 'dang_thuc_hien';
};

export const normalizeDateString = (val: any): string => {
  if (!val) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }
  if (typeof val === 'number') {
    // Excel serial date code
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }
  const str = String(val).trim();
  // Check DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  // Check YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return str;
};

export const downloadProjectImportTemplate = (): void => {
  const sampleRows = [
    {
      'Mã đề tài (*)': 'DT-BYT-2025-D02',
      'Tên đề tài (*)': 'Nghiên cứu công nghệ bào chế vi hạt chitosan mang cao chiết Hoàng liên (Coptis chinensis) giải phóng kéo dài',
      'Cấp đề tài (*)': 'Cấp Bộ (Bộ Y tế / Bộ KH&CN)',
      'Chủ nhiệm đề tài (*)': 'PGS.TS Trần Hải Đăng',
      'Đơn vị chủ trì (*)': 'Khoa Bào chế & Công nghệ Dược phẩm',
      'Thành viên tham gia (phân cách dấu phẩy)': 'TS.DS Lê Thị Mai Lan, DS Nguyễn Văn Hòa',
      'Ngày bắt đầu (YYYY-MM-DD) (*)': '2025-01-15',
      'Ngày kết thúc (YYYY-MM-DD) (*)': '2026-12-31',
      'Kinh phí phê duyệt (VNĐ) (*)': 750000000,
      'Mục tiêu nghiên cứu (*)': 'Bào chế thành công vi hạt chitosan kích thước < 300 nm, tăng thời gian lưu tại dạ dày và ức chế Helicobacter pylori.',
      'Nội dung nghiên cứu': 'Tối ưu hóa công thức, kiểm tra hình thái SEM, đánh giá độ tan và độ ổn định bảo quản.',
      'Sản phẩm dự kiến': '01 bài báo Scopus Q2, 01 quy trình điều chế vi hạt',
      'Trạng thái (*)': 'Đang thực hiện',
      'Tiến độ hoàn thành (%)': 35,
      'Ghi chú': 'Đã hoàn thành thẩm định thuyết minh đợt 1',
    },
    {
      'Mã đề tài (*)': 'DT-CS-2025-HUP05',
      'Tên đề tài (*)': 'Khảo sát tác dụng hạ lipid máu của cao chiết lá Sen (Nelumbo nucifera) trên chuột nhắt trắng gây béo phì',
      'Cấp đề tài (*)': 'Cấp Trường ĐH Dược HN',
      'Chủ nhiệm đề tài (*)': 'TS.BS Vũ Thị Bích Ngọc',
      'Đơn vị chủ trì (*)': 'Khoa Dược lý - Dược lâm sàng',
      'Thành viên tham gia (phân cách dấu phẩy)': 'ThS.DS Nguyễn Quốc Tuấn, SV Lê Thị Mai',
      'Ngày bắt đầu (YYYY-MM-DD) (*)': '2025-03-01',
      'Ngày kết thúc (YYYY-MM-DD) (*)': '2026-02-28',
      'Kinh phí phê duyệt (VNĐ) (*)': 80000000,
      'Mục tiêu nghiên cứu (*)': 'Đánh giá chỉ số cholesterol toàn phần, triglyceride, LDL-C sau 4 tuần dùng cao chiết.',
      'Nội dung nghiên cứu': 'Gây mô hình béo phì bằng chế độ ăn giàu chất béo HFD, xét nghiệm sinh hóa máu.',
      'Sản phẩm dự kiến': '01 bài báo Tạp chí Dược học, 01 báo cáo tổng kết',
      'Trạng thái (*)': 'Được phê duyệt',
      'Tiến độ hoàn thành (%)': 15,
      'Ghi chú': 'Kinh phí cấp cơ sở trường đợt 1/2025',
    },
    {
      'Mã đề tài (*)': 'DT-SV-2025-HUP02',
      'Tên đề tài (*)': 'Xây dựng quy trình định lượng polyphenol toàn phần trong trà hoa vàng bằng phương pháp đo quang phổ UV-Vis',
      'Cấp đề tài (*)': 'Sinh viên NCKH Dược',
      'Chủ nhiệm đề tài (*)': 'TS.DS Lê Thị Mai Lan (GV Hướng dẫn)',
      'Đơn vị chủ trì (*)': 'Khoa Hóa phân tích & Kiểm nghiệm thuốc',
      'Thành viên tham gia (phân cách dấu phẩy)': 'SV Nguyễn Đức Minh (Trưởng nhóm), SV Phạm Thanh Thảo',
      'Ngày bắt đầu (YYYY-MM-DD) (*)': '2025-04-01',
      'Ngày kết thúc (YYYY-MM-DD) (*)': '2025-11-30',
      'Kinh phí phê duyệt (VNĐ) (*)': 25000000,
      'Mục tiêu nghiên cứu (*)': 'Thẩm định quy trình theo hướng dẫn ICH Q2(R1) đạt độ lặp lại RSD < 2%.',
      'Nội dung nghiên cứu': 'Khảo sát thuốc thử Folin-Ciocalteu, độ tuyến tính và độ thu hồi.',
      'Sản phẩm dự kiến': '01 báo cáo nghiệm thu đề tài sinh viên NCKH',
      'Trạng thái (*)': 'Đề xuất',
      'Tiến độ hoàn thành (%)': 0,
      'Ghi chú': 'Tham gia giải thưởng Sinh viên Nghiên cứu Khoa học HUP',
    },
  ];

  const instructions = [
    { 'HƯỚNG DẪN NHẬP LIỆU': 'CƠ QUAN CHỦ QUẢN', 'CHI TIẾT QUY ĐỊNH': 'Bộ Y tế - Trường Đại học Dược Hà Nội (HUP)' },
    { 'HƯỚNG DẪN NHẬP LIỆU': 'Cột có dấu (*)', 'CHI TIẾT QUY ĐỊNH': 'Bắt buộc phải điền đầy đủ dữ liệu (Mã đề tài, Tên đề tài, Cấp, Chủ nhiệm, Đơn vị, Ngày BĐ, Ngày KT, Kinh phí, Mục tiêu, Trạng thái)' },
    { 'HƯỚNG DẪN NHẬP LIỆU': 'Định dạng Ngày', 'CHI TIẾT QUY ĐỊNH': 'YYYY-MM-DD (Ví dụ: 2025-01-15) hoặc DD/MM/YYYY (Ví dụ: 15/01/2025)' },
    { 'HƯỚNG DẪN NHẬP LIỆU': 'Định dạng Kinh phí', 'CHI TIẾT QUY ĐỊNH': 'Nhập số nguyên dương tính bằng VNĐ (Ví dụ: 500000000 hoặc 75000000)' },
    { 'HƯỚNG DẪN NHẬP LIỆU': 'Cấp đề tài hợp lệ', 'CHI TIẾT QUY ĐỊNH': 'Cấp Quốc tế, Cấp Quốc gia (NAFOSTED), Cấp Bộ (Bộ Y tế / Bộ KH&CN), Cấp Tỉnh / Thành phố, Cấp Trường ĐH Dược HN, Sinh viên NCKH Dược, Cấp khác' },
    { 'HƯỚNG DẪN NHẬP LIỆU': 'Trạng thái hợp lệ', 'CHI TIẾT QUY ĐỊNH': 'Đề xuất, Được phê duyệt, Đang thực hiện, Chờ nghiệm thu, Đã nghiệm thu, Quá hạn' },
    { 'HƯỚNG DẪN NHẬP LIỆU': 'Đơn vị chủ trì hợp lệ', 'CHI TIẾT QUY ĐỊNH': 'Khoa Bào chế & Công nghệ Dược phẩm, Khoa Dược lý - Dược lâm sàng, Khoa Hóa phân tích & Kiểm nghiệm thuốc, Khoa Dược liệu & Y học cổ truyền, Khoa Hóa dược, Viện Công nghệ Dược phẩm Quốc gia, Khoa Quản lý & Kinh tế Dược, Trung tâm DI & ADR Quốc gia' },
    { 'HƯỚNG DẪN NHẬP LIỆU': 'Lưu ý khi nhập', 'CHI TIẾT QUY ĐỊNH': 'Không sửa đổi tên các tiêu đề cột ở dòng 1. Xóa các dòng mẫu trước khi điền dữ liệu thực tế của bạn hoặc để nguyên dòng mẫu để thử nghiệm.' },
  ];

  const wb = XLSX.utils.book_new();

  // Sheet 1: Mẫu nhập liệu
  const wsData = XLSX.utils.json_to_sheet(sampleRows);
  // Set column widths
  wsData['!cols'] = [
    { wch: 22 }, // Mã
    { wch: 45 }, // Tên
    { wch: 26 }, // Cấp
    { wch: 28 }, // Chủ nhiệm
    { wch: 32 }, // Đơn vị
    { wch: 35 }, // Thành viên
    { wch: 18 }, // Ngày BĐ
    { wch: 18 }, // Ngày KT
    { wch: 22 }, // Kinh phí
    { wch: 45 }, // Mục tiêu
    { wch: 35 }, // Nội dung
    { wch: 30 }, // Sản phẩm
    { wch: 18 }, // Trạng thái
    { wch: 22 }, // Tiến độ %
    { wch: 30 }, // Ghi chú
  ];
  XLSX.utils.book_append_sheet(wb, wsData, 'Danh_Sach_De_Tai_Mau');

  // Sheet 2: Hướng dẫn
  const wsInstructions = XLSX.utils.json_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 28 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Huong_Dan_Nhap_Lieu');

  XLSX.writeFile(wb, 'Mau_Nhap_De_Tai_NCKH_DHDuocHN.xlsx');
};
