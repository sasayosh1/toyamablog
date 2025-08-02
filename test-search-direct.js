import { searchPosts } from './src/lib/sanity.js';

async function testSearch() {
  try {
    console.log('Testing search function directly...');
    
    const results = await searchPosts('富山');
    console.log(`Search results for "富山": ${results.length} items`);
    
    if (results.length > 0) {
      console.log('First result:', results[0].title);
    }
    
    const results2 = await searchPosts('toyama');
    console.log(`Search results for "toyama": ${results2.length} items`);
    
    if (results2.length > 0) {
      console.log('First result:', results2[0].title);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testSearch();