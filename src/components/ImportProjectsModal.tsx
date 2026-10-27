import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Info,
  Calendar,
  Building2,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ResearchProject, Researcher } from '../types';
import { 
  downloadProjectImportTemplate, 
  mapLevelStringToKey, 
  mapStatusStringToKey, 
  normalizeDateString,
  formatShortVND
} from '../utils/storage';
import { PROJECT_LEVEL_LABELS, PROJECT_STATUS_LABELS } from '../data/mockData';

interface ParsedRowResult {
  rowNum: number;
  project?: ResearchProject;
  isValid: boolean;
  errors: string[];
  raw: Record<string, any>;
}

interface ImportProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportConfirm: (projects: ResearchProject[]) => void;
  researchers: Researcher[];
  existingCodes: string[];
}

export const ImportProjectsModal: React.FC<ImportProjectsModalProps> = ({
  isOpen,
  onClose,
  onImportConfirm,
  researchers,
  existingCodes,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRowResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterInvalidOnly, setFilterInvalidOnly] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    downloadProjectImportTemplate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      processExcelFile(file);
    }
  };

  const processExcelFile = (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: 'array' });
        
        // Read first sheet
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rawJson.length === 0) {
          setParsedRows([]);
          setIsProcessing(false);
          return;
        }

        const results: ParsedRowResult[] = rawJson.map((row, index) => {
          const rowNum = index + 2; // Row in excel (header is row 1)
          const errors: string[] = [];

          // Helper to find column regardless of case/space
          const findVal = (keys: string[]): any => {
            for (const k of keys) {
              if (row[k] !== undefined && String(row[k]).trim() !== '') {
                return row[k];
              }
            }
            // Fuzzy match
            for (const rowKey of Object.keys(row)) {
              for (const k of keys) {
                if (rowKey.toLowerCase().includes(k.toLowerCase())) {
                  return row[rowKey];
                }
              }
            }
            return '';
          };

          const code = String(findVal(['Mã đề tài (*)', 'Mã đề tài', 'Mã', 'code'])).trim();
          const title = String(findVal(['Tên đề tài (*)', 'Tên đề tài', 'Tên', 'title'])).trim();
          const levelStr = String(findVal(['Cấp đề tài (*)', 'Cấp đề tài', 'Cấp', 'level'])).trim();
          const leadName = String(findVal(['Chủ nhiệm đề tài (*)', 'Chủ nhiệm đề tài', 'Chủ nhiệm', 'leadResearcherName'])).trim();
          const dept = String(findVal(['Đơn vị chủ trì (*)', 'Đơn vị chủ trì', 'Đơn vị', 'department'])).trim();
          const membersRaw = String(findVal(['Thành viên tham gia (phân cách dấu phẩy)', 'Thành viên tham gia', 'Thành viên', 'members'])).trim();
          const startDateRaw = findVal(['Ngày bắt đầu (YYYY-MM-DD) (*)', 'Ngày bắt đầu', 'startDate']);
          const endDateRaw = findVal(['Ngày kết thúc (YYYY-MM-DD) (*)', 'Ngày kết thúc', 'endDate']);
          const budgetRaw = findVal(['Kinh phí phê duyệt (VNĐ) (*)', 'Kinh phí phê duyệt', 'Kinh phí', 'budget']);
          const objectives = String(findVal(['Mục tiêu nghiên cứu (*)', 'Mục tiêu nghiên cứu', 'Mục tiêu', 'objectives'])).trim();
          const content = String(findVal(['Nội dung nghiên cứu', 'Nội dung', 'content'])).trim();
          const expectedProducts = String(findVal(['Sản phẩm dự kiến', 'Sản phẩm', 'expectedProducts'])).trim();
          const statusStr = String(findVal(['Trạng thái (*)', 'Trạng thái', 'status'])).trim();
          const completionRateRaw = findVal(['Tiến độ hoàn thành (%)', 'Tiến độ', 'completionRate']);
          const notes = String(findVal(['Ghi chú', 'notes'])).trim();

          // Required validations
          if (!code) errors.push('Thiếu Mã đề tài');
          if (!title) errors.push('Thiếu Tên đề tài');
          if (!leadName) errors.push('Thiếu Chủ nhiệm đề tài');
          if (!dept) errors.push('Thiếu Đơn vị chủ trì');

          const startDate = normalizeDateString(startDateRaw) || new Date().toISOString().slice(0, 10);
          const endDate = normalizeDateString(endDateRaw) || '';
          if (!endDate) {
            errors.push('Thiếu Ngày kết thúc hoặc định dạng ngày không hợp lệ');
          } else if (startDate > endDate) {
            errors.push('Ngày kết thúc phải sau ngày bắt đầu');
          }

          let budgetNum = Number(String(budgetRaw).replace(/[^0-9]/g, ''));
          if (isNaN(budgetNum) || budgetNum <= 0) {
            budgetNum = 50000000; // fallback if missing
          }

          let completionRate = Number(completionRateRaw) || 0;
          if (completionRate < 0) completionRate = 0;
          if (completionRate > 100) completionRate = 100;

          const level = mapLevelStringToKey(levelStr);
          const status = mapStatusStringToKey(statusStr);

          // Check duplicate code
          if (existingCodes.includes(code)) {
            errors.push(`Mã đề tài "${code}" đã tồn tại trong hệ thống`);
          }

          // Members list
          const members = membersRaw
            ? membersRaw.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

          // Find lead researcher ID if matching
          const foundResearcher = researchers.find(
            (r) => leadName.toLowerCase().includes(r.fullName.toLowerCase())
          );

          const project: ResearchProject = {
            id: `proj-import-${Date.now()}-${index}`,
            code: code || `DT-IMP-${Math.floor(100 + Math.random() * 900)}`,
            title: title || 'Đề tài chưa đặt tên',
            level,
            leadResearcherId: foundResearcher ? foundResearcher.id : 'res-external',
            leadResearcherName: leadName || 'Chủ nhiệm đề tài',
            members,
            department: dept || 'Khoa Dược học',
            startDate,
            endDate: endDate || startDate,
            budget: budgetNum,
            objectives: objectives || 'Mục tiêu theo thuyết minh được duyệt',
            content: content || '',
            expectedProducts: expectedProducts || '01 bài báo khoa học, báo cáo nghiệm thu',
            status,
            completionRate,
            milestones: [
              {
                id: `m-imp-${Date.now()}-${index}-1`,
                title: 'Tổng quan tài liệu và hoàn thiện đề cương',
                dueDate: endDate || startDate,
                assignee: leadName,
                status: completionRate > 0 ? 'hoan_thanh' : 'chua_bat_dau',
                progressPct: completionRate > 0 ? 100 : 0,
              },
            ],
            notes: notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            rowNum,
            project,
            isValid: errors.length === 0,
            errors,
            raw: row,
          };
        });

        setParsedRows(results);
        setIsProcessing(false);
      } catch (err) {
        console.error('Error parsing Excel:', err);
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validRows = parsedRows.filter((r) => r.isValid && r.project);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const displayedRows = filterInvalidOnly ? invalidRows : parsedRows;

  const handleConfirm = () => {
    const projectsToImport = validRows.map((r) => r.project!);
    if (projectsToImport.length > 0) {
      onImportConfirm(projectsToImport);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Nhập Danh Sách Đề Tài từ File Excel
              </h3>
              <p className="text-xs text-slate-300">
                Trường Đại học Dược Hà Nội • Hỗ trợ tệp .xlsx, .xls có kiểm tra tính hợp lệ dữ liệu
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

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Step 1: Download Template Banner */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Bước 1: Tải File Excel Mẫu Chuẩn
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  File mẫu đã được thiết lập sẵn các cột theo quy định quản lý NCKH Trường Đại học Dược Hà Nội kèm sheet hướng dẫn nhập liệu chi tiết.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-4 py-2 text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs flex items-center gap-2 shrink-0 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Tải file Excel mẫu (.xlsx)</span>
            </button>
          </div>

          {/* Step 2: Upload File Area */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Bước 2: Chọn tệp Excel dữ liệu đề tài</span>
            </h4>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>

              {selectedFile ? (
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Kích thước: {(selectedFile.size / 1024).toFixed(1)} KB • Nhấn để chọn file khác
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Kéo thả tệp Excel vào đây hoặc <span className="text-emerald-600 underline">bấm để duyệt tệp</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Định dạng hỗ trợ: Microsoft Excel (.xlsx, .xls)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Preview and Validation */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span>Bước 3: Kết quả kiểm tra dữ liệu ({parsedRows.length} dòng)</span>
                  </h4>
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ: {validRows.length} đề tài
                    </span>
                    {invalidRows.length > 0 && (
                      <span className="flex items-center gap-1 font-semibold text-rose-700">
                        <AlertCircle className="w-3.5 h-3.5" /> Có lỗi: {invalidRows.length} dòng
                      </span>
                    )}
                  </div>
                </div>

                {invalidRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterInvalidOnly(!filterInvalidOnly)}
                    className="text-xs text-slate-600 hover:text-rose-600 underline"
                  >
                    {filterInvalidOnly ? 'Hiển thị tất cả dòng' : 'Chỉ xem các dòng có lỗi'}
                  </button>
                )}
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center">Dòng</th>
                      <th className="py-2.5 px-3 w-24 text-center">Trạng thái</th>
                      <th className="py-2.5 px-3">Mã & Tên đề tài</th>
                      <th className="py-2.5 px-3">Cấp & Đơn vị</th>
                      <th className="py-2.5 px-3">Chủ nhiệm</th>
                      <th className="py-2.5 px-3 text-right">Kinh phí</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedRows.map((row) => {
                      const p = row.project;
                      return (
                        <tr 
                          key={row.rowNum}
                          className={row.isValid ? 'hover:bg-slate-50/60' : 'bg-rose-50/40 hover:bg-rose-50/60'}
                        >
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                            #{row.rowNum}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertCircle className="w-3 h-3" /> Lỗi
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 max-w-xs">
                            <div className="font-mono text-[11px] font-bold text-slate-700">
                              {p?.code || '---'}
                            </div>
                            <div className="font-medium text-slate-900 truncate">
                              {p?.title || '---'}
                            </div>
                            {row.errors.length > 0 && (
                              <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                                • {row.errors.join('; ')}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                            <div className="font-semibold text-slate-800">
                              {p ? PROJECT_LEVEL_LABELS[p.level]?.label : '---'}
                            </div>
                            <div className="text-slate-500">{p?.department}</div>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                            {p?.leadResearcherName || '---'}
                          </td>

                          <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                            {p ? formatShortVND(p.budget) : '---'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {validRows.length > 0 ? (
              <span>
                Sẵn sàng thêm <strong className="text-emerald-700 font-bold">{validRows.length}</strong> đề tài hợp lệ vào cơ sở dữ liệu.
              </span>
            ) : (
              <span>Chưa có dữ liệu hợp lệ để nhập.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={validRows.length === 0}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5 ${
                validRows.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <span>Xác nhận nhập ({validRows.length}) đề tài</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
