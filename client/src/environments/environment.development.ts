// Colocar la IP del ordenador propio para poder entrar desde el movil
// mientas no se publique el proyecto en el servidor y haya IP fijo
const IP = 'localhost';

export const environment = {
  production: false,
  apiUrl: `http://${IP}:8000/api/`,
};
