-- ============================================================
-- Copa 2026 do Cecone — Schema Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- --------------------------------------------------------
-- Seleções (times participantes)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS selecoes (
  id          INTEGER PRIMARY KEY,   -- ID do API-Football
  nome        TEXT    NOT NULL,
  codigo      TEXT    NOT NULL,      -- ex: BRA, ARG, FRA
  bandeira    TEXT    NOT NULL DEFAULT '', -- emoji da bandeira
  bandeira_url TEXT   DEFAULT '',    -- URL da imagem (usado pelo admin)
  grupo       TEXT                   -- 'A' a 'L' (fase de grupos)
);

ALTER TABLE selecoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de seleções"
  ON selecoes FOR SELECT USING (true);

-- --------------------------------------------------------
-- Partidas (grupos + eliminatórias)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS partidas (
  id                    INTEGER PRIMARY KEY,  -- fixture ID do API-Football
  fase                  TEXT    NOT NULL,     -- 'Grupo A', 'Oitavas de Final', etc.
  fase_tipo             TEXT    NOT NULL,     -- 'grupos'|'rodada32'|'oitavas'|'quartas'|'semi'|'terceiro'|'final'
  data_hora             TIMESTAMPTZ,
  selecao_casa_id       INTEGER REFERENCES selecoes(id),
  selecao_fora_id       INTEGER REFERENCES selecoes(id),
  gols_casa             INTEGER,
  gols_fora             INTEGER,
  penaltis_casa         INTEGER,
  penaltis_fora         INTEGER,
  status                TEXT    NOT NULL DEFAULT 'agendada', -- 'agendada'|'ao_vivo'|'encerrada'
  minuto                INTEGER,
  encerrada             BOOLEAN NOT NULL DEFAULT FALSE,
  corrigida_manualmente BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de partidas"
  ON partidas FOR SELECT USING (true);

-- --------------------------------------------------------
-- Classificação dos grupos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS classificacao_grupos (
  selecao_id     INTEGER PRIMARY KEY REFERENCES selecoes(id),
  grupo          TEXT    NOT NULL,  -- 'A' a 'L'
  posicao        INTEGER NOT NULL DEFAULT 0,
  jogos          INTEGER NOT NULL DEFAULT 0,
  vitorias       INTEGER NOT NULL DEFAULT 0,
  empates        INTEGER NOT NULL DEFAULT 0,
  derrotas       INTEGER NOT NULL DEFAULT 0,
  gols_marcados  INTEGER NOT NULL DEFAULT 0,
  gols_sofridos  INTEGER NOT NULL DEFAULT 0,
  saldo          INTEGER NOT NULL DEFAULT 0,
  pontos         INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE classificacao_grupos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de classificação"
  ON classificacao_grupos FOR SELECT USING (true);

-- --------------------------------------------------------
-- Bolão — grupos privados
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS grupos_bolao (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT    NOT NULL,
  codigo_convite  TEXT    NOT NULL UNIQUE,
  criado_por      UUID    NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE grupos_bolao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membro lê seu grupo"
  ON grupos_bolao FOR SELECT
  USING (
    id IN (SELECT grupo_id FROM membros_grupo WHERE user_id = auth.uid())
  );

-- --------------------------------------------------------
-- Bolão — membros dos grupos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS membros_grupo (
  id        SERIAL  PRIMARY KEY,
  grupo_id  UUID    NOT NULL REFERENCES grupos_bolao(id),
  user_id   UUID    NOT NULL REFERENCES auth.users(id),
  UNIQUE(grupo_id, user_id)
);

ALTER TABLE membros_grupo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membro vê membros do seu grupo"
  ON membros_grupo FOR SELECT
  USING (
    grupo_id IN (SELECT grupo_id FROM membros_grupo WHERE user_id = auth.uid())
  );
CREATE POLICY "Usuário entra em grupo"
  ON membros_grupo FOR INSERT WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------
-- Bolão — palpites de partidas
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS palpites (
  id          SERIAL  PRIMARY KEY,
  user_id     UUID    NOT NULL REFERENCES auth.users(id),
  grupo_id    UUID    NOT NULL REFERENCES grupos_bolao(id),
  partida_id  INTEGER NOT NULL REFERENCES partidas(id),
  gols_casa   INTEGER NOT NULL,
  gols_fora   INTEGER NOT NULL,
  UNIQUE(user_id, grupo_id, partida_id)
);

ALTER TABLE palpites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê palpites do seu grupo"
  ON palpites FOR SELECT
  USING (
    grupo_id IN (SELECT grupo_id FROM membros_grupo WHERE user_id = auth.uid())
  );
CREATE POLICY "Usuário insere ou atualiza seus palpites"
  ON palpites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuário atualiza seus palpites"
  ON palpites FOR UPDATE USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- Bolão — palpites especiais (campeão e artilheiro)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS palpites_especiais (
  id            SERIAL  PRIMARY KEY,
  user_id       UUID    NOT NULL REFERENCES auth.users(id),
  grupo_id      UUID    NOT NULL REFERENCES grupos_bolao(id),
  campeao_id    INTEGER REFERENCES selecoes(id),
  artilheiro_id INTEGER REFERENCES selecoes(id), -- simplificado: seleção do artilheiro
  UNIQUE(user_id, grupo_id)
);

ALTER TABLE palpites_especiais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê palpites especiais do seu grupo"
  ON palpites_especiais FOR SELECT
  USING (
    grupo_id IN (SELECT grupo_id FROM membros_grupo WHERE user_id = auth.uid())
  );
CREATE POLICY "Usuário insere palpite especial"
  ON palpites_especiais FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuário atualiza palpite especial"
  ON palpites_especiais FOR UPDATE USING (auth.uid() = user_id);
