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


export const getActiveGamePlatformColor = (
    platform: "PC" | "PS5" | "Xbox" | "Nintendo Switch" | "En Yüksek Puanlı"
): string => {
    switch (platform) {
        case "PC":
            return "#0078D7"
        case "PS5":
            return "#003087"
        case "Xbox":
            return "#107C10"
        case "Nintendo Switch":
            return "#E60012"
        case "En Yüksek Puanlı":
            return "#FFD700"
        default:
            return "#9E9E9E"
    }
}


export const getPlatformIcon = (platformName: string): string | null => {
    const name = platformName.toLowerCase()

    if (name.includes("pc")) return "mdi-microsoft-windows"
    if (name.includes("playstation")) return "mdi-sony-playstation"
    if (name.includes("xbox")) return "mdi-microsoft-xbox"
    if (name.includes("nintendo")) return "mdi-nintendo-switch"

    return null
}

export const getUniquePlatformIcons = (platforms: any[]): string[] => {
    const icons = platforms
        .map(p => getPlatformIcon(p.platform.name))
        .filter((icon): icon is string => Boolean(icon))

    return [...new Set(icons)]
}