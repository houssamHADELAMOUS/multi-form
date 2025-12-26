import React, { useState, useEffect } from 'react';
import type { FormDefinition, FieldDefinition, SharedFieldValue } from '../types';
import { dataStore } from '../lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Check, Loader2, FileText, ArrowRight } from 'lucide-react';

interface FormBuilderProps {
  formDefinition: FormDefinition;
  onSubmit: () => void;
  onCancel: () => void;
  colors?: {
    bg: string;
    text: string;
    light: string;
    border: string;
  };
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ formDefinition, onSubmit, onCancel, colors = { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-50', border: 'border-blue-200' } }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [suggestions, setSuggestions] = useState<Record<string, SharedFieldValue[]>>({});
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentUser = dataStore.getCurrentUser();

  // Load auto-fill suggestions on mount
  useEffect(() => {
    const sharedFieldNames = formDefinition.fields
      .filter(f => f.isShared)
      .map(f => f.name);

    if (sharedFieldNames.length > 0) {
      const autoFillSuggestions = dataStore.getAutoFillSuggestions(
        sharedFieldNames,
        currentUser.id
      );
      setSuggestions(autoFillSuggestions);

      // Auto-fill fields that have only one value
      const initialData: Record<string, any> = {};
      Object.entries(autoFillSuggestions).forEach(([fieldName, values]) => {
        if (values.length === 1) {
          initialData[fieldName] = values[0].value;
        }
      });
      setFormData(initialData);
    }
  }, [formDefinition, currentUser.id]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setShowSuggestions(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  const handleFieldFocus = (fieldName: string) => {
    if (suggestions[fieldName] && suggestions[fieldName].length > 1) {
      setShowSuggestions(prev => ({
        ...prev,
        [fieldName]: true
      }));
    }
  };

  const handleSuggestionSelect = (fieldName: string, value: any) => {
    handleFieldChange(fieldName, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save the form
    const newForm = dataStore.saveFormInstance({
      formType: formDefinition.id,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      fields: formData,
    });

    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => {
        onSubmit();
      }, 1000);
    }, 500);
  };

  const renderField = (field: FieldDefinition) => {
    const value = formData[field.name] || '';
    const fieldSuggestions = suggestions[field.name] || [];
    const showFieldSuggestions = showSuggestions[field.name] && fieldSuggestions.length > 1;

    return (
      <div key={field.name} className="space-y-2 relative">
        <Label htmlFor={field.name} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>{field.labelAr}</span>
          {field.required && <span className="text-red-600">*</span>}
          {field.isShared && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-md font-medium">
              حقل مشترك
            </span>
          )}
        </Label>

        {field.type === 'select' ? (
          <select
            id={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required={field.required}
          >
            <option value="">اختر...</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id={field.name}
              checked={value === true}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor={field.name} className="text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        ) : (
          <div className="relative">
            <Input
              type={field.type}
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onFocus={() => handleFieldFocus(field.name)}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full"
            />

            {/* Auto-fill suggestions dropdown */}
            {showFieldSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                <div className="p-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                  قيم سابقة - اختر واحدة:
                </div>
                {fieldSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionSelect(field.name, suggestion.value)}
                    className="w-full text-right px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0 text-sm"
                  >
                    <div className="font-medium">{suggestion.value}</div>
                    <div className="text-xs text-gray-500">
                      آخر استخدام: {new Date(suggestion.lastUpdated).toLocaleDateString('ar')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Show indicator if field was auto-filled */}
        {field.isShared && fieldSuggestions.length === 1 && value && (
          <div className="text-xs text-green-700 flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-md border border-green-200">
            <Check size={14} />
            <span>تم التعبئة تلقائياً</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full" dir="rtl">
      {/* Back Button */}
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <ArrowRight className="ml-2 h-5 w-5" />
        العودة للقائمة الرئيسية
      </Button>

      <Card className="w-full shadow-lg border border-gray-200 bg-white">
        <CardHeader className="bg-gray-50 border-b border-gray-200 pb-6">
          <div className="flex items-start gap-4">
            <div className={`${colors.bg} text-white p-3 rounded-lg shrink-0`}>
              <FileText className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-right text-2xl font-bold text-gray-900 mb-2">
                {formDefinition.nameAr}
              </CardTitle>
              <CardDescription className="text-right text-base text-gray-600">
                الموظف: <span className="font-semibold text-gray-900">{currentUser.name}</span>
              </CardDescription>
              <div className="mt-3 text-sm text-gray-600 text-right">
                <span className="font-semibold">{formDefinition.fields.filter(f => f.required).length}</span> حقل مطلوب
                <span className="mx-1">•</span>
                <span className="font-semibold">{formDefinition.fields.length}</span> حقل إجمالي
              </div>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-8">
            {formDefinition.fields.map(renderField)}
          </CardContent>

          <CardFooter className="flex justify-between gap-4 p-8 bg-gray-50 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-6 text-base font-medium border-gray-300 hover:bg-gray-100"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading || saved}
              className={`${saved ? 'bg-green-600 hover:bg-green-700' : colors.bg + ' hover:opacity-90'} px-6 py-6 text-base font-semibold text-white`}
            >
              {loading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
              {saved && <Check className="ml-2 h-5 w-5" />}
              {saved ? 'تم الحفظ بنجاح!' : loading ? 'جاري الحفظ...' : 'حفظ النموذج'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
