import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "right center" }}
      className="fixed top-0 inset-x-0 z-[60] h-[3px] bg-gradient-to-l from-accent via-accent to-accent/60 shadow-[0_0_12px_hsl(var(--accent)/0.6)]"
    />
  );
};

export { ScrollProgress };
