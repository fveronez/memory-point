// Utilitário para processamento de arquivos Excel
// Baseado no sistema Kanban-PO com melhorias

export interface ExcelProcessingResult {
  success: boolean;
  data: any[];
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    fileName: string;
  };
}

export interface ColumnMapping {
  expected: string;
  variations: string[];
  required: boolean;
}

// Mapeamento de colunas esperadas para tickets
export const TICKET_COLUMN_MAPPINGS: Record<string, ColumnMapping> = {
  titulo: {
    expected: 'titulo',
    variations: ['título', 'title', 'resumo', 'summary', 'assunto', 'subject'],
    required: true
  },
  descricao: {
    expected: 'descricao',
    variations: ['descrição', 'description', 'detalhes', 'details', 'observações'],
    required: false
  },
  categoria: {
    expected: 'categoria',
    variations: ['category', 'tipo', 'type', 'classificação'],
    required: false
  },
  prioridade: {
    expected: 'prioridade',
    variations: ['priority', 'urgência', 'urgencia', 'importância'],
    required: false
  },
  cliente: {
    expected: 'cliente',
    variations: ['client', 'customer', 'empresa', 'company', 'solicitante'],
    required: false
  },
  responsavel: {
    expected: 'responsavel',
    variations: ['responsável', 'assignee', 'assigned', 'atribuído', 'owner'],
    required: false
  },
  dataCriacao: {
    expected: 'dataCriacao',
    variations: ['data criação', 'data_criacao', 'created', 'date', 'criado em'],
    required: false
  },
  chave: {
    expected: 'chave',
    variations: ['key', 'id', 'código', 'codigo', 'ticket_id', 'numero'],
    required: false
  }
};

// Função para validar tipo de arquivo
export const validateFileType = (file: File): { valid: boolean; error?: string } => {
  const validExtensions = ['.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  
  if (!validExtensions.some(ext => fileName.endsWith(ext))) {
    return {
      valid: false,
      error: 'Formato não suportado. Use apenas arquivos .xlsx ou .xls'
    };
  }
  
  return { valid: true };
};

// Função para validar tamanho do arquivo
export const validateFileSize = (file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } => {
  const maxSize = maxSizeMB * 1024 * 1024; // Converter para bytes
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
    };
  }
  
  return { valid: true };
};

// Função para carregar biblioteca SheetJS dinamicamente
export const loadSheetJS = async (): Promise<any> => {
  if (typeof window !== 'undefined' && (window as any).XLSX) {
    return (window as any).XLSX;
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => {
      if ((window as any).XLSX) {
        resolve((window as any).XLSX);
      } else {
        reject(new Error('Falha ao carregar biblioteca Excel'));
      }
    };
    script.onerror = () => reject(new Error('Erro ao carregar biblioteca Excel'));
    document.head.appendChild(script);
  });
};

// Função para mapear colunas do Excel
export const mapExcelColumns = (headers: string[]): Record<string, number> => {
  const mapping: Record<string, number> = {};
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  Object.entries(TICKET_COLUMN_MAPPINGS).forEach(([field, config]) => {
    const foundIndex = normalizedHeaders.findIndex(header => 
      config.variations.some(variation => 
        header.includes(variation.toLowerCase()) || 
        variation.toLowerCase().includes(header)
      )
    );
    
    if (foundIndex !== -1) {
      mapping[field] = foundIndex;
    }
  });
  
  return mapping;
};

