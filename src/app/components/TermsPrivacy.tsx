import { ArrowLeft, Shield, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function TermsPrivacy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="px-6 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2} />
                    </button>
                    <h1 className="text-2xl font-bold text-foreground">Terms & Privacy</h1>
                </div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Privacy Policy</h2>
                        </div>
                        <div className="text-sm text-secondary space-y-3 leading-relaxed">
                            <p>
                                At PaperStack, we take your privacy seriously. We collect minimal data necessary to provide you with the best study experience.
                            </p>
                            <p>
                                <strong>Data we collect:</strong> Your name, email, department, level, and interaction data (like bookmarks and study history) to personalize your feed.
                            </p>
                            <p>
                                We do not sell or share your personal data with third parties.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card border border-border rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Terms of Use</h2>
                        </div>
                        <div className="text-sm text-secondary space-y-3 leading-relaxed">
                            <p>
                                By using PaperStack, you agree to use the platform for educational purposes only.
                            </p>
                            <p>
                                <strong>Content:</strong> Past questions and materials are sourced from the university community. We strive for accuracy but cannot guarantee 100% correctness of all solutions.
                            </p>
                            <p>
                                <strong>Conduct:</strong> Users must not upload malicious content or harass other community members.
                            </p>
                        </div>
                    </motion.div>

                    <div className="text-center text-xs text-secondary pt-8">
                        Last updated: February 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
