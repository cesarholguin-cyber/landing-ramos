export const whatsappNumber = '526622123568';
export const whatsappOptions = [
  { id: 'cita', label: 'Quiero agendar una cita', detail: 'Consultar disponibilidad del despacho.', message: 'Buen día, Ramos & Asociados. Me gustaría agendar una cita. ¿Podrían indicarme su disponibilidad?' },
  { id: 'informacion', label: 'Quiero pedir información', detail: 'Conocer cómo pueden acompañarme.', message: 'Buen día, Ramos & Asociados. Me gustaría recibir información sobre sus servicios y cómo pueden acompañarme.' },
  { id: 'consulta', label: 'Quiero consultar un asunto', detail: 'Solicitar una primera conversación.', message: 'Buen día, Ramos & Asociados. Me gustaría solicitar una primera conversación con un abogado para consultar un asunto. ¿Cómo podemos coordinarla?' },
  { id: 'seguimiento', label: 'Quiero dar seguimiento', detail: 'Retomar el contacto con el despacho.', message: 'Buen día, Ramos & Asociados. Me gustaría dar seguimiento a un asunto que ya he consultado con el despacho. ¿Podrían orientarme para retomarlo?' },
];

export function whatsappLink(id) {
  const option = whatsappOptions.find(item => item.id === id);
  return option ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(option.message)}` : null;
}
