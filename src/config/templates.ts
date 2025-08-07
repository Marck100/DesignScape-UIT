// src/config/templates.ts
// Template predefiniti per la home page

import { TemplateData } from "../types/template";

export const templates: Record<string, TemplateData> = {
    "portfolio": {
        name: "Portfolio Showcase",
        description: "Clean layout for showcasing creative work and projects",
        elements: [
            // Titolo principale
            { x: 400, y: 80, width: 200, height: 50, type: "text", content: "Portfolio", fontSize: 28, fontWeight: "bold", textAlign: "center" },
            
            // Progetto 1
            { x: 80, y: 160, width: 180, height: 30, type: "text", content: "Project Alpha", fontSize: 16, fontWeight: "bold" },
            { x: 80, y: 200, width: 180, height: 120, type: "image", content: "https://via.placeholder.com/180x120?text=Project+Alpha" },
            { x: 80, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Progetto 2
            { x: 320, y: 160, width: 180, height: 30, type: "text", content: "Project Beta", fontSize: 16, fontWeight: "bold" },
            { x: 320, y: 200, width: 180, height: 120, type: "image", content: "https://via.placeholder.com/180x120?text=Project+Beta" },
            { x: 320, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Progetto 3
            { x: 560, y: 160, width: 180, height: 30, type: "text", content: "Project Gamma", fontSize: 16, fontWeight: "bold" },
            { x: 560, y: 200, width: 180, height: 120, type: "image", content: "https://via.placeholder.com/180x120?text=Project+Gamma" },
            { x: 560, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Progetto 4
            { x: 800, y: 160, width: 180, height: 30, type: "text", content: "Project Delta", fontSize: 16, fontWeight: "bold" },
            { x: 800, y: 200, width: 180, height: 120, type: "image", content: "https://via.placeholder.com/180x120?text=Project+Delta" },
            { x: 800, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 }
        ]
    },
    
    "magazine": {
        name: "Magazine Layout",
        description: "Hero image with sidebar text - asymmetric layout with visual hierarchy",
        elements: [
            // Titolo principale
            { x: 50, y: 50, width: 900, height: 80, type: "text", content: "DESIGN MAGAZINE", fontSize: 48, fontWeight: "bold", textAlign: "center" },
            
            // Immagine hero
            { x: 50, y: 150, width: 600, height: 350, type: "image", content: "https://via.placeholder.com/600x350?text=Hero+Image" },
            
            // Box colorato di sfondo per la sidebar
            { x: 670, y: 140, width: 300, height: 370, type: "box", content: "", color: "#f8fafc" },
            
            // Colonna di testo a destra
            { x: 690, y: 160, width: 260, height: 180, type: "text", content: "Creative Design Trends\n\nExploring the latest innovations in visual design and user experience. This article covers emerging techniques and methodologies.", fontSize: 16, fontWeight: "bold" },
            { x: 690, y: 360, width: 260, height: 130, type: "text", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.", fontSize: 12 },
            
            // Testo sotto l'immagine
            { x: 50, y: 520, width: 600, height: 60, type: "text", content: "Caption: Modern design principles in action - demonstrating visual balance and content hierarchy.", fontSize: 10, fontStyle: "italic" }
        ]
    },
    
    "business-card": {
        name: "Card Layout",
        description: "Compact design with balanced text and image placement",
        elements: [
            // Box di sfondo principale
            { x: 30, y: 60, width: 380, height: 200, type: "box", content: "", color: "#ffffff" },
            
            // Box colorato per il header
            { x: 30, y: 60, width: 380, height: 60, type: "box", content: "", color: "#667eea" },
            
            // Nome in bianco sul box colorato
            { x: 50, y: 75, width: 200, height: 30, type: "text", content: "Alex Designer", fontSize: 20, fontWeight: "bold", color: "#ffffff" },
            
            // Logo/Immagine
            { x: 320, y: 70, width: 70, height: 40, type: "image", content: "https://via.placeholder.com/70x40?text=LOGO" },
            
            // Titolo
            { x: 50, y: 140, width: 290, height: 25, type: "text", content: "Creative Director & UX Designer", fontSize: 14, fontWeight: "500", color: "#4a5568" },
            
            // Contatti
            { x: 50, y: 170, width: 290, height: 80, type: "text", content: "✉ alex@studio.com\n📞 +1 (555) 123-4567\n🌐 alexdesign.studio\n📍 123 Creative Street, Design City", fontSize: 11, color: "#374151" }
        ]
    },
    
    "poster": {
        name: "Poster Design",
        description: "Centered composition with strong typography and focal image",
        elements: [
            // Box di sfondo colorato
            { x: 80, y: 60, width: 840, height: 120, type: "box", content: "", color: "#667eea" },
            
            // Titolo principale in bianco
            { x: 100, y: 90, width: 800, height: 60, type: "text", content: "DESIGN CONFERENCE 2025", fontSize: 42, fontWeight: "bold", textAlign: "center", color: "#ffffff" },
            
            // Sottotitolo
            { x: 100, y: 200, width: 800, height: 40, type: "text", content: "The Future of Creative Technology", fontSize: 24, textAlign: "center", color: "#374151" },
            
            // Immagine principale
            { x: 200, y: 260, width: 600, height: 300, type: "image", content: "https://via.placeholder.com/600x300?text=Event+Image" },
            
            // Box informazioni
            { x: 150, y: 580, width: 700, height: 80, type: "box", content: "", color: "#f1f5f9" },
            
            // Informazioni evento nel box
            { x: 170, y: 600, width: 660, height: 40, type: "text", content: "March 15-17, 2025 • Design Center Downtown • Tickets available now", fontSize: 16, textAlign: "center", fontWeight: "500", color: "#1a202c" },
            
            // Call to action
            { x: 350, y: 680, width: 300, height: 40, type: "text", content: "Register at designconf2025.com", fontSize: 18, fontWeight: "bold", textAlign: "center", color: "#667eea" }
        ]
    },
    
    "landing-page": {
        name: "Landing Page",
        description: "Split-screen layout with navigation and feature sections",
        elements: [
            // Header navigation bar
            { x: 30, y: 30, width: 940, height: 60, type: "box", content: "", color: "#ffffff" },
            { x: 50, y: 50, width: 150, height: 20, type: "text", content: "BRAND LOGO", fontSize: 16, fontWeight: "bold", color: "#1a202c" },
            { x: 700, y: 50, width: 250, height: 20, type: "text", content: "Home    About    Services    Contact", fontSize: 14, fontWeight: "500", textAlign: "right", color: "#4a5568" },
            
            // Hero split-screen
            { x: 50, y: 120, width: 450, height: 250, type: "image", content: "https://via.placeholder.com/450x250?text=Hero+Image" },
            
            // Hero text section con box di sfondo
            { x: 520, y: 120, width: 430, height: 250, type: "box", content: "", color: "#f8fafc" },
            { x: 540, y: 150, width: 390, height: 80, type: "text", content: "Transform Your Ideas Into Reality", fontSize: 28, fontWeight: "bold", color: "#1a202c" },
            { x: 540, y: 240, width: 390, height: 80, type: "text", content: "We create stunning digital experiences that engage users and drive results. Let's build something amazing together.", fontSize: 16, color: "#4a5568" },
            { x: 540, y: 330, width: 120, height: 30, type: "box", content: "", color: "#667eea" },
            { x: 550, y: 340, width: 100, height: 10, type: "text", content: "Get Started", fontSize: 14, fontWeight: "bold", textAlign: "center", color: "#ffffff" },
            
            // Features section
            { x: 50, y: 400, width: 900, height: 60, type: "text", content: "Our Services", fontSize: 24, fontWeight: "bold", textAlign: "center", color: "#1a202c" },
            
            // Feature boxes
            { x: 50, y: 480, width: 280, height: 100, type: "box", content: "", color: "#f1f5f9" },
            { x: 70, y: 500, width: 240, height: 60, type: "text", content: "Web Development\nCustom websites and applications", fontSize: 14, fontWeight: "500", color: "#374151" },
            
            { x: 360, y: 480, width: 280, height: 100, type: "box", content: "", color: "#f1f5f9" },
            { x: 380, y: 500, width: 240, height: 60, type: "text", content: "UI/UX Design\nUser-centered design solutions", fontSize: 14, fontWeight: "500", color: "#374151" },
            
            { x: 670, y: 480, width: 280, height: 100, type: "box", content: "", color: "#f1f5f9" },
            { x: 690, y: 500, width: 240, height: 60, type: "text", content: "Digital Strategy\nData-driven growth solutions", fontSize: 14, fontWeight: "500", color: "#374151" }
        ]
    }
};
