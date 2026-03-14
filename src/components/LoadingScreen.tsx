import { motion } from "framer-motion";
import brandLogo from "@/assets/brand-identity.png";

const LoadingScreen = () => (
  <div className="fixed inset-0 z-[200] bg-primary flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.img
        src={brandLogo}
        alt="Brand Identity"
        className="h-16 mx-auto mb-4 brightness-0 invert"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div className="w-32 h-1 bg-primary-foreground/20 rounded-full mx-auto overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  </div>
);

export default LoadingScreen;