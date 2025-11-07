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

