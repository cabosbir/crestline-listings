// src/pages/FilterTrainingDashboard.tsx
// Admin page to train the AI on all filter values

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { fetchListings } from '@/services/flexMlsService';
import { filterIntelligence } from '@/services/groqFilterIntelligence';
import Navbar from '@/components/Navbar';

interface TestResult {
  filterType: string;
  originalValue: string;
  optimizedValue: string;
  resultCount: number;
  success: boolean;
  aiReasoning?: string;
}

const FilterTrainingDashboard = () => {
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState(filterIntelligence.getStatistics());

  const zones = [
    "Cabo Corridor", "Cabo San Lucas", "Comondu", "East Cape", "La Paz",
    "Loreto", "Mulege", "Pescadero", "San Jose del Cabo", "Todos Santos"
  ];

  const areas = [
    "Corridor", "Diamante", "Punta Ballena", "Quivira", "San Jose Corridor",
    "Beach & Marina", "Cabo Bello", "Downtown", "El Tezal", "North",
    "Pedregal", "East Cape North", "East Cape South", "La Paz", "Loreto",
    "San Jose Downtown", "San Jose North", "Todos Santos", "Todos Santos South"
  ];

  const communities = [
    "Cabo Bello/Santa Carmela", "Cabo Del Sol", "Chileno Bay/Montage", 
    "El Tezal-East", "Misiones", "BuenVista/LosBarilles", "Palmilla", 
    "Pedregal", "Querencia", "San Jose Corridor", "Ventanas"
  ];

  const subdivisions = [
    "Abasolo", "Alba Residences", "Altamar", "Aqua Viva", "Auberge Residences",
    "Cabo Bello", "Cabo del Sol", "Cabo Real", "Capella Pedregal", "Casa del Mar",
    "Chileno Bay", "Club Campestre", "Copala", "Costa Palmas", "Diamante"
  ];

  const testSingleFilter = async (
    filterType: 'zone' | 'area' | 'community' | 'subdivision',
    value: string,
    apiParam: string
  ): Promise<TestResult> => {
    try {
      // Get AI optimization
      const analysis = await filterIntelligence.analyzeFilterValue(filterType, value);
      
      // Test with the optimized value
      const apiFilters = { [apiParam]: analysis.suggestedApiValue };
      const listings = await fetchListings(apiFilters);
      
      // Record the result
      const pluralType = `${filterType}s` as 'zones' | 'areas' | 'communities' | 'subdivisions';
      filterIntelligence.recordTestResult(
        pluralType,
        value,
        analysis.suggestedApiValue,
        listings.length
      );
      
      return {
        filterType,
        originalValue: value,
        optimizedValue: analysis.suggestedApiValue,
        resultCount: listings.length,
        success: listings.length > 0,
        aiReasoning: analysis.reasoning
      };
    } catch (error) {
      return {
        filterType,
        originalValue: value,
        optimizedValue: value,
        resultCount: 0,
        success: false,
        aiReasoning: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  };

  const runFullTraining = async () => {
    setTraining(true);
    setResults([]);
    setProgress(0);

    const allTests = [
      ...zones.map(z => ({ type: 'zone' as const, value: z, param: 'city' })),
      ...areas.map(a => ({ type: 'area' as const, value: a, param: 'areas' })),
      ...communities.map(c => ({ type: 'community' as const, value: c, param: 'communities' })),
      ...subdivisions.map(s => ({ type: 'subdivision' as const, value: s, param: 'subdivisions' }))
    ];

    const testResults: TestResult[] = [];
    const totalTests = allTests.length;

    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i];
      setCurrentTest(`Testing ${test.type}: ${test.value}`);
      setProgress(((i + 1) / totalTests) * 100);

      const result = await testSingleFilter(test.type, test.value, test.param);
      testResults.push(result);
      setResults([...testResults]);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTraining(false);
    setCurrentTest('');
    setStats(filterIntelligence.getStatistics());

    // Summary
    const working = testResults.filter(r => r.success).length;
    const notWorking = testResults.filter(r => !r.success).length;
    console.log(`\n🎓 TRAINING COMPLETE`);
    console.log(`✅ ${working} filters working (${((working/totalTests)*100).toFixed(1)}%)`);
    console.log(`❌ ${notWorking} filters not working (${((notWorking/totalTests)*100).toFixed(1)}%)`);
  };

  const exportResults = () => {
    const csv = [
      'Filter Type,Original Value,Optimized Value,Result Count,Status,AI Reasoning',
      ...results.map(r => 
        `${r.filterType},"${r.originalValue}","${r.optimizedValue}",${r.resultCount},${r.success ? 'Working' : 'Not Working'},"${r.aiReasoning || ''}"`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filter-training-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const clearTraining = () => {
    if (confirm('Are you sure you want to clear all training data? This cannot be undone.')) {
      filterIntelligence.clearLearning();
      setResults([]);
      setStats(filterIntelligence.getStatistics());
    }
  };

  const workingResults = results.filter(r => r.success);
  const notWorkingResults = results.filter(r => !r.success);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold">Filter Training Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Train the AI to learn which filter values work with the MLS API
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.zones.total + stats.areas.total + stats.communities.total + stats.subdivisions.total}
            </div>
            <div className="text-sm text-muted-foreground">Total Tested</div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.zones.working + stats.areas.working + stats.communities.working + stats.subdivisions.working}
            </div>
            <div className="text-sm text-muted-foreground">Working Filters</div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {stats.zones.notWorking + stats.areas.notWorking + stats.communities.notWorking + stats.subdivisions.notWorking}
            </div>
            <div className="text-sm text-muted-foreground">Not Working</div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.zones.total + stats.areas.total + stats.communities.total + stats.subdivisions.total > 0
                ? ((stats.zones.working + stats.areas.working + stats.communities.working + stats.subdivisions.working) / 
                   (stats.zones.total + stats.areas.total + stats.communities.total + stats.subdivisions.total) * 100).toFixed(0)
                : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Training Controls</h2>
            <div className="flex gap-2">
              <Button
                onClick={runFullTraining}
                disabled={training}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Play className="w-4 h-4 mr-2" />
                {training ? 'Training...' : 'Start Full Training'}
              </Button>
              {results.length > 0 && (
                <>
                  <Button
                    onClick={exportResults}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </Button>
                  <Button
                    onClick={clearTraining}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Training
                  </Button>
                </>
              )}
            </div>
          </div>

          {training && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{currentTest}</span>
                <span className="font-medium">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {!training && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Click "Start Full Training" to test all filter values</p>
              <p className="text-sm mt-2">This will test {zones.length + areas.length + communities.length + subdivisions.length} filter combinations</p>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            {/* Working Filters */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold">Working Filters ({workingResults.length})</h3>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {workingResults.map((r, idx) => (
                  <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-xs font-medium text-green-700 uppercase">{r.filterType}</span>
                        <p className="font-medium">{r.originalValue}</p>
                        {r.originalValue !== r.optimizedValue && (
                          <p className="text-sm text-green-600">→ {r.optimizedValue}</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-green-600">{r.resultCount}</span>
                    </div>
                    {r.aiReasoning && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        AI: {r.aiReasoning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Not Working Filters */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold">Not Working Filters ({notWorkingResults.length})</h3>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notWorkingResults.map((r, idx) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-xs font-medium text-red-700 uppercase">{r.filterType}</span>
                        <p className="font-medium">{r.originalValue}</p>
                        {r.originalValue !== r.optimizedValue && (
                          <p className="text-sm text-red-600">→ {r.optimizedValue}</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-red-600">0</span>
                    </div>
                    {r.aiReasoning && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        AI: {r.aiReasoning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterTrainingDashboard;
