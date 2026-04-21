export const allArtworksQuery = `
  *[_type == "artwork"] | order(displayOrder asc) {
    _id, title, slug, image, additionalImages,
    year, medium, dimensions, series, status,
    description, displayOrder
  }
`;

export const siteSettingsQuery = `
  *[_id == "siteSettings"][0] {
    siteName, heroHeadline, tagline,
    studioLocation, contactEmail, instagramUrl,
    defaultSeoImage, footerText,
    heroArtwork-> {
      _id, title, slug, image, year, medium, dimensions, series, status, description
    }
  }
`;

export const aboutQuery = `
  *[_id == "about"][0] {
    portrait, shortBio, longBio,
    birthplace, birthYear,
    stats, selectedShows
  }
`;
