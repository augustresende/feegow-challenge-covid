import express from 'express';
import employeeRoutes from './routes/employeeRoutes';
import cors from 'cors';
import vaccineRoutes from './routes/vaccineRoutes';

const app = express();

app.use(express.json());

app.use(cors());

app.use('/employees', employeeRoutes);
app.use('/vaccines', vaccineRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

