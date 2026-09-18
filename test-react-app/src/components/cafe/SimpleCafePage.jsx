import React, { useEffect, useState } from 'react';
import './SimpleCafePage.css'; // Use our new CSS file
import ReviewModal from '../reviews/ReviewModal';
import ReviewList from '../reviews/ReviewList';

const PLACEHOLDER_IMAGE = '/images/placeholder-cafe.svg';

// Translate weekday keys from the data into Indonesian
const DAY_NAMES_ID = {
  Monday: 'Senin',
  Tuesday: 'Selasa',
  Wednesday: 'Rabu',
  Thursday: 'Kamis',
  Friday: 'Jumat',
  Saturday: 'Sabtu',
  Sunday: 'Minggu',
};

// The raw data nests hours as {day, hours: {day, hours: "4 PM to 10 PM"}}.
// Flatten any entry to its display string (or null when unknown).
const normalizeHoursEntry = (entry) => {
  if (!entry) return null;
  let value = entry.hours;
  if (value && typeof value === 'object') value = value.hours;
  return typeof value === 'string' ? value : null;
};

// Convert "4 PM to 10 PM" into "16.00–22.00" (Indonesian convention)
const formatHoursText = (hoursText) => {
  if (!hoursText) return null;
  const match = hoursText.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*(?:to|-|–)\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return hoursText;
  const to24 = (h, ap) => {
    let hour = parseInt(h, 10) % 12;
    if (ap.toUpperCase() === 'PM') hour += 12;
    return `${String(hour).padStart(2, '0')}.00`;
  };
  return `${to24(match[1], match[3])}–${to24(match[4], match[6])}`;
};

const formatEntryForDisplay = (entry) => {
  const value = normalizeHoursEntry(entry);
  if (value === null) return null;
  if (value === 'Closed' || value.toLowerCase() === 'closed') return 'Tutup';
  return formatHoursText(value) || value;
};

