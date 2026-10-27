import React from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Award, 
  Building2, 
  User, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  BookOpenCheck, 
  ExternalLink,
  Edit,
  FileSpreadsheet
} from 'lucide-react';
import { ResearchProject, Publication } from '../types';
import { PROJECT_LEVEL_LABELS, PROJECT_STATUS_LABELS } from '../data/mockData';
import { formatVND, formatDate } from '../utils/storage';

interface ProjectDetailModalProps {
  project: ResearchProject | null;
  onClose: () => void;
  onEdit: (project: ResearchProject) => void;
  publications: Publication[];
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onEdit,
  publications,
}) => {
  if (!project) return null;

  const levelInfo = PROJECT_LEVEL_LABELS[project.level] || { label: project.level, badge: 'bg-slate-100 text-slate-700' };
  const statusInfo = PROJECT_STATUS_LABELS[project.status] || { label: project.status, badge: 'bg-slate-100 text-slate-700' };

  // Find linked publications
  const relatedPubs = publications.filter(
    (pub) => pub.relatedProjectId === project.id || pub.relatedProjectCode === project.code
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-blue-200 border border-white/20">
                {project.code}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${levelInfo.badge}`}>
                {levelInfo.label}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.badge}`}>
                {statusInfo.label}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold leading-snug">
              {project.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-blue-200">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>{project.department}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onClose();
                onEdit(project);
              }}
              className="p-2 text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Chỉnh sửa đề tài"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Chỉnh sửa</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Kinh phí phê duyệt</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {formatVND(project.budget)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Thời gian thực hiện</span>
              <span className="text-xs font-semibold text-slate-900 mt-1 block">
                {formatDate(project.startDate)} → {formatDate(project.endDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Tiến độ tổng thể</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${project.completionRate}%` }}
                  />
                </div>
                <span className="font-bold text-blue-700">{project.completionRate}%</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Công bố liên quan</span>
              <span className="text-base font-bold text-indigo-700 mt-0.5 block">
                {relatedPubs.length} bài báo
              </span>
            </div>
          </div>

          {/* Nhân sự */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" /> Chủ nhiệm đề tài
              </h4>
              <div className="text-sm font-bold text-slate-900">
                {project.leadResearcherName}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Đơn vị: {project.department}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" /> Các thành viên tham gia
              </h4>
              {project.members && project.members.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {project.members.map((m, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa có thành viên nào khác.</p>
              )}
            </div>
          </div>

          {/* Mục tiêu & Sản phẩm */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mục tiêu nghiên cứu
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                {project.objectives || 'Chưa cập nhật mục tiêu cụ thể.'}
              </p>
            </div>

            {project.content && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nội dung nghiên cứu chính
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  {project.content}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sản phẩm dự kiến
              </h4>
              <div className="text-sm font-medium text-blue-900 bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                {project.expectedProducts || 'Theo thuyết minh đề tài được phê duyệt.'}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Các mốc tiến độ thực hiện ({project.milestones?.length || 0})</span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
              {project.milestones && project.milestones.length > 0 ? (
                project.milestones.map((m, index) => {
                  const isDone = m.status === 'hoan_thanh';
                  const isLate = m.status === 'tre_han';
                  return (
                    <div key={m.id} className="p-3.5 bg-white hover:bg-slate-50/60 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : isLate ? (
                            <AlertCircle className="w-5 h-5 text-rose-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-semibold text-slate-900">
                            Mốc {index + 1}: {m.title}
                          </h5>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            <span>Hạn nộp: <strong className="text-slate-700">{formatDate(m.dueDate)}</strong></span>
                            <span>Người phụ trách: <strong>{m.assignee}</strong></span>
                            {m.note && <span className="text-slate-600 italic">“{m.note}”</span>}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isDone 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : isLate 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {isDone ? 'Hoàn thành' : isLate ? 'Trễ hạn' : 'Đang làm'}
                        </span>
                        <div className="text-[11px] text-slate-500 font-bold mt-1">
                          {m.progressPct}%
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Chưa ghi nhận mốc tiến độ cụ thể.
                </div>
              )}
            </div>
          </div>

          {/* Related Publications */}
          {relatedPubs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-indigo-600" /> 
                Bài báo & Công bố xuất phát từ đề tài ({relatedPubs.length})
              </h4>
              <div className="space-y-2">
                {relatedPubs.map((pub) => (
                  <div 
                    key={pub.id}
                    className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{pub.title}</div>
                      <div className="text-slate-600 mt-0.5">
                        {pub.journalOrConference} ({pub.publicationYear}) • Tác giả chính: <strong>{pub.firstAuthor}</strong>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-indigo-700">{pub.indexing}</span>
                        {pub.rank !== 'none' && (
                          <span className="px-1.5 py-0.2 bg-red-100 text-red-700 font-bold rounded">
                            {pub.rank}
                          </span>
                        )}
                        {pub.doi && (
                          <a 
                            href={`https://doi.org/${pub.doi}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5 ml-2"
                          >
                            DOI: {pub.doi} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {project.notes && (
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong className="font-bold">Ghi chú quản lý:</strong> {project.notes}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Cập nhật lần cuối: {new Date(project.updatedAt).toLocaleDateString('vi-VN')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
