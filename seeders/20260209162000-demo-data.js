"use strict";

const bcrypt = require("bcryptjs");

const now = new Date();

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("products", [
      { name: "Enceinte Line Array Pro X12", slug: "enceinte-line-array-pro-x12", category: "Son", description: "Enceinte line array 1200W RMS pour concerts live.", pricePerDay: 180, deposit: 350, power: "1200W", images: JSON.stringify(["/uploads/product-son-1.jpg"]), isActive: true, createdAt: now, updatedAt: now },
      { name: "Caisson de basses SUB 18", slug: "caisson-basses-sub-18", category: "Son", description: "Subwoofer 18 pouces pour basses puissantes.", pricePerDay: 140, deposit: 280, power: "2000W", images: JSON.stringify(["/uploads/product-son-2.jpg"]), isActive: true, createdAt: now, updatedAt: now },
      { name: "Console numérique 32 pistes", slug: "console-numerique-32-pistes", category: "Son", description: "Mixage professionnel 32 entrées.", pricePerDay: 220, deposit: 500, power: "220V", images: JSON.stringify(["/uploads/product-son-3.jpg"]), isActive: true, createdAt: now, updatedAt: now },
      { name: "Projecteur LED Beam 230", slug: "projecteur-led-beam-230", category: "Lumière", description: "Lyre beam motorisée pour shows scéniques.", pricePerDay: 95, deposit: 200, power: "230W", images: JSON.stringify(["/uploads/product-light-1.jpg"]), isActive: true, createdAt: now, updatedAt: now },
      { name: "Barre LED RGB 1m", slug: "barre-led-rgb-1m", category: "Lumière", description: "Barre LED pour habillage de scène.", pricePerDay: 35, deposit: 80, power: "60W", images: JSON.stringify(["/uploads/product-light-2.jpg"]), isActive: true, createdAt: now, updatedAt: now },
      { name: "Écran LED P3 12m²", slug: "ecran-led-p3-12m2", category: "Vidéo", description: "Mur LED haute résolution pour concerts.", pricePerDay: 650, deposit: 1200, power: "3.5kW", images: JSON.stringify(["/uploads/product-video-1.jpg"]), isActive: true, createdAt: now, updatedAt: now },
      { name: "Vidéo projecteur 12 000 lumens", slug: "video-projecteur-12000-lumens", category: "Vidéo", description: "Projection grand format pour événements.", pricePerDay: 180, deposit: 350, power: "900W", images: JSON.stringify(["/uploads/product-video-2.jpg"]), isActive: true, createdAt: now, updatedAt: now },
      { name: "Podium modulaire 6x4m", slug: "podium-modulaire-6x4m", category: "Scène", description: "Scène modulaire avec structure renforcée.", pricePerDay: 280, deposit: 600, power: "N/A", images: JSON.stringify(["/uploads/product-stage-1.jpg"]), isActive: true, createdAt: now, updatedAt: now },
      { name: "Groupe électrogène 60 KVA", slug: "groupe-electrogene-60-kva", category: "Énergie", description: "Alimentation autonome pour concert extérieur.", pricePerDay: 320, deposit: 700, power: "60KVA", images: JSON.stringify(["/uploads/product-energy-1.jpg"]), isActive: true, createdAt: now, updatedAt: now },
      { name: "Pack câblage et accessoires", slug: "pack-cablage-accessoires", category: "Accessoires", description: "Multipaires, câbles XLR, boîtiers DI, supports.", pricePerDay: 90, deposit: 180, power: "N/A", images: JSON.stringify(["/uploads/product-acc-1.jpg"]), isActive: true, createdAt: now, updatedAt: now }
    ]);

    await queryInterface.bulkInsert("packs", [
      {
        name: "Pack Concert 200",
        audienceSize: "200 pers",
        includedText: "2 subs, 4 têtes, console 16 pistes, 6 projecteurs LED, installation incluse.",
        pricePerDay: 780,
        optionsText: "Option technicien son, habillage lumière premium.",
        images: JSON.stringify(["/uploads/pack-200.jpg"]),
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Pack Concert 500",
        audienceSize: "500 pers",
        includedText: "4 subs, 8 têtes, console 32 pistes, 12 lyres, structure scène.",
        pricePerDay: 1650,
        optionsText: "Option écran LED 6m², technicien lumière.",
        images: JSON.stringify(["/uploads/pack-500.jpg"]),
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Pack Concert 1000+",
        audienceSize: "1000+",
        includedText: "Line array complet, sub stack, régie complète, mur LED, énergie 60 KVA.",
        pricePerDay: 3200,
        optionsText: "Option captation vidéo, ingénieur façade.",
        images: JSON.stringify(["/uploads/pack-1000.jpg"]),
        createdAt: now,
        updatedAt: now
      }
    ]);

    await queryInterface.bulkInsert("realisations", [
      { title: "Festival Urbain Abidjan", slug: "festival-urbain-abidjan", description: "Sonorisation et lumière complète pour 1200 personnes.", eventDate: "2025-05-12", location: "Abidjan", image: "/uploads/real-1.jpg", serviceType: "Concert", audience: 1200, createdAt: now, updatedAt: now },
      { title: "Live Gospel Night", slug: "live-gospel-night", description: "Installation scène + mix live pour salle indoor.", eventDate: "2025-07-20", location: "Yamoussoukro", image: "/uploads/real-2.jpg", serviceType: "Concert", audience: 650, createdAt: now, updatedAt: now },
      { title: "Concert Étudiant 2025", slug: "concert-etudiant-2025", description: "Pack 500 avec régie son pro et effets lumière.", eventDate: "2025-03-17", location: "Bouaké", image: "/uploads/real-3.jpg", serviceType: "Concert", audience: 500, createdAt: now, updatedAt: now },
      { title: "Show Corporate Premium", slug: "show-corporate-premium", description: "Prestation audio-visuelle et maintenance sur site.", eventDate: "2025-09-06", location: "Abidjan", image: "/uploads/real-4.jpg", serviceType: "Corporate", audience: 400, createdAt: now, updatedAt: now },
      { title: "Open Air Décembre", slug: "open-air-decembre", description: "Grand dispositif extérieur avec groupe électrogène.", eventDate: "2025-12-21", location: "Grand-Bassam", image: "/uploads/real-5.jpg", serviceType: "Concert", audience: 1800, createdAt: now, updatedAt: now }
    ]);

    await queryInterface.bulkInsert("admin_users", [
      {
        email: process.env.ADMIN_EMAIL || "admin@emyfreeevent.com",
        passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin12345", 10),
        role: "admin",
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("admin_users", null, {});
    await queryInterface.bulkDelete("realisations", null, {});
    await queryInterface.bulkDelete("packs", null, {});
    await queryInterface.bulkDelete("products", null, {});
  }
};
