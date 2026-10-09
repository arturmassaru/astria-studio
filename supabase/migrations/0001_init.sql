-- Astria Studio — modelo de dados inicial (Supabase / Postgres)
-- STATUS: rascunho de referência. O app atual roda em modo demonstração (localStorage)
-- e AINDA NÃO está ligado a este banco. Revise e teste antes de aplicar.
-- Princípios: solicitação ≠ pedido; status comercial/pagamento/produção independentes;
-- pedidos guardam snapshots; dados internos e financeiros nunca vão para o público.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- perfis e papéis
create type app_role as enum ('admin', 'operacional', 'financeiro', 'leitura');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role app_role not null default 'leitura',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function current_role_name() returns app_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid() and active
$$;

create or replace function has_role(variadic roles app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(current_role_name() = any (roles), false)
$$;

-- ---------------------------------------------------------------- taxonomia
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  sort_order int not null default 0,
  margin_percent numeric(5,2),            -- margem da categoria (prioridade: produto > categoria > global)
  active boolean not null default true
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

-- ---------------------------------------------------------------- produtos
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null default '',
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  promo_price numeric(10,2) check (promo_price is null or promo_price < price),
  dimensions text,
  weight_g numeric(10,2),
  availability text not null default 'made_to_order' check (availability in ('in_stock','made_to_order')),
  production_days int,
  variant_label text not null default 'Opção',
  customization jsonb not null default '[]',
  images text[] not null default '{}',
  art jsonb,
  badge text,
  featured boolean not null default false,
  featured_order int,
  status text not null default 'draft' check (status in ('active','draft','archived')),
  is_demo boolean not null default false,
  -- INTERNOS (nunca expostos ao público)
  track_stock boolean not null default false,
  stock_qty int not null default 0,
  machine_id uuid,
  machine_hours numeric(8,2),
  cost_estimate numeric(10,2),
  margin_percent numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_categories (
  product_id uuid references products (id) on delete cascade,
  category_id uuid references categories (id) on delete cascade,
  primary key (product_id, category_id)
);

create table product_tags (
  product_id uuid references products (id) on delete cascade,
  tag_id uuid references tags (id) on delete cascade,
  primary key (product_id, tag_id)
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  label text not null,
  price_delta numeric(10,2) not null default 0,
  sort_order int not null default 0
);

create table product_materials (
  product_id uuid references products (id) on delete cascade,
  material_id uuid,
  quantity numeric(12,4) not null check (quantity >= 0),
  primary key (product_id, material_id)
);

-- Visão pública: SEM custo, margem, estoque, máquina ou materiais.
create view public_products with (security_invoker = false) as
  select p.id, p.slug, p.name, p.short_description, p.description, p.price, p.promo_price,
         p.dimensions, p.weight_g, p.availability, p.production_days, p.variant_label,
         p.customization, p.images, p.art, p.badge, p.featured, p.featured_order, p.is_demo,
         coalesce((select array_agg(pc.category_id) from product_categories pc where pc.product_id = p.id), '{}') as category_ids,
         coalesce((select array_agg(pt.tag_id) from product_tags pt where pt.product_id = p.id), '{}') as tag_ids
  from products p
  where p.status = 'active';

-- ---------------------------------------------------------------- kits e campanhas
create table kits (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  images text[] not null default '{}',
  discount_percent numeric(5,2) not null default 0 check (discount_percent between 0 and 100),
  status text not null default 'draft' check (status in ('active','draft','archived')),
  is_demo boolean not null default false
);

create table kit_items (
  kit_id uuid references kits (id) on delete cascade,
  product_id uuid references products (id),
  quantity int not null default 1 check (quantity > 0),
  primary key (kit_id, product_id)
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  text text not null default '',
  image text,
  active boolean not null default false,
  starts_at date,
  ends_at date
);

-- ---------------------------------------------------------------- clientes
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null unique,   -- reaproveitamento por WhatsApp
  city text,
  state text,
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- solicitações (≠ pedidos)
create table requests (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('carrinho','sob_medida')),
  status text not null default 'nova' check (status in ('nova','em_analise','convertida','cancelada')),
  customer jsonb not null,           -- dados informados no envio
  items jsonb not null default '[]', -- itens e personalização
  project jsonb,                     -- briefing sob medida
  estimated_total numeric(10,2) not null default 0,
  internal_notes text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- pedidos
create table orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  request_id uuid references requests (id),
  customer_id uuid references customers (id),
  customer_snapshot jsonb not null,
  commercial_status text not null default 'confirmado'
    check (commercial_status in ('confirmado','cancelado')),
  payment_status text not null default 'pendente'
    check (payment_status in ('pendente','parcial','pago','estornado')),
  production_status text not null default 'aguardando_producao'
    check (production_status in ('aguardando_producao','em_producao','em_acabamento','pronto')),
  delivery_status text not null default 'aguardando'
    check (delivery_status in ('aguardando','enviado','entregue')),
  delivery_mode text,
  deadline date,
  shipping numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  production_steps jsonb not null default '{}',
  production_exception jsonb,         -- responsável, data, motivo
  stock_applied jsonb,                -- evita baixa dupla / permite estorno
  distribution jsonb,                 -- rateio entre participantes (soma = 100%)
  internal_notes text not null default '',
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  kind text not null check (kind in ('product','kit')),
  ref_id uuid not null,
  name text not null,                 -- snapshot
  variant_label text,
  customization jsonb not null default '[]',
  unit_price numeric(10,2) not null,  -- snapshot
  unit_cost numeric(10,2),            -- snapshot do custo estimado (null = sem custo cadastrado)
  quantity int not null check (quantity > 0),
  components jsonb not null default '[]'
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  kind text not null check (kind in ('pagamento','estorno')),
  method text not null,
  amount numeric(10,2) not null check (amount > 0),
  date date not null default current_date,
  note text not null default ''
);

