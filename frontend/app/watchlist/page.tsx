'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Property, properties } from '@/data/mock/properties';
import PropertyCard from '@/components/ui/PropertyCard';
import {
  getWatchlist,
  toggleWatchlist,
  getNote,
  saveNote,
} from '@/lib/localStorage'; // Added getNote, saveNote
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Added Input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Added Select
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Added Tabs
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import OverviewTab from '@/components/details/OverviewTab';
import AnalyticsTab from '@/components/details/AnalyticsTab';
import AITab from '@/components/details/AITab';
import { propertyScoreBreakdowns, propertyTags } from '@/data/mock/ai-features';
import {
  propertyValueHistories,
  marketCorrelations,
  liquidityMetrics,
} from '@/data/mock/analytics';
import ReactMarkdown from 'react-markdown'; // Added for Markdown preview
import { ExternalLink, FileDown } from 'lucide-react'; // Added icons

// Define type for notes state
type NotesState = {
  [propertyId: string]: string;
};

// Define type for sort options
type SortOption = 'name' | 'price_high_low' | 'last_edited';

export default function WatchlistPage() {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [watchlistedProperties, setWatchlistedProperties] = useState<
    Property[]
  >([]);
  const [currentTab, setCurrentTab] = useState<'properties' | 'notes'>(
    'properties'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [notes, setNotes] = useState<NotesState>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null); // Track which note is being edited
  const [currentNoteValue, setCurrentNoteValue] = useState(''); // Temp storage for editor
  const [noteEditTab, setNoteEditTab] = useState<'edit' | 'preview'>('edit');

  // State for modal (reused)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<
    'overview' | 'analytics' | 'ai'
  >('overview');

  // --- Effects ---
  useEffect(() => {
    const ids = getWatchlist();
    setWatchlistIds(ids);
    const filteredProps = properties.filter((prop) => ids.includes(prop.id));
    setWatchlistedProperties(filteredProps);

    // Load notes for watchlisted properties
    const loadedNotes: NotesState = {};
    ids.forEach((id) => {
      loadedNotes[id] = getNote(id) || ''; // Load note or default to empty string
    });
    setNotes(loadedNotes);
  }, []); // Load watchlist and notes on mount

  // --- Filtering and Sorting ---
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = watchlistedProperties.filter(
      (prop) =>
        prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortOption) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_high_low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'last_edited':
        // Note: Sorting by last edited requires timestamp info not currently stored.
        // Placeholder: Keep current order or sort by name as fallback.
        // In a real app, saveNote would store a timestamp.
        filtered.sort((a, b) => a.name.localeCompare(b.name)); // Fallback
        break;
      default:
        break;
    }
    return filtered;
  }, [watchlistedProperties, searchQuery, sortOption]);

  // --- Handlers ---
  const handleRemoveFromWatchlist = (propertyId: string) => {
    toggleWatchlist(propertyId); // Update localStorage watchlist
    const newIds = getWatchlist();
    setWatchlistIds(newIds);
    setWatchlistedProperties(
      properties.filter((prop) => newIds.includes(prop.id))
    );
    // Remove note from state if property is removed
    const updatedNotes = { ...notes };
    delete updatedNotes[propertyId];
    setNotes(updatedNotes);
    // Consider removing note from localStorage too: removeNote(propertyId);
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setActiveDetailTab('overview');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProperty(null), 300);
  };

  const handleSaveNote = (propertyId: string) => {
    saveNote(propertyId, currentNoteValue); // Save to localStorage
    setNotes((prev) => ({ ...prev, [propertyId]: currentNoteValue }));
    setEditingNoteId(null); // Exit editing mode
    setCurrentNoteValue(''); // Clear temp value
  };

  const handleEditNoteClick = (propertyId: string) => {
    setEditingNoteId(propertyId);
    setCurrentNoteValue(notes[propertyId] || ''); // Load current note into editor
    setNoteEditTab('edit'); // Start in edit mode
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setCurrentNoteValue('');
  };

  const handleExport = () => {
    // Basic CSV export implementation
    if (filteredAndSortedProperties.length === 0) return;

    const headers = [
      'ID',
      'Name',
      'Location',
      'Price',
      'Yield',
      'Appreciation',
      'Score',
      'Notes',
    ];
    const rows = filteredAndSortedProperties.map((prop) => [
      prop.id,
      prop.name,
      prop.location,
      prop.price,
      prop.yield,
      prop.appreciation,
      prop.aiScore,
      `"${(notes[prop.id] || '').replace(/"/g, '""')}"`, // Escape quotes in notes
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'watchlist_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('Exporting watchlist...', filteredAndSortedProperties);
  };

  // --- Find related data for modal ---
  const selectedPropertyAI = selectedProperty
    ? propertyScoreBreakdowns.find((p) => p.propertyId === selectedProperty.id)
    : null;
  const selectedPropertyTags = selectedProperty
    ? propertyTags.find((p) => p.propertyId === selectedProperty.id)
    : null;
  const selectedPropertyAnalyticsHistory = selectedProperty
    ? propertyValueHistories.find((p) => p.propertyId === selectedProperty.id)
    : null;
  const selectedPropertyAnalyticsCorrelations = selectedProperty
    ? marketCorrelations[selectedProperty.id]
    : null;
  const selectedPropertyAnalyticsLiquidity = selectedProperty
    ? liquidityMetrics[selectedProperty.id]
    : null;

  // --- Render ---
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={watchlistedProperties.length === 0}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export Watchlist
        </Button>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(value) =>
          setCurrentTab(value as 'properties' | 'notes')
        }
        className="w-full"
      >
        {/* Tabs List */}
        <TabsList className="mb-4">
          <TabsTrigger value="properties">
            Properties ({watchlistedProperties.length})
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Search and Sort Bar (Common for both tabs if properties exist) */}
        {watchlistedProperties.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow mb-6 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label
                  htmlFor="search-watchlist"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Search
                </label>
                <Input
                  id="search-watchlist"
                  type="text"
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-shrink-0">
                <label
                  htmlFor="sort-watchlist"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Sort By
                </label>
                <Select
                  value={sortOption}
                  onValueChange={(value) => setSortOption(value as SortOption)}
                >
                  <SelectTrigger
                    id="sort-watchlist"
                    className="w-full md:w-[180px]"
                  >
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price_high_low">
                      Price (High to Low)
                    </SelectItem>
                    <SelectItem value="last_edited">Last Edited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab Content */}
        <TabsContent value="properties">
          {
            filteredAndSortedProperties.length === 0 &&
            watchlistedProperties.length > 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p>No properties match your search criteria.</p>
              </div>
            ) : filteredAndSortedProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProperties.map((property) => (
                  <div key={property.id} className="relative group">
                    <PropertyCard
                      property={property}
                      onClick={() => handlePropertyClick(property)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWatchlist(property.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
                      aria-label="Remove from watchlist"
                      title="Remove from watchlist"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : null /* Empty state handled below */
          }
        </TabsContent>

        {/* Notes Tab Content */}
        <TabsContent value="notes">
          {
            filteredAndSortedProperties.length > 0 ? (
              <div className="space-y-6">
                {filteredAndSortedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {property.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {property.location}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePropertyClick(property)}
                      >
                        View Property
                        <ExternalLink className="ml-1.5 h-3 w-3" />
                      </Button>
                    </div>

                    {editingNoteId === property.id ? (
                      // Note Editor
                      <div>
                        <Tabs
                          defaultValue="edit"
                          value={noteEditTab}
                          onValueChange={(value) =>
                            setNoteEditTab(value as 'edit' | 'preview')
                          }
                        >
                          <TabsList className="mb-2">
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                          </TabsList>
                          <TabsContent value="edit">
                            <textarea
                              value={currentNoteValue}
                              onChange={(e) =>
                                setCurrentNoteValue(e.target.value)
                              }
                              placeholder="Add your notes about this property..."
                              rows={6}
                              className="w-full mb-2 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-slate-50"
                            />
                          </TabsContent>
                          <TabsContent value="preview">
                            <div className="prose dark:prose-invert max-w-none p-3 border rounded-md min-h-[100px] bg-slate-50 dark:bg-slate-700/50">
                              <ReactMarkdown>
                                {currentNoteValue || '*No content yet*'}
                              </ReactMarkdown>
                            </div>
                          </TabsContent>
                        </Tabs>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          Formatting Tips: Use **bold**, *italic*, # Heading, -
                          item, `code`
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveNote(property.id)}
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Note Display
                      <div>
                        <div className="prose dark:prose-invert max-w-none mb-3 p-3 border rounded-md min-h-[50px] bg-slate-50 dark:bg-slate-700/50">
                          <ReactMarkdown>
                            {notes[property.id] || '*No notes added yet*'}
                          </ReactMarkdown>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditNoteClick(property.id)}
                          >
                            {notes[property.id] ? 'Edit Notes' : 'Add Notes'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null /* Empty state handled below */
          }
        </TabsContent>

        {/* Empty Watchlist State (Common for both tabs if empty) */}
        {watchlistedProperties.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg mt-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.474.955-.993 1.868-1.57 2.734"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              Your watchlist is empty
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start adding properties to track your interests.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => (window.location.href = '/properties')}
                variant="default"
              >
                Explore Properties
              </Button>
            </div>
          </div>
        )}
      </Tabs>

      {/* Property Detail Modal (Reused) */}
      {selectedProperty && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                {selectedProperty.name}
              </DialogTitle>
              {/* Maybe add subtitle: <DialogDescription>{selectedProperty.location}</DialogDescription> */}
            </DialogHeader>
            {/* Detail Tabs (Reused from original - ensure they match your detail components) */}
            <div className="border-b border-gray-200 dark:border-gray-700 mt-2">
              <Tabs
                value={activeDetailTab}
                onValueChange={(value) =>
                  setActiveDetailTab(value as 'overview' | 'analytics' | 'ai')
                }
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="ai">AI Analysis</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex-grow overflow-y-auto pr-3 -mr-3 pl-1 -ml-1 py-4">
              {activeDetailTab === 'overview' && (
                <OverviewTab
                  property={selectedProperty}
                  aiTagsData={selectedPropertyTags}
                />
              )}
              {activeDetailTab === 'analytics' && (
                <AnalyticsTab
                  propertyId={selectedProperty.id}
                  history={selectedPropertyAnalyticsHistory}
                  correlations={selectedPropertyAnalyticsCorrelations}
                  liquidity={selectedPropertyAnalyticsLiquidity}
                />
              )}
              {activeDetailTab === 'ai' && (
                <AITab
                  scoreData={selectedPropertyAI}
                  tagsData={selectedPropertyTags}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Helper function in localStorage (needs to be added there)
/*
export const getNote = (propertyId: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`watchlist-note-${propertyId}`);
};

export const saveNote = (propertyId: string, note: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`watchlist-note-${propertyId}`, note);
  // Could add timestamp here: localStorage.setItem(`watchlist-note-timestamp-${propertyId}`, Date.now().toString());
};

export const removeNote = (propertyId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`watchlist-note-${propertyId}`);
  // localStorage.removeItem(`watchlist-note-timestamp-${propertyId}`);
};
*/
