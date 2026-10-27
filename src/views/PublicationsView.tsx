import React, { useState, useMemo } from 'react';
import { 
  BookOpenCheck, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  ExternalLink, 
  Eye, 
  Edit, 
  Trash2, 
  Building2, 
  User, 
  Calendar, 
  Award, 
  FileText,
  X,
  Sparkles,
  Link2
} from 'lucide-react';
import { Publication, ResearchProject, Researcher, UserRole, IndexingDatabase, PublicationRank } from '../types';
import { DEPARTMENTS, INDEXING_LABELS, PUBLICATION_TYPE_LABELS } from '../data/mockData';
import { exportPublicationsToExcel, exportPublicationsToCSV } from '../utils/storage';
import { PublicationModal } from '../components/PublicationModal';
import { ConfirmModal } from '../components/ConfirmModal';

interface PublicationsViewProps {
  publications: Publication[];
  projects: ResearchProject[];
  researchers: Researcher[];
  currentRole: UserRole;
  onSavePublication: (pub: Publication) => void;
  onDeletePublication: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PublicationsView: React.FC<PublicationsViewProps> = ({
  publications,
  projects,
  researchers,
  currentRole,
  onSavePublication,
  onDeletePublication,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterIndexing, setFilterIndexing] = useState<string>('all');
  const [filterRank, setFilterRank] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  const [deletingPub, setDeletingPub] = useState<Publication | null>(null);
  const [viewingPub, setViewingPub] = useState<Publication | null>(null);

  // Statistics
  const totalPubs = publications.length;
  const q1Count = publications.filter((p) => p.rank === 'Q1').length;
  const q2Count = publications.filter((p) => p.rank === 'Q2').length;
  const nationalCount = publications.filter((p) => p.type === 'trong_nuoc').length;
  const totalCitations = publications.reduce((s, p) => s + (p.citationsCount || 0), 0);

  // Filtered List
  const filteredPubs = useMemo(() => {
    return publications.filter((p) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchAuthor = p.firstAuthor.toLowerCase().includes(q) || p.authors.some(a => a.toLowerCase().includes(q));
        const matchJournal = p.journalOrConference.toLowerCase().includes(q);
        const matchDept = p.department.toLowerCase().includes(q);
        const matchDoi = p.doi?.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchJournal && !matchDept && !matchDoi) return false;
      }

      if (filterYear !== 'all' && p.publicationYear.toString() !== filterYear) return false;
      if (filterType !== 'all' && p.type !== filterType) return false;
      if (filterIndexing !== 'all' && p.indexing !== filterIndexing) return false;
      if (filterRank !== 'all' && p.rank !== filterRank) return false;
      if (filterDept !== 'all' && p.department !== filterDept) return false;

      return true;
    });
  }, [publications, searchTerm, filterYear, filterType, filterIndexing, filterRank, filterDept]);

  const handleAddNew = () => {
    setEditingPub(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pub: Publication) => {
    setEditingPub(pub);
    setIsModalOpen(true);
  };

  const handleSave = (saved: Publication) => {
    onSavePublication(saved);
    setIsModalOpen(false);
    setEditingPub(null);
    onShowToast('Đã lưu thông tin công bố khoa học!', 'success');
  };

  const handleDeleteConfirm = () => {
    if (deletingPub) {
      onDeletePublication(deletingPub.id);
      onShowToast('Đã xóa công bố khoa học thành công', 'info');
      setDeletingPub(null);
    }
  };

  const handleExportExcel = () => {
    exportPublicationsToExcel(filteredPubs);
    onShowToast(`Đã xuất ${filteredPubs.length} bài báo ra file Excel`, 'success');
  };

  const handleExportCSV = () => {
    exportPublicationsToCSV(filteredPubs);
    onShowToast(`Đã xuất ${filteredPubs.length} bài báo ra file CSV`, 'success');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterYear('all');
    setFilterType('all');
    setFilterIndexing('all');
    setFilterRank('all');
    setFilterDept('all');
  };

  const hasActiveFilters = 
    searchTerm || filterYear !== 'all' || filterType !== 'all' || filterIndexing !== 'all' || filterRank !== 'all' || filterDept !== 'all';

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-indigo-600" />
            Quản lý Công bố Khoa học & Bài báo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Danh mục công bố ISI/Scopus, kỷ yếu hội nghị, giáo trình và tạp chí HĐGSNN
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg border border-slate-300 bg-white shadow-xs overflow-hidden">
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors border-r border-slate-200"
              title="Xuất Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              title="Xuất CSV"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>CSV</span>
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Khai báo công bố mới</span>
          </button>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Tổng công bố</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{totalPubs}</span>
          <span className="text-[11px] text-slate-500">tất cả các loại hình</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Scopus/WoS Q1</span>
          <span className="text-2xl font-extrabold text-red-600 mt-1 block">{q1Count}</span>
          <span className="text-[11px] text-red-600 font-medium">Nhóm tinh hoa</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Scopus/WoS Q2</span>
          <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{q2Count}</span>
          <span className="text-[11px] text-blue-600 font-medium">Quốc tế uy tín</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Tổng lượt trích dẫn</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{totalCitations}</span>
          <span className="text-[11px] text-slate-500">Google Scholar / Scopus</span>
        </div>
      </div>

      {/* Verification Notice Banner */}
      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
        <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Quy chuẩn dữ liệu & Minh chứng:</span> Các trường cơ sở dữ liệu (Scopus, Web of Science) và phân hạng (Q1–Q4) là do giảng viên tự khai báo và cán bộ thẩm định kiểm tra dựa trên tệp minh chứng hoặc chỉ mục DOI hợp lệ, hệ thống không tự động suy diễn.
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Keyword */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên bài báo, tác giả, tạp chí, DOI..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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

          {/* Year */}
          <div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">Tất cả năm</option>
              <option value="2025">Năm 2025</option>
              <option value="2024">Năm 2024</option>
              <option value="2023">Năm 2023</option>
              <option value="2022">Năm 2022</option>
            </select>
          </div>

          {/* Indexing */}
          <div>
            <select
              value={filterIndexing}
              onChange={(e) => setFilterIndexing(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">Tất cả CSDL</option>
              {Object.entries(INDEXING_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Rank */}
          <div>
            <select
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white font-semibold"
            >
              <option value="all">Tất cả phân hạng</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
              <option value="none">Không phân hạng</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">Tất cả khoa/viện</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Tìm thấy <strong className="text-slate-900">{filteredPubs.length}</strong> / {publications.length} công bố phù hợp
            </span>
            <button
              onClick={resetFilters}
              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Publications Cards List */}
      <div className="space-y-3">
        {filteredPubs.map((pub, idx) => {
          const isQ1 = pub.rank === 'Q1';
          const isQ2 = pub.rank === 'Q2';

          return (
            <div
              key={pub.id}
              className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Năm {pub.publicationYear}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {INDEXING_LABELS[pub.indexing] || pub.indexing}
                    </span>
                    {pub.rank !== 'none' && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        isQ1 ? 'bg-red-50 text-red-700 border-red-200' : isQ2 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {pub.rank}
                      </span>
                    )}
                    {pub.pointsHDGSNN && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {pub.pointsHDGSNN} điểm HĐGSNN
                      </span>
                    )}
                    {pub.citationsCount !== undefined && pub.citationsCount > 0 && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        • {pub.citationsCount} trích dẫn
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {pub.title}
                  </h3>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <span>Tác giả: <strong className="text-slate-800">{pub.authors.join(', ')}</strong></span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap pt-0.5">
                    <span className="italic font-medium text-slate-700">
                      {pub.journalOrConference}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {pub.department}
                    </span>
                  </div>

                  {/* Related project badge */}
                  {pub.relatedProjectCode && (
                    <div className="pt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <Link2 className="w-3 h-3" /> Đề tài: {pub.relatedProjectCode}
                      </span>
                    </div>
                  )}

                  {pub.abstract && (
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                      {pub.abstract}
                    </p>
                  )}
                </div>

                {/* Right Actions */}
                <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0">
                  {pub.doi ? (
                    <a
                      href={`https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                    >
                      DOI Link <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : pub.url ? (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                    >
                      Xem bài viết <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(pub)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Sửa công bố"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingPub(pub)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa công bố"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPubs.length === 0 && (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
            <BookOpenCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Không tìm thấy công bố khoa học nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Thử xóa bớt bộ lọc hoặc thêm mới bài báo khoa học.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <PublicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPub(null);
        }}
        onSave={handleSave}
        pubToEdit={editingPub}
        projects={projects}
        researchers={researchers}
      />

      <ConfirmModal
        isOpen={!!deletingPub}
        title="Xác nhận xóa công bố khoa học"
        message={`Bạn có chắc chắn muốn xóa bài báo/công trình "${deletingPub?.title}"?`}
        confirmLabel="Xác nhận xóa"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPub(null)}
      />
    </div>
  );
};
