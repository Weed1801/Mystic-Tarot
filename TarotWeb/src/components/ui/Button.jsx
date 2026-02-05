import { motion } from 'framer-motion';

const Button = ({ children, onClick, className = '', variant = 'primary' }) => {
    const baseStyles = "px-6 py-3 rounded-full font-serif text-lg tracking-wide transition-all duration-300 relative overflow-hidden group";

    const variants = {
        primary: "bg-mystic-gold text-white hover:bg-red-600 shadow-[0_0_15px_rgba(233,69,96,0.3)] hover:shadow-[0_0_25px_rgba(233,69,96,0.6)]",
        secondary: "border border-mystic-gold text-mystic-gold hover:bg-mystic-gold/10",
        icon: "p-3 rounded-full bg-mystic-purple border border-white/10 hover:border-mystic-gold/50"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.button>
    );
};

export default Button;
