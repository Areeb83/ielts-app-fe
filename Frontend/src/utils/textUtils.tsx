/**
 * Formats IELTS instructions by bolding constraints like "NO MORE THAN TWO WORDS".
 */
export const formatInstruction = (text: string) => {
    const regex = /(NO MORE THAN [A-Z ]+|\b(?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN)\b)/g;
    const parts = text.split(regex);
    return parts.map((part, i) =>
        part && part.match(regex) ? <strong key={i}>{part}</strong> : part
    );
};
