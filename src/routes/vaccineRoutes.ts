import { Router } from 'express';
import { VaccineController } from '../controller/vaccineController';

const router = Router();
const vaccineController = new VaccineController();

router.get('/', vaccineController.getAllVaccines);
router.get('/:id', vaccineController.getVaccineById);
router.post('/', vaccineController.createVaccine);
router.patch('/:id', vaccineController.updateVaccine);
router.delete('/:id', vaccineController.deleteVaccine);

export default router;