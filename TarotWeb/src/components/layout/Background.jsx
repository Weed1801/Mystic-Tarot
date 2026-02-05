import { motion } from 'framer-motion';

const Background = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-gradient-to-b from-mystic-dark via-mystic-purple to-mystic-deep">
            {/* Subtle Stars/Dust Animation */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full opacity-20"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        scale: Math.random() * 0.5 + 0.5,
                    }}
                    animate={{
                        y: [null, Math.random() * -100],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        width: Math.random() * 4 + 1 + 'px',
                        height: Math.random() * 4 + 1 + 'px',
                    }}
                />
            ))}

            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-mystic-gold/10 blur-[100px] rounded-full pointer-events-none" />
        </div>
    );
};

export default Background;
