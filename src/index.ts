import App from '@/app';
import IndexRoute from '@routes/index.route';
// import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import AuthRoute from '@routes/auth.route';
import OfftakerRoute from '@/routes/offtaker.route';
import FarmerRoute from './routes/farmer.route';
import MinerRoute from './routes/miner.route';
import ClusterRoute from './routes/cluster.route';
import WarehouseRoute from './routes/warehouse.route';
import AdminRoute from './routes/admin.route';
import GemExciteRoute from './routes/gemExcite.route';
import GemAdminRoutes from './routes/gemAdmin.route';

validateEnv();

const app = new App([
  new IndexRoute(),
  new ClusterRoute(),
  new WarehouseRoute(),
  new AuthRoute(),
  new OfftakerRoute(),
  new FarmerRoute(),
  new MinerRoute(),
  new AdminRoute(),
  new GemExciteRoute(),
  new GemAdminRoutes(),
]);

app.listen();
