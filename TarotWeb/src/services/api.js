const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5013/api';

export const postReading = async (question, selectedCardIds) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Reading`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question,
                selectedCardIds,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to get reading');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const getCards = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/Cards`);
        if (!response.ok) {
            throw new Error('Failed to fetch cards');
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
