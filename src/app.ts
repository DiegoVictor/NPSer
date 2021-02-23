import cors from 'cors';
import helmet from 'helmet';
const app = express();

app.use(cors());
app.use(helmet());
export default app;
