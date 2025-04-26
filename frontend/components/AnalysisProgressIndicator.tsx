import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader } from 'lucide-react'; // Using lucide icons

interface AnalysisProgressIndicatorProps {
  stages: string[];
  currentStageIndex: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger animation for each item
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function AnalysisProgressIndicator({
  stages,
  currentStageIndex,
}: AnalysisProgressIndicatorProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white text-center">
        Analyzing Property...
      </h3>
      <motion.ul
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isPending = index > currentStageIndex;

          return (
            <motion.li
              key={stage}
              className="flex items-center text-sm"
              variants={itemVariants}
            >
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    key="completed"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-5 h-5 mr-3 flex-shrink-0"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                ) : isCurrent ? (
                  <motion.div
                    key="current"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-5 h-5 mr-3 flex-shrink-0"
                  >
                    <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="pending"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-5 h-5 mr-3 flex-shrink-0"
                  >
                    <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-500 rounded-full"></div>
                  </motion.div>
                )}
              </AnimatePresence>
              <span
                className={`
                  ${isCompleted ? 'text-green-600 dark:text-green-400 line-through' : ''}
                  ${isCurrent ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}
                  ${isPending ? 'text-slate-400 dark:text-slate-500' : ''}
                `}
              >
                {stage}
              </span>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
