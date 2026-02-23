import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function TermsOfService() {
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
          <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Agreement</h2>
          </div>

          <div className="text-sm text-secondary space-y-4 leading-relaxed">
            <p>
              By using PaperStack ("the Service"), you agree to these terms. If you do not agree, do not use the Service.
            </p>

            <h3 className="text-foreground font-semibold">Acceptable Use</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Use the Service for educational and lawful purposes only</li>
              <li>Do not upload unlawful, harmful, or infringing content</li>
              <li>Do not attempt to disrupt or reverse engineer the Service</li>
            </ul>

            <h3 className="text-foreground font-semibold">Content and Ownership</h3>
            <p>
              Past questions and materials are provided "as is" for study purposes. We do not guarantee accuracy or completeness.
            </p>

            <h3 className="text-foreground font-semibold">Accounts</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account and for all activities under your account.
            </p>

            <h3 className="text-foreground font-semibold">Termination</h3>
            <p>
              We may suspend or terminate access if you violate these terms or misuse the Service.
            </p>

            <h3 className="text-foreground font-semibold">Changes</h3>
            <p>
              We may update these terms from time to time. Continued use indicates acceptance of the updated terms.
            </p>

            <h3 className="text-foreground font-semibold">Contact</h3>
            <p>
              For questions, contact: <a className="text-primary underline" href="mailto:papers-stack@vercel.app">papers-stack@vercel.app</a>
            </p>

            <p className="text-xs text-secondary mt-6">Last updated: February 2026</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
