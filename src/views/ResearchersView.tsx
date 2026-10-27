import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  BookOpen, 
  FileText, 
  Award, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Eye, 
  Sparkles,
  X,
  GraduationCap
} from 'lucide-react';
import { Researcher, ResearchProject, Publication, UserRole } from '../types';
import { DEPARTMENTS } from '../data/mockData';
import { ConfirmModal } from '../components/ConfirmModal';

interface ResearchersViewProps {
  researchers: Researcher[];
  projects: ResearchProject[];
  publications: Publication[];
  currentRole: UserRole;
  onSaveResearcher: (r: Researcher) => void;
  onDeleteResearcher: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSelectProject: (p: ResearchProject) => void;
}

export const ResearchersView: React.FC<ResearchersViewProps> = ({
  researchers,
  projects,
  publications,
  currentRole,
  onSaveResearcher,
  onDeleteResearcher,
  onShowToast,
  onSelectProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResearcher, setEditingResearcher] = useState<Researcher | null>(null);
  const [viewingResearcher, setViewingResearcher] = useState<Researcher | null>(null);
  const [deletingResearcher, setDeletingResearcher] = useState<Researcher | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [titleAndDegree, setTitleAndDegree] = useState('TS');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [researchArea, setResearchArea] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orcid, setOrcid] = useState('');
  const [scopusAuthorId, setScopusAuthorId] = useState('');
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredResearchers = useMemo(() => {
    return researchers.filter((r) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = r.fullName.toLowerCase().includes(q);
        const matchCode = r.code.toLowerCase().includes(q);
        const matchArea = r.researchArea.toLowerCase().includes(q);
        const matchEmail = r.email.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchArea && !matchEmail) return false;
      }
      if (filterDept !== 'all' && r.department !== filterDept) return false;
      return true;
    });
  }, [researchers, searchTerm, filterDept]);

  const handleOpenAdd = () => {
    setEditingResearcher(null);
    setCode(`GV-${Math.floor(1000 + Math.random() * 9000)}`);
    setFullName('');
    setTitleAndDegree('TS');
    setDepartment(DEPARTMENTS[0]);
    setResearchArea('');
    setEmail('');
    setPhone('');
    setOrcid('');
    setScopusAuthorId('');
    setBio('');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Researcher) => {
    setEditingResearcher(r);
    setCode(r.code);
    setFullName(r.fullName);
    setTitleAndDegree(r.titleAndDegree);
    setDepartment(r.department);
    setResearchArea(r.researchArea);
    setEmail(r.email);
    setPhone(r.phone);
    setOrcid(r.orcid || '');
    setScopusAuthorId(r.scopusAuthorId || '');
    setBio(r.bio || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const err: Record<string, string> = {};
    if (!code.trim()) err.code = 'Mã giảng viên không được để trống';
    if (!fullName.trim()) err.fullName = 'Họ và tên không được để trống';
    if (!email.trim()) err.email = 'Email không được để trống';
    if (!researchArea.trim()) err.researchArea = 'Vui lòng nhập hướng nghiên cứu';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const saved: Researcher = {
      id: editingResearcher ? editingResearcher.id : `res-${Date.now()}`,
      code: code.trim(),
      fullName: fullName.trim(),
      titleAndDegree: titleAndDegree.trim(),
      department,
      researchArea: researchArea.trim(),
      email: email.trim(),
      phone: phone.trim(),
      orcid: orcid.trim() || undefined,
      scopusAuthorId: scopusAuthorId.trim() || undefined,
      bio: bio.trim() || undefined,
      hIndex: editingResearcher?.hIndex || Math.floor(2 + Math.random() * 8),
    };

    onSaveResearcher(saved);
    setIsModalOpen(false);
    onShowToast('Đã lưu hồ sơ nhà nghiên cứu thành công!', 'success');
  };

  const handleDeleteConfirm = () => {
    if (deletingResearcher) {
      onDeleteResearcher(deletingResearcher.id);
      onShowToast(`Đã xóa nhà nghiên cứu ${deletingResearcher.fullName}`, 'info');
      setDeletingResearcher(null);
    }
  };

  // Profile Dossier details
  const viewingProjects = viewingResearcher
    ? projects.filter(
        (p) =>
          p.leadResearcherId === viewingResearcher.id ||
          p.leadResearcherName.includes(viewingResearcher.fullName) ||
          p.members.some((m) => m.includes(viewingResearcher.fullName))
      )
    : [];

  const viewingPublications = viewingResearcher
    ? publications.filter(
        (pub) =>
          pub.firstAuthor.includes(viewingResearcher.fullName) ||
          pub.authors.some((a) => a.includes(viewingResearcher.fullName))
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Hồ sơ Nhà nghiên cứu & Giảng viên
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý lý lịch khoa học, hướng nghiên cứu, chỉ số học thuật và liên kết đề tài/bài báo
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhà nghiên cứu</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, mã giảng viên, chuyên ngành, email..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="w-full sm:w-72">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">Tất cả khoa / viện</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Researchers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResearchers.map((researcher) => {
          const resProjects = projects.filter(
            (p) =>
              p.leadResearcherId === researcher.id ||
              p.leadResearcherName.includes(researcher.fullName) ||
              p.members.some((m) => m.includes(researcher.fullName))
          );
          const resPubs = publications.filter(
            (pub) =>
              pub.firstAuthor.includes(researcher.fullName) ||
              pub.authors.some((a) => a.includes(researcher.fullName))
          );

          return (
            <div
              key={researcher.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0 overflow-hidden">
                    {researcher.avatarUrl ? (
                      <img
                        src={researcher.avatarUrl}
                        alt={researcher.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      researcher.fullName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {researcher.titleAndDegree}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {researcher.code}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1 truncate group-hover:text-blue-600 transition-colors">
                      {researcher.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {researcher.department}
                    </p>
                  </div>
                </div>

                {/* Research area */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Hướng nghiên cứu
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                    {researcher.researchArea}
                  </p>
                </div>

                {/* Contact and IDs */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{researcher.email}</span>
                  </div>
                  {researcher.orcid && (
                    <div className="flex items-center gap-2 truncate text-[11px]">
                      <span className="font-bold text-emerald-600 shrink-0">ORCID:</span>
                      <span className="font-mono text-slate-600 truncate">{researcher.orcid}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Footer & Actions */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <strong className="text-blue-600">{resProjects.length}</strong> đề tài
                  </div>
                  <div>•</div>
                  <div>
                    <strong className="text-indigo-600">{resPubs.length}</strong> bài báo
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingResearcher(researcher)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem hồ sơ khoa học"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(researcher)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Chỉnh sửa hồ sơ"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingResearcher(researcher)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Xóa hồ sơ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {viewingResearcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div 
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">
                  {viewingResearcher.avatarUrl ? (
                    <img src={viewingResearcher.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    viewingResearcher.fullName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-xs font-semibold">
                      {viewingResearcher.titleAndDegree}
                    </span>
                    <span className="font-mono text-xs text-blue-200">{viewingResearcher.code}</span>
                  </div>
                  <h3 className="text-xl font-extrabold mt-1">{viewingResearcher.fullName}</h3>
                  <p className="text-xs text-blue-200 mt-0.5">{viewingResearcher.department}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingResearcher(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xl font-extrabold text-blue-700">{viewingProjects.length}</div>
                  <div className="text-slate-500 mt-0.5">Đề tài NCKH tham gia</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xl font-extrabold text-indigo-700">{viewingPublications.length}</div>
                  <div className="text-slate-500 mt-0.5">Công bố khoa học</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xl font-extrabold text-emerald-700">{viewingResearcher.hIndex || 5}</div>
                  <div className="text-slate-500 mt-0.5">Chỉ số h-index</div>
                </div>
              </div>

              {viewingResearcher.bio && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tiểu sử khoa học
                  </h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {viewingResearcher.bio}
                  </p>
                </div>
              )}

              {/* Research Projects List */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Đề tài nghiên cứu ({viewingProjects.length})
                </h4>
                <div className="space-y-2">
                  {viewingProjects.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setViewingResearcher(null);
                        onSelectProject(p);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-colors text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-blue-700 mr-2">{p.code}</span>
                        <span className="font-semibold text-slate-900">{p.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0 ml-2 font-medium">
                        {p.status}
                      </span>
                    </div>
                  ))}
                  {viewingProjects.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Chưa có đề tài nào được ghi nhận.</p>
                  )}
                </div>
              </div>

              {/* Publications List */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Công bố khoa học ({viewingPublications.length})
                </h4>
                <div className="space-y-2">
                  {viewingPublications.map((pub) => (
                    <div 
                      key={pub.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs"
                    >
                      <div className="font-semibold text-slate-900">{pub.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {pub.journalOrConference} ({pub.publicationYear}) • {pub.indexing} {pub.rank !== 'none' ? `(${pub.rank})` : ''}
                      </div>
                    </div>
                  ))}
                  {viewingPublications.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Chưa có bài báo nào được liên kết.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingResearcher(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingResearcher ? 'Chỉnh sửa Hồ sơ Giảng viên' : 'Thêm Hồ sơ Nhà nghiên cứu'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã giảng viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                  {errors.code && <p className="text-red-500 mt-1">{errors.code}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Học hàm / Học vị <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={titleAndDegree}
                    onChange={(e) => setTitleAndDegree(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                  >
                    <option value="GS.TS">GS.TS</option>
                    <option value="PGS.TS">PGS.TS</option>
                    <option value="TS">Tiến sĩ (TS)</option>
                    <option value="TS.BS">TS. Bác sĩ (TS.BS)</option>
                    <option value="ThS">Thạc sĩ (ThS)</option>
                    <option value="KS">Kỹ sư (KS)</option>
                    <option value="CN">Cử nhân (CN)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                  {errors.fullName && <p className="text-red-500 mt-1">{errors.fullName}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Đơn vị công tác <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lĩnh vực / Hướng nghiên cứu chuyên sâu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={researchArea}
                  onChange={(e) => setResearchArea(e.target.value)}
                  placeholder="e.g. Trí tuệ nhân tạo, Vật liệu nano..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
                {errors.researchArea && <p className="text-red-500 mt-1">{errors.researchArea}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@uni-edu.vn"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                  {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã định danh ORCID (nếu có)
                  </label>
                  <input
                    type="text"
                    value={orcid}
                    onChange={(e) => setOrcid(e.target.value)}
                    placeholder="0000-0002-..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Scopus Author ID (nếu có)
                  </label>
                  <input
                    type="text"
                    value={scopusAuthorId}
                    onChange={(e) => setScopusAuthorId(e.target.value)}
                    placeholder="571923..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Giới thiệu ngắn (Bio)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Kinh nghiệm nghiên cứu, thành tích..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {editingResearcher ? 'Lưu thay đổi' : 'Thêm nhà nghiên cứu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deletingResearcher}
        title="Xác nhận xóa nhà nghiên cứu"
        message={`Bạn có chắc chắn muốn xóa hồ sơ của "${deletingResearcher?.fullName}" (${deletingResearcher?.code})?`}
        confirmLabel="Xác nhận xóa"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingResearcher(null)}
      />
    </div>
  );
};
