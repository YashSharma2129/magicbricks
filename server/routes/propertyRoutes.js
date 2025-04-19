// routes/propertyRoutes.js
import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  addVirtualTour,
  addPropertyRating,
  searchNearbyPlaces,
  toggleFavorite
} from '../controllers/propertyController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.get('/:id/nearby', searchNearbyPlaces);

router.use(auth); 

router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);
router.post('/:id/virtual-tour', addVirtualTour);
router.post('/:id/ratings', addPropertyRating);
router.post('/:id/favorite', toggleFavorite);

export default router;
