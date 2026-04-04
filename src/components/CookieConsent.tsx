import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "cookie_consent";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50"
        >
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-foreground">
                    ملفات تعريف الارتباط
                  </h3>
                  <button
                    onClick={decline}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. يمكنك
                  الاطلاع على{" "}
                  <Link
                    to="/cookies"
                    className="text-accent underline underline-offset-2 hover:text-accent/80"
                  >
                    سياسة ملفات تعريف الارتباط
                  </Link>{" "}
                  لمعرفة المزيد.
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={accept} className="flex-1 text-xs">
                    قبول الكل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={decline}
                    className="flex-1 text-xs"
                  >
                    رفض
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