-- ---------------------------------------------------------------- operação
create table materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null,
  unit text not null check (unit in ('g','ml','unidade','m')),
  stock numeric(14,4) not null default 0,
  min_stock numeric(14,4) not null default 0,
  unit_cost numeric(14,6) not null default 0,
  supplier text not null default '',
  active boolean not null default true
);

alter table product_materials
  add constraint product_materials_material_fk foreign key (material_id) references materials (id);

create table material_movements (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references materials (id),
  type text not null check (type in ('compra','consumo','perda','ajuste')),
  quantity numeric(14,4) not null check (quantity >= 0),
  direction smallint not null check (direction in (1,-1)),
  total_cost numeric(10,2),
  unit_cost numeric(14,6),
  loss_reason text check (loss_reason in ('falha','teste','prototipo','problema_material','configuracao','outros')),
  order_id uuid references orders (id),
  date date not null default current_date,
  note text not null default ''
);

create table machines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  model text not null default '',
  power_w numeric(8,2) not null,
  purchase_price numeric(10,2) not null default 0,
  lifetime_hours numeric(10,2) not null default 1,
  maintenance_per_hour numeric(10,4) not null default 0,
  wear_per_hour numeric(10,4) not null default 0,
  active boolean not null default true,
  notes text not null default ''
);

alter table products add constraint products_machine_fk foreign key (machine_id) references machines (id);

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id),
  type text not null check (type in ('entrada','saida_pedido','estorno_cancelamento','ajuste')),
  quantity int not null,              -- com sinal
  order_id uuid references orders (id),
  date date not null default current_date,
  note text not null default ''
);

-- ---------------------------------------------------------------- financeiro e configurações
create table expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  description text not null,
  category text not null,
  kind text not null check (kind in ('custo','despesa')),
  amount numeric(10,2) not null check (amount > 0)
);

create table settings (
  id boolean primary key default true check (id),   -- linha única
  business_name text not null default 'Astria Studio',
  whatsapp text not null default '',
  energy_tariff_per_kwh numeric(8,4),    -- configurável, nunca fixa no código
  global_margin_percent numeric(5,2),
  loss_percent numeric(5,2) not null default 0,
  participants jsonb not null default '[]'
);
insert into settings default values on conflict do nothing;

-- ---------------------------------------------------------------- RPC pública: criar solicitação
-- A loja NÃO escreve direto nas tabelas; só cria solicitações por esta função, que valida e
-- recalcula o total a partir dos preços do banco (nunca confia no valor do navegador).
create or replace function create_request(p_type text, p_customer jsonb, p_items jsonb, p_project jsonb)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_code text := 'SOL-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(gen_random_uuid()::text, 1, 4));
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_price numeric(10,2);
begin
  if p_type not in ('carrinho','sob_medida') then raise exception 'tipo inválido'; end if;
  if coalesce(trim(p_customer->>'name'), '') = '' or coalesce(trim(p_customer->>'whatsapp'), '') = '' then
    raise exception 'nome e WhatsApp são obrigatórios';
  end if;

  if p_type = 'carrinho' then
    if jsonb_array_length(coalesce(p_items, '[]')) = 0 then raise exception 'carrinho vazio'; end if;
    for v_item in select * from jsonb_array_elements(p_items) loop
      select coalesce(promo_price, price) into v_price
        from products where id = (v_item->>'refId')::uuid and status = 'active';
      if v_price is null then raise exception 'produto indisponível'; end if;
      v_total := v_total + v_price * greatest((v_item->>'quantity')::int, 1);
    end loop;
  end if;

  insert into requests (code, type, customer, items, project, estimated_total)
  values (v_code, p_type, p_customer, coalesce(p_items, '[]'), p_project, v_total);
  return v_code;
