export const allSeriesQuery = `
  *[_type == "series"] | order(orderRank asc) {
    _id, title, medium, description
  }
`;

export const allArtworksQuery = `
  *[_type == "artwork"] | order(coalesce(series->orderRank, 999999) asc, year desc, _createdAt desc) {
    _id, code, title, image, additionalImages,
    year, dimensions, status,
    "medium": coalesce(mediumOverride, series->medium),
    "description": coalesce(descriptionOverride, series->description),
    series-> {
      _id, title
    }
  }
`;

export const siteSettingsQuery = `
  *[_id == "siteSettings"][0] {
    siteName, heroHeadline, heroIntro,
    contactEmail, instagramUrl,
    defaultSeoImage, footerText,
    upcomingEvent, recentPastEvent,
    heroArtwork-> {
      _id, code, title, image, year, dimensions, status,
      "medium": coalesce(mediumOverride, series->medium),
      "description": coalesce(descriptionOverride, series->description),
      series-> { _id, title }
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
