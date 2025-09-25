// API service for communicating with backend AI services

/**
 * Handles communication with external AI services for brainstorming
 * and layout suggestion generation.
 */
export default class APIService {
    /**
     * Fetches brainstorming suggestions from the backend AI service
     * @param elements - Array of layout elements to analyze
     * @param canvasDimensions - Optional canvas dimensions for context
     * @param llmModel - The LLM model to use for generation (e.g., 'gpt-4o', 'gpt-4o-mini', etc.)
     * @returns Promise resolving to array of suggestion strings
     */
    static async getBrainstormingSuggestions(elements: any[], canvasDimensions?: { width: number, height: number }, llmModel?: string): Promise<string[]> {
        console.log('APIService.getBrainstormingSuggestions called with elements:', elements, 'canvas dimensions:', canvasDimensions, 'llm model:', llmModel);
        try {
            console.log('APIService: sending POST to http://localhost:8000/predict');
            
            // Prepare payload with serialized elements, canvas context, and LLM model
            const payload = { 
                elements: elements.map(el => el.toSerializable ? el.toSerializable() : el),
                canvasDimensions: canvasDimensions,
                'llm-name': llmModel || 'gpt-4o' // Default to gpt-4o if no model specified
            };
            console.log('APIService: payload sent:', payload);
            
            // Send request to backend prediction endpoint
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            console.log('Fetch sent to /api/brainstorm, response status:', response.status);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            console.log('APIService: received response data', data);
            console.log('APIService: data type:', typeof data);
            console.log('APIService: data keys:', Object.keys(data || {}));
            
            // Parse suggestions from response - handle different response formats
            let suggestionsArray: any[] = [];
            if (Array.isArray(data)) {
                console.log('APIService: data is direct array, length:', data.length);
                suggestionsArray = data;
            } else if (Array.isArray(data.versions)) {
                console.log('APIService: using data.versions, length:', data.versions.length);
                suggestionsArray = data.versions;
            } else if (Array.isArray((data as any).suggestions)) {
                console.log('APIService: using data.suggestions, length:', (data as any).suggestions.length);
                suggestionsArray = (data as any).suggestions;
            } else {
                console.warn('APIService: no recognized array structure found in response:', data);
            }
            
            console.log('APIService: final suggestionsArray:', suggestionsArray);
            return suggestionsArray;
        } catch (error) {
            console.error('Error fetching brainstorming suggestions:', error);
            return [];
        }
    }
}