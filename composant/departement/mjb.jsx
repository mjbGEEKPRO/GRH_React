import React from "react";
import  { useState, useEffect } from 'react';


function SerdiFormationCarousel(){

    const [isLoaded, setIsLoaded] = useState(false);
      const [currentTime, setCurrentTime] = useState(new Date());
    
      useEffect(() => {
        setIsLoaded(true);
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
      }, []);
    
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
    
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          </div>
    
          {/* Header */}
          <header className="relative z-10 pt-8 pb-4">
            <nav className="max-w-7xl mx-auto px-6 flex justify-between items-center">
              <div className={`transform transition-all duration-1000 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Branding Académique 
                </div>
              </div>
              <div className={`transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                <div className="text-sm text-slate-300">
                  {currentTime.toLocaleTimeString('fr-FR')}
                </div>
              </div>
            </nav>
          </header>
    
          {/* Main content */}
          <main className="relative z-10 flex flex-1 items-center justify-center min-h-[80vh]">
            <div className="text-center max-w-4xl mx-auto px-6">
              {/* Main H1 with advanced animations */}
              <div className="relative">
                <h1 className={`text-6xl md:text-8xl font-bold mb-8 transform transition-all duration-1500 ease-out ${
                  isLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'
                }`}>
                  <span className="inline-block bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent animate-pulse">
                    Je M'APPEL MBA JOSEPH BENJAMIN
                  </span>
                  <br />
                  <span className={`inline-block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent transform transition-all duration-1500 delay-500 ${
                    isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
                  }`}>
                    Etudiant à L'ISSAM CMR 
                  </span>
                </h1>
    
                {/* Animated underline */}
                <div className={`h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent transform transition-all duration-2000 delay-1000 ${
                  isLoaded ? 'w-64 opacity-100' : 'w-0 opacity-0'
                } mx-auto mb-8`}></div>
              </div>
    
              {/* Subtitle */}
              <p className={`text-xl md:text-2xl text-slate-300 mb-12 transform transition-all duration-1500 delay-700 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                Excellence, Performance & Innovation
              </p>
    
              {/* Call to action buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1500 delay-1000 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:from-blue-500 hover:to-cyan-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                  <span className="relative z-10">Découvrir</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
                
                <button className="group px-8 py-4 border-2 border-slate-600 text-slate-300 font-semibold rounded-lg transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/5 hover:scale-105">
                  En savoir plus
                </button>
              </div>
            </div>
          </main>
    
          {/* Footer */}
          <footer className="relative z-10 pb-8">
            <div className="max-w-7xl mx-auto px-6">
              <div className={`flex flex-col sm:flex-row justify-between items-center text-slate-400 text-sm transform transition-all duration-1500 delay-1200 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div>© 2025 mjb. Tous droits réservés.</div>
                <div className="flex space-x-6 mt-4 sm:mt-0">
                  <a href="#" className="hover:text-blue-400 transition-colors duration-300">Contact</a>
                  <a href="#" className="hover:text-blue-400 transition-colors duration-300">À propos</a>
                  <a href="#" className="hover:text-blue-400 transition-colors duration-300">Services</a>
                </div>
              </div>
            </div>
          </footer>
    
          {/* Floating particles animation */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-blue-400/30 rounded-full animate-bounce`}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      );
}

export default SerdiFormationCarousel;