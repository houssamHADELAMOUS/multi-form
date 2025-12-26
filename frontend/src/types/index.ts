export type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'tel' | 'email';

export interface FieldDefinition {
  name: string;
  label: string;
  labelAr: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  isShared?: boolean; // If true, this field shares values across forms
}

export interface FormDefinition {
  id: string;
  name: string;
  nameAr: string;
  fields: FieldDefinition[];
}

export interface FormInstance {
  id: string;
  formType: string;
  employeeId: string;
  employeeName: string;
  fields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedFieldValue {
  value: any;
  formId: string;
  employeeId: string;
  lastUpdated: Date;
}

export interface User {
  id: string;
  name: string;
  role: 'employee' | 'admin';
}
