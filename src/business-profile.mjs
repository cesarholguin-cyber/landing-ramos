// Solo cambiar approved después de recibir confirmación del despacho.
export const businessProfile = {
  hours: { approved: false, entries: [] },
  practiceAreas: { approved: false, entries: [] },
};

export const dayNames = {
  Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miércoles',
  Thursday: 'Jueves', Friday: 'Viernes', Saturday: 'Sábado', Sunday: 'Domingo',
};
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const hasText = value => typeof value === 'string' && value.trim().length > 0;

export function confirmedDetails(profile = businessProfile) {
  const hours = profile.hours.approved ? profile.hours.entries : [];
  const practiceAreas = profile.practiceAreas.approved ? profile.practiceAreas.entries : [];
  for (const entry of hours) {
    if (!Array.isArray(entry.days) || !entry.days.length ||
        entry.days.some(day => !Object.hasOwn(dayNames, day)) ||
        !timePattern.test(entry.opens) || !timePattern.test(entry.closes) || entry.opens >= entry.closes) {
      throw new Error('Revisar horario confirmado: días válidos y apertura anterior al cierre (HH:MM).');
    }
  }
  for (const area of practiceAreas) {
    if (!hasText(area.name) || !hasText(area.description)) throw new Error('Cada área confirmada necesita nombre y descripción.');
  }
  return { hours, practiceAreas };
}

export function addConfirmedBusinessSchema(schema, profile = businessProfile) {
  const result = structuredClone(schema);
  const firm = result['@graph'].find(item => [item['@type']].flat().includes('LegalService'));
  if (!firm) throw new Error('Faltan los datos estructurados del despacho.');
  const { hours, practiceAreas } = confirmedDetails(profile);
  if (hours.length) firm.openingHoursSpecification = hours.map(({ days, opens, closes }) => ({
    '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens, closes,
  }));
  if (practiceAreas.length) firm.hasOfferCatalog = {
    '@type': 'OfferCatalog', name: 'Áreas de práctica',
    itemListElement: practiceAreas.map(({ name, description }) => ({
      '@type': 'Offer', itemOffered: { '@type': 'Service', name, description },
    })),
  };
  return result;
}
