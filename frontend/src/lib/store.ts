import type { FormInstance, SharedFieldValue, User } from '../types';

// Simple in-memory store (localStorage in real app)
class DataStore {
  private formInstances: FormInstance[] = [];
  private sharedFields: Map<string, SharedFieldValue[]> = new Map();
  private currentUser: User = {
    id: 'EMP001',
    name: 'أحمد محمد',
    role: 'employee'
  };

  // Get current user
  getCurrentUser(): User {
    return this.currentUser;
  }

  // Get all form instances for current employee
  getFormInstances(formType?: string): FormInstance[] {
    if (formType) {
      return this.formInstances.filter(
        f => f.employeeId === this.currentUser.id && f.formType === formType
      );
    }
    return this.formInstances.filter(f => f.employeeId === this.currentUser.id);
  }

  // Get a specific form instance
  getFormInstance(id: string): FormInstance | undefined {
    return this.formInstances.find(f => f.id === id);
  }

  // Save a new form instance
  saveFormInstance(formInstance: Omit<FormInstance, 'id' | 'createdAt' | 'updatedAt'>): FormInstance {
    const newInstance: FormInstance = {
      ...formInstance,
      id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.formInstances.push(newInstance);

    // Update shared fields
    Object.entries(newInstance.fields).forEach(([fieldName, value]) => {
      this.updateSharedField(fieldName, value, newInstance.id, newInstance.employeeId);
    });

    return newInstance;
  }

  // Update an existing form instance
  updateFormInstance(id: string, fields: Record<string, any>): FormInstance | null {
    const index = this.formInstances.findIndex(f => f.id === id);
    if (index === -1) return null;

    this.formInstances[index] = {
      ...this.formInstances[index],
      fields,
      updatedAt: new Date(),
    };

    // Update shared fields
    Object.entries(fields).forEach(([fieldName, value]) => {
      this.updateSharedField(fieldName, value, id, this.formInstances[index].employeeId);
    });

    return this.formInstances[index];
  }

  // Update shared field value
  private updateSharedField(fieldName: string, value: any, formId: string, employeeId: string) {
    if (!value) return; // Don't store empty values

    const existing = this.sharedFields.get(fieldName) || [];

    // Check if this exact value already exists for this employee
    const existingIndex = existing.findIndex(
      v => v.employeeId === employeeId && JSON.stringify(v.value) === JSON.stringify(value)
    );

    if (existingIndex >= 0) {
      // Update existing value
      existing[existingIndex] = {
        value,
        formId,
        employeeId,
        lastUpdated: new Date(),
      };
    } else {
      // Add new value
      existing.push({
        value,
        formId,
        employeeId,
        lastUpdated: new Date(),
      });
    }

    this.sharedFields.set(fieldName, existing);
  }

  // Get shared field values for a specific field
  getSharedFieldValues(fieldName: string, employeeId?: string): SharedFieldValue[] {
    const values = this.sharedFields.get(fieldName) || [];

    if (employeeId) {
      return values.filter(v => v.employeeId === employeeId);
    }

    return values;
  }

  // Get auto-fill suggestions for multiple fields
  getAutoFillSuggestions(fieldNames: string[], employeeId?: string): Record<string, SharedFieldValue[]> {
    const suggestions: Record<string, SharedFieldValue[]> = {};

    fieldNames.forEach(fieldName => {
      const values = this.getSharedFieldValues(fieldName, employeeId);
      if (values.length > 0) {
        suggestions[fieldName] = values.sort((a, b) =>
          b.lastUpdated.getTime() - a.lastUpdated.getTime()
        );
      }
    });

    return suggestions;
  }

  // Clear all data (for testing)
  clearAll() {
    this.formInstances = [];
    this.sharedFields.clear();
  }
}

export const dataStore = new DataStore();
