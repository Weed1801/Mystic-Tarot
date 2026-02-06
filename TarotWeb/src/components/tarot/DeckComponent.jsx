import { motion } from 'framer-motion';
import TarotCard from './TarotCard';
import { useState, useEffect } from 'react';
import { useSound } from '../../contexts/SoundContext';


const DeckComponent = ({ gameState, onCardPick, cards = [], selectedCards = [] }) => {
    const { playSound } = useSound();
    const [displayCards, setDisplayCards] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (cards.length > 0) {
            // PERFORMANCE: Limit to 28 cards max to prevent lag on mobile
            // Use a stable subset so it doesn't flicker
            setDisplayCards(cards.slice(0, 28).map((c, i) => ({ ...c, index: i, zIndex: i })));
        } else {
            // Fallback
            const fallback = Array.from({ length: 24 }, (_, i) => ({ id: `deck-card-${i}`, index: i }));
            setDisplayCards(fallback);
        }
    }, [cards]);

    // Fan Animation Variants
    const getCardStyle = (index, total) => {
        if (gameState === 'fanning' || gameState === 'picking') {
            // Mobile: tighter fan, less spread
            const spreadAngle = isMobile ? 80 : 120;
            const radius = isMobile ? 300 : 400;
            const xFactor = isMobile ? 0.4 : 0.6;
            const yOffset = isMobile ? 20 : 50;

            const startAngle = -spreadAngle / 2;
            const angleStep = spreadAngle / (total - 1);
            const rotate = startAngle + index * angleStep;

            const radian = (rotate * Math.PI) / 180;
            const x = Math.sin(radian) * radius * xFactor;
            const y = Math.cos(radian) * -radius * 0.2 + yOffset;

            return { x, y, rotate, zIndex: index };
        }

        // Stacked state
        return {
            x: 0,
            y: index * -0.2, // Tighter stack
            rotate: index % 2 === 0 ? 1 : -1,
            zIndex: index,
        };
    };

    const isInteractive = gameState === 'picking';

    return (
        <div className={`relative flex justify-center items-center transition-all duration-500 
            ${gameState === 'picking' ? 'h-80 w-full max-w-4xl' : 'h-40 w-32'}
            ${isInteractive ? 'cursor-pointer' : ''}
        `}>
            {displayCards.map((card, i) => {
                // Don't render picked cards in the deck
                if (selectedCards.some(s => s.id === card.id)) return null;

                const style = getCardStyle(i, displayCards.length);

                return (
                    <motion.div
                        key={card.id}
                        layoutId={card.id}
                        className="absolute will-change-transform" // Performance hint
                        initial={false}
                        style={{
                            left: '50%',
                            marginLeft: isMobile ? '-30px' : '-45px', // Center the card execution context
                            top: '10px'
                        }}
                        animate={{
                            x: gameState === 'shuffling' ? [0, -10, 10, -5, 5, 0] : style.x,
                            y: gameState === 'shuffling' ? [0, 5, -5, 0] : style.y,
                            rotate: gameState === 'shuffling' ? [0, -5, 5, -3, 3, 0] : style.rotate,
                            zIndex: style.zIndex,
                            scale: gameState === 'shuffling' ? [1, 1.05, 0.95, 1.02, 1] : 1
                        }}
                        whileHover={isInteractive ? {
                            scale: 1.1,
                            y: style.y - 20,
                            zIndex: 100
                        } : {}}
                        transition={
                            gameState === 'shuffling'
                                ? { duration: 0.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                                : { type: "spring", stiffness: 200, damping: 25, mass: 0.5 } // Lighter physics
                        }
                        onClick={() => {
                            if (isInteractive) {
                                playSound('slide');
                                onCardPick(card.id);
                            }
                        }}
                    >
                        <TarotCard
                            id={card.id}
                            className="shadow-lg"
                            // Pass explicit small dimensions for the deck view to save pixel rendering
                            style={{
                                width: isMobile ? '80px' : '90px',
                                height: isMobile ? '135px' : '150px'
                            }}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default DeckComponent;
