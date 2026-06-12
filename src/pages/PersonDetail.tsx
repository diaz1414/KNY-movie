import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Star, Film, Tv, User, ExternalLink } from 'lucide-react';
import { movieService, type PersonDetail, type UnifiedMovie } from '../services/api';
import NetflixLoader from '../components/NetflixLoader';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieModal from '../components/MovieModal';

const PersonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
      movieService.getPersonDetail(id).then((data) => {
        setPerson(data);
        setLoading(false);
      });
    }
  }, [id]);

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const calculateAge = (birthday: string | null, deathday: string | null) => {
    if (!birthday) return null;
    const end = deathday ? new Date(deathday) : new Date();
    const birth = new Date(birthday);
    return Math.floor((end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <NetflixLoader fullScreen />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-6 text-white">
        <User size={64} className="text-white/20" />
        <h2 className="text-2xl font-black">Aktor tidak ditemukan</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-netflix-red rounded-xl font-bold">
          Kembali
        </button>
      </div>
    );
  }

  const age = calculateAge(person.birthday, person.deathday);
  const movies = person.credits.filter(c => c.type === 'movie');
  const series = person.credits.filter(c => c.type === 'series');

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      {/* Hero Backdrop (blurred profile photo) */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {person.profilePath && (
          <>
            <img
              src={person.profilePath.replace('w500', 'original')}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-top scale-110 blur-sm opacity-20"
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/40 to-transparent" />

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 md:left-12 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-sm font-bold transition-all hover:scale-105"
        >
          <ArrowLeft size={16} />
          Kembali
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="relative -mt-40 md:-mt-52 px-6 md:px-12 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">

          {/* Left Column — Photo + Meta */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:w-72 shrink-0"
          >
            {/* Profile Photo */}
            <div className="relative mx-auto md:mx-0 w-48 md:w-full aspect-[2/3] rounded-3xl overflow-hidden border-2 border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] mb-8">
              <img
                src={person.profilePath || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=1a1a1a&color=E50914&bold=true&size=400`}
                alt={person.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />
            </div>

            {/* Meta Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[4px] text-netflix-red/80">Dikenal Sebagai</p>
                <p className="text-white font-bold text-base">{person.knownFor}</p>
              </div>

              {person.birthday && (
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[4px] text-white/40 flex items-center gap-1.5">
                    <Calendar size={10} /> Lahir
                  </p>
                  <p className="text-white/80 font-bold text-sm">
                    {formatDate(person.birthday)}
                    {age && !person.deathday && <span className="text-white/40 ml-2 font-normal">({age} tahun)</span>}
                  </p>
                </div>
              )}

              {person.deathday && (
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[4px] text-white/40 flex items-center gap-1.5">
                    <Calendar size={10} /> Wafat
                  </p>
                  <p className="text-white/80 font-bold text-sm">
                    {formatDate(person.deathday)}
                    {age && <span className="text-white/40 ml-2 font-normal">({age} tahun)</span>}
                  </p>
                </div>
              )}

              {person.placeOfBirth && (
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[4px] text-white/40 flex items-center gap-1.5">
                    <MapPin size={10} /> Tempat Lahir
                  </p>
                  <p className="text-white/80 font-bold text-sm">{person.placeOfBirth}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[4px] text-white/40 flex items-center gap-1.5">
                  <Star size={10} /> Total Karya
                </p>
                <p className="text-white font-black text-2xl">{person.credits.length}</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column — Name, Bio, Filmografi */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 space-y-12"
          >
            {/* Name & Title */}
            <div className="space-y-3 pt-4 md:pt-16">
              <p className="text-netflix-red text-xs font-black uppercase tracking-[6px]">
                {person.knownFor}
              </p>
              <h1 className="text-5xl md:text-7xl font-black font-outfit tracking-tighter leading-none text-white">
                {person.name}
              </h1>
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[5px] text-white/40 flex items-center gap-3">
                  Biografi <div className="h-px flex-1 bg-white/5" />
                </h3>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={bioExpanded ? 'expanded' : 'collapsed'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={`text-zinc-300 text-base md:text-lg leading-relaxed font-outfit ${!bioExpanded ? 'line-clamp-5' : ''}`}>
                      {person.biography}
                    </p>
                  </motion.div>
                </AnimatePresence>
                {person.biography.length > 400 && (
                  <button
                    onClick={() => setBioExpanded(!bioExpanded)}
                    className="text-netflix-red text-sm font-black uppercase tracking-wider hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    {bioExpanded ? 'Tampilkan Lebih Sedikit' : 'Baca Selengkapnya'}
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Movies */}
            {movies.length > 0 && (
              <FilmographySection
                title="Film"
                icon={<Film size={14} />}
                items={movies}
                onSelect={setSelectedMovieId}
              />
            )}

            {/* Series */}
            {series.length > 0 && (
              <FilmographySection
                title="Series"
                icon={<Tv size={14} />}
                items={series}
                onSelect={setSelectedMovieId}
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Movie Modal */}
      <MovieModal
        movieId={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />

      <Footer />
    </div>
  );
};

// --- Filmography Grid Section ---
const FilmographySection: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: UnifiedMovie[];
  onSelect: (id: string) => void;
}> = ({ title, icon, items, onSelect }) => (
  <div className="space-y-6">
    <h3 className="text-[10px] font-black uppercase tracking-[5px] text-white/40 flex items-center gap-3">
      <span className="text-netflix-red">{icon}</span>
      {title} <span className="text-netflix-red font-black">({items.length})</span>
      <div className="h-px flex-1 bg-white/5" />
    </h3>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4 gap-y-8">
      {items.map((item, idx) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 * idx }}
          onClick={() => onSelect(item.id)}
          className="group text-left"
        >
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 border border-white/5 group-hover:border-netflix-red/50 transition-all duration-300 shadow-lg">
            <img
              src={item.poster}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <div className="flex items-center justify-center mb-2">
                <div className="w-9 h-9 rounded-full bg-netflix-red flex items-center justify-center">
                  <Play fill="white" size={14} className="ml-0.5" />
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-yellow-400 text-[9px] font-black">
              <Star size={8} fill="currentColor" />
              {item.rating}
            </div>
          </div>
          <p className="text-white/80 font-bold text-[10px] md:text-xs truncate group-hover:text-netflix-red transition-colors leading-snug">
            {item.title}
          </p>
        </motion.button>
      ))}
    </div>
  </div>
);

// Local Play import
const Play = ({ fill, size, className }: { fill?: string; size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} className={className}>
    <polygon points="5,3 19,12 5,21" fill={fill || 'currentColor'} />
  </svg>
);

export default PersonDetailPage;
