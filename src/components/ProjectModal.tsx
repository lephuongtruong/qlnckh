import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, DollarSign, Award, Building2, User, FileText, CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react';
import { ResearchProject, ProjectLevel, ProjectStatus, Milestone, Researcher } from '../types';
import { DEPARTMENTS, PROJECT_LEVEL_LABELS, PROJECT_STATUS_LABELS } from '../data/mockData';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: ResearchProject) => void;
  projectToEdit?: ResearchProject | null;
  researchers: Researcher[];
  onOpenExcelImport?: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
  researchers,
  onOpenExcelImport,
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<ProjectLevel>('truong');
  const [leadResearcherId, setLeadResearcherId] = useState('');
  const [leadResearcherName, setLeadResearcherName] = useState('');
  const [membersText, setMembersText] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState<number>(50000000);
  const [objectives, setObjectives] = useState('');
  const [content, setContent] = useState('');
  const [expectedProducts, setExpectedProducts] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('dang_thuc_hien');
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (projectToEdit) {
      setCode(projectToEdit.code);
      setTitle(projectToEdit.title);
      setLevel(projectToEdit.level);
      setLeadResearcherId(projectToEdit.leadResearcherId);
      setLeadResearcherName(projectToEdit.leadResearcherName);
      setMembersText(projectToEdit.members.join(', '));
      setDepartment(projectToEdit.department);
      setStartDate(projectToEdit.startDate);
      setEndDate(projectToEdit.endDate);
      setBudget(projectToEdit.budget);
      setObjectives(projectToEdit.objectives);
      setContent(projectToEdit.content);
      setExpectedProducts(projectToEdit.expectedProducts);
      setStatus(projectToEdit.status);
      setCompletionRate(projectToEdit.completionRate);
      setNotes(projectToEdit.notes || '');
      setMilestones(projectToEdit.milestones || []);
    } else {
      // Default new project
      setCode(`DT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setTitle('');
      setLevel('truong');
      if (researchers.length > 0) {
        setLeadResearcherId(researchers[0].id);
        setLeadResearcherName(`${researchers[0].titleAndDegree} ${researchers[0].fullName}`);
      } else {
        setLeadResearcherId('');
        setLeadResearcherName('');
      }
      setMembersText('');
      setDepartment(DEPARTMENTS[0]);
      const now = new Date();
      setStartDate(now.toISOString().slice(0, 10));
      const nextYear = new Date(now.setFullYear(now.getFullYear() + 1));
      setEndDate(nextYear.toISOString().slice(0, 10));
      setBudget(80000000);
      setObjectives('');
      setContent('');
      setExpectedProducts('01 bài báo khoa học, 01 báo cáo tổng kết đề tài');
      setStatus('dang_thuc_hien');
      setCompletionRate(10);
      setNotes('');
      setMilestones([
        {
          id: `m-${Date.now()}-1`,
          title: 'Tổng quan tài liệu và hoàn thiện đề cương chi tiết',
          dueDate: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
          assignee: researchers[0]?.fullName || 'Chủ nhiệm đề tài',
          status: 'dang_thuc_hien',
          progressPct: 50,
        },
      ]);
    }
    setErrors({});
  }, [projectToEdit, isOpen, researchers]);

  if (!isOpen) return null;

  const handleLeadResearcherChange = (rId: string) => {
    setLeadResearcherId(rId);
    const found = researchers.find((r) => r.id === rId);
    if (found) {
      setLeadResearcherName(`${found.titleAndDegree} ${found.fullName}`);
      setDepartment(found.department);
    }
  };

  const handleAddMilestone = () => {
    const newM: Milestone = {
      id: `m-${Date.now()}`,
      title: '',
      dueDate: endDate || new Date().toISOString().slice(0, 10),
      assignee: leadResearcherName || 'Chủ nhiệm',
      status: 'chua_bat_dau',
      progressPct: 0,
    };
    setMilestones([...milestones, newM]);
  };

  const handleUpdateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!code.trim()) err.code = 'Mã đề tài không được để trống';
    if (!title.trim()) err.title = 'Tên đề tài không được để trống';
    if (!leadResearcherName.trim()) err.leadResearcherName = 'Vui lòng chọn hoặc nhập chủ nhiệm đề tài';
    if (!startDate) err.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!endDate) err.endDate = 'Vui lòng chọn ngày kết thúc';
    if (startDate && endDate && startDate > endDate) {
      err.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    if (budget <= 0) err.budget = 'Kinh phí phải lớn hơn 0 VNĐ';
    if (!objectives.trim()) err.objectives = 'Vui lòng nhập mục tiêu đề tài';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const membersList = membersText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedProject: ResearchProject = {
      id: projectToEdit ? projectToEdit.id : `proj-${Date.now()}`,
      code: code.trim(),
      title: title.trim(),
      level,
      leadResearcherId,
      leadResearcherName,
      members: membersList,
      department,
      startDate,
      endDate,
      budget: Number(budget),
      objectives: objectives.trim(),
      content: content.trim(),
      expectedProducts: expectedProducts.trim(),
      status,
      completionRate: Number(completionRate),
      milestones,
      notes: notes.trim(),
      documents: projectToEdit?.documents || [],
      createdAt: projectToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedProject);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {projectToEdit ? 'Chỉnh sửa Đề tài Nghiên cứu' : 'Đăng ký Đề tài Nghiên cứu Mới'}
              </h3>
              <p className="text-xs text-slate-300">
                Nhập đầy đủ thông tin đề tài, kinh phí và các mốc tiến độ theo quy định
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Excel Import Invitation */}
          {!projectToEdit && onOpenExcelImport && (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-950 font-medium">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>
                  Bạn có danh sách nhiều đề tài cần đăng ký? Sử dụng tính năng <strong>Nhập từ file Excel mẫu</strong> để nạp nhanh hàng loạt.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenExcelImport();
                }}
                className="px-3 py-1.5 text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>Mở cửa sổ Nhập Excel</span>
              </button>
            </div>
          )}

          {/* Section 1: Thông tin cơ bản */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> 1. Thông tin chung về đề tài
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã đề tài <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. DT-2025-01"
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.code ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cấp đề tài <span className="text-red-500">*</span>
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as ProjectLevel)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {Object.entries(PROJECT_LEVEL_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái hiện tại <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {Object.entries(PROJECT_STATUS_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên đề tài nghiên cứu <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tên đầy đủ của đề tài..."
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.title ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Nhân sự & Đơn vị */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> 2. Nhân sự & Đơn vị chủ trì
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chủ nhiệm đề tài <span className="text-red-500">*</span>
                </label>
                <select
                  value={leadResearcherId}
                  onChange={(e) => handleLeadResearcherChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="">-- Chọn nhà nghiên cứu --</option>
                  {researchers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.titleAndDegree} {r.fullName} ({r.code})
                    </option>
                  ))}
                </select>
                {errors.leadResearcherName && (
                  <p className="text-red-500 text-xs mt-1">{errors.leadResearcherName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đơn vị chủ trì <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiến độ hoàn thành: <span className="font-bold text-blue-600">{completionRate}%</span>
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={completionRate}
                    onChange={(e) => setCompletionRate(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold w-12 text-right">{completionRate}%</span>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Các thành viên tham gia (phân tách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={membersText}
                  onChange={(e) => setMembersText(e.target.value)}
                  placeholder="e.g. TS Đoàn Thùy Dung, ThS Hoàng Văn Nam, SV Lê Minh Tuấn"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Thời gian & Kinh phí */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> 3. Thời gian thực hiện & Kinh phí
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.startDate ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày kết thúc dự kiến <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.endDate ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kinh phí được phê duyệt (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.budget ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-semibold`}
                />
                <span className="text-[11px] text-slate-500">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(budget || 0)}
                </span>
                {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: Nội dung & Sản phẩm */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> 4. Nội dung khoa học & Sản phẩm
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mục tiêu nghiên cứu <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="Mục tiêu tổng quát và mục tiêu cụ thể..."
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.objectives ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                />
                {errors.objectives && <p className="text-red-500 text-xs mt-1">{errors.objectives}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung nghiên cứu chính
                </label>
                <textarea
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tóm tắt các nội dung công việc chính sẽ thực hiện..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sản phẩm dự kiến (Bài báo, sách, sáng chế, phần mềm, đào tạo)
                </label>
                <input
                  type="text"
                  value={expectedProducts}
                  onChange={(e) => setExpectedProducts(e.target.value)}
                  placeholder="e.g. 02 bài báo ISI/Scopus (01 bài Q1), 01 Thạc sĩ"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Các mốc tiến độ (Milestones) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span> 5. Các mốc tiến độ thực hiện ({milestones.length})
              </h4>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm mốc tiến độ
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((m, index) => (
                <div key={m.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500">Mốc {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(m.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Xóa mốc"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => handleUpdateMilestone(m.id, 'title', e.target.value)}
                        placeholder="Nội dung mốc công việc..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={m.dueDate}
                        onChange={(e) => handleUpdateMilestone(m.id, 'dueDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <select
                        value={m.status}
                        onChange={(e) => handleUpdateMilestone(m.id, 'status', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-slate-300"
                      >
                        <option value="chua_bat_dau">Chưa bắt đầu</option>
                        <option value="dang_thuc_hien">Đang thực hiện</option>
                        <option value="hoan_thanh">Hoàn thành</option>
                        <option value="tre_han">Trễ hạn</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {milestones.length === 0 && (
                <p className="text-xs text-slate-400 italic">Chưa có mốc tiến độ nào được tạo.</p>
              )}
            </div>
          </div>

          {/* Section 6: Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú thêm & Thông tin thẩm định
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Đã duyệt đợt 1, biên bản họp số 12/HĐ-KH..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Modal Footer Actions */}
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
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              {projectToEdit ? 'Lưu thay đổi' : 'Thêm đề tài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
