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
