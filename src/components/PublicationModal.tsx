import React, { useState, useEffect } from 'react';
import { X, BookOpenCheck, ExternalLink, FileText, Info, AlertCircle } from 'lucide-react';
import { Publication, PublicationType, IndexingDatabase, PublicationRank, ResearchProject, Researcher } from '../types';
import { DEPARTMENTS, PUBLICATION_TYPE_LABELS, INDEXING_LABELS } from '../data/mockData';

interface PublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pub: Publication) => void;
  pubToEdit?: Publication | null;
  projects: ResearchProject[];
  researchers: Researcher[];
}

export const PublicationModal: React.FC<PublicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  pubToEdit,
  projects,
  researchers,
}) => {
  const [title, setTitle] = useState('');
  const [firstAuthor, setFirstAuthor] = useState('');
  const [authorsText, setAuthorsText] = useState('');
  const [correspondingAuthor, setCorrespondingAuthor] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [journalOrConference, setJournalOrConference] = useState('');
  const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
  const [type, setType] = useState<PublicationType>('quoc_te');
  const [indexing, setIndexing] = useState<IndexingDatabase>('scopus');
  const [rank, setRank] = useState<PublicationRank>('Q1');
  const [pointsHDGSNN, setPointsHDGSNN] = useState<number | undefined>(undefined);
  const [doi, setDoi] = useState('');
  const [url, setUrl] = useState('');
  const [evidenceFile, setEvidenceFile] = useState('');
  const [citationsCount, setCitationsCount] = useState<number>(0);
  const [relatedProjectId, setRelatedProjectId] = useState<string>('');
  const [abstract, setAbstract] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pubToEdit) {
      setTitle(pubToEdit.title);
      setFirstAuthor(pubToEdit.firstAuthor);
      setAuthorsText(pubToEdit.authors.join(', '));
      setCorrespondingAuthor(pubToEdit.correspondingAuthor || '');
      setDepartment(pubToEdit.department);
      setJournalOrConference(pubToEdit.journalOrConference);
      setPublicationYear(pubToEdit.publicationYear);
      setType(pubToEdit.type);
      setIndexing(pubToEdit.indexing);
      setRank(pubToEdit.rank);
      setPointsHDGSNN(pubToEdit.pointsHDGSNN);
      setDoi(pubToEdit.doi || '');
      setUrl(pubToEdit.url || '');
      setEvidenceFile(pubToEdit.evidenceFile || '');
      setCitationsCount(pubToEdit.citationsCount || 0);
      setRelatedProjectId(pubToEdit.relatedProjectId || '');
      setAbstract(pubToEdit.abstract || '');
    } else {
      setTitle('');
      setFirstAuthor(researchers[0]?.fullName || '');
      setAuthorsText(`${researchers[0]?.fullName || ''}`);
      setCorrespondingAuthor(researchers[0]?.email ? `${researchers[0]?.fullName} (${researchers[0]?.email})` : '');
      setDepartment(DEPARTMENTS[0]);
      setJournalOrConference('');
      setPublicationYear(new Date().getFullYear());
      setType('quoc_te');
      setIndexing('scopus');
      setRank('Q2');
      setPointsHDGSNN(1.5);
      setDoi('');
      setUrl('');
      setEvidenceFile('');
      setCitationsCount(0);
      setRelatedProjectId(projects[0]?.id || '');
      setAbstract('');
    }
    setErrors({});
  }, [pubToEdit, isOpen, researchers, projects]);

  if (!isOpen) return null;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = 'Tên bài báo/công trình không được để trống';
    if (!firstAuthor.trim()) err.firstAuthor = 'Vui lòng nhập tác giả chính';
    if (!authorsText.trim()) err.authorsText = 'Vui lòng nhập danh sách tác giả';
    if (!journalOrConference.trim()) err.journalOrConference = 'Tên tạp chí hoặc hội nghị không được để trống';
    if (!publicationYear || publicationYear < 1990 || publicationYear > 2030) {
      err.publicationYear = 'Năm công bố không hợp lệ (1990 - 2030)';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const authorsList = authorsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const relatedProj = projects.find((p) => p.id === relatedProjectId);

    const savedPub: Publication = {
      id: pubToEdit ? pubToEdit.id : `pub-${Date.now()}`,
      title: title.trim(),
      authors: authorsList,
      firstAuthor: firstAuthor.trim(),
      correspondingAuthor: correspondingAuthor.trim(),
      department,
      journalOrConference: journalOrConference.trim(),
      publicationYear: Number(publicationYear),
      type,
      indexing,
      rank,
      pointsHDGSNN: pointsHDGSNN !== undefined ? Number(pointsHDGSNN) : undefined,
      doi: doi.trim(),
      url: url.trim(),
      evidenceFile: evidenceFile.trim(),
      citationsCount: Number(citationsCount),
      relatedProjectId: relatedProjectId || undefined,
      relatedProjectCode: relatedProj ? relatedProj.code : undefined,
      abstract: abstract.trim(),
      createdAt: pubToEdit?.createdAt || new Date().toISOString(),
    };

    onSave(savedPub);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {pubToEdit ? 'Chỉnh sửa Công bố Khoa học' : 'Khai báo Công bố Khoa học Mới'}
              </h3>
              <p className="text-xs text-slate-300">
                Nhập thông tin bài báo, tạp chí, chỉ số trích dẫn và liên kết đề tài
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice of Manual Indexing Verification */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>Lưu ý xác thực:</strong> Hệ thống không tự động khẳng định phân loại Scopus, WoS hay Q1–Q4. Các trường này do người dùng nhập và kiểm tra dựa trên minh chứng thực tế.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Tên bài báo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên bài báo / Công trình khoa học <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên bài báo đầy đủ bằng tiếng Anh hoặc tiếng Việt..."
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.title ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Tác giả & Đơn vị */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tác giả chính (First Author) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstAuthor}
                onChange={(e) => setFirstAuthor(e.target.value)}
                placeholder="e.g. Trần Hải Đăng"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.firstAuthor ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
              />
              {errors.firstAuthor && <p className="text-red-500 text-xs mt-1">{errors.firstAuthor}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn vị công tác chính <span className="text-red-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Danh sách tất cả các tác giả (phân tách bằng dấu phẩy) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={authorsText}
                onChange={(e) => setAuthorsText(e.target.value)}
                placeholder="e.g. Tran Hai Dang, Doan Thuy Dung, Pham Quang Huy"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.authorsText ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
              />
              {errors.authorsText && <p className="text-red-500 text-xs mt-1">{errors.authorsText}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tác giả liên hệ (Corresponding Author) & Email
              </label>
              <input
                type="text"
                value={correspondingAuthor}
                onChange={(e) => setCorrespondingAuthor(e.target.value)}
                placeholder="e.g. Tran Hai Dang (dang.th@uni-edu.vn)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Tạp chí & Năm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Tạp chí hoặc Hội nghị khoa học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={journalOrConference}
                onChange={(e) => setJournalOrConference(e.target.value)}
                placeholder="e.g. IEEE Transactions on Medical Imaging"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.journalOrConference ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
              />
              {errors.journalOrConference && <p className="text-red-500 text-xs mt-1">{errors.journalOrConference}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Năm công bố <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1990}
                max={2030}
                value={publicationYear}
                onChange={(e) => setPublicationYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-semibold"
              />
            </div>
          </div>

          {/* Phân loại & Chỉ mục CSDL */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Phân loại & Cơ sở dữ liệu khoa học (Do người dùng nhập & kiểm tra)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loại công bố
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PublicationType)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {Object.entries(PUBLICATION_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cơ sở dữ liệu (CSDL)
                </label>
                <select
                  value={indexing}
                  onChange={(e) => setIndexing(e.target.value as IndexingDatabase)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {Object.entries(INDEXING_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phân hạng (Quartile / Q1–Q4)
                </label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value as PublicationRank)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="none">Không phân hạng / Khác</option>
                  <option value="Q1">Q1 (Top 25% uy tín nhất)</option>
                  <option value="Q2">Q2 (Top 25% - 50%)</option>
                  <option value="Q3">Q3 (Top 50% - 75%)</option>
                  <option value="Q4">Q4 (Top 75% - 100%)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Điểm Tạp chí theo HĐGSNN (nếu có)
                </label>
                <input
                  type="number"
                  step={0.25}
                  min={0}
                  max={3}
                  value={pointsHDGSNN ?? ''}
                  onChange={(e) => setPointsHDGSNN(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 1.0 hoặc 1.5 điểm"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số lượt trích dẫn ước tính (Citations)
                </label>
                <input
                  type="number"
                  min={0}
                  value={citationsCount}
                  onChange={(e) => setCitationsCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* DOI & Liên kết */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã định danh số DOI (không cần tiền tố https://doi.org/)
              </label>
              <input
                type="text"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="e.g. 10.1109/TMI.2024.3391024"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đường dẫn liên kết trực tuyến (URL)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tệp minh chứng (PDF / scan trang bìa & mục lục)
              </label>
              <input
                type="text"
                value={evidenceFile}
                onChange={(e) => setEvidenceFile(e.target.value)}
                placeholder="e.g. IEEE_TMI_2024_MinhChung.pdf"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gắn với Đề tài nghiên cứu liên quan
              </label>
              <select
                value={relatedProjectId}
                onChange={(e) => setRelatedProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="">-- Không gắn với đề tài nào --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.title.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tóm tắt bài báo (Abstract)
            </label>
            <textarea
              rows={3}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Tóm tắt ngắn gọn đóng góp khoa học chính..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              {pubToEdit ? 'Lưu thay đổi' : 'Khai báo công bố'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
