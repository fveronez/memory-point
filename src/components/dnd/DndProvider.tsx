// src/components/dnd/DndProvider.tsx
import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface Props {
  children: React.ReactNode;
}

export const DndProvider: React.FC<Props> = ({ children }) => {
  return (
    <ReactDndProvider backend={HTML5Backend}>
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider;