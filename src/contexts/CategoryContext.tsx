import React, { createContext, useContext, useState } from 'react';
import { Category } from '../types/Common';
import { Bug, Sparkles, Headphones, Settings, Zap } from 'lucide-react';

interface CategoryContextType {
  categories: Category[];
  getActiveCategories: () => Category[];
  getCategoryByKey: (key: string) => Category | undefined;
  getCategoryIcon: (iconName: string) => React.ComponentType<any>;
  addCategory: (categoryData: Partial
