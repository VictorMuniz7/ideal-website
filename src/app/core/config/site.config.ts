/**
 * Fonte única do conteúdo do site.
 *
 * Todo texto comercial, contato, horário e link sai daqui — os templates só
 * organizam a apresentação. Para mudar o site no dia a dia, este é o único
 * arquivo que precisa ser editado.
 *
 * Itens marcados com `// DEFINIR:` aguardam confirmação antes da publicação.
 */

export interface Analise {
  readonly id: string;
  readonly icone: IconeAnalise;
  readonly titulo: string;
  readonly resumo: string;
  readonly itens: readonly string[];
  readonly mensagemWhats: string;
}

export type IconeAnalise = 'quimica' | 'fisica' | 'ph' | 'foliar';

export interface PassoColeta {
  readonly numero: number;
  readonly titulo: string;
  readonly texto: string;
  readonly observacao?: string;
  /** Nome-base da ilustração em `public/img/` (sem extensão). Sem ilustração, usa o desenho vetorial. */
  readonly ilustracao?: string;
  readonly proporcao?: string;
  readonly alt: string;
}

export interface Pergunta {
  readonly pergunta: string;
  readonly resposta: string;
}

export interface Horario {
  readonly dias: string;
  readonly periodos: readonly string[];
  /** Para o JSON-LD (schema.org/DayOfWeek). */
  readonly diasSchema: readonly string[];
  readonly intervalos: readonly { readonly abre: string; readonly fecha: string }[];
}

const WHATSAPP_E164 = '5515991287775';

