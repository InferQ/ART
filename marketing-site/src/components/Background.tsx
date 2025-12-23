import { motion, useScroll, useTransform } from 'framer-motion';

interface BackgroundProps {
  scrollY: any;
}

export default function Background({ scrollY }: BackgroundProps) {
  const parallax1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const parallax2 = useTransform(scrollY, [0, 1000], [0, 150]);
  const parallax3 = useTransform(scrollY, [0, 1000], [0, -100]);

  const opacity1 = useTransform(scrollY, [0, 500], [0.3, 0.1]);
  const opacity2 = useTransform(scrollY, [0, 500], [0.2, 0.05]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <motion.div style={{ y: parallax1, opacity: opacity1 }}>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[150px] animate-pulse-glow" />
      </motion.div>

      <motion.div style={{ y: parallax2, opacity: opacity2 }}>
        <div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[150px] animate-pulse-glow"
          style={{ animationDelay: '1s' }}
        />
      </motion.div>

      <motion.div style={{ y: parallax3, opacity: opacity2 }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[150px] animate-pulse-glow"
          style={{ animationDelay: '2s' }}
        />
      </motion.div>

      <motion.div
        style={{ y: useTransform(scrollY, [0, 1000], [0, 100]) }}
        className="absolute inset-0 opacity-[0.03]"
      >
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </motion.div>

      <motion.div
        style={{ y: useTransform(scrollY, [0, 1000], [0, -50]) }}
        className="absolute inset-0 opacity-[0.02]"
      >
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"
        style={{
          y: useTransform(scrollY, [0, 2000], [0, 500]),
          opacity: useTransform(scrollY, [0, 500, 1500], [0, 0.5, 0]),
        }}
      />
    </div>
  );
}
