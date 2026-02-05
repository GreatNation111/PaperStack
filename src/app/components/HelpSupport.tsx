import { ArrowLeft, Mail, Phone, MessageCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function HelpSupport() {
    const navigate = useNavigate();

    const handleWhatsApp = () => {
        window.open('https://wa.me/2349151782993', '_blank');
    };

    const handleEmail = () => {
        window.location.href = 'mailto:babalolagreatnation@gmail.com';
    };

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
                    <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-6 mb-6 text-center"
                >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HelpCircle className="w-8 h-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">How can we help?</h2>
                    <p className="text-secondary text-sm mb-6">
                        Have a question, feedback, or found a bug? We'd love to hear from you.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={handleWhatsApp}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-[#25D366]/10 text-[#25D366] rounded-xl font-semibold hover:bg-[#25D366]/20 transition-all"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Chat on WhatsApp
                        </button>
                        <button
                            onClick={handleEmail}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all"
                        >
                            <Mail className="w-5 h-5" />
                            Send an Email
                        </button>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Frequently Asked Questions</h3>
                    {[
                        { q: "How do I become a contributor?", a: "Go to your Profile and click 'Become a Contributor'. You'll be directed to chat with us on WhatsApp to get started." },
                        { q: "Is the app free?", a: "PaperStack is free to start. We offer a Premium plan for students who want unlimited access to advanced features." },
                        { q: "How can I report a wrong answer?", a: "Please take a screenshot and send it to us via WhatsApp or Email. We appreciate your help!" }
                    ].map((item, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-4">
                            <h4 className="font-semibold text-foreground mb-2">{item.q}</h4>
                            <p className="text-sm text-secondary leading-relaxed">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