// Helper function to get the appropriate icon for each facility
const getFacilityIcon = (feature) => {
  // Clean up the feature name for better matching
  const cleanFeature = feature.trim();
  
  const iconMap = {
    // WiFi icons
    "WiFi": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 9L3 11C7.97 6.03 16.03 6.03 21 11L23 9C16.93 2.93 7.08 2.93 1 9ZM9 17L12 20L15 17C13.35 15.34 10.66 15.34 9 17ZM5 13L7 15C9.76 12.24 14.24 12.24 17 15L19 13C15.14 9.14 8.87 9.14 5 13Z" fill="currentColor"/>
      </svg>
    ),
    "Free WiFi": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 9L3 11C7.97 6.03 16.03 6.03 21 11L23 9C16.93 2.93 7.08 2.93 1 9ZM9 17L12 20L15 17C13.35 15.34 10.66 15.34 9 17ZM5 13L7 15C9.76 12.24 14.24 12.24 17 15L19 13C15.14 9.14 8.87 9.14 5 13Z" fill="currentColor"/>
      </svg>
    ),
    
    // Power outlet icon
    "Power Outlets": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 9V14H18V9H16ZM10 9V14H12V9H10ZM8 6H16C17.1 6 18 6.9 18 8H20C20 5.79 18.21 4 16 4H8C5.79 4 4 5.79 4 8H6C6 6.9 6.9 6 8 6ZM10 4V2H14V4H10ZM20 18C20 19.1 19.1 20 18 20V22H6V20C4.9 20 4 19.1 4 18V15H20V18ZM22 15H2V18C2 20.21 3.79 22 6 22H18C20.21 22 22 20.21 22 18V15Z" fill="currentColor"/>
      </svg>
    ),
    
    // Air conditioning icon
    "Air Conditioning": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 11H17.83L21.07 7.76L19.66 6.34L15 11H13V9L17.66 4.34L16.24 2.93L13 6.17V2H11V6.17L7.76 2.93L6.34 4.34L11 9V11H9L4.34 6.34L2.93 7.76L6.17 11H2V13H6.17L2.93 16.24L4.34 17.66L9 13H11V15L6.34 19.66L7.76 21.07L11 17.83V22H13V17.83L16.24 21.07L17.66 19.66L13 15V13H15L19.66 17.66L21.07 16.24L17.83 13H22V11Z" fill="currentColor"/>
      </svg>
    ),
    "AC": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 11H17.83L21.07 7.76L19.66 6.34L15 11H13V9L17.66 4.34L16.24 2.93L13 6.17V2H11V6.17L7.76 2.93L6.34 4.34L11 9V11H9L4.34 6.34L2.93 7.76L6.17 11H2V13H6.17L2.93 16.24L4.34 17.66L9 13H11V15L6.34 19.66L7.76 21.07L11 17.83V22H13V17.83L16.24 21.07L17.66 19.66L13 15V13H15L19.66 17.66L21.07 16.24L17.83 13H22V11Z" fill="currentColor"/>
      </svg>
    ),
    
    // Smoking area icon
    "Smoking Area": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 16H17V19H2V16ZM20.5 16H22V19H20.5V16ZM18 16H19.5V19H18V16ZM18.85 7.73C19.47 7.12 19.85 6.28 19.85 5.35C19.85 3.5 18.35 2 16.5 2V3.5C17.5 3.5 18.35 4.35 18.35 5.35C18.35 6.35 17.5 7.2 16.5 7.2V8.7C18.74 8.7 20.5 10.45 20.5 12.7V15H22V12.7C22 9.89 20.12 7.5 17.5 7.04C17.95 6.55 18.26 5.97 18.44 5.35C18.65 4.62 18.74 3.81 18.85 3C19.17 3 19.5 3.33 19.5 3.75L19.89 3.06C19.72 2.03 18.81 1.26 17.76 1.06C17.55 1.03 17.36 1 17.15 1C16.19 1 15.29 1.39 14.66 2.07C14.02 2.76 13.66 3.74 13.66 4.75C13.66 3.75 13.33 2.81 12.66 2.11C12 1.41 11.05 1 10.05 1C9.04 1 8.09 1.41 7.42 2.11C6.76 2.81 6.42 3.75 6.42 4.75C6.42 3.04 5.08 1.67 3.37 1.63C3.28 1.63 3.19 1.63 3.09 1.63C2.01 1.73 1.05 2.45 0.65 3.47L1.04 4.16C1.05 4.14 1.06 4.12 1.07 4.1C1.25 3.67 1.65 3.38 2.08 3.33C2.9 3.23 3.68 3.88 3.68 4.7C3.68 3.74 3.34 2.81 2.68 2.11C2.01 1.41 1.06 1 0.05 1L0 2.5C0.83 2.5 1.5 3.17 1.5 4C1.5 4.83 0.83 5.5 0 5.5L0 7C1.1 7 2 7.9 2 9V15H3.5V9C3.5 8.28 3.14 7.65 2.58 7.28C3.06 7.7 3.71 7.91 4.37 7.86C5.67 7.76 6.68 6.66 6.68 5.36C6.68 6.36 7.01 7.29 7.68 7.99C8.34 8.7 9.3 9.11 10.3 9.11C11.31 9.11 12.26 8.7 12.93 7.99C13.6 7.29 13.93 6.36 13.93 5.36C13.93 6.36 14.27 7.29 14.93 7.99C15.6 8.7 16.56 9.11 17.56 9.11V7.61C17.05 7.61 16.57 7.39 16.23 7.03C15.86 6.65 15.64 6.15 15.64 5.62C15.64 5.15 15.84 4.62 16.21 4.26C16.56 3.91 17.07 3.71 17.56 3.71V2.21C17.05 2.21 16.56 2 16.23 1.64C15.86 1.25 15.64 0.76 15.64 0.22L14.14 0.27C14.13 1.29 14.5 2.25 15.2 2.97C15.39 3.17 15.61 3.34 15.84 3.47C15.4 3.88 15.14 4.43 15.14 5.06C15.14 4 14.77 3.03 14.07 2.31C13.37 1.6 12.4 1.21 11.36 1.21C11.17 1.21 10.99 1.23 10.8 1.26C10.37 1.34 9.97 1.5 9.61 1.74C9.62 1.5 9.64 1.26 9.66 1.02L8.16 1.06C8.14 1.56 8.07 2.04 7.93 2.5C7.71 3.19 7.35 3.82 6.87 4.31C6.43 4.76 5.88 5.1 5.29 5.28C5.11 5.33 4.92 5.37 4.73 5.39C5.18 4.92 5.44 4.31 5.44 3.62C5.44 2.83 5.05 2.1 4.41 1.66C4.19 1.5 3.94 1.37 3.68 1.3C4.34 1.19 5.01 1.33 5.57 1.66C6.14 2 6.59 2.53 6.81 3.18C6.83 3.22 6.84 3.27 6.85 3.31C6.87 3.4 6.89 3.48 6.9 3.56C6.92 3.74 6.93 3.92 6.93 4.1C6.93 4.31 6.91 4.52 6.88 4.72C6.84 4.97 6.77 5.22 6.67 5.46C6.6 5.62 6.52 5.78 6.42 5.93C6.35 6.05 6.28 6.16 6.19 6.27C6.13 6.35 6.06 6.42 5.99 6.49C5.27 7.33 4.24 7.83 3.17 7.83V9.33C4.89 9.33 6.5 8.55 7.5 7.21C7.5 7.2 7.51 7.19 7.51 7.18C7.62 7.05 7.73 6.91 7.83 6.76C7.94 6.6 8.03 6.44 8.12 6.27C8.19 6.13 8.26 5.98 8.32 5.82C8.36 5.73 8.39 5.63 8.42 5.53C8.44 5.46 8.46 5.4 8.48 5.33C8.55 5.06 8.59 4.78 8.59 4.49C8.59 4.14 8.53 3.81 8.42 3.5C8.39 3.42 8.36 3.33 8.32 3.26C8.31 3.25 8.31 3.24 8.31 3.23C8.23 3.06 8.13 2.9 8.02 2.76C8.74 2.64 9.5 2.84 10.07 3.32C10.41 3.61 10.64 4 10.72 4.45C10.75 4.62 10.76 4.79 10.75 4.97C10.75 5.19 10.71 5.42 10.65 5.63C10.61 5.82 10.54 6 10.45 6.17C10.37 6.3 10.29 6.43 10.2 6.54C10.17 6.58 10.14 6.61 10.11 6.64C10.08 6.68 10.04 6.72 10.01 6.75C9.31 7.39 8.41 7.76 7.5 7.76V9.26C8.84 9.26 10.11 8.73 11.05 7.81C11.09 7.77 11.13 7.74 11.16 7.7C11.2 7.66 11.24 7.61 11.28 7.57C11.36 7.48 11.44 7.38 11.52 7.28C11.6 7.17 11.67 7.06 11.74 6.95C11.86 6.76 11.97 6.56 12.05 6.35C12.15 6.09 12.24 5.82 12.28 5.54C12.31 5.38 12.33 5.22 12.34 5.05C12.34 4.8 12.31 4.54 12.26 4.29C12.19 3.96 12.05 3.63 11.86 3.36C12.06 3.29 12.27 3.27 12.5 3.28C13.09 3.28 13.66 3.53 14.07 3.96C14.54 4.44 14.73 5.09 14.64 5.72C14.64 5.72 14.63 5.72 14.63 5.73C14.61 5.85 14.59 5.97 14.56 6.08C14.5 6.29 14.41 6.49 14.31 6.67C14.21 6.85 14.09 7.02 13.96 7.16C13.91 7.22 13.86 7.27 13.8 7.33C13.78 7.35 13.75 7.38 13.73 7.4C13.71 7.42 13.7 7.43 13.68 7.45C13.04 8.05 12.21 8.4 11.36 8.4V9.9C12.64 9.9 13.85 9.37 14.75 8.48C14.76 8.47 14.78 8.46 14.79 8.45C14.82 8.42 14.85 8.39 14.88 8.35C14.9 8.33 14.93 8.3 14.95 8.28C15.02 8.2 15.08 8.12 15.15 8.04C15.29 7.88 15.41 7.7 15.53 7.51C15.64 7.33 15.74 7.13 15.82 6.93C15.9 6.73 15.97 6.52 16.02 6.3C16.05 6.17 16.07 6.04 16.09 5.91C16.26 6.52 16.65 7.05 17.15 7.44C17.4 7.64 17.7 7.79 18 7.89V6.39C17.94 6.37 17.88 6.35 17.82 6.32C17.76 6.29 17.7 6.26 17.64 6.22C17.58 6.18 17.52 6.14 17.47 6.09C17.42 6.05 17.36 6 17.32 5.94C17.22 5.84 17.13 5.72 17.06 5.6C17.06 5.59 17.06 5.59 17.06 5.58C16.99 5.45 16.94 5.32 16.9 5.18C16.84 4.92 16.84 4.64 16.88 4.38C16.92 4.18 16.99 3.99 17.08 3.82C17.14 3.72 17.2 3.62 17.27 3.53C17.33 3.45 17.39 3.38 17.45 3.31C17.52 3.23 17.59 3.16 17.67 3.1C17.67 3.1 17.67 3.1 17.68 3.09C18.28 2.61 19.05 2.41 19.77 2.5C19.88 2.95 19.93 3.43 19.86 3.92C19.83 4.11 19.77 4.3 19.69 4.48C19.22 4.23 18.68 4.09 18.1 4.09V5.59C18.52 5.59 18.92 5.67 19.29 5.82C18.92 6.59 18.26 7.17 17.49 7.42V5.92C17.47 5.91 17.45 5.91 17.43 5.91C17.36 5.91 17.29 5.9 17.22 5.88C17.03 5.83 16.87 5.71 16.75 5.56C16.63 5.41 16.56 5.22 16.55 5.02C16.55 4.91 16.56 4.8 16.59 4.7C16.61 4.6 16.64 4.51 16.69 4.42C16.71 4.38 16.73 4.35 16.76 4.31C16.76 4.31 16.76 4.31 16.76 4.3C16.79 4.26 16.82 4.22 16.85 4.19C17.03 3.99 17.28 3.86 17.55 3.84C17.82 3.82 18.09 3.91 18.3 4.09C18.34 4.12 18.38 4.16 18.41 4.19C18.43 4.21 18.44 4.22 18.45 4.24C18.51 4.31 18.56 4.39 18.6 4.47C18.68 4.63 18.73 4.81 18.73 5C18.73 5.12 18.71 5.23 18.68 5.35C18.66 5.41 18.64 5.48 18.62 5.53C18.59 5.59 18.57 5.65 18.54 5.7C18.49 5.79 18.43 5.88 18.36 5.96C18.34 5.98 18.32 6 18.3 6.02C18.3 6.02 18.3 6.02 18.3 6.03C18.21 6.11 18.12 6.18 18.02 6.23C18.02 6.23 18.01 6.24 18.01 6.24C17.94 6.28 17.87 6.31 17.8 6.33C17.73 6.36 17.65 6.37 17.58 6.38V9.11C18.82 9.11 19.94 8.64 20.73 7.82C20.77 7.79 20.81 7.76 20.85 7.73L18.85 7.73Z" fill="currentColor"/>
      </svg>
    ),
    
    // 24 Hours icon
    "24 Hours": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor"/>
        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
      </svg>
    ),
    
    // Parking icon
    "Parking Lot": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 8h-3V7h3c1.1 0 2 .9 2 2s-.9 2-2 2z" fill="currentColor"/>
      </svg>
    ),
    
    // Coffee icon
    "Coffee": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" fill="currentColor"/>
      </svg>
    ),
    
    // Food icon
    "Quick bite": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" fill="currentColor"/>
      </svg>
    ),
    
    // Outdoor seating icon
    "Outdoor Seating": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 4H2v16h20V4zM4 6h2v12H4V6zm16 12h-2V6h2v12z" fill="currentColor"/>
        <path d="M13.5 17h-3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h3c.28 0 .5.22.5.5s-.22.5-.5.5zm0-9h-3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h3c.28 0 .5.22.5.5s-.22.5-.5.5zm0 4.5h-3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h3c.28 0 .5.22.5.5s-.22.5-.5.5z" fill="currentColor"/>
      </svg>
    ),

    // Restroom icon
    "Restroom": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 22v-7.5H4V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v5.5H9.5V22h-4zM18 22v-6h3l-2.54-7.63C18.18 7.55 17.42 7 16.56 7h-.12c-.86 0-1.63.55-1.9 1.37L12 16h3v6h3zM7.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm9 0c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2z" fill="currentColor"/>
      </svg>
    ),

    // Pet Friendly icon
    "Pet Friendly": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 12c1.93 0 3.5-1.57 3.5-3.5S6.43 5 4.5 5 1 6.57 1 8.5 2.57 12 4.5 12zm9 0c1.93 0 3.5-1.57 3.5-3.5S15.43 5 13.5 5 10 6.57 10 8.5 11.57 12 13.5 12zm9 0c1.93 0 3.5-1.57 3.5-3.5S22.43 5 20.5 5 17 6.57 17 8.5 18.57 12 20.5 12zM9 16c1.93 0 3.5-1.57 3.5-3.5S10.93 9 9 9s-3.5 1.57-3.5 3.5S7.07 16 9 16zm6 4c1.93 0 3.5-1.57 3.5-3.5S16.93 13 15 13s-3.5 1.57-3.5 3.5S13.07 20 15 20z" fill="currentColor"/>
      </svg>
    ),

    // Good For Kids icon
    "Good for kids": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2v8h8c0-4.42-3.58-8-8-8zm6.32 13.89C20.37 14.54 21 12.84 21 11H6.44l-.95-2H2v2h2.22s1.89 4.07 2.12 4.42c-1.1.59-1.84 1.75-1.84 3.08C4.5 20.43 6.07 22 8 22c1.76 0 3.22-1.3 3.46-3h2.08c.24 1.7 1.7 3 3.46 3 1.93 0 3.5-1.57 3.5-3.5 0-1.04-.46-1.97-1.18-2.61zM8 20c-.83 0-1.5-.67-1.5-1.5S7.17 17 8 17s1.5.67 1.5 1.5S8.83 20 8 20zm9 0c-.83 0-1.5-.67-1.5-1.5S16.17 17 17 17s1.5.67 1.5 1.5S17.83 20 17 20z" fill="currentColor"/>
      </svg>
    ),

    // Takeout icon
    "Takeout": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 7v4H5V7h14m0-2H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z" fill="currentColor"/>
        <path d="M16 10.8c-.57 0-1.08-.19-1.5-.51-.42.32-.93.51-1.5.51-.57 0-1.08-.19-1.5-.51-.42.32-.93.51-1.5.51-.57 0-1.08-.19-1.5-.51-.42.32-.93.51-1.5.51-.57 0-1.08-.19-1.5-.51-.42.32-.93.51-1.5.51v1.2c.57 0 1.08-.19 1.5-.51.42.32.93.51 1.5.51.57 0 1.08-.19 1.5-.51.42.32.93.51 1.5.51.57 0 1.08-.19 1.5-.51.42.32.93.51 1.5.51.57 0 1.08-.19 1.5-.51.42.32.93.51 1.5.51.57 0 1.08-.19 1.5-.51.42.32.93.51 1.5.51v-1.2c-.57 0-1.08-.19-1.5-.51-.42.32-.93.51-1.5.51z" fill="currentColor"/>
        <path d="M5 16h14v5H5z" fill="currentColor"/>
      </svg>
    ),

    // Delivery icon
    "Delivery": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1z" fill="currentColor"/>
        <path d="M5 6h5v2H5zm14 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="currentColor"/>
      </svg>
    ),
    
    // Default icon if no specific icon is found
    "default": (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" fill="currentColor"/>
      </svg>
    )
  };
  
  // Look for exact match first
  if (iconMap[feature]) {
    return iconMap[feature];
  }
  
  // Common categories for matching
  const wifiTerms = ['wifi', 'internet', 'wireless'];
  const powerTerms = ['power', 'outlet', 'socket', 'charging'];
  const acTerms = ['ac', 'air conditioning', 'air-conditioning'];
  const parkingTerms = ['parking', 'lot', 'car park'];
  const coffeeTerms = ['coffee', 'espresso', 'latte'];
  const foodTerms = ['food', 'meal', 'bite', 'snack'];
  const outdoorTerms = ['outdoor', 'patio', 'terrace', 'garden'];
  const smokingTerms = ['smoke', 'smoking'];
  const restroomTerms = ['restroom', 'toilet', 'bathroom', 'wc'];
  const petTerms = ['pet', 'dog', 'cat', 'friendly'];
  const childrenTerms = ['child', 'kid', 'family'];
  const takeoutTerms = ['takeout', 'take-out', 'take away', 'takeaway'];
  const deliveryTerms = ['delivery', 'deliver'];
  
  // Check for category matches
  const featureLower = cleanFeature.toLowerCase();
  
  if (wifiTerms.some(term => featureLower.includes(term))) {
    return iconMap['WiFi'];
  }
  
  if (powerTerms.some(term => featureLower.includes(term))) {
    return iconMap['Power Outlets'];
  }
  
  if (acTerms.some(term => featureLower.includes(term))) {
    return iconMap['Air Conditioning'];
  }
  
  if (parkingTerms.some(term => featureLower.includes(term))) {
    return iconMap['Parking Lot'];
  }
  
  if (coffeeTerms.some(term => featureLower.includes(term))) {
    return iconMap['Coffee'];
  }
  
  if (foodTerms.some(term => featureLower.includes(term))) {
    return iconMap['Quick bite'];
  }
  
  if (outdoorTerms.some(term => featureLower.includes(term))) {
    return iconMap['Outdoor Seating'];
  }
  
  if (smokingTerms.some(term => featureLower.includes(term))) {
    return iconMap['Smoking Area'];
  }
  
  if (restroomTerms.some(term => featureLower.includes(term))) {
    return iconMap['Restroom'];
  }
  
  if (petTerms.some(term => featureLower.includes(term))) {
    return iconMap['Pet Friendly'];
  }
  
  if (childrenTerms.some(term => featureLower.includes(term))) {
    return iconMap['Good for kids'];
  }
  
  if (takeoutTerms.some(term => featureLower.includes(term))) {
    return iconMap['Takeout'];
  }
  
  if (deliveryTerms.some(term => featureLower.includes(term))) {
    return iconMap['Delivery'];
  }
  
  // Look for exact match first
  if (iconMap[cleanFeature]) {
    return iconMap[cleanFeature];
  }
  
  // Look for partial matches as a last resort
  for (const key in iconMap) {
    if (featureLower.includes(key.toLowerCase())) {
      return iconMap[key];
    }
  }
  
  // Return default icon if no match found
  return iconMap["default"];
};

