// Predefined layout templates for quick project creation

import { TemplateData } from "../types/template";

/**
 * Collection of predefined templates that users can start with
 * Each template provides a complete layout with positioned elements
 */
export const templates: Record<string, TemplateData> = {
    "portfolio": {
        name: "Portfolio Showcase",
        description: "Clean layout for showcasing creative work and projects",
        elements: [
            // Main title header
            { x: 400, y: 80, width: 200, height: 50, type: "text", content: "Portfolio", fontSize: 28, fontWeight: "bold", textAlign: "center" },
            
            // Project Alpha section
            { x: 80, y: 160, width: 180, height: 30, type: "text", content: "Project Alpha", fontSize: 16, fontWeight: "bold" },
            { x: 80, y: 200, width: 180, height: 120, type: "image", content: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=180&h=120&fit=crop&crop=center" },
            { x: 80, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Project Beta section
            { x: 320, y: 160, width: 180, height: 30, type: "text", content: "Project Beta", fontSize: 16, fontWeight: "bold" },
            { x: 320, y: 200, width: 180, height: 120, type: "image", content: "https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?w=180&h=120&fit=crop&crop=center" },
            { x: 320, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Project Gamma section
            { x: 560, y: 160, width: 180, height: 30, type: "text", content: "Project Gamma", fontSize: 16, fontWeight: "bold" },
            { x: 560, y: 200, width: 180, height: 120, type: "image", content: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=180&h=120&fit=crop&crop=center" },
            { x: 560, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Project Delta section
            { x: 800, y: 160, width: 180, height: 30, type: "text", content: "Project Delta", fontSize: 16, fontWeight: "bold" },
            { x: 800, y: 200, width: 180, height: 120, type: "image", content: "https://images.unsplash.com/photo-1608303588026-884930af2559?w=180&h=120&fit=crop&crop=center" },
            { x: 800, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 }
        ]
    },
    
    "magazine": {
        name: "Magazine Layout",
        description: "Hero image with sidebar text - asymmetric layout with visual hierarchy",
        elements: [
            // Title
            { x: 50, y: 50, width: 900, height: 80, type: "text", content: "DESIGN MAGAZINE", fontSize: 48, fontWeight: "bold", textAlign: "center" },
            
            // Image
            { x: 50, y: 150, width: 600, height: 350, type: "image", content: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=350&fit=crop&crop=center" },
            
            // Background box
            { x: 670, y: 140, width: 300, height: 370, type: "box", content: "", color: "#f8fafc" },
            
            // Text (on the right)
            { x: 690, y: 160, width: 260, height: 180, type: "text", content: "Creative Design Trends\n\nExploring the latest innovations in visual design and user experience. This article covers emerging techniques and methodologies.", fontSize: 16, fontWeight: "bold" },
            { x: 690, y: 360, width: 260, height: 130, type: "text", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.", fontSize: 12 },
            
        ]
    }
};