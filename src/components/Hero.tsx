import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const videoRef = useRef(null);
  const video2Ref = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);

  const handleSearchClick = () => {
    navigate('/properties');
  };

  useEffect(() => {
    const video1 = videoRef.current;
    const video2 = video2Ref.current;

    // Crossfade logic for seamless looping
    const handleTimeUpdate = () => {
      const timeLeft = video1.duration - video1.currentTime;
      
      // Start crossfade 1 second before video ends
      if (timeLeft < 1 && timeLeft > 0) {
        const opacity = 1 - timeLeft;
        video2.style.opacity = opacity;
        
        // Start video2 if not playing
        if (video2.paused) {
          video2.currentTime = 0;
          video2.play();
        }
      }
    };

    const handleVideo1Ended = () => {
      video1.currentTime = 0;
      video1.play();
      video2.style.opacity = 0;
    };

    if (video1 && video2) {
      video1.addEventListener('timeupdate', handleTimeUpdate);
      video1.addEventListener('ended', handleVideo1Ended);
    }

    const ctx = gsap.context(() => {
      // Parallax effect on video container
      gsap.to(heroRef.current.querySelector('.video-container'), {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        scale: 1.2,
        ease: "none",
      });

      // Fade out content as you scroll down
      gsap.to(contentRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        opacity: 0,
        y: -100,
        ease: "none",
      });

      // Dimmer effect - text starts dim and brightens up letter by letter
      const headingLetters = headingRef.current.querySelectorAll('.letter');
      gsap.from(headingLetters, {
        opacity: 0.2,
        filter: "brightness(0.3)",
        stagger: 0.04,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.3,
      });

      // Subtitle dimmer effect
      gsap.from(subtitleRef.current, {
        opacity: 0.2,
        filter: "brightness(0.3)",
        duration: 1.2,
        ease: "power2.out",
        delay: 0.5,
      });

      // Subtle continuous floating animation on heading
      gsap.to(headingRef.current, {
        y: -10,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.8,
      });

      // Glowing text effect (subtle pulse)
      gsap.to(headingRef.current, {
        textShadow: "0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)",
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2.5,
      });

    }, heroRef);

    return () => {
      ctx.revert();
      if (video1) {
        video1.removeEventListener('timeupdate', handleTimeUpdate);
        video1.removeEventListener('ended', handleVideo1Ended);
      }
    };
  }, []);

  // Split text into individual letters for animation
  const splitText = (text) => {
    return text.split('').map((char, index) => (
      <span key={index} className="letter inline-block" style={{ display: 'inline-block' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <section 
      ref={heroRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Video with Crossfade */}
      <div className="absolute inset-0 z-0">
        <div className="video-container absolute inset-0 w-full h-full">
          {/* Primary video */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://res.cloudinary.com/dhwnr1pa5/video/upload/v1762179464/BIR_ktbna2.mp4" type="video/mp4" />
          </video>
          {/* Secondary video for crossfade */}
          <video
            ref={video2Ref}
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: 0 }}
          >
            <source src="https://res.cloudinary.com/dhwnr1pa5/video/upload/v1762179464/BIR_ktbna2.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="relative z-10 container mx-auto px-4 sm:px-6 text-center"
      >
        <h1 
        ref={headingRef}
        className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-[1.1] mt-20 md:mt-24 px-2 break-words text-balance"
        >
          {splitText('BAJA INTERNATIONAL REALTY')}
        </h1>
        <p 
          ref={subtitleRef}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-12 max-w-4xl mx-auto px-2"
        >
          Discover Your Dream Property in<br className="sm:hidden" /> Cabo San Lucas & Baja California Sur
        </p>

        {/* Call to Action Button */}
        <div className="flex justify-center items-center">
          <Button
            onClick={handleSearchClick}
            size="lg"
            className="h-14 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-12 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-blue-900/50 text-lg"
          >
            <Search className="w-6 h-6 mr-3" />
            Search Properties
          </Button>
        </div>

        {/* Key Features */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 md:p-6 border border-white/20">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">1850+</div>
            <div className="text-white/90 text-sm md:text-base">Properties Sold</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 md:p-6 border border-white/20">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">$800M+</div>
            <div className="text-white/90 text-sm md:text-base">In Sales</div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;