/**
 * Auto-Categorization Stub for Samadhan MVP
 * 
 * TODO [ML_SEAM]: Replace this stub with a network call to the FastAPI Python backend
 * or local inference running an NLP/LLM model.
 * 
 * Example ML call structure:
 * const res = await fetch('http://ml-service:8000/classify', {
 *   method: 'POST',
 *   body: JSON.stringify({ text: `${title} ${description}` })
 * });
 * return res.json();
 */

export interface ClassificationResult {
  category: 'roads' | 'water' | 'electricity' | 'sanitation' | 'law_order' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

export function classifyComplaint(title: string, description: string): ClassificationResult {
  const text = `${title} ${description}`.toLowerCase();

  // Keyword rules for MVP
  if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('sewer') || text.includes('drain')) {
    return {
      category: 'water',
      priority: text.includes('gushing') || text.includes('flood') || text.includes('major') ? 'critical' : 'high',
      confidence: 0.88,
    };
  }

  if (text.includes('pothole') || text.includes('road') || text.includes('pavement') || text.includes('street')) {
    return {
      category: 'roads',
      priority: text.includes('accident') || text.includes('danger') ? 'high' : 'medium',
      confidence: 0.85,
    };
  }

  if (text.includes('light') || text.includes('power') || text.includes('wire') || text.includes('electric') || text.includes('transformer')) {
    return {
      category: 'electricity',
      priority: text.includes('spark') || text.includes('fire') ? 'critical' : 'high',
      confidence: 0.91,
    };
  }

  if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('sweep')) {
    return {
      category: 'sanitation',
      priority: 'low',
      confidence: 0.79,
    };
  }

  if (text.includes('crime') || text.includes('theft') || text.includes('fight') || text.includes('police')) {
    return {
      category: 'law_order',
      priority: 'critical',
      confidence: 0.95,
    };
  }

  // Default fallback
  return {
    category: 'other',
    priority: 'low',
    confidence: 0.40,
  };
}
