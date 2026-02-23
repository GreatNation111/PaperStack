import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function PrivacyPolicy() {
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
          <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Your Privacy Matters</h2>
          </div>

          <div className="text-sm text-secondary space-y-4 leading-relaxed">
            <p>
              PaperStack ("we", "us", "our") provides a study platform that curates past examination
              questions and related study resources. This policy describes how we collect, use, and protect
              your information when you use our services.
            </p>

            <h3 className="text-foreground font-semibold">Information We Collect</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Account data: name, email, department, level</li>
              <li>Usage data: bookmarks, recently viewed content, and in-app interactions</li>
            </ul>

            <h3 className="text-foreground font-semibold">How We Use Information</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>To provide and personalize your study experience</li>
              <li>To improve content quality and platform reliability</li>
              <li>To communicate service updates and important notices</li>
            </ul>

            <h3 className="text-foreground font-semibold">Data Sharing</h3>
            <p>
              We do not sell your personal data. We may share limited data with service providers strictly to
              operate core features (e.g., authentication, hosting), bound by confidentiality obligations.
            </p>

            <h3 className="text-foreground font-semibold">Security</h3>
            <p>
              We implement reasonable technical and organizational measures to protect your data. However, no
              method of transmission over the internet is 100% secure.
            </p>

            <h3 className="text-foreground font-semibold">Your Choices</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>You can access and update your profile information in the app</li>
              <li>You can request deletion of your account and personal data by contacting support</li>
            </ul>

            <h3 className="text-foreground font-semibold">Contact</h3>
            <p>
              For privacy questions or requests, contact: <a className="text-primary underline" href="mailto:papers-stack@vercel.app">papers-stack@vercel.app</a>
            </p>

            <p className="text-xs text-secondary mt-6">Last updated: February 2026</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
