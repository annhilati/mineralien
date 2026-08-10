'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ease: 'easeOut', duration: 0.3 }}
            style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
        >
            {children}
        </motion.div>
    );
}
