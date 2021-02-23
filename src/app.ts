import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/v1', routes);
export default app;
