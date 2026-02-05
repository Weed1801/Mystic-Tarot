import { motion } from 'framer-motion';

const CardBack = () => (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-mystic-purple to-black border-2 border-mystic-gold/50 shadow-2xl flex items-center justify-center relative overflow-hidden backface-hidden">
        <div className="absolute inset-2 border border-mystic-gold/30 rounded-lg opacity-50"></div>
        <div className="w-12 h-12 rounded-full border-2 border-mystic-gold/40 flex items-center justify-center">
            <div className="w-8 h-8 rotate-45 border border-mystic-gold/40"></div>
        </div>
    </div>
);

const CardFront = ({ image, name }) => (
    <div className="w-full h-full rounded-xl bg-white border-2 border-mystic-gold shadow-2xl overflow-hidden relative backface-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center backdrop-blur-sm">
            <span className="text-mystic-gold font-serif text-sm uppercase tracking-wider">{name}</span>
        </div>
    </div>
);

const TarotCard = ({
    id,
    image,
    name,
    isRevealed = false,
    onClick,
    layoutId,
    style,
    className
}) => {
    return (
        <motion.div
            layoutId={layoutId}
            onClick={onClick}
            initial={false}
            animate={{ rotateY: isRevealed ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            style={{
                transformStyle: "preserve-3d",
                ...style
            }}
            className={`relative w-28 h-44 sm:w-32 sm:h-48 md:w-40 md:h-60 cursor-pointer ${className || ''}`}
        >
            <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                <CardBack />
            </div>
            <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                {image ? <CardFront image={image} name={name} /> : <CardBack />} {/* Fallback if no image yet */}
            </div>
        </motion.div>
    );
};

export default TarotCard;