end $$;

revoke all on function create_request(text, jsonb, jsonb, jsonb) from public;
grant execute on function create_request(text, jsonb, jsonb, jsonb) to anon, authenticated;

-- ---------------------------------------------------------------- RLS
alter table profiles            enable row level security;
alter table categories          enable row level security;
alter table tags                enable row level security;
alter table products            enable row level security;
alter table product_categories  enable row level security;
alter table product_tags        enable row level security;
alter table product_variants    enable row level security;
alter table product_materials   enable row level security;
alter table kits                enable row level security;
alter table kit_items           enable row level security;
alter table campaigns           enable row level security;
alter table customers           enable row level security;
alter table requests            enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;
alter table payments            enable row level security;
alter table materials           enable row level security;
alter table material_movements  enable row level security;
alter table machines            enable row level security;
alter table stock_movements     enable row level security;
alter table expenses            enable row level security;
alter table settings            enable row level security;

-- Público (anon): apenas a visão public_products, categorias, tags, kits e campanhas ativos.
create policy "public read categories" on categories for select using (active);
create policy "public read tags" on tags for select using (true);
create policy "public read kits" on kits for select using (status = 'active');
create policy "public read kit_items" on kit_items for select
  using (exists (select 1 from kits k where k.id = kit_id and k.status = 'active'));
create policy "public read campaigns" on campaigns for select using (active);
create policy "public read variants" on product_variants for select
  using (exists (select 1 from products p where p.id = product_id and p.status = 'active'));
create policy "public read product_categories" on product_categories for select
  using (exists (select 1 from products p where p.id = product_id and p.status = 'active'));
create policy "public read product_tags" on product_tags for select
  using (exists (select 1 from products p where p.id = product_id and p.status = 'active'));
grant select on public_products to anon, authenticated;

-- Perfil: cada um lê o próprio; só admin gerencia.
create policy "own profile" on profiles for select using (id = auth.uid() or has_role('admin'));
create policy "admin manages profiles" on profiles for all using (has_role('admin')) with check (has_role('admin'));

-- Catálogo (tabela completa, com custos): admin e operacional escrevem; financeiro lê.
create policy "catalog read" on products for select using (has_role('admin','operacional','financeiro','leitura'));
create policy "catalog write" on products for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "taxonomy write categories" on categories for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "taxonomy write tags" on tags for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "kits write" on kits for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "kit_items write" on kit_items for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "campaigns write" on campaigns for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "variants write" on product_variants for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "pcat write" on product_categories for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "ptag write" on product_tags for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "pmat staff" on product_materials for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));

-- Operação: admin e operacional.
create policy "customers staff" on customers for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "requests staff" on requests for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "orders ops" on orders for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "order_items ops" on order_items for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "materials staff" on materials for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "material_moves staff" on material_movements for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "machines staff" on machines for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));
create policy "stock_moves staff" on stock_movements for all using (has_role('admin','operacional')) with check (has_role('admin','operacional'));

-- Leitura de pedidos/pagamentos pelo financeiro e leitura.
create policy "orders read finance" on orders for select using (has_role('financeiro','leitura'));
create policy "order_items read finance" on order_items for select using (has_role('financeiro','leitura'));

-- Financeiro: somente admin e financeiro.
create policy "payments finance" on payments for all using (has_role('admin','financeiro')) with check (has_role('admin','financeiro'));
create policy "payments read ops" on payments for select using (has_role('operacional','leitura'));
create policy "expenses finance" on expenses for all using (has_role('admin','financeiro')) with check (has_role('admin','financeiro'));

-- Configurações: leitura para a equipe, escrita só admin.
create policy "settings read" on settings for select using (has_role('admin','operacional','financeiro','leitura'));
create policy "settings write" on settings for all using (has_role('admin')) with check (has_role('admin'));
