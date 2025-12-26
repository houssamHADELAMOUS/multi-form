import React, { useState, useEffect } from 'react';
import { FormBuilder } from './components/FormBuilder';
import { formDefinitions } from './data/formDefinitions';
import type { FormDefinition, FormInstance } from './types';
import { dataStore } from './lib/store';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { PlusCircle, FileText, Calendar } from 'lucide-react';

type View = 'list' | 'create' | 'view';

function App() {
  const [view, setView] = useState<View>('list');
  const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null);
  const [formInstances, setFormInstances] = useState<FormInstance[]>([]);

  const currentUser = dataStore.getCurrentUser();

  const loadFormInstances = () => {
    setFormInstances(dataStore.getFormInstances());
  };

  useEffect(() => {
    loadFormInstances();
  }, []);

  const handleCreateForm = (formDef: FormDefinition) => {
    setSelectedForm(formDef);
    setView('create');
  };

  const handleFormSubmit = () => {
    loadFormInstances();
    setView('list');
    setSelectedForm(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedForm(null);
  };

  const getFormDefinitionById = (formType: string) => {
    return formDefinitions.find(f => f.id === formType);
  };

  const formColors = [
    { bg: 'bg-blue-600', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-100' },
    { bg: 'bg-slate-600', text: 'text-slate-700', light: 'bg-slate-50', border: 'border-slate-200', accent: 'bg-slate-100' },
    { bg: 'bg-teal-600', text: 'text-teal-700', light: 'bg-teal-50', border: 'border-teal-200', accent: 'bg-teal-100' },
    { bg: 'bg-indigo-600', text: 'text-indigo-700', light: 'bg-indigo-50', border: 'border-indigo-200', accent: 'bg-indigo-100' },
    { bg: 'bg-emerald-600', text: 'text-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-100' },
  ];

  const renderListView = () => (
    <div className="min-h-screen p-8 bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">نظام إدارة النماذج المتعددة</h1>
            <p className="text-gray-600 text-lg mb-4">Multi-Form CRM System</p>
            <div className="flex items-center gap-2 text-gray-700">
              <span>مرحباً،</span>
              <span className="font-semibold text-blue-600">{currentUser.name}</span>
            </div>
          </div>
        </div>

        {/* Available Forms */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">إنشاء نموذج جديد</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formDefinitions.map((formDef, index) => {
              const colors = formColors[index % formColors.length];
              return (
                <Card
                  key={formDef.id}
                  className="hover:shadow-lg transition-all cursor-pointer border border-gray-200 bg-white"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`${colors.bg} text-white p-3 rounded-lg shrink-0`}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-right text-lg font-bold text-gray-900 mb-1">
                          {formDef.nameAr}
                        </CardTitle>
                        <CardDescription className="text-right text-sm text-gray-600">
                          {formDef.fields.length} حقل
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleCreateForm(formDef)}
                      className={`w-full ${colors.bg} hover:opacity-90 text-white font-medium py-5`}
                    >
                      <PlusCircle className="ml-2 h-5 w-5" />
                      إنشاء
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* My Forms */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">النماذج المحفوظة</h2>
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-semibold">
              {formInstances.length}
            </span>
          </div>
          {formInstances.length === 0 ? (
            <Card className="border border-dashed border-gray-300 bg-white">
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-lg">لا توجد نماذج محفوظة</p>
                <p className="text-gray-500 text-sm mt-1">ابدأ بإنشاء نموذج جديد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formInstances.map((instance) => {
                const formDef = getFormDefinitionById(instance.formType);
                const formIndex = formDefinitions.findIndex(f => f.id === instance.formType);
                const colors = formColors[formIndex % formColors.length];
                return (
                  <Card key={instance.id} className="hover:shadow-lg transition-all border border-gray-200 bg-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`${colors.accent} ${colors.text} p-2 rounded-lg shrink-0`}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-right text-base font-bold text-gray-900">
                          {formDef?.nameAr || instance.formType}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-right flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(instance.createdAt).toLocaleDateString('ar')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {Object.entries(instance.fields).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-semibold text-gray-900 truncate mr-2">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCreateView = () => {
    const formIndex = selectedForm ? formDefinitions.findIndex(f => f.id === selectedForm.id) : 0;
    const colors = formColors[formIndex % formColors.length];

    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        {selectedForm && (
          <div className="w-full max-w-4xl">
            <FormBuilder
              formDefinition={selectedForm}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              colors={colors}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {view === 'list' && renderListView()}
      {view === 'create' && renderCreateView()}
    </>
  );
}

export default App;
