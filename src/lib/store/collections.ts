import { campaignsSeed } from "@/data/campaigns";
import { kitsSeed } from "@/data/kits";
import { productsSeed } from "@/data/products";
import { settingsSeed, usersSeed } from "@/data/settings";
import { categoriesSeed, tagsSeed } from "@/data/taxonomy";
import type {
  AdminUser,
  CartItem,
  Campaign,
  Category,
  Customer,
  Expense,
  Kit,
  Machine,
  Material,
  MaterialMovement,
  Order,
  Product,
  RequestRecord,
  Settings,
  StockMovement,
  Tag,
} from "@/types";
import type { Collection } from "./core";

const P = "astria:v1:";

const col = <T>(name: string, seed: T): Collection<T> => ({ key: `${P}${name}`, seed });

/** Seeds vazios são constantes de módulo para manter identidade estável. */
const EMPTY_CART: CartItem[] = [];
const EMPTY_REQUESTS: RequestRecord[] = [];
const EMPTY_CUSTOMERS: Customer[] = [];
const EMPTY_ORDERS: Order[] = [];
const EMPTY_MATERIALS: Material[] = [];
const EMPTY_MATERIAL_MOVES: MaterialMovement[] = [];
const EMPTY_MACHINES: Machine[] = [];
const EMPTY_STOCK_MOVES: StockMovement[] = [];
const EMPTY_EXPENSES: Expense[] = [];

export const cols = {
  cart: col<CartItem[]>("cart", EMPTY_CART),
  products: col<Product[]>("products", productsSeed),
  categories: col<Category[]>("categories", categoriesSeed),
  tags: col<Tag[]>("tags", tagsSeed),
  kits: col<Kit[]>("kits", kitsSeed),
  campaigns: col<Campaign[]>("campaigns", campaignsSeed),
  requests: col<RequestRecord[]>("requests", EMPTY_REQUESTS),
  customers: col<Customer[]>("customers", EMPTY_CUSTOMERS),
  orders: col<Order[]>("orders", EMPTY_ORDERS),
  materials: col<Material[]>("materials", EMPTY_MATERIALS),
  materialMoves: col<MaterialMovement[]>("material-moves", EMPTY_MATERIAL_MOVES),
  machines: col<Machine[]>("machines", EMPTY_MACHINES),
  stockMoves: col<StockMovement[]>("stock-moves", EMPTY_STOCK_MOVES),
  expenses: col<Expense[]>("expenses", EMPTY_EXPENSES),
  users: col<AdminUser[]>("users", usersSeed),
  settings: col<Settings>("settings", settingsSeed),
};

export const ROLE_KEY = `${P}role`;
