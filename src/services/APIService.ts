export default class APIService {
    // Fetch brainstorming suggestions from backend
    static async getBrainstormingSuggestions(elements: any[]): Promise<string[]> {
        console.log('APIService.getBrainstormingSuggestions called with elements:', elements);
        try {
            console.log('APIService: sending POST to http://localhost:8000/predict');
            // Call backend prediction endpoint via Vite proxy
            const payload = { elements: elements.map(el => el.toSerializable ? el.toSerializable() : el) };
            console.log('APIService: payload sent:', payload);
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log('Fetch sent to /api/brainstorm, response status:', response.status);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log('APIService: received response data', data);
            // Determine suggestions array: versions, root-array, or suggestions
            let suggestionsArray: any[] = [];
            if (Array.isArray(data)) {
                suggestionsArray = data;
            } else if (Array.isArray(data.versions)) {
                suggestionsArray = data.versions;
            } else if (Array.isArray((data as any).suggestions)) {
                suggestionsArray = (data as any).suggestions;
            }
            return suggestionsArray;
        } catch (error) {
            console.error('Error fetching brainstorming suggestions:', error);
            return [];
        }
    }
}