export const SITE = {
  empresa: {
    nome: 'Ideal Análises',
    razaoSocial: 'IDEAL Análises Agrícolas e Técnicas LTDA',
    slogan: 'Análises agrícolas e técnicas',
    cidade: 'Sorocaba',
    uf: 'SP',
  },

  /**
   * DEFINIR: domínio próprio (ex.: 'https://www.idealanalises.com.br/').
   * Enquanto estiver vazio, o site não publica URL canônica, robots.txt nem
   * sitemap — melhor não anunciar um endereço que ainda não existe.
   */
  dominio: '',

  /**
   * Endereço onde o site está publicado agora (pode ser o link provisório da
   * Vercel). Usado para montar o endereço absoluto da imagem de compartilhamento,
   * que o WhatsApp exige. Quando o domínio existir, use o mesmo valor dele.
   */
  urlPublicacao: 'https://ideal-website-tau.vercel.app/',

  seo: {
    titulo: 'Ideal Análises | Laboratório de análise de solo em Sorocaba/SP',
    descricao:
      'Laboratório de análise de solo e foliar em Sorocaba/SP: análise química, física (granulometria) e de pH. ' +
      'Veja como coletar a amostra e peça seu orçamento pelo WhatsApp.',
  },

  contato: {
    whatsapp: { exibicao: '(15) 99128-7775', e164: WHATSAPP_E164 },
    telefone: { exibicao: '(15) 3227-1120', link: 'tel:+551532271120', e164: '+551532271120' },
    email: 'idealanalises1@gmail.com',
    instagram: { usuario: '@ideal_analises', url: 'https://www.instagram.com/ideal_analises/' },
  },

  endereco: {
    logradouro: 'Rua Guilherme Penha, 75, Bloco 3',
    bairro: 'Vila Colorau',
    cidade: 'Sorocaba',
    uf: 'SP',
    cep: '18020-615',
    latitude: -23.511844,
    longitude: -47.433072,
    /** Embed oficial do Google Maps — só é carregado quando o visitante pede. */
    mapaEmbed:
      'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3658.5741341996463!2d-47.433072!3d-23.511844!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cf61074fc50451%3A0xfb191c4d5818f9e4!2sIDEAL%20An%C3%A1lises%20Agr%C3%ADcolas%20e%20T%C3%A9cnicas%20LTDA!5e0!3m2!1spt-BR!2sbr!4v1791989907793!5m2!1spt-BR!2sbr',
    mapaLink:
      'https://www.google.com/maps/search/?api=1&query=IDEAL%20An%C3%A1lises%20Agr%C3%ADcolas%20e%20T%C3%A9cnicas%20LTDA%2C%20Rua%20Guilherme%20Penha%2C%2075%2C%20Sorocaba%20-%20SP',
    rotaLink:
      'https://www.google.com/maps/dir/?api=1&destination=Rua%20Guilherme%20Penha%2C%2075%2C%20Vila%20Colorau%2C%20Sorocaba%20-%20SP%2C%2018020-615',
  },

  // DEFINIR: confirmar com o laboratório — horário transcrito do aviso na porta.
  // O aviso diz "6ª até às 16:00"; considerado o mesmo período da manhã.
  horarios: [
    {
      dias: 'Segunda a quinta',
      periodos: ['7h às 11h', '13h às 17h'],
      diasSchema: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      intervalos: [
        { abre: '07:00', fecha: '11:00' },
        { abre: '13:00', fecha: '17:00' },
      ],
    },
    {
      dias: 'Sexta',
      periodos: ['7h às 11h', '13h às 16h'],
      diasSchema: ['Friday'],
      intervalos: [
        { abre: '07:00', fecha: '11:00' },
        { abre: '13:00', fecha: '16:00' },
      ],
    },
  ] as readonly Horario[],

  mensagens: {
    padrao: 'Olá! Vim pelo site da Ideal Análises e gostaria de mais informações.',
    heroi: 'Olá! Vim pelo site da Ideal Análises e gostaria de solicitar uma análise de solo.',
    coleta: 'Olá! Vi o passo a passo no site e tenho uma dúvida sobre como coletar a amostra de solo.',
    duvidas: 'Olá! Tenho uma dúvida sobre as análises da Ideal.',
    contato: 'Olá! Vim pelo site da Ideal Análises e gostaria de um orçamento.',
  },

  navegacao: [
    { id: 'analises', rotulo: 'Análises' },
    { id: 'coleta', rotulo: 'Como coletar' },
    { id: 'duvidas', rotulo: 'Dúvidas' },
    { id: 'contato', rotulo: 'Contato' },
  ],

  heroi: {
    selo: 'Laboratório de análise de solo · Sorocaba/SP',
    titulo: 'Conheça o seu solo antes de adubar',
    texto:
      'Análises químicas, físicas e foliares com resultados claros, para você corrigir e adubar ' +
      'na medida certa — sem desperdiçar insumo e sem chutar a dose.',
    ctaPrincipal: 'Solicitar análise',
    ctaSecundario: 'Como coletar a amostra',
    destaques: ['Resultado em 7 a 10 dias', 'Amostras de todo o Brasil', 'Atendimento direto pelo WhatsApp'],
    legendaIlustracao: 'Camada amostrada: um palmo de profundidade',
  },

  sobre: {
    sobretitulo: 'Sobre o laboratório',
    titulo: 'Um laboratório perto de quem planta',
    paragrafos: [
      // DEFINIR: confirmar com o cliente o tempo de mercado (o site anterior dizia "mais de 25 anos").
      'A Ideal Análises Agrícolas e Técnicas é um laboratório de Sorocaba/SP com mais de 25 anos de ' +
        'experiência no mercado agrícola. Analisamos solo e tecido vegetal para agricultores, produtores ' +
        'e profissionais do campo.',
      'O foco é precisão e atendimento personalizado: você entrega a amostra no laboratório ou envia de ' +
        'qualquer região do Brasil, e recebe um resultado que serve de base para a calagem e a adubação.',
    ],
    altFoto:
      'Entrada do laboratório Ideal: porta de vidro com o nome IDEAL em letras verdes e, ao fundo, a recepção.',
    rotuloEndereco: 'Onde estamos',
    rotuloHorario: 'Horário de atendimento',
  },

  analises: {
    sobretitulo: 'O que analisamos',
    titulo: 'Análises de solo e de folhas',
    introducao:
      'Cada análise responde a uma pergunta diferente sobre a sua área. Na dúvida sobre qual pedir, ' +
      'chame no WhatsApp e a gente orienta.',
    rotuloCta: 'Pedir orçamento',
    itens: [
      {
        id: 'quimica',
        icone: 'quimica',
        titulo: 'Análise química do solo',
        resumo: 'Mostra quais nutrientes estão disponíveis e quais faltam — a base de toda recomendação de adubação.',
        itens: ['Macronutrientes', 'Micronutrientes'],
        mensagemWhats: 'Olá! Gostaria de um orçamento de análise química do solo.',
      },
      {
        id: 'fisica',
        icone: 'fisica',
        titulo: 'Análise física (granulometria)',
        resumo: 'Determina a textura do solo pela proporção de cada tamanho de partícula.',
        itens: ['Areia grossa e areia fina', 'Silte', 'Argila'],
        mensagemWhats: 'Olá! Gostaria de um orçamento de análise física (granulometria) do solo.',
      },
      {
        id: 'ph',
        icone: 'ph',
        titulo: 'Análise de pH',
        resumo: 'Mede o nível de acidez ou alcalinidade do solo — o ponto de partida para decidir a calagem.',
        itens: ['Acidez do solo', 'Alcalinidade do solo'],
        mensagemWhats: 'Olá! Gostaria de um orçamento de análise de pH do solo.',
      },
      {
        id: 'foliar',
        icone: 'foliar',
        titulo: 'Análise de folhas e tecido vegetal',
        resumo:
          'Avalia o estado nutricional da planta durante o ciclo: identifica deficiências e a presença de patógenos.',
        itens: ['Conteúdo nutricional', 'Deficiências de nutrientes', 'Presença de patógenos'],
        mensagemWhats: 'Olá! Gostaria de um orçamento de análise foliar (tecido vegetal).',
      },
    ] as readonly Analise[],
  },

  coleta: {
    sobretitulo: 'Passo a passo',
    rotulosGlebas: ['Alto', 'Encosta', 'Baixada'],
    titulo: 'Como coletar a amostra de solo',
    introducao:
      'O resultado da análise só é tão bom quanto a amostra. São sete passos simples — dá para fazer ' +
      'com uma enxada, um balde limpo e um saquinho.',
    rotuloPdf: 'Baixar o guia em PDF',
    pdf: 'guia-coleta-de-solo.pdf',
    pdfTamanho: 'PDF, 520 KB',
    /** Usado só no PDF impresso, ao lado do QR code do WhatsApp. */
    textoQrPdf: 'Aponte a câmera do celular para o código e fale com o laboratório pelo WhatsApp.',
    rotuloDuvida: 'Ficou com dúvida em algum passo?',
    textoDuvida: 'A equipe explica pelo WhatsApp antes de você ir a campo.',
    rotuloCtaDuvida: 'Tirar dúvida',
    passos: [
      {
        numero: 1,
        titulo: 'Divida a área em glebas',
        texto:
          'Separe a área em glebas uniformes quanto à localização (baixada, encosta, alto), vegetação, ' +
          'manejo, cor e textura do solo. É preciso tirar uma amostra para cada tipo de terra.',
        alt: 'Desenho de uma propriedade dividida em três glebas: alto, encosta e baixada.',
      },
      {
        numero: 2,
        titulo: 'Limpe e cave',
        texto:
          'Definidos os pontos de amostragem, limpe o local escolhido, retirando capim, pedras e sujeira. ' +
          'Depois cave um buraco de um palmo de profundidade.',
        ilustracao: 'passo-2',
        proporcao: '320 / 368',
        alt: 'Mão medindo um palmo de profundidade dentro de uma cova aberta no solo.',
      },
      {
        numero: 3,
        titulo: 'Corte uma fatia da parede',
        texto: 'Corte uma faixa de terra de cima a baixo, numa das paredes da cova, com 2 a 3 dedos de espessura.',
        ilustracao: 'passo-3',
        proporcao: '313 / 328',
        alt: 'Pessoa cortando com a enxada uma fatia da parede da cova.',
      },
      {
        numero: 4,
        titulo: 'Repita em zigue-zague',
        texto:
          'Repita a operação em 15 a 20 lugares diferentes da mesma área, caminhando sempre em zigue-zague.',
        ilustracao: 'passo-4',
        proporcao: '284 / 366',
        alt: 'Mapa de glebas com linhas em zigue-zague ligando os pontos de coleta.',
      },
      {
        numero: 5,
        titulo: 'Misture no balde',
        texto: 'Coloque todas as amostras dentro de um balde limpo e misture bem a terra.',
        ilustracao: 'passo-5',
        proporcao: '307 / 456',
        alt: 'Agricultor agachado misturando a terra dentro de um balde.',
      },
      {
        numero: 6,
        titulo: 'Embale e identifique',
        texto:
          'Escreva no saquinho as informações solicitadas, coloque nele a amostra, amarre a boca do saco ' +
          'e envie ao laboratório.',
        observacao: 'Quantidade: de 300 a 500 gramas por amostra.',
        ilustracao: 'passo-6',
        proporcao: '330 / 330',
        alt: 'Mãos segurando um saquinho de amostra amarrado, com a etiqueta sendo preenchida.',
      },
      {
        numero: 7,
        titulo: 'Anote para o seu controle',
        texto:
          'Anote num caderno o número de cada amostra e o local de onde foi retirada, para consultar ' +
          'quando for adubar e corrigir o solo.',
        ilustracao: 'passo-7',
        proporcao: '312 / 380',
        alt: 'Caderno espiral com as anotações "Amostra 1", "Amostra 2" e "Amostra 3".',
      },
    ] as readonly PassoColeta[],
  },

  duvidas: {
    sobretitulo: 'Dúvidas',
    titulo: 'Perguntas frequentes',
    introducao: 'O que mais perguntam antes de mandar a primeira amostra.',
    rotuloCta: 'Não achou sua dúvida? Fale com a gente',
    itens: [
      {
        pergunta: 'Quanto tempo demora o resultado?',
        // DEFINIR: confirmar prazo atual com o laboratório.
        resposta: 'Normalmente de 7 a 10 dias depois que a amostra chega ao laboratório, conforme o tipo de análise.',
      },
      {
        pergunta: 'Qual a melhor época para coletar?',
        resposta:
          'Antes do plantio ou quando for planejar a adubação. Coletando com antecedência, dá tempo de ' +
          'receber o resultado e programar a correção do solo.',
      },
      {
        pergunta: 'Quanta terra preciso mandar?',
        resposta:
          'De 300 a 500 gramas por amostra, em um saquinho limpo, bem amarrado e identificado. ' +
          'Cada gleba diferente da área é uma amostra separada.',
      },
      {
        pergunta: 'Moro em outra cidade. Posso enviar a amostra?',
        resposta:
          'Pode. O laboratório atende clientes de todas as regiões do Brasil. Chame no WhatsApp antes de ' +
          'enviar para combinar a melhor forma de envio.',
      },
      {
        pergunta: 'Posso entregar a amostra pessoalmente?',
        resposta:
          'Sim. O laboratório fica na Rua Guilherme Penha, 75, Bloco 3, Vila Colorau, em Sorocaba/SP. ' +
          'Confira o horário de atendimento logo abaixo, na seção de contato.',
      },
      {
        pergunta: 'Quanto custa uma análise?',
        resposta:
          'Depende do tipo de análise e da quantidade de amostras. Mande pelo WhatsApp o que você precisa ' +
          'e a equipe passa o orçamento.',
      },
    ] as readonly Pergunta[],
  },

  contatoSecao: {
    sobretitulo: 'Contato',
    titulo: 'Fale com o laboratório',
    introducao: 'Orçamento, dúvida sobre a coleta ou sobre o resultado: o jeito mais rápido é o WhatsApp.',
    rotuloWhats: 'WhatsApp',
    rotuloTelefone: 'Telefone',
    rotuloEmail: 'E-mail',
    rotuloInstagram: 'Instagram',
    rotuloCtaWhats: 'Chamar no WhatsApp',
    rotuloMapa: 'Mostrar mapa',
    avisoMapa: 'O mapa é carregado do Google Maps só quando você pede.',
    rotuloAbrirMapa: 'Abrir no Google Maps',
    rotuloRota: 'Traçar rota',
    tituloMapa: 'Mapa com a localização do laboratório Ideal Análises em Sorocaba/SP',
  },

  rodape: {
    direitos: 'Todos os direitos reservados.',
    // DEFINIR: CNPJ, se o cliente quiser exibir.
    cnpj: '',
  },
} as const;

/** Monta o link do WhatsApp com a mensagem já escrita. */
export function linkWhatsapp(mensagem: string = SITE.mensagens.padrao): string {
  return `https://wa.me/${SITE.contato.whatsapp.e164}?text=${encodeURIComponent(mensagem)}`;
}