// Helper function to get the first available opening hours
const getFirstAvailableHours = (openingHours) => {
  if (!openingHours) {
    return "Jam belum tersedia";
  }

  // Handle array format (from the JSON data)
  if (Array.isArray(openingHours) && openingHours.length > 0) {
    // Get the current day
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];

    // Try to find today's hours first
    const todayHours = openingHours.find(item => item.day === today);
    const todayValue = formatEntryForDisplay(todayHours);
    if (todayValue) {
      return `Hari ini: ${todayValue}`;
    }

    // Otherwise, return the first day with real hours
    const openDay = openingHours.find(item => {
      const value = formatEntryForDisplay(item);
      return value && value !== 'Tutup';
    });
    if (openDay) {
      return `${DAY_NAMES_ID[openDay.day] || openDay.day}: ${formatEntryForDisplay(openDay)}`;
    }
  }

  // Handle object format (from the adapter)
  if (typeof openingHours === 'object' && !Array.isArray(openingHours)) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];

    if (openingHours[today]) {
      const hours = openingHours[today];
      return `Hari ini: ${hours.open} to ${hours.close}`;
    }

    // Return the first day's hours
    const firstDay = Object.keys(openingHours)[0];
    if (firstDay) {
      const hours = openingHours[firstDay];
      return `${DAY_NAMES_ID[firstDay] || firstDay}: ${hours.open} to ${hours.close}`;
    }
  }

  return "Jam belum tersedia";
};

