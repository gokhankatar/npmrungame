export const useLimitedTags = (tags: any[] = [], limit = 3) => {
    const visibleTags = tags.slice(0, limit)
    const hiddenCount = Math.max(0, tags.length - limit)
    const hiddenText = hiddenCount > 0 ? `+${hiddenCount} more` : ''

    return { visibleTags, hiddenCount, hiddenText }
}

export const useMetacriticStyle = (score?: number) => {
    if (!score) {
        return {
            color: 'grey-darken-2',
            icon: 'mdi-help-circle-outline',
            text: 'belirsiz'
        }
    }

    if (score >= 90) {
        return {
            color: 'deep-orange-accent-1', 
            icon: 'mdi-fire',
            text: `${score}`
        }
    }

    if (score >= 75) {
        return {
            color: 'light-green-accent-4', 
            icon: 'mdi-star-circle-outline',
            text: `${score}`
        }
    }

    if (score >= 50) {
        return {
            color: 'amber-darken-3', 
            icon: 'mdi-star-half-full',
            text: `${score}`
        }
    }

    return {
        color: 'red-accent-4', 
        icon: 'mdi-thumb-down-outline',
        text: `${score}`
    }
}
