export const allSeriesQuery = `
  *[_type == "series"] | order(displayOrder asc) {
    _id, key, title, medium, description, displayOrder
  }
`;

export const allArtworksQuery = `
  *[_type == "artwork"] | order(displayOrder asc) {
    _id, code, image, additionalImages,
    year, dimensions, status, displayOrder,
    "medium": coalesce(mediumOverride, series->medium),
    "description": coalesce(descriptionOverride, series->description),
    series-> {
      _id, key, title, displayOrder
    }
  }
`;

export const siteSettingsQuery = `
  *[_id == "siteSettings"][0] {
    siteName, heroHeadline, heroIntro,
    studioLocation, contactEmail, instagramUrl,
    defaultSeoImage, footerText,
    upcomingEvent, recentPastEvent,
    heroArtwork-> {
      _id, code, image, year, dimensions, status,
      "medium": coalesce(mediumOverride, series->medium),
      "description": coalesce(descriptionOverride, series->description),
      series-> { _id, key, title, displayOrder }
    }
  }
`;

export const aboutQuery = `
  *[_id == "about"][0] {
    portrait, shortBio, longBio,
    birthplace, birthYear,
    stats, bibliography
  }
`;
