import { NextRequest, NextResponse } from 'next/server';
import { vectorIndex } from '@/lib/vector';

// Same embedding function as upsert (must be consistent)
async function generateEmbedding(text: string): Promise<number[]> {
  const dimension = 1536;
  const vector = new Array(dimension).fill(0);
  
  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);
  const uniqueWords = new Set(words);
  
  vector[0] = uniqueWords.size / words.length;
  
  for (let n = 1; n <= 3; n++) {
    for (let i = 0; i < normalizedText.length - n; i++) {
      const ngram = normalizedText.slice(i, i + n);
      const hash = ngram.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, 0);
      const idx = Math.abs(hash) % (dimension - 20) + 10;
      vector[idx] += 1 / (normalizedText.length - n + 1);
    }
  }
  
  words.forEach((word, idx) => {
    const positionWeight = 1 - (idx / words.length);
    const hash = word.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    const vectorIdx = Math.abs(hash) % dimension;
    vector[vectorIdx] += positionWeight / words.length;
  });
  
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => magnitude > 0 ? val / magnitude : 0);
}

// Deduplication based on text similarity
function deduplicateResults(results: any[], threshold: number = 0.9): any[] {
  const deduplicated: any[] = [];
  
  for (const result of results) {
    let isDuplicate = false;
    
    for (const existing of deduplicated) {
      const text1 = result.metadata?.text || '';
      const text2 = existing.metadata?.text || '';
      
      // Simple Jaccard similarity for deduplication
      const words1 = new Set(text1.toLowerCase().split(/\s+/));
      const words2 = new Set(text2.toLowerCase().split(/\s+/));
      
      const intersection = new Set([...words1].filter(w => words2.has(w)));
      const union = new Set([...words1, ...words2]);
      
      const similarity = intersection.size / union.size;
      
      if (similarity > threshold) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      deduplicated.push(result);
    }
  }
  
  return deduplicated;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK = 10, filter = {}, includeMetadata = true } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query string is required' },
        { status: 400 }
      );
    }

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // Search Upstash Vector
    const searchResults = await vectorIndex.query({
      vector: queryEmbedding,
      topK: topK * 2, // Get more results for deduplication
      includeMetadata,
      includeVectors: false,
    });

    // Apply filters if provided
    let filteredResults = searchResults;
    if (Object.keys(filter).length > 0) {
      filteredResults = searchResults.filter((result: any) => {
        if (!result.metadata) return false;
        
        return Object.entries(filter).every(([key, value]) => {
          return result.metadata[key] === value;
        });
      });
    }

    // Deduplicate results
    const deduplicatedResults = deduplicateResults(filteredResults);
    
    // Limit to requested topK
    const finalResults = deduplicatedResults.slice(0, topK);

    // Extract context text
    const contexts = finalResults
      .map((result: any) => result.metadata?.text)
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      results: finalResults,
      contexts,
      query,
      resultCount: finalResults.length,
    });
  } catch (error) {
    console.error('Error in RAG search:', error);
    return NextResponse.json(
      { error: 'Failed to search documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
