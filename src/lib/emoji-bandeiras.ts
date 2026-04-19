// ----------------------------------------------------------------
// Código FIFA (3 letras) → emoji de bandeira (fallback mobile/Mac)
// ----------------------------------------------------------------
const EMOJI_POR_CODIGO: Record<string, string> = {
  BRA: '🇧🇷', ARG: '🇦🇷', URU: '🇺🇾', COL: '🇨🇴',
  ECU: '🇪🇨', CHI: '🇨🇱', PAR: '🇵🇾', PER: '🇵🇪',
  VEN: '🇻🇪', BOL: '🇧🇴',
  USA: '🇺🇸', MEX: '🇲🇽', CAN: '🇨🇦',
  CRC: '🇨🇷', JAM: '🇯🇲', PAN: '🇵🇦', HON: '🇭🇳',
  HAI: '🇭🇹', CUW: '🇨🇼', TRI: '🇹🇹',
  FRA: '🇫🇷', ESP: '🇪🇸', GER: '🇩🇪', POR: '🇵🇹',
  NED: '🇳🇱', BEL: '🇧🇪', ITA: '🇮🇹', SUI: '🇨🇭',
  CRO: '🇭🇷', SRB: '🇷🇸', POL: '🇵🇱', DEN: '🇩🇰',
  AUT: '🇦🇹', SVK: '🇸🇰', HUN: '🇭🇺', ROU: '🇷🇴',
  UKR: '🇺🇦', TUR: '🇹🇷', GRE: '🇬🇷', SLO: '🇸🇮',
  NOR: '🇳🇴', SWE: '🇸🇪', CZE: '🇨🇿', BIH: '🇧🇦',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  MAR: '🇲🇦', SEN: '🇸🇳', NGA: '🇳🇬', CIV: '🇨🇮',
  GHA: '🇬🇭', CMR: '🇨🇲', EGY: '🇪🇬', TUN: '🇹🇳',
  ALG: '🇩🇿', RSA: '🇿🇦', CPV: '🇨🇻', COD: '🇨🇩',
  JPN: '🇯🇵', KOR: '🇰🇷', IRN: '🇮🇷', AUS: '🇦🇺',
  KSA: '🇸🇦', QAT: '🇶🇦', UZB: '🇺🇿', JOR: '🇯🇴',
  IRQ: '🇮🇶', NZL: '🇳🇿',
}

// ----------------------------------------------------------------
// Código FIFA → código ISO 3166-1 alpha-2 (para URL da bandeira)
// ----------------------------------------------------------------
const ISO2_POR_CODIGO: Record<string, string> = {
  BRA: 'br', ARG: 'ar', URU: 'uy', COL: 'co',
  ECU: 'ec', CHI: 'cl', PAR: 'py', PER: 'pe',
  VEN: 've', BOL: 'bo',
  USA: 'us', MEX: 'mx', CAN: 'ca',
  CRC: 'cr', JAM: 'jm', PAN: 'pa', HON: 'hn',
  HAI: 'ht', CUW: 'cw', TRI: 'tt',
  FRA: 'fr', ESP: 'es', GER: 'de', POR: 'pt',
  NED: 'nl', BEL: 'be', ITA: 'it', SUI: 'ch',
  CRO: 'hr', SRB: 'rs', POL: 'pl', DEN: 'dk',
  AUT: 'at', SVK: 'sk', HUN: 'hu', ROU: 'ro',
  UKR: 'ua', TUR: 'tr', GRE: 'gr', SLO: 'si',
  NOR: 'no', SWE: 'se', CZE: 'cz', BIH: 'ba',
  // UK nations — flagcdn suporta subdivisões
  ENG: 'gb-eng', SCO: 'gb-sct', WAL: 'gb-wls',
  MAR: 'ma', SEN: 'sn', NGA: 'ng', CIV: 'ci',
  GHA: 'gh', CMR: 'cm', EGY: 'eg', TUN: 'tn',
  ALG: 'dz', RSA: 'za', CPV: 'cv', COD: 'cd',
  JPN: 'jp', KOR: 'kr', IRN: 'ir', AUS: 'au',
  KSA: 'sa', QAT: 'qa', UZB: 'uz', JOR: 'jo',
  IRQ: 'iq', NZL: 'nz',
}

