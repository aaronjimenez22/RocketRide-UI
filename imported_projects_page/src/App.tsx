import React, { useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/AddOutlined';
import MenuIcon from '@mui/icons-material/MenuOutlined';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { ProjectTable, Project, RunDetail, RunStatus } from './components/ProjectTable';
import { ColumnCustomizer, ColumnConfig } from './components/ColumnCustomizer';
// Helper to generate random last runs data with varied statuses
const generateLastRuns = (): RunDetail[] => {
  const statuses: RunStatus[] = ['success', 'failure', 'warning'];
  return Array.from({
    length: 10
  }, (_, i) => {
    const rand = Math.random();
    let status: RunStatus;
    if (rand > 0.85) status = 'failure';else if (rand > 0.7) status = 'warning';else status = 'success';
    return {
      status,
      timestamp: new Date(Date.now() - (i + 1) * 3600000),
      duration: Math.floor(Math.random() * 300) + 10 // 10-310 seconds
    };
  });
};
// Sample Data with new fields
const SAMPLE_DATA: Project[] = [{
  id: '1',
  name: 'Sample RAG Pipeline',
  nodes: ['clipboard', 'folder', 'link', 'mail', 'share', 'database'],
  status: 'Running',
  lastRuns: generateLastRuns(),
  cost: 45.32,
  dateCreated: new Date('2024-01-15'),
  lastModified: new Date('2024-03-20'),
  description: 'Advanced RAG pipeline for document processing',
  dataProcessed: '2.4 GB',
  filesUploaded: 142
}, {
  id: '2',
  name: 'Sample RAG Pipeline',
  nodes: ['clipboard', 'folder', 'link', 'mail'],
  status: 'Running',
  extraNodes: 3,
  lastRuns: generateLastRuns(),
  cost: 38.15,
  dateCreated: new Date('2024-02-01'),
  lastModified: new Date('2024-03-19'),
  description: 'Standard RAG implementation',
  dataProcessed: '1.8 GB',
  filesUploaded: 98
}, {
  id: '3',
  name: 'Sample Advanced RAG',
  nodes: ['folder', 'clipboard', 'mail', 'link', 'briefcase'],
  status: 'Running',
  extraNodes: 2,
  lastRuns: generateLastRuns(),
  cost: 92.47,
  dateCreated: new Date('2023-12-10'),
  lastModified: new Date('2024-03-21'),
  description: 'Multi-modal RAG with email integration',
  dataProcessed: '5.2 GB',
  filesUploaded: 287
}, {
  id: '4',
  name: 'Sample Simple Chat',
  nodes: ['clipboard', 'folder', 'link', 'database', 'share', 'briefcase', 'mail'],
  status: 'Inactive',
  lastRuns: generateLastRuns(),
  cost: 12.89,
  dateCreated: new Date('2024-01-20'),
  lastModified: new Date('2024-02-15'),
  description: 'Basic chat interface',
  dataProcessed: '450 MB',
  filesUploaded: 23
}, {
  id: '5',
  name: 'Sample Classify & Anonymize',
  nodes: ['clipboard', 'folder', 'link', 'mail', 'share', 'database'],
  status: 'Inactive',
  extraNodes: 3,
  extraNodes: 1,
  lastRuns: generateLastRuns(),
  cost: 8.5,
  dateCreated: new Date('2024-02-10'),
  lastModified: new Date('2024-02-28'),
  description: 'Data classification and anonymization',
  dataProcessed: '1.1 GB',
  filesUploaded: 67
}, {
  id: '6',
  name: 'Content Summary - Webhook',
  nodes: ['link', 'clipboard', 'folder', 'mail', 'share', 'database'],
  status: 'Inactive',
  extraNodes: 2,
  lastRuns: generateLastRuns(),
  cost: 5.25,
  dateCreated: new Date('2024-03-01'),
  lastModified: new Date('2024-03-10'),
  description: 'Webhook-triggered content summarization',
  dataProcessed: '320 MB',
  filesUploaded: 15
}, {
  id: '7',
  name: 'Simple Audio Transcription',
  nodes: ['clipboard', 'folder', 'link', 'mail', 'share', 'database'],
  status: 'Inactive',
  extraNodes: 4,
  lastRuns: generateLastRuns(),
  cost: 67.8,
  dateCreated: new Date('2023-11-15'),
  lastModified: new Date('2024-03-05'),
  description: 'Audio to text transcription service',
  dataProcessed: '3.7 GB',
  filesUploaded: 189
}, {
  id: '8',
  name: 'Data Flow Hub',
  nodes: ['clipboard', 'folder', 'link', 'mail', 'share', 'database'],
  status: 'Inactive',
  extraNodes: 2,
  lastRuns: generateLastRuns(),
  cost: 34.92,
  dateCreated: new Date('2024-01-05'),
  lastModified: new Date('2024-02-20'),
  description: 'Central data processing hub',
  dataProcessed: '2.1 GB',
  filesUploaded: 134
}, {
  id: '9',
  name: 'Info Streamline',
  nodes: ['clipboard', 'folder', 'link', 'mail', 'share', 'database'],
  status: 'Inactive',
  lastRuns: generateLastRuns(),
  cost: 21.45,
  dateCreated: new Date('2024-02-15'),
  lastModified: new Date('2024-03-01'),
  description: 'Information processing pipeline',
  dataProcessed: '890 MB',
  filesUploaded: 56
}, {
  id: '10',
  name: 'Data Connect',
  nodes: ['clipboard', 'folder', 'link', 'mail', 'share', 'database'],
  status: 'Inactive',
  lastRuns: generateLastRuns(),
  cost: 15.6,
  dateCreated: new Date('2024-01-25'),
  lastModified: new Date('2024-02-18'),
  description: 'Database connection manager',
  dataProcessed: '1.5 GB',
  filesUploaded: 78
}, {
  id: '11',
  name: 'Pipeline Express',
  nodes: ['clipboard', 'folder', 'link', 'mail', 'share', 'database'],
  status: 'Inactive',
  lastRuns: generateLastRuns(),
  cost: 28.75,
  dateCreated: new Date('2023-12-20'),
  lastModified: new Date('2024-03-12'),
  description: 'Fast data processing pipeline',
  dataProcessed: '1.9 GB',
  filesUploaded: 112
}, {
  id: '12',
  name: 'Data Route',
  nodes: ['clipboard', 'folder', 'link', 'mail', 'share', 'database'],
  status: 'Inactive',
  lastRuns: generateLastRuns(),
  cost: 19.3,
  dateCreated: new Date('2024-02-05'),
  lastModified: new Date('2024-02-25'),
  description: 'Intelligent data routing system',
  dataProcessed: '1.2 GB',
  filesUploaded: 89
}, {
  id: '13',
  name: 'Streamline Pipeline',
  nodes: ['clipboard', 'folder', 'link', 'mail', 'share', 'database'],
  status: 'Inactive',
  lastRuns: generateLastRuns(),
  cost: 41.2,
  dateCreated: new Date('2023-11-30'),
  lastModified: new Date('2024-03-08'),
  description: 'Optimized processing pipeline',
  dataProcessed: '2.8 GB',
  filesUploaded: 167
}];
type SortField = 'name' | 'cost' | 'dateCreated' | 'lastModified' | 'filesUploaded' | 'dataProcessed' | 'status' | null;
type SortDirection = 'asc' | 'desc';
const DEFAULT_COLUMNS: ColumnConfig[] = [{
  id: 'name',
  label: 'Project Name',
  visible: true,
  locked: true
}, {
  id: 'nodes',
  label: 'Nodes',
  visible: true
}, {
  id: 'lastRuns',
  label: 'Last 10 Runs',
  visible: true
}, {
  id: 'cost',
  label: 'Cost',
  visible: true
}, {
  id: 'dateCreated',
  label: 'Date Created',
  visible: false
}, {
  id: 'lastModified',
  label: 'Last Modified',
  visible: false
}, {
  id: 'description',
  label: 'Description',
  visible: false
}, {
  id: 'dataProcessed',
  label: 'Data Processed',
  visible: false
}, {
  id: 'filesUploaded',
  label: 'Files Processed',
  visible: false
}, {
  id: 'status',
  label: 'Status',
  visible: true
}];
const parseDataProcessed = (value: string) => {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^([\d.]+)\s*(KB|MB|GB|TB)?$/);
  if (!match) return 0;
  const amount = Number(match[1]);
  if (Number.isNaN(amount)) return 0;
  const unit = match[2] ?? 'MB';
  const multiplier = {
    KB: 1,
    MB: 1024,
    GB: 1024 * 1024,
    TB: 1024 * 1024 * 1024
  }[unit];
  return amount * multiplier;
};
const statusOrder: Record<Project['status'], number> = {
  Running: 0,
  Inactive: 1
};
export function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection('asc');
      return;
    }
    if (sortDirection === 'asc') {
      setSortDirection('desc');
      return;
    }
    setSortField(null);
    setSortDirection('asc');
  };
  const handleReorderColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };
  const sortedAndFilteredProjects = useMemo(() => {
    let filtered = SAMPLE_DATA.filter(project => project.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'cost') {
          comparison = a.cost - b.cost;
        } else if (sortField === 'dateCreated') {
          comparison = a.dateCreated.getTime() - b.dateCreated.getTime();
        } else if (sortField === 'lastModified') {
          comparison = a.lastModified.getTime() - b.lastModified.getTime();
        } else if (sortField === 'filesUploaded') {
          comparison = a.filesUploaded - b.filesUploaded;
        } else if (sortField === 'dataProcessed') {
          comparison = parseDataProcessed(a.dataProcessed) - parseDataProcessed(b.dataProcessed);
        } else if (sortField === 'status') {
          comparison = statusOrder[a.status] - statusOrder[b.status];
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    return filtered;
  }, [searchQuery, sortField, sortDirection]);
  return <div className="flex h-screen w-full bg-[#f6f6f6] font-sans text-[#000000]">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-6 py-5 bg-[#f6f6f6] flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-200 rounded-md" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            <div className="flex items-center gap-3 justify-between md:justify-start">
              <ColumnCustomizer columns={columns} onUpdate={setColumns} />

              <button className="flex items-center px-4 py-2 bg-[#ff9200] text-white text-sm font-medium rounded hover:bg-[#e68400] transition-colors shadow-sm whitespace-nowrap">
                <AddIcon className="w-3.5 h-3.5 mr-2" />
                New Project
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          <ProjectTable projects={sortedAndFilteredProjects} sortField={sortField} sortDirection={sortDirection} onSort={handleSort} columns={columns} onReorderColumns={handleReorderColumns} />
        </div>
      </main>
    </div>;
}