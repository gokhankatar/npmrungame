// ! scroll to top
export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};

// ! truncate text
export const truncateText = (text: string, num: number): string => {
    if (text?.length > num) {
        return text.slice(0, num) + "...";
    }
    return text;
};

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