// Função para validar dados de uma linha
export const validateRowData = (
  row: any[], 
  columnMapping: Record<string, number>,
  rowIndex: number
): { valid: boolean; errors: string[]; data?: any } => {
  const errors: string[] = [];
  const data: any = {};
  
  // Validar campos obrigatórios
  Object.entries(TICKET_COLUMN_MAPPINGS).forEach(([field, config]) => {
    const columnIndex = columnMapping[field];
    
    if (config.required && (columnIndex === undefined || !row[columnIndex])) {
      errors.push(`Linha ${rowIndex + 2}: Campo "${field}" é obrigatório`);
      return;
    }
    
    if (columnIndex !== undefined && row[columnIndex]) {
      const value = row[columnIndex].toString().trim();
      
      // Validações específicas por campo
      switch (field) {
        case 'titulo':
          if (value.length < 3) {
            errors.push(`Linha ${rowIndex + 2}: Título deve ter pelo menos 3 caracteres`);
          } else {
            data[field] = value;
          }
          break;
          
        case 'prioridade':
          const validPriorities = ['alta', 'media', 'baixa', 'crítica', 'critica'];
          if (value && !validPriorities.some(p => p.toLowerCase() === value.toLowerCase())) {
            data[field] = 'media'; // Padrão
          } else {
            data[field] = value.toLowerCase();
          }
          break;
          
        case 'categoria':
          const validCategories = ['bug', 'feature', 'melhoria', 'suporte'];
          if (value && !validCategories.some(c => c.toLowerCase() === value.toLowerCase())) {
            data[field] = 'suporte'; // Padrão
          } else {
            data[field] = value.toLowerCase();
          }
          break;
          
        case 'dataCriacao':
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              data[field] = new Date(); // Data atual como padrão
            } else {
              data[field] = date;
            }
          } catch {
            data[field] = new Date();
          }
          break;
          
        default:
          data[field] = value;
      }
    } else {
      // Valores padrão para campos opcionais
      switch (field) {
        case 'categoria':
          data[field] = 'suporte';
          break;
        case 'prioridade':
          data[field] = 'media';
          break;
        case 'dataCriacao':
          data[field] = new Date();
          break;
        case 'chave':
          data[field] = `TICK-${Date.now()}-${rowIndex}`;
          break;
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined
  };
};

// Função principal para processar arquivo Excel
export const processExcelFile = async (file: File): Promise<ExcelProcessingResult> => {
  const result: ExcelProcessingResult = {
    success: false,
    data: [],
    errors: [],
    warnings: [],
    summary: {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      fileName: file.name
    }
  };
  
  try {
    // Validar arquivo
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      result.errors.push(typeValidation.error!);
      return result;
    }
    
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      result.errors.push(sizeValidation.error!);
      return result;
    }
    
    // Carregar SheetJS
    const XLSX = await loadSheetJS();
    
    // Ler arquivo
    const data = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
    
    // Processar Excel
    const workbook = XLSX.read(data, {
      type: 'array',
      cellDates: true,
      cellStyles: true
    });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      result.errors.push('Planilha não contém abas válidas');
      return result;
    }
    
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1,
      defval: '',
      blankrows: false
    });
    
    if (jsonData.length < 2) {
      result.errors.push('Planilha deve conter pelo menos cabeçalho e uma linha de dados');
      return result;
    }
    
    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1) as any[][];
    
    result.summary.totalRows = dataRows.length;
    
    // Mapear colunas
    const columnMapping = mapExcelColumns(headers);
    
    // Verificar se campos obrigatórios foram encontrados
    const requiredFields = Object.entries(TICKET_COLUMN_MAPPINGS)
      .filter(([_, config]) => config.required)
      .map(([field, _]) => field);
    
    const missingRequired = requiredFields.filter(field => !(field in columnMapping));
    if (missingRequired.length > 0) {
      result.errors.push(`Colunas obrigatórias não encontradas: ${missingRequired.join(', ')}`);
      return result;
    }
    
    // Processar dados
    const processedData: any[] = [];
    const processingErrors: string[] = [];
    
    dataRows.forEach((row, index) => {
      if (row.every(cell => !cell || cell.toString().trim() === '')) {
        return; // Pular linhas vazias
      }
      
      const validation = validateRowData(row, columnMapping, index);
      
      if (validation.valid && validation.data) {
        // Adicionar campos do sistema
        const ticketData = {
          id: `imported-${Date.now()}-${index}`,
          ...validation.data,
          stage: 'cliente', // Padrão
          status: 'novo', // Padrão
          tags: [],
          comentarios: [],
          ultimaAtualizacao: new Date()
        };
        
        processedData.push(ticketData);
        result.summary.validRows++;
      } else {
        processingErrors.push(...validation.errors);
        result.summary.invalidRows++;
      }
    });
    
    result.data = processedData;
    result.errors = processingErrors;
    result.success = processedData.length > 0;
    
    if (processingErrors.length > 0 && processedData.length > 0) {
      result.warnings.push(`${processingErrors.length} erros encontrados, mas ${processedData.length} registros válidos foram processados`);
    }
    
  } catch (error) {
    result.errors.push(`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
  
  return result;
};

// Função para gerar relatório de processamento
export const generateProcessingReport = (result: ExcelProcessingResult): string => {
  const { summary, errors, warnings } = result;
  
  let report = `📊 Relatório de Importação\n`;
  report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  report += `📁 Arquivo: ${summary.fileName}\n`;
  report += `📈 Total de linhas: ${summary.totalRows}\n`;
  report += `✅ Linhas válidas: ${summary.validRows}\n`;
  report += `❌ Linhas inválidas: ${summary.invalidRows}\n`;
  report += `📊 Taxa de sucesso: ${summary.totalRows > 0 ? Math.round((summary.validRows / summary.totalRows) * 100) : 0}%\n\n`;
  
  if (warnings.length > 0) {
    report += `⚠️  Avisos:\n`;
    warnings.forEach(warning => report += `   • ${warning}\n`);
    report += `\n`;
  }
  
  if (errors.length > 0) {
    report += `🚨 Erros encontrados:\n`;
    errors.slice(0, 10).forEach(error => report += `   • ${error}\n`);
    if (errors.length > 10) {
      report += `   ... e mais ${errors.length - 10} erros\n`;
    }
  }
  
  return report;
};
