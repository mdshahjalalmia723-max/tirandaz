import React from 'react';
import { X, Target, Wind, ShieldAlert, Award, Move } from 'lucide-react';

interface HowToPlayModalProps {
  lang: 'bn' | 'en';
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ lang, onClose }) => {
  const isBn = lang === 'bn';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Target className="w-6 h-6 text-amber-400" />
            <h2 className="font-cinzel text-xl md:text-2xl font-bold text-amber-300">
              {isBn ? 'গেম খেলার নিয়মাবলি' : 'How to Play'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="my-6 space-y-5 text-sm text-slate-300">
          {/* Aim & Shoot */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1.5">
              <Move className="w-4 h-4" />
              <span>{isBn ? '১. নিশানা ও তীর নিক্ষেপ' : '1. Aim & Release'}</span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm">
              {isBn
                ? 'স্ক্রিনে বা ধনুর উপর মাউস অথবা আঙুল দিয়ে স্পর্শ করে পেছনের দিকে টানুন (Pull back)। টানার সাথে সাথে তীরের গতিপথের ডট লাইন (Trajectory) দেখা যাবে। নিশানা ঠিক হলে ছেড়ে দিন।'
                : 'Touch or click and drag backwards from the bow to draw string tension. A trajectory guide arc will appear. Release to fire the arrow with projectile physics.'}
            </p>
          </div>

          {/* Targets & Shapes */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="flex items-center gap-2 text-amber-300 font-semibold mb-2">
              <Award className="w-4 h-4" />
              <span>{isBn ? '২. বিভিন্ন আকৃতির লক্ষ্যবস্তু ও পয়েন্ট' : '2. Target Types & Points'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-amber-400 block">{isBn ? 'বুলসআই টার্গেট' : 'Bullseye'}</span>
                <span className="text-slate-400">{isBn ? '১০ থেকে ৫০ পয়েন্ট (কেন্দ্রে বোনাস)' : '10-50 pts (+50 center bonus)'}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-red-400 block">{isBn ? 'লাল আপেল' : 'Red Apple'}</span>
                <span className="text-slate-400">{isBn ? '৮০ - ১৫০ পয়েন্ট (ক্ষুদ্র লক্ষ্য)' : '80-150 pts (small size)'}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-yellow-400 block">{isBn ? 'স্বর্ণের ঘণ্টা' : 'Golden Bell'}</span>
                <span className="text-slate-400">{isBn ? '৮৫ - ১১০ পয়েন্ট (দুলন্ত)' : '85-110 pts (pendulum)'}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-pink-400 block">{isBn ? 'ভাসমান বেলুন' : 'Drifting Balloon'}</span>
                <span className="text-slate-400">{isBn ? '৭০ - ৯০ পয়েন্ট (ঢেউয়ের মতো)' : '70-90 pts (sine wave)'}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-blue-400 block">{isBn ? 'যোদ্ধা ঢাল' : 'Knight Shield'}</span>
                <span className="text-slate-400">{isBn ? '৬০ - ৮০ পয়েন্ট' : '60-80 pts'}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-amber-300 block">{isBn ? 'উজ্জ্বল তারা' : 'Royal Star'}</span>
                <span className="text-slate-400">{isBn ? '১০০ - ১৬০ পয়েন্ট (বোনাস)' : '100-160 pts (rare bonus)'}</span>
              </div>
            </div>
          </div>

          {/* Obstacles & Moving Barriers */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>{isBn ? '৩. দেয়াল ও চলমান বাধা' : '3. Walls & Moving Barriers'}</span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm">
              {isBn
                ? 'পাথরের দেয়াল, কাঠের বেড়া ও উপরে-নিচে চলমান লোহার ফটক তীরের পথ আটকে দেয়। তীরের আঘাতে বাধা লাগলে তীর বিনষ্ট হবে। টাইমিং বুঝে ফাঁকা সময়ে তীর নিক্ষেপ করুন!'
                : 'Stone castle walls, wooden barriers, and moving iron portcullis gates block arrows. Time your shots carefully through the openings!'}
            </p>
          </div>

          {/* Wind & 40 Levels */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1.5">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>{isBn ? '৪. বাতাসের প্রভাব ও ৪০টি ক্রমবর্ধনশীল লেভেল' : '4. Wind & 40 Progressive Levels'}</span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm">
              {isBn
                ? 'উচ্চতর লেভেলে বাতাসের গতি ও দিক লক্ষ্য করুন (HUD-এ প্রদর্শিত)। বাতাস তীরকে ডানে বা বামে ঠেলে দেয়। প্রতিটি লেভেলে লক্ষ্যবস্তুর গতি বাড়বে, আকার ছোট হবে এবং ৪-৫টি পর্যন্ত লক্ষ্য থাকবে!'
                : 'Pay attention to the wind gauge at higher levels. Wind blows arrows left or right. Across the 40 levels, target speed increases, target radius shrinks, and 4-5 dynamic targets await!'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors"
          >
            {isBn ? 'বুঝেছি, খেলা শুরু হোক!' : 'Got it, let’s play!'}
          </button>
        </div>
      </div>
    </div>
  );
};
