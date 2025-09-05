import { Application } from 'express';
import adminMenu from '../routes/adminMenu';
import publicMenu from '../routes/publicMenu';
import orders from '../routes/orders';
import upload from '../routes/upload';
import adminJobs from '../routes/adminJobs';

export function registerRoutes(app: Application) {
  app.use('/api', adminMenu);
  app.use('/api', publicMenu);
  app.use('/api', orders);
  app.use('/api', upload);
  app.use('/api', adminJobs);
}


