const base = './public/credentials/';
export const credentialGroups = [
  { name: 'Luis Mario Ramos Amador', licenses: [
    { label: 'Cédula federal · Licenciatura en Derecho', number: '6648774' },
    { label: 'Cédula federal · Maestría en Amparo', number: '12931063' },
    { label: 'Cédula estatal · Sonora', number: 'PCS295', note: 'El documento proporcionado indica vigencia hasta el 8 de diciembre de 2020. No acredita vigencia actual.' },
  ], documents: [
    { id: 'luis-maestria-titulo', title: 'Título de maestría', detail: 'Maestría en Amparo · Anverso y reverso', pages: ['luis-maestria-titulo-1.jpg', 'luis-maestria-titulo-2.jpg'] },
  ]},
  { name: 'José Cuitlahuac Castro Silva', licenses: [
    { label: 'Cédula federal · Licenciatura en Derecho', number: '1705996' },
  ], documents: [
    { id: 'jose-titulo', title: 'Título de licenciatura', detail: 'Licenciatura en Derecho · Anverso y reverso', pages: ['jose-titulo-1.jpg', 'jose-titulo-2.jpg'] },
  ]},
];
export const credentialPage = page => base + page;
