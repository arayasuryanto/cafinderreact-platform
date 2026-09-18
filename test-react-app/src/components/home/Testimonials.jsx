import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Make sure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

// Honest numbers only: counts come from the app's own live dataset.
const STATS = [
  { id: 1, value: '416+', label: 'cafe di Surabaya sudah terdata' },
  { id: 2, value: '5', label: 'wilayah resmi Surabaya dijelajahi' },
  { id: 3, value: '100%', label: 'gratis — tanpa perlu login' },
];

const FeaturedReviewers = () => {
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    // Animate heading
    gsap.to(headingRef.current, {
      scrollTrigger: {
        trigger: headingRef.current,
        start: "top 80%"
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out"
    });

    // Animate description
    gsap.to(descriptionRef.current, {
      scrollTrigger: {
        trigger: descriptionRef.current,
        start: "top 80%"
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2
    });

    // Animate stat cards with stagger
    gsap.to(".reviewer-card", {
      scrollTrigger: {
        trigger: ".reviewers-slider",
        start: "top 80%"
      },
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "back.out(1.2)"
    });
  }, []);

  return (
    <section className="featured-reviewers">
      <div className="container">
        <div className="reviewers-heading">
          <h2 ref={headingRef}>
            <span className="rank-icon">☕</span>
            Cafinder dalam Angka
          </h2>
          <p ref={descriptionRef}>
            Data cafe asli dari Surabaya, terus kami rawat agar kamu selalu punya spot nongkrong berikutnya
          </p>
        </div>

        <div className="reviewers-slider" ref={descriptionRef}>
          <div className="reviewers-track">
            {STATS.map((stat) => (
              <div className="reviewer-card" key={stat.id}>
                <div className="reviewer-info">
                  <div className="review-stats">
                    <span className="review-count">{stat.value}</span>
                  </div>
                  <h3 className="reviewer-name">{stat.label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedReviewers;
