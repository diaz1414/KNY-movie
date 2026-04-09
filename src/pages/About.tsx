import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Shield className="text-netflix-red" size={32} />,
      title: "Secure Streaming",
      desc: "Your privacy is our priority. We use advanced encryption and high-speed global servers to ensure a safe viewing experience."
    },
    {
      icon: <Zap className="text-yellow-400" size={32} />,
      title: "Ultra High Speed",
      desc: "Experience zero-buffer streaming with our distributed edge networks. From 4K blockbusters to indie gems, speed is guaranteed."
    },
    {
      icon: <Globe className="text-blue-400" size={32} />,
      title: "Limitless Library",
      desc: "Access thousands of movies and series from across the globe, translated into your preferred language with high-quality subtitles."
    },
    {
      icon: <Heart className="text-pink-500" size={32} />,
      title: "User First",
      desc: "Designed for cinema lovers. Our distraction-free interface puts the focus exactly where it belongs: on the screen."
    }
  ];

  return (
    <PageLayout
      title="Our Vision"
      subtitle="KNY Movie is more than just a streaming platform. It's a gateway to limitless stories, powered by cutting-edge technology and a passion for cinema."
    >
      <div className="space-y-20">
        {/* Story Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-black font-outfit tracking-tighter">The KNY Story</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Founded in 2026, Kita Nonton Yuk (KNY) began with a simple mission: to democratize high-quality entertainment. We believed that everyone deserves access to the world's best cinematic experiences without compromise.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Today, KNY serves millions of users globally, delivering a premium standalone player experience that rivals the industry giants. We don't just host movies; we celebrate the art of storytelling.
            </p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-netflix-red to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <img
              src="logo.png"
              alt="Cinema experience"
              className="relative rounded-2xl w-full h-[400px] object-cover shadow-2xl"
            />
          </div>
        </section>

        {/* Features Grid */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-outfit tracking-tighter mb-4">Why KNY Stands Out</h2>
            <div className="w-24 h-1 bg-netflix-red mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default About;
