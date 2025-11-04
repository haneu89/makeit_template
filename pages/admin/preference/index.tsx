import { AdminLayout, AdminPageWrap } from "@/components/admin/common";
import { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
import PreferenceCreate from "./create-modal";
import { ColumnDef, DataGridClient } from "@/components/admin/common/datagrid";
import { toast } from "sonner";

interface PreferenceData {
  domain: string;
  category: string;
  key: string;
  value: string;
  type: string;
  name?: string;
  sort: number;
  comment?: string;
}

// ValueEditor 컴포넌트를 외부로 분리
const ValueEditor = memo(({ 
  row, 
  editingValues, 
  onInputChange, 
  onKeyPress, 
  onValueChange 
}: { 
  row: PreferenceData;
  editingValues: Record<string, string>;
  onInputChange: (key: string, value: string, type: string) => void;
  onKeyPress: (e: React.KeyboardEvent, row: PreferenceData) => void;
  onValueChange: (key: string, domain: string, value: string, type: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = editingValues[row.key] !== undefined;
  const displayValue = isEditing ? editingValues[row.key] : row.value;

  // 편집 상태가 변경될 때 포커스 유지
  useEffect(() => {
    if (isEditing && inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing, displayValue]);

  const inputClasses = "w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500";

  const handleFocus = useCallback(() => {
    if (!isEditing) {
      onInputChange(row.key, row.value, row.type);
    }
  }, [isEditing, row.key, row.value, row.type, onInputChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(row.key, e.target.value, row.type);
  }, [row.key, row.type, onInputChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    onKeyPress(e, row);
  }, [row, onKeyPress]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(row.key, e.target.checked.toString(), row.type);
  }, [row.key, row.type, onInputChange]);

  switch (row.type) {
    case 'boolean':
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`pref-${row.key}`}
            name={`pref-${row.key}`}
            checked={displayValue === 'true'}
            onChange={handleCheckboxChange}
            className="w-4 h-4"
          />
        </div>
      );
    case 'number':
      return (
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            id={`pref-${row.key}`}
            name={`pref-${row.key}`}
            inputMode="decimal"
            value={displayValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            className={inputClasses}
          />
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            id={`pref-${row.key}`}
            name={`pref-${row.key}`}
            value={displayValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            className={inputClasses}
          />
        </div>
      );
  }
}, (prevProps, nextProps) => {
  return (
    prevProps.row.key === nextProps.row.key &&
    prevProps.row.value === nextProps.row.value &&
    prevProps.row.type === nextProps.row.type &&
    prevProps.editingValues[prevProps.row.key] === nextProps.editingValues[nextProps.row.key]
  );
});

ValueEditor.displayName = 'ValueEditor';

export default function Preference() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rowData, setRowData] = useState<PreferenceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/preference');
        const data = await response.json();
        setRowData(data.data || []);
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
        setRowData([]);
        toast.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = useCallback((key: string, value: string, type: string) => {
    if (type === 'number') {
      if (!/^-?\d*\.?\d*$/.test(value)) {
        toast.error('해당 필드는 숫자만 입력 가능합니다.');
        return;
      }
    }
    
    if (editingValues[key] === value) {
      return;
    }
    
    setEditingValues(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  }, [editingValues]);

  const handleValueChange = useCallback(async (key: string, domain: string, value: string, type: string) => {
    let processedValue = value;
    
    switch (type) {
      case 'boolean':
        processedValue = value === 'true' ? 'true' : 'false';
        break;
      case 'number':
        if (isNaN(Number(value))) {
          toast.error('숫자만 입력 가능합니다.');
          return;
        }
        break;
    }

    try {
      const response = await fetch(`/api/admin/preference/${key}?domain=${domain}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: processedValue }),
      });

      if (!response.ok) throw new Error('설정 업데이트 실패');

      setRowData(prev => prev.map(row => 
        row.key === key && row.domain === domain 
          ? { ...row, value: processedValue }
          : row
      ));
    } catch (error) {
      console.error('설정 업데이트 중 오류 발생:', error);
      throw error;
    }
  }, []);

  const handleSaveAll = useCallback(async () => {
    const savePromises = Object.entries(editingValues).map(async ([key, value]) => {
      const row = rowData.find(r => r.key === key);
      if (!row) return;
      
      return handleValueChange(key, row.domain, value, row.type);
    });

    try {
      await Promise.all(savePromises);
      setEditingValues({});
      setHasChanges(false);
      toast.success('모든 변경사항이 저장되었습니다.');
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다.');
    }
  }, [editingValues, rowData, handleValueChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, row: PreferenceData) => {
    if (e.key === 'Enter') {
      handleValueChange(row.key, row.domain, editingValues[row.key], row.type);
    }
  }, [editingValues, handleValueChange]);

  const handleDelete = useCallback(async (key: string, domain: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/preference/${key}?domain=${domain}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('설정 삭제 실패');

      setRowData(prev => prev.filter(row => !(row.key === key && row.domain === domain)));
      toast.success('설정이 삭제되었습니다.');
    } catch (error) {
      console.error('설정 삭제 중 오류 발생:', error);
      toast.error('설정 삭제에 실패했습니다.');
    }
  }, []);

  const columns: ColumnDef<PreferenceData>[] = useMemo(() => [
    { 
      header: '카테고리',
      key: 'category',
      enableSorting: true,
      cell: ({ row }) => <div className="text-center">{row.original.category}</div>
    },
    { 
      header: '키',
      key: 'key',
      enableSorting: true,
    },
    { 
      header: '이름',
      key: 'name',
      enableSorting: true,
    },
    {
      header: '값',
      key: 'value',
      enableSorting: false,
      cell: ({ row }) => {
        const key = `${row.original.key}-${row.original.domain}`;
        return (
          <ValueEditor 
            key={key}
            row={row.original} 
            editingValues={editingValues}
            onInputChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onValueChange={handleValueChange}
          />
        );
      }
    },
    { 
      header: '타입',
      key: 'type',
      enableSorting: true,
      cell: ({ row }) => <div className="text-center">{row.original.type}</div>
    },
    { 
      header: '설명',
      key: 'comment',
      enableSorting: true,
    },
    {
      header: '관리',
      key: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <button
          onClick={() => handleDelete(row.original.key, row.original.domain)}
          className="text-red-600 hover:text-red-800"
        >
          삭제
        </button>
      ),
    },
  ], [editingValues, handleInputChange, handleKeyPress, handleValueChange, handleDelete]);

  const createPreference = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <AdminLayout>
      <AdminPageWrap 
        title="설정" 
        breadcrumbItems={[{ label: '설정', href: '/admin/preference' }]} 
        actions={[
          { 
            icon: 'fa-solid fa-floppy-disk',
            label: '저장', 
            onClick: handleSaveAll,
            disabled: !hasChanges,
            className: hasChanges ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          },
          { label: '설정 생성', onClick: createPreference }
        ]}
      >
        {isLoading ? (
          <div className="text-center py-4">로딩 중...</div>
        ) : rowData.length === 0 ? (
          <div className="text-center py-4 text-gray-500">설정이 없습니다.</div>
        ) : (
          <DataGridClient
            columns={columns}
            data={rowData}
          />
        )}
        <PreferenceCreate 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            toast.success('설정이 생성되었습니다.');
            fetch('/api/admin/preference')
              .then(res => res.json())
              .then(data => {
                setRowData(data.data || []);
              })
              .catch(() => {
                toast.error('데이터를 불러오는데 실패했습니다.');
              });
          }}
        />
      </AdminPageWrap>
    </AdminLayout>
  );
}