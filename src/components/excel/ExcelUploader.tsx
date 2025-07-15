import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Info
} from 'lucide-react';
import { processExcelFile, generateProcessingReport, ExcelProcessingResult } from '../../utils/excelProcessor';

interface ExcelUploaderProps {
  onDataProcessed: (data: any[]) => void;
  onClose: () => void;
  isOpen: boolean;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({
  onDataProcessed,
  onClose,
  isOpen
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ExcelProcessingResult | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = async (file: File) => {
    setCurrentFile(file);
    setIsProcessing(true);
    setProcessingResult(null);

    try {
      const result = await processExcelFile(file);
      setProcessingResult(result);
    } catch (error) {
      setProcessingResult({
        success: false,
        data: [],
        errors: [`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
        warnings: [],
        summary: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          fileName: file.name
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (processingResult?.success && processingResult.data.length > 0) {
      onDataProcessed(processingResult.data);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setCurrentFile(null);
    setProcessingResult(null);
    setIsProcessing(false);
    setIsDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadReport = () => {
    if (!processingResult) return;

    const report = generateProcessingReport(processingResult);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-importacao-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Importar Excel</h2>
              <p className="text-sm text-gray-600">Importe tickets de planilhas Excel</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!currentFile && !isProcessing && (
            <>
              {/* Instructions */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Info size={16} />
                    Colunas Obrigatórias
                  </h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>• <strong>Título*</strong> (obrigatório)</div>
                    <div>• <strong>Descrição</strong> (opcional)</div>
                    <div>• <strong>Categoria</strong> (opcional)</div>
                    <div>• <strong>Prioridade</strong> (opcional)</div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Formatos Suportados</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>• Excel (.xlsx, .xls)</div>
                    <div>• Tamanho máximo: 10MB</div>
                    <div>• Primeira linha = cabeçalhos</div>
                    <div>• Campos auto-preenchidos se ausentes</div>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  isDragActive
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileText 
                  size={48} 
                  className={`mx-auto mb-4 ${isDragActive ? 'text-green-500' : 'text-gray-400'}`} 
                />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste sua planilha Excel aqui'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  ou clique para selecionar um arquivo
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload size={16} />
                  Selecionar Arquivo Excel
                </button>
              </div>
            </>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Processando planilha...
              </h3>
              <p className="text-sm text-gray-500">
                Validando dados e mapeando colunas
              </p>
            </div>
          )}

          {/* Results */}
          {processingResult && !isProcessing && (
            <div className="space-y-6">
              {/* Summary */}
              <div className={`rounded-lg p-4 border-2 ${
                processingResult.success 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start gap-3">
                  {processingResult.success ? (
                    <CheckCircle className="text-green-500 mt-0.5" size={20} />
                  ) : (
                    <AlertTriangle className="text-red-500 mt-0.5" size={20} />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-medium mb-2 ${
                      processingResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {processingResult.success 
                        ? 'Planilha processada com sucesso!' 
                        : 'Erro ao processar planilha'
                      }
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <div className="font-medium">{processingResult.summary.totalRows}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Válidas:</span>
                        <div className="font-medium text-green-600">{processingResult.summary.validRows}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Inválidas:</span>
                        <div className="font-medium text-red-600">{processingResult.summary.invalidRows}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Taxa:</span>
                        <div className="font-medium">
                          {processingResult.summary.totalRows > 0 
                            ? Math.round((processingResult.summary.validRows / processingResult.summary.totalRows) * 100)
                            : 0
                          }%
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={downloadReport}
                    className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    title="Baixar relatório"
                  >
                    <Download size={14} />
                    Relatório
                  </button>
                </div>
              </div>

              {/* Errors */}
              {processingResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Erros encontrados:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {processingResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        • {error}
                      </div>
                    ))}
                    {processingResult.errors.length > 10 && (
                      <div className="text-sm text-red-600 font-medium">
                        ... e mais {processingResult.errors.length - 10} erros
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {processingResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Avisos:</h4>
                  {processingResult.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-yellow-700 mb-1">
                      • {warning}
                    </div>
                  ))}
                </div>
              )}

              {/* Preview */}
              {processingResult.success && processingResult.data.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">
                      Prévia dos dados ({processingResult.data.length} registros)
                    </h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Título</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Categoria</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Prioridade</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Cliente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {processingResult.data.slice(0, 10).map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-900 max-w-xs truncate" title={item.titulo}>
                              {item.titulo}
                            </td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {item.categoria}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                item.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                                item.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.prioridade}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600 max-w-xs truncate" title={item.cliente}>
                              {item.cliente || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {processingResult.data.length > 10 && (
                      <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600 text-center border-t">
                        ... e mais {processingResult.data.length - 10} registros
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {processingResult && !isProcessing && (
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Novo Arquivo
            </button>
            {processingResult.success && processingResult.data.length > 0 && (
              <button
                onClick={handleConfirmImport}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Importar {processingResult.data.length} Registros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUploader;
