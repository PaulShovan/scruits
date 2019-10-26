import express from 'express';
import authRoutes from './auth.routes';
import partnerRoutes from './partner.routes'
import customerRoutes from './customer.routes';
import serviceRoutes from './service.routes';
import orderRoutes from './order.routes';
import adminRoutes from '../routes/admin.routes';
import quoteRoutes from '../routes/quote.routes';
import categoryRoutes from '../routes/category.routes';
import serviceItemRoutes from '../routes/serviceItem.routes';
import chatRoutes from '../routes/chat.routes';

const router = express.Router(); // eslint-disable-line new-cap

function routes() {
  /** GET /check - Check service health */
  router.get('/check', (req, res) =>
    res.send('OK')
  );
  
  // force do not cache for CloudFront
  router.use(function(req, res, next) {
    // inject default headers
    res.header('cache-control', 'private, max-age=0');
    next();
  });

  // mount auth routes at /auth
  router.use('/auth', authRoutes());

  // mount partner routes at /partner
  router.use('/partner', partnerRoutes());

  // mount customer routes at /customer
  router.use('/customer', customerRoutes());

  // mount service routes at /service
  router.use('/service', serviceRoutes());

  // mount serviceitem routes at /serviceitem
  router.use('/serviceitem', serviceItemRoutes());

  // mount order routes at /order
  router.use('/order', orderRoutes());

  // mount order routes at /category
  router.use('/category', categoryRoutes());

  // mount order routes at /quote
  router.use('/quote', quoteRoutes());

  // mount admin routes at /admin
  router.use('/admin', adminRoutes());

  // mount chat routes at /
  router.use('/', chatRoutes());

  return router;
}

export default routes;