-- =============================================
-- Copa 2026 do Cecone — Schema do banco de dados
-- =============================================

-- Seleções participantes
create table selecoes (
  id serial primary key,
  nome text not null,
  codigo text not null unique, -- ex: BRA, ARG, FRA
  grupo text, -- A, B, C... (null nas fases eliminatórias)
  bandeira_url text
);

-- Partidas (fase de grupos + eliminatórias)
create table partidas (
  id serial primary key,
  fase text not null, -- 'grupos', 'oitavas', 'quartas', 'semi', 'final'
  data_hora timestamptz,
  selecao_casa_id integer references selecoes(id),
  selecao_fora_id integer references selecoes(id),
  gols_casa integer,
  gols_fora integer,
  encerrada boolean default false,
  corrigida_manualmente boolean default false,
  api_match_id text -- id da partida na API externa
);

-- Artilheiro do torneio
create table artilheiros (
  id serial primary key,
  nome text not null,
  selecao_id integer references selecoes(id),
  gols integer default 0
);

-- Grupos do bolão
create table grupos_bolao (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  codigo_convite text not null unique,
  criado_por uuid references auth.users(id),
  criado_em timestamptz default now()
);

-- Membros dos grupos
create table membros_grupo (
  id serial primary key,
  grupo_id uuid references grupos_bolao(id) on delete cascade,
  user_id uuid references auth.users(id),
  entrou_em timestamptz default now(),
  unique(grupo_id, user_id)
);

-- Palpites de partidas
create table palpites (
  id serial primary key,
  user_id uuid references auth.users(id),
  grupo_id uuid references grupos_bolao(id),
  partida_id integer references partidas(id),
  gols_casa integer not null,
  gols_fora integer not null,
  criado_em timestamptz default now(),
  unique(user_id, grupo_id, partida_id)
);

-- Palpites especiais (artilheiro e campeão)
create table palpites_especiais (
  id serial primary key,
  user_id uuid references auth.users(id),
  grupo_id uuid references grupos_bolao(id),
  campeao_id integer references selecoes(id),
  artilheiro_id integer references artilheiros(id),
  criado_em timestamptz default now(),
  unique(user_id, grupo_id)
);

-- =============================================
-- Segurança: quem pode ver e editar o quê
-- =============================================

alter table selecoes enable row level security;
alter table partidas enable row level security;
alter table artilheiros enable row level security;
alter table grupos_bolao enable row level security;
alter table membros_grupo enable row level security;
alter table palpites enable row level security;
alter table palpites_especiais enable row level security;

-- Qualquer um pode ver seleções, partidas e artilheiros
create policy "publico pode ver selecoes" on selecoes for select using (true);
create policy "publico pode ver partidas" on partidas for select using (true);
create policy "publico pode ver artilheiros" on artilheiros for select using (true);

-- Usuário autenticado vê grupos que participa
create policy "membro ve grupo" on grupos_bolao for select
  using (id in (select grupo_id from membros_grupo where user_id = auth.uid()));

-- Usuário autenticado cria grupos
create policy "usuario cria grupo" on grupos_bolao for insert
  with check (auth.uid() = criado_por);

-- Membro ve outros membros do mesmo grupo
create policy "membro ve membros" on membros_grupo for select
  using (grupo_id in (select grupo_id from membros_grupo where user_id = auth.uid()));

-- Usuário entra em grupo
create policy "usuario entra em grupo" on membros_grupo for insert
  with check (auth.uid() = user_id);

-- Usuário ve e faz seus próprios palpites
create policy "usuario ve palpites" on palpites for select
  using (grupo_id in (select grupo_id from membros_grupo where user_id = auth.uid()));
create policy "usuario faz palpite" on palpites for insert
  with check (auth.uid() = user_id);
create policy "usuario edita palpite" on palpites for update
  using (auth.uid() = user_id);

-- Palpites especiais
create policy "usuario ve palpites especiais" on palpites_especiais for select
  using (grupo_id in (select grupo_id from membros_grupo where user_id = auth.uid()));
create policy "usuario faz palpite especial" on palpites_especiais for insert
  with check (auth.uid() = user_id);
create policy "usuario edita palpite especial" on palpites_especiais for update
  using (auth.uid() = user_id);
