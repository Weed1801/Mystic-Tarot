import { motion } from 'framer-motion';
import TarotCard from './TarotCard';
import TypewriterText from '../ui/TypewriterText';
import { useSound } from '../../contexts/SoundContext';
import { useEffect, useState } from 'react';

const Slot = ({ label, card, isRevealed, onReveal, analysis, canReveal, onReadingComplete }) => {
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

    return (
        <div className={`flex flex-col items-center gap-4 w-full md:w-1/3 max-w-[200px] md:max-w-xs transition-opacity duration-500 ${!canReveal && !isRevealed ? 'opacity-50 grayscale' : 'opacity-100'}`}>
            <h3 className="text-mystic-gold font-serif tracking-widest text-sm uppercase opacity-80">{label}</h3>
            <div className={`w-32 h-48 md:w-40 md:h-60 rounded-xl border-2 border-dashed ${canReveal || isRevealed ? 'border-mystic-gold/60' : 'border-white/10'} flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all relative`}>
                {!card && <span className="text-white/20 text-4xl font-serif opacity-50">?</span>}

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

            {/* Analysis Text Area */}
            <div className="min-h-[100px] w-full mt-2">
                {isRevealed && analysis && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/90 text-sm font-serif text-center bg-black/40 p-3 rounded border border-white/10 shadow-inner"
                    >
                        <strong className="block text-mystic-gold mb-1 text-xs uppercase tracking-wide">{card?.name}</strong>
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
        <div className="flex flex-wrap justify-center gap-8 md:gap-8 w-full max-w-6xl px-4 min-h-[450px]">
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
                />
            ))}
        </div>
    );
};

export default SpreadArea;
