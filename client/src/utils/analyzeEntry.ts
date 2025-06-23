import { apiRequest } from "@/lib/queryClient";

export interface AnalysisResult {
  summary: string;
  mood: string;
  moodEmoji: string;
  response: string;
}

export async function analyzeEntry(transcript: string): Promise<AnalysisResult> {
  if (!transcript.trim()) {
    throw new Error('Transcript cannot be empty');
  }

  try {
    const response = await apiRequest('POST', '/api/analyze-entry', {
      transcript: transcript.trim()
    });

    const result = await response.json();
    
    // Validate the response structure
    if (!result.summary || !result.mood || !result.moodEmoji || !result.response) {
      throw new Error('Invalid response format from analysis API');
    }

    return result;
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Return fallback response if API fails
    return {
      summary: 'Unable to analyze entry at this time',
      mood: 'Neutral',
      moodEmoji: '😊',
      response: 'Thank you for sharing your thoughts. I\'m here to listen whenever you need.'
    };
  }
}