// ----------------------------------------------------------------
// Nome em inglês → código FIFA
// ----------------------------------------------------------------
export const NOME_PARA_CODIGO: Record<string, string> = {
  'Brazil': 'BRA', 'Argentina': 'ARG', 'Uruguay': 'URU', 'Colombia': 'COL',
  'Ecuador': 'ECU', 'Chile': 'CHI', 'Paraguay': 'PAR', 'Peru': 'PER',
  'Venezuela': 'VEN', 'Bolivia': 'BOL',
  'USA': 'USA', 'United States': 'USA', 'Mexico': 'MEX', 'Canada': 'CAN',
  'Costa Rica': 'CRC', 'Jamaica': 'JAM', 'Panama': 'PAN', 'Honduras': 'HON',
  'Haiti': 'HAI', 'Curaçao': 'CUW', 'Trinidad and Tobago': 'TRI',
  'France': 'FRA', 'Spain': 'ESP', 'Germany': 'GER', 'Portugal': 'POR',
  'Netherlands': 'NED', 'Belgium': 'BEL', 'Italy': 'ITA', 'Switzerland': 'SUI',
  'Croatia': 'CRO', 'Serbia': 'SRB', 'Poland': 'POL', 'Denmark': 'DEN',
  'Austria': 'AUT', 'Slovakia': 'SVK', 'Hungary': 'HUN', 'Romania': 'ROU',
  'Ukraine': 'UKR', 'Turkey': 'TUR', 'Greece': 'GRE', 'Slovenia': 'SLO',
  'Norway': 'NOR', 'Sweden': 'SWE', 'Czech Republic': 'CZE', 'Czechia': 'CZE',
  'Bosnia & Herzegovina': 'BIH', 'Bosnia and Herzegovina': 'BIH',
  'England': 'ENG', 'Scotland': 'SCO', 'Wales': 'WAL',
  'Morocco': 'MAR', 'Senegal': 'SEN', 'Nigeria': 'NGA', 'Ivory Coast': 'CIV',
  "Côte d'Ivoire": 'CIV', 'Ghana': 'GHA', 'Cameroon': 'CMR', 'Egypt': 'EGY',
  'Tunisia': 'TUN', 'Algeria': 'ALG', 'South Africa': 'RSA', 'Cape Verde': 'CPV',
  'DR Congo': 'COD',
  'Japan': 'JPN', 'South Korea': 'KOR', 'Iran': 'IRN', 'Australia': 'AUS',
  'Saudi Arabia': 'KSA', 'Qatar': 'QAT', 'Uzbekistan': 'UZB', 'Jordan': 'JOR',
  'Iraq': 'IRQ', 'New Zealand': 'NZL',
}

// ----------------------------------------------------------------
// Nome em inglês → nome em português
// ----------------------------------------------------------------
export const NOME_PT_BR: Record<string, string> = {
  'Brazil': 'Brasil', 'Argentina': 'Argentina', 'Uruguay': 'Uruguai',
  'Colombia': 'Colômbia', 'Ecuador': 'Equador', 'Chile': 'Chile',
  'Paraguay': 'Paraguai', 'Peru': 'Peru', 'Venezuela': 'Venezuela',
  'Bolivia': 'Bolívia',
  'USA': 'Estados Unidos', 'United States': 'Estados Unidos',
  'Mexico': 'México', 'Canada': 'Canadá',
  'Costa Rica': 'Costa Rica', 'Jamaica': 'Jamaica', 'Panama': 'Panamá',
  'Honduras': 'Honduras', 'Haiti': 'Haiti',
  "Curaçao": 'Curaçao', 'Trinidad and Tobago': 'Trinidad e Tobago',
  'France': 'França', 'Spain': 'Espanha', 'Germany': 'Alemanha',
  'Portugal': 'Portugal', 'Netherlands': 'Holanda', 'Belgium': 'Bélgica',
  'Italy': 'Itália', 'Switzerland': 'Suíça', 'Croatia': 'Croácia',
  'Serbia': 'Sérvia', 'Poland': 'Polônia', 'Denmark': 'Dinamarca',
  'Austria': 'Áustria', 'Slovakia': 'Eslováquia', 'Hungary': 'Hungria',
  'Romania': 'Romênia', 'Ukraine': 'Ucrânia', 'Turkey': 'Turquia',
  'Greece': 'Grécia', 'Slovenia': 'Eslovênia', 'Norway': 'Noruega',
  'Sweden': 'Suécia', 'Czech Republic': 'República Tcheca', 'Czechia': 'República Tcheca',
  'Bosnia & Herzegovina': 'Bósnia e Herzegovina',
  'England': 'Inglaterra', 'Scotland': 'Escócia', 'Wales': 'País de Gales',
  'Morocco': 'Marrocos', 'Senegal': 'Senegal', 'Nigeria': 'Nigéria',
  'Ivory Coast': 'Costa do Marfim', "Côte d'Ivoire": 'Costa do Marfim',
  'Ghana': 'Gana', 'Cameroon': 'Camarões', 'Egypt': 'Egito',
  'Tunisia': 'Tunísia', 'Algeria': 'Argélia', 'South Africa': 'África do Sul',
  'Cape Verde': 'Cabo Verde', 'DR Congo': 'Rep. Dem. do Congo',
  'Japan': 'Japão', 'South Korea': 'Coreia do Sul', 'Iran': 'Irã',
  'Australia': 'Austrália', 'Saudi Arabia': 'Arábia Saudita', 'Qatar': 'Catar',
  'Uzbekistan': 'Uzbequistão', 'Jordan': 'Jordânia', 'Iraq': 'Iraque',
  'New Zealand': 'Nova Zelândia',
}

// ----------------------------------------------------------------
// Funções exportadas
// ----------------------------------------------------------------

export function emojiBandeira(codigo: string): string {
  return EMOJI_POR_CODIGO[codigo?.toUpperCase()] ?? '🏳️'
}

export function urlBandeira(codigo: string): string {
  const iso2 = ISO2_POR_CODIGO[codigo?.toUpperCase()]
  if (!iso2) return ''
  return `https://flagcdn.com/w40/${iso2}.png`
}

export function codigoDoNome(nome: string): string {
  return NOME_PARA_CODIGO[nome] ?? nome.substring(0, 3).toUpperCase()
}

export function nomePtBr(nomeIngles: string): string {
  return NOME_PT_BR[nomeIngles] ?? nomeIngles
}
