/**
 * Formats date string (YYYY-MM-DD or ISO string) to readable format like "September 5, 2026"
 */
export function formatDeadline(dateString: string | null | undefined): string {
    if (!dateString) return 'Flexible';

    try {
        const cleanDate = dateString.split('T')[0];
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const d = new Date(year, month, day);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                });
            }
        }
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        }
    } catch {
        // Fallback to original string if parsing fails
    }

    return dateString;
}
