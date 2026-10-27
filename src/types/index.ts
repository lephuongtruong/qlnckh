export type UserRole = 'admin' | 'manager' | 'leader' | 'researcher';

export type ProjectLevel = 
  | 'quoc_te' 
  | 'quoc_gia' 
  | 'bo' 
  | 'tinh' 
  | 'truong' 
  | 'sinh_vien' 
  | 'khac';

export type ProjectStatus = 
  | 'de_xuat' 
  | 'duoc_phe_duyet' 
  | 'dang_thuc_hien' 
  | 'cho_nghiem_thu' 
  | 'da_nghiem_thu' 
  | 'qua_han';

export interface Milestone {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  completedDate?: string;
  assignee: string;
  status: 'chua_bat_dau' | 'dang_thuc_hien' | 'hoan_thanh' | 'tre_han';
  progressPct: number; // 0 - 100
  note?: string;
}

export interface ResearchProject {
  id: string;
  code: string; // Mã đề tài: e.g. DT-QG-2024-01
  title: string;
  level: ProjectLevel;
  leadResearcherId: string;
  leadResearcherName: string;
  members: string[]; // Tên hoặc ID thành viên
  department: string; // Đơn vị chủ trì
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  budget: number; // Kinh phí VND
  objectives: string; // Mục tiêu
  content: string; // Nội dung
  expectedProducts: string; // Sản phẩm dự kiến (Bài báo, sáng chế, đào tạo...)
  status: ProjectStatus;
  completionRate: number; // 0 - 100 (%)
  milestones: Milestone[];
  notes?: string;
  documents?: {
    id: string;
    name: string;
    type: string;
    date: string;
    size?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type PublicationType = 
  | 'quoc_te' 
  | 'trong_nuoc' 
  | 'hoi_nghi_qt' 
  | 'hoi_nghi_tn' 
  | 'sach_chuong';

export type IndexingDatabase = 
  | 'scopus' 
  | 'wos' 
  | 'scopus_wos' 
  | 'hdgsnn' 
  | 'khac' 
  | 'chua_xac_dinh';

export type PublicationRank = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'none';

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  firstAuthor: string;
  correspondingAuthor: string;
  department: string;
  journalOrConference: string;
  publicationYear: number;
  type: PublicationType;
  indexing: IndexingDatabase;
  rank: PublicationRank;
  pointsHDGSNN?: number; // Điểm HĐGSNN nếu có
  doi?: string;
  url?: string;
  evidenceFile?: string;
  citationsCount?: number;
  relatedProjectId?: string; // ID đề tài liên quan
  relatedProjectCode?: string;
  abstract?: string;
  createdAt: string;
}

export interface Researcher {
  id: string;
  code: string; // Mã giảng viên
  fullName: string;
  titleAndDegree: string; // e.g. PGS.TS, GS.TS, TS, ThS
  department: string;
  researchArea: string;
  email: string;
  phone: string;
  orcid?: string;
  googleScholarUrl?: string;
  scopusAuthorId?: string;
  avatarUrl?: string;
  bio?: string;
  hIndex?: number;
}

export interface FilterOptions {
  searchQuery: string;
  year?: string;
  level?: string;
  department?: string;
  status?: string;
  leadResearcher?: string;
  publicationType?: string;
  indexing?: string;
  rank?: string;
}
