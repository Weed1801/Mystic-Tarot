import { motion } from 'framer-motion';
import TarotCard from './TarotCard';
import TypewriterText from '../ui/TypewriterText';
import { useSound } from '../../contexts/SoundContext';
import { useEffect, useState } from 'react';

const Slot = ({ label, card, isRevealed, onReveal, analysis, canReveal, onReadingComplete, layoutMode }) => {
    const { playSound, stopSound } = useSound();

    useEffect(() => {
        if (isRevealed) {
            playSound('reveal');
        }
    }, [isRevealed, playSound]);

    const handleTypewriterComplete = () => {
        stopSound('reveal');
        if (onReadingComplete) {
            onReadingComplete();
        }
    };

    const isReadingMode = layoutMode === 'reading';

    // Flexible styles based on mode (Mobile logic mainly)
    const containerClass = isReadingMode
        ? "w-full max-w-sm md:w-1/3 md:max-w-xs" // Reading: Full width on mobile
        : "w-[32%] md:w-1/3 max-w-[120px] md:max-w-xs"; // Picking: Compact width

    const labelClass = isReadingMode
        ? "text-mystic-gold font-serif tracking-widest text-lg md:text-sm uppercase opacity-90 text-center mb-2" // Reading: Larger title
        : "text-mystic-gold font-serif tracking-widest text-[9px] md:text-sm uppercase opacity-80 text-center truncate w-full"; // Picking: Tiny title

    const cardContainerClass = isReadingMode
        ? `w-48 h-72 md:w-40 md:h-60 rounded-xl border-2 border-dashed ${canReveal || isRevealed ? 'border-mystic-gold/60' : 'border-white/10'} flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all relative` // Reading: Large card
        : `w-full aspect-[2/3] md:w-40 md:h-60 rounded-lg md:rounded-xl border border-dashed ${canReveal || isRevealed ? 'border-mystic-gold/60' : 'border-white/10'} flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all relative`; // Picking: Compact card

    return (
        <div className={`flex flex-col items-center gap-1 md:gap-4 ${containerClass} transition-opacity duration-500 ${!canReveal && !isRevealed ? 'opacity-50 grayscale' : 'opacity-100'}`}>
            <h3 className={labelClass}>{label}</h3>

            <div className={cardContainerClass}>
                {!card && <span className={`text-white/20 font-serif opacity-50 ${isReadingMode ? 'text-6xl' : 'text-2xl md:text-4xl'}`}>?</span>}

                {card && (
                    <motion.div
                        className="absolute inset-0 cursor-pointer"
                        layoutId={card.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20
                        }}
                    >
                        <TarotCard
                            id={card.id}
                            image={card.image}
                            name={card.name}
                            isRevealed={isRevealed}
                            onClick={() => {
                                if (!isRevealed && canReveal) {
                                    playSound('flip');
                                    onReveal(card.id);
                                }
                            }}
                            className={!isRevealed && canReveal ? "hover:scale-105 transition-transform" : ""}
                        />
                    </motion.div>
                )}
            </div>

            {/* Analysis Text Area - Only visible in Reading Mode or Desktop */}
            <div className="w-full mt-2">
                {isRevealed && analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white/90 text-base md:text-sm font-serif text-justify bg-black/60 p-5 md:p-3 rounded-lg border border-white/20 shadow-lg leading-relaxed"
                    >
                        <strong className="block text-mystic-gold mb-3 text-lg md:text-xs uppercase tracking-wide text-center border-b border-white/10 pb-2">{card?.name}</strong>
                        <TypewriterText text={analysis} delay={30} onComplete={handleTypewriterComplete} />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const SpreadArea = ({ cards = [], isRevealed, onCardReveal, readingResult }) => {
    const [readingProgress, setReadingProgress] = useState(-1); // -1: none started, 0: first done, 1: second done...

    const slots = [
        { label: 'Quá Khứ', key: 'past' },
        { label: 'Hiện Tại', key: 'present' },
        { label: 'Tương Lai', key: 'future' }
    ];

    // Reset progress when new reading starts (cards hidden)
    useEffect(() => {
        if (!isRevealed) {
            setReadingProgress(-1);
        }
    }, [isRevealed]);

    // Helper to get analysis text safely
    const getAnalysis = (key) => {
        if (!readingResult) return null;
        if (key === 'past') return readingResult.pastAnalysis || readingResult.past_analysis;
        if (key === 'present') return readingResult.presentAnalysis || readingResult.present_analysis;
        if (key === 'future') return readingResult.futureAnalysis || readingResult.future_analysis;
        return null;
    };

    return (
        <div className={`flex ${isRevealed ? 'flex-col items-center gap-8 py-8' : 'flex-row items-start gap-2'} md:flex-row md:items-start md:gap-8 justify-center w-full max-w-6xl px-4 min-h-[450px] transition-all duration-500`}>
            {slots.map((slot, index) => (
                <Slot
                    key={slot.key}
                    label={slot.label}
                    card={cards[index]}
                    isRevealed={isRevealed && cards[index]?.isRevealed}
                    onReveal={onCardReveal}
                    analysis={isRevealed && cards[index]?.isRevealed ? getAnalysis(slot.key) : null}
                    canReveal={index === 0 || index <= readingProgress + 1}
                    onReadingComplete={() => {
                        if (index > readingProgress) {
                            setReadingProgress(index);
                        }
                    }}
                    // Pass global isRevealed state to control layout mode
                    layoutMode={isRevealed ? 'reading' : 'picking'}
                />
            ))}
        </div>
    );
};

export default SpreadArea;
