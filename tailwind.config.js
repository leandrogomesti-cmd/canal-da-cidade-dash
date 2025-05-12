/** 
 * Se você quiser usar as cores exatas do design mostrado na imagem,
 * adicione estas configurações ao seu arquivo tailwind.config.js:
 */

module.exports = {
    theme: {
      extend: {
        colors: {
          'navy': {
            900: '#0f172a', // Cor do título "Bem vindo!" 
          },
          'cyan': {
            500: '#06b6d4', // Cor principal do botão e logo
            600: '#0891b2', // Cor do botão quando hover
          }
        }
      }
    },
    // restante da sua configuração
  }