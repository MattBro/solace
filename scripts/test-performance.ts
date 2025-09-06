#!/usr/bin/env tsx

interface PerformanceResult {
  endpoint: string;
  params: string;
  responseTime: number;
  itemsReturned: number;
  totalCount: number;
}

const API_BASE = 'http://localhost:3000/api';

async function measureRequest(endpoint: string, params: URLSearchParams): Promise<PerformanceResult> {
  const url = `${API_BASE}${endpoint}?${params.toString()}`;
  
  const startTime = performance.now();
  const response = await fetch(url);
  const endTime = performance.now();
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    endpoint,
    params: params.toString(),
    responseTime: endTime - startTime,
    itemsReturned: data.data?.length || 0,
    totalCount: data.pagination?.totalCount || 0
  };
}

async function runPerformanceTests() {
  console.log('🚀 Starting API Performance Tests\n');
  console.log('Make sure the Next.js server is running (npm run dev)\n');
  
  const tests = [
    {
      name: 'Basic pagination (page 1)',
      params: new URLSearchParams({ page: '1', limit: '50' })
    },
    {
      name: 'Large page size',
      params: new URLSearchParams({ page: '1', limit: '100' })
    },
    {
      name: 'Deep pagination (page 100)',
      params: new URLSearchParams({ page: '100', limit: '50' })
    },
    {
      name: 'Deep pagination (page 1000)',
      params: new URLSearchParams({ page: '1000', limit: '50' })
    },
    {
      name: 'Simple search',
      params: new URLSearchParams({ search: 'John', page: '1', limit: '50' })
    },
    {
      name: 'Complex search (multiple terms)',
      params: new URLSearchParams({ search: 'anxiety depression therapy', page: '1', limit: '50' })
    },
    {
      name: 'City search',
      params: new URLSearchParams({ search: 'New York', page: '1', limit: '50' })
    },
    {
      name: 'Specialty search',
      params: new URLSearchParams({ search: 'ADHD', page: '1', limit: '50' })
    },
    {
      name: 'Degree search',
      params: new URLSearchParams({ search: 'PhD', page: '1', limit: '50' })
    },
    {
      name: 'Search with sorting by name',
      params: new URLSearchParams({ search: 'therapy', sortBy: 'name', sortOrder: 'asc', limit: '50' })
    },
    {
      name: 'Search with sorting by experience',
      params: new URLSearchParams({ search: 'therapy', sortBy: 'experience', sortOrder: 'desc', limit: '50' })
    }
  ];
  
  const results: PerformanceResult[] = [];
  
  for (const test of tests) {
    try {
      process.stdout.write(`Running: ${test.name}... `);
      const result = await measureRequest('/advocates', test.params);
      results.push(result);
      
      const status = result.responseTime > 1000 ? '⚠️ SLOW' : '✅';
      console.log(`${status} ${result.responseTime.toFixed(2)}ms (${result.itemsReturned} items)`);
    } catch (error) {
      console.log(`❌ FAILED: ${error}`);
    }
  }
  
  // Print summary
  console.log('\n📊 Performance Summary:\n');
  console.log('Test Name                                    | Response Time | Items | Total Count');
  console.log('---------------------------------------------|---------------|-------|------------');
  
  results.forEach(result => {
    const testName = tests.find(t => t.params.toString() === result.params)?.name || 'Unknown';
    const padded = testName.padEnd(44);
    const time = `${result.responseTime.toFixed(2)}ms`.padStart(12);
    const items = result.itemsReturned.toString().padStart(5);
    const total = result.totalCount.toLocaleString().padStart(10);
    
    console.log(`${padded} | ${time} | ${items} | ${total}`);
  });
  
  // Calculate statistics
  const times = results.map(r => r.responseTime);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);
  const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
  
  console.log('\n📈 Statistics:');
  console.log(`  Average: ${avg.toFixed(2)}ms`);
  console.log(`  Min: ${min.toFixed(2)}ms`);
  console.log(`  Max: ${max.toFixed(2)}ms`);
  console.log(`  P95: ${p95.toFixed(2)}ms`);
  
  // Performance recommendations
  console.log('\n💡 Performance Analysis:');
  
  if (max > 2000) {
    console.log('  ⚠️  Some queries are taking over 2 seconds');
  }
  if (avg > 500) {
    console.log('  ⚠️  Average response time is high (>500ms)');
  }
  
  const deepPaginationTest = results.find(r => r.params.includes('page=1000'));
  if (deepPaginationTest && deepPaginationTest.responseTime > 1000) {
    console.log('  ⚠️  Deep pagination is slow - consider cursor-based pagination');
  }
  
  const searchTests = results.filter(r => r.params.includes('search='));
  const avgSearchTime = searchTests.reduce((a, b) => a + b.responseTime, 0) / searchTests.length;
  if (avgSearchTime > 500) {
    console.log('  ⚠️  Search queries are slow - check database indexes');
  }
  
  if (max < 500 && avg < 200) {
    console.log('  ✅ Performance is excellent!');
  } else if (max < 1000 && avg < 500) {
    console.log('  ✅ Performance is good');
  }
}

// Run tests
runPerformanceTests().catch(console.error);