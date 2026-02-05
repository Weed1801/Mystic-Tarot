import { useState, useEffect, useRef } from 'react';

const TypewriterText = ({ text, delay = 30, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    const hasCompleted = useRef(false);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, delay);

            return () => clearTimeout(timeout);
        } else if (onComplete && !hasCompleted.current) {
            hasCompleted.current = true;
            onComplete();
        }
    }, [currentIndex, delay, text, onComplete]);

    return <p className="leading-relaxed">{displayedText}</p>;
};

export default TypewriterText;