const SimpleCafePage = ({ cafeData, onBackToCatalog }) => {
  // State for managing UI elements
  const [showHours, setShowHours] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewKey, setReviewKey] = useState(0); // Force re-render of ReviewList

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [cafeData]);

  // Reviews are posted anonymously via Firebase, so no account gate is needed
  const handleWriteReview = () => {
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    setReviewKey(prev => prev + 1); // Force re-render of ReviewList
  };

  // Handle null data
  if (!cafeData) {
    return (
      <div className="container">
        <div className="loading-error">
          <h2>Cafe tidak ditemukan</h2>
          <p>Maaf, cafe yang kamu cari tidak ada atau sudah tidak tersedia.</p>
          <button onClick={onBackToCatalog} className="back-to-catalog-btn">
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  // Create star rating display
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && halfStar) {
        stars.push(<span key={i} className="star half-filled">★</span>);
      } else {
        stars.push(<span key={i} className="star">★</span>);
      }
    }
    
    return stars;
  };

  // Main image from cafe data, with a branded fallback when the URL is dead
  const rawImage = cafeData.images && cafeData.images.length > 0
    ? cafeData.images[0].url
    : cafeData.image || cafeData.imageUrl;
  const mainImage = rawImage
    ? (rawImage.includes('googleusercontent')
        ? rawImage.replace(/=w\d+-h\d+.*$/, '=w800-h500-k-no')
        : rawImage)
    : PLACEHOLDER_IMAGE;

  const handleMainImageError = (e) => {
    const img = e.currentTarget;
    if (img.src !== PLACEHOLDER_IMAGE) {
      img.src = PLACEHOLDER_IMAGE;
    }
    img.onerror = null;
  };

  return (
    <div className="simple-cafe-page">
      <div className="container">
        {/* Breadcrumb navigation */}
        <div className="breadcrumb">
          <a href="/" onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}>Beranda</a>
          <span>/</span>
          <a href="/catalog" onClick={(e) => {
            e.preventDefault();
            onBackToCatalog();
          }}>Katalog</a>
          <span>/</span>
          <span>{cafeData.name}</span>
        </div>
        
        {/* Main content - matching the reference image */}
        <div className="cafe-content-wrapper">
          {/* Left side - cafe image */}
          <div className="cafe-main-image">
            <img src={mainImage} alt={cafeData.name} onError={handleMainImageError} />
          </div>
          
          {/* Right side - cafe details */}
          <div className="cafe-details-panel">
            {/* Header with name and rating */}
            <div className="cafe-header-simple">
              <h1>{cafeData.name}</h1>
              <div className="cafe-rating-simple">
                <div className="stars-container">
                  {renderRatingStars(cafeData.rating || 0)}
                </div>
                <span className="rating-value">{cafeData.rating?.toFixed(1) || "0.0"}</span>
                {cafeData.totalReviews > 0 && (
                  <span className="reviews-count">({cafeData.totalReviews} ulasan di Google)</span>
                )}
              </div>
            </div>
            
            {/* Address */}
            <div className="cafe-address">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#F05438"/>
              </svg>
              <span>{cafeData.fullAddress || cafeData.address}</span>
            </div>
            
            {/* Opening Hours */}
            <div className="cafe-hours">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#F05438"/>
              </svg>
              <div className="hours-info">
                {cafeData.openingHours && (Array.isArray(cafeData.openingHours) ? cafeData.openingHours.length > 0 : Object.keys(cafeData.openingHours).length > 0) ? (
                  <>
                    <span>
                      {getFirstAvailableHours(cafeData.openingHours)}
                      <button className="toggle-hours" onClick={() => setShowHours(!showHours)}>
                        {showHours ? 'Sembunyikan' : 'Lihat semua jam'}
                      </button>
                    </span>
                    {showHours && (
                      <div className="all-hours">
                        {Array.isArray(cafeData.openingHours) ? (
                          // Handle array format (from the JSON data; entries may nest hours as {day, hours})
                          cafeData.openingHours.map((hours, index) => (
                            <div key={index} className="hours-row">
                              <span className="day">{DAY_NAMES_ID[hours.day] || hours.day}</span>
                              <span className="time">{formatEntryForDisplay(hours) || '—'}</span>
                            </div>
                          ))
                        ) : (
                          // Handle object format (from the adapter)
                          Object.entries(cafeData.openingHours).map(([day, hours], index) => (
                            <div key={index} className="hours-row">
                              <span className="day">{DAY_NAMES_ID[day] || day}</span>
                              <span className="time">{hours.close === "Closed" ? "Tutup" : `${hours.open} to ${hours.close}`}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <span>Jam buka belum tersedia</span>
                )}
              </div>
            </div>
            
            {/* Phone Number */}
            {cafeData.phone && (
              <div className="cafe-phone">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="#F05438"/>
                </svg>
                <a href={`tel:${cafeData.phone}`}>{cafeData.phone}</a>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="action-buttons-simple">
              <a href={cafeData.google_maps_direction} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="directions-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.71 11.29L12.71 2.29C12.32 1.9 11.69 1.9 11.3 2.29L2.3 11.29C1.91 11.68 1.91 12.31 2.3 12.7C2.69 13.09 3.32 13.09 3.71 12.7L11 5.41V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V5.41L20.29 12.7C20.48 12.89 20.74 13 21 13C21.26 13 21.52 12.89 21.71 12.7C22.1 12.31 22.1 11.68 21.71 11.29Z" fill="white"/>
                </svg>
                Rute
              </a>
              <a 
                href={cafeData.website || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`menu-btn ${!cafeData.website ? 'disabled' : ''}`}
                onClick={(e) => !cafeData.website && e.preventDefault()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V8H19V20ZM15 13H9V14H15V13ZM15 16H9V17H15V16ZM14 10H10V11H14V10Z" fill="currentColor"/>
                </svg>
                {cafeData.website ? 'Kunjungi Website' : 'Belum Ada Website'}
              </a>
              <button 
                className="review-btn" 
                onClick={handleWriteReview}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
                  <path d="M8 15.5L10.5 13L13 15.5L16.5 12L19 14.5V18H8V15.5Z" fill="currentColor"/>
                </svg>
                Tulis Review
              </button>
            </div>
          </div>
        </div>
        
        {/* Cafe Content Section */}
        <div className="cafe-content-section">
          <div className="content-main">
            {/* About Cafe */}
            {cafeData.description && (
              <div className="about-cafe-section">
                <h2 className="section-title">Tentang Cafe</h2>
                <p className="about-text">{cafeData.description}</p>
              </div>
            )}

            {/* Facilities */}
            {cafeData.features && cafeData.features.length > 0 && (
              <div className="facilities-section">
                <h2 className="section-title">Fasilitas</h2>
                <div className="facilities-grid">
                  {cafeData.features.map((feature, index) => (
                    <div className="facility-item" key={index}>
                      <div className="facility-icon">
                        {getFacilityIcon(feature)}
                      </div>
                      <span className="facility-name">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Map Location */}
            <div className="map-section">
              <h2 className="section-title">Lokasi di Peta</h2>
              <div className="map-container">
                <iframe
                  title={`Peta lokasi ${cafeData.name}`}
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '8px' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={(() => {
                    const embedKey = process.env.REACT_APP_GOOGLE_MAPS_EMBED_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';
                    // Extract place ID from Google Maps URL if available
                    if (cafeData.placeId) {
                      return `https://www.google.com/maps/embed/v1/place?key=${embedKey}&q=place_id:${cafeData.placeId}&zoom=17`;
                    } else if (cafeData.google_maps_direction) {
                      const match = cafeData.google_maps_direction.match(/query_place_id=([^&]+)/);
                      if (match && match[1]) {
                        return `https://www.google.com/maps/embed/v1/place?key=${embedKey}&q=place_id:${match[1]}&zoom=17`;
                      }
                    }
                    // Fallback to address search
                    return `https://www.google.com/maps/embed/v1/place?key=${embedKey}&q=${encodeURIComponent((cafeData.fullAddress || cafeData.address || '') + ', Surabaya')}&zoom=15`;
                  })()}
                ></iframe>
              </div>
              <div className="map-address">
                <p>{cafeData.fullAddress || cafeData.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Reviews Section */}
        <ReviewList
          key={reviewKey}
          cafeId={cafeData.id}
        />
      </div>
      
      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        cafe={cafeData}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default SimpleCafePage;