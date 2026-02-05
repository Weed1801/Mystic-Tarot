import { motion } from 'framer-motion';
import TarotCard from './TarotCard';
import { useState, useEffect } from 'react';
import { useSound } from '../../contexts/SoundContext';

const DeckComponent = ({ gameState, onCardPick, cards = [], selectedCards = [] }) => {
    const { playSound } = useSound();
    // Generate a visual subset of cards for the deck/fan animation
    const [displayCards, setDisplayCards] = useState([]);

    useEffect(() => {
        if (cards.length > 0) {
            setDisplayCards(cards.map((c, i) => ({ ...c, index: i, zIndex: i })));
        } else {
            // Fallback
            const fallback = Array.from({ length: 24 }, (_, i) => ({ id: `deck-card-${i}`, index: i }));
            setDisplayCards(fallback);
        }
    }, [cards]);

    // Fan Animation Variants
    const getCardStyle = (index, total) => {
        if (gameState === 'fanning' || gameState === 'picking') {
            const spreadAngle = 120; // Total angle of the fan
            const startAngle = -spreadAngle / 2;
            const angleStep = spreadAngle / (total - 1);
            const rotate = startAngle + index * angleStep;

            // Calculate X/Y based on arc
            const radius = 400; // Radius of the arc circle
            const radian = (rotate * Math.PI) / 180;
            const x = Math.sin(radian) * radius * 0.6; // Scale down horizontal spread
            const y = Math.cos(radian) * -radius * 0.2 + 50; // Flatten the arc slightly

            return {
                x,
                y,
                rotate,
                zIndex: index,
            };
        }

        // Stacked state
        return {
            x: 0,
            y: index * -0.5, // Slight stack offset
            rotate: index % 2 === 0 ? 1 : -1, // Imperfect stack
            zIndex: index,
        };
    };

    const isInteractive = gameState === 'picking';

    return (
        <div className={`relative h-64 flex justify-center items-center transition-all duration-500 ${gameState === 'picking' ? 'w-full max-w-4xl' : 'w-40'}`}>
            {displayCards.map((card, i) => {
                if (selectedCards.some(s => s.id === card.id)) return null;
                const style = getCardStyle(i, displayCards.length);

                return (
                    <motion.div
                        key={card.id}
                        layoutId={card.id}
                        className="absolute"
                        initial={false}
                        animate={{
                            x: gameState === 'shuffling' ? [0, -10, 10, -5, 5, 0] : style.x,
                            y: gameState === 'shuffling' ? [0, 5, -5, 0] : style.y,
                            rotate: gameState === 'shuffling' ? [0, -5, 5, -3, 3, 0] : style.rotate,
                            zIndex: style.zIndex,
                            scale: gameState === 'shuffling' ? [1, 1.05, 0.95, 1.02, 1] : 1
                        }}
                        whileHover={isInteractive ? {
                            scale: 1.2,
                            y: style.y - 30,
                            zIndex: 100
                        } : {}}
                        transition={
                            gameState === 'shuffling'
                                ? {
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut"
                                }
                                : {
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: i * 0.02 // Stagger effect
                                }
                        }
                        onClick={() => {
                            if (isInteractive) {
                                playSound('slide');
                                onCardPick(card.id);
                            }
                        }}
                    >
                        {/* We pass a stripped down simplified card here for deck view */}
                        <TarotCard
                            id={card.id}
                            className="shadow-xl"
                            style={{
                                width: gameState === 'picking' || gameState === 'fanning' ? '80px' : undefined,
                                height: gameState === 'picking' || gameState === 'fanning' ? '120px' : undefined
                            }}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default DeckComponent;
