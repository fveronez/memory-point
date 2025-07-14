// src/utils/search/searchHighlight.ts
import React from 'react';

export interface HighlightProps {
  text: string;
  searchTerms: string[];
  className?: string;
}

export const highlightText = (text: string, searchTerms: string[]): string => {
  if (!text || !searchTerms.length) return text;

  let result = text;
  searchTerms.forEach(term => {
    if (term.trim()) {
      const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
      result = result.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
    }
  });

  return result;
};

export const HighlightedText: React.FC<HighlightProps> = ({ 
  text, 
  searchTerms, 
  className = '' 
}) => {
  const highlightedText = highlightText(text, searchTerms);
  
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: highlightedText }}
    />
  );
};

export const getTextPreview = (
  text: string, 
  searchTerms: string[], 
  maxLength: number = 100
): string => {
  if (!text || !searchTerms.length) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  const lowerText = text.toLowerCase();
  const lowerTerms = searchTerms.map(term => term.toLowerCase());
  
  // Encontrar a primeira ocorrência de qualquer termo
  let firstMatchIndex = -1;
  let matchedTerm = '';
  
  lowerTerms.forEach(term => {
    if (term.trim()) {
      const index = lowerText.indexOf(term);
      if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
        firstMatchIndex = index;
        matchedTerm = term;
      }
    }
  });

  if (firstMatchIndex === -1) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Calcular início e fim do preview
  const startOffset = Math.max(0, firstMatchIndex - 20);
  const endOffset = Math.min(text.length, startOffset + maxLength);
  
  let preview = text.substring(startOffset, endOffset);
  
  if (startOffset > 0) preview = '...' + preview;
  if (endOffset < text.length) preview = preview + '...';
  
  return preview;
};

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